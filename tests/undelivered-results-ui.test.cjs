const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const test=require('node:test');
const ts=require('typescript');
const React=require('react');
const source=fs.readFileSync(require('node:path').join(__dirname,'../components/operations/Laboratory/UndeliveredResultTable.jsx'),'utf8');
const code=ts.transpileModule(source,{fileName:'UndeliveredResultTable.jsx',compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true,allowJs:true}}).outputText;
const nodes=(tree,p)=>!tree||typeof tree!=='object'?[]:Array.isArray(tree)?tree.flatMap(n=>nodes(n,p)):[...(p(tree)?[tree]:[]),...nodes(tree.props?.children,p)];
const text=t=>t==null?'':typeof t!=='object'?String(t):Array.isArray(t)?t.map(text).join(''):text(t.props?.children);
function harness(){
 const states=[],effects=[],calls=[],opened=[];let cursor=0;
 const react={...React,useRef: value => ({current: value}),useCallback: callback => callback,useState(initial){const i=cursor++;if(!(i in states))states[i]=initial;return[states[i],next=>states[i]=typeof next==='function'?next(states[i]):next];},useMemo:fn=>fn(),useEffect(fn){const i=cursor++;if(!states[i]){states[i]=true;effects.push(fn);}}};
 const modal=Object.assign(()=>null,{Header:'modal-header',Title:'modal-title',Body:'modal-body',Footer:'modal-footer'});
 const form=Object.assign(()=>null,{Group:'form-group',Label:'form-label',Control:'form-control'});
 const data=[{ascensionid:11,billingid:21,patientid:31,firstname:'First',lastname:'Patient',fullpatientid:'P31',failurenotes:'A long delivery issue that should remain visible',requested_mode:'email'},{ascensionid:12,billingid:22,patientid:32,firstname:'Second',lastname:'Patient'}];
 const exports={};vm.runInNewContext(code,{exports,URLSearchParams,console,Set,window:{open:(...args)=>opened.push(args)},alert(){},require(name){if(name==='react')return react;if(name==='react/jsx-runtime')return require(name);if(name==='dayjs')return require(name);if(name==='react-bootstrap')return{Button:'button',Form:form,Modal:modal};if(name.includes('customFetch'))return{customFetch:async url=>{calls.push(new URL(url,'http://localhost').searchParams);return{records:{dataset:data,totalcount:2}};},customPost:async()=>({status:true})};if(name.includes('PrimeTable'))return'PrimeTable';if(name.includes('singleWorkFlow'))return'SingleDelivery';if(name.includes('bulkWorkFlow'))return'BulkDelivery';if(name.includes('DateFilterReusable'))return'DateFilter';if(name==='@remixicon/react')return new Proxy({},{get:(_,key)=>key});return{};}});
 return{calls,opened,render(){cursor=0;return exports.default({employeeid:5});},async flush(){effects.splice(0).forEach(fn=>fn());for(let i=0;i<20;i++)await Promise.resolve();}};
}
test('undelivered row actions visibly open delivery and issue dialogs for the correct record',async()=>{
 const h=harness();h.render();await h.flush();
 const table=nodes(h.render(),n=>n.type==='PrimeTable')[0];assert.equal(table.props.column.length,6);
 const row={original:table.props.data[0]};const actions=table.props.column.at(-1).Cell({row});
 assert.match(text(actions),/Record delivery/);assert.match(text(actions),/Record delivery issue/);assert.match(text(actions),/Open visit/);
 nodes(actions,n=>n.type==='button')[0].props.onClick();
 const dialog=nodes(h.render(),n=>n.type==='SingleDelivery')[0];assert.equal(dialog.props.item.ascensionid,11);assert.equal(dialog.props.employeeid,5);assert.equal(dialog.props.show,true);
 nodes(actions,n=>n.type==='button')[1].props.onClick();assert.ok(nodes(h.render(),n=>n.props?.show===true).length>=2);
 nodes(actions,n=>n.type==='button')[2].props.onClick();assert.match(h.opened[0][0],/billingid=21&patientid=31/);
});
test('bulk update uses selected records and page changes clear selection',async()=>{
 const h=harness();h.render();await h.flush();let table=nodes(h.render(),n=>n.type==='PrimeTable')[0];
 const select=table.props.column[0].Cell({row:{original:table.props.data[0]}});select.props.onChange();
 nodes(h.render(),n=>n.type==='button'&&text(n).includes('Update selected'))[0].props.onClick();
 const bulk=nodes(h.render(),n=>n.type==='BulkDelivery')[0];assert.equal(bulk.props.items.length,1);assert.equal(bulk.props.items[0].ascensionid,11);
 table=nodes(h.render(),n=>n.type==='PrimeTable')[0];await table.props.handleSeverSideProcessing({page:2,count:10});
 assert.equal(nodes(h.render(),n=>n.type==='button'&&text(n).includes('Update selected'))[0].props.disabled,true);
});
test('undelivered date filters remain on pagination requests',async()=>{
 const h=harness();h.render();await h.flush();
 await nodes(h.render(),n=>n.type==='DateFilter')[0].props.onDateRangeChange('2026-10-01','2026-10-25');
 await nodes(h.render(),n=>n.type==='PrimeTable')[0].props.handleSeverSideProcessing({page:3,count:20});
 assert.equal(h.calls.at(-1).get('startDate'),'2026-10-01');assert.equal(h.calls.at(-1).get('endDate'),'2026-10-25');assert.equal(h.calls.at(-1).get('page'),'3');
});

