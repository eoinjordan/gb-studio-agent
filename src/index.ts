
import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';




const app = express();
app.use(express.json());

// --- GB Studio API Endpoint Stubs ---
const notImplemented = (req: Request, res: Response) => {
  res.status(501).json({ error: 'Not implemented' });
};

app.post('/actor/create', (req: Request, res: Response) => {
  const { projectRoot, sceneId, actor } = req.body;
  if (!projectRoot || !sceneId || !actor) {
    return res.status(400).json({ error: 'projectRoot, sceneId, and actor are required' });
  }
  try {
    // Find .gbsproj file in projectRoot
    let gbsprojPath = null;
    if (fs.lstatSync(projectRoot).isDirectory()) {
      const entries = fs.readdirSync(projectRoot, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.gbsproj')) {
          gbsprojPath = path.join(projectRoot, entry.name);
          break;
        }
      }
    } else if (projectRoot.endsWith('.gbsproj') && fs.lstatSync(projectRoot).isFile()) {
      gbsprojPath = projectRoot;
    }
    if (!gbsprojPath) {
      return res.status(404).json({ error: 'No .gbsproj file found in projectRoot' });
    }
    // Read and update .gbsproj
    let data;
    try {
      data = JSON.parse(fs.readFileSync(gbsprojPath, 'utf8'));
    } catch (parseErr) {
      return res.status(400).json({ error: `Invalid JSON in .gbsproj: ${parseErr instanceof Error ? parseErr.message : parseErr}` });
    }
    if (!Array.isArray(data.scenes)) {
      return res.status(400).json({ error: 'Invalid project: scenes is not an array' });
    }
    const scene = data.scenes.find((s: any) => s.id === sceneId);
    if (!scene) {
      return res.status(404).json({ error: `Scene with id ${sceneId} not found` });
    }
    if (!Array.isArray(scene.actors)) {
      scene.actors = [];
    }
    // Assign a unique id if not present
    if (!actor.id) {
      actor.id = 'actor_' + Date.now();
    }
    scene.actors.push(actor);
    fs.writeFileSync(gbsprojPath, JSON.stringify(data, null, 2), 'utf8');
    res.json({ success: true, actor: { ...actor, id: actor.id } });
  } catch (err) {
    let message = 'Unknown error';
    if (err && typeof err === 'object' && 'message' in err) {
      message = (err as any).message;
    }
    if (!res.headersSent) {
      res.status(500).json({ error: message });
    }
  }
});
app.post('/trigger/create', (req: Request, res: Response) => {
  const { projectRoot, sceneId, trigger } = req.body;
  if (!projectRoot || !sceneId || !trigger) {
    return res.status(400).json({ error: 'projectRoot, sceneId, and trigger are required' });
  }
  try {
    // Find .gbsproj file in projectRoot
    let gbsprojPath = null;
    if (fs.lstatSync(projectRoot).isDirectory()) {
      const entries = fs.readdirSync(projectRoot, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.gbsproj')) {
          gbsprojPath = path.join(projectRoot, entry.name);
          break;
        }
      }
    } else if (projectRoot.endsWith('.gbsproj') && fs.lstatSync(projectRoot).isFile()) {
      gbsprojPath = projectRoot;
    }
    if (!gbsprojPath) {
      return res.status(404).json({ error: 'No .gbsproj file found in projectRoot' });
    }
    // Read and update .gbsproj
    let data;
    try {
      data = JSON.parse(fs.readFileSync(gbsprojPath, 'utf8'));
    } catch (parseErr) {
      return res.status(400).json({ error: `Invalid JSON in .gbsproj: ${parseErr instanceof Error ? parseErr.message : parseErr}` });
    }
    if (!Array.isArray(data.scenes)) {
      return res.status(400).json({ error: 'Invalid project: scenes is not an array' });
    }
    const scene = data.scenes.find((s: any) => s.id === sceneId);
    if (!scene) {
      return res.status(404).json({ error: `Scene with id ${sceneId} not found` });
    }
    if (!Array.isArray(scene.triggers)) {
      scene.triggers = [];
    }
    // Assign a unique id if not present
    if (!trigger.id) {
      trigger.id = 'trigger_' + Date.now();
    }
    scene.triggers.push(trigger);
    fs.writeFileSync(gbsprojPath, JSON.stringify(data, null, 2), 'utf8');
    res.json({ success: true, trigger: { ...trigger, id: trigger.id } });
  } catch (err) {
    let message = 'Unknown error';
    if (err && typeof err === 'object' && 'message' in err) {
      message = (err as any).message;
    }
    if (!res.headersSent) {
      res.status(500).json({ error: message });
    }
  }
});
app.post('/script/create', (req: Request, res: Response) => {
  const { projectRoot, script } = req.body;
  if (!projectRoot || !script) {
    return res.status(400).json({ error: 'projectRoot and script are required' });
  }
  try {
    // Find .gbsproj file in projectRoot
    let gbsprojPath = null;
    if (fs.lstatSync(projectRoot).isDirectory()) {
      const entries = fs.readdirSync(projectRoot, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.gbsproj')) {
          gbsprojPath = path.join(projectRoot, entry.name);
          break;
        }
      }
    } else if (projectRoot.endsWith('.gbsproj') && fs.lstatSync(projectRoot).isFile()) {
      gbsprojPath = projectRoot;
    }
    if (!gbsprojPath) {
      return res.status(404).json({ error: 'No .gbsproj file found in projectRoot' });
    }
    // Read and update .gbsproj
    let data;
    try {
      data = JSON.parse(fs.readFileSync(gbsprojPath, 'utf8'));
    } catch (parseErr) {
      return res.status(400).json({ error: `Invalid JSON in .gbsproj: ${parseErr instanceof Error ? parseErr.message : parseErr}` });
    }
    if (!Array.isArray(data.scripts)) {
      data.scripts = [];
    }
    // Assign a unique id if not present
    if (!script.id) {
      script.id = randomUUID();
    }
    data.scripts.push(script);
    fs.writeFileSync(gbsprojPath, JSON.stringify(data, null, 2), 'utf8');
    res.json({ success: true, script: { ...script, id: script.id } });
  } catch (err) {
    let message = 'Unknown error';
    if (err && typeof err === 'object' && 'message' in err) {
      message = (err as any).message;
    }
    if (!res.headersSent) {
      res.status(500).json({ error: message });
    }
  }
});
app.post('/background/create', (req: Request, res: Response) => {
  const { projectRoot, background } = req.body;
  if (!projectRoot || !background) {
    return res.status(400).json({ error: 'projectRoot and background are required' });
  }
  try {
    // Find .gbsproj file in projectRoot
    let gbsprojPath = null;
    if (fs.lstatSync(projectRoot).isDirectory()) {
      const entries = fs.readdirSync(projectRoot, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.gbsproj')) {
          gbsprojPath = path.join(projectRoot, entry.name);
          break;
        }
      }
    } else if (projectRoot.endsWith('.gbsproj') && fs.lstatSync(projectRoot).isFile()) {
      gbsprojPath = projectRoot;
    }
    if (!gbsprojPath) {
      return res.status(404).json({ error: 'No .gbsproj file found in projectRoot' });
    }
    // Read and update .gbsproj
    let data;
    try {
      data = JSON.parse(fs.readFileSync(gbsprojPath, 'utf8'));
    } catch (parseErr) {
      return res.status(400).json({ error: `Invalid JSON in .gbsproj: ${parseErr instanceof Error ? parseErr.message : parseErr}` });
    }
    if (!Array.isArray(data.backgrounds)) {
      data.backgrounds = [];
    }
    // Assign a unique id if not present
    if (!background.id) {
      background.id = randomUUID();
    }
    data.backgrounds.push(background);
    fs.writeFileSync(gbsprojPath, JSON.stringify(data, null, 2), 'utf8');
    res.json({ success: true, background: { ...background, id: background.id } });
  } catch (err) {
    let message = 'Unknown error';
    if (err && typeof err === 'object' && 'message' in err) {
      message = (err as any).message;
    }
    if (!res.headersSent) {
      res.status(500).json({ error: message });
    }
  }
});
app.post('/sprite/create', (req: Request, res: Response) => {
  const { projectRoot, sprite } = req.body;
  if (!projectRoot || !sprite) {
    return res.status(400).json({ error: 'projectRoot and sprite are required' });
  }
  try {
    // Find .gbsproj file in projectRoot
    let gbsprojPath = null;
    if (fs.lstatSync(projectRoot).isDirectory()) {
      const entries = fs.readdirSync(projectRoot, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.gbsproj')) {
          gbsprojPath = path.join(projectRoot, entry.name);
          break;
        }
      }
    } else if (projectRoot.endsWith('.gbsproj') && fs.lstatSync(projectRoot).isFile()) {
      gbsprojPath = projectRoot;
    }
    if (!gbsprojPath) {
      return res.status(404).json({ error: 'No .gbsproj file found in projectRoot' });
    }
    // Read and update .gbsproj
    let data;
    try {
      data = JSON.parse(fs.readFileSync(gbsprojPath, 'utf8'));
    } catch (parseErr) {
      return res.status(400).json({ error: `Invalid JSON in .gbsproj: ${parseErr instanceof Error ? parseErr.message : parseErr}` });
    }
    if (!Array.isArray(data.spriteSheets)) {
      data.spriteSheets = [];
    }
    // Assign a unique id if not present
    if (!sprite.id) {
      sprite.id = randomUUID();
    }
    data.spriteSheets.push(sprite);
    fs.writeFileSync(gbsprojPath, JSON.stringify(data, null, 2), 'utf8');
    res.json({ success: true, sprite: { ...sprite, id: sprite.id } });
  } catch (err) {
    let message = 'Unknown error';
    if (err && typeof err === 'object' && 'message' in err) {
      message = (err as any).message;
    }
    if (!res.headersSent) {
      res.status(500).json({ error: message });
    }
  }
});
app.post('/emote/create', (req: Request, res: Response) => {
  const { projectRoot, emote } = req.body;
  if (!projectRoot || !emote) {
    return res.status(400).json({ error: 'projectRoot and emote are required' });
  }
  try {
    // Find .gbsproj file in projectRoot
    let gbsprojPath = null;
    if (fs.lstatSync(projectRoot).isDirectory()) {
      const entries = fs.readdirSync(projectRoot, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.gbsproj')) {
          gbsprojPath = path.join(projectRoot, entry.name);
          break;
        }
      }
    } else if (projectRoot.endsWith('.gbsproj') && fs.lstatSync(projectRoot).isFile()) {
      gbsprojPath = projectRoot;
    }
    if (!gbsprojPath) {
      return res.status(404).json({ error: 'No .gbsproj file found in projectRoot' });
    }
    // Read and update .gbsproj
    let data;
    try {
      data = JSON.parse(fs.readFileSync(gbsprojPath, 'utf8'));
    } catch (parseErr) {
      return res.status(400).json({ error: `Invalid JSON in .gbsproj: ${parseErr instanceof Error ? parseErr.message : parseErr}` });
    }
    if (!Array.isArray(data.emotes)) {
      data.emotes = [];
    }
    // Assign a unique id if not present
    if (!emote.id) {
      emote.id = randomUUID();
    }
    data.emotes.push(emote);
    fs.writeFileSync(gbsprojPath, JSON.stringify(data, null, 2), 'utf8');
    res.json({ success: true, emote: { ...emote, id: emote.id } });
  } catch (err) {
    let message = 'Unknown error';
    if (err && typeof err === 'object' && 'message' in err) {
      message = (err as any).message;
    }
    if (!res.headersSent) {
      res.status(500).json({ error: message });
    }
  }
});
app.post('/avatar/create', (req: Request, res: Response) => {
  const { projectRoot, avatar } = req.body;
  if (!projectRoot || !avatar) {
    return res.status(400).json({ error: 'projectRoot and avatar are required' });
  }
  try {
    // Find .gbsproj file in projectRoot
    let gbsprojPath = null;
    if (fs.lstatSync(projectRoot).isDirectory()) {
      const entries = fs.readdirSync(projectRoot, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.gbsproj')) {
          gbsprojPath = path.join(projectRoot, entry.name);
          break;
        }
      }
    } else if (projectRoot.endsWith('.gbsproj') && fs.lstatSync(projectRoot).isFile()) {
      gbsprojPath = projectRoot;
    }
    if (!gbsprojPath) {
      return res.status(404).json({ error: 'No .gbsproj file found in projectRoot' });
    }
    // Read and update .gbsproj
    let data;
    try {
      data = JSON.parse(fs.readFileSync(gbsprojPath, 'utf8'));
    } catch (parseErr) {
      return res.status(400).json({ error: `Invalid JSON in .gbsproj: ${parseErr instanceof Error ? parseErr.message : parseErr}` });
    }
    if (!Array.isArray(data.avatars)) {
      data.avatars = [];
    }
    // Assign a unique id if not present
    if (!avatar.id) {
      avatar.id = randomUUID();
    }
    data.avatars.push(avatar);
    fs.writeFileSync(gbsprojPath, JSON.stringify(data, null, 2), 'utf8');
    res.json({ success: true, avatar: { ...avatar, id: avatar.id } });
  } catch (err) {
    let message = 'Unknown error';
    if (err && typeof err === 'object' && 'message' in err) {
      message = (err as any).message;
    }
    if (!res.headersSent) {
      res.status(500).json({ error: message });
    }
  }
});
app.post('/font/create', (req: Request, res: Response) => {
  const { projectRoot, font } = req.body;
  if (!projectRoot || !font) {
    return res.status(400).json({ error: 'projectRoot and font are required' });
  }
  try {
    // Find .gbsproj file in projectRoot
    let gbsprojPath = null;
    if (fs.lstatSync(projectRoot).isDirectory()) {
      const entries = fs.readdirSync(projectRoot, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.gbsproj')) {
          gbsprojPath = path.join(projectRoot, entry.name);
          break;
        }
      }
    } else if (projectRoot.endsWith('.gbsproj') && fs.lstatSync(projectRoot).isFile()) {
      gbsprojPath = projectRoot;
    }
    if (!gbsprojPath) {
      return res.status(404).json({ error: 'No .gbsproj file found in projectRoot' });
    }
    // Read and update .gbsproj
    let data;
    try {
      data = JSON.parse(fs.readFileSync(gbsprojPath, 'utf8'));
    } catch (parseErr) {
      return res.status(400).json({ error: `Invalid JSON in .gbsproj: ${parseErr instanceof Error ? parseErr.message : parseErr}` });
    }
    if (!Array.isArray(data.fonts)) {
      data.fonts = [];
    }
    // Assign a unique id if not present
    if (!font.id) {
      font.id = randomUUID();
    }
    data.fonts.push(font);
    fs.writeFileSync(gbsprojPath, JSON.stringify(data, null, 2), 'utf8');
    // Always return the font object with id
    console.log('Created font:', font);
    res.json({ success: true, font: { ...font, id: font.id } });
  } catch (err) {
    let message = 'Unknown error';
    if (err && typeof err === 'object' && 'message' in err) {
      message = (err as any).message;
    }
    if (!res.headersSent) {
      res.status(500).json({ error: message });
    }
  }
});
app.post('/tileset/create', (req: Request, res: Response) => {
  const { projectRoot, tileset } = req.body;
  if (!projectRoot || !tileset) {
    return res.status(400).json({ error: 'projectRoot and tileset are required' });
  }
  try {
    // Find .gbsproj file in projectRoot
    let gbsprojPath = null;
    if (fs.lstatSync(projectRoot).isDirectory()) {
      const entries = fs.readdirSync(projectRoot, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.gbsproj')) {
          gbsprojPath = path.join(projectRoot, entry.name);
          break;
        }
      }
    } else if (projectRoot.endsWith('.gbsproj') && fs.lstatSync(projectRoot).isFile()) {
      gbsprojPath = projectRoot;
    }
    if (!gbsprojPath) {
      return res.status(404).json({ error: 'No .gbsproj file found in projectRoot' });
    }
    // Read and update .gbsproj
    let data;
    try {
      data = JSON.parse(fs.readFileSync(gbsprojPath, 'utf8'));
    } catch (parseErr) {
      return res.status(400).json({ error: `Invalid JSON in .gbsproj: ${parseErr instanceof Error ? parseErr.message : parseErr}` });
    }
    if (!Array.isArray(data.tilesets)) {
      data.tilesets = [];
    }
    // Assign a unique id if not present
    if (!tileset.id) {
      tileset.id = randomUUID();
    }
    data.tilesets.push(tileset);
    fs.writeFileSync(gbsprojPath, JSON.stringify(data, null, 2), 'utf8');
    res.json({ success: true, tileset: { ...tileset, id: tileset.id } });
  } catch (err) {
    let message = 'Unknown error';
    if (err && typeof err === 'object' && 'message' in err) {
      message = (err as any).message;
    }
    if (!res.headersSent) {
      res.status(500).json({ error: message });
    }
  }
});
app.post('/sound/create', (req: Request, res: Response) => {
  const { projectRoot, sound } = req.body;
  if (!projectRoot || !sound) {
    return res.status(400).json({ error: 'projectRoot and sound are required' });
  }
  try {
    // Find .gbsproj file in projectRoot
    let gbsprojPath = null;
    if (fs.lstatSync(projectRoot).isDirectory()) {
      const entries = fs.readdirSync(projectRoot, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.gbsproj')) {
          gbsprojPath = path.join(projectRoot, entry.name);
          break;
        }
      }
    } else if (projectRoot.endsWith('.gbsproj') && fs.lstatSync(projectRoot).isFile()) {
      gbsprojPath = projectRoot;
    }
    if (!gbsprojPath) {
      return res.status(404).json({ error: 'No .gbsproj file found in projectRoot' });
    }
    // Read and update .gbsproj
    let data;
    try {
      data = JSON.parse(fs.readFileSync(gbsprojPath, 'utf8'));
    } catch (parseErr) {
      return res.status(400).json({ error: `Invalid JSON in .gbsproj: ${parseErr instanceof Error ? parseErr.message : parseErr}` });
    }
    if (!Array.isArray(data.sounds)) {
      data.sounds = [];
    }
    // Assign a unique id if not present
    if (!sound.id) {
      sound.id = randomUUID();
    }
    data.sounds.push(sound);
    fs.writeFileSync(gbsprojPath, JSON.stringify(data, null, 2), 'utf8');
    res.json({ success: true, sound: { ...sound, id: sound.id } });
  } catch (err) {
    let message = 'Unknown error';
    if (err && typeof err === 'object' && 'message' in err) {
      message = (err as any).message;
    }
    if (!res.headersSent) {
      res.status(500).json({ error: message });
    }
  }
});
app.post('/music/create', (req: Request, res: Response) => {
  const { projectRoot, music } = req.body;
  if (!projectRoot || !music) {
    return res.status(400).json({ error: 'projectRoot and music are required' });
  }
  try {
    // Find .gbsproj file in projectRoot
    let gbsprojPath = null;
    if (fs.lstatSync(projectRoot).isDirectory()) {
      const entries = fs.readdirSync(projectRoot, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.gbsproj')) {
          gbsprojPath = path.join(projectRoot, entry.name);
          break;
        }
      }
    } else if (projectRoot.endsWith('.gbsproj') && fs.lstatSync(projectRoot).isFile()) {
      gbsprojPath = projectRoot;
    }
    if (!gbsprojPath) {
      return res.status(404).json({ error: 'No .gbsproj file found in projectRoot' });
    }
    // Read and update .gbsproj
    let data;
    try {
      data = JSON.parse(fs.readFileSync(gbsprojPath, 'utf8'));
    } catch (parseErr) {
      return res.status(400).json({ error: `Invalid JSON in .gbsproj: ${parseErr instanceof Error ? parseErr.message : parseErr}` });
    }
    if (!Array.isArray(data.music)) {
      data.music = [];
    }
    // Assign a unique id if not present
    if (!music.id) {
      music.id = randomUUID();
    }
    data.music.push(music);
    fs.writeFileSync(gbsprojPath, JSON.stringify(data, null, 2), 'utf8');
    res.json({ success: true, music: { ...music, id: music.id } });
  } catch (err) {
    let message = 'Unknown error';
    if (err && typeof err === 'object' && 'message' in err) {
      message = (err as any).message;
    }
    if (!res.headersSent) {
      res.status(500).json({ error: message });
    }
  }
});
app.post('/palette/create', (req: Request, res: Response) => {
  const { projectRoot, palette } = req.body;
  if (!projectRoot || !palette) {
    return res.status(400).json({ error: 'projectRoot and palette are required' });
  }
  try {
    // Find .gbsproj file in projectRoot
    let gbsprojPath = null;
    if (fs.lstatSync(projectRoot).isDirectory()) {
      const entries = fs.readdirSync(projectRoot, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.gbsproj')) {
          gbsprojPath = path.join(projectRoot, entry.name);
          break;
        }
      }
    } else if (projectRoot.endsWith('.gbsproj') && fs.lstatSync(projectRoot).isFile()) {
      gbsprojPath = projectRoot;
    }
    if (!gbsprojPath) {
      return res.status(404).json({ error: 'No .gbsproj file found in projectRoot' });
    }
    // Read and update .gbsproj
    let data;
    try {
      data = JSON.parse(fs.readFileSync(gbsprojPath, 'utf8'));
    } catch (parseErr) {
      return res.status(400).json({ error: `Invalid JSON in .gbsproj: ${parseErr instanceof Error ? parseErr.message : parseErr}` });
    }
    if (!Array.isArray(data.palettes)) {
      data.palettes = [];
    }
    // Assign a unique id if not present
    if (!palette.id) {
      palette.id = randomUUID();
    }
    data.palettes.push(palette);
    fs.writeFileSync(gbsprojPath, JSON.stringify(data, null, 2), 'utf8');
    res.json({ success: true, palette: { ...palette, id: palette.id } });
  } catch (err) {
    let message = 'Unknown error';
    if (err && typeof err === 'object' && 'message' in err) {
      message = (err as any).message;
    }
    if (!res.headersSent) {
      res.status(500).json({ error: message });
    }
  }
});
app.post('/variable/create', (req: Request, res: Response) => {
  const { projectRoot, variable } = req.body;
  if (!projectRoot || !variable) {
    return res.status(400).json({ error: 'projectRoot and variable are required' });
  }
  try {
    // Find .gbsproj file in projectRoot
    let gbsprojPath = null;
    if (fs.lstatSync(projectRoot).isDirectory()) {
      const entries = fs.readdirSync(projectRoot, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.gbsproj')) {
          gbsprojPath = path.join(projectRoot, entry.name);
          break;
        }
      }
    } else if (projectRoot.endsWith('.gbsproj') && fs.lstatSync(projectRoot).isFile()) {
      gbsprojPath = projectRoot;
    }
    if (!gbsprojPath) {
      return res.status(404).json({ error: 'No .gbsproj file found in projectRoot' });
    }
    // Read and update .gbsproj
    let data;
    try {
      data = JSON.parse(fs.readFileSync(gbsprojPath, 'utf8'));
    } catch (parseErr) {
      return res.status(400).json({ error: `Invalid JSON in .gbsproj: ${parseErr instanceof Error ? parseErr.message : parseErr}` });
    }
    if (!Array.isArray(data.variables)) {
      data.variables = [];
    }
    // Assign a unique id if not present
    if (!variable.id) {
      variable.id = randomUUID();
    }
    data.variables.push(variable);
    fs.writeFileSync(gbsprojPath, JSON.stringify(data, null, 2), 'utf8');
    res.json({ success: true, variable: { ...variable, id: variable.id } });
  } catch (err) {
    let message = 'Unknown error';
    if (err && typeof err === 'object' && 'message' in err) {
      message = (err as any).message;
    }
    if (!res.headersSent) {
      res.status(500).json({ error: message });
    }
  }
});
app.post('/constant/create', (req: Request, res: Response) => {
  const { projectRoot, constant } = req.body;
  if (!projectRoot || !constant) {
    return res.status(400).json({ error: 'projectRoot and constant are required' });
  }
  try {
    // Find .gbsproj file in projectRoot
    let gbsprojPath = null;
    if (fs.lstatSync(projectRoot).isDirectory()) {
      const entries = fs.readdirSync(projectRoot, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.gbsproj')) {
          gbsprojPath = path.join(projectRoot, entry.name);
          break;
        }
      }
    } else if (projectRoot.endsWith('.gbsproj') && fs.lstatSync(projectRoot).isFile()) {
      gbsprojPath = projectRoot;
    }
    if (!gbsprojPath) {
      return res.status(404).json({ error: 'No .gbsproj file found in projectRoot' });
    }
    // Read and update .gbsproj
    let data;
    try {
      data = JSON.parse(fs.readFileSync(gbsprojPath, 'utf8'));
    } catch (parseErr) {
      return res.status(400).json({ error: `Invalid JSON in .gbsproj: ${parseErr instanceof Error ? parseErr.message : parseErr}` });
    }
    if (!Array.isArray(data.constants)) {
      data.constants = [];
    }
    // Assign a unique id if not present
    if (!constant.id) {
      constant.id = randomUUID();
    }
    data.constants.push(constant);
    fs.writeFileSync(gbsprojPath, JSON.stringify(data, null, 2), 'utf8');
    res.json({ success: true, constant: { ...constant, id: constant.id } });
  } catch (err) {
    let message = 'Unknown error';
    if (err && typeof err === 'object' && 'message' in err) {
      message = (err as any).message;
    }
    if (!res.headersSent) {
      res.status(500).json({ error: message });
    }
  }
});
app.post('/engine-field-value/create', (req: Request, res: Response) => {
  const { projectRoot, engineFieldValue } = req.body;
  if (!projectRoot || !engineFieldValue) {
    return res.status(400).json({ error: 'projectRoot and engineFieldValue are required' });
  }
  try {
    // Find .gbsproj file in projectRoot
    let gbsprojPath = null;
    if (fs.lstatSync(projectRoot).isDirectory()) {
      const entries = fs.readdirSync(projectRoot, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.gbsproj')) {
          gbsprojPath = path.join(projectRoot, entry.name);
          break;
        }
      }
    } else if (projectRoot.endsWith('.gbsproj') && fs.lstatSync(projectRoot).isFile()) {
      gbsprojPath = projectRoot;
    }
    if (!gbsprojPath) {
      return res.status(404).json({ error: 'No .gbsproj file found in projectRoot' });
    }
    // Read and update .gbsproj
    let data;
    try {
      data = JSON.parse(fs.readFileSync(gbsprojPath, 'utf8'));
    } catch (parseErr) {
      return res.status(400).json({ error: `Invalid JSON in .gbsproj: ${parseErr instanceof Error ? parseErr.message : parseErr}` });
    }
    if (!Array.isArray(data.engineFieldValues)) {
      data.engineFieldValues = [];
    }
    // Assign a unique id if not present
    if (!engineFieldValue.id) {
      engineFieldValue.id = randomUUID();
    }
    data.engineFieldValues.push(engineFieldValue);
    fs.writeFileSync(gbsprojPath, JSON.stringify(data, null, 2), 'utf8');
    res.json({ success: true, engineFieldValue: { ...engineFieldValue, id: engineFieldValue.id } });
  } catch (err) {
    let message = 'Unknown error';
    if (err && typeof err === 'object' && 'message' in err) {
      message = (err as any).message;
    }
    if (!res.headersSent) {
      res.status(500).json({ error: message });
    }
  }
});
app.post('/settings/update', (req: Request, res: Response) => {
  const { projectRoot, settings } = req.body;
  if (!projectRoot || !settings) {
    return res.status(400).json({ error: 'projectRoot and settings are required' });
  }
  try {
    // Find .gbsproj file in projectRoot
    let gbsprojPath = null;
    if (fs.lstatSync(projectRoot).isDirectory()) {
      const entries = fs.readdirSync(projectRoot, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.gbsproj')) {
          gbsprojPath = path.join(projectRoot, entry.name);
          break;
        }
      }
    } else if (projectRoot.endsWith('.gbsproj') && fs.lstatSync(projectRoot).isFile()) {
      gbsprojPath = projectRoot;
    }
    if (!gbsprojPath) {
      return res.status(404).json({ error: 'No .gbsproj file found in projectRoot' });
    }
    // Read and update .gbsproj
    let data;
    try {
      data = JSON.parse(fs.readFileSync(gbsprojPath, 'utf8'));
    } catch (parseErr) {
      return res.status(400).json({ error: `Invalid JSON in .gbsproj: ${parseErr instanceof Error ? parseErr.message : parseErr}` });
    }
    if (!data.settings) {
      data.settings = {};
    }
    Object.assign(data.settings, settings);
    fs.writeFileSync(gbsprojPath, JSON.stringify(data, null, 2), 'utf8');
    res.json({ success: true, settings: data.settings });
  } catch (err) {
    let message = 'Unknown error';
    if (err && typeof err === 'object' && 'message' in err) {
      message = (err as any).message;
    }
    if (!res.headersSent) {
      res.status(500).json({ error: message });
    }
  }
});
app.post('/metadata/update', (req: Request, res: Response) => {
  const { projectRoot, metadata } = req.body;
  if (!projectRoot || !metadata) {
    return res.status(400).json({ error: 'projectRoot and metadata are required' });
  }
  try {
    // Find .gbsproj file in projectRoot
    let gbsprojPath = null;
    if (fs.lstatSync(projectRoot).isDirectory()) {
      const entries = fs.readdirSync(projectRoot, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.gbsproj')) {
          gbsprojPath = path.join(projectRoot, entry.name);
          break;
        }
      }
    } else if (projectRoot.endsWith('.gbsproj') && fs.lstatSync(projectRoot).isFile()) {
      gbsprojPath = projectRoot;
    }
    if (!gbsprojPath) {
      return res.status(404).json({ error: 'No .gbsproj file found in projectRoot' });
    }
    // Read and update .gbsproj
    let data;
    try {
      data = JSON.parse(fs.readFileSync(gbsprojPath, 'utf8'));
    } catch (parseErr) {
      return res.status(400).json({ error: `Invalid JSON in .gbsproj: ${parseErr instanceof Error ? parseErr.message : parseErr}` });
    }
    if (!data.metadata) {
      data.metadata = {};
    }
    Object.assign(data.metadata, metadata);
    fs.writeFileSync(gbsprojPath, JSON.stringify(data, null, 2), 'utf8');
    res.json({ success: true, metadata: data.metadata });
  } catch (err) {
    let message = 'Unknown error';
    if (err && typeof err === 'object' && 'message' in err) {
      message = (err as any).message;
    }
    if (!res.headersSent) {
      res.status(500).json({ error: message });
    }
  }
});
app.post('/prefab/actor/create', (req: Request, res: Response) => {
  const { projectRoot, actorPrefab } = req.body;
  if (!projectRoot || !actorPrefab) {
    return res.status(400).json({ error: 'projectRoot and actorPrefab are required' });
  }
  try {
    // Find .gbsproj file in projectRoot
    let gbsprojPath = null;
    if (fs.lstatSync(projectRoot).isDirectory()) {
      const entries = fs.readdirSync(projectRoot, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.gbsproj')) {
          gbsprojPath = path.join(projectRoot, entry.name);
          break;
        }
      }
    } else if (projectRoot.endsWith('.gbsproj') && fs.lstatSync(projectRoot).isFile()) {
      gbsprojPath = projectRoot;
    }
    if (!gbsprojPath) {
      return res.status(404).json({ error: 'No .gbsproj file found in projectRoot' });
    }
    // Read and update .gbsproj
    let data;
    try {
      data = JSON.parse(fs.readFileSync(gbsprojPath, 'utf8'));
    } catch (parseErr) {
      return res.status(400).json({ error: `Invalid JSON in .gbsproj: ${parseErr instanceof Error ? parseErr.message : parseErr}` });
    }
    if (!Array.isArray(data.prefabActors)) {
      data.prefabActors = [];
    }
    // Assign a unique id if not present
    if (!actorPrefab.id) {
      actorPrefab.id = randomUUID();
    }
    data.prefabActors.push(actorPrefab);
    fs.writeFileSync(gbsprojPath, JSON.stringify(data, null, 2), 'utf8');
    res.json({ success: true, actorPrefab: { ...actorPrefab, id: actorPrefab.id } });
  } catch (err) {
    let message = 'Unknown error';
    if (err && typeof err === 'object' && 'message' in err) {
      message = (err as any).message;
    }
    if (!res.headersSent) {
      res.status(500).json({ error: message });
    }
  }
});
app.post('/prefab/trigger/create', (req: Request, res: Response) => {
  const { projectRoot, triggerPrefab } = req.body;
  if (!projectRoot || !triggerPrefab) {
    return res.status(400).json({ error: 'projectRoot and triggerPrefab are required' });
  }
  try {
    // Find .gbsproj file in projectRoot
    let gbsprojPath = null;
    if (fs.lstatSync(projectRoot).isDirectory()) {
      const entries = fs.readdirSync(projectRoot, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.gbsproj')) {
          gbsprojPath = path.join(projectRoot, entry.name);
          break;
        }
      }
    } else if (projectRoot.endsWith('.gbsproj') && fs.lstatSync(projectRoot).isFile()) {
      gbsprojPath = projectRoot;
    }
    if (!gbsprojPath) {
      return res.status(404).json({ error: 'No .gbsproj file found in projectRoot' });
    }
    // Read and update .gbsproj
    let data;
    try {
      data = JSON.parse(fs.readFileSync(gbsprojPath, 'utf8'));
    } catch (parseErr) {
      return res.status(400).json({ error: `Invalid JSON in .gbsproj: ${parseErr instanceof Error ? parseErr.message : parseErr}` });
    }
    if (!Array.isArray(data.prefabTriggers)) {
      data.prefabTriggers = [];
    }
    // Assign a unique id if not present
    if (!triggerPrefab.id) {
      triggerPrefab.id = randomUUID();
    }
    data.prefabTriggers.push(triggerPrefab);
    fs.writeFileSync(gbsprojPath, JSON.stringify(data, null, 2), 'utf8');
    res.json({ success: true, triggerPrefab: { ...triggerPrefab, id: triggerPrefab.id } });
  } catch (err) {
    let message = 'Unknown error';
    if (err && typeof err === 'object' && 'message' in err) {
      message = (err as any).message;
    }
    if (!res.headersSent) {
      res.status(500).json({ error: message });
    }
  }
});

// ...existing code...

// Create Scene endpoint: adds a new scene to the .gbsproj file
app.post('/scene/create', (req: Request, res: Response) => {
  const { projectRoot, scene } = req.body;
  if (!projectRoot || !scene) {
    return res.status(400).json({ error: 'projectRoot and scene are required' });
  }
  try {
    // Find .gbsproj file in projectRoot
    let gbsprojPath = null;
    if (fs.lstatSync(projectRoot).isDirectory()) {
      const entries = fs.readdirSync(projectRoot, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.gbsproj')) {
          gbsprojPath = path.join(projectRoot, entry.name);
          break;
        }
      }
    } else if (projectRoot.endsWith('.gbsproj') && fs.lstatSync(projectRoot).isFile()) {
      gbsprojPath = projectRoot;
    }
    if (!gbsprojPath) {
      return res.status(404).json({ error: 'No .gbsproj file found in projectRoot' });
    }
    // Read and update .gbsproj
    let data;
    try {
      data = JSON.parse(fs.readFileSync(gbsprojPath, 'utf8'));
    } catch (parseErr) {
      return res.status(400).json({ error: `Invalid JSON in .gbsproj: ${parseErr instanceof Error ? parseErr.message : parseErr}` });
    }
    if (!Array.isArray(data.scenes)) {
      data.scenes = [];
    }
    // Assign a unique id if not present
    if (!scene.id) {
      scene.id = 'scene_' + Date.now();
    }
    data.scenes.push(scene);
    fs.writeFileSync(gbsprojPath, JSON.stringify(data, null, 2), 'utf8');
    res.json({ success: true, scene: { ...scene, id: scene.id } });
  } catch (err) {
    let message = 'Unknown error';
    if (err && typeof err === 'object' && 'message' in err) {
      message = (err as any).message;
    }
    if (!res.headersSent) {
      res.status(500).json({ error: message });
    }
  }
});

// Endpoint to check Claude API key presence
app.get('/claude-key', (_req: Request, res: Response) => {
  const key = process.env.CLAUDE_API_KEY;
  if (key) {
    res.json({ present: true });
  } else {
    res.status(404).json({ present: false });
  }
});

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// find_project endpoint: finds the first .gbsproj file starting from startPath
app.post('/find_project', (req: Request, res: Response) => {
  const { startPath } = req.body;
  if (!startPath) {
    return res.status(400).json({ error: 'startPath is required' });
  }
  try {
    if (!fs.existsSync(startPath)) {
      return res.status(404).json({ error: `Start path does not exist: ${startPath}` });
    }
    // Recursively search for .gbsproj file
    function findGbsprojFile(dir: string): string | null {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isFile() && entry.name.endsWith('.gbsproj')) {
          return fullPath;
        } else if (entry.isDirectory()) {
          const found = findGbsprojFile(fullPath);
          if (found) return found;
        }
      }
      return null;
    }
    const gbsprojPath = findGbsprojFile(startPath);
    if (gbsprojPath) {
      res.json({ projectPath: gbsprojPath });
    } else {
      res.status(404).json({ error: 'No .gbsproj file found' });
    }
  } catch (err) {
    let message = 'Unknown error';
    if (err && typeof err === 'object' && 'message' in err) {
      message = (err as any).message;
    }
    if (!res.headersSent) {
      res.status(500).json({ error: message });
    }
  }
});

// inventory endpoint: lists scenes, actors, triggers, and assets from a GB Studio project root
app.post('/inventory', (req: Request, res: Response) => {
  const { projectRoot } = req.body;
  if (!projectRoot) {
    return res.status(400).json({ error: 'projectRoot is required' });
  }
  try {
    if (!fs.existsSync(projectRoot)) {
      return res.status(404).json({ error: `Project root does not exist: ${projectRoot}` });
    }
    // Only match .gbsproj directly in projectRoot, not in subdirectories, for this test case
    let gbsprojPath = null;
    if (fs.lstatSync(projectRoot).isDirectory()) {
      const entries = fs.readdirSync(projectRoot, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.gbsproj')) {
          gbsprojPath = path.join(projectRoot, entry.name);
          break;
        }
      }
    } else if (projectRoot.endsWith('.gbsproj') && fs.lstatSync(projectRoot).isFile()) {
      gbsprojPath = projectRoot;
    }
    if (!gbsprojPath) {
      return res.status(404).json({ error: 'No .gbsproj file found in projectRoot' });
    }
    let data;
    try {
      data = JSON.parse(fs.readFileSync(gbsprojPath, 'utf8'));
    } catch (parseErr) {
      return res.status(500).json({ error: `Failed to parse .gbsproj: ${parseErr instanceof Error ? parseErr.message : parseErr}` });
    }
    // Extract scenes, actors, triggers, assets (basic structure)
    const scenes = data.scenes || [];
    const actors = scenes.flatMap((scene: any) => scene.actors || []);
    const triggers = scenes.flatMap((scene: any) => scene.triggers || []);
    const assets = data.assets || [];
    res.json({ scenes, actors, triggers, assets });
  } catch (err) {
    let message = 'Unknown error';
    if (err && typeof err === 'object' && 'message' in err) {
      message = (err as any).message;
    }
    if (!res.headersSent) {
      res.status(500).json({ error: message });
    }
  }
});

// validate endpoint: checks .gbsproj and basic project structure
app.post('/validate', (req: Request, res: Response) => {
  const { projectRoot } = req.body;
  if (!projectRoot) {
    return res.status(400).json({ error: 'projectRoot is required' });
  }
  try {
    if (!fs.existsSync(projectRoot)) {
      return res.status(404).json({ error: `Project root does not exist: ${projectRoot}` });
    }
    // Only match .gbsproj directly in projectRoot
    let gbsprojPath = null;
    if (fs.lstatSync(projectRoot).isDirectory()) {
      const entries = fs.readdirSync(projectRoot, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.gbsproj')) {
          gbsprojPath = path.join(projectRoot, entry.name);
          break;
        }
      }
    } else if (projectRoot.endsWith('.gbsproj') && fs.lstatSync(projectRoot).isFile()) {
      gbsprojPath = projectRoot;
    }
    if (!gbsprojPath) {
      return res.status(404).json({ error: 'No .gbsproj file found in projectRoot' });
    }
    let data;
    try {
      data = JSON.parse(fs.readFileSync(gbsprojPath, 'utf8'));
    } catch (parseErr) {
      return res.status(400).json({ error: `Invalid JSON in .gbsproj: ${parseErr instanceof Error ? parseErr.message : parseErr}` });
    }
    // Basic validation: must have scenes array
    if (!Array.isArray(data.scenes)) {
      return res.status(400).json({ error: 'Project is missing scenes array' });
    }
    // Optionally, add more checks here (e.g., actors, triggers, assets)
    res.json({ valid: true, message: 'Project is valid', scenes: data.scenes.length });
  } catch (err) {
    let message = 'Unknown error';
    if (err && typeof err === 'object' && 'message' in err) {
      message = (err as any).message;
    }
    if (!res.headersSent) {
      res.status(500).json({ error: message });
    }
  }
});

// Claude Key endpoint
app.post('/claude/key', (req: Request, res: Response) => {
  const { key } = req.body;
  if (!key) {
    return res.status(400).json({ error: 'key is required' });
  }
  process.env.CLAUDE_API_KEY = key;
  res.json({ success: true });
});

// Export the app for testing (CommonJS style for Jest/Supertest compatibility)
module.exports = app;

// Start the server if this file is run directly
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`MCP Server running on port ${PORT}`);
  }).on('error', (err) => {
    console.error('Failed to start server:', err);
  });
}
