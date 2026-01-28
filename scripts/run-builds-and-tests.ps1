$ErrorActionPreference = "Stop"

npm run build

$server = $null
$alreadyRunning = $false
try {
  Invoke-WebRequest -Uri "http://127.0.0.1:3000/health" -UseBasicParsing -TimeoutSec 1 | Out-Null
  $alreadyRunning = $true
} catch {
  $alreadyRunning = $false
}

if (-not $alreadyRunning) {
  $stdoutLog = Join-Path $env:TEMP "mcp_server_stdout.log"
  $stderrLog = Join-Path $env:TEMP "mcp_server_stderr.log"
  if (Test-Path $stdoutLog) { Remove-Item $stdoutLog -Force }
  if (Test-Path $stderrLog) { Remove-Item $stderrLog -Force }

  $server = Start-Process -FilePath "node" -ArgumentList "dist/index.js" -PassThru -RedirectStandardOutput $stdoutLog -RedirectStandardError $stderrLog
  $started = $false
  for ($i = 0; $i -lt 30; $i++) {
    if ($server.HasExited) { break }
    try {
      Invoke-WebRequest -Uri "http://127.0.0.1:3000/health" -UseBasicParsing -TimeoutSec 1 | Out-Null
      $started = $true
      break
    } catch {
      Start-Sleep -Milliseconds 500
    }
  }

  if (-not $started) {
    if (-not $server.HasExited) {
      Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue
    }
    $stdoutContent = if (Test-Path $stdoutLog) { Get-Content $stdoutLog -Raw } else { "" }
    $stderrContent = if (Test-Path $stderrLog) { Get-Content $stderrLog -Raw } else { "" }
    throw "MCP server did not start on port 3000. Stdout: $stdoutContent Stderr: $stderrContent"
  }
}

$buildScripts = Get-ChildItem -Path tests -Recurse -Filter "build-*.ps1" | Sort-Object FullName
$results = @()
foreach ($script in $buildScripts) {
  try {
    $output = & powershell -NoProfile -ExecutionPolicy Bypass -File $script.FullName 2>&1
    $results += [pscustomobject]@{ Script = $script.FullName; Status = "ok"; Output = ($output -join "`n") }
  } catch {
    $results += [pscustomobject]@{ Script = $script.FullName; Status = "fail"; Output = $_.Exception.Message }
  }
}

if ($server -and -not $server.HasExited) {
  Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue
}

$results | ForEach-Object {
  Write-Host "[$($_.Status)] $($_.Script)"
}

$failed = $results | Where-Object { $_.Status -ne "ok" }
if ($failed.Count -gt 0) {
  Write-Host "Failed scripts:"
  $failed | ForEach-Object { Write-Host "  $($_.Script): $($_.Output)" }
}

npm test
