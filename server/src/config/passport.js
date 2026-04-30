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
        callbackURL: "/api/auth/google/callback"
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          const name = profile.displayName || email?.split("@")[0] || "Google User";

          if (!email) {
            return done(null, false, { message: "Google account email not available" });
          }

          const user = await findOrCreateGoogleUser({ email, name });
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
}

