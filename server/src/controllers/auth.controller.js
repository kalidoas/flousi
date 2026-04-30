import { env } from "../config/env.js";
import { createUser, authenticateUser, getPublicUser } from "../services/auth.service.js";
import { buildCookieOptions, signToken } from "../utils/jwt.js";

const issueToken = (userId) => signToken(userId);

const setAuthCookie = (res, token) => {
  res.cookie(env.cookieName, token, buildCookieOptions());
};

export const register = async (req, res) => {
  const { email, password, name } = req.validated.body;
  const user = await createUser({ email, password, name });

  const token = issueToken(user.id);
  setAuthCookie(res, token);

  return res.status(201).json({
    message: "Account created",
    user,
    token
  });
};

export const login = async (req, res) => {
  const { email, password } = req.validated.body;
  const user = await authenticateUser({ email, password });

  const token = issueToken(user.id);
  setAuthCookie(res, token);

  return res.status(200).json({
    message: "Logged in",
    user,
    token
  });
};

export const logout = async (_req, res) => res.status(200).json({ message: "Logged out" });

export const me = async (req, res, next) => {
  const user = await getPublicUser(req.auth.userId);

  if (!user) {
    return next({ statusCode: 404, message: "User not found" });
  }

  return res.status(200).json({ user });
};

