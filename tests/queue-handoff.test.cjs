const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.join(__dirname, '..');
const plain = value => JSON.parse(JSON.stringify(value));
function helper(options = {}) {
    const calls = [];
    const exports = {};
    const output = ts.transpileModule(readFileSync(path.join(root, 'lib/queueHandoff.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } });
    const ticket = { id: 8, version: 4, status: 'serving', patientid: null, billingid: null, ...options.ticket };
    vm.runInNewContext(output.outputText, { exports, URLSearchParams, Date, Number, Error, require: name => name.endsWith('/walkInQueue') ? { queueData: response => { if (response.status !== 'success') throw new Error(response.message); return response.data; } } : {
        customFetch: async endpoint => { calls.push(['GET', endpoint]); if (options.offline) throw new Error('Queue is unavailable'); return { status: 'success', data: { tickets: options.missing ? [] : [ticket] } }; },
        customFetchMutation: async (endpoint, method, body) => { calls.push([method, endpoint, plain(body)]); return options.conflict ? { status: 'error', message: 'Ticket was changed. Refresh it.' } : { status: 'success', data: { ticket: { ...ticket, ...body } } }; },
    } });
    return { ...exports, calls };
}
const handoff = { ticketId: 8, date: '2030-01-02' };
test('handoff URLs preserve only validated queue identity and existing billing query values', () => {
    const api = helper();
    assert.deepEqual(plain(api.parseQueueHandoff(new URLSearchParams('queueTicket=8&queueDate=2030-01-02'))), handoff);
    for (const value of ['queueTicket=-1', 'queueTicket=1e2', 'queueTicket=8&queueDate=2030-02-31', 'queueTicket=8&queueDate=9999-99-99']) assert.equal(api.parseQueueHandoff(new URLSearchParams(value)), null);
    const url = api.withQueueHandoff('/billing/patientid/encrypted/multi?billingid=20&adjustmentReason=A%26B', handoff, true);
    const query = new URLSearchParams(url.split('?')[1]);
    assert.equal(query.get('billingid'), '20'); assert.equal(query.get('adjustmentReason'), 'A&B'); assert.equal(query.get('queueTicket'), '8'); assert.equal(query.get('queueDate'), '2030-01-02'); assert.equal(query.get('queueLinkPending'), '1');
    assert.equal(query.has('name'), false); assert.equal(query.has('phone'), false);
});
test('saved records link using a freshly loaded ticket version and explicit patient/bill identity', async () => {
    const api = helper();
    assert.equal((await api.linkSavedRecordToQueue(handoff, { patientid: 77, billingid: 120 })).warning, '');
    assert.deepEqual(api.calls, [['GET', 'queue/tickets?date=2030-01-02'], ['PATCH', 'queue/tickets/8', { expectedVersion: 4, patientid: 77, billingid: 120 }]]);
});
test('retries for an already-linked saved record do not mutate the ticket again', async () => {
    const api = helper({ ticket: { patientid: 77, billingid: 120, status: 'completed' } });
    assert.equal((await api.linkSavedRecordToQueue(handoff, { patientid: 77, billingid: 120 })).warning, '');
    assert.equal(api.calls.length, 1);
});
test('queue failures return follow-up warnings without rejecting the saved operation', async () => {
    for (const options of [{ offline: true }, { missing: true }, { conflict: true }, { ticket: { patientid: 99 } }, { ticket: { billingid: 99 } }, { ticket: { status: 'cancelled' } }]) {
        const api = helper(options);
        const result = await api.linkSavedRecordToQueue(handoff, { patientid: 77, billingid: 120 });
        assert.match(result.warning, /record was saved/); assert.match(result.warning, /Do not save the record again/);
        if (options.ticket) assert.equal(api.calls.filter(call => call[0] === 'PATCH').length, 0);
    }
});
test('normal registration and billing without a queue ticket make no queue requests', async () => {
    const api = helper(); assert.equal((await api.linkSavedRecordToQueue(null, { patientid: 77 })).warning, ''); assert.equal(api.calls.length, 0);
});
