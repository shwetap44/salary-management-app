import {
  EmployeeService,
  IEmployeeRepository,
  EmployeeNotFoundError,
  CurrencyMismatchError,
} from "./employee.service";
import { EmployeeWithSalary, SalaryRecord, Paginated, EmployeeListFilters } from "../types/employee";

// A minimal in-memory fake — this is what makes these tests fast and
// deterministic without touching Postgres. See docs/architecture.md,
// "Testing Strategy".
class FakeEmployeeRepository implements IEmployeeRepository {
  public salaryRecords: SalaryRecord[] = [];
  private nextSalaryId = 1;

  constructor(private employees: EmployeeWithSalary[]) {}

  async findMany(_filters: EmployeeListFilters): Promise<Paginated<EmployeeWithSalary>> {
    return { items: this.employees, page: 1, limit: 20, total: this.employees.length };
  }

  async findById(id: number): Promise<EmployeeWithSalary | null> {
    return this.employees.find((e) => e.id === id) ?? null;
  }

  async getSalaryHistory(employeeId: number): Promise<SalaryRecord[]> {
    return this.salaryRecords.filter((r) => r.employeeId === employeeId);
  }

  async addSalaryRecord(
    employeeId: number,
    amount: number,
    currencyCode: string,
    effectiveDate: string
  ): Promise<SalaryRecord> {
    const record: SalaryRecord = {
      id: this.nextSalaryId++,
      employeeId,
      amount,
      currencyCode,
      effectiveDate,
    };
    this.salaryRecords.push(record);
    return record;
  }
}

function makeEmployee(overrides: Partial<EmployeeWithSalary> = {}): EmployeeWithSalary {
  return {
    id: 1,
    employeeCode: "EMP-00001",
    firstName: "Asha",
    lastName: "Rao",
    email: "asha.rao@acme.test",
    department: "Engineering",
    country: "IN",
    currencyCode: "INR",
    status: "active",
    currentSalary: 1200000,
    salaryCurrency: "INR",
    ...overrides,
  };
}

describe("EmployeeService", () => {
  describe("getEmployee", () => {
    it("returns the employee when found", async () => {
      const repo = new FakeEmployeeRepository([makeEmployee()]);
      const service = new EmployeeService(repo);

      const employee = await service.getEmployee(1);

      expect(employee.firstName).toBe("Asha");
    });

    it("throws EmployeeNotFoundError when the employee does not exist", async () => {
      const repo = new FakeEmployeeRepository([]);
      const service = new EmployeeService(repo);

      await expect(service.getEmployee(999)).rejects.toThrow(EmployeeNotFoundError);
    });
  });

  describe("addSalary", () => {
    it("appends a new salary record without touching prior history", async () => {
      const repo = new FakeEmployeeRepository([makeEmployee()]);
      const service = new EmployeeService(repo);

      await service.addSalary(1, 1200000, "INR", "2024-01-01");
      await service.addSalary(1, 1400000, "INR", "2025-01-01");

      const history = await service.getSalaryHistory(1);
      expect(history).toHaveLength(2);
      expect(history.map((r) => r.amount)).toEqual([1200000, 1400000]);
    });

    it("rejects a currency that doesn't match the employee's native currency by default", async () => {
      const repo = new FakeEmployeeRepository([makeEmployee({ currencyCode: "INR" })]);
      const service = new EmployeeService(repo);

      await expect(service.addSalary(1, 90000, "USD", "2025-01-01")).rejects.toThrow(
        CurrencyMismatchError
      );
    });

    it("allows a currency change when explicitly permitted", async () => {
      const repo = new FakeEmployeeRepository([makeEmployee({ currencyCode: "INR" })]);
      const service = new EmployeeService(repo);

      const record = await service.addSalary(1, 90000, "USD", "2025-01-01", true);

      expect(record.currencyCode).toBe("USD");
    });

    it("rejects a negative salary amount", async () => {
      const repo = new FakeEmployeeRepository([makeEmployee()]);
      const service = new EmployeeService(repo);

      await expect(service.addSalary(1, -100, "INR", "2025-01-01")).rejects.toThrow(
        "Salary amount cannot be negative"
      );
    });

    it("throws EmployeeNotFoundError for a non-existent employee", async () => {
      const repo = new FakeEmployeeRepository([]);
      const service = new EmployeeService(repo);

      await expect(service.addSalary(1, 1000, "INR", "2025-01-01")).rejects.toThrow(
        EmployeeNotFoundError
      );
    });
  });
});
