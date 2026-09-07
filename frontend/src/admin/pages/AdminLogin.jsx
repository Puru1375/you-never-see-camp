import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../services/admin";

const AdminLogin = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!form.email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await adminLogin({
        email: form.email,
        password: form.password,
      });

      if (!response.success) {
        throw new Error(
          response.message || "Login failed."
        );
      }

      localStorage.setItem(
        "admin_token",
        response.data.token
      );

      localStorage.setItem(
        "admin_user",
        JSON.stringify(response.data.admin)
      );

      navigate("/admin/dashboard", {
        replace: true,
      });
    } catch (error) {
      setError(
        error.message ||
          "Unable to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-forest-950 flex items-center justify-center px-6 py-12">

      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="mb-8 text-center">

          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-white p-2 shadow-lg">
            <img
              src="/logo.png"
              alt="You Never See Camp"
              className="h-full w-full object-contain"
            />
          </div>

          <p className="text-sm font-medium uppercase tracking-[0.25em] text-fire-500">
            You Never See Camp
          </p>

          <h1 className="mt-3 text-3xl font-bold text-white">
            Admin Portal
          </h1>

          <p className="mt-2 text-sm text-white/60">
            Sign in to manage your camping business
          </p>

        </div>

        {/* Login Card */}
        <div className="rounded-3xl bg-white p-7 shadow-2xl sm:p-8">

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Email Address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="admin@example.com"
                disabled={loading}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-forest-900 focus:ring-2 focus:ring-forest-900/10 disabled:bg-slate-100"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                disabled={loading}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-forest-900 focus:ring-2 focus:ring-forest-900/10 disabled:bg-slate-100"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-forest-950 px-5 py-3.5 font-semibold text-white transition hover:bg-forest-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

          </form>

        </div>

        {/* Back */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-sm text-white/60 transition hover:text-white"
          >
            ← Back to website
          </button>
        </div>

      </div>

    </main>
  );
};

export default AdminLogin;