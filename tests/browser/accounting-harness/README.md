# Isolated Pharmacy Accounting browser verification

This uses installed Chrome through the DevTools protocol, real React accounting
components, real PrimeTable, Bootstrap and application styles. Only authenticated
transport, application identity and the server-action boundary are synthetic.
It does **not** start Next, build the production application, use tenant sessions,
or persist financial mutations.

From the frontend root:

1. Run `node tests/browser/accounting-harness/serve.cjs` as an attached process.
   It prints its random `127.0.0.1` URL and exact temporary bundle directory.
2. Run `node tests/browser/accounting-harness/verify.cjs <printed-url>`.
   `ACCOUNTING_CHROME` may override the installed Chrome executable path.
3. GET `<printed-url>/shutdown` after verification. This stops only the owned
   harness and deletes its exact generated bundle directory. The verifier closes
   its own Chrome instance and removes its temporary browser profile.

Checks include 19 destinations × desktop/mobile × light/dark, keyboard focus,
rendered overflow, accessible control names, decorative form ancestors, real
supplier keyboard selection, exact references and drill-down IDs, actual draft
and AP-application handler payloads, signed allocation evidence, retrieval errors,
and print-media tables/headings with four generated PDFs. Screenshot/PDF bytes
remain in memory; no production data or screenshot artifacts are saved.

This is synthetic real-browser regression evidence, not certification of the
authenticated Next deployment, live books, MySQL behavior, subjective visual
design, or exhaustive accessibility compliance.
