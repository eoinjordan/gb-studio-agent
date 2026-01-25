# Claude MCP Server for GB Studio


![Build](https://github.com/eoinjordan/gb-studio-agent/actions/workflows/build.yml/badge.svg)
![Tests](https://github.com/eoinjordan/gb-studio-agent/actions/workflows/test.yml/badge.svg)

[![npm version](https://img.shields.io/npm/v/gbstudio-claude-mcp.svg)](https://www.npmjs.com/package/gbstudio-claude-mcp)

---

## MCP Protocol Support

This package supports the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/). You can run the server in MCP stdio mode for use with Claude Desktop and other MCP clients:

```sh
node build/mcp.js
```

Or add this to your Claude Desktop MCP server configuration:

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

This enables full tool discovery and compatibility with any MCP-compliant client.

---

This project is a TypeScript MCP (Model Context Protocol) server for manipulating GB Studio projects. It exposes endpoints for project discovery, inventory, validation, and creation of game assets.

## Features
- TypeScript Express MCP server
- Endpoints for GB Studio project operations
- Robust error handling and validation
- Jest test framework with full coverage
- End-to-end test with real Poachermon project

## Installation

```sh
npm install -g gbstudio-claude-mcp
```

## Usage with Claude

1. **Start the MCP server:**
   ```sh
   gbstudio-claude-mcp
   ```
   The server will run on `http://localhost:3000` by default.

2. **Configure Claude Desktop:**
   - Open Claude Desktop settings
   - Go to "MCP Servers"
   - Add a new server with:
       - Name: GB Studio MCP
       - Command: `gbstudio-claude-mcp`
       - Or URL: `http://localhost:3000`

3. **Set Claude API Key (optional):**
   ```sh
   curl -X POST http://localhost:3000/claude/key -H "Content-Type: application/json" -d '{"key": "your-claude-api-key"}'
   ```

## Project Structure
- `src/index.ts` — Main server and endpoint logic
- `tests/` — Jest test suites for all endpoints
- `tests/poachermon/` — Real GB Studio project for integration tests
- `gbstudio_api_endpoints.csv` — Catalog of all planned endpoints

## Local Development

1. **Clone the repository:**
   ```sh
   git clone https://github.com/eoinjordan/gb-studio-agent.git
   cd gb-studio-agent
   ```

2. **Install Node.js** (recommended: v21.7.1 or compatible)

3. **Install dependencies:**
   ```sh
   npm install
   ```

4. **Start the development server:**
   ```sh
   npm run dev
   ```

5. **Run the test suite:**
   ```sh
   npm test
   ```

## Endpoints

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

## Test Coverage
All endpoints are covered by Jest tests in the `tests/` directory. Run `npm test` to validate all functionality. Tests use real sample projects.

## Publishing


## Publishing

To publish a new version:

1. **Update version in package.json**
2. **Build the project:**
   ```sh
   npm run build
   ```
3. **Login to npm:**
   ```sh
   npm login --auth-type=legacy
   ```
4. **Publish to npm:**
   ```sh
   npm publish --access public
   ```

**Note:** Ensure your npm account has 2FA enabled and use a granular automation token if required. See [npm publishing docs](https://docs.npmjs.com/creating-and-publishing-unscoped-public-packages) for more info.

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make changes and add tests
4. Submit a pull request to [https://github.com/eoinjordan/gb-studio-agent](https://github.com/eoinjordan/gb-studio-agent)

## License
MIT
