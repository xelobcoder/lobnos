const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const source = fs.readFileSync(path.join(__dirname, '../app/settings/records/backup-security/page.tsx'), 'utf8');
const parsed = ts.createSourceFile('page.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
let validation;
function visit(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(parsed) === 'validateForm') validation = node.initializer.getText(parsed);
    ts.forEachChild(node, visit);
}
visit(parsed);
function validate(overrides = {}) {
    assert.ok(validation);
    let errors;
    const context = {
        encryptionEnabled: true, encryptionRequired: true, encryptionPassword: '', confirmPassword: '', keyRotationDays: 90,
        ...overrides, setErrors: value => { errors = value; },
    };
    const js = ts.transpileModule(`(${validation})()`, { compilerOptions: { target: ts.ScriptTarget.ES2020 } }).outputText;
    return { valid: vm.runInNewContext(js, context), errors };
}
test('server-required backup encryption allows the host-managed key without a settings password', () => {
    assert.equal(validate().valid, true);
});
test('editing a settings password still requires matching confirmation', () => {
    const result = validate({ encryptionPassword: 'NewFixture-2026!Long', confirmPassword: 'different' });
    assert.equal(result.valid, false);
    assert.ok(result.errors.confirm_password);
});
test('the existing password mask can be saved without asking users to re-enter secrets', () => {
    assert.equal(validate({ encryptionPassword: '************', confirmPassword: '************' }).valid, true);
});
test('optional development encryption retains its existing password requirement', () => {
    assert.equal(validate({ encryptionRequired: false }).valid, false);
    assert.equal(validate({ encryptionEnabled: false, encryptionRequired: false }).valid, true);
});
test('the form shows the implemented authenticated algorithm and locks server-required encryption', () => {
    assert.match(source, /<Form\.Control value="AES-256-GCM" readOnly/);
    assert.match(source, /disabled=\{encryptionRequired\}/);
    assert.doesNotMatch(source, /<option value="(?:AES-128|ChaCha20)"/);
});
