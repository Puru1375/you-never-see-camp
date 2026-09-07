import {
  useEffect,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";

import {
  requestCustomerOtp,
  verifyCustomerOtp,
} from "../services/customerAuth";


const MyBookingsVerify = () => {
  const location =
    useLocation();

  const navigate =
    useNavigate();

  const {
    bookingReference,
    email,
  } = location.state || {};


  const [otp, setOtp] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [resending, setResending] =
    useState(false);

  const [error, setError] =
    useState("");

  const [
    resendAvailable,
    setResendAvailable,
  ] = useState(false);


  useEffect(() => {
    if (
      !bookingReference ||
      !email
    ) {
      navigate(
        "/my-bookings",
        { replace: true }
      );
    }
  }, [
    bookingReference,
    email,
    navigate,
  ]);


  useEffect(() => {
    const timer =
      setTimeout(() => {
        setResendAvailable(true);
      }, 30000);

    return () =>
      clearTimeout(timer);
  }, []);


  const handleVerify = async (
    event
  ) => {
    event.preventDefault();

    setError("");

    if (!/^\d{6}$/.test(otp)) {
      setError(
        "Enter the 6-digit verification code."
      );
      return;
    }

    try {
      setLoading(true);

      await verifyCustomerOtp({
        bookingReference,
        email,
        otp,
      });

      navigate(
        "/my-bookings/list",
        { replace: true }
      );
    } catch (error) {
      setError(
        error.message ||
          "Invalid verification code."
      );
    } finally {
      setLoading(false);
    }
  };


  const handleResend = async () => {
    if (!resendAvailable) {
      return;
    }

    setError("");

    try {
      setResending(true);

      await requestCustomerOtp({
        bookingReference,
        email,
      });

      setResendAvailable(false);

      setTimeout(() => {
        setResendAvailable(true);
      }, 30000);
    } catch (error) {
      setError(
        error.message ||
          "Unable to resend code."
      );
    } finally {
      setResending(false);
    }
  };


  return (
    <main className="min-h-screen bg-cream-50">

      <section className="mx-auto max-w-xl px-5 py-16 sm:px-6 lg:py-24">

        <button
          type="button"
          onClick={() =>
            navigate("/my-bookings")
          }
          className="mb-8 flex items-center gap-2 text-sm font-medium text-forest-900"
        >
          <ArrowLeft
            size={17}
          />

          Back
        </button>


        <div className="rounded-3xl border border-forest-900/10 bg-white p-6 shadow-sm sm:p-8">

          <div className="mb-8 text-center">

            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-900 text-white">
              <ShieldCheck
                size={27}
              />
            </div>

            <h1 className="font-display text-3xl font-semibold text-forest-950">
              Verify your booking
            </h1>

            <p className="mt-3 text-sm leading-6 text-earth-900/70">
              Enter the 6-digit code sent
              to your booking email.
            </p>

            <p className="mt-2 text-xs text-earth-900/50">
              {email}
            </p>

          </div>


          <form
            onSubmit={handleVerify}
            className="space-y-5"
          >

            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(event) =>
                setOtp(
                  event.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6)
                )
              }
              placeholder="000000"
              autoComplete="one-time-code"
              className="w-full rounded-xl border border-forest-900/15 bg-white px-4 py-4 text-center text-2xl font-semibold tracking-[0.5em] outline-none focus:border-forest-900 focus:ring-2 focus:ring-forest-900/10"
            />


            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}


            <button
              type="submit"
              disabled={
                loading ||
                otp.length !== 6
              }
              className="w-full rounded-xl bg-forest-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-forest-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Verifying..."
                : "Verify & View Bookings"}
            </button>

          </form>


          <div className="mt-6 text-center">

            <button
              type="button"
              disabled={
                !resendAvailable ||
                resending
              }
              onClick={handleResend}
              className="text-sm font-medium text-forest-900 disabled:cursor-not-allowed disabled:text-earth-900/40"
            >
              {resending
                ? "Sending..."
                : resendAvailable
                ? "Resend code"
                : "Resend available in 30 seconds"}
            </button>

          </div>

        </div>

      </section>

    </main>
  );
};

export default MyBookingsVerify;