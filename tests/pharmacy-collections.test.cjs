const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const root=path.resolve(__dirname,'..');
function load(file,require,react){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.React}}).outputText,{exports,require,React:react,Error,window:{confirm:()=>true},setTimeout,clearTimeout});return exports;}
const helpers=load('lib/pharmacy/counterInvoice.ts',()=>{});
const nodes=value=>!value||typeof value!=='object'?[]:Array.isArray(value)?value.flatMap(nodes):[value,...(value.props?.children||[]).flatMap(nodes)];
const text=value=>value==null?'':typeof value!=='object'?String(value):Array.isArray(value)?value.map(text).join(''):text(value.props?.children);
const paid={id:'invoice-1',code:'DC20',invoice_number:'INV-DC20-00001',status:'paid',total:40,sale_id:'sale-1',saleStatus:'completed',outstandingAmount:0,attendant_name:'Attendant',details:{customerName:'Customer',lines:[{inventoryItemId:'drug',name:'Medicine',quantity:2,unitPrice:20,lineTotal:40,priceType:'retail'}]}};
function fixture({invoice=paid,role='pharmacist',pending=null,printError=false,collectError=false,fetchError=false,queueData,deferLookup=false}={}){
 const states=[],refs=[],deps=[],callbacks=[];let cursor=0,refCursor=0,effectCursor=0,callbackCursor=0,effects=[];
 const calls=[],prints=[],mutations=[];
 const lookups=[];
 const react={createElement:(type,props,...children)=>({type,props:{...props,children}}),
  useState(initial){const i=cursor++;if(!(i in states))states[i]=typeof initial==='function'?initial():initial;return [states[i],value=>states[i]=typeof value==='function'?value(states[i]):value];},
  useRef(initial){const i=refCursor++;return refs[i]||(refs[i]={current:initial});},
  useCallback(fn,values){const i=callbackCursor++;if(!callbacks[i]||values.some((value,j)=>value!==callbacks[i].values[j]))callbacks[i]={fn,values};return callbacks[i].fn;},
  useEffect(fn,values){const i=effectCursor++;if(!deps[i]||values?.some((value,j)=>value!==deps[i][j])){deps[i]=values;effects.push(fn);}}
 };
 const operation={pending,execute:async(endpoint,payload)=>{mutations.push({endpoint,payload});if(collectError)throw Error('Connection lost; retry original collection');operation.pending=null;invoice={...invoice,status:'collected'};return {success:true,data:invoice};}};
 const exported=load('app/pharmacy/components/InvoiceCollectionPanel.tsx',name=>{
  if(name==='react')return react;
  if(name==='next/link')return {__esModule:true,default:'Link'};
  if(name.endsWith('.module.css'))return {__esModule:true,default:new Proxy({},{get:(_,key)=>String(key)})};
  if(name.endsWith('counterInvoice'))return helpers;
  if(name.endsWith('customFetch'))return {customFetch:async endpoint=>{calls.push(endpoint);if(fetchError)return {success:false,error:{message:'Unable to load invoice'}};if(endpoint.includes('/uncollected?'))return {success:true,data:queueData||{invoices:[],total:0,page:1,count:25}};if(endpoint.startsWith('pharmacy/sales/'))return {success:true,data:{id:'sale-1',total:40}};if(deferLookup)return new Promise(resolve=>lookups.push(resolve));return {success:true,data:invoice};}};
  if(name.endsWith('/receipt'))return {printPharmacyReceipt:async(...args)=>{prints.push(args);if(printError)throw Error('Popup blocked');}};
  if(name.endsWith('PharmacyPaymentFields'))return {usePharmacyDocument:()=>operation};
  if(name.endsWith('PharmacyWorkspace'))return {styles:new Proxy({},{get:(_,key)=>String(key)}),money:value=>'GHS '+value,Message:'Message',Empty:'Empty',usePharmacyAccess:()=>({app:{user:{role,username:'Staff'},company:{name:'PLS'}},manager:role==='admin'})};
  throw Error(name);
 },react);
 const render=(props={})=>{cursor=0;refCursor=0;effectCursor=0;callbackCursor=0;effects=[];return exported.default(props);};
 const flush=async()=>{for(const effect of effects)effect();await new Promise(resolve=>setTimeout(resolve,0));};
 const strictReplay=()=>{const mounted=[...effects],cleanups=mounted.map(effect=>effect());for(const cleanup of cleanups)if(typeof cleanup==='function')cleanup();for(const effect of mounted)effect();};
 const lookup=async()=>{let view=render();nodes(view).find(node=>node.type==='input').props.onChange({target:{value:'INV-DC20-00001'}});view=render();nodes(view).find(node=>node.type==='form').props.onSubmit({preventDefault(){}});await new Promise(resolve=>setTimeout(resolve,0));return render();};
 return {render,flush,strictReplay,lookup,calls,prints,mutations,operation,lookups};
}
test('reference validation preserves full invoice number and rejects malformed input',()=>{
 assert.equal(helpers.counterInvoiceReference(' inv-dc20-00001 '),'INV-DC20-00001');
 assert.equal(helpers.counterInvoiceReference('dc20'),'DC20');
 assert.throws(()=>helpers.counterInvoiceReference('INV-DC20-bad'));
});
test('only paid, completed, zero-outstanding invoices are releasable',()=>{
 assert.equal(helpers.canCollectCounterInvoice(paid),true);
 for(const patch of [{status:'unpaid'},{status:'collected'},{saleStatus:'reversed'},{outstandingAmount:1},{outstandingAmount:null}])assert.equal(helpers.canCollectCounterInvoice({...paid,...patch}),false);
});
test('lookup displays saved medicine rows and uses the full reference',async()=>{
 const f=fixture(),view=await f.lookup();
 assert.equal(f.calls[0],'pharmacy/counter/lookup/INV-DC20-00001');
 assert.match(text(view),/Medicine/);assert.match(text(view),/Customer/);
 assert.ok(nodes(view).some(node=>node.type==='button'&&text(node)==='Confirm medication collection'));
});
test('automatic POS lookup survives Strict Mode cleanup/replay instead of staying stuck loading',async()=>{
 const f=fixture({deferLookup:true}),props={lookupRequest:{value:paid.invoice_number,key:1}};
 f.render(props);f.strictReplay();
 for(const resolve of f.lookups)resolve({success:true,data:paid});
 await new Promise(resolve=>setTimeout(resolve,0));
 const view=f.render(props);
 assert.match(text(view),/Medicine/);
 assert.equal(nodes(view).find(node=>node.type==='input').props.disabled,false);
});
test('a new invoice request wins even when an earlier search is still in flight',async()=>{
 const f=fixture({deferLookup:true}),first={lookupRequest:{value:'DC20',key:1}},second={lookupRequest:{value:'EF30',key:2}};
 f.render(first);await f.flush();
 f.render(second);await f.flush();
 assert.equal(f.lookups.length,2);
 f.lookups[1]({success:true,data:{...paid,code:'EF30',invoice_number:'INV-EF30-00002',details:{...paid.details,customerName:'Latest customer'}}});
 await new Promise(resolve=>setTimeout(resolve,0));
 f.lookups[0]({success:true,data:paid});await new Promise(resolve=>setTimeout(resolve,0));
 const view=f.render(second);assert.match(text(view),/Latest customer/);assert.doesNotMatch(text(view),/INV-DC20-00001/);
 assert.equal(nodes(view).find(node=>node.type==='input').props.disabled,false);
});
test('latest search failure does not restore older actionable invoice details',async()=>{
 const f=fixture({deferLookup:true});f.render({lookupRequest:{value:'DC20',key:1}});await f.flush();
 f.render({lookupRequest:{value:'ZZ99',key:2}});await f.flush();
 f.lookups[1]({success:false,error:{message:'No matching invoice'}});await new Promise(resolve=>setTimeout(resolve,0));
 f.lookups[0]({success:true,data:paid});await new Promise(resolve=>setTimeout(resolve,0));
 const view=f.render({lookupRequest:{value:'ZZ99',key:2}});
 assert.equal(nodes(view).find(node=>node.type==='Message').props.error,'No matching invoice');
 assert.ok(!nodes(view).some(node=>node.type==='button'&&text(node)==='Confirm medication collection'));
 assert.equal(nodes(view).find(node=>node.type==='input').props.disabled,false);
});
test('invalid lookup clears the previous invoice so stale medicines cannot be collected',async()=>{
 const f=fixture();let view=await f.lookup();
 nodes(view).find(node=>node.type==='input').props.onChange({target:{value:'wrong number'}});
 view=f.render();nodes(view).find(node=>node.type==='form').props.onSubmit({preventDefault(){}});
 view=f.render();assert.ok(!nodes(view).some(node=>node.type==='button'&&text(node)==='Confirm medication collection'));
});
test('POS panel reuses POS card, search and table styling instead of workspace layout',async()=>{
 const f=fixture();await f.lookup();const view=f.render({variant:'pos'});
 assert.equal(view.props.className,'collectionPanel');
 assert.ok(nodes(view).some(node=>node.type==='section'&&node.props.className==='collectionCard'));
 assert.ok(nodes(view).some(node=>node.type==='form'&&node.props.className==='collectionLookup'));
 assert.ok(nodes(view).some(node=>node.type==='table'&&node.props.className==='table'));
});
test('same search token is not reissued on parent rerenders but can be retried with a new key',async()=>{
 const f=fixture();f.render({lookupRequest:{value:'DC20',key:1}});await f.flush();
 f.render({lookupRequest:{value:'DC20',key:1}});await f.flush();
 assert.equal(f.calls.length,1);
 f.render({lookupRequest:{value:'DC20',key:2}});await f.flush();
 assert.equal(f.calls.length,2);
});
test('confirmation records handover once, reloads collected invoice and prints the saved sale',async()=>{
 const f=fixture();let view=await f.lookup();
 await nodes(view).find(node=>node.type==='button'&&text(node)==='Confirm medication collection').props.onClick();
 view=f.render();await new Promise(resolve=>setTimeout(resolve,0));view=f.render();
 assert.equal(f.mutations.length,1);assert.equal(f.mutations[0].endpoint,'pharmacy/counter/invoices/invoice-1/collect');
 assert.ok(!nodes(view).some(node=>text(node)==='Confirm medication collection'&&node.type==='button'));
 await nodes(view).find(node=>node.type==='button'&&text(node)==='Print collection receipt').props.onClick();await new Promise(resolve=>setTimeout(resolve,0));
 assert.equal(f.prints[0][0].collectionStatus,'collected');assert.equal(f.prints[0][0].counterCode,'DC20');
 assert.ok(f.calls.includes('pharmacy/sales/sale-1'));
});
test('unpaid, reversed and already-collected invoices cannot be confirmed',async()=>{
 for(const patch of [{status:'unpaid'},{saleStatus:'reversed'},{status:'collected'},{outstandingAmount:4}]){
  const f=fixture({invoice:{...paid,...patch}}),view=await f.lookup();
  assert.ok(!nodes(view).some(node=>node.type==='button'&&text(node)==='Confirm medication collection'));
 }
});
test('cashiers can view medicines but cannot confirm collection',async()=>{
 const f=fixture({role:'pharmacy_cashier'}),view=await f.lookup();
 assert.match(text(view),/must confirm collection/);
 assert.ok(!nodes(view).some(node=>node.type==='button'&&text(node)==='Confirm medication collection'));
});
test('pending collection locks lookup and retries only the saved request',async()=>{
 const f=fixture({pending:{endpoint:'saved-original',payload:{idempotencyKey:'original'}}});let view=f.render();
 assert.equal(nodes(view).find(node=>node.type==='input').props.disabled,true);
 await nodes(view).find(node=>node.type==='button'&&text(node)==='Retry original collection').props.onClick();await new Promise(resolve=>setTimeout(resolve,0));
 assert.equal(f.mutations[0].endpoint,'');assert.ok(f.calls.includes('pharmacy/counter/lookup/DC20'));
});
test('lookup and print failures stay explicit and printing never repeats collection',async()=>{
 const failed=fixture({fetchError:true}),failedView=await failed.lookup();
 assert.equal(nodes(failedView).find(node=>node.type==='Message').props.error,'Unable to load invoice');
 const f=fixture({invoice:{...paid,status:'collected'},printError:true});let view=await f.lookup();
 await nodes(view).find(node=>node.type==='button'&&text(node)==='Print collection receipt').props.onClick();await new Promise(resolve=>setTimeout(resolve,0));
 view=f.render();assert.match(nodes(view).find(node=>node.type==='Message').props.error,/Popup blocked.*Collection status is unchanged/);assert.equal(f.mutations.length,0);
});
test('queue exposes filters and server-backed pagination with blocked status',async()=>{
 const row={...paid,details:undefined,customerName:'Customer',itemCount:1,created_at:'2026-10-26',saleStatus:'reversed'};
 const f=fixture({queueData:{invoices:[row],total:30,page:1,count:25}});f.render({queue:true});await f.flush();await new Promise(resolve=>setTimeout(resolve,230));let view=f.render({queue:true});
 assert.match(text(view),/Blocked \/ review sale/);
 assert.ok(f.calls.some(endpoint=>endpoint.includes('status=paid&page=1&count=25')));
 nodes(view).find(node=>node.type==='button'&&text(node)==='Next').props.onClick();
 f.render({queue:true});await f.flush();await new Promise(resolve=>setTimeout(resolve,230));
 assert.ok(f.calls.some(endpoint=>endpoint.includes('page=2')));
});
