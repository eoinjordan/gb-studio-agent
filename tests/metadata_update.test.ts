
import metadataRequest from 'supertest';
const metadataApp = require('../src/index');
import path from 'path';

describe('Metadata Update Endpoint', () => {
  const projectRoot = path.join(process.cwd(), 'tests', 'poachermon');
  it('should update project metadata', async () => {
    const newMetadata = {
      title: 'Updated Game Title',
      author: 'Test Author',
    };
    const res = await metadataRequest(metadataApp)
      .post('/metadata/update')
      .send({ projectRoot, metadata: newMetadata });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.metadata.title).toBe('Updated Game Title');
    expect(res.body.metadata.author).toBe('Test Author');
  });

  it('should return 400 if missing params', async () => {
    const res = await metadataRequest(metadataApp)
      .post('/metadata/update')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/projectRoot and metadata are required/);
  });
});
