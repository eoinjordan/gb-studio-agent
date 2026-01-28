## GB Studio Agentic MCP Server for creating GameBoy Games.

Prompt to build out a template for your students kids or self to extend.
<img width="1080" height="2640" alt="Screenshot_20260128-214729 WhatsApp" src="https://github.com/user-attachments/assets/8035e5c3-a2a7-4be8-ad51-fec2c89ab048" />

![gif](https://github.com/user-attachments/assets/6d566f6a-921e-49ac-8e74-b012e0b7d44f)
![hole](https://github.com/user-attachments/assets/e9acd3db-21cd-4171-b4c9-f4881f6cb508)
![poaceh](https://github.com/user-attachments/assets/5273503c-14a3-4208-91b8-b680bea72a93)
![gb](https://github.com/user-attachments/assets/f8322ffa-02ce-4f64-a29c-a41e8b3b3fdf)

### Pong (Game Boy)
```
Create a Pong clone for the original Game Boy. Two paddles, a ball, and a score counter. The player controls the left paddle, the right paddle is AI-controlled. Use simple monochrome graphics and authentic GB sound effects. Generate all scenes, actors, and assets for a playable Pong game.
```

### Pac-Man (Game Boy Color)
```
Build a Pac-Man style maze game for Game Boy Color. The player navigates a maze, collects pellets, and avoids ghosts. Include at least one maze layout, four ghosts with basic AI, and colorful graphics. Generate all scenes, actors, and assets needed for a playable demo.
```

### Mario Bros Style Platformer (Game Boy Color)
```
Design a Mario Bros inspired platformer for Game Boy Color. The player can run, jump, and stomp on enemies. Include three levels, power-ups, coins, and a flagpole at the end of each level. Use bright palettes and catchy background music. Generate all scenes, actors, and assets for a classic platformer experience.
```

### Space Shooter (Game Boy)
```
Create a vertical scrolling space shooter for the original Game Boy. The player controls a spaceship, shoots enemies, and dodges obstacles. Include multiple enemy types, power-ups, and a boss fight. Use classic GB graphics and chiptune sound effects. Generate all scenes, actors, and assets for a playable shooter.
```


# Claude MCP Server for GB Studio

This is a TypeScript server for manipulating GB Studio projects using the Model Context Protocol (MCP). It provides endpoints for project discovery, validation, and creation of game assets.

---

## Installation

Install globally with npm:

```sh
npm install -g gbstudio-claude-mcp
```

---

## Local Environment Setup (.env)

For local development, store API keys and configuration in a `.env` file at the project root. This keeps secrets out of source control and matches the pattern used in GitHub Actions.

1. Create a `.env` file in the project root:
   ```env
   CLAUDE_API_KEY=your-claude-api-key-here
   # Add other keys as needed
   ```
2. The server will automatically load variables from `.env` if you use [dotenv].
3. `.env` files are gitignored by default.

Never commit your `.env` file to source control.

---

## Usage

Start the server:

```sh
gbstudio-claude-mcp
```

The server runs on http://localhost:3000 by default.

Configure your MCP client (e.g., Claude Desktop) to connect to this server. For full setup and troubleshooting, see the tutorial linked at the end of this document.

---

## End-to-End Usage: Windows & Linux/macOS

See the [TUTORIAL.md](TUTORIAL.md) for a complete, step-by-step guide to building a GB Studio game with this server, including screenshots and troubleshooting tips for both Windows and Linux/macOS.

---




## MCP Protocol Support

This package supports the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/). You can run the server in MCP stdio mode for use with Claude Desktop and other MCP clients:

```sh
npm run build:mcp
node build/mcp.js
```

The MCP stdio server proxies to the local REST API on http://localhost:3000, so start the REST server first. To use a different port, set `GBSTUDIO_API_URL` (full URL) or `GBSTUDIO_API_PORT` (port number):

```sh
gbstudio-claude-mcp
```

Or add this to your MCP client configuration:

```
{
   "mcpServers": {
      "gbstudio-mcp": {
         "command": "node",
         "args": ["/absolute/path/to/build/mcp.js"]
      }
   }
}
```

---

## Clawdbot / Moltbot Compatibility

Clawdbot and Moltbot discover tools via AgentSkills-compatible `SKILL.md` files. This repo ships one at:

- `skills/gbstudio-mcp/SKILL.md`

Compatibility depends on transport:

- If Clawdbot can run stdio MCP servers as child processes, `node build/mcp.js` will work.
- If your Clawdbot setup expects HTTP+SSE MCP servers, you will need a bridge, because this MCP server is stdio-only.
- If you only run the REST API, Clawdbot will not auto-discover tools as MCP.

To enable the skill in Moltbot, add an entry like this:

```json
{
  "skills": {
    "load": {
      "extraDirs": [
        "~/.clawdbot/skills"
      ],
      "watch": true,
      "watchDebounceMs": 250
    },
    "entries": {
      "gbstudio-mcp": {
        "enabled": true,
        "env": {}
      }
    }
  }
}
```

---


## Project Structure
- src/index.ts — Main server and endpoint logic
- tests/ — Jest test suites for all endpoints
- tests/poachermon/ — Real GB Studio project for integration tests
- gbstudio_api_endpoints.csv — Catalog of all planned endpoints

## Local Development

1. Clone the repository:
   ```sh
   git clone https://github.com/eoinjordan/gb-studio-agent.git
   cd gb-studio-agent
   ```
2. Install Node.js (recommended: v21.7.1 or compatible)
3. Install dependencies:
   ```sh
   npm install
   ```
4. Start the development server:
   ```sh
   npm run dev
   ```
5. Run the test suite:
   ```sh
   npm test
   ```

---

### Health
- `GET /health` — Returns `{ status: "ok" }` for health checks.

### Claude API Key
- `GET /claude-key` — Returns `{ present: true }` if `CLAUDE_API_KEY` is set in the environment, else `{ present: false }` with 404.

### Find Project
- `POST /find_project` — Finds the first `.gbsproj` file starting from a given directory.
   - **Body:** `{ startPath: string }`
   - **Returns:** `{ projectPath: string }` or 404 if not found.

### Inventory
- `POST /inventory` — Lists scenes, actors, triggers, and assets from a GB Studio project root.
   - **Body:** `{ projectRoot: string }`
   - **Returns:** `{ scenes, actors, triggers, assets }` or 404/400 on error.

### Validate
- `POST /validate` — Validates the structure of a GB Studio project (checks for a valid `.gbsproj` file and required fields).
   - **Body:** `{ projectRoot: string }`
   - **Returns:** `{ valid: true, message: string, scenes: number }` if valid, or 400/404 with an error message if invalid or missing required fields.
   - **Error Cases:**
      - 400 if `projectRoot` is missing or `.gbsproj` is invalid/missing required fields
      - 404 if `projectRoot` does not exist or no `.gbsproj` file found

### Create Scene
- `POST /scene/create` — Adds a new scene to the specified GB Studio project.
   - **Body:** `{ projectRoot: string, scene: object }`
   - **Returns:** `{ success: true, scene }` on success, or 400/404/500 with an error message.

### Create Actor
- `POST /actor/create` — Creates a new actor in the specified scene.
   - **Body:** `{ projectRoot: string, sceneId: string, actor: object }`
   - **Returns:** `{ success: true, actor }` on success, or 400/404/500 with an error message.

### Create Background
- `POST /background/create` — Creates a new background in the project.
   - **Body:** `{ projectRoot: string, background: object }`
   - **Returns:** `{ success: true, background }` on success, or 400/404/500 with an error message.

### Create Sprite
- `POST /sprite/create` — Creates a new sprite in the project.
   - **Body:** `{ projectRoot: string, sprite: object }`
   - **Returns:** `{ success: true, sprite }` on success, or 400/404/500 with an error message.

### Create Music
- `POST /music/create` — Creates a new music track in the project.
   - **Body:** `{ projectRoot: string, music: object }`
   - **Returns:** `{ success: true, music }` on success, or 400/404/500 with an error message.

### Create Sound
- `POST /sound/create` — Creates a new sound effect in the project.
   - **Body:** `{ projectRoot: string, sound: object }`
   - **Returns:** `{ success: true, sound }` on success, or 400/404/500 with an error message.

### Create Tileset
- `POST /tileset/create` — Creates a new tileset in the project.
   - **Body:** `{ projectRoot: string, tileset: object }`
   - **Returns:** `{ success: true, tileset }` on success, or 400/404/500 with an error message.

### Create Trigger
- `POST /trigger/create` — Creates a new trigger in the specified scene.
   - **Body:** `{ projectRoot: string, sceneId: string, trigger: object }`
   - **Returns:** `{ success: true, trigger }` on success, or 400/404/500 with an error message.

### Create Variable
- `POST /variable/create` — Creates a new variable in the project.
   - **Body:** `{ projectRoot: string, variable: object }`
   - **Returns:** `{ success: true, variable }` on success, or 400/404/500 with an error message.

### Create Script
- `POST /script/create` — Creates a new script in the project.
   - **Body:** `{ projectRoot: string, script: object }`
   - **Returns:** `{ success: true, script }` on success, or 400/404/500 with an error message.

### Create Palette
- `POST /palette/create` — Creates a new palette in the project.
   - **Body:** `{ projectRoot: string, palette: object }`
   - **Returns:** `{ success: true, palette }` on success, or 400/404/500 with an error message.

### Create Font
- `POST /font/create` — Creates a new font in the project.
   - **Body:** `{ projectRoot: string, font: object }`
   - **Returns:** `{ success: true, font }` on success, or 400/404/500 with an error message.

### Create Emote
- `POST /emote/create` — Creates a new emote in the project.
   - **Body:** `{ projectRoot: string, emote: object }`
   - **Returns:** `{ success: true, emote }` on success, or 400/404/500 with an error message.

### Create Avatar
- `POST /avatar/create` — Creates a new avatar in the project.
   - **Body:** `{ projectRoot: string, avatar: object }`
   - **Returns:** `{ success: true, avatar }` on success, or 400/404/500 with an error message.

### Create Constant
- `POST /constant/create` — Creates a new constant in the project.
   - **Body:** `{ projectRoot: string, constant: object }`
   - **Returns:** `{ success: true, constant }` on success, or 400/404/500 with an error message.

### Create Prefab Actor
- `POST /prefab/actor/create` — Creates a new actor prefab in the project.
   - **Body:** `{ projectRoot: string, actorPrefab: object }`
   - **Returns:** `{ success: true, actorPrefab }` on success, or 400/404/500 with an error message.

### Create Prefab Trigger
- `POST /prefab/trigger/create` — Creates a new trigger prefab in the project.
   - **Body:** `{ projectRoot: string, triggerPrefab: object }`
   - **Returns:** `{ success: true, triggerPrefab }` on success, or 400/404/500 with an error message.

### Update Settings
- `POST /settings/update` — Updates project settings.
   - **Body:** `{ projectRoot: string, settings: object }`
   - **Returns:** `{ success: true, settings }` on success, or 400/404/500 with an error message.

### Update Metadata
- `POST /metadata/update` — Updates project metadata.
   - **Body:** `{ projectRoot: string, metadata: object }`
   - **Returns:** `{ success: true, metadata }` on success, or 400/404/500 with an error message.

### Create Engine Field Value
- `POST /engine-field-value/create` — Creates a new engine field value in the project.
   - **Body:** `{ projectRoot: string, engineFieldValue: object }`
   - **Returns:** `{ success: true, engineFieldValue }` on success, or 400/404/500 with an error message.

### Claude Key
- `POST /claude/key` — Sets the Claude API key in the environment.
   - **Body:** `{ key: string }`
   - **Returns:** `{ success: true }` on success, or 400 with an error message.

## Building a Game End-to-End

To build a GB Studio game using this MCP server with Claude:

1. **Discover Project:** Use `/find_project` to locate an existing `.gbsproj` file or start from a directory.
2. **Validate Project:** Use `/validate` to ensure the project is valid.
3. **Get Inventory:** Use `/inventory` to list current scenes, actors, triggers, assets.
4. **Create Scenes:** Use `/scene/create` to add new scenes.
5. **Create Actors:** Use `/actor/create` to add actors to scenes.
6. **Create Assets:** Use creation endpoints (currently stubs) to add sprites, backgrounds, etc.
7. **Update Settings/Metadata:** Use update endpoints to configure the project.
8. **Build/Export:** (Future) Use build endpoint to compile the game.

Note: All endpoints are now fully functional.


## Example Prompts

See [TUTORIAL.md](TUTORIAL.md) for detailed sample prompts and full end-to-end workflows for different game genres.



## Test Coverage
All endpoints are covered by Jest tests in the tests/ directory. Run `npm test` to validate all functionality. Tests use real sample projects.


## Publishing

To publish a new version:

1. Update version in package.json
2. Build the project:
   ```sh
   npm run build
   ```
3. Login to npm:
   ```sh
   npm login --auth-type=legacy
   ```
4. Publish to npm:
   ```sh
   npm publish --access public
   ```

See npm publishing docs for more info.


## Contributing
1. Fork the repository
2. Create a feature branch
3. Make changes and add tests
4. Submit a pull request to https://github.com/eoinjordan/gb-studio-agent


## License
MIT
