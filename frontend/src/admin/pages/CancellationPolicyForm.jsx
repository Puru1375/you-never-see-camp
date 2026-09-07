import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Save,
  ShieldCheck,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import {
  createCancellationPolicy,
  getCancellationPolicyById,
  updateCancellationPolicy,
} from "../services/cancellationPolicies";

import { getAdminPackages } from "../services/packages";

export default function CancellationPolicyForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = Boolean(id);

  const [packages, setPackages] = useState([]);

  const [form, setForm] = useState({
    packageId: "",
    name: "",
    refundPercentage: "",
    minimumDaysBeforeArrival: "",
    description: "",
    isActive: true,
  });

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPackages();

    if (isEdit) {
      loadPolicy();
    }
  }, [id]);

  const loadPackages = async () => {
    try {
      const response = await getAdminPackages();

      setPackages(response.packages || []);
    } catch (error) {
      console.error("Failed to load packages:", error);
    }
  };

  const loadPolicy = async () => {
    try {
      setLoading(true);

      const response =
        await getCancellationPolicyById(id);

      const policy = response.policy;

      setForm({
        packageId: policy.package_id || "",
        name: policy.name || "",
        refundPercentage:
          policy.refund_percentage ?? "",
        minimumDaysBeforeArrival:
          policy.minimum_days_before_arrival ?? "",
        description: policy.description || "",
        isActive: Boolean(policy.is_active),
      });
    } catch (error) {
      console.error("Failed to load policy:", error);

      setError("Failed to load cancellation policy.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const refund = Number(form.refundPercentage);
    const minimumDays = Number(
      form.minimumDaysBeforeArrival
    );

    if (!form.name.trim()) {
      setError("Policy name is required.");
      return;
    }

    if (
      !Number.isFinite(refund) ||
      refund < 0 ||
      refund > 100
    ) {
      setError(
        "Refund percentage must be between 0 and 100."
      );
      return;
    }

    if (
      !Number.isInteger(minimumDays) ||
      minimumDays < 0
    ) {
      setError(
        "Minimum days must be a whole number greater than or equal to 0."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        packageId: form.packageId || null,
        name: form.name.trim(),
        refundPercentage: refund,
        minimumDaysBeforeArrival: minimumDays,
        description: form.description.trim() || null,
        isActive: form.isActive,
      };

      if (isEdit) {
        await updateCancellationPolicy(id, payload);
      } else {
        await createCancellationPolicy(payload);
      }

      navigate("/admin/cancellation-policies");
    } catch (error) {
      console.error(
        "Failed to save cancellation policy:",
        error
      );

      setError(
        error?.message ||
          "Failed to save cancellation policy."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-gray-500">
          Loading policy...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() =>
            navigate("/admin/cancellation-policies")
          }
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50"
        >
          <ArrowLeft size={18} />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck
              size={20}
              className="text-forest-900"
            />

            <h1 className="text-2xl font-bold text-gray-900">
              {isEdit
                ? "Edit Cancellation Policy"
                : "Create Cancellation Policy"}
            </h1>
          </div>

          <p className="mt-1 text-sm text-gray-500">
            Define how refunds are handled for cancellations.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
      >
        <div className="space-y-6 p-6">
          {/* Scope */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-900">
              Applies To
            </label>

            <select
              value={form.packageId}
              onChange={(e) =>
                handleChange(
                  "packageId",
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-forest-700 focus:ring-4 focus:ring-forest-100"
            >
              <option value="">
                All packages (Global Policy)
              </option>

              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name}
                </option>
              ))}
            </select>

            <p className="mt-2 text-xs text-gray-500">
              Leave this as global if the policy should apply
              to all packages.
            </p>
          </div>

          {/* Name */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-900">
              Policy Name
            </label>

            <input
              type="text"
              value={form.name}
              onChange={(e) =>
                handleChange("name", e.target.value)
              }
              placeholder="e.g. Full Refund"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-forest-700 focus:ring-4 focus:ring-forest-100"
            />
          </div>

          {/* Refund + Days */}
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Refund Percentage
              </label>

              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={form.refundPercentage}
                  onChange={(e) =>
                    handleChange(
                      "refundPercentage",
                      e.target.value
                    )
                  }
                  placeholder="100"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-10 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-forest-700 focus:ring-4 focus:ring-forest-100"
                />

                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                  %
                </span>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Minimum Days Before Arrival
              </label>

              <input
                type="number"
                min="0"
                step="1"
                value={form.minimumDaysBeforeArrival}
                onChange={(e) =>
                  handleChange(
                    "minimumDaysBeforeArrival",
                    e.target.value
                  )
                }
                placeholder="7"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-forest-700 focus:ring-4 focus:ring-forest-100"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-900">
              Description
            </label>

            <textarea
              rows={4}
              value={form.description}
              onChange={(e) =>
                handleChange(
                  "description",
                  e.target.value
                )
              }
              placeholder="Explain when this refund policy applies..."
              className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-forest-700 focus:ring-4 focus:ring-forest-100"
            />
          </div>

          {/* Active */}
          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Active Policy
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Enable this policy for the cancellation engine.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                handleChange(
                  "isActive",
                  !form.isActive
                )
              }
              className={`relative h-7 w-12 rounded-full transition ${
                form.isActive
                  ? "bg-forest-900"
                  : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                  form.isActive
                    ? "left-6"
                    : "left-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
          <button
            type="button"
            onClick={() =>
              navigate("/admin/cancellation-policies")
            }
            className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-forest-900 px-5 py-3 text-sm font-semibold text-white hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={17} />

            {saving
              ? "Saving..."
              : isEdit
              ? "Update Policy"
              : "Create Policy"}
          </button>
        </div>
      </form>
    </div>
  );
}