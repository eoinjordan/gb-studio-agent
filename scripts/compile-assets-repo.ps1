$sourceRoot = "C:\Users\Eoin\Documents\assets"
$repoRoot = "C:\Users\Eoin\Documents\gbstudio-assets-repo"

$assetDirs = @(
  "backgrounds",
  "sprites",
  "tilesets",
  "music",
  "sounds",
  "fonts",
  "avatars",
  "emotes",
  "ui",
  "misc"
)

foreach ($dir in $assetDirs) {
  New-Item -ItemType Directory -Path (Join-Path $repoRoot $dir) -Force | Out-Null
}

function Get-SourceName {
  param([string]$fullPath)
  $relative = $fullPath.Substring($sourceRoot.Length).TrimStart('\')
  if ([string]::IsNullOrWhiteSpace($relative)) {
    return "_root"
  }
  $parts = $relative.Split('\')
  if ($parts.Count -le 1) {
    return "_root"
  }
  return $parts[0]
}

function Get-AssetType {
  param([string]$fullPath, [string]$extension)
  $lower = $fullPath.ToLowerInvariant()

  if ($extension -in @(".mod", ".uge", ".mp3", ".wav", ".ogg", ".flac")) {
    if ($lower -match "\\\\sfx\\\\" -or $lower -match "sfx") {
      return "sounds"
    }
    return "music"
  }

  if ($extension -in @(".ttf", ".otf")) {
    return "fonts"
  }

  if ($extension -in @(".png", ".jpg", ".jpeg", ".gif", ".bmp")) {
    if ($lower -match "\\\\backgrounds\\\\" -or $lower -match "background") { return "backgrounds" }
    if ($lower -match "\\\\tilesets\\\\" -or $lower -match "tileset") { return "tilesets" }
    if ($lower -match "\\\\sprites\\\\" -or $lower -match "sprite" -or $lower -match "character" -or $lower -match "npc") { return "sprites" }
    if ($lower -match "\\\\ui\\\\" -or $lower -match "hud" -or $lower -match "cursor" -or $lower -match "frame") { return "ui" }
    if ($lower -match "\\\\emotes\\\\" -or $lower -match "emote") { return "emotes" }
    if ($lower -match "\\\\avatars\\\\" -or $lower -match "avatar") { return "avatars" }
    if ($lower -match "\\\\fonts\\\\" -or $lower -match "font") { return "fonts" }
    return "misc"
  }

  return $null
}

$manifest = @()
$assetFiles = Get-ChildItem -Path $sourceRoot -Recurse -File | Where-Object {
  $_.Name -notlike "._*" -and $_.Extension -ne ".DS_Store"
}

foreach ($file in $assetFiles) {
  $extension = $file.Extension.ToLowerInvariant()
  $assetType = Get-AssetType -fullPath $file.FullName -extension $extension
  if (-not $assetType) {
    continue
  }

  $relative = $file.FullName.Substring($sourceRoot.Length).TrimStart('\')
  $sourceName = Get-SourceName -fullPath $file.FullName
  if ($sourceName -eq "_root") {
    $relativeInside = $relative
  } else {
    $relativeInside = $relative.Substring($sourceName.Length).TrimStart('\')
  }
  $destinationDir = Join-Path $repoRoot $assetType
  $destinationDir = Join-Path $destinationDir $sourceName
  if ($relativeInside) {
    $destinationDir = Join-Path $destinationDir (Split-Path $relativeInside -Parent)
  }

  New-Item -ItemType Directory -Path $destinationDir -Force | Out-Null
  $destinationPath = Join-Path $destinationDir $file.Name
  Copy-Item -Path $file.FullName -Destination $destinationPath -Force

  $manifest += [pscustomobject]@{
    type = $assetType
    source = $sourceName
    relativeSourcePath = $relative
    relativeRepoPath = $destinationPath.Substring($repoRoot.Length).TrimStart('\')
  }
}

$manifestPath = Join-Path $repoRoot "manifest.json"
$manifest | ConvertTo-Json -Depth 4 | Out-File -FilePath $manifestPath -Encoding utf8

Write-Host "Asset repo built at $repoRoot"
Write-Host "Manifest written to $manifestPath"
