---
name: gbstudio-mcp
description: Generate and modify GB Studio projects via the GB Studio MCP server.
metadata: {"moltbot":{"requires":{"bins":["node"],"env":[],"config":[]},"homepage":"https://github.com/eoinjordan/gb-studio-agent"},"clawdbot":{"requires":{"bins":["node"],"env":[],"config":[]},"homepage":"https://github.com/eoinjordan/gb-studio-agent"}}
---

# GB Studio MCP Skill

You have access to a local GB Studio MCP server implemented by the npm package `gbstudio-claude-mcp`.

## What this skill is for
Use it to:
- Discover a GB Studio project (`.gbsproj`) from a directory
- Validate project structure
- Inventory scenes/actors/triggers/assets
- Create scenes, actors, triggers, variables, scripts, and common assets

## Operating constraints
- Always ask for (or infer) a `projectRoot` directory that exists on disk.
- Prefer small, incremental changes:
  1) validate
  2) inventory
  3) create/update one entity
  4) inventory again
- If an operation fails, read the error message, then retry with corrected parameters.

## Starting the servers
The MCP server proxies to the local REST API, so make sure both are running.

Start the REST API:
- `gbstudio-claude-mcp` (defaults to `http://localhost:3000`)

Start the MCP stdio server (after building it):
- `npm run build:mcp`
- `node build/mcp.js`

If installed globally, you can run:
- `node $(npm root -g)/gbstudio-claude-mcp/build/mcp.js`

## Tool usage pattern
1) Find project: start from a user-provided directory.
2) Validate: confirm it is a GB Studio project root.
3) Inventory: fetch current scenes/actors/assets.
4) Create: add scenes/actors/assets as needed.
5) Inventory again: confirm changes landed.

## Safety / correctness
- Never overwrite files outside `projectRoot`.
- Do not delete assets unless the user explicitly asks.
- Avoid regenerating everything if only a small patch is needed.
