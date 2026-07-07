import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getEmployee, getSalaryHistory } from "../api/employees";
import { EmployeeWithSalary, SalaryRecord } from "../types/employee";
import { Money } from "../components/Money";
import { StatusBadge } from "../components/StatusBadge";

export function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [employee, setEmployee] = useState<EmployeeWithSalary | null>(null);
  const [history, setHistory] = useState<SalaryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([getEmployee(Number(id)), getSalaryHistory(Number(id))])
      .then(([emp, hist]) => {
        setEmployee(emp);
        setHistory(hist);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-muted">Loading…</p>;
  if (!employee) return <p className="text-warn">Employee not found.</p>;

  return (
    <div className="max-w-2xl">
      <Link to="/employees" className="text-sm text-accent hover:underline">
        ← Back to employees
      </Link>

      <div className="mt-4 rounded-lg border border-border bg-surface p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              {employee.firstName} {employee.lastName}
            </h2>
            <p className="text-sm text-muted money mt-0.5">{employee.employeeCode}</p>
          </div>
          <StatusBadge status={employee.status} />
        </div>

        <dl className="grid grid-cols-2 gap-4 mt-6 text-sm">
          <div>
            <dt className="text-muted">Department</dt>
            <dd className="mt-0.5">{employee.department}</dd>
          </div>
          <div>
            <dt className="text-muted">Country</dt>
            <dd className="mt-0.5">{employee.country}</dd>
          </div>
          <div>
            <dt className="text-muted">Email</dt>
            <dd className="mt-0.5">{employee.email}</dd>
          </div>
          <div>
            <dt className="text-muted">Current salary</dt>
            <dd className="mt-0.5">
              <Money amount={employee.currentSalary} currencyCode={employee.salaryCurrency} />
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-6 rounded-lg border border-border bg-surface p-6">
        <h3 className="text-sm font-semibold mb-4">Salary history</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted border-b border-border">
              <th className="pb-2 font-medium">Effective date</th>
              <th className="pb-2 font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {history.map((record) => (
              <tr key={record.id} className="border-b border-border last:border-0">
                <td className="py-2 money">{record.effectiveDate}</td>
                <td className="py-2">
                  <Money amount={record.amount} currencyCode={record.currencyCode} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
