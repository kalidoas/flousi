import { prisma } from "../config/prisma.js";

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

const getLossFilter = (userId, period) => {
  const startDate = getPeriodStartDate(period);

  return {
    userId,
    ...(startDate ? { date: { gte: startDate } } : {})
  };
};

export const getLossesByCategory = async (userId, period) => {
  const rows = await prisma.lossEntry.findMany({
    where: getLossFilter(userId, period),
    select: {
      category: true,
      amount: true
    }
  });

  const totals = new Map();

  for (const row of rows) {
    const key = row.category;
    const previous = totals.get(key) || 0;
    totals.set(key, previous + Number(row.amount));
  }

  const categories = Array.from(totals.entries())
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);

  const totalLost = categories.reduce((sum, item) => sum + item.total, 0);

  return {
    categories,
    totalLost,
    biggestDrain: categories[0] || null
  };
};

export const getLossesByDay = async (userId, period) => {
  const rows = await prisma.lossEntry.findMany({
    where: getLossFilter(userId, period),
    select: {
      date: true,
      amount: true
    },
    orderBy: {
      date: "asc"
    }
  });

  const totals = new Map();

  for (const row of rows) {
    const day = row.date.toISOString().slice(0, 10);
    const previous = totals.get(day) || 0;
    totals.set(day, previous + Number(row.amount));
  }

  const days = Array.from(totals.entries()).map(([date, total]) => ({ date, total }));
  const totalLost = days.reduce((sum, item) => sum + item.total, 0);

  return {
    days,
    totalLost
  };
};

