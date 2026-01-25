
import spriteRequest from 'supertest';
const spriteApp = require('../src/index');
import path from 'path';

describe('Sprite Create Endpoint', () => {
  const projectRoot = path.join(process.cwd(), 'tests', 'poachermon');
  it('should create a new sprite', async () => {
    const newSprite = {
      name: 'Test Sprite',
      numFrames: 3,
      type: 'actor',
      filename: 'test.png',
      id: undefined,
    };
    const res = await spriteRequest(spriteApp)
      .post('/sprite/create')
      .send({ projectRoot, sprite: newSprite });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.sprite.name).toBe('Test Sprite');
    expect(res.body.sprite.id).toBeDefined();
  });

  it('should return 400 if missing params', async () => {
    const res = await spriteRequest(spriteApp)
      .post('/sprite/create')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/projectRoot and sprite are required/);
  });
});
