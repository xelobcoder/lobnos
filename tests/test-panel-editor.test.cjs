const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), ts = require('typescript');
const root = path.resolve(__dirname, '..');
const clean = value => JSON.parse(JSON.stringify(value));
const flush = () => new Promise(resolve => setImmediate(resolve));
const nodes = value => !value || typeof value !== 'object' ? [] : Array.isArray(value) ? value.flatMap(nodes) : [value, ...(value.props?.children || []).flatMap(nodes)];
const text = value => typeof value === 'string' || typeof value === 'number' ? String(value) : Array.isArray(value) ? value.map(text).join('') : (value?.props?.children || []).map(text).join('');
const button = (view, label) => nodes(view).find(node => ['button', 'Button'].includes(node.type) && text(node).trim() === label);
const named = (view, name) => nodes(view).find(node => node.type?.name === name);
function fixture() {
    const state = [], cache = new Map(), effects = [], toastCalls = [], requests = [], mutations = [];
    let cursor = 0, pending = [], confirm = false;
    const api = {
        fetch: async url => url.startsWith('gettestpanel/') ? {name:'Panel'} : [],
        post: async () => ({status:true}),
        confirm: value => {confirm = value;}
    };
    const react = {
        createElement: (type, props, ...children) => ({type, props:{...props, children}}),
        useState: initial => {
            const index = cursor++;
            if (!(index in state)) state[index] = typeof initial === 'function' ? initial() : initial;
            return [state[index], value => {state[index] = typeof value === 'function' ? value(state[index]) : value;}];
        },
        useRef: value => {const index = cursor++;return state[index] ||= {current:value};},
        useMemo: (fn, deps) => {
            const index = cursor++, previous = state[index];
            if (!previous || deps.some((value,i)=>value !== previous.deps[i])) state[index] = {value:fn(),deps};
            return state[index].value;
        },
        useCallback: (fn, deps) => react.useMemo(()=>fn,deps),
        useEffect: (fn, deps) => {
            const index = cursor++, previous = effects[index];
            if (!previous || deps.some((value,i)=>value !== previous.deps[i])) pending.push(()=>{
                previous?.cleanup?.();
                effects[index] = {deps,cleanup:fn()};
            });
        }
    };
    react.default=react;
    const Modal = Object.assign(function Modal(){}, {Header:'ModalHeader',Title:'ModalTitle',Body:'ModalBody',Footer:'ModalFooter'});
    function load(relative) {
        const file = path.resolve(root,relative);
        if (cache.has(file)) return cache.get(file);
        const exports = {};cache.set(file,exports);
        const code = ts.transpileModule(fs.readFileSync(file,'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.React}}).outputText;
        vm.runInNewContext(code, {exports,React:react,Error,console,window:{confirm:()=>confirm},requestAnimationFrame:fn=>fn(),setTimeout:()=>{},
            require:name=>{
                if(name==='react')return react;
                if(name==='react-bootstrap')return {Modal,Button:'Button',Spinner:'Spinner'};
                if(name==='react-toastify')return {ToastContainer:'ToastContainer',toast:Object.fromEntries(['success','error','info'].map(kind=>[kind,message=>toastCalls.push({kind,message})]))};
                if(name==='@remixicon/react')return new Proxy({}, {get:(_,name)=>String(name)});
                if(name==='next/navigation')return {useRouter:()=>({back(){},push(){}})};
                if(name.endsWith('/useApplicationContext'))return {useApplicationSettings:()=>({applicationsettings:{user:{employeeid:1}}})};
                if(name.endsWith('/customFetch'))return {defaultTestEditValues:{name:'',sample:0},customFetch:async url=>{requests.push(url);return api.fetch(url);},customPost:async(...args)=>{mutations.push(args);return api.post(...args);}};
                if(name.endsWith('.module.css'))return {__esModule:true,default:new Proxy({}, {get:(_,key)=>String(key)})};
                if(/\/(TestFieldsHeader|TestBasicForm|ConfigurationForm|TatForm)$/.test(name))return {__esModule:true,default:name.split('/').pop()};
                if(name.startsWith('.')){
                    const base=path.resolve(path.dirname(file),name),resolved=['.ts','.tsx','.js'].map(ext=>base+ext).find(fs.existsSync);
                    if(resolved)return load(resolved);
                }
                throw new Error(`Missing fixture import: ${name}`);
            }
        });
        return exports;
    }
    return {...api,load,toastCalls,requests,mutations,
        setFetch:fn=>{api.fetch=fn;},setPost:fn=>{api.post=fn;},confirm:api.confirm,
        render:(component,props)=>{cursor=0;pending=[];const view=component(props);pending.forEach(fn=>fn());return view;},
        unmount:()=>effects.forEach(effect=>effect?.cleanup?.())
    };
}
const rules = () => [
    {name:'Second',ordering:'8',units:'mg/L',plan:'limits',lowerLimitMale:0,upperLimitFemale:4,fieldConstraints:[{condition:'above',value:4}]},
    {name:'First',ordering:0,plan:'options',options:'A,B',categoryid:3,isRequired:true}
];
const editorFile = 'components/settingsComponents/FieldsCreation/createfieldsComponent.tsx';
const modalFile = 'components/settingsComponents/FieldsCreation/ParameterOrderModal.tsx';
const fieldsFile = 'components/settingsComponents/test/tabs/FieldsTab.tsx';
const formFile = 'components/settingsComponents/test/testForm.tsx';

test('ordering is stable, immutable and preserves all metadata',()=>{
    const f=fixture(),helper=f.load('lib/testParameterOrder.ts'),input=rules(),original=clean(input);
    const ordered=helper.orderedTestParameters(input);
    assert.deepEqual(clean(ordered.map(row=>row.name)),['First','Second']);
    const moved=helper.moveTestParameter(ordered,1,0),applied=helper.applyTestParameterOrder(moved);
    assert.deepEqual(clean(applied.map(row=>row.ordering)),[0,1]);
    assert.deepEqual(clean(applied[0].fieldConstraints),original[0].fieldConstraints);
    assert.equal(applied[0].lowerLimitMale,0);assert.equal(applied[1].categoryid,3);
    assert.deepEqual(clean(input),original);
    assert.notEqual(applied[0],input[0]);
    assert.deepEqual(clean(helper.orderedTestParameters([{name:'A',ordering:'bad'},{name:'B',ordering:null}]).map(row=>row.name)),['A','B']);
    assert.throws(()=>helper.moveTestParameter(input,-1,0),/Invalid parameter position/);
    assert.throws(()=>helper.moveTestParameter(input,0,3),/Invalid parameter position/);
});

test('modal move buttons, cancel, reset and apply affect only its isolated draft',()=>{
    const f=fixture(),component=f.load(modalFile).default,input=rules(),applied=[];
    let closed=0;const props={fields:input,onApply:value=>applied.push(value),onHide:()=>closed++};
    let view=f.render(component,props);
    nodes(view).find(node=>node.props?.['aria-label']==='Move Second up').props.onClick();
    view=f.render(component,props);
    assert.match(text(view),/Second moved to position 1 of 2/);
    button(view,'Cancel').props.onClick();
    assert.equal(closed,1);assert.equal(applied.length,0);assert.equal(input[0].ordering,'8');
    button(view,'Reset order').props.onClick();view=f.render(component,props);
    button(view,'Apply order').props.onClick();
    assert.deepEqual(clean(applied[0].map(row=>[row.name,row.ordering])),[['First',0],['Second',1]]);
});

test('modal drag/drop and keyboard movement update positions with announcements',()=>{
    const f=fixture(),component=f.load(modalFile).default,applied=[];
    const props={fields:rules(),onApply:value=>applied.push(value),onHide(){}};
    let view=f.render(component,props),handles=nodes(view).filter(node=>node.props?.['data-order-handle']!==undefined);
    let prevented=false;
    handles[0].props.onKeyDown({altKey:true,key:'ArrowDown',preventDefault(){prevented=true;}});
    assert.equal(prevented,true);
    view=f.render(component,props);handles=nodes(view).filter(node=>node.props?.['data-order-handle']!==undefined);
    handles[0].props.onDragStart({dataTransfer:{setData(){}}});
    nodes(view).filter(node=>node.type==='li')[1].props.onDrop({preventDefault(){}});
    view=f.render(component,props);button(view,'Apply order').props.onClick();
    assert.deepEqual(clean(applied[0].map(row=>row.name)),['First','Second']);
});

test('saving sends immutable numeric draft order and preserves required payload fields',async()=>{
    const f=fixture(),input=rules(),original=clean(input);
    await f.load('components/settingsComponents/FieldsCreation/data/testUtil.js').updateFieldsRules(input,12);
    assert.equal(f.mutations[0][0],'testpanel/list/customtestrule');
    assert.equal(f.mutations[0][1],'PUT');
    assert.deepEqual(clean(f.mutations[0][2].data.map(row=>row.ordering)),[0,1]);
    assert.deepEqual(clean(f.mutations[0][2].data[0].fieldConstraints),original[0].fieldConstraints);
    assert.deepEqual(clean(input),original);
    assert.equal(f.toastCalls.length,0);
});

test('rejected or empty saves throw rather than resolve successfully',async()=>{
    const f=fixture(),save=f.load('components/settingsComponents/FieldsCreation/data/testUtil.js').updateFieldsRules;
    f.setPost(async()=>({status:false,message:'Permission revoked'}));
    await assert.rejects(save(rules(),12),/Permission revoked/);
    await assert.rejects(save([],12),/at least one parameter/);
    assert.equal(f.toastCalls.length,0);
});

test('editor applies an order locally and retains it after a rejected backend save',async()=>{
    const f=fixture(),component=f.load(editorFile).default;
    const props={testid:12,testRules:rules(),fieldConstraintsCategorization:[],testdata:{name:'Panel'},onRefresh(){}};
    let view=f.render(component,props);button(view,'Arrange parameters').props.onClick();
    view=f.render(component,props);assert.ok(named(view,'ParameterOrderModal'));
    named(view,'ParameterOrderModal').props.onApply([{...props.testRules[0],ordering:0},{...props.testRules[1],ordering:1}]);
    view=f.render(component,props);
    assert.match(text(view),/Parameter order has changed in the draft/);
    assert.equal(f.mutations.length,0);
    f.setPost(async()=>({status:false,message:'Permission revoked'}));
    await button(view,'Save All Changes').props.onClick();
    view=f.render(component,props);
    assert.match(text(view),/Parameter order has changed in the draft/);
    assert.deepEqual(f.toastCalls,[{kind:'error',message:'Permission revoked'}]);
    f.setPost(async()=>({status:true}));await button(view,'Save All Changes').props.onClick();
    view=f.render(component,props);
    assert.doesNotMatch(text(view),/Parameter order has changed in the draft/);
});

test('active field edits block rearrangement and saves; refresh requires confirmation',()=>{
    const f=fixture(),component=f.load(editorFile).default;let refreshed=0;
    const props={testid:12,testRules:rules(),fieldConstraintsCategorization:[],testdata:{name:'Panel'},onRefresh:()=>refreshed++};
    let view=f.render(component,props);
    nodes(view).find(node=>node.props?.['aria-label']==='Edit field').props.onClick();
    view=f.render(component,props);
    assert.equal(button(view,'Arrange parameters').props.disabled,true);
    assert.equal(button(view,'Save All Changes').props.disabled,true);
    button(view,'Refresh Data').props.onClick();assert.equal(refreshed,0);
    f.confirm(true);button(view,'Refresh Data').props.onClick();assert.equal(refreshed,1);
});

test('fields show a skeleton, explicit errors, retry and authoritative test metadata',async()=>{
    const f=fixture(),component=f.load(fieldsFile).default,props={testid:12};
    f.setFetch(async()=>{throw new Error('Network unavailable');});
    let view=f.render(component,props);assert.equal(view.type.name,'TestEditorLoading');
    await flush();view=f.render(component,props);assert.match(text(view),/Network unavailable/);
    assert.equal(named(view,'CreateTestFields'),undefined);
    f.setFetch(async url=>url.startsWith('gettestpanel')?{name:'Loaded panel'}:url.includes('customtestrule')?rules():{data:[]});
    button(view,'Retry loading parameters').props.onClick();await flush();view=f.render(component,props);
    assert.equal(named(view,'CreateTestFields').props.testname,'Loaded panel');
    assert.deepEqual(clean(named(view,'CreateTestFields').props.testRules),rules());
});

test('late field requests and unmounted requests cannot replace current data',async()=>{
    const f=fixture(),component=f.load(fieldsFile).default;
    let oldResolve;
    f.setFetch(url=>url==='gettestpanel/edit?id=12'?new Promise(resolve=>oldResolve=resolve):Promise.resolve(url.startsWith('gettestpanel')?{name:'New panel'}:[]));
    f.render(component,{testid:12});f.render(component,{testid:13});await flush();
    oldResolve({name:'Old panel'});await flush();
    let view=f.render(component,{testid:13});assert.equal(named(view,'CreateTestFields').props.testname,'New panel');
    let lastResolve;
    f.setFetch(()=>new Promise(resolve=>lastResolve=resolve));
    f.render(component,{testid:14});f.unmount();lastResolve([]);await flush();
    view=f.render(component,{testid:14});assert.equal(view.type.name,'TestEditorLoading');
});

test('invalid response envelopes block editing instead of showing empty forms',async()=>{
    const f=fixture(),component=f.load(fieldsFile).default,props={testid:12};
    f.setFetch(async url=>url.startsWith('gettestpanel')?{name:'Panel'}:{status:'error',data:[]});
    f.render(component,props);await flush();const view=f.render(component,props);
    assert.equal(view.props.role,'alert');assert.equal(named(view,'CreateTestFields'),undefined);
    const data=f.load('lib/testEditorData.ts');
    assert.throws(()=>data.testEditorDetail({}),/not found/);
    assert.throws(()=>data.testEditorArray({status:false,data:[]},'rules'),/Unable to load rules/);
    f.setFetch(async url=>url.startsWith('gettestpanel')?{name:'Panel'}:url.includes('customtestrule')?[null]:[]);
    button(view,'Retry loading parameters').props.onClick();await flush();
    assert.match(text(f.render(component,props)),/invalid field data/);
});

test('detail form loads lookups for new tests and recovers from failed edit loads',async()=>{
    for(const method of ['POST','PUT']){
        const f=fixture(),component=f.load(formFile).default,props={method,customtest:0,router:{},...(method==='PUT'?{testid:12}:{})};
        let view=f.render(component,props);assert.equal(view.type.name,'TestEditorLoading');
        await flush();view=f.render(component,props);assert.equal(view.type,'div');
        assert.ok(nodes(view).some(node=>node.type==='TestBasicForm'));
        assert.equal(f.requests.some(url=>url.startsWith('gettestpanel')),method==='PUT');
        assert.equal(f.requests.filter(url=>['departments','sampletype','sample/containers'].includes(url)).length,3);
    }
    const f=fixture(),component=f.load(formFile).default,props={method:'PUT',customtest:0,testid:12,router:{}};
    f.setFetch(async()=>{throw new Error('Connection lost');});
    f.render(component,props);await flush();let view=f.render(component,props);
    assert.match(text(view),/Connection lost/);
    f.setFetch(async url=>url.startsWith('gettestpanel')?{name:'Panel'}:[]);
    button(view,'Retry loading test').props.onClick();await flush();view=f.render(component,props);
    assert.ok(nodes(view).some(node=>node.type==='TestBasicForm'));
});

test('loading skeleton is labelled, responsive and does not expose fake fields',()=>{
    const f=fixture(),component=f.load('components/settingsComponents/test/TestEditorLoading.tsx').default;
    const view=f.render(component,{label:'Loading fields'});
    assert.equal(view.props['aria-busy'],true);assert.equal(view.props['aria-label'],'Loading fields');
    assert.ok(nodes(view).some(node=>node.props?.role==='status'));
    assert.equal(nodes(view).filter(node=>node.type==='input').length,0);
});

test('detail loads reject missing identifiers and ignore older test responses',async()=>{
    const invalid=fixture(),invalidForm=invalid.load(formFile).default,invalidProps={method:'PUT',customtest:0,router:{}};
    invalid.render(invalidForm,invalidProps);await flush();
    assert.match(text(invalid.render(invalidForm,invalidProps)),/valid test identifier/);
    assert.equal(invalid.requests.length,0);
    const f=fixture(),component=f.load(formFile).default;
    let resolveOld;
    f.setFetch(url=>url.startsWith('gettestpanel/edit?id=12')?new Promise(resolve=>resolveOld=resolve):Promise.resolve(url.startsWith('gettestpanel')?{name:'Current test'}:[]));
    f.render(component,{method:'PUT',customtest:0,testid:12,router:{}});
    const props={method:'PUT',customtest:0,testid:13,router:{}};
    f.render(component,props);await flush();resolveOld({name:'Old test'});await flush();
    const view=f.render(component,props),form=nodes(view).find(node=>node.type==='TestBasicForm');
    assert.equal(form.props.data.name,'Current test');
});

test('saving disables field controls until the request settles',async()=>{
    const f=fixture(),component=f.load(editorFile).default,props={testid:12,testRules:rules(),fieldConstraintsCategorization:[],testdata:{name:'Panel'}};
    let resolvePost;f.setPost(()=>new Promise(resolve=>resolvePost=resolve));
    let view=f.render(component,props);const saving=button(view,'Save All Changes').props.onClick();
    view=f.render(component,props);
    assert.equal(view.type,'fieldset');assert.equal(view.props.disabled,true);
    assert.equal(button(view,'Arrange parameters').props.disabled,true);
    resolvePost({status:true});await saving;view=f.render(component,props);
    assert.equal(view.props.disabled,false);
});

test('parameter modal remains compact with touch-friendly controls and live announcements',()=>{
    const f=fixture(),component=f.load(modalFile).default;
    const view=f.render(component,{fields:rules(),onApply(){},onHide(){}});
    assert.equal(view.props.size,'lg');
    assert.equal(view.props.dialogClassName,'dialog');
    assert.ok(nodes(view).some(node=>node.props?.role==='status'&&node.props.className==='visually-hidden'));
    const css=fs.readFileSync(path.join(root,'components/settingsComponents/FieldsCreation/ParameterOrderModal.module.css'),'utf8');
    assert.match(css,/max-width:640px/);
    assert.match(css,/grid-template-columns:28px 58px minmax\(0,1fr\) 68px/);
    assert.ok(!view.props.className.includes('workspace'));
    assert.ok(nodes(view).some(node=>node.props?.className==='columns'&&text(node)==='OrderParameterMove'));
    assert.match(css,/@media\(max-width:500px\).*min-height:40px/);
});

test('position input moves a parameter and shifts other rows without changing metadata',()=>{
    const f=fixture(),component=f.load(modalFile).default,applied=[];
    const props={fields:rules(),onApply:value=>applied.push(value),onHide(){}};
    let view=f.render(component,props);
    let input=nodes(view).find(node=>node.props?.['aria-label']==='Position for Second');
    input.props.onChange({target:{value:'1'}});
    view=f.render(component,props);
    input=nodes(view).find(node=>node.props?.['aria-label']==='Position for Second');
    input.props.onKeyDown({key:'Enter',preventDefault(){},currentTarget:{value:'1'}});
    view=f.render(component,props);
    assert.deepEqual(nodes(view).filter(node=>node.type==='input').map(node=>node.props.value),[1,2]);
    button(view,'Apply order').props.onClick();
    assert.deepEqual(clean(applied[0].map(row=>[row.name,row.ordering])),[['Second',0],['First',1]]);
    assert.equal(applied[0][0].lowerLimitMale,0);
    assert.deepEqual(clean(applied[0][0].fieldConstraints),rules()[0].fieldConstraints);
});

test('blank, fractional and out-of-range positions block applying with explicit errors',()=>{
    for(const value of ['', '0', '3', '-1', '1.5']){
        const f=fixture(),component=f.load(modalFile).default;let applied=0;
        const props={fields:rules(),onApply:()=>applied++,onHide(){}};
        let view=f.render(component,props);
        nodes(view).find(node=>node.type==='input').props.onChange({target:{value}});
        view=f.render(component,props);button(view,'Apply order').props.onClick();
        view=f.render(component,props);
        assert.equal(applied,0);
        assert.match(text(view),/whole-number position from 1 to 2/);
        assert.equal(nodes(view).find(node=>node.type==='input').props['aria-invalid'],true);
        nodes(view).find(node=>node.type==='input').props.onKeyDown({key:'Escape',preventDefault(){},stopPropagation(){}});
        view=f.render(component,props);button(view,'Apply order').props.onClick();
        assert.equal(applied,1);
    }
});

test('blur and immediate apply persist the typed position without waiting for another render',()=>{
    const f=fixture(),component=f.load(modalFile).default,applied=[];
    const props={fields:rules(),onApply:value=>applied.push(value),onHide(){}};
    let view=f.render(component,props);
    nodes(view).find(node=>node.type==='input').props.onChange({target:{value:'2'}});
    view=f.render(component,props);
    nodes(view).find(node=>node.type==='input').props.onBlur({target:{value:'2'}});
    button(view,'Apply order').props.onClick();
    assert.deepEqual(clean(applied[0].map(row=>row.name)),['Second','First']);
});
