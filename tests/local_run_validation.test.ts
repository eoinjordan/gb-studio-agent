import request from 'supertest';
const app = require('../src/index');
import path from 'path';

describe('Local Run Validation', () => {
  it('should start the server and respond to /health', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('should validate a real project', async () => {
    const projectRoot = path.join(process.cwd(), 'tests', 'poachermon');
    const res = await request(app)
      .post('/validate')
      .send({ projectRoot });
    expect(res.status).toBe(200);
    expect(res.body.valid).toBe(true);
    expect(typeof res.body.scenes).toBe('number');
  });
});
