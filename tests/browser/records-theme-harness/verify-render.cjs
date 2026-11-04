// Real-browser checks use synthetic data and a private, disposable Chrome profile.
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { build, root } = require("./build.cjs");

const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const pending = new Map();
const runtimeErrors = [];
let chrome, socket, output, profile, session, sequence = 0, fixtureUrl;

function send(method, params = {}, sessionId = session) {
     const id = ++sequence;
     return new Promise((resolve, reject) => {
          const timer = setTimeout(() => {
               pending.delete(id);
               reject(new Error(`Chrome command timed out: ${method}`));
          }, 10000);
          pending.set(id, { resolve, reject, timer });
          socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
     });
}

async function evaluate(expression) {
     const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
     if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
     return result.result.value;
}

async function until(expression, label) {
     for (let attempt = 0; attempt < 80; attempt++) {
          if (await evaluate(expression)) return;
          await wait(100);
     }
     const state = await evaluate(`({ url: location.href, ready: document.readyState, theme: document.documentElement.dataset.bsTheme, toggle: document.querySelector('[data-testid="theme-toggle"]')?.textContent, text: document.body?.innerText.slice(0, 180) })`);
     throw new Error(`Timed out waiting for ${label}: ${JSON.stringify(state)}; runtime errors: ${JSON.stringify(runtimeErrors)}`);
}

async function navigate(page, options = "") {
     const query = `?page=${page}${options}`;
     await send("Page.navigate", { url: `${fixtureUrl}${query}` });
     await until(`location.search === ${JSON.stringify(query)} && !!document.querySelector('[data-testid="theme-toggle"]') && document.querySelector('[data-testid="theme-toggle"]').textContent.includes(document.documentElement.dataset.bsTheme)`, `${page} fixture`);
     await wait(100);
}

async function setTheme(theme) {
     if (await evaluate("document.documentElement.dataset.bsTheme") !== theme) {
          await evaluate("document.querySelector('[data-testid=\"theme-toggle\"]').click()");
     }
     await until(`document.documentElement.dataset.bsTheme === ${JSON.stringify(theme)}`, `${theme} theme`);
     await wait(250);
}

async function samples(selector) {
     return evaluate(`Array.from(document.querySelectorAll(${JSON.stringify(selector)})).map(el => {
          const backgrounds = [];
          for (let node = el; node; node = node.parentElement) backgrounds.push(getComputedStyle(node).backgroundColor);
          const style = getComputedStyle(el);
          return { text: el.innerText || el.getAttribute("title") || el.value || "", color: style.color, backgrounds, disabled: el.disabled };
     })`);
}

function parseColor(value) {
     const parts = value.match(/[\d.]+/g);
     assert.ok(parts && parts.length >= 3, `Unsupported browser color ${value}`);
     const scale = value.startsWith("color(srgb ") ? 255 : 1;
     return [Number(parts[0]) * scale, Number(parts[1]) * scale, Number(parts[2]) * scale, parts.length > 3 ? Number(parts[3]) : 1];
}

function composite(foreground, background) {
     return foreground.slice(0, 3).map((value, index) => value * foreground[3] + background[index] * (1 - foreground[3])).concat(1);
}

function backgroundOf(sample) {
     return sample.backgrounds.slice().reverse().reduce((background, color) => composite(parseColor(color), background), [255, 255, 255, 1]);
}

function luminance(color) {
     const linear = color.slice(0, 3).map(value => {
          value /= 255;
          return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
     });
     return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function assertReadable(sample, label, minimum = 4.5) {
     assert.ok(sample, `Missing ${label}`);
     const background = backgroundOf(sample);
     const foreground = composite(parseColor(sample.color), background);
     const light = Math.max(luminance(foreground), luminance(background));
     const dark = Math.min(luminance(foreground), luminance(background));
     const contrast = (light + 0.05) / (dark + 0.05);
     assert.ok(contrast >= minimum, `${label} (${sample.text.trim()}): contrast ${contrast.toFixed(2)} is below ${minimum}; text ${sample.color}, background ${background.slice(0, 3).map(Math.round).join(",")}`);
}

async function checkPair(label, selector, expectBackgroundChange = true) {
     await setTheme("light");
     const light = await samples(selector);
     assert.ok(light.length, `Missing ${label} in light mode`);
     light.forEach(sample => assertReadable(sample, `${label} in light mode`));
     await setTheme("dark");
     const dark = await samples(selector);
     assert.equal(dark.length, light.length, `${label} should retain its content when switching themes`);
     dark.forEach(sample => assertReadable(sample, `${label} in dark mode`));
     if (expectBackgroundChange) {
          dark.forEach((sample, index) => {
               assert.notDeepEqual(backgroundOf(sample), backgroundOf(light[index]), `${label} should change its surface in dark mode`);
          });
     }
}

async function checkOutlineControls(selector) {
     const controls = (await samples(selector)).filter(sample => !sample.disabled);
     assert.ok(controls.length, `Missing outline controls: ${selector}`);
     controls.forEach(sample => assertReadable(sample, "dark outline control", sample.text.trim() ? 4.5 : 3));
}

async function checkButtonStates(selector) {
     const { root: documentRoot } = await send("DOM.getDocument");
     const { nodeId } = await send("DOM.querySelector", { nodeId: documentRoot.nodeId, selector });
     assert.ok(nodeId, `Missing button for interaction-state check: ${selector}`);
     for (const state of ["hover", "active"]) {
          await send("CSS.forcePseudoState", { nodeId, forcedPseudoClasses: [state] });
          await wait(250);
          assertReadable((await samples(selector))[0], `${state} ${selector}`);
     }
     await send("CSS.forcePseudoState", { nodeId, forcedPseudoClasses: [] });
}

async function openByText(text) {
     const clicked = await evaluate(`(() => {
          const button = Array.from(document.querySelectorAll("main button")).find(el => el.textContent.trim().includes(${JSON.stringify(text)}));
          if (!button) return false;
          button.click();
          return true;
     })()`);
     assert.ok(clicked, `Missing button ${text}`);
     await until("!!document.querySelector('.modal.show .modal-content')", `${text} dialog`);
}

async function closeModal() {
     await evaluate("document.querySelector('.modal.show .btn-close').click()");
     await until("!document.querySelector('.modal.show')", "dialog to close");
}

async function checkModal(label) {
     const title = (await samples(".modal.show .modal-title"))[0];
     assertReadable(title, `${label} title`);
     const fields = await samples(".modal.show input:not([type=checkbox]), .modal.show select");
     fields.filter(field => !field.disabled).forEach(field => assertReadable(field, `${label} field`));
}

async function setJournalAmount(index, value) {
     await evaluate(`(() => {
          const input = document.querySelectorAll('tbody input[type="number"]')[${index}];
          Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(input, ${JSON.stringify(value)});
          input.dispatchEvent(new Event("input", { bubbles: true }));
     })()`);
}

async function run() {
     output = await build();
     profile = fs.mkdtempSync(path.join(os.tmpdir(), "pls-records-theme-chrome-"));
     const asset = file => pathToFileURL(path.join(root, file)).href;
     const html = `<!doctype html><html lang="en" data-bs-theme="light" style="--theme-font-family:system-ui,sans-serif"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Synthetic records theme check</title><link rel="stylesheet" href="${asset("node_modules/bootstrap/dist/css/bootstrap.min.css")}"><link rel="stylesheet" href="${asset("styles/globals.css")}"></head><body><div id="root"></div><script src="./fixture.js"></script></body></html>`;
     const index = path.join(output, "index.html");
     fs.writeFileSync(index, html);
     fixtureUrl = pathToFileURL(index).href;
     const executable = process.env.PLS_CHROME || process.env.ACCOUNTING_CHROME || (process.platform === "win32" ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" : "chromium");
     chrome = spawn(executable, ["--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "about:blank"], { stdio: ["ignore", "ignore", "pipe"] });
     const endpoint = await new Promise((resolve, reject) => {
          let stderr = "";
          const timer = setTimeout(() => reject(new Error("Chrome DevTools startup timed out")), 15000);
          chrome.once("error", error => { clearTimeout(timer); reject(error); });
          chrome.stderr.on("data", chunk => {
               stderr += chunk.toString();
               const match = /DevTools listening on (ws:\/\/[^\s]+)/.exec(stderr);
               if (match) { clearTimeout(timer); resolve(match[1]); }
          });
     });
     socket = new WebSocket(endpoint);
     await new Promise((resolve, reject) => {
          socket.addEventListener("open", resolve, { once: true });
          socket.addEventListener("error", reject, { once: true });
     });
     socket.addEventListener("message", event => {
          const message = JSON.parse(event.data);
          if (message.id) {
               const request = pending.get(message.id);
               if (request) {
                    clearTimeout(request.timer);
                    pending.delete(message.id);
                    message.error ? request.reject(new Error(JSON.stringify(message.error))) : request.resolve(message.result);
               }
          }
          if (message.method === "Runtime.exceptionThrown") runtimeErrors.push(message.params.exceptionDetails);
     });
     const { targetId } = await send("Target.createTarget", { url: "about:blank" }, null);
     ({ sessionId: session } = await send("Target.attachToTarget", { targetId, flatten: true }, null));
     await send("Page.enable");
     await send("Runtime.enable");
     await send("DOM.enable");
     await send("CSS.enable");
     await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "light" }] });

     await navigate("security");
     await until("document.querySelectorAll('main section[aria-labelledby] h2').length === 4", "security sections");
     assert.equal(await evaluate("document.querySelector('[aria-label=\"Backup security configuration overview\"]').querySelectorAll('dt').length"), 4);
     assert.equal(await evaluate("document.getElementById('encryption-enabled').disabled"), true, "Server-required encryption remains locked");
     assert.equal(await evaluate("document.getElementById('backup-encryption-algorithm').readOnly"), true);
     assert.equal(await evaluate("document.querySelector('main details').open"), false, "Host-managed password options start collapsed");
     await evaluate("document.querySelector('main details summary').click()");
     await until("document.querySelector('main details').open", "optional password disclosure");
     await evaluate("document.querySelector('[aria-label=\"Show encryption password\"]').click()");
     await until("document.getElementById('backup-encryption-password').type === 'text'", "password visibility");
     await evaluate("document.querySelector('[aria-label=\"Hide encryption password\"]').click()");
     assert.equal(await evaluate("document.getElementById('backup-encryption-password').type"), "password");
     await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
     const desktopPanels = await evaluate("Array.from(document.querySelectorAll('main section[aria-labelledby]')).map(panel => ({ x: panel.getBoundingClientRect().x, y: panel.getBoundingClientRect().y }))");
     assert.equal(desktopPanels[0].y, desktopPanels[1].y, "Desktop panels share their grid row");
     assert.ok(desktopPanels[1].x > desktopPanels[0].x, "Desktop settings use two columns");
     for (const width of [390, 320]) {
          await send("Emulation.setDeviceMetricsOverride", { width, height: 844, deviceScaleFactor: 1, mobile: false });
          assert.ok(await evaluate("document.documentElement.scrollWidth <= innerWidth"), `No document overflow at ${width}px`);
          const mobilePanels = await evaluate("Array.from(document.querySelectorAll('main section[aria-labelledby]')).map(panel => panel.getBoundingClientRect().x)");
          assert.ok(mobilePanels.every(x => x === mobilePanels[0]), `Settings stack at ${width}px`);
     }
     await send("Emulation.clearDeviceMetricsOverride");
     await checkPair("security section headings", "main section[aria-labelledby] h2");
     await checkPair("security key details", "main .font-monospace");
     await checkOutlineControls("main .btn-outline-primary, main .btn-outline-secondary");
     await checkButtonStates("main .btn-outline-primary");
     await checkButtonStates("main .btn-outline-secondary");
     const initialSettingsRequests = await evaluate("window.recordsThemeCalls.filter(call => call === 'security-features/backup/security-settings').length");
     await evaluate("Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('Rotate Key Now')).click()");
     await until("document.body.innerText.includes('Loading security settings')", "security settings refresh");
     await until("document.body.innerText.includes('rotated-synthetic-key')", "rotated key refresh");
     assert.equal(await evaluate("window.recordsThemeCalls.filter(call => call === 'security-features/backup/security-settings').length"), initialSettingsRequests + 1);

     await navigate("security", "&unauthorized");
     await until("document.body.innerText.includes('Unauthorized Access')", "unauthorized security state");
     await checkPair("unauthorized security heading", "main h2");
     assert.deepEqual(await evaluate("window.recordsThemeCalls"), [], "Unauthorized users must not request security settings");

     await navigate("backup");
     await until("document.body.innerText.includes('Synthetic schedule') && document.body.innerText.includes('Synthetic backup')", "backup tables");
     await checkPair("backup section headings", "main h5");
     await checkPair("last backup metric", "main .fs-6.fw-bold");
     await checkOutlineControls("main .btn-outline-primary, main .btn-outline-secondary, main .btn-outline-danger, main .btn-outline-info, main .btn-outline-warning");
     await checkButtonStates("main .btn-outline-danger");
     for (const theme of ["light", "dark"]) {
          await setTheme(theme);
          await openByText("Create Schedule");
          await checkModal(`${theme} backup schedule`);
          await closeModal();
     }

     await navigate("requests");
     await until("document.querySelectorAll('tbody .badge').length === 2", "result request rows");
     await checkPair("result request table cells", "tbody td:nth-child(1)");
     await checkPair("request status badges", "tbody .badge", false);
     await checkOutlineControls("main .btn-outline-primary, main .btn-outline-info, main .btn-outline-success, main .btn-outline-danger, main .btn-outline-warning");
     await checkButtonStates("main .btn-outline-info");
     for (const theme of ["light", "dark"]) {
          await setTheme(theme);
          await evaluate("document.querySelector('tbody .btn-outline-info').click()");
          await until("!!document.querySelector('.modal.show .modal-title')", "request details");
          await checkModal(`${theme} request details`);
          assertReadable((await samples(".modal.show .badge"))[0], `${theme} pending badge in dialog`);
          await closeModal();
     }
     await setTheme("dark");
     await evaluate("document.querySelectorAll('tbody tr')[1].querySelector('.btn-outline-info').click()");
     await until("!!document.querySelector('.modal.show .btn-outline-warning')", "approved request actions");
     await checkOutlineControls(".modal.show .btn-outline-danger, .modal.show .btn-outline-warning");
     await checkButtonStates(".modal.show .btn-outline-warning");
     await closeModal();

     await navigate("access");
     await until("document.body.innerText.includes('Synthetic Staff')", "access settings rows");
     await checkPair("access settings table cells", "tbody td:nth-child(1)");
     await checkOutlineControls("main .btn-outline-primary, main .btn-outline-secondary, main .btn-outline-danger");
     for (const theme of ["light", "dark"]) {
          await setTheme(theme);
          await openByText("Edit Global Settings");
          await checkModal(`${theme} global settings`);
          await closeModal();
          await openByText("Add Individual Access");
          await checkModal(`${theme} individual settings`);
          await closeModal();
     }

     await navigate("access", "&employeeError");
     await setTheme("dark");
     await openByText("Add Individual Access");
     await evaluate(`(() => { const select = document.querySelector('.modal.show select'); select.value = '1'; select.dispatchEvent(new Event('change', { bubbles: true })); })()`);
     await until("!!document.querySelector('.modal.show [role=alert]')", "employee settings error");
     assertReadable((await samples(".modal.show [role=alert]"))[0], "employee settings error");
     await closeModal();

     for (const page of ["backup", "requests", "access"]) {
          await navigate(page, "&empty");
          await until(`document.body.innerText.includes(${JSON.stringify(page === "access" ? "No individual access settings" : "No records to display")})`, `${page} empty state`);
          await checkPair(`${page} empty state`, page === "access" ? "main .text-muted" : "tbody td");
     }

     await navigate("progress");
     await checkPair("backup progress heading", "main h5");
     await checkOutlineControls("main .btn-outline-danger");

     await navigate("journal");
     await until("document.querySelectorAll('tbody input[type=number]').length === 2", "journal lines");
     assert.match(await evaluate("document.querySelector('tfoot').innerText"), /Out of balance[\s\S]*0\.00/);
     assert.equal(await evaluate("Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('Save draft')).disabled"), true);
     await checkPair("journal table heading", "thead th:first-child");
     await checkPair("journal summary heading", "tfoot th:first-child");
     await checkPair("journal totals", "tfoot th:nth-child(2) span, tfoot th:nth-child(2) strong");
     await checkPair("journal unbalanced status", "tfoot th:nth-child(3) > span");
     await checkOutlineControls("main .btn-outline-primary, main .btn-outline-secondary");
     await setJournalAmount(0, "50");
     await until("document.querySelector('tfoot').innerText.includes('50.00')", "journal debit");
     assert.match(await evaluate("document.querySelector('tfoot').innerText"), /Out of balance[\s\S]*50\.00/);
     assert.equal(await evaluate("Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('Save draft')).disabled"), true);
     await setJournalAmount(1, "50");
     await until("document.querySelector('tfoot').innerText.includes('Balanced')", "balanced journal");
     assert.equal(await evaluate("Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('Save draft')).disabled"), false);
     await checkPair("journal balanced status", "tfoot th:nth-child(3) > span");
     assert.deepEqual(await evaluate("Array.from(document.querySelectorAll('tbody input[type=number]')).map(el => el.value)"), ["50", "50"]);
     await send("Emulation.setDeviceMetricsOverride", { width: 320, height: 900, deviceScaleFactor: 1, mobile: false });
     await checkPair("narrow journal summary", "tfoot th:first-child");

     assert.deepEqual(runtimeErrors, [], "Synthetic pages must not throw runtime exceptions");
     console.log("PASS: light/dark theme switching, contrast, controls, dialogs, empty states, unauthorized access, and journal balance states.");
}

run().catch(error => { console.error(error.stack || error); process.exitCode = 1; }).finally(async () => {
     if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ id: ++sequence, method: "Browser.close" }));
     socket?.close();
     for (const request of pending.values()) { clearTimeout(request.timer); request.reject(new Error("Chrome check stopped")); }
     pending.clear();
     if (chrome) {
          const exited = () => chrome.exitCode != null || chrome.signalCode != null;
          await Promise.race([new Promise(resolve => exited() ? resolve() : chrome.once("exit", resolve)), wait(3000)]);
          if (!exited()) {
               if (process.platform === "win32") {
                    await new Promise(resolve => spawn("powershell.exe", ["-NoProfile", "-Command", `Stop-Process -Id ${chrome.pid} -Force -ErrorAction SilentlyContinue`], { stdio: "ignore" }).once("exit", resolve));
               } else {
                    chrome.kill("SIGTERM");
               }
               await Promise.race([new Promise(resolve => exited() ? resolve() : chrome.once("exit", resolve)), wait(5000)]);
               if (!exited()) throw new Error("Owned Chrome diagnostic did not exit");
          }
     }
     if (output) await fs.promises.rm(output, { recursive: true, force: true, maxRetries: 15, retryDelay: 500 });
     if (profile) await fs.promises.rm(profile, { recursive: true, force: true, maxRetries: 15, retryDelay: 500 });
});
