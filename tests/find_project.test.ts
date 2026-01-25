
import findProjectRequest from 'supertest';
const findProjectApp = require('../src/index');

describe('Claude MCP Server', () => {
  it('should return ok for health check', async () => {
    const res = await findProjectRequest(findProjectApp).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('should find a .gbsproj file', async () => {
    const res = await findProjectRequest(findProjectApp)
      .post('/find_project')
      .send({ startPath: 'C:/Users/Eoin/git/workspace/tests/gbstudiotestproject' });
    expect(res.status).toBe(200);
    expect(res.body.projectPath).toMatch(/\.gbsproj$/);
  });

  it('should return 404 if no .gbsproj found', async () => {
    const res = await findProjectRequest(findProjectApp)
      .post('/find_project')
      .send({ startPath: '__MOCK__/empty' });
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/No \.gbsproj file found|Start path does not exist/);
  });

  it('should return 400 if startPath missing', async () => {
    const res = await findProjectRequest(findProjectApp)
      .post('/find_project')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('startPath is required');
  });
});
