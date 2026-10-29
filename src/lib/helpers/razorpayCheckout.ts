const RAZORPAY_SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

export type RazorpayCheckoutSuccess = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

export type OpenRazorpayCheckoutArgs = {
  keyId: string;
  amount: number;
  currency: string;
  /** Omit for amount-only test checkout (e.g. fixed ₹3); do not pass with a mismatched amount. */
  orderId?: string;
  name?: string;
  description?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  onSuccess: (response: RazorpayCheckoutSuccess) => void;
  onDismiss?: () => void;
};

type RazorpayConstructor = new (options: Record<string, unknown>) => { open: () => void };

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

let scriptLoadPromise: Promise<void> | null = null;

function loadRazorpayScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Razorpay Checkout is only available in the browser'));
  }
  if (window.Razorpay) return Promise.resolve();
  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${RAZORPAY_SCRIPT_SRC}"]`,
    );
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay')), {
        once: true,
      });
      if (window.Razorpay) resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay Checkout'));
    document.body.appendChild(script);
  });

  return scriptLoadPromise;
}

/** Opens Razorpay Checkout modal using a gateway order from the POS API. */
export async function openRazorpayCheckout(
  args: Readonly<OpenRazorpayCheckoutArgs>,
): Promise<void> {
  await loadRazorpayScript();
  const Razorpay = window.Razorpay;
  if (!Razorpay) {
    throw new Error('Razorpay Checkout failed to initialize');
  }

  const options: Record<string, unknown> = {
    key: args.keyId,
    amount: args.amount,
    currency: args.currency,
    name: args.name ?? 'Hospixo',
    description: args.description,
    prefill: args.prefill,
    handler: (response: RazorpayCheckoutSuccess) => {
      args.onSuccess(response);
    },
    modal: {
      ondismiss: () => {
        args.onDismiss?.();
      },
    },
  };

  if (args.orderId?.trim()) {
    options.order_id = args.orderId;
  }

  const instance = new Razorpay(options);

  instance.open();
}
