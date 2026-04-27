import { IncomeSource } from "@prisma/client";
import { z } from "zod";

const amountSchema = z.coerce
  .number({ invalid_type_error: "amount must be a number" })
  .positive("amount must be greater than 0");

const dateSchema = z.coerce.date({ invalid_type_error: "date must be a valid date" });

export const listIncomeSchema = z.object({
  query: z.object({}).optional(),
  params: z.object({}).optional(),
  body: z.object({}).optional()
});

export const createIncomeSchema = z.object({
  body: z.object({
    amount: amountSchema,
    source: z.nativeEnum(IncomeSource),
    note: z.string().max(500).optional().default(""),
    date: dateSchema
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

export const deleteIncomeSchema = z.object({
  params: z.object({
    id: z.string().min(1)
  }),
  body: z.object({}).optional(),
  query: z.object({}).optional()
});

