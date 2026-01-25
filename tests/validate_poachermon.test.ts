
import validateRequest from 'supertest';
const validateApp = require('../src/index');
import path from 'path';

describe('Poachermon Project Validation', () => {
  const projectRoot = path.join(process.cwd(), 'tests', 'poachermon');

  it('should validate the Poachermon project', async () => {
    const res = await validateRequest(validateApp)
      .post('/validate')
      .send({ projectRoot });
    expect(res.status).toBe(200);
    expect(res.body.valid).toBe(true);
    expect(res.body.message).toMatch(/valid/i);
    expect(typeof res.body.scenes).toBe('number');
  });

  it('should return 400 for missing projectRoot', async () => {
    const res = await validateRequest(validateApp)
      .post('/validate')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/projectRoot is required/);
  });
});
