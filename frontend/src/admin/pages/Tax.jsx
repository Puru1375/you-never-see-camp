import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Power,
  ReceiptText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  getAdminTaxRules,
  updateAdminTaxRuleStatus,
} from "../services/tax";

export default function Tax() {
  const navigate = useNavigate();

  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRules = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminTaxRules();

      setRules(data.taxRules || []);
    } catch (err) {
      console.error(err);
      setError(
        err.message || "Failed to load tax rules"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const handleToggle = async (rule) => {
    try {
      await updateAdminTaxRuleStatus(
        rule.id,
        !rule.is_active
      );

      await loadRules();
    } catch (err) {
      console.error(err);

      alert(
        err.message ||
          "Failed to update tax status"
      );
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-10">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-forest-700">
            Tax Management
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-gray-950">
            Taxes
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-gray-500">
            Manage GST and other tax rules used during
            booking calculations.
          </p>
        </div>

        <button
          onClick={() =>
            navigate("/admin/tax/new")
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest-800"
        >
          <Plus size={18} />
          Add Tax Rule
        </button>
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
          Loading tax rules...
        </div>
      ) : rules.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
          <ReceiptText
            className="mx-auto text-gray-300"
            size={38}
          />

          <p className="mt-4 font-medium text-gray-900">
            No tax rules found
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Create a tax rule to apply tax to bookings.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          {rules.map((rule) => (
            <div
              key={rule.id}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="p-6">

                {/* Top */}
                <div className="flex items-start justify-between gap-4">

                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-50 text-forest-800">
                      <ReceiptText size={21} />
                    </div>

                    <div>
                      <h2 className="font-semibold text-gray-950">
                        {rule.name}
                      </h2>

                      <p className="mt-0.5 text-xs text-gray-400">
                        Tax Rule
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      rule.is_active
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {rule.is_active
                      ? "Active"
                      : "Inactive"}
                  </span>
                </div>

                {/* Percentage */}
                <div className="mt-7">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Tax Rate
                  </p>

                  <p className="mt-1 text-4xl font-semibold tracking-tight text-gray-950">
                    {Number(
                      rule.percentage
                    ).toFixed(2)}
                    <span className="ml-1 text-xl text-gray-400">
                      %
                    </span>
                  </p>
                </div>

                {/* Tax Type */}
                <div className="mt-5 rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Tax Type
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-800">
                    {rule.is_inclusive
                      ? "Tax Inclusive"
                      : "Tax Exclusive"}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {rule.is_inclusive
                      ? "Tax is already included in the displayed price."
                      : "Tax is added to the booking subtotal."}
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-5 flex gap-3">

                  <button
                    onClick={() =>
                      navigate(
                        `/admin/tax/${rule.id}/edit`
                      )
                    }
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    <Pencil size={16} />
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      handleToggle(rule)
                    }
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
          ))}

        </div>
      )}
    </div>
  );
}