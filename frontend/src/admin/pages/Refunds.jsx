import { useEffect, useMemo, useState } from "react";
import {
  RefreshCcw,
  Search,
  CheckCircle2,
  Clock3,
  XCircle,
  IndianRupee,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getRefunds } from "../services/refunds";

const formatMoney = (amount, currency = "INR") => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));
};

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const statusConfig = {
  processing: {
    label: "Processing",
    className: "bg-amber-100 text-amber-700",
    icon: Clock3,
  },

  pending: {
    label: "Pending",
    className: "bg-amber-100 text-amber-700",
    icon: Clock3,
  },

  processed: {
    label: "Processed",
    className: "bg-emerald-100 text-emerald-700",
    icon: CheckCircle2,
  },

  completed: {
    label: "Completed",
    className: "bg-emerald-100 text-emerald-700",
    icon: CheckCircle2,
  },

  failed: {
    label: "Failed",
    className: "bg-red-100 text-red-700",
    icon: XCircle,
  },
};

const Refunds = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  const loadRefunds = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getRefunds();

      setRefunds(
        Array.isArray(response)
          ? response
          : response?.data || []
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to load refunds."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRefunds();
  }, []);

  const filteredRefunds = useMemo(() => {
    return refunds.filter((refund) => {
      const searchValue = search.trim().toLowerCase();

      const matchesSearch =
        !searchValue ||
        refund.booking_reference
          ?.toLowerCase()
          .includes(searchValue) ||
        refund.customer_name
          ?.toLowerCase()
          .includes(searchValue) ||
        refund.customer_email
          ?.toLowerCase()
          .includes(searchValue) ||
        refund.provider_refund_id
          ?.toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        statusFilter === "all" ||
        refund.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [refunds, search, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: refunds.length,

      processing: refunds.filter(
        (r) =>
          r.status === "processing" ||
          r.status === "pending"
      ).length,

      processed: refunds.filter(
        (r) =>
          r.status === "processed" ||
          r.status === "completed"
      ).length,

      failed: refunds.filter(
        (r) => r.status === "failed"
      ).length,

      amount: refunds
        .filter(
          (r) =>
            r.status === "processed" ||
            r.status === "completed"
        )
        .reduce(
          (sum, r) => sum + Number(r.amount || 0),
          0
        ),
    };
  }, [refunds]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 pb-10 sm:px-6 lg:px-8">

      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl font-semibold text-forest-950">
            Refunds
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Track customer cancellation refunds and
            Razorpay refund status.
          </p>
        </div>

        <button
          type="button"
          onClick={loadRefunds}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCcw
            size={16}
            className={loading ? "animate-spin" : ""}
          />

          Refresh
        </button>

      </div>

      {/* Stats */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">

        <StatCard
          title="Total Refunds"
          value={stats.total}
          icon={RefreshCcw}
        />

        <StatCard
          title="Processing"
          value={stats.processing}
          icon={Clock3}
        />

        <StatCard
          title="Processed"
          value={stats.processed}
          icon={CheckCircle2}
        />

        <StatCard
          title="Failed"
          value={stats.failed}
          icon={XCircle}
        />

        <StatCard
          title="Refunded"
          value={formatMoney(stats.amount)}
          icon={IndianRupee}
        />

      </div>

      {/* Filters */}

      <div className="rounded-2xl border border-gray-200 bg-white p-4">

        <div className="flex flex-col gap-3 lg:flex-row">

          <div className="relative flex-1">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search booking, customer or refund ID..."
              className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-forest-700"
            />

          </div>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-forest-700"
          >
            <option value="all">All statuses</option>
            <option value="processing">
              Processing
            </option>
            <option value="pending">
              Pending
            </option>
            <option value="processed">
              Processed
            </option>
            <option value="failed">
              Failed
            </option>
          </select>

        </div>

      </div>

      {/* Error */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Table */}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">

        <div className="overflow-x-auto">

          <table className="min-w-[1000px] w-full">

            <thead className="border-b border-gray-200 bg-gray-50">

              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">

                <th className="px-5 py-4">
                  Booking
                </th>

                <th className="px-5 py-4">
                  Customer
                </th>

                <th className="px-5 py-4">
                  Refund
                </th>

                <th className="px-5 py-4">
                  Policy
                </th>

                <th className="px-5 py-4">
                  Razorpay ID
                </th>

                <th className="px-5 py-4">
                  Status
                </th>

                <th className="px-5 py-4">
                  Date
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-gray-100">

              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-12 text-center text-sm text-gray-500"
                  >
                    Loading refunds...
                  </td>
                </tr>
              ) : filteredRefunds.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-12 text-center text-sm text-gray-500"
                  >
                    No refunds found.
                  </td>
                </tr>
              ) : (
                filteredRefunds.map((refund) => {
                  const config =
                    statusConfig[
                      refund.status
                    ] || statusConfig.processing;

                  const StatusIcon =
                    config.icon;

                  return (
                    <tr
                    key={refund.id}
                    onClick={() =>
                        navigate(`/admin/refunds/${refund.id}`)
                    }
                    className="cursor-pointer transition hover:bg-gray-50"
                    >

                      <td className="px-5 py-4">

                        <div className="font-semibold text-gray-900">
                          {refund.booking_reference}
                        </div>

                        <div className="mt-1 text-xs text-gray-500">
                          {formatDate(
                            refund.booking_date
                          )}
                        </div>

                      </td>

                      <td className="px-5 py-4">

                        <div className="font-medium text-gray-900">
                          {refund.customer_name ||
                            "-"}
                        </div>

                        <div className="mt-1 text-xs text-gray-500">
                          {refund.customer_email ||
                            refund.customer_phone ||
                            "-"}
                        </div>

                      </td>

                      <td className="px-5 py-4">

                        <div className="font-semibold text-gray-900">
                          {formatMoney(
                            refund.amount,
                            refund.currency
                          )}
                        </div>

                        <div className="mt-1 text-xs text-gray-500">
                          {refund.refund_percentage}%
                        </div>

                      </td>

                      <td className="px-5 py-4 text-sm text-gray-700">
                        {refund.cancellation_policy_name ||
                          "—"}
                      </td>

                      <td className="px-5 py-4">

                        <span className="font-mono text-xs text-gray-600">
                          {refund.provider_refund_id ||
                            "Not assigned"}
                        </span>

                      </td>

                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${config.className}`}
                        >
                          <StatusIcon size={13} />
                          {config.label}
                        </span>

                      </td>

                      <td className="px-5 py-4 text-sm text-gray-500">
                        {formatDate(
                          refund.created_at
                        )}
                      </td>

                    </tr>
                  );
                })
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
};

const StatCard = ({
  title,
  value,
  icon: Icon,
}) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm text-gray-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-semibold text-forest-950">
            {value}
          </p>
        </div>

        <div className="rounded-xl bg-forest-50 p-3 text-forest-800">
          <Icon size={20} />
        </div>

      </div>

    </div>
  );
};

export default Refunds;