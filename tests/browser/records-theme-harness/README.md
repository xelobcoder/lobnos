# PLS records and journal theme checks

This fixture renders the production records pages, manual journal, backup components, and theme provider with synthetic API responses. It contains no credentials and does not contact a backend. PDF exports are disabled.

Run the fast regression checks:

```powershell
node --test tests\records-theme.test.cjs tests\backup-encryption-policy.test.cjs
```

Run computed-color and interaction checks in Chrome:

```powershell
node tests\browser\records-theme-harness\verify-render.cjs
```

Set `PLS_CHROME` to the browser executable if Chrome is not installed at its default Windows location. The check creates and removes its own browser profile and compiled output.

Coverage includes live light/dark switching, text contrast, outline-control hover/active states, populated and empty tables, settings and request dialogs, employee-loading errors, unauthorized access without a settings request, key-rotation refresh, and zero/unbalanced/balanced journal totals. The journal summary is also checked at a 320px viewport.

For manual inspection:

```powershell
node tests\browser\records-theme-harness\serve.cjs
```

Use the printed loopback URL with `?page=security`, `backup`, `requests`, `access`, `journal`, or `progress`. Optional flags are `&empty`, `&unauthorized` (security), and `&employeeError` (access). Open `/shutdown` on that origin to stop the fixture and remove its compiled output.
