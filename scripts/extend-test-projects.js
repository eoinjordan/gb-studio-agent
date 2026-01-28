const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const workspaceRoot = process.cwd();
const templateAssetsRoot = path.join(
  workspaceRoot,
  'gb-studio-latest',
  'appData',
  'templates',
  'gbs2',
  'assets'
);

const EXCLUDED_DIR_NAMES = new Set([
  '.git',
  'node_modules',
  'dist',
  'gb-studio-latest',
  'gb-studio-agent',
]);

const shouldSkipDir = (dirName) => EXCLUDED_DIR_NAMES.has(dirName);

const shouldSkipPath = () => false;

const ASSET_SOURCES = {
  backgrounds: { dir: 'backgrounds', candidates: ['placeholder.png'], strictExt: false },
  sprites: { dir: 'sprites', candidates: ['player.png', 'npc001.png', 'cat.png'], strictExt: false },
  avatars: { dir: 'avatars', candidates: ['danger.png'], strictExt: false },
  emotes: { dir: 'emotes', candidates: ['anger.png'], strictExt: false },
  music: { dir: 'music', candidates: ['Rulz_BattleTheme.uge', 'Rulz_BattleTheme.mod'], strictExt: true },
  sounds: { dir: 'sounds', candidates: ['Tronimal_Sound_Effects.sav'], strictExt: true },
  tilesets: { dir: 'tilesets', candidates: ['flowers.png'], strictExt: false },
  fonts: { dir: 'fonts', candidates: ['gbs-mono.png'], strictExt: false },
};

const ASSET_EXTS_BY_TYPE = {
  backgrounds: new Set(['.png']),
  sprites: new Set(['.png']),
  avatars: new Set(['.png']),
  emotes: new Set(['.png']),
  tilesets: new Set(['.png']),
  fonts: new Set(['.png']),
  music: new Set(['.uge', '.mod']),
  sounds: new Set(['.wav', '.wave', '.sav']),
};

const ensureDir = (dir) => {
  fs.mkdirSync(dir, { recursive: true });
};

const toSlug = (value) => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 64) || 'background';
};

const readJsonWithSalvage = (filePath) => {
  const raw = fs.readFileSync(filePath, 'utf8');
  const cleaned = raw.replace(/^\uFEFF/, '');
  try {
    return { data: JSON.parse(cleaned), salvaged: false };
  } catch (err) {
    const salvaged = salvageJson(cleaned);
    if (!salvaged) {
      throw err;
    }
    fs.writeFileSync(filePath, JSON.stringify(salvaged, null, 2), 'utf8');
    return { data: salvaged, salvaged: true };
  }
};

const salvageJson = (raw) => {
  let idx = raw.lastIndexOf('}');
  while (idx !== -1) {
    const candidate = raw.slice(0, idx + 1);
    try {
      return JSON.parse(candidate);
    } catch (err) {
      idx = raw.lastIndexOf('}', idx - 1);
    }
  }
  return null;
};

const readPngMeta = (filePath) => {
  if (!fs.existsSync(filePath)) return null;
  const buffer = fs.readFileSync(filePath);
  if (buffer.length < 24) return null;
  const signature = buffer.subarray(0, 8);
  const expectedSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (!signature.equals(expectedSignature)) return null;
  const chunkType = buffer.subarray(12, 16).toString('ascii');
  if (chunkType !== 'IHDR') return null;
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
};

const isEmptyFile = (filePath) => {
  try {
    const stat = fs.statSync(filePath);
    if (!stat.isFile()) return true;
    return stat.size === 0;
  } catch (err) {
    return true;
  }
};

const isValidPng = (filePath) => {
  const meta = readPngMeta(filePath);
  return !!(meta && meta.width > 0 && meta.height > 0);
};

const removeDestPath = (dest) => {
  try {
    const stat = fs.statSync(dest);
    if (stat.isDirectory()) {
      fs.rmSync(dest, { recursive: true, force: true });
      return;
    }
    fs.chmodSync(dest, 0o666);
    fs.unlinkSync(dest);
  } catch (err) {
    return;
  }
};

const getAssetSourcePath = (assetType, filename) => {
  const config = ASSET_SOURCES[assetType];
  if (!config || !config.candidates.length) return null;
  const ext = path.extname(filename || '').toLowerCase();
  const byExt = ext
    ? config.candidates.find((name) => path.extname(name).toLowerCase() === ext)
    : null;
  if (ext && config.strictExt && !byExt) return null;
  const sourceName = byExt || config.candidates[0];
  const sourcePath = path.join(templateAssetsRoot, config.dir, sourceName);
  if (!fs.existsSync(sourcePath)) return null;
  return { sourcePath, sourceName };
};

const ensureFontCompanionJson = (assetsDir, filename, sourceName) => {
  const base = path.basename(filename, path.extname(filename));
  if (!base) return false;
  const targetJson = path.join(assetsDir, `${base}.json`);
  if (fs.existsSync(targetJson)) return false;
  const sourceBase = path.basename(sourceName, path.extname(sourceName));
  const sourceJson = path.join(templateAssetsRoot, 'fonts', `${sourceBase}.json`);
  if (!fs.existsSync(sourceJson)) return false;
  fs.copyFileSync(sourceJson, targetJson);
  return true;
};

const writeSilentWav = (filePath) => {
  const sampleRate = 22050;
  const numChannels = 1;
  const bitsPerSample = 8;
  const durationSeconds = 1;
  const blockAlign = numChannels * (bitsPerSample / 8);
  const byteRate = sampleRate * blockAlign;
  const dataSize = sampleRate * durationSeconds * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  buffer.fill(0x80, 44);
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, buffer);
};

const writeBackgroundResource = (projectBackgroundsDir, background, assetPath) => {
  const slug = toSlug(background.name || background.id || 'background');
  let resourcePath = path.join(projectBackgroundsDir, `${slug}.gbsres`);
  if (fs.existsSync(resourcePath)) {
    resourcePath = path.join(projectBackgroundsDir, `${slug}_${background.id}.gbsres`);
  }
  const meta = assetPath ? readPngMeta(assetPath) : null;
  const imageWidth = background.imageWidth ?? meta?.width ?? 160;
  const imageHeight = background.imageHeight ?? meta?.height ?? 144;
  const width = background.width ?? Math.max(1, Math.floor(imageWidth / 8));
  const height = background.height ?? Math.max(1, Math.floor(imageHeight / 8));
  const resource = {
    _resourceType: 'background',
    id: background.id,
    name: background.name || slug,
    symbol: `bg_${slug}`,
    width,
    height,
    imageWidth,
    imageHeight,
    filename: background.filename || '',
    tileColors: background.tileColors ?? '',
    autoColor: background.autoColor ?? false,
  };
  fs.writeFileSync(resourcePath, JSON.stringify(resource, null, 2), 'utf8');
};

const ensureAssetFile = (assetType, assetsDir, filename) => {
  if (!filename) return { copied: false, sourceName: null };
  const dest = path.join(assetsDir, filename);
  const ext = path.extname(filename || '').toLowerCase();
  const exists = fs.existsSync(dest);
  const needsReplace =
    exists &&
    (isEmptyFile(dest) || (ext === '.png' && !isValidPng(dest)));
  if (exists && !needsReplace) return { copied: false, sourceName: null };
  const source = getAssetSourcePath(assetType, filename);
  if (!source) {
    if (assetType === 'sounds' && (ext === '.wav' || ext === '.wave')) {
      try {
        writeSilentWav(dest);
        return { copied: true, sourceName: null };
      } catch (err) {
        return { copied: false, sourceName: null };
      }
    }
    return { copied: false, sourceName: null };
  }
  ensureDir(path.dirname(dest));
  if (exists && needsReplace) {
    removeDestPath(dest);
  }
  try {
    fs.copyFileSync(source.sourcePath, dest);
    return { copied: true, sourceName: source.sourceName };
  } catch (err) {
    if (exists) {
      try {
        removeDestPath(dest);
        fs.copyFileSync(source.sourcePath, dest);
        return { copied: true, sourceName: source.sourceName };
      } catch (innerErr) {
        return { copied: false, sourceName: null };
      }
    }
    return { copied: false, sourceName: null };
  }
};

const repairAssetsInDir = (assetType, assetsDir) => {
  const validExts = ASSET_EXTS_BY_TYPE[assetType];
  if (!validExts || !fs.existsSync(assetsDir)) return 0;
  let repaired = 0;
  for (const entry of fs.readdirSync(assetsDir, { withFileTypes: true })) {
    if (!entry.isFile() && !entry.isDirectory()) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (!validExts.has(ext)) continue;
    const result = ensureAssetFile(assetType, assetsDir, entry.name);
    if (result.copied) {
      repaired += 1;
    }
    if (assetType === 'fonts' && ext === '.png') {
      if (ensureFontCompanionJson(assetsDir, entry.name, result.sourceName || ASSET_SOURCES.fonts.candidates[0])) {
        repaired += 1;
      }
    }
  }
  return repaired;
};

const processProject = (gbsprojPath) => {
  const projectRoot = path.dirname(gbsprojPath);
  const projectName = path.basename(projectRoot);

  let data;
  let salvaged = false;
  try {
    const result = readJsonWithSalvage(gbsprojPath);
    data = result.data;
    salvaged = result.salvaged;
  } catch (err) {
    console.log(`[skip] ${projectName} (${path.relative(workspaceRoot, gbsprojPath)}) invalid JSON`);
    return null;
  }

  let dirty = false;
  const stats = {
    scenesUpdated: 0,
    sceneResourcesUpdated: 0,
    backgroundResourcesCreated: 0,
    backgroundsSynced: 0,
    assetsCopied: 0,
    salvage: salvaged,
  };

  if (!Array.isArray(data.backgrounds)) {
    data.backgrounds = [];
    dirty = true;
  }
  if (!Array.isArray(data.scenes)) {
    data.scenes = [];
    dirty = true;
  }
  if (!data.settings || typeof data.settings !== 'object') {
    data.settings = {};
    dirty = true;
  }

  const assetsBackgroundsDir = path.join(projectRoot, 'assets', 'backgrounds');
  ensureDir(assetsBackgroundsDir);
  const placeholderDest = path.join(assetsBackgroundsDir, 'placeholder.png');
  if (!fs.existsSync(placeholderDest)) {
    const placeholderSource = getAssetSourcePath('backgrounds', 'placeholder.png');
    if (placeholderSource) {
      fs.copyFileSync(placeholderSource.sourcePath, placeholderDest);
      stats.assetsCopied += 1;
    }
  }

  const backgroundsById = new Map();
  for (const background of data.backgrounds) {
    if (!background.id) {
      background.id = randomUUID();
      dirty = true;
    }
    backgroundsById.set(background.id, background);
  }

  const projectDir = path.join(projectRoot, 'project');
  const projectBackgroundsDir = path.join(projectDir, 'backgrounds');
  const projectScenesDir = path.join(projectDir, 'scenes');
  ensureDir(projectDir);
  ensureDir(projectScenesDir);

  const backgroundResourcesById = new Map();
  const backgroundResourceFiles = [];
  if (fs.existsSync(projectBackgroundsDir)) {
    const files = fs.readdirSync(projectBackgroundsDir)
      .filter((name) => name.toLowerCase().endsWith('.gbsres'));
    for (const file of files) {
      const filePath = path.join(projectBackgroundsDir, file);
      try {
        const resource = readJsonWithSalvage(filePath).data;
        if (resource && resource._resourceType === 'background' && resource.id) {
          backgroundResourcesById.set(resource.id, resource);
          backgroundResourceFiles.push({ path: filePath, resource });
        }
      } catch (err) {
        continue;
      }
    }
  }

  const backgroundIdRemap = new Map();
  const backgroundFilenameIndex = new Map();
  for (const entry of backgroundResourceFiles) {
    const filenameKey = (entry.resource.filename || '').toLowerCase();
    if (!filenameKey) continue;
    if (!backgroundFilenameIndex.has(filenameKey)) {
      backgroundFilenameIndex.set(filenameKey, entry);
      continue;
    }
    const canonical = backgroundFilenameIndex.get(filenameKey);
    if (canonical && canonical.resource?.id && entry.resource?.id) {
      backgroundIdRemap.set(entry.resource.id, canonical.resource.id);
    }
    try {
      fs.unlinkSync(entry.path);
    } catch (err) {
      // ignore
    }
    backgroundResourcesById.delete(entry.resource.id);
  }

  if (backgroundIdRemap.size > 0) {
    const refreshed = new Map();
    for (const background of data.backgrounds) {
      const mappedId = backgroundIdRemap.get(background.id);
      if (mappedId) {
        background.id = mappedId;
        dirty = true;
      }
      refreshed.set(background.id, background);
    }
    backgroundsById.clear();
    for (const [id, bg] of refreshed.entries()) {
      backgroundsById.set(id, bg);
    }
  }

  const backgroundFilenameRemap = new Map();
  const uniqueBackgrounds = [];
  const dataBackgroundFilenameIndex = new Map();
  for (const background of data.backgrounds) {
    const filenameKey = (background.filename || '').toLowerCase();
    if (!filenameKey) {
      uniqueBackgrounds.push(background);
      continue;
    }
    if (!dataBackgroundFilenameIndex.has(filenameKey)) {
      dataBackgroundFilenameIndex.set(filenameKey, background);
      uniqueBackgrounds.push(background);
      continue;
    }
    const canonical = dataBackgroundFilenameIndex.get(filenameKey);
    if (canonical && canonical.id && background.id) {
      backgroundFilenameRemap.set(background.id, canonical.id);
      backgroundIdRemap.set(background.id, canonical.id);
    }
  }
  if (backgroundFilenameRemap.size > 0) {
    data.backgrounds = uniqueBackgrounds;
    dirty = true;
    backgroundsById.clear();
    for (const background of data.backgrounds) {
      backgroundsById.set(background.id, background);
    }
  }

  for (const resource of backgroundResourcesById.values()) {
    if (!resource || !resource.id) continue;
    if (!backgroundsById.has(resource.id)) {
      const synced = {
        id: resource.id,
        name: resource.name || 'Background',
        filename: resource.filename || 'placeholder.png',
        width: resource.width,
        height: resource.height,
        imageWidth: resource.imageWidth,
        imageHeight: resource.imageHeight,
        tileColors: resource.tileColors,
        autoColor: resource.autoColor,
      };
      data.backgrounds.push(synced);
      backgroundsById.set(resource.id, synced);
      dirty = true;
      stats.backgroundsSynced += 1;
    } else {
      const existing = backgroundsById.get(resource.id);
      if (existing && !existing.filename && resource.filename) {
        existing.filename = resource.filename;
        dirty = true;
      }
    }
  }

  let fallbackBackground = null;
  if (backgroundResourcesById.size > 0) {
    const firstResource = backgroundResourcesById.values().next().value;
    fallbackBackground = backgroundsById.get(firstResource.id) || null;
    if (!fallbackBackground) {
      fallbackBackground = {
        id: firstResource.id,
        name: firstResource.name || 'Placeholder Background',
        filename: firstResource.filename || 'placeholder.png',
        width: firstResource.width,
        height: firstResource.height,
        imageWidth: firstResource.imageWidth,
        imageHeight: firstResource.imageHeight,
        tileColors: firstResource.tileColors,
        autoColor: firstResource.autoColor,
      };
      data.backgrounds.push(fallbackBackground);
      backgroundsById.set(fallbackBackground.id, fallbackBackground);
      dirty = true;
      stats.backgroundsSynced += 1;
    }
  }

  if (!fallbackBackground && data.backgrounds.length > 0) {
    fallbackBackground = data.backgrounds[0];
  }

  if (!fallbackBackground) {
    fallbackBackground = {
      id: randomUUID(),
      name: 'Placeholder Background',
      filename: 'placeholder.png',
      width: 20,
      height: 18,
      imageWidth: 160,
      imageHeight: 144,
      tileColors: '',
      autoColor: false,
    };
    data.backgrounds.push(fallbackBackground);
    backgroundsById.set(fallbackBackground.id, fallbackBackground);
    dirty = true;
  }

  for (const background of data.backgrounds) {
    if (!background.filename) {
      background.filename = ASSET_SOURCES.backgrounds.candidates[0];
      dirty = true;
    }
    const bgCopy = ensureAssetFile('backgrounds', assetsBackgroundsDir, background.filename);
    if (bgCopy.copied) {
      stats.assetsCopied += 1;
    }
    const meta = background.filename
      ? readPngMeta(path.join(assetsBackgroundsDir, background.filename))
      : null;
    const imageWidth = background.imageWidth ?? meta?.width ?? 160;
    const imageHeight = background.imageHeight ?? meta?.height ?? 144;
    const width = background.width ?? Math.max(1, Math.floor(imageWidth / 8));
    const height = background.height ?? Math.max(1, Math.floor(imageHeight / 8));
    if (background.imageWidth !== imageWidth) {
      background.imageWidth = imageWidth;
      dirty = true;
    }
    if (background.imageHeight !== imageHeight) {
      background.imageHeight = imageHeight;
      dirty = true;
    }
    if (background.width !== width) {
      background.width = width;
      dirty = true;
    }
    if (background.height !== height) {
      background.height = height;
      dirty = true;
    }
  }

  const assetLists = [
    { key: 'spriteSheets', type: 'sprites' },
    { key: 'tilesets', type: 'tilesets' },
    { key: 'avatars', type: 'avatars' },
    { key: 'emotes', type: 'emotes' },
    { key: 'music', type: 'music' },
    { key: 'sounds', type: 'sounds' },
    { key: 'fonts', type: 'fonts' },
  ];

  for (const list of assetLists) {
    if (!Array.isArray(data[list.key])) {
      data[list.key] = [];
      dirty = true;
    }
    const assetsDir = path.join(projectRoot, 'assets', ASSET_SOURCES[list.type].dir);
    ensureDir(assetsDir);
    for (const item of data[list.key]) {
      if (!item || typeof item !== 'object') continue;
      if (!item.filename) {
        item.filename = ASSET_SOURCES[list.type].candidates[0];
        dirty = true;
      }
      const assetCopy = ensureAssetFile(list.type, assetsDir, item.filename);
      if (assetCopy.copied) {
        stats.assetsCopied += 1;
      }
      if (list.type === 'fonts') {
        if (ensureFontCompanionJson(assetsDir, item.filename, assetCopy.sourceName || ASSET_SOURCES.fonts.candidates[0])) {
          stats.assetsCopied += 1;
        }
      }
    }
  }

  for (const [assetType, config] of Object.entries(ASSET_SOURCES)) {
    const assetsDir = path.join(projectRoot, 'assets', config.dir);
    const repaired = repairAssetsInDir(assetType, assetsDir);
    if (repaired) {
      stats.assetsCopied += repaired;
    }
  }
  const fontsDir = path.join(projectRoot, 'assets', ASSET_SOURCES.fonts.dir);
  ensureDir(fontsDir);
  const fontEntries = fs.readdirSync(fontsDir, { withFileTypes: true });
  const hasFontFile = fontEntries.some(
    (entry) => entry.isFile() && path.extname(entry.name).toLowerCase() === '.png'
  );
  if (!hasFontFile) {
    const fallbackFont = ASSET_SOURCES.fonts.candidates[0];
    const source = getAssetSourcePath('fonts', fallbackFont);
    const dest = path.join(fontsDir, fallbackFont);
    if (source) {
      try {
        fs.copyFileSync(source.sourcePath, dest);
        stats.assetsCopied += 1;
      } catch (err) {
        // ignore
      }
    }
    if (ensureFontCompanionJson(fontsDir, fallbackFont, fallbackFont)) {
      stats.assetsCopied += 1;
    }
  }

  if (fs.existsSync(projectDir)) {
    ensureDir(projectBackgroundsDir);
    for (const background of data.backgrounds) {
      if (!backgroundResourcesById.has(background.id)) {
        const assetPath = background.filename ? path.join(assetsBackgroundsDir, background.filename) : '';
        writeBackgroundResource(projectBackgroundsDir, background, assetPath);
        backgroundResourcesById.set(background.id, { id: background.id, filename: background.filename });
        stats.backgroundResourcesCreated += 1;
      }
    }
  }

  const resourceBackgroundIds = new Set(backgroundResourcesById.keys());
  const knownBackgroundIds = new Set([
    ...backgroundsById.keys(),
    ...resourceBackgroundIds,
  ]);

  for (const scene of data.scenes) {
    if (!scene.id) {
      scene.id = `scene_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      dirty = true;
    }
    if (!Array.isArray(scene.actors)) {
      scene.actors = [];
      dirty = true;
    }
    if (!Array.isArray(scene.triggers)) {
      scene.triggers = [];
      dirty = true;
    }
    if (!scene.type) {
      const fallbackType = data.settings.defaultSceneTypeId || 'TOPDOWN';
      scene.type = String(fallbackType).toLowerCase();
      dirty = true;
    }
    if (!Number.isFinite(scene.width) || scene.width <= 0) {
      scene.width = fallbackBackground.width || 20;
      dirty = true;
    }
    if (!Number.isFinite(scene.height) || scene.height <= 0) {
      scene.height = fallbackBackground.height || 18;
      dirty = true;
    }
    if (scene.backgroundId && backgroundIdRemap.has(scene.backgroundId)) {
      scene.backgroundId = backgroundIdRemap.get(scene.backgroundId);
      dirty = true;
    }
    if (!scene.backgroundId || !knownBackgroundIds.has(scene.backgroundId)) {
      scene.backgroundId = fallbackBackground.id;
      dirty = true;
      stats.scenesUpdated += 1;
    }
  }

  if (data.scenes.length === 0 && fallbackBackground) {
    const fallbackType = data.settings.defaultSceneTypeId || 'TOPDOWN';
    data.scenes.push({
      id: `scene_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: 'Scene 1',
      type: String(fallbackType).toLowerCase(),
      width: fallbackBackground.width || 20,
      height: fallbackBackground.height || 18,
      backgroundId: fallbackBackground.id,
      actors: [],
      triggers: [],
    });
    dirty = true;
    stats.scenesUpdated += 1;
  }

  const sceneIds = new Set(data.scenes.map((scene) => scene.id));
  if (!data.settings.startSceneId || !sceneIds.has(data.settings.startSceneId)) {
    data.settings.startSceneId = data.scenes[0]?.id || '';
    dirty = true;
  }

  const sceneResourcePaths = [];
  const sceneResourceIds = new Set();
  const updateSceneResources = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        updateSceneResources(fullPath);
      } else if (entry.isFile() && entry.name === 'scene.gbsres') {
        try {
          const sceneResource = readJsonWithSalvage(fullPath).data;
          if (!sceneResource.id) {
            sceneResource.id = randomUUID();
          }
          const backgroundId = sceneResource.backgroundId;
          if (backgroundId && backgroundIdRemap.has(backgroundId)) {
            sceneResource.backgroundId = backgroundIdRemap.get(backgroundId);
          }
          if (!backgroundId || !knownBackgroundIds.has(backgroundId)) {
            sceneResource.backgroundId = fallbackBackground.id;
            fs.writeFileSync(fullPath, JSON.stringify(sceneResource, null, 2), 'utf8');
            stats.sceneResourcesUpdated += 1;
          }
          sceneResourcePaths.push(fullPath);
          sceneResourceIds.add(sceneResource.id);
        } catch (err) {
          continue;
        }
      }
    }
  };
  updateSceneResources(projectScenesDir);

  if (sceneResourcePaths.length === 0 && fallbackBackground) {
    const defaultSceneId = randomUUID();
    const defaultSceneName = 'Scene 1';
    const defaultSceneSlug = toSlug(defaultSceneName);
    const defaultSceneDir = path.join(projectScenesDir, defaultSceneSlug);
    ensureDir(defaultSceneDir);
    const defaultScene = {
      _resourceType: 'scene',
      _index: 0,
      id: defaultSceneId,
      type: String(data.settings.defaultSceneTypeId || 'TOPDOWN'),
      name: defaultSceneName,
      symbol: `scene_${defaultSceneSlug}`,
      x: 0,
      y: 0,
      width: fallbackBackground.width || 20,
      height: fallbackBackground.height || 18,
      backgroundId: fallbackBackground.id,
      tilesetId: '',
      colorModeOverride: 'none',
      paletteIds: [],
      spritePaletteIds: [],
      autoFadeSpeed: 1,
      script: [],
      playerHit1Script: [],
      playerHit2Script: [],
      playerHit3Script: [],
      collisions: '',
    };
    const defaultScenePath = path.join(defaultSceneDir, 'scene.gbsres');
    fs.writeFileSync(defaultScenePath, JSON.stringify(defaultScene, null, 2), 'utf8');
    sceneResourcePaths.push(defaultScenePath);
    sceneResourceIds.add(defaultSceneId);
    stats.sceneResourcesUpdated += 1;
  }

  if (sceneResourceIds.size > 0) {
    const settingsPath = path.join(projectDir, 'settings.gbsres');
    if (fs.existsSync(settingsPath)) {
      try {
        const settingsResource = readJsonWithSalvage(settingsPath).data;
        if (!settingsResource.startSceneId || !sceneResourceIds.has(settingsResource.startSceneId)) {
          settingsResource.startSceneId = Array.from(sceneResourceIds)[0];
          fs.writeFileSync(settingsPath, JSON.stringify(settingsResource, null, 2), 'utf8');
        }
      } catch (err) {
        // ignore
      }
    }
  }

  if (dirty) {
    fs.writeFileSync(gbsprojPath, JSON.stringify(data, null, 2), 'utf8');
  }

  return { projectName, gbsprojPath, stats };
};

if (!fs.existsSync(templateAssetsRoot)) {
  console.error(`Template assets not found: ${templateAssetsRoot}`);
  process.exit(1);
}

const gbsprojPaths = [];
const scanForProjects = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (shouldSkipDir(entry.name)) continue;
      scanForProjects(path.join(dir, entry.name));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.gbsproj')) {
      const fullPath = path.join(dir, entry.name);
      const projectRoot = path.dirname(fullPath);
      if (shouldSkipPath(projectRoot)) continue;
      gbsprojPaths.push(fullPath);
    }
  }
};
scanForProjects(workspaceRoot);

const results = [];
for (const gbsprojPath of gbsprojPaths) {
  const result = processProject(gbsprojPath);
  if (result) results.push(result);
}

for (const result of results) {
  const relPath = path.relative(workspaceRoot, result.gbsprojPath);
  const stats = result.stats;
  const tags = [];
  if (stats.salvage) tags.push('salvaged');
  if (stats.scenesUpdated) tags.push(`scenes:${stats.scenesUpdated}`);
  if (stats.sceneResourcesUpdated) tags.push(`scene-res:${stats.sceneResourcesUpdated}`);
  if (stats.backgroundsSynced) tags.push(`bg-sync:${stats.backgroundsSynced}`);
  if (stats.backgroundResourcesCreated) tags.push(`bg-res:${stats.backgroundResourcesCreated}`);
  if (stats.assetsCopied) tags.push(`assets:${stats.assetsCopied}`);
  const tagText = tags.length ? ` (${tags.join(', ')})` : '';
  console.log(`[ok] ${result.projectName} -> ${relPath}${tagText}`);
}
