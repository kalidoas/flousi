import { z } from "zod";

const email = z.string().trim().email("Email format is invalid");
const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password is too long");

export const registerSchema = z.object({
  body: z.object({
    email,
    password,
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(80)
  }),
  params: z.object({}),
  query: z.object({})
});

export const loginSchema = z.object({
  body: z.object({
    email,
    password
  }),
  params: z.object({}),
  query: z.object({})
});

