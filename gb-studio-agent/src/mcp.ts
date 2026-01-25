import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from "axios";

// Helper to call the local HTTP server endpoints
async function callLocalEndpoint(path: string, body: any) {
  try {
    const res = await axios.post(`http://localhost:3000${path}`, body);
    return res.data;
  } catch (err: any) {
    return { error: err?.response?.data || err.message };
  }
}

const server = new McpServer({
  name: "gbstudio-claude-mcp",
  version: "1.0.0",
});

// Register MCP tools for key endpoints
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

// Add more tools as needed for other endpoints (background, sprite, etc.)

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("GB Studio MCP server running in MCP stdio mode");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
