'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import { alpha } from '@mui/material/styles';
import { ChevronLeft } from 'lucide-react';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Toast } from '@/components/shared/ui/Toast';
import { colors } from '@/lib/theme/mui/colors';
import {
  POS_CAPTAIN_COMPACT_PADDING,
  POS_CAPTAIN_LIST_BOTTOM_GAP,
} from '@/lib/helpers/posCaptainFlow';
import {
  buildPosSettleCheckoutPath,
  buildPosSettleSuccessPath,
  mapSettleDetailToReviewOrder,
  resolvePosOrderSettleBasePath,
} from '@/lib/helpers/posOrderHelpers';
import { useAppShellFooterTarget } from '@/lib/hooks/useAppShellFooterTarget';
import {
  getMockOrderSettleDetail,
  type OrderSettleDetail,
} from '@/lib/mocks/pos/usePosOrders.mocks';

import {
  OrderReviewSection,
  type OrderReviewData,
} from '@/features/pos/point-of-sale/components/OrderReviewSection';
import {
  PaymentMethodSection,
  type PaymentMethodId,
} from '@/features/pos/point-of-sale/components/PaymentMethodSection';
import {
  OrderSuccessReceipt,
  type ReceiptData,
} from '@/features/pos/point-of-sale/components/OrderSuccessReceipt';
import { CaptainWorkspaceSubheader } from '@/features/pos/point-of-sale/components/CaptainWorkspaceSubheader';
import { SplitPaymentDialog } from '@/features/pos/point-of-sale/components/SplitPaymentDialog';
import { useCaptainCompactLayout } from '@/lib/hooks/useCaptainCompactLayout';

export interface OrderSettleProps {
  orderId?: string;
  initialData?: OrderSettleDetail;
  initialStep?: 'review' | 'checkout' | 'success';
  onBack?: () => void;
  reviewOrderData?: OrderReviewData;
  onNewOrder?: () => void;
}

import { MOCK_CHECKOUT_ORDER_0039, MOCK_RECEIPT_0132 } from '@/lib/mocks/pos/usePosOrders.mocks';

const DEFAULT_REVIEW_ORDER: OrderReviewData = MOCK_CHECKOUT_ORDER_0039;

/**
 * OrderSettle Component
 *
 * Full-fidelity Checkout & Order Confirmation screen implementing:
 * 1. "Proceed to Checkout" (Image 1):
 *    - Left: OrderReviewSection (Order Review items list with food thumbnails,
 *      summary, discount code input with live coupon validation, breakdown, highlighted total banner)
 *    - Right: PaymentMethodSection (Payment options: Cash/Card/UPI/Part Payment/Sodexo,
 *      total, vibrant coral Confirm Payment button, customer notifications)
 * 2. "Confirm Order / Payment Successful" (Image 2):
 *    - OrderSuccessReceipt (Success checkmark, HOSPIXO receipt slip with dashed dividers,
 *      items list, financial totals, Print Receipt and New Order actions)
 */
export function OrderSettle({
  orderId,
  initialData,
  initialStep = 'checkout',
  onBack,
  reviewOrderData,
  onNewOrder,
}: Readonly<OrderSettleProps>) {
  const router = useRouter();
  const pathname = usePathname();
  const captainCompact = useCaptainCompactLayout();
  const footerTarget = useAppShellFooterTarget();

  const isSuccessRoute = Boolean(
    pathname?.endsWith('/success') || pathname?.endsWith('/payment-success'),
  );
  const isCheckoutRoute = Boolean(pathname?.endsWith('/checkout'));
  const [currentStep, setCurrentStep] = useState<'review' | 'checkout' | 'success'>(() => {
    if (isSuccessRoute || initialStep === 'success') return 'success';
    if (isCheckoutRoute || initialStep === 'checkout') return 'checkout';
    if (initialStep === 'review' || (captainCompact && orderId)) return 'review';
    return initialStep ?? 'checkout';
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodId>('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [splitPaymentOpen, setSplitPaymentOpen] = useState(false);

  // Initialize order review data from props or defaults matching user design
  const [reviewOrder, setReviewOrder] = useState<OrderReviewData>(() => {
    if (reviewOrderData) {
      return reviewOrderData;
    }
    if (initialData) {
      return mapSettleDetailToReviewOrder(initialData);
    }

    if (orderId && orderId !== '0039') {
      return mapSettleDetailToReviewOrder(getMockOrderSettleDetail(orderId));
    }

    return DEFAULT_REVIEW_ORDER;
  });

  // Coupon apply handler
  const handleApplyCoupon = (code: string) => {
    const uppercaseCode = code.toUpperCase();
    setAppliedCoupon(`${uppercaseCode} applied (10% extra discount)!`);
    setReviewOrder((prev) => {
      const extraDiscount = Math.round(prev.subtotal * 0.1);
      const updatedDiscounts = [
        ...prev.discounts,
        { id: `coupon-${Date.now()}`, label: `Coupon (${uppercaseCode})`, amount: extraDiscount },
      ];
      const newTotal = Math.max(0, prev.total - extraDiscount);
      return {
        ...prev,
        discounts: updatedDiscounts,
        total: newTotal,
      };
    });
    setToastMessage(`Coupon ${uppercaseCode} applied successfully!`);
  };

  // Back button handler
  const handleBack = () => {
    if (currentStep === 'success') {
      setCurrentStep('checkout');
      if (pathname && (pathname.endsWith('/success') || pathname.endsWith('/payment-success'))) {
        const clean = pathname.replace(/\/(success|payment-success)$/, '');
        router.replace(`${clean}/checkout`);
      }
      return;
    }

    if (currentStep === 'checkout' && pathname?.includes('/all-orders/')) {
      router.push(resolvePosOrderSettleBasePath(pathname));
      setCurrentStep('review');
      return;
    }

    if (onBack) {
      onBack();
      return;
    }

    if (pathname) {
      // /.../all-orders/139[/checkout] → all-orders list (never stay on settle).
      if (pathname.includes('/all-orders')) {
        const segments = pathname.split('/').filter(Boolean);
        const allOrdersIndex = segments.lastIndexOf('all-orders');
        const listUrl =
          allOrdersIndex >= 0
            ? `/${segments.slice(0, allOrdersIndex + 1).join('/')}`
            : '/pos/point-of-sale/all-orders';
        router.replace(listUrl);
        router.refresh();
        return;
      }
      const clean = pathname.replace(/\/(checkout|success|payment-success)$/, '');
      router.replace(clean || '/pos/point-of-sale/all-orders');
      return;
    }

    router.replace('/pos/point-of-sale/all-orders');
  };

  const completePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setSplitPaymentOpen(false);
      setCurrentStep('success');
      setToastMessage('Payment completed successfully!');

      if (pathname) {
        router.push(buildPosSettleSuccessPath(pathname));
      }
    }, 400);
  };

  const handleConfirmPayment = () => {
    if (captainCompact && selectedPaymentMethod === 'part_payment') {
      setSplitPaymentOpen(true);
      return;
    }
    completePayment();
  };

  // Print receipt handler
  const handlePrintReceipt = () => {
    setToastMessage('Receipt printed successfully!');
  };

  // New order trigger
  const handleNewOrder = () => {
    if (onNewOrder) {
      onNewOrder();
      return;
    }
    if (
      pathname &&
      (pathname.includes('/takeaway') ||
        pathname.includes('/dine-in') ||
        pathname.includes('/tables') ||
        pathname.includes('/order-menu') ||
        pathname.includes('/captain-flow'))
    ) {
      const parentUrl = pathname.replace(/\/(checkout|success|payment-success).*$/, '');
      router.push(parentUrl);
      return;
    }
    const target = pathname?.includes('branch-manager')
      ? '/branch-manager/pos/point-of-sale/dine-in'
      : '/pos/point-of-sale/dine-in';
    router.push(target);
  };

  const getMethodName = (id: PaymentMethodId) => {
    switch (id) {
      case 'cash':
        return 'Cash';
      case 'card':
        return 'Card';
      case 'upi':
        return 'UPI';
      case 'part_payment':
        return 'Split Payment';
      case 'sodexo':
        return 'Sodexo';
      default:
        return 'Cash';
    }
  };

  const couponTotal = reviewOrder.discounts.reduce((sum, d) => sum + d.amount, 0);

  const formatRs = (value: number) =>
    value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const goToCheckout = () => {
    if (pathname?.includes('/all-orders/') && orderId) {
      router.push(buildPosSettleCheckoutPath(pathname));
    }
    setCurrentStep('checkout');
  };

  const captainScrollSx = captainCompact
    ? {
        flex: 1,
        minHeight: 0,
        overflowY: 'auto' as const,
        pb: `${POS_CAPTAIN_LIST_BOTTOM_GAP}px`,
      }
    : undefined;

  const captainFooter =
    captainCompact && currentStep !== 'success' && footerTarget
      ? createPortal(
          <Box
            sx={{
              width: '100%',
              bgcolor: 'background.paper',
              borderTop: '1px solid',
              borderColor: 'divider',
              px: POS_CAPTAIN_COMPACT_PADDING,
              py: 1.25,
              minHeight: 64,
              display: 'flex',
              alignItems: 'center',
              boxSizing: 'border-box',
            }}
          >
            {currentStep === 'review' ? (
              <ActionButton
                variant="primary"
                fullWidth
                onClick={goToCheckout}
                sx={{
                  minHeight: 48,
                  borderRadius: '10px',
                  fontWeight: 700,
                  bgcolor: colors.primary.default,
                }}
              >
                Generate Receipt
              </ActionButton>
            ) : (
              <ButtonBase
                onClick={handleConfirmPayment}
                disabled={isProcessing}
                sx={{
                  width: '100%',
                  bgcolor: colors.danger.default,
                  color: colors.white.default,
                  py: 1.5,
                  borderRadius: '10px',
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  boxShadow: `0 4px 14px 0 ${alpha(colors.danger.default, 0.3)}`,
                  opacity: isProcessing ? 0.7 : 1,
                }}
              >
                {isProcessing
                  ? 'Processing Payment...'
                  : `Confirm Payment (Rs ${formatRs(reviewOrder.total)})`}
              </ButtonBase>
            )}
          </Box>,
          footerTarget,
        )
      : null;

  const receiptData: ReceiptData = {
    ...MOCK_RECEIPT_0132,
    orderNumber: reviewOrder.orderNumber,
    table: reviewOrder.table,
    itemCount: reviewOrder.items.reduce((sum, it) => sum + it.quantity, 0),
    items: reviewOrder.items.map((it) => ({
      name: it.name,
      quantity: it.quantity,
      price: it.unitPrice * it.quantity,
    })),
    subtotal: reviewOrder.subtotal,
    taxRate: reviewOrder.taxRate,
    taxAmount: reviewOrder.taxAmount,
    platformFee: reviewOrder.platformFee,
    grandTotal: reviewOrder.total,
    paymentMethod: getMethodName(selectedPaymentMethod),
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        overflow: 'hidden',
      }}
    >
      {captainCompact && currentStep !== 'success' ? (
        <Box sx={{ flexShrink: 0, mb: 1 }}>
          <CaptainWorkspaceSubheader
            title={
              currentStep === 'review' ? `Order ${reviewOrder.orderNumber}` : 'Checkout Payment'
            }
            subtitle={
              currentStep === 'review'
                ? `${reviewOrder.table} · Dine-In`
                : `${reviewOrder.orderNumber} · ${reviewOrder.table}`
            }
            onBack={handleBack}
          />
        </Box>
      ) : null}

      {/* ------------------------------------------------------------- */}
      {/* 1. Top Navigation Bar                                         */}
      {/* ------------------------------------------------------------- */}
      <Box
        sx={{
          flexShrink: 0,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          px: { xs: 2, sm: 3.5 },
          py: 1.75,
          display: captainCompact ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Back Chevron */}
          <ButtonBase
            onClick={handleBack}
            aria-label="Go back"
            sx={{
              p: 0.5,
              borderRadius: '8px',
              color: 'text.primary',
              transition: 'background-color 0.15s ease-in-out',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <ChevronLeft size={22} strokeWidth={2.5} />
          </ButtonBase>

          {/* Title & Reference */}
          <Stack spacing={0.25}>
            <Typography
              sx={{
                fontSize: { xs: '1.125rem', sm: '1.25rem' },
                fontWeight: 800,
                color: 'text.primary',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}
            >
              {currentStep === 'success'
                ? `Order ${reviewOrder.orderNumber} Completed`
                : `Order ${reviewOrder.orderNumber}`}
            </Typography>
            <Typography
              sx={{
                fontSize: '0.8125rem',
                fontWeight: 500,
                color: 'text.secondary',
                lineHeight: 1.2,
              }}
            >
              {reviewOrder.table} · {currentStep === 'success' ? 'Settled' : 'Review & Checkout'}
            </Typography>
          </Stack>
        </Box>
      </Box>

      {/* ------------------------------------------------------------- */}
      {/* 2. Main Body Content                                          */}
      {/* ------------------------------------------------------------- */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: currentStep === 'success' ? 'auto' : 'hidden',
          bgcolor:
            currentStep === 'success'
              ? (theme) =>
                  theme.palette.mode === 'dark'
                    ? colors.background.obsidian
                    : colors.background.default
              : 'background.default',
        }}
      >
        {currentStep === 'review' ? (
          <Box
            sx={{
              width: '100%',
              height: captainCompact ? '100%' : '100%',
              minHeight: 0,
              display: captainCompact ? 'flex' : 'block',
              flexDirection: 'column',
              mx: 'auto',
            }}
          >
            <Box sx={captainCompact ? captainScrollSx : { overflowY: 'auto', height: '100%' }}>
              {captainCompact ? (
                <OrderReviewSection
                  variant="captain"
                  order={reviewOrder}
                  onApplyCoupon={handleApplyCoupon}
                />
              ) : (
                <OrderReviewSection
                  order={reviewOrder}
                  onApplyCoupon={handleApplyCoupon}
                  appliedCouponMessage={appliedCoupon}
                  onProceed={goToCheckout}
                  proceedLabel="Generate Receipt"
                />
              )}
            </Box>
          </Box>
        ) : currentStep === 'checkout' ? (
          /* Step 1: Proceed to Checkout View (Image 1) */
          <Box
            sx={{
              maxWidth: captainCompact ? '100%' : 1360,
              width: '100%',
              height: '100%',
              minHeight: 0,
              mx: 'auto',
              pt: captainCompact ? 0 : { xs: 2, sm: 2.5, md: 3 },
              display: 'flex',
              flexDirection: captainCompact ? 'column' : { xs: 'column', md: 'row' },
              alignItems: 'stretch',
              gap: { xs: 2.5, md: 3 },
              overflow: captainCompact ? 'hidden' : 'hidden',
            }}
          >
            {/* Left Card: ORDER REVIEW (Independent Scroll) */}
            <Box
              sx={{
                flex: { xs: '1 1 auto', md: 1.35 },
                width: '100%',
                height: captainCompact ? 'auto' : '100%',
                minHeight: 0,
                overflowY: captainCompact ? 'visible' : 'auto',
                display: captainCompact ? 'none' : 'block',
                pr: { md: 1 },
                scrollbarWidth: 'thin',
                scrollbarColor: `${colors.border.default} transparent`,
                '&::-webkit-scrollbar': {
                  width: 6,
                },
                '&::-webkit-scrollbar-thumb': {
                  background: colors.border.default,
                  borderRadius: 3,
                },
              }}
            >
              <OrderReviewSection
                order={reviewOrder}
                onApplyCoupon={handleApplyCoupon}
                appliedCouponMessage={appliedCoupon}
              />
            </Box>

            {/* Right Card: PAYMENT METHOD (Independent Scroll) */}
            <Box
              sx={{
                flex: { xs: '1 1 auto', md: 1 },
                width: '100%',
                maxWidth: captainCompact ? '100%' : { md: 440 },
                height: captainCompact ? '100%' : '100%',
                minHeight: 0,
                overflowY: captainCompact ? 'hidden' : 'auto',
                display: captainCompact ? 'flex' : 'block',
                flexDirection: 'column',
                pr: { md: 1 },
                scrollbarWidth: 'thin',
                scrollbarColor: `${colors.border.default} transparent`,
                '&::-webkit-scrollbar': {
                  width: 6,
                },
                '&::-webkit-scrollbar-thumb': {
                  background: colors.border.default,
                  borderRadius: 3,
                },
              }}
            >
              <Box sx={captainCompact ? captainScrollSx : undefined}>
                <PaymentMethodSection
                  total={reviewOrder.total}
                  selectedMethod={selectedPaymentMethod}
                  onSelectMethod={setSelectedPaymentMethod}
                  onConfirmPayment={handleConfirmPayment}
                  isProcessing={isProcessing}
                  compact={captainCompact}
                  hideConfirmButton={captainCompact}
                  subtotal={reviewOrder.subtotal}
                  taxAmount={reviewOrder.taxAmount}
                  couponAmount={couponTotal}
                />
              </Box>
            </Box>
          </Box>
        ) : (
          /* Step 2: Confirm Order / Payment Successful View (Image 2) */
          <OrderSuccessReceipt
            receipt={receiptData}
            onPrintReceipt={handlePrintReceipt}
            onNewOrder={handleNewOrder}
          />
        )}
      </Box>
      {captainFooter}
      <SplitPaymentDialog
        open={splitPaymentOpen}
        total={reviewOrder.total}
        orderLabel={reviewOrder.orderNumber}
        tableLabel={reviewOrder.table}
        isProcessing={isProcessing}
        onClose={() => setSplitPaymentOpen(false)}
        onConfirm={() => completePayment()}
      />
      {/* Global Toast Feedback */}
      <Toast
        open={Boolean(toastMessage)}
        message={toastMessage ?? ''}
        onClose={() => setToastMessage(null)}
      />
    </Box>
  );
}

export type { OrderReviewData } from '@/features/pos/point-of-sale/components/OrderReviewSection';
