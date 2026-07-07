export function InsightsPage() {
  return (
    <div>
      <h2 className="text-2xl font-semibold">Insights</h2>
      <p className="text-sm text-muted mt-1 max-w-md">
        KPI cards and salary distribution charts will live here, backed by the
        <code className="money mx-1">/api/insights/*</code>
        endpoints described in <code className="money">docs/architecture.md</code>.
        Those endpoints haven't been built on the backend yet — this page is a
        placeholder until they exist.
      </p>
    </div>
  );
}
