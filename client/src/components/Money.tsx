interface MoneyProps {
  amount: number | null;
  currencyCode: string | null;
  timescale?: "annual" | "monthly";
  showSuffix?: boolean;
  precision?: number;
}

export function Money({
  amount,
  currencyCode,
  timescale = "annual",
  showSuffix = true,
  precision,
}: MoneyProps) {
  if (amount === null || currencyCode === null) {
    return <span className="text-muted text-sm">No salary on record</span>;
  }

  const finalAmount = timescale === "monthly" ? amount / 12 : amount;
  const suffix = showSuffix && timescale === "monthly" ? "/mo" : "";

  const hasCents = finalAmount % 1 !== 0;
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: precision !== undefined ? precision : 0,
    maximumFractionDigits: precision !== undefined ? precision : (hasCents ? 2 : 0),
  }).format(finalAmount);

  return (
    <span className="money text-sm">
      <span className="text-muted mr-1">{currencyCode}</span>
      {formatted}
      {suffix && <span className="text-xs text-muted font-normal ml-0.5">{suffix}</span>}
    </span>
  );
}
