const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const React=require('react'),root=path.resolve(__dirname,'..');
function fixture(){
 const states=[];let cursor=0;
 const react={...React,useState:initial=>{const index=cursor++;if(!(index in states))states[index]=initial;return [states[index],value=>{states[index]=typeof value==='function'?value(states[index]):value;}];}};
 const exports={};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,'components/inventory/StockTablePagination.tsx'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,{
  exports,require:name=>name==='react'?react:name.endsWith('.module.css')?{__esModule:true,default:new Proxy({},{get:(_,key)=>key})}:require(name),
 });
 return {api:exports,render:(rows,scope='lab',search=row=>row.name)=>{cursor=0;return exports.useStockTablePagination(rows,scope,search);}};
}
const rows=Array.from({length:26},(_,index)=>({id:index,name:`Item ${index}`}));
test('pagination bounds empty, first, last and out-of-range pages without losing records',()=>{
 const {stockTablePage:page}=fixture().api;
 assert.equal(page(rows,1,10).rows.length,10);
 assert.equal(page(rows,3,10).rows.length,6);
 assert.equal(page(rows,99,10).page,3);
 assert.equal(page(rows,-1,10).page,1);
 assert.deepEqual(Array.from([1,2,3].flatMap(index=>Array.from(page(rows,index,10).rows,row=>row.id))),rows.map(row=>row.id));
 const empty=page([],3,10);assert.equal(empty.start,0);assert.equal(empty.end,0);assert.equal(empty.page,1);assert.equal(empty.pages,1);
 assert.throws(()=>page(rows,1,0),/Invalid stock table pagination/);
});
test('search, page-size and scope changes reset to first page while preserving full source rows',()=>{
 const f=fixture();let table=f.render(rows);table.setPage(3);table=f.render(rows);assert.equal(table.page,3);
 table.setQuery('Item 2');table=f.render(rows);assert.equal(table.page,1);assert.equal(table.total,7);assert.equal(rows.length,26);
 table.setQuery('missing');table=f.render(rows);assert.equal(table.total,0);assert.equal(table.end,0);
 table.setQuery('');table.setSize(25);table=f.render(rows);assert.equal(table.page,1);assert.equal(table.rows.length,25);
 table.setPage(2);table=f.render(rows);assert.equal(table.rows.length,1);
 table=f.render(rows,'imaging');assert.equal(table.page,1);assert.equal(table.query,'');
});
test('shrinking a dataset clamps the page immediately and controls disable at boundaries',()=>{
 const f=fixture();let table=f.render(rows);table.setPage(3);table=f.render(rows.slice(0,12));assert.equal(table.page,2);assert.equal(table.rows.length,2);
 const {renderToStaticMarkup}=require('react-dom/server');
 const html=renderToStaticMarkup(React.createElement(f.api.default,{table,label:'Department items'}));
 assert.match(html,/11-12 of 12/);assert.match(html,/Page 2 of 2/);
 assert.match(html,/<button[^>]*disabled=""[^>]*>Next<\/button>/);
 assert.match(html,/aria-label="Department items pagination"/);
 assert.match(html,/aria-live="polite"/);
 table=f.render([]);
 const empty=renderToStaticMarkup(React.createElement(f.api.default,{table,label:'Department items'}));
 assert.equal((empty.match(/disabled=""/g)||[]).length,2);
});
test('every department stock table wires the shared pagination before rendering rows',()=>{
 const analytics=fs.readFileSync(path.join(root,'components/inventory/DepartmentStockAnalytics.tsx'),'utf8');
 for(const table of ['staffTable','coverTable','itemsTable','exceptionTable']){
  assert.ok(analytics.includes(`${table}.rows.map`),table);assert.ok(analytics.includes(`table={${table}}`),table);
 }
 const workspace=fs.readFileSync(path.join(root,'components/inventory/DepartmentStockWorkspace.tsx'),'utf8');
 for(const table of ['requestTable','basketTable','historyTable','accessTable']){
  assert.ok(workspace.includes(`${table}.rows.map`),table);assert.ok(workspace.includes(`table={${table}}`),table);
 }
 assert.match(workspace,/items:basket\.map/);
 assert.match(analytics,/buildDepartmentStockAnalytics\(data,selected,period\)/);
});
