export function createRateLimitCommand(key: string, now: Date, windowMs: number) {
  const cutoff = new Date(now.getTime() - windowMs);
  const expiresAt = new Date(now.getTime() + windowMs * 2);
  return {
    findAndModify: "RateLimit",
    query: { _id: key },
    update: [{ $set: {
      windowStart: { $cond: [{ $gte: ["$windowStart", { $date: cutoff.toISOString() }] }, "$windowStart", { $date: now.toISOString() }] },
      count: { $cond: [{ $gte: ["$windowStart", { $date: cutoff.toISOString() }] }, { $add: [{ $ifNull: ["$count", 0] }, 1] }, 1] },
      expiresAt: { $date: expiresAt.toISOString() },
    } }],
    upsert: true,
    new: true,
  };
}
