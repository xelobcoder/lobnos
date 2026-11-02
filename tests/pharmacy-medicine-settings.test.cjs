const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const root=path.resolve(__dirname,'..');
const nodes=value=>!value||typeof value!=='object'?[]:Array.isArray(value)?value.flatMap(nodes):[value,...(value.props?.children||[]).flatMap(nodes)];
const text=value=>value==null?'':typeof value!=='object'?String(value):Array.isArray(value)?value.map(text).join(''):text(value.props?.children);
function fixture(){
 const state=[];let cursor=0;
 let medicine={inventoryItemId:'drug',name:'Medicine',sku:'D',unit:'tablet',salePrice:5,wholesalePrice:3,minimumStock:1,availableStock:10,dispensableStock:10,requiresPrescription:true,batchTracking:true};
 const mutations=[];
 const react={createElement:(type,props,...children)=>({type,props:{...props,children}}),useEffect(){},useState(initial){const index=cursor++;if(!(index in state))state[index]=initial;return [state[index],value=>state[index]=typeof value==='function'?value(state[index]):value];}};
 const exported={};
 const FormData=class {constructor(values){this.values=values;}get(key){return this.values[key]??null;}has(key){return Object.hasOwn(this.values,key);}};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,'app/pharmacy/components/PharmacyInventoryWorkspace.tsx'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.React}}).outputText,{exports:exported,React:react,Error,FormData,require:name=>{
  if(name==='react')return react;
  if(name==='next/link')return {__esModule:true,default:'Link'};
  if(name==='next/navigation')return {useSearchParams:()=>({get:()=>null})};
  if(name.endsWith('customFetch'))return {customFetchMutation:async(endpoint,method,payload)=>{mutations.push({endpoint,method,payload});medicine={...medicine,requiresPrescription:payload.requiresPrescription,batchTracking:payload.batchTracking};return {success:true,data:{updated:true}};}};
  if(name.endsWith('PharmacyStockUpModal'))return {__esModule:true,default:'StockModal'};
  if(name.endsWith('PharmacyPaymentFields'))return {usePharmacyDocument:()=>({pending:null})};
  if(name.endsWith('PharmacyWorkspace'))return {styles:new Proxy({},{get:(_,key)=>String(key)}),money:String,dateLabel:String,Message:'Message',Empty:'Empty',Tabs:'Tabs',Modal:'Modal',MedicinePicker:'Picker',usePharmacyAccess:()=>({manager:true,stock:true}),usePharmacyResource:endpoint=>({loading:false,error:'',refresh:async()=>{},data:endpoint.startsWith('pharmacy/stock?')?{items:[medicine],total:1,totalPages:1,summary:{}}:[]})};
  throw Error(name);
 }});
 const render=()=>{cursor=0;return exported.default({view:'catalogue'});};
 const open=()=>{let view=render();nodes(view).find(node=>node.type==='button'&&text(node)==='View / manage').props.onClick();return render();};
 return {render,open,mutations};
}
test('unchecked prescription and batch settings are explicitly saved as false and remain cleared after reopening',async()=>{
 const f=fixture();let view=f.open(),modal=nodes(view).find(node=>node.type==='Modal');
 assert.equal(nodes(modal).find(node=>node.type==='input'&&node.props.name==='prescription').props.defaultChecked,true);
 const form=nodes(modal).find(node=>node.type==='form');
 await form.props.onSubmit({preventDefault(){},currentTarget:{price:'5',wholesale:'3',minimum:'1',pack:'',factor:'1'}});
 assert.equal(f.mutations.length,1);
 assert.equal(f.mutations[0].endpoint,'pharmacy/items/drug');assert.equal(f.mutations[0].method,'PUT');
 assert.equal(f.mutations[0].payload.requiresPrescription,false);assert.equal(f.mutations[0].payload.batchTracking,false);
 nodes(f.render()).find(node=>node.type==='Modal').props.onClose();
 view=f.open();modal=nodes(view).find(node=>node.type==='Modal');
 assert.equal(nodes(modal).find(node=>node.type==='input'&&node.props.name==='prescription').props.defaultChecked,false);
 assert.equal(nodes(modal).find(node=>node.type==='input'&&node.props.name==='batch').props.defaultChecked,false);
});
test('checked settings are saved as true without altering medicine pricing or pack data',async()=>{
 const f=fixture(),view=f.open(),form=nodes(nodes(view).find(node=>node.type==='Modal')).find(node=>node.type==='form');
 await form.props.onSubmit({preventDefault(){},currentTarget:{price:'5',wholesale:'3',minimum:'1',pack:'box',factor:'20',prescription:'on',batch:'on'}});
 const payload=f.mutations[0].payload;
 assert.equal(payload.requiresPrescription,true);assert.equal(payload.batchTracking,true);
 assert.equal(payload.salePrice,5);assert.equal(payload.wholesalePrice,3);assert.equal(payload.minimumStock,1);assert.equal(payload.purchaseUnit,'box');assert.equal(payload.unitsPerPurchaseUnit,20);
});
