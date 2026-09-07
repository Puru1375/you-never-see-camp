import { useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Loader2,
  Mail,
  Phone,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  getCancellationPreview,
  cancelBooking,
} from "../services/cancellation";


export default function CancelBooking() {
  const navigate = useNavigate();

  const [bookingReference, setBookingReference] =
    useState("");

  const [contact, setContact] = useState("");

  const [contactType, setContactType] =
    useState("email");

  const [preview, setPreview] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [cancelling, setCancelling] = useState(false);
const [cancelled, setCancelled] = useState(null);

  const handlePreview = async (e) => {
    e.preventDefault();

    setError("");
    setPreview(null);

    if (!bookingReference.trim()) {
      setError("Please enter your booking reference.");
      return;
    }

    if (!contact.trim()) {
      setError(
        `Please enter your ${
          contactType === "email"
            ? "email"
            : "phone number"
        }.`
      );
      return;
    }

    try {
      setLoading(true);

      const details =
        contactType === "email"
          ? {
              customerEmail: contact.trim(),
            }
          : {
              customerPhone: contact.trim(),
            };

      const response =
        await getCancellationPreview(
          bookingReference.trim(),
          details
        );

      setPreview(response);
    } catch (error) {
      console.error(
        "Cancellation preview failed:",
        error
      );

      setError(
        error?.message ||
          "Unable to verify your booking."
      );
    } finally {
      setLoading(false);
    }
  };


  const handleCancellation = async () => {
  try {
    setCancelling(true);
    setError("");

    const customerDetails =
      contactType === "email"
        ? {
            customerEmail: contact.trim(),
          }
        : {
            customerPhone: contact.trim(),
          };

    const response = await cancelBooking(
      bookingReference.trim(),
      customerDetails
    );

    setCancelled(response);
  } catch (error) {
    console.error(
      "Cancellation failed:",
      error
    );

    setError(
      error?.message ||
        "Unable to cancel your booking."
    );
  } finally {
    setCancelling(false);
  }
};

  return (
    <div className="min-h-screen bg-cream-50 px-4 py-12 sm:px-6">
      <div className="mx-auto w-full max-w-3xl">
        {/* Back */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={17} />
          Back
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-900 text-white">
            <ShieldCheck size={23} />
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Cancel Your Booking
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-gray-600">
            Enter your booking details to check your
            cancellation eligibility and refund amount.
          </p>
        </div>

        {/* Form */}
        {!preview && (
          <form
            onSubmit={handlePreview}
            className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
          >
            <div className="space-y-6 p-6 sm:p-8">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  Booking Reference
                </label>

                <input
                  type="text"
                  value={bookingReference}
                  onChange={(e) =>
                    setBookingReference(
                      e.target.value
                    )
                  }
                  placeholder="e.g. YNS-123456-ABC12345"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm uppercase text-gray-900 outline-none placeholder:normal-case placeholder:text-gray-400 focus:border-forest-700 focus:ring-4 focus:ring-forest-100"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-semibold text-gray-900">
                    Verify Your Booking
                  </label>

                  <div className="flex rounded-lg bg-gray-100 p-1">
                    <button
                      type="button"
                      onClick={() =>
                        setContactType("email")
                      }
                      className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                        contactType === "email"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500"
                      }`}
                    >
                      Email
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setContactType("phone")
                      }
                      className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                        contactType === "phone"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500"
                      }`}
                    >
                      Phone
                    </button>
                  </div>
                </div>

                <div className="relative">
                  {contactType === "email" ? (
                    <Mail
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  ) : (
                    <Phone
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  )}

                  <input
                    type={
                      contactType === "email"
                        ? "email"
                        : "tel"
                    }
                    value={contact}
                    onChange={(e) =>
                      setContact(e.target.value)
                    }
                    placeholder={
                      contactType === "email"
                        ? "Email used for booking"
                        : "Phone used for booking"
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-forest-700 focus:ring-4 focus:ring-forest-100"
                  />
                </div>
              </div>

              {error && (
                <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <XCircle
                    size={18}
                    className="mt-0.5 shrink-0"
                  />

                  <p>{error}</p>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 bg-gray-50 p-6 sm:px-8">
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-forest-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    Checking Booking...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    Check Cancellation
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Preview */}
        {preview && !cancelled && (
          <div className="space-y-5">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700">
                  <CheckCircle2 size={22} />
                </div>

                <div>
                  <h2 className="font-semibold text-gray-900">
                    Booking Verified
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {preview.booking.reference}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">
                    Package
                  </p>

                  <p className="mt-1 font-semibold text-gray-900">
                    {preview.booking.packageName}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">
                    Arrival
                  </p>

                  <div className="mt-1 flex items-center gap-2 font-semibold text-gray-900">
                    <CalendarDays size={16} />
                    {preview.booking.bookingDate}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="font-semibold text-gray-900">
                Cancellation Summary
              </h2>

              <div className="mt-5 space-y-4">
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-gray-500">
                    Booking total
                  </span>

                  <span className="font-medium text-gray-900">
                    ₹
                    {preview.booking.totalAmount.toLocaleString(
                      "en-IN"
                    )}
                  </span>
                </div>

                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-gray-500">
                    Days before arrival
                  </span>

                  <span className="font-medium text-gray-900">
                    {
                      preview.cancellation
                        .daysBeforeArrival
                    }{" "}
                    days
                  </span>
                </div>

                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-gray-500">
                    Refund policy
                  </span>

                  <span className="font-medium text-gray-900">
                    {
                      preview.cancellation
                        .refundPercentage
                    }
                    %
                  </span>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <div className="flex justify-between gap-4">
                    <span className="font-semibold text-gray-900">
                      Refund amount
                    </span>

                    <span className="text-xl font-bold text-green-700">
                      ₹
                      {preview.cancellation.refundAmount.toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-xl bg-cream-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Applied Policy
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {preview.policy.name}
                </p>

                {preview.policy.description && (
                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    {preview.policy.description}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
              <strong>Important:</strong> The refund
              amount shown above is calculated from the
              current cancellation policy. Cancellation
              will permanently cancel this booking.
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="flex-1 rounded-xl border border-gray-200 bg-white px-5 py-3.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Go Back
              </button>

              <button
                type="button"
                onClick={handleCancellation}
                disabled={cancelling}
                className="flex-1 rounded-xl bg-red-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                {cancelling
                    ? "Processing Cancellation..."
                    : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        )}
        {cancelled && (
            <div className="rounded-3xl border border-green-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600">
                    <CheckCircle2 size={32} />
                </div>

                <h2 className="mt-5 text-2xl font-bold text-gray-900">
                    Booking Cancelled
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                    Your booking has been cancelled successfully.
                </p>

                <div className="mt-6 rounded-2xl bg-gray-50 p-5 text-left">
                    <div className="flex justify-between gap-4">
                    <span className="text-sm text-gray-500">
                        Booking Reference
                    </span>

                    <span className="text-sm font-semibold text-gray-900">
                        {cancelled.bookingReference}
                    </span>
                    </div>

                    <div className="mt-4 flex justify-between gap-4">
                    <span className="text-sm text-gray-500">
                        Refund
                    </span>

                    <span className="text-lg font-bold text-green-700">
                        ₹
                        {Number(
                        cancelled.refundAmount || 0
                        ).toLocaleString("en-IN")}
                    </span>
                    </div>

                    <div className="mt-4 flex justify-between gap-4">
                    <span className="text-sm text-gray-500">
                        Refund Percentage
                    </span>

                    <span className="text-sm font-semibold text-gray-900">
                        {cancelled.refundPercentage}%
                    </span>
                    </div>

                    {cancelled.refundId && (
                    <div className="mt-4 border-t border-gray-200 pt-4">
                        <p className="text-xs text-gray-500">
                        Refund ID
                        </p>

                        <p className="mt-1 break-all text-xs font-medium text-gray-700">
                        {cancelled.refundId}
                        </p>
                    </div>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="mt-6 rounded-xl bg-forest-900 px-6 py-3 text-sm font-semibold text-white hover:bg-forest-800"
                >
                    Back to Website
                </button>
                </div>
            </div>
          )}
      </div>
    </div>
  );
}