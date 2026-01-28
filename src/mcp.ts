import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from "axios";

// Helper to call the local HTTP server endpoints.
async function callLocalEndpoint(path: string, body: unknown) {
  try {
    const res = await axios.post(`http://localhost:3000${path}`, body);
    return res.data;
  } catch (err: any) {
    return { error: err?.response?.data || err.message };
  }
}

const server = new McpServer({
  name: "gbstudio-claude-mcp",
  version: "1.0.4",
});

// Register MCP tools for key endpoints.
server.registerTool(
  "find_project",
  {
    description: "Find the first .gbsproj file starting from a directory.",
    inputSchema: { startPath: z.string().describe("Start directory path") },
  },
  async ({ startPath }) => {
    const result = await callLocalEndpoint("/find_project", { startPath });
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

server.registerTool(
  "inventory",
  {
    description: "List scenes, actors, triggers, and assets from a GB Studio project root.",
    inputSchema: { projectRoot: z.string().describe("Project root path") },
  },
  async ({ projectRoot }) => {
    const result = await callLocalEndpoint("/inventory", { projectRoot });
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

server.registerTool(
  "validate",
  {
    description: "Validate the structure of a GB Studio project.",
    inputSchema: { projectRoot: z.string().describe("Project root path") },
  },
  async ({ projectRoot }) => {
    const result = await callLocalEndpoint("/validate", { projectRoot });
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

server.registerTool(
  "create_scene",
  {
    description: "Add a new scene to the specified GB Studio project.",
    inputSchema: {
      projectRoot: z.string().describe("Project root path"),
      scene: z.object({}).describe("Scene object"),
    },
  },
  async ({ projectRoot, scene }) => {
    const result = await callLocalEndpoint("/scene/create", { projectRoot, scene });
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

server.registerTool(
  "create_actor",
  {
    description: "Create a new actor in the specified scene.",
    inputSchema: {
      projectRoot: z.string().describe("Project root path"),
      sceneId: z.string().describe("Scene ID"),
      actor: z.object({}).describe("Actor object"),
    },
  },
  async ({ projectRoot, sceneId, actor }) => {
    const result = await callLocalEndpoint("/actor/create", { projectRoot, sceneId, actor });
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

// Helper to register a generic tool.
function registerMcpTool({
  name,
  description,
  inputSchema,
  endpoint,
}: {
  name: string;
  description: string;
  inputSchema: any;
  endpoint: string;
}) {
  server.registerTool(
    name,
    { description, inputSchema },
    async (args: any) => {
      const result = await callLocalEndpoint(endpoint, args);
      return { content: [{ type: "text" as const, text: JSON.stringify(result) }] };
    }
  );
}

// List of endpoints to cover (from README).
const endpointSpecs = [
  // Creation endpoints
  {
    name: "create_background",
    description: "Create a new background in the project.",
    inputSchema: {
      projectRoot: z.string().describe("Project root path"),
      background: z.object({}).describe("Background object"),
    },
    endpoint: "/background/create",
  },
  {
    name: "create_sprite",
    description: "Create a new sprite in the project.",
    inputSchema: {
      projectRoot: z.string().describe("Project root path"),
      sprite: z.object({}).describe("Sprite object"),
    },
    endpoint: "/sprite/create",
  },
  {
    name: "create_music",
    description: "Create a new music track in the project.",
    inputSchema: {
      projectRoot: z.string().describe("Project root path"),
      music: z.object({}).describe("Music object"),
    },
    endpoint: "/music/create",
  },
  {
    name: "create_sound",
    description: "Create a new sound effect in the project.",
    inputSchema: {
      projectRoot: z.string().describe("Project root path"),
      sound: z.object({}).describe("Sound object"),
    },
    endpoint: "/sound/create",
  },
  {
    name: "create_tileset",
    description: "Create a new tileset in the project.",
    inputSchema: {
      projectRoot: z.string().describe("Project root path"),
      tileset: z.object({}).describe("Tileset object"),
    },
    endpoint: "/tileset/create",
  },
  {
    name: "create_trigger",
    description: "Create a new trigger in the specified scene.",
    inputSchema: {
      projectRoot: z.string().describe("Project root path"),
      sceneId: z.string().describe("Scene ID"),
      trigger: z.object({}).describe("Trigger object"),
    },
    endpoint: "/trigger/create",
  },
  {
    name: "create_variable",
    description: "Create a new variable in the project.",
    inputSchema: {
      projectRoot: z.string().describe("Project root path"),
      variable: z.object({}).describe("Variable object"),
    },
    endpoint: "/variable/create",
  },
  {
    name: "create_script",
    description: "Create a new script in the project.",
    inputSchema: {
      projectRoot: z.string().describe("Project root path"),
      script: z.object({}).describe("Script object"),
    },
    endpoint: "/script/create",
  },
  {
    name: "create_palette",
    description: "Create a new palette in the project.",
    inputSchema: {
      projectRoot: z.string().describe("Project root path"),
      palette: z.object({}).describe("Palette object"),
    },
    endpoint: "/palette/create",
  },
  {
    name: "create_font",
    description: "Create a new font in the project.",
    inputSchema: {
      projectRoot: z.string().describe("Project root path"),
      font: z.object({}).describe("Font object"),
    },
    endpoint: "/font/create",
  },
  {
    name: "create_emote",
    description: "Create a new emote in the project.",
    inputSchema: {
      projectRoot: z.string().describe("Project root path"),
      emote: z.object({}).describe("Emote object"),
    },
    endpoint: "/emote/create",
  },
  {
    name: "create_avatar",
    description: "Create a new avatar in the project.",
    inputSchema: {
      projectRoot: z.string().describe("Project root path"),
      avatar: z.object({}).describe("Avatar object"),
    },
    endpoint: "/avatar/create",
  },
  {
    name: "create_constant",
    description: "Create a new constant in the project.",
    inputSchema: {
      projectRoot: z.string().describe("Project root path"),
      constant: z.object({}).describe("Constant object"),
    },
    endpoint: "/constant/create",
  },
  {
    name: "create_prefab_actor",
    description: "Create a new actor prefab in the project.",
    inputSchema: {
      projectRoot: z.string().describe("Project root path"),
      actorPrefab: z.object({}).describe("Actor prefab object"),
    },
    endpoint: "/prefab/actor/create",
  },
  {
    name: "create_prefab_trigger",
    description: "Create a new trigger prefab in the project.",
    inputSchema: {
      projectRoot: z.string().describe("Project root path"),
      triggerPrefab: z.object({}).describe("Trigger prefab object"),
    },
    endpoint: "/prefab/trigger/create",
  },
  {
    name: "update_settings",
    description: "Update project settings.",
    inputSchema: {
      projectRoot: z.string().describe("Project root path"),
      settings: z.object({}).describe("Settings object"),
    },
    endpoint: "/settings/update",
  },
  {
    name: "update_metadata",
    description: "Update project metadata.",
    inputSchema: {
      projectRoot: z.string().describe("Project root path"),
      metadata: z.object({}).describe("Metadata object"),
    },
    endpoint: "/metadata/update",
  },
  {
    name: "create_engine_field_value",
    description: "Create a new engine field value in the project.",
    inputSchema: {
      projectRoot: z.string().describe("Project root path"),
      engineFieldValue: z.object({}).describe("Engine field value object"),
    },
    endpoint: "/engine-field-value/create",
  },
  {
    name: "set_claude_key",
    description: "Set the Claude API key in the environment.",
    inputSchema: {
      key: z.string().describe("Claude API key"),
    },
    endpoint: "/claude/key",
  },
];

for (const spec of endpointSpecs) {
  registerMcpTool(spec);
}

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("GB Studio MCP server running in MCP stdio mode");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
