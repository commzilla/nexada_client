export function formatCurrency(amount: number, currency: string = "usd"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function intervalLabel(interval: string, count: number): string {
  if (interval === "one_time") return "One-time";
  const unit = interval === "month" ? "month" : "year";
  if (count === 1) return `Every ${unit}`;
  return `Every ${count} ${unit}s`;
}

export function statusColor(status: string): string {
  switch (status) {
    case "active":
    case "succeeded":
      return "bg-green-100 text-green-800";
    case "canceled":
    case "failed":
      return "bg-red-100 text-red-800";
    case "past_due":
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "incomplete":
    case "trialing":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
