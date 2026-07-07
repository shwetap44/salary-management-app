export interface Employee {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  country: string;
  currencyCode: string;
  status: string;
}

export interface EmployeeWithSalary extends Employee {
  currentSalary: number | null;
  salaryCurrency: string | null;
}

export interface SalaryRecord {
  id: number;
  employeeId: number;
  amount: number;
  currencyCode: string;
  effectiveDate: string;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}

export interface EmployeeListParams {
  search?: string;
  department?: string;
  country?: string;
  page?: number;
  limit?: number;
}
