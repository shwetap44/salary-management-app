import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listEmployees } from "../api/employees";
import { EmployeeWithSalary } from "../types/employee";
import { Money } from "../components/Money";
import { StatusBadge } from "../components/StatusBadge";

const DEPARTMENTS = [
  "Engineering", "Sales", "Marketing", "Human Resources", "Finance",
  "Operations", "Product", "Customer Support", "Legal", "IT",
];
const COUNTRIES = ["IN", "US", "GB", "DE", "AU", "CA", "SG", "AE"];
const PAGE_SIZE = 20;

export function EmployeeListPage() {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [country, setCountry] = useState("");
  const [page, setPage] = useState(1);

  const [items, setItems] = useState<EmployeeWithSalary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reset to page 1 whenever a filter changes, so a stale page number from
  // a wider result set can't silently produce an empty page.
  useEffect(() => {
    setPage(1);
  }, [search, department, country]);

  useEffect(() => {
    // Debounce the search box specifically — filters (dropdowns) apply
    // immediately since they don't fire on every keystroke.
    const handle = setTimeout(() => {
      setLoading(true);
      setError(null);

      listEmployees({ search, department, country, page, limit: PAGE_SIZE })
        .then((result) => {
          setItems(result.items);
          setTotal(result.total);
        })
        .catch(() => setError("Couldn't load employees. Is the API running?"))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(handle);
  }, [search, department, country, page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Employees</h2>
          <p className="text-sm text-muted mt-1">
            {total.toLocaleString()} people across the organization
          </p>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
        />
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="">All departments</option>
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="">All countries</option>
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="rounded-lg border border-border bg-surface overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg text-left text-muted">
              <th className="px-4 py-3 font-medium">Employee</th>
              <th className="px-4 py-3 font-medium">Department</th>
              <th className="px-4 py-3 font-medium">Country</th>
              <th className="px-4 py-3 font-medium">Current salary</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">
                  Loading employees…
                </td>
              </tr>
            )}
            {!loading && error && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-warn">
                  {error}
                </td>
              </tr>
            )}
            {!loading && !error && items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">
                  No employees match these filters.
                </td>
              </tr>
            )}
            {!loading &&
              !error &&
              items.map((employee) => (
                <tr key={employee.id} className="border-b border-border last:border-0 hover:bg-bg">
                  <td className="px-4 py-3">
                    <Link
                      to={`/employees/${employee.id}`}
                      className="font-medium text-ink hover:text-accent"
                    >
                      {employee.firstName} {employee.lastName}
                    </Link>
                    <div className="text-xs text-muted mt-0.5 money">{employee.employeeCode}</div>
                  </td>
                  <td className="px-4 py-3">{employee.department}</td>
                  <td className="px-4 py-3">{employee.country}</td>
                  <td className="px-4 py-3">
                    <Money amount={employee.currentSalary} currencyCode={employee.salaryCurrency} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={employee.status} />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 text-sm">
        <span className="text-muted">
          Page {page} of {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-md border border-border px-3 py-1.5 disabled:opacity-40 hover:bg-bg"
          >
            Previous
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-md border border-border px-3 py-1.5 disabled:opacity-40 hover:bg-bg"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
