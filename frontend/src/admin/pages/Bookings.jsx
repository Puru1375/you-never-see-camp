import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  RefreshCw,
  CalendarDays,
  X,
} from "lucide-react";

import {
  getAdminBookings,
} from "../services/bookings";

const Bookings = () => {
  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");

  const [error, setError] = useState("");

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const loadBookings = async (
    page = 1
  ) => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminBookings({
        search,
        status,
        date,
        page,
        limit: 20,
      });

      if (!response.success) {
        throw new Error(
          response.message ||
            "Unable to load bookings."
        );
      }

      setBookings(
        response.data.bookings
      );

      setPagination(
        response.data.pagination
      );
    } catch (error) {
      setError(
        error.message ||
          "Unable to load bookings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings(1);
  }, [status, date]);

  const handleSearch = (event) => {
    event.preventDefault();
    loadBookings(1);
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("");
    setDate("");
  };

  return (
    <div className="p-6 md:p-8">

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

        <div>
          <p className="text-sm text-slate-500">
            Management
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Bookings
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            View and manage customer bookings.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            loadBookings(pagination.page)
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <RefreshCw size={17} />
          Refresh
        </button>

      </div>

      {/* Filters */}
      <div className="mt-8 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">

        <form
          onSubmit={handleSearch}
          className="grid gap-4 lg:grid-cols-[1fr_180px_180px_auto]"
        >

          {/* Search */}
          <div className="relative">

            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search reference, customer or phone..."
              className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-forest-900 focus:ring-2 focus:ring-forest-900/10"
            />

          </div>

          {/* Status */}
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700 outline-none focus:border-forest-900"
          >
            <option value="">
              All statuses
            </option>

            <option value="confirmed">
              Confirmed
            </option>

            <option value="payment_pending">
              Payment Pending
            </option>

            <option value="pending">
              Pending
            </option>

            <option value="cancelled">
              Cancelled
            </option>

            <option value="completed">
              Completed
            </option>

            <option value="expired">
              Expired
            </option>
          </select>

          {/* Date */}
          <div className="relative">

            <CalendarDays
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="date"
              value={date}
              onChange={(event) =>
                setDate(event.target.value)
              }
              className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 text-sm outline-none focus:border-forest-900"
            />

          </div>

          {/* Search button */}
          <button
            type="submit"
            className="rounded-xl bg-forest-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-forest-900"
          >
            Search
          </button>

        </form>

        {(search || status || date) && (
          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            <X size={15} />
            Clear filters
          </button>
        )}

      </div>

      {/* Error */}
      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">

        {loading ? (
          <div className="p-12 text-center text-slate-500">
            Loading bookings...
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center">

            <p className="font-semibold text-slate-900">
              No bookings found
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or filters.
            </p>

          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full min-w-[1000px]">

              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Booking
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Customer
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Package
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Date
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Guests
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Amount
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="transition hover:bg-slate-50"
                  >

                    <td className="px-6 py-4">
                      <Link
                        to={`/admin/bookings/${booking.id}`}
                        className="font-semibold text-forest-900 hover:underline"
                      >
                        {booking.booking_reference}
                      </Link>

                      <p className="mt-1 text-xs text-slate-400">
                        {new Date(
                          booking.created_at
                        ).toLocaleDateString(
                          "en-IN"
                        )}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">
                        {booking.customer_name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {booking.customer_phone}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-700">
                      {booking.package_name}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-700">
                      {new Date(
                        booking.booking_date
                      ).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-700">
                      {booking.adults}
                      {" "}
                      adult
                      {booking.adults !== 1
                        ? "s"
                        : ""}

                      {booking.children > 0 &&
                        `, ${booking.children} child${
                          booking.children !== 1
                            ? "ren"
                            : ""
                        }`}

                      {booking.infants > 0 &&
                        `, ${booking.infants} infant${
                          booking.infants !== 1
                            ? "s"
                            : ""
                        }`}
                    </td>

                    <td className="px-6 py-4 font-semibold text-slate-900">
                      ₹
                      {Number(
                        booking.total_amount
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge
                        status={booking.status}
                      />
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* Pagination */}
      {!loading &&
        pagination.totalPages > 1 && (
          <div className="mt-5 flex items-center justify-between">

            <p className="text-sm text-slate-500">
              Page {pagination.page} of{" "}
              {pagination.totalPages}
            </p>

            <div className="flex gap-2">

              <button
                type="button"
                disabled={
                  pagination.page <= 1
                }
                onClick={() =>
                  loadBookings(
                    pagination.page - 1
                  )
                }
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <button
                type="button"
                disabled={
                  pagination.page >=
                  pagination.totalPages
                }
                onClick={() =>
                  loadBookings(
                    pagination.page + 1
                  )
                }
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>

            </div>

          </div>
        )}

    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    confirmed:
      "bg-green-100 text-green-700",

    payment_pending:
      "bg-yellow-100 text-yellow-700",

    pending:
      "bg-orange-100 text-orange-700",

    cancelled:
      "bg-red-100 text-red-700",

    completed:
      "bg-blue-100 text-blue-700",

    expired:
      "bg-slate-100 text-slate-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
        styles[status] ||
        "bg-slate-100 text-slate-700"
      }`}
    >
      {status.replace("_", " ")}
    </span>
  );
};

export default Bookings;