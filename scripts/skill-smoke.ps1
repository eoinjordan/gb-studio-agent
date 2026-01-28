param(
  [string]$ProjectTemplate = "tests/poachermon",
  [string]$OutputRoot = $env:TEMP,
  [switch]$KeepTemp
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path | Split-Path -Parent
$templatePath = Join-Path $repoRoot $ProjectTemplate
if (-not (Test-Path $templatePath)) {
  throw "Project template not found: $templatePath"
}

$apiBase = $env:GBSTUDIO_API_URL
if (-not $apiBase) {
  $port = $env:GBSTUDIO_API_PORT
  if (-not $port) {
    $port = $env:PORT
  }
  if (-not $port) {
    $port = "3000"
  }
  $apiBase = "http://localhost:$port"
}
$apiBase = $apiBase.TrimEnd("/")

$projectRoot = Join-Path $OutputRoot ("gbstudio-mcp-smoke-" + [guid]::NewGuid().ToString())
Copy-Item -Recurse -Force $templatePath $projectRoot

Push-Location $repoRoot

$started = $false
try {
  Write-Host "Building project..."
  npm run build
  npm run build:mcp

  try {
    $health = Invoke-WebRequest -UseBasicParsing "$apiBase/health" -TimeoutSec 2
  } catch {
    $health = $null
  }

  if (-not $health) {
    $proc = Start-Process node -ArgumentList "dist/index.js" -WorkingDirectory $repoRoot -PassThru
    $started = $true
    Start-Sleep -Seconds 2
  }

  $health = Invoke-WebRequest -UseBasicParsing "$apiBase/health" -TimeoutSec 5
  Write-Host "REST health:" $health.Content

  Write-Host "Running MCP smoke test..."
  & node (Join-Path $repoRoot "scripts/skill-smoke.mjs") $projectRoot
} finally {
  if ($started) {
    Stop-Process -Id $proc.Id
  }

  Pop-Location

  if ($KeepTemp) {
    Write-Host "Smoke test project root: $projectRoot"
  } else {
    Remove-Item -Recurse -Force $projectRoot
  }
}
