const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const moment = require('moment');
const exportsForTest = {};
const compiled = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../lib/laboratoryPresentation.ts'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2020 },
});
vm.runInNewContext(compiled.outputText, { exports: exportsForTest, Date, require: name => {
    assert.equal(name, 'moment'); return moment;
} });
const { laboratoryDate, processingDates } = exportsForTest;
test('missing, malformed and bypassed dates never display Invalid date or invent timestamps', () => {
    for (const value of [null, undefined, '']) assert.equal(laboratoryDate(value), 'Not recorded');
    for (const value of [{}, false, '2026-99-99']) assert.equal(laboratoryDate(value), 'Unavailable');
    assert.equal(laboratoryDate('2026-11-06T12:30:00Z'), moment('2026-11-06T12:30:00Z').format('LLLL'));
    const bypass = processingDates({ workflow: { processing: 'bypassed' } });
    assert.equal(bypass.start, 'Bypassed by configuration'); assert.equal(bypass.end, null);
    assert.equal(processingDates({}, { byPassProcessing: 1 }).start, 'Bypassed by configuration');
    assert.equal(processingDates({ workflow: { processing: 'pending' } }, { byPassProcessing: 1 }).start, 'Not started');
    assert.equal(processingDates({}).start, 'Not started');
    assert.equal(processingDates({ processingStartDate: '2026-11-06T12:30:00Z' }).end, 'In progress');
    assert.equal(processingDates({ processingEndDate: '2026-11-06T12:30:00Z' }).start, 'Start not recorded');
});

test('the actual validation table renders safe dates and an explicit bypass label', () => {
    const React=require('react');const {renderToStaticMarkup}=require('react-dom/server');
    const Table=()=>null;const noop=()=>null;
    const output={};const file='../components/operations/Laboratory/AsensionValidationTable.jsx';
    const compiled=ts.transpileModule(fs.readFileSync(path.join(__dirname,file),'utf8'),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}});
    vm.runInNewContext(compiled.outputText,{exports:output,Set,Map,console,require:name=>{
        if(name==='react')return {...React,useState:initial=>[initial,noop]};
        if(name==='react/jsx-runtime')return require(name);
        if(name.endsWith('LaboratoryStagesContext'))return {useLaboratoryContext:()=>({isLoading:false,collection:[],queryParams:{},setCollection:noop})};
        if(name.endsWith('useApplicationContext'))return {useApplication:()=>({branchid:4,settings:{byPassProcessing:1}})};
        if(name==='react-responsive')return {useMediaQuery:()=>false};
        if(name==='next/navigation')return {useRouter:()=>({})};
        if(name.endsWith('laboratoryPresentation'))return exportsForTest;
        if(name.endsWith('/PrimeTable'))return {__esModule:true,default:Table};
        return new Proxy({__esModule:true,default:noop},{get:(target,key)=>key in target?target[key]:noop});
    }});
    const find=node=>!node||typeof node!=='object'?[]:Array.isArray(node)?node.flatMap(find):[...(node.type===Table?[node]:[]),...find(node.props?.children)];
    const table=find(output.default({employeeid:7}))[0];assert.ok(table);
    const row={original:{patientid:5,processingStartDate:null,processingEndDate:null,resultEntryStart:null,resultEntryEnd:null}};
    const markup=table.props.column.filter(column=>['Processing','Results'].includes(column.Header)).map(column=>renderToStaticMarkup(column.Cell({row}))).join('');
    assert.match(markup,/Bypassed by configuration/);assert.match(markup,/Not recorded/);assert.doesNotMatch(markup,/Invalid date/);
});
