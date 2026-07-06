import { Request, Response, NextFunction } from "express";
import { EmployeeService } from "../services/employee.service";

export class EmployeeController {
  constructor(private readonly service: EmployeeService) {}

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

      const result = await this.service.listEmployees({
        search: typeof req.query.search === "string" ? req.query.search : undefined,
        department: typeof req.query.department === "string" ? req.query.department : undefined,
        country: typeof req.query.country === "string" ? req.query.country : undefined,
        page,
        limit,
      });

      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const employee = await this.service.getEmployee(Number(req.params.id));
      res.json(employee);
    } catch (err) {
      next(err);
    }
  };

  getSalaryHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const history = await this.service.getSalaryHistory(Number(req.params.id));
      res.json(history);
    } catch (err) {
      next(err);
    }
  };

  addSalary = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { amount, currencyCode, effectiveDate, allowCurrencyChange } = req.body;
      const record = await this.service.addSalary(
        Number(req.params.id),
        Number(amount),
        currencyCode,
        effectiveDate,
        Boolean(allowCurrencyChange)
      );
      res.status(201).json(record);
    } catch (err) {
      next(err);
    }
  };
}
