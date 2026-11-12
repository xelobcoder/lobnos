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

test('all 109 events load and saved channel flags and catalog bodies retain their database values', async () => {
    const events = Array.from({length:109}, (_,index) => ({id:index+1,event_code:`EVENT_${index+1}`}));
    const lib = load('app/email-services/notifications/_lib.ts', {'../_lib':{
        callGet:async url => url === 'notifications/events' ? {result:events} : url.includes('/catalog') ? {result:{event:events[0],variables:[{variable_name:'patient_name',data_type:'string'}],template:{subject:'Custom',html_body:'<p>Custom</p>',plain_body:'Custom'}}} : {result:{email_enabled:'0',sms_enabled:1,whatsapp_enabled:'0',in_app_enabled:0,default_template_id:'42'}},
        callMutate:async()=>{}, parseList:response=>response.result,
    }});
    assert.equal((await lib.loadEvents()).length,109);
    const settings=await lib.loadEventSettings('EVENT_1');
    assert.equal(settings.emailEnabled,false);assert.equal(settings.smsEnabled,true);
    assert.equal(settings.whatsappEnabled,false);assert.equal(settings.inAppEnabled,false);assert.equal(settings.defaultTemplateId,42);
    const catalog=await lib.loadSingleEventCatalog('EVENT_1');
    assert.equal(catalog.variables[0].variable_type,'string');
    assert.equal(catalog.template.htmlBody,'<p>Custom</p>');assert.equal(catalog.template.plainBody,'Custom');
});

test('event selector exposes every event, searches codes and filters modules without changing the selected event', () => {
    let module='';
    const changed=[];
    const component=load('app/email-services/notifications/_components/EventSelector.tsx', {
        react:{...React,useState:()=>[module,value=>{module=value;}]},
        'react-select':{__esModule:true,default:'event-picker'},
        '../../../../components/Auth/customFetch':{reactSelectCustomStyles:{}},
    }).default;
    const events=Array.from({length:109},(_,index)=>({id:index+1,event_code:`EVENT_${index+1}`,event_name:`Event ${index+1}`,module:index<22?'inventory':'billing'}));
    const props={id:'events',events,templates:events.map(event=>({eventId:event.id})),value:'EVENT_1',onChange:code=>changed.push(code)};
    const nodes=(node,predicate)=>!node||typeof node!=='object'?[]:Array.isArray(node)?node.flatMap(child=>nodes(child,predicate)):[...(predicate(node)?[node]:[]),...nodes(node.props?.children,predicate)];
    let view=component(props),picker=nodes(view,n=>n.type==='event-picker')[0];
    assert.equal(picker.props.options.length,109);
    for(const option of picker.props.options){assert.equal(option.templateCount,1);picker.props.onChange(option);}
    assert.equal(changed.length,109);
    const option=picker.props.options[108];
    assert.equal(picker.props.filterOption({label:option.label,value:option.value,data:option},'event_109'),true);
    assert.equal(picker.props.filterOption({label:option.label,value:option.value,data:option},'missing event'),false);
    nodes(view,n=>n.type==='select')[0].props.onChange({target:{value:'inventory'}});
    view=component(props);picker=nodes(view,n=>n.type==='event-picker')[0];
    assert.equal(picker.props.options.length,22);
    assert.equal(picker.props.value.value,'EVENT_1');
    assert.equal(changed.length,109);
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
