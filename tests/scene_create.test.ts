
import sceneRequest from 'supertest';
const sceneApp = require('../src/index');
import path from 'path';

describe('Scene Create Endpoint', () => {
  const projectRoot = path.join(process.cwd(), 'tests', 'poachermon');
  it('should create a new scene', async () => {
    const newScene = {
      name: 'Test Scene',
      id: undefined,
      actors: [],
      triggers: [],
      // Add other required scene fields as needed
    };
    const res = await sceneRequest(sceneApp)
      .post('/scene/create')
      .send({ projectRoot, scene: newScene });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.scene.name).toBe('Test Scene');
    expect(res.body.scene.id).toBeDefined();
  });

  it('should return 400 if missing params', async () => {
    const res = await sceneRequest(sceneApp)
      .post('/scene/create')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/projectRoot and scene are required/);
  });
});
