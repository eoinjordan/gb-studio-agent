import request from 'supertest';
const poachermonApp = require('../src/index');
import path from 'path';

describe('Poachermon End-to-End', () => {
  const projectRoot = path.join(process.cwd(), 'tests', 'poachermon');

  it('should find the Poachermon .gbsproj', async () => {
    const res = await request(poachermonApp)
      .post('/find_project')
      .send({ startPath: projectRoot });
    expect(res.status).toBe(200);
    expect(res.body.projectPath).toMatch(/poachermon\.gbsproj$/i);
  });

  it('should return inventory for Poachermon', async () => {
    const res = await request(poachermonApp)
      .post('/inventory')
      .send({ projectRoot });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('scenes');
    expect(res.body).toHaveProperty('actors');
    expect(res.body).toHaveProperty('triggers');
    expect(res.body).toHaveProperty('assets');
    // Optionally, check for educational content or poacher/animal logic
    // Example: expect(res.body.actors.some(a => /poacher/i.test(a.name))).toBe(true);
  });

  // End goal: This test ensures the MCP can discover and inventory a full educational game project.
  // For full build/validate automation, implement and test those endpoints next.
});
