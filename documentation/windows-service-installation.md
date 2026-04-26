# Windows Service Installation (Frontend)

This guide explains how to install and manage the Lobnos frontend as a Windows Service so it runs in the background and starts automatically when the PC boots.

## What This Creates

- **Service internal name:** `PrimeLabSystemEnterpriseRuntime`
- **Service display name:** `PrimeLabSystemEnterprise Runtime`
- **Startup type:** Automatic (starts on boot)
- **Runner:** NSSM (Non-Sucking Service Manager)
- **Command executed:** `node --env-file=.env server.js`

Logs are written to:

- `logs/lobnos-service-out.log`
- `logs/lobnos-service-error.log`

## Prerequisites

- Windows machine with Administrator access (UAC prompt will appear during install/start/stop).
- Node.js installed and available in PATH.
- A valid `.env` file in the project root.
- Project dependencies installed (`npm install`).

## Step 1: Install NSSM (Required Once Per Machine)

Run:

```powershell
npm run service:prereq:win
```

This tries to install NSSM using `winget`, `choco`, or `scoop`. If none are available, it downloads `nssm.exe` into:

`scripts/windows/tools/nssm.exe`

## Step 2: Build the Frontend (Production Build)

The service runs in production mode and requires a Next.js build output (`.next/BUILD_ID`).

```powershell
npm run build
```

## Step 3: Install the Windows Service

```powershell
npm run service:install:win
```

This will request elevation (UAC). After installation, the service is configured to auto-start at boot.

If you want it to start immediately after installing:

```powershell
npm run service:install:win -- -StartNow
```

## Step 4: Manage the Service

Check status:

```powershell
npm run service:status:win
```

Start:

```powershell
npm run service:start:win
```

Stop:

```powershell
npm run service:stop:win
```

Restart:

```powershell
npm run service:restart:win
```

## Step 5: Uninstall the Service

```powershell
npm run service:uninstall:win
```

## Troubleshooting

### Service says it does not exist

Install it first:

```powershell
npm run service:install:win
```

### Service installs but site doesn’t load

- Confirm backend URLs in `.env` are correct.
- Ensure port `2377` is open/available on the machine.
- Check service logs:
  - `logs/lobnos-service-out.log`
  - `logs/lobnos-service-error.log`

### Next.js build output missing

Rebuild:

```powershell
npm run build
```

### Replacing an older service name

If an older service was installed under a different name, uninstall that old service first (by passing its exact service name to the uninstall script), then install the new one:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\windows\uninstall-service.ps1 -ServiceName "<OLD_SERVICE_NAME>"
npm run service:install:win
```

