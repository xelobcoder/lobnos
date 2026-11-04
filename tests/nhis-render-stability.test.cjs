const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { Worker, isMainThread, parentPort, workerData } = require('node:worker_threads');
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

if (!isMainThread) {
    // Test the bundled production components, not a reimplementation of their hooks.
    // A worker deadline makes an accidental render/fetch loop a bounded failure.
    const { JSDOM } = require('jsdom');
    (async () => {
        parentPort.postMessage({ progress: 'DOM utility loaded' });
        const dom = new JSDOM('<!doctype html><div id="root"></div>', {
            url: 'http://127.0.0.1/synthetic-nhis', runScripts: 'outside-only', pretendToBeVisual: true,
        });
        try {
            dom.window.eval(workerData.bundle);
            parentPort.postMessage({ progress: 'production bundle evaluated' });
            const { document, nhisFixture } = dom.window;
            const calls = () => nhisFixture.calls.length;
            // Wait for observable readiness and a quiet render window. A fixed
            // startup delay races React scheduling when CI is compiling in parallel.
            async function settle() {
                let previousHtml = '', previousCalls = -1, quiet = 0;
                for (let elapsed = 0; elapsed < 5000; elapsed += 25) {
                    await wait(25);
                    const select = document.querySelector('[aria-label="Select BILL-101"]');
                    const html = document.getElementById('root').innerHTML;
                    if (select && !select.disabled && html === previousHtml && calls() === previousCalls) quiet += 25;
                    else quiet = 0;
                    if (quiet >= 150) return;
                    previousHtml = html;
                    previousCalls = calls();
                }
                throw new Error('NHIS reports did not settle within five seconds');
            }
            await settle();
            const summary = document.querySelector('[aria-label="NHIS service-period totals"]');
            if (!summary) throw new Error('NHIS summary was not rendered');
            const summaryTag = summary.tagName, summaryClasses = summary.className;
            const summaryValues = [...summary.querySelectorAll('dd:not([class])')].map(value => value.textContent);
            const progress = summary.querySelector('[aria-label="NHIS cash recovery"]');
            const recoveryBar = progress && { value: progress.value, max: progress.max, text: progress.getAttribute('aria-valuetext') };
            const initialCalls = calls();
            parentPort.postMessage({ progress: `initial render settled with ${initialCalls} requests` });
            let mutations = 0;
            const observer = new dom.window.MutationObserver(records => { mutations += records.length; });
            observer.observe(document.getElementById('root'), { subtree: true, childList: true, attributes: true, characterData: true });
            await wait(200);
            const idleMutations = mutations, idleCalls = calls();
            const select = document.querySelector('[aria-label="Select BILL-101"]');
            if (!select || select.disabled) throw new Error('BILL-101 selection was not available');
            select.click();
            await settle();
            const selected = select.checked && document.body.textContent.includes('1 bill selected');
            const selectedCalls = calls();
            parentPort.postMessage({ progress: `selection rendered with ${selectedCalls} requests` });
            mutations = 0;
            await wait(200);
            const selectedIdleMutations = mutations;
            const count = document.getElementById('nhis-service-count');
            count.value = '10';
            count.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
            await settle();
            const countCalls = calls();
            const countRequest = nhisFixture.calls.at(-1).endpoint;
            document.querySelector('[aria-label="Refresh NHIS reports"]').click();
            await settle();
            const refreshedCalls = calls();
            mutations = 0;
            await wait(200);
            const refreshIdleMutations = mutations;
            observer.disconnect();
            parentPort.postMessage({ summaryTag, summaryClasses, summaryValues, recoveryBar, initialCalls, idleCalls, idleMutations, selected, selectedCalls, selectedIdleMutations, countCalls, countRequest, refreshedCalls, refreshIdleMutations });
        } finally { dom.window.close(); }
    })().catch(error => parentPort.postMessage({ error: error.stack || error.message }));
} else {
    let available = true;
    try { require.resolve('jsdom'); } catch { available = false; }
    test('production NHIS fixture stays idle, selects bills and refetches only affected filters/reports', {
        timeout: 60000,
        // Uses the already-installed DOM test utility; never installs a dependency.
        skip: available ? false : 'Optional installed jsdom utility unavailable; Action/unit tests remain dependency-free',
    }, async () => {
        const { build } = require('./browser/nhis-harness/build.cjs');
        const output = await build();
        let worker;
        try {
            worker = new Worker(__filename, { workerData: { bundle: fs.readFileSync(`${output}/fixture.js`, 'utf8') } });
            const result = await new Promise((resolve, reject) => {
                let progress = 'worker starting';
                const deadline = setTimeout(() => reject(new Error(`NHIS render/fetch loop or unresponsive worker exceeded 30 seconds (${progress})`)), 30000);
                worker.on('message', value => {
                    if (value.progress) { progress = value.progress; return; }
                    clearTimeout(deadline); resolve(value);
                });
                worker.once('error', error => { clearTimeout(deadline); reject(error); });
            });
            assert.equal(result.error, undefined);
            assert.equal(result.summaryTag, 'DL');
            assert.match(result.summaryClasses, /AccountingWorkspace_module_css_summaryStrip/);
            assert.doesNotMatch(result.summaryClasses, /AccountingWorkspace_module_css_compactStrip/);
            assert.deepEqual(result.summaryValues, ['GH₵1,200,000.00', 'GH₵500,000.00', 'GH₵700,000.00', '41.7%']);
            assert.deepEqual(result.recoveryBar, { value: 41.7, max: 100, text: '41.7% received' });
            assert.equal(result.initialCalls, 4); // Authority + three independent reports.
            assert.equal(result.idleCalls, 4);
            assert.equal(result.idleMutations, 0);
            assert.equal(result.selected, true);
            assert.equal(result.selectedCalls, 4); // Selection is local state, not a refetch.
            assert.equal(result.selectedIdleMutations, 0);
            assert.equal(result.countCalls, 5);
            assert.match(result.countRequest, /accounting\/nhis\/receivables\?page=1&count=10/);
            assert.equal(result.refreshedCalls, 8); // Explicit refresh refetches each report once.
            assert.equal(result.refreshIdleMutations, 0);
        } finally {
            if (worker) await worker.terminate();
            fs.rmSync(output, { recursive: true, force: true });
        }
    });
}
