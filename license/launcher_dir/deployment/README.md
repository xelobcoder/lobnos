# Lobnos LIMS Application Launcher

## Overview
This is the official launcher application for the Lobnos Laboratory Information Management System (LIMS). It automates the startup process for the complete LIMS environment with enhanced reliability for Windows startup scenarios.

## What It Does
The launcher performs the following legitimate operations:
- **License Verification**: Validates software license using hardware fingerprinting
- **Startup Delays**: Implements intelligent delays for Windows boot completion
- **Network Checks**: Verifies network availability before starting services
- **Service Management**: Starts required services (Apache HTTP Server, MySQL Database)
- **Application Launch**: Starts the Next.js server and client applications
- **Health Monitoring**: Performs health checks on running services with retry logic
- **Process Management**: Manages the lifecycle of all LIMS components

## Windows Startup Improvements

### Enhanced Startup Reliability
The launcher includes special handling for Windows startup scenarios:

- **30-second boot delay** to allow Windows to fully initialize
- **Network connectivity checks** before attempting service startup
- **Retry mechanisms** with exponential backoff for failed services
- **Extended timeouts** for service availability (45-90 seconds)
- **Multiple retry attempts** (up to 3 attempts per service)

### Startup Sequence
1. **Boot Delay**: Waits 30 seconds for Windows initialization
2. **Network Check**: Verifies internet connectivity (60-second timeout)
3. **License Validation**: Confirms software license validity
4. **XAMPP Startup**: Launches Apache and MySQL with retry logic
5. **Server Launch**: Starts Next.js server with health monitoring
6. **Client Launch**: Opens the application interface

### Troubleshooting Startup Issues

#### If launcher fails at Windows startup:
1. **Check Event Viewer**: Look for application errors in Windows Event Viewer
2. **Review debug.log**: Check the launcher directory for detailed error logs
3. **Verify XAMPP**: Ensure XAMPP is properly installed and not blocked
4. **Network Issues**: Confirm network connectivity and firewall settings
5. **Service Conflicts**: Check if ports 80, 3306, or configured ports are available

#### Manual Testing:
```cmd
# Test launcher without Task Scheduler
launcher.exe

# Check debug logs
type debug.log
```

#### Reset Startup Configuration:
```powershell
# Remove and re-add startup task
.\setup-startup.ps1 -Remove
.\setup-startup.ps1
```

## Antivirus False Positives

### Why This Happens
Windows Defender and other antivirus software may flag this executable as suspicious because it:
- Performs system-level operations (starting services, accessing hardware info)
- Makes network requests for health checking
- Accesses system files and registry
- Creates and manages processes

### Resolution Steps

#### Option 1: Unblock the File
1. Right-click `launcher.exe`
2. Select "Properties"
3. In the "General" tab, check "Unblock" at the bottom
4. Click "Apply" then "OK"

#### Option 2: Add to Windows Defender Exclusions
1. Open Windows Security
2. Go to "Virus & threat protection" > "Manage settings"
3. Scroll to "Exclusions" > "Add or remove exclusions"
4. Click "Add an exclusion" > "File"
5. Select `launcher.exe`

#### Option 3: Submit for Analysis
Submit the file to Microsoft for analysis:
- Visit: https://www.microsoft.com/en-us/wdsi/filesubmission
- Upload `launcher.exe` for review
- This helps Microsoft improve their detection algorithms

## Building from Source

### Prerequisites
- Go 1.21 or later
- Windows 10/11

### Build Commands

#### Using Batch Script (Recommended)
```cmd
build.bat
```

#### Using PowerShell Script
```powershell
.\build.ps1
```

#### Manual Build
```cmd
go build -ldflags "-H windowsgui -s -w" -o launcher.exe launcher.go
```

## Configuration
The launcher uses environment variables from `.env`:
- `SERVER_PORT`: Port for the Next.js server (default: 2399)
- `CLIENT_PORT`: Port for the client application (default: 2377)
- `HEALTH_URL`: URL for server health checking

## License
This software is part of the Lobnos LIMS system and is licensed for authorized use only.

## Support
For support or questions about antivirus warnings, contact your system administrator or Lobnos support team.