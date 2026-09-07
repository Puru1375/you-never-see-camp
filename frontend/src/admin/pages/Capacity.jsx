import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Users,
  UserCheck,
  UserRoundCheck,
  RefreshCcw,
} from "lucide-react";

import { getCapacity } from "../services/capacity";

const getToday = () => {
  return new Date().toISOString().slice(0, 10);
};

const Capacity = () => {
  const [date, setDate] = useState(getToday());
  const [capacity, setCapacity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCapacity = async (selectedDate = date) => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getCapacity(selectedDate);

      setCapacity(response || null);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to load capacity."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCapacity(date);
  }, [date]);

  const usagePercentage = useMemo(() => {
    if (!capacity?.dailyCapacity) {
      return 0;
    }

    return Math.min(
      (capacity.bookedGuests /
        capacity.dailyCapacity) *
        100,
      100
    );
  }, [capacity]);

  const remainingPercentage = Math.max(
    100 - usagePercentage,
    0
  );

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 pb-10 sm:px-6 lg:px-8">

      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        <div>
          <h1 className="text-2xl font-semibold text-forest-950">
            Capacity
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Monitor daily guest capacity and
            availability.
          </p>
        </div>

        <div className="flex items-center gap-3">

          <div className="relative">
            <CalendarDays
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="date"
              value={date}
              onChange={(e) =>
                setDate(e.target.value)
              }
              className="rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-forest-700"
            />
          </div>

          <button
            type="button"
            onClick={() => loadCapacity()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCcw
              size={16}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>

        </div>

      </div>

      {/* Error */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Main capacity card */}

      <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8">

        {loading && !capacity ? (
          <div className="flex min-h-[250px] items-center justify-center text-sm text-gray-500">
            <RefreshCcw
              size={18}
              className="mr-2 animate-spin"
            />
            Loading capacity...
          </div>
        ) : capacity ? (
          <>

            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <p className="text-sm font-medium text-gray-500">
                  Daily capacity
                </p>

                <div className="mt-2 flex items-baseline gap-2">

                  <span className="text-5xl font-semibold tracking-tight text-forest-950">
                    {capacity.dailyCapacity}
                  </span>

                  <span className="text-gray-500">
                    guests
                  </span>

                </div>

                <p className="mt-3 text-sm text-gray-500">
                  {capacity.date}
                </p>

              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">

                <Metric
                  icon={Users}
                  label="Booked"
                  value={
                    capacity.bookedGuests
                  }
                />

                <Metric
                  icon={UserCheck}
                  label="Available"
                  value={
                    capacity.availableGuests
                  }
                />

                <Metric
                  icon={UserRoundCheck}
                  label="Used"
                  value={`${Math.round(
                    usagePercentage
                  )}%`}
                />

              </div>

            </div>

            {/* Progress */}

            <div className="mt-10">

              <div className="mb-3 flex items-center justify-between text-sm">

                <span className="font-medium text-gray-700">
                  Capacity usage
                </span>

                <span className="font-semibold text-forest-900">
                  {Math.round(
                    usagePercentage
                  )}
                  %
                </span>

              </div>

              <div className="h-4 overflow-hidden rounded-full bg-gray-100">

                <div
                  className="h-full rounded-full bg-forest-800 transition-all duration-500"
                  style={{
                    width: `${usagePercentage}%`,
                  }}
                />

              </div>

              <div className="mt-3 flex justify-between text-xs text-gray-500">

                <span>
                  {capacity.bookedGuests} booked
                </span>

                <span>
                  {capacity.availableGuests} remaining
                </span>

              </div>

            </div>

          </>
        ) : null}

      </div>

      {/* Capacity summary */}

      {capacity && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          <SummaryCard
            title="Total Capacity"
            value={capacity.dailyCapacity}
            description="Maximum guests allowed"
          />

          <SummaryCard
            title="Booked Guests"
            value={capacity.bookedGuests}
            description="Current capacity usage"
          />

          <SummaryCard
            title="Available Guests"
            value={capacity.availableGuests}
            description="Remaining booking capacity"
          />

        </div>
      )}

    </div>
  );
};

const Metric = ({
  icon: Icon,
  label,
  value,
}) => {
  return (
    <div className="min-w-[120px] rounded-2xl bg-gray-50 p-4">

      <Icon
        size={19}
        className="text-forest-800"
      />

      <p className="mt-3 text-xs text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-xl font-semibold text-gray-900">
        {value}
      </p>

    </div>
  );
};

const SummaryCard = ({
  title,
  value,
  description,
}) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">

      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-3xl font-semibold text-forest-950">
        {value}
      </p>

      <p className="mt-1 text-xs text-gray-400">
        {description}
      </p>

    </div>
  );
};

export default Capacity;