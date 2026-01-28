# build-sidescroller.ps1
# PowerShell script to automate a basic side-scroller setup using the blank template

$projectRoot = "C:/Users/Eoin/git/workspace/tests/mcpsidescroller"
$templateAssets = "C:/Users/Eoin/git/workspace/gb-studio-latest/appData/templates/gbs2/assets"

$spriteSource = Join-Path $templateAssets "sprites"
$backgroundSource = Join-Path $templateAssets "backgrounds"

$playerSpriteFile = Join-Path $projectRoot "assets/sprites/player_platform.png"
if (-not (Test-Path $playerSpriteFile)) {
  Copy-Item -Path (Join-Path $spriteSource "player_platform.png") -Destination $playerSpriteFile -Force
}

$enemySpriteFile = Join-Path $projectRoot "assets/sprites/npc001.png"
if (-not (Test-Path $enemySpriteFile)) {
  Copy-Item -Path (Join-Path $spriteSource "npc001.png") -Destination $enemySpriteFile -Force
}

$coinSpriteFile = Join-Path $projectRoot "assets/sprites/checkbox.png"
if (-not (Test-Path $coinSpriteFile)) {
  Copy-Item -Path (Join-Path $spriteSource "checkbox.png") -Destination $coinSpriteFile -Force
}

$backgroundFile = Join-Path $projectRoot "assets/backgrounds/outside.png"
if (-not (Test-Path $backgroundFile)) {
  Copy-Item -Path (Join-Path $backgroundSource "outside.png") -Destination $backgroundFile -Force
}

# Create a background and sprites for a side-scroller
$backgroundResponse = Invoke-RestMethod -Uri "http://localhost:3000/background/create" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body @"
{
  "projectRoot": "$projectRoot",
  "background": { "name": "Side Scroller Background", "filename": "outside.png" }
}
"@
$backgroundId = $backgroundResponse.background.id

$playerSprite = Invoke-RestMethod -Uri "http://localhost:3000/sprite/create" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body @"
{
  "projectRoot": "$projectRoot",
  "sprite": { "name": "Player Platform Sprite", "numFrames": 6, "type": "actor", "filename": "player_platform.png" }
}
"@

$enemySprite = Invoke-RestMethod -Uri "http://localhost:3000/sprite/create" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body @"
{
  "projectRoot": "$projectRoot",
  "sprite": { "name": "Enemy Sprite", "numFrames": 3, "type": "actor", "filename": "npc001.png" }
}
"@

$coinSprite = Invoke-RestMethod -Uri "http://localhost:3000/sprite/create" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body @"
{
  "projectRoot": "$projectRoot",
  "sprite": { "name": "Coin Sprite", "numFrames": 1, "type": "actor", "filename": "checkbox.png" }
}
"@

# Create a Level 1 scene (side-scroller)
$sceneResponse = Invoke-RestMethod -Uri "http://localhost:3000/scene/create" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body @"
{
  "projectRoot": "$projectRoot",
  "scene": { "name": "Level 1", "type": "platform", "width": 40, "height": 18, "backgroundId": "$backgroundId" }
}
"@
$sceneId = $sceneResponse.scene.id

# Set new scene as the start scene and assign player sprite
$settingsPath = Join-Path $projectRoot "project/settings.gbsres"
$settingsJson = Get-Content -Path $settingsPath -Raw | ConvertFrom-Json
$settingsJson.defaultPlayerSprites.PLATFORM = $playerSprite.sprite.id
Invoke-RestMethod -Uri "http://localhost:3000/settings/update" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body (@{
  projectRoot = $projectRoot
  settings = @{
    startSceneId = $sceneId
    startX = 2
    startY = 16
    startDirection = "right"
    defaultSceneTypeId = "PLATFORM"
    defaultPlayerSprites = $settingsJson.defaultPlayerSprites
  }
} | ConvertTo-Json -Depth 6)

# Add an enemy actor
Invoke-RestMethod -Uri "http://localhost:3000/actor/create" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body @"
{
  "projectRoot": "$projectRoot",
  "sceneId": "$sceneId",
  "actor": { "name": "Enemy", "x": 20, "y": 16, "spriteSheetId": "$($enemySprite.sprite.id)" }
}
"@

# Add a coin actor
Invoke-RestMethod -Uri "http://localhost:3000/actor/create" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body @"
{
  "projectRoot": "$projectRoot",
  "sceneId": "$sceneId",
  "actor": { "name": "Coin", "x": 10, "y": 12, "spriteSheetId": "$($coinSprite.sprite.id)" }
}
"@

Write-Host "MCP Side-Scroller setup complete. Open in GB Studio to add logic and test!"
