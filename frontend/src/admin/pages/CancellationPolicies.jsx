import { useEffect, useState } from "react";
import {
  Plus,
  ShieldCheck,
  Pencil,
  Power,
  CalendarDays,
  Percent,
  Globe2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  getCancellationPolicies,
  updateCancellationPolicyStatus,
} from "../services/cancellationPolicies";

import { getAdminPackages } from "../services/packages";

export default function CancellationPolicies() {
  const navigate = useNavigate();

  const [policies, setPolicies] = useState([]);
  const [packages, setPackages] = useState([]);

  const [packageFilter, setPackageFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPackages();
  }, []);

  useEffect(() => {
    loadPolicies();
  }, [packageFilter, activeFilter]);

  const loadPackages = async () => {
    try {
      const response = await getAdminPackages();
      setPackages(response.packages || []);
    } catch (error) {
      console.error("Failed to load packages:", error);
    }
  };

  const loadPolicies = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getCancellationPolicies({
        packageId: packageFilter,
        active: activeFilter,
      });

      setPolicies(response.policies || []);
    } catch (error) {
      console.error(
        "Failed to load cancellation policies:",
        error
      );

      setError("Failed to load cancellation policies.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (policy) => {
    try {
      await updateCancellationPolicyStatus(
        policy.id,
        !policy.is_active
      );

      await loadPolicies();
    } catch (error) {
      console.error(
        "Failed to update policy status:",
        error
      );

      setError("Failed to update policy status.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-900 text-white">
              <ShieldCheck size={21} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Cancellation Policies
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage refund rules for guest cancellations.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/admin/cancellation-policies/new")
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest-800"
        >
          <Plus size={18} />
          Add Policy
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <select
            value={packageFilter}
            onChange={(e) =>
              setPackageFilter(e.target.value)
            }
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-forest-700 focus:ring-4 focus:ring-forest-100"
          >
            <option value="">All packages</option>

            <option value="null">
              Global policies
            </option>

            {packages.map((pkg) => (
              <option key={pkg.id} value={pkg.id}>
                {pkg.name}
              </option>
            ))}
          </select>

          <select
            value={activeFilter}
            onChange={(e) =>
              setActiveFilter(e.target.value)
            }
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-forest-700 focus:ring-4 focus:ring-forest-100"
          >
            <option value="">All statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
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
        <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-gray-200 bg-white">
          <p className="text-sm text-gray-500">
            Loading cancellation policies...
          </p>
        </div>
      ) : policies.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
          <ShieldCheck
            size={40}
            className="mx-auto text-gray-300"
          />

          <h2 className="mt-4 font-semibold text-gray-900">
            No cancellation policies
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Create your first cancellation policy.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/admin/cancellation-policies/new")
            }
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-forest-900 px-5 py-3 text-sm font-semibold text-white"
          >
            <Plus size={17} />
            Add Policy
          </button>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {policies.map((policy) => (
            <div
              key={policy.id}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
            >
              {/* Top */}
              <div className="flex items-start justify-between border-b border-gray-100 p-5">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-gray-900">
                      {policy.name}
                    </h2>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        policy.is_active
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {policy.is_active
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                    {policy.package_name ? (
                      <>
                        <ShieldCheck size={14} />
                        {policy.package_name}
                      </>
                    ) : (
                      <>
                        <Globe2 size={14} />
                        All packages
                      </>
                    )}
                  </div>
                </div>

                <div className="rounded-xl bg-forest-50 px-3 py-2 text-center">
                  <div className="flex items-center justify-center gap-1 text-forest-900">
                    <Percent size={15} />
                    <span className="text-lg font-bold">
                      {policy.refund_percentage}%
                    </span>
                  </div>

                  <span className="text-[11px] text-gray-500">
                    refund
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-3 p-5">
                <div className="rounded-xl bg-gray-50 p-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <CalendarDays size={14} />
                    Minimum notice
                  </div>

                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    {policy.minimum_days_before_arrival}{" "}
                    {policy.minimum_days_before_arrival === 1
                      ? "day"
                      : "days"}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <div className="text-xs text-gray-500">
                    Refund
                  </div>

                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    {policy.refund_percentage === 100
                      ? "Full refund"
                      : policy.refund_percentage === 0
                      ? "No refund"
                      : `${policy.refund_percentage}% refund`}
                  </p>
                </div>
              </div>

              {/* Description */}
              {policy.description && (
                <div className="px-5 pb-5">
                  <p className="rounded-xl bg-cream-50 p-4 text-sm leading-6 text-gray-600">
                    {policy.description}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between border-t border-gray-100 p-4">
                <button
                  type="button"
                  onClick={() => handleToggle(policy)}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  <Power size={16} />

                  {policy.is_active
                    ? "Deactivate"
                    : "Activate"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/admin/cancellation-policies/${policy.id}/edit`
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                  <Pencil size={16} />
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}