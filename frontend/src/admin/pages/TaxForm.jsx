import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Save,
} from "lucide-react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  createAdminTaxRule,
  getAdminTaxRuleById,
  updateAdminTaxRule,
} from "../services/tax";

const inputClass =
  "w-full min-w-0 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-forest-700 focus:ring-4 focus:ring-forest-100";

export default function TaxForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = Boolean(id);

  const [loading, setLoading] =
    useState(isEdit);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [form, setForm] = useState({
    name: "",
    percentage: "",
    is_inclusive: false,
    is_active: true,
  });

  useEffect(() => {
    if (isEdit) {
      loadRule();
    }
  }, [id]);

  const loadRule = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await getAdminTaxRuleById(id);

      const rule = data.taxRule;

      setForm({
        name: rule.name || "",
        percentage:
          rule.percentage ?? "",
        is_inclusive:
          rule.is_inclusive ?? false,
        is_active:
          rule.is_active ?? true,
      });
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Failed to load tax rule"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } =
      e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const name = form.name.trim();

    const percentage = Number(
      form.percentage
    );

    if (!name) {
      setError(
        "Tax name is required."
      );
      return;
    }

    if (
      !Number.isFinite(percentage) ||
      percentage < 0 ||
      percentage > 100
    ) {
      setError(
        "Tax percentage must be between 0 and 100."
      );
      return;
    }

    const payload = {
      name,
      percentage,
      is_inclusive:
        form.is_inclusive,
      is_active:
        form.is_active,
    };

    try {
      setSaving(true);

      if (isEdit) {
        await updateAdminTaxRule(
          id,
          payload
        );
      } else {
        await createAdminTaxRule(
          payload
        );
      }

      navigate("/admin/tax");
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          `Failed to ${
            isEdit
              ? "update"
              : "create"
          } tax rule`
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
          Loading tax rule...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 pb-10">

      {/* Header */}
      <div className="flex items-start gap-4">

        <button
          type="button"
          onClick={() =>
            navigate("/admin/tax")
          }
          className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50"
        >
          <ArrowLeft size={18} />
        </button>

        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-forest-700">
            Tax Management
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-gray-950">
            {isEdit
              ? "Edit Tax Rule"
              : "Add Tax Rule"}
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Configure the tax applied to new bookings.
          </p>
        </div>

      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >

        {/* Tax Details */}
        <section className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b border-gray-100 px-6 py-5">
            <h2 className="font-semibold text-gray-950">
              Tax Details
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Set the tax name and percentage.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">

            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Tax Name
              </label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="GST"
                className={inputClass}
                maxLength={100}
                required
              />
            </div>

            {/* Percentage */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Percentage
              </label>

              <div className="relative">
                <input
                  type="number"
                  name="percentage"
                  value={form.percentage}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="5"
                  className={`${inputClass} pr-10`}
                  required
                />

                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">
                  %
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* Tax Type */}
        <section className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b border-gray-100 px-6 py-5">
            <h2 className="font-semibold text-gray-950">
              Tax Calculation
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Choose whether tax is included in the displayed price.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">

            <button
              type="button"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  is_inclusive: false,
                }))
              }
              className={`rounded-2xl border p-5 text-left transition ${
                !form.is_inclusive
                  ? "border-forest-700 bg-forest-50 ring-2 ring-forest-100"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <p className="font-semibold text-gray-950">
                Tax Exclusive
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Tax is added to the subtotal.
              </p>

              <p className="mt-3 text-xs font-medium text-gray-400">
                Example: ₹2,000 + 5% GST = ₹2,100
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  is_inclusive: true,
                }))
              }
              className={`rounded-2xl border p-5 text-left transition ${
                form.is_inclusive
                  ? "border-forest-700 bg-forest-50 ring-2 ring-forest-100"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <p className="font-semibold text-gray-950">
                Tax Inclusive
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Tax is already included in the price.
              </p>

              <p className="mt-3 text-xs font-medium text-gray-400">
                Example: ₹2,000 includes 5% GST
              </p>
            </button>

          </div>
        </section>

        {/* Status */}
        <section className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="flex items-center justify-between gap-5 p-6">

            <div>
              <h2 className="font-semibold text-gray-950">
                Tax Status
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Only the active tax rule is applied to new bookings.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  is_active:
                    !prev.is_active,
                }))
              }
              className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                form.is_active
                  ? "bg-forest-800"
                  : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                  form.is_active
                    ? "left-6"
                    : "left-1"
                }`}
              />
            </button>

          </div>
        </section>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

          <button
            type="button"
            onClick={() =>
              navigate("/admin/tax")
            }
            className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={17} />

            {saving
              ? "Saving..."
              : isEdit
              ? "Save Changes"
              : "Create Tax Rule"}
          </button>

        </div>

      </form>
    </div>
  );
}