
import claudeKeyRequest from 'supertest';
const claudeKeyApp = require('../src/index');

describe('Claude API Key', () => {
  it('should detect CLAUDE_API_KEY in env', async () => {
    process.env.CLAUDE_API_KEY = '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';
    const res = await claudeKeyRequest(claudeKeyApp).get('/claude-key');
    expect(res.status).toBe(200);
    expect(res.body.present).toBe(true);
  });

  it('should return 404 if CLAUDE_API_KEY missing', async () => {
    delete process.env.CLAUDE_API_KEY;
    const res = await claudeKeyRequest(claudeKeyApp).get('/claude-key');
    expect(res.status).toBe(404);
    expect(res.body.present).toBe(false);
  });

  it('should set CLAUDE_API_KEY', async () => {
    const testKey = 'test-key-123';
    const res = await claudeKeyRequest(claudeKeyApp)
      .post('/claude/key')
      .send({ key: testKey });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(process.env.CLAUDE_API_KEY).toBe(testKey);
  });

  it('should return 400 if key missing', async () => {
    const res = await claudeKeyRequest(claudeKeyApp)
      .post('/claude/key')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('key is required');
  });
});
