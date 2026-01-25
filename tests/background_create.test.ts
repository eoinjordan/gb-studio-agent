
import backgroundRequest from 'supertest';
const backgroundApp = require('../src/index');
import path from 'path';

describe('Background Create Endpoint', () => {
  const projectRoot = path.join(process.cwd(), 'tests', 'poachermon');
  it('should create a new background', async () => {
    const newBackground = {
      name: 'Test Background',
      width: 20,
      height: 18,
      imageWidth: 160,
      imageHeight: 144,
      filename: 'test.png',
      id: undefined,
    };
    const res = await backgroundRequest(backgroundApp)
      .post('/background/create')
      .send({ projectRoot, background: newBackground });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.background.name).toBe('Test Background');
    expect(res.body.background.id).toBeDefined();
  });

  it('should return 400 if missing params', async () => {
    const res = await backgroundRequest(backgroundApp)
      .post('/background/create')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/projectRoot and background are required/);
  });
});
