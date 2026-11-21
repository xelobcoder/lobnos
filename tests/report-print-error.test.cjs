const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const code=ts.transpileModule(fs.readFileSync('lib/reportPrintError.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const box={exports:{}};vm.runInNewContext(code,box);const {reportPrintError}=box.exports;
test('boolean 409 response preserves the release failure instead of falling through',()=>{const message='No signed and released results are available for printing';assert.equal(reportPrintError({status:false,message,statusCode:409}),message);assert.equal(reportPrintError({status:'error',message}),message);assert.equal(reportPrintError({status:'success',test:[]}), '');assert.ok(reportPrintError(null));});
