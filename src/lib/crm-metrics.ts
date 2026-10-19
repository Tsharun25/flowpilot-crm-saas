export const CRM_CURRENCY = "USD";
export const MAX_DEAL_VALUE_CENTS = BigInt(100_000_000_000);

type StoredDealValue = {
  value: number;
  valueCents?: bigint | null;
};

export function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: CRM_CURRENCY,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function getDealValueCents(deal: StoredDealValue) {
  return deal.valueCents ?? BigInt(deal.value) * BigInt(100);
}

export function centsToDollars(cents: bigint) {
  return Number(cents) / 100;
}

export function getDealValueInput(deal: StoredDealValue) {
  const cents = getDealValueCents(deal);
  const wholeDollars = cents / BigInt(100);
  const fractionalCents = (cents % BigInt(100)).toString().padStart(2, "0");
  return `${wholeDollars}.${fractionalCents}`;
}

type Deal = StoredDealValue & {
  status: "LEAD" | "CONTACTED" | "WON" | "LOST";
  wonAt: Date | null;
};

export function calculateCrmMetrics(clients: Deal[], now = new Date()) {
  const year = now.getUTCFullYear();
  const start = new Date(Date.UTC(year, 0, 1));
  const end = new Date(Date.UTC(year + 1, 0, 1));
  const sumCents = (deals: Deal[]) =>
    deals.reduce(
      (total, client) => total + getDealValueCents(client),
      BigInt(0),
    );
  const openPipelineCents = sumCents(
    clients.filter(
      (client) => client.status === "LEAD" || client.status === "CONTACTED",
    ),
  );
  const wonDealValueCents = sumCents(
    clients.filter((client) => client.status === "WON"),
  );
  const lostDealValueCents = sumCents(
    clients.filter((client) => client.status === "LOST"),
  );
  const monthlyWonCents = Array.from({ length: 12 }, () => BigInt(0));

  for (const client of clients) {
    if (
      client.status === "WON" &&
      client.wonAt &&
      client.wonAt >= start &&
      client.wonAt < end
    ) {
      monthlyWonCents[client.wonAt.getUTCMonth()] += getDealValueCents(client);
    }
  }

  const monthlyWon = monthlyWonCents.map((wonValueCents, month) => ({
    month: new Intl.DateTimeFormat("en-US", {
      month: "short",
      timeZone: "UTC",
    }).format(new Date(Date.UTC(year, month, 1))),
    wonValue: centsToDollars(wonValueCents),
  }));
  const currentMonth = now.getUTCMonth();
  const current = monthlyWonCents[currentMonth];
  const previous =
    currentMonth > 0 ? monthlyWonCents[currentMonth - 1] : BigInt(0);
  const growth =
    previous === BigInt(0)
      ? null
      : (Number(current - previous) / Number(previous)) * 100;

  return {
    currency: CRM_CURRENCY,
    year,
    openPipeline: centsToDollars(openPipelineCents),
    wonDealValue: centsToDollars(wonDealValueCents),
    lostDealValue: centsToDollars(lostDealValueCents),
    monthlyWon,
    growth,
    hasWonData: monthlyWonCents.some((value) => value > BigInt(0)),
  };
}
