import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Pencil,
  Power,
  Users,
  Baby,
  CircleUserRound,
} from "lucide-react";

import {
  getAdminPricingRules,
  updateAdminPricingRuleStatus,
} from "../services/pricing";

const guestTypeConfig = {
  adult: {
    label: "Adult",
    icon: CircleUserRound,
  },
  child: {
    label: "Child",
    icon: Users,
  },
  infant: {
    label: "Infant",
    icon: Baby,
  },
};

const formatPrice = (price) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price));
};

export default function Pricing() {
  const navigate = useNavigate();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [packageFilter, setPackageFilter] = useState("");
  const [guestFilter, setGuestFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");

  const loadPricing = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminPricingRules({
        packageId: packageFilter,
        guestType: guestFilter,
        active: activeFilter,
      });

      setRules(data.pricingRules || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load pricing rules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPricing();
  }, [packageFilter, guestFilter, activeFilter]);

  const handleToggleStatus = async (rule) => {
    try {
      await updateAdminPricingRuleStatus(
        rule.id,
        !rule.is_active
      );

      await loadPricing();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to update pricing status");
    }
  };

  const packages = [
    ...new Map(
      rules.map((rule) => [
        rule.package_id,
        {
          id: rule.package_id,
          name: rule.package_name,
        },
      ])
    ).values(),
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 pb-10 sm:px-6 lg:px-8">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-forest-700">
            Pricing Management
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-gray-950">
            Guest Pricing
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-gray-500">
            Manage adult, child and infant pricing for each camping package.
          </p>
        </div>

        <button
          onClick={() => {
            navigate("/admin/pricing/new");
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest-800"
        >
          <Plus size={18} />
          Add Pricing
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Package
            </label>

            <select
              value={packageFilter}
              onChange={(e) => setPackageFilter(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-forest-700 focus:ring-4 focus:ring-forest-100"
            >
              <option value="">All Packages</option>

              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Guest Type
            </label>

            <select
              value={guestFilter}
              onChange={(e) => setGuestFilter(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-forest-700 focus:ring-4 focus:ring-forest-100"
            >
              <option value="">All Guest Types</option>
              <option value="adult">Adult</option>
              <option value="child">Child</option>
              <option value="infant">Infant</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Status
            </label>

            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-forest-700 focus:ring-4 focus:ring-forest-100"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
          Loading pricing...
        </div>
      ) : rules.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
          <p className="font-medium text-gray-900">
            No pricing rules found
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Create a pricing rule to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {rules.map((rule) => {
            const config =
              guestTypeConfig[rule.guest_type] ||
              guestTypeConfig.adult;

            const Icon = config.icon;

            return (
              <div
                key={rule.id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="p-5">

                  {/* Top */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-50 text-forest-800">
                        <Icon size={21} />
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          {config.label}
                        </p>

                        <h2 className="mt-0.5 font-semibold text-gray-950">
                          {rule.package_name}
                        </h2>
                      </div>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        rule.is_active
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {rule.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mt-6">
                    <p className="text-xs uppercase tracking-wide text-gray-400">
                      Price per guest
                    </p>

                    <p className="mt-1 text-3xl font-semibold tracking-tight text-gray-950">
                      {formatPrice(rule.price)}
                    </p>
                  </div>

                  {/* Age */}
                  <div className="mt-5 rounded-xl bg-gray-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Age Range
                    </p>

                    <p className="mt-1 text-sm font-medium text-gray-800">
                      {rule.min_age !== null
                        ? `${rule.min_age}+`
                        : "Any age"}

                      {rule.max_age !== null
                        ? ` up to ${rule.max_age}`
                        : ""}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 flex gap-3">

                    <button
                      onClick={() => {
                        navigate(`/admin/pricing/${rule.id}/edit`);
                      }}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                    >
                      <Pencil size={16} />
                      Edit
                    </button>

                    <button
                      onClick={() => handleToggleStatus(rule)}
                      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                        rule.is_active
                          ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          : "bg-forest-900 text-white hover:bg-forest-800"
                      }`}
                    >
                      <Power size={16} />

                      {rule.is_active
                        ? "Deactivate"
                        : "Activate"}
                    </button>

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}