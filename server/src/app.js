import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";

import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import authRoutes from "./routes/auth.routes.js";
import budgetRoutes from "./routes/budget.routes.js";
import goalRoutes from "./routes/goal.routes.js";
import lossRoutes from "./routes/loss.routes.js";

export const createApp = () => {
  const app = express();

  if (env.trustProxy) {
    app.set("trust proxy", 1);
  }

  app.use(helmet());
  app.use(
    cors({
      origin: env.clientOrigin,
      credentials: true
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  app.get("/api/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/analytics", analyticsRoutes);
  app.use("/api/budget", budgetRoutes);
  app.use("/api/goals", goalRoutes);
  app.use("/api/losses", lossRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

