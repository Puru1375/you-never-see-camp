import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  TriangleAlert,
  WalletCards,
  XCircle,
} from "lucide-react";

import { getCurrentCustomer } from "../services/customerAuth";

import {
  getCustomerBooking,
  getCancellationPreview,
  cancelCustomerBooking,
} from "../services/customerBookings";

const formatDate = (date) => {
  if (!date) return "-";

  const dateValue = String(date).slice(0, 10);

  return new Date(`${dateValue}T00:00:00`).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );
};

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

export default function MyBookingCancel() {
  const { reference } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [preview, setPreview] = useState(null);

  const [reason, setReason] = useState("");

  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadCancellationData = async () => {
      try {
        setLoading(true);
        setError("");

        const customer = await getCurrentCustomer();

        if (!customer?.success && !customer?.customer) {
          navigate("/my-bookings", {
            replace: true,
          });
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
          package_name:
            bookingDetail.package?.name,
          total_amount:
            bookingDetail.pricing?.total,
        };

        setBooking(bookingData);

        if (bookingData.status !== "confirmed") {
          setError(
            "This booking cannot be cancelled."
          );
          return;
        }

        const previewResponse =
          await getCancellationPreview(reference);

        const previewResponseData =
          previewResponse?.preview ||
          previewResponse?.data?.preview ||
          previewResponse?.data;

        if (!previewResponseData) {
          throw new Error(
            "Unable to calculate cancellation details."
          );
        }

        setPreview({
          ...previewResponseData.cancellation,
          ...previewResponseData.policy,
          policy_name:
            previewResponseData.policy?.name,
        });
      } catch (err) {
        console.error(err);

        if (err?.status === 401) {
          navigate("/my-bookings", {
            replace: true,
          });
          return;
        }

        setError(
          err?.message ||
            "Unable to load cancellation information."
        );
      } finally {
        setLoading(false);
      }
    };

    loadCancellationData();
  }, [reference, navigate]);

  const handleCancel = async () => {
    if (!booking || !preview || cancelling) {
      return;
    }

    const refundAmount = Number(
      getValue(
        preview,
        "refund_amount",
        "refundAmount",
        "refund"
      ) || 0
    );

    const confirmed = window.confirm(
      refundAmount > 0
        ? `Are you sure you want to cancel this booking? A refund of ${formatCurrency(
            refundAmount
          )} will be initiated according to the cancellation policy.`
        : "Are you sure you want to cancel this booking?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancelling(true);
      setError("");
      setSuccess("");

      const response =
        await cancelCustomerBooking(
          reference,
          reason.trim() || null
        );

      setSuccess(
        response?.message ||
          "Cancellation request received successfully."
      );

      /*
       * Do not immediately assume that a paid booking
       * is cancelled.
       *
       * The backend/webhook controls the final status.
       */
      setTimeout(() => {
        navigate(
          `/my-bookings/${reference}`,
          { replace: true }
        );
      }, 1800);
    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
          "Unable to cancel this booking."
      );

      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-cream-50 flex items-center justify-center px-6">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-forest-900" />

          <p className="text-sm text-gray-600">
            Checking cancellation policy...
          </p>
        </div>
      </main>
    );
  }

  if (!booking) {
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
              Cancellation unavailable
            </h1>

            <p className="mt-2 text-sm text-gray-600">
              {error || "Booking could not be found."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const packageName =
    booking.package_name ||
    booking.packageName ||
    booking.package?.name ||
    "Camping Package";

  const total =
    getValue(
      booking,
      "total_amount",
      "totalAmount",
      "total"
    ) || 0;

  const refundAmount =
    getValue(
      preview,
      "refund_amount",
      "refundAmount",
      "refund"
    ) || 0;

  const refundPercentage =
    getValue(
      preview,
      "refund_percentage",
      "refundPercentage"
    );

  const policyName =
    getValue(
      preview,
      "policy_name",
      "policyName",
      "name"
    ) || "Cancellation Policy";

  const daysBeforeArrival =
    getValue(
      preview,
      "days_before_arrival",
      "daysBeforeArrival"
    );

  const refundIsAvailable =
    Number(refundAmount) > 0;

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
            Cancellation
          </p>

          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
            Cancel your booking
          </h1>

          <p className="mt-3 text-sm text-white/60">
            Review your cancellation and refund details
            before confirming.
          </p>
        </div>
      </section>

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
        {success && (
          <div className="mb-6 flex gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0"
            />

            <p>{success}</p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
          {/* Main */}
          <div className="space-y-6">
            {/* Booking */}
            <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:p-7">
              <h2 className="text-lg font-semibold text-gray-900">
                Booking
              </h2>

              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest-50 text-forest-900">
                    <CalendarDays size={18} />
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">
                      Package
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {packageName}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {formatDate(
                        booking.booking_date ||
                          booking.bookingDate
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-black/5 pt-4">
                  <span className="text-sm text-gray-500">
                    Booking reference
                  </span>

                  <span className="text-sm font-semibold text-gray-900">
                    {booking.booking_reference ||
                      booking.bookingReference ||
                      reference}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Booking total
                  </span>

                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Policy */}
            {preview && (
              <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:p-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-50 text-forest-900">
                    <ShieldCheck size={19} />
                  </div>

                  <div>
                    <h2 className="font-semibold text-gray-900">
                      Cancellation policy
                    </h2>

                    <p className="text-xs text-gray-500">
                      {policyName}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-xs text-gray-400">
                      Days before arrival
                    </p>

                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {daysBeforeArrival ?? "-"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-xs text-gray-400">
                      Refund percentage
                    </p>

                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {refundPercentage !== null
                        ? `${refundPercentage}%`
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Reason */}
            <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:p-7">
              <label
                htmlFor="reason"
                className="text-lg font-semibold text-gray-900"
              >
                Cancellation reason
              </label>

              <p className="mt-2 text-sm text-gray-500">
                Optional. This helps us improve the camping
                experience.
              </p>

              <textarea
                id="reason"
                value={reason}
                onChange={(event) =>
                  setReason(event.target.value)
                }
                maxLength={500}
                rows={4}
                placeholder="Tell us why you are cancelling..."
                className="mt-5 w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-forest-900 focus:bg-white"
              />

              <p className="mt-2 text-right text-xs text-gray-400">
                {reason.length}/500
              </p>
            </div>

            {/* Warning */}
            <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <TriangleAlert
                size={19}
                className="mt-0.5 shrink-0 text-amber-600"
              />

              <div>
                <p className="text-sm font-semibold text-amber-900">
                  Please review before confirming
                </p>

                <p className="mt-1 text-sm leading-6 text-amber-800">
                  Cancellation is subject to the policy
                  shown above. Once the cancellation request
                  is submitted, it cannot be reversed from
                  this page.
                </p>
              </div>
            </div>
          </div>

          {/* Refund summary */}
          <aside className="h-fit lg:sticky lg:top-6">
            <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-50 text-forest-900">
                  <WalletCards size={19} />
                </div>

                <h2 className="font-semibold text-gray-900">
                  Refund summary
                </h2>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Booking amount
                  </span>

                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(total)}
                  </span>
                </div>

                <div className="border-t border-black/5 pt-4">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs text-gray-400">
                        Estimated refund
                      </p>

                      <p className="mt-1 text-2xl font-semibold text-gray-900">
                        {formatCurrency(refundAmount)}
                      </p>
                    </div>

                    <span className="text-xs text-gray-400">
                      {refundPercentage !== null
                        ? `${refundPercentage}%`
                        : ""}
                    </span>
                  </div>
                </div>
              </div>

              {refundIsAvailable ? (
                <div className="mt-6 rounded-2xl bg-green-50 p-4">
                  <p className="text-sm font-medium text-green-800">
                    Refund eligible
                  </p>

                  <p className="mt-1 text-xs leading-5 text-green-700">
                    Your refund will be initiated after the
                    cancellation request is accepted.
                  </p>
                </div>
              ) : (
                <div className="mt-6 rounded-2xl bg-gray-50 p-4">
                  <p className="text-sm font-medium text-gray-800">
                    No refund available
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    The cancellation policy does not provide
                    a refund for this booking.
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={handleCancel}
                disabled={
                  cancelling ||
                  !preview ||
                  booking.status !== "confirmed"
                }
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {cancelling ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    Processing...
                  </>
                ) : (
                  "Confirm Cancellation"
                )}
              </button>

              <p className="mt-4 text-center text-xs leading-5 text-gray-400">
                The final refund status is confirmed by the
                payment provider.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}