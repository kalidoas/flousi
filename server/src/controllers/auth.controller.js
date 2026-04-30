import { env } from "../config/env.js";
import {
  authenticateUser,
  createPasswordReset,
  createUser,
  deleteUserAccount,
  findUserByEmail,
  findValidPasswordReset,
  getPublicUser,
  markPasswordResetUsed,
  updateUserPasswordByEmail
} from "../services/auth.service.js";
import { sendPasswordResetCode } from "../services/email.service.js";
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
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    },
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
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    },
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

const generateResetCode = () => String(Math.floor(100000 + Math.random() * 900000));

export const forgotPassword = async (req, res) => {
  const { email } = req.validated.body;
  const user = await findUserByEmail(email);

  if (!user) {
    return res.status(200).json({ message: "If the account exists, a reset code was sent." });
  }

  const code = generateResetCode();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await createPasswordReset({ email, code, expiresAt });
  await sendPasswordResetCode({ to: email, code });

  return res.status(200).json({ message: "Reset code sent" });
};

export const resetPassword = async (req, res, next) => {
  const { email, code, newPassword } = req.validated.body;
  const resetEntry = await findValidPasswordReset(email, code);

  if (!resetEntry) {
    return next({ statusCode: 400, message: "Invalid or expired reset code" });
  }

  await updateUserPasswordByEmail(email, newPassword);
  await markPasswordResetUsed(resetEntry.id);

  return res.status(200).json({ message: "Password updated" });
};

export const deleteAccount = async (req, res, next) => {
  const user = await getPublicUser(req.auth.userId);

  if (!user) {
    return next({ statusCode: 404, message: "User not found" });
  }

  await deleteUserAccount({ userId: req.auth.userId, email: user.email });

  return res.status(200).json({ success: true });
};
