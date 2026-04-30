import { env } from "../config/env.js";
import { verifyToken } from "../utils/jwt.js";

export const requireAuth = (req, _res, next) => {
  const authHeader = req.headers.authorization || "";
  const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
  const token = bearerToken || req.cookies?.[env.cookieName];

  if (!token) {
    return next({ statusCode: 401, message: "Unauthorized" });
  }

  try {
    const payload = verifyToken(token);
    req.auth = { userId: payload.userId };
    return next();
  } catch (_error) {
    return next({ statusCode: 401, message: "Invalid or expired token" });
  }
};

