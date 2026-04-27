import { z } from "zod";

export const analyticsQuerySchema = z.object({
  query: z.object({
    period: z.enum(["day", "week", "month", "all"]).default("month")
  }),
  params: z.object({}).optional(),
  body: z.object({}).optional()
});

