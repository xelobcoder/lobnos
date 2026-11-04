const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { Worker, isMainThread, parentPort, workerData } = require('node:worker_threads');
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

if (!isMainThread) {
    const { JSDOM } = require('jsdom');
    (async () => {
        const dom = new JSDOM('<!doctype html><div id="root"></div>', {
            url: `http://127.0.0.1/?${workerData.query}`, runScripts: 'outside-only', pretendToBeVisual: true,
        });
        try {
            dom.window.eval(workerData.bundle);
            const { document, nhisFixture } = dom.window;
            const waitFor = async (predicate, description) => {
                for (let elapsed = 0; elapsed < 5000; elapsed += 25) {
                    if (predicate()) return;
                    await wait(25);
                }
                throw new Error(`Timed out waiting for ${description}`);
            };
            const allocationCalls = id => nhisFixture.calls.filter(call => call.endpoint.includes(`/events/${id}/allocations`));
            const region = id => document.getElementById(`nhis-event-${id}-details`);
            const toggle = id => document.getElementById(`nhis-event-${id}-toggle`);
            await waitFor(() => document.getElementById('nhis-tab-activity') && nhisFixture.calls.length >= 4, 'initial reports');
            document.getElementById('nhis-tab-activity').click();
            await waitFor(() => toggle(2), 'activity rows');
            assert.equal(allocationCalls(2).length, 0, 'collapsed events must not load allocations');
            assert.equal(toggle(2).getAttribute('aria-expanded'), 'false');
            assert.equal(toggle(2).getAttribute('aria-controls'), region(2).id);
            assert.equal(region(2).closest('tr').hidden, true);

            if (workerData.scenario === 'empty') {
                toggle(5).click();
                await waitFor(() => region(5).textContent.includes('No bill allocations found for this event.'), 'empty allocations');
                assert.equal(region(5).querySelector('table'), null);
                assert.equal(document.getElementById('nhis-allocation-5-count').value, '25');
                assert.equal(allocationCalls(5).length, 1);
            } else if (workerData.scenario === 'error') {
                nhisFixture.reportError = true;
                toggle(2).click();
                await waitFor(() => region(2).querySelector('[role="alert"]'), 'allocation error');
                assert.match(region(2).textContent, /Synthetic report failure/);
                assert.equal(region(2).querySelector('#nhis-allocation-2-count'), null);
                toggle(2).click();
                await waitFor(() => region(2).closest('tr').hidden, 'collapsed error');
                nhisFixture.reportError = false;
                toggle(2).click();
                await waitFor(() => region(2).querySelector('table > tbody > tr'), 'allocation retry');
                assert.equal(allocationCalls(2).length, 2);
            } else {
                const row = toggle(2).closest('tr');
                const reverse = row.querySelector('button[aria-label="Reverse SYNTH-PERIOD-8477"]');
                if (workerData.scenario === 'reversed') {
                    assert.equal(reverse, null);
                    assert.match(row.textContent, /Reversed/);
                } else {
                    assert.ok(reverse);
                    assert.equal(reverse.textContent, 'Reverse period');
                }
                toggle(2).click();
                await waitFor(() => region(2).querySelector('table > tbody > tr'), 'expanded allocations');
                assert.equal(toggle(2).getAttribute('aria-expanded'), 'true');
                assert.equal(region(2).closest('tr').hidden, false);
                assert.equal(region(2).closest('td').colSpan, 5);
                assert.equal(allocationCalls(2).length, 1);
                const audit = region(2).querySelector('[aria-label="Settlement at posting"]');
                assert.ok(audit);
                const state = workerData.scenario === 'reversed' ? 'Reversed' :
                    workerData.scenario === 'partial' ? 'Partially reversed' : 'Applied';
                assert.match(audit.textContent, new RegExp(`Settlement status\\s*${state}`));
                assert.match(audit.textContent, /1 Jan 2026\s*–\s*31 Jan 2026/);
                assert.match(audit.textContent, /Final unpaid balance/);
                assert.match(audit.textContent, /Synthetic approved adjustment/);
                assert.match(audit.textContent, /original posting, not today's receivable balance/);
                assert.match(region(2).textContent, /Synthetic audit note: J{180}/);
                assert.match(region(2).textContent, /Recorded by employee #1 · Event #2/);
                assert.match(region(2).textContent, /Signed amounts for this event/);
                assert.deepEqual([...audit.querySelectorAll('dl > div')].map(item => [
                    item.querySelector('dt').textContent, item.querySelector('dd').textContent,
                ]), [
                    ['Cash received', workerData.scenario === 'many' ? 'GH₵27.00' : 'GH₵60.00'],
                    ['Noncash adjustment', 'GH₵24.90'],
                    ['Outstanding after posting', 'GH₵0.00'],
                ]);
                assert.equal(region(2).querySelector('table caption').textContent, 'Signed allocations for SYNTH-PERIOD-8477');
                assert.deepEqual([...region(2).querySelectorAll('table thead th')].map(th => th.textContent), ['Bill', 'Amount', 'Tax']);

                if (workerData.scenario === 'many') {
                    assert.equal(region(2).querySelectorAll('table > tbody > tr').length, 25);
                    const count = document.getElementById('nhis-allocation-2-count');
                    count.value = '10';
                    count.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
                    await waitFor(() => region(2).querySelectorAll('table > tbody > tr').length === 10 &&
                        allocationCalls(2).at(-1).endpoint.includes('page=1&count=10'), 'allocation page size');
                    const next = [...region(2).querySelectorAll('button')].find(button => button.textContent === 'Next');
                    next.click();
                    await waitFor(() => allocationCalls(2).at(-1).endpoint.includes('page=2&count=10') &&
                        region(2).querySelector('table > tbody > tr')?.textContent.includes('BILL-75'), 'second allocation page');
                    assert.equal(count.value, '10');
                    assert.equal(region(2).querySelectorAll('table > tbody > tr').length, 10);
                } else if (workerData.scenario === 'audit') {
                    assert.match(region(2).textContent, /2 eligible bills · Proportional allocation/);
                    assert.deepEqual([...region(2).querySelectorAll('table > tbody > tr')].map(row => row.textContent),
                        ['BILL-65GH₵30.00GH₵0.00', 'BILL-66GH₵30.00GH₵0.00']);
                    toggle(2).click();
                    await waitFor(() => region(2).closest('tr').hidden, 'collapsed details');
                    assert.equal(allocationCalls(2).length, 1);
                    toggle(2).click();
                    await waitFor(() => allocationCalls(2).length === 2 && region(2).querySelector('table > tbody > tr'), 'reopened details');
                    toggle(3).click();
                    await waitFor(() => region(3).querySelector('table > tbody > tr'), 'signed reversal allocations');
                    assert.match(region(3).textContent, /Reverses remittance #1/);
                    assert.match(region(3).textContent, /-GH₵300,000\.00/);
                    assert.equal(region(3).querySelector('[aria-label="Settlement at posting"]'), null);
                    toggle(4).click();
                    await waitFor(() => region(4).querySelector('table > tbody > tr'), 'linked adjustment allocations');
                    assert.deepEqual([...region(4).querySelectorAll('table > tbody > tr')].map(row => row.textContent),
                        ['BILL-65GH₵12.45GH₵0.00', 'BILL-66GH₵12.45GH₵0.00']);
                    reverse.click();
                    await waitFor(() => document.querySelector('form[aria-label="Reverse SYNTH-PERIOD-8477"]'), 'period reversal dialog');
                    assert.match(document.body.textContent, /reverses the entire service-period settlement atomically/i);
                }
            }
            parentPort.postMessage({ ok: true });
        } finally {
            dom.window.close();
        }
    })().catch(error => parentPort.postMessage({ error: error.stack || error.message }));
} else {
    let available = true;
    try { require.resolve('jsdom'); } catch { available = false; }
    test('NHIS activity audit details preserve settlement, reversal and paginated allocation behavior', {
        timeout: 240000,
        skip: available ? false : 'Optional installed jsdom utility unavailable',
    }, async t => {
        const { build } = require('./browser/nhis-harness/build.cjs');
        const output = await build();
        const bundle = fs.readFileSync(path.join(output, 'fixture.js'), 'utf8');
        const run = async (scenario, query) => {
            const worker = new Worker(__filename, { workerData: { bundle, scenario, query } });
            try {
                await new Promise((resolve, reject) => {
                    const deadline = setTimeout(() => reject(new Error(`${scenario} fixture exceeded 30 seconds`)), 30000);
                    worker.once('message', result => {
                        clearTimeout(deadline);
                        result.error ? reject(new Error(result.error)) : resolve();
                    });
                    worker.once('error', error => { clearTimeout(deadline); reject(error); });
                    worker.once('exit', code => {
                        if (code !== 0) { clearTimeout(deadline); reject(new Error(`${scenario} worker exited with ${code}`)); }
                    });
                });
            } finally {
                await worker.terminate();
            }
        };
        try {
            await t.test('renders full-width audit details and signed reversals on demand', () => run('audit', 'audit=1'));
            await t.test('retains the selected page size when paging allocations', () => run('many', 'audit=1&many=1'));
            await t.test('explains an empty allocation result', () => run('empty', 'audit=1&empty=1'));
            await t.test('shows allocation errors and reloads after reopening', () => run('error', 'audit=1'));
            await t.test('shows partially reversed settlements without removing correction controls', () => run('partial', 'audit=1&auditState=partially_reversed'));
            await t.test('shows reversed settlements without offering another reversal', () => run('reversed', 'audit=1&auditState=reversed'));
        } finally {
            fs.rmSync(output, { recursive: true, force: true });
        }
    });
}
