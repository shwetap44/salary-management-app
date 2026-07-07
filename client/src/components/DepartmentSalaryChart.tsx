import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { DepartmentSalaryDistribution } from "../types/insights";

interface Props {
  data: DepartmentSalaryDistribution[];
  currencyCode: string;
}

// Money-based chart — always accent-blue, and the currency code is baked
// into every tooltip so a reader never mistakes this for a universal figure.
export function DepartmentSalaryChart({ data, currencyCode }: Props) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E1" vertical={false} />
        <XAxis dataKey="department" tick={{ fontSize: 12, fill: "#6B6B66" }} />
        <YAxis tick={{ fontSize: 12, fill: "#6B6B66" }} tickFormatter={(v) => v.toLocaleString()} />
        <Tooltip
          formatter={(value: number) => [`${currencyCode} ${value.toLocaleString()}`, "Average salary"]}
          contentStyle={{ fontSize: 13, borderRadius: 8, borderColor: "#E4E4E1" }}
        />
        <Bar dataKey="averageSalary" fill="#3452C6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
