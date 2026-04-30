import { prisma } from "../config/prisma.js";
import { comparePassword, hashPassword } from "../utils/password.js";

const userSelect = {
  id: true,
  email: true,
  name: true,
  createdAt: true
};

export const createUser = async ({ email, password, name }) => {
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    const error = new Error("Email is already in use");
    error.statusCode = 409;
    throw error;
  }

  const hashed = await hashPassword(password);

  return prisma.user.create({
    data: {
      email,
      password: hashed,
      name,
      budget: {
        create: {
          monthlyIncome: 0
        }
      }
    },
    select: userSelect
  });
};

export const authenticateUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const matched = await comparePassword(password, user.password);

  if (!matched) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt
  };
};

export const getPublicUser = (userId) =>
  prisma.user.findUnique({
    where: { id: userId },
    select: userSelect
  });

export const findUserByEmail = (email) =>
  prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true }
  });

export const updateUserPasswordByEmail = async (email, newPassword) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const hashed = await hashPassword(newPassword);

  return prisma.user.update({
    where: { email },
    data: { password: hashed }
  });
};

export const createPasswordReset = async ({ email, code, expiresAt }) => {
  await prisma.passwordReset.updateMany({
    where: { email, used: false },
    data: { used: true }
  });

  return prisma.passwordReset.create({
    data: {
      email,
      code,
      expiresAt
    }
  });
};

export const findValidPasswordReset = (email, code) =>
  prisma.passwordReset.findFirst({
    where: {
      email,
      code,
      used: false,
      expiresAt: { gt: new Date() }
    },
    orderBy: { createdAt: "desc" }
  });

export const markPasswordResetUsed = (id) =>
  prisma.passwordReset.update({
    where: { id },
    data: { used: true }
  });

