import request from 'supertest';
const serverApp = require('../src/index');

describe('Claude MCP Server', () => {
  it('should return ok for health check', async () => {
    const res = await request(serverApp).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
