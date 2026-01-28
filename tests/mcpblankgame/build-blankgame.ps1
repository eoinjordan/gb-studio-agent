# build-blankgame.ps1
# PowerShell script to automate a basic MCP game setup using the blank template

$projectRoot = "C:/Users/Eoin/git/workspace/tests/mcpblankgame"

# Create a basic background and sprites using placeholder assets
$backgroundResponse = Invoke-RestMethod -Uri "http://localhost:3000/background/create" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body @"
{
  "projectRoot": "$projectRoot",
  "background": { "name": "Blank Background", "filename": "placeholder.png" }
}
"@
$backgroundId = $backgroundResponse.background.id

$playerSprite = Invoke-RestMethod -Uri "http://localhost:3000/sprite/create" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body @"
{
  "projectRoot": "$projectRoot",
  "sprite": { "name": "Player Sprite", "numFrames": 3, "type": "actor", "filename": "actor_animated.png" }
}
"@

$enemySprite = Invoke-RestMethod -Uri "http://localhost:3000/sprite/create" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body @"
{
  "projectRoot": "$projectRoot",
  "sprite": { "name": "Enemy Sprite", "numFrames": 1, "type": "actor", "filename": "actor.png" }
}
"@

# Create a test scene
$sceneResponse = Invoke-RestMethod -Uri "http://localhost:3000/scene/create" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body @"
{
  "projectRoot": "$projectRoot",
  "scene": { "name": "Test Scene", "type": "topdown", "width": 20, "height": 18, "backgroundId": "$backgroundId" }
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

# Add an enemy actor
Invoke-RestMethod -Uri "http://localhost:3000/actor/create" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body @"
{
  "projectRoot": "$projectRoot",
  "sceneId": "$sceneId",
  "actor": { "name": "Enemy", "x": 10, "y": 8, "spriteSheetId": "$($enemySprite.sprite.id)" }
}
"@

Write-Host "MCP Blank Game setup complete. Open in GB Studio to add logic and test!"
