import { Pool } from "pg";
import { DepartmentSalaryDistribution, HeadcountSummary, MoneySummary } from "../types/insights";

// Shared CTE: "current salary" is always the latest salary_history row per
// employee. Reused across every money-based query in this repository.
const CURRENT_SALARY_CTE = `
  SELECT DISTINCT ON (employee_id) employee_id, amount
  FROM salary_history
  ORDER BY employee_id, effective_date DESC
`;

export class InsightsRepository {
  constructor(private readonly pool: Pool) {}

  // Currency-agnostic — safe to aggregate across the whole org since it's
  // just counting people, never summing money. See architecture.md.
  async getHeadcountSummary(): Promise<HeadcountSummary> {
    const [totalResult, byDepartmentResult, byCountryResult] = await Promise.all([
      this.pool.query("SELECT COUNT(*) FROM employees"),
      this.pool.query(
        "SELECT department AS key, COUNT(*) AS count FROM employees GROUP BY department ORDER BY department"
      ),
      this.pool.query(
        "SELECT country AS key, COUNT(*) AS count FROM employees GROUP BY country ORDER BY country"
      ),
    ]);

    return {
      total: Number(totalResult.rows[0].count),
      byDepartment: byDepartmentResult.rows.map((r) => ({ key: r.key, count: Number(r.count) })),
      byCountry: byCountryResult.rows.map((r) => ({ key: r.key, count: Number(r.count) })),
    };
  }

  // Money-based — always scoped to a single country/currency. There is
  // deliberately no variant of this method that omits the country filter.
  async getMoneySummary(country: string): Promise<MoneySummary | null> {
    const result = await this.pool.query(
      `
      WITH current_salary AS (${CURRENT_SALARY_CTE})
      SELECT
        e.country,
        MIN(e.currency_code) AS currency_code,
        COUNT(*) AS headcount,
        COALESCE(SUM(cs.amount), 0) AS total_payroll,
        COALESCE(AVG(cs.amount), 0) AS average_salary,
        COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY cs.amount), 0) AS median_salary
      FROM employees e
      LEFT JOIN current_salary cs ON cs.employee_id = e.id
      WHERE e.country = $1
      GROUP BY e.country
      `,
      [country]
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      country: row.country,
      currencyCode: row.currency_code,
      headcount: Number(row.headcount),
      totalPayroll: Number(row.total_payroll),
      averageSalary: Number(row.average_salary),
      medianSalary: Number(row.median_salary),
    };
  }

  // Also money-based (average salary), so it takes the same required
  // country filter as getMoneySummary — never returns cross-currency figures.
  async getSalaryDistributionByDepartment(country: string): Promise<DepartmentSalaryDistribution[]> {
    const result = await this.pool.query(
      `
      WITH current_salary AS (${CURRENT_SALARY_CTE})
      SELECT
        e.department,
        COALESCE(AVG(cs.amount), 0) AS average_salary,
        COUNT(*) AS headcount
      FROM employees e
      LEFT JOIN current_salary cs ON cs.employee_id = e.id
      WHERE e.country = $1
      GROUP BY e.department
      ORDER BY e.department
      `,
      [country]
    );

    return result.rows.map((r) => ({
      department: r.department,
      averageSalary: Number(r.average_salary),
      headcount: Number(r.headcount),
    }));
  }
}
