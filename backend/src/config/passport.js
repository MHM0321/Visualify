import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

export const configurePassport = () => {
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });
        const profileAvatar = profile.photos?.[0]?.value ?? null;
        
        if (!user) {
          user = new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            avatarUrl: profileAvatar,
            // Generate a random password for OAuth users since they don't provide one[cite: 8]
            password: Math.random().toString(36).slice(-10), 
          });
          await user.save();
        } else if (profileAvatar && user.avatarUrl !== profileAvatar) {
          // Keep avatar in sync with Google profile for presence circles.
          user.avatarUrl = profileAvatar;
          await user.save();
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  ));
};