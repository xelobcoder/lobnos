const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const sourcePath = path.join(__dirname, '..', 'app', 'operations', 'imaging', 'ultrasound', 'result', '[branchid]', 'page.tsx');
const source = fs.readFileSync(sourcePath, 'utf8');

test('ultrasound result hydration treats a missing optional clinical history as empty', () => {
    assert.match(source, /clinicalHistoryResponse\?\.statusCode === 404/);
    assert.match(source, /clinicalHistoryResponse\?\.message === 'Clinical history not found'/);
    assert.match(source, /Number\(clinicalHistoryResponse\?\.statusCode\) === 403/);
    assert.match(source, /name === 'clinical history' && clinicalHistoryUnavailable/);
    assert.match(source, /setClinicalHistory\(cannotReadClinicalHistory \? '' : clinicalHistoryResponse\?\.clinical_history \|\| ''\)/);
});

test('ultrasound result hydration identifies authentication and endpoint failures without exposing report data', () => {
    assert.match(source, /Number\(value\?\.statusCode\) === 401/);
    assert.match(source, /Your session could not be verified\. Sign in again and reopen this report\./);
    assert.match(source, /failedResponses\.map\(\(\[name, value\]\) =>/);
    assert.match(source, /HTTP \$\{value\.statusCode\}/);
});

test('ultrasound result hydration requires a valid test ID before requesting result data', () => {
    assert.match(source, /urlbillingid && urlpatientid && ascensionid && testid && Number\.isSafeInteger\(Number\(testid\)\)/);
});

test('denied clinical-history access does not block result editing or permit history overwrites', () => {
    assert.match(source, /setClinicalHistoryAccessDenied\(cannotReadClinicalHistory\)/);
    assert.match(source, /loadedResultKey!==resultKey\|\|hydrationError\|\|clinicalHistoryAccessDenied/);
    assert.match(source, /disabled=\{clinicalHistoryAccessDenied\}/);
});
