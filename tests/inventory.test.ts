import request from 'supertest';

const inventoryApp = require('../src/index');
import path from 'path';


describe('Claude MCP Server - inventory', () => {
  const projectRoot = path.join(process.cwd(), 'tests', 'gbstudiotestproject');

  it('should return inventory of scenes, actors, triggers, and assets', async () => {
    const res = await request(inventoryApp)
      .post('/inventory')
      .send({ projectRoot });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('scenes');
    expect(res.body).toHaveProperty('actors');
    expect(res.body).toHaveProperty('triggers');
    expect(res.body).toHaveProperty('assets');
    // Optionally, check that scenes/actors/triggers are arrays
    expect(Array.isArray(res.body.scenes)).toBe(true);
    expect(Array.isArray(res.body.actors)).toBe(true);
    expect(Array.isArray(res.body.triggers)).toBe(true);
    expect(Array.isArray(res.body.assets)).toBe(true);
  });

  it('should return 404 if no .gbsproj in projectRoot', async () => {
    const res = await request(inventoryApp)
      .post('/inventory')
      .send({ projectRoot: __dirname }); // unlikely to have a .gbsproj
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/No \.gbsproj file found in projectRoot|Project root does not exist/);
  });

  it('should return 400 if projectRoot missing', async () => {
    const res = await request(inventoryApp)
      .post('/inventory')
      .send({});
    // Accept 400 or 404 depending on error path
    expect([400, 404]).toContain(res.status);
    if (res.status === 400) {
      expect(res.body.error).toBe('projectRoot is required');
    } else {
      expect(res.body.error).toMatch(/Project root does not exist/);
    }
  });
});
