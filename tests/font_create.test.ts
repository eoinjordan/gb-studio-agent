
import fontRequest from 'supertest';
const fontApp = require('../src/index');
import path from 'path';

describe('Font Create Endpoint', () => {
  const projectRoot = path.join(process.cwd(), 'tests', 'poachermon');
  it('should create a new font', async () => {
    const newFont = {
      name: 'Test Font',
      filename: 'test.ttf',
      id: undefined,
    };
    const res = await fontRequest(fontApp)
      .post('/font/create')
      .send({ projectRoot, font: newFont });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.font.name).toBe('Test Font');
    expect(res.body.font.id).toBeDefined();
  });

  it('should return 400 if missing params', async () => {
    const res = await fontRequest(fontApp)
      .post('/font/create')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/projectRoot and font are required/);
  });
});
