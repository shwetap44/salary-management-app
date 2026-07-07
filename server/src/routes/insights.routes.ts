import { Router } from "express";
import { pool } from "../config/db";
import { InsightsRepository } from "../repositories/insights.repository";
import { InsightsService } from "../services/insights.service";
import { InsightsController } from "../controllers/insights.controller";

const router = Router();

const repository = new InsightsRepository(pool);
const service = new InsightsService(repository);
const controller = new InsightsController(service);

router.get("/headcount", controller.getHeadcount);
router.get("/summary", controller.getMoneySummary);
router.get("/salary-distribution", controller.getSalaryDistribution);

export default router;
