param(
  [string]$Tag = "latest",
  [switch]$DryRun,
  [switch]$AllowExisting,
  [string]$Otp
)

$ErrorActionPreference = "Stop"

function Write-Header([string]$Message) {
  Write-Host ""
  Write-Host "== $Message =="
}

function Assert-Command([string]$Command, [string]$ErrorMessage) {
  try {
    & $Command | Out-Null
  } catch {
    Write-Error $ErrorMessage
    exit 1
  }
}

Write-Header "Checking npm auth"
try {
  $npmUser = (& npm whoami 2>$null).Trim()
} catch {
  Write-Error "Not logged in to npm. Run: npm login --auth-type=legacy"
  exit 1
}

if (-not $npmUser) {
  Write-Error "Not logged in to npm. Run: npm login --auth-type=legacy"
  exit 1
}

Write-Host "npm user: $npmUser"

Write-Header "Reading package version"
$pkg = Get-Content -Raw package.json | ConvertFrom-Json
$packageName = $pkg.name
$localVersion = $pkg.version
Write-Host "package: $packageName"
Write-Host "version: $localVersion"

Write-Header "Checking registry version"
$remoteVersion = $null
try {
  $remoteVersion = (& npm view $packageName version 2>$null).Trim()
} catch {
  $remoteVersion = $null
}

if ($remoteVersion) {
  Write-Host "registry: $remoteVersion"
  if ($remoteVersion -eq $localVersion -and -not $AllowExisting) {
    Write-Error "Version $localVersion is already published. Bump version or pass -AllowExisting."
    exit 1
  }
} else {
  Write-Host "registry: (not found or no access)"
}

Write-Header "Building"
& npm run build
& npm run build:mcp

if (-not (Test-Path "build/mcp.js")) {
  Write-Error "Missing build/mcp.js after build:mcp."
  exit 1
}

Write-Header "Publishing"
$publishArgs = @("publish", "--access", "public", "--tag", $Tag)
if ($DryRun) {
  $publishArgs += "--dry-run"
}

$otpValue = $Otp
if (-not $otpValue -and $env:NPM_OTP) {
  $otpValue = $env:NPM_OTP
}
if ($otpValue) {
  $publishArgs += @("--otp", $otpValue)
}

& npm @publishArgs
