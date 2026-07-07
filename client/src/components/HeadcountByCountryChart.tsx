import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { HeadcountByGroup } from "../types/insights";
import { getCountryName } from "../utils/country";

const COLORS = [
  "#3452C6", // Blue
  "#1F9D6B", // Green
  "#B45309", // Orange
  "#6366F1", // Indigo
  "#EC4899", // Pink
  "#F59E0B", // Amber
  "#10B981", // Emerald
  "#8B5CF6", // Purple
];

export function HeadcountByCountryChart({ data }: { data: HeadcountByGroup[] }) {
  const chartData = data.map((item) => ({
    ...item,
    name: getCountryName(item.key),
    value: Number(item.count),
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="45%"
          innerRadius={70}
          outerRadius={100}
          paddingAngle={4}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
              stroke="#FFFFFF"
              strokeWidth={2}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [value.toLocaleString(), "Employees"]}
          contentStyle={{ fontSize: 13, borderRadius: 8, borderColor: "#E4E4E1" }}
        />
        <Legend
          formatter={(value) => <span className="text-xs font-semibold text-ink">{value}</span>}
          layout="horizontal"
          align="center"
          verticalAlign="bottom"
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ paddingTop: 8 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
