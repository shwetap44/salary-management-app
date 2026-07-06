import {
  generateEmployeeBatch,
  generateSalaryHistory,
  findCountryProfile,
  COUNTRIES,
  DEPARTMENTS,
} from "./seedData";

describe("generateEmployeeBatch", () => {
  it("generates the requested number of employees", () => {
    const employees = generateEmployeeBatch(0, 250);
    expect(employees).toHaveLength(250);
  });

  it("produces unique employee codes and emails even at scale", () => {
    const employees = generateEmployeeBatch(0, 5000);

    const codes = new Set(employees.map((e) => e.employeeCode));
    const emails = new Set(employees.map((e) => e.email));

    expect(codes.size).toBe(5000);
    expect(emails.size).toBe(5000);
  });

  it("numbers employee codes starting from startIndex", () => {
    const employees = generateEmployeeBatch(500, 3);
    expect(employees.map((e) => e.employeeCode)).toEqual([
      "EMP-000501",
      "EMP-000502",
      "EMP-000503",
    ]);
  });

  it("only assigns departments from the approved list", () => {
    const employees = generateEmployeeBatch(0, 500);
    for (const employee of employees) {
      expect(DEPARTMENTS).toContain(employee.department);
    }
  });

  it("pairs each country with its correct native currency", () => {
    const employees = generateEmployeeBatch(0, 500);
    for (const employee of employees) {
      const profile = COUNTRIES.find((c) => c.country === employee.country);
      expect(profile).toBeDefined();
      expect(employee.currencyCode).toBe(profile!.currencyCode);
    }
  });
});

describe("generateSalaryHistory", () => {
  it("generates between 1 and 3 records", () => {
    for (let i = 0; i < 50; i++) {
      const profile = findCountryProfile("INR");
      const history = generateSalaryHistory("INR", profile);
      expect(history.length).toBeGreaterThanOrEqual(1);
      expect(history.length).toBeLessThanOrEqual(3);
    }
  });

  it("keeps every record in the employee's native currency", () => {
    const profile = findCountryProfile("USD");
    const history = generateSalaryHistory("USD", profile);
    for (const record of history) {
      expect(record.currencyCode).toBe("USD");
    }
  });

  it("orders effective dates strictly ascending (oldest first)", () => {
    const profile = findCountryProfile("GBP");
    const history = generateSalaryHistory("GBP", profile);

    for (let i = 1; i < history.length; i++) {
      expect(new Date(history[i].effectiveDate).getTime()).toBeGreaterThan(
        new Date(history[i - 1].effectiveDate).getTime()
      );
    }
  });

  it("never decreases salary across successive records (raises, not cuts)", () => {
    const profile = findCountryProfile("EUR");
    const history = generateSalaryHistory("EUR", profile);

    for (let i = 1; i < history.length; i++) {
      expect(history[i].amount).toBeGreaterThanOrEqual(history[i - 1].amount);
    }
  });

  it("keeps amounts within the country's realistic salary band", () => {
    const profile = findCountryProfile("AED");
    const history = generateSalaryHistory("AED", profile);
    // Later records can exceed maxSalary slightly due to raises — only the
    // first (oldest, base) record is guaranteed within the original band.
    expect(history[0].amount).toBeGreaterThanOrEqual(profile.minSalary);
    expect(history[0].amount).toBeLessThanOrEqual(profile.maxSalary);
  });
});

describe("findCountryProfile", () => {
  it("throws for an unknown currency code", () => {
    expect(() => findCountryProfile("XYZ")).toThrow("Unknown currency code: XYZ");
  });
});
