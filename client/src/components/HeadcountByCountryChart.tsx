import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { HeadcountByGroup } from "../types/insights";

// Headcount-based chart — deliberately green, not accent-blue, to visually
// distinguish "currency-agnostic, safe org-wide" data from money-based
// charts, which are always scoped to one currency. See architecture.md.
export function HeadcountByCountryChart({ data }: { data: HeadcountByGroup[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E1" vertical={false} />
        <XAxis dataKey="key" tick={{ fontSize: 12, fill: "#6B6B66" }} />
        <YAxis tick={{ fontSize: 12, fill: "#6B6B66" }} allowDecimals={false} />
        <Tooltip
          formatter={(value: number) => [value.toLocaleString(), "Headcount"]}
          contentStyle={{ fontSize: 13, borderRadius: 8, borderColor: "#E4E4E1" }}
        />
        <Bar dataKey="count" fill="#1F9D6B" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
