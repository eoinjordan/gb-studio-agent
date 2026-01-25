
import musicRequest from 'supertest';
const musicApp = require('../src/index');
import path from 'path';

describe('Music Create Endpoint', () => {
  const projectRoot = path.join(process.cwd(), 'tests', 'poachermon');
  it('should create a new music', async () => {
    const newMusic = {
      name: 'Test Music',
      filename: 'test.mod',
      settings: {},
      id: undefined,
    };
    const res = await musicRequest(musicApp)
      .post('/music/create')
      .send({ projectRoot, music: newMusic });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.music.name).toBe('Test Music');
    expect(res.body.music.id).toBeDefined();
  });

  it('should return 400 if missing params', async () => {
    const res = await musicRequest(musicApp)
      .post('/music/create')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/projectRoot and music are required/);
  });
});
