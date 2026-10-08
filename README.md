### LOBNOS INTEGRADED LABORATORY SOFTWARE FOR SMALL TO MEDIUM CLINICAL LABORATORIES ###
 *This is a software for small to large facillity that helps to manage laboratories bith on premises and online *

## Tenant-aware login

The login form accepts a tenant ID and uses it for backend authentication. The
verified tenant is stored in the signed session and is used by the shared API
request helpers for later requests. `TENANTID` supplies the default shown by
the login form; users can select another tenant when the frontend serves
multiple tenants.

## Electron desktop distribution

The Electron target packages the existing production Next.js standalone server
and the compiled `lobnos-server` backend. Electron is only the desktop window
and process manager: it does not replace Next.js, statically export the site, or
duplicate the PLS interface.

### Prerequisites for building installers

- Node.js and pnpm on the build computer
- The `lobnos` and `lobnos-server` repositories in sibling directories
- Installed dependencies in both repositories
- A production backend environment file for standalone installers

Create `desktop/config/backend.env` from
`desktop/config/backend.env.example` and enter the deployment's database and
service settings. This untracked file is copied into the installer and then to
the user's application-data directory on first launch. Alternatively, set
`PLS_DESKTOP_BACKEND_ENV` to an environment-file path when packaging.

For a facility installer, create the untracked
`desktop/config/desktop.env` with `PLS_DESKTOP_MODE=facility` and the central
`PLS_FACILITY_URL=https://...`. Facility installers deliberately package only
the example backend configuration; database credentials are not distributed
to client laptops.

Do not commit production credentials. Standalone installer commands stop before
packaging when no explicit production configuration is present, preventing an
unusable or accidentally misconfigured customer build. Each installed machine
can override its configuration in:

- Windows: `%APPDATA%\Prime Laboratory System\config\backend.env`
- Linux: `~/.config/Prime Laboratory System/config/backend.env`

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