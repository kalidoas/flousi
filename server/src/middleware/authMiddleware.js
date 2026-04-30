import { env } from "../config/env.js";
import { verifyToken } from "../utils/jwt.js";

export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : req.cookies?.[env.cookieName];

  if (!token) {
    return res.status(401).json({ message: "No token" });
  }

  try {
    const payload = verifyToken(token);
    req.auth = { userId: payload.userId };
    return next();
  } catch (_error) {
    return next({ statusCode: 401, message: "Invalid or expired token" });
  }
};
