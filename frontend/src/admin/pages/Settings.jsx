import { useEffect, useState } from "react";
import {
  Save,
  Settings as SettingsIcon,
  Users,
  Clock,
  CalendarDays,
  LogIn,
  LogOut,
  Power,
} from "lucide-react";

import {
  getAdminSettings,
  updateAdminSetting,
} from "../services/settings";

const settingConfig = {
  business_name: {
    label: "Business Name",
    description: "Name displayed across the website.",
    icon: SettingsIcon,
    type: "text",
  },

  daily_site_capacity: {
    label: "Daily Site Capacity",
    description: "Maximum number of guests allowed per day.",
    icon: Users,
    type: "number",
    min: 1,
  },

  minimum_booking_lead_hours: {
    label: "Minimum Booking Lead Time",
    description: "Minimum number of hours required before a booking date.",
    icon: Clock,
    type: "number",
    min: 0,
  },

  booking_cancellation_hours: {
    label: "Cancellation Window",
    description: "Number of hours before check-in when cancellation is allowed.",
    icon: CalendarDays,
    type: "number",
    min: 0,
  },

  default_check_in_time: {
    label: "Default Check-in Time",
    description: "Default check-in time for bookings.",
    icon: LogIn,
    type: "time",
  },

  default_check_out_time: {
    label: "Default Check-out Time",
    description: "Default check-out time for bookings.",
    icon: LogOut,
    type: "time",
  },

  booking_enabled: {
    label: "Online Booking",
    description: "Enable or disable new online bookings.",
    icon: Power,
    type: "boolean",
  },
};

export default function Settings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);

      const response = await getAdminSettings();

      const settingsObject = {};

      (response.settings || []).forEach((setting) => {
        settingsObject[setting.setting_key] = setting.setting_value;
      });

      setSettings(settingsObject);
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async (key) => {
    try {
      setSavingKey(key);
      setMessage("");

      await updateAdminSetting(key, settings[key]);

      setMessage(`${settingConfig[key]?.label || key} updated successfully.`);

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error("Failed to update setting:", error);
      setMessage("Failed to update setting.");
    } finally {
      setSavingKey(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-sm text-gray-500">
          Loading settings...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-900 text-white">
            <SettingsIcon size={21} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Site Settings
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage booking and website configuration.
            </p>
          </div>
        </div>
      </div>

      {/* Success/Error message */}
      {message && (
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 shadow-sm">
          {message}
        </div>
      )}

      {/* Settings */}
      <div className="grid gap-5">
        {Object.entries(settingConfig).map(
          ([key, config]) => {
            const Icon = config.icon;

            if (!(key in settings)) {
              return null;
            }

            return (
              <div
                key={key}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  {/* Info */}
                  <div className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-forest-50 text-forest-900">
                      <Icon size={20} />
                    </div>

                    <div>
                      <h2 className="font-semibold text-gray-900">
                        {config.label}
                      </h2>

                      <p className="mt-1 max-w-xl text-sm text-gray-500">
                        {config.description}
                      </p>

                      <p className="mt-2 text-xs text-gray-400">
                        Key: {key}
                      </p>
                    </div>
                  </div>

                  {/* Control */}
                  <div className="flex w-full gap-3 lg:w-auto">
                    {config.type === "boolean" ? (
                      <button
                        type="button"
                        onClick={() =>
                          handleChange(
                            key,
                            settings[key] === "true"
                              ? "false"
                              : "true"
                          )
                        }
                        className={`relative h-11 w-20 rounded-full transition ${
                          settings[key] === "true"
                            ? "bg-forest-900"
                            : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`absolute top-1 h-9 w-9 rounded-full bg-white shadow transition ${
                            settings[key] === "true"
                              ? "left-10"
                              : "left-1"
                          }`}
                        />

                        <span className="sr-only">
                          Toggle {config.label}
                        </span>
                      </button>
                    ) : (
                      <input
                        type={config.type}
                        min={config.min}
                        value={settings[key] ?? ""}
                        onChange={(e) =>
                          handleChange(key, e.target.value)
                        }
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-forest-700 focus:ring-4 focus:ring-forest-100 lg:w-72"
                      />
                    )}

                    <button
                      type="button"
                      onClick={() => handleSave(key)}
                      disabled={savingKey === key}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-forest-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Save size={17} />

                      {savingKey === key
                        ? "Saving..."
                        : "Save"}
                    </button>
                  </div>
                </div>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}