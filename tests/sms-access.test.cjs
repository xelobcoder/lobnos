const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),test=require('node:test'),ts=require('typescript');
const root=path.resolve(__dirname,'..');
function load(file){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports,require:name=>name.startsWith('.')?load(path.resolve(path.dirname(file),name)+'.ts'):require(name)});return exports;}
const {smsCapabilities}=load(path.join(root,'lib/sms.ts')),{canAccessRolePage}=load(path.join(root,'lib/roleNavigationPolicy.ts'));
for(const role of ['admin','super_admin','manager','customer service representative','frontdesk'])test(role+' can reach the SMS pages matching operational capabilities',()=>{
 assert.equal(smsCapabilities(role).read,true);assert.equal(smsCapabilities(role).send,true);assert.equal(canAccessRolePage(role,'/communications/sms/jobs'),true);assert.equal(canAccessRolePage(role,'/communications/sms/jobs/recipients/1'),true);
});
for(const role of ['cashier','scientist','accountant','marketer','patient','clinician','pharmacist'])test(role+' does not acquire campaign privileges',()=>{assert.equal(smsCapabilities(role).send,false);assert.equal(canAccessRolePage(role,'/communications/sms/jobs'),false);});
test('customer service can view templates without editing or setup authority',()=>{assert.equal(smsCapabilities('customer service representative').manage,false);assert.equal(smsCapabilities('customer service representative').setup,false);assert.equal(canAccessRolePage('customer service representative','/settings/facilities'),false);});
