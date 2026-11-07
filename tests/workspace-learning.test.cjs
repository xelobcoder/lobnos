const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const root=path.resolve(__dirname,'..');
function load(file) {
 const exports={};
 const source=ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 vm.runInNewContext(source,{exports,require:name=>{if(!name.startsWith('.'))return require(name);let target=path.relative(root,path.resolve(root,path.dirname(file),name));return load(target+'.ts');}});
 return exports;
}
const {workspaceLearning,availableWorkspaceArticles}=load('lib/workspaceLearning.ts');
const {canAccessRolePage}=load('lib/roleNavigationPolicy.ts');
test('every learning center and guide has a real page entrypoint and complete instructions',()=>{
 const ids=new Set();
 for(const module of workspaceLearning){
  assert(!ids.has(module.id));ids.add(module.id);
  for(const route of [`app/${module.id}/guide/page.tsx`,`app/${module.id}/guide/[slug]/page.tsx`])assert(fs.existsSync(path.join(root,route)),route);
  const slugs=new Set();
  for(const article of module.articles){
   assert(!slugs.has(article.slug));slugs.add(article.slug);
   assert(fs.existsSync(path.join(root,'app',article.route,'page.tsx'))||fs.existsSync(path.join(root,'app',article.route,'page.jsx')),article.route);
   assert(article.steps.length>=3);assert(article.verify);assert(article.recovery);
   for(const route of article.entryRoutes||[])assert(fs.existsSync(path.join(root,'app',route,'page.tsx'))||fs.existsSync(path.join(root,'app',route,'page.jsx')),route);
  }
 }
 assert.equal(ids.size,4);
});
test('guides obey existing task permissions and do not grant operational access',()=>{
 const billing=workspaceLearning.find(m=>m.id==='billing'),operations=workspaceLearning.find(m=>m.id==='operations');
 const cashier=availableWorkspaceArticles(billing,'cashier');
 assert(cashier.some(a=>a.slug==='collect-payment'));
 assert(!cashier.some(a=>a.slug==='strategies'||a.slug==='prepare-bill'));
 assert(!canAccessRolePage('cashier','/billing/billing-strategy/strategies'));
 assert.equal(availableWorkspaceArticles(billing,'patient').length,0);
 assert.equal(availableWorkspaceArticles(billing,'scientist').length,0);
 assert.deepEqual(Array.from(availableWorkspaceArticles(operations,'nurse').map(a=>a.slug)),['test-panel-setup','vital-signs']);
 assert(!availableWorkspaceArticles(operations,'scientist').some(a=>a.slug==='lab-stock'));
 assert(availableWorkspaceArticles(operations,'scientist',{departmentStock:['laboratory']}).some(a=>a.slug==='lab-stock'));
 assert.deepEqual(Array.from(availableWorkspaceArticles(operations,'head of imaging').map(a=>a.slug)),['test-panel-setup','imaging-stock']);
});
test('disabled facility modules hide their task guides',()=>{
 const inventory=workspaceLearning.find(m=>m.id==='inventory');
 assert.equal(availableWorkspaceArticles(inventory,'storekeeper',{moduleConfiguration:{modules:{inventory:{enabled:false}}}}).length,0);
 assert(availableWorkspaceArticles(inventory,'storekeeper',{moduleConfiguration:{modules:{inventory:{enabled:true}}}}).length>0);
});

test('test-panel setup is documented without widening page access',()=>{
 const operations=workspaceLearning.find(module=>module.id==='operations');
 const setup=operations.articles.find(article=>article.slug==='test-panel-setup');
 const {manualIntroductions}=load('lib/workspaceManual.ts');
 assert.ok(setup);
 assert.match(setup.title,/test panel.*parameters.*references/i);
 assert.match(setup.steps.join(' '),/new test/i);
 assert.match(setup.steps.join(' '),/Test Fields/);
 assert.match(setup.sections.flatMap(section=>(section.tables||[]).flatMap(table=>table.rows.flat())).join(' '),/Range \(M\/F\/Child\/Neonate\)/);
 assert.match(setup.steps.join(' '),/approved.*source/);
 assert.match(manualIntroductions.operations.rules.join(' '),/panel deletion is restricted to super-admins/);
 assert.match(manualIntroductions.operations.rules.join(' '),/This manual does not supply clinical ranges/);
 const scientistGuide=availableWorkspaceArticles(operations,'scientist').find(article=>article.slug==='test-panel-setup');
 assert.equal(scientistGuide.route,'/operations/guide');
 assert.equal(canAccessRolePage('scientist','/operations/laboratory/test-panels/testlist'),false);
 const delegatedManager=availableWorkspaceArticles(operations,'manager',{testPanelsDelegation:true}).find(article=>article.slug==='test-panel-setup');
 assert.equal(delegatedManager.route,'/operations/laboratory/test-panels/testlist');
 assert.equal(canAccessRolePage('manager','/operations/laboratory/test-panels/testlist'),false);
 assert.equal(canAccessRolePage('manager','/operations/laboratory/test-panels/testlist',{testPanelsDelegation:true}),true);
 assert.match(setup.before.join(' '),/multiple roles must switch to an assigned scientist role/);
 assert.match(setup.before.join(' '),/super-admin/);
});

test('test-panel procedure follows the evidence and verification standard',()=>{
 const operations=workspaceLearning.find(module=>module.id==='operations');
 const setup=operations.articles.find(article=>article.slug==='test-panel-setup');
 const sections=setup.sections||[];
 const sectionText=sections.flatMap(section=>[
  section.title,...section.paragraphs,...(section.steps||[]),
  ...(section.tables||[]).flatMap(table=>[table.caption,...table.headers,...table.rows.flat()]),
  ...(section.checklist||[])
 ]).join(' ');
 for(const required of [
  'Create the catalogue entry','Complete Test Details','Add the result fields',
  'Arrange and save parameter order','Set up an optional calculation',
  'Add procedure and literature information','Customize the report','Review outsourcing settings',
  'Review critical-value actions','Review the completed test'
 ])assert(sections.some(section=>section.title.includes(required)),required);
 assert.match(sectionText,/fictional.*non-clinical/i);
 assert.match(sectionText,/approved laboratory source/i);
 assert.match(sectionText,/Apply order.*Save All Changes/i);
 assert.match(sectionText,/GHS/);
 assert.match(sectionText,/print hold does not prevent urgent communication with the clinician/i);
 assert.match(sectionText,/Only a Super Administrator can delete a test/i);
 assert.match(sectionText,/Test Fields plans: purpose, configuration, and safe example/);
 assert.match(sectionText,/Fetal Biometry \(Hadlock\)/);
 assert.match(sectionText,/Legacy means the older single-range setup: one lower and upper limit shared by everyone/i);
 assert.match(sectionText,/live system.*PLS system staff use for real patient work/i);
 assert.match(sectionText,/previewing calculates a sample result but does not save a patient result/i);
 assert.match(sectionText,/Saving a formula changes the test configuration and can affect real results/i);
 assert.match(sectionText,/Active means in use now, Scheduled means set to start later, Historical means its effective period has passed, and Inactive means it has been turned off/i);
 assert.match(sectionText,/Require supervisor clearance/);
 assert.match(sectionText,/Save actions for this rule/);
 assert.equal(setup.procedure.id,'P-OPS-001');
 assert(setup.procedure.roles.length>=4);
 assert(setup.procedure.fields.length>=7);
 assert(setup.procedure.screenshotsPending.length>=2);
 assert.match(setup.procedure.commonErrors.map(error=>error.symptom).join(' '),/Field name is required/);
 assert.match(setup.procedure.commonErrors.map(error=>error.symptom).join(' '),/Please select a field type/);
 assert.match(setup.procedure.warnings.join(' '),/approved laboratory source/);
 assert.equal(setup.procedure.related.length,0);
 assert.match(setup.procedure.screenshotsPending.map(figure=>figure.figure).join(' '),/Figure 1/);
 assert.equal('illustrations' in setup,false);
 const readerText=[
  setup.purpose,setup.concept,...setup.before,...setup.steps,
  ...setup.procedure.roles.flatMap(row=>[row.role,row.permissions]),
  ...setup.procedure.fields.flatMap(row=>Object.values(row)),
  ...setup.procedure.warnings,...setup.procedure.alternatives,
  ...setup.procedure.commonErrors.flatMap(error=>Object.values(error)),
  ...setup.procedure.screenshotsPending.flatMap(figure=>Object.values(figure)),
  ...sections.flatMap(section=>[
   section.title,...section.paragraphs,...(section.steps||[]),
   ...(section.tables||[]).flatMap(table=>[table.caption,...table.headers,...table.rows.flat()]),
   ...(section.checklist||[])
  ])
 ].join(' ');
 const technicalLeakage=readerText.match(/Verified \(source\)|source-only review|backend|endpoint|Evidence register|server-side enforcement|\.tsx\b|\/operations\/laboratory\/test-panels\/testlist/gi)||[];
 assert.deepEqual(technicalLeakage,[]);
 assert.equal('evidence' in setup.procedure,false);
 assert.equal('gaps' in setup.procedure,false);
});

test('every guide teaches controls, prerequisites, outcomes and a worked example',()=>{
 for(const module of workspaceLearning){
  assert(module.glossary.length>=5);
  assert(module.startPath.every(slug=>module.articles.some(article=>article.slug===slug)));
  assert(module.articles.some(article=>article.kind==='workflow'));
  for(const article of module.articles){
   assert(article.concept.length>40,article.slug);
   assert(article.before.length>=2,article.slug);
   assert(article.controls.length>=2,article.slug);
   assert(article.open.length>40,article.slug);
   for(const control of article.controls)assert(control.name&&control.description);
   assert(article.after&&article.example.situation&&article.example.action&&article.example.expected);
   assert(article.related.every(slug=>module.articles.some(other=>other.slug===slug)),article.slug);
   assert(!('flow' in article),'Generic generated page flows must remain removed');
  }
 }
});

test('role and module matrix never produces a task outside existing navigation authority',()=>{
 const roles=['admin','super-admin','manager','crm','receptionist','front desk','customer service representative','cashier','billing officer','accountant','scientist','lab scientist','phlebotomist','phelobotomist','sonographer','head of laboratory','head of imaging','nurse','nursing','marketer','storekeeper','patient','doctor','clinician','pharmacist','unknown',''];
 for(const role of roles){
  for(const module of workspaceLearning){
   for(const departmentStock of [[],['laboratory'],['imaging'],['laboratory','imaging']]){
    const settings={departmentStock};
    for(const article of availableWorkspaceArticles(module,role,settings)){
     assert(canAccessRolePage(role,`/${module.id}/guide`,settings),role);
     assert(canAccessRolePage(role,article.route,settings),`${role} ${article.route}`);
    }
   }
  }
 }
 const billing=workspaceLearning.find(module=>module.id==='billing');
 assert.equal(availableWorkspaceArticles(billing,'cashier').find(article=>article.slug==='billing-to-receipt').route,'/billing/cash-collection');
 assert.equal(availableWorkspaceArticles(billing,'crm').find(article=>article.slug==='billing-to-receipt').route,'/billing/patientid');
 assert.equal(availableWorkspaceArticles(billing,'accountant',{moduleConfiguration:{modules:{billing:{enabled:false}}}}).length,0);
 assert(availableWorkspaceArticles(billing,'super-admin',{moduleConfiguration:{modules:{}}}).length>0);
});

test('search finds concepts, actual field names, examples and recovery instructions',()=>{
 const {searchWorkspaceArticles}=load('lib/workspaceLearning.ts');
 const operations=workspaceLearning.find(module=>module.id==='operations');
 assert(searchWorkspaceArticles(operations.articles,'Action limit (SD)').some(article=>article.slug==='quality-control'));
 assert(searchWorkspaceArticles(operations.articles,'P-OPS-001').some(article=>article.slug==='test-panel-setup'));
 assert(searchWorkspaceArticles(operations.articles,'Field name is required').some(article=>article.slug==='test-panel-setup'));
 assert(searchWorkspaceArticles(operations.articles,'Figure 3').some(article=>article.slug==='test-panel-setup'));
 assert(searchWorkspaceArticles(operations.articles,'Select Manage tests').some(article=>article.slug==='test-panel-setup'));
 const inventory=workspaceLearning.find(module=>module.id==='inventory');
 assert(searchWorkspaceArticles(inventory.articles,'committed').some(article=>article.slug==='funded-payments'));
 assert(searchWorkspaceArticles(inventory.articles,'unreceived').some(article=>article.slug==='department-stock'));
 assert.equal(searchWorkspaceArticles(inventory.articles,'zzzznothing').length,0);
});

test('all centers share the pharmacy home and article rendering pattern',()=>{
 const source=fs.readFileSync(path.join(root,'components/learning/WorkspaceLearningCenter.tsx'),'utf8');
 const pharmacy=fs.readFileSync(path.join(root,'app/pharmacy/guide/LearningCenter.tsx'),'utf8');
 assert.match(source,/import LearningCenterHome from '..\/..\/app\/pharmacy\/guide\/LearningCenterHome'/);
 assert.match(source,/import LearningArticleContent from '..\/..\/app\/pharmacy\/guide\/LearningArticleContent'/);
 assert.match(pharmacy,/import LearningArticleContent from '.\/LearningArticleContent'/);
 assert.doesNotMatch(source,/WorkflowDiagram/);
});


test('manual control keys remain unique for repeated role labels',()=>{
 const billing=workspaceLearning.find(module=>module.id==='billing');
 const workflow=billing.articles.find(article=>article.slug==='billing-to-receipt');
 assert.equal(workflow.controls.filter(control=>control.name==='Cashier').length,2);
 const manual=fs.readFileSync(path.join(root,'components/learning/WorkspaceManual.tsx'),'utf8');
 const article=fs.readFileSync(path.join(root,'app/pharmacy/guide/LearningArticleContent.tsx'),'utf8');
 assert.match(manual,/article.controls.map\(\(control, index\)/);
 assert.match(manual,/key=\{`\$\{article.slug\}-control-\$\{index\}`\}/);
 assert.match(article,/key=\{`\$\{article.slug\}-control-\$\{index\}`\}/);
});
