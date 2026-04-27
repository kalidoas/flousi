import { createIncomeForUser, deleteIncomeForUser, getIncomeByUserId } from "../services/income.service.js";

const mapIncome = (income) => ({
  ...income,
  amount: Number(income.amount)
});

export const getIncome = async (req, res) => {
  const incomes = await getIncomeByUserId(req.auth.userId);

  return res.status(200).json({
    count: incomes.length,
    incomes: incomes.map(mapIncome)
  });
};

export const createIncome = async (req, res) => {
  const income = await createIncomeForUser(req.auth.userId, req.validated.body);

  return res.status(201).json({
    message: "Income entry created",
    income: mapIncome(income)
  });
};

export const deleteIncome = async (req, res) => {
  await deleteIncomeForUser(req.auth.userId, req.validated.params.id);

  return res.status(200).json({
    message: "Income entry deleted"
  });
};

