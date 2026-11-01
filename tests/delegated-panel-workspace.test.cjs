const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const root=path.resolve(__dirname,'..');
function fixture(pathname,role='scientist',tab='details'){
 const navigations=[];
 const react={createElement:(type,props,...children)=>({type,props:{...props,children}}),use:()=>({id:12}),useState:initial=>[initial===true?false:initial,()=>{}],useEffect:()=>{},useMemo:fn=>fn()};
 function load(relative){
  const file=path.join(root,relative),exports={};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.React}}).outputText,{
   exports,React:react,
   require:name=>{
    if(name==='react')return react;
    if(name==='next/link')return {default:'Link',__esModule:true};
    if(name==='next/navigation')return {usePathname:()=>pathname,useRouter:()=>({push:href=>navigations.push(href)}),useSearchParams:()=>({get:()=>tab})};
    if(name.endsWith('/testPanelNavigation'))return load('lib/testPanelNavigation.ts');
    if(name.endsWith('/roles'))return load('components/Auth/roles.ts');
    if(name.endsWith('/useApplicationContext'))return {useApplicationSettings:()=>({applicationsettings:{user:{role},services:[]}})};
    if(name.endsWith('/customFetch'))return {customFetch:async()=>({data:[]}),customPost:async()=>({status:'success'})};
    if(name.endsWith('/TestOperationalSettings'))return {CriticalPolicySettings:'CriticalPolicySettings'};
    return {default:name.endsWith('/testForm')?'TestForm':name.split('/').pop(),__esModule:true};
   }
  });return exports;
 }
 return {load,navigations};
}
function nodes(value){if(!value||typeof value!=='object')return [];if(Array.isArray(value))return value.flatMap(nodes);return [value,...(value.props?.children||[]).flatMap(nodes)];}
function text(node){return (node.props?.children||[]).flatMap(value=>typeof value==='string'?[value]:value&&typeof value==='object'?[text(value)]:[]).join('').trim();}

test('Manage Test links retain laboratory or administrator navigation',()=>{
 for(const [pathname,base] of [['/operations/laboratory/test-panels/testlist','/operations/laboratory/test-panels'],['/settings/applicationsettings/testpanels/testlist','/settings/applicationsettings/testpanels']]){
  const f=fixture(pathname),component=f.load('components/settingsComponents/TestActions.tsx').default;
  const link=nodes(component({id:12,row:{original:{name:'Panel'}},deleteCustomTest(){}})).find(node=>node.type==='Link');
  assert.equal(link.props.href,base+'/testlist/12');
 }
});
test('New Test remains under the laboratory route',()=>{
 const f=fixture('/operations/laboratory/test-panels/testlist');
 const view=f.load('app/settings/applicationsettings/testpanels/testlist/page.tsx').default();
 const button=nodes(view).find(node=>node.type==='button'&&text(node)==='new test');
 assert.ok(button);
 button.props.onClick();
 assert.deepEqual(f.navigations,['/operations/laboratory/test-panels/testlist/createcustomtest']);
});
test('delegated editor exposes panel tabs without outsourcing or critical policy administration',()=>{
 const f=fixture('/operations/laboratory/test-panels/testlist/12');
 const view=f.load('app/settings/applicationsettings/testpanels/testlist/[id]/page.tsx').default({params:Promise.resolve({id:12})});
 const buttons=nodes(view).filter(node=>node.type==='button');
 for(const label of ['Test Details','Test Fields','Calculations','Procedure Manual','Literature','Report Settings'])assert.ok(buttons.some(node=>text(node)===label),label);
 assert.ok(!buttons.some(node=>['Outsourcing','Critical-value actions'].includes(text(node))));
 const form=nodes(view).find(node=>node.type==='TestForm');
 assert.equal(form.props.canManageOutsourcing,false);
 buttons.find(node=>text(node)==='Back to Test List').props.onClick();
 assert.deepEqual(f.navigations,['/operations/laboratory/test-panels/testlist']);
});
test('an owner retains all editor tabs in the existing settings workspace',()=>{
 const f=fixture('/settings/applicationsettings/testpanels/testlist/12','admin');
 const view=f.load('app/settings/applicationsettings/testpanels/testlist/[id]/page.tsx').default({params:Promise.resolve({id:12})});
 const buttons=nodes(view).filter(node=>node.type==='button');
 assert.ok(buttons.some(node=>text(node)==='Outsourcing'));
 assert.ok(buttons.some(node=>text(node)==='Critical-value actions'));
 buttons.find(node=>text(node)==='Back to Test List').props.onClick();
 assert.deepEqual(f.navigations,['/settings/applicationsettings/testpanels/testlist']);
});
test('an unpermitted query tab does not expose an administrative control',()=>{
 const f=fixture('/operations/laboratory/test-panels/testlist/12','scientist','outsourcing');
 const view=f.load('app/settings/applicationsettings/testpanels/testlist/[id]/page.tsx').default({params:Promise.resolve({id:12})});
 assert.ok(nodes(view).some(node=>node.type==='TestForm'));
 assert.ok(!nodes(view).some(node=>node.type==='CriticalPolicySettings'));
});
