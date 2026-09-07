import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import {
  requestCustomerOtp,
} from "../services/customerAuth";


const MyBookings = () => {
  const navigate = useNavigate();

  const [
    bookingReference,
    setBookingReference,
  ] = useState("");

  const [email, setEmail] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!bookingReference.trim()) {
      setError(
        "Please enter your booking reference."
      );
      return;
    }

    if (!email.trim()) {
      setError(
        "Please enter your email address."
      );
      return;
    }

    try {
      setLoading(true);

      await requestCustomerOtp({
        bookingReference:
          bookingReference.trim(),

        email: email
          .trim()
          .toLowerCase(),
      });

      navigate("/my-bookings/verify", {
        state: {
          bookingReference:
            bookingReference.trim(),

          email: email
            .trim()
            .toLowerCase(),
        },
      });
    } catch (error) {
      setError(
        error.message ||
          "Unable to send verification code."
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <main className="min-h-screen bg-cream-50">

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:px-8 lg:py-24">

        <div className="mx-auto max-w-xl">

          <div className="mb-10 text-center">

            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-900 text-cream-50">
              <CalendarDays
                size={26}
              />
            </div>

            <h1 className="font-display text-4xl font-semibold tracking-tight text-forest-950 sm:text-5xl">
              My Bookings
            </h1>

            <p className="mt-4 text-base leading-7 text-earth-900/70">
              Access your camp bookings,
              payments and cancellation
              information securely.
            </p>

          </div>


          <div className="rounded-3xl border border-forest-900/10 bg-white p-6 shadow-sm sm:p-8">

            <div className="mb-7 flex gap-3 rounded-2xl bg-forest-50 p-4">

              <LockKeyhole
                className="mt-0.5 shrink-0 text-forest-900"
                size={20}
              />

              <div>

                <p className="text-sm font-semibold text-forest-950">
                  Secure access
                </p>

                <p className="mt-1 text-sm leading-6 text-earth-900/70">
                  We'll send a one-time
                  verification code to the
                  email used for your booking.
                </p>

              </div>

            </div>


            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              <div>

                <label
                  htmlFor="bookingReference"
                  className="mb-2 block text-sm font-medium text-forest-950"
                >
                  Booking Reference
                </label>

                <input
                  id="bookingReference"
                  type="text"
                  value={bookingReference}
                  onChange={(event) =>
                    setBookingReference(
                      event.target.value
                    )
                  }
                  placeholder="YNS-XXXXXXXX-XXXXXXXX"
                  autoComplete="off"
                  className="w-full rounded-xl border border-forest-900/15 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-forest-900 focus:ring-2 focus:ring-forest-900/10"
                />

              </div>


              <div>

                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-forest-950"
                >
                  Booking Email
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full rounded-xl border border-forest-900/15 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-forest-900 focus:ring-2 focus:ring-forest-900/10"
                />

              </div>


              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}


              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-forest-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-forest-950 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Sending code..."
                  : "Continue securely"}

                {!loading && (
                  <ArrowRight
                    size={18}
                  />
                )}
              </button>

            </form>


            <div className="mt-7 flex items-center justify-center gap-2 text-xs text-earth-900/60">

              <ShieldCheck
                size={15}
              />

              <span>
                Your booking information
                is protected.
              </span>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
};

export default MyBookings;