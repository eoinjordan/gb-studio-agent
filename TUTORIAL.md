# Tutorial: Creating a Poachermon Game with Claude Code and MCP Server

This guide will walk you through creating a "Poachermon" game—where players stop poachers from catching animals in a Pokémon-style top-down adventure—using Claude Code and your MCP server.

---

## 1. Start the MCP Server

Open a new terminal and run:
```sh
gbstudio-claude-mcp
```
Leave this terminal open. The server should run on `http://localhost:3000`.

---

## 2. Connect Claude Code to Your MCP Server

- Open Claude Code (or Claude Desktop).
- Go to settings → MCP Servers.
- Add a new server:
  - Name: GB Studio MCP
  - URL: `http://localhost:3000`

---

## 3. Prepare Your Prompt

Use a prompt like this in Claude Code:
```
Build a “Poachermon” game where players must stop poachers from catching animals, in a Pokémon-style top-down adventure. 
- Start with a forest scene.
- Add a player character, a poacher, and a few animals.
- Add logic so the player can save animals before poachers catch them.
- Use the MCP endpoints to create scenes, actors, and events.
```

---

## 4. Send the Prompt

- In Claude Code, select your MCP server.
- Paste the prompt above and send it.

---

## 5. Review and Iterate

- Claude will use the MCP endpoints to create the game structure.
- Review the generated scenes, actors, and logic.
- You can refine your prompt or ask Claude to add more features (e.g., more levels, scoring, dialogue).

---

## 6. Test in GB Studio

- Open the generated project in GB Studio.
- Playtest and make any manual tweaks as needed.

---

Let us know if you want a more detailed breakdown of any step, or if you want example API calls for each part!
