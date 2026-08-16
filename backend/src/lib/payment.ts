// MVP: single fixed platform commission, no real payment gateway wired up yet
// (see docs/concept/dev.md "Nyitott kérdések" — fix jutalék vs. előfizetés).
export const COMMISSION_RATE = 0.15;

export function commissionFor(amount: number): number {
  return Math.round(amount * COMMISSION_RATE * 100) / 100;
}
