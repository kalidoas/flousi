import { prisma } from "../config/prisma.js";

const incomeSelect = {
  id: true,
  amount: true,
  source: true,
  note: true,
  date: true,
  createdAt: true
};

export const getIncomeByUserId = (userId) =>
  prisma.income.findMany({
    where: { userId },
    select: incomeSelect,
    orderBy: [{ date: "desc" }, { createdAt: "desc" }]
  });

export const createIncomeForUser = (userId, payload) =>
  prisma.income.create({
    data: {
      userId,
      ...payload
    },
    select: incomeSelect
  });

export const deleteIncomeForUser = async (userId, id) => {
  const existing = await prisma.income.findFirst({
    where: { id, userId },
    select: { id: true }
  });

  if (!existing) {
    const error = new Error("Income entry not found");
    error.statusCode = 404;
    throw error;
  }

  await prisma.income.delete({ where: { id } });
};

