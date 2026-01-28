import { Client } from "@modelcontextprotocol/sdk/client";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const projectRoot = process.argv[2];
if (!projectRoot) {
  throw new Error("Missing projectRoot argument.");
}

const client = new Client({ name: "skill-smoke", version: "1.0.0" });
const transport = new StdioClientTransport({
  command: "node",
  args: ["build/mcp.js"],
  cwd: process.cwd(),
});

const callTool = async (name, args) => {
  const res = await client.callTool({ name, arguments: args });
  const text = res.content?.[0]?.text ?? "";
  return text ? JSON.parse(text) : null;
};

try {
  await client.connect(transport);

  const tools = await client.listTools();
  console.log(
    JSON.stringify(
      { tools_count: tools.tools.length, tools: tools.tools.map((t) => t.name).sort() },
      null,
      2
    )
  );

  const found = await callTool("find_project", { startPath: projectRoot });
  console.log(JSON.stringify({ find_project: found }, null, 2));

  const validate = await callTool("validate", { projectRoot });
  console.log(JSON.stringify({ validate }, null, 2));

  const before = await callTool("inventory", { projectRoot });
  console.log(
    JSON.stringify(
      {
        inventory_before: {
          scenes: before?.scenes?.length ?? 0,
          actors: before?.actors?.length ?? 0,
          triggers: before?.triggers?.length ?? 0,
        },
      },
      null,
      2
    )
  );

  const newScene = { name: "Skill Demo Scene", width: 20, height: 18, actors: [], triggers: [] };
  const createdScene = await callTool("create_scene", { projectRoot, scene: newScene });
  console.log(JSON.stringify({ create_scene: createdScene }, null, 2));

  const sceneId = createdScene?.scene?.id;
  const createdActor = await callTool("create_actor", {
    projectRoot,
    sceneId,
    actor: { name: "Skill Hero", x: 2, y: 2 },
  });
  console.log(JSON.stringify({ create_actor: createdActor }, null, 2));

  const after = await callTool("inventory", { projectRoot });
  console.log(
    JSON.stringify(
      {
        inventory_after: {
          scenes: after?.scenes?.length ?? 0,
          actors: after?.actors?.length ?? 0,
          triggers: after?.triggers?.length ?? 0,
        },
      },
      null,
      2
    )
  );
} catch (error) {
  console.error("MCP smoke test failed:", error);
  process.exitCode = 1;
} finally {
  try {
    await client.close();
  } catch (error) {
    console.error("Failed to close MCP client:", error);
    process.exitCode = 1;
  }
}
