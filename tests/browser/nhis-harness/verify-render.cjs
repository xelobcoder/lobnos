// Bounded real-Chrome renderer/AX diagnosis. No HTTP server, credentials or live data.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const assert = require('node:assert/strict');
const { build, root } = require('./build.cjs');
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
let chrome, socket, output, profile, session, sequence = 0;
const pending = new Map();
const runtimeErrors = [];
function send(method, params = {}, sessionId = session) {
    const id = ++sequence;
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Chrome renderer timeout: ${method}`)); }, 10000);
        pending.set(id, { resolve, reject, timer });
        socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    });
}
async function evaluate(expression) {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
}
async function run() {
    output = await build();
    profile = fs.mkdtempSync(path.join(os.tmpdir(), 'pls-nhis-renderer-profile-'));
    const css = file => pathToFileURL(path.join(root, file)).href;
    fs.writeFileSync(path.join(output, 'index.html'), `<!doctype html><html lang="en" data-bs-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Synthetic NHIS Chrome diagnosis</title><link rel="stylesheet" href="${css('node_modules/bootstrap/dist/css/bootstrap.min.css')}"><link rel="stylesheet" href="${css('styles/globals.css')}"></head><body><div id="root"></div><script src="./fixture.js"></script></body></html>`);
    const executable = process.env.ACCOUNTING_CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
    chrome = spawn(executable, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
    const endpoint = await new Promise((resolve, reject) => {
        let stderr = '';
        const timer = setTimeout(() => reject(new Error('Chrome DevTools startup timeout')), 15000);
        chrome.once('error', error => { clearTimeout(timer); reject(error); });
        chrome.stderr.on('data', chunk => {
            stderr += chunk.toString();
            const match = /DevTools listening on (ws:\/\/[^\s]+)/.exec(stderr);
            if (match) { clearTimeout(timer); resolve(match[1]); }
        });
    });
    socket = new WebSocket(endpoint);
    await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
    socket.addEventListener('message', event => {
        const message = JSON.parse(event.data);
        if (message.id) {
            const request = pending.get(message.id);
            if (request) { clearTimeout(request.timer); pending.delete(message.id); message.error ? request.reject(new Error(JSON.stringify(message.error))) : request.resolve(message.result); }
        }
        if (message.method === 'Runtime.exceptionThrown') runtimeErrors.push(message.params.exceptionDetails);
    });
    const { targetId } = await send('Target.createTarget', { url: 'about:blank' }, null);
    ({ sessionId: session } = await send('Target.attachToTarget', { targetId, flatten: true }, null));
    await send('Page.enable'); await send('Runtime.enable'); await send('Accessibility.enable');
    await send('Page.bringToFront');
    await send('Page.navigate', { url: pathToFileURL(path.join(output, 'index.html')).href });
    for (let n = 0; n < 60; n++) {
        await wait(100);
        if (await evaluate(`!!window.nhisFixture && window.nhisFixture.calls.length===4 && !!document.querySelector('[aria-label="Select BILL-101"]:not(:disabled)')`)) break;
        if (n === 59) throw new Error('Initial NHIS render did not settle');
    }
    const initial = await evaluate(`({calls:window.nhisFixture.calls.length, body:document.body.innerText, control:document.querySelector('[aria-label="Select BILL-101"]').getBoundingClientRect().toJSON()})`);
    assert.equal(initial.calls, 4);
    assert.match(initial.body, /1,200,000\.00/);
    assert.match(initial.body, /500,000\.00/);
    assert.match(initial.body, /700,000\.00/);
    console.log(JSON.stringify({ stage: 'initial-render', calls: initial.calls, control: initial.control }));
    const ax = await send('Accessibility.getFullAXTree');
    console.log(JSON.stringify({ stage: 'initial-accessibility-snapshot', nodes: ax.nodes.length }));
    await wait(500);
    assert.equal(await evaluate('window.nhisFixture.calls.length'), 4);
    await evaluate(`document.querySelector('[aria-label="Select BILL-101"]').scrollIntoView({block:'center',inline:'nearest',behavior:'instant'})`);
    await wait(200);
    const pointer = await evaluate(`(()=>{const r=document.querySelector('[aria-label="Select BILL-101"]').getBoundingClientRect();const x=r.x+r.width/2,y=r.y+r.height/2;return{x,y,width:innerWidth,height:innerHeight,target:document.elementFromPoint(x,y)?.getAttribute('aria-label')}})()`);
    assert.ok(pointer.x > 0 && pointer.x < pointer.width && pointer.y > 0 && pointer.y < pointer.height, 'Selection must be reachable inside the viewport');
    assert.equal(pointer.target, 'Select BILL-101', 'Selection must not be obscured by another element');
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: pointer.x, y: pointer.y });
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: pointer.x, y: pointer.y, button: 'left', buttons: 1, clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: pointer.x, y: pointer.y, button: 'left', buttons: 0, clickCount: 1 });
    await wait(200);
    const selection = await evaluate(`({ checked: document.querySelector('[aria-label="Select BILL-101"]').checked, selectedText: document.body.innerText.includes('1 bill selected') })`);
    assert.deepEqual(selection, { checked: true, selectedText: true });
    assert.equal(await evaluate('window.nhisFixture.calls.length'), 4);
    const selectedAx = await send('Accessibility.getFullAXTree');
    console.log(JSON.stringify({ stage: 'selection-and-accessibility-snapshot', calls: 4, nodes: selectedAx.nodes.length }));
    const screenshot = await send('Page.captureScreenshot', { format: 'png' });
    console.log(JSON.stringify({ stage: 'screenshot', bytes: Buffer.byteLength(screenshot.data, 'base64') }));

    await send('Emulation.setDeviceMetricsOverride', { width: 320, height: 900, deviceScaleFactor: 1, mobile: false });
    await send('Page.navigate', { url: `${pathToFileURL(path.join(output, 'index.html')).href}?audit=1` });
    for (let n = 0; n < 60; n++) {
        await wait(100);
        if (await evaluate(`location.search === '?audit=1' && !!window.nhisFixture && window.nhisFixture.calls.length >= 4 && !!document.querySelector('#nhis-tab-activity')`)) break;
        if (n === 59) throw new Error('Synthetic activity fixture did not settle');
    }
    await evaluate(`document.querySelector('#nhis-tab-activity').click()`);
    for (let n = 0; n < 60; n++) {
        await wait(100);
        if (await evaluate(`!!document.querySelector('#nhis-event-2-toggle')`)) break;
        if (n === 59) throw new Error('Synthetic activity rows did not render');
    }
    assert.equal(await evaluate(`window.nhisFixture.calls.filter(call => call.endpoint.includes('/events/2/allocations')).length`), 0);
    await evaluate(`document.querySelector('#nhis-event-2-toggle').click()`);
    for (let n = 0; n < 60; n++) {
        await wait(100);
        if (await evaluate(`!!document.querySelector('#nhis-event-2-details table > tbody > tr')`)) break;
        if (n === 59) throw new Error('Synthetic activity allocations did not render');
    }
    const narrow = await evaluate(`(() => {
        const panel = document.querySelector('#nhis-event-2-details');
        const activity = document.querySelector('#nhis-event-2-toggle').closest('table');
        const reason = panel.querySelector('p');
        const audit = panel.querySelector('[aria-label="Settlement at posting"]');
        return {
            documentWidth: document.documentElement.scrollWidth, viewportWidth: document.documentElement.clientWidth,
            activityWidth: activity.parentElement.scrollWidth, activityClientWidth: activity.parentElement.clientWidth,
            reasonWidth: reason.scrollWidth, reasonClientWidth: reason.clientWidth,
            metricColumns: getComputedStyle(audit.querySelector('dl')).gridTemplateColumns.split(' ').length,
            auditBackground: getComputedStyle(audit).backgroundColor,
            amounts: [...audit.querySelectorAll('dd')].map(item => item.textContent),
            rows: panel.querySelectorAll('table > tbody > tr').length,
            expanded: document.querySelector('#nhis-event-2-toggle').getAttribute('aria-expanded'),
            note: audit.textContent.includes("original posting, not today's receivable balance"),
        };
    })()`);
    assert.ok(narrow.documentWidth <= narrow.viewportWidth, 'Mobile page must not overflow horizontally');
    assert.ok(narrow.activityWidth <= narrow.activityClientWidth, 'Mobile activity must not overflow horizontally');
    assert.ok(narrow.reasonWidth <= narrow.reasonClientWidth, 'Long unbroken reasons must wrap');
    assert.equal(narrow.metricColumns, 1);
    assert.equal(narrow.auditBackground, 'rgba(0, 0, 0, 0)', 'Service-period panel must not have a tinted background');
    assert.deepEqual(narrow.amounts, ['GH₵60.00', 'GH₵24.90', 'GH₵0.00']);
    assert.equal(narrow.rows, 2);
    assert.equal(narrow.expanded, 'true');
    assert.equal(narrow.note, true);
    const activityAx = await send('Accessibility.getFullAXTree');
    assert.ok(activityAx.nodes.some(node => node.role?.value === 'table' && node.name?.value === 'NHIS accounting activity'));
    assert.ok(activityAx.nodes.some(node => node.role?.value === 'region' && node.name?.value?.includes('SYNTH-PERIOD-8477')));
    await evaluate(`document.querySelector('#nhis-event-2-toggle').focus({ preventScroll: true })`);
    assert.equal(await evaluate(`document.activeElement.id`), 'nhis-event-2-toggle');
    const pressEnter = async () => {
        await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', text: '\r', unmodifiedText: '\r', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13 });
        await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13 });
    };
    await pressEnter();
    await wait(100);
    assert.equal(await evaluate(`document.querySelector('#nhis-event-2-toggle').getAttribute('aria-expanded')`), 'false');
    await pressEnter();
    for (let n = 0; n < 60; n++) {
        await wait(100);
        if (await evaluate(`!!document.querySelector('#nhis-event-2-details table > tbody > tr')`)) break;
        if (n === 59) throw new Error('Keyboard reopening did not reload allocations');
    }
    await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false });
    const wide = await evaluate(`(() => {
        const panel = document.querySelector('#nhis-event-2-details');
        const activity = document.querySelector('#nhis-event-2-toggle').closest('table');
        const columns = getComputedStyle(panel.querySelector('dl')).gridTemplateColumns.split(' ').length;
        const light = getComputedStyle(panel).backgroundColor;
        document.documentElement.dataset.bsTheme = 'dark';
        return { panelWidth: panel.getBoundingClientRect().width, activityWidth: activity.getBoundingClientRect().width,
            columns, light, dark: getComputedStyle(panel).backgroundColor };
    })()`);
    assert.ok(wide.panelWidth >= wide.activityWidth * .9, 'Expanded details must use the activity row width');
    assert.equal(wide.columns, 3);
    assert.notEqual(wide.light, wide.dark, 'Audit panel must follow the selected theme');
    console.log(JSON.stringify({ stage: 'responsive-activity-audit', narrow, wide, accessibilityNodes: activityAx.nodes.length }));
    assert.deepEqual(runtimeErrors, []);
    await send('Page.navigate', { url: 'about:blank' });
    console.log('PASS: real Chrome render, stable requests, selection, responsive activity, keyboard, themes and accessibility snapshots.');
}
run().catch(error => { console.error(error.stack || error); process.exitCode = 1; }).finally(async () => {
    try { if (socket?.readyState === WebSocket.OPEN) await send('Browser.close', {}, null); } catch { /* Chrome may close before returning its acknowledgement. */ }
    socket?.close();
    for (const request of pending.values()) { clearTimeout(request.timer); request.reject(new Error('Owned Chrome diagnostic closed')); }
    pending.clear();
    if (chrome) {
        const exited = () => chrome.exitCode != null || chrome.signalCode != null;
        await Promise.race([new Promise(resolve => exited() ? resolve() : chrome.once('exit', resolve)), wait(3000)]);
        if (!exited()) {
            await new Promise(resolve => spawn('powershell.exe', ['-NoProfile', '-Command', `Stop-Process -Id ${chrome.pid} -Force -ErrorAction SilentlyContinue`], { stdio: 'ignore' }).once('exit', resolve));
            await Promise.race([new Promise(resolve => exited() ? resolve() : chrome.once('exit', resolve)), wait(5000)]);
            if (!exited()) throw new Error('Owned Chrome diagnostic did not exit');
        }
    }
    if (output) await fs.promises.rm(output, { recursive: true, force: true, maxRetries: 15, retryDelay: 500 });
    if (profile) await fs.promises.rm(profile, { recursive: true, force: true, maxRetries: 15, retryDelay: 500 });
});
