const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const output={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname,'../../lib/workspaceDestination.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:output});module.exports=output;
