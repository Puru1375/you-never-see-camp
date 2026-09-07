import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Loader2,
  Plus,
  Save,
  Star,
  Trash2,
} from "lucide-react";

import {
  createAdminPackage,
  getAdminPackageById,
  updateAdminPackage,
} from "../services/packages";

import PackageImages from "../components/PackageImages";

const initialForm = {
  slug: "",
  name: "",
  tagline: "",
  description: "",
  base_price: "",
  price_label: "per guest",
  duration: "",
  accommodation: "",
  max_guests: 1,
  check_in_time: "14:00",
  check_out_time: "11:00",
  featured: false,
  is_active: true,
  meals: [],
  activities: [],
};

export default function PackageForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEdit = Boolean(id);

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [mealInput, setMealInput] = useState("");
  const [activityInput, setActivityInput] = useState("");

  useEffect(() => {
    if (!isEdit) return;

    const loadPackage = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getAdminPackageById(id);

        const pkg = data.package;

        setForm({
          slug: pkg.slug || "",
          name: pkg.name || "",
          tagline: pkg.tagline || "",
          description: pkg.description || "",
          base_price: pkg.base_price || "",
          price_label: pkg.price_label || "per guest",
          duration: pkg.duration || "",
          accommodation: pkg.accommodation || "",
          max_guests: pkg.max_guests || 1,
          check_in_time: pkg.check_in_time
            ? pkg.check_in_time.slice(0, 5)
            : "14:00",
          check_out_time: pkg.check_out_time
            ? pkg.check_out_time.slice(0, 5)
            : "11:00",
          featured: Boolean(pkg.featured),
          is_active: Boolean(pkg.is_active),

          meals: (data.meals || []).map(
            (meal) => meal.name
          ),

          activities: (data.activities || []).map(
            (activity) => activity.name
          ),
        });
      } catch (err) {
        console.error(err);
        setError(
          err.message || "Failed to load package"
        );
      } finally {
        setLoading(false);
      }
    };

    loadPackage();
  }, [id, isEdit]);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const generateSlug = () => {
    if (!form.name) return;

    const slug = form.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    updateField("slug", slug);
  };

  const addMeal = () => {
    const value = mealInput.trim();

    if (!value) return;

    if (
      form.meals.some(
        (meal) =>
          meal.toLowerCase() === value.toLowerCase()
      )
    ) {
      setMealInput("");
      return;
    }

    updateField("meals", [...form.meals, value]);
    setMealInput("");
  };

  const removeMeal = (index) => {
    updateField(
      "meals",
      form.meals.filter((_, i) => i !== index)
    );
  };

  const addActivity = () => {
    const value = activityInput.trim();

    if (!value) return;

    if (
      form.activities.some(
        (activity) =>
          activity.toLowerCase() === value.toLowerCase()
      )
    ) {
      setActivityInput("");
      return;
    }

    updateField("activities", [
      ...form.activities,
      value,
    ]);

    setActivityInput("");
  };

  const removeActivity = (index) => {
    updateField(
      "activities",
      form.activities.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!form.name.trim()) {
      setError("Package name is required.");
      return;
    }

    if (!form.slug.trim()) {
      setError("Package slug is required.");
      return;
    }

    if (Number(form.base_price) < 0) {
      setError("Base price cannot be negative.");
      return;
    }

    if (Number(form.max_guests) < 1) {
      setError("Maximum guests must be at least 1.");
      return;
    }

    const payload = {
      ...form,
      name: form.name.trim(),
      slug: form.slug.trim(),
      tagline: form.tagline.trim(),
      description: form.description.trim(),
      accommodation: form.accommodation.trim(),
      base_price: Number(form.base_price || 0),
      max_guests: Number(form.max_guests || 1),
      meals: form.meals,
      activities: form.activities,
    };

    try {
      setSaving(true);

      if (isEdit) {
        await updateAdminPackage(id, payload);
      } else {
        await createAdminPackage(payload);
      }

      navigate("/admin/packages");
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          `Failed to ${isEdit ? "update" : "create"} package`
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-forest-800" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-10">
      {/* HEADER */}

      <div>
        <Link
          to="/admin/packages"
          className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-forest-800"
        >
          <ArrowLeft size={16} />
          Back to packages
        </Link>

        <h1 className="text-2xl font-bold tracking-tight text-gray-950">
          {isEdit ? "Edit Package" : "Create Package"}
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          {isEdit
            ? "Update your camping package details."
            : "Create a new camping package for your customers."}
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {isEdit && (
        <PackageImages
          packageId={id}
          packageSlug={form.slug}
        />
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* BASIC INFORMATION */}

        <section className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <SectionTitle
            number="01"
            title="Basic Information"
            description="The main information customers will see."
          />

          <div className="grid gap-5 p-6 md:grid-cols-2">
            <Field
              label="Package Name"
              required
            >
              <input
                value={form.name}
                onChange={(e) =>
                  updateField("name", e.target.value)
                }
                onBlur={() => {
                  if (!form.slug) generateSlug();
                }}
                placeholder="Jungle Escape"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-forest-700 focus:ring-4 focus:ring-forest-100"
              />
            </Field>

            <Field
              label="Slug"
              required
              hint="Used in the package URL."
            >
              <div className="flex gap-2">
                <input
                  value={form.slug}
                  onChange={(e) =>
                    updateField(
                      "slug",
                      e.target.value
                        .toLowerCase()
                        .replace(/\s+/g, "-")
                    )
                  }
                  placeholder="jungle-escape"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-forest-700 focus:ring-4 focus:ring-forest-100"
                />

                <button
                  type="button"
                  onClick={generateSlug}
                  className="shrink-0 rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Generate
                </button>
              </div>
            </Field>

            <div className="md:col-span-2">
              <Field label="Tagline">
                <input
                  value={form.tagline}
                  onChange={(e) =>
                    updateField(
                      "tagline",
                      e.target.value
                    )
                  }
                  placeholder="Slow down. Breathe deep. Get closer to nature."
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-forest-700 focus:ring-4 focus:ring-forest-100"
                />
              </Field>
            </div>

            <div className="md:col-span-2">
              <Field label="Description">
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    updateField(
                      "description",
                      e.target.value
                    )
                  }
                  rows={5}
                  placeholder="Describe the camping experience..."
                  className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-forest-700 focus:ring-4 focus:ring-forest-100"
                />
              </Field>
            </div>
          </div>
        </section>

        {/* PRICING */}

        <section className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <SectionTitle
            number="02"
            title="Pricing & Capacity"
            description="Base package price and guest capacity."
          />

          <div className="grid gap-5 p-6 md:grid-cols-3">
            <Field
              label="Base Price"
              required
              hint="Final booking price is calculated by the pricing engine."
            >
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
                  ₹
                </span>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.base_price}
                  onChange={(e) =>
                    updateField(
                      "base_price",
                      e.target.value
                    )
                  }
                  placeholder="2000"
                  className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-9 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-forest-700 focus:ring-4 focus:ring-forest-100"
                />
              </div>
            </Field>

            <Field label="Price Label">
              <select
                value={form.price_label}
                onChange={(e) =>
                  updateField(
                    "price_label",
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-forest-700 focus:ring-4 focus:ring-forest-100"
              >
                <option value="per guest">
                  per guest
                </option>
                <option value="per night">
                  per night
                </option>
                <option value="per package">
                  per package
                </option>
              </select>
            </Field>

            <Field
              label="Maximum Guests"
              required
            >
              <input
                type="number"
                min="1"
                value={form.max_guests}
                onChange={(e) =>
                  updateField(
                    "max_guests",
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-forest-700 focus:ring-4 focus:ring-forest-100"
              />
            </Field>
          </div>
        </section>

        {/* STAY */}

        <section className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <SectionTitle
            number="03"
            title="Stay Details"
            description="Accommodation, duration and check-in information."
          />

          <div className="grid gap-5 p-6 md:grid-cols-2">
            <Field label="Duration">
              <input
                value={form.duration}
                onChange={(e) =>
                  updateField(
                    "duration",
                    e.target.value
                  )
                }
                placeholder="1 Night / 2 Days"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-forest-700 focus:ring-4 focus:ring-forest-100"
              />
            </Field>

            <Field label="Accommodation">
              <input
                value={form.accommodation}
                onChange={(e) =>
                  updateField(
                    "accommodation",
                    e.target.value
                  )
                }
                placeholder="Premium Camping Tent"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-forest-700 focus:ring-4 focus:ring-forest-100"
              />
            </Field>

            <Field label="Check-in Time">
              <input
                type="time"
                value={form.check_in_time}
                onChange={(e) =>
                  updateField(
                    "check_in_time",
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-forest-700 focus:ring-4 focus:ring-forest-100"
              />
            </Field>

            <Field label="Check-out Time">
              <input
                type="time"
                value={form.check_out_time}
                onChange={(e) =>
                  updateField(
                    "check_out_time",
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-forest-700 focus:ring-4 focus:ring-forest-100"
              />
            </Field>
          </div>
        </section>

        {/* MEALS */}

        <section className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <SectionTitle
            number="04"
            title="Meals"
            description="Add meals included with this package."
          />

          <div className="p-6">
            <div className="flex gap-2">
              <input
                value={mealInput}
                onChange={(e) =>
                  setMealInput(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addMeal();
                  }
                }}
                placeholder="e.g. Dinner"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-forest-700 focus:ring-4 focus:ring-forest-100"
              />

              <button
                type="button"
                onClick={addMeal}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-forest-900 px-4 text-sm font-semibold text-white hover:bg-forest-950"
              >
                <Plus size={16} />
                Add
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {form.meals.map((meal, index) => (
                <Tag
                  key={`${meal}-${index}`}
                  value={meal}
                  onRemove={() =>
                    removeMeal(index)
                  }
                />
              ))}
            </div>

            {form.meals.length === 0 && (
              <p className="mt-4 text-sm text-gray-400">
                No meals added yet.
              </p>
            )}
          </div>
        </section>

        {/* ACTIVITIES */}

        <section className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <SectionTitle
            number="05"
            title="Activities"
            description="Add experiences included with this package."
          />

          <div className="p-6">
            <div className="flex gap-2">
              <input
                value={activityInput}
                onChange={(e) =>
                  setActivityInput(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addActivity();
                  }
                }}
                placeholder="e.g. Trail Walk"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-forest-700 focus:ring-4 focus:ring-forest-100"
              />

              <button
                type="button"
                onClick={addActivity}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-forest-900 px-4 text-sm font-semibold text-white hover:bg-forest-950"
              >
                <Plus size={16} />
                Add
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {form.activities.map(
                (activity, index) => (
                  <Tag
                    key={`${activity}-${index}`}
                    value={activity}
                    onRemove={() =>
                      removeActivity(index)
                    }
                  />
                )
              )}
            </div>

            {form.activities.length === 0 && (
              <p className="mt-4 text-sm text-gray-400">
                No activities added yet.
              </p>
            )}
          </div>
        </section>

        {/* SETTINGS */}

        <section className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <SectionTitle
            number="06"
            title="Package Settings"
            description="Control how this package appears and whether customers can book it."
          />

          <div className="grid gap-4 p-6 md:grid-cols-2">
            <Toggle
              icon={<Star size={18} />}
              title="Featured Package"
              description="Show this package as a featured experience."
              checked={form.featured}
              onChange={(value) =>
                updateField("featured", value)
              }
            />

            <Toggle
              icon={<Check size={18} />}
              title="Active Package"
              description="Allow customers to book this package."
              checked={form.is_active}
              onChange={(value) =>
                updateField("is_active", value)
              }
            />
          </div>
        </section>

        {/* FOOTER */}

        <div className="sticky bottom-4 z-10 flex flex-col-reverse gap-3 rounded-2xl border border-gray-200 bg-white/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:justify-end">
          <Link
            to="/admin/packages"
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-forest-950 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <Loader2
                size={17}
                className="animate-spin"
              />
            ) : (
              <Save size={17} />
            )}

            {saving
              ? "Saving..."
              : isEdit
              ? "Save Changes"
              : "Create Package"}
          </button>
        </div>
      </form>

      
    </div>
  );
}

/* ========================================================= */
/* COMPONENTS */
/* ========================================================= */

function SectionTitle({
  number,
  title,
  description,
}) {
  return (
    <div className="border-b border-gray-100 px-6 py-5">
      <div className="flex items-start gap-4">
        <span className="rounded-lg bg-forest-50 px-2.5 py-1 text-xs font-bold text-forest-800">
          {number}
        </span>

        <div>
          <h2 className="font-semibold text-gray-950">
            {title}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}) {
  return (
    <div className="w-full min-w-0">
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className="block text-sm font-semibold text-gray-800">
          {label}
          {required && (
            <span className="ml-1 text-red-500">*</span>
          )}
        </label>

        {hint && (
          <span className="hidden text-xs text-gray-400 sm:block">
            {hint}
          </span>
        )}
      </div>

      {children}
    </div>
  );
}

function Tag({ value, onRemove }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-forest-50 px-3 py-1.5 text-sm font-medium text-forest-800">
      {value}

      <button
        type="button"
        onClick={onRemove}
        className="rounded-full text-forest-500 hover:text-red-600"
      >
        <Trash2 size={13} />
      </button>
    </span>
  );
}

function Toggle({
  icon,
  title,
  description,
  checked,
  onChange,
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-4 rounded-xl border p-4 text-left transition ${
        checked
          ? "border-forest-200 bg-forest-50"
          : "border-gray-200 bg-white hover:bg-gray-50"
      }`}
    >
      <div
        className={`rounded-xl p-2.5 ${
          checked
            ? "bg-forest-800 text-white"
            : "bg-gray-100 text-gray-500"
        }`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-gray-500">
          {description}
        </p>
      </div>

      <div
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked
            ? "bg-forest-800"
            : "bg-gray-200"
        }`}
      >
        <div
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
            checked
              ? "left-6"
              : "left-1"
          }`}
        />
      </div>
    </button>
  );
}