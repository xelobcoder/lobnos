const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm');
function load(file){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports});return exports;}
const {masterCatalogEndpoint}=load('lib/masterCatalogScope.ts');
const {testPanelBasePath}=load('lib/testPanelNavigation.ts');
test('shared editor selects correct route base in all three workspaces',()=>{
 assert.equal(testPanelBasePath('/master-platform/test-catalog/testlist/100259'),'/master-platform/test-catalog');
 assert.equal(testPanelBasePath('/operations/laboratory/test-panels/testlist/1'),'/operations/laboratory/test-panels');
 assert.equal(testPanelBasePath('/settings/applicationsettings/testpanels/testlist'),'/settings/applicationsettings/testpanels');
});
test('master requests cannot silently use a facility endpoint',()=>{
 const path='/master-platform/test-catalog/testlist/100259';
 for(const endpoint of ['testpanel/list','testpanel/calculations','multi/definition/test/100259','test/fields/category/test/100259'])assert.equal(masterCatalogEndpoint(endpoint,path),'platform/facilities/catalog-api/'+endpoint);
 assert.equal(masterCatalogEndpoint('platform/facilities/access',path),'platform/facilities/access');
 assert.equal(masterCatalogEndpoint('testpanel/list','/operations/laboratory/test-panels'),'testpanel/list');
 assert.throws(()=>masterCatalogEndpoint('https://example.com',path));
});

test('master workspace keeps server-rendered links stable before pathname is available',()=>{
 const React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),exports={};
 const compiled=ts.transpileModule(fs.readFileSync('components/settingsComponents/TestPanelWorkspace.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 vm.runInNewContext(compiled,{exports,require:name=>name==='next/navigation'?{usePathname:()=>null}:name.endsWith('testPanelNavigation')?{testPanelBasePath}:require(name)});
 function Link(){return React.createElement('a',{href:exports.useTestPanelBasePath()+'/testlist'},'Panels');}
 const html=renderToStaticMarkup(React.createElement(exports.TestPanelWorkspace,{basePath:'/master-platform/test-catalog'},React.createElement(Link)));
 assert.equal(html,'<a href="/master-platform/test-catalog/testlist">Panels</a>');
});
