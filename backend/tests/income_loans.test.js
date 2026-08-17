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

describe('Recurring Income Endpoints', () => {
  let createdIncomeId;

  it('GET /income returns income list & monthly summary', async () => {
    const res = await request(app)
      .get('/income')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.incomes)).toBe(true);
  });

  it('POST /income creates a new recurring income source', async () => {
    const res = await request(app)
      .post('/income')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        source: 'Jest Rental Income',
        amount: 25000,
        frequency: 'monthly',
        payoutDay: 5,
        description: 'Apartment rent',
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.source).toBe('Jest Rental Income');
    createdIncomeId = res.body.data.id;
  });

  it('PUT /income/:id updates income source', async () => {
    if (!createdIncomeId) return;
    const res = await request(app)
      .put(`/income/${createdIncomeId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ amount: 28000 });
    expect(res.status).toBe(200);
    expect(res.body.data.amount).toBe(28000);
  });

  it('DELETE /income/:id deletes income source', async () => {
    if (!createdIncomeId) return;
    const res = await request(app)
      .delete(`/income/${createdIncomeId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
  });
});

describe('Loans & EMIs Endpoints', () => {
  let createdLoanId;

  it('GET /loans returns loans list and summary', async () => {
    const res = await request(app)
      .get('/loans')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.loans)).toBe(true);
    expect(res.body.data.summary).toBeDefined();
  });

  it('POST /loans creates a new loan / EMI entry', async () => {
    const res = await request(app)
      .post('/loans')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Jest Laptop EMI',
        loanType: 'electronics',
        principalAmount: 90000,
        emiAmount: 7500,
        tenureMonths: 12,
        emisPaid: 2,
        dueDate: 10,
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Jest Laptop EMI');
    createdLoanId = res.body.data.id;
  });

  it('POST /loans/:id/pay-emi increments EMIs paid', async () => {
    if (!createdLoanId) return;
    const res = await request(app)
      .post(`/loans/${createdLoanId}/pay-emi`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.emisPaid).toBe(3);
  });

  it('DELETE /loans/:id deletes loan entry', async () => {
    if (!createdLoanId) return;
    const res = await request(app)
      .delete(`/loans/${createdLoanId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
  });
});
