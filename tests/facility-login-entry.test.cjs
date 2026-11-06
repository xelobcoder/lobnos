const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),React=require('react'),{renderToPipeableStream}=require('react-dom/server'),{PassThrough}=require('node:stream');
const root=path.join(__dirname,'..');
function compile(file,mocks){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports,URL,require:name=>name==='react/jsx-runtime'?require(name):mocks(name)});return exports;}
test('direct client sign-in streams even when optional facility listings never respond',async()=>{
 const entry=compile('app/(website)/facility-login/page.tsx',name=>{
  if(name==='react')return React;
  if(name==='next/link')return {default:({href,children,...props})=>React.createElement('a',{href,...props},children)};
  if(name.endsWith('/site'))return {portalDestination:()=>null};
  if(name.endsWith('/public-catalog'))return {getPublicFacilities:()=>new Promise(()=>{})};
  if(name.endsWith('/FacilityLoginSelector'))return {FacilityLoginSelector:()=>null};
  throw Error(name);
 }).default;
 await new Promise((resolve,reject)=>{
  const sink=new PassThrough();let html='';
  const timeout=setTimeout(()=>{stream.abort();reject(Error('Sign-in shell waited for optional directory'));},3000);
  const stream=renderToPipeableStream(React.createElement(entry),{onShellReady(){stream.pipe(sink);},onError(){},onShellError:reject});
  sink.on('data',chunk=>{html+=chunk.toString();if(html.includes('Continue to sign in')){assert(html.includes('/authentications/login'));assert(html.includes('Checking approved facility listings'));clearTimeout(timeout);stream.abort();resolve();}});
 });
});
test('facility selector discloses the selected destination and requires selection before navigation',()=>{
 let selected='';const redirects=[];
 // Provide the browser navigation seam only for this fixture.
 const source=ts.transpileModule(fs.readFileSync(path.join(root,'website/components/marketplace/FacilityLoginSelector.tsx'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 const exports={};vm.runInNewContext(source,{exports,URL,window:{location:{assign:url=>redirects.push(url)}},require:name=>name==='react'?{useState:()=>[selected,v=>{selected=v;}]}:require(name)});
 const facilities=[{slug:'first',name:'First lab',locality:'Tamale',facilityLoginUrl:'https://first.example/login'},{slug:'second',name:'Second lab',locality:'Accra',facilityLoginUrl:'https://second.example/login'}];
 function nodes(v){return Array.isArray(v)?v.flatMap(nodes):v&&typeof v==='object'?[v,...nodes(v.props?.children)]:[];}
 function text(v){return v==null?'':Array.isArray(v)?v.map(text).join(''):typeof v==='object'?text(v.props?.children):String(v);}
 const render=()=>exports.FacilityLoginSelector({facilities});let tree=render();assert.equal(nodes(tree).find(n=>n.type==='button').props.disabled,true);
 tree.props.onSubmit({preventDefault(){}});assert.equal(redirects.length,0);
 nodes(tree).find(n=>n.type==='select').props.onChange({target:{value:'second'}});tree=render();
 assert(text(tree).includes('Second lab at second.example'));assert.equal(nodes(tree).find(n=>n.type==='button').props.disabled,false);
 tree.props.onSubmit({preventDefault(){}});assert.deepEqual(redirects,['https://second.example/login']);
});
