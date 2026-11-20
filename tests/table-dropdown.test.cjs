const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const path = require('node:path');

test('row action menus are exclusive and preserve selection/root-close callbacks', () => {
    const events = new EventTarget();
    const states = new Map();
    const mounted = new Set();
    const cleanups = [];
    let active;
    const exports = {};
    const source = ts.transpileModule(readFileSync(path.join(__dirname, '../components/accessories/Datatables/TableDropdownMenu.tsx'), 'utf8'), {
        compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    }).outputText;
    vm.runInNewContext(source, { exports, window: events, CustomEvent,
        require(name) {
            if (name === 'react') return {
                useId: () => active,
                useState: initial => { const id = active; if (!states.has(id)) states.set(id, initial); return [states.get(id), value => states.set(id, value)]; },
                useEffect: effect => { if (!mounted.has(active)) { mounted.add(active); cleanups.push(effect()); } },
                forwardRef: fn => fn,
            };
            if (name === 'react-dom') return {createPortal: value => value};
            if (name === 'react-bootstrap') return { Dropdown: 'BootstrapDropdown' };
            if (name === 'react/jsx-runtime') return {jsx: (type, props) => ({type, props})};
            if (name.endsWith('.css')) return {};
            throw new Error(name);
        },
    });
    const render = (id, props = {}) => { active = id; return exports.TableDropdown(props); };
    let closed;
    render('first'); render('second');
    render('first').props.onToggle(true, {source:'click'});
    assert.equal(render('first').props.show, true);
    render('second', {onToggle: (show, metadata) => {closed = {show, metadata};}}).props.onToggle(true, {source:'click'});
    assert.equal(render('first').props.show, false);
    assert.equal(render('second').props.show, true);
    render('second', {onToggle: (show, metadata) => {closed = {show, metadata};}}).props.onToggle(false, {source:'select'});
    assert.equal(render('second').props.show, false);
    assert.deepEqual(closed, {show:false,metadata:{source:'select'}});
    assert.equal(render('second').props.autoClose, true);
    cleanups.forEach(cleanup => cleanup?.());
});
