import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getBookingByReference } from "../services/booking";

const BookingSuccess = () => {
  const [searchParams] = useSearchParams();

  const reference = searchParams.get("reference");

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBooking = async () => {
      if (!reference) {
        setError("Booking reference is missing.");
        setLoading(false);
        return;
      }

      try {
        const response = await getBookingByReference(reference);

        if (response.success) {
          setBooking(response.data);
        } else {
          setError(response.message || "Unable to load booking.");
        }
      } catch (err) {
        setError(
          err.message || "Unable to load booking details."
        );
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [reference]);

  if (loading) {
    return (
      <main className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-forest-900/20 border-t-forest-900" />

          <p className="mt-4 text-earth-700">
            Loading your booking...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-cream-50 flex items-center justify-center px-6">
        <div className="max-w-lg text-center">
          <h1 className="text-3xl font-semibold text-forest-950">
            Booking Not Found
          </h1>

          <p className="mt-4 text-earth-700">
            {error}
          </p>

          <Link
            to="/"
            className="mt-8 inline-block rounded-full bg-forest-900 px-8 py-4 font-semibold text-white"
          >
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream-50 px-6 py-16 md:py-24">
      <div className="mx-auto max-w-4xl">

        {/* Success */}
        <div className="text-center">

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-forest-900 text-4xl text-white">
            ✓
          </div>

          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.25em] text-fire-500">
            Booking Confirmed
          </p>

          <h1 className="mt-3 text-4xl font-semibold text-forest-950 md:text-6xl">
            Your adventure is booked!
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-earth-700">
            Thank you for choosing You Never See Camp.
            We look forward to welcoming you.
          </p>
        </div>

        {/* Booking Card */}
        <div className="mt-12 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-forest-900/10">

          {/* Header */}
          <div className="bg-forest-950 px-6 py-6 text-white md:px-8">
            <p className="text-sm text-white/60">
              Booking Reference
            </p>

            <p className="mt-1 text-2xl font-bold tracking-wider">
              {booking.booking_reference}
            </p>
          </div>

          <div className="space-y-8 p-6 md:p-8">

            {/* Package */}
            <section>
              <p className="text-sm text-earth-500">
                Package
              </p>

              <h2 className="mt-1 text-2xl font-semibold text-forest-950">
                {booking.package_name}
              </h2>

              <p className="mt-1 text-earth-600">
                {booking.duration}
              </p>
            </section>

            {/* Details */}
            <section className="grid gap-6 border-y border-earth-900/10 py-8 sm:grid-cols-2">

              <div>
                <p className="text-sm text-earth-500">
                  Booking Date
                </p>

                <p className="mt-1 font-semibold text-forest-950">
                  {new Date(booking.booking_date).toLocaleDateString(
                    "en-IN",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }
                  )}
                </p>
              </div>

              <div>
                <p className="text-sm text-earth-500">
                  Guests
                </p>

                <p className="mt-1 font-semibold text-forest-950">
                  {booking.adults} Adult
                  {booking.adults !== 1 ? "s" : ""}
                  {booking.children > 0 &&
                    ` • ${booking.children} Child${
                      booking.children !== 1 ? "ren" : ""
                    }`}
                  {booking.infants > 0 &&
                    ` • ${booking.infants} Infant${
                      booking.infants !== 1 ? "s" : ""
                    }`}
                </p>
              </div>

              <div>
                <p className="text-sm text-earth-500">
                  Check-in
                </p>

                <p className="mt-1 font-semibold text-forest-950">
                  {booking.check_in_time || "2:00 PM"}
                </p>
              </div>

              <div>
                <p className="text-sm text-earth-500">
                  Check-out
                </p>

                <p className="mt-1 font-semibold text-forest-950">
                  {booking.check_out_time || "11:00 AM"}
                </p>
              </div>

            </section>

            {/* Customer */}
            <section>
              <h3 className="text-lg font-semibold text-forest-950">
                Guest Details
              </h3>

              <div className="mt-4 space-y-2 text-earth-700">
                <p>{booking.customer_name}</p>
                <p>{booking.customer_phone}</p>

                {booking.customer_email && (
                  <p>{booking.customer_email}</p>
                )}
              </div>
            </section>

            {/* Payment */}
            <section className="rounded-2xl bg-cream-50 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-earth-500">
                    Payment Status
                  </p>

                  <p className="mt-1 font-semibold capitalize text-forest-950">
                    {booking.status}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm text-earth-500">
                    Total Paid
                  </p>

                  <p className="mt-1 text-2xl font-bold text-forest-950">
                    ₹{Number(booking.total_amount).toLocaleString(
                      "en-IN"
                    )}
                  </p>
                </div>
              </div>
            </section>

          </div>
        </div>

        {/* Actions */}
        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">

          <Link
            to="/"
            className="rounded-full bg-forest-900 px-8 py-4 text-center font-semibold text-white transition hover:bg-forest-800"
          >
            Back to Home
          </Link>

          <Link
            to="/packages"
            className="rounded-full border border-forest-900 px-8 py-4 text-center font-semibold text-forest-900 transition hover:bg-forest-900 hover:text-white"
          >
            Explore Packages
          </Link>

        </div>

      </div>
    </main>
  );
};

export default BookingSuccess;