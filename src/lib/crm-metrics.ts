export const CRM_CURRENCY = "USD";

export function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: CRM_CURRENCY, maximumFractionDigits: 0 }).format(value);
}

type Deal = { value: number; status: "LEAD" | "CONTACTED" | "WON" | "LOST"; wonAt: Date | null };

export function calculateCrmMetrics(clients: Deal[], now = new Date()) {
  const year = now.getUTCFullYear();
  const start = new Date(Date.UTC(year, 0, 1));
  const end = new Date(Date.UTC(year + 1, 0, 1));
  const openPipeline = clients.filter((client) => client.status === "LEAD" || client.status === "CONTACTED").reduce((total, client) => total + client.value, 0);
  const wonDealValue = clients.filter((client) => client.status === "WON").reduce((total, client) => total + client.value, 0);
  const lostDealValue = clients.filter((client) => client.status === "LOST").reduce((total, client) => total + client.value, 0);
  const monthlyWon = Array.from({ length: 12 }, (_, month) => ({ month: new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" }).format(new Date(Date.UTC(year, month, 1))), wonValue: 0 }));
  for (const client of clients) {
    if (client.status === "WON" && client.wonAt && client.wonAt >= start && client.wonAt < end) monthlyWon[client.wonAt.getUTCMonth()].wonValue += client.value;
  }
  const currentMonth = now.getUTCMonth();
  const current = monthlyWon[currentMonth].wonValue;
  const previous = currentMonth > 0 ? monthlyWon[currentMonth - 1].wonValue : 0;
  const growth = previous === 0 ? null : ((current - previous) / previous) * 100;
  return { currency: CRM_CURRENCY, year, openPipeline, wonDealValue, lostDealValue, monthlyWon, growth, hasWonData: monthlyWon.some((item) => item.wonValue > 0) };
}
