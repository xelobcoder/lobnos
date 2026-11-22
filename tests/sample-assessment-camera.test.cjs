'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const nodes = value => !value || typeof value !== 'object' ? [] : Array.isArray(value) ? value.flatMap(nodes) : [value, ...(value.props?.children || []).flatMap(nodes)];
const flush = () => new Promise(resolve => setImmediate(resolve));

function fixture() {
     const state = [], effects = [], cache = new Map(), pending = [], readers = [];
     let cursor = 0;
     const react = {
          createElement: (type, props, ...children) => {
               if (type === 'video' && props?.ref) props.ref.current = { nodeName: 'VIDEO' };
               return { type, props: { ...props, children } };
          },
          useState: initial => {
               const index = cursor++;
               if (!(index in state)) state[index] = typeof initial === 'function' ? initial() : initial;
               return [state[index], value => { state[index] = typeof value === 'function' ? value(state[index]) : value; }];
          },
          useRef: value => {
               const index = cursor++;
               if (!(index in state)) state[index] = { current: value };
               return state[index];
          },
          useCallback: (callback, deps) => {
               const index = cursor++;
               const previous = state[index];
               if (!previous || deps.some((value, i) => value !== previous.deps[i])) state[index] = { callback, deps };
               return state[index].callback;
          },
          useEffect: (callback, deps) => {
               const index = cursor++;
               const previous = effects[index];
               if (!previous || deps.some((value, i) => value !== previous.deps[i])) {
                    pending.push(() => {
                         previous?.cleanup?.();
                         effects[index] = { deps, cleanup: callback() };
                    });
               }
          },
     };

     class Reader {
          constructor() { readers.push(this); }
          decodeFromVideoDevice(deviceId, video, callback) {
               this.video = video;
               this.callback = callback;
               return Promise.resolve();
          }
          reset() { this.stopped = true; }
     }

     const Modal = Object.assign(function Modal() {}, { Header: 'ModalHeader', Title: 'ModalTitle', Body: 'ModalBody', Footer: 'ModalFooter' });
     function load(relative) {
          const file = path.resolve(root, relative);
          if (cache.has(file)) return cache.get(file);
          const exports = {};
          cache.set(file, exports);
          const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
               compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.React },
          }).outputText;
          vm.runInNewContext(code, {
               exports,
               React: react,
               DOMException,
               console,
               require: name => {
                    if (name === 'react') return react;
                    if (name === 'next/link') return { __esModule: true, default: 'Link' };
                    if (name === '@zxing/library') return { BrowserMultiFormatReader: Reader };
                    if (name === 'react-bootstrap') return { Modal, Spinner: 'Spinner' };
                    if (name === '@remixicon/react') return new Proxy({}, { get: (_, icon) => String(icon) });
                    if (name === 'react-toastify') return { toast: { error() {}, success() {} } };
                    if (name.endsWith('/useApplicationContext')) return { useApplicationSettings: () => ({ applicationsettings: { user: { role: 'admin' } } }) };
                    if (name.endsWith('/roles')) return { roleAllowed: () => true };
                    if (name.endsWith('/customFetch')) return {
                         customFetch: async () => ({ success: true, data: { samples: [], groups: [] } }),
                         customFetchMutation: async () => ({ success: true }),
                    };
                    if (name.endsWith('SpecimenRecollectionPanel')) return { __esModule: true, default: 'SpecimenRecollectionPanel' };
                    if (name.startsWith('.')) {
                         const base = path.resolve(path.dirname(file), name);
                         const resolved = ['.ts', '.tsx', '.js'].map(extension => base + extension).find(fs.existsSync);
                         if (resolved) return load(path.relative(root, resolved));
                    }
                    throw new Error(`Missing fixture import: ${name}`);
               },
          });
          return exports;
     }

     return {
          readers,
          load,
          render: (component, props) => {
               cursor = 0;
               pending.length = 0;
               const view = component(props);
               pending.splice(0).forEach(effect => effect());
               return view;
          },
     };
}

test('camera scan fills the sample ID field and stops the camera', async () => {
     const f = fixture();
     const component = f.load('components/accessories/SampleAssessmentModal/SampleAssessmentModal.tsx').default;
     const props = { show: true, hide() {}, billingid: 42 };
     f.render(component, props);
     await flush();
     let view = f.render(component, props);

     const scanButton = nodes(view).find(node => node.props?.['aria-label'] === 'Scan barcode with camera');
     assert.ok(scanButton);
     scanButton.props.onClick();
     view = f.render(component, props);

     const reader = f.readers[0];
     assert.equal(reader.video?.nodeName, 'VIDEO');
     reader.callback({ getText: () => 'ACC-123456' });
     view = f.render(component, props);

     const input = nodes(view).find(node => node.props?.id === 'sample-barcode-search');
     assert.equal(input.props.value, 'ACC-123456');
     assert.equal(nodes(view).some(node => node.props?.['aria-label'] === 'Camera barcode scanner'), false);
     assert.equal(reader.stopped, true);
});
