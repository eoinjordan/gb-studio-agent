
import prefabActorRequest from 'supertest';
const prefabActorApp = require('../src/index');
import path from 'path';

describe('Prefab Actor Create Endpoint', () => {
  const projectRoot = path.join(process.cwd(), 'tests', 'poachermon');
  it('should create a new prefab actor', async () => {
    const newActorPrefab = {
      name: 'Test Prefab Actor',
      spriteSheetId: 'some-id',
      id: undefined,
    };
    const res = await prefabActorRequest(prefabActorApp)
      .post('/prefab/actor/create')
      .send({ projectRoot, actorPrefab: newActorPrefab });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.actorPrefab.name).toBe('Test Prefab Actor');
    expect(res.body.actorPrefab.id).toBeDefined();
  });

  it('should return 400 if missing params', async () => {
    const res = await prefabActorRequest(prefabActorApp)
      .post('/prefab/actor/create')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/projectRoot and actorPrefab are required/);
  });
});
