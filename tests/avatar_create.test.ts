
import avatarRequest from 'supertest';
const avatarApp = require('../src/index');
import path from 'path';

describe('Avatar Create Endpoint', () => {
  const projectRoot = path.join(process.cwd(), 'tests', 'poachermon');
  it('should create a new avatar', async () => {
    const newAvatar = {
      name: 'Test Avatar',
      filename: 'test.png',
      id: undefined,
    };
    const res = await avatarRequest(avatarApp)
      .post('/avatar/create')
      .send({ projectRoot, avatar: newAvatar });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.avatar.name).toBe('Test Avatar');
    expect(res.body.avatar.id).toBeDefined();
  });

  it('should return 400 if missing params', async () => {
    const res = await avatarRequest(avatarApp)
      .post('/avatar/create')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/projectRoot and avatar are required/);
  });
});
