import {
  InsightsService,
  IInsightsRepository,
  MissingCountryFilterError,
  CountryNotFoundError,
} from "./insights.service";
import { DepartmentSalaryDistribution, HeadcountSummary, MoneySummary } from "../types/insights";

class FakeInsightsRepository implements IInsightsRepository {
  constructor(
    private headcount: HeadcountSummary,
    private moneySummaries: Record<string, MoneySummary>,
    private distributions: Record<string, DepartmentSalaryDistribution[]>
  ) {}

  async getHeadcountSummary(): Promise<HeadcountSummary> {
    return this.headcount;
  }

  async getMoneySummary(country: string): Promise<MoneySummary | null> {
    return this.moneySummaries[country] ?? null;
  }

  async getSalaryDistributionByDepartment(country: string): Promise<DepartmentSalaryDistribution[]> {
    return this.distributions[country] ?? [];
  }
}

function makeService() {
  const headcount: HeadcountSummary = {
    total: 100,
    byDepartment: [{ key: "Engineering", count: 60 }],
    byCountry: [
      { key: "IN", count: 70 },
      { key: "US", count: 30 },
    ],
  };
  const moneySummaries: Record<string, MoneySummary> = {
    IN: {
      country: "IN",
      currencyCode: "INR",
      headcount: 70,
      totalPayroll: 70_000_000,
      averageSalary: 1_000_000,
      medianSalary: 950_000,
    },
  };
  const distributions: Record<string, DepartmentSalaryDistribution[]> = {
    IN: [{ department: "Engineering", averageSalary: 1_200_000, headcount: 40 }],
  };

  const repo = new FakeInsightsRepository(headcount, moneySummaries, distributions);
  return new InsightsService(repo);
}

describe("InsightsService", () => {
  describe("getHeadcountSummary", () => {
    it("returns org-wide headcount without requiring a country", async () => {
      const service = makeService();
      const summary = await service.getHeadcountSummary();
      expect(summary.total).toBe(100);
    });
  });

  describe("getMoneySummary", () => {
    it("throws MissingCountryFilterError when no country is provided", async () => {
      const service = makeService();
      await expect(service.getMoneySummary()).rejects.toThrow(MissingCountryFilterError);
      await expect(service.getMoneySummary("")).rejects.toThrow(MissingCountryFilterError);
    });

    it("returns a currency-scoped summary for a valid country", async () => {
      const service = makeService();
      const summary = await service.getMoneySummary("IN");
      expect(summary.currencyCode).toBe("INR");
      expect(summary.totalPayroll).toBe(70_000_000);
    });

    it("throws CountryNotFoundError for a country with no data", async () => {
      const service = makeService();
      await expect(service.getMoneySummary("ZZ")).rejects.toThrow(CountryNotFoundError);
    });
  });

  describe("getSalaryDistributionByDepartment", () => {
    it("throws MissingCountryFilterError when no country is provided", async () => {
      const service = makeService();
      await expect(service.getSalaryDistributionByDepartment()).rejects.toThrow(
        MissingCountryFilterError
      );
    });

    it("returns department distribution scoped to one currency", async () => {
      const service = makeService();
      const distribution = await service.getSalaryDistributionByDepartment("IN");
      expect(distribution).toEqual([
        { department: "Engineering", averageSalary: 1_200_000, headcount: 40 },
      ]);
    });
  });
});
