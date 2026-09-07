import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Loader2,
  MapPin,
  Users,
  WalletCards,
  XCircle,
} from "lucide-react";

import { getCurrentCustomer } from "../services/customerAuth";
import {
  getCustomerBooking,
  getCustomerPayment,
} from "../services/customerBookings";

const formatDate = (date) => {
  if (!date) return "-";

  const dateValue = String(date).slice(0, 10);

  return new Date(`${dateValue}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
};

const getStatus = (status) => {
  switch (status) {
    case "confirmed":
      return {
        label: "Confirmed",
        className: "bg-green-100 text-green-700",
        icon: CheckCircle2,
      };

    case "payment_pending":
      return {
        label: "Payment Pending",
        className: "bg-amber-100 text-amber-700",
        icon: Clock3,
      };

    case "cancelled":
      return {
        label: "Cancelled",
        className: "bg-red-100 text-red-700",
        icon: XCircle,
      };

    case "completed":
      return {
        label: "Completed",
        className: "bg-blue-100 text-blue-700",
        icon: CheckCircle2,
      };

    case "expired":
      return {
        label: "Expired",
        className: "bg-gray-100 text-gray-600",
        icon: Clock3,
      };

    default:
      return {
        label: status || "Pending",
        className: "bg-gray-100 text-gray-700",
        icon: Clock3,
      };
  }
};

export default function MyBookingDetails() {
  const { reference } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);

  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBooking = async () => {
      try {
        setLoading(true);
        setError("");

        const customer = await getCurrentCustomer();

        if (!customer?.success && !customer?.customer) {
          navigate("/my-bookings", { replace: true });
          return;
        }

        const response = await getCustomerBooking(reference);

        const detail =
          response?.booking ||
          response?.data?.booking ||
          response?.data;

        const bookingData = detail
          ? {
              id: detail.id,
              booking_reference:
                detail.bookingReference,
              booking_date:
                detail.booking?.date ||
                detail.bookingDate ||
                detail.booking_date,
              adults: detail.booking?.guests?.adults,
              children: detail.booking?.guests?.children,
              infants: detail.booking?.guests?.infants,
              status: detail.booking?.status,
              special_requests:
                detail.booking?.specialRequests,
              created_at: detail.booking?.createdAt,
              updated_at: detail.booking?.updatedAt,
              customer_name: detail.customer?.name,
              customer_email: detail.customer?.email,
              customer_phone: detail.customer?.phone,
              package_name: detail.package?.name,
              package_slug: detail.package?.slug,
              package_description:
                detail.package?.description,
              max_guests: detail.package?.maxGuests,
              check_in_time:
                detail.package?.checkInTime,
              check_out_time:
                detail.package?.checkOutTime,
              subtotal_amount: detail.pricing?.subtotal,
              tax_amount: detail.pricing?.tax,
              discount_amount: detail.pricing?.discount,
              total_amount: detail.pricing?.total,
            }
          : null;

        if (!bookingData) {
          throw new Error("Booking not found");
        }

        setBooking(bookingData);

        const latestPayment = detail.payments?.[0];

        if (latestPayment) {
          setPayment({
            ...latestPayment,
            provider_order_id: latestPayment.orderId,
            provider_payment_id: latestPayment.paymentId,
          });
        }

        // Payment information
        if (bookingData.status === "payment_pending") {
          try {
            const paymentResponse =
              await getCustomerPayment(reference);

            setPayment(
              paymentResponse?.payment ||
                paymentResponse?.data?.payment ||
                paymentResponse?.data ||
                null
            );
          } catch (paymentError) {
            console.error("Payment information error:", paymentError);
          }
        }
      } catch (err) {
        console.error(err);

        if (err?.status === 401) {
          navigate("/my-bookings", { replace: true });
          return;
        }

        setError(
          err?.message ||
            "Unable to load this booking."
        );
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [reference, navigate]);

  const handlePayment = async () => {
    if (!booking) return;

    setPaymentLoading(true);

    try {
      navigate(
        `/my-bookings/${booking.booking_reference}/payment`
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-cream-50 flex items-center justify-center px-6">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-forest-900" />

          <p className="text-sm text-gray-600">
            Loading booking details...
          </p>
        </div>
      </main>
    );
  }

  if (error || !booking) {
    return (
      <main className="min-h-screen bg-cream-50 px-5 py-12">
        <div className="mx-auto max-w-3xl">
          <button
            onClick={() => navigate("/my-bookings/list")}
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={16} />
            Back to My Bookings
          </button>

          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
            <XCircle className="mx-auto mb-4 text-red-500" />

            <h1 className="text-xl font-semibold text-gray-900">
              Booking unavailable
            </h1>

            <p className="mt-2 text-sm text-gray-600">
              {error || "We couldn't find this booking."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const status = getStatus(booking.status);
  const StatusIcon = status.icon;

  const packageName =
    booking.package_name ||
    booking.packageName ||
    booking.package?.name ||
    "Camping Package";

  const adults = Number(booking.adults || 0);
  const children = Number(booking.children || 0);
  const infants = Number(booking.infants || 0);

  const totalGuests =
    booking.total_guests ||
    booking.totalGuests ||
    adults + children + infants;

  const subtotal =
    booking.subtotal_amount ??
    booking.subtotalAmount ??
    booking.subtotal ??
    0;

  const tax =
    booking.tax_amount ??
    booking.taxAmount ??
    booking.tax ??
    0;

  const discount =
    booking.discount_amount ??
    booking.discountAmount ??
    booking.discount ??
    0;

  const total =
    booking.total_amount ??
    booking.totalAmount ??
    booking.total ??
    0;

  const isPaymentPending =
    booking.status === "payment_pending";

  const canCancel =
    booking.status === "confirmed";

  return (
    <main className="min-h-screen bg-cream-50">
      {/* Header */}
      <section className="bg-forest-950 text-white">
        <div className="mx-auto max-w-5xl px-5 py-10 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate("/my-bookings/list")}
            className="mb-8 inline-flex items-center gap-2 text-sm text-white/70 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            My Bookings
          </button>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-400">
                Booking Details
              </p>

              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                {packageName}
              </h1>

              <p className="mt-3 text-sm text-white/60">
                Booking reference:{" "}
                <span className="font-medium text-white">
                  {booking.booking_reference ||
                    booking.bookingReference ||
                    reference}
                </span>
              </p>
            </div>

            <span
              className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${status.className}`}
            >
              <StatusIcon size={16} />
              {status.label}
            </span>
          </div>
        </div>
      </section>

      {/* Main */}
      <section className="mx-auto max-w-5xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Left */}
          <div className="space-y-6">
            {/* Stay details */}
            <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:p-7">
              <h2 className="text-lg font-semibold text-gray-900">
                Your stay
              </h2>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <InfoItem
                  icon={CalendarDays}
                  label="Booking date"
                  value={formatDate(
                    booking.booking_date ||
                      booking.bookingDate
                  )}
                />

                <InfoItem
                  icon={MapPin}
                  label="Location"
                  value="7 Hills of Jungle"
                />

                <InfoItem
                  icon={Clock3}
                  label="Check-in"
                  value={
                    booking.check_in_time ||
                    booking.checkInTime ||
                    "-"
                  }
                />

                <InfoItem
                  icon={Clock3}
                  label="Check-out"
                  value={
                    booking.check_out_time ||
                    booking.checkOutTime ||
                    "-"
                  }
                />
              </div>
            </div>

            {/* Guests */}
            <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-50 text-forest-900">
                  <Users size={19} />
                </div>

                <div>
                  <h2 className="font-semibold text-gray-900">
                    Guests
                  </h2>

                  <p className="text-xs text-gray-500">
                    {totalGuests} total guests
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <GuestItem
                  label="Adults"
                  value={adults}
                />

                <GuestItem
                  label="Children"
                  value={children}
                />

                <GuestItem
                  label="Infants"
                  value={infants}
                />
              </div>
            </div>

            {/* Customer */}
            <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:p-7">
              <h2 className="text-lg font-semibold text-gray-900">
                Guest information
              </h2>

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between gap-5">
                  <span className="text-gray-500">
                    Name
                  </span>

                  <span className="font-medium text-gray-900">
                    {booking.customer_name ||
                      booking.customerName ||
                      "-"}
                  </span>
                </div>

                <div className="flex justify-between gap-5">
                  <span className="text-gray-500">
                    Email
                  </span>

                  <span className="break-all text-right font-medium text-gray-900">
                    {booking.customer_email ||
                      booking.customerEmail ||
                      "-"}
                  </span>
                </div>

                <div className="flex justify-between gap-5">
                  <span className="text-gray-500">
                    Phone
                  </span>

                  <span className="font-medium text-gray-900">
                    {booking.customer_phone ||
                      booking.customerPhone ||
                      "-"}
                  </span>
                </div>
              </div>
            </div>

            {/* Special requests */}
            {(booking.special_requests ||
              booking.specialRequests) && (
              <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:p-7">
                <h2 className="text-lg font-semibold text-gray-900">
                  Special requests
                </h2>

                <p className="mt-4 text-sm leading-6 text-gray-600">
                  {booking.special_requests ||
                    booking.specialRequests}
                </p>
              </div>
            )}
          </div>

          {/* Right */}
          <aside className="h-fit space-y-5 lg:sticky lg:top-6">
            {/* Price */}
            <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-50 text-forest-900">
                  <WalletCards size={19} />
                </div>

                <h2 className="font-semibold text-gray-900">
                  Price summary
                </h2>
              </div>

              <div className="mt-6 space-y-3 text-sm">
                <PriceRow
                  label="Subtotal"
                  value={formatCurrency(subtotal)}
                />

                {Number(discount) > 0 && (
                  <PriceRow
                    label="Discount"
                    value={`-${formatCurrency(discount)}`}
                  />
                )}

                <PriceRow
                  label="GST / Tax"
                  value={formatCurrency(tax)}
                />

                <div className="border-t border-black/5 pt-4">
                  <PriceRow
                    label="Total"
                    value={formatCurrency(total)}
                    strong
                  />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <CreditCard
                  size={19}
                  className="text-forest-900"
                />

                <h2 className="font-semibold text-gray-900">
                  Payment
                </h2>
              </div>

              <div className="mt-5 rounded-2xl bg-gray-50 p-4">
                <p className="text-xs text-gray-500">
                  Payment status
                </p>

                <p className="mt-1 text-sm font-semibold capitalize text-gray-900">
                  {payment?.status ||
                    (isPaymentPending
                      ? "Pending"
                      : "Captured")}
                </p>

                {payment?.provider_order_id && (
                  <p className="mt-2 break-all text-xs text-gray-400">
                    Order: {payment.provider_order_id}
                  </p>
                )}
              </div>

              {isPaymentPending && (
                <button
                  type="button"
                  disabled={paymentLoading}
                  onClick={handlePayment}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-fire-500 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {paymentLoading ? (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  ) : (
                    <CreditCard size={17} />
                  )}

                  Pay Now
                </button>
              )}
            </div>

            {/* Cancellation */}
            {canCancel && (
              <div className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm">
                <h2 className="font-semibold text-gray-900">
                  Need to cancel?
                </h2>

                <p className="mt-2 text-sm leading-5 text-gray-500">
                  Cancellation and refund eligibility will
                  be calculated using the current cancellation
                  policy.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/my-bookings/${reference}/cancel`
                    )
                  }
                  className="mt-4 w-full rounded-full border border-red-200 px-5 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  Cancel Booking
                </button>
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest-50 text-forest-900">
        <Icon size={18} />
      </div>

      <div>
        <p className="text-xs text-gray-400">
          {label}
        </p>

        <p className="mt-1 text-sm font-medium text-gray-900">
          {value}
        </p>
      </div>
    </div>
  );
}

function GuestItem({ label, value }) {
  return (
    <div className="rounded-2xl bg-gray-50 p-4">
      <p className="text-xs text-gray-400">
        {label}
      </p>

      <p className="mt-1 text-lg font-semibold text-gray-900">
        {value}
      </p>
    </div>
  );
}

function PriceRow({ label, value, strong = false }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span
        className={
          strong
            ? "font-semibold text-gray-900"
            : "text-gray-500"
        }
      >
        {label}
      </span>

      <span
        className={
          strong
            ? "text-lg font-semibold text-gray-900"
            : "font-medium text-gray-900"
        }
      >
        {value}
      </span>
    </div>
  );
}