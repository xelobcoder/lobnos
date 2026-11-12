const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');

function load(relative, dependencies) {
    const exports = {};
    const source = fs.readFileSync(path.join(__dirname, '..', relative), 'utf8');
    vm.runInNewContext(ts.transpileModule(source, {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText, {
        exports, require(name) { return name in dependencies ? dependencies[name] : name.endsWith('.css') ? {__esModule:true,default:{}} : require(name); },
    });
    return exports;
}

test('notification manager can include inactive templates without changing active-only consumers', async () => {
    const calls = [];
    const lib = load('app/email-services/notifications/_lib.ts', {'../_lib':{
        callGet:async url => {calls.push(url);return {result:[{id:1,event_id:4,is_active:'0',is_default:'0',template_name:'Archived'}]};},
        callMutate:async () => {throw Error('Unexpected mutation');}, parseList:response => response.result,
    }});
    const managed = await lib.loadTemplates(true);
    assert.equal(managed[0].isActive,false);
    assert.equal(managed[0].isDefault,false);
    assert.equal(managed[0].eventId,4);
    await lib.loadTemplates();
    await lib.loadLogs(50);
    await lib.loadQueue(100);
    assert.deepEqual(calls,['notifications/templates?includeInactive=true','notifications/templates?includeInactive=false','notifications/logs?page=1&count=50','notifications/queue?page=1&count=100']);
});

function harness() {
    const slots=[], effects=[], requests=[];
    let cursor=0;
    const hooks={...React,
        useState(initial) {const index=cursor++; if (!(index in slots)) slots[index]=initial; return [slots[index],value=>{slots[index]=typeof value==='function'?value(slots[index]):value;}];},
        useEffect(callback,deps) {const index=cursor++;const old=slots[index];if (!old || deps.some((value,i)=>value!==old.deps[i])) {old?.cleanup?.();slots[index]={deps};effects.push(()=>{slots[index].cleanup=callback();});}},
    };
    const chartNames=['Bar','BarChart','CartesianGrid','Legend','Line','LineChart','ResponsiveContainer','Tooltip','XAxis','YAxis'];
    const component=load('app/email-services/_components/EmailOverview.tsx', {
        react:hooks, recharts:Object.fromEntries(chartNames.map(name=>[name,name])),
        'next/link':{__esModule:true,default:'a'}, '@remixicon/react':{RiMailLine:'icon'},
        './EmailPageHero':{__esModule:true,default:'hero'},
        '../_lib':{callGet:url=>new Promise((resolve,reject)=>requests.push({url,resolve,reject}))},
    }).default;
    const nodes=(node,predicate)=>!node||typeof node!=='object'?[]:Array.isArray(node)?node.flatMap(child=>nodes(child,predicate)):[...(predicate(node)?[node]:[]),...nodes(node.props?.children,predicate)];
    const render=()=>{cursor=0;return component();};
    const flush=async()=>{effects.splice(0).forEach(effect=>effect());await new Promise(resolve=>setImmediate(resolve));return render();};
    return {render,flush,nodes,requests};
}
const response={result:{overview:{total:'3',sent:'2',failed:'1'},dailyTrend:[{day:'2026-11-12',sent:'2',failed:'1'}],queueMetrics:{pending:'2',scheduled:'4'},providerPerformance:[{provider:'SMTP',sent:'2',failed:'1'}]}};

test('overview renders real counts and all three charts with accessible data figures', async () => {
    const h=harness();h.render();await h.flush();
    assert.equal(h.requests[0].url,'email/analytics?days=30');
    h.requests[0].resolve(response);
    const view=await h.flush();
    assert.equal(h.nodes(view,n=>n.type==='LineChart').length,1);
    assert.equal(h.nodes(view,n=>n.type==='BarChart').length,2);
    const stats=h.nodes(view,n=>n.type==='hero')[0].props.stats;
    assert.equal(stats[3].value,'6');
    assert.equal(h.nodes(view,n=>n.type==='LineChart')[0].props.data[0].sent,2);
    assert.equal(h.nodes(view,n=>n.type==='table').length,2);
});

test('period changes ignore old responses, and failed requests show retry instead of invented totals', async () => {
    const h=harness();h.render();let view=await h.flush();
    h.nodes(view,n=>n.type==='select')[0].props.onChange({target:{value:'7'}});
    h.render();await h.flush();
    h.requests[0].resolve(response);
    view=await h.flush();
    assert.equal(h.nodes(view,n=>n.type==='hero')[0].props.stats.length,0);
    assert.equal(h.requests[1].url,'email/analytics?days=7');
    h.requests[1].reject(Error('Analytics unavailable'));
    view=await h.flush();
    assert.equal(h.nodes(view,n=>n.props.role==='alert').length,1);
    h.nodes(view,n=>n.type==='button'&&n.props.children==='Try again')[0].props.onClick();
    h.render();await h.flush();
    h.requests[2].resolve({result:{}});
    view=await h.flush();
    assert.equal(h.nodes(view,n=>n.props.role==='alert').length,1);
    assert.equal(h.nodes(view,n=>n.type==='LineChart').length,0);
});
