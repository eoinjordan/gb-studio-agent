Create the “plugin” project (recommended: MCP server in TypeScript)

You want a tool ChatGPT can use to safely manipulate GB Studio projects. The standard approach is an MCP server that exposes tools (functions) such as “list scenes”, “add actor”, “patch events”, “validate”, and optionally “build/export”.

Use one of these:

The official “Build an MCP server” guide.

A production-grade TypeScript template (saves a lot of wiring).

5.1 Create a new folder next to gb-studio

Example layout:

dev/
  gb-studio/              (the upstream repo)
  chatgpt-gbstudio-mcp/   (your plugin/tool)

5.2 Bootstrap from a TypeScript MCP template

Pick a template and clone it into chatgpt-gbstudio-mcp. For example, the mcp-ts-template repo is designed specifically for MCP servers.

Then:

cd chatgpt-gbstudio-mcp
corepack enable
yarn
yarn dev   # or npm run dev, depending on the template scripts


Follow the MCP “build server” doc concepts: tools/resources/prompts.

6) Wire your MCP tools to GB Studio project operations

Start with a small, safe tool surface:

find_project(startPath)

inventory(projectRoot) (scenes/actors/triggers/assets)

get_scene(sceneId)

set_scene_events(sceneId, newEvents)

validate(projectRoot)

build(projectRoot, target) (optional; calls gb-studio-cli)

For build/export, use the GB Studio CLI commands from the README as your backend operations (export/make:rom/make:web).

7) The VS Code workflow you should use with ChatGPT

Open the plugin folder (chatgpt-gbstudio-mcp/) in VS Code.

Keep gb-studio/ open in another VS Code window (or as a multi-root workspace) so you can reference schemas/behavior.

In ChatGPT (VS Code extension):

Ask it to implement one tool at a time (e.g., inventory()).

Require it to return unified diffs / file-by-file changes.

Run:

Unit tests (if you add them),

validate() against a real .gbsproj,

and optionally a CLI export/build call.

8) Sanity checks (do these early)

Confirm Node version:

node -v


Must be compatible with GB Studio’s requirement (README states Node 21.7.1).

Confirm GB Studio runs:

npm start


(from gb-studio/)

Confirm CLI works:

& "$(yarn bin gb-studio-cli)" --help
