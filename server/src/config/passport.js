import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { env } from "./env.js";
import { findOrCreateGoogleUser } from "../services/auth.service.js";

if (env.googleClientId && env.googleClientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.googleClientId,
        clientSecret: env.googleClientSecret,
        callbackURL: env.isProduction ? `${process.env.BACKEND_URL || "https://flousi-production.up.railway.app"}/api/auth/google/callback` : "/api/auth/google/callback"
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          const name = profile.displayName || email?.split("@")[0] || "Google User";
          const googleId = profile.id;
          const avatar = profile.photos?.[0]?.value;

          if (!email) {
            return done(null, false, { message: "Google account email not available" });
          }

          const user = await findOrCreateGoogleUser({ email, name, googleId, avatar });
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
}
