const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { webcrypto } = require('node:crypto');
const root = path.resolve(__dirname, '..');
function load(file, env = {}, overrides = {}) {
 const exports = {};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText, {
  exports, URL, URLSearchParams, Headers, Response, TextEncoder, TextDecoder, Uint8Array, AbortSignal, crypto:webcrypto,
  btoa:value=>Buffer.from(value,'binary').toString('base64'), process:{env}, ...overrides,
  require(name) {
   if(name==='next/server') return {NextResponse:{next:options=>({options,headers:new Headers()})}};
   if(name.startsWith('.'))return load(path.relative(root,path.resolve(root,path.dirname(file),name))+'.ts',env,overrides);
   return require(name);
  }
 }); return exports;
}
test('public catalogue uses the existing backend origin without exposing a tenant selector',()=>{
 const api=load('website/lib/core-origin.ts',{NODE_ENV:'development',DEVELOPMENT_BASEURL:'http://localhost:2300/api/v1/'});
 assert.equal(api.corePlatformOrigin(),'http://localhost:2300');
});
test('production core transport rejects insecure remote origins and mismatched overrides',()=>{
 for(const env of [
  {PRODUCTION_BASEURL:'http://backend.example/api/v1/'},
  {PRODUCTION_BASEURL:'https://backend.example/api/v1/',CORE_PLATFORM_API_URL:'https://other.example'},
 ])assert.equal(load('website/lib/core-origin.ts',{NODE_ENV:'production',...env}).corePlatformOrigin(),null);
 assert.equal(load('website/lib/core-origin.ts',{NODE_ENV:'production',PRODUCTION_BASEURL:'https://backend.example/api/v1/'}).corePlatformOrigin(),'https://backend.example');
});
test('Zod catalogue parsing validates the response and preserves transformed optional portal URLs',async()=>{
 const env={NODE_ENV:'development',DEVELOPMENT_BASEURL:'http://localhost:2300/api/v1/'};
 const facility={slug:'training-lab',name:'Training lab',region:'Northern',locality:'Tamale',address:'Test',phone:'0000000000',contactEmail:'',description:'Test facility',openingHours:{},paymentInstructions:null,currency:'GHS',facilityType:'pls-integrated'};
 const calls=[];
 const api=load('website/lib/marketplace.ts',env,{fetch:async(url,options)=>{calls.push({url:String(url),options});return Response.json({status:'success',result:{facilities:[facility]}});}});
 const result=await api.getMarketplaceFacilities();
 assert.equal(result.status,'ok');assert.equal(result.data[0].facilityLoginUrl,null);assert.equal(result.data[0].bookingSupported,true);
 assert.equal(calls[0].url,'http://localhost:2300/api/v1/marketplace/facilities');assert.equal(calls[0].options.cache,'no-store');
 const invalid=load('website/lib/marketplace.ts',env,{fetch:async()=>Response.json({status:'success',result:{facilities:[{...facility,currency:'bad'}]}})});
 assert.equal((await invalid.getMarketplaceFacilities()).status,'unavailable');
});
test('public page CSP uses fresh nonces and prevents caching nonce-bearing HTML',()=>{
 const api=load('website/publicSiteProxy.ts',{NODE_ENV:'production'});
 const first=api.publicSiteProxy({headers:new Headers()}), second=api.publicSiteProxy({headers:new Headers()});
 const nonce=first.options.request.headers.get('x-nonce');
 assert(nonce);assert.notEqual(nonce,second.options.request.headers.get('x-nonce'));
 assert(first.headers.get('Content-Security-Policy').includes(`'nonce-${nonce}'`));
 assert.match(first.headers.get('Cache-Control'),/private.*no-store/);
 assert.equal(first.headers.get('Cloudflare-CDN-Cache-Control'),'no-store');
 assert.doesNotMatch(first.headers.get('Content-Security-Policy'),/unsafe-eval/);
});


test('website style selectors stay within the public wrapper without corrupting class names',()=>{
 const postcss=require('postcss');
 const css=fs.readFileSync(path.join(root,'website/site.css'),'utf8');
 const sheet=postcss.parse(css);
 sheet.walkRules(rule=>{
  let parent=rule.parent;while(parent){if(parent.type==='atrule'&&/keyframes$/i.test(parent.name))return;parent=parent.parent;}
  for(const selector of rule.selectors)assert.ok(selector.startsWith('.public-website'),selector);
 });
 assert(!/[.#][\w-]+\.public-website/.test(css),'class names containing body must not be rewritten as element selectors');
});
