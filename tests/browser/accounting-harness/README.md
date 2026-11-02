# Isolated Pharmacy Accounting browser verification

This uses installed Chrome through the DevTools protocol, real React accounting
components, the actual Pharmacy layout CSS, real PrimeTable, shared Lab Accounting table/report styles, shared
currency/select helpers, Bootstrap and application styles. Authenticated
transport, application identity and the server-action boundary are synthetic.
The harness selects the application's Segoe UI font option with a system fallback;
it does not load Next's generated Google-font assets.
It does **not** start Next, build the production application, use tenant sessions,
or persist financial mutations. Unknown fixture endpoints fail explicitly instead
of being reported as successful empty data.

From the frontend root:

1. Run `node tests/browser/accounting-harness/serve.cjs` as an attached process.
   It prints its random `127.0.0.1` URL and exact temporary bundle directory.
2. Run `node tests/browser/accounting-harness/verify.cjs <printed-url>`.
   `ACCOUNTING_CHROME` may override the installed Chrome executable path.
   `ACCOUNTING_SCREENSHOTS` optionally saves screenshots in the specified directory.
3. GET `<printed-url>/shutdown` after verification. This stops only the owned
   harness and deletes its exact generated bundle directory. The verifier closes
   its own Chrome instance and removes its temporary browser profile.

Checks include 19 accounting destinations, seven additional AR/AP views and three
pharmacy guide/purchasing pages × desktop/mobile × light/dark (116 cases), keyboard focus,
rendered overflow, accessible control names, decorative form ancestors, real
supplier keyboard selection, exact references and drill-down IDs, actual draft
and AP-application handler payloads, signed allocation evidence, retrieval errors,
and print-media tables/headings with four generated PDFs. Computed-style assertions
check flat Lab Accounting table frames, minimum editable-table control widths,
neutral Payroll metrics, the configured
application font and theme-coloured primary actions. Switching workflows must
preserve an unfinished application form. Financial statements reuse the overview's
label/value/description summaries for all 14 sales, stock and ledger metrics;
checks include large monetary values fitting without line breaks and a separate
operating-expenses metric. Screenshot/PDF bytes remain in memory
unless screenshot output is explicitly enabled; no production data is used.

Guide checks cover task search, topic and guide-type filters, clearing filters,
linked topic expansion, and device-local reading markers. Purchasing checks exercise request submission,
own-request approval denial, an independent approval's exact version/quotation/
idempotency payload and its link to the original order's delivery form.
The isolated transport confirms these particular purchasing actions in memory,
returning fresh response objects like JSON transport; it never changes a real
database. Other accounting mutations remain recorded failures for payload checks.
Request/quotation tables must remain readable and keyboard-scrollable on mobile.
Financial statements must render Expenses and Liabilities headings only once,
without repeating the group name as a column on every row.

Accounting pages must not duplicate the feature sidebar's 19 destinations.
Pages reuse Lab Accounting's ReportShell styles for breadcrumbs, headings and
report content, and its AccountingTable styles for flat tables. Summaries use
Payroll-style neutral strips rather than Billing gradients. Journal/expense
editors use a main form, review aside and save bar. Receivables and payables expose
one workflow at a time; visited forms remain mounted to preserve unfinished edits.
Print and full-filtered exports sit outside the filter form.

This is synthetic real-browser regression evidence, not certification of the
authenticated Next deployment, live books, MySQL behavior, subjective visual
design, or exhaustive accessibility compliance.
