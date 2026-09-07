import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  XCircle,
  RefreshCcw,
} from "lucide-react";

import { getRefundById,reconcileRefund, } from "../services/refunds";

const formatMoney = (amount, currency = "INR") => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));
};

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatus = (status) => {
  if (
    status === "processed" ||
    status === "completed"
  ) {
    return {
      label: "Processed",
      className:
        "bg-emerald-100 text-emerald-700",
      icon: CheckCircle2,
    };
  }

  if (status === "failed") {
    return {
      label: "Failed",
      className: "bg-red-100 text-red-700",
      icon: XCircle,
    };
  }

  return {
    label: "Processing",
    className:
      "bg-amber-100 text-amber-700",
    icon: Clock3,
  };
};

const InfoRow = ({ label, value }) => (
  <div className="flex flex-col gap-1 border-b border-gray-100 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
    <span className="text-sm text-gray-500">
      {label}
    </span>

    <span className="break-all text-sm font-medium text-gray-900 sm:text-right">
      {value || "-"}
    </span>
  </div>
);

const RefundDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [refund, setRefund] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reconciling, setReconciling] =
  useState(false);

  useEffect(() => {
    const loadRefund = async () => {
      try {
        setLoading(true);

        const response =
          await getRefundById(id);

        setRefund(response || null);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            "Unable to load refund."
        );
      } finally {
        setLoading(false);
      }
    };

    loadRefund();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <RefreshCcw
            size={18}
            className="animate-spin"
          />
          Loading refund...
        </div>
      </div>
    );
  }

  if (error || !refund) {
    return (
      <div className="space-y-4">
        <button
          onClick={() =>
            navigate("/admin/refunds")
          }
          className="inline-flex items-center gap-2 text-sm font-medium text-forest-800"
        >
          <ArrowLeft size={16} />
          Back to refunds
        </button>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error || "Refund not found."}
        </div>
      </div>
    );
  }

  const handleReconcile = async () => {
  try {
    setReconciling(true);

    const response =
      await reconcileRefund(id);

    setRefund((current) => ({
      ...current,
      status:
        response?.data?.status ||
        current.status,
      provider_refund_id:
        response?.data?.providerRefundId ||
        current.provider_refund_id,
    }));
  } catch (err) {
    alert(
      err?.response?.data?.message ||
        "Unable to reconcile refund."
    );
  } finally {
    setReconciling(false);
  }
};

  const status = getStatus(refund.status);
  const StatusIcon = status.icon;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 pb-10 sm:px-6 lg:px-8">

      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <button
            onClick={() =>
              navigate("/admin/refunds")
            }
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-forest-800"
          >
            <ArrowLeft size={16} />
            Back to refunds
          </button>

          <h1 className="text-2xl font-semibold text-forest-950">
            Refund Details
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            {refund.booking_reference}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div
            className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${status.className}`}
          >
            <StatusIcon size={16} />
            {status.label}
          </div>

          <button
            type="button"
            onClick={handleReconcile}
            disabled={reconciling}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCcw
              size={16}
              className={reconciling ? "animate-spin" : ""}
            />

            {reconciling ? "Checking..." : "Reconcile"}
          </button>
        </div>

      </div>

      {/* Main grid */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* Refund */}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 xl:col-span-2">

          <h2 className="text-lg font-semibold text-gray-900">
            Refund Information
          </h2>

          <div className="mt-4">

            <InfoRow
              label="Refund amount"
              value={formatMoney(
                refund.amount,
                refund.currency
              )}
            />

            <InfoRow
              label="Refund percentage"
              value={`${refund.refund_percentage}%`}
            />

            <InfoRow
              label="Currency"
              value={refund.currency}
            />

            <InfoRow
              label="Provider"
              value={refund.provider}
            />

            <InfoRow
              label="Razorpay refund ID"
              value={
                refund.provider_refund_id
              }
            />

            <InfoRow
              label="Created"
              value={formatDate(
                refund.created_at
              )}
            />

            <InfoRow
              label="Last updated"
              value={formatDate(
                refund.updated_at
              )}
            />

            <InfoRow
              label="Reason"
              value={refund.reason}
            />

          </div>

        </div>

        {/* Customer */}

        <div className="rounded-2xl border border-gray-200 bg-white p-6">

          <h2 className="text-lg font-semibold text-gray-900">
            Customer
          </h2>

          <div className="mt-4">

            <InfoRow
              label="Name"
              value={refund.customer_name}
            />

            <InfoRow
              label="Email"
              value={refund.customer_email}
            />

            <InfoRow
              label="Phone"
              value={refund.customer_phone}
            />

          </div>

        </div>

        {/* Booking */}

        <div className="rounded-2xl border border-gray-200 bg-white p-6">

          <h2 className="text-lg font-semibold text-gray-900">
            Booking
          </h2>

          <div className="mt-4">

            <InfoRow
              label="Reference"
              value={refund.booking_reference}
            />

            <InfoRow
              label="Booking date"
              value={formatDate(
                refund.booking_date
              )}
            />

            <InfoRow
              label="Booking total"
              value={formatMoney(
                refund.booking_total_amount,
                refund.currency
              )}
            />

          </div>

        </div>

        {/* Payment */}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 xl:col-span-2">

          <h2 className="text-lg font-semibold text-gray-900">
            Payment
          </h2>

          <div className="mt-4">

            <InfoRow
              label="Payment status"
              value={refund.payment_status}
            />

            <InfoRow
              label="Razorpay order ID"
              value={refund.provider_order_id}
            />

            <InfoRow
              label="Razorpay payment ID"
              value={refund.provider_payment_id}
            />

            <InfoRow
              label="Payment ID"
              value={refund.payment_id}
            />

          </div>

        </div>

        {/* Cancellation policy */}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 xl:col-span-3">

          <h2 className="text-lg font-semibold text-gray-900">
            Cancellation Policy
          </h2>

          <div className="mt-4">

            <InfoRow
              label="Policy"
              value={
                refund.cancellation_policy_name
              }
            />

            <div className="py-3">
              <p className="text-sm text-gray-500">
                Description
              </p>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                {refund.cancellation_policy_description ||
                  "No description available."}
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default RefundDetails;