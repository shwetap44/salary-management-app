import { Router } from "express";
import { pool } from "../config/db";
import { EmployeeRepository } from "../repositories/employee.repository";
import { EmployeeService } from "../services/employee.service";
import { EmployeeController } from "../controllers/employee.controller";

const router = Router();

const repository = new EmployeeRepository(pool);
const service = new EmployeeService(repository);
const controller = new EmployeeController(service);

router.get("/", controller.list);
router.get("/:id", controller.getById);
router.get("/:id/salary-history", controller.getSalaryHistory);
router.post("/:id/salary", controller.addSalary);

export default router;
