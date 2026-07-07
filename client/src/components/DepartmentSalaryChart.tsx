import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { DepartmentSalaryDistribution } from "../types/insights";

interface Props {
  data: DepartmentSalaryDistribution[];
  currencyCode: string;
  timescale?: "annual" | "monthly";
}

export function DepartmentSalaryChart({ data, currencyCode, timescale = "annual" }: Props) {
  const chartData = data.map((item) => ({
    ...item,
    averageSalary: Number((item.averageSalary / (timescale === "monthly" ? 12 : 1)).toFixed(2)),
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        layout="vertical"
        data={chartData}
        margin={{ top: 8, right: 16, left: 16, bottom: 8 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E1" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 12, fill: "#6B6B66" }}
          tickFormatter={(v) => v.toLocaleString()}
        />
        <YAxis
          type="category"
          dataKey="department"
          tick={{ fontSize: 12, fill: "#1C1C1A", fontWeight: 500 }}
          width={130}
        />
        <Tooltip
          formatter={(value: number) => [`${currencyCode} ${value.toLocaleString()}`, timescale === "monthly" ? "Average monthly salary" : "Average salary"]}
          contentStyle={{ fontSize: 13, borderRadius: 8, borderColor: "#E4E4E1" }}
        />
        <Bar dataKey="averageSalary" fill="#3452C6" radius={[0, 4, 4, 0]} barSize={14} />
      </BarChart>
    </ResponsiveContainer>
  );
}
