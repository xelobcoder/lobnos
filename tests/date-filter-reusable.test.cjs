const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');

function component() {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../components/operations/Laboratory/ResuableFilter/DateFilterReusable.tsx'), 'utf8'), {
    compilerOptions: {module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true},
  }).outputText;
  vm.runInNewContext(code, {exports, require: name => name === 'react' ? {...React,useState:initial=>[initial,()=>{}]} : require(name)});
  return exports.default;
}
function find(element, predicate) {
  if (!element || typeof element !== 'object') return undefined;
  if (predicate(element)) return element;
  for (const child of React.Children.toArray(element.props?.children)) {
    const result = find(child,predicate);
    if (result) return result;
  }
}
test('controlled custom dates preserve the opposite bound when editing or choosing custom range', () => {
  const ranges=[], presets=[];
  const ui=component()({value:'Custom Range',startDate:'2026-10-01',endDate:'2026-10-31',onChange:value=>presets.push(value),onDateRangeChange:(...range)=>ranges.push(range)});
  const start=find(ui,el=>el.props?.['aria-label']==='Custom range start date');
  const end=find(ui,el=>el.props?.['aria-label']==='Custom range end date');
  assert.equal(start.props.value,'2026-10-01');assert.equal(end.props.value,'2026-10-31');
  start.props.onChange({target:{value:'2026-10-02'}});
  end.props.onChange({target:{value:'2026-10-30'}});
  find(ui,el=>el.type==='select').props.onChange({target:{value:'Custom Range'}});
  assert.deepEqual(ranges,[['2026-10-02','2026-10-31'],['2026-10-01','2026-10-30'],['2026-10-01','2026-10-31']]);
  assert.deepEqual(presets,['Custom Range']);
});
test('existing callers retain internal custom dates and preset callbacks', () => {
  const ranges=[];
  const ui=component()({value:'Custom Range',onChange:()=>{},onDateRangeChange:(...range)=>ranges.push(range)});
  const start=find(ui,el=>el.props?.['aria-label']==='Custom range start date');
  const end=find(ui,el=>el.props?.['aria-label']==='Custom range end date');
  assert.match(start.props.value,/^\d{4}-\d{2}-01$/);
  find(ui,el=>el.type==='select').props.onChange({target:{value:'Today'}});
  assert.deepEqual(ranges,[[end.props.value,end.props.value]]);
});
