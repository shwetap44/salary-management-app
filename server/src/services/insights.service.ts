import { DepartmentSalaryDistribution, HeadcountSummary, MoneySummary } from "../types/insights";

export interface IInsightsRepository {
  getHeadcountSummary(): Promise<HeadcountSummary>;
  getMoneySummary(country: string): Promise<MoneySummary | null>;
  getSalaryDistributionByDepartment(country: string): Promise<DepartmentSalaryDistribution[]>;
}

export class MissingCountryFilterError extends Error {
  constructor() {
    super("A country filter is required for any monetary aggregate — see architecture.md");
    this.name = "MissingCountryFilterError";
  }
}

export class CountryNotFoundError extends Error {
  constructor(country: string) {
    super(`No employees found for country: ${country}`);
    this.name = "CountryNotFoundError";
  }
}

export class InsightsService {
  constructor(private readonly repository: IInsightsRepository) {}

  // Currency-agnostic — no country parameter, because headcount is safe to
  // aggregate org-wide.
  getHeadcountSummary(): Promise<HeadcountSummary> {
    return this.repository.getHeadcountSummary();
  }

  // Money-based — country is required, not optional. This is the structural
  // enforcement of the "never sum across currencies" rule: it's impossible
  // to call this method in a way that produces a cross-currency total.
  async getMoneySummary(country?: string): Promise<MoneySummary> {
    if (!country) {
      throw new MissingCountryFilterError();
    }

    const summary = await this.repository.getMoneySummary(country);
    if (!summary) {
      throw new CountryNotFoundError(country);
    }
    return summary;
  }

  async getSalaryDistributionByDepartment(country?: string): Promise<DepartmentSalaryDistribution[]> {
    if (!country) {
      throw new MissingCountryFilterError();
    }
    return this.repository.getSalaryDistributionByDepartment(country);
  }
}
