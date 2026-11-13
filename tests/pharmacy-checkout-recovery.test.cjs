const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function fixture(hookName, responses, saved) {
  const storage = new Map();
  const slots = [];
  const calls = [];
  let cursor = 0;
  const key = hookName === 'usePharmacyDocument'
    ? 'pharmacy-document:counter-invoice:17:3:2'
    : 'pharmacy-checkout-v2:pos:17:3:2';
  if (saved) storage.set(key, JSON.stringify(saved));
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = initial;
      return [slots[index], value => { slots[index] = typeof value === 'function' ? value(slots[index]) : value; }];
    },
    useRef(initial) {
      const index = cursor++;
      return slots[index] ||= {current: initial};
    },
    useCallback(callback) { cursor++; return callback; },
    useEffect(effect) {
      const index = cursor++;
      if (!(index in slots)) { slots[index] = true; effect(); }
    },
  };
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../app/pharmacy/components/PharmacyPaymentFields.tsx'), 'utf8'), {
    compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX},
  }).outputText;
  vm.runInNewContext(code, {
    exports,
    crypto: {randomUUID: () => 'request-key-123456'},
    sessionStorage: {getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key)},
    window: {addEventListener() {}, removeEventListener() {}},
    require(name) {
      if (name === 'react') return react;
      if (name.includes('useApplicationContext')) return {useApplication: () => ({user: {tenantId: 17, employeeid: 3, branch: 2}})};
      if (name.includes('customFetch')) return {
        customFetch: async () => ({success: true, data: {day: {status: 'open'}, shift: {id: 'shift'}, routes: [{method: 'cash'}]}}),
        customFetchMutation: async (endpoint, method, payload) => {
          calls.push({endpoint, method, payload});
          const response = responses.shift();
          if (response instanceof Error) throw response;
          return response;
        },
      };
      return require(name);
    },
  });
  return {
    calls, storage, key,
    render() {cursor = 0; return exports[hookName](hookName === 'usePharmacyDocument' ? 'counter-invoice' : 'pos');},
  };
}

for (const hook of ['usePharmacyDocument', 'usePharmacyPayment']) {
  test(`${hook} releases a new request rejected by the financial-day gate`, async () => {
    const f = fixture(hook, [{success: false, error: {code: 'FINANCIAL_DAY_OVERDUE'}}]);
    f.render(); await new Promise(resolve => setImmediate(resolve));
    const response = await f.render().execute('pharmacy/sales', {expectedTotal: 85});
    assert.equal(response.error.code, 'FINANCIAL_DAY_OVERDUE');
    assert.equal(f.render().pending, null);
    assert.equal(f.storage.has(f.key), false);
  });

  test(`${hook} preserves an uncertain original request when a retry reaches the day gate`, async () => {
    const saved = {endpoint: 'pharmacy/sales', payload: {expectedTotal: 85, amountTendered: 100, idempotencyKey: 'original-key-12345'}};
    const f = fixture(hook, [{success: false, error: {code: 'FINANCIAL_DAY_OVERDUE'}}, {success: true}], saved);
    f.render(); await new Promise(resolve => setImmediate(resolve));
    await f.render().execute('pharmacy/changed', {expectedTotal: 999});
    assert.ok(f.render().pending);
    assert.equal(f.storage.has(f.key), true);
    assert.deepEqual(JSON.parse(JSON.stringify(f.calls[0])), {endpoint: saved.endpoint, method: 'POST', payload: saved.payload});
    await f.render().execute('pharmacy/changed', {expectedTotal: 999});
    assert.deepEqual(JSON.parse(JSON.stringify(f.calls[1].payload)), saved.payload);
    assert.equal(f.render().pending, null);
    assert.equal(f.storage.has(f.key), false);
  });
}

test('a lost payment response retains its request and retries with the same tender and key', async () => {
  const f = fixture('usePharmacyPayment', [new Error('Connection lost'), {success: true}]);
  f.render(); await new Promise(resolve => setImmediate(resolve));
  f.render().setAmount('100');
  await assert.rejects(f.render().execute('pharmacy/sales', {expectedTotal: 85}), /Connection lost/);
  assert.ok(f.render().pending);
  f.render().setAmount('200');
  await f.render().execute('pharmacy/sales', {expectedTotal: 999});
  assert.deepEqual(f.calls[1], f.calls[0]);
  assert.equal(f.calls[1].payload.amountTendered, 100);
  assert.equal(f.render().pending, null);
});
