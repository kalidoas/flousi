import { LossCategory } from "@prisma/client";
import { z } from "zod";

const amountSchema = z.coerce
  .number({ invalid_type_error: "amount must be a number" })
  .positive("amount must be greater than 0");

const dateSchema = z.coerce.date({ invalid_type_error: "date must be a valid date" });

export const listLossesSchema = z.object({
  query: z.object({
    period: z.enum(["day", "week", "month", "all"]).default("all")
  }),
  body: z.object({}).optional(),
  params: z.object({}).optional()
});

export const createLossSchema = z.object({
  body: z.object({
    amount: amountSchema,
    category: z.nativeEnum(LossCategory),
    note: z.string().max(500).optional().default(""),
    date: dateSchema
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const updateLossSchema = z.object({
  params: z.object({
    id: z.string().min(1)
  }),
  body: z
    .object({
      amount: amountSchema.optional(),
      category: z.nativeEnum(LossCategory).optional(),
      note: z.string().max(500).optional(),
      date: dateSchema.optional()
    })
    .refine((payload) => Object.keys(payload).length > 0, {
      message: "At least one field is required"
    }),
  query: z.object({}).optional()
});

export const lossIdSchema = z.object({
  params: z.object({
    id: z.string().min(1)
  }),
  body: z.object({}).optional(),
  query: z.object({}).optional()
});

