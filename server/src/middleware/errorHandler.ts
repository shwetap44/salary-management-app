import { Request, Response, NextFunction } from "express";
import { EmployeeNotFoundError, CurrencyMismatchError } from "../services/employee.service";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof EmployeeNotFoundError) {
    return res.status(404).json({ error: err.message });
  }
  if (err instanceof CurrencyMismatchError) {
    return res.status(400).json({ error: err.message });
  }

  console.error(err);
  return res.status(500).json({ error: "Internal server error" });
}
