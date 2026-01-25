
import soundRequest from 'supertest';
const soundApp = require('../src/index');
import path from 'path';

describe('Sound Create Endpoint', () => {
  const projectRoot = path.join(process.cwd(), 'tests', 'poachermon');
  it('should create a new sound', async () => {
    const newSound = {
      name: 'Test Sound',
      filename: 'test.wav',
      id: undefined,
    };
    const res = await soundRequest(soundApp)
      .post('/sound/create')
      .send({ projectRoot, sound: newSound });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.sound.name).toBe('Test Sound');
    expect(res.body.sound.id).toBeDefined();
  });

  it('should return 400 if missing params', async () => {
    const res = await soundRequest(soundApp)
      .post('/sound/create')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/projectRoot and sound are required/);
  });
});
