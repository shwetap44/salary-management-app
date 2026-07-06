import { Pool } from "pg";
import {
  Employee,
  EmployeeListFilters,
  EmployeeWithSalary,
  Paginated,
  SalaryRecord,
} from "../types/employee";

function mapEmployeeRow(row: any): Employee {
  return {
    id: row.id,
    employeeCode: row.employee_code,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    department: row.department,
    country: row.country,
    currencyCode: row.currency_code,
    status: row.status,
  };
}

function mapEmployeeWithSalaryRow(row: any): EmployeeWithSalary {
  return {
    ...mapEmployeeRow(row),
    currentSalary: row.current_salary !== null ? Number(row.current_salary) : null,
    salaryCurrency: row.salary_currency ?? null,
  };
}

function mapSalaryRow(row: any): SalaryRecord {
  return {
    id: row.id,
    employeeId: row.employee_id,
    amount: Number(row.amount),
    currencyCode: row.currency_code,
    effectiveDate: row.effective_date,
  };
}

export class EmployeeRepository {
  constructor(private readonly pool: Pool) {}

  async findMany(filters: EmployeeListFilters): Promise<Paginated<EmployeeWithSalary>> {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (filters.search) {
      params.push(`%${filters.search.toLowerCase()}%`);
      conditions.push(
        `(LOWER(e.first_name) LIKE $${params.length} OR LOWER(e.last_name) LIKE $${params.length} OR LOWER(e.email) LIKE $${params.length})`
      );
    }
    if (filters.department) {
      params.push(filters.department);
      conditions.push(`e.department = $${params.length}`);
    }
    if (filters.country) {
      params.push(filters.country);
      conditions.push(`e.country = $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // "Current salary" = latest salary_history row per employee.
    // DISTINCT ON keeps this a single indexed pass rather than a
    // correlated subquery per employee.
    const currentSalaryCte = `
      SELECT DISTINCT ON (employee_id) employee_id, amount, currency_code
      FROM salary_history
      ORDER BY employee_id, effective_date DESC
    `;

    const countResult = await this.pool.query(
      `SELECT COUNT(*) FROM employees e ${whereClause}`,
      params
    );
    const total = Number(countResult.rows[0].count);

    const offset = (filters.page - 1) * filters.limit;
    params.push(filters.limit, offset);

    const result = await this.pool.query(
      `
      SELECT e.*, cs.amount AS current_salary, cs.currency_code AS salary_currency
      FROM employees e
      LEFT JOIN (${currentSalaryCte}) cs ON cs.employee_id = e.id
      ${whereClause}
      ORDER BY e.id
      LIMIT $${params.length - 1} OFFSET $${params.length}
      `,
      params
    );

    return {
      items: result.rows.map(mapEmployeeWithSalaryRow),
      page: filters.page,
      limit: filters.limit,
      total,
    };
  }

  async findById(id: number): Promise<EmployeeWithSalary | null> {
    const result = await this.pool.query(
      `
      SELECT e.*, cs.amount AS current_salary, cs.currency_code AS salary_currency
      FROM employees e
      LEFT JOIN (
        SELECT DISTINCT ON (employee_id) employee_id, amount, currency_code
        FROM salary_history
        WHERE employee_id = $1
        ORDER BY employee_id, effective_date DESC
      ) cs ON cs.employee_id = e.id
      WHERE e.id = $1
      `,
      [id]
    );
    return result.rows.length > 0 ? mapEmployeeWithSalaryRow(result.rows[0]) : null;
  }

  async getSalaryHistory(employeeId: number): Promise<SalaryRecord[]> {
    const result = await this.pool.query(
      `SELECT * FROM salary_history WHERE employee_id = $1 ORDER BY effective_date DESC`,
      [employeeId]
    );
    return result.rows.map(mapSalaryRow);
  }

  async addSalaryRecord(
    employeeId: number,
    amount: number,
    currencyCode: string,
    effectiveDate: string
  ): Promise<SalaryRecord> {
    const result = await this.pool.query(
      `INSERT INTO salary_history (employee_id, amount, currency_code, effective_date)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [employeeId, amount, currencyCode, effectiveDate]
    );
    return mapSalaryRow(result.rows[0]);
  }
}
