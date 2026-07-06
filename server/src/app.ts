import express from "express";
import cors from "cors";
import { env } from "./config/env";
import employeeRoutes from "./routes/employee.routes";
import healthRoutes from "./routes/health.routes";
import { errorHandler } from "./middleware/errorHandler";

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json());

  app.use("/api/health", healthRoutes);
  app.use("/api/employees", employeeRoutes);

  app.use(errorHandler);

  return app;
}
