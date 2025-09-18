# Kiosk Deployment Script for Windows
# This script sets up the SNB Puzzle App for kiosk deployment on Windows

param(
    [string]$AppUrl = "http://localhost:8080",
    [string]$KioskUser = "KioskUser",
    [switch]$SkipUserCreation = $false
)

# Configuration
$KioskAppDir = "C:\KioskApp"
$ServiceName = "KioskApp"
$ChromePath = "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe"
$EdgePath = "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

# Check if running as administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Error "This script requires administrator privileges. Please run as administrator."
    exit 1
}

Write-Status "Starting Kiosk Deployment Setup..."

# Check if Chrome or Edge is installed
$BrowserPath = $null
if (Test-Path $ChromePath) {
    $BrowserPath = $ChromePath
    $BrowserName = "Chrome"
    Write-Status "Found Google Chrome at: $ChromePath"
} elseif (Test-Path $EdgePath) {
    $BrowserPath = $EdgePath
    $BrowserName = "Edge"
    Write-Status "Found Microsoft Edge at: $EdgePath"
} else {
    Write-Error "Neither Chrome nor Edge found. Please install one of these browsers."
    exit 1
}

# Create kiosk user if not skipping
if (-not $SkipUserCreation) {
    Write-Status "Creating kiosk user: $KioskUser"
    
    try {
        # Check if user already exists
        $UserExists = Get-LocalUser -Name $KioskUser -ErrorAction SilentlyContinue
        if ($UserExists) {
            Write-Warning "User $KioskUser already exists"
        } else {
            # Create user with random password
            $Password = [System.Web.Security.Membership]::GeneratePassword(12, 2)
            $SecurePassword = ConvertTo-SecureString $Password -AsPlainText -Force
            New-LocalUser -Name $KioskUser -Password $SecurePassword -FullName "Kiosk User" -Description "Dedicated kiosk user account"
            Add-LocalGroupMember -Group "Users" -Member $KioskUser
            Write-Status "Created kiosk user: $KioskUser"
            Write-Warning "Password for $KioskUser : $Password"
        }
    } catch {
        Write-Error "Failed to create kiosk user: $($_.Exception.Message)"
        exit 1
    }
}

# Create application directory
Write-Status "Setting up application directory: $KioskAppDir"
if (Test-Path $KioskAppDir) {
    Write-Warning "Application directory already exists"
} else {
    New-Item -ItemType Directory -Path $KioskAppDir -Force
}

# Copy application files
if (Test-Path "out") {
    Write-Status "Copying application files..."
    Copy-Item -Path "out\*" -Destination $KioskAppDir -Recurse -Force
    Write-Status "Application files copied successfully"
} else {
    Write-Warning "No 'out' directory found. Please build the application first with 'npm run build'"
    Write-Status "Creating placeholder directory structure..."
}

# Set permissions for kiosk user
try {
    $Acl = Get-Acl $KioskAppDir
    $AccessRule = New-Object System.Security.AccessControl.FileSystemAccessRule($KioskUser, "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow")
    $Acl.SetAccessRule($AccessRule)
    Set-Acl -Path $KioskAppDir -AclObject $Acl
    Write-Status "Set permissions for kiosk user"
} catch {
    Write-Warning "Failed to set permissions: $($_.Exception.Message)"
}

# Create kiosk startup script
$StartupScript = @"
@echo off
REM Kiosk startup script

REM Set display to portrait mode (if supported)
powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SystemInformation]::PrimaryMonitorSize"

REM Disable screen saver
powercfg /change standby-timeout-ac 0
powercfg /change monitor-timeout-ac 0
powercfg /change hibernate-timeout-ac 0

REM Start browser in kiosk mode
"$BrowserPath" --kiosk --disable-infobars --disable-session-crashed-bubble --disable-dev-shm-usage --no-first-run --disable-default-apps --disable-popup-blocking --disable-translate --disable-background-timer-throttling --disable-renderer-backgrounding --disable-backgrounding-occluded-windows --disable-features=TranslateUI --disable-ipc-flooding-protection --autoplay-policy=no-user-gesture-required --disable-web-security --disable-features=VizDisplayCompositor --enable-features=UseOzonePlatform --ozone-platform=wayland "$AppUrl"

REM If browser crashes, restart it
:restart
timeout /t 5 /nobreak > nul
tasklist /FI "IMAGENAME eq chrome.exe" 2>NUL | find /I /N "chrome.exe">NUL
if "%ERRORLEVEL%"=="0" goto restart
if "%ERRORLEVEL%"=="1" goto restart

echo Browser crashed, restarting...
goto restart
"@

$StartupScriptPath = "$KioskAppDir\start-kiosk.bat"
$StartupScript | Out-File -FilePath $StartupScriptPath -Encoding ASCII
Write-Status "Created startup script: $StartupScriptPath"

# Create Windows service
Write-Status "Creating Windows service..."

$ServiceScript = @"
@echo off
REM Windows Service wrapper for kiosk application

cd /d "$KioskAppDir"
call start-kiosk.bat
"@

$ServiceScriptPath = "$KioskAppDir\kiosk-service.bat"
$ServiceScript | Out-File -FilePath $ServiceScriptPath -Encoding ASCII

# Install as Windows service using NSSM (Non-Sucking Service Manager)
$NssmPath = "$KioskAppDir\nssm.exe"
if (-not (Test-Path $NssmPath)) {
    Write-Status "Downloading NSSM..."
    $NssmUrl = "https://nssm.cc/release/nssm-2.24.zip"
    $NssmZip = "$env:TEMP\nssm.zip"
    Invoke-WebRequest -Uri $NssmUrl -OutFile $NssmZip
    
    # Extract NSSM
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [System.IO.Compression.ZipFile]::ExtractToDirectory($NssmZip, "$env:TEMP\nssm")
    
    # Copy appropriate NSSM executable
    if ([Environment]::Is64BitOperatingSystem) {
        Copy-Item "$env:TEMP\nssm\nssm-2.24\win64\nssm.exe" $NssmPath
    } else {
        Copy-Item "$env:TEMP\nssm\nssm-2.24\win32\nssm.exe" $NssmPath
    }
    
    # Cleanup
    Remove-Item "$env:TEMP\nssm.zip" -Force
    Remove-Item "$env:TEMP\nssm" -Recurse -Force
}

# Install service
Write-Status "Installing Windows service..."
& $NssmPath install $ServiceName $ServiceScriptPath
& $NssmPath set $ServiceName DisplayName "Kiosk Application"
& $NssmPath set $ServiceName Description "SNB Puzzle Kiosk Application"
& $NssmPath set $ServiceName Start SERVICE_AUTO_START
& $NssmPath set $ServiceName AppStdout "$KioskAppDir\service.log"
& $NssmPath set $ServiceName AppStderr "$KioskAppDir\service-error.log"

Write-Status "Windows service installed successfully"

# Configure auto-login
Write-Status "Configuring auto-login for kiosk user..."

$RegPath = "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon"
Set-ItemProperty -Path $RegPath -Name "AutoAdminLogon" -Value "1"
Set-ItemProperty -Path $RegPath -Name "DefaultUserName" -Value $KioskUser
Set-ItemProperty -Path $RegPath -Name "DefaultDomainName" -Value ""

# Set password for auto-login (this is a security consideration)
$Password = [System.Web.Security.Membership]::GeneratePassword(12, 2)
$SecurePassword = ConvertTo-SecureString $Password -AsPlainText -Force
$EncryptedPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecurePassword))
Set-ItemProperty -Path $RegPath -Name "DefaultPassword" -Value $EncryptedPassword

Write-Status "Auto-login configured for user: $KioskUser"

# Disable Windows updates (optional)
Write-Status "Configuring Windows Update settings..."
try {
    $UpdateRegPath = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate\AU"
    if (-not (Test-Path $UpdateRegPath)) {
        New-Item -Path $UpdateRegPath -Force
    }
    Set-ItemProperty -Path $UpdateRegPath -Name "NoAutoUpdate" -Value 1
    Set-ItemProperty -Path $UpdateRegPath -Name "AUOptions" -Value 1
    Write-Status "Windows Update configured for kiosk mode"
} catch {
    Write-Warning "Failed to configure Windows Update: $($_.Exception.Message)"
}

# Configure display settings
Write-Status "Configuring display settings..."
try {
    # Set display to portrait mode (if supported)
    $DisplayScript = @"
Add-Type -AssemblyName System.Windows.Forms
`$Screen = [System.Windows.Forms.Screen]::PrimaryScreen
`$Width = `$Screen.Bounds.Width
`$Height = `$Screen.Bounds.Height
Write-Host "Current resolution: `$Width x `$Height"

# Try to set portrait mode
`$DisplayScript = @"
`$code = @'
using System;
using System.Runtime.InteropServices;
public class DisplaySettings {
    [DllImport("user32.dll")]
    public static extern int ChangeDisplaySettings(ref DEVMODE devMode, int flags);
    
    [StructLayout(LayoutKind.Sequential)]
    public struct DEVMODE {
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 32)]
        public string dmDeviceName;
        public short dmSpecVersion;
        public short dmDriverVersion;
        public short dmSize;
        public short dmDriverExtra;
        public int dmFields;
        public int dmPositionX;
        public int dmPositionY;
        public int dmDisplayOrientation;
        public int dmDisplayFixedOutput;
        public short dmColor;
        public short dmDuplex;
        public short dmYResolution;
        public short dmTTOption;
        public short dmCollate;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 32)]
        public string dmFormName;
        public short dmLogPixels;
        public short dmBitsPerPel;
        public int dmPelsWidth;
        public int dmPelsHeight;
        public int dmDisplayFlags;
        public int dmDisplayFrequency;
    }
}
'@
Add-Type `$code
`$devMode = New-Object DisplaySettings+DEVMODE
`$devMode.dmSize = [System.Runtime.InteropServices.Marshal]::SizeOf(`$devMode)
`$devMode.dmFields = 0x180000
`$devMode.dmPelsWidth = `$Height
`$devMode.dmPelsHeight = `$Width
`$devMode.dmDisplayFrequency = 60
[DisplaySettings]::ChangeDisplaySettings([ref]`$devMode, 0)
"@
    Invoke-Expression $DisplayScript
    Write-Status "Display settings configured"
} catch {
    Write-Warning "Failed to configure display settings: $($_.Exception.Message)"
}

# Create management scripts
Write-Status "Creating management scripts..."

$ManagementDir = "$env:USERPROFILE\KioskManagement"
if (-not (Test-Path $ManagementDir)) {
    New-Item -ItemType Directory -Path $ManagementDir -Force
}

# Start kiosk script
$StartScript = @"
Write-Host "Starting kiosk application..."
Start-Service -Name "$ServiceName"
Get-Service -Name "$ServiceName"
"@
$StartScript | Out-File -FilePath "$ManagementDir\Start-Kiosk.ps1" -Encoding UTF8

# Stop kiosk script
$StopScript = @"
Write-Host "Stopping kiosk application..."
Stop-Service -Name "$ServiceName"
Get-Process -Name "chrome", "msedge" -ErrorAction SilentlyContinue | Stop-Process -Force
"@
$StopScript | Out-File -FilePath "$ManagementDir\Stop-Kiosk.ps1" -Encoding UTF8

# Restart kiosk script
$RestartScript = @"
Write-Host "Restarting kiosk application..."
Restart-Service -Name "$ServiceName"
Get-Service -Name "$ServiceName"
"@
$RestartScript | Out-File -FilePath "$ManagementDir\Restart-Kiosk.ps1" -Encoding UTF8

# Status check script
$StatusScript = @"
Write-Host "Kiosk Application Status:"
Write-Host "========================"
Get-Service -Name "$ServiceName"
Write-Host ""
Write-Host "Application URL:"
try {
    `$response = Invoke-WebRequest -Uri "$AppUrl" -Method Head -TimeoutSec 5
    Write-Host "Application is responding: `$(`$response.StatusCode)"
} catch {
    Write-Host "Application not responding: `$(`$_.Exception.Message)"
}
"@
$StatusScript | Out-File -FilePath "$ManagementDir\Status-Kiosk.ps1" -Encoding UTF8

# Update application script
$UpdateScript = @"
Write-Host "Updating kiosk application..."

# Stop the service
Stop-Service -Name "$ServiceName"

# Backup current version
`$BackupDir = "$KioskAppDir.backup.`$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Copy-Item -Path "$KioskAppDir" -Destination `$BackupDir -Recurse

# Copy new version
if (Test-Path "out") {
    Copy-Item -Path "out\*" -Destination "$KioskAppDir" -Recurse -Force
    Write-Host "Application updated successfully"
} else {
    Write-Host "Error: No 'out' directory found. Please build the application first."
    exit 1
}

# Restart the service
Start-Service -Name "$ServiceName"
Write-Host "Kiosk application restarted"
"@
$UpdateScript | Out-File -FilePath "$ManagementDir\Update-Kiosk.ps1" -Encoding UTF8

Write-Status "Management scripts created in: $ManagementDir"

# Create desktop shortcuts
Write-Status "Creating desktop shortcuts..."

$DesktopPath = [Environment]::GetFolderPath("Desktop")

# Start shortcut
$StartShortcut = @"
[InternetShortcut]
URL=file:///$ManagementDir/Start-Kiosk.ps1
IDList=
HotKey=0
IconFile=C:\Windows\System32\shell32.dll
IconIndex=13
"@
$StartShortcut | Out-File -FilePath "$DesktopPath\Start Kiosk.url" -Encoding ASCII

# Stop shortcut
$StopShortcut = @"
[InternetShortcut]
URL=file:///$ManagementDir/Stop-Kiosk.ps1
IDList=
HotKey=0
IconFile=C:\Windows\System32\shell32.dll
IconIndex=28
"@
$StopShortcut | Out-File -FilePath "$DesktopPath\Stop Kiosk.url" -Encoding ASCII

Write-Status "Setup completed successfully!"
Write-Host ""
Write-Host "🎉 Kiosk deployment setup is complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Build your application: npm run build"
Write-Host "2. Update the application: $ManagementDir\Update-Kiosk.ps1"
Write-Host "3. Start the kiosk: $ManagementDir\Start-Kiosk.ps1"
Write-Host "4. Reboot the system to enable auto-login"
Write-Host ""
Write-Host "🛠️  Management commands:" -ForegroundColor Yellow
Write-Host "  Start:   $ManagementDir\Start-Kiosk.ps1"
Write-Host "  Stop:    $ManagementDir\Stop-Kiosk.ps1"
Write-Host "  Restart: $ManagementDir\Restart-Kiosk.ps1"
Write-Host "  Status:  $ManagementDir\Status-Kiosk.ps1"
Write-Host "  Update:  $ManagementDir\Update-Kiosk.ps1"
Write-Host ""
Write-Host "🌐 Application URL: $AppUrl" -ForegroundColor Cyan
Write-Host "👤 Kiosk User: $KioskUser" -ForegroundColor Cyan
Write-Host "📁 App Directory: $KioskAppDir" -ForegroundColor Cyan
Write-Host ""
Write-Warning "Remember to reboot the system to enable auto-login for the kiosk user!"
Write-Warning "Password for $KioskUser : $Password"
