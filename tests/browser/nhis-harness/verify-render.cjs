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
    await send('Page.navigate', { url: pathToFileURL(path.join(output, 'index.html')).href });
    for (let n = 0; n < 60; n++) {
        await wait(100);
        if (await evaluate(`!!window.nhisFixture && window.nhisFixture.calls.length===4 && !!document.querySelector('#nhis-service-title') && !!document.querySelector('#nhis-entry-title')`)) break;
        if (n === 59) throw new Error('Initial NHIS render did not settle');
    }
    const initial = await evaluate(`({calls:window.nhisFixture.calls.length, body:document.body.innerText, button:[...document.querySelectorAll('button')].find(b=>b.textContent==='Select BILL-101')?.getBoundingClientRect().toJSON()})`);
    assert.equal(initial.calls, 4);
    assert.match(initial.body, /1,200,000\.00/);
    assert.match(initial.body, /500,000\.00/);
    assert.match(initial.body, /700,000\.00/);
    console.log(JSON.stringify({ stage: 'initial-render', calls: initial.calls, button: initial.button }));
    const ax = await send('Accessibility.getFullAXTree');
    console.log(JSON.stringify({ stage: 'initial-accessibility-snapshot', nodes: ax.nodes.length }));
    await wait(500);
    assert.equal(await evaluate('window.nhisFixture.calls.length'), 4);
    await evaluate(`[...document.querySelectorAll('button')].find(b=>b.textContent==='Select BILL-101').scrollIntoView({block:'center',inline:'nearest'})`);
    await wait(200);
    const pointer = await evaluate(`(()=>{const r=[...document.querySelectorAll('button')].find(b=>b.textContent==='Select BILL-101').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2,width:innerWidth,height:innerHeight}})()`);
    assert.ok(pointer.x > 0 && pointer.x < pointer.width && pointer.y > 0 && pointer.y < pointer.height, 'Selection must be reachable inside the viewport');
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: pointer.x, y: pointer.y });
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: pointer.x, y: pointer.y, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: pointer.x, y: pointer.y, button: 'left', clickCount: 1 });
    await wait(200);
    assert.equal(await evaluate(`!!document.querySelector('[aria-label="Allocation for BILL-101"]')`), true);
    assert.equal(await evaluate('window.nhisFixture.calls.length'), 4);
    const selectedAx = await send('Accessibility.getFullAXTree');
    console.log(JSON.stringify({ stage: 'selection-and-accessibility-snapshot', calls: 4, nodes: selectedAx.nodes.length }));
    const screenshot = await send('Page.captureScreenshot', { format: 'png' });
    console.log(JSON.stringify({ stage: 'screenshot', bytes: Buffer.byteLength(screenshot.data, 'base64') }));
    assert.deepEqual(runtimeErrors, []);
    await send('Page.navigate', { url: 'about:blank' });
    console.log('PASS: real Chrome initial render, stable requests, selection, AX snapshots, screenshot and navigation; no render/fetch loop reproduced.');
}
run().catch(error => { console.error(error.stack || error); process.exitCode = 1; }).finally(async () => {
    try { if (socket?.readyState === WebSocket.OPEN) await send('Browser.close', {}, null); } catch { /* Chrome may close before returning its acknowledgement. */ }
    socket?.close();
    for (const request of pending.values()) { clearTimeout(request.timer); request.reject(new Error('Owned Chrome diagnostic closed')); }
    pending.clear();
    if (chrome) {
        await Promise.race([new Promise(resolve => chrome.exitCode != null ? resolve() : chrome.once('exit', resolve)), wait(3000)]);
        if (chrome.exitCode == null) {
            await new Promise(resolve => spawn('powershell.exe', ['-NoProfile', '-Command', `Stop-Process -Id ${chrome.pid} -Force -ErrorAction SilentlyContinue`], { stdio: 'ignore' }).once('exit', resolve));
        }
    }
    if (output) fs.rmSync(output, { recursive: true, force: true, maxRetries: 10, retryDelay: 300 });
    if (profile) fs.rmSync(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 300 });
});
