---

## 20. Native MCP-First Game Creation Workflow

This workflow uses the MCP server as the source of truth for all game creation, leveraging project templates and prompt-driven automation. It is designed to be cross-platform and fully scriptable.

### 1. Initialize a New Project from a Template

Choose a template (blank, gbs2, gbhtml) from your GB Studio install:

- **blank**: Minimal, empty project
- **gbs2**: Feature-rich, with sample scenes/assets
- **gbhtml**: Feature-rich, with different sample scenes/assets

**PowerShell Example:**
```powershell
$template = "blank"  # or "gbs2", "gbhtml"
$newProject = "C:/Users/Eoin/git/workspace/tests/mynewgame"
Copy-Item -Recurse -Force "C:/Users/Eoin/git/workspace/gb-studio-latest/appData/templates/$template/*" $newProject
```

### 2. Set Up Environment and API Key

Follow the earlier steps to set your .env and API key for Claude/MCP.

### 3. Build Up the Game via Prompts or Scripts

- Use Claude or your own scripts to send prompts to the MCP server.
- Example prompt: “Build a Mario-style platformer with three levels, coins, and enemies.”
- The MCP server will use endpoints to create scenes, actors, and assets in your new project.

### 4. Use Any Assets Needed

- Place custom sprites, backgrounds, music, etc. in the appropriate assets folders in your new project.
- Register and assign assets using the MCP endpoints (see sprite/background/music create examples above).

### 5. Iterate, Test, and Export

- Open the project in GB Studio to test and refine.
- Use MCP endpoints or prompts to add more features, logic, or polish.
- Export your finished ROM from GB Studio.

---

This workflow ensures every new game starts from a clean, known-good template and is built up entirely via MCP automation and assets, making it robust, repeatable, and easy to extend for any genre (side-scroller, RPG, shooter, etc.).
---

## 15. Example: Automate a Full Pong Game with PowerShell

You can automate the creation of a full game (like Pong) using a PowerShell script that chains multiple MCP API calls. This is useful for building up a game step by step, reusing scripts, or sharing workflows.

**Example: build-pong.ps1**

```powershell
$projectRoot = "C:/Users/Eoin/git/workspace/tests/pongmcp"
$sceneId = "scene_1769375885015"  # Use your actual sceneId

# Add Left Paddle
Invoke-RestMethod -Uri "http://localhost:3000/actor/create" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body @"
{
   "projectRoot": "$projectRoot",
   "sceneId": "$sceneId",
   "actor": { "name": "Left Paddle", "x": 2, "y": 8 }
}
"@

# Add Right Paddle
Invoke-RestMethod -Uri "http://localhost:3000/actor/create" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body @"
{
   "projectRoot": "$projectRoot",
   "sceneId": "$sceneId",
   "actor": { "name": "Right Paddle", "x": 17, "y": 8 }
}
"@

# Add Ball
Invoke-RestMethod -Uri "http://localhost:3000/actor/create" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body @"
{
   "projectRoot": "$projectRoot",
   "sceneId": "$sceneId",
   "actor": { "name": "Ball", "x": 10, "y": 8 }
}
"@

# Add Score Counter
Invoke-RestMethod -Uri "http://localhost:3000/actor/create" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body @"
{
   "projectRoot": "$projectRoot",
   "sceneId": "$sceneId",
   "actor": { "name": "Score Counter", "x": 10, "y": 2 }
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
```

This script can be adapted for any game or workflow. Just update the project path, sceneId, and add/remove API calls as needed.

---

## 19. Automate Sprite Assignment for Actors

To see paddles, ball, and score counter graphics in your Pong game, you need to assign custom sprites to each actor. You can automate this process using the MCP API and sample PNGs.

### 1. Prepare Sprite PNGs

- Create or download 16x16 PNGs for each actor: `left_paddle.png`, `right_paddle.png`, `ball.png`, `score_counter.png`.
- Place them in `tests/pongmcp/assets/sprites/`.

### 2. Register Sprites with MCP

Use the `/sprite/create` endpoint to register each sprite:

**PowerShell Example:**
```powershell
$projectRoot = "C:/Users/Eoin/git/workspace/tests/pongmcp"

# Register Left Paddle sprite
Invoke-RestMethod -Uri "http://localhost:3000/sprite/create" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body @"
{
   "projectRoot": "$projectRoot",
   "sprite": { "name": "Left Paddle Sprite", "filename": "left_paddle.png" }
}
"@

# Repeat for right_paddle.png, ball.png, score_counter.png
```

**Shell Example:**
```sh
curl -X POST http://localhost:3000/sprite/create -H "Content-Type: application/json" -d '{"projectRoot": "/home/youruser/git/workspace/tests/pongmcp", "sprite": { "name": "Left Paddle Sprite", "filename": "left_paddle.png" }}'
# Repeat for other sprites
```

### 3. Assign Sprites to Actors

Use the `/actor/create` or `/actor/update` endpoint to set the `spriteId` for each actor. You can get the spriteId from the response of the previous step or from the inventory endpoint.

**PowerShell Example:**
```powershell
# Example: Assign spriteId to Left Paddle
Invoke-RestMethod -Uri "http://localhost:3000/actor/update" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body @"
{
   "projectRoot": "$projectRoot",
   "sceneId": "scene_1769375885015",
   "actorId": "actor_1769376257450",
   "actor": { "spriteId": "sprite_left_paddle_id" }
}
"@
# Repeat for other actors
```

**Shell Example:**
```sh
curl -X POST http://localhost:3000/actor/update -H "Content-Type: application/json" -d '{"projectRoot": "/home/youruser/git/workspace/tests/pongmcp", "sceneId": "scene_1769375885015", "actorId": "actor_1769376257450", "actor": { "spriteId": "sprite_left_paddle_id" }}'
# Repeat for other actors
```

---

Once sprites are assigned, rebuild and open in GB Studio to see your custom graphics in-game.
## 14. Using PowerShell to Set API Key and Send a Prompt

You can automate both setting your Claude API key and sending a prompt to the MCP server using PowerShell commands:

**Step 1: Set the Claude API Key**

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/claude/key" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body '{ "key": "your-claude-api-key" }'
```

**Step 2: Send a Prompt to the MCP Server**

For example, to create a new scene using the API:

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/scene/create" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body '{ "projectRoot": "./myproject", "scene": { "name": "New Scene" } }'
```

You can adapt this pattern to call any endpoint described in the README. Just change the URL and body to match the endpoint and data you want to send.

---

# Tutorial: End-to-End Game Creation with Claude MCP Server

This guide walks you through building a full Game Boy/Color game (e.g., Poachermon) using Claude and the MCP server, from environment setup to exporting your ROM. It covers both Windows and Linux/macOS.

---

## 1. Prerequisites

- Node.js (recommended: v21.7.1 or compatible)
- GB Studio (https://www.gbstudio.dev/)
- Claude Desktop or Claude Code (MCP client)

---

## 2. Install the MCP Server

Open a terminal and run:

```sh
npm install -g gbstudio-claude-mcp
```

---

## 3. Set Up Environment Variables

Create a `.env` file in your project root:

```env
CLAUDE_API_KEY=your-claude-api-key-here
# Add other keys as needed
```

**Never commit your .env file to source control.**

---

## 4. Start the MCP Server

Open a terminal and run:

```sh
gbstudio-claude-mcp
```
The server will run on `http://localhost:3000` by default. Leave this terminal open.

---

## 5. (Optional) Set API Key via Command

If you prefer, you can set your Claude API key using a command:

**Windows (PowerShell):**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/claude/key" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body '{ "key": "your-claude-api-key" }'
```

**Linux/macOS:**
```sh
curl -X POST http://localhost:3000/claude/key -H "Content-Type: application/json" -d '{"key": "your-claude-api-key"}'
```

---

## 6. Connect Claude Desktop/Code to Your MCP Server

1. Open Claude Desktop (or Claude Code).
2. Go to Settings → MCP Servers.
3. Add a new server:
   - Name: GB Studio MCP
   - URL: `http://localhost:3000`

---

## 7. Prepare Your Prompt

Use a prompt like this in Claude:

```
Build a “Poachermon” game where players must stop poachers from catching animals, in a Pokémon-style top-down adventure.
- Start with a forest scene.
- Add a player character, a poacher, and a few animals.
- Add logic so the player can save animals before poachers catch them.
- Use the MCP endpoints to create scenes, actors, and events.
```

You can use other sample prompts for different genres (see README.md or below).

---

## 8. Send the Prompt and Build

1. In Claude, select your MCP server.
2. Paste your prompt and send it.
3. Claude will use the MCP endpoints to create the game structure in your project folder.

---

## 9. Review, Iterate, and Expand

- Review the generated scenes, actors, and logic in your project folder.
- Refine your prompt or ask Claude to add more features (e.g., more levels, scoring, dialogue, new mechanics).
- You can use the endpoints directly (see below) for advanced control.

---

## 10. Test and Export in GB Studio

1. Open the generated project in GB Studio.
2. Playtest your game.
3. Make any manual tweaks as needed.
4. Export the final ROM from GB Studio.

---

## 11. Troubleshooting & Tips

- If the server fails to start, check your Node.js version and that dependencies are installed.
- If Claude cannot connect, ensure the MCP server is running and the URL is correct.
- If API key issues occur, double-check your .env file or use the API key command above.
- For more sample prompts and advanced workflows, see README.md and Example Prompts below.

---

## 12. Example API Calls

You can use tools like curl or PowerShell to call endpoints directly. For example, to create a new scene:

**Linux/macOS:**
```sh
curl -X POST http://localhost:3000/scene/create -H "Content-Type: application/json" -d '{"projectRoot": "./myproject", "scene": {"name": "New Scene"}}'
```

**Windows (PowerShell):**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/scene/create" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body '{ "projectRoot": "./myproject", "scene": { "name": "New Scene" } }'
```

---

## 13. Sample Prompts

See README.md or below for more sample prompts for different game genres (side-scroller, RPG, shooter, etc.).

---

Let us know if you want a more detailed breakdown of any step, or if you want example API calls for each part!

Let us know if you want a more detailed breakdown of any step, or if you want example API calls for each part!
