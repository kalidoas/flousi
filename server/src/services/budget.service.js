import { prisma } from "../config/prisma.js";

const budgetSelect = {
  id: true,
  monthlyIncome: true,
  updatedAt: true
};

export const getBudgetByUserId = async (userId) => {
  const budget = await prisma.budget.findUnique({
    where: { userId },
    select: budgetSelect
  });

  if (budget) {
    return budget;
  }

  return prisma.budget.create({
    data: {
      userId,
      monthlyIncome: 0
    },
    select: budgetSelect
  });
};

export const upsertBudgetByUserId = (userId, monthlyIncome) =>
  prisma.budget.upsert({
    where: { userId },
    update: {
      monthlyIncome
    },
    create: {
      userId,
      monthlyIncome
    },
    select: budgetSelect
  });

