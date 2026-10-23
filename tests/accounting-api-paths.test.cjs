const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ts=require('typescript');
const root=path.resolve(__dirname,'..');
function compile(file,context){const exports={};const source=ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;vm.runInNewContext(source,{exports,...context},{filename:file});return exports;}
for(const runtime of ['browser','server'])test(`accounting delegation mutations use one API prefix in the ${runtime}`,async()=>{
 const {buildApiUrl}=compile('lib/apiBaseUrl.ts',{URL,process:{env:{NODE_ENV:'development',DEVELOPMENT_BASEURL:'http://backend.test/api/v1/'}},...(runtime==='browser'?{window:{location:{origin:'http://frontend.test'}}}:{})});
 const calls=[];
 const invoke=async(endpoint,method,body)=>{calls.push({url:buildApiUrl(endpoint),method,body});return {status:'success'};};
 const {accountingApi}=compile('lib/accounting/accountingApi.ts',{require:()=>({customPost:invoke,customFile:invoke,customFetch:invoke}),URLSearchParams});
 const payload={employeeid:7,permission:'expense.pay',branchid:4,maxAmount:500};
 await accountingApi.grantDelegation(payload);
 await accountingApi.reviseDelegation(9,payload);
 await accountingApi.revokeDelegation(9);
 const origin=runtime==='browser'?'http://frontend.test':'http://backend.test';
 assert.deepEqual(calls.map(call=>call.url),[`${origin}/api/v1/accounting/authority/delegations`,`${origin}/api/v1/accounting/authority/delegations/9`,`${origin}/api/v1/accounting/authority/delegations/9`]);
 assert.deepEqual(calls.map(call=>call.method),['POST','PUT','DELETE']);
 assert.deepEqual(calls[0].body,payload);
});
