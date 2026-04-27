import { getLossesByCategory, getLossesByDay } from "../services/analytics.service.js";

export const getAnalyticsByCategory = async (req, res) => {
  const { period = "month" } = req.validated.query;
  const result = await getLossesByCategory(req.auth.userId, period);

  return res.status(200).json({
    period,
    totalLost: result.totalLost,
    biggestDrain: result.biggestDrain,
    categories: result.categories
  });
};

export const getAnalyticsByDay = async (req, res) => {
  const { period = "month" } = req.validated.query;
  const result = await getLossesByDay(req.auth.userId, period);

  return res.status(200).json({
    period,
    totalLost: result.totalLost,
    days: result.days
  });
};

