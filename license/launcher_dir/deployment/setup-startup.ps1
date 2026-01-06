#Requires -Version 5.1
#Requires -RunAsAdministrator

param(
    [switch]$Remove,
    [switch]$Test
)

$LauncherPath = Join-Path $PSScriptRoot "launcher.exe"
$TaskName = "Lobnos LIMS Launcher"

Write-Host "Lobnos Launcher - Task Scheduler Setup" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# Check if launcher.exe exists
if (-not (Test-Path $LauncherPath)) {
    Write-Error "launcher.exe not found in current directory"
    Write-Host "Please run this script from the launcher installation folder" -ForegroundColor Yellow
    exit 1
}

Write-Host "Found launcher: $LauncherPath" -ForegroundColor Gray

if ($Remove) {
    Write-Host "`nRemoving scheduled task..." -ForegroundColor Yellow
    try {
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction Stop
        Write-Host "SUCCESS: Task '$TaskName' removed from Task Scheduler" -ForegroundColor Green
    } catch {
        Write-Error "Failed to remove task: $($_.Exception.Message)"
    }
    exit
}

if ($Test) {
    Write-Host "`nTesting launcher execution..." -ForegroundColor Cyan
    try {
        $startInfo = New-Object System.Diagnostics.ProcessStartInfo
        $startInfo.FileName = $LauncherPath
        $startInfo.WorkingDirectory = $PSScriptRoot
        $startInfo.UseShellExecute = $false
        $startInfo.CreateNoWindow = $true

        $process = New-Object System.Diagnostics.Process
        $process.StartInfo = $startInfo
        $process.Start() | Out-Null

        Write-Host "Launcher started successfully (PID: $($process.Id))" -ForegroundColor Green
        Start-Sleep -Seconds 2

        if (-not $process.HasExited) {
            Write-Host "Launcher is running. Stopping test..." -ForegroundColor Yellow
            $process.Kill()
            $process.WaitForExit()
        }
    } catch {
        Write-Error "Test failed: $($_.Exception.Message)"
    }
    exit
}

Write-Host "`nCreating scheduled task..." -ForegroundColor Cyan

# Task action
$action = New-ScheduledTaskAction -Execute $LauncherPath -WorkingDirectory $PSScriptRoot

# Task trigger - At logon of any user
$trigger = New-ScheduledTaskTrigger -AtLogOn

# Task principal - Run with highest privileges
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType InteractiveToken -RunLevel Highest

# Task settings - Enhanced for reliability
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RunOnlyIfNetworkAvailable -DontStopOnIdleEnd -RestartOnIdle -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1)

    # Add a delay to the trigger to allow Windows more time to boot
    $trigger.Delay = "PT30S"  # 30 second delay

try {
    # Remove existing task if it exists
    $existingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    if ($existingTask) {
        Write-Host "Removing existing task..." -ForegroundColor Yellow
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    }

    # Register new task
    Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Description "Automatically starts the Lobnos LIMS application suite on system startup"

    Write-Host "SUCCESS: Task '$TaskName' created in Task Scheduler!" -ForegroundColor Green
    Write-Host "`nTask Details:" -ForegroundColor Cyan
    Write-Host "- Runs at user logon" -ForegroundColor White
    Write-Host "- Runs with administrator privileges" -ForegroundColor White
    Write-Host "- Only runs when network is available" -ForegroundColor White
    Write-Host "- Can run on battery power" -ForegroundColor White

} catch {
    Write-Error "Failed to create scheduled task: $($_.Exception.Message)"
    Write-Host "`nTroubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Make sure you're running PowerShell as Administrator" -ForegroundColor White
    Write-Host "2. Check that launcher.exe is not blocked by antivirus" -ForegroundColor White
    Write-Host "3. Try running: .\setup-startup.ps1 -Test" -ForegroundColor White
    exit 1
}

Write-Host "`nTo manage the task:" -ForegroundColor Cyan
Write-Host "- Open Task Scheduler (taskschd.msc)" -ForegroundColor White
Write-Host "- Navigate to Task Scheduler Library" -ForegroundColor White
Write-Host "- Find '$TaskName'" -ForegroundColor White
Write-Host "`nTo remove: .\setup-startup.ps1 -Remove" -ForegroundColor White

Write-Host "`nSetup complete! The launcher will now start automatically when you log in." -ForegroundColor Green