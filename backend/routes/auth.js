const express = require('express');
const { z } = require('zod');
const { validate } = require('../middleware/validate');
const c = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiter');
const { authenticate } = require('../middleware/authenticate');
const { prisma } = require('../config/prisma');
const passport = require('../config/passport');
const authService = require('../services/authService');
const { env } = require('../config/env');

const router = express.Router();

router.post('/signup', authLimiter, validate({ body: z.object({ name: z.string(), email: z.string().email(), password: z.string().min(8) }) }), c.signup);
router.post('/login', authLimiter, validate({ body: z.object({ email: z.string().email(), password: z.string() }) }), c.login);
router.post('/refresh', c.refresh);
router.post('/logout', c.logout);
router.post('/forgot-password', validate({ body: z.object({ email: z.string().email() }) }), c.forgotPassword);
router.post('/reset-password', validate({ body: z.object({ token: z.string(), password: z.string().min(8) }) }), c.resetPassword);
router.post('/verify-email', validate({ body: z.object({ token: z.string() }) }), c.verifyEmail);

// OAuth Success Helper
const handleOAuthCallback = async (req, res) => {
  try {
    const user = req.user;
    const accessToken = authService.generateAccessToken(user.id, user.role);
    const refreshToken = await authService.generateRefreshToken(user.id);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const frontendUrl = env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/login?token=${accessToken}`);
  } catch (err) {
    const frontendUrl = env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/login?error=oauth_failed`);
  }
};

// 1. Google OAuth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: `${env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_failed`, session: true }),
  handleOAuthCallback
);

// 2. GitHub OAuth Routes
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: `${env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_failed`, session: true }),
  handleOAuthCallback
);

// 3. Facebook OAuth Routes
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: `${env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_failed`, session: true }),
  handleOAuthCallback
);

// GET /auth/me — returns current authenticated user
router.get('/me', authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, role: true, provider: true, profilePicture: true, createdAt: true },
  });
  if (!user) return res.status(404).json({ success: false, error: 'User not found' });
  res.json({ success: true, user });
});

module.exports = router;
