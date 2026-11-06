const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const code=ts.transpileModule(fs.readFileSync(path.join(__dirname,'../components/operations/ViewTwoResultEntry/OperationsListTestCollection.jsx'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText;
function nodes(tree,predicate){if(!tree||typeof tree!=='object')return[];if(Array.isArray(tree))return tree.flatMap(value=>nodes(value,predicate));return[...(predicate(tree)?[tree]:[]),...nodes(tree.props?.children,predicate)]}
function harness(confirmed){let cursor=0;const state=[],exports={},jsx=(type,props)=>({type,props:props||{}});const Modal=Object.assign(()=>null,{Header:'ModalHeader',Title:'ModalTitle',Body:'ModalBody',Footer:'ModalFooter'});
 vm.runInNewContext(code,{exports,confirm:()=>confirmed,window:{scrollTo(){}},require(name){
  if(name==='react')return{useState(initial){const i=cursor++;if(!(i in state))state[i]=initial;return[state[i],value=>state[i]=typeof value==='function'?value(state[i]):value]}};
  if(name==='react/jsx-runtime')return{jsx,jsxs:jsx};if(name==='react-bootstrap')return{Modal};if(name==='@remixicon/react')return{RiArrowRightLine:'icon'};
  if(name.endsWith('useApplicationContext'))return{useApplication:()=>({user:{employeeid:3},settings:{pinOnResultEntry:0}})};
  if(name.endsWith('ResultEntryComponent'))return{default:'ResultEntry'};if(name.endsWith('AccessRequestForm'))return{default:'AccessRequest'};throw Error(name);
 }});
 const operations={patientid:5,patientInfo:{patientid:5},testList:[{testid:11,ascensionid:170,name:'FBC'},{testid:15,ascensionid:171,name:'WIDAL'}]};
 return{render(){cursor=0;return exports.default({operations})}};
}
test('single result entry opens only the confirmed test and preserves its ordered-service reference',()=>{
 const h=harness(true);let tree=h.render();nodes(tree,node=>node.props?.['aria-label']==='Enter results for WIDAL')[0].props.onClick({stopPropagation(){}});tree=h.render();assert.equal(nodes(tree,node=>node.type==='ResultEntry').length,0);nodes(tree,node=>node.type==='button'&&node.props.children==='Open result form')[0].props.onClick();tree=h.render();
 const forms=nodes(tree,node=>node.type==='ResultEntry');assert.equal(forms.length,1);assert.equal(forms[0].props.operations.testid,15);assert.equal(forms[0].props.operations.ascensionid,171);assert.equal(forms[0].props.operations.patientid,5);
});
test('cancelling the single-test confirmation does not open a result form',()=>{
 const h=harness(false);nodes(h.render(),node=>node.props?.['aria-label']==='Enter results for WIDAL')[0].props.onClick({stopPropagation(){}});nodes(h.render(),node=>node.type==='button'&&node.props.children==='Cancel entry')[0].props.onClick();assert.equal(nodes(h.render(),node=>node.type==='ResultEntry').length,0);
});
