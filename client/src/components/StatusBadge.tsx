export function StatusBadge({ status }: { status: string }) {
  const isActive = status === "active";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        isActive ? "bg-positive-soft text-positive" : "bg-warn-soft text-warn"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}
