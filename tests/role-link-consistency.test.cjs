const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),test=require('node:test'),ts=require('typescript');
const root=path.resolve(__dirname,'..'),cache=new Map();
let sessionUser={role:'scientist',employeeid:7,branch:1};
let stockAccessQuery=null;
function load(file){
 if(cache.has(file))return cache.get(file);
 const exports={};cache.set(file,exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.React}}).outputText,{
  exports,React:{createElement:(type,props,...children)=>({type,props:{...props,children}})},TextEncoder,URL,AbortSignal,console,
  process:{env:{NODE_ENV:'development',DEVELOPMENT_BASEURL:'https://backend.example.test/api/v1/',JWT_SECRET_KEY:'fixture'}},
  fetch:async()=>({ok:true,json:async()=>({success:true,employeeid:7,tenantId:2,branchid:1,can_manage:true,data:[{department:'laboratory',can_request:true},{department:'imaging',can_receive:true}]})}),
  require:name=>{
   if(name.endsWith('.module.css'))return {default:new Proxy({},{get:(_,key)=>String(key)}),__esModule:true};
   if(name==='next/server'){const response=type=>({type,headers:new Headers(),cookies:{delete(){}}});return {NextResponse:{next:()=>response('next'),redirect:url=>({...response('redirect'),url:String(url)})}};}
   if(name==='jose')return {jwtVerify:async()=>({payload:{user:sessionUser,tenantId:2,settings}})};
   if(name==='next/link')return {default:'Link',__esModule:true};
   if(name==='next/navigation')return {useSearchParams:()=>({get:()=>stockAccessQuery})};
   if(name.endsWith('/useApplicationContext'))return {useApplicationSettings:()=>({applicationsettings:{user:sessionUser,settings:{}}})};
   if(name.includes('serverBackendAccess'))return {getBackendAuthorization:()=>undefined};
   if(name==='@remixicon/react')return new Proxy({},{get:()=>()=>null});
   if(name==='react')return {createElement:(type,props,...children)=>({type,props:{...props,children}})};
   if(!name.startsWith('.'))throw Error('Unexpected dependency '+name);
   const base=path.resolve(path.dirname(file),name);
   const resolved=['.ts','.tsx','.js'].map(ext=>base+ext).find(fs.existsSync);
   if(!resolved)throw Error('Missing '+base);
   return load(resolved);
  }
 });return exports;
}
const policy=load(path.join(root,'lib/roleNavigationPolicy.ts'));
const sidebars=load(path.join(root,'components/Layout/links/RoleSidebars.tsx'));
const settings={allowScientistToRegisterClient:1,departmentStock:['laboratory','imaging'],testPanelsManagement:true};
const {proxy}=load(path.join(root,'proxy.ts'));
function flatten(items){return items.flatMap(item=>[...(item.link?[item.link]:[]),...flatten(item.children||[])]);}
function pageExists(href){const directory=path.join(root,'app',href.split(/[?#]/)[0]);return ['page.tsx','page.jsx','page.js'].some(file=>fs.existsSync(path.join(directory,file)));}
for(const role of ['scientist','labscientist','sonographer','phelobotomist','phlebotomist','customer service representative','crm','frontdesk','cashier','billing','marketer','storekeeper','accountant','head_of_laboratory','head_of_imaging','doctor','medical_officer','consultant','nurse','nursing','pharmacy_doctor','pharmacy_nurse','pharmacy_manager','pharmacy_accountant','pharmacy_storekeeper','pharmacy_cashier','pharmacy_dispensary_officer','pharmacist']){
 test(role+' exposes only accessible, existing workspace links',async()=>{
  sessionUser={role,employeeid:7,branch:1};
  const links=flatten(sidebars.filterRoleSidebar(sidebars.roleSidebarSource(role,[]),role,settings));
  assert.ok(links.length>0);
  for(const href of links){assert.equal(policy.canAccessRolePage(role,href,settings),true,href);assert.ok(pageExists(href),role+' links to missing page '+href);}
  const shortcuts=sidebars.roleSidebarQuickLinks(role,[],settings);
  for(const item of shortcuts){assert.equal(policy.canAccessRolePage(role,item.href,settings),true);assert.ok(pageExists(item.href),item.href);}
  for(const href of new Set([...links,...shortcuts.map(item=>item.href)])){
   const result=await proxy({url:'https://app.example.test'+href,nextUrl:{pathname:href},cookies:{get:()=>({value:'fixture-token'})}});
   if(href==='/billing/expenses'&&['admin','manager','accountant'].includes(role)){
    assert.equal(result.type,'redirect');
    assert.ok(result.url.endsWith('/billing/expenses/expenselist'));
   }else assert.equal(result.type,'next',role+' proxy rejects visible link '+href);
  }
 });
}
test('laboratory panel entry is shown only with explicit permission',()=>{
 const panel='/operations/laboratory/test-panels/testlist';
 assert.equal(policy.canAccessRolePage('scientist',panel),false);
 assert.equal(policy.canAccessRolePage('scientist',panel,settings),true);
 assert.equal(policy.canAccessRolePage('sonographer',panel,settings),false);
 const without=flatten(sidebars.filterRoleSidebar(sidebars.roleSidebarSource('scientist',[]),'scientist',{}));
 assert.ok(!without.includes(panel));
 assert.ok(flatten(sidebars.filterRoleSidebar(sidebars.roleSidebarSource('scientist',[]),'scientist',settings)).includes(panel));
});
test('imaging sidebars exclude laboratory supplies and panels even with both grants and panel authority',()=>{
 const supplied=[
  {title:'Imaging requisitions',link:'/operations/imaging/ultrasound/requisitions'},
  {title:'Clinical management',link:'',children:[
   {title:'Laboratory supplies',link:'/operations/laboratory/requisitions'},
   {title:'Manage test panels',link:'/operations/laboratory/test-panels/testlist'},
   {title:'Settings panels',link:'/settings/applicationsettings/testpanels/testlist'},
  ]},
 ];
 for(const role of ['sonographer','head_of_imaging','admin','super_admin','manager']){
  for(const workspace of ['/operations/imaging','/operations/imaging/ultrasound/requisitions']){
   const links=flatten(sidebars.roleWorkspaceSidebar(role,supplied,settings,workspace));
   assert.equal(links.includes('/operations/imaging/ultrasound/requisitions'),policy.canAccessRolePage(role,'/operations/imaging/ultrasound/requisitions',settings),role);
   assert.ok(!links.some(href=>href.includes('/laboratory/')||href.includes('/testpanels/')),role);
   for(const href of ['/operations/laboratory/requisitions','/operations/laboratory/test-panels/testlist','/settings/applicationsettings/testpanels/testlist']){
    if(['sonographer','head_of_imaging'].includes(role))assert.equal(policy.canAccessRolePage(role,href,settings),false);
   }
  }
 }
});
test('laboratory sidebars retain delegated panels and their own supplies but never imaging supplies',()=>{
 for(const role of ['scientist','labscientist','head_of_laboratory','admin','super_admin']){
  const links=flatten(sidebars.roleWorkspaceSidebar(role,[
   {title:'Imaging supplies',link:'/operations/imaging/ultrasound/requisitions'},
  ],settings,'/operations/laboratory/test-panels/testlist'));
  assert.ok(links.includes('/operations/laboratory/requisitions'),role);
  assert.ok(links.includes('/operations/laboratory/test-panels/testlist'),role);
  assert.ok(!links.some(href=>href.startsWith('/operations/imaging')),role);
  assert.equal(links.filter(href=>href==='/operations/laboratory/test-panels/testlist').length,1);
 }
});
test('department sidebar scoping leaves administrator application switching and oversight intact',()=>{
 for(const workspace of ['', '/inventory/department-stock']){
  const links=flatten(sidebars.roleWorkspaceSidebar('admin',[],settings,workspace));
  assert.ok(links.includes('/operations/laboratory/requisitions'));
  assert.ok(links.includes('/operations/imaging/ultrasound/requisitions'));
  assert.ok(links.includes('/operations/laboratory/test-panels/testlist'));
 }
 const layout=fs.readFileSync(path.join(root,'components/Layout/PrimeLayout.tsx'),'utf8');
 assert.match(layout,/roleWorkspaceSidebar\(user\?\.role,suppliedLinks,navigationSettings,modulePath/);
 assert.match(layout,/RibbonNavigation links=\{visibleLinks\}/);
});
test('imaging landing exists and stock navigation stays visible before a grant is configured',()=>{
 assert.ok(pageExists('/operations/imaging'));
 const {workspaceDestination}=load(path.join(root,'lib/workspaceDestination.ts'));
 assert.equal(workspaceDestination('sonographer'),'/operations/imaging');
 assert.ok(pageExists(workspaceDestination('sonographer')));
 for(const role of ['sonographer','head_of_imaging']){
  const links=flatten(sidebars.filterRoleSidebar(sidebars.roleSidebarSource(role,[]),role,{}));
  assert.ok(links.includes('/operations/imaging'));
  assert.ok(links.includes('/operations/imaging/ultrasound/requisitions'));
  assert.ok(!links.includes('/operations/laboratory/requisitions'));
 }
});
test('imaging landing renders requisitions and a clear missing-permission explanation',()=>{
 sessionUser={role:'sonographer',employeeid:7,branch:1};
 stockAccessQuery='required';
 const component=load(path.join(root,'app/operations/imaging/page.tsx')).default;
 const tree=component();
 const walk=value=>Array.isArray(value)?value.flatMap(walk):value&&typeof value==='object'?[value,...walk(value.props?.children||[])]:[];
 const nodes=walk(tree),links=nodes.filter(node=>node.type==='Link').map(node=>node.props.href);
 assert.ok(!links.includes('/operations/imaging'), 'landing cards should not link back to themselves');
 assert.ok(nodes.some(node=>node.type==='h1'&&node.props.children.includes('Imaging Operations')));
 assert.ok(nodes.some(node=>node.type==='nav'&&node.props['aria-label']==='Imaging workflows'));
 assert.ok(links.includes('/operations/imaging/ultrasound/requisitions'));
 assert.ok(links.includes('/operations/imaging/ultrasound'));
 assert.ok(!links.includes('/operations/laboratory/requisitions'));
 const alert=nodes.find(node=>node.props.role==='alert');
 assert.ok(alert);
 const text=value=>Array.isArray(value)?value.map(text).join(''):value&&typeof value==='object'?text(value.props?.children||[]):typeof value==='string'?value:'';
 assert.match(text(alert),/Imaging stock access has not been granted for your current branch/);
 assert.match(text(alert),/Staff permissions/);
 stockAccessQuery=null;
 assert.ok(!walk(component()).some(node=>node.props.role==='alert'));
});
test('test-panel navigation stays in the originating workspace',()=>{
 const {testPanelBasePath}=load(path.join(root,'lib/testPanelNavigation.ts'));
 assert.equal(testPanelBasePath('/operations/laboratory/test-panels/testlist/12'),'/operations/laboratory/test-panels');
 assert.equal(testPanelBasePath('/settings/applicationsettings/testpanels/testlist/12'),'/settings/applicationsettings/testpanels');
 for(const suffix of ['testlist','testlist/[id]','testlist/createcustomtest'])assert.ok(pageExists('/operations/laboratory/test-panels/'+suffix));
});
for(const role of ['admin','manager','super_admin'])test(role+' category navigation resolves and matches page guards',async()=>{
 sessionUser={role,employeeid:7,branch:1};
 const app=path.join(root,'app'),supplied=[];
 for(const relative of fs.readdirSync(app,{recursive:true}).filter(file=>/^layout\.(tsx|jsx|js)$/.test(path.basename(file)))){
  const file=path.join(app,relative),source=fs.readFileSync(file,'utf8');
  for(const match of source.matchAll(/import\s*\{([^}]+)\}\s*from\s*['"]([^'"]*\/categories\/[^'"]+)['"]/g)){
   const category=load(path.resolve(path.dirname(file),match[2])+'.tsx');
   for(const name of match[1].split(',').map(value=>value.trim().split(/\s+as\s+/)[0]))if(Array.isArray(category[name]))supplied.push(...category[name]);
  }
 }
 const links=new Set(flatten(sidebars.filterRoleSidebar(supplied,role,settings)));
 assert.ok(links.size>20);
 assert.deepEqual([...links].filter(href=>!pageExists(href)),[],role+' has stale category links');
 for(const href of links){
  assert.ok(pageExists(href),role+' links to missing page '+href);
  const result=await proxy({url:'https://app.example.test'+href,nextUrl:{pathname:href},cookies:{get:()=>({value:'fixture-token'})}});
  if(href==='/billing/expenses'&&role==='manager'){assert.equal(result.type,'redirect');assert.ok(result.url.endsWith('/billing/expenses/expenselist'));}
  else if(href.startsWith('/patientportal')){assert.equal(result.type,'redirect');assert.ok(result.url.endsWith('/patient-portal-admin'));}
  else assert.equal(result.type,'next',role+' proxy rejects '+href);
 }
});
