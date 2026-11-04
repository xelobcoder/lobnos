# Synthetic laboratory NHIS fixture

This bundles the **production** `NhisWorkspace`, forms, and accounting workspace
navigation with installed Next webpack, React and TypeScript. Only authenticated
transport, Next links/navigation and full application session are mocked. No
credentials, tenant requests or real patient data are used. This is not an app
route, and is never included in production navigation.

From the frontend root:

```powershell
pnpm exec node tests/browser/nhis-harness/build.cjs
# Parent owns this bounded browser helper; prints random loopback URL and PID:
pnpm exec node tests/browser/nhis-harness/serve.cjs
# After browser checks, GET <printed-url>/shutdown (removes exact temp bundle).
```

The build-only command verifies compilation and deletes its temporary output.
Serve compiles once and retains only its temporary bundle until shutdown.
Bootstrap and `styles/globals.css` (including its modular CSS imports) are served
from the frontend. Real accounting layout/nav CSS modules are bundled via the
existing accounting harness TypeScript/CSS loader. No web fonts are downloaded.
Light/dark themes can be checked with `document.documentElement.dataset.bsTheme`.

Initial all-result totals: expected **GHS 1,200,000.00**, received **500,000.00**,
outstanding **700,000.00**, across two synthetic service-date bills (January 2026).
Opening receipt is February 10, 2026, so January cash is zero while January
service-period receivables still show current receipt settlement.

Useful browser scenarios:

- Select BILL-101 and BILL-102, enter allocations 0.10 and 0.20, actual amount
  0.30, unique reference, reason, and effective date today. Submit a bank receipt;
  all reports refresh and outstanding becomes 699,999.70.
- Try amount 0.31 against those allocations (rejected before network), negative
  or >2-decimal money, allocation above each outstanding, missing metadata,
  date before January service, and future dates.
- Choose tariff adjustment or bad debt deliberately. Both are noncash and omit
  paymentAccountCode. Submit 100.00 to BILL-101; cash totals must not increase.
- Expand audit allocations, then Reverse an event, supply separate reference,
  reason/date, and explicitly confirm. Original remains; signed reversal appears.
- “Reject next mutation” returns a visible backend-style error. Retry unchanged
  keeps requestKey. “Lose next success response” applies once but returns an
  error; unchanged retry returns alreadyApplied without a duplicate allocation.
- Change a failed payload: posting is blocked until audit-review acknowledgement.
  Inspect exact calls with `window.nhisFixture.calls`.
- Query `?readonly=1` hides all mutations; `?receiptOnly=1` hides adjustment and
  reversal controls. `?authorityError=1`, `?reportError=1` exercise visible errors;
  `?warnings=1` shows excluded mixed bills and legacy/reconciliation warnings.
  Each page reload resets only the synthetic in-memory books.

The fixture validates schemas, balance limits, idempotency, reference uniqueness,
one exact reversal, and synthetic authority. It is not live database or
authenticated deployment certification. The server remains authoritative.
