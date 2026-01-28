# PowerShell script to automate MCP API calls for building a GB Studio game
# 1. Ensure you have created a new project in GB Studio and saved it in the target directory
# 2. Update $projectRoot to your project path
# 3. Add or modify API calls as needed for your game

$projectRoot = "C:/Users/Eoin/git/workspace/tests/pong"
$templateRoot = "C:/Users/Eoin/git/workspace/gb-studio-latest/appData/templates/blank"

# Ensure project exists
if (-not (Test-Path $projectRoot)) {
  New-Item -ItemType Directory -Path $projectRoot -Force | Out-Null
}

$gbsprojFile = Get-ChildItem -Path $projectRoot -Filter "*.gbsproj" -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $gbsprojFile) {
  Copy-Item -Path (Join-Path $templateRoot "*") -Destination $projectRoot -Recurse -Force
  $gbsprojFile = Get-ChildItem -Path $projectRoot -Filter "*.gbsproj" -ErrorAction SilentlyContinue | Select-Object -First 1
}

if ($gbsprojFile) {
  $gbsprojPath = $gbsprojFile.FullName
  $content = Get-Content -Path $gbsprojPath -Raw
  $content = $content -replace "___PROJECT_NAME___", "pong"
  $content = $content -replace "___AUTHOR___", "Eoin"
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($gbsprojPath, $content, $utf8NoBom)
}

# Create background and sprites using placeholder assets
$backgroundResponse = Invoke-RestMethod -Uri "http://localhost:3000/background/create" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body @"
{
  "projectRoot": "$projectRoot",
  "background": { "name": "Pong Background", "filename": "placeholder.png" }
}
"@
$backgroundId = $backgroundResponse.background.id

$paddleSprite = Invoke-RestMethod -Uri "http://localhost:3000/sprite/create" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body @"
{
  "projectRoot": "$projectRoot",
  "sprite": { "name": "Paddle Sprite", "numFrames": 1, "type": "actor", "filename": "actor.png" }
}
"@

$ballSprite = Invoke-RestMethod -Uri "http://localhost:3000/sprite/create" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body @"
{
  "projectRoot": "$projectRoot",
  "sprite": { "name": "Ball Sprite", "numFrames": 1, "type": "actor", "filename": "static.png" }
}
"@

$scoreSprite = Invoke-RestMethod -Uri "http://localhost:3000/sprite/create" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body @"
{
  "projectRoot": "$projectRoot",
  "sprite": { "name": "Score Sprite", "numFrames": 3, "type": "actor", "filename": "actor_animated.png" }
}
"@

# Create a new scene
$sceneResponse = Invoke-RestMethod -Uri "http://localhost:3000/scene/create" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body @"
{
  "projectRoot": "$projectRoot",
  "scene": { "name": "Pong Arena", "type": "topdown", "width": 20, "height": 18, "backgroundId": "$backgroundId" }
}
"@
$sceneId = $sceneResponse.scene.id

# Set new scene as the start scene and assign player sprite
$settingsPath = Join-Path $projectRoot "project/settings.gbsres"
$settingsJson = Get-Content -Path $settingsPath -Raw | ConvertFrom-Json
$settingsJson.defaultPlayerSprites.TOPDOWN = $paddleSprite.sprite.id
Invoke-RestMethod -Uri "http://localhost:3000/settings/update" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body (@{
  projectRoot = $projectRoot
  settings = @{
    startSceneId = $sceneId
    startX = 2
    startY = 8
    startDirection = "up"
    defaultSceneTypeId = "TOPDOWN"
    defaultPlayerSprites = $settingsJson.defaultPlayerSprites
  }
} | ConvertTo-Json -Depth 6)

# Add Right Paddle
Invoke-RestMethod -Uri "http://localhost:3000/actor/create" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body @"
{
  "projectRoot": "$projectRoot",
  "sceneId": "$sceneId",
  "actor": { "name": "Right Paddle", "x": 17, "y": 8, "spriteSheetId": "$($paddleSprite.sprite.id)" }
}
"@

# Add Ball
Invoke-RestMethod -Uri "http://localhost:3000/actor/create" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body @"
{
  "projectRoot": "$projectRoot",
  "sceneId": "$sceneId",
  "actor": { "name": "Ball", "x": 10, "y": 8, "spriteSheetId": "$($ballSprite.sprite.id)" }
}
"@

# Add Score Counter
Invoke-RestMethod -Uri "http://localhost:3000/actor/create" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body @"
{
  "projectRoot": "$projectRoot",
  "sceneId": "$sceneId",
  "actor": { "name": "Score Counter", "x": 10, "y": 2, "spriteSheetId": "$($scoreSprite.sprite.id)" }
}
"@

# Example: Add left paddle actor
# (Replace 'sceneId' with the actual ID from the inventory after scene creation)
# Invoke-RestMethod -Uri "http://localhost:3000/actor/create" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body "{ 'projectRoot': '$projectRoot', 'sceneId': 'scene_xxx', 'actor': { 'name': 'Left Paddle', 'x': 2, 'y': 8 } }"

# Example: Add more actors, triggers, or logic as needed
# ...

# Example: Get inventory to find scene and actor IDs
# Invoke-RestMethod -Uri "http://localhost:3000/inventory" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body "{ 'projectRoot': '$projectRoot' }" | ConvertTo-Json -Depth 5

Write-Host "Script complete. Review your project in GB Studio."
