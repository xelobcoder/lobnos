const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const routing=require('./helpers/workspace-destination.cjs');
const loadTransport=require('./helpers/backend-transport.cjs');
const root=path.join(__dirname,'..');
const source=ts.transpileModule(fs.readFileSync(path.join(root,'proxy.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const cases=[['super-admin','/settings/facilities'],['admin','/analytics'],['manager','/crm/overview'],['cashier','/billing/cash-collection'],['scientist','/operations/laboratory'],['phlebotomist','/operations/phelobotomy'],['customer service representative','/crm/overview'],['accountant','/accounting'],['storekeeper','/inventory'],['sonographer','/operations/imaging'],['head_of_laboratory','/operations/laboratory/requisitions'],['head_of_imaging','/operations/imaging/ultrasound/requisitions'],['marketer','/crm/acquisition'],['pharmacist','/pharmacy'],['pharmacy_cashier','/pharmacy/sell'],['pharmacy_manager','/pharmacy'],['pharmacy_accountant','/pharmacy/finance'],['pharmacy_storekeeper','/pharmacy/inventory'],['pharmacy_dispensary_officer','/pharmacy/prescriptions'],['doctor','/doctor'],['medical_officer','/doctor'],['consultant','/doctor'],['nurse','/doctor'],['pharmacy_doctor','/doctor'],['pharmacy_nurse','/doctor'],['clinician','/doctor'],['patient','/patientportal']];
function proxyFixture(role,tenantId,{status=200,moduleConfiguration}={}){
 const calls=[],exports={};
 const reply=location=>({location,headers:new Headers(),cookies:{delete(){}}});
 vm.runInNewContext(source,{exports,URL,Headers,TextEncoder,AbortSignal,console,process:{env:{NODE_ENV:'development',DEVELOPMENT_BASEURL:'https://backend.test/api/v1/',JWT_SECRET_KEY:'test'}},
 fetch:async(url,options)=>{calls.push({url:new URL(url),options});return {status,ok:status===200,json:async()=>({status:status===200,settings:{moduleConfiguration}})};},
 require(name){
  if(name==='next/server')return {NextResponse:{next:()=>reply(),redirect:url=>reply(url.pathname)}};
  if(name==='jose')return {jwtVerify:async()=>({payload:{user:{role,employeeid:4},tenantId}})};
  if(name.endsWith('serverBackendAccess'))return {getBackendAuthorization:()=>undefined,assertBackendTransport:loadTransport()};
  if(name.endsWith('roleNavigationPolicy'))return {roleWorkspace:r=>r,canAccessRolePage:()=>true,isMasterPlatformPath:()=>false};
  if(name.endsWith('workspaceDestination'))return routing;
  throw Error(name);
 }});
 const request={url:'https://app.test/authentications/login',nextUrl:{pathname:'/authentications/login'},cookies:{get:name=>({value:name==='PLS-SESSION'?'page-'+tenantId:'backend-'+tenantId})}};
 return {run:()=>exports.proxy(request),calls};
}
for(const tenantId of [397773,827461])for(const [role,target] of cases)test(`facility ${tenantId}: returning ${role} reaches the same task as fresh login`,async()=>{
 assert.equal(routing.loginDestination(role),target);
 const f=proxyFixture(role,tenantId);assert.equal((await f.run()).location,target);
 assert.equal(f.calls[0].url.searchParams.get('tenantId'),String(tenantId));
 assert.equal(f.calls[0].options.headers['pls-prime-tenant-session'],'backend-'+tenantId);
 assert.equal(f.calls[0].options.headers['pls-session'],'page-'+tenantId);
});
for(const role of ['admin','manager'])test(`${role} in pharmacy-only facility resumes an authorized destination from verified module configuration`,async()=>{
 const config={modules:{pharmacy:{enabled:true},laboratoryOperations:{enabled:false},imaging:{enabled:false}}};
 const expected=role==='admin'?'/pharmacy':'/account/roles';
 assert.equal(routing.loginDestination(role,config),expected);
 assert.equal((await proxyFixture(role,827461,{moduleConfiguration:config}).run()).location,expected);
});
test('unsafe returns never change the facility or grant platform access',()=>{
 for(const target of ['https://evil.test','//evil.test','/settings/facilities','/patient-portal-admin/../settings','/patient-portal-admin?tenantId=827461']){
  assert.equal(routing.loginDestination('admin',undefined,target),'/analytics');
  assert.equal(routing.loginDestination('scientist',undefined,target),'/operations/laboratory');
 }
 assert.equal(routing.loginDestination('unknown',{modules:{pharmacy:{enabled:true}}}),'/unauthorized');
});
for(const status of [401,403,503])test(`backend ${status} cannot redirect a stale/rejected browser session into a workspace`,async()=>{
 const f=proxyFixture('cashier',397773,{status});assert.equal((await f.run()).location,undefined);
});


test('all login destinations remain inside the existing role page policy',()=>{
 function loadPolicy(file){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports,require:name=>loadPolicy(path.relative(root,path.resolve(root,path.dirname(file),name))+'.ts')});return exports;}
 const policy=loadPolicy('lib/roleNavigationPolicy.ts');
 for(const [role] of cases)assert.equal(policy.canAccessRolePage(role,routing.loginDestination(role)),true,role);
 const pharmacyOnly={modules:{pharmacy:{enabled:true},laboratoryOperations:{enabled:false},imaging:{enabled:false}}};
 assert.equal(policy.canAccessRolePage('manager',routing.loginDestination('manager',pharmacyOnly)),true);
 assert.equal(policy.canAccessRolePage('admin','/settings/facilities'),false);
});
