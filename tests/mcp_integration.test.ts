import { spawn } from "child_process";
import axios from "axios";

describe("MCP stdio integration", () => {
  let mcpProc: any;
  beforeAll((done) => {
    mcpProc = spawn("node", ["build/mcp.js"], {
      cwd: process.cwd(),
      stdio: ["pipe", "pipe", "pipe"]
    });
    // Wait a bit for the server to be ready
    setTimeout(done, 2000);
  });

  afterAll(() => {
    if (mcpProc) mcpProc.kill();
  });

  it("should call the find_project tool via HTTP and MCP", async () => {
    // HTTP direct
    const httpRes = await axios.post("http://localhost:3000/find_project", { startPath: process.cwd() });
    expect(httpRes.data).toBeDefined();
    // MCP: simulate a tool call (in real world, use MCP client SDK)
    // Here, just check the process is running as a smoke test
    expect(mcpProc.pid).toBeGreaterThan(0);
  });

  it("should call the create_scene tool via HTTP and MCP", async () => {
    // Use a real projectRoot from tests/poachermon
    const projectRoot = `${process.cwd()}/tests/poachermon`;
    const newScene = {
      name: "Test Scene",
      actors: [],
      triggers: []
    };
    const httpRes = await axios.post("http://localhost:3000/scene/create", { projectRoot, scene: newScene });
    expect(httpRes.data).toBeDefined();
    expect(httpRes.data.success).toBe(true);
    expect(mcpProc.pid).toBeGreaterThan(0);
  });
});
