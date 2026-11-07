const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const read = (file) => readFileSync(path.join(__dirname, '..', file), 'utf8');

test('laboratory stock management list surfaces use theme-aware colors', () => {
	const component = read('components/inventory/limsConnection/StockManagementCompo.jsx');
	const styles = read('components/inventory/limsConnection/stockManagement.module.css');

	assert.match(component, /className=\{styles\.page\}/);
	assert.match(component, /styles\.recordCard/);
	assert.match(component, /className=\{styles\.timeline\}/);
	assert.match(component, /border: '2px solid var\(--bs-body-bg\)'/);
	assert.match(styles, /\.recordCard[\s\S]*?background: var\(--bs-body-bg\)/);
	assert.match(styles, /\.timeline[\s\S]*?background: var\(--bs-border-color\)/);
});

test('laboratory stock management uses the shared date-range filter', () => {
	const component = read('components/inventory/limsConnection/StockManagementCompo.jsx');
	assert.match(component, /import DateFilterReusable from/);
	assert.match(component, /<DateFilterReusable/);
	assert.match(component, /value=\{dateFilter\}/);
	assert.match(component, /setDateFrom\(start\); setDateEnd\(end\)/);
});

test('inventory deduction modal uses dark-theme surfaces and semantic color tokens', () => {
	const modal = read('components/operations/Laboratory/DocumentInventoryDeductionLab.jsx');
	const styles = read('components/inventory/limsConnection/stockManagement.module.css');

	assert.match(modal, /className=\{styles\.deductionModal\}/);
	assert.match(modal, /borderBottom: '2px solid var\(--bs-border-color\)'/);
	assert.match(modal, /className=\{styles\.itemCode\}/);
	assert.match(modal, /className=\{`form-control form-control-sm \$\{styles\.quantityValue\}`\}/);
	assert.match(styles, /\.deductionModal :global\(\.modal-content\)/);
	assert.match(styles, /:global\(\[data-bs-theme="dark"\]\) \.deductionModal :global\(\.bg-white\)/);
});
