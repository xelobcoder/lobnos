const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const React = require('react');
// Tauri already brings jsdom; resolve it from its owner so pnpm's strict layout works too.
const { createRequire } = require('node:module');
const { JSDOM } = createRequire(require.resolve('tauri/package.json'))('jsdom');
const root = path.resolve(__dirname, '..');

function load(file, dependencies = {}, globals = {}) {
 const code = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
 }).outputText;
 const exports = {};
 const localRequire = name => Object.hasOwn(dependencies, name) ? dependencies[name] : require(name);
 new Function('exports', 'require', 'window', 'sessionStorage', code)(exports, localRequire, globals.window, globals.sessionStorage);
 return exports;
}

function storage() {
 const values = new Map();
 return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
}
const selections = load('lib/catalogAppointmentSelection.ts');
const data = load('lib/catalogAppointmentData.ts');

test('selection is saved only on explicit action, expires and never contains names or patient details', () => {
 const store = storage();
 assert.equal(selections.readCatalogSelection(store, 100000), null);
 assert.equal(selections.saveCatalogSelection(store, 'training-lab', [3, 5], 100000), true);
 const value = store.getItem(selections.CATALOG_APPOINTMENT_KEY);
 assert.deepEqual(JSON.parse(value), { slug: 'training-lab', itemIds: [3, 5], createdAt: 100000 });
 assert(!value.includes('patient'));
 assert.equal(selections.readCatalogSelection(store, 100000 + 15 * 60000 + 1), null);
 assert.equal(store.getItem(selections.CATALOG_APPOINTMENT_KEY), null);
});

test('bad, future, tampered, duplicate and blocked storage fail closed', () => {
 const store = storage();
 for (const value of [
  { slug: '../evil', itemIds: [1], createdAt: 10 },
  { slug: 'training-lab', itemIds: [1, 1], createdAt: 10 },
  { slug: 'training-lab', itemIds: [1], createdAt: 1000 },
  { slug: 'training-lab', itemIds: [1], createdAt: 10, patient: 'extra' },
 ]) {
  store.setItem(selections.CATALOG_APPOINTMENT_KEY, JSON.stringify(value));
  assert.equal(selections.readCatalogSelection(store, 20), null);
  assert.equal(store.getItem(selections.CATALOG_APPOINTMENT_KEY), null);
 }
 assert.equal(selections.saveCatalogSelection({ ...store, setItem: () => { throw Error('blocked'); } }, 'lab', [1]), false);
 assert.equal(selections.saveCatalogSelection(store, 'lab', []), false);
});

test('login uses only a fixed safe destination and cancel clears the selection', () => {
 const store = storage();
 assert.equal(selections.catalogLoginDestination(store), '/patientportal');
 assert.equal(selections.saveCatalogSelection(store, 'training-lab', [3]), true);
 assert.equal(selections.catalogLoginDestination(store), '/patientportal/catalog-request');
 assert.equal(selections.clearCatalogSelection({ ...store, removeItem: () => { throw Error('blocked'); } }), false);
 assert.equal(selections.clearCatalogSelection(store), true);
 assert.equal(selections.catalogLoginDestination(store), '/patientportal');
});

test('expiry removes the old tab selection but never removes a newer one', async () => {
 const store = storage();
 const old = { slug: 'lab', itemIds: [1], createdAt: Date.now() - 15 * 60000 - 1 };
 store.setItem(selections.CATALOG_APPOINTMENT_KEY, JSON.stringify(old));
 let expired = 0;
 selections.scheduleCatalogSelectionExpiry(store, old, () => expired++);
 await new Promise(resolve => setTimeout(resolve, 10));
 assert.equal(store.getItem(selections.CATALOG_APPOINTMENT_KEY), null);
 assert.equal(expired, 1);
 selections.saveCatalogSelection(store, 'lab', [2]);
 selections.scheduleCatalogSelectionExpiry(store, old, () => expired++);
 await new Promise(resolve => setTimeout(resolve, 10));
 assert.deepEqual(selections.readCatalogSelection(store).itemIds, [2]);
 assert.equal(expired, 1);
});

test('catalog is refetched and selected items must remain available, live and unchanged', () => {
 const selection = { slug: 'training-lab', itemIds: [3], createdAt: Date.now() };
 const catalog = { source: 'pls-live', facility: { slug: 'training-lab', name: 'Training lab' }, currency: 'GHS',
  tests: [{ id: 3, name: 'Service', price: 0, available: true, type: 'test' }] };
 const fresh = data.selectedLiveCatalog(catalog, selection);
 assert.equal(fresh.items[0].price, 0);
 assert.equal(data.pricesMatch(fresh, data.selectedLiveCatalog(catalog, selection)), true);
 assert.equal(data.pricesMatch(fresh, data.selectedLiveCatalog({ ...catalog, tests: [{ ...catalog.tests[0], price: 5 }] }, selection)), false);
 assert.throws(() => data.selectedLiveCatalog({ ...catalog, source: 'marketplace' }, selection));
 assert.throws(() => data.selectedLiveCatalog({ ...catalog, facility: { ...catalog.facility, slug: 'other' } }, selection));
 assert.throws(() => data.selectedLiveCatalog({ ...catalog, tests: [] }, selection));
 assert.throws(() => data.selectedLiveCatalog({ ...catalog, tests: [{ ...catalog.tests[0], available: false }] }, selection));
 assert.throws(() => data.selectedLiveCatalog({ ...catalog, tests: [catalog.tests[0], catalog.tests[0]] }, selection));
 assert.equal(data.todayInZone('Pacific/Kiritimati', new Date('2026-01-01T12:00:00Z')), '2026-01-02');
 assert.equal(data.plusCalendarDays('2026-01-31', 1), '2026-02-01');
});

test('live catalogs allow selection even if legacy bookingSupported is false; independent flow remains separate', async () => {
 const dom = new JSDOM('<div id="root"></div>', { url: 'https://example.test/' });
 const originalWindow = global.window, originalDocument = global.document, originalNavigator = global.navigator;
 global.window = dom.window; global.document = dom.window.document;
 Object.defineProperty(global, 'navigator', { value: dom.window.navigator, configurable: true });
 global.IS_REACT_ACT_ENVIRONMENT = true;
 const { createRoot } = require('react-dom/client');
 let destination = '';
 const browser = { sessionStorage: dom.window.sessionStorage, location: { assign: value => { destination = value; } } };
 const module = load('website/components/marketplace/MarketplaceCatalog.tsx', {
  './BookingRequestForm': { BookingRequestForm: () => React.createElement('span', null, 'Independent booking form') },
  '../../../lib/catalogAppointmentSelection': selections,
 }, { window: browser });
 const item = { id: 3, type: 'test', name: 'Service', description: null, price: 0,
  sampleRequirements: [], collectionMethods: ['in_facility'], available: true, turnaroundHours: null };
 const container = dom.window.document.getElementById('root');
 const app = createRoot(container);
 try {
  await React.act(async () => { app.render(React.createElement(module.MarketplaceCatalog, {
   slug: 'training-lab', items: [item], currency: 'GHS', source: 'pls-live', paymentInstructions: null, bookingSupported: false,
  })); });
  assert.match(container.textContent, /0\.00/);
  assert.equal(browser.sessionStorage.length, 0);
  const checkbox = container.querySelector('input[type=checkbox]');
  assert(checkbox);
  await React.act(async () => { checkbox.click(); });
  assert.equal(browser.sessionStorage.length, 0);
  const button = [...container.querySelectorAll('button')].find(item => item.textContent.includes('Continue to patient portal'));
  await React.act(async () => { button.click(); await new Promise(resolve => setTimeout(resolve, 0)); });
  assert.equal(destination, '/patientportal/catalog-request');
  assert.deepEqual(JSON.parse(browser.sessionStorage.getItem(selections.CATALOG_APPOINTMENT_KEY)).itemIds, [3]);
  assert(!destination.includes('3'));
  await React.act(async () => { app.render(React.createElement(module.MarketplaceCatalog, {
   slug: 'independent-lab', items: [item], currency: 'GHS', source: 'marketplace', paymentInstructions: null, bookingSupported: true,
  })); });
  assert.match(container.textContent, /Independent booking form/);
  assert.doesNotMatch(container.textContent, /Continue to patient portal/);
 } finally {
  await React.act(async () => app.unmount());
  dom.window.close();
  global.window = originalWindow; global.document = originalDocument;
  Object.defineProperty(global, 'navigator', { value: originalNavigator, configurable: true });
  delete global.IS_REACT_ACT_ENVIRONMENT;
 }
});

test('appointment page warns on wrong-facility sessions before permitting submission', async () => {
 const dom = new JSDOM('<div id="root"></div>', { url: 'https://example.test/' });
 const originalWindow = global.window, originalDocument = global.document, originalNavigator = global.navigator;
 global.window = dom.window; global.document = dom.window.document;
 Object.defineProperty(global, 'navigator', { value: dom.window.navigator, configurable: true });
 global.IS_REACT_ACT_ENVIRONMENT = true;
 const { createRoot } = require('react-dom/client');
 const store = dom.window.sessionStorage;
 selections.saveCatalogSelection(store, 'training-lab', [3]);
 let writes = 0;
 const catalog = { source: 'pls-live', facility: { slug: 'training-lab', name: 'Training lab' }, currency: 'GHS',
  tests: [{ id: 3, name: 'Service', price: 0, available: true, type: 'test' }] };
 const Form = props => React.createElement('form', props);
 Form.Label = props => React.createElement('label', props);
 Form.Control = props => React.createElement('input', props);
 Form.Select = props => React.createElement('select', props);
 Form.Check = props => React.createElement('input', { ...props, type: 'checkbox' });
 const module = load('app/patientportal/catalog-request/page.tsx', {
  'next/link': props => React.createElement('a', props),
  'next/navigation': { useRouter: () => ({ push: () => {} }) },
  'react-bootstrap': {
   Alert: ({ children }) => React.createElement('div', null, children),
   Button: props => React.createElement('button', props),
   Spinner: () => null, Form,
  },
  '../../../components/serverActions/backendRequest': { requestBackendJson: async (_endpoint, method) => {
   if (method === 'POST') writes++;
   return { status: 'error', statusCode: 404 };
  } },
  '../../../components/PatientPortal/SlotPicker': () => null,
  '../../../components/PatientPortal/portal.module.css': {},
  '../../../website/components/marketplace/client': { marketplaceRequest: async () => catalog },
  '../../../lib/catalogAppointmentData': data,
  '../../../lib/catalogAppointmentSelection': selections,
 }, { window: dom.window, sessionStorage: store });
 const container = dom.window.document.getElementById('root');
 const app = createRoot(container);
 try {
  await React.act(async () => {
   app.render(React.createElement(module.default));
   await new Promise(resolve => setTimeout(resolve, 10));
  });
  assert.match(container.textContent, /different facility/);
  assert.match(container.textContent, /Sign in to the selected facility/);
  assert.equal(writes, 0);
  assert(selections.readCatalogSelection(store));
 } finally {
  await React.act(async () => app.unmount());
  dom.window.close();
  global.window = originalWindow; global.document = originalDocument;
  Object.defineProperty(global, 'navigator', { value: originalNavigator, configurable: true });
  delete global.IS_REACT_ACT_ENVIRONMENT;
 }
});

test('appointment form rechecks the catalog, sends selected IDs only in the POST body, and clears on pending success', async () => {
   const dom = new JSDOM('<div id="root"></div>', { url: 'https://example.test/' });
   const originalWindow = global.window, originalDocument = global.document, originalNavigator = global.navigator;
   global.window = dom.window; global.document = dom.window.document;
   Object.defineProperty(global, 'navigator', { value: dom.window.navigator, configurable: true });
   global.IS_REACT_ACT_ENVIRONMENT = true;
   const { createRoot } = require('react-dom/client');
   const store = dom.window.sessionStorage;
   selections.saveCatalogSelection(store, 'training-lab', [3]);
   const catalog = { source: 'pls-live', facility: { slug: 'training-lab', name: 'Training lab' }, currency: 'GHS',
    tests: [{ id: 3, name: 'Service', price: 0, available: true, type: 'test' }] };
   let catalogCalls = 0;
   const calls = [];
   const Form = props => React.createElement('form', props);
   Form.Label = props => React.createElement('label', props);
   Form.Control = ({ as, ...props }) => React.createElement(as || 'input', props);
   Form.Select = props => React.createElement('select', props);
   Form.Check = ({ label, ...props }) => React.createElement('label', null, React.createElement('input', props), label);
   const module = load('app/patientportal/catalog-request/page.tsx', {
    'next/link': props => React.createElement('a', props),
    'next/navigation': { useRouter: () => ({ push: () => {} }) },
    'react-bootstrap': {
     Alert: ({ children }) => React.createElement('div', null, children),
     Button: props => React.createElement('button', props), Spinner: () => null, Form,
    },
    '../../../components/serverActions/backendRequest': { requestBackendJson: async (endpoint, method, body) => {
     calls.push({ endpoint, method, body });
     if (method === 'POST') return { status: 'success', data: { refid: 42, status: 'pending', timeZone: 'UTC' } };
     const date = new URLSearchParams(endpoint.split('?')[1]).get('date');
     return { status: 'success', data: { date, timeZone: 'UTC', slots: [{ time: '10:00', booked: 0, capacity: 1, available: true }] } };
    } },
    '../../../components/PatientPortal/SlotPicker': ({ slots, onChange }) =>
     slots ? React.createElement('button', { type: 'button', onClick: () => onChange('10:00') }, '10:00') : null,
    '../../../components/PatientPortal/portal.module.css': {},
    '../../../website/components/marketplace/client': { marketplaceRequest: async () => { catalogCalls++; return catalog; } },
    '../../../lib/catalogAppointmentData': data,
    '../../../lib/catalogAppointmentSelection': selections,
   }, { window: dom.window, sessionStorage: store });
   const container = dom.window.document.getElementById('root');
   const app = createRoot(container);
   const setValue = (element, value) => {
    const prototype = element.tagName === 'TEXTAREA' ? dom.window.HTMLTextAreaElement.prototype : dom.window.HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(prototype, 'value').set.call(element, value);
    element.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
    element.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
   };
   try {
    await React.act(async () => { app.render(React.createElement(module.default)); await new Promise(resolve => setTimeout(resolve, 10)); });
    assert.match(container.textContent, /Current published list prices/);
    const day = data.plusCalendarDays(new Date().toISOString().slice(0, 10), 2);
    await React.act(async () => { setValue(container.querySelector('#catalog-appointment-date'), day); await new Promise(resolve => setTimeout(resolve, 10)); });
    const slot = [...container.querySelectorAll('button')].find(button => button.textContent === '10:00');
    assert(slot);
    await React.act(async () => { slot.click(); });
    await React.act(async () => { setValue(container.querySelector('#catalog-appointment-reason'), 'Screening'); });
    await React.act(async () => { container.querySelector('#catalog-appointment-consent').click(); });
    await React.act(async () => { container.querySelector('form').dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true })); await new Promise(resolve => setTimeout(resolve, 10)); });
    const post = calls.find(call => call.method === 'POST');
    assert(post);
    assert.equal(catalogCalls, 2);
    assert.deepEqual(post.body, { date: day, time: '10:00', type: 'laboratory', reason: 'Screening', itemIds: [3], consent: true });
    assert(!calls.some(call => call.endpoint.includes('itemIds') || call.endpoint.includes('[3]')));
    assert.equal(store.getItem(selections.CATALOG_APPOINTMENT_KEY), null);
    assert.match(container.textContent, /pending review/i);
    assert.match(container.textContent, /not confirmed/i);
   } finally {
    await React.act(async () => app.unmount());
    dom.window.close();
    global.window = originalWindow; global.document = originalDocument;
    Object.defineProperty(global, 'navigator', { value: originalNavigator, configurable: true });
    delete global.IS_REACT_ACT_ENVIRONMENT;
   }
});
