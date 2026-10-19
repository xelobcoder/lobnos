const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const { inflateSync } = require("node:zlib");
const ts = require("typescript");

const root = path.join(__dirname, "..");
function load(file, mocks = {}, globals = {}) {
	const exports = {};
	const source = ts.transpileModule(readFileSync(path.join(root, file), "utf8"), {
		fileName: file,
		reportDiagnostics: true,
		compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
	});
	assert.deepEqual(source.diagnostics, []);
	vm.runInNewContext(source.outputText, {
		exports, console, URLSearchParams, ...globals,
		require: name => name in mocks ? mocks[name] : name === "../invoices/organizationInvoicePdf"
			? load("components/invoices/organizationInvoicePdf.ts") : require(name),
	});
	return exports;
}
const helpers = load("lib/salesReport.ts");
const { buildSalesReportPdf } = load("components/Billing/salesReportPdf.ts");

function fixture() {
	return {
		from: "2026-10-01", to: "2026-10-19", generatedAt: "2026-10-19T03:00:00Z",
		branch: { id: 4, name: "Central Branch" },
		company: { name: "Prime Test Facility", address: "High Street", phonenumber: "0300000000" },
		summary: { clients: 1, transactions: 1, grossSales: 150, discounts: 10, netSales: 140,
			receipts: 70, expensePayments: 20, netCashMovement: 50, outstanding: 60 },
		transactions: [{ billingId: 77, date: "2026-10-18", patientId: 2, patientName: "TRANSACTIONCLIENT",
			source: "Private", gross: 150, discount: 10, net: 140, paid: 80, outstanding: 60 }],
		receipts: [{ id: 5, date: "2026-10-18", billingId: 66, patientName: "OLDDEBTCOLLECTION", method: "Cash", amount: 70 }],
		expenses: [{ id: 3, date: "2026-10-19", description: "REAGENTPURCHASE", category: "Consumables", payee: "Supplier", method: "Cash", amount: 20 }],
		outstanding: [{ billingId: 77, date: "2026-10-18", patientName: "UNPAIDCLIENT", source: "Private", organizationName: "", amount: 60 }],
		paymentMethods: [{ method: "Cash", amount: 70 }],
		outstandingBySource: [{ source: "Private", amount: 60 }],
		notes: ["CURRENTBALANCES"],
	};
}

function pdfText(doc) {
	const bytes = Buffer.from(doc.output("arraybuffer"));
	const raw = bytes.toString("latin1");
	const streams = [];
	const pattern = /stream\r?\n/g;
	let match;
	while ((match = pattern.exec(raw))) {
		const end = raw.indexOf("\nendstream", pattern.lastIndex);
		assert.notEqual(end, -1);
		const content = bytes.subarray(pattern.lastIndex, end);
		streams.push(inflateSync(content).toString("latin1"));
		pattern.lastIndex = end + 10;
	}
	return streams.join("\n");
}

test("report request uses the chosen branch and inclusive date range", () => {
	assert.equal(helpers.salesReportEndpoint(4, "2026-10-01", "2026-10-19"),
		"billing/sales/report?branchid=4&from=2026-10-01&to=2026-10-19");
});
test("report rejects absent, impossible, and reversed dates", () => {
	for (const [from, to] of [["", ""], ["2026-02-30", "2026-03-02"], ["2026-10-20", "2026-10-19"], ["01/10/2026", "2026-10-19"]]) {
		assert.throws(() => helpers.salesReportEndpoint(4, from, to));
	}
	assert.doesNotThrow(() => helpers.salesReportEndpoint(4, "2028-02-29", "2028-02-29"));
});
test("report rejects unsafe or missing branches", () => {
	for (const branch of ["", "all", 0, -1, "4 OR 1=1", "99999999999999999"]) {
		assert.throws(() => helpers.salesReportEndpoint(branch, "2026-10-01", "2026-10-19"));
	}
});
test("report filenames distinguish summary and full reports", () => {
	assert.equal(helpers.salesReportFilename(fixture(), true), "sales-expenses-4-2026-10-01-2026-10-19.pdf");
	assert.match(helpers.salesReportFilename(fixture(), false), /-summary\.pdf$/);
});
test("summary includes branding, branch, correct cash basis, and authoritative totals", () => {
	const doc = buildSalesReportPdf(fixture(), { includeDetails: false });
	assert.equal(doc.getNumberOfPages(), 1, "a typical summary fits on one A4 page");
	const text = pdfText(doc);
	for (const label of ["Prime Test Facility", "Central Branch", "Management summary", "140.00", "70.00", "20.00", "50.00", "60.00", "CURRENTBALANCES"]) {
		assert.ok(text.includes(label), label);
	}
	assert.ok(text.includes("not accounting profit"));
	assert.ok(!text.includes("TRANSACTIONCLIENT"));
	assert.ok(!text.includes("REAGENTPURCHASE"));
});
test("negative net cash movement remains negative rather than looking like profit", () => {
	const report = fixture();
	report.summary.expensePayments = 100;
	report.summary.netCashMovement = -30;
	const text = pdfText(buildSalesReportPdf(report, { includeDetails: false }));
	assert.ok(text.includes("-30.00"));
});
test("full report includes every required detail section without recomputing totals from sales", () => {
	const text = pdfText(buildSalesReportPdf(fixture(), { includeDetails: true }));
	for (const label of ["TRANSACTIONCLIENT", "OLDDEBTCOLLECTION", "REAGENTPURCHASE", "UNPAIDCLIENT"]) {
		assert.ok(text.includes(label), label);
	}
	assert.ok(text.includes("70.00"));
});
test("empty report is printable and explicitly labels missing records", () => {
	const report = fixture();
	for (const key of ["transactions", "receipts", "expenses", "outstanding", "paymentMethods", "outstandingBySource"]) report[key] = [];
	for (const key of Object.keys(report.summary)) report.summary[key] = 0;
	const doc = buildSalesReportPdf(report, { includeDetails: true });
	const text = pdfText(doc);
	assert.ok(text.includes("No records for this period."));
	assert.ok(text.includes("0.00"));
});
test("long reports paginate and retain the final transaction and numbered footers", () => {
	const report = fixture();
	report.transactions = Array.from({ length: 160 }, (_, index) => ({
		...report.transactions[0], billingId: index + 1000, patientName: `CLIENTMARKER${index}`,
	}));
	const doc = buildSalesReportPdf(report, { includeDetails: true });
	assert.ok(doc.getNumberOfPages() > 3);
	const text = pdfText(doc);
	assert.ok(text.includes("CLIENTMARKER159"));
	assert.ok(text.includes(`Page ${doc.getNumberOfPages()} of ${doc.getNumberOfPages()}`));
});

function modalHarness(api) {
	const states = [], deps = [], effects = [], cleanups = [], calls = [], revoked = [];
	let cursor = 0;
	const react = {
		...require("react"),
		useState(initial) {
			const index = cursor++;
			if (!(index in states)) states[index] = typeof initial === "function" ? initial() : initial;
			return [states[index], value => { states[index] = typeof value === "function" ? value(states[index]) : value; }];
		},
		useRef(initial) {
			const index = cursor++;
			if (!(index in states)) states[index] = { current: initial };
			return states[index];
		},
		useEffect(effect, next) {
			const index = cursor++;
			if (!deps[index] || next.some((value, i) => value !== deps[index][i])) {
				deps[index] = next;
				effects.push(() => { cleanups[index]?.(); cleanups[index] = effect(); });
			}
		},
	};
	const Component = load("components/Billing/SalesReportModal.tsx", {
		react,
		"../Auth/customFetch": { customFetch: async endpoint => { calls.push(endpoint); return api(); } },
		"../serverActions/requestHeaders": { getRequestContext: async () => ({ tenantId: 123456 }) },
		"../../lib/companyImage": { companyImageUrl: () => "/logo" },
		"../../lib/salesReport": helpers,
		"./salesReportPdf": { buildSalesReportPdf: () => ({ output: () => "PDF", save() {} }) },
		"react-toastify": { toast: { warning() {} } },
	}, {
		fetch: async () => ({ status: 404 }),
		URL: { createObjectURL: () => "blob:report", revokeObjectURL: url => revoked.push(url) },
	}).default;
	function render() {
		cursor = 0;
		const tree = Component({ branchId: 4, from: "2026-10-01", to: "2026-10-19" });
		while (effects.length) effects.shift()();
		return tree;
	}
	function nodes(tree, predicate) {
		if (!tree || typeof tree !== "object") return [];
		if (Array.isArray(tree)) return tree.flatMap(child => nodes(child, predicate));
		return [...(predicate(tree) ? [tree] : []), ...nodes(tree.props?.children, predicate)];
	}
	function find(predicate) { render(); return nodes(render(), predicate)[0]; }
	find(node => node.props?.children === "Sales & Expenses Report").props.onClick();
	return { render, find, calls, revoked };
}

test("modal uses the selected period and makes failed report requests visible", async () => {
	const harness = modalHarness(async () => ({ status: "error", statusCode: 403, message: "Branch not permitted" }));
	await harness.find(node => node.props?.onClick && Array.isArray(node.props.children)).props.onClick();
	assert.deepEqual(harness.calls, ["billing/sales/report?branchid=4&from=2026-10-01&to=2026-10-19"]);
	assert.equal(harness.find(node => node.props?.role === "alert").props.children, "Branch not permitted");
	assert.equal(harness.find(node => node.type === "iframe"), undefined);
});

test("modal invalidates generated PDFs when dates change and revokes their object URLs", async () => {
	const harness = modalHarness(async () => ({ status: "success", statusCode: 200, data: fixture() }));
	await harness.find(node => node.props?.onClick && Array.isArray(node.props.children)).props.onClick();
	assert.ok(harness.find(node => node.type === "iframe"));
	assert.equal(harness.find(node => node.props?.children === "Print").props.disabled, true);
	harness.find(node => node.type === "iframe").props.onLoad();
	assert.equal(harness.find(node => node.props?.children === "Print").props.disabled, false);
	harness.find(node => node.props?.id === "sales-report-from").props.onChange({ target: { value: "2026-10-02" } });
	assert.equal(harness.find(node => node.type === "iframe"), undefined);
	assert.deepEqual(harness.revoked, ["blob:report"]);
});

test("closing the modal discards a late report response", async () => {
	let resolve;
	const pending = new Promise(done => { resolve = done; });
	const harness = modalHarness(() => pending);
	const generating = harness.find(node => node.props?.onClick && Array.isArray(node.props.children)).props.onClick();
	harness.find(node => node.props?.children === "Close").props.onClick();
	resolve({ status: "success", statusCode: 200, data: fixture() });
	await generating;
	assert.equal(harness.find(node => node.type === "iframe"), undefined);
});
