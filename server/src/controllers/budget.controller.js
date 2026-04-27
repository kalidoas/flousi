import { getBudgetByUserId, upsertBudgetByUserId } from "../services/budget.service.js";

export const getBudget = async (req, res) => {
  const budget = await getBudgetByUserId(req.auth.userId);

  return res.status(200).json({
    budget: {
      ...budget,
      monthlyIncome: Number(budget.monthlyIncome)
    }
  });
};

export const updateBudget = async (req, res) => {
  const { monthlyIncome } = req.validated.body;
  const budget = await upsertBudgetByUserId(req.auth.userId, monthlyIncome);

  return res.status(200).json({
    message: "Budget updated",
    budget: {
      ...budget,
      monthlyIncome: Number(budget.monthlyIncome)
    }
  });
};

