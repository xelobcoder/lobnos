const assert=require('node:assert/strict');
const test=require('node:test');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ts=require('typescript');
const React=require('react');
const root=path.join(__dirname,'..');
const nodes=(tree,p)=>!tree||typeof tree!=='object'?[]:Array.isArray(tree)?tree.flatMap(t=>nodes(t,p)):[...(p(tree)?[tree]:[]),...nodes(tree.props?.children,p)];
const text=t=>t==null?'':typeof t!=='object'?String(t):Array.isArray(t)?t.map(text).join(''):text(t.props?.children);
function harness(file,{fetch=async()=>[],draft=true,pricing}={}){
 let cursor=0,data={billingSource:1,testList:[{id:1,testid:1,name:'FBC',discountedValue:100}],cart:[],servicesProvided:[],amountPayable:100},entry={selected:null,selectedOutsource:null,organizations:[]};
 const states=[],deps=[],effects=[],cleanups=[],calls=[],listeners={};let focuses=0,modal=false;
 const react={...React,useContext:()=>({billingdata:data,setBillingData:next=>{data=typeof next==='function'?next(data):next;},recalculateTotalBill:next=>{calls.push(next);data=next;return pricing?.();}}),useState(initial){const i=cursor++;if(!(i in states))states[i]=typeof initial==='function'?initial():initial;return[states[i],value=>states[i]=typeof value==='function'?value(states[i]):value];},useRef(initial){const i=cursor++;if(!(i in states))states[i]={current:initial};return states[i];},useEffect(fn,next){const i=cursor++;if(!deps[i]||next.some((v,j)=>v!==deps[i][j])){deps[i]=next;effects.push(()=>{cleanups[i]?.();cleanups[i]=fn();});}}};
 const document={body:{},getElementById:()=>({focus(){focuses++;},scrollIntoView(){}}),querySelector:()=>modal?{}:null,addEventListener:(key,fn)=>listeners[key]=fn,removeEventListener:key=>delete listeners[key]};
 const source=ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{fileName:file,reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}});assert.deepEqual(source.diagnostics,[]);
 const exports={};vm.runInNewContext(source.outputText,{exports,document,console,require(name){if(name==='react')return react;if(name==='react/jsx-runtime')return require(name);if(name==='react-select')return 'Select';if(name.endsWith('.css'))return new Proxy({},{get:(_,k)=>k});if(name.includes('MultiBillingContext'))return{MultiBillingContext:{}};if(name.includes('useApplication'))return{useApplication:()=>({user:{role:'admin'},settings:{}})};if(name.includes('roles'))return{roleAllowed:()=>true};if(name.includes('billingLib'))return{hasPreviousRecords:()=>false};if(name.includes('customFetch'))return{customFetch:fetch,reactSelectCustomStyles:{},currencyFormatter:{format:v=>String(v)}};if(name==='@remixicon/react')return new Proxy({},{get:(_,k)=>k});return name;}});
 const Component=exports.default;
 return{calls,listeners,get data(){return data;},get draft(){return entry;},get focuses(){return focuses;},setModal(value){modal=value;},render(props={}){cursor=0;const tree=Component({portalMenu:true,...(draft?{entryDraft:entry,setEntryDraft:next=>entry=next(entry)}:{}),...props});for(const select of nodes(tree,n=>n.type==='Select'))if(select.props.ref)select.props.ref.current={focus(){focuses++;}};return tree;},flush(){while(effects.length)effects.shift()();},find(tree,label){const node=nodes(tree,n=>n.type==='button'&&text(n).startsWith(label))[0];assert.ok(node,label);return node;}};
}
const entryFile='components/Billing/Multi/MultiTrTable.tsx';
test('Modern keyboard add preserves pricing contract, clears controlled selection and returns search focus',()=>{
 const h=harness(entryFile);let tree=h.render();h.flush();
 nodes(tree,n=>n.type==='Select')[0].props.onChange(h.data.testList[0]);tree=h.render();
 let prevented=false;nodes(tree,n=>n.props?.onKeyDown)[0].props.onKeyDown({ctrlKey:true,key:'Enter',preventDefault(){prevented=true;}});
 assert.equal(prevented,true);assert.equal(h.calls.length,1);assert.equal(h.calls[0].cart[0].id,1);assert.equal(h.calls[0].cart[0].discountedValue,100);assert.equal(h.draft.selected,null);assert.ok(h.focuses>=2);
 tree=h.render();assert.equal(nodes(tree,n=>n.type==='Select')[0].props.value,null);assert.equal(h.find(tree,'Add test').props.disabled,true);
});
test('Modern blocks duplicate tests without repricing or announcing a successful addition',async()=>{
 const h=harness(entryFile);let tree=h.render();nodes(tree,n=>n.type==='Select')[0].props.onChange(h.data.testList[0]);tree=h.render();h.find(tree,'Add test').props.onClick();await Promise.resolve();
 tree=h.render();nodes(tree,n=>n.type==='Select')[0].props.onChange(h.data.testList[0]);tree=h.render();h.find(tree,'Add test').props.onClick();
 assert.equal(h.calls.length,1);assert.match(text(h.render()),/already on this bill/);
});
test('Outsourcing lookup does not block entry and stale organization responses are ignored',async()=>{
 let resolve;const h=harness(entryFile,{fetch:()=>new Promise(done=>resolve=done)});let tree=h.render();
 nodes(tree,n=>n.type==='Select')[0].props.onChange({id:2,testid:2,name:'Outsourced',isoutsourced:1});tree=h.render();assert.equal(h.find(tree,'Add test').props.disabled,false);
 nodes(tree,n=>n.type==='Select')[0].props.onChange(h.data.testList[0]);resolve([{outsourceid:77,name:'Wrong late organization'}]);await Promise.resolve();await Promise.resolve();
 tree=h.render();assert.equal(h.draft.selectedOutsource,null);assert.equal(h.draft.organizations.length,0);h.find(tree,'Add test').props.onClick();assert.equal(h.calls[0].cart[0].id,1);assert.equal(h.calls[0].cart[0].organization,undefined);
});
test('Modern resumes unfinished entry after remount using the presentation draft',()=>{
 const h=harness(entryFile);let tree=h.render();nodes(tree,n=>n.type==='Select')[0].props.onChange(h.data.testList[0]);tree=h.render();assert.equal(nodes(tree,n=>n.type==='Select')[0].props.value.id,1);assert.equal(h.calls.length,0);
});
test('Classic entry retains its original controls and add row',()=>{
 const h=harness(entryFile,{draft:false});const tree=h.render({portalMenu:false});assert.equal(nodes(tree,n=>n.type==='td').length,6);assert.equal(nodes(tree,n=>n.type==='Select')[0].props.inputId,undefined);assert.equal(nodes(tree,n=>n.props?.onKeyDown).length,0);
});
test('Modern rapid-entry guard prevents overlapping pricing requests',async()=>{
 let resolve;const h=harness(entryFile,{pricing:()=>new Promise(done=>resolve=done)});let tree=h.render();nodes(tree,n=>n.type==='Select')[0].props.onChange(h.data.testList[0]);tree=h.render();h.find(tree,'Add test').props.onClick();
 tree=h.render();nodes(tree,n=>n.type==='Select')[0].props.onChange({id:2,testid:2,name:'Malaria',discountedValue:20});tree=h.render();h.find(tree,'Add test').props.onClick();assert.equal(h.calls.length,1);
 resolve();await new Promise(done=>setImmediate(done));tree=h.render();h.find(tree,'Add test').props.onClick();assert.equal(h.calls.length,2);assert.equal(h.calls[1].cart.length,2);
});

const helperSource=ts.transpileModule(fs.readFileSync(path.join(root,'components/Billing/Modern/modernBilling.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const helpers={};vm.runInNewContext(helperSource,{exports:helpers});
test('Modern bulk request carries IDs and permitted options without catalogue prices',()=>{
 const data={patientid:101,billingSource:4,nhismembershipid:123,claimscheckcode:456,cart:[{id:10,testid:10,name:'FBC',price:100,organization:{outsourceid:9},userAdjustmentType:'discount',userAdjustedValue:5}],servicesProvided:[{keyid:20,serviceName:'Collection',servicePrice:15}],payments:[{mode:'cash',amount:100}]};
 const draft=helpers.draftFromBilling(data),request=helpers.previewRequest(data,draft);assert.equal(request.items.length,2);assert.equal(request.items[0].outsourceId,9);assert.equal(request.items[0].price,undefined);assert.equal(request.items[1].servicePrice,undefined);assert.equal(request.payments,undefined);assert.equal(request.context.nhisMembershipId,123);assert.equal(request.context.claimCheckCode,456);
});
test('Modern review is invalidated by item, payer, promotion and NHIS changes',()=>{
 const data={patientid:101,billingSource:1,cart:[{id:10,testid:10,name:'FBC'}],servicesProvided:[]};const draft=helpers.draftFromBilling(data),key=helpers.reviewKey(data,draft);
 for(const override of [{billingSource:2,entityId:7},{isPromo:true,promoCode:'OCT'},{nhismembershipid:123,claimscheckcode:456}])assert.notEqual(helpers.reviewKey({...data,...override},draft),key);
 assert.notEqual(helpers.reviewKey(data,{items:[]}),key);assert.equal(helpers.reviewKey({...data,additionalInfo:'Optional note'},draft),key);
});
test('Modern preview merge preserves catalogues and workflow context while clearing obsolete payments',()=>{
 const data={testList:[{id:10}],servicesList:[{keyid:20}],cart:[],servicesProvided:[],billingRequestId:8,isAdjustment:1,adjustmentType:'correction',payments:[{mode:'cash',amount:10}],paid:10};
 const result=helpers.mergePreview(data,{cart:[{id:10,testid:10}],servicesProvided:[],amountPayable:80});assert.equal(result.testList,data.testList);assert.equal(result.servicesList,data.servicesList);assert.equal(result.billingRequestId,8);assert.equal(result.adjustmentType,'correction');assert.equal(result.paid,0);assert.equal(result.balance,80);assert.equal(result.payments.length,0);
 assert.throws(()=>helpers.mergePreview(data,{cart:[],amountPayable:80}),/incomplete/);
});
test('Modern allows unassigned outsourcing and filters multiple search terms',()=>{
 const item={kind:'test',id:10,row:{name:'Full blood count',isoutsourced:1}};assert.equal(helpers.selectionIssue({}, {items:[item]}),null);assert.equal(helpers.selectionIssue({}, {items:[{...item,row:{...item.row,outsourceid:7}}]}),null);assert.equal(helpers.filterCatalogue([item],'blood full','test').length,1);assert.equal(helpers.filterCatalogue([item],'blood','service').length,0);
});
