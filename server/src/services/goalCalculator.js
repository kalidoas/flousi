const toNumber = (value) => Number(value || 0);

const addMonths = (dateInput, months) => {
  const date = new Date(dateInput);
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

export const calculateGoal = ({
  targetAmount,
  monthlySavings,
  startDate,
  amountSaved = 0,
  avgMonthlyLosses = 0
}) => {
  const target = toNumber(targetAmount);
  const monthly = toNumber(monthlySavings);
  const saved = toNumber(amountSaved);
  const avgLosses = toNumber(avgMonthlyLosses);

  const remaining = Math.max(0, target - saved);
  const safeStartDate = new Date(startDate || new Date());

  const months_needed = remaining === 0 ? 0 : monthly > 0 ? Math.ceil(remaining / monthly) : null;
  const estimated_end_date = months_needed === null ? null : addMonths(safeStartDate, months_needed);

  const totalDays = (months_needed || 0) * 30;
  const daily_needed = totalDays > 0 ? remaining / totalDays : 0;

  const yearly_amount = monthly * 12;
  const years = months_needed === null ? null : Math.floor(months_needed / 12);
  const remaining_months = months_needed === null ? null : months_needed % 12;

  const effectiveSavings = monthly - avgLosses;
  const is_impossible = effectiveSavings <= 0 && remaining > 0;

  const months_with_losses =
    remaining === 0 ? 0 : is_impossible ? null : Math.ceil(remaining / effectiveSavings);
  const estimated_end_with_losses =
    months_with_losses === null ? null : addMonths(safeStartDate, months_with_losses);

  const delay_months =
    months_with_losses === null || months_needed === null ? null : Math.max(0, months_with_losses - months_needed);

  return {
    remaining,
    months_needed,
    estimated_end_date,
    daily_needed,
    yearly_amount,
    years,
    remaining_months,
    months_with_losses,
    estimated_end_with_losses,
    delay_months,
    is_impossible,
    effective_savings: effectiveSavings
  };
};

