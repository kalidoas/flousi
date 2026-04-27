import { prisma } from "../config/prisma.js";

const lossSelect = {
  id: true,
  amount: true,
  category: true,
  note: true,
  date: true,
  createdAt: true
};

const getPeriodStartDate = (period) => {
  const now = new Date();

  if (period === "day") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  if (period === "week") {
    const day = now.getDay();
    const diffToMonday = day === 0 ? 6 : day - 1;
    const start = new Date(now);
    start.setDate(now.getDate() - diffToMonday);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  if (period === "month") {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  return null;
};

export const getLossesByUserId = (userId, period = "all") => {
  const startDate = getPeriodStartDate(period);

  return prisma.lossEntry.findMany({
    where: {
      userId,
      ...(startDate ? { date: { gte: startDate } } : {})
    },
    select: lossSelect,
    orderBy: [{ date: "desc" }, { createdAt: "desc" }]
  });
};

export const createLossForUser = (userId, payload) =>
  prisma.lossEntry.create({
    data: {
      userId,
      ...payload
    },
    select: lossSelect
  });

export const updateLossForUser = async (userId, id, payload) => {
  const existing = await prisma.lossEntry.findFirst({
    where: { id, userId },
    select: { id: true }
  });

  if (!existing) {
    const error = new Error("Loss entry not found");
    error.statusCode = 404;
    throw error;
  }

  return prisma.lossEntry.update({
    where: { id },
    data: payload,
    select: lossSelect
  });
};

export const deleteLossForUser = async (userId, id) => {
  const existing = await prisma.lossEntry.findFirst({
    where: { id, userId },
    select: { id: true }
  });

  if (!existing) {
    const error = new Error("Loss entry not found");
    error.statusCode = 404;
    throw error;
  }

  await prisma.lossEntry.delete({ where: { id } });
};

