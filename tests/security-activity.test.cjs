const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const ts = require('typescript');
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');

function harness(role = 'admin') {
    const slots = [], effects = [], gets = [], posts = [];
    let cursor = 0;
    let mutation = {success:true,data:{cleared:true}};
    const react = {...React,
        useState(initial) {
            const index = cursor++;
            if (!(index in slots)) slots[index] = initial;
            return [slots[index], value => { slots[index] = typeof value === 'function' ? value(slots[index]) : value; }];
        },
        useRef(initial) { const index = cursor++; return slots[index] ||= {current:initial}; },
        useEffect(callback, dependencies) {
            const index = cursor++;
            if (!slots[index] || dependencies.some((value, i) => value !== slots[index][i])) {
                slots[index] = dependencies;
                effects.push(callback);
            }
        },
    };
    const data = {events:[{id:1,account_type:'patient',account_id:7,account_name:'Training Patient',actor_id:99,actor_name:'Training Administrator',actor_username:'S0099',action:'admin_unlock',created_at:'2026-11-12T12:00:00Z'}],cooldowns:[{account_type:'staff',account_id:7,account_name:'Training Staff',account_username:'S0007',locked_until:Date.now()+60000,level:1}],total:1,activeTotal:1};
    const exports = {};
    const source = fs.readFileSync(path.join(__dirname, '../app/settings/security-activity/page.tsx'), 'utf8');
    vm.runInNewContext(ts.transpileModule(source, {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText, {
        exports, require(name) {
            if (name === 'react') return react;
            if (name.endsWith('useApplicationContext')) return {useApplication:() => ({user:{role}})};
            if (name.endsWith('customFetch')) return {
                customFetch:async url => {gets.push(url);return {success:true,data};},
                customFetchMutation:async (...args) => {posts.push(args);return mutation;},
            };
            if (name.endsWith('.css')) return {__esModule:true,default:{}};
            return require(name);
        },
    });
    const nodes = (node, predicate) => !node || typeof node !== 'object' ? [] : Array.isArray(node) ? node.flatMap(child => nodes(child,predicate)) : [...(predicate(node) ? [node] : []),...nodes(node.props?.children,predicate)];
    function render() { cursor=0;return exports.default(); }
    async function flush() { for (const effect of effects.splice(0)) effect(); await new Promise(resolve => setImmediate(resolve));return render(); }
    return {render,flush,gets,posts,nodes,fail:() => {mutation={success:false,error:{message:'Training server failure'}};},succeed:() => {mutation={success:true,data:{cleared:true}};}};
}

test('non-administrators see denial and never request security data', async () => {
    const h = harness('scientist');
    assert.match(renderToStaticMarkup(h.render()), /Administrator access is required/);
    await h.flush();
    assert.equal(h.gets.length,0);
});

test('administrator history shows names and requires confirmation with a reason', async () => {
    const h = harness('super-admin');
    h.render();
    let view = await h.flush();
    assert.match(renderToStaticMarkup(view), /Training Staff/);
    assert.match(renderToStaticMarkup(view), /Training Administrator/);
    assert.match(renderToStaticMarkup(view), /S0099/);
    assert.match(renderToStaticMarkup(view), /S0007/);
    assert.doesNotMatch(renderToStaticMarkup(view), /Staff #/);
    h.nodes(view, node => node.type==='button' && node.props.children==='Clear cooldown')[0].props.onClick();
    view = h.render();
    assert.match(renderToStaticMarkup(view), /S0007/);
    assert.equal(h.nodes(view,node => node.type==='button' && node.props.children==='Confirm clear cooldown')[0].props.disabled,true);
    assert.equal(h.posts.length,0);
});

test('failed unlock retains selection and reason, retry records only selected identity', async () => {
    const h = harness();
    h.render();
    let view = await h.flush();
    h.nodes(view,node => node.type==='button' && node.props.children==='Clear cooldown')[0].props.onClick();
    view = h.render();
    h.nodes(view,node => node.type==='textarea')[0].props.onChange({target:{value:'Caller identity verified'}});
    view = h.render();
    const submit = () => h.nodes(view,node => node.type==='form')[1].props.onSubmit({preventDefault(){}});
    h.fail();
    await submit();
    view = h.render();
    assert.match(renderToStaticMarkup(view), /Training server failure/);
    assert.equal(h.nodes(view,node => node.type==='textarea')[0].props.value,'Caller identity verified');
    h.succeed();
    await submit();
    view = h.render();
    assert.match(renderToStaticMarkup(view), /Login cooldown cleared/);
    assert.equal(h.nodes(view,node => node.type==='textarea').length,0);
    assert.equal(JSON.stringify(h.posts[1]),JSON.stringify(['security/cooldowns/clear','POST',{accountType:'staff',accountId:7,reason:'Caller identity verified'}]));
});

test('filters use account type and ID with a reset to the first page', async () => {
    const h = harness();
    let view = h.render();
    h.nodes(view,node => node.type==='select')[0].props.onChange({target:{value:'patient'}});
    h.nodes(view,node => node.type==='input' && node.props.type==='number')[0].props.onChange({target:{value:'7'}});
    h.nodes(view,node => node.type==='input' && node.props.type==='search')[0].props.onChange({target:{value:'Training Patient'}});
    view = h.render();
    h.nodes(view,node => node.type==='form')[0].props.onSubmit({preventDefault(){}});
    h.render();
    await h.flush();
    assert.equal(h.gets.at(-1),'security/activity?page=1&accountType=patient&accountId=7&search=Training%20Patient');
});
