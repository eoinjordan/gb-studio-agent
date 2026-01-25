"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const zod_1 = require("zod");
const axios_1 = __importDefault(require("axios"));
// Helper to call the local HTTP server endpoints
async function callLocalEndpoint(path, body) {
    try {
        const res = await axios_1.default.post(`http://localhost:3000${path}`, body);
        return res.data;
    }
    catch (err) {
        return { error: err?.response?.data || err.message };
    }
}
const server = new mcp_js_1.McpServer({
    name: "gbstudio-claude-mcp",
    version: "1.0.0",
});
// Register MCP tools for key endpoints
server.registerTool("find_project", {
    description: "Find the first .gbsproj file starting from a directory.",
    inputSchema: { startPath: zod_1.z.string().describe("Start directory path") },
}, async ({ startPath }) => {
    const result = await callLocalEndpoint("/find_project", { startPath });
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
});
server.registerTool("inventory", {
    description: "List scenes, actors, triggers, and assets from a GB Studio project root.",
    inputSchema: { projectRoot: zod_1.z.string().describe("Project root path") },
}, async ({ projectRoot }) => {
    const result = await callLocalEndpoint("/inventory", { projectRoot });
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
});
server.registerTool("validate", {
    description: "Validate the structure of a GB Studio project.",
    inputSchema: { projectRoot: zod_1.z.string().describe("Project root path") },
}, async ({ projectRoot }) => {
    const result = await callLocalEndpoint("/validate", { projectRoot });
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
});
server.registerTool("create_scene", {
    description: "Add a new scene to the specified GB Studio project.",
    inputSchema: {
        projectRoot: zod_1.z.string().describe("Project root path"),
        scene: zod_1.z.object({}).describe("Scene object"),
    },
}, async ({ projectRoot, scene }) => {
    const result = await callLocalEndpoint("/scene/create", { projectRoot, scene });
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
});
server.registerTool("create_actor", {
    description: "Create a new actor in the specified scene.",
    inputSchema: {
        projectRoot: zod_1.z.string().describe("Project root path"),
        sceneId: zod_1.z.string().describe("Scene ID"),
        actor: zod_1.z.object({}).describe("Actor object"),
    },
}, async ({ projectRoot, sceneId, actor }) => {
    const result = await callLocalEndpoint("/actor/create", { projectRoot, sceneId, actor });
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
});
// Add more tools as needed for other endpoints (background, sprite, etc.)
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error("GB Studio MCP server running in MCP stdio mode");
}
main().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
});
