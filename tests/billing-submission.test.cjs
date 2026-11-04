const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const path = require('node:path');
function validator({post=async()=>({status:true,billingid:1}),storage}={}) {
 const calls=[]; const exports={};
 const identities={};
 const identityCode=ts.transpileModule(fs.readFileSync(path.join(__dirname,'../lib/billing/submissionIdentity.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;
 vm.runInNewContext(identityCode,{exports:identities,require,sessionStorage:storage});
 const compiled=ts.transpileModule(fs.readFileSync(path.join(__dirname,'../lib/Multi/multiBillingValidation.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 vm.runInNewContext(compiled,{exports,console:{log(){}},require(name){if(name.includes('submissionIdentity'))return identities;if(name.includes('customFetch'))return {customPost:async(url,method,data)=>{calls.push(data);return post(url,method,data);}};if(name==='react-toastify')return {toast:{success(){}}};throw Error(name);}});
 return {submit:exports.MultiValidateAndSubmitBillingInformation,calls};
}
const base=()=>({billingSource:1,patientid:1,employeeid:1,branchid:1,cart:[{id:1,totalpayable:100}],servicesProvided:[],finalCart:[{id:1,totalpayable:100,paidamount:30}],amountPayable:100,actualAmountPayable:100,subtotal:100,totaldiscount:0,balance:0,paid:30,totalAmountIncurredDueTax:0,payments:[{mode:1,amount:30}]});
test('real submission validator accepts partial payments and forwards received amount',async()=>{const h=validator();assert.equal((await h.submit(base())).status,true);assert.equal(h.calls[0].paymentDetails.amount,30);assert.equal(h.calls[0].paid,30);});
test('free checkout reaches backend with explicit free intent and no cash payment',async()=>{const h=validator();assert.equal((await h.submit({...base(),paid:0,amountPayable:0,payments:[],paymentDetails:{mode:'free',amount:0}})).status,true);assert.equal(h.calls[0].paymentDetails.mode,'free');assert.equal(h.calls[0].payments.length,0);});
test('staff FOC submits benefit metadata without booking cash',async()=>{const h=validator();assert.equal((await h.submit({...base(),paid:0,payments:[],focStaffId:7,paymentDetails:{mode:'foc',focStaffId:7,amount:0}})).status,true);assert.equal(h.calls[0].focStaffId,7);assert.equal(h.calls[0].paid,0);assert.equal(h.calls[0].payments.length,0);});
test('overpayments and invalid payments return visible failures without posting',async()=>{const h=validator();for(const amount of [110,-1,NaN]){const result=await h.submit({...base(),paid:amount,payments:[{mode:1,amount}]});assert.equal(result.status,false);assert.ok(result.message);}assert.equal(h.calls.length,0);});
test('services-only bill keeps selected services when no payment is taken',async()=>{const h=validator();assert.equal((await h.submit({...base(),cart:[],finalCart:[],servicesProvided:[{keyid:9}],paid:0,payments:[]})).status,true);assert.equal(h.calls[0].servicesProvided[0].keyid,9);});
test('ordinary submissions and additions retain the same retry key after network failure and remount',async()=>{
 const values=new Map(),storage={getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};
 const first=validator({storage,post:async()=>{throw Error('Network failed after posting');}});
 assert.equal((await first.submit(base())).status,false);assert.equal(values.size,1);
 const second=validator({storage});
 assert.equal((await second.submit(base())).status,true);
 assert.match(first.calls[0].request_key,/^[a-f0-9]{32}$/);
 assert.equal(second.calls[0].request_key,first.calls[0].request_key);assert.equal(values.size,0);
 await second.submit({...base(),isAdjustment:1,adjustmentType:'addition'},99);
 assert.ok(second.calls[1].request_key);assert.notEqual(second.calls[1].request_key,second.calls[0].request_key);
 assert.equal(second.calls[1].adjustmentType,'addition');
});
test('atomic conversion endpoints are not assigned ordinary submission identities',async()=>{
 const h=validator();await h.submit({...base(),billingRequestId:42});assert.equal(h.calls[0].request_key,undefined);
 await h.submit({...base(),appointmentId:9});assert.equal(h.calls[1].request_key,undefined);
});
test('unavailable browser retry storage blocks posting with actionable guidance',async()=>{
 const h=validator({storage:{getItem(){throw Error('Storage disabled');}}});
 const response=await h.submit(base());assert.equal(response.status,false);assert.match(response.message,/Allow browser session storage/);assert.equal(h.calls.length,0);
});
