const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log('🌱 Starting database seed...');

  // ─── Categories ───────────────────────────────────────────────────────────
  const categories = [
    { name: 'Food', color: '#f59e0b', icon: 'pizza' },
    { name: 'Transport', color: '#3b82f6', icon: 'car' },
    { name: 'Shopping', color: '#8b5cf6', icon: 'bag' },
    { name: 'Entertainment', color: '#ec4899', icon: 'film' },
    { name: 'Bills', color: '#ef4444', icon: 'document' },
    { name: 'Health', color: '#10b981', icon: 'medkit' },
    { name: 'Education', color: '#06b6d4', icon: 'book' },
    { name: 'Travel', color: '#f97316', icon: 'airplane' },
    { name: 'Income', color: '#22c55e', icon: 'cash' },
    { name: 'Uncategorized', color: '#94a3b8', icon: 'help' },
  ];

  const categoryMap = {};
  for (const c of categories) {
    const cat = await prisma.category.upsert({ where: { name: c.name }, update: {}, create: c });
    categoryMap[c.name] = cat;
  }
  console.log('✅ Categories seeded');

  // ─── Admin User ───────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('Admin@123456', 12);
  await prisma.user.upsert({
    where: { email: 'admin@finsight.com' },
    update: {},
    create: { name: 'Admin User', email: 'admin@finsight.com', password: adminHash, isEmailVerified: true, role: 'admin' },
  });
  console.log('✅ Admin user seeded (admin@finsight.com / Admin@123456)');

  // ─── Test User ────────────────────────────────────────────────────────────
  const testHash = await bcrypt.hash('Test@123456', 12);
  const testUser = await prisma.user.upsert({
    where: { email: 'test@finsight.com' },
    update: {},
    create: { name: 'Test User', email: 'test@finsight.com', password: testHash, isEmailVerified: true, role: 'user' },
  });
  console.log('✅ Test user seeded (test@finsight.com / Test@123456)');

  // ─── Synthetic Expenses ───────────────────────────────────────────────────
  const existingCount = await prisma.expense.count({ where: { userId: testUser.id } });
  if (existingCount === 0) {
    const merchants = {
      Food: ['Swiggy', 'Zomato', 'Dominos', 'KFC', 'Starbucks', 'McDonald\'s', 'Subway'],
      Transport: ['Uber', 'Ola', 'Rapido', 'IRCTC', 'Metro Card'],
      Shopping: ['Amazon', 'Flipkart', 'Myntra', 'Nykaa', 'D-Mart'],
      Entertainment: ['Netflix', 'Hotstar', 'Spotify', 'PVR Cinemas', 'Inox'],
      Bills: ['Airtel Broadband', 'Jio Recharge', 'Electricity Bill', 'Water Bill'],
      Health: ['Apollo Pharmacy', 'Medplus', 'NetMeds', 'Clinic Visit'],
      Education: ['Udemy Course', 'Coursera', 'BYJU\'S'],
      Travel: ['OYO Rooms', 'MakeMyTrip', 'IndiGo Airlines'],
      Income: ['Company Salary', 'Freelance Income', 'Interest Credit', 'Cashback Credit'],
    };

    const expenseCategories = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Health'];
    const expenses = [];
    const now = new Date();

    // Generate 90 days of expenses
    for (let daysAgo = 90; daysAgo >= 0; daysAgo--) {
      const date = new Date(now);
      date.setDate(date.getDate() - daysAgo);

      // 1-2 expenses per day
      const numExpenses = Math.floor(randomBetween(1, 3));
      for (let j = 0; j < numExpenses; j++) {
        const category = randomElement(expenseCategories);
        const merchant = randomElement(merchants[category]);
        let amount;
        switch (category) {
          case 'Food': amount = -randomBetween(150, 800); break;
          case 'Transport': amount = -randomBetween(50, 500); break;
          case 'Shopping': amount = -randomBetween(500, 5000); break;
          case 'Entertainment': amount = -randomBetween(200, 1500); break;
          case 'Bills': amount = -randomBetween(500, 3000); break;
          case 'Health': amount = -randomBetween(100, 2000); break;
          default: amount = -randomBetween(100, 1000);
        }

        const expDate = new Date(date);
        expDate.setHours(Math.floor(randomBetween(8, 22)), Math.floor(randomBetween(0, 59)));

        expenses.push({
          userId: testUser.id,
          categoryId: categoryMap[category].id,
          merchant,
          amount: parseFloat(amount.toFixed(2)),
          date: expDate,
          paymentMode: randomElement(['card', 'upi', 'cash', 'netbanking']),
        });
      }

      // Monthly income on the 1st
      if (date.getDate() === 1) {
        expenses.push({
          userId: testUser.id,
          categoryId: categoryMap['Income'].id,
          merchant: 'Company Salary',
          amount: 85000 + randomBetween(-5000, 5000),
          date: new Date(date.getFullYear(), date.getMonth(), 1, 9, 0),
          paymentMode: 'netbanking',
          description: 'Monthly salary credit',
        });
      }
    }

    // Add a few anomalous transactions
    const anomalousExpenses = [
      { userId: testUser.id, categoryId: categoryMap['Shopping'].id, merchant: 'Amazon', amount: -95000, date: new Date(now.getFullYear(), now.getMonth(), 10, 2, 30), paymentMode: 'card', description: 'Large midnight purchase' },
      { userId: testUser.id, categoryId: categoryMap['Shopping'].id, merchant: 'Amazon', amount: -95000, date: new Date(now.getFullYear(), now.getMonth(), 10, 2, 35), paymentMode: 'card', description: 'Duplicate of above' },
    ];

    await prisma.expense.createMany({ data: [...expenses, ...anomalousExpenses] });
    console.log(`✅ ${expenses.length + anomalousExpenses.length} synthetic expenses created`);
  } else {
    console.log(`ℹ️  Skipping expenses (${existingCount} already exist)`);
  }

  // ─── Budgets ──────────────────────────────────────────────────────────────
  const now2 = new Date();
  const currentMonth = now2.getMonth() + 1;
  const currentYear = now2.getFullYear();

  const budgetAmounts = {
    Food: 8000,
    Transport: 3000,
    Shopping: 10000,
    Entertainment: 2000,
    Bills: 5000,
    Health: 2000,
  };

  for (const [catName, amount] of Object.entries(budgetAmounts)) {
    await prisma.budget.upsert({
      where: {
        userId_categoryId_month_year: {
          userId: testUser.id,
          categoryId: categoryMap[catName].id,
          month: currentMonth,
          year: currentYear,
        },
      },
      update: {},
      create: {
        userId: testUser.id,
        categoryId: categoryMap[catName].id,
        amount,
        month: currentMonth,
        year: currentYear,
      },
    });
  }
  console.log('✅ Budgets seeded');

  // ─── Goals ────────────────────────────────────────────────────────────────
  const goalsExist = await prisma.goal.count({ where: { userId: testUser.id } });
  if (goalsExist === 0) {
    await prisma.goal.createMany({
      data: [
        {
          userId: testUser.id,
          name: 'Emergency Fund',
          targetAmount: 300000,
          currentAmount: 85000,
          deadline: new Date(currentYear + 1, 5, 30),
        },
        {
          userId: testUser.id,
          name: 'New Laptop',
          targetAmount: 80000,
          currentAmount: 32000,
          deadline: new Date(currentYear, currentMonth + 2, 1),
        },
      ],
    });
    console.log('✅ Goals seeded');
  }

  // ─── Recurring Incomes ───────────────────────────────────────────────────
  const incomesExist = await prisma.recurringIncome.count({ where: { userId: testUser.id } });
  if (incomesExist === 0) {
    await prisma.recurringIncome.createMany({
      data: [
        {
          userId: testUser.id,
          source: 'Primary Salary',
          amount: 85000,
          frequency: 'monthly',
          payoutDay: 1,
          isActive: true,
          description: 'Tech company monthly salary',
        },
        {
          userId: testUser.id,
          source: 'Freelance Design Retainer',
          amount: 15000,
          frequency: 'monthly',
          payoutDay: 15,
          isActive: true,
          description: 'Monthly UI/UX design retainer',
        },
      ],
    });
    console.log('✅ Recurring Incomes seeded');
  }

  // ─── Loans & EMIs ────────────────────────────────────────────────────────
  const loansExist = await prisma.loan.count({ where: { userId: testUser.id } });
  if (loansExist === 0) {
    await prisma.loan.createMany({
      data: [
        {
          userId: testUser.id,
          title: 'HDFC Home Loan',
          loanType: 'home',
          principalAmount: 4500000,
          emiAmount: 35000,
          interestRate: 8.5,
          tenureMonths: 240,
          emisPaid: 36,
          dueDate: 10,
          status: 'active',
        },
        {
          userId: testUser.id,
          title: 'iPhone 15 Pro EMI',
          loanType: 'mobile',
          principalAmount: 135000,
          emiAmount: 5625,
          interestRate: 0,
          tenureMonths: 24,
          emisPaid: 10,
          dueDate: 5,
          status: 'active',
        },
        {
          userId: testUser.id,
          title: 'Hyundai Creta Car Loan',
          loanType: 'car',
          principalAmount: 1200000,
          emiAmount: 18500,
          interestRate: 9.0,
          tenureMonths: 60,
          emisPaid: 18,
          dueDate: 15,
          status: 'active',
        },
      ],
    });
    console.log('✅ Loans & EMIs seeded');
  }

  // ─── Bills & Subscriptions ─────────────────────────────────────────────
  const billsExist = await prisma.billSubscription.count({ where: { userId: testUser.id } });
  if (billsExist === 0) {
    await prisma.billSubscription.createMany({
      data: [
        {
          userId: testUser.id,
          title: 'Jio 5G Unlimited Plan',
          categoryType: 'mobile',
          provider: 'Jio',
          amount: 666,
          isAutoRecurring: true,
          frequency: 'monthly',
          dueDay: 1,
          paymentMode: 'upi',
          status: 'active',
          notes: '84-day pack / monthly equivalent',
        },
        {
          userId: testUser.id,
          title: 'Airtel Xstream Fiber 200Mbps',
          categoryType: 'broadband',
          provider: 'Airtel',
          amount: 999,
          isAutoRecurring: true,
          frequency: 'monthly',
          dueDay: 5,
          paymentMode: 'auto_debit',
          status: 'active',
          notes: 'Unlimited Wi-Fi broadband',
        },
        {
          userId: testUser.id,
          title: 'Netflix 4K Ultra HD',
          categoryType: 'ott',
          provider: 'Netflix',
          amount: 649,
          isAutoRecurring: true,
          frequency: 'monthly',
          dueDay: 12,
          paymentMode: 'card',
          status: 'active',
          notes: '4-screen UHD plan',
        },
        {
          userId: testUser.id,
          title: 'Electricity Bill (BESCOM)',
          categoryType: 'electricity',
          provider: 'BESCOM',
          amount: 2450,
          isAutoRecurring: true,
          frequency: 'monthly',
          dueDay: 15,
          paymentMode: 'netbanking',
          status: 'active',
          notes: 'Monthly utility electricity power bill',
        },
        {
          userId: testUser.id,
          title: 'BWSSB Water Supply Bill',
          categoryType: 'water',
          provider: 'BWSSB',
          amount: 480,
          isAutoRecurring: true,
          frequency: 'monthly',
          dueDay: 20,
          paymentMode: 'upi',
          status: 'active',
          notes: 'Monthly city water connection bill',
        },
        {
          userId: testUser.id,
          title: 'Indane Piped Gas Cylinder',
          categoryType: 'gas',
          provider: 'Indane',
          amount: 850,
          isAutoRecurring: true,
          frequency: 'monthly',
          dueDay: 25,
          paymentMode: 'upi',
          status: 'active',
          notes: 'LPG gas refill cylinder bill',
        },
      ],
    });
    console.log('✅ Bills & Subscriptions seeded');
  }

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => { console.error('❌ Seed error:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
