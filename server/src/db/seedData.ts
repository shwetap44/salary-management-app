export interface SeedEmployee {
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  country: string;
  currencyCode: string;
  status: string;
}

export interface SeedSalaryRecord {
  amount: number;
  currencyCode: string;
  effectiveDate: string; // YYYY-MM-DD
}

export interface CountryProfile {
  country: string;
  currencyCode: string;
  minSalary: number;
  maxSalary: number;
}

export const DEPARTMENTS = [
  "Engineering",
  "Sales",
  "Marketing",
  "Human Resources",
  "Finance",
  "Operations",
  "Product",
  "Customer Support",
  "Legal",
  "IT",
];

// Realistic annual salary bands per country, in that country's own currency —
// deliberately not normalized to one currency, matching the native-currency
// storage decision in architecture.md.
export const COUNTRIES: CountryProfile[] = [
  { country: "IN", currencyCode: "INR", minSalary: 500_000, maxSalary: 3_500_000 },
  { country: "US", currencyCode: "USD", minSalary: 45_000, maxSalary: 220_000 },
  { country: "GB", currencyCode: "GBP", minSalary: 28_000, maxSalary: 150_000 },
  { country: "DE", currencyCode: "EUR", minSalary: 35_000, maxSalary: 140_000 },
  { country: "AU", currencyCode: "AUD", minSalary: 50_000, maxSalary: 180_000 },
  { country: "CA", currencyCode: "CAD", minSalary: 42_000, maxSalary: 160_000 },
  { country: "SG", currencyCode: "SGD", minSalary: 40_000, maxSalary: 180_000 },
  { country: "AE", currencyCode: "AED", minSalary: 80_000, maxSalary: 400_000 },
];

// Deliberately no external data-generation library here: the mock data we
// need (a name, a department, a country, a number in a range) is trivial
// with plain arrays + Math.random, and it avoids pulling in a dependency
// purely for convenience — see the note on @faker-js/faker's ESM-only
// packaging colliding with our CommonJS Jest setup.
const FIRST_NAMES = [
  "Aarav", "Priya", "James", "Emma", "Liam", "Olivia", "Noah", "Ava",
  "Mohammed", "Fatima", "Wei", "Mei", "Lucas", "Sofia", "Ethan", "Isabella",
  "Arjun", "Ananya", "Daniel", "Grace", "Ryan", "Chloe", "David", "Zoe",
  "Ravi", "Neha", "Michael", "Sarah", "Omar", "Layla", "Kai", "Nina",
];

const LAST_NAMES = [
  "Sharma", "Patel", "Smith", "Johnson", "Wang", "Li", "Garcia", "Muller",
  "Khan", "Ahmed", "Brown", "Wilson", "Kumar", "Singh", "Chen", "Zhang",
  "Taylor", "Anderson", "Hassan", "Ali", "Martinez", "Lopez", "Schmidt",
  "Fischer", "Nair", "Iyer", "Thompson", "White", "Kim", "Park", "Rossi", "Ferrari",
];

function randomElement<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function weightedStatus(): string {
  // ~90% active, ~10% inactive — gives the status filter something
  // realistic to filter against instead of a uniform dataset.
  return Math.random() < 0.9 ? "active" : "inactive";
}

export function findCountryProfile(currencyCode: string): CountryProfile {
  const profile = COUNTRIES.find((c) => c.currencyCode === currencyCode);
  if (!profile) {
    throw new Error(`Unknown currency code: ${currencyCode}`);
  }
  return profile;
}

/**
 * Generates `count` employees, numbered starting at `startIndex` (0-based).
 * Pure function — no I/O — so it can be unit tested without a database.
 */
export function generateEmployeeBatch(startIndex: number, count: number): SeedEmployee[] {
  const employees: SeedEmployee[] = [];

  for (let i = 0; i < count; i++) {
    const index = startIndex + i;
    const firstName = randomElement(FIRST_NAMES);
    const lastName = randomElement(LAST_NAMES);
    const countryProfile = randomElement(COUNTRIES);

    employees.push({
      employeeCode: `EMP-${String(index + 1).padStart(6, "0")}`,
      firstName,
      lastName,
      // The numeric suffix guarantees uniqueness at 10k+ scale even when
      // the same first/last name combination is picked more than once.
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${index + 1}@acme.test`,
      department: randomElement(DEPARTMENTS),
      country: countryProfile.country,
      currencyCode: countryProfile.currencyCode,
      status: weightedStatus(),
    });
  }

  return employees;
}

/**
 * Generates 1-3 salary history records for one employee: always in the
 * employee's native currency, with strictly increasing effective dates and
 * non-decreasing amounts — a raise history, not a pay-cut history, matching
 * how salary_history is actually used in the app.
 */
export function generateSalaryHistory(currencyCode: string, profile: CountryProfile): SeedSalaryRecord[] {
  const recordCount = randomInt(1, 3);
  const records: SeedSalaryRecord[] = [];
  const dayMs = 24 * 60 * 60 * 1000;
  const now = Date.now();

  let amount = randomInt(profile.minSalary, profile.maxSalary);

  for (let i = 0; i < recordCount; i++) {
    // Each record is ~400 days further apart than the next, with a small
    // jitter well inside that gap — guarantees strictly ascending dates.
    const daysAgo = (recordCount - i) * 400 + randomInt(-20, 20);
    const effectiveDate = new Date(now - daysAgo * dayMs).toISOString().slice(0, 10);

    records.push({ amount, currencyCode, effectiveDate });

    // The next (more recent) record is a raise, not a cut.
    amount = Math.round(amount * randomFloat(1.03, 1.15));
  }

  return records;
}
