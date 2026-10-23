const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const filename = path.resolve(__dirname, '../components/crm/CrmWorkflowPanels.tsx');
const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020 } }).outputText;
const loaded = new Module(filename, module); loaded.filename = filename; loaded.paths = Module._nodeModulePaths(path.dirname(filename)); loaded._compile(compiled, filename);
const { OnboardingChecklist, AgreementPreview, AmendProposal, HistoryBrowser } = loaded.exports;
const api = async () => ({});
const render = (component, props) => renderToStaticMarkup(React.createElement(component, props));
test('onboarding displays recorded completion, owner, due date and evidence', () => {
 const html = render(OnboardingChecklist, { detail: { lead: { id: 1 }, proposals: [], approvedAgreements: [{ id: 2, effective_from: '2026-10-23' }], onboarding: [{ proposal_id: 2, step: 'terms_communicated', completed_by: 7, completed_at: '2026-10-23', due_date: '2026-10-23', version: 1, notes: 'Terms confirmed with doctor' }] }, api, refresh: api, busy: false, ownerName: 'Marketer One' });
 assert.match(html, /Marketer One/); assert.match(html, /Terms confirmed with doctor/); assert.match(html, /Staff #7/);
 assert.match(html, /Reopen step with reason/); assert.match(html, /Save due date/); assert.match(html, /Reception informed/);
});
test('onboarding requires an approved agreement', () => {
 const html = render(OnboardingChecklist, { detail: { proposals: [], onboarding: [] }, api, refresh: api, busy: false, ownerName: 'One' });
 assert.match(html, /Approve an agreement/); assert.doesNotMatch(html, /<form/);
});
test('only authorized administrators see calculation override fields', () => {
 const props = { api, leadId: 1, proposal: {}, terms: {}, setTerms: () => {} };
 assert.doesNotMatch(render(AgreementPreview, { ...props, canNegotiate: false }), /Set negotiated rates/);
 assert.match(render(AgreementPreview, { ...props, canNegotiate: true }), /Set negotiated rates/);
});
test('amendments are available only for allowed pending proposals', () => {
 const props = { item: { status: 'pending', effective_from: '2026-10-23' }, api, leadId: 1, refresh: api };
 assert.match(render(AmendProposal, { ...props, allowed: true }), /Amend dates/);
 assert.equal(render(AmendProposal, { ...props, allowed: false }), '');
 assert.equal(render(AmendProposal, { ...props, allowed: true, item: { status: 'approved' } }), '');
});
test('history exposes activities, followups and proposals as separate paginated sources', () => {
 const html = render(HistoryBrowser, { api, leadId: 1 });
 for (const kind of ['activities', 'followups', 'proposals']) assert.match(html, new RegExp(`value="${kind}"`));
});
