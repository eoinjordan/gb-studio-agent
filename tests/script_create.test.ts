
import scriptRequest from 'supertest';
const scriptApp = require('../src/index');
import path from 'path';

describe('Script Create Endpoint', () => {
  const projectRoot = path.join(process.cwd(), 'tests', 'poachermon');
  it('should create a new script', async () => {
    const newScript = {
      name: 'Test Script',
      filename: 'test.gml',
      id: undefined,
    };
    const res = await scriptRequest(scriptApp)
      .post('/script/create')
      .send({ projectRoot, script: newScript });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.script.name).toBe('Test Script');
    expect(res.body.script.id).toBeDefined();
  });

  it('should return 400 if missing params', async () => {
    const res = await scriptRequest(scriptApp)
      .post('/script/create')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/projectRoot and script are required/);
  });
});
