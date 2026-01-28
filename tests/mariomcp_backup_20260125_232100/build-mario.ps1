# build-mario.ps1
# PowerShell script to automate Mario Platformer setup using MCP endpoints

$projectRoot = "C:/Users/Eoin/git/workspace/tests/mariomcp"
$templateAssets = "C:/Users/Eoin/git/workspace/gb-studio-latest/appData/templates/gbs2/assets"

$spriteSource = Join-Path $templateAssets "sprites"
$backgroundSource = Join-Path $templateAssets "backgrounds"

$backgroundFile = Join-Path $projectRoot "assets/backgrounds/outside.png"
if (-not (Test-Path $backgroundFile)) {
  Copy-Item -Path (Join-Path $backgroundSource "outside.png") -Destination $backgroundFile -Force
}

$playerSpriteFile = Join-Path $projectRoot "assets/sprites/player_platform.png"
if (-not (Test-Path $playerSpriteFile)) {
  Copy-Item -Path (Join-Path $spriteSource "player_platform.png") -Destination $playerSpriteFile -Force
}

$goombaSpriteFile = Join-Path $projectRoot "assets/sprites/npc001.png"
if (-not (Test-Path $goombaSpriteFile)) {
  Copy-Item -Path (Join-Path $spriteSource "npc001.png") -Destination $goombaSpriteFile -Force
}

$coinSpriteFile = Join-Path $projectRoot "assets/sprites/checkbox.png"
if (-not (Test-Path $coinSpriteFile)) {
  Copy-Item -Path (Join-Path $spriteSource "checkbox.png") -Destination $coinSpriteFile -Force
}

# Create Level 1 background (use existing asset)
$backgroundResponse = Invoke-RestMethod -Uri "http://localhost:3000/background/create" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body @"
{
  "projectRoot": "$projectRoot",
  "background": { "name": "Level 1 Outside", "width": 20, "height": 18, "imageWidth": 160, "imageHeight": 144, "filename": "outside.png" }
}
"@
$backgroundId = $backgroundResponse.background.id

# Create sprites for platformer characters
$marioSprite = Invoke-RestMethod -Uri "http://localhost:3000/sprite/create" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body @"
{
  "projectRoot": "$projectRoot",
  "sprite": { "name": "Mario Sprite", "numFrames": 6, "type": "actor", "filename": "player_platform.png" }
}
"@
$goombaSprite = Invoke-RestMethod -Uri "http://localhost:3000/sprite/create" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body @"
{
  "projectRoot": "$projectRoot",
  "sprite": { "name": "Goomba Sprite", "numFrames": 3, "type": "actor", "filename": "npc001.png" }
}
"@
$coinSprite = Invoke-RestMethod -Uri "http://localhost:3000/sprite/create" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body @"
{
  "projectRoot": "$projectRoot",
  "sprite": { "name": "Coin Sprite", "numFrames": 1, "type": "actor", "filename": "checkbox.png" }
}
"@

# Create Level 1 scene
$sceneResponse = Invoke-RestMethod -Uri "http://localhost:3000/scene/create" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body @"
{
  "projectRoot": "$projectRoot",
  "scene": { "name": "Level 1", "type": "platform", "width": 20, "height": 18, "backgroundId": "$backgroundId" }
}
"@
$sceneId = $sceneResponse.scene.id

# Update settings to use the new scene and platform player sprite
$settingsPath = Join-Path $projectRoot "project/settings.gbsres"
$settingsJson = Get-Content $settingsPath | ConvertFrom-Json
$settingsJson.defaultPlayerSprites.PLATFORM = $marioSprite.sprite.id
Invoke-RestMethod -Uri "http://localhost:3000/settings/update" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body (@{
  projectRoot = $projectRoot
  settings = @{
    startSceneId = $sceneId
    startX = 1
    startY = 12
    startDirection = "right"
    defaultSceneTypeId = "PLATFORM"
    defaultPlayerSprites = $settingsJson.defaultPlayerSprites
  }
} | ConvertTo-Json -Depth 6)

# Add Goomba
Invoke-RestMethod -Uri "http://localhost:3000/actor/create" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body @"
{
  "projectRoot": "$projectRoot",
  "sceneId": "$sceneId",
  "actor": { "name": "Goomba", "x": 10, "y": 12, "spriteSheetId": "$($goombaSprite.sprite.id)" }
}
"@

# Add Coin
Invoke-RestMethod -Uri "http://localhost:3000/actor/create" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body @"
{
  "projectRoot": "$projectRoot",
  "sceneId": "$sceneId",
  "actor": { "name": "Coin", "x": 5, "y": 8, "spriteSheetId": "$($coinSprite.sprite.id)" }
}
"@

Write-Host "Mario Platformer MCP game setup complete. Open in GB Studio to add logic and test!"
