import { useEffect, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import {
  createAdminPricingRule,
  getAdminPricingRuleById,
  updateAdminPricingRule,
} from "../services/pricing";

import { getAdminPackages } from "../services/packages";

const inputClass =
  "w-full min-w-0 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-forest-700 focus:ring-4 focus:ring-forest-100";

export default function PricingForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = Boolean(id);

  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    package_id: "",
    guest_type: "adult",
    price: "",
    min_age: "",
    max_age: "",
    is_active: true,
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const packageData = await getAdminPackages();

      setPackages(
        (packageData.packages || []).filter(
          (pkg) => pkg.is_active || pkg.id === form.package_id
        )
      );

      if (isEdit) {
        const pricingData = await getAdminPricingRuleById(id);
        const rule = pricingData.pricingRule;

        setForm({
          package_id: rule.package_id || "",
          guest_type: rule.guest_type || "adult",
          price: rule.price ?? "",
          min_age: rule.min_age ?? "",
          max_age: rule.max_age ?? "",
          is_active: rule.is_active ?? true,
        });

        // Reload packages so the current package is always available.
        const refreshedPackages = packageData.packages || [];

        setPackages(
          refreshedPackages.filter(
            (pkg) => pkg.is_active || pkg.id === rule.package_id
          )
        );
      } else {
        setPackages(packageData.packages || []);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load pricing data");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.package_id) {
      setError("Please select a package.");
      return;
    }

    if (form.price === "" || Number(form.price) < 0) {
      setError("Please enter a valid price.");
      return;
    }

    if (
      form.min_age !== "" &&
      form.max_age !== "" &&
      Number(form.min_age) > Number(form.max_age)
    ) {
      setError("Minimum age cannot be greater than maximum age.");
      return;
    }

    if (
      form.min_age !== "" &&
      Number(form.min_age) < 0
    ) {
      setError("Minimum age cannot be negative.");
      return;
    }

    if (
      form.max_age !== "" &&
      Number(form.max_age) < 0
    ) {
      setError("Maximum age cannot be negative.");
      return;
    }

    const payload = {
      package_id: form.package_id,
      guest_type: form.guest_type,
      price: Number(form.price),
      min_age:
        form.min_age === ""
          ? null
          : Number(form.min_age),
      max_age:
        form.max_age === ""
          ? null
          : Number(form.max_age),
      is_active: form.is_active,
    };

    try {
      setSaving(true);

      if (isEdit) {
        await updateAdminPricingRule(id, payload);
      } else {
        await createAdminPricingRule(payload);
      }

      navigate("/admin/pricing");
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          `Failed to ${isEdit ? "update" : "create"} pricing rule`
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
          Loading pricing rule...
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
          onClick={() => navigate("/admin/pricing")}
          className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50"
        >
          <ArrowLeft size={18} />
        </button>

        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-forest-700">
            Pricing Management
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-gray-950">
            {isEdit
              ? "Edit Pricing Rule"
              : "Add Pricing Rule"}
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Set pricing for a specific guest type and package.
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Basic Pricing */}
        <section className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-5">
            <h2 className="font-semibold text-gray-950">
              Pricing Details
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Choose the package and guest category.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">

            {/* Package */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Package
              </label>

              <select
                name="package_id"
                value={form.package_id}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="">
                  Select package
                </option>

                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Guest Type */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Guest Type
              </label>

              <select
                name="guest_type"
                value={form.guest_type}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="adult">
                  Adult
                </option>

                <option value="child">
                  Child
                </option>

                <option value="infant">
                  Infant
                </option>
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Price
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">
                  ₹
                </span>

                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="2000"
                  className={`${inputClass} pl-9`}
                  required
                />
              </div>

              <p className="mt-1.5 text-xs text-gray-400">
                Price charged per guest.
              </p>
            </div>

          </div>
        </section>

        {/* Age Rules */}
        <section className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-5">
            <h2 className="font-semibold text-gray-950">
              Age Rules
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Define the age range for this guest category.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Minimum Age
              </label>

              <input
                type="number"
                name="min_age"
                value={form.min_age}
                onChange={handleChange}
                min="0"
                placeholder="Example: 5"
                className={inputClass}
              />

              <p className="mt-1.5 text-xs text-gray-400">
                Leave empty if there is no minimum.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Maximum Age
              </label>

              <input
                type="number"
                name="max_age"
                value={form.max_age}
                onChange={handleChange}
                min="0"
                placeholder="Example: 12"
                className={inputClass}
              />

              <p className="mt-1.5 text-xs text-gray-400">
                Leave empty if there is no maximum.
              </p>
            </div>

          </div>
        </section>

        {/* Status */}
        <section className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-5 p-6">

            <div>
              <h2 className="font-semibold text-gray-950">
                Pricing Status
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Inactive pricing rules are not used for new bookings.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  is_active: !prev.is_active,
                }))
              }
              className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                form.is_active
                  ? "bg-forest-800"
                  : "bg-gray-300"
              }`}
              aria-label="Toggle pricing status"
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
            onClick={() => navigate("/admin/pricing")}
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
              : "Create Pricing"}
          </button>

        </div>

      </form>
    </div>
  );
}