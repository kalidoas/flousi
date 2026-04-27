import { GoalStatus } from "@prisma/client";
import { z } from "zod";

const amountSchema = z.coerce
  .number({ invalid_type_error: "amount must be a number" })
  .positive("amount must be greater than 0");

const nonNegativeAmountSchema = z.coerce
  .number({ invalid_type_error: "amount must be a number" })
  .min(0, "amount must be >= 0");

const dateSchema = z.coerce.date({ invalid_type_error: "date must be a valid date" });

const idParamsSchema = z.object({
  id: z.string().min(1)
});

export const listGoalsSchema = z.object({
  query: z.object({}).optional(),
  params: z.object({}).optional(),
  body: z.object({}).optional()
});

export const createGoalSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(120),
    emoji: z.string().min(1).max(10).default("🎯"),
    targetAmount: amountSchema,
    monthlySavings: amountSchema,
    amountSaved: nonNegativeAmountSchema.optional().default(0),
    startDate: dateSchema.optional(),
    priority: z.coerce.number().int().positive().optional(),
    status: z.nativeEnum(GoalStatus).optional()
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const updateGoalSchema = z.object({
  params: idParamsSchema,
  body: z
    .object({
      name: z.string().min(1).max(120).optional(),
      emoji: z.string().min(1).max(10).optional(),
      targetAmount: amountSchema.optional(),
      monthlySavings: amountSchema.optional(),
      amountSaved: nonNegativeAmountSchema.optional(),
      startDate: dateSchema.optional(),
      priority: z.coerce.number().int().positive().optional(),
      status: z.nativeEnum(GoalStatus).optional()
    })
    .refine((payload) => Object.keys(payload).length > 0, {
      message: "At least one field is required"
    }),
  query: z.object({}).optional()
});

export const goalIdSchema = z.object({
  params: idParamsSchema,
  body: z.object({}).optional(),
  query: z.object({}).optional()
});

export const contributeGoalSchema = z.object({
  params: idParamsSchema,
  body: z.object({
    amount: amountSchema,
    date: dateSchema.optional(),
    note: z.string().max(500).optional().default("")
  }),
  query: z.object({}).optional()
});

