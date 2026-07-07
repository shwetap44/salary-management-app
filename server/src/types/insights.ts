export interface HeadcountByGroup {
  key: string;
  count: number;
}

export interface HeadcountSummary {
  total: number;
  byDepartment: HeadcountByGroup[];
  byCountry: HeadcountByGroup[];
}

export interface MoneySummary {
  country: string;
  currencyCode: string;
  headcount: number;
  totalPayroll: number;
  averageSalary: number;
  medianSalary: number;
}

export interface DepartmentSalaryDistribution {
  department: string;
  averageSalary: number;
  headcount: number;
}
