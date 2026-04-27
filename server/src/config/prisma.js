import { PrismaClient } from "@prisma/client";
import { env } from "./env.js";

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: { url: env.databaseUrl }
    }
  });

if (env.nodeEnv !== "production") {
  globalForPrisma.prisma = prisma;
}

