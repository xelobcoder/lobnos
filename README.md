### PRIME LABORATORY SOFTWARE(PLS) INTEGRADED LABORATORY SOFTWARE FOR SMALL TO MEDIUM CLINICAL LABORATORIES ###
 *This is a software for small to large facillity that helps to manage laboratories bith on premises and online *

## Layout preference

The product name is **Prime Laboratory Software (PLS)**. Legacy repository names
and saved preference keys are technical identifiers, not product branding.
Desktop installation settings and licenses retain their original Electron
user-data directory so the corrected display name does not relocate them.

Tenant administrators select the facility-wide workspace layout in
**Application Settings**. The setting applies to all users in that facility and
is not a per-user preference. The available presentations are **Classic**,
**Zoho Books-inspired**, and **Claude-inspired**.

All presentations use the same permitted navigation links, names, order and
hierarchy. Zoho Books-inspired uses a full-width dark application header and a
light sidebar with indented, icon-bearing subpages and blue active-page
selection. Claude-inspired uses a warm neutral sidebar and header. Sections
can be opened on demand, with one section open at a time. No replacement
categories or page dropdowns are introduced. Collapsing the whole sidebar
leaves accessible icon buttons, and opening a group expands it again. The
existing applications launcher remains available.

## Patient portal presentation

The patient and administrative portals share the same shell and controls.
Typography follows the facility's configured software workspace (including
Lato for Slack Aspire), rather than a patient-only font. The backend supplies
only the appearance settings needed by patients, not operational configuration.
The desktop sidebar is 272px wide, matching Slack Aspire; on phones navigation
reflows above the content.

Patient dashboard and billing summaries use the same `AnalyticSummaryCard`
renderer as **Daily Sales → Financial Summary**, including colored gradient
cards, uppercase labels, icons and tabular values. Billing totals are computed
in cents and are shown only after the bills load successfully.

Use **Test trends** in the patient sidebar to follow released results over time.
Switch between **Chart** and **Values** to see either the plot or newest-first
value cards with reference ranges and changes from the previous result on that
page. Qualified/text values remain visible but are never converted into numeric
measurements or percentage changes. The full recorded-data table is expandable.

**My Results** uses the shared PLS date-filter control: presets, custom start/end
dates and **Clear dates**. Filtering uses inclusive request dates on the server,
before the 500-test limit, so older requests can be found directly. The portal
uses a two-column navigation grid on small phones, wrapping forms and summaries,
44px mobile controls and locally scrollable tables instead of page overflow.

Use **Request tests** to send laboratory test selections to the facility.
Submitting a request is not a confirmed bill or payment. Staff review incoming
requests under **Patient Portal Administration → Test requests** before creating
a General bill; patients can then see the resulting bill under **Billing**.

## Adaptive laboratory billing

After patient selection or registration, facilities using only General / Cash
pricing go directly to billing. Tests and prices load automatically from the
existing billing initializer; **Start Transaction** is not an extra prerequisite.
**Reload tests and prices** refreshes the catalog when needed. Optional referral
organization and clinician fields do not change the General price list.

The backend's `billing/strategies/mode-capability` response determines the flow.
An active, currently valid non-General strategy mapping or NHIS strategy retains
the existing source-selection workflow. General mappings alone do not make a
facility advanced. Mapped strategies with incomplete pricing stay on the advanced
path so existing pricing validation can reject an invalid configuration. Unmapped
non-NHIS strategy templates are not an effective billing arrangement.

Configuration and catalog responses are fetched afresh for each new billing
context. No facility prices are cached across patient, branch or tenant changes.
Failed configuration, patient or catalog requests display an error and **Retry**;
they never silently select General or allow billing with a failed catalog.
Drafts, related bills, adjustments and reference-code pricing keep their existing
initialization/restoration steps. The transaction API, source IDs, server-side
checkout calculations, payments and database schema are unchanged.

Focused regression checks:

```powershell
pnpm exec node --test tests\billing-workflow.test.cjs tests\suspended-billing.test.cjs
```

For a live smoke test, use a test patient in a non-production facility with an
active sales session. Check that General-only billing opens without a source
choice, shows current catalog prices without another click, accepts optional
referrals, and completes a sale through the usual payment/receipt workflow.
Repeat with NHIS, private-insurer, organization and clinician pricing configured:
source selection and the corresponding pricing rules must remain available.
Also test an unavailable catalog and a facility change; neither may reuse prices
from the previous context.

### Registration prompts and referral shortcuts

- **Settings → Application settings → Billing** has two switches.
  - **Ask About Home Collection**: shows the home-collection question after billing.
  - **Ask For Results Delivery Mode**: shows the delivery-mode question. When this
    switch is off, every test is saved as **hard copy**.
  - Both switches are off by default. Changes apply to the next sale, with no
    redeploy needed.
- **Expenses** has its own sidebar under `/billing/expenses`, and CRM links are not
  shown there. The CRM menu keeps a single **Expenses** entry that opens the module.
- On the billing page, **+ Add organization** and **+ Add clinician** open a
  name-only form. Phone and email are optional. The new entry is selected straight
  away, and an existing entry with the same name is reused.
- A clinician can refer from several organizations. After a clinician is
  selected, billing lists the organizations they refer from for a one-click
  choice. It also offers to save a newly selected organization to that clinician.
  A clinician added while an organization is selected is linked to it.
  - On the clinician profile, **Organizations this clinician refers from** lets
    staff add or remove these organizations.
  - **Main Organization** stays the default. Organization commissions go to the
    facility the case came from.

## Tenant-aware login

The login form has exactly two inputs: **Username** and **Password**. A username
contains the public organization identifier, `S` (staff), `C` (clinician), or `P`
(patient), followed by the local account ID, for example `PLS20154S004`. Account
IDs are displayed with a minimum of three digits. The server resolves the
public organization prefix through the organization registry to its internal
tenant ID (for example, `397773`), then looks up account ID 4 only in that
tenant's database. New internal tenant IDs are unique random six-digit numbers
from 100000 to 999999; they are not displayed as the username prefix.
Legacy short tenant IDs and old account login usernames are automatically
migrated by the backend during startup; administrators do not need to run a
migration command. Existing passwords and account IDs are retained. Users whose
old sessions reference a renumbered tenant must sign in again.
The verified tenant is stored in the signed session and used by shared API
request helpers. No central user directory is populated or synchronized.

The signed `PLS-SESSION` cookie contains identity, tenant scope and only the
settings required by middleware authorization. The backend access token has its
own cookie; full application settings are loaded from the authenticated context
endpoint, not embedded in the signed session. Growing facility settings therefore
cannot overflow the browser's cookie limit. Before reporting success, login
verifies that the browser retained its session (10-second context timeout), then
fully navigates to the role-specific workspace. Missing sessions and timeouts
display a retryable error rather than an endless "Redirecting..." message.

```powershell
node --test tests\auth-login.test.cjs tests\login-redirect.test.cjs
```

Click **Forgot password?** beside the password label. Enter the full username
(pre-filled if entered on the sign-in form) and the registered email address.
The organization prefix provides tenant scope; the email must match that tenant-local
account. Enter the emailed six-digit OTP within 10 minutes, then choose a new
password of at least eight characters. Codes are single-use, allow five failed
attempts, and can be resent after 60 seconds. A tenant needs an active default
email provider for delivery.

## Patient portal

Patients choose **Patient** on the staff login page to open the dedicated
`/patient-access/login` screen, then remain inside `/patientportal`.
Authenticated admins/managers opening `/patientportal` go directly to pending
invitations in `/patient-portal-admin`. Anonymous administration links retain a
validated portal destination through staff sign-in; other roles cannot use it.
Both the public account screens and the authenticated portal use a scoped
Device Manager-style shell (Inter typography, dark chrome, green actions),
without the main PLS or CRM navigation. Staff are redirected away from patient pages.

Public login posts to the same-origin Next API proxy at `/api/v1/login/patient`
without a session or tenant query. The backend resolves the facility from the
username (for example `PLS20154P004`). `/api/auth/login` validates the returned
token and sets HttpOnly session cookies; the browser then verifies
`/api/auth/context-retrieval` before navigating. Browser storage is only an optional
cache, not authentication. A backend response of **Token not provided** before
credentials are checked indicates the backend login allowlist needs the exact
patient POST login route; do not work around it by sending a staff session.

- **Patient pages:**
  - **Home:** an action-led dashboard: results ready, bills to pay (with the
    facility's payment instructions), next appointment, active home
    collections and the facility contact card.
  - **My Results:** grouped by visit. Released reports use the same
    `LaboratoryReport` document and A4 PDF exporter as the main laboratory
    report, including facility/per-test styling, category groups, units,
    reference ranges, flags, comments and genuine verification metadata.
    **Generate PDF** opens a downloadable PDF; **Print report** uses browser
    printing. Long tables repeat headings across PDF pages. A phone-friendly
    **Results at a glance** summary (value, units, range, High/Low) sits above
    the formal report and is not printed.
  - **Test trends:** Chart and Values views with a within/below/above-range
    badge and a link to the full report.
  - **Request tests:** a basket with an estimated total; selected tests can be
    carried into a home collection booking.
  - **Home collection:** when enabled, patients pick an active collection
    area (with its fee), a date up to 60 days ahead and an hourly slot, enter
    the address, landmark and phone, optionally share their location and
    tests, and then track each booking on a status timeline. Bookings can be
    cancelled online while Pending or Confirmed (before a collector is
    assigned). Staff manage them in the
    existing Home Collection module; status changes notify the patient.
  - **Appointments:** requests choose from hourly slots with live capacity;
    cancel or reschedule requests.
  - **Billing:** patient-only payable, paid and outstanding summaries, bills,
    payments, receipts, payment instructions and a printable statement.
  - **My Account:** notification preferences, password change and sign-out.
- **Activation and recovery:**
  - `/patient-access/invite?token=…` opens a staff invitation.
  - `/patient-access/register` is self-registration, linked from the login page in patient mode.
  - `/patient-access/forgot-password` resets a password with an emailed
    six-digit code after verifying facility code, patient ID, date of birth
    and email. The first step always returns the same generic message.

  These pages are public and send no tenant. The backend resolves the facility from the invitation or facility code.
- **Portal settings** also control result-ready notifications, booking hours,
  per-hour appointment and home-collection capacity, the home collection note,
  payment instructions and the patient help contact.
- **Staff:** admins and managers configure the portal and review its audit log at
  `/patient-portal-admin/settings` (also available in
  *Application Settings › Patient Portal*). `/patient-portal-admin` opens a
  pending invitation list with name/patient-number search, status filtering,
  server pagination, masked email, inviter and creation/expiry dates. Admins and
  managers can revoke pending invitations or replace pending/expired invitations
  after confirmation. **Send email / Resend email** and **Send SMS** use
  facility-configured delivery channels; unavailable actions explain the missing
  contact, provider configuration or entitlement. Link-only invitations remain
  available. Replacement invalidates the old link. A 60-second per-patient
  cooldown prevents rapid repeated issuance. Provider acceptance is not a
  delivery receipt. Delivery failure is
  explicitly shown as a warning with a new link that can be copied and shared securely.
  Accepted and revoked invitations have no replacement action.
  `/patient-portal-admin/access` searches patients and preserves account and result
  release controls. The old `/crm/patient-portal` URL redirects to this dedicated
  administration workspace, which has its own navigation and no CRM menu.
  The dedicated workspace is restricted to admins/managers by middleware.
  In **CRM › Customers**, open a patient's
  actions menu (three dots) and select **Patient Portal**. This action is available
  to admins, managers and scientists (including the super-admin override).
  It opens the CRM patient transactions page directly at the
  **Patient portal access** panel for:
  - creating, emailing and revoking invitations;
  - enabling or disabling access (admin/manager);
  - releasing or withdrawing individual results (admin/manager/scientist).

  Release is offered only for verified results awaiting release, so payment and verification gates cannot be bypassed.
- Results, bills and contact details are personal health data. Invitation links are
  shown once, and staff should share them only with the patient.

```powershell
pnpm exec node --test tests\patient-portal.test.cjs tests\portal-invitations.test.cjs tests\auth-login.test.cjs tests\server-api-proxy.test.cjs tests\login-redirect.test.cjs
pnpm exec node --test tests\laboratory-report.test.cjs tests\company-image.test.cjs
```

### Portal-style staff layout

In **Application Settings**, choose **Portal** as the facility workspace layout
to use the administrative portal's dark sidebar, green active state, Inter font
and white header in the staff application. This is an additional layout option,
not a change to the existing default. Existing staff navigation, module and role
permissions, sidebar collapse and mobile navigation still apply. It does not add
staff navigation to patient pages.

## Super-admin client platform

Provisioning requires the facility's report address and offers optional street
and digital/GPS address details. Select pharmacy, email, SMS, inventory and device
interfacing activation, each with a monthly price and a shared currency. Select
single- or multiple-branch support; both initially create the main branch.
Explicit single-branch facilities cannot add extra branches.

The payments page shows itemized module prices and their enabled-module monthly
total. **Use module total for monthly schedule** fills the payment form; save it
to apply the subscription. Existing payments are not rewritten. Email and SMS
still require provider setup. Explicitly disabled module APIs are blocked and
their ordinary-user menu entries are hidden; the super-admin menu stays complete.
Legacy facilities without explicit selections preserve their existing behavior.

The super-admin MENU launcher extends the existing admin module menu with
**Platform Administration**. It does not list every individual page; module
pages remain available through their section navigation.

Lab billing supports **Suspend Sale** and **Suspend Quote**. Saved transactions
appear under **Suspended Transactions** and resume with current prices, selected
tests/services, billing source and entity. **Convert to Sale** on a price quote
requests a patient and restores the quote as a new sale. Resuming does not record
payments; enter them before submitting the sale. Suspending a resumed transaction
updates its existing draft rather than creating another entry.

The client platform sections are also listed under **Platform Administration**:
**Medical Device Interfacing** (`/settings/facilities/devices`: select a facility to
add, edit, activate/deactivate or delete its analyzer definitions, ports, connection
mode, TLS settings and tenant-local test IDs). This reuses the existing settings
editor, but saves through platform-authorized routes to the selected facility's
database. Changes appear in that facility's Device Manager device discovery;
they do not enable its interfacing module or bypass licensing. Mutations record
the authenticated platform administrator in the facility audit history.

**Provisioning** (`/settings/facilities`: registry, provisioning, activate/deactivate),
**Website applications** (`/settings/facilities/applications`: review applications,
approve independent marketplace access, and provision or link a PLS facility),
**Payments & subscriptions** (`/settings/facilities/payments`: select a facility to manage
access, schedules and payments) and **Audit logs** (`/settings/facilities/audit`: select a
facility for a paginated, human-readable history). The sections below describe each area.

Website applications begin pending and are not public or able to sign in until a
platform super-admin approves them. Open **Website applications**, review the
facility, and select **Approve application**. In **Approved facilities**, choose
**Review and provision PLS facility** to prefill the existing provisioning form.
Review the company details, select the official location, configure modules, and
enter a new PLS administrator name and password. Confirm the facility identity
before provisioning; website passwords are never retrieved or reused.
Alternatively, link an existing active PLS tenant after confirming the identity.
Existing independent catalog data requires controlled mapping rather than being
silently discarded. Approval, provisioning and tenant linking are distinct
audited operations; marketplace approval does not verify payments.

Marketplace APIs derive tenancy from authenticated sessions and do not accept
the `tenantId` query parameter used by ordinary tenant APIs. The shared request
helpers retain authentication headers while omitting that parameter only for
marketplace endpoints.

Select **Manage facility** in Provisioning to configure **Website directory,
catalog and client login**. Set the public slug, official location, currency and
approved login URL, then explicitly enable facility and catalog publication.
The saved profile overrides any environment entry for that tenant, including
unpublication. Optional comma-separated panel tariff IDs label selected live
tariffs as panels without changing prices. A linked application and public profile
must use the same slug. Login hosts must be allowlisted in the website configuration.
Remote portals require HTTPS; same-machine development can explicitly permit
loopback HTTP on both services. Existing PLS tenants may publish discovery and
catalogs without enabling marketplace bookings.

Open **Settings > Platform Administration > Client platform**
(`/settings/facilities`) using an authorized platform super-admin account.
Choose **Manage** beside a registered facility to activate/deactivate it or
manage subscription payments. Access changes require a reason and are audited.
The control facility cannot be deactivated, and failed or still-provisioning
facilities cannot be activated through this page.

For test cleanup, **Delete tenant** opens an explicit confirmation form: enter
the exact organization identifier and a reason. This permanently removes the
registry record, not the database. Subscription payments and facility audit
records are preserved; legacy registry-linked records follow database cascades.
Platform home and facilities still provisioning cannot be deleted. Use
deactivation instead when you only want to disable access temporarily.

Configure each client's daily, weekly, monthly, or yearly frequency, amount,
currency, and schedule start date. Periods are due at their start. Choose
**Mark paid**, enter the payment date, required reference and optional notes, then confirm.
This records a full-period payment, not a partial payment or bank reconciliation.
The page distinguishes paid, unpaid, and overdue periods. Use the viewing date
to inspect another period range. Payment history survives schedule changes;
incorrect entries can be voided with a reason rather than erased.
Each selected facility also has a paginated **Facility audit history** showing
provisioning stages, access changes, subscription changes, recorded payments,
and payment corrections, including the initiating tenant/staff IDs and reasons.
Audit loading is independent of subscription loading.
**Platform home (protected)** identifies the configured default/control tenant
where platform administrators sign in. It is protected from self-deactivation;
the label does not mean the facility has paid or indicate a provisioning stage.
Later schedule changes must start on an existing period boundary; earlier unpaid
periods remain owed. Scheduled plans are displayed separately. The page warns
about older overdue periods outside the viewing range and when payment history
is limited to the latest 500 records.

Payment status does **not** automatically suspend or reactivate a client.
Those remain separate super-admin decisions.

Expand **Provision a new facility** to onboard another company.
Use the status filter alongside search to find clients, or clear both filters.
The provisioning form shows field-specific errors and focuses the first invalid
field. You can generate a secure initial password, show/hide it, and choose a
license-duration preset. After provisioning, copy the generated identifiers
and administrator username using their Copy buttons. Passwords are not copied
or included in the success result.
Enter the company details, select country, state/region, and district, and
provide an initial administrator name, email, password, and license duration.
Click **Create and provision facility** once and wait for setup to finish.

The backend creates the organization registry entry, unique six-digit internal
tenant ID, isolated database, required reference data and runtime configuration,
license, and tenant-local administrator. The result shows the organization
identifier, tenant ID, database name, and generated administrator username.
Passwords are never displayed in the result. Share credentials securely.
Ordinary facility administrators cannot provision other facilities; the backend
enforces this independently of the navigation and page access checks.

Server authorization requires the live `super-admin` role in the registered
default/control tenant, not an administrator in a customer facility.
The login session endpoint accepts this exact role after backend token
verification, and super-admin sign-in directs to the client platform page.
The backend needs multi-tenant mode, an active
`FACILITY_PROVISIONING_PLATFORM_USER_ID`, valid location records, licensing/JWT
configuration, and MySQL 8 schema-creation permissions.
Provisioning uses the supplied `db-exports/primelabmaster/tables-structure`
exports and allowlisted reference seeds. Include these backend SQL assets in
deployment; TypeScript compilation does not copy them.
See the backend `docs/platform-facility-onboarding.md` for deployment setup.
Provisioning does not send administrator credentials by email. Configure a
facility email provider before expecting password-recovery email delivery.

## Electron desktop distribution

The Electron target packages the existing production Next.js standalone server
and the compiled `lobnos-server` backend. Electron is only the desktop window
and process manager: it does not replace Next.js, statically export the site, or
duplicate the PLS interface.

### Prerequisites for building installers

- Node.js and pnpm on the build computer
- The `lobnos` and `lobnos-server` repositories in sibling directories
- Installed dependencies in both repositories
- A provisioned facility database accessible through the backend `.env`
- A protected external issuer keypair and installation-password verifier

Generic standalone auto-provisioning has been retired. Provision and migrate the
database on the target computer before running the desktop application. The licensed
build is facility-specific: it resolves the tenant from the backend `.env`, then maps
that `.env` database connection into the packaged desktop configuration. For a
development `.env`, the build uses `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`,
and `DATABASE`; for production, it uses the corresponding `PRODUCTION_DB_*` settings.
Control-database settings come from `SYSTEM_CONFIG_DB_*` and `SYSTEM_CONFIG_DATABASE`.

For a facility installer, create the untracked
`desktop/config/desktop.env` with `PLS_DESKTOP_MODE=facility` and the central
`PLS_FACILITY_URL=https://...`. Facility installers deliberately package only
the example backend configuration; database credentials are not distributed
to client laptops.

Do not commit production credentials. This facility-specific installer contains the
database credentials read from `.env`; protect the installer like that credential and
build it for the machine/environment that will run the database connection. On a new
installed machine, the saved connection can be managed in:

- Windows: `%APPDATA%\Prime Laboratory System\config\backend.env`
- Linux: `~/.config/Prime Laboratory System/config/backend.env`

### Troubleshooting database startup failures

If the desktop reports that the backend stopped before becoming ready, inspect
the backend messages in Electron's `desktop.log`. MySQL `Access denied` means
the configured database account was rejected; rebuilding or increasing the
startup timeout does not repair credentials.

The desktop always runs the backend with `NODE_ENV=production`. Configure
`PRODUCTION_DB_HOSTNAME`, `PRODUCTION_DB_PORT`, `PRODUCTION_DB_USERNAME`,
`PRODUCTION_DB_PASSWORD`, and `PRODUCTION_DATABASE` in the backend environment
file. `DB_*` settings are not used for this initial connection. Tenant
connections separately use `DB_USERNAME` and `DB_PASSWORD`, with `DB_HOST` and
`DB_PORT` as registry fallbacks, even in production; verify those settings too.
For multi-tenant installations, also verify all `SYSTEM_CONFIG_DB_*` settings
and `SYSTEM_CONFIG_DATABASE` against the control database.

Existing installations retain their application-data configuration across
rebuilds and reinstalls. Correct the saved `config/backend.env` above and restart
PLS; updating only `desktop/config/backend.env` does not replace that saved file.
Also update the build configuration before packaging future installers. Verify
the account can connect to both configured databases without changing MySQL
users or grants just to bypass a startup failure.

### Offline signed desktop activation

#### Build once, configure each installation

The recommended reusable Windows build runs from the sibling backend checkout:

```powershell
pnpm.cmd run desktop:build:licensed
```

Before building, provision the target facility database and finish its schema migrations,
seeds and registry setup. The build resolves its tenant from the backend `.env` and uses
the configured database connection. It packages a facility-specific desktop that starts
both the backend and frontend against that existing database; it never provisions a
database or creates a MySQL account. Generic standalone auto-provisioning is retired.

Before a real release, configure a new installation password with the backend's
`pnpm.cmd run desktop:configure-install-password` command. It uses a masked prompt and
saves only an external verifier; the builder reuses it on later builds. The installer
prompts for this authorization password. It is separate from MySQL credentials and
signed device activation.

The packaged backend connection settings are derived from `.env` and copied into the
facility-specific desktop configuration. As a result, the installer/runtime contains
database credentials; protect it as a secret and do not broadly distribute a package
that contains a MySQL root password. Prefer a dedicated, least-privileged database user
for a distributable release. On first launch the backend and frontend start directly;
there is no database setup or provisioning screen.

The existing per-user configuration remains at
`app.getPath("userData")/config/backend.env` across upgrades. An administrator may
correct that configuration and restart PLS if connection details change. Do not use the
desktop app to create databases or modify MySQL users/grants.

See the backend [standalone installation guide](../lobnos-server/docs/standalone-installation.md)
for baseline assets, privileges, retry semantics, validation and release prerequisites.

Each device uses its own activation request and imports its own signed certificate
bound to device, installation identity and configured facility. The package pins signed
mode/public key. Do not copy another installation's `licensing` directory or certificate.

The backend build resolves the facility tenant from the database registry. If needed,
pass `--tenant-id <ID>` to explicitly pin the facility during the licensed build. No
network license service, global activation count, or tamper-proof executable protection
is claimed.

The desktop hides its License and Settings menus from end users. For administrator
activation, PLS creates `PLS-activation-request.json` in the per-user config folder.
Send that file to the licensing administrator. To install the returned certificate,
place it in the same folder as `PLS-signed-certificate.json` and restart PLS; it is
validated and imported automatically. On Windows the default folder is
`%APPDATA%\Prime Laboratory System\config`. The certificate file is removed after
successful import; a rejected file is retained and the reason is recorded in
`desktop.log`.

Configure `PLS_LICENSE_MODE=signed` and
`PLS_LICENSE_PUBLIC_KEY` with the issuer's public Ed25519 PEM key (dotenv supports
quoted `\n` escapes). Follow the backend's signed-licensing setup to generate the
issuer key outside the customer installation. The signed certificate is JSON so its
validity dates are readable, but changing any signed field invalidates its Ed25519
signature; the dates cannot be extended by editing the file. The existing database
validity and grace-period rules continue to apply independently.

The backend workflow and issuer CLI commands are documented in the sibling
backend's [offline licensing guide](../lobnos-server/docs/offline-licensing.md).
Build a new installer to include the hidden file-based activation workflow.

Desktop installation identity and license state are stored under the user's
application-data `licensing` directory, not in the packaged runtime. Do not
distribute this directory or reuse another machine's activation request.
Facility-mode clients have no local activation menu: licensing is enforced by
the central backend.

Existing deployments default to `legacy` mode until explicitly configured.
Signed desktop installers pin the mode and issuer public key from their packaged
configuration. Facility-specific signed installers additionally pin the tenant;
generic installers take the tenant only from validated local setup. Editing the saved per-user environment
cannot downgrade that policy or substitute a different signer. Changes to a
signed installer's trust policy require a new build; customer administrators
with filesystem access can still tamper with runtime files.

Offline activation cannot enforce a global activation count or immediately
revoke a disconnected installation. It is not a substitute for a separately
hosted licensing service or publisher-signed updates. Customer administrators
can still modify local executables; installation binding and signatures add
protection but do not make customer-controlled computers tamper-proof.

### Signing Windows releases

Electron Builder supports Authenticode signing when a publisher's code-signing
certificate is supplied through its supported certificate configuration (for
example `CSC_LINK` and `CSC_KEY_PASSWORD`). Keep certificate files and passwords
outside the repository and runtime; use your release environment's secret store.
Use `pnpm desktop:dist:win:signed` for releases that must be signed. This enables
Electron Builder's `forceCodeSigning` option so missing credentials fail the
build rather than producing an unsigned installer. Obtain a publisher
certificate before using that release command.
This repository does not manufacture a trusted certificate or implement an
automatic update service.

### Build and test the staged runtime

```powershell
pnpm desktop:prepare
pnpm desktop:verify
pnpm desktop:run
```

`desktop:prepare` performs production builds, stages the Next.js standalone SSR
server, creates a production-only backend dependency tree, and rebuilds native
backend modules for Electron's bundled Node runtime. The customer does not need
Node.js, npm, or pnpm.

Staging removes unused `src` trees from the compiled `agent-base`, `fecha`, and
`zod` dependencies, including their upstream tests and benchmarks. Their
JavaScript entry points and published declarations are retained. This keeps
packaged development sources out of the frontend TypeScript check without
changing compiler settings. To clean an existing unpacked installer:

```powershell
node desktop\scripts\prune-runtime-sources.cjs dist-electron\win-unpacked\resources\runtime\backend\vendor
```

The desktop backend binds to `127.0.0.1:2300`. The frontend binds to the first
available loopback port beginning at `2377`. Startup checks wait for the backend
and frontend before the application window opens. Runtime logs are written to
Electron's application log directory.

### Desktop deployment modes

The packaged desktop application supports two modes through
`config/desktop.env` in the application data directory:

- **Standalone mode** (`PLS_DESKTOP_MODE=standalone`): starts the local
  `lobnos-server` backend and local Next.js SSR server. This is suitable for one
  computer.
- **Facility mode** (`PLS_DESKTOP_MODE=facility`): loads
  `PLS_FACILITY_URL=https://pls.facility.local` and starts no local backend,
  database connection, or Next.js server. This is the recommended mode for
  multiple laptops sharing one facility server.

The installed configuration is stored at:

- Windows: `%APPDATA%\Prime Laboratory System\config\desktop.env`
- Linux: `~/.config/Prime Laboratory System/config/desktop.env`

Edit that file and restart PLS to switch an installed client between modes.
For a trusted local network without HTTPS, set
`PLS_FACILITY_ALLOW_HTTP=true` and use an `http://` facility URL. HTTPS remains
recommended because HTTP traffic, including patient data, is not encrypted.
Facility HTTPS certificates must be trusted by the laptop operating system;
self-signed certificates should be installed through the facility's managed
certificate authority rather than bypassing certificate validation.

To deploy ten laptops, run Next.js SSR and `lobnos-server` once on a central
Ubuntu facility server behind HTTPS/Nginx, set the facility URL in the
facility installer profile, and distribute that installer to each laptop. The
same central URL can also be opened in a normal browser; the existing web
deployment remains unchanged.

### Create installers

Build the Windows one-click NSIS installer on Windows:

```powershell
pnpm desktop:dist:win
```

The output is `dist-electron/PLS-Setup-<version>-x64.exe`.

Build the Ubuntu/Linux AppImage on Linux:

```bash
pnpm desktop:dist:linux
```

The output is `dist-electron/PLS-<version>-x64.AppImage`. Package each operating
system on that operating system (or in its matching CI runner). `electron-builder`
also supports standard `CSC_LINK` and `CSC_KEY_PASSWORD` environment variables
when a Windows signing certificate is available.

The packaging layout intentionally leaves room for a future
`electron-updater` publisher configuration without coupling updates to the PLS
business logic.

### Existing web and Ubuntu deployment

The normal commands remain unchanged:

```bash
pnpm dev
pnpm build
pnpm start
```

The web target remains a server-rendered Next.js application and
`lobnos-server` remains independently deployable behind Nginx on Ubuntu. The
only shared Next.js change is `output: "standalone"`, which adds a production
artifact and does not change SSR behavior.

## Tauri Desktop Window

Tauri runs the existing Next.js application in a lightweight Windows WebView2
desktop window without embedding Chromium or creating a production Next.js
build.

Install dependencies once:

```powershell
pnpm install
```

Start the Next.js development server and Tauri together:

```powershell
pnpm tauri:dev
```

By default, Tauri reads `LOBNOS_APP_URL` from `.env.local` or `.env` and falls
back to `http://localhost:2377`.

The URL must use HTTP or HTTPS.

### Create a Windows installer

The installer reads `LOBNOS_APP_URL` from `.env` and includes that environment
file as an application resource:

```powershell
pnpm tauri:build
```

On Windows, both `tauri:build` and `tauri:dev` initialize the installed Visual
Studio C++ Build Tools environment before running Cargo and explicitly select
Microsoft's x64 linker. They can therefore be invoked from Git
Bash, PowerShell, or VS Code without Git's Unix `link.exe` shadowing the
Microsoft linker.

Finish installing the **Desktop development with C++** workload, including a
Windows 10 or Windows 11 SDK, before running either command. The launcher checks
for the linker and SDK libraries and reports incomplete installations explicitly.

The generated installer is placed under `src-tauri/target/release/bundle/nsis`.
When `.env` points to `localhost`, the PLS Next.js server must be running on
the target computer. For a server-hosted deployment, set `LOBNOS_APP_URL` to
the deployed HTTPS URL before building.

## Build Protection

The application includes build protection to secure the compiled Next.js application code using encrypted archives:

### Creating Protected Build
After building the application, create a password-protected archive:
```bash
# Run the protection script
encrypt-build.bat
```

This will:
1. Build the Next.js application
2. Create a ZIP archive of the `.next` folder
3. Encrypt the archive with AES-256-GCM
4. Protect the application code from unauthorized access

### Running the Protected Application
Use the secure launcher to run the protected application:
```bash
launcher/launcher-secure.exe
```

The launcher will automatically extract the protected archive at startup.

### Security Features
- **AES-256-GCM encryption** on compressed archives
- **Single encrypted file** for fast protection/access
- **Automatic extraction** at application startup
- **Build integrity verification**
- **Machine fingerprint validation**
- **License-based access control**
## Laboratory workflow bypass

Application Settings -> Billing Settings controls collection, sample validation and
processing bypasses independently. The server computes a workflow object for every
test (`canCollect`, `canValidateSample`, `canProcess`, `canEnterResults`,
`blockedReason`); Daily Requests shows skipped stages as "Bypassed by configuration"
and opens results entry without an empty sample-validation step. No timestamps or
actors are fabricated for bypassed stages. A container that was actually started but
not completed, or that was rejected, still blocks results entry.

## Staff PIN security

Settings -> Application Settings -> Staff authorization PIN security lets an
administrator set the failed-PIN attempt limit (1-20, default 5). When a staff member
reaches the limit they stay locked until an administrator performs an audited reset
(a reason is required). Resetting clears the counter only; it does not change the PIN.
