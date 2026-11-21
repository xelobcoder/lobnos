# Install the local browser application from GitHub

1. Copy `install-local-web.ps1` to the new Windows device. No `.env` files are required. Run it from PowerShell, choosing an installation directory that does not exist:

   ```powershell
   powershell -ExecutionPolicy Bypass -File .\install-local-web.ps1 -InstallDirectory D:\PLS
   ```

2. Answer the prompts for facility name, dedicated MySQL port, database password, and initial facility administrator password. Password prompts are masked; use at least 12 characters. `##` is supported. The local database host is `127.0.0.1`, application account `primelab`, and schemas `Primelabsys` / `primelabmaster_control`. Choose an unused port if MySQL already exists. The installer never replaces an existing installation or database server.
3. Wait for MySQL download/initialization, both builds, and facility provisioning. The script generates the configuration and random signing/session secrets, removes only its own marked `.build-source` directory after verification, and opens the login page. See `installation-info.json` for the administrator username. Use the password you entered. Signed license activation is still required before clinical use. Later use `Start-PLS.cmd` and `Stop-PLS.cmd`; these manage MySQL and both application servers together.

GitHub private repositories require Git Credential Manager authentication with access to both repositories. No GitHub token or database password is embedded in this script. Default branches are frontend `master` and backend `main`; override them with `-FrontendBranch` and `-BackendBranch` if needed.

Automatic setup installs missing Git and Node.js through Windows Package Manager, pnpm, the Microsoft Visual C++ x64 runtime when missing, and Oracle MySQL 8.4.13 LTS from its official ZIP distribution. It verifies the published archive checksum and Oracle executable signature. MySQL binaries and data live inside the installation directory, bind only to loopback, and use a generated root password. Configuration/data inherit permissions restricted to the installing user and SYSTEM. The root credential is retained under protected `config/automatic-setup.json` for local maintenance; the initial facility login password is removed from that file after provisioning. Keep the whole installation directory private and back up its data and configuration.

No master platform login or license is fabricated. Push application changes to GitHub before deploying them; the script downloads the selected GitHub branch, not uncommitted workstation files. Existing configured deployments can still pass both `-BackendEnvFile` and `-FrontendEnvFile` to skip automatic MySQL setup.

Use `-FrontendPort 2398 -BackendPort 2397` for an isolated test beside an existing localhost installation, or `-NoStart` to build without launching. Existing installation directories are rejected. Failed builds retain their isolated source checkout and logs for diagnosis. The runtime contains the compiled application and production dependencies; it does not retain `.git` or the application TypeScript source tree. Windows builds target Windows; build separately on Linux for a Linux VPS.
