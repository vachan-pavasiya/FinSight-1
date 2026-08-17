const request = require('supertest');
const app = require('../server');
const { prisma } = require('../config/prisma');
const authService = require('../services/authService');

let accessToken;
let testUserId;

beforeAll(async () => {
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

describe('Bills & Subscriptions Endpoints', () => {
  let createdBillId;

  it('GET /bills returns bills list and summary', async () => {
    const res = await request(app)
      .get('/bills')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.bills)).toBe(true);
    expect(res.body.data.summary).toBeDefined();
  });

  it('POST /bills creates a new bill subscription', async () => {
    const res = await request(app)
      .post('/bills')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Jest Spotify Premium',
        categoryType: 'ott',
        provider: 'Spotify',
        amount: 119,
        isAutoRecurring: true,
        frequency: 'monthly',
        dueDay: 15,
        paymentMode: 'upi',
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Jest Spotify Premium');
    createdBillId = res.body.data.id;
  });

  it('PUT /bills/:id updates bill subscription details', async () => {
    if (!createdBillId) return;
    const res = await request(app)
      .put(`/bills/${createdBillId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ amount: 179 });
    expect(res.status).toBe(200);
    expect(res.body.data.amount).toBe(179);
  });

  it('DELETE /bills/:id deletes bill subscription', async () => {
    if (!createdBillId) return;
    const res = await request(app)
      .delete(`/bills/${createdBillId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
  });
});
