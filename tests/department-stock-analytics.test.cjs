const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), ts = require('typescript');
const exportsFixture = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', 'lib', 'departmentStockAnalytics.ts'), 'utf8'), {
    compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020},
}).outputText, {exports: exportsFixture});
const build = (data,selected,range,now=Date.parse('2026-11-10T00:00:00Z')) => exportsFixture.buildDepartmentStockAnalytics(data,selected,range,now);
const range = {start: '2026-11-01', end: '2026-11-02'};
const gloves = {item_id: 'gloves', item_name: 'Gloves', unit: 'BOX', remaining: 14, in_transit: 100};
const requests = [
    {id: 'g', ...gloves, status: 'received', created_at: '2026-10-30T00:00:00Z', unreceived_quantity: 0},
    {id: 'other-unit', ...gloves, unit: 'PIECE', status: 'received', created_at: '2026-10-30T00:00:00Z'},
    {id: 'other-item', item_id: 'tubes', item_name: 'Tubes', unit: 'BOX', status: 'received', created_at: '2026-10-30T00:00:00Z'},
];
const event = (action, quantity, created_at, request_id = 'g', performed_by = 7) => ({action, quantity, created_at, request_id, performed_by, actor_name: `Staff ${performed_by}`});

test('periods are inclusive, previous period is equal length and item/unit boundaries are maintained', () => {
    const result = build({analytics: [gloves], requests, events: [
        event('consume', '2', '2026-10-30T00:00:00Z'),
        event('consume', 2, '2026-10-31T23:59:59Z'),
        event('consume', 4, '2026-11-01T00:00:00Z'),
        event('consume', 4, '2026-11-02T23:59:59Z'),
        event('consume', 50, '2026-11-03T00:00:00Z'),
        event('consume', 999, '2026-11-01T12:00:00Z', 'other-unit'),
        event('consume', 999, '2026-11-01T12:00:00Z', 'other-item'),
        event('consume', 999, '2026-11-01T12:00:00Z', 'unknown'),
    ]}, gloves, range);
    assert.equal(result.days, 2);
    assert.equal(result.current.consumed, 8);
    assert.equal(result.previous.consumed, 4);
    assert.equal(result.comparison.start, '2026-10-30');
    assert.equal(result.comparison.end, '2026-10-31');
    assert.equal(result.comparison.change, 100);
    assert.equal(result.dailyRate, 4);
    assert.equal(result.cover, 3.5);
    assert.equal(result.replenishment[0].status, 'Within 7 days');
    assert.equal(result.trend.length, 2);
});

test('loss includes transit loss, returns are excluded from depletion and staff are grouped by identity', () => {
    const result = build({requests, analytics: [gloves], events: [
        event('consume', 6, '2026-11-01T12:00:00Z'),
        event('wastage', 2, '2026-11-01T12:00:00Z'),
        event('loss', 1, '2026-11-01T12:00:00Z'),
        event('transit_loss', 1, '2026-11-01T12:00:00Z'),
        event('return', 10, '2026-11-01T12:00:00Z'),
        event('return_unreceived', 10, '2026-11-01T12:00:00Z', 'g', 8),
        event('receive', 30, '2026-11-01T12:00:00Z'),
    ]}, gloves, range);
    assert.equal(result.wastageRate, 20);
    assert.equal(result.lossRate, 20);
    assert.equal(result.current.returned, 20);
    assert.equal(result.current.received, 30);
    assert.equal(result.staff.length, 2);
    assert.equal(result.staff[0].movements, 6);
    assert.equal(result.staff[1].returned, 10);
});

test('fulfilment measures earliest stage completion, samples selected item and excludes invalid order', () => {
    const result = build({requests, events: [
        event('approve', 10, '2026-11-01T00:00:00Z'),
        event('issue', 10, '2026-11-01T12:00:00Z'),
        event('receive', 2, '2026-11-02T00:00:00Z'),
        event('receive', 8, '2026-11-02T12:00:00Z'),
        event('approve', 999, '2026-11-01T00:00:00Z', 'other-unit'),
    ]}, gloves, range);
    assert.deepEqual(Array.from(result.leadTimes, row => row.hours), [48, 12, 12]);
    assert.deepEqual(Array.from(result.leadTimes, row => row.samples), [1, 1, 1]);
    const invalid = build({requests, events: [event('issue', 5, '2026-10-31T00:00:00Z'), event('approve', 5, '2026-11-01T00:00:00Z')]}, gloves, range);
    assert.equal(invalid.leadTimes[1].samples, 0);
});

test('pipeline and aging use current request-line counts, with exact elapsed-day buckets', () => {
    const now = Date.parse('2026-11-10T00:00:00Z');
    const rows = [
        {id: 'a', status: 'requested', created_at: '2026-11-09T12:00:00Z'},
        {id: 'b', status: 'approved', created_at: '2026-11-09T00:00:00Z'},
        {id: 'c', status: 'issued', unreceived_quantity: 4, created_at: '2026-11-06T00:00:00Z'},
        {id: 'd', status: 'received', unreceived_quantity: 3, created_at: '2026-11-02T00:00:00Z'},
        {id: 'e', status: 'received', unreceived_quantity: 0, created_at: '2026-11-01T00:00:00Z'},
        {id: 'f', status: 'rejected', created_at: '2026-11-01T00:00:00Z'},
        {id: 'z', status: 'requested', created_at: 'bad'},
    ].map(row => ({...gloves, ...row}));
    const result = build({requests: rows}, gloves, range, now);
    assert.deepEqual(Array.from(result.pipeline, row => row.value), [2, 1, 1, 1, 1, 1]);
    assert.deepEqual(Array.from(result.ages, row => row.value), [1, 1, 1, 1]);
    assert.equal(result.unknownAges, 1);
});

test('no baseline is unavailable, empty and inverted periods do not generate NaN or false cover', () => {
    const result = build({analytics: [gloves], requests}, gloves, range);
    assert.equal(result.cover, null);
    assert.equal(result.wastageRate, null);
    assert.equal(result.lossRate, null);
    assert.equal(result.comparison.change, null);
    assert.equal(result.replenishment[0].status, 'No recorded usage');
    const empty = build({}, undefined, range);
    assert.equal(empty.replenishment.length, 0);
    for (const invalidRange of [{start: '', end: ''}, {start: range.end, end: range.start}, {start: '2026-02-30', end: '2026-03-10'}]) {
        const invalid = build({analytics: [gloves], requests}, gloves, invalidRange);
        assert.equal(invalid.validRange, false);
        assert.equal(invalid.comparison, null);
        assert.equal(invalid.cover, null);
    }
});

test('invalid records are surfaced, and cover warning uses exact seven-day threshold', () => {
    const result = build({analytics: [
        {...gloves, remaining: 7},
        {...gloves, item_id: 'tubes', item_name: 'Tubes', remaining: 7.01},
        {...gloves, item_id: 'empty', item_name: 'Empty', remaining: 0},
    ], requests, events: [
        event('consume', 2, '2026-11-01T12:00:00Z'),
        event('consume', 2, '2026-11-01T12:00:00Z', 'other-item'),
        event('consume', 2, 'bad'),
        event('consume', -1, '2026-11-01T12:00:00Z'),
        event('consume', 'bad', '2026-11-01T12:00:00Z'),
    ]}, gloves, range);
    assert.equal(result.excludedEvents, 3);
    assert.equal(result.replenishment.find(row => row.item_id === 'gloves').status, 'Within 7 days');
    assert.equal(result.replenishment.find(row => row.item_id === 'tubes').status, 'Above 7 days');
    assert.equal(result.replenishment.find(row => row.item_id === 'empty').status, 'No stock');
});

test('critical health detects invalid quantities and fractional reconciliation without floating-point false alarms',()=>{
 const items=[
  {...gloves,item_id:'fraction',remaining:.1,issued:.3,consumed:.2,in_transit:0},
  {...gloves,item_id:'difference',remaining:1,issued:2,in_transit:0},
  {...gloves,item_id:'negative',remaining:-1},
  {...gloves,item_id:'bad',remaining:'not-a-quantity'},
  {...gloves,item_id:'zero',remaining:0,issued:0,in_transit:0},
 ];
 const result=build({analytics:items},items[2],range);
 assert.equal(result.health.trackedItems,5);assert.equal(result.health.invalidItems,2);
 assert.equal(result.health.discrepancies,1);assert.equal(result.health.noStock,1);
 assert.equal(result.replenishment.find(row=>row.item_id==='fraction').difference,0);
 assert.equal(result.cover,null);assert.equal(result.depletionCover,null);
 assert.equal(result.exceptions[0].validSnapshot,false);
 assert.ok(result.exceptions.some(row=>row.item_id==='difference'&&row.signals.includes('Reconciliation difference')));
});
test('zero receipts do not complete receipt timing; turnaround includes median and 90th percentile',()=>{
 const result=build({requests,events:[
  event('issue',10,'2026-11-01T00:00:00Z'),
  event('receive',0,'2026-11-01T01:00:00Z'),
  event('receive',5,'2026-11-01T12:00:00Z'),
 ]},gloves,range);
 assert.equal(result.leadTimes[2].hours,12);assert.equal(result.leadTimes[2].median,12);assert.equal(result.leadTimes[2].p90,12);
 const noReceipt=build({requests,events:[event('issue',10,'2026-11-01T00:00:00Z'),event('receive',0,'2026-11-01T01:00:00Z')]},gloves,range);
 assert.equal(noReceipt.leadTimes[2].samples,0);
});
test('zero-usage days are retained and multi-year charts use monthly totals without truncating totals',()=>{
 const result=build({requests,events:[event('consume',4,'2026-11-01T00:00:00Z')]},gloves,range);
 assert.deepEqual(Array.from(result.trend,row=>row.consumed),[4,0]);
 assert.equal(result.trendUnit,'day');
 const long=build({requests,events:[event('consume',4,'2026-11-01T00:00:00Z')]},gloves,{start:'2025-01-01',end:'2026-11-02'});
 assert.equal(long.trendUnit,'month');assert.equal(long.trend.length,23);
 assert.equal(long.trend.reduce((total,row)=>total+row.consumed,0),4);
});
test('orphan and future-dated movement records are explicitly counted rather than attributed to another item',()=>{
 const result=build({requests,events:[event('consume',4,'2026-11-11T00:00:00Z'),event('consume',7,'2026-11-01T00:00:00Z','missing')]},gloves,range);
 assert.equal(result.excludedEvents,1);assert.equal(result.orphanEvents,1);
 assert.equal(result.current.consumed,0);assert.equal(result.hasUsage,false);
});
test('depletion cover includes wastage and losses but not returned stock',()=>{
 const item={...gloves,remaining:20,issued:40,in_transit:0};
 const result=build({analytics:[item],requests,events:[
  event('consume',10,'2026-11-01T00:00:00Z'),
  event('wastage',5,'2026-11-01T00:00:00Z'),
  event('loss',5,'2026-11-01T00:00:00Z'),
  event('return',100,'2026-11-01T00:00:00Z'),
 ]},item,range);
 assert.equal(result.cover,4);assert.equal(result.depletionCover,2);assert.equal(result.depletionRate,10);
});
