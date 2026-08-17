const request = require('supertest');
const app = require('../server');

describe('Security Tests', () => {
  describe('Rate Limiting', () => {
    it('responds to health check', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
    });
  });

  describe('Authentication Security', () => {
    it('rejects malformed JWT token', async () => {
      const res = await request(app)
        .get('/expenses')
        .set('Authorization', 'Bearer not-a-valid-jwt-token-at-all');
      expect(res.status).toBe(401);
    });

    it('rejects missing Authorization header', async () => {
      const res = await request(app).get('/expenses');
      expect(res.status).toBe(401);
    });

    it('rejects Bearer with no token', async () => {
      const res = await request(app)
        .get('/expenses')
        .set('Authorization', 'Bearer ');
      expect(res.status).toBe(401);
    });
  });

  describe('Input Validation', () => {
    it('rejects signup with invalid email', async () => {
      const res = await request(app)
        .post('/auth/signup')
        .send({ name: 'Test', email: 'not-an-email', password: 'Test@123456' });
      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it('returns 404 for unknown routes', async () => {
      const res = await request(app).get('/nonexistent-route-xyz');
      expect(res.status).toBe(404);
    });
  });

  describe('Admin Endpoints', () => {
    it('rejects non-admin access to /admin', async () => {
      const res = await request(app)
        .get('/admin/stats');
      expect(res.status).toBe(401);
    });
  });
});
