/** Read test charge INR from server or public env. Must be set explicitly (no dev default). */
function readTestChargeInrEnv(): string | undefined {
  const server = process.env.POS_RAZORPAY_TEST_CHARGE_INR;
  const pub = process.env.NEXT_PUBLIC_POS_RAZORPAY_TEST_CHARGE_INR;
  if (server !== undefined && server !== '') return server;
  if (pub !== undefined && pub !== '') return pub;
  return undefined;
}

/**
 * Optional manual Razorpay test charge (INR), e.g. `3` for ₹3.
 * Set `NEXT_PUBLIC_POS_RAZORPAY_TEST_CHARGE_INR=3` (and/or `POS_RAZORPAY_TEST_CHARGE_INR=3`).
 * When unset, checkout uses the full bill and gateway `order_id`.
 * Requires backend support for `amount_override_paise` on create when test charge is enabled.
 */
export function getPosRazorpayTestChargeInr(): number | null {
  const raw = readTestChargeInrEnv();
  if (raw === undefined || raw === '') return null;
  if (raw === '0' || raw === 'false') return null;
  const inr = Number(raw);
  return Number.isFinite(inr) && inr > 0 ? inr : null;
}

export function isPosRazorpayTestChargeActive(): boolean {
  return getPosRazorpayTestChargeInr() != null;
}

export function resolvePosRazorpayChargePaise(apiAmountPaise: number): number {
  const inr = getPosRazorpayTestChargeInr();
  if (inr == null) return apiAmountPaise;
  return Math.round(inr * 100);
}

/** Pay button / payment panel total when manual test charge is enabled. */
export function resolvePosCheckoutPaymentTotal(orderGrandTotal: number): number {
  const inr = getPosRazorpayTestChargeInr();
  if (inr == null) return orderGrandTotal;
  return inr;
}

/** POST body for create Razorpay order when manual test charge is enabled. */
export function buildPosRazorpayOrderCreateBody(): Record<string, number> | undefined {
  const inr = getPosRazorpayTestChargeInr();
  if (inr == null) return undefined;
  return { amount_override_paise: Math.round(inr * 100) };
}
