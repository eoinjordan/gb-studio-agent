
import prefabTriggerRequest from 'supertest';
const prefabTriggerApp = require('../src/index');
import path from 'path';

describe('Prefab Trigger Create Endpoint', () => {
  const projectRoot = path.join(process.cwd(), 'tests', 'poachermon');
  it('should create a new prefab trigger', async () => {
    const newTriggerPrefab = {
      name: 'Test Prefab Trigger',
      script: [],
      id: undefined,
    };
    const res = await prefabTriggerRequest(prefabTriggerApp)
      .post('/prefab/trigger/create')
      .send({ projectRoot, triggerPrefab: newTriggerPrefab });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.triggerPrefab.name).toBe('Test Prefab Trigger');
    expect(res.body.triggerPrefab.id).toBeDefined();
  });

  it('should return 400 if missing params', async () => {
    const res = await prefabTriggerRequest(prefabTriggerApp)
      .post('/prefab/trigger/create')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/projectRoot and triggerPrefab are required/);
  });
});
