import { Request, Response, NextFunction } from "express";
import { InsightsService } from "../services/insights.service";

export class InsightsController {
  constructor(private readonly service: InsightsService) {}

  getHeadcount = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const summary = await this.service.getHeadcountSummary();
      res.json(summary);
    } catch (err) {
      next(err);
    }
  };

  getMoneySummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const country = typeof req.query.country === "string" ? req.query.country : undefined;
      const summary = await this.service.getMoneySummary(country);
      res.json(summary);
    } catch (err) {
      next(err);
    }
  };

  getSalaryDistribution = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const country = typeof req.query.country === "string" ? req.query.country : undefined;
      const distribution = await this.service.getSalaryDistributionByDepartment(country);
      res.json(distribution);
    } catch (err) {
      next(err);
    }
  };
}
