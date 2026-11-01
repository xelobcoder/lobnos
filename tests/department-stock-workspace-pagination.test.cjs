const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),React=require('react');
const root=path.resolve(__dirname,'..');
function fixture({stores=false,basket=false}={}){
 const records=Array.from({length:26},(_,index)=>({id:`request-${index}`,item_id:`item-${index}`,item_name:`Item ${index}`,unit:'BOX',quantity:1,status:'received',remaining:1,received_quantity:1,unreceived_quantity:0}));
 const data={requests:records,events:records.map((row,index)=>({id:`event-${index}`,request_id:row.id,action:'consume',quantity:1,created_at:'2026-11-01T00:00:00Z',performed_by:index,actor_name:`Staff ${index}`})),access:records.map((row,index)=>({id:row.id,employeeid:index,employee_name:`Staff ${index}`})),analytics:[],can_request:true,can_receive:true,can_consume:true,can_manage_access:true};
 const state=[];let cursor=0,branch=1;const posts=[];
 const react={...React,useEffect(){},useRef:value=>({current:value}),useState:initial=>{
  const index=cursor++;
  if(!(index in state))state[index]=index===1?data:basket&&index===13?records.map(row=>({item_id:row.item_id,name:row.item_name,unit:'BOX',quantity:'1',reason:''})):typeof initial==='function'?initial():initial;
  return [state[index],value=>{state[index]=typeof value==='function'?value(state[index]):value;}];
 }};
 const Modal=()=>null;Modal.Header=Modal.Body=Modal.Footer=Modal.Title=()=>null;
 function load(file){
  const exports={};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,{
   exports,crypto:{randomUUID:()=> 'fixture-key'},
   require:name=>{
    if(name==='react')return react;
    if(name.endsWith('.module.css'))return {__esModule:true,default:new Proxy({},{get:(_,key)=>key})};
    if(name==='@remixicon/react')return new Proxy({},{get:()=>()=>null});
    if(name==='react-bootstrap')return {Modal};
    if(name==='react-select/async')return {__esModule:true,default:()=>null};
    if(name.endsWith('/StockTablePagination'))return load('components/inventory/StockTablePagination.tsx');
    if(name.endsWith('/DepartmentStockAnalytics'))return {__esModule:true,default:'Analytics'};
    if(name.endsWith('/customFetch'))return {customFetch:async()=>({success:true,data}),customPost:async(url,method,payload)=>{posts.push({url,method,payload});return {success:true};}};
    if(name.endsWith('/useApplicationContext'))return {useApplicationSettings:()=>({applicationsettings:{branchid:branch,user:{employeeid:7,role:stores?'admin':'sonographer'}}})};
    return require(name);
   },
  });return exports;
 }
 const component=load('components/inventory/DepartmentStockWorkspace.tsx').default;
 return {posts,render:()=>{cursor=0;return component({fixedDepartment:stores?undefined:'imaging'});},setBranch:value=>{branch=value;}};
}
function nodes(value){if(Array.isArray(value))return value.flatMap(nodes);return value&&typeof value==='object'?[value,...nodes(value.props?.children)]:[];}
function text(node){if(typeof node==='string')return node;if(Array.isArray(node))return node.map(text).join('');return node?.props?text(node.props.children):'';}
function control(tree,label){return nodes(tree).find(node=>node.props?.label===label&&node.props?.table);}
function countRows(tree){return nodes(tree).filter(node=>node.type==='tbody').map(body=>nodes(body.props.children).filter(node=>node.type==='tr').length);}
for(const [view,label,stores] of [['requests','Department requests',false],['history','Movement history',false],['access','Staff permissions',true]]){
 test(`${view} table pages through all records and resets on department context changes`,()=>{
  const f=fixture({stores});let tree=f.render();
  if(view!=='requests'){const title=view==='history'?'Movement history':'Staff permissions';nodes(tree).find(node=>node.type==='button'&&text(node)===title).props.onClick();tree=f.render();}
  assert.equal(countRows(tree).at(-1),10);
  let pager=control(tree,label);assert.equal(pager.props.table.total,26);
  pager.props.table.setPage(3);tree=f.render();assert.equal(countRows(tree).at(-1),6);
  if(view==='requests'){
   nodes(tree).find(node=>node.props?.['aria-label']==='Filter department requests').props.onChange({target:{value:'Item 25'}});
   tree=f.render();assert.equal(countRows(tree).at(-1),1);assert.equal(control(tree,label).props.table.page,1);
  }else{
   control(tree,label).props.table.setQuery('Staff 25');tree=f.render();assert.equal(countRows(tree).at(-1),1);assert.equal(control(tree,label).props.table.page,1);
  }
  f.setBranch(2);tree=f.render();assert.equal(control(tree,label).props.table.page,1);
 });
}
test('draft basket paging preserves edits and submits every page, not only the visible ten items',async()=>{
 const f=fixture({basket:true});let tree=f.render();assert.equal(control(tree,'Requisition basket').props.table.total,26);
 const input=nodes(tree).find(node=>node.props?.['aria-label']==='Quantity for Item 0');
 input.props.onChange({target:{value:'3'}});
 control(tree,'Requisition basket').props.table.setPage(3);tree=f.render();assert.equal(control(tree,'Requisition basket').props.table.rows.length,6);
 const send=nodes(tree).find(node=>node.type==='button'&&text(node)==='Send requisition');
 await send.props.onClick();
 assert.equal(f.posts.length,1);assert.equal(f.posts[0].payload.items.length,26);
 assert.equal(f.posts[0].payload.items[0].quantity,3);assert.equal(f.posts[0].payload.department,'imaging');
});
