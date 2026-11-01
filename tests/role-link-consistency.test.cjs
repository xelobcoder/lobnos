const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),test=require('node:test'),ts=require('typescript');
const root=path.resolve(__dirname,'..'),cache=new Map();
let sessionUser={role:'scientist',employeeid:7,branch:1};
function load(file){
 if(cache.has(file))return cache.get(file);
 const exports={};cache.set(file,exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.React}}).outputText,{
  exports,React:{createElement:()=>null},TextEncoder,URL,AbortSignal,console,
  process:{env:{NODE_ENV:'development',DEVELOPMENT_BASEURL:'https://backend.example.test/api/v1/',JWT_SECRET_KEY:'fixture'}},
  fetch:async()=>({ok:true,json:async()=>({success:true,employeeid:7,tenantId:2,branchid:1,can_manage:true,data:[{department:'laboratory',can_request:true},{department:'imaging',can_receive:true}]})}),
  require:name=>{
   if(name==='next/server'){const response=type=>({type,headers:new Headers(),cookies:{delete(){}}});return {NextResponse:{next:()=>response('next'),redirect:url=>({...response('redirect'),url:String(url)})}};}
   if(name==='jose')return {jwtVerify:async()=>({payload:{user:sessionUser,tenantId:2,settings}})};
   if(name.includes('serverBackendAccess'))return {getBackendAuthorization:()=>undefined};
   if(name==='@remixicon/react')return new Proxy({},{get:()=>()=>null});
   if(name==='react')return {createElement:()=>null};
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
for(const role of ['scientist','sonographer','phelobotomist','customer service representative','cashier','marketer','storekeeper','accountant','head_of_laboratory','head_of_imaging','doctor','nurse','pharmacy_manager','pharmacy_accountant','pharmacy_storekeeper','pharmacy_cashier','pharmacy_dispensary_officer','pharmacist']){
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
