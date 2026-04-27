import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const signToken = (userId) =>
  jwt.sign({ userId }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn
  });

export const verifyToken = (token) => jwt.verify(token, env.jwtSecret);

export const buildCookieOptions = () => ({
  httpOnly: true,
  secure: env.isProduction,
  sameSite: env.isProduction ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/"
});

