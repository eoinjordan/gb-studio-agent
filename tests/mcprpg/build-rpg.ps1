# build-rpg.ps1
# PowerShell script to automate a basic RPG setup using the blank template

$projectRoot = "C:/Users/Eoin/git/workspace/tests/mcprpg"

# Create a basic background and sprites using placeholder assets
$backgroundResponse = Invoke-RestMethod -Uri "http://localhost:3000/background/create" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body @"
{
  "projectRoot": "$projectRoot",
  "background": { "name": "Town Background", "filename": "placeholder.png" }
}
"@
$backgroundId = $backgroundResponse.background.id

$heroSprite = Invoke-RestMethod -Uri "http://localhost:3000/sprite/create" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body @"
{
  "projectRoot": "$projectRoot",
  "sprite": { "name": "Hero Sprite", "numFrames": 3, "type": "actor", "filename": "actor_animated.png" }
}
"@

$npcSprite = Invoke-RestMethod -Uri "http://localhost:3000/sprite/create" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body @"
{
  "projectRoot": "$projectRoot",
  "sprite": { "name": "Villager Sprite", "numFrames": 1, "type": "actor", "filename": "actor.png" }
}
"@

$chestSprite = Invoke-RestMethod -Uri "http://localhost:3000/sprite/create" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body @"
{
  "projectRoot": "$projectRoot",
  "sprite": { "name": "Chest Sprite", "numFrames": 1, "type": "actor", "filename": "static.png" }
}
"@

# Create a Town scene
$sceneResponse = Invoke-RestMethod -Uri "http://localhost:3000/scene/create" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body @"
{
  "projectRoot": "$projectRoot",
  "scene": { "name": "Town", "type": "topdown", "width": 20, "height": 18, "backgroundId": "$backgroundId" }
}
"@
$sceneId = $sceneResponse.scene.id

# Set new scene as the start scene and assign player sprite
$settingsPath = Join-Path $projectRoot "project/settings.gbsres"
$settingsJson = Get-Content -Path $settingsPath -Raw | ConvertFrom-Json
$settingsJson.defaultPlayerSprites.TOPDOWN = $heroSprite.sprite.id
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

# Add an NPC actor
Invoke-RestMethod -Uri "http://localhost:3000/actor/create" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body @"
{
  "projectRoot": "$projectRoot",
  "sceneId": "$sceneId",
  "actor": { "name": "Villager", "x": 10, "y": 8, "spriteSheetId": "$($npcSprite.sprite.id)" }
}
"@

# Add a treasure chest actor
Invoke-RestMethod -Uri "http://localhost:3000/actor/create" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body @"
{
  "projectRoot": "$projectRoot",
  "sceneId": "$sceneId",
  "actor": { "name": "Chest", "x": 15, "y": 8, "spriteSheetId": "$($chestSprite.sprite.id)" }
}
"@

Write-Host "MCP RPG setup complete. Open in GB Studio to add logic and test!"
