const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const code=ts.transpileModule(fs.readFileSync(path.join(__dirname,'../components/operations/Laboratory/ProcessingButtons.jsx'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText;
function harness(response){let cursor=0;const states=[],messages=[],updates=[],requests=[],exports={};const jsx=(type,props)=>({type,props:props||{}});
 vm.runInNewContext(code,{exports,Date,window:{open(){}},require(name){
  if(name==='react')return{useState(initial){const i=cursor++;if(!(i in states))states[i]=initial;return[states[i],v=>{states[i]=v}]}};
  if(name==='react/jsx-runtime')return{jsx,jsxs:jsx};
  if(name==='react-bootstrap')return{Spinner:'spinner'};
  if(name==='@remixicon/react')return{RiPlayCircleLine:'icon',RiStopCircleLine:'icon',RiCheckLine:'icon'};
  if(name==='react-toastify')return{toast:{error:v=>messages.push(v)}};
  if(name.endsWith('errorMessage'))return require('./helpers/error-message.cjs');
  if(name.endsWith('customFetch'))return{customPost:async(...args)=>{requests.push(args);if(response instanceof Error)throw response;return response}};
  throw Error(name);
 }});
 let item={ascensionid:171,testid:15,processingStartDate:null,processingEndDate:null};
 return{states,messages,updates,requests,setItem:v=>item={...item,...v},render(){cursor=0;return exports.default({item,employeeid:3,updateTestCollectionAfterUpdate:(id,value)=>updates.push({id,value})})}};
}
function buttons(tree){return tree.props.children.filter(node=>node?.type==='button')}
test('a rejected processing prerequisite is shown and does not advance the row',async()=>{
 const h=harness({status:false,error:{code:'WORKFLOW_BLOCKED',message:'Specimen acceptance is required'}});await buttons(h.render())[0].props.onClick({});
 // The production click invokes an async handler; flush its continuation.
 for(let i=0;i<8;i++)await Promise.resolve();
 assert.deepEqual(h.messages,['Specimen acceptance is required']);assert.equal(h.updates.length,0);assert.equal(buttons(h.render())[0].props.disabled,false);assert.equal(h.states[0],false);
});
test('a transport failure clears the busy state and preserves the existing test',async()=>{
 const h=harness(new Error('Server unavailable'));buttons(h.render())[0].props.onClick({});for(let i=0;i<8;i++)await Promise.resolve();
 assert.deepEqual(h.messages,['Server unavailable']);assert.equal(h.updates.length,0);assert.equal(h.states[0],false);
});
test('processing success updates only the selected stage and stop requires a recorded start',async()=>{
 const h=harness({status:true});assert.equal(buttons(h.render())[1].props.disabled,true);buttons(h.render())[0].props.onClick({});for(let i=0;i<8;i++)await Promise.resolve();
 assert.equal(h.updates.length,1);assert.equal(h.updates[0].id,171);assert.ok(h.updates[0].value.processingStartDate);assert.equal(h.updates[0].value.processingEndDate,null);
 h.setItem(h.updates[0].value);assert.equal(buttons(h.render())[1].props.disabled,false);assert.equal(h.requests[0][0],'ascension/collection/update/stage');
});
