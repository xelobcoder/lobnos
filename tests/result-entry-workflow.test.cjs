const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');const ts=require('typescript');const React=require('react');const {renderToStaticMarkup}=require('react-dom/server');
function renderWorkflow(workflow,error=''){
 const exports={};let state=0;const values=[workflow,error,0];const source=ts.transpileModule(fs.readFileSync('components/LabTestForms/ResultEntryWorkflowSummary.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
 vm.runInNewContext(source,{exports,Number,require:name=>{
 if(name==='react')return {...React,useState:()=>[values[state++],()=>{}],useEffect:()=>{}};
 if(name==='react/jsx-runtime')return require(name);
 if(name.includes('ResultReleaseWorkflowActions'))return ()=>React.createElement('button',null,'Sign & Release');
 if(name.includes('OperationalControlsWorkspace'))return {controlApi:()=>{throw Error('No network in render test')}};
 throw Error(name);
 }});return renderToStaticMarkup(React.createElement(exports.default,{ascensionid:27141}));
}
test('an unvalidated result shows the actual approval requirements and inline review controls',()=>{const html=renderWorkflow({validationComplete:false,validationCount:0,validationRequired:2,managerApprovalRequired:true,explicitReleaseRequired:true,releaseBlockedReason:'Complete validations first.'});assert.match(html,/Awaiting validation/);assert.match(html,/0\/2/);assert.match(html,/Manager approval: Required/);assert.match(html,/Review validation/);assert.doesNotMatch(html,/<a /);assert.doesNotMatch(html,/available for printing/);});
test('optional sign-off never hides an independent manager approval requirement',()=>{const html=renderWorkflow({validationComplete:true,validationCount:1,validationRequired:1,managerApprovalRequired:true,managerApproved:false,explicitReleaseRequired:false,availableForPrinting:false,releaseBlockedReason:'Manager approval is required before release.'});assert.match(html,/Sign &amp; Release: Optional/);assert.match(html,/Manager approval is required/);assert.doesNotMatch(html,/Separate Sign &amp; Release is optional/);});
test('revalidation and unavailable status are explicit rather than showing false success',()=>{assert.match(renderWorkflow({requiresRevalidation:true,validationCount:0,validationRequired:1}),/Revalidation required/);const html=renderWorkflow(null,'Unable to verify workflow');assert.match(html,/role="alert"/);assert.match(html,/Retry status/);assert.doesNotMatch(html,/Validated/);});
