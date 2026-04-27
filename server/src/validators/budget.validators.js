import { z } from "zod";

export const updateBudgetSchema = z.object({
  body: z.object({
    monthlyIncome: z.coerce.number().nonnegative("monthlyIncome must be >= 0")
  }),
  params: z.object({}),
  query: z.object({})
});

