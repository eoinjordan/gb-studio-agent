
import emoteRequest from 'supertest';
const emoteApp = require('../src/index');
import path from 'path';

describe('Emote Create Endpoint', () => {
  const projectRoot = path.join(process.cwd(), 'tests', 'poachermon');
  it('should create a new emote', async () => {
    const newEmote = {
      name: 'Test Emote',
      filename: 'test.png',
      id: undefined,
    };
    const res = await emoteRequest(emoteApp)
      .post('/emote/create')
      .send({ projectRoot, emote: newEmote });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.emote.name).toBe('Test Emote');
    expect(res.body.emote.id).toBeDefined();
  });

  it('should return 400 if missing params', async () => {
    const res = await emoteRequest(emoteApp)
      .post('/emote/create')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/projectRoot and emote are required/);
  });
});
