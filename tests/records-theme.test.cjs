const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");

test("records and journal surfaces do not use fixed light-only backgrounds", () => {
     const files = [
          "app/settings/records/backup-security/page.tsx",
          "app/settings/records/data-backup-restore/page.tsx",
          "app/settings/records/result-access-requests/page.tsx",
          "app/settings/records/result-accessible-settings/page.tsx",
          "app/accounting/manual-journals/new/page.tsx",
          "components/settings/backup/BackupSchedulesTable.tsx",
          "components/settings/backup/BackupLogsTable.tsx",
          "components/settings/backup/BackupProgressSection.tsx",
     ];
     for (const file of files) {
          assert.doesNotMatch(read(file), /\b(?:bg-white|bg-light|table-light)\b/, file);
     }
});

test("journal table cells and both balance states use theme-aware colors", () => {
     const css = read("app/accounting/manual-journals/new/page.module.css");
     assert.match(css, /\.tableHead\s*\{[^}]*--bs-table-bg:\s*var\(--bs-tertiary-bg\)/);
     assert.match(css, /\.summaryFooter\s*>\s*tr\s*>\s*th\s*\{[^}]*background:\s*var\(--bs-tertiary-bg\)/);
     assert.match(css, /\.summaryBalanced\s*\{[^}]*var\(--bs-success-bg-subtle\)[^}]*var\(--bs-success-text-emphasis\)/);
     assert.match(css, /\.summaryUnbalanced\s*\{[^}]*var\(--bs-danger-bg-subtle\)[^}]*var\(--bs-danger-text-emphasis\)/);
});

test("dark-mode outline controls retain distinct readable normal and active colors", () => {
     const css = read("styles/theme-contrast.module.css");
     for (const variant of ["primary", "secondary", "success", "danger", "warning", "info"]) {
          assert.match(css, new RegExp(`btn-outline-${variant}[^}]*--bs-${variant}-text-emphasis`));
     }
     assert.match(css, /--bs-btn-hover-color:\s*var\(--bs-body-bg\)/);
     assert.match(css, /--bs-btn-active-color:\s*var\(--bs-body-bg\)/);
     assert.match(css, /--bs-btn-disabled-color:\s*var\(--theme-outline-color\)/);
     assert.match(css, /:global\(\[data-bs-theme="dark"\]\)/);
     assert.match(read("app/settings/records/result-access-requests/page.tsx"), /<Badge bg="warning" text="dark"/);
});
