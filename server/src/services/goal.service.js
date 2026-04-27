import { GoalStatus } from "@prisma/client";
import { prisma } from "../config/prisma.js";

const goalSelect = {
  id: true,
  userId: true,
  name: true,
  emoji: true,
  targetAmount: true,
  monthlySavings: true,
  amountSaved: true,
  startDate: true,
  estimatedEndDate: true,
  status: true,
  priority: true,
  createdAt: true,
  updatedAt: true
};

const contributionSelect = {
  id: true,
  goalId: true,
  userId: true,
  amount: true,
  date: true,
  note: true,
  createdAt: true
};

const notFoundError = () => {
  const error = new Error("Goal not found");
  error.statusCode = 404;
  return error;
};

export const getGoalsByUserId = (userId) =>
  prisma.goal.findMany({
    where: { userId },
    select: goalSelect,
    orderBy: [{ priority: "asc" }, { createdAt: "asc" }]
  });

export const getGoalByIdForUser = async (userId, id) => {
  const goal = await prisma.goal.findFirst({
    where: { id, userId },
    select: goalSelect
  });

  if (!goal) {
    throw notFoundError();
  }

  return goal;
};

export const getAverageMonthlyLossesByUserId = async (userId) => {
  const [summary, firstLoss] = await Promise.all([
    prisma.lossEntry.aggregate({
      where: { userId },
      _sum: { amount: true }
    }),
    prisma.lossEntry.findFirst({
      where: { userId },
      select: { date: true },
      orderBy: { date: "asc" }
    })
  ]);

  const totalLosses = Number(summary._sum.amount || 0);

  if (!firstLoss || totalLosses === 0) {
    return 0;
  }

  const diffMs = Date.now() - firstLoss.date.getTime();
  const monthsSpan = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 30)));

  return totalLosses / monthsSpan;
};

const getNextPriority = async (userId) => {
  const top = await prisma.goal.findFirst({
    where: { userId },
    select: { priority: true },
    orderBy: { priority: "desc" }
  });

  return top ? top.priority + 1 : 1;
};

export const createGoalForUser = async (userId, data) => {
  const priority = data.priority ?? (await getNextPriority(userId));

  return prisma.goal.create({
    data: {
      userId,
      name: data.name,
      emoji: data.emoji,
      targetAmount: data.targetAmount,
      monthlySavings: data.monthlySavings,
      amountSaved: data.amountSaved,
      startDate: data.startDate,
      estimatedEndDate: data.estimatedEndDate,
      status: data.status ?? GoalStatus.ACTIVE,
      priority
    },
    select: goalSelect
  });
};

export const updateGoalForUser = async (userId, id, data) => {
  await getGoalByIdForUser(userId, id);

  return prisma.goal.update({
    where: { id },
    data,
    select: goalSelect
  });
};

export const deleteGoalForUser = async (userId, id) => {
  await getGoalByIdForUser(userId, id);
  await prisma.goal.delete({ where: { id } });
};

export const contributeToGoalForUser = async (userId, goalId, payload) => {
  const goal = await getGoalByIdForUser(userId, goalId);

  if (goal.status === GoalStatus.ACHIEVED) {
    const error = new Error("Cannot add contribution to an achieved goal");
    error.statusCode = 400;
    throw error;
  }

  return prisma.$transaction(async (tx) => {
    const contribution = await tx.goalContribution.create({
      data: {
        goalId,
        userId,
        amount: payload.amount,
        date: payload.date,
        note: payload.note
      },
      select: contributionSelect
    });

    const updatedGoal = await tx.goal.update({
      where: { id: goalId },
      data: {
        amountSaved: {
          increment: payload.amount
        },
        estimatedEndDate: payload.estimatedEndDate
      },
      select: goalSelect
    });

    return { contribution, goal: updatedGoal };
  });
};

export const achieveGoalForUser = async (userId, id) => {
  await getGoalByIdForUser(userId, id);

  return prisma.goal.update({
    where: { id },
    data: { status: GoalStatus.ACHIEVED },
    select: goalSelect
  });
};

