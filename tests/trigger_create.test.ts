
const triggerRequest = require('supertest');
const triggerApp = require('../src/index');
import path from 'path';

describe('POST /trigger/create', () => {
  it('should create a new trigger in a scene', async () => {
    const projectRoot = path.join(process.cwd(), 'tests', 'poachermon');
    const sceneId = 'scene_1769343903060'; // First scene in poachermon
    const newTrigger = {
      name: 'Test Trigger',
      x: 10,
      y: 10,
      // Add other required trigger fields as needed
    };
    const res = await triggerRequest(triggerApp)
      .post('/trigger/create')
      .send({ projectRoot, sceneId, trigger: newTrigger });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.trigger.name).toBe('Test Trigger');
    expect(res.body.trigger.id).toBeDefined();
  });
});
