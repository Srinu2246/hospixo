'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import { ChevronLeft } from 'lucide-react';

import { Toast } from '@/components/shared/ui/Toast';
import { colors } from '@/lib/theme/mui/colors';
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

export interface OrderSettleProps {
  orderId?: string;
  initialData?: OrderSettleDetail;
  initialStep?: 'checkout' | 'success';
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

  const isSuccessRoute = Boolean(
    pathname?.endsWith('/success') || pathname?.endsWith('/payment-success'),
  );
  const [currentStep, setCurrentStep] = useState<'checkout' | 'success'>(() => {
    if (isSuccessRoute) return 'success';
    return initialStep;
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodId>('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  // Initialize order review data from props or defaults matching user design
  const [reviewOrder, setReviewOrder] = useState<OrderReviewData>(() => {
    if (reviewOrderData) {
      return reviewOrderData;
    }
    if (initialData) {
      return {
        orderNumber: initialData.orderNumber,
        table: initialData.reference,
        items: initialData.items.map((it) => ({
          id: it.id,
          name: it.name,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          totalPrice: it.totalPrice,
          imageUrl:
            'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=160&q=80',
        })),
        subtotal: initialData.subtotal,
        discounts: DEFAULT_REVIEW_ORDER.discounts,
        platformFee: 25,
        serviceChargeRate: 0.02,
        serviceChargeAmount: Math.round(initialData.subtotal * 0.02 * 100) / 100,
        taxRate: initialData.taxRate,
        taxAmount: initialData.taxAmount,
        total: initialData.grandTotal,
      };
    }

    if (orderId && orderId !== '0039') {
      const mock = getMockOrderSettleDetail(orderId);
      return {
        orderNumber: mock.orderNumber,
        table: mock.reference,
        items: mock.items.map((it) => ({
          id: it.id,
          name: it.name,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          totalPrice: it.totalPrice,
          imageUrl:
            'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=160&q=80',
        })),
        subtotal: mock.subtotal,
        discounts: DEFAULT_REVIEW_ORDER.discounts,
        platformFee: 25,
        serviceChargeRate: 0.02,
        serviceChargeAmount: Math.round(mock.subtotal * 0.02 * 100) / 100,
        taxRate: mock.taxRate,
        taxAmount: mock.taxAmount,
        total: mock.grandTotal,
      };
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
        router.push(`${clean}/checkout`);
      }
      return;
    }

    if (onBack) {
      onBack();
      return;
    }

    if (pathname) {
      const clean = pathname.replace(/\/(checkout|success|payment-success)$/, '');
      router.push(clean || '/pos/point-of-sale/all-orders');
    } else {
      router.push('/pos/point-of-sale/all-orders');
    }
  };

  // Confirm payment trigger
  const handleConfirmPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setCurrentStep('success');
      setToastMessage('Payment completed successfully!');

      if (pathname) {
        const clean = pathname.replace(/\/+$/, '');
        const targetSuccess = clean.endsWith('/checkout')
          ? clean.replace(/\/checkout$/, '/success')
          : `${clean}/success`;
        router.push(targetSuccess);
      }
    }, 400);
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
        return 'Part Payment';
      case 'sodexo':
        return 'Sodexo';
      default:
        return 'Cash';
    }
  };

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
          display: 'flex',
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

        {/* View Switcher pills for testing and quick inspection */}
        <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' } }}>
          <ButtonBase
            onClick={() => setCurrentStep('checkout')}
            sx={{
              px: 2,
              py: 0.6,
              borderRadius: '8px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              bgcolor:
                currentStep === 'checkout'
                  ? 'primary.main'
                  : (theme) =>
                      theme.palette.mode === 'dark' ? 'action.hover' : colors.surface.muted,
              color: currentStep === 'checkout' ? colors.white.default : 'text.secondary',
              transition: 'all 0.15s ease',
            }}
          >
            Checkout View
          </ButtonBase>

          <ButtonBase
            onClick={() => setCurrentStep('success')}
            sx={{
              px: 2,
              py: 0.6,
              borderRadius: '8px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              bgcolor:
                currentStep === 'success'
                  ? 'primary.main'
                  : (theme) =>
                      theme.palette.mode === 'dark' ? 'action.hover' : colors.surface.muted,
              color: currentStep === 'success' ? colors.white.default : 'text.secondary',
              transition: 'all 0.15s ease',
            }}
          >
            Confirmed Receipt View
          </ButtonBase>
        </Stack>
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
        {currentStep === 'checkout' ? (
          /* Step 1: Proceed to Checkout View (Image 1) */
          <Box
            sx={{
              maxWidth: 1360,
              width: '100%',
              height: '100%',
              minHeight: 0,
              mx: 'auto',
              pt: { xs: 2, sm: 2.5, md: 3 },
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'stretch',
              gap: { xs: 2.5, md: 3 },
              overflow: 'hidden',
            }}
          >
            {/* Left Card: ORDER REVIEW (Independent Scroll) */}
            <Box
              sx={{
                flex: { xs: '1 1 auto', md: 1.35 },
                width: '100%',
                height: '100%',
                minHeight: 0,
                overflowY: 'auto',
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
                maxWidth: { md: 440 },
                height: '100%',
                minHeight: 0,
                overflowY: 'auto',
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
              <PaymentMethodSection
                total={reviewOrder.total}
                selectedMethod={selectedPaymentMethod}
                onSelectMethod={setSelectedPaymentMethod}
                onConfirmPayment={handleConfirmPayment}
                isProcessing={isProcessing}
              />
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
