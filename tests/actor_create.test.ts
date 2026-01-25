
import actorRequest from 'supertest';
const actorApp = require('../src/index');
import path from 'path';

describe('POST /actor/create', () => {
  it('should create a new actor in a scene', async () => {
    const projectRoot = path.join(process.cwd(), 'tests', 'poachermon');
    const sceneId = 'scene_1769343903060'; // First scene in poachermon
    const newActor = {
      name: 'Test Actor',
      x: 5,
      y: 5,
      // Add other required actor fields as needed
    };
    const res = await actorRequest(actorApp)
      .post('/actor/create')
      .send({ projectRoot, sceneId, actor: newActor });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.actor.name).toBe('Test Actor');
    expect(res.body.actor.id).toBeDefined();
  });
});
