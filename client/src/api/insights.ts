import { apiRequest } from "./client";
import { DepartmentSalaryDistribution, HeadcountSummary, MoneySummary } from "../types/insights";

export function getHeadcountSummary(): Promise<HeadcountSummary> {
  return apiRequest("/api/insights/headcount");
}

// country is a required parameter here (not optional) at the call-site
// level too — mirrors the backend's MissingCountryFilterError rule. See
// docs/architecture.md.
export function getMoneySummary(country: string): Promise<MoneySummary> {
  return apiRequest(`/api/insights/summary?country=${encodeURIComponent(country)}`);
}

export function getSalaryDistributionByDepartment(
  country: string
): Promise<DepartmentSalaryDistribution[]> {
  return apiRequest(`/api/insights/salary-distribution?country=${encodeURIComponent(country)}`);
}
