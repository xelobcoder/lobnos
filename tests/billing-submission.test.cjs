const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const path = require('node:path');
function validator() {
 const calls=[]; const exports={};
 const compiled=ts.transpileModule(fs.readFileSync(path.join(__dirname,'../lib/Multi/multiBillingValidation.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 vm.runInNewContext(compiled,{exports,console,require(name){if(name.includes('customFetch'))return {customPost:async(url,method,data)=>{calls.push(data);return {status:true,billingid:1};}};if(name==='react-toastify')return {toast:{success(){}}};throw Error(name);}});
 return {submit:exports.MultiValidateAndSubmitBillingInformation,calls};
}
const base=()=>({billingSource:1,patientid:1,employeeid:1,branchid:1,cart:[{id:1,totalpayable:100}],servicesProvided:[],finalCart:[{id:1,totalpayable:100,paidamount:30}],amountPayable:100,actualAmountPayable:100,subtotal:100,totaldiscount:0,balance:0,paid:30,totalAmountIncurredDueTax:0,payments:[{mode:1,amount:30}]});
test('real submission validator accepts partial payments and forwards received amount',async()=>{const h=validator();assert.equal((await h.submit(base())).status,true);assert.equal(h.calls[0].paymentDetails.amount,30);assert.equal(h.calls[0].paid,30);});
test('free checkout reaches backend with explicit free intent and no cash payment',async()=>{const h=validator();assert.equal((await h.submit({...base(),paid:0,amountPayable:0,payments:[],paymentDetails:{mode:'free',amount:0}})).status,true);assert.equal(h.calls[0].paymentDetails.mode,'free');assert.equal(h.calls[0].payments.length,0);});
test('staff FOC submits benefit metadata without booking cash',async()=>{const h=validator();assert.equal((await h.submit({...base(),paid:0,payments:[],focStaffId:7,paymentDetails:{mode:'foc',focStaffId:7,amount:0}})).status,true);assert.equal(h.calls[0].focStaffId,7);assert.equal(h.calls[0].paid,0);assert.equal(h.calls[0].payments.length,0);});
test('overpayments and invalid payments return visible failures without posting',async()=>{const h=validator();for(const amount of [110,-1,NaN]){const result=await h.submit({...base(),paid:amount,payments:[{mode:1,amount}]});assert.equal(result.status,false);assert.ok(result.message);}assert.equal(h.calls.length,0);});
test('services-only bill keeps selected services when no payment is taken',async()=>{const h=validator();assert.equal((await h.submit({...base(),cart:[],finalCart:[],servicesProvided:[{keyid:9}],paid:0,payments:[]})).status,true);assert.equal(h.calls[0].servicesProvided[0].keyid,9);});
