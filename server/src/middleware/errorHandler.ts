import { Request, Response, NextFunction } from "express";
import { EmployeeNotFoundError, CurrencyMismatchError } from "../services/employee.service";
import { MissingCountryFilterError, CountryNotFoundError } from "../services/insights.service";
import { InvalidCredentialsError, UnauthorizedError } from "../services/auth.service";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof EmployeeNotFoundError || err instanceof CountryNotFoundError) {
    return res.status(404).json({ error: err.message });
  }
  if (err instanceof CurrencyMismatchError || err instanceof MissingCountryFilterError) {
    return res.status(400).json({ error: err.message });
  }
  if (err instanceof InvalidCredentialsError || err instanceof UnauthorizedError) {
    return res.status(401).json({ error: err.message });
  }

  console.error(err);
  return res.status(500).json({ error: "Internal server error" });
}
