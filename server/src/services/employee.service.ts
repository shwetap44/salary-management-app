import {
  EmployeeListFilters,
  EmployeeWithSalary,
  Paginated,
  SalaryRecord,
} from "../types/employee";

// Structural interface, not the concrete class — lets unit tests substitute
// an in-memory fake with zero database involvement. See docs/architecture.md
// (Testing Strategy) for why this boundary exists.
export interface IEmployeeRepository {
  findMany(filters: EmployeeListFilters): Promise<Paginated<EmployeeWithSalary>>;
  findById(id: number): Promise<EmployeeWithSalary | null>;
  getSalaryHistory(employeeId: number): Promise<SalaryRecord[]>;
  addSalaryRecord(
    employeeId: number,
    amount: number,
    currencyCode: string,
    effectiveDate: string
  ): Promise<SalaryRecord>;
}

export class EmployeeNotFoundError extends Error {
  constructor(id: number) {
    super(`Employee ${id} not found`);
    this.name = "EmployeeNotFoundError";
  }
}

export class CurrencyMismatchError extends Error {
  constructor(expected: string, received: string) {
    super(
      `Salary currency mismatch: employee is paid in ${expected}, received ${received}`
    );
    this.name = "CurrencyMismatchError";
  }
}

export class EmployeeService {
  constructor(private readonly repository: IEmployeeRepository) {}

  listEmployees(filters: EmployeeListFilters): Promise<Paginated<EmployeeWithSalary>> {
    return this.repository.findMany(filters);
  }

  async getEmployee(id: number): Promise<EmployeeWithSalary> {
    const employee = await this.repository.findById(id);
    if (!employee) {
      throw new EmployeeNotFoundError(id);
    }
    return employee;
  }

  async getSalaryHistory(employeeId: number): Promise<SalaryRecord[]> {
    // Confirms the employee exists first, so callers get a clean 404
    // instead of a silently empty history array for a bad id.
    await this.getEmployee(employeeId);
    return this.repository.getSalaryHistory(employeeId);
  }

  /**
   * Records a new salary for an employee. This never mutates or removes an
   * existing salary_history row — it always appends, preserving history.
   *
   * By default the new record must use the employee's current native
   * currency. Changing an employee's pay currency (e.g. after relocation)
   * is a deliberate, explicit action — not a side effect of a routine
   * salary update — so it requires the caller to pass allowCurrencyChange.
   */
  async addSalary(
    employeeId: number,
    amount: number,
    currencyCode: string,
    effectiveDate: string,
    allowCurrencyChange = false
  ): Promise<SalaryRecord> {
    const employee = await this.getEmployee(employeeId);

    if (!allowCurrencyChange && currencyCode !== employee.currencyCode) {
      throw new CurrencyMismatchError(employee.currencyCode, currencyCode);
    }

    if (amount < 0) {
      throw new Error("Salary amount cannot be negative");
    }

    return this.repository.addSalaryRecord(employeeId, amount, currencyCode, effectiveDate);
  }
}
