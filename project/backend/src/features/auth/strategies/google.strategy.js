const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../../../models');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ where: { googleId: profile.id } });

      if (user) {
        return done(null, user);
      }

      let existingUser = await User.findOne({ where: { email: profile.emails[0].value } });
      
      if (existingUser) {
        await existingUser.update({
          googleId: profile.id,
          isVerified: true
        });
        return done(null, existingUser);
      }

      const username = profile.emails[0].value.split('@')[0] + Math.floor(Math.random() * 1000);

      user = await User.create({
        googleId: profile.id,
        username: username,
        email: profile.emails[0].value,
        isVerified: true
      });

      console.log('Nowy user przez Google:', username);

      done(null, user);
    } catch (err) {
      console.error('Google OAuth error:', err);
      done(err, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;