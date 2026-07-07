import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getEmployee, getSalaryHistory, addSalary } from "../api/employees";
import { EmployeeWithSalary, SalaryRecord } from "../types/employee";
import { Money } from "../components/Money";
import { StatusBadge } from "../components/StatusBadge";
import { getCountryName } from "../utils/country";
import { useAuth } from "../context/AuthContext";

export function EmployeeDetailPage() {
  const { timescale } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [employee, setEmployee] = useState<EmployeeWithSalary | null>(null);
  const [history, setHistory] = useState<SalaryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [currencyCode, setCurrencyCode] = useState("");
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split("T")[0]);
  const [allowCurrencyChange, setAllowCurrencyChange] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([getEmployee(Number(id)), getSalaryHistory(Number(id))])
      .then(([emp, hist]) => {
        setEmployee(emp);
        setHistory(hist);
        setCurrencyCode(emp.currencyCode);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !employee) return;
    if (!amount || !currencyCode || !effectiveDate) {
      setFormError("Please fill in all fields.");
      return;
    }

    setFormError(null);
    setIsSaving(true);

    try {
      const inputAmount = Number(amount);
      const annualAmount = timescale === "monthly" ? inputAmount * 12 : inputAmount;

      await addSalary(Number(id), {
        amount: annualAmount,
        currencyCode,
        effectiveDate,
        allowCurrencyChange,
      });

      // Refresh data
      const [emp, hist] = await Promise.all([getEmployee(Number(id)), getSalaryHistory(Number(id))]);
      setEmployee(emp);
      setHistory(hist);
      setFormSuccess(true);
      setAmount("");
      setFormError(null);
      
      setTimeout(() => {
        setFormSuccess(false);
        setShowForm(false);
      }, 2000);
    } catch (err: any) {
      setFormError(err.message || "Failed to update salary rate.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <p className="text-muted">Loading…</p>;
  if (!employee) return <p className="text-warn">Employee not found.</p>;

  return (
    <div className="max-w-2xl font-sans">
      <Link to="/employees" className="text-sm text-accent hover:underline">
        ← Back to employees
      </Link>

      <div className="mt-4 rounded-lg border border-border bg-surface p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold font-display text-ink">
              {employee.firstName} {employee.lastName}
            </h2>
            <p className="text-sm text-muted money mt-0.5">{employee.employeeCode}</p>
          </div>
          <StatusBadge status={employee.status} />
        </div>

        <dl className="grid grid-cols-2 gap-4 mt-6 text-sm">
          <div>
            <dt className="text-muted">Department</dt>
            <dd className="mt-0.5 text-ink font-medium">{employee.department}</dd>
          </div>
          <div>
            <dt className="text-muted">Country</dt>
            <dd className="mt-0.5 text-ink font-medium">{getCountryName(employee.country)}</dd>
          </div>
          <div>
            <dt className="text-muted">Email</dt>
            <dd className="mt-0.5 text-ink font-medium">{employee.email}</dd>
          </div>
          <div>
            <dt className="text-muted flex items-center justify-between">
              <span>Current salary</span>
              {employee.status === "active" && (
                <button
                  onClick={() => {
                    setShowForm(!showForm);
                    setFormError(null);
                    setFormSuccess(false);
                  }}
                  className="text-xs font-semibold text-accent hover:underline focus:outline-none"
                >
                  {showForm ? "Cancel" : "Update"}
                </button>
              )}
            </dt>
            <dd className="mt-0.5">
              <Money amount={employee.currentSalary} currencyCode={employee.salaryCurrency} timescale={timescale} />
            </dd>
          </div>
        </dl>
      </div>

      {showForm && (
        <div className="mt-6 rounded-lg border border-border bg-surface p-6 shadow-sm">
          <h3 className="text-sm font-semibold mb-4 font-display text-ink">Update salary rate</h3>
          <form onSubmit={handleFormSubmit} className="space-y-4 text-sm">
            {formError && (
              <div className="rounded-lg bg-warn-soft p-3 border border-warn text-xs text-warn font-medium">
                {formError}
              </div>
            )}
            {formSuccess && (
              <div className="rounded-lg bg-positive-soft p-3 border border-positive text-xs text-positive font-medium">
                Salary rate updated successfully!
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted mb-1">
                  AMOUNT ({timescale === "monthly" ? "MONTHLY" : "ANNUAL"})
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  disabled={isSaving || formSuccess}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
                  placeholder={timescale === "monthly" ? "e.g. 10000" : "e.g. 120000"}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1">
                  CURRENCY CODE
                </label>
                <input
                  type="text"
                  required
                  maxLength={3}
                  disabled={isSaving || formSuccess}
                  value={currencyCode}
                  onChange={(e) => setCurrencyCode(e.target.value.toUpperCase())}
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 outline-none focus:ring-2 focus:ring-accent uppercase disabled:opacity-50"
                  placeholder="e.g. USD"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1">
                  EFFECTIVE DATE
                </label>
                <input
                  type="date"
                  required
                  disabled={isSaving || formSuccess}
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
                />
              </div>
            </div>

            {currencyCode !== employee.currencyCode && (
              <div className="flex items-start gap-2 mt-2 bg-warn-soft p-3 rounded-lg border border-warn/30">
                <input
                  type="checkbox"
                  id="allowCurrencyChange"
                  disabled={isSaving || formSuccess}
                  checked={allowCurrencyChange}
                  onChange={(e) => setAllowCurrencyChange(e.target.checked)}
                  className="rounded border-border focus:ring-accent text-accent h-4 w-4 mt-0.5"
                />
                <label htmlFor="allowCurrencyChange" className="text-xs text-warn font-medium select-none">
                  Confirm change of employee payment currency from {employee.currencyCode} to {currencyCode}
                </label>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormError(null);
                  setFormSuccess(false);
                }}
                disabled={isSaving || formSuccess}
                className="rounded-lg border border-border px-4 py-2 hover:bg-bg text-xs font-semibold disabled:opacity-50"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={isSaving || formSuccess}
                className="rounded-lg bg-accent text-white px-4 py-2 hover:bg-accent/90 text-xs font-semibold disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mt-6 rounded-lg border border-border bg-surface p-6">
        <h3 className="text-sm font-semibold mb-4 text-ink">Salary history</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted border-b border-border">
              <th className="pb-2 font-medium">Effective date</th>
              <th className="pb-2 font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {history.map((record) => (
              <tr key={record.id} className="border-b border-border last:border-0 hover:bg-bg/20">
                <td className="py-2 money text-ink">{record.effectiveDate}</td>
                <td className="py-2">
                  <Money amount={record.amount} currencyCode={record.currencyCode} timescale={timescale} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
