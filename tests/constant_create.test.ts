
import constantRequest from 'supertest';
const constantApp = require('../src/index');
import path from 'path';

describe('Constant Create Endpoint', () => {
  const projectRoot = path.join(process.cwd(), 'tests', 'poachermon');
  it('should create a new constant', async () => {
    const newConstant = {
      name: 'Test Constant',
      value: '42',
      id: undefined,
    };
    const res = await constantRequest(constantApp)
      .post('/constant/create')
      .send({ projectRoot, constant: newConstant });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.constant.name).toBe('Test Constant');
    expect(res.body.constant.id).toBeDefined();
  });

  it('should return 400 if missing params', async () => {
    const res = await constantRequest(constantApp)
      .post('/constant/create')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/projectRoot and constant are required/);
  });
});
