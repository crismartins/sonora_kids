export const FREE_LIMITS = {
  pec: 3,
  phrase: 3,
  routine: 6,
} as const;

export type QuotaKind = keyof typeof FREE_LIMITS;

export class QuotaError extends Error {
  constructor() {
    super("quota");
    this.name = "QuotaError";
  }
}

export function isQuotaError(error: unknown) {
  return error instanceof QuotaError;
}

/** An edit that stays the same size or shrinks is always allowed. */
export function canIncrease(kind: QuotaKind, current: number, next: number, isPremium: boolean) {
  if (isPremium || next <= current) return true;
  return next <= FREE_LIMITS[kind];
}
