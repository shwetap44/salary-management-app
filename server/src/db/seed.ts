import { pool } from "../config/db";
import {
  generateEmployeeBatch,
  generateSalaryHistory,
  findCountryProfile,
  SeedEmployee,
  SeedSalaryRecord,
} from "./seedData";

const TOTAL_EMPLOYEES = 10_000;
const BATCH_SIZE = 500;

/**
 * Builds a parameterized multi-row INSERT statement.
 * node-postgres has no built-in helper for this, so we build the
 * ($1,$2,$3),($4,$5,$6)... placeholder text ourselves.
 */
function buildInsertQuery(table: string, columns: string[], rows: unknown[][]) {
  const values: unknown[] = [];
  const placeholders = rows.map((row) => {
    const rowPlaceholders = row.map((value) => {
      values.push(value);
      return `$${values.length}`;
    });
    return `(${rowPlaceholders.join(", ")})`;
  });

  const text = `
    INSERT INTO ${table} (${columns.join(", ")})
    VALUES ${placeholders.join(", ")}
    RETURNING id
  `;

  return { text, values };
}

async function insertEmployeeBatch(employees: SeedEmployee[]): Promise<number[]> {
  const columns = [
    "employee_code",
    "first_name",
    "last_name",
    "email",
    "department",
    "country",
    "currency_code",
    "status",
  ];
  const rows = employees.map((e) => [
    e.employeeCode,
    e.firstName,
    e.lastName,
    e.email,
    e.department,
    e.country,
    e.currencyCode,
    e.status,
  ]);

  const { text, values } = buildInsertQuery("employees", columns, rows);
  const result = await pool.query(text, values);
  return result.rows.map((r) => r.id);
}

async function insertSalaryHistoryBatch(records: { employeeId: number; record: SeedSalaryRecord }[]) {
  if (records.length === 0) return;

  const columns = ["employee_id", "amount", "currency_code", "effective_date"];
  const rows = records.map(({ employeeId, record }) => [
    employeeId,
    record.amount,
    record.currencyCode,
    record.effectiveDate,
  ]);

  const { text, values } = buildInsertQuery("salary_history", columns, rows);
  await pool.query(text, values);
}

async function seed() {
  console.log(`Seeding ${TOTAL_EMPLOYEES} employees in batches of ${BATCH_SIZE}...`);

  // Idempotent: re-running the seed always starts from a clean slate.
  await pool.query("TRUNCATE salary_history, employees RESTART IDENTITY CASCADE");

  let inserted = 0;
  while (inserted < TOTAL_EMPLOYEES) {
    const batchCount = Math.min(BATCH_SIZE, TOTAL_EMPLOYEES - inserted);
    const employees = generateEmployeeBatch(inserted, batchCount);

    const ids = await insertEmployeeBatch(employees);

    const salaryRows = employees.flatMap((employee, i) => {
      const profile = findCountryProfile(employee.currencyCode);
      const history = generateSalaryHistory(employee.currencyCode, profile);
      return history.map((record) => ({ employeeId: ids[i], record }));
    });

    await insertSalaryHistoryBatch(salaryRows);

    inserted += batchCount;
    console.log(`  ${inserted}/${TOTAL_EMPLOYEES} employees seeded`);
  }

  console.log("Seeding complete.");
  await pool.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
