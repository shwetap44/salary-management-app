import express from "express";
import cors from "cors";
import { env } from "./config/env";
import employeeRoutes from "./routes/employee.routes";
import insightsRoutes from "./routes/insights.routes";
import healthRoutes from "./routes/health.routes";
import authRoutes, { authService } from "./routes/auth.routes";
import { createAuthMiddleware } from "./middleware/auth.middleware";
import { errorHandler } from "./middleware/errorHandler";

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json());

  const authMiddleware = createAuthMiddleware(authService);

  app.use("/api/health", healthRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/employees", authMiddleware, employeeRoutes);
  app.use("/api/insights", authMiddleware, insightsRoutes);

  app.use(errorHandler);

  return app;
}
