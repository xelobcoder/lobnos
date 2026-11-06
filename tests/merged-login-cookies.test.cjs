const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),jose=require('jose');
const root=path.join(__dirname,'..');
const code=ts.transpileModule(fs.readFileSync(path.join(root,'app/api/auth/login/route.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const secret='test-only-merged-login-signing-key-32-chars';
function fixture(tenantId,role){
 const jar=new Map(),calls=[],exports={};
 vm.runInNewContext(code,{exports,URL,Headers,TextEncoder,Date,console:{error(){}},process:{env:{NODE_ENV:'production',PRODUCTION_BASEURL:'https://backend.test/api/v1/',JWT_SECRET_KEY:secret}},
 fetch:async(url,options)=>{
  calls.push({url:new URL(url),options});
  const accepted=new URL(url).searchParams.get('tenantId')===String(tenantId)&&options.headers['pls-prime-tenant-session']==='token-for-'+tenantId;
  return {ok:accepted,json:async()=>accepted?{status:true,user:{user:{role,employeeid:4,email:'staff@example.test'}},settings:{}}:{status:false,message:'Tenant mismatch'}};
 },
 require(name){
  if(name==='jose')return jose;
  if(name==='next/server')return {NextResponse:{json:(body,options={})=>({body,status:options.status||200})}};
  if(name==='next/headers')return {cookies:async()=>({set:(name,value,options)=>jar.set(name,{value,options})})};
  if(name.endsWith('sessionCookies'))return {secureSessionCookies:()=>true};
  if(name.endsWith('serverBackendAccess'))return {getBackendAuthorization:()=>undefined,assertBackendTransport:()=>{}};
  throw Error(name);
 }});
 return {jar,calls,post:body=>exports.POST({url:'https://app.test/api/auth/login',headers:new Headers(),json:async()=>body})};
}
for(const tenantId of [397773,827461])for(const role of ['admin','super-admin','manager','cashier','scientist','accountant','pharmacy_cashier','clinician','patient'])test(`signed ${role} cookie uses verified server identity for facility ${tenantId}`,async()=>{
 const f=fixture(tenantId,role);
 const result=await f.post({status:true,accessToken:'token-for-'+tenantId,tenantId,user:{role:'super-admin',employeeid:999},settings:{allowEverything:true}});
 assert.equal(result.status,200);
 const verified=await jose.jwtVerify(f.jar.get('PLS-SESSION').value,new TextEncoder().encode(secret));
 assert.equal(verified.payload.tenantId,tenantId);assert.equal(verified.payload.user.role,role);assert.equal(verified.payload.user.employeeid,4);
 assert.equal(verified.payload.settings.allowEverything,undefined);
 assert.equal(f.jar.get('PLS-SESSION').options.httpOnly,true);assert.equal(f.jar.get('PLS-SESSION').options.secure,true);assert.equal(f.jar.get('PLS-SESSION').options.sameSite,'lax');
});
for(const [tenantId,submittedTenant] of [[397773,827461],[827461,397773]])test(`facility ${tenantId} token cannot mint a session for ${submittedTenant}`,async()=>{
 const f=fixture(tenantId,'admin');const result=await f.post({status:true,accessToken:'token-for-'+tenantId,tenantId:submittedTenant,user:{role:'super-admin'}});
 assert.equal(result.status,401);assert.equal(f.jar.size,0);
});
test('unsupported backend role cannot mint staff or tenant cookies',async()=>{
 const f=fixture(397773,'unknown');const result=await f.post({status:true,accessToken:'token-for-397773',tenantId:397773});assert.equal(result.status,403);assert.equal(f.jar.size,0);
});
