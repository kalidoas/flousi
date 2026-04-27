import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";

const app = createApp();

const server = app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Flousi server running on port ${env.port}`);
});

const shutdown = async (signal) => {
  // eslint-disable-next-line no-console
  console.log(`Received ${signal}, shutting down...`);

  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

