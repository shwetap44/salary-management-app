interface MoneyProps {
  amount: number | null;
  currencyCode: string | null;
}

export function Money({ amount, currencyCode }: MoneyProps) {
  if (amount === null || currencyCode === null) {
    return <span className="text-muted text-sm">No salary on record</span>;
  }

  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  return (
    <span className="money text-sm">
      <span className="text-muted mr-1">{currencyCode}</span>
      {formatted}
    </span>
  );
}
