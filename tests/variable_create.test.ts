
import variableRequest from 'supertest';
const variableApp = require('../src/index');
import path from 'path';

describe('Variable Create Endpoint', () => {
  const projectRoot = path.join(process.cwd(), 'tests', 'poachermon');
  it('should create a new variable', async () => {
    const newVariable = {
      name: 'Test Variable',
      id: undefined,
    };
    const res = await variableRequest(variableApp)
      .post('/variable/create')
      .send({ projectRoot, variable: newVariable });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.variable.name).toBe('Test Variable');
    expect(res.body.variable.id).toBeDefined();
  });

  it('should return 400 if missing params', async () => {
    const res = await variableRequest(variableApp)
      .post('/variable/create')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/projectRoot and variable are required/);
  });
});
