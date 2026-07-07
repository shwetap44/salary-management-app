import { Router } from "express";
import { env } from "../config/env";
import { AuthService } from "../services/auth.service";
import { AuthController } from "../controllers/auth.controller";

// Instantiate the decoupled AuthService using config values from env
export const authService = new AuthService({
  hrEmail: env.hrManager.email,
  hrPasswordHashOrPlain: env.hrManager.password,
  jwtSecret: env.jwtSecret,
});

const controller = new AuthController(authService);
const router = Router();

router.post("/login", controller.login);

export default router;
