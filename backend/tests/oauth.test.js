const request = require('supertest');
const app = require('../server');
const { prisma } = require('../config/prisma');

describe('OAuth Endpoints', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('GET /auth/google redirects to Google OAuth consent screen', async () => {
    const res = await request(app).get('/auth/google');
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain('google');
  });

  it('GET /auth/github redirects to GitHub OAuth consent screen', async () => {
    const res = await request(app).get('/auth/github');
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain('github');
  });

  it('GET /auth/facebook redirects to Facebook OAuth consent screen', async () => {
    const res = await request(app).get('/auth/facebook');
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain('facebook');
  });
});
