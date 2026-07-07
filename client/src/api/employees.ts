import { apiRequest } from "./client";
import {
  EmployeeListParams,
  EmployeeWithSalary,
  Paginated,
  SalaryRecord,
} from "../types/employee";

function buildQuery(params: EmployeeListParams): string {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.department) query.set("department", params.department);
  if (params.country) query.set("country", params.country);
  query.set("page", String(params.page ?? 1));
  query.set("limit", String(params.limit ?? 20));
  return query.toString();
}

export function listEmployees(
  params: EmployeeListParams
): Promise<Paginated<EmployeeWithSalary>> {
  return apiRequest(`/api/employees?${buildQuery(params)}`);
}

export function getEmployee(id: number): Promise<EmployeeWithSalary> {
  return apiRequest(`/api/employees/${id}`);
}

export function getSalaryHistory(id: number): Promise<SalaryRecord[]> {
  return apiRequest(`/api/employees/${id}/salary-history`);
}

export function addSalary(
  id: number,
  payload: { amount: number; currencyCode: string; effectiveDate: string; allowCurrencyChange?: boolean }
): Promise<SalaryRecord> {
  return apiRequest(`/api/employees/${id}/salary`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
