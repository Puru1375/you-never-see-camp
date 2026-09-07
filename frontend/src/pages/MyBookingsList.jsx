import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  ChevronRight,
  Clock3,
  LogOut,
  MapPin,
  Users,
  WalletCards,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Loader2,
} from "lucide-react";

import {
  getCurrentCustomer,
  logoutCustomer,
} from "../services/customerAuth";

import { getCustomerBookings } from "../services/customerBookings";

const formatDate = (date) => {
  if (!date) return "-";

  const dateValue = String(date).slice(0, 10);

  return new Date(`${dateValue}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
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

const getBookingDate = (booking) =>
  booking.booking_date ||
  booking.bookingDate ||
  booking.booking?.date;

const getBookingStatus = (status) => {
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
        icon: AlertCircle,
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
        className: "bg-gray-100 text-gray-600",
        icon: Clock3,
      };
  }
};

const getPaymentStatus = (booking) => {
  if (booking.payment_status) {
    return booking.payment_status;
  }

  if (booking.paymentStatus) {
    return booking.paymentStatus;
  }

  if (booking.status === "confirmed" || booking.status === "completed") {
    return "captured";
  }

  return "pending";
};

export default function MyBookingsList() {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [bookings, setBookings] = useState([]);

  const [activeTab, setActiveTab] = useState("upcoming");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true);
        setError("");

        const currentCustomer = await getCurrentCustomer();

        if (!currentCustomer?.success && !currentCustomer?.customer) {
          navigate("/my-bookings", { replace: true });
          return;
        }

        const customerData =
          currentCustomer.customer ||
          currentCustomer.data?.customer ||
          currentCustomer.data ||
          currentCustomer;

        setCustomer(customerData);

        const response = await getCustomerBookings();

        const bookingList =
          response?.bookings ||
          response?.data?.bookings ||
          response?.data ||
          [];

        setBookings(Array.isArray(bookingList) ? bookingList : []);
      } catch (err) {
        console.error(err);

        if (err?.status === 401 || err?.response?.status === 401) {
          navigate("/my-bookings", { replace: true });
          return;
        }

        setError(
          err?.message ||
            "Unable to load your bookings. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [navigate]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const bookingDate = getBookingDate(booking);

      if (!bookingDate) {
        return false;
      }

      const date = new Date(
        `${String(bookingDate).slice(0, 10)}T00:00:00`
      );

      return (
        date >= today &&
        booking.status !== "cancelled" &&
        booking.status !== "completed" &&
        booking.status !== "expired"
      );
    });
  }, [bookings]);

  const pastBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const bookingDate = getBookingDate(booking);

      if (!bookingDate) {
        return true;
      }

      const date = new Date(
        `${String(bookingDate).slice(0, 10)}T00:00:00`
      );

      return (
        date < today ||
        booking.status === "cancelled" ||
        booking.status === "completed" ||
        booking.status === "expired"
      );
    });
  }, [bookings]);

  const visibleBookings =
    activeTab === "upcoming" ? upcomingBookings : pastBookings;

  const handleLogout = async () => {
    try {
      await logoutCustomer();
    } catch (error) {
      console.error(error);
    } finally {
      navigate("/my-bookings", { replace: true });
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-cream-50 flex items-center justify-center px-6">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-forest-900" />

          <p className="text-sm text-gray-600">
            Loading your bookings...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream-50">
      {/* Header */}
      <section className="bg-forest-950 text-white">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-gold-400">
                My Bookings
              </p>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Your camp adventures
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">
                View your bookings, payment status and upcoming
                stays in one place.
              </p>

              {customer?.contactValue && (
                <p className="mt-5 text-sm text-white/60">
                  Signed in as{" "}
                  <span className="text-white">
                    {customer.contactValue}
                  </span>
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-6 lg:px-8">
        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-8 flex items-center gap-2 rounded-2xl border border-black/5 bg-white p-1.5 shadow-sm sm:w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("upcoming")}
            className={`rounded-xl px-5 py-2.5 text-sm font-medium transition ${
              activeTab === "upcoming"
                ? "bg-forest-950 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Upcoming
            <span className="ml-2 opacity-70">
              {upcomingBookings.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("past")}
            className={`rounded-xl px-5 py-2.5 text-sm font-medium transition ${
              activeTab === "past"
                ? "bg-forest-950 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Past
            <span className="ml-2 opacity-70">
              {pastBookings.length}
            </span>
          </button>
        </div>

        {/* Empty state */}
        {visibleBookings.length === 0 && (
          <div className="rounded-3xl border border-black/5 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-forest-50 text-forest-900">
              <CalendarDays size={24} />
            </div>

            <h2 className="text-xl font-semibold text-gray-900">
              {activeTab === "upcoming"
                ? "No upcoming bookings"
                : "No past bookings"}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              {activeTab === "upcoming"
                ? "Your next jungle adventure will appear here."
                : "Completed and cancelled bookings will appear here."}
            </p>

            {activeTab === "upcoming" && (
              <button
                type="button"
                onClick={() => navigate("/packages")}
                className="mt-6 rounded-full bg-forest-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-forest-900"
              >
                Explore Packages
              </button>
            )}
          </div>
        )}

        {/* Booking cards */}
        <div className="space-y-5">
          {visibleBookings.map((booking) => {
            const status = getBookingStatus(booking.status);
            const StatusIcon = status.icon;

            const paymentStatus = getPaymentStatus(booking);

            const packageName =
              booking.package_name ||
              booking.packageName ||
              booking.package?.name ||
              "Camping Package";

            const total =
              booking.total_amount ??
              booking.totalAmount ??
              booking.pricing?.total ??
              booking.amount ??
              0;

            const guests =
              booking.total_guests ??
              booking.totalGuests ??
              booking.guests?.total ??
              Number(booking.adults || 0) +
                Number(booking.children || 0) +
                Number(booking.infants || 0);

            return (
              <article
                key={booking.id || booking.booking_reference}
                className="overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="p-5 sm:p-7">
                  {/* Top */}
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-forest-50 px-3 py-1 text-xs font-semibold text-forest-900">
                          {booking.booking_reference ||
                            booking.bookingReference}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${status.className}`}
                        >
                          <StatusIcon size={13} />
                          {status.label}
                        </span>
                      </div>

                      <h2 className="mt-4 text-xl font-semibold text-gray-900">
                        {packageName}
                      </h2>

                      <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                        <MapPin size={15} />
                        7 Hills of Jungle
                      </div>
                    </div>

                    <div className="sm:text-right">
                      <p className="text-xs uppercase tracking-wider text-gray-400">
                        Total
                      </p>

                      <p className="mt-1 text-xl font-semibold text-gray-900">
                        {formatCurrency(total)}
                      </p>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="mt-7 grid gap-4 border-t border-black/5 pt-6 sm:grid-cols-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-50 text-forest-900">
                        <CalendarDays size={18} />
                      </div>

                      <div>
                        <p className="text-xs text-gray-400">
                          Booking date
                        </p>

                        <p className="mt-0.5 text-sm font-medium text-gray-900">
                          {formatDate(
                            getBookingDate(booking)
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-50 text-forest-900">
                        <Users size={18} />
                      </div>

                      <div>
                        <p className="text-xs text-gray-400">
                          Guests
                        </p>

                        <p className="mt-0.5 text-sm font-medium text-gray-900">
                          {guests}{" "}
                          {Number(guests) === 1 ? "Guest" : "Guests"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-50 text-forest-900">
                        <WalletCards size={18} />
                      </div>

                      <div>
                        <p className="text-xs text-gray-400">
                          Payment
                        </p>

                        <p className="mt-0.5 text-sm font-medium capitalize text-gray-900">
                          {paymentStatus}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom */}
                  <div className="mt-6 flex flex-col gap-3 border-t border-black/5 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs leading-5 text-gray-400">
                      Keep your booking reference handy for
                      support.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/my-bookings/${
                            booking.booking_reference ||
                            booking.bookingReference
                          }`
                        )
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-forest-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-forest-900"
                    >
                      View Details
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}