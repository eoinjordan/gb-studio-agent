# build-poachermon.ps1
# PowerShell script to automate Poachermon game setup using MCP endpoints

$projectRoot = "C:/Users/Eoin/git/workspace/tests/poachermon"

# Create background and sprites using existing assets
$backgroundResponse = Invoke-RestMethod -Uri "http://localhost:3000/background/create" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body @"
{
  "projectRoot": "$projectRoot",
  "background": { "name": "Savannah Map", "filename": "savannah_map.png" }
}
"@
$backgroundId = $backgroundResponse.background.id

$playerSprite = Invoke-RestMethod -Uri "http://localhost:3000/sprite/create" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body @"
{
  "projectRoot": "$projectRoot",
  "sprite": { "name": "Player Sprite", "numFrames": 3, "type": "actor", "filename": "player.png" }
}
"@

$poacherSprite = Invoke-RestMethod -Uri "http://localhost:3000/sprite/create" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body @"
{
  "projectRoot": "$projectRoot",
  "sprite": { "name": "Poacher Sprite", "numFrames": 3, "type": "actor", "filename": "poacher.png" }
}
"@

$elephantSprite = Invoke-RestMethod -Uri "http://localhost:3000/sprite/create" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body @"
{
  "projectRoot": "$projectRoot",
  "sprite": { "name": "Elephant Sprite", "numFrames": 3, "type": "actor", "filename": "elephant.png" }
}
"@

# Add a scene
$sceneResponse = Invoke-RestMethod -Uri "http://localhost:3000/scene/create" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body @"
{
  "projectRoot": "$projectRoot",
  "scene": { "name": "Savannah", "type": "topdown", "width": 20, "height": 18, "backgroundId": "$backgroundId" }
}
"@
$sceneId = $sceneResponse.scene.id

# Set new scene as the start scene and assign player sprite
$settingsPath = Join-Path $projectRoot "project/settings.gbsres"
$settingsJson = Get-Content -Path $settingsPath -Raw | ConvertFrom-Json
$settingsJson.defaultPlayerSprites.TOPDOWN = $playerSprite.sprite.id
Invoke-RestMethod -Uri "http://localhost:3000/settings/update" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body (@{
  projectRoot = $projectRoot
  settings = @{
    startSceneId = $sceneId
    startX = 5
    startY = 8
    startDirection = "down"
    defaultSceneTypeId = "TOPDOWN"
    defaultPlayerSprites = $settingsJson.defaultPlayerSprites
  }
} | ConvertTo-Json -Depth 6)

# Example: Add a poacher actor
Invoke-RestMethod -Uri "http://localhost:3000/actor/create" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body @"
{
  "projectRoot": "$projectRoot",
  "sceneId": "$sceneId",
  "actor": { "name": "Poacher", "x": 10, "y": 8, "spriteSheetId": "$($poacherSprite.sprite.id)" }
}
"@

# Example: Add an animal actor
Invoke-RestMethod -Uri "http://localhost:3000/actor/create" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body @"
{
  "projectRoot": "$projectRoot",
  "sceneId": "$sceneId",
  "actor": { "name": "Elephant", "x": 15, "y": 8, "spriteSheetId": "$($elephantSprite.sprite.id)" }
}
"@

Write-Host "Poachermon MCP game setup complete. Open in GB Studio to add logic and test!"
