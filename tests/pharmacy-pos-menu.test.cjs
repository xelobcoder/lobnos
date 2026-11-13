const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const root=path.resolve(__dirname,'..');
const nodes=value=>!value||typeof value!=='object'?[]:Array.isArray(value)?value.flatMap(nodes):[value,...(value.props?.children||[]).flatMap(nodes)];
function fixture(cart=[],stockAlerts=null){
 const state=[],effects=[],calls=[];let cursor=0,mounted=false;
 const react={createElement:(type,props,...children)=>({type,props:{...props,children}}),useEffect(effect){if(stockAlerts!==null&&!mounted)effects.push(effect);},useCallback:fn=>fn,useRef:value=>({current:value}),useState:initial=>{
  const index=cursor++;if(!(index in state))state[index]=index===0?'direct_checkout':index===6?cart:initial;
  return [state[index],value=>{state[index]=typeof value==='function'?value(state[index]):value;}];
 }};
 const Offcanvas=Object.assign(function Offcanvas(){},{Header:'DrawerHeader',Title:'DrawerTitle',Body:'DrawerBody'});
 const exports={};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,'app/pharmacy/sell/page.tsx'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.React}}).outputText,{exports,React:react,requestAnimationFrame:fn=>fn(),URLSearchParams,setTimeout:()=>1,clearTimeout(){},window:{location:{search:''},setInterval:()=>1,clearInterval(){},addEventListener(){},removeEventListener(){}},require:name=>{
  if(name==='react')return react;
  if(name==='react-bootstrap')return {Offcanvas};
  if(name==='next/link')return {__esModule:true,default:'Link'};
  if(name==='@remixicon/react')return {RiMenuLine:'MenuIcon',RiArrowRightSLine:'ArrowIcon'};
  if(name.endsWith('.module.css'))return {__esModule:true,default:new Proxy({},{get:(_,key)=>String(key)})};
  if(name.endsWith('useApplicationContext'))return {useApplication:()=>({user:{role:'admin'}})};
  if(name.endsWith('customFetch'))return {customFetch:async endpoint=>{
   calls.push(endpoint);
   if(endpoint.startsWith('pharmacy/stock?'))return {success:true,data:{items:stockAlerts,total:stockAlerts?.length||0}};
   if(endpoint==='pharmacy/counter/settings')return {success:true,data:{mode:'direct'}};
   if(endpoint==='pharmacy/credit/accounts')return {success:true,data:[]};
   return {success:true,data:{sales:[]}};
  }};
  if(name.endsWith('PharmacyPaymentFields'))return {__esModule:true,default:'PaymentFields',usePharmacyDocument:()=>({pending:null}),usePharmacyPayment:()=>({pending:null,setup:{},amount:'',setAmount(){}})};
  if(name.endsWith('InvoiceCollectionPanel'))return {__esModule:true,default:'InvoiceCollectionPanel'};
  if(name.endsWith('/receipt'))return {printPharmacyReceipt(){}};
  throw Error(name);
 }});
 return {Offcanvas,calls,flush:()=>new Promise(resolve=>setImmediate(resolve)),render:()=>{cursor=0;const view=exports.default();mounted=true;effects.splice(0).forEach(effect=>effect());return view;}};
}
test('POS heading and navigation are contained in a closed offcanvas rather than the checkout header',()=>{
 const f=fixture(),view=f.render(),all=nodes(view),drawer=all.find(node=>node.type===f.Offcanvas);
 assert.equal(drawer.props.show,false);assert.equal(drawer.props.placement,'end');
 assert.equal(drawer.props['aria-labelledby'],'pharmacy-pos-menu-title');
 const links=nodes(drawer).filter(node=>node.type==='Link');
 assert.deepEqual(links.map(node=>node.props.href),['/pharmacy/counter','/pharmacy/cashier','/pharmacy/prescriptions','/pharmacy/collections']);
 assert.ok(nodes(drawer).some(node=>node.type==='DrawerTitle'&&node.props.as==='h2'));
 assert.equal(all.filter(node=>node.type==='header'&&node.props['aria-label']==='Point of sale tools').length,1);
 assert.ok(all.some(node=>node.type==='form'&&node.props.id==='pharmacy-checkout'));
});
test('menu opens, dismisses and closes on navigation without removing the checkout form',()=>{
 const f=fixture();let view=f.render();
 nodes(view).find(node=>node.props?.['aria-label']==='Open POS menu').props.onClick();
 view=f.render();let drawer=nodes(view).find(node=>node.type===f.Offcanvas);
 assert.equal(drawer.props.show,true);
 assert.equal(nodes(view).find(node=>node.props?.['aria-label']==='Open POS menu').props['aria-expanded'],true);
 nodes(drawer).find(node=>node.type==='Link').props.onClick();
 view=f.render();drawer=nodes(view).find(node=>node.type===f.Offcanvas);
 assert.equal(drawer.props.show,false);assert.ok(nodes(view).some(node=>node.type==='form'));
 nodes(view).find(node=>node.props?.['aria-label']==='Open POS menu').props.onClick();
 view=f.render();nodes(view).find(node=>node.type===f.Offcanvas).props.onHide();
 assert.equal(nodes(f.render()).find(node=>node.type===f.Offcanvas).props.show,false);
});
test('POS invoice lookup opens a separate collection drawer without replacing the live basket',()=>{
 const f=fixture([{inventoryItemId:'next-customer',name:'Next customer medicine',sku:'NEXT',salePrice:10,quantity:3,availableStock:20}]);let view=f.render();
 const checkout=nodes(view).find(node=>node.type==='form'&&node.props.id==='pharmacy-checkout');
 nodes(view).find(node=>node.props?.id==='pos-collection-invoice').props.onChange({target:{value:'INV-DC20-00001'}});
 view=f.render();nodes(view).find(node=>node.type==='form'&&node.props.className==='collectionSearch').props.onSubmit({preventDefault(){}});
 view=f.render();const drawer=nodes(view).find(node=>node.type===f.Offcanvas&&node.props['aria-labelledby']==='pos-collection-title');
 assert.equal(drawer.props.show,true);
 assert.equal(nodes(drawer).find(node=>node.type==='InvoiceCollectionPanel').props.lookupRequest.value,'INV-DC20-00001');
 assert.equal(nodes(drawer).find(node=>node.type==='InvoiceCollectionPanel').props.variant,'pos');
 assert.equal(nodes(view).find(node=>node.type==='form'&&node.props.id==='pharmacy-checkout').props.id,checkout.props.id);
 assert.ok(nodes(view).some(node=>node.props?.children?.includes('Next customer medicine')));
 assert.ok(nodes(view).some(node=>node.type==='input'&&node.props.value===3));
 nodes(drawer).find(node=>node.type==='InvoiceCollectionPanel').props.onBusyChange(true);
 view=f.render();nodes(view).find(node=>node.type===f.Offcanvas&&node.props['aria-labelledby']==='pos-collection-title').props.onHide();
 assert.equal(nodes(f.render()).find(node=>node.type===f.Offcanvas&&node.props['aria-labelledby']==='pos-collection-title').props.show,true);
});


test('invoice drawer opens for review, preserves basket quantities and returns to search without submitting',()=>{
 const f=fixture([{inventoryItemId:'drug',name:'Medicine',sku:'D',salePrice:10,quantity:2,availableStock:20}]);
 let view=f.render();
 let drawer=nodes(view).find(node=>node.type===f.Offcanvas&&node.props['aria-labelledby']==='pos-invoice-title');
 assert.equal(drawer.props.show,false);
 const review=nodes(view).find(node=>node.type==='button'&&node.props.children.includes('Review invoice '));
 assert.equal(review.props.type,'button');review.props.onClick();
 view=f.render();drawer=nodes(view).find(node=>node.type===f.Offcanvas&&node.props['aria-labelledby']==='pos-invoice-title');
 assert.equal(drawer.props.show,true);
 assert.ok(nodes(drawer).some(node=>node.type==='form'&&node.props.id==='pharmacy-checkout'));
 assert.ok(nodes(view).some(node=>node.type==='input'&&node.props.value===2&&node.props.form==='pharmacy-checkout'));
 drawer.props.onHide();view=f.render();
 assert.equal(nodes(view).find(node=>node.type===f.Offcanvas&&node.props['aria-labelledby']==='pos-invoice-title').props.show,false);
 assert.ok(nodes(view).some(node=>node.type==='input'&&node.props.value===2));
});


test('low-stock notices load quantities, pause motion and preserve the current basket',async()=>{
 const cart=[{inventoryItemId:'basket-drug',name:'Basket medicine',sku:'B',salePrice:10,quantity:2,availableStock:20}];
 const f=fixture(cart,[{inventoryItemId:'low-drug',name:'Low stock medicine',availableStock:1,minimumStock:2,unit:'tablets'}]);
 f.render();await f.flush();let view=f.render();
 assert.ok(f.calls.includes('pharmacy/stock?filter=low&count=100'));
 const alerts=nodes(view).find(node=>node.props?.['aria-label']==='Low stock medicines');
 assert.ok(nodes(alerts).some(node=>node.type==='b'&&node.props.children.includes('Low stock medicine')));
 assert.ok(nodes(alerts).some(node=>node.type==='span'&&node.props.children.includes(1)&&node.props.children.includes(2)));
 assert.ok(nodes(alerts).some(node=>node.props?.['aria-hidden']===true));
 nodes(alerts).find(node=>node.props?.['aria-label']==='Pause low stock notices').props.onClick();
 view=f.render();
 assert.ok(nodes(view).some(node=>String(node.props?.className).includes('stockPaused')));
 assert.ok(nodes(view).some(node=>node.props?.['aria-label']==='Resume low stock notices'));
 assert.ok(nodes(view).some(node=>node.type==='input'&&node.props.value===2));
});
