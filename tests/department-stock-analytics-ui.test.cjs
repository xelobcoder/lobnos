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

function render(analytics, selectedItem = '', options = {}) {
  let stateIndex = 0;
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(componentPath, 'utf8'), {
    compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true},
  }).outputText, {
    exports,
    require(name) {
      if (name === 'react') return {
        ...React,
        useState: initial => {
          const index = stateIndex++;
          return [index === 0 ? selectedItem : index === 1 && options.preset ? options.preset : index === 2 && options.range ? options.range : typeof initial === 'function' ? initial() : initial, () => {}];
        },
        useMemo: callback => callback(),
      };
      if (name.endsWith('.module.css')) return {__esModule: true, default: styles};
      if (name === 'recharts') return new Proxy({}, {get: () => () => null});
      if (name === './InventoryAnalyticsCharts') return {
        ChartCard: ({children, title, caption}) => React.createElement('section', null, React.createElement('h2', null, title), React.createElement('p', null, caption), children),
        ChartEmpty: ({children}) => React.createElement('p', null, children),
      };
      if (name.includes('DateFilterReusable')) return {__esModule: true, default: () => null};
      if (name === './StockTablePagination') {
        const pagination = {};
        vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', 'components', 'inventory', 'StockTablePagination.tsx'), 'utf8'), {
          compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true},
        }).outputText, {exports: pagination, require: dependency => dependency.endsWith('.module.css') ? {__esModule:true,default:styles} : dependency==='react'?{...React,useState:initial=>[initial,()=>{}]}:require(dependency)});
        return pagination;
      }
      if (name.endsWith('/departmentStockAnalytics')) {
        const helper = {exports: {}};
        vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', 'lib', 'departmentStockAnalytics.ts'), 'utf8'), {
          compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020},
        }).outputText, {exports: helper.exports, Date: class extends Date {static now(){return Date.parse('2026-11-10T00:00:00Z');}}});
        return helper.exports;
      }
      return require(name);
    },
  });
  return renderToStaticMarkup(React.createElement(exports.default, {
    data: {analytics, requests: options.requests || [], events: options.events || []}, department: options.department || 'laboratory', branchid: 1,
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

test('expanded analytics explicitly label quantities, date scope and staff activity', () => {
  const html = render([gloves]);
  for (const label of ['Period efficiency and comparison', 'Fulfilment turnaround', 'Staff movement activity', 'Replenishment watch', 'Department request pipeline', 'Pending request age chart']) {
    assert.ok(html.includes(label), label);
  }
  assert.match(html, /equal-length previous period/);
  assert.match(html, /Returns are not depletion/);
  assert.match(html, /not a staff productivity ranking/);
  assert.match(html, /not a configured reorder level/);
});

test('all-time consumption uses the first record instead of a synthetic century-long daily average', () => {
  const html = render([gloves], '', {
    preset: 'All', range: {start: '1926-11-02', end: '2026-11-02'},
    requests: [{id: 'g', ...gloves, status: 'received', created_at: '2026-11-01T00:00:00Z'}],
    events: [{request_id: 'g', action: 'consume', quantity: 10, created_at: '2026-11-02T00:00:00Z'}],
  });
  assert.match(html, /2026-11-01 to 2026-11-02 \(from first departmental record\)/);
  assert.match(html, /5 BOX \/ day/);
});

test('imaging analytics retains its department label and invalid periods show an explicit error', () => {
  const html = render([gloves], '', {department: 'imaging', range: {start: '2026-11-02', end: '2026-11-01'}});
  assert.match(html, /Imaging stock analytics/);
  assert.match(html, /Period metrics are unavailable/);
  assert.doesNotMatch(html, /aria-label="Staff movement activity"/);
});

test('critical stats and analytics tables render bounded pages without restricting full-dataset counts',()=>{
  const analytics=Array.from({length:26},(_,index)=>({...gloves,item_id:index+1,item_name:`ITEM ${index}`,remaining:0}));
  const html=render(analytics);
  assert.match(html,/Critical department status/);assert.match(html,/Critical stock exceptions/);
  assert.match(html,/<strong>26<\/strong><span>Tracked item \/ units/);
  for(const label of ['Stock exceptions','Replenishment items','Departmental items','Staff movements']){
    assert.ok(html.includes(`aria-label="${label} pagination"`),label);
  }
  const body=html.match(/aria-label="All departmental item results"[^>]*><table[^>]*>[\s\S]*?<tbody>([\s\S]*?)<\/tbody>/)?.[1];
  assert.ok(body);assert.equal((body.match(/<tr/g)||[]).length,10);
  assert.ok(html.includes('1-10 of 26 / Page 1 of 3'));
});

test('invalid stock records are reported without NaN chart values or cover estimates',()=>{
  const html=render([{...gloves,remaining:'invalid'}]);
  assert.match(html,/Invalid stock totals were detected/);
  assert.doesNotMatch(html,/NaN|Infinity/);
  assert.doesNotMatch(html,/aria-label="Departmental usage trend"/);
});
