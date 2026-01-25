
import tilesetRequest from 'supertest';
const tilesetApp = require('../src/index');
import path from 'path';

describe('Tileset Create Endpoint', () => {
  const projectRoot = path.join(process.cwd(), 'tests', 'poachermon');
  it('should create a new tileset', async () => {
    const newTileset = {
      name: 'Test Tileset',
      filename: 'test.png',
      id: undefined,
    };
    const res = await tilesetRequest(tilesetApp)
      .post('/tileset/create')
      .send({ projectRoot, tileset: newTileset });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.tileset.name).toBe('Test Tileset');
    expect(res.body.tileset.id).toBeDefined();
  });

  it('should return 400 if missing params', async () => {
    const res = await tilesetRequest(tilesetApp)
      .post('/tileset/create')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/projectRoot and tileset are required/);
  });
});
