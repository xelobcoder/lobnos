### LOBNOS INTEGRADED LABORATORY SOFTWARE FOR SMALL TO MEDIUM CLINICAL LABORATORIES ###
 *This is a software for small to large facillity that helps to manage laboratories bith on premises and online *

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

Click **Forgot password?** beside the password label. Enter the full username
(pre-filled if entered on the sign-in form) and the registered email address.
The organization prefix provides tenant scope; the email must match that tenant-local
account. Enter the emailed six-digit OTP within 10 minutes, then choose a new
password of at least eight characters. Codes are single-use, allow five failed
attempts, and can be resent after 60 seconds. A tenant needs an active default
email provider for delivery.

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
- For generic installers: a protected external issuer keypair (the automated build
  creates/reuses it); no production environment or database access is required
- Only for facility-specific standalone installers: a reviewed facility backend env

For the recommended generic installer use the backend's `desktop:build:licensed`
command described below. For an intentional facility-specific standalone build, create `desktop/config/backend.env` from
`desktop/config/backend.env.example` and enter the deployment's database and
service settings. This untracked file is copied into the installer and then to
the user's application-data directory on first launch. Alternatively, set
`PLS_DESKTOP_BACKEND_ENV` to an environment-file path when packaging.

For a facility installer, create the untracked
`desktop/config/desktop.env` with `PLS_DESKTOP_MODE=facility` and the central
`PLS_FACILITY_URL=https://...`. Facility installers deliberately package only
the example backend configuration; database credentials are not distributed
to client laptops.

Do not commit production credentials. Direct standalone installer commands stop before
packaging when no explicit configuration is present (the automated generic command
provides its safe generated config), preventing an
unusable or accidentally misconfigured customer build. Each installed machine
can override its configuration in:

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
# Explicit default, if desired:
$env:PLS_DESKTOP_GENERIC='true'
```

Store `dist-electron/PLS-Setup-<version>-x64.exe` and distribute that same installer.
The **GENERIC standalone** package contains a reviewed safe environment with signed
mode, the issuer public key and a salted scrypt installation-password verifier, not a
tenant, plaintext password, database/API/email secrets or license state.
The issuer keypair is generated once/reused in a protected directory outside both
repositories. No backend database lookup is needed during this build.

Before a real release, configure a new installation password with the backend's
`pnpm.cmd run desktop:configure-install-password` command. It uses a masked prompt and
saves only an external verifier; the builder prompts if it is missing and reuses it later.
Missing/invalid verifier configuration blocks generic runtime preparation/release.
There is no password command-line argument or environment option.

First run opens trusted local setup before backend launch. Installation authorization
comes first. Enter only the organization name, installation password and temporary
**local MySQL 8.x administrator** host, port, username and password. MySQL must already
be running; there is no universal administrator password. PLS automatically creates
`Primelabsys`/control databases and a generated dedicated application account, installs the
complete reviewed schema/routines, runs guarded migrations and reference/runtime seeds,
and checks readiness. Tenant ID, control database and generated account fields are hidden.
Existing unowned databases/accounts are refused rather than overwritten or adopted.

Each installation saves its settings at `app.getPath("userData")/config/installation.json`.
Existing `backend.env` and licensing state are not overwritten. Application credentials
and the durable retry state in `config/provisioning.json` use Electron safeStorage and
restricted Windows ACLs; unavailable encryption blocks setup. Neither supplied password
is stored/logged. Legacy JSON settings are migrated to encrypted storage compatibly.
Passwords never reach the remote frontend or setup summary. Use native
**Settings > Database setup** to reverify/retry an owned installation with restart
confirmation. Keep recovery state after any failure; legacy installations require an
administrator to restore their original configuration rather than replace their databases.

See the backend [standalone installation guide](../lobnos-server/docs/standalone-installation.md)
for baseline assets, privileges, retry semantics, validation and release prerequisites.

Each device exports its own activation request and imports its own signed certificate
bound to device, installation identity and local organization. Tenant query parameters
cannot select another licensing identity. The package always pins signed mode/public key,
and generic launch pins standalone mode with local single-organization routing. Do not
automatically activate clients or copy another installation's `licensing` directory.

For deliberate facility-specific backwards compatibility, use the backend command with
`--facility-specific --tenant-id <ID>` (or `PLS_DESKTOP_GENERIC=false`) and review the
facility env before packaging. Only literal `true`/`false` generic values are accepted.
The generic build rejects local activation and tenant build options. No network license
service, global activation count, or tamper-proof executable protection is claimed.

The standalone desktop provides a **License** menu with **Export activation
request** and **Import signed license** actions. These use native file dialogs
and a backend CLI in the Electron main process; no license-management IPC or
private signing key is exposed to the web renderer.

For non-generic legacy/facility-specific profiles, set `PLS_LICENSE_TENANT_ID` in the standalone `backend.env` to the registered
facility's numeric tenant ID. Configure `PLS_LICENSE_MODE=signed` and
`PLS_LICENSE_PUBLIC_KEY` with the issuer's public Ed25519 PEM key (dotenv supports
quoted `\n` escapes). Follow the backend's signed-licensing setup to generate the
issuer key outside the customer installation. Export a request, send
it to the licensing administrator, and import the signed JSON file they return.
Restart PLS afterward. The existing database validity and grace-period rules
continue to apply; importing a certificate does not bypass them.

The backend workflow and issuer CLI commands are documented in the sibling
backend's [offline licensing guide](../lobnos-server/docs/offline-licensing.md).
Run `pnpm desktop:prepare` and build a new installer to include these controls;
an already-installed older executable does not gain the License menu merely
because the source code changed.

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
When `.env` points to `localhost`, the Lobnos Next.js server must be running on
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