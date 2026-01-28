# PowerShell script to flesh out and automate Pong MCP game creation

$projectRoot = "C:/Users/Eoin/git/workspace/tests/pongmcp"

# Remove default template scene to prevent missing background errors on export
$defaultSceneDir = Join-Path $projectRoot "project/scenes/scene_1"
if (Test-Path $defaultSceneDir) {
	Remove-Item -Path $defaultSceneDir -Recurse -Force
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

# Create Pong scene
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

# (Optional) Add triggers, logic, or more actors here

# Get inventory to review all IDs
Invoke-RestMethod -Uri "http://localhost:3000/inventory" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body @"
{
	"projectRoot": "$projectRoot"
}
"@ | ConvertTo-Json -Depth 5

Write-Host "Pong MCP game setup complete. Open in GB Studio to add logic and test!"
