const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');

const componentPath = path.join(__dirname, '..', 'components', 'inventory', 'DepartmentStockAnalytics.tsx');
const cssPath = path.join(__dirname, '..', 'components', 'inventory', 'InventoryAnalyticsCharts.module.css');
const styles = new Proxy({}, {get: (_, key) => String(key)});
const gloves = {item_id: 1, item_name: 'GLOVES', unit: 'BOX', consumed: 10, wastage: 10, loss: 0, returned: 0, issued: 20};

function render(analytics, selectedItem = '') {
  let stateIndex = 0;
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(componentPath, 'utf8'), {
    compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true},
  }).outputText, {
    exports,
    require(name) {
      if (name === 'react') return {
        ...React,
        useState: initial => [stateIndex++ === 0 ? selectedItem : typeof initial === 'function' ? initial() : initial, () => {}],
        useMemo: callback => callback(),
      };
      if (name.endsWith('.module.css')) return {__esModule: true, default: styles};
      if (name === 'recharts') return new Proxy({}, {get: () => () => null});
      if (name === './InventoryAnalyticsCharts') return {
        ChartCard: ({children}) => React.createElement('div', null, children),
        ChartEmpty: ({children}) => React.createElement('p', null, children),
      };
      if (name.includes('DateFilterReusable')) return {__esModule: true, default: () => null};
      return require(name);
    },
  });
  return renderToStaticMarkup(React.createElement(exports.default, {
    data: {analytics, requests: [], events: []}, department: 'laboratory', branchid: 1,
  }));
}

function movements(html) {
  return html.match(/<section[^>]*aria-label="Lifetime movements[^"]*"[^>]*>([\s\S]*?)<\/section>/)?.[1];
}

test('lifetime movement cards preserve all four quantities and explain the date scope', () => {
  const html = movements(render([gloves]));
  assert.ok(html);
  assert.match(html, /Lifetime movements for GLOVES/);
  assert.match(html, /regardless of the selected usage period/);
  assert.match(html, /All time/);
  assert.match(html, /<dl class="movementsGrid">/);
  assert.equal((html.match(/<dt>/g) || []).length, 4);
  assert.equal((html.match(/<strong>10<\/strong>/g) || []).length, 2);
  assert.equal((html.match(/<strong>0<\/strong>/g) || []).length, 2);
  assert.equal((html.match(/class="movementUnit">BOX<\/span>/g) || []).length, 4);
  for (const label of ['Consumed', 'Wastage', 'Loss / theft', 'Returned']) assert.ok(html.includes(label));
  assert.equal((html.match(/aria-hidden="true"/g) || []).length, 4);
  assert.match(html, /Includes transit losses/);
  assert.match(html, /Returned to stores/);
});

test('movement summary uses the selected item and unit, not a cross-item total', () => {
  const other = {...gloves, item_id: 2, item_name: 'TUBES', unit: 'PACK', consumed: 1234.5, wastage: 0, issued: 1234.5};
  const html = movements(render([gloves, other], '2:PACK'));
  assert.match(html, /Lifetime movements for TUBES/);
  assert.ok(html.includes(Number(1234.5).toLocaleString()));
  assert.equal((html.match(/class="movementUnit">PACK<\/span>/g) || []).length, 4);
  assert.doesNotMatch(html, /GLOVES|BOX/);
});

test('missing movement values still display zero and an empty dataset hides the section', () => {
  const html = movements(render([{item_id: 3, item_name: 'MASKS', unit: 'PIECE'}]));
  assert.equal((html.match(/<strong>0<\/strong>/g) || []).length, 4);
  assert.equal(movements(render([])), undefined);
});

test('movement layout has four desktop columns and collapses at tablet and mobile widths', () => {
  const css = fs.readFileSync(cssPath, 'utf8');
  assert.match(css, /\.movementsGrid\{[^}]*grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
  assert.match(css, /@media\(max-width:1050px\)\{\.movementsGrid\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css, /@media\(max-width:450px\)\{\.movementsGrid\{grid-template-columns:1fr/);
  assert.match(css, /font-variant-numeric:tabular-nums/);
  const source = fs.readFileSync(componentPath, 'utf8');
  for (const [, name] of source.matchAll(/styles\.(\w+)/g)) {
    assert.ok(css.includes(`.${name}{`), `Missing CSS module class: ${name}`);
  }
});
