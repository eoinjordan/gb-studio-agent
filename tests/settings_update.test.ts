
import settingsRequest from 'supertest';
const settingsApp = require('../src/index');
import path from 'path';

describe('Settings Update Endpoint', () => {
  const projectRoot = path.join(process.cwd(), 'tests', 'poachermon');
  it('should update project settings', async () => {
    const newSettings = {
      startSceneId: 'new-scene-id',
      colorMode: 'mixed',
    };
    const res = await settingsRequest(settingsApp)
      .post('/settings/update')
      .send({ projectRoot, settings: newSettings });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.settings.startSceneId).toBe('new-scene-id');
    expect(res.body.settings.colorMode).toBe('mixed');
  });

  it('should return 400 if missing params', async () => {
    const res = await settingsRequest(settingsApp)
      .post('/settings/update')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/projectRoot and settings are required/);
  });
});
