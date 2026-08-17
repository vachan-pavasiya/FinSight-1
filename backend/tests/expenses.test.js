const request = require('supertest');
const app = require('../server');
const { prisma } = require('../config/prisma');
const authService = require('../services/authService');

let accessToken;
let testUserId;

beforeAll(async () => {
  // Create or find a verified test user
  const email = 'test@finsight.com';
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const hash = await authService.hashPassword('Test@123456');
    user = await prisma.user.create({
      data: { name: 'Test User', email, password: hash, isEmailVerified: true, role: 'user' },
    });
  }
  testUserId = user.id;
  accessToken = authService.generateAccessToken(user.id, user.role);
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Expenses Endpoints', () => {
  let createdExpenseId;

  it('GET /expenses returns 401 without token', async () => {
    const res = await request(app).get('/expenses');
    expect(res.status).toBe(401);
  });

  it('GET /expenses returns expense list with token', async () => {
    const res = await request(app)
      .get('/expenses')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.expenses).toBeDefined();
    expect(Array.isArray(res.body.data.expenses)).toBe(true);
  });

  it('GET /expenses supports pagination params', async () => {
    const res = await request(app)
      .get('/expenses?page=1&limit=5')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.page).toBe(1);
    expect(res.body.data.expenses.length).toBeLessThanOrEqual(5);
  });

  it('POST /expenses creates an expense', async () => {
    const cat = await prisma.category.findFirst({ where: { name: 'Food' } });
    const res = await request(app)
      .post('/expenses')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        merchant: 'Test Restaurant',
        amount: -500,
        date: new Date().toISOString(),
        categoryId: cat?.id,
        paymentMode: 'upi',
      });
    expect(res.status).toBe(200);
    expect(res.body.data.merchant).toBe('Test Restaurant');
    createdExpenseId = res.body.data.id;
  });

  it('DELETE /expenses/:id deletes created expense', async () => {
    if (!createdExpenseId) return;
    const res = await request(app)
      .delete(`/expenses/${createdExpenseId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('DELETE /expenses/:id returns 404 for nonexistent id', async () => {
    const res = await request(app)
      .delete('/expenses/nonexistent-id-123')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(404);
  });
});

describe('Budget Endpoints', () => {
  it('GET /budget returns budget list', async () => {
    const res = await request(app)
      .get('/budget')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('Goals Endpoints', () => {
  let createdGoalId;

  it('GET /goals returns goals list', async () => {
    const res = await request(app)
      .get('/goals')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /goals creates a goal', async () => {
    const res = await request(app)
      .post('/goals')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Jest Test Goal', targetAmount: 50000 });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Jest Test Goal');
    createdGoalId = res.body.data.id;
  });

  it('DELETE /goals/:id deletes created goal', async () => {
    if (!createdGoalId) return;
    const res = await request(app)
      .delete(`/goals/${createdGoalId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
  });
});

describe('Categories Endpoint', () => {
  it('GET /categories returns list', async () => {
    const res = await request(app)
      .get('/categories')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});

describe('Analytics Endpoints', () => {
  it('GET /analytics returns summary', async () => {
    const res = await request(app)
      .get('/analytics')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  it('GET /analytics/trends returns trend data', async () => {
    const res = await request(app)
      .get('/analytics/trends')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
