
import engineFieldValueRequest from 'supertest';
const engineFieldValueApp = require('../src/index');
import path from 'path';

describe('Engine Field Value Create Endpoint', () => {
  const projectRoot = path.join(process.cwd(), 'tests', 'poachermon');
  it('should create a new engine field value', async () => {
    const newEngineFieldValue = {
      name: 'Test Engine Field',
      value: 'test',
      id: undefined,
    };
    const res = await engineFieldValueRequest(engineFieldValueApp)
      .post('/engine-field-value/create')
      .send({ projectRoot, engineFieldValue: newEngineFieldValue });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.engineFieldValue.name).toBe('Test Engine Field');
    expect(res.body.engineFieldValue.id).toBeDefined();
  });

  it('should return 400 if missing params', async () => {
    const res = await engineFieldValueRequest(engineFieldValueApp)
      .post('/engine-field-value/create')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/projectRoot and engineFieldValue are required/);
  });
});
