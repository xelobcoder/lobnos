# Lobnos LIMS Launcher - Client Deployment Package

## Files to Include for Client:

### Required:
- `launcher.exe` - Main application launcher
- `launcher.exe.manifest` - Windows application manifest
- `.env` - Configuration file (contains server/client ports and health URLs)

### Recommended:
- `README.md` - User instructions and troubleshooting
- `unblock.bat` - Helper script to resolve Windows security warnings

### Optional:
- None (all essential files included)

## Deployment Instructions:

1. **Create deployment folder** on client machine (e.g., `C:\Lobnos\Launcher\`)

2. **Copy files**:
   ```
   launcher.exe
   .env
   README.md
   unblock.bat
   ```

3. **First run setup**:
   - Right-click `launcher.exe` → Properties → General → Check "Unblock"
   - Or run `unblock.bat` to automate this

4. **Configure environment** (if needed):
   - Edit `.env` file to match client's network configuration
   - Default ports: Server=2399, Client=2377

5. **Setup automatic startup** (optional):
   - Run `setup-startup.bat` for simple startup folder method
   - Or run `setup-startup.ps1` (as Administrator) for Task Scheduler method
   - Recommended: Use Task Scheduler for better control and reliability

## Automatic Startup Options:

### Option 1: Startup Folder (Simple)
```cmd
setup-startup.bat
```
- Creates shortcut in Windows Startup folder
- Runs when user logs in
- Easy to remove (delete shortcut)

### Option 2: Task Scheduler (Recommended)
```powershell
# Run as Administrator
.\setup-startup.ps1
```
- More reliable than startup folder
- Runs with administrator privileges
- Includes network availability checks
- Can be configured with delays if needed

### Option 3: Manual Setup
1. Press Win+R, type `shell:startup`
2. Create shortcut to `launcher.exe`
3. Place in startup folder

## Startup Troubleshooting:

If launcher fails at startup:
1. Check Windows Event Viewer for errors
2. Ensure XAMPP services are available
3. Verify network connectivity
4. Check antivirus exclusions

## Removing from Startup:

### Startup Folder Method:
- Win+R → `shell:startup`
- Delete the launcher shortcut

### Task Scheduler Method:
```powershell
.\setup-startup.ps1 -Remove
```
Or manually remove from Task Scheduler (taskschd.msc)

## Windows Startup Reliability

### Enhanced for Automatic Startup
This version of the launcher includes special improvements for reliable operation when set to run automatically at Windows startup:

- **30-second boot delay** - Allows Windows to fully initialize
- **Network connectivity verification** - Ensures internet/network access before starting services
- **Retry mechanisms** - Automatically retries failed services up to 3 times with exponential backoff
- **Extended timeouts** - Longer wait times for services to become available (45-90 seconds)
- **Comprehensive logging** - Detailed debug.log for troubleshooting startup issues

### Startup Troubleshooting

If the launcher fails to start services automatically:

1. **Check debug.log** in the launcher folder for detailed error messages
2. **Verify XAMPP installation** - Ensure Apache and MySQL can start manually
3. **Test network connectivity** - Run `ping 8.8.8.8` to verify internet access
4. **Check Windows Event Viewer** - Look for application errors under Windows Logs → Application
5. **Review Task Scheduler** - Ensure the task is running with proper permissions

### Manual Testing
Before relying on automatic startup, test the launcher manually:
```cmd
# From the launcher directory
launcher.exe
```
Check debug.log for any errors during manual execution.

## Troubleshooting:

If antivirus blocks the launcher:
1. Run `unblock.bat`
2. Add the launcher folder to Windows Defender exclusions
3. Submit `launcher.exe` to Microsoft for analysis

## Support:

Contact Lobnos support if you encounter issues during deployment.