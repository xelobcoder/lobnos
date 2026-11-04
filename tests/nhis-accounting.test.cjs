const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
function compile(file, mocks = {}) {
    const exports = {};
    const source = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
        fileName: file, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    }).outputText;
    vm.runInNewContext(source, { exports, URLSearchParams, Date, Set, Error, crypto: require('node:crypto').webcrypto, require: name => mocks[name] || require(name) });
    return exports;
}
const helpers = compile('lib/accounting/nhis.ts');
const plain = value => JSON.parse(JSON.stringify(value));
const balances = { expected: '1200000.00', received: '500000.00', revenueAdjustments: '0.00', writtenOff: '0.00', outstanding: '700000.00', unverifiedLegacyReceipts: '0.00', reconciliationDifference: '0.00' };
const bill = { ...balances, billingId: 21, reference: 'BILL-21', serviceDate: '2026-01-01' };
const draft = () => ({ kind: 'receipt', reference: ' REF-001 ', reason: ' NHIS remittance ', date: '2026-02-01', amount: '500000.00', paymentAccountCode: 'acc-1001', allocations: [{ bill, amount: '500000.00' }] });
test('integer money supports 1.2m expected, 500k received, 700k outstanding and exact decimal allocation sums', () => {
    assert.equal(helpers.cents(balances.expected) - helpers.cents(balances.received), helpers.cents(balances.outstanding));
    assert.equal(helpers.sumMoney(['0.10', '0.20', '499999.70']), '500000.00');
    assert.equal(helpers.sumMoney(['1200000.00', '-500000.00']), '700000.00');
    assert.equal(helpers.decimal(-1), '-0.01');
    for (const invalid of ['1,200,000', '1.001', '1e6', '', Infinity, 'NaN']) assert.throws(() => helpers.cents(invalid));
});
test('strict receipt and noncash payload schemas, positive allocations, exact amount, bill/date limits', () => {
    const receipt = plain(helpers.entryPayload(draft()));
    assert.deepEqual(Object.keys(receipt).sort(), ['allocations', 'amount', 'date', 'paymentAccountCode', 'reason', 'reference'].sort());
    assert.equal(receipt.reference, 'REF-001');
    assert.equal(receipt.reason, 'NHIS remittance');
    for (const kind of ['revenue_adjustment', 'write_off']) {
        const adjustment = plain(helpers.entryPayload({ ...draft(), kind }));
        assert.equal(adjustment.kind, kind);
        assert.equal('paymentAccountCode' in adjustment, false);
    }
    const otherBill = { ...bill, billingId: 22, reference: 'BILL-22' };
    const multi = helpers.entryPayload({ ...draft(), amount: '0.30', allocations: [{ bill: otherBill, amount: '0.20' }, { bill, amount: '0.10' }] });
    assert.deepEqual(plain(multi.allocations), [{ billingId: 21, amount: '0.10' }, { billingId: 22, amount: '0.20' }]);
    assert.throws(() => helpers.entryPayload({ ...draft(), amount: '700000.01', allocations: [{ bill, amount: '700000.01' }] }), /exceed outstanding/);
    assert.throws(() => helpers.entryPayload({ ...draft(), amount: '0.00' }), /positive/);
    assert.throws(() => helpers.entryPayload({ ...draft(), allocations: [] }), /Select/);
    assert.throws(() => helpers.entryPayload({ ...draft(), amount: '1.00' }), /exactly/);
    assert.throws(() => helpers.entryPayload({ ...draft(), date: '2025-12-31' }), /before/);
    assert.throws(() => helpers.entryPayload({ ...draft(), date: '2099-01-01' }), /future/);
    assert.throws(() => helpers.entryPayload({ ...draft(), date: '2026-02-30' }), /valid date/);
    assert.throws(() => helpers.entryPayload({ ...draft(), reference: ' ' }), /Reference/);
    assert.throws(() => helpers.entryPayload({ ...draft(), allocations: [draft().allocations[0], draft().allocations[0]] }), /duplicate/);
});
test('reversal is explicitly confirmed, has only strict metadata, and cannot predate original event', () => {
    assert.throws(() => helpers.reversalPayload('REV-1', 'Correction', '2026-03-01', '2026-02-01', false), /confirm/);
    assert.throws(() => helpers.reversalPayload('REV-1', 'Correction', '2026-01-01', '2026-02-01', true), /before/);
    assert.deepEqual(plain(helpers.reversalPayload(' REV-1 ', ' Correction ', '2026-03-01', '2026-02-01', true)),
        { reference: 'REV-1', reason: 'Correction', date: '2026-03-01' });
});
test('request key remains stable for explicit unchanged retries, changes for intentional payload edits', () => {
    let keys = 0;
    const key = () => `nhis-request-key-${++keys}`;
    const payload = helpers.entryPayload(draft());
    const first = helpers.requestAttempt(payload, null, key);
    assert.equal(helpers.requestAttempt({ ...payload }, first, key), first);
    assert.equal(keys, 1);
    const changed = helpers.requestAttempt({ ...payload, reference: 'REF-002' }, first, key);
    assert.notEqual(changed.payload.requestKey, first.payload.requestKey);
    assert.equal(keys, 2);
    assert.throws(() => helpers.requestAttempt(payload, null, () => 'bad'), /request key/);
});
test('reports distinguish service-date cohort, receipt-date cash and event-date queries with page/count', async () => {
    const calls = [];
    const response = endpoint => endpoint.includes('cash-receipts') ?
        { basis: 'cash_received_in_period', rows: [], total: 0, page: 3, count: 50, totals: { received: '500000.00', reversedOrRefunded: '0.00', netReceived: '500000.00' } } :
        endpoint.includes('/events') ? { rows: [], total: 0, page: 4, count: 10 } :
            { payer: 'NHIS', basis: 'current_balances_for_service_period', rows: [bill], total: 120, page: 2, count: 25, totals: balances, excludedMixedBills: [99] };
    const { nhisApi } = compile('lib/accounting/nhisApi.ts', {
        './nhis': helpers, '../../components/Auth/customFetch': { customFetch: async endpoint => {
            calls.push(endpoint); return { status: 'success', statusCode: 200, result: response(endpoint) };
        } },
    });
    const cohort = await nhisApi.receivables({ from: '2026-01-01', to: '2026-01-31', page: 2, count: 25 });
    await nhisApi.cash({ from: '2026-02-01', to: '2026-02-28', page: 3, count: 50 });
    await nhisApi.events({ from: '', to: '2026-03-31', page: 4, count: 10 });
    assert.equal(cohort.total, 120);
    assert.equal(cohort.totals.expected, '1200000.00'); // All-result total, not a page reduction.
    assert.deepEqual(calls, [
        'accounting/nhis/receivables?page=2&count=25&from=2026-01-01&to=2026-01-31',
        'accounting/nhis/cash-receipts?page=3&count=50&from=2026-02-01&to=2026-02-28',
        'accounting/nhis/events?page=4&count=10&to=2026-03-31',
    ]);
    assert.throws(() => helpers.periodQuery({ from: '2026-02-01', to: '2026-01-01', page: 1, count: 25 }), /From date/);
    assert.throws(() => helpers.periodQuery({ from: '', to: '', page: 0, count: 25 }), /page/);
});
test('mutation transport uses authenticated customPost paths, exact schema and no success fallback on errors', async () => {
    const calls = [];
    let fail = false;
    const api = compile('lib/accounting/nhisApi.ts', {
        './nhis': helpers, '../../components/Auth/customFetch': { customPost: async (...args) => {
            calls.push(plain(args));
            return fail ? { status: 'error', statusCode: 409, code: 'OVER_ALLOCATION', message: 'Outstanding balance changed' } :
                { status: 'success', statusCode: 201, result: { event: { id: 1 }, allocations: [], alreadyApplied: true } };
        } },
    });
    const receipt = { ...helpers.entryPayload(draft()), requestKey: 'nhis-request-key-1' };
    assert.equal((await api.nhisApi.entry(receipt)).alreadyApplied, true);
    await api.nhisApi.entry({ ...helpers.entryPayload({ ...draft(), kind: 'write_off' }), requestKey: 'nhis-request-key-2' });
    await api.nhisApi.reverse(12, { requestKey: 'nhis-request-key-3', reference: 'REV-1', reason: 'Correction', date: '2026-03-01' });
    assert.deepEqual(calls.map(c => c.slice(0, 2)), [
        ['accounting/nhis/receipts', 'POST'], ['accounting/nhis/adjustments', 'POST'], ['accounting/nhis/events/12/reversal', 'POST'],
    ]);
    assert.equal('paymentAccountCode' in calls[1][2], false);
    assert.deepEqual(Object.keys(calls[2][2]).sort(), ['requestKey', 'reference', 'reason', 'date'].sort());
    fail = true;
    await assert.rejects(api.nhisApi.entry(receipt), /OVER_ALLOCATION: Outstanding balance changed/);
    assert.throws(() => api.checkedResult({ status: 'success', statusCode: 200 }), /could not/);
    assert.throws(() => api.checkedPage({ rows: [], total: 0, page: 1 }), /paginated/);
});
test('authority defaults denied and separates receipt, approval and financial correction', () => {
    for (const kind of ['receipt', 'revenue_adjustment', 'write_off', 'reversal']) assert.equal(helpers.canAct(null, kind), false);
    const authority = { permissions: { 'accounting.journal.post': { allowed: true }, 'accounting.journal.approve': { allowed: false }, 'accounting.financial_correction.execute': { allowed: false } } };
    assert.equal(helpers.canAct(authority, 'receipt'), true);
    assert.equal(helpers.canAct(authority, 'write_off'), false);
    assert.equal(helpers.canAct(authority, 'reversal'), false);
    authority.permissions['accounting.journal.approve'].allowed = true;
    assert.equal(helpers.canAct(authority, 'revenue_adjustment'), true);
    assert.equal(helpers.canAct(authority, 'write_off'), true);
});
test('navigation, payer classification, cash-only labels and patient collection safeguards', () => {
    for (const file of ['components/accounting/AccountingWorkspaceNav.tsx', 'components/Layout/links/categories/AccountingLinks.tsx', 'components/accounting/SubledgerReport.tsx', 'app/billing/cash-collection/page.tsx'])
        assert.match(fs.readFileSync(path.join(root, file), 'utf8'), /\/accounting\/nhis/);
    const subledger = fs.readFileSync(path.join(root, 'components/accounting/SubledgerReport.tsx'), 'utf8');
    assert.match(subledger, /value="nhis"/);
    assert.match(subledger, /value="patient"/);
    assert.match(subledger, /value="mixed"/);
    assert.match(subledger, /Received \(cash only\).*payerPaid/);
    assert.match(subledger, /NHIS settled \(cash \+ noncash\).*nhisSettledAmount/);
    assert.equal(helpers.payerDisplay({ partyType: 'nhis', partyName: 'Service patient', classification: 'nhis' }), 'NHIS');
    assert.equal(helpers.payerDisplay({ partyType: 'patient', partyName: 'Synthetic Patient', classification: 'patient' }), 'Synthetic Patient');
    assert.match(helpers.payerDisplay({ partyType: 'patient', partyName: 'Synthetic Patient', classification: 'mixed' }), /Mixed payer/);
    assert.equal(helpers.requiresNhisWorkspace({ source: 4 }), true);
    assert.equal(helpers.requiresNhisWorkspace({ classification: 'mixed' }), true);
    assert.equal(helpers.requiresNhisWorkspace({ source: 1, classification: 'patient' }), false);
    assert.equal(helpers.requiresNhisWorkspace({ classification: 'patient', partyType: 'nhis', source: 4 }), false);
    assert.equal(helpers.requiresNhisWorkspace({ partyType: 'patient', source: 4 }), false);
    assert.equal(helpers.requiresNhisWorkspace({ classification: 'mixed', partyType: 'patient' }), true);
    assert.equal(helpers.requiresNhisWorkspace({ partyType: 'nhis', source: 1 }), true);
});
test('general receivables API passes payer filter, dates and server pagination unchanged', async () => {
    const calls = [];
    const { accountingApi } = compile('lib/accounting/accountingApi.ts', {
        '../../components/Auth/customFetch': { customFetch: async endpoint => { calls.push(endpoint); return {}; } },
    });
    await accountingApi.outstandingReceivables({ payerType: 'nhis', from: '2026-01-01', to: '2026-01-31', page: 3, count: 50, sortby: 'documentDate:desc', search: 'BILL' });
    const url = new URL(calls[0], 'http://fixture/');
    assert.equal(url.pathname, '/accounting/reports/receivables');
    for (const [key, value] of Object.entries({ payerType: 'nhis', from: '2026-01-01', to: '2026-01-31', page: '3', count: '50', sortby: 'documentDate:desc', search: 'BILL' }))
        assert.equal(url.searchParams.get(key), value);
});
    function formHarness(post, identities = compile('lib/billing/submissionIdentity.ts'), periodApi = {}) {
        let index = 0, action;
        const slots = [];
        const hooks = {
            useEffect() {},
            useState(initial) {
                const slot = index++;
                if (!(slot in slots)) slots[slot] = typeof initial === 'function' ? initial() : initial;
                return [slots[slot], value => { slots[slot] = typeof value === 'function' ? value(slots[slot]) : value; }];
            },
            useRef(initial) { const slot = index++; return slots[slot] || (slots[slot] = { current: initial }); },
            useActionState(handler, initial) { const slot = index++; if (!(slot in slots)) slots[slot] = initial; action = async data => (slots[slot] = await handler(slots[slot], data || {})); return [slots[slot], action, false]; },
        };
        const forms = compile('components/accounting/NhisForms.tsx', {
            react: hooks, 'react-dom': { useFormStatus: () => ({ pending: false }) },
            '../Auth/customFetch': { currencyFormatter: new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }) },
            '../../lib/accounting/nhis': helpers, '../../lib/accounting/nhisApi': { nhisApi: { entry: post, reverse: post, ...periodApi } },
            '../Auth/useApplicationContext': { useApplication: () => ({ branchid: 4, user: { employeeid: 9 } }) },
            '../../lib/billing/submissionIdentity': identities,
            './NhisWorkspace.module.css': {},
        });
        return { slots, render(name, props) { index = 0; return forms[name](props); }, submit: data => action(data) };
    }
    const fullAuthority = { permissions: Object.fromEntries(Object.values(helpers.nhisPermissions).map(permission => [permission, { allowed: true }])) };
    const periodDraft = () => ({
        from: '2026-01-01', to: '2026-01-31', amount: '600000.00', date: '2026-02-01', reference: 'PERIOD-001', reason: 'Synthetic five-thousand-bill remittance',
        paymentAccountCode: 'acc-1001', remainingDisposition: 'pending', remainingReason: '', adjustmentKind: '', adjustmentReference: '', adjustmentReason: '',
    });
    const periodPreview = (disposition = 'pending', amount = '600000.00') => ({
        from: '2026-01-01', to: '2026-01-31', billCount: 5000, eligibleOutstanding: '800000.00', received: amount,
        remaining: helpers.sumMoney(['800000.00', helpers.decimal(-helpers.cents(amount))]), adjusted: disposition === 'final' ? helpers.sumMoney(['800000.00', helpers.decimal(-helpers.cents(amount))]) : '0.00',
        outstandingAfter: disposition === 'final' ? '0.00' : helpers.sumMoney(['800000.00', helpers.decimal(-helpers.cents(amount))]),
        allocationMethod: 'proportional', snapshotToken: 'reviewed-snapshot-000001', excludedMixedBillCount: 2,
        allocationSample: [{ billingId: 1, reference: 'BILL-1', outstanding: '160.00', received: amount === '0.00' ? '0.00' : '120.00', remaining: amount === '0.00' ? '160.00' : '40.00' }],
    });
    const periodResult = (disposition = 'pending', amount = '600000.00') => ({
        receiptEvent: amount === '0.00' ? null : { id: 10 }, adjustmentEvent: disposition === 'final' ? { id: 11 } : null,
        settlement: { id: 1, ...periodPreview(disposition, amount), remainingDisposition: disposition },
    });
    const intent = value => ({ get: key => key === 'intent' ? value : null });
    test('period payload covers all 5000 bills without client allocations and leaves pending/appealed debt outstanding', () => {
        const payload = plain(helpers.periodSettlementPayload(periodDraft(), periodPreview(), true));
        assert.equal(payload.amount, '600000.00');
        assert.equal(payload.remainingDisposition, 'pending');
        assert.equal(payload.snapshotToken, 'reviewed-snapshot-000001');
        assert.equal('allocations' in payload, false);
        assert.equal('adjustmentKind' in payload, false);
        assert.equal('adjustmentReference' in payload, false);
        const appeal = { ...periodDraft(), remainingDisposition: 'appeal', remainingReason: 'Claim decision appealed' };
        assert.equal(helpers.periodSettlementPayload(appeal, periodPreview('appeal'), true).remainingReason, 'Claim decision appealed');
        assert.throws(() => helpers.periodSettlementPayload({ ...appeal, remainingReason: '' }, periodPreview('appeal'), true), /Explain the appeal/);
        assert.throws(() => helpers.periodSettlementPayload(periodDraft(), periodPreview(), false), /Confirm/);
        assert.throws(() => helpers.periodSettlementPayload({ ...periodDraft(), to: '2026-02-01' }, periodPreview(), true), /Preview/);
        assert.throws(() => helpers.periodPreviewPayload({ ...periodDraft(), date: '2026-01-20' }), /posting date/);
    });
    test('final period decisions require explicit accounting treatment and support later noncash-only settlement', () => {
        const final = { ...periodDraft(), remainingDisposition: 'final', adjustmentKind: 'write_off', adjustmentReference: 'APPROVAL-001', adjustmentReason: 'Final authorized irrecoverable debt' };
        const combined = plain(helpers.periodSettlementPayload(final, periodPreview('final'), true));
        assert.equal(combined.adjustmentKind, 'write_off');
        assert.equal(combined.adjustmentReference, 'APPROVAL-001');
        assert.equal(combined.paymentAccountCode, 'acc-1001');
        const noncash = plain(helpers.periodSettlementPayload({ ...final, amount: '0.00' }, periodPreview('final', '0.00'), true));
        assert.equal(noncash.amount, '0.00');
        assert.equal('paymentAccountCode' in noncash, false);
        assert.equal('allocations' in noncash, false);
        assert.throws(() => helpers.periodPreviewPayload({ ...final, adjustmentKind: '' }), /Choose a tariff/);
        assert.throws(() => helpers.periodPreviewPayload({ ...periodDraft(), amount: '0.00' }), /zero is only/);
        assert.throws(() => helpers.periodSettlementPayload({ ...final, adjustmentReason: '' }, periodPreview('final'), true), /Reason/);
    });
    test('period API validates whole-cohort totals independently of the allocation sample and rejects success-shaped mismatches', async () => {
        const calls = [];
        let invalid = false;
        const api = compile('lib/accounting/nhisApi.ts', {
            './nhis': helpers, '../../components/Auth/customFetch': { customPost: async (endpoint, method, payload) => {
                calls.push({ endpoint, method, payload: plain(payload) });
                return { status: 'success', statusCode: 200, result: endpoint.endsWith('/preview') ? { ...periodPreview(), ...(invalid ? { remaining: '1.00' } : {}) } : periodResult() };
            } },
        }).nhisApi;
        const preview = await api.previewPeriod(helpers.periodPreviewPayload(periodDraft()));
        assert.equal(preview.billCount, 5000);
        assert.equal(preview.allocationSample.length, 1);
        await api.settlePeriod({ ...helpers.periodSettlementPayload(periodDraft(), preview, true), requestKey: 'period-request-key-001' });
        assert.deepEqual(calls.map(call => call.endpoint), ['accounting/nhis/period-settlements/preview', 'accounting/nhis/period-settlements']);
        assert.equal(calls.every(call => !('allocations' in call.payload)), true);
        invalid = true;
        await assert.rejects(api.previewPeriod(helpers.periodPreviewPayload(periodDraft())), /totals do not reconcile/);
    });
    test('period Action requires fresh review and confirmation, retains snapshot/key on uncertain retry, and never posts during preview', async () => {
        const posts = [];
        let previews = 0, successes = 0;
        const harness = formHarness(async () => assert.fail('Manual endpoint must not be used'), undefined, {
            previewPeriod: async () => { previews++; return periodPreview(); },
            settlePeriod: async payload => { posts.push(plain(payload)); if (posts.length === 1) throw new Error('Interrupted response; outcome unknown'); return { ...periodResult(), alreadyApplied: true }; },
        });
        const props = { authority: fullAuthority, from: '2026-01-01', to: '2026-01-31', onCancel: () => {}, onSuccess: () => successes++ };
        harness.render('NhisPeriodRemittanceForm', props); harness.slots[0] = periodDraft(); harness.render('NhisPeriodRemittanceForm', props);
        assert.match((await harness.submit(intent('post'))).error, /Preview the current period/);
        await harness.submit(intent('preview'));
        assert.equal(previews, 1); assert.equal(posts.length, 0);
        assert.match((await harness.submit(intent('post'))).error, /Confirm/);
        harness.slots[2] = true; harness.render('NhisPeriodRemittanceForm', props);
        assert.match((await harness.submit(intent('post'))).error, /outcome unknown/);
        harness.render('NhisPeriodRemittanceForm', props);
        await harness.submit(intent('post'));
        assert.equal(posts.length, 2); assert.equal(successes, 1);
        assert.equal(posts[0].requestKey, posts[1].requestKey);
        assert.equal(posts[0].snapshotToken, posts[1].snapshotToken);
        assert.equal('allocations' in posts[0], false);
    });
    test('changing a reviewed period invalidates preview and final-period approval is fail-closed', async () => {
        const harness = formHarness(async () => assert.fail('No manual post'), undefined, {
            previewPeriod: async () => periodPreview(), settlePeriod: async () => assert.fail('Stale review must not post'),
        });
        const props = { authority: fullAuthority, from: '2026-01-01', to: '2026-01-31', onCancel: () => {}, onSuccess: () => {} };
        harness.render('NhisPeriodRemittanceForm', props); harness.slots[0] = periodDraft(); harness.render('NhisPeriodRemittanceForm', props);
        await harness.submit(intent('preview'));
        harness.slots[0] = { ...periodDraft(), amount: '599999.99' }; harness.slots[2] = true; harness.render('NhisPeriodRemittanceForm', props);
        assert.match((await harness.submit(intent('post'))).error, /Preview the current period/);
        const receiptOnly = { permissions: { 'accounting.journal.post': { allowed: true } } };
        harness.slots[0] = { ...periodDraft(), remainingDisposition: 'final', adjustmentKind: 'write_off' };
        harness.render('NhisPeriodRemittanceForm', { ...props, authority: receiptOnly });
        assert.match((await harness.submit(intent('preview'))).error, /approval authority/);
    });
    test('production remittance Action retries identical key after backend error, refreshes only on confirmed success and guards stale duplicate callback', async () => {
        const calls = [];
        let refreshes = 0, clears = 0;
        const harness = formHarness(async payload => {
            calls.push(plain(payload));
            if (calls.length === 1) throw new Error('Synthetic interrupted response; outcome unknown');
            return { alreadyApplied: true };
        });
        const props = { authority: fullAuthority, allocations: draft().allocations, setAllocations: () => clears++, onSuccess: () => refreshes++ };
        harness.render('NhisEntryForm', props);
        // Controlled state follows the production kind, reference, reason, date, amount, account order.
        Object.assign(harness.slots, { 0: 'receipt', 1: 'REF-ACTION', 2: 'Synthetic remittance', 3: '2026-02-01', 4: '500000.00', 5: 'acc-1001' });
        harness.render('NhisEntryForm', props);
        const failure = await harness.submit();
        assert.match(failure.error, /outcome unknown/);
        assert.equal(failure.unresolved, true);
        assert.equal(refreshes, 0);
        const success = await harness.submit();
        assert.match(success.success, /Previously applied/);
        assert.equal(calls[0].requestKey, calls[1].requestKey);
        assert.equal(refreshes, 1);
        assert.equal(clears, 1);
        await harness.submit(); // Old callback must not post again after confirmed success.
        assert.equal(calls.length, 2);
    });
    test('production remittance Action blocks changed failed payload until audit acknowledgement and uses a fresh key', async () => {
        const calls = [];
        const harness = formHarness(async payload => { calls.push(plain(payload)); throw new Error('Synthetic backend rejection'); });
        const props = { authority: fullAuthority, allocations: draft().allocations, setAllocations: () => {}, onSuccess: () => assert.fail('Error cannot refresh as success') };
        harness.render('NhisEntryForm', props);
        Object.assign(harness.slots, { 0: 'write_off', 1: 'REF-FAILED', 2: 'Authorized bad debt', 3: '2026-02-01', 4: '500000.00', 5: 'acc-1001', 7: true });
        harness.render('NhisEntryForm', props);
        await harness.submit();
        harness.slots[1] = 'REF-INTENTIONALLY-CHANGED';
        harness.render('NhisEntryForm', props);
        assert.match((await harness.submit()).error, /confirm before changing/);
        assert.equal(calls.length, 1);
        harness.slots[6] = true; // Audit-review acknowledgement.
        harness.render('NhisEntryForm', props);
        await harness.submit();
        assert.equal(calls.length, 2);
        assert.notEqual(calls[0].requestKey, calls[1].requestKey);
        assert.equal('paymentAccountCode' in calls[1], false);
        assert.equal(calls[1].kind, 'write_off');
    });
    test('production reversal Action requires explicit confirmation, preserves exact schema and guards stale repeated success', async () => {
        const calls = [];
        let refreshes = 0;
        const harness = formHarness(async (...args) => { calls.push(plain(args)); return {}; });
        const props = { authority: fullAuthority, event: { id: 1, kind: 'receipt', reference: 'SYNTH-RECEIPT', event_date: '2026-02-01', amount: '500000.00' }, onSuccess: () => refreshes++, onCancel: () => {} };
        harness.render('NhisReversalForm', props);
        Object.assign(harness.slots, { 0: 'REV-ACTION', 1: 'Explicit correction', 2: '2026-03-01', 3: false });
        harness.render('NhisReversalForm', props);
        assert.match((await harness.submit()).error, /confirm/);
        assert.equal(calls.length, 0);
        harness.slots[3] = true;
        harness.render('NhisReversalForm', props);
        await harness.submit();
        await harness.submit();
        assert.equal(calls.length, 1);
        assert.equal(refreshes, 1);
        assert.equal(calls[0][0], 1);
        assert.deepEqual(Object.keys(calls[0][1]).sort(), ['requestKey', 'reference', 'reason', 'date'].sort());
    });
    test('production remittance retry keeps hashed submission identity across form remount', async () => {
        const identities = compile('lib/billing/submissionIdentity.ts');
        const calls = [];
        const post = async payload => { calls.push(plain(payload)); throw new Error('Interrupted response'); };
        const props = { authority: fullAuthority, allocations: draft().allocations, setAllocations: () => {}, onSuccess: () => assert.fail('No confirmed success') };
        for (let mount = 0; mount < 2; mount++) {
            const harness = formHarness(post, identities);
            harness.render('NhisEntryForm', props);
            Object.assign(harness.slots, { 0: 'receipt', 1: 'SYNTH-REMOUNT', 2: 'Same explicit payload', 3: '2026-02-01', 4: '500000.00', 5: 'acc-1001' });
            harness.render('NhisEntryForm', props);
            assert.match((await harness.submit()).error, /Interrupted/);
        }
        assert.equal(calls.length, 2);
        assert.equal(calls[0].requestKey, calls[1].requestKey);
    });
    test('production form authority visibility hides write-off and tariff options for receipt-only users', () => {
        const { renderToStaticMarkup } = require('react-dom/server');
        const harness = formHarness(async () => assert.fail('Rendering cannot post'));
        const props = { allocations: [], setAllocations: () => {}, onSuccess: () => {} };
        assert.equal(harness.render('NhisEntryForm', { ...props, authority: { permissions: {} } }), null);
        const receiptOnly = { permissions: { 'accounting.journal.post': { allowed: true } } };
        const html = renderToStaticMarkup(harness.render('NhisEntryForm', { ...props, authority: receiptOnly }));
        assert.match(html, /Actual received amount/);
        assert.match(html, /Received into/);
        assert.doesNotMatch(html, /value="write_off"|value="revenue_adjustment"/);
        const approvalHarness = formHarness(async () => assert.fail('Rendering cannot post'));
        const approvalHtml = renderToStaticMarkup(approvalHarness.render('NhisEntryForm', { ...props, authority: { permissions: { 'accounting.journal.approve': { allowed: true } } } }));
        assert.match(approvalHtml, /value="write_off"/);
        assert.match(approvalHtml, /value="revenue_adjustment"/);
        assert.doesNotMatch(approvalHtml, /Received into/);
    });
    test('focused remittance dialog cannot switch to noncash settlement, and adjustments require confirmation', async () => {
        const { renderToStaticMarkup } = require('react-dom/server');
        const calls = [];
        const harness = formHarness(async payload => { calls.push(plain(payload)); return {}; });
        const props = { authority: fullAuthority, allocations: draft().allocations, setAllocations: () => {}, onSuccess: () => {} };
        const receipt = renderToStaticMarkup(harness.render('NhisEntryForm', { ...props, initialKind: 'receipt' }));
        assert.doesNotMatch(receipt, /value="write_off"|value="revenue_adjustment"/);
        assert.match(receipt, /Bill allocations/);
        assert.match(receipt, /Enter an amount/);
        const adjustment = formHarness(async payload => { calls.push(plain(payload)); return {}; });
        adjustment.render('NhisEntryForm', { ...props, initialKind: 'revenue_adjustment' });
        Object.assign(adjustment.slots, { 0: 'write_off', 1: 'SYNTH-WRITEOFF', 2: 'Approved debt decision', 3: '2026-02-01', 4: '500000.00' });
        adjustment.render('NhisEntryForm', props);
        assert.match((await adjustment.submit()).error, /Explicitly confirm the noncash adjustment/);
        assert.equal(calls.length, 0);
        adjustment.slots[7] = true;
        adjustment.render('NhisEntryForm', props);
        await adjustment.submit();
        assert.equal(calls.length, 1);
        assert.equal(calls[0].kind, 'write_off');
        assert.equal('paymentAccountCode' in calls[0], false);
    });
    test('production Action renders backend errors and rejects concurrent mutations without posting', async () => {
        const { renderToStaticMarkup } = require('react-dom/server');
        const harness = formHarness(async () => { throw new Error('SERVER_BALANCE_CHANGED: synthetic rejection'); });
        const props = { authority: fullAuthority, allocations: draft().allocations, setAllocations: () => {}, onSuccess: () => assert.fail('Failure cannot refresh as success') };
        harness.render('NhisEntryForm', props);
        Object.assign(harness.slots, { 0: 'receipt', 1: 'SYNTH-ERROR', 2: 'Explicit remittance', 3: '2026-02-01', 4: '500000.00', 5: 'acc-1001' });
        harness.render('NhisEntryForm', props);
        await harness.submit();
        const html = renderToStaticMarkup(harness.render('NhisEntryForm', props));
        assert.match(html, /role="alert"[^>]*>SERVER_BALANCE_CHANGED: synthetic rejection/);
        assert.doesNotMatch(html, /alert-success/);
        const locked = formHarness(async () => assert.fail('Locked action must not post'));
        locked.render('NhisEntryForm', { ...props, begin: () => false });
        assert.match((await locked.submit()).error, /mutation is in progress/);
    });
