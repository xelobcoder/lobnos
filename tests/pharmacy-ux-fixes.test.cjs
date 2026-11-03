const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('receiving keeps optional supplier billing and delivery details out of the default path', () => {
  const source = read('app/pharmacy/components/PharmacyReceivingModal.tsx');
  assert.match(source, /useState\(false\), \[invoiceReference/);
  assert.match(source, /<summary>Optional delivery costs or reason<\/summary>/);
  assert.match(source, /Invoice is here: record it with stock/);
  assert.match(source, /Invoice not available yet/);
  assert.doesNotMatch(source, /Accounts Payable|Non-recoverable tax/);
  assert.match(source, /Tax that cannot be reclaimed/);
});

test('receiving batch tables become labeled, keyboard-focusable cards on narrow screens', () => {
  const source = read('app/pharmacy/components/PharmacyReceivingModal.tsx');
  const css = read('app/pharmacy/components/PharmacyReceivingModal.module.css');
  assert.match(source, /role="region" aria-label="Delivered medicine batches"/);
  assert.match(source, /role="region" aria-label="Delivered quantities and acceptance"/);
  assert.match(source, /aria-label=\{`Accept \$\{line\.name\}/);
  assert.match(source, /aria-label=\{`Return \$\{line\.name\}/);
  assert.match(css, /@media\(max-width:700px\)/);
  assert.match(css, /\.basket tr,\.acceptance tr\{display:grid/);
  assert.match(css, /content:"Delivered \/ accepted \/ held"/);
  assert.match(css, /content:"Return held"/);
  assert.match(css, /\.basket:focus-visible,\.acceptance:focus-visible/);
});

test('POS reports credit-account load failures and offers an accessible retry', () => {
  const source = read('app/pharmacy/sell/page.tsx');
  assert.match(source, /if\(!r\?\.success\)throw new Error/);
  assert.match(source, /setAccountError\(e instanceof Error\?e\.message/);
  assert.match(source, /accountsLoading&&<p role="status">Loading patient credit accounts/);
  assert.match(source, /accountError&&<div className="alert alert-danger" role="alert">/);
  assert.match(source, />Retry<\/button>/);
  assert.doesNotMatch(source, /pharmacy\/credit\/accounts'\)\.then\([^]*?catch\(\(\)=>\{\}\)/);
});

test('POS keyboard hints continue to have matching key handlers', () => {
  const source = read('app/pharmacy/sell/page.tsx');
  for (const key of ['F2', 'F4', 'F8', 'F9']) {
    assert.match(source, new RegExp(`event\\.key==='${key}'`));
  }
  assert.match(source, /<kbd>F2<\/kbd>/);
  assert.match(source, /<kbd>F8<\/kbd>/);
  assert.match(source, /<kbd>F9<\/kbd>/);
  assert.match(source, /F4 amount/);
});
