import { Request, Response, NextFunction } from "express";
import { AuthService, UnauthorizedError } from "../services/auth.service";

declare global {
  namespace Express {
    interface Request {
      user?: {
        email: string;
      };
    }
  }
}

export function createAuthMiddleware(authService: AuthService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new UnauthorizedError("Missing or invalid authorization header");
      }

      const token = authHeader.split(" ")[1];
      const payload = await authService.verifyToken(token);
      req.user = payload;
      next();
    } catch (err) {
      next(err);
    }
  };
}
