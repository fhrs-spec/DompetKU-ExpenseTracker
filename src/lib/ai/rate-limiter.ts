import { isAppOwner } from "@/lib/auth/admin";

export type AIActionType = "parse" | "health_audit" | "scan_receipt";

export interface RateLimitResult {
  allowed: boolean;
  isOwner: boolean;
  remaining: number;
  limit: number;
  error?: string;
}

export const DAILY_LIMITS: Record<AIActionType, number> = {
  parse: 15,
  scan_receipt: 10,
  health_audit: 3,
};

// In-memory persistent daily usage store
const memoryUsageStore = new Map<string, number>();

function getTodayKey(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/**
 * Validates AI request quota.
 * Web App Owner (mfharas5@gmail.com) enjoys unlimited bypass.
 * Other visitors/users are subject to reasonable daily rate limits.
 */
export function checkAIRateLimit(
  userId: string,
  userEmail: string | undefined,
  action: AIActionType
): RateLimitResult {
  // Owner bypass: 100% Unlimited
  if (isAppOwner(userEmail)) {
    return {
      allowed: true,
      isOwner: true,
      remaining: 999999,
      limit: 999999,
    };
  }

  const today = getTodayKey();
  const storeKey = `${userId}:${action}:${today}`;
  const limit = DAILY_LIMITS[action];

  const currentCount = memoryUsageStore.get(storeKey) || 0;

  if (currentCount >= limit) {
    const actionLabel =
      action === "parse"
        ? "pencatatan transaksi AI"
        : action === "scan_receipt"
        ? "pemindaian struk belanja AI"
        : "audit kesehatan keuangan AI";

    return {
      allowed: false,
      isOwner: false,
      remaining: 0,
      limit,
      error: `Batas harian ${actionLabel} Anda telah tercapai (${limit}/${limit} hari ini). Penggunaan tanpa batas hanya tersedia untuk akun Owner/Admin. Silakan coba lagi besok.`,
    };
  }

  // Increment usage count
  memoryUsageStore.set(storeKey, currentCount + 1);

  return {
    allowed: true,
    isOwner: false,
    remaining: Math.max(0, limit - (currentCount + 1)),
    limit,
  };
}
