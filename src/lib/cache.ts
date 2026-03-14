import {redis} from "@/lib/redis";

const DEFAULT_TTL_SECONDS = 60;

export async function getCache<T>(key: string): Promise<T | null> {
  const value = await redis.get(key);

  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export async function setCache(
  key: string,
  value: unknown,
  ttlSeconds: number = DEFAULT_TTL_SECONDS
) {
  await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
}

export async function deleteCache(key: string) {
  await redis.del(key);
}

export async function deleteCacheByPattern(pattern: string) {
  let cursor = "0";

  do {
    const result = await redis.scan(cursor, "MATCH", pattern, "COUNT", 100);
    cursor = result[0];
    const keys = result[1];

    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } while (cursor !== "0");
}

/* -------------------- Receipts -------------------- */

export function buildReceiptListCacheKey() {
  return "receipts:list";
}

export function buildReceiptDetailCacheKey(id: string) {
  return `receipts:detail:${id}`;
}

export async function invalidateReceiptCache(id?: string) {
  const keysToDelete: string[] = [buildReceiptListCacheKey()];

  if (id) {
    keysToDelete.push(buildReceiptDetailCacheKey(id));
  }

  if (keysToDelete.length > 0) {
    await redis.del(...keysToDelete);
  }
}

/* -------------------- Deliveries -------------------- */

export function buildDeliveryListCacheKey() {
  return "deliveries:list";
}

export function buildDeliveryDetailCacheKey(id: string) {
  return `deliveries:detail:${id}`;
}

export async function invalidateDeliveryCache(id?: string) {
  const keysToDelete: string[] = [buildDeliveryListCacheKey()];

  if (id) {
    keysToDelete.push(buildDeliveryDetailCacheKey(id));
  }

  if (keysToDelete.length > 0) {
    await redis.del(...keysToDelete);
  }
}

/* -------------------- Transfers -------------------- */

export function buildTransferListCacheKey() {
  return "transfers:list";
}

export function buildTransferDetailCacheKey(id: string) {
  return `transfers:detail:${id}`;
}

export async function invalidateTransferCache(id?: string) {
  const keysToDelete: string[] = [buildTransferListCacheKey()];

  if (id) {
    keysToDelete.push(buildTransferDetailCacheKey(id));
  }

  if (keysToDelete.length > 0) {
    await redis.del(...keysToDelete);
  }
}

/* -------------------- Adjustments -------------------- */

export function buildAdjustmentListCacheKey() {
  return "adjustments:list";
}

export function buildAdjustmentDetailCacheKey(id: string) {
  return `adjustments:detail:${id}`;
}

export async function invalidateAdjustmentCache(id?: string) {
  const keysToDelete: string[] = [buildAdjustmentListCacheKey()];

  if (id) {
    keysToDelete.push(buildAdjustmentDetailCacheKey(id));
  }

  if (keysToDelete.length > 0) {
    await redis.del(...keysToDelete);
  }
}

/* -------------------- Ledger -------------------- */

export async function invalidateLedgerCache() {
  await deleteCacheByPattern("ledger:*");
}

/* -------------------- Dashboard -------------------- */

export function buildDashboardKpisCacheKey() {
  return "dashboard:kpis";
}

export function buildDashboardActivitiesCacheKey(limit: number) {
  return `dashboard:activities:${limit}`;
}

export async function invalidateDashboardCache() {
  await deleteCacheByPattern("dashboard:*");
}