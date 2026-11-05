const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const React=require('react'),jsx=require('react/jsx-runtime'),{renderToStaticMarkup}=require('react-dom/server'),{JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..'),css={__esModule:true,default:new Proxy({},{get:(_,key)=>String(key)})};
const Link={__esModule:true,default:({children,...props})=>React.createElement('a',props,children)};
function compile(file,imports={},globals={}){
  const exports={};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText,{
    exports,...globals,require:name=>{
      if(name==='react/jsx-runtime')return jsx;
      if(name==='next/link')return Link;
      if(name.endsWith('.module.css'))return css;
      if(name in imports)return imports[name];
      throw Error('Unexpected dependency '+name);
    },
  });return exports;
}
const lib=compile('lib/pharmacyAccounting.ts'),roles=compile('components/Auth/roles.ts');
const policy=compile('lib/roleNavigationPolicy.ts',{'../components/Auth/roles':roles});
const guide=compile('lib/pharmacyGuide.ts',{'./pharmacyAccounting':lib});
const manual=compile('lib/pharmacyManual.ts');
const learning=compile('lib/pharmacyLearning.ts',{'./pharmacyManual':manual});
const learningHome=compile('app/pharmacy/guide/LearningCenterHome.tsx',{
  react:React,'@remixicon/react':require('@remixicon/react'),'../../../lib/pharmacyLearning':learning,
});
const message=({error,notice})=>React.createElement(React.Fragment,null,error&&React.createElement('p',{role:'alert'},error),notice&&React.createElement('p',{role:'status'},notice));
const formatter=new Intl.NumberFormat('en-GH',{style:'currency',currency:'GHS'});
function guidePage(role='pharmacy_manager',query='',slug,read=[]){
  let index=0;
  return compile('app/pharmacy/guide/LearningCenter.tsx',{
    react:{useState:initial=>{const position=index++;return [position===0?query:position===1?read:initial,()=>{}];},useEffect(){}},
    '../../../lib/pharmacyLearning':learning,'../../../lib/roleNavigationPolicy':policy,
    '../../../components/Auth/roles':roles,
    '../components/PharmacyWorkspace':{styles:css.default,usePharmacyAccess:()=>({app:{user:{role}}})},
    './LearningCenterHome':learningHome,
    './LearningArticleContent':compile('app/pharmacy/guide/LearningArticleContent.tsx'),
  }).default({slug});
}
test('guide explains every static pharmacy page, with existing destinations and steps for every topic',()=>{
  const covered=new Set(guide.pharmacyGuideTopics.flatMap(topic=>topic.pages.map(page=>page.href)));
  function walk(directory){
    for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
      if(entry.isDirectory()&&!entry.name.includes('['))walk(path.join(directory,entry.name));
      if(entry.name==='page.tsx'){
        const href='/'+path.relative(path.join(root,'app'),directory).split(path.sep).join('/');
        if(href!=='/pharmacy/guide')assert.ok(covered.has(href),'missing guide explanation for '+href);
      }
    }
  }
  walk(path.join(root,'app','pharmacy'));
  for(const topic of guide.pharmacyGuideTopics){
    assert.ok(topic.steps.length>=3,topic.title);
    for(const page of topic.pages){
      assert.ok(fs.existsSync(path.join(root,'app',page.href,'page.tsx')),page.href);
      assert.ok(page.purpose.length>25);
    }
  }
  assert.equal(Object.keys(guide.accountingHelp).length,lib.accountingDestinations.length);
});
test('all pharmacy roles can read the guide without gaining access to restricted screens',()=>{
  for(const role of ['pharmacy_manager','pharmacy_accountant','pharmacy_storekeeper','pharmacy_cashier','pharmacy_dispensary_officer','pharmacist']){
    assert.equal(policy.canAccessRolePage(role,'/pharmacy/guide'),true);
    assert.equal(policy.canAccessRolePage(role,'/pharmacy/guide/welcome'),true);
    const document=new JSDOM(renderToStaticMarkup(guidePage(role))).window.document;
    for(const anchor of document.querySelectorAll('a[href^="/"]'))assert.equal(policy.canAccessRolePage(role,anchor.getAttribute('href')),true,role+' '+anchor.href);
  }
  for(const role of ['patient','clinician','scientist','cashier','storekeeper','']){
    assert.equal(policy.canAccessRolePage(role,'/pharmacy/guide'),false);
  }
  const cashier=renderToStaticMarkup(guidePage('pharmacy_cashier'));
  assert.doesNotMatch(cashier,/href="\/pharmacy\/accounting/);
  assert.doesNotMatch(cashier,/href="\/pharmacy\/inventory/);
});
test('learning center searches focused articles rather than rendering an overloaded manual',()=>{
  const html=renderToStaticMarkup(guidePage('pharmacy_manager','purchase request'));
  assert.match(html,/id="purchasing"/);
  assert.match(html,/href="\/pharmacy\/guide\/create-purchase-request"/);
  assert.doesNotMatch(html,/id="steps"|id="after"/);
  assert.match(renderToStaticMarkup(guidePage('pharmacy_manager','no-such-task')),/No matching guide/);
});
test('learning workspace summarizes and groups only accessible guides and reading markers',()=>{
  for(const role of ['pharmacy_manager','pharmacy_cashier','pharmacy_storekeeper']){
    const available=learning.learningArticles.filter(article=>policy.canAccessRolePage(role,article.route));
    const marked=available[0];
    const document=new JSDOM(renderToStaticMarkup(guidePage(role,'',undefined,[marked.slug]))).window.document;
    const summary=document.querySelector('[aria-label="Learning center overview"]');
    const values=Array.from(summary.querySelectorAll('strong'),node=>Number(node.textContent));
    const topics=learning.learningCategories.filter(([id])=>available.some(article=>article.category===id));
    assert.deepEqual(values,[available.length,1,topics.length]);
    assert.deepEqual(Array.from(document.querySelectorAll('#learning-topic option'),node=>node.value),['all',...topics.map(([id])=>id)]);
    assert.equal(document.querySelectorAll('.guideList a').length,available.length);
    assert.ok(document.querySelector(`.guideList a[href="${learning.articleHref(marked.slug)}"] .readBadge`));
    assert.ok(Array.from(document.querySelectorAll('.guideGroup')).every(group=>!group.open));
    assert.equal(document.querySelectorAll('h1').length,1);
  }
  const search=new JSDOM(renderToStaticMarkup(guidePage('pharmacy_manager','purchase request'))).window.document;
  assert.ok(Array.from(search.querySelectorAll('.guideGroup')).every(group=>group.open));
  assert.equal(search.querySelector('#learning-path-title'),null);
  assert.match(search.querySelector('.resultBar [role="status"]').textContent,/Showing \d+ of \d+ guides/);
});
test('every page and workflow has practical A-H instructions and operation-specific verification',()=>{
  const slugs=new Set(learning.learningArticles.map(a=>a.slug));
  assert.equal(slugs.size,learning.learningArticles.length);
  for(const article of learning.learningArticles){
    for(const field of ['what','after'])assert.ok(article[field].length>=20,article.slug+' '+field);
    assert.ok(article.steps.length>=3,article.slug);
    assert.ok(article.mistakes.length>=2,article.slug);
    assert.ok(article.related.length>=2,article.slug);
    for(const slug of article.related)assert.ok(slugs.has(slug),article.slug+' -> '+slug);
    assert.ok(fs.existsSync(path.join(root,'app',article.route.split('?')[0],'page.tsx')),article.route);
    const document=new JSDOM(renderToStaticMarkup(guidePage('pharmacy_manager','',article.slug))).window.document;
    const ids=['open','purpose','interface','steps','after','verify','recovery','next'];
    assert.deepEqual(Array.from(document.querySelectorAll('.content > section[id]'),element=>element.id),ids);
    for(const id of ids)assert.ok(document.getElementById(id),article.slug+' #'+id);
    const operationIds=new Set();
    for(const operation of article.manual.operations){
      assert.ok(!operationIds.has(operation.id),article.slug+' duplicate operation');operationIds.add(operation.id);
      assert.ok(operation.steps.length>=3,article.slug+' '+operation.id);
      assert.ok(operation.result.length>20,article.slug+' result');
      assert.ok(operation.verify.length>40,article.slug+' verification');
      assert.ok(document.getElementById('task-'+operation.id));
    }
    assert.equal(document.querySelectorAll('h1').length,1);
    assert.ok(document.querySelector('[aria-label="On this page"]'));
    assert.ok(document.querySelector('button[aria-pressed="false"]'));
  }
});
test('restricted and unknown articles disclose no financial instructions or task links',()=>{
  for(const slug of ['shared-records','supplier-payment','record-expense','missing-guide']){
    const html=renderToStaticMarkup(guidePage('pharmacy_cashier','',slug));
    assert.match(html,/Article unavailable/);
    assert.doesNotMatch(html,/id="steps"|href="\/pharmacy\/accounting/);
  }
  const html=renderToStaticMarkup(guidePage('pharmacy_manager','','shared-records'));
  assert.match(html,/no automatic historical backfill/i);
  assert.match(html,/separate authorization/);
  assert.match(html,/own billing source/);
});
test('every actual Pharmacy route including dynamic details has exact-page practical help',()=>{
  const routes=[];
  function walk(directory){
    for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
      if(entry.isDirectory())walk(path.join(directory,entry.name));
      if(entry.name==='page.tsx')routes.push('/'+path.relative(path.join(root,'app'),directory).split(path.sep).join('/'));
    }
  }
  walk(path.join(root,'app','pharmacy'));
  const operational=routes.filter(route=>!route.startsWith('/pharmacy/guide'));
  assert.equal(manual.pharmacyPageGuides.length,operational.length);
  for(const route of operational){
    const guides=manual.pharmacyPageGuides.filter(page=>page.route===route);
    assert.equal(guides.length,1,route+' requires one dedicated page guide');
    const actual=route.replace('[id]','original-record');
    assert.equal(manual.pharmacyGuideForPath(actual+'?view=1').slug,guides[0].slug);
    assert.ok(guides[0].open.startsWith('Pharmacy >'),route);
    if(route.includes('[id]'))assert.ok(guides[0].taskRoute&&!guides[0].taskRoute.includes('['));
  }
  assert.equal(manual.pharmacyWorkflowGuides.length,8);
  assert.equal(manual.pharmacyGuideForPath('/pharmacy/accounting/not-real'),undefined);
  assert.equal(manual.pharmacyGuideForPath('/pharmacy/inventory/purchase-requests/extra'),undefined);
});
test('critical multi-action pages cover distinct controls with a result and verification per task',()=>{
  const actions={
    'inventory-purchasing':['Add medicine','Create medicine','Save changes','Save supplier','Submit purchase request','Receive against order','Cancel order','Record write-off'],
    'deliveries-invoices':['Receive stock','Save stock','Change price','Accept selected goods','automatic preview','Return selected held goods','Record supplier invoice'],
    'receive-stock':['Back to purchase order','Back to deliveries','Change price','Save stock','Continue to payment','sidebar hidden','full-width'],
    'stock-controls':['Submit count for review','Approve adjustments','Cancel count','Release','Dispose','Dispatch goods','Receive goods','Record actual contact','Record credit note','Supplier invoice number','Record completed inspection / quarantine','Edit profile'],
    'supplier-balances':['Register existing liability bill','Save draft allocated settlement','Confirm submit','Confirm approve','Confirm pay','Save application draft','Request exact allocation release','Save reversal for review','Excel aging'],
    'record-expense':['New expense draft','Save expense draft','Review payments, attachments & refunds','Payment amount','Confirm pay'],
    'expense-detail':['Upload immutable evidence object','Bind uploaded evidence to this expense','Download authorized evidence','Save draft original-payment refund'],
    'bank-reconciliation':['Import statement','Match selected evidence','Finalize reconciliation'],
    'tax-rules':['Save explicit tax rule','Load complete filtered tax history','Refresh tax evidence'],
    'customer-payments':['Approve credit account','Limit / access','Invoices / collect','Record collection','Print collection receipt'],
    'clinical-review':['Save confirmed history','Decision and counselling notes','Witness employee ID','Witness PIN','Hold for clarification','Approve pharmacist review'],
    'pharmacy-settings':['Destination name','Type','Add destination','Save route','Import reviewed stock'],
  };
  for(const [slug,labels]of Object.entries(actions)){
    const page=manual.pharmacyPageGuides.find(page=>page.slug===slug),text=JSON.stringify(page).toLowerCase();
    for(const label of labels)assert.ok(text.includes(label.toLowerCase()),slug+' lacks '+label);
    assert.ok(page.operations.every(operation=>operation.result&&operation.verify));
  }
});
test('global page help selects exact authorized guides and does not duplicate accounting help',()=>{
  function help(path,role){
    const component=compile('app/pharmacy/components/PharmacyPageHelp.tsx',{
      'next/navigation':{usePathname:()=>path},
      '../../../lib/pharmacyManual':manual,'../../../lib/pharmacyLearning':learning,
      '../../../lib/roleNavigationPolicy':policy,
      './PharmacyWorkspace':{usePharmacyAccess:()=>({app:{user:{role}}})},
    }).default;
    return renderToStaticMarkup(React.createElement(component));
  }
  assert.match(help('/pharmacy/finance','pharmacy_accountant'),/href="\/pharmacy\/guide\/close-day"/);
  assert.match(help('/pharmacy/inventory/purchase-requests','pharmacy_manager'),/href="\/pharmacy\/guide\/approve-request"/);
  for(const [path,role]of [['/pharmacy/finance','pharmacy_cashier'],['/pharmacy/guide','pharmacy_manager'],['/pharmacy/accounting/expenses/exact-id','pharmacy_manager'],['/pharmacy/not-real','pharmacy_manager']]){
    assert.equal(help(path,role),'',path+' '+role);
  }
});
const requested={
  id:'request-exact-1',status:'requested',version:7,created_by:3,created_at:'2026-10-24T12:00:00Z',reason:'Replenish low stock',
  details:{estimatedValue:100,lines:[{itemId:'medicine-exact',name:'Example medicine',quantity:20,unitCost:5}],
    quotes:[{supplierId:'supplier-1',reference:'Original estimate',total:100,lines:[{itemId:'medicine-exact',name:'Example medicine',quantity:20,unitCost:5}]},
      {supplierId:'supplier-2',reference:'Alternative estimate',total:80,lines:[{itemId:'medicine-exact',name:'Example medicine',quantity:20,unitCost:4}]}]},
};
function purchasing({actor=9,manager=true,administrator=false,selected=true,decision='approve',pending=null,failure='',rows=[requested],suppliersFailure='',search='',status='all'}={}){
  let cursor=0;const state=[1,search,status,search,selected?requested.id:'',decision,false,'',''],calls=[];
  class FormDataFixture{constructor(values){this.values=values;}get(key){return this.values[key]??null;}}
  const component=compile('app/pharmacy/inventory/purchase-requests/page.tsx',{
    '../../components/PharmacyTaskHelp':{__esModule:true,default:()=>null},
    react:{useEffect(){},useRef:()=>({current:null}),useMemo:fn=>fn(),useState:initial=>{const index=cursor++;if(!(index in state))state[index]=initial;return [state[index],value=>{state[index]=typeof value==='function'?value(state[index]):value;}];}},
    '../../../../lib/pharmacyAccounting':lib,'../../../../lib/pharmacyPurchaseOrder':{downloadPurchaseRequest:async()=>{}},'../../components/PharmacyPaymentFields':{usePharmacyDocument:()=>({pending,execute:async(endpoint,payload)=>{calls.push({endpoint,payload});return {success:true};}})},
    '../../components/PharmacyWorkspace':{styles:css.default,money:value=>formatter.format(value),dateLabel:value=>value,
      Message:message,usePharmacyAccess:()=>({stock:true,manager,administrator,app:{user:{employeeid:actor}}}),
      usePharmacyResource:endpoint=>endpoint.includes('suppliers')
        ?{data:[{id:'supplier-1',name:'Supplier One'},{id:'supplier-2',name:'Supplier Two'}],loading:false,error:suppliersFailure,refresh:async()=>{}}
        :{data:rows,loading:false,error:failure,refresh:async()=>{}},
    },
  },{FormData:FormDataFixture});
  const render=()=>{cursor=0;return component.PurchaseRequests();};
  return {component,render,calls};
}
function find(node,predicate){
  if(!node||typeof node!=='object')return;
  if(predicate(node))return node;
  for(const child of React.Children.toArray(node.props?.children)){const match=find(child,predicate);if(match)return match;}
}
test('purchase review names suppliers and explains the next step without allowing self-approval',()=>{
  for(const configuration of [{actor:3},{actor:9,manager:false}]){
    const ui=purchasing(configuration),document=new JSDOM(renderToStaticMarkup(ui.render())).window.document;
    assert.equal(document.querySelector('form[aria-label="Purchase approval decision"]'),null);
    assert.match(document.body.textContent,/different pharmacy manager or administrator/);
    assert.match(document.body.textContent,/Supplier One/);
    assert.match(document.body.textContent,/Supplier Two/);
  }
});
test('purchase requests have neutral summaries, searchable status filters and labeled mobile rows',()=>{
  const rows=[requested,{...requested,id:'approved-2',status:'approved'},{...requested,id:'rejected-3',status:'rejected'}];
  const html=renderToStaticMarkup(purchasing({rows,selected:false,status:'approved'}).render());
  const document=new JSDOM(html).window.document;
  assert.equal(document.querySelectorAll('dl[aria-label="Purchase request summary"] dt').length,3);
  assert.equal(document.querySelectorAll('tbody tr').length,1);
  assert.match(document.querySelector('tbody').textContent,/Approved/);
  assert.ok(document.querySelector('td[data-label="Estimated cost"]'));
  assert.match(html,/summary counts cover this list/);
  assert.match(renderToStaticMarkup(purchasing({selected:false,search:'Supplier Two'}).render()),/Review request/);
  const noMatch=renderToStaticMarkup(purchasing({selected:false,search:'no matching medicine'}).render());
  assert.match(noMatch,/No requests match these filters/);assert.doesNotMatch(noMatch,/<table/);
});
test('purchase review explicitly supports an independent administrator without claiming storekeepers can decide',()=>{
  const admin=purchasing({actor:9,manager:true});
  assert.ok(find(admin.render(),node=>node.type==='form'&&node.props['aria-label']==='Purchase approval decision'));
  const tree=admin.render(),decisionForm=find(tree,node=>node.type==='form'&&node.props['aria-label']==='Purchase approval decision');
  const quotation=find(tree,node=>node.type==='details'&&String(node.key).includes('quotation-'));
  assert.notEqual(decisionForm.key,quotation.key,'Sibling decision and quotation sections need distinct keys when switching requests');
  const own=renderToStaticMarkup(purchasing({actor:3}).render());
  assert.match(own,/only pharmacy manager, ask a different administrator/);
  const storekeeper=renderToStaticMarkup(purchasing({actor:9,manager:false}).render());
  assert.match(storekeeper,/Storekeepers can submit requests and add quotations, but cannot approve/);
  assert.match(storekeeper,/Administrators may also review their own requests/);
});
test('administrator self-review requires acknowledgement and a detailed reason and sends the explicit audit flag',async()=>{
  const ui=purchasing({actor:3,administrator:true});
  let form=find(ui.render(),node=>node.type==='form'&&node.props['aria-label']==='Purchase approval decision');
  assert.ok(form);
  const html=renderToStaticMarkup(ui.render());
  assert.match(html,/Administrator self-review/);
  assert.match(html,/minLength="10"|minlength="10"/);
  await form.props.onSubmit({preventDefault(){},currentTarget:{quoteIndex:'0',reason:'Only admin available for review'}});
  assert.equal(ui.calls.length,0);
  form=find(ui.render(),node=>node.type==='form'&&node.props['aria-label']==='Purchase approval decision');
  await form.props.onSubmit({preventDefault(){},currentTarget:{quoteIndex:'0',reason:'short',adminSelfReview:'on'}});
  assert.equal(ui.calls.length,0);
  await form.props.onSubmit({preventDefault(){},currentTarget:{quoteIndex:'0',reason:'Only admin available; verified supplier quotation',adminSelfReview:'on'}});
  assert.deepEqual(JSON.parse(JSON.stringify(ui.calls)),[{endpoint:'pharmacy/enterprise/purchase-requests/request-exact-1/decision',payload:{
    expectedVersion:7,decision:'approve',quoteIndex:0,reason:'Only admin available; verified supplier quotation',adminSelfReview:true,
  }}]);
});
test('independent approval sends the exact request, selected quotation, expected version and reason',async()=>{
  const ui=purchasing(),tree=ui.render();
  const form=find(tree,node=>node.type==='form'&&node.props['aria-label']==='Purchase approval decision');
  await form.props.onSubmit({preventDefault(){},currentTarget:{quoteIndex:'1',reason:'Reviewed second supplier quotation'}});
  assert.deepEqual(JSON.parse(JSON.stringify(ui.calls)),[{endpoint:'pharmacy/enterprise/purchase-requests/request-exact-1/decision',payload:{expectedVersion:7,decision:'approve',reason:'Reviewed second supplier quotation',quoteIndex:1}}]);
  assert.match(renderToStaticMarkup(ui.render()),/Request approved/);
});
test('rejection does not choose a quotation and adding a quote preserves the original medicine identity',async()=>{
  const ui=purchasing({decision:'reject'}),tree=ui.render();
  await find(tree,node=>node.type==='form'&&node.props['aria-label']==='Purchase approval decision').props.onSubmit({preventDefault(){},currentTarget:{reason:'Purchase not needed'}});
  assert.equal(ui.calls[0].payload.decision,'reject');assert.equal('quoteIndex' in ui.calls[0].payload,false);
  await find(ui.render(),node=>node.type==='form'&&node.props['aria-label']==='Supplier quotation').props.onSubmit({preventDefault(){},currentTarget:{supplierId:'supplier-2',reference:'New quote','cost-0':'3.50'}});
  assert.deepEqual(JSON.parse(JSON.stringify(ui.calls[1])),{endpoint:'pharmacy/enterprise/purchase-requests/request-exact-1/quote',payload:{expectedVersion:7,supplierId:'supplier-2',reference:'New quote',lines:[{itemId:'medicine-exact',unitCost:3.5}]}});
});
test('approved requests link to the exact order rather than creating another order or receipt',()=>{
  const approved={...requested,status:'approved',details:{...requested.details,orderId:'approved-order-exact',decisionReason:'Best supplier'}};
  const ui=purchasing({rows:[approved]}),document=new JSDOM(renderToStaticMarkup(ui.render())).window.document;
  assert.ok(document.querySelector('a[href="/pharmacy/inventory?tab=orders&order=approved-order-exact"]'));
  assert.equal(document.querySelector('form'),null);
});
test('failed or malformed purchase retrievals never render stale approval actions',()=>{
  for(const settings of [{failure:'Service unavailable'},{rows:[{...requested,version:0}]},{rows:[{...requested,details:{...requested.details,quotes:null}}]},{rows:null}]){
    const ui=purchasing(settings),document=new JSDOM(renderToStaticMarkup(ui.render())).window.document;
    assert.ok(document.querySelector('[role="alert"]'));
    assert.equal(document.querySelector('form'),null);
    assert.equal(document.querySelector('table'),null);
  }
});
test('pending reviews and unverified suppliers block new decisions and keep the original retry available',async()=>{
  const ui=purchasing({pending:{endpoint:'original',payload:{idempotencyKey:'original-key'}}}),tree=ui.render();
  const document=new JSDOM(renderToStaticMarkup(tree)).window.document;
  assert.ok([...document.querySelectorAll('button')].find(button=>button.textContent==='Confirm decision').disabled);
  await find(tree,node=>node.type==='button'&&node.props.children==='Retry original review').props.onClick();
  assert.deepEqual(JSON.parse(JSON.stringify(ui.calls)),[{endpoint:'',payload:{}}],'the shared document helper retries its saved original operation');
  const blocked=purchasing({suppliersFailure:'Supplier lookup failed'});
  const form=find(blocked.render(),node=>node.type==='form'&&node.props['aria-label']==='Purchase approval decision');
  await form.props.onSubmit({preventDefault(){},currentTarget:{quoteIndex:'0',reason:'Review'}});
  assert.equal(blocked.calls.length,0);
  assert.match(renderToStaticMarkup(blocked.render()),/Supplier lookup failed|Verify the supplier names/);
});
