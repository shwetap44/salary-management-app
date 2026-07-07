import { useEffect, useState } from "react";
import { getHeadcountSummary, getMoneySummary, getSalaryDistributionByDepartment } from "../api/insights";
import { HeadcountSummary, MoneySummary, DepartmentSalaryDistribution } from "../types/insights";
import { KpiCard } from "../components/KpiCard";
import { HeadcountByCountryChart } from "../components/HeadcountByCountryChart";
import { DepartmentSalaryChart } from "../components/DepartmentSalaryChart";
import { Money } from "../components/Money";
import { COUNTRY_NAMES } from "../utils/country";

export function InsightsPage() {
  const [headcount, setHeadcount] = useState<HeadcountSummary | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [moneySummary, setMoneySummary] = useState<MoneySummary | null>(null);
  const [distribution, setDistribution] = useState<DepartmentSalaryDistribution[]>([]);
  const [loadingHeadcount, setLoadingHeadcount] = useState(true);
  const [loadingMoney, setLoadingMoney] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Org-wide, currency-agnostic — loaded once, independent of the country
  // filter below.
  useEffect(() => {
    getHeadcountSummary()
      .then((summary) => {
        setHeadcount(summary);
        if (summary.byCountry.length > 0) {
          setSelectedCountry(summary.byCountry[0].key);
        }
      })
      .catch(() => setError("Couldn't load headcount insights."))
      .finally(() => setLoadingHeadcount(false));
  }, []);

  // Money-based — re-fetched whenever the selected country changes. Never
  // fetched without a country; there is no "all countries" money view.
  useEffect(() => {
    if (!selectedCountry) return;

    setLoadingMoney(true);
    setError(null);

    Promise.all([
      getMoneySummary(selectedCountry),
      getSalaryDistributionByDepartment(selectedCountry),
    ])
      .then(([summary, dist]) => {
        setMoneySummary(summary);
        setDistribution(dist);
      })
      .catch(() => setError("Couldn't load salary insights for this country."))
      .finally(() => setLoadingMoney(false));
  }, [selectedCountry]);

  return (
    <div>
      <h2 className="text-2xl font-semibold">Insights</h2>
      <p className="text-sm text-muted mt-1">How the organization pays its people.</p>

      {/* Currency-agnostic section — safe to show org-wide since it's
          only ever counting people, never summing money. */}
      <section className="mt-6">
        <div className="grid grid-cols-3 gap-4">
          <KpiCard
            label="Total Headcount"
            value={loadingHeadcount ? "…" : headcount?.total.toLocaleString() ?? "—"}
            hint="Across all countries"
          />
          <KpiCard
            label="Departments"
            value={loadingHeadcount ? "…" : headcount?.byDepartment.length ?? "—"}
          />
          <KpiCard
            label="Countries"
            value={loadingHeadcount ? "…" : headcount?.byCountry.length ?? "—"}
          />
        </div>

        {headcount && (
          <div className="mt-4 rounded-lg border border-border bg-surface p-5">
            <h3 className="text-sm font-semibold mb-3">Headcount by country</h3>
            <HeadcountByCountryChart data={headcount.byCountry} />
          </div>
        )}
      </section>

      {/* Money-based section — always scoped to one country/currency.
          The dropdown below is a FILTER, not a currency converter: switching
          it re-queries a different currency's data, it never recomputes the
          same numbers into a different currency. */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Pay, by currency</h3>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
          >
            {headcount?.byCountry.map((c) => (
              <option key={c.key} value={c.key}>
                Show data for: {COUNTRY_NAMES[c.key] ?? c.key}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="text-sm text-warn mb-4">{error}</p>}

        {moneySummary && (
          <>
            <div className="grid grid-cols-3 gap-4">
              <KpiCard
                label="Total Payroll"
                value={
                  loadingMoney ? (
                    "…"
                  ) : (
                    <Money amount={moneySummary.totalPayroll} currencyCode={moneySummary.currencyCode} />
                  )
                }
                hint={`${moneySummary.headcount.toLocaleString()} people in this currency`}
              />
              <KpiCard
                label="Average Salary"
                value={
                  loadingMoney ? (
                    "…"
                  ) : (
                    <Money amount={moneySummary.averageSalary} currencyCode={moneySummary.currencyCode} />
                  )
                }
              />
              <KpiCard
                label="Median Salary"
                value={
                  loadingMoney ? (
                    "…"
                  ) : (
                    <Money amount={moneySummary.medianSalary} currencyCode={moneySummary.currencyCode} />
                  )
                }
              />
            </div>

            <div className="mt-4 rounded-lg border border-border bg-surface p-5">
              <h4 className="text-sm font-semibold mb-3">
                Average salary by department — {moneySummary.currencyCode}
              </h4>
              <DepartmentSalaryChart data={distribution} currencyCode={moneySummary.currencyCode} />
            </div>
          </>
        )}
      </section>
    </div>
  );
}
