require('express-async-errors');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const passport = require('./config/passport');

const { env } = require('./config/env');
const { errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const uploadRoutes = require('./routes/upload');
const expenseRoutes = require('./routes/expenses');
const budgetRoutes = require('./routes/budget');
const goalRoutes = require('./routes/goals');
const analyticsRoutes = require('./routes/analytics');
const reportRoutes = require('./routes/report');
const notificationRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');
const categoryRoutes = require('./routes/categories');
const incomeRoutes = require('./routes/income');
const loanRoutes = require('./routes/loans');
const billRoutes = require('./routes/bills');
const { setupSwagger } = require('./config/swagger');

const app = express();

const healthHandler = (req, res) => {
  res.json({
    status: 'ok',
    service: 'finsight-backend',
    environment: env.NODE_ENV,
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
  });
};

app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

app.get('/', (req, res) => {
  res.json({
    message: '🚀 Welcome to FinSight Backend API',
    status: 'running',
    health: '/health',
    documentation: '/api-docs',
    endpoints: {
      auth: '/auth',
      expenses: '/expenses',
      income: '/income',
      loans: '/loans',
      bills: '/bills',
      budget: '/budget',
      goals: '/goals',
      analytics: '/analytics',
    },
  });
});

app.use(helmet({ contentSecurityPolicy: false }));

const configuredOrigins = env.FRONTEND_URL
  ? env.FRONTEND_URL.split(',').map((url) => url.trim().replace(/\/$/, ''))
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const normalizedOrigin = origin.replace(/\/$/, '');
      const isAllowed =
        configuredOrigins.includes(normalizedOrigin) ||
        /\.vercel\.app$/.test(normalizedOrigin) ||
        normalizedOrigin.startsWith('http://localhost:') ||
        normalizedOrigin.startsWith('http://127.0.0.1:');

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy violation: Origin ${origin} not allowed.`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  })
);
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Express Session & Passport Middlewares
app.use(
  session({
    secret: env.JWT_SECRET || 'finsight_session_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 },
  })
);

app.use(passport.initialize());
app.use(passport.session());

setupSwagger(app);

app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/upload', uploadRoutes);
app.use('/expenses', expenseRoutes);
app.use('/budget', budgetRoutes);
app.use('/goals', goalRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/report', reportRoutes);
app.use('/notifications', notificationRoutes);
app.use('/admin', adminRoutes);
app.use('/categories', categoryRoutes);
app.use('/income', incomeRoutes);
app.use('/loans', loanRoutes);
app.use('/bills', billRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.originalUrl} not found` });
});

app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(env.PORT, () => {
    console.log(`🚀 FinSight backend listening on port ${env.PORT}`);
  });
}

module.exports = app;
