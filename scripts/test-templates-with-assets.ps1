$repoRoot = "C:\Users\Eoin\Documents\gbstudio-assets-repo"
$templateRoot = "C:\Users\Eoin\git\workspace\gb-studio-latest\appData\templates"
$outputRoot = Join-Path "C:\Users\Eoin\git\workspace\tests" ("template_builds_" + (Get-Date -Format "yyyyMMdd_HHmmss"))

$backgroundAsset = Get-ChildItem -Path (Join-Path $repoRoot "backgrounds") -Recurse -Filter *.png -File | Select-Object -First 1
$spriteAsset = Get-ChildItem -Path (Join-Path $repoRoot "sprites") -Recurse -Filter *.png -File | Select-Object -First 1

if (-not $backgroundAsset) {
  Write-Host "No background assets found in $repoRoot"
  exit 1
}

if (-not $spriteAsset) {
  Write-Host "No sprite assets found in $repoRoot"
  exit 1
}

New-Item -ItemType Directory -Path $outputRoot -Force | Out-Null

$templates = @("blank", "gbs2", "gbhtml")

foreach ($template in $templates) {
  $templatePath = Join-Path $templateRoot $template
  $projectRoot = Join-Path $outputRoot $template
  Copy-Item -Path $templatePath -Destination $projectRoot -Recurse -Force

  $gbsprojPath = Join-Path $projectRoot "project.gbsproj"
  if (Test-Path $gbsprojPath) {
    $content = Get-Content -Path $gbsprojPath -Raw
    $content = $content -replace "___PROJECT_NAME___", ("template_" + $template)
    $content = $content -replace "___AUTHOR___", "Eoin"
    Set-Content -Path $gbsprojPath -Value $content -Encoding utf8
  }

  $backgroundsDir = Join-Path $projectRoot "assets\backgrounds"
  $spritesDir = Join-Path $projectRoot "assets\sprites"
  New-Item -ItemType Directory -Path $backgroundsDir -Force | Out-Null
  New-Item -ItemType Directory -Path $spritesDir -Force | Out-Null

  Copy-Item -Path $backgroundAsset.FullName -Destination (Join-Path $backgroundsDir $backgroundAsset.Name) -Force
  Copy-Item -Path $spriteAsset.FullName -Destination (Join-Path $spritesDir $spriteAsset.Name) -Force

  node scripts/build-template-project.js $projectRoot $backgroundAsset.FullName $spriteAsset.FullName
}

Write-Host "Template builds complete: $outputRoot"
