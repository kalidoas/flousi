import {
  achieveGoalForUser,
  contributeToGoalForUser,
  createGoalForUser,
  deleteGoalForUser,
  getAverageMonthlyLossesByUserId,
  getGoalByIdForUser,
  getGoalsByUserId,
  updateGoalForUser
} from "../services/goal.service.js";
import { calculateGoal } from "../services/goalCalculator.js";

const buildImpactMessage = (metrics) => {
  if (metrics.is_impossible) {
    return "مستحيل توصل للهدف بهاد الخسائر";
  }

  if ((metrics.delay_months || 0) > 0) {
    return `بسبب خسائرك غادي يتأخر هدفك بـ ${metrics.delay_months} شهر`;
  }

  return "الخسائر الحالية ما مأثراتش بزاف على هاد الهدف";
};

const mapGoal = (goal, avgMonthlyLosses = 0) => {
  const metrics = calculateGoal({
    targetAmount: goal.targetAmount,
    monthlySavings: goal.monthlySavings,
    startDate: goal.startDate,
    amountSaved: goal.amountSaved,
    avgMonthlyLosses
  });

  return {
    ...goal,
    targetAmount: Number(goal.targetAmount),
    monthlySavings: Number(goal.monthlySavings),
    amountSaved: Number(goal.amountSaved),
    calculator: {
      months_needed: metrics.months_needed,
      estimated_end_date: metrics.estimated_end_date,
      daily_needed: metrics.daily_needed,
      yearly_amount: metrics.yearly_amount,
      years: metrics.years,
      remaining_months: metrics.remaining_months,
      months_with_losses: metrics.months_with_losses,
      estimated_end_with_losses: metrics.estimated_end_with_losses,
      delay_months: metrics.delay_months,
      is_impossible: metrics.is_impossible,
      avg_monthly_losses: avgMonthlyLosses,
      impact_message: buildImpactMessage(metrics)
    }
  };
};

const mapContribution = (contribution) => ({
  ...contribution,
  amount: Number(contribution.amount)
});

export const getGoals = async (req, res) => {
  const [goals, avgMonthlyLosses] = await Promise.all([
    getGoalsByUserId(req.auth.userId),
    getAverageMonthlyLossesByUserId(req.auth.userId)
  ]);

  return res.status(200).json({
    count: goals.length,
    goals: goals.map((goal) => mapGoal(goal, avgMonthlyLosses))
  });
};

export const createGoal = async (req, res) => {
  const payload = req.validated.body;

  const startDate = payload.startDate || new Date();
  const metrics = calculateGoal({
    targetAmount: payload.targetAmount,
    monthlySavings: payload.monthlySavings,
    startDate,
    amountSaved: payload.amountSaved || 0,
    avgMonthlyLosses: 0
  });

  const goal = await createGoalForUser(req.auth.userId, {
    ...payload,
    startDate,
    amountSaved: payload.amountSaved || 0,
    estimatedEndDate: metrics.estimated_end_date
  });

  const avgMonthlyLosses = await getAverageMonthlyLossesByUserId(req.auth.userId);

  return res.status(201).json({
    message: "Goal created",
    goal: mapGoal(goal, avgMonthlyLosses)
  });
};

export const updateGoal = async (req, res) => {
  const existing = await getGoalByIdForUser(req.auth.userId, req.validated.params.id);
  const patch = req.validated.body;

  const merged = {
    targetAmount: patch.targetAmount ?? Number(existing.targetAmount),
    monthlySavings: patch.monthlySavings ?? Number(existing.monthlySavings),
    startDate: patch.startDate ?? existing.startDate,
    amountSaved: patch.amountSaved ?? Number(existing.amountSaved)
  };

  const metrics = calculateGoal({
    ...merged,
    avgMonthlyLosses: 0
  });

  const goal = await updateGoalForUser(req.auth.userId, req.validated.params.id, {
    ...patch,
    estimatedEndDate: metrics.estimated_end_date
  });

  const avgMonthlyLosses = await getAverageMonthlyLossesByUserId(req.auth.userId);

  return res.status(200).json({
    message: "Goal updated",
    goal: mapGoal(goal, avgMonthlyLosses)
  });
};

export const deleteGoal = async (req, res) => {
  await deleteGoalForUser(req.auth.userId, req.validated.params.id);

  return res.status(200).json({ message: "Goal deleted" });
};

export const contributeGoal = async (req, res) => {
  const goal = await getGoalByIdForUser(req.auth.userId, req.validated.params.id);
  const { amount, note } = req.validated.body;
  const contributionDate = req.validated.body.date || new Date();

  const updatedAmountSaved = Number(goal.amountSaved) + Number(amount);
  const metrics = calculateGoal({
    targetAmount: goal.targetAmount,
    monthlySavings: goal.monthlySavings,
    startDate: goal.startDate,
    amountSaved: updatedAmountSaved,
    avgMonthlyLosses: 0
  });

  const result = await contributeToGoalForUser(req.auth.userId, req.validated.params.id, {
    amount,
    date: contributionDate,
    note,
    estimatedEndDate: metrics.estimated_end_date
  });

  const avgMonthlyLosses = await getAverageMonthlyLossesByUserId(req.auth.userId);

  return res.status(201).json({
    message: "Contribution added",
    contribution: mapContribution(result.contribution),
    goal: mapGoal(result.goal, avgMonthlyLosses)
  });
};

export const getGoalImpact = async (req, res) => {
  const [goal, avgMonthlyLosses] = await Promise.all([
    getGoalByIdForUser(req.auth.userId, req.validated.params.id),
    getAverageMonthlyLossesByUserId(req.auth.userId)
  ]);

  const metrics = calculateGoal({
    targetAmount: goal.targetAmount,
    monthlySavings: goal.monthlySavings,
    startDate: goal.startDate,
    amountSaved: goal.amountSaved,
    avgMonthlyLosses
  });

  return res.status(200).json({
    goalId: goal.id,
    avg_monthly_losses: avgMonthlyLosses,
    months_needed: metrics.months_needed,
    estimated_end_date: metrics.estimated_end_date,
    daily_needed: metrics.daily_needed,
    yearly_amount: metrics.yearly_amount,
    years: metrics.years,
    remaining_months: metrics.remaining_months,
    months_with_losses: metrics.months_with_losses,
    estimated_end_with_losses: metrics.estimated_end_with_losses,
    delay_months: metrics.delay_months,
    is_impossible: metrics.is_impossible,
    impact_message: buildImpactMessage(metrics)
  });
};

export const achieveGoal = async (req, res) => {
  const goal = await achieveGoalForUser(req.auth.userId, req.validated.params.id);
  const avgMonthlyLosses = await getAverageMonthlyLossesByUserId(req.auth.userId);

  return res.status(200).json({
    message: "Goal marked as achieved",
    goal: mapGoal(goal, avgMonthlyLosses)
  });
};

