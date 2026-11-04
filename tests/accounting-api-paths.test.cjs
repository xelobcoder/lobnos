const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ts=require('typescript');
const root=path.resolve(__dirname,'..');
test('financial-day readiness uses the authenticated context and the requested ledger',async()=>{
 const calls=[];
 const invoke=async endpoint=>{calls.push(endpoint);return{status:'success'};};
 const {accountingApi}=compile('lib/accounting/accountingApi.ts',{require:()=>({customFetch:invoke}),URLSearchParams});
 await accountingApi.financialDayReadiness();
 await accountingApi.financialDayReadiness('pharmacy');
 assert.deepEqual(calls,['financial-day/readiness?ledger=facility','financial-day/readiness?ledger=pharmacy']);
});
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
test('cash-flow review forwards gross allocations and bank import sends the selected date format',async()=>{
 const calls=[];
 class Form { values={}; append(key,value){this.values[key]=value;} }
 const invoke=async(endpoint,method,body)=>{calls.push({endpoint,method,body});return{status:'success'};};
 const {accountingApi}=compile('lib/accounting/accountingApi.ts',{require:()=>({customPost:invoke,customFile:(endpoint,body)=>invoke(endpoint,'POST',body),customFetch:invoke}),URLSearchParams,FormData:Form});
 const allocations=[{category:'operating',inflow:100,outflow:100}];
 await accountingApi.classifyCashFlow(7,{allocations});
 await accountingApi.importBankExcel(2,{name:'statement.xlsx'},'DMY');
 assert.equal(calls[0].endpoint,'accounting/reports/cash-flow/7/classification');
 assert.deepEqual(calls[0].body,{allocations});
 assert.equal(calls[1].body.values.dateFormat,'DMY');
 assert.equal(calls[1].body.values.bankAccountId,'2');
});
test('daily-close approval and finalization forward explicit administrator audit intent',async()=>{
 const calls=[];
 const invoke=async(endpoint,method,body)=>{calls.push({endpoint,method,body});return{status:'success'};};
 const {accountingApi}=compile('lib/accounting/accountingApi.ts',{require:()=>({customPost:invoke,customFetch:invoke}),URLSearchParams});
 const payload={pin:'1234',expectedVersion:2,overrideSegregationOfDuties:true,overrideReason:'No independent reviewer is available today.'};
 await accountingApi.decideDailyClose(7,{...payload,decision:'approve'});
 await accountingApi.finalizeDailyClose(7,payload);
 assert.deepEqual(calls.map(call=>call.endpoint),['accounting/daily-closes/7/manager-decision','accounting/daily-closes/7/finalize']);
 assert.deepEqual(calls[0].body,{...payload,decision:'approve'});
 assert.deepEqual(calls[1].body,payload);
});
