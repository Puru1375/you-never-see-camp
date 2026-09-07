import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Pencil,
  Power,
  RefreshCw,
  Star,
  Users,
  Clock3,
  TentTree,
  Utensils,
  Mountain,
} from "lucide-react";

import {
  getAdminPackages,
  updateAdminPackageStatus,
} from "../services/packages";

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

export default function Packages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState("");

  const loadPackages = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminPackages();

      setPackages(data.packages || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load packages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, []);

  const toggleStatus = async (pkg) => {
    const newStatus = !pkg.is_active;

    const message = newStatus
      ? `Activate "${pkg.name}"?`
      : `Deactivate "${pkg.name}"?`;

    if (!window.confirm(message)) return;

    try {
      setActionId(pkg.id);

      await updateAdminPackageStatus(
        pkg.id,
        newStatus
      );

      await loadPackages();
    } catch (err) {
      console.error(err);

      alert(
        err.message || "Failed to update package status"
      );
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 pb-10 sm:px-6 lg:px-8">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-950">
            Packages
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your camping packages and experiences.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadPackages}
            className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-600 shadow-sm hover:bg-gray-50"
            title="Refresh"
          >
            <RefreshCw size={18} />
          </button>

          <Link
            to="/admin/packages/new"
            className="inline-flex items-center gap-2 rounded-xl bg-forest-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-forest-950"
          >
            <Plus size={18} />
            Add Package
          </Link>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* LOADING */}
      {loading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <RefreshCw className="h-7 w-7 animate-spin text-forest-800" />
        </div>
      ) : packages.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <TentTree className="mx-auto h-10 w-10 text-gray-300" />

          <h2 className="mt-4 font-semibold text-gray-900">
            No packages found
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Create your first camping package.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              actionId={actionId}
              onToggleStatus={toggleStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PackageCard({
  pkg,
  actionId,
  onToggleStatus,
}) {
  return (
    <div
      className={`group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        pkg.is_active
          ? "border-gray-200"
          : "border-gray-200 opacity-75"
      }`}
    >
      {/* TOP */}
      <div className="relative bg-gradient-to-br from-forest-950 via-forest-900 to-forest-800 px-6 pb-6 pt-6 text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            {pkg.featured && (
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white">
                <Star
                  size={12}
                  className="fill-current"
                />
                Featured
              </div>
            )}

            <h2 className="text-xl font-bold">
              {pkg.name}
            </h2>

            <p className="mt-1 text-sm text-white/70">
              {pkg.tagline}
            </p>
          </div>

          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${
              pkg.is_active
                ? "bg-emerald-400/20 text-emerald-200"
                : "bg-white/10 text-white/60"
            }`}
          >
            {pkg.is_active ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      {/* BODY */}
      <div className="p-6">
        <p className="line-clamp-2 min-h-[40px] text-sm leading-5 text-gray-500">
          {pkg.description || "No description added."}
        </p>

        {/* PRICE */}
        <div className="mt-5 rounded-xl bg-gray-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Starting Price
          </p>

          <div className="mt-1 flex items-end gap-1">
            <span className="text-2xl font-bold text-gray-950">
              {money(pkg.base_price)}
            </span>

            <span className="pb-1 text-xs text-gray-500">
              {pkg.price_label}
            </span>
          </div>
        </div>

        {/* INFO */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Info
            icon={<Clock3 size={15} />}
            label="Duration"
            value={pkg.duration || "-"}
          />

          <Info
            icon={<Users size={15} />}
            label="Capacity"
            value={`${pkg.max_guests} guests`}
          />

          <Info
            icon={<TentTree size={15} />}
            label="Stay"
            value={pkg.accommodation || "-"}
          />

          <Info
            icon={<Clock3 size={15} />}
            label="Check-in"
            value={pkg.check_in_time?.slice(0, 5) || "-"}
          />
        </div>

        {/* MEALS / ACTIVITIES */}
        <div className="mt-5 space-y-3 border-t border-gray-100 pt-5">
          <TagRow
            icon={<Utensils size={14} />}
            label="Meals"
            items={pkg.meals}
          />

          <TagRow
            icon={<Mountain size={14} />}
            label="Activities"
            items={pkg.activities}
          />
        </div>

        {/* ACTIONS */}
        <div className="mt-6 flex gap-2 border-t border-gray-100 pt-5">
          <Link
            to={`/admin/packages/${pkg.id}/edit`}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            <Pencil size={16} />
            Edit
          </Link>

          <button
            onClick={() => onToggleStatus(pkg)}
            disabled={actionId === pkg.id}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${
              pkg.is_active
                ? "border border-red-200 text-red-600 hover:bg-red-50"
                : "bg-forest-900 text-white hover:bg-forest-950"
            }`}
          >
            {actionId === pkg.id ? (
              <RefreshCw
                size={16}
                className="animate-spin"
              />
            ) : (
              <Power size={16} />
            )}

            {pkg.is_active
              ? "Deactivate"
              : "Activate"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Info({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-gray-100 p-3">
      <div className="flex items-center gap-1.5 text-gray-400">
        {icon}

        <span className="text-[11px] font-semibold uppercase tracking-wide">
          {label}
        </span>
      </div>

      <p className="mt-1 line-clamp-1 text-sm font-medium text-gray-800">
        {value}
      </p>
    </div>
  );
}

function TagRow({ icon, label, items }) {
  const names = (items || []).map((item) =>
    typeof item === "string"
      ? item
      : item.name
  );

  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-gray-500">
        {icon}
        {label}
      </div>

      {names.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {names.map((name, index) => (
            <span
              key={`${name}-${index}`}
              className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600"
            >
              {name}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-400">
          Not configured
        </p>
      )}
    </div>
  );
}