const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript');
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
function load(file,dependencies={}){
 const exports={};const result=ts.transpileModule(fs.readFileSync(path.resolve(__dirname,'..',file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}});
 vm.runInNewContext(result.outputText,{exports,crypto:require('crypto').webcrypto,TextEncoder,require:name=>name in dependencies?dependencies[name]:require(name)});return exports;
}
const policy=load('lib/passwordPolicy.ts');
test('common password rules and UTF-8 bounds match backend behavior',()=>{
 for(const value of ['short7','allletterslongenough','12345678901234','Password123456!','P@ssw0rd2026!','Welcome2026!!'])assert.ok(policy.passwordProblem(value));
 assert.equal(policy.passwordProblem('Olive river 29!'),null);
 assert.ok(policy.passwordProblem('A7'+'é'.repeat(36)));
});
test('secure suggestions are distinct and satisfy the password policy',()=>{
 const values=Array.from({length:100},()=>policy.suggestPassword());assert.equal(new Set(values).size,100);
 for(const value of values)assert.equal(policy.passwordProblem(value),null);
});
test('shared password field supplies confirmation, strength and optional sound controls',()=>{
 const Component=load('components/Auth/NewPasswordInput.tsx',{'../../lib/passwordPolicy':policy,'./NewPasswordInput.module.css':{__esModule:true,default:{}}}).default;
 const markup=renderToStaticMarkup(React.createElement(Component,{id:'new-password',name:'password',confirmation:true,required:true,className:'form-control'}));
 assert.match(markup,/Confirm password/);assert.match(markup,/Password strength/);assert.match(markup,/Suggest secure password/);assert.match(markup,/Sound off/);assert.match(markup,/minLength="12"/);assert.match(markup,/autoComplete="new-password"/);
 assert.doesNotMatch(markup,/<label/);
});

test('confirmation blocks mismatches and suggestions clear the previous confirmation',()=>{
 const slots=[],effects=[];let cursor=0,value='Olive river 29!';
 const react={...React,useState:initial=>{const i=cursor++;if(!(i in slots))slots[i]=initial;return[slots[i],next=>{slots[i]=next;}];},useRef:initial=>{const i=cursor++;return slots[i]||=( {current:initial} );},useEffect:callback=>effects.push(callback)};
 const Component=load('components/Auth/NewPasswordInput.tsx',{'react':react,'../../lib/passwordPolicy':policy,'./NewPasswordInput.module.css':{__esModule:true,default:{}}}).default;
 const nodes=(node,predicate)=>!node||typeof node!=='object'?[]:Array.isArray(node)?node.flatMap(child=>nodes(child,predicate)):[...(predicate(node)?[node]:[]),...nodes(node.props?.children,predicate)];
 const dom=()=>({error:'',setCustomValidity(message){this.error=message;},reportValidity(){return !this.error;}});
 const main=dom(),confirmation=dom();
 function render(){cursor=0;effects.length=0;const tree=Component.render({id:'test-password',value,required:true,confirmation:true,onChange:event=>{value=event.target.value;}},null);const inputs=nodes(tree,node=>node.type==='input');inputs[0].props.ref(main);inputs[1].props.ref.current=confirmation;for(const effect of effects)effect();return{tree,confirm:inputs[1]};}
 let view=render();assert.equal(confirmation.reportValidity(),false);
 view.confirm.props.onChange({target:{value:'different'}});view=render();assert.equal(confirmation.reportValidity(),false);
 view.confirm.props.onChange({target:{value}});view=render();assert.equal(confirmation.reportValidity(),true);
 nodes(view.tree,node=>node.type==='button'&&node.props.children==='Suggest secure password')[0].props.onClick();view=render();
 assert.equal(policy.passwordProblem(value),null);assert.equal(confirmation.reportValidity(),false);assert.equal(view.confirm.props.value,'');
});
