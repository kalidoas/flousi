import dotenv from "dotenv";

dotenv.config();

const requiredVars = ["DATABASE_URL", "JWT_SECRET"];

for (const key of requiredVars) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const toBoolean = (value) => value === "true";

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4000),
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  cookieName: process.env.COOKIE_NAME || "flousi_token",
  isProduction: process.env.NODE_ENV === "production",
  trustProxy: toBoolean(process.env.TRUST_PROXY || "false")
};

