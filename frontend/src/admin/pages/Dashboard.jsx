import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getAdminDashboard,
  getCurrentAdmin,
  adminLogout,
} from "../services/admin";

const Dashboard = () => {
  const navigate = useNavigate();

  const [admin, setAdmin] = useState(null);
  const [dashboard, setDashboard] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const token =
          localStorage.getItem("admin_token");

        if (!token) {
          navigate("/admin/login");
          return;
        }

        const [adminResponse, dashboardResponse] =
          await Promise.all([
            getCurrentAdmin(),
            getAdminDashboard(),
          ]);

        if (!adminResponse.success) {
          adminLogout();
          navigate("/admin/login");
          return;
        }

        if (!dashboardResponse.success) {
          throw new Error(
            dashboardResponse.message ||
              "Unable to load dashboard"
          );
        }

        setAdmin(adminResponse.data);
        setDashboard(dashboardResponse.data);
      } catch (err) {
        setError(
          err.message ||
            "Unable to load admin dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [navigate]);

  const handleLogout = () => {
    adminLogout();
    navigate("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-forest-900" />

          <p className="mt-4 text-slate-600">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-6">
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">
            Dashboard Error
          </h1>

          <p className="mt-3 text-slate-600">
            {error}
          </p>

          <button
            onClick={handleLogout}
            className="mt-6 rounded-full bg-forest-900 px-6 py-3 font-semibold text-white"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  const summary = dashboard?.summary || {};
  const recentBookings =
    dashboard?.recentBookings || [];

  const statCards = [
    {
      title: "Total Bookings",
      value: summary.total_bookings || 0,
    },
    {
      title: "Confirmed",
      value: summary.confirmed_bookings || 0,
    },
    {
      title: "Pending Payments",
      value: summary.pending_payments || 0,
    },
    {
      title: "Cancelled",
      value: summary.cancelled_bookings || 0,
    },
    {
      title: "Today's Bookings",
      value: summary.today_bookings || 0,
    },
    {
      title: "Upcoming",
      value: summary.upcoming_bookings || 0,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100">

      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div>
            <p className="text-sm font-medium text-slate-500">
              You Never See Camp
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Admin Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-4">

            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-900">
                {admin?.name}
              </p>

              <p className="text-xs text-slate-500">
                {admin?.role}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Logout
            </button>

          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-6 py-8">

        {/* Welcome */}
        <div className="mb-8">
          <p className="text-sm text-slate-500">
            Welcome back,
          </p>

          <h2 className="mt-1 text-3xl font-bold text-slate-900">
            {admin?.name}
          </h2>
        </div>

        {/* Revenue */}
        <div className="mb-8 rounded-3xl bg-forest-950 p-7 text-white shadow-sm">

          <p className="text-sm text-white/60">
            Total Captured Revenue
          </p>

          <p className="mt-2 text-4xl font-bold">
            ₹
            {Number(
              summary.total_revenue || 0
            ).toLocaleString("en-IN")}
          </p>

          <p className="mt-2 text-sm text-white/60">
            Based on successfully captured Razorpay payments
          </p>

        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {statCards.map((card) => (
            <div
              key={card.title}
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
            >
              <p className="text-sm text-slate-500">
                {card.title}
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {card.value}
              </p>
            </div>
          ))}

        </div>

        {/* Quick Actions */}
        <section className="mt-10">

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Quick Actions
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Manage your camping business
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <Link
              to="/admin/bookings"
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-md"
            >
              <p className="font-semibold text-slate-900">
                Bookings
              </p>

              <p className="mt-2 text-sm text-slate-500">
                View and manage bookings
              </p>
            </Link>

            <Link
              to="/admin/packages"
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-md"
            >
              <p className="font-semibold text-slate-900">
                Packages
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Manage camping packages
              </p>
            </Link>

            <Link
              to="/admin/pricing"
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-md"
            >
              <p className="font-semibold text-slate-900">
                Pricing
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Manage guest pricing
              </p>
            </Link>

            <Link
              to="/admin/settings"
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-md"
            >
              <p className="font-semibold text-slate-900">
                Settings
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Manage business settings
              </p>
            </Link>

          </div>

        </section>

        {/* Recent Bookings */}
        <section className="mt-10">

          <div className="flex items-end justify-between">

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Recent Bookings
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Latest customer bookings
              </p>
            </div>

            <Link
              to="/admin/bookings"
              className="text-sm font-semibold text-forest-900 hover:underline"
            >
              View all
            </Link>

          </div>

          <div className="mt-5 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">

            {recentBookings.length === 0 ? (
              <div className="p-10 text-center text-slate-500">
                No bookings found.
              </div>
            ) : (
              <div className="overflow-x-auto">

                <table className="w-full min-w-[800px]">

                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Reference
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
                        Amount
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {recentBookings.map((booking) => (
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
                        </td>

                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-900">
                            {booking.customer_name}
                          </p>

                          <p className="text-xs text-slate-500">
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

                        <td className="px-6 py-4 font-semibold text-slate-900">
                          ₹
                          {Number(
                            booking.total_amount
                          ).toLocaleString("en-IN")}
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

        </section>

      </main>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    confirmed:
      "bg-green-100 text-green-700",
    payment_pending:
      "bg-yellow-100 text-yellow-700",
    cancelled:
      "bg-red-100 text-red-700",
    completed:
      "bg-blue-100 text-blue-700",
    expired:
      "bg-slate-100 text-slate-700",
    pending:
      "bg-orange-100 text-orange-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        styles[status] ||
        "bg-slate-100 text-slate-700"
      }`}
    >
      {status.replace("_", " ")}
    </span>
  );
};

export default Dashboard;