import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Mail,
  Phone,
  RefreshCw,
  User,
  Users,
  XCircle,
  TentTree,
  MapPin,
} from "lucide-react";

import { getAdminBookingById, updateAdminBookingStatus } from "../services/bookings";
import { apiRequest } from "../../services/api";

const formatMoney = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
  })}`;

const formatDate = (value) => {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "-";

  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatTime = (value) => {
  if (!value) return "-";

  return value.slice(0, 5);
};

const statusStyles = {
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  payment_pending: "bg-amber-50 text-amber-700 border-amber-200",
  pending: "bg-blue-50 text-blue-700 border-blue-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  completed: "bg-purple-50 text-purple-700 border-purple-200",
  expired: "bg-gray-100 text-gray-600 border-gray-200",
};

const paymentStyles = {
  captured: "bg-emerald-50 text-emerald-700",
  authorized: "bg-amber-50 text-amber-700",
  failed: "bg-red-50 text-red-700",
  created: "bg-gray-100 text-gray-600",
};

export default function BookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const loadBooking = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getAdminBookingById(id);

      setData(result);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load booking");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooking();
  }, [id]);

  const updateStatus = async (status) => {
  const message =
    status === "cancelled"
      ? "Are you sure you want to cancel this booking?"
      : "Are you sure you want to mark this booking as completed?";

  if (!window.confirm(message)) {
    return;
  }

  try {
    setActionLoading(true);

    await updateAdminBookingStatus(id, status);

    await loadBooking();
  } catch (err) {
    console.error("Booking status update error:", err);

    alert(
      err.message ||
        `Failed to mark booking as ${status}`
    );
  } finally {
    setActionLoading(false);
  }
};

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <RefreshCw className="h-7 w-7 animate-spin text-forest-800" />
      </div>
    );
  }

  if (error || !data?.booking) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
        <h2 className="text-lg font-semibold text-red-800">
          Unable to load booking
        </h2>

        <p className="mt-2 text-sm text-red-600">
          {error || "Booking not found"}
        </p>

        <Link
          to="/admin/bookings"
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-red-700"
        >
          <ArrowLeft size={16} />
          Back to bookings
        </Link>
      </div>
    );
  }

  const { booking, guests, breakdown, payments, notifications } = data;

  const totalGuests =
    Number(booking.adults || 0) +
    Number(booking.children || 0) +
    Number(booking.infants || 0);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 pb-10 sm:px-6 lg:px-8">
      {/* ========================================================= */}
      {/* HEADER */}
      {/* ========================================================= */}

      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <Link
            to="/admin/bookings"
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-forest-800"
          >
            <ArrowLeft size={16} />
            Back to bookings
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-gray-950">
              {booking.booking_reference}
            </h1>

            <span
              className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                statusStyles[booking.status] ||
                "border-gray-200 bg-gray-100 text-gray-600"
              }`}
            >
              {booking.status?.replace("_", " ")}
            </span>
          </div>

          <p className="mt-2 text-sm text-gray-500">
            Created {formatDateTime(booking.created_at)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={loadBooking}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          {booking.status !== "cancelled" &&
            booking.status !== "completed" && (
              <>
                <button
                  disabled={actionLoading}
                  onClick={() => updateStatus("cancelled")}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                >
                  <XCircle size={17} />
                  Cancel Booking
                </button>

                <button
                  disabled={actionLoading}
                  onClick={() => updateStatus("completed")}
                  className="inline-flex items-center gap-2 rounded-xl bg-forest-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-forest-950 disabled:opacity-50"
                >
                  <CheckCircle2 size={17} />
                  Mark Completed
                </button>
              </>
            )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* BOOKING SUMMARY */}
      {/* ========================================================= */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={<CalendarDays size={19} />}
          label="Booking Date"
          value={formatDate(booking.booking_date)}
        />

        <SummaryCard
          icon={<Users size={19} />}
          label="Total Guests"
          value={totalGuests}
          detail={`${booking.adults || 0} adults · ${
            booking.children || 0
          } children · ${booking.infants || 0} infants`}
        />

        <SummaryCard
          icon={<CreditCard size={19} />}
          label="Booking Total"
          value={formatMoney(booking.total_amount)}
          detail={booking.currency || "INR"}
        />

        <SummaryCard
          icon={<TentTree size={19} />}
          label="Package"
          value={booking.package_name}
          detail={booking.duration}
        />
      </div>

      {/* ========================================================= */}
      {/* MAIN GRID */}
      {/* ========================================================= */}

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {/* CUSTOMER */}
          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <SectionHeader
              icon={<User size={19} />}
              title="Customer Information"
            />

            <div className="grid gap-6 p-6 md:grid-cols-3">
              <InfoItem label="Full Name">
                {booking.customer_name}
              </InfoItem>

              <InfoItem label="Phone">
                <a
                  href={`tel:${booking.customer_phone}`}
                  className="inline-flex items-center gap-2 text-forest-800 hover:underline"
                >
                  <Phone size={15} />
                  {booking.customer_phone}
                </a>
              </InfoItem>

              <InfoItem label="Email">
                <a
                  href={`mailto:${booking.customer_email}`}
                  className="inline-flex max-w-full items-center gap-2 break-all text-forest-800 hover:underline"
                >
                  <Mail size={15} />
                  {booking.customer_email}
                </a>
              </InfoItem>
            </div>
          </section>

          {/* BOOKING DETAILS */}
          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <SectionHeader
              icon={<CalendarDays size={19} />}
              title="Booking Details"
            />

            <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-4">
              <InfoItem label="Package">
                {booking.package_name}
              </InfoItem>

              <InfoItem label="Duration">
                {booking.duration}
              </InfoItem>

              <InfoItem label="Accommodation">
                {booking.accommodation}
              </InfoItem>

              <InfoItem label="Location">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={15} />
                  7 Hills of Jungle
                </span>
              </InfoItem>

              <InfoItem label="Booking Date">
                {formatDate(booking.booking_date)}
              </InfoItem>

              <InfoItem label="Check-in">
                {formatTime(booking.check_in_time)}
              </InfoItem>

              <InfoItem label="Check-out">
                {formatTime(booking.check_out_time)}
              </InfoItem>

              <InfoItem label="Special Requests">
                {booking.special_requests || "No special requests"}
              </InfoItem>
            </div>
          </section>

          {/* GUESTS */}
          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <SectionHeader
              icon={<Users size={19} />}
              title="Guest Information"
              right={`${totalGuests} guests`}
            />

            <div className="p-6">
              <div className="grid gap-3 sm:grid-cols-3">
                <GuestCount
                  label="Adults"
                  value={booking.adults}
                />

                <GuestCount
                  label="Children"
                  value={booking.children}
                />

                <GuestCount
                  label="Infants"
                  value={booking.infants}
                />
              </div>

              {guests?.length > 0 && (
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-400">
                        <th className="px-3 py-3">Type</th>
                        <th className="px-3 py-3">Quantity</th>
                        <th className="px-3 py-3">Unit Price</th>
                        <th className="px-3 py-3 text-right">
                          Total
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {guests.map((guest) => (
                        <tr
                          key={guest.id}
                          className="border-b border-gray-100 last:border-0"
                        >
                          <td className="px-3 py-4 font-medium capitalize text-gray-900">
                            {guest.guest_type}
                          </td>

                          <td className="px-3 py-4 text-gray-600">
                            {guest.quantity}
                          </td>

                          <td className="px-3 py-4 text-gray-600">
                            {formatMoney(guest.unit_price)}
                          </td>

                          <td className="px-3 py-4 text-right font-semibold text-gray-900">
                            {formatMoney(guest.total_price)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          {/* NOTIFICATIONS */}
          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <SectionHeader
              icon={<Mail size={19} />}
              title="Notification History"
              right={`${notifications?.length || 0} records`}
            />

            <div className="divide-y divide-gray-100">
              {notifications?.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-5"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900">
                          {notification.subject}
                        </p>

                        <p className="mt-1 break-all text-sm text-gray-500">
                          {notification.recipient}
                        </p>

                        <p className="mt-2 text-xs text-gray-400">
                          {formatDateTime(notification.created_at)}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                          notification.status === "sent"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {notification.status}
                      </span>
                    </div>

                    {notification.error_message && (
                      <div className="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-700">
                        {notification.error_message}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <EmptyState text="No notifications found." />
              )}
            </div>
          </section>
        </div>

        {/* ======================================================= */}
        {/* RIGHT COLUMN */}
        {/* ======================================================= */}

        <div className="space-y-6">
          {/* PRICE */}
          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <SectionHeader
              icon={<CreditCard size={19} />}
              title="Payment Summary"
            />

            <div className="p-6">
              <div className="space-y-4">
                {breakdown?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 text-sm"
                  >
                    <span className="text-gray-500">
                      {item.label}
                    </span>

                    <span className="font-medium text-gray-900">
                      {formatMoney(item.amount)}
                    </span>
                  </div>
                ))}

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">
                      Total
                    </span>

                    <span className="text-2xl font-bold text-forest-900">
                      {formatMoney(booking.total_amount)}
                    </span>
                  </div>

                  <p className="mt-1 text-right text-xs text-gray-400">
                    {booking.currency || "INR"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* PAYMENTS */}
          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <SectionHeader
              icon={<CreditCard size={19} />}
              title="Payment History"
            />

            <div className="p-5">
              {payments?.length > 0 ? (
                <div className="space-y-5">
                  {payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="rounded-xl border border-gray-100 bg-gray-50 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold capitalize text-gray-900">
                          {payment.provider}
                        </span>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                            paymentStyles[payment.status] ||
                            "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {payment.status}
                        </span>
                      </div>

                      <div className="mt-4 space-y-3 text-xs">
                        <PaymentRow
                          label="Amount"
                          value={formatMoney(payment.amount)}
                        />

                        <PaymentRow
                          label="Order ID"
                          value={payment.provider_order_id}
                          mono
                        />

                        <PaymentRow
                          label="Payment ID"
                          value={payment.provider_payment_id || "-"}
                          mono
                        />

                        <PaymentRow
                          label="Created"
                          value={formatDateTime(payment.created_at)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState text="No payment records found." />
              )}
            </div>
          </section>

          {/* BOOKING META */}
          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <SectionHeader
              icon={<Clock3 size={19} />}
              title="Booking Timeline"
            />

            <div className="p-6">
              <TimelineItem
                title="Booking Created"
                value={formatDateTime(booking.created_at)}
              />

              <TimelineItem
                title="Last Updated"
                value={formatDateTime(booking.updated_at)}
                last
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/* =============================================================== */
/* COMPONENTS */
/* =============================================================== */

function SummaryCard({ icon, label, value, detail }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            {label}
          </p>

          <p className="mt-2 text-xl font-bold text-gray-950">
            {value}
          </p>

          {detail && (
            <p className="mt-1 text-xs text-gray-500">
              {detail}
            </p>
          )}
        </div>

        <div className="rounded-xl bg-forest-50 p-2.5 text-forest-800">
          {icon}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ icon, title, right }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-forest-50 p-2.5 text-forest-800">
          {icon}
        </div>

        <h2 className="font-semibold text-gray-950">
          {title}
        </h2>
      </div>

      {right && (
        <span className="text-xs font-medium text-gray-400">
          {right}
        </span>
      )}
    </div>
  );
}

function InfoItem({ label, children }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <div className="mt-2 text-sm font-medium text-gray-900">
        {children}
      </div>
    </div>
  );
}

function GuestCount({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
      <p className="text-2xl font-bold text-gray-950">
        {value || 0}
      </p>

      <p className="mt-1 text-xs font-medium text-gray-500">
        {label}
      </p>
    </div>
  );
}

function PaymentRow({ label, value, mono }) {
  return (
    <div>
      <p className="text-gray-400">{label}</p>

      <p
        className={`mt-1 break-all font-medium text-gray-700 ${
          mono ? "font-mono text-[11px]" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function TimelineItem({ title, value, last }) {
  return (
    <div className="relative flex gap-3">
      {!last && (
        <div className="absolute left-[7px] top-4 h-full w-px bg-gray-200" />
      )}

      <div className="relative mt-1 h-4 w-4 shrink-0 rounded-full border-4 border-forest-100 bg-forest-700" />

      <div className="pb-5">
        <p className="text-sm font-semibold text-gray-900">
          {title}
        </p>

        <p className="mt-1 text-xs text-gray-500">
          {value}
        </p>
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="py-8 text-center text-sm text-gray-400">
      {text}
    </div>
  );
}