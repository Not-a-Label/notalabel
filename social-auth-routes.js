const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const SpotifyStrategy = require('passport-spotify').Strategy;

function addSocialAuthRoutes(app, dbOptimizer) {
  console.log('Setting up social authentication routes...');

  // Passport configuration
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'placeholder',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder',
    callbackURL: "/api/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists
      const existingUser = await new Promise((resolve, reject) => {
        dbOptimizer.db.get(
          'SELECT * FROM users WHERE email = ? OR google_id = ?',
          [profile.emails[0].value, profile.id],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });

      if (existingUser) {
        // Update Google ID if not set
        if (!existingUser.google_id) {
          await new Promise((resolve, reject) => {
            dbOptimizer.db.run(
              'UPDATE users SET google_id = ? WHERE id = ?',
              [profile.id, existingUser.id],
              (err) => err ? reject(err) : resolve()
            );
          });
        }
        return done(null, existingUser);
      }

      // Create new user
      const username = profile.emails[0].value.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      const displayName = profile.displayName || profile.name?.givenName || username;

      const userId = await new Promise((resolve, reject) => {
        dbOptimizer.db.run(
          `INSERT INTO users (username, email, first_name, artist_name, google_id, verified, created_at) 
           VALUES (?, ?, ?, ?, ?, 1, datetime('now'))`,
          [username, profile.emails[0].value, profile.name?.givenName, displayName, profile.id],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });

      const newUser = await new Promise((resolve, reject) => {
        dbOptimizer.db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      return done(null, newUser);
    } catch (error) {
      return done(error, null);
    }
  }));

  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID || 'placeholder',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || 'placeholder',
    callbackURL: "/api/auth/github/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      if (!email) {
        return done(new Error('No email provided by GitHub'), null);
      }

      // Check if user exists
      const existingUser = await new Promise((resolve, reject) => {
        dbOptimizer.db.get(
          'SELECT * FROM users WHERE email = ? OR github_id = ?',
          [email, profile.id],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });

      if (existingUser) {
        // Update GitHub ID if not set
        if (!existingUser.github_id) {
          await new Promise((resolve, reject) => {
            dbOptimizer.db.run(
              'UPDATE users SET github_id = ? WHERE id = ?',
              [profile.id, existingUser.id],
              (err) => err ? reject(err) : resolve()
            );
          });
        }
        return done(null, existingUser);
      }

      // Create new user
      const username = profile.username || email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      const displayName = profile.displayName || profile.name || username;

      const userId = await new Promise((resolve, reject) => {
        dbOptimizer.db.run(
          `INSERT INTO users (username, email, first_name, artist_name, github_id, verified, created_at) 
           VALUES (?, ?, ?, ?, ?, 1, datetime('now'))`,
          [username, email, profile.name, displayName, profile.id],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });

      const newUser = await new Promise((resolve, reject) => {
        dbOptimizer.db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      return done(null, newUser);
    } catch (error) {
      return done(error, null);
    }
  }));

  passport.use(new SpotifyStrategy({
    clientID: process.env.SPOTIFY_CLIENT_ID || 'placeholder',
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET || 'placeholder',
    callbackURL: "/api/auth/spotify/callback"
  }, async (accessToken, refreshToken, expires_in, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      if (!email) {
        return done(new Error('No email provided by Spotify'), null);
      }

      // Check if user exists
      const existingUser = await new Promise((resolve, reject) => {
        dbOptimizer.db.get(
          'SELECT * FROM users WHERE email = ? OR spotify_id = ?',
          [email, profile.id],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });

      if (existingUser) {
        // Update Spotify ID and tokens if not set
        await new Promise((resolve, reject) => {
          dbOptimizer.db.run(
            'UPDATE users SET spotify_id = ?, spotify_token = ?, spotify_refresh_token = ? WHERE id = ?',
            [profile.id, accessToken, refreshToken, existingUser.id],
            (err) => err ? reject(err) : resolve()
          );
        });
        return done(null, existingUser);
      }

      // Create new user
      const username = profile.username || email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      const displayName = profile.displayName || profile.name || username;

      const userId = await new Promise((resolve, reject) => {
        dbOptimizer.db.run(
          `INSERT INTO users (username, email, first_name, artist_name, spotify_id, spotify_token, spotify_refresh_token, verified, created_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, 1, datetime('now'))`,
          [username, email, profile.name, displayName, profile.id, accessToken, refreshToken],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });

      const newUser = await new Promise((resolve, reject) => {
        dbOptimizer.db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      return done(null, newUser);
    } catch (error) {
      return done(error, null);
    }
  }));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await new Promise((resolve, reject) => {
        dbOptimizer.db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Google OAuth routes
  app.get('/api/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  app.get('/api/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/auth/error' }),
    async (req, res) => {
      try {
        // Generate JWT token
        const jwt = require('jsonwebtoken');
        const token = jwt.sign(
          {
            userId: req.user.id,
            username: req.user.username,
            email: req.user.email
          },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '7d' }
        );

        // Set success flags for onboarding
        const redirectUrl = `${process.env.CLIENT_URL || 'http://159.89.247.208'}/auth/callback?token=${token}&name=${encodeURIComponent(req.user.artist_name || req.user.username)}&new=true`;
        res.redirect(redirectUrl);
      } catch (error) {
        console.error('Google callback error:', error);
        res.redirect('/auth/error?message=Authentication failed');
      }
    }
  );

  // GitHub OAuth routes
  app.get('/api/auth/github',
    passport.authenticate('github', { scope: ['user:email'] })
  );

  app.get('/api/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/auth/error' }),
    async (req, res) => {
      try {
        // Generate JWT token
        const jwt = require('jsonwebtoken');
        const token = jwt.sign(
          {
            userId: req.user.id,
            username: req.user.username,
            email: req.user.email
          },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '7d' }
        );

        const redirectUrl = `${process.env.CLIENT_URL || 'http://159.89.247.208'}/auth/callback?token=${token}&name=${encodeURIComponent(req.user.artist_name || req.user.username)}&new=true`;
        res.redirect(redirectUrl);
      } catch (error) {
        console.error('GitHub callback error:', error);
        res.redirect('/auth/error?message=Authentication failed');
      }
    }
  );

  // Spotify OAuth routes
  app.get('/api/auth/spotify',
    passport.authenticate('spotify', {
      scope: ['user-read-email', 'user-read-private', 'playlist-read-private'],
      showDialog: true
    })
  );

  app.get('/api/auth/spotify/callback',
    passport.authenticate('spotify', { failureRedirect: '/auth/error' }),
    async (req, res) => {
      try {
        // Generate JWT token
        const jwt = require('jsonwebtoken');
        const token = jwt.sign(
          {
            userId: req.user.id,
            username: req.user.username,
            email: req.user.email
          },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '7d' }
        );

        const redirectUrl = `${process.env.CLIENT_URL || 'http://159.89.247.208'}/auth/callback?token=${token}&name=${encodeURIComponent(req.user.artist_name || req.user.username)}&new=true`;
        res.redirect(redirectUrl);
      } catch (error) {
        console.error('Spotify callback error:', error);
        res.redirect('/auth/error?message=Authentication failed');
      }
    }
  );

  // Apple Sign In (simulated - requires Apple Developer setup)
  app.get('/api/auth/apple', (req, res) => {
    res.status(501).json({
      error: 'Apple Sign In requires additional setup with Apple Developer Account',
      message: 'Please contact support for Apple Sign In integration'
    });
  });

  console.log('Social authentication routes added successfully');
}

module.exports = addSocialAuthRoutes;