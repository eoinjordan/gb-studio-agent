# build-pacman.ps1
# PowerShell script to automate Pac-Man setup using MCP endpoints

$projectRoot = "C:/Users/Eoin/git/workspace/tests/pacmanmcp"
$templateAssets = "C:/Users/Eoin/git/workspace/gb-studio-latest/appData/templates/gbs2/assets"

$spriteSource = Join-Path $templateAssets "sprites"

$pacmanSpriteFile = Join-Path $projectRoot "assets/sprites/player.png"
if (-not (Test-Path $pacmanSpriteFile)) {
  Copy-Item -Path (Join-Path $spriteSource "player.png") -Destination $pacmanSpriteFile -Force
}

$ghostSpriteFile = Join-Path $projectRoot "assets/sprites/npc001.png"
if (-not (Test-Path $ghostSpriteFile)) {
  Copy-Item -Path (Join-Path $spriteSource "npc001.png") -Destination $ghostSpriteFile -Force
}

$pelletSpriteFile = Join-Path $projectRoot "assets/sprites/checkbox.png"
if (-not (Test-Path $pelletSpriteFile)) {
  Copy-Item -Path (Join-Path $spriteSource "checkbox.png") -Destination $pelletSpriteFile -Force
}

# Create a maze background and sprites
$backgroundResponse = Invoke-RestMethod -Uri "http://localhost:3000/background/create" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body @"
{
  "projectRoot": "$projectRoot",
  "background": { "name": "Pacman Maze", "filename": "cave.png" }
}
"@
$backgroundId = $backgroundResponse.background.id

$pacmanSprite = Invoke-RestMethod -Uri "http://localhost:3000/sprite/create" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body @"
{
  "projectRoot": "$projectRoot",
  "sprite": { "name": "Pac-Man Sprite", "numFrames": 6, "type": "actor", "filename": "player.png" }
}
"@

$ghostSprite = Invoke-RestMethod -Uri "http://localhost:3000/sprite/create" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body @"
{
  "projectRoot": "$projectRoot",
  "sprite": { "name": "Ghost Sprite", "numFrames": 3, "type": "actor", "filename": "npc001.png" }
}
"@

$pelletSprite = Invoke-RestMethod -Uri "http://localhost:3000/sprite/create" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body @"
{
  "projectRoot": "$projectRoot",
  "sprite": { "name": "Pellet Sprite", "numFrames": 1, "type": "actor", "filename": "checkbox.png" }
}
"@

# Create Maze scene
$sceneResponse = Invoke-RestMethod -Uri "http://localhost:3000/scene/create" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body @"
{
  "projectRoot": "$projectRoot",
  "scene": { "name": "Maze", "type": "topdown", "width": 20, "height": 18, "backgroundId": "$backgroundId" }
}
"@
$sceneId = $sceneResponse.scene.id

# Set new scene as the start scene and assign player sprite
$settingsPath = Join-Path $projectRoot "project/settings.gbsres"
$settingsJson = Get-Content -Path $settingsPath -Raw | ConvertFrom-Json
$settingsJson.defaultPlayerSprites.TOPDOWN = $pacmanSprite.sprite.id
Invoke-RestMethod -Uri "http://localhost:3000/settings/update" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body (@{
  projectRoot = $projectRoot
  settings = @{
    startSceneId = $sceneId
    startX = 1
    startY = 1
    startDirection = "left"
    defaultSceneTypeId = "TOPDOWN"
    defaultPlayerSprites = $settingsJson.defaultPlayerSprites
  }
} | ConvertTo-Json -Depth 6)

# Add Ghosts
foreach ($ghost in @("Blinky", "Pinky", "Inky", "Clyde")) {
  Invoke-RestMethod -Uri "http://localhost:3000/actor/create" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body @"
  {
    "projectRoot": "$projectRoot",
    "sceneId": "$sceneId",
    "actor": { "name": "$ghost", "x": 5, "y": 5, "spriteSheetId": "$($ghostSprite.sprite.id)" }
  }
"@
}

# Add a Pellet
Invoke-RestMethod -Uri "http://localhost:3000/actor/create" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body @"
{
  "projectRoot": "$projectRoot",
  "sceneId": "$sceneId",
  "actor": { "name": "Pellet", "x": 2, "y": 2, "spriteSheetId": "$($pelletSprite.sprite.id)" }
}
"@

Write-Host "Pac-Man MCP game setup complete. Open in GB Studio to add logic and test!"
