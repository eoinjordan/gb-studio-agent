const fs = require("fs");
const path = require("path");
const request = require("supertest");
const app = require("../dist/index.js");

const [projectRoot, backgroundPath, spritePath] = process.argv.slice(2);

if (!projectRoot || !backgroundPath || !spritePath) {
  console.error("Usage: node scripts/build-template-project.js <projectRoot> <backgroundPath> <spritePath>");
  process.exit(1);
}

const ensureExists = (filePath, label) => {
  if (!fs.existsSync(filePath)) {
    console.error(`${label} not found: ${filePath}`);
    process.exit(1);
  }
};

ensureExists(projectRoot, "Project root");
ensureExists(backgroundPath, "Background asset");
ensureExists(spritePath, "Sprite asset");

const backgroundFilename = path.basename(backgroundPath);
const spriteFilename = path.basename(spritePath);

const run = async () => {
  const backgroundRes = await request(app)
    .post("/background/create")
    .send({
      projectRoot,
      background: {
        name: path.parse(backgroundFilename).name,
        filename: backgroundFilename,
      },
    });

  if (backgroundRes.status !== 200) {
    console.error("Background create failed", backgroundRes.status, backgroundRes.body);
    process.exit(1);
  }

  const spriteRes = await request(app)
    .post("/sprite/create")
    .send({
      projectRoot,
      sprite: {
        name: path.parse(spriteFilename).name,
        filename: spriteFilename,
        type: "actor",
      },
    });

  if (spriteRes.status !== 200) {
    console.error("Sprite create failed", spriteRes.status, spriteRes.body);
    process.exit(1);
  }

  const backgroundId = backgroundRes.body.background.id;
  const spriteId = spriteRes.body.sprite.id;

  const sceneRes = await request(app)
    .post("/scene/create")
    .send({
      projectRoot,
      scene: {
        name: "Assets Smoke Test",
        type: "topdown",
        width: 20,
        height: 18,
        backgroundId,
      },
    });

  if (sceneRes.status !== 200) {
    console.error("Scene create failed", sceneRes.status, sceneRes.body);
    process.exit(1);
  }

  const sceneId = sceneRes.body.scene.id;

  const actorRes = await request(app)
    .post("/actor/create")
    .send({
      projectRoot,
      sceneId,
      actor: {
        name: "Test Actor",
        x: 2,
        y: 2,
        spriteSheetId: spriteId,
      },
    });

  if (actorRes.status !== 200) {
    console.error("Actor create failed", actorRes.status, actorRes.body);
    process.exit(1);
  }

  const settingsRes = await request(app)
    .post("/settings/update")
    .send({
      projectRoot,
      settings: {
        startSceneId: sceneId,
      },
    });

  if (settingsRes.status !== 200) {
    console.error("Settings update failed", settingsRes.status, settingsRes.body);
    process.exit(1);
  }

  const validateRes = await request(app)
    .post("/validate")
    .send({ projectRoot });

  if (validateRes.status !== 200) {
    console.error("Validate failed", validateRes.status, validateRes.body);
    process.exit(1);
  }

  console.log(`Template build OK for ${projectRoot}`);
};

run().catch((err) => {
  console.error("Template build error", err);
  process.exit(1);
});
