const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');

test('classic editor toolbar uses item names provided by its configured build', () => {
    const source = readFileSync(path.join(__dirname, '../components/accessories/markdownEditor.js'), 'utf8');
    const toolbarItems = source.match(/toolbar:\s*\{\s*items:\s*\[([\s\S]*?)\]/)?.[1] || '';

    assert.match(toolbarItems, /"uploadImage"/);
    assert.doesNotMatch(toolbarItems, /"imageUpload"|"codeBlock"/);
});
