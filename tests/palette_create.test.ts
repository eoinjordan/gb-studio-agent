
import paletteRequest from 'supertest';
const paletteApp = require('../src/index');
import path from 'path';

describe('Palette Create Endpoint', () => {
  const projectRoot = path.join(process.cwd(), 'tests', 'poachermon');
  it('should create a new palette', async () => {
    const newPalette = {
      name: 'Test Palette',
      colors: ['#FFFFFF', '#000000'],
      id: undefined,
    };
    const res = await paletteRequest(paletteApp)
      .post('/palette/create')
      .send({ projectRoot, palette: newPalette });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.palette.name).toBe('Test Palette');
    expect(res.body.palette.id).toBeDefined();
  });

  it('should return 400 if missing params', async () => {
    const res = await paletteRequest(paletteApp)
      .post('/palette/create')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/projectRoot and palette are required/);
  });
});
