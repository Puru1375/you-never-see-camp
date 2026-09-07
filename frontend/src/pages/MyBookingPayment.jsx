import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Loader2,
  ShieldCheck,
  WalletCards,
  XCircle,
} from "lucide-react";

import { getCurrentCustomer } from "../services/customerAuth";

import {
  getCustomerBooking,
  getCustomerPayment,
  createCustomerPaymentOrder,
  verifyCustomerPayment,
} from "../services/customerBookings";

import { loadRazorpayScript } from "../services/payment";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
};

const getValue = (object, ...keys) => {
  for (const key of keys) {
    if (
      object?.[key] !== undefined &&
      object?.[key] !== null
    ) {
      return object[key];
    }
  }

  return null;
};

export default function MyBookingPayment() {
  const { reference } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);

  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const loadPaymentPage = async () => {
      try {
        setLoading(true);
        setError("");

        const customer = await getCurrentCustomer();

        if (!customer?.success && !customer?.customer) {
          navigate("/my-bookings", { replace: true });
          return;
        }

        const bookingResponse =
          await getCustomerBooking(reference);

        const bookingDetail =
          bookingResponse?.booking ||
          bookingResponse?.data?.booking ||
          bookingResponse?.data;

        if (!bookingDetail) {
          throw new Error("Booking not found.");
        }

        const bookingData = {
          id: bookingDetail.id,
          booking_reference:
            bookingDetail.bookingReference,
          booking_date:
            bookingDetail.booking?.date ||
            bookingDetail.bookingDate ||
            bookingDetail.booking_date,
          status: bookingDetail.booking?.status,
          customer_name: bookingDetail.customer?.name,
          customer_email: bookingDetail.customer?.email,
          customer_phone: bookingDetail.customer?.phone,
          package_name: bookingDetail.package?.name,
          package_slug: bookingDetail.package?.slug,
          subtotal_amount: bookingDetail.pricing?.subtotal,
          tax_amount: bookingDetail.pricing?.tax,
          discount_amount: bookingDetail.pricing?.discount,
          total_amount: bookingDetail.pricing?.total,
        };

        setBooking(bookingData);

        const paymentResponse =
          await getCustomerPayment(reference);

        const paymentEnvelope =
          paymentResponse?.payment ||
          paymentResponse?.data?.payment ||
          paymentResponse?.data ||
          null;

        setPayment(
          paymentEnvelope?.payment ||
            paymentEnvelope ||
            null
        );
      } catch (err) {
        console.error(err);

        if (err?.status === 401) {
          navigate("/my-bookings", { replace: true });
          return;
        }

        setError(
          err?.message ||
            "Unable to load payment information."
        );
      } finally {
        setLoading(false);
      }
    };

    loadPaymentPage();
  }, [reference, navigate]);

  const handlePayment = async () => {
    if (!booking || paying) return;

    try {
      setPaying(true);
      setError("");
      setSuccessMessage("");

      /*
       * Booking must still be payment_pending.
       */
      if (booking.status !== "payment_pending") {
        setError(
          "This booking does not require payment."
        );
        return;
      }

      /*
       * Load Razorpay Checkout.
       */
      const razorpayLoaded = await loadRazorpayScript();

      if (!razorpayLoaded) {
        throw new Error(
          "Unable to load Razorpay. Please check your internet connection and try again."
        );
      }

      /*
       * Create/reuse Razorpay order.
       */
      const orderResponse =
        await createCustomerPaymentOrder(reference);

      const order =
        orderResponse?.order ||
        orderResponse?.data?.order ||
        orderResponse?.data;

      const orderId =
        order?.id || order?.orderId;

      if (!orderId) {
        throw new Error(
          "Unable to create payment order."
        );
      }

      /*
       * Customer data.
       */
      const customerName =
        getValue(
          booking,
          "customer_name",
          "customerName"
        ) || "Customer";

      const customerEmail =
        getValue(
          booking,
          "customer_email",
          "customerEmail"
        );

      const customerPhone =
        getValue(
          booking,
          "customer_phone",
          "customerPhone"
        );

      /*
       * Razorpay Checkout.
       */
      const options = {
        key:
          import.meta.env.VITE_RAZORPAY_KEY_ID,

        amount: order.amount,

        currency:
          order.currency || "INR",

        name: "You Never See Camp",

        description:
          `Booking ${reference}`,

        order_id: orderId,

        prefill: {
          name: customerName,
          email: customerEmail || "",
          contact: customerPhone || "",
        },

        notes: {
          booking_reference: reference,
        },

        theme: {
          color: "#173B2B",
        },

        handler: async function (response) {
          try {
            setSuccessMessage(
              "Payment received. Verifying your payment..."
            );

            /*
             * Frontend verification only.
             *
             * This does NOT confirm the booking.
             * The Razorpay webhook will do that.
             */
            await verifyCustomerPayment(reference, {
              razorpay_order_id:
                response.razorpay_order_id,

              razorpay_payment_id:
                response.razorpay_payment_id,

              razorpay_signature:
                response.razorpay_signature,
            });

            setSuccessMessage(
              "Payment verification submitted. Your booking will be confirmed after payment confirmation."
            );

            /*
             * Give webhook time to update backend,
             * then return to booking details.
             */
            setTimeout(() => {
              navigate(
                `/my-bookings/${reference}`,
                { replace: true }
              );
            }, 1500);
          } catch (verificationError) {
            console.error(
              "Payment verification error:",
              verificationError
            );

            setError(
              verificationError?.message ||
                "Payment verification failed. Please contact support if money was deducted."
            );
          } finally {
            setPaying(false);
          }
        },

        modal: {
          ondismiss: function () {
            setPaying(false);
          },
        },
      };

      const razorpay =
        new window.Razorpay(options);

      razorpay.on(
        "payment.failed",
        function (response) {
          console.error(
            "Razorpay payment failed:",
            response
          );

          setError(
            response?.error?.description ||
              "Payment failed. Please try again."
          );

          setPaying(false);
        }
      );

      razorpay.open();
    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
          "Unable to start payment."
      );

      setPaying(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-cream-50 flex items-center justify-center px-6">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-forest-900" />

          <p className="text-sm text-gray-600">
            Loading payment details...
          </p>
        </div>
      </main>
    );
  }

  if (error && !booking) {
    return (
      <main className="min-h-screen bg-cream-50 px-5 py-12">
        <div className="mx-auto max-w-3xl">
          <button
            onClick={() =>
              navigate("/my-bookings/list")
            }
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-600"
          >
            <ArrowLeft size={16} />
            My Bookings
          </button>

          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
            <XCircle className="mx-auto mb-4 text-red-500" />

            <h1 className="text-xl font-semibold text-gray-900">
              Payment unavailable
            </h1>

            <p className="mt-2 text-sm text-gray-600">
              {error}
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!booking) {
    return null;
  }

  const total = getValue(
    booking,
    "total_amount",
    "totalAmount",
    "total"
  );

  const bookingReference =
    booking.booking_reference ||
    booking.bookingReference ||
    reference;

  const paymentPending =
    booking.status === "payment_pending";

  return (
    <main className="min-h-screen bg-cream-50">
      {/* Header */}
      <section className="bg-forest-950 text-white">
        <div className="mx-auto max-w-4xl px-5 py-10 sm:px-6">
          <button
            onClick={() =>
              navigate(
                `/my-bookings/${reference}`
              )
            }
            className="mb-8 inline-flex items-center gap-2 text-sm text-white/70 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            Booking Details
          </button>

          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-400">
            Secure Payment
          </p>

          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
            Complete your booking
          </h1>

          <p className="mt-3 text-sm text-white/60">
            Booking reference:{" "}
            <span className="text-white">
              {bookingReference}
            </span>
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-4xl px-5 py-10 sm:px-6">
        {/* Error */}
        {error && (
          <div className="mb-6 flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <XCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <p>{error}</p>
          </div>
        )}

        {/* Success */}
        {successMessage && (
          <div className="mb-6 flex gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0"
            />

            <p>{successMessage}</p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Payment information */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-50 text-forest-900">
                  <CreditCard size={20} />
                </div>

                <div>
                  <h2 className="font-semibold text-gray-900">
                    Secure payment
                  </h2>

                  <p className="text-sm text-gray-500">
                    Pay securely using Razorpay
                  </p>
                </div>
              </div>

              <div className="mt-7 rounded-2xl bg-gray-50 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Amount payable
                  </span>

                  <span className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <SecurityItem
                  title="Secure checkout"
                  description="Your payment is processed securely by Razorpay."
                />

                <SecurityItem
                  title="Booking protection"
                  description="Your booking is confirmed only after successful payment confirmation."
                />

                <SecurityItem
                  title="Payment verification"
                  description="Every payment is verified by the server before confirmation."
                />
              </div>

              {paymentPending ? (
                <button
                  type="button"
                  onClick={handlePayment}
                  disabled={paying}
                  className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-fire-500 px-6 py-3.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {paying ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard size={18} />
                      Pay {formatCurrency(total)}
                    </>
                  )}
                </button>
              ) : (
                <div className="mt-8 flex items-center justify-center gap-2 rounded-full bg-green-50 px-6 py-3.5 text-sm font-semibold text-green-700">
                  <CheckCircle2 size={18} />
                  Payment is not pending
                </div>
              )}
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-black/5 bg-white p-5 text-sm text-gray-500 shadow-sm">
              <ShieldCheck
                size={18}
                className="mt-0.5 shrink-0 text-forest-900"
              />

              <p className="leading-6">
                Never share your OTP, card PIN, CVV or
                banking password with anyone. You Never
                See Camp will never ask for these details.
              </p>
            </div>
          </div>

          {/* Order summary */}
          <aside className="h-fit rounded-3xl border border-black/5 bg-white p-6 shadow-sm lg:sticky lg:top-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-50 text-forest-900">
                <WalletCards size={19} />
              </div>

              <h2 className="font-semibold text-gray-900">
                Booking summary
              </h2>
            </div>

            <div className="mt-6">
              <p className="text-xs uppercase tracking-wider text-gray-400">
                Package
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                {booking.package_name ||
                  booking.packageName ||
                  booking.package?.name ||
                  "Camping Package"}
              </p>
            </div>

            <div className="mt-6 space-y-4 border-t border-black/5 pt-5">
              <SummaryRow
                label="Booking reference"
                value={bookingReference}
              />

              <SummaryRow
                label="Date"
                value={
                  booking.booking_date ||
                  booking.bookingDate ||
                  "-"
                }
              />

              <SummaryRow
                label="Total"
                value={formatCurrency(total)}
                strong
              />
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function SecurityItem({
  title,
  description,
}) {
  return (
    <div className="flex gap-3">
      <CheckCircle2
        size={17}
        className="mt-0.5 shrink-0 text-forest-900"
      />

      <div>
        <p className="text-sm font-medium text-gray-900">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-gray-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  strong = false,
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-gray-500">
        {label}
      </span>

      <span
        className={`max-w-[190px] break-all text-right text-sm ${
          strong
            ? "font-semibold text-gray-900"
            : "font-medium text-gray-900"
        }`}
      >
        {value}
      </span>
    </div>
  );
}