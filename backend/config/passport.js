const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const { prisma } = require('./prisma');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Helper function to handle user creation/updation for OAuth
const findOrCreateOAuthUser = async ({ email, name, providerId, providerName, photo }) => {
  let user = null;

  // 1. Try finding by provider ID
  const providerWhere = {};
  providerWhere[`${providerName}Id`] = providerId;
  user = await prisma.user.findFirst({ where: providerWhere });

  if (user) return user;

  // 2. Try finding by email if email exists
  if (email) {
    user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      // Link OAuth provider to existing user
      const updateData = {
        provider: user.provider || providerName,
        profilePicture: user.profilePicture || photo,
      };
      updateData[`${providerName}Id`] = providerId;
      user = await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });
      return user;
    }
  }

  // 3. Create new user if not found
  const userEmail = email || `${providerName}_${providerId}@oauth.finsight.com`;
  const createData = {
    name: name || `${providerName} User`,
    email: userEmail,
    provider: providerName,
    profilePicture: photo,
    isEmailVerified: true,
  };
  createData[`${providerName}Id`] = providerId;

  user = await prisma.user.create({ data: createData });
  return user;
};

// 1. Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'dummy_google_client_id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_google_client_secret',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        const photo = profile.photos && profile.photos[0] ? profile.photos[0].value : null;
        const user = await findOrCreateOAuthUser({
          email,
          name: profile.displayName,
          providerId: profile.id,
          providerName: 'google',
          photo,
        });
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

// 2. GitHub Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID || 'dummy_github_client_id',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || 'dummy_github_client_secret',
      callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:4000/auth/github/callback',
      scope: ['user:email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        const photo = profile.photos && profile.photos[0] ? profile.photos[0].value : null;
        const user = await findOrCreateOAuthUser({
          email,
          name: profile.displayName || profile.username,
          providerId: profile.id,
          providerName: 'github',
          photo,
        });
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

// 3. Facebook Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID || 'dummy_facebook_app_id',
      clientSecret: process.env.FACEBOOK_APP_SECRET || 'dummy_facebook_app_secret',
      callbackURL: process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:4000/auth/facebook/callback',
      profileFields: ['id', 'displayName', 'photos', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        const photo = profile.photos && profile.photos[0] ? profile.photos[0].value : null;
        const user = await findOrCreateOAuthUser({
          email,
          name: profile.displayName,
          providerId: profile.id,
          providerName: 'facebook',
          photo,
        });
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

module.exports = passport;
