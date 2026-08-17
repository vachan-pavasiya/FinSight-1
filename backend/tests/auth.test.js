const request = require('supertest');
const app = require('../server');
const { prisma } = require('../config/prisma');

const TEST_EMAIL = `test_jest_${Date.now()}@finsight.com`;
const TEST_PASSWORD = 'Test@123456';

describe('Auth Endpoints', () => {
  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: TEST_EMAIL } });
    await prisma.$disconnect();
  });

  describe('POST /auth/signup', () => {
    it('creates a new user', async () => {
      const res = await request(app)
        .post('/auth/signup')
        .send({ name: 'Jest Test', email: TEST_EMAIL, password: TEST_PASSWORD });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('email');
    });

    it('rejects duplicate email', async () => {
      const res = await request(app)
        .post('/auth/signup')
        .send({ name: 'Another User', email: TEST_EMAIL, password: TEST_PASSWORD });
      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('rejects missing fields', async () => {
      const res = await request(app)
        .post('/auth/signup')
        .send({ email: 'only@example.com' });
      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('POST /auth/login', () => {
    beforeAll(async () => {
      // Mark the test user as verified for login tests
      await prisma.user.updateMany({
        where: { email: TEST_EMAIL },
        data: { isEmailVerified: true },
      });
    });

    it('returns access token for valid credentials', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: TEST_EMAIL, password: TEST_PASSWORD });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.email).toBe(TEST_EMAIL);
    });

    it('rejects invalid password', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: TEST_EMAIL, password: 'WrongPassword123' });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('rejects nonexistent user', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'nobody@nonexistent.com', password: TEST_PASSWORD });
      expect(res.status).toBe(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('returns success', async () => {
      const res = await request(app).post('/auth/logout');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /auth/forgot-password', () => {
    it('returns success message regardless of email existence', async () => {
      const res = await request(app)
        .post('/auth/forgot-password')
        .send({ email: 'unknown@example.com' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('email');
    });
  });

  describe('GET /health', () => {
    it('returns ok', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });
});
