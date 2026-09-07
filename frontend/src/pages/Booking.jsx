import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  getPackages,
} from "../services/api";

import {
  checkAvailability,
  getBookingQuote,
  createBooking,
} from "../services/booking";

import {
  createPaymentOrder,
  verifyPayment,
  loadRazorpayScript,
} from "../services/payment";

import { useNavigate } from "react-router-dom"; // navigate

const Booking = () => {
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  const packageSlug =
    searchParams.get("package");

  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] =
    useState(null);

  const [bookingDate, setBookingDate] =
    useState("");

  const [adults, setAdults] =
    useState(1);

  const [children, setChildren] =
    useState(0);

  const [infants, setInfants] =
    useState(0);

  const [customerName, setCustomerName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [specialRequests, setSpecialRequests] =
    useState("");

  const [availability, setAvailability] =
    useState(null);

  const [quote, setQuote] =
    useState(null);

  const [loadingPackages, setLoadingPackages] =
    useState(true);

  const [checkingAvailability, setCheckingAvailability] =
    useState(false);

  const [loadingQuote, setLoadingQuote] =
    useState(false);

  const [creatingBooking, setCreatingBooking] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState(null);

  /*
  |--------------------------------------------------------------------------
  | Load packages
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const loadPackages = async () => {
      try {
        setLoadingPackages(true);

        const response =
          await getPackages();

        const packageList =
          response.data || [];

        setPackages(packageList);

        if (packageSlug) {
          const found =
            packageList.find(
              (item) =>
                item.slug === packageSlug
            );

          if (found) {
            setSelectedPackage(found);
          }
        } else if (packageList.length > 0) {
          setSelectedPackage(
            packageList[0]
          );
        }
      } catch (err) {
        setError(
          err.message ||
            "Unable to load packages"
        );
      } finally {
        setLoadingPackages(false);
      }
    };

    loadPackages();
  }, [packageSlug]);

  /*
  |--------------------------------------------------------------------------
  | Guest count
  |--------------------------------------------------------------------------
  */

  const totalGuests =
    adults +
    children +
    infants;

  /*
  |--------------------------------------------------------------------------
  | Local display price
  |--------------------------------------------------------------------------
  */

  const displayPrice = useMemo(() => {
    if (!selectedPackage) {
      return 0;
    }

    return Number(
      selectedPackage.base_price ||
        selectedPackage.price ||
        0
    );
  }, [selectedPackage]);

  /*
  |--------------------------------------------------------------------------
  | Check availability
  |--------------------------------------------------------------------------
  */

  const handleCheckAvailability =
    async () => {
      setError("");
      setAvailability(null);
      setQuote(null);

      if (!selectedPackage) {
        setError(
          "Please select a package."
        );
        return;
      }

      if (!bookingDate) {
        setError(
          "Please select a camping date."
        );
        return;
      }

      if (totalGuests <= 0) {
        setError(
          "Please select at least one guest."
        );
        return;
      }

      try {
        setCheckingAvailability(true);

        const response =
          await checkAvailability({
            packageId:
              selectedPackage.id,
            date: bookingDate,
            adults,
            children,
            infants,
          });

        setAvailability(
          response.data
        );

        if (
          !response.data.available
        ) {
          setError(
            "Sorry, this date is not available for the selected number of guests."
          );

          return;
        }

        /*
         * Only request the quote after
         * availability succeeds.
         */

        setLoadingQuote(true);

        const quoteResponse =
          await getBookingQuote({
            packageId:
              selectedPackage.id,
            adults,
            children,
            infants,
          });

        setQuote(
          quoteResponse.data
        );
      } catch (err) {
        setError(
          err.message ||
            "Unable to check availability."
        );
      } finally {
        setCheckingAvailability(false);
        setLoadingQuote(false);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Create booking
  |--------------------------------------------------------------------------
  */

  const handleCreateBooking =
    async (event) => {
      event.preventDefault();

      setError("");
      setSuccess(null);

      if (!availability?.available) {
        setError(
          "Please check availability first."
        );
        return;
      }

      if (!quote) {
        setError(
          "Please check availability to calculate the booking price."
        );
        return;
      }

      if (!customerName.trim()) {
        setError(
          "Please enter your name."
        );
        return;
      }

      if (!phone.trim()) {
        setError(
          "Please enter your phone number."
        );
        return;
      }

      if (!email.trim()) {
        setError(
          "Please enter your email."
        );
        return;
      }

      try {
        setCreatingBooking(true);

        const response =
          await createBooking({
            packageId:
              selectedPackage.id,

            customerName:
              customerName.trim(),

            phone:
              phone.trim(),

            email:
              email.trim(),

            bookingDate,

            adults,
            children,
            infants,

            specialRequests:
              specialRequests.trim(),
          });

        setSuccess(
          response.data
        );
      } catch (err) {
        setError(
          err.message ||
            "Unable to create booking."
        );
      } finally {
        setCreatingBooking(false);
      }
    };


    const handlePayment = async () => {
  try {
    setError("");

    const loaded =
      await loadRazorpayScript();

    if (!loaded) {
      throw new Error(
        "Unable to load payment gateway"
      );
    }

    const response =
      await createPaymentOrder(
        success.bookingId
      );

    const payment =
      response.data;

    const options = {
      key: payment.keyId,

      amount: payment.amount,

      currency:
        payment.currency,

      name:
        "You Never See Camp",

      description:
        "Camping Experience",

      order_id:
        payment.orderId,

      prefill: {
        name:
          payment.customer.name,

        email:
          payment.customer.email,

        contact:
          payment.customer.phone,
      },

      notes: {
        booking_reference:
          payment.bookingReference,
      },

      theme: {
        color: "#355E3B",
      },

      handler:
        async (response) => {
          try {
            await verifyPayment(
              response
            );

            /*
             * Don't immediately claim the booking
             * is confirmed here.
             *
             * Webhook will be the authoritative
             * payment-state update.
             */

            window.location.href =
              `/booking-success?reference=${encodeURIComponent(
                payment.bookingReference
              )}`;
          } catch (error) {
            setError(
              error.message ||
                "Payment verification failed."
            );
          }
        },
    };

    const razorpay =
      new window.Razorpay(
        options
      );

    razorpay.on(
      "payment.failed",
      (response) => {
        console.error(
          "Payment failed:",
          response
        );

        setError(
          "Payment failed. Please try again."
        );
      }
    );

    razorpay.open();
  } catch (error) {
    setError(
      error.message ||
        "Unable to start payment."
    );
  }
};

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loadingPackages) {
    return (
      <main className="min-h-screen bg-cream-50 flex items-center justify-center">
        <p className="text-forest-900">
          Loading booking experience...
        </p>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Success
  |--------------------------------------------------------------------------
  */

  if (success) {
    return (
      <main className="min-h-screen bg-cream-50 px-4 py-20">
        <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 text-center shadow-xl sm:p-12">

          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-forest-900 text-2xl text-white">
            ✓
          </div>

          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-fire-500">
            Booking Created
          </p>

          <h1 className="text-3xl font-semibold text-forest-950 sm:text-4xl">
            Your experience is reserved
          </h1>

          <p className="mt-4 text-earth-600">
            Your booking has been created and is waiting for payment.
          </p>

          <div className="mt-8 rounded-2xl bg-cream-50 p-6 text-left">
            <div className="flex justify-between border-b border-earth-200 pb-4">
              <span>Booking Reference</span>

              <strong>
                {success.bookingReference}
              </strong>
            </div>

            <div className="mt-4 flex justify-between">
              <span>Total</span>

              <strong>
                ₹
                {Number(
                  success.total
                ).toLocaleString("en-IN")}
              </strong>
            </div>
          </div>

          <div className="mt-8">
           <button
  type="button"
  onClick={handlePayment}
  className="mt-8 w-full rounded-full bg-fire-500 px-6 py-4 font-semibold text-white transition hover:bg-fire-600"
>
  Pay ₹
  {Number(
    success.total
  ).toLocaleString("en-IN")}{" "}
  Now
</button>

<p className="mt-4 text-xs text-earth-500">
  Secure payment powered by Razorpay.
</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream-50">

      {/* HERO */}

      <section className="bg-forest-950 px-4 pb-16 pt-28 text-white">
        <div className="mx-auto max-w-7xl">

          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-fire-500">
            Reserve your stay
          </p>

          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Book Your Camping Experience
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
            Choose your experience, select your date and guests,
            and we'll take care of the rest.
          </p>

        </div>
      </section>

      {/* BOOKING */}

      <section className="px-4 py-10 sm:py-16">
        <div className="mx-auto max-w-7xl">

          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">

            {/* FORM */}

            <form
              onSubmit={handleCreateBooking}
              className="space-y-8"
            >

              {/* EXPERIENCE */}

              <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">

                <div className="mb-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-fire-500">
                    Step 01
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold text-forest-950">
                    Choose your experience
                  </h2>
                </div>

                <label className="mb-2 block text-sm font-medium text-earth-900">
                  Camping Package
                </label>

                <select
                  value={
                    selectedPackage?.id || ""
                  }
                  onChange={(event) => {
                    const found =
                      packages.find(
                        (item) =>
                          item.id ===
                          event.target.value
                      );

                    setSelectedPackage(
                      found || null
                    );

                    setAvailability(null);
                    setQuote(null);
                    setError("");
                  }}
                  className="w-full rounded-2xl border border-earth-200 bg-white px-4 py-4 text-earth-900 outline-none transition focus:border-forest-700 focus:ring-2 focus:ring-forest-700/10"
                >
                  {packages.map(
                    (item) => (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.name}
                      </option>
                    )
                  )}
                </select>

              </div>

              {/* DATE + GUESTS */}

              <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">

                <div className="mb-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-fire-500">
                    Step 02
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold text-forest-950">
                    Date & guests
                  </h2>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">

                  <div>
                    <label className="mb-2 block text-sm font-medium text-earth-900">
                      Camping Date
                    </label>

                    <input
                      type="date"
                      value={bookingDate}
                      min={
                        new Date()
                          .toISOString()
                          .split("T")[0]
                      }
                      onChange={(event) => {
                        setBookingDate(
                          event.target.value
                        );

                        setAvailability(null);
                        setQuote(null);
                      }}
                      className="w-full rounded-2xl border border-earth-200 px-4 py-4 outline-none focus:border-forest-700 focus:ring-2 focus:ring-forest-700/10"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-earth-900">
                      Total Guests
                    </label>

                    <div className="rounded-2xl border border-earth-200 px-4 py-4 text-earth-900">
                      {totalGuests} guest
                      {totalGuests !== 1
                        ? "s"
                        : ""}
                    </div>
                  </div>

                </div>

                <div className="mt-8 space-y-4">

                  {[
                    {
                      label: "Adults",
                      value: adults,
                      setValue: setAdults,
                      min: 1,
                    },
                    {
                      label: "Children",
                      value: children,
                      setValue: setChildren,
                      min: 0,
                    },
                    {
                      label: "Infants",
                      value: infants,
                      setValue: setInfants,
                      min: 0,
                    },
                  ].map(
                    ({
                      label,
                      value,
                      setValue,
                      min,
                    }) => (
                      <div
                        key={label}
                        className="flex items-center justify-between rounded-2xl bg-cream-50 px-4 py-4"
                      >
                        <div>
                          <p className="font-medium text-earth-900">
                            {label}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">

                          <button
                            type="button"
                            onClick={() =>
                              setValue(
                                Math.max(
                                  min,
                                  value - 1
                                )
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-earth-300"
                          >
                            −
                          </button>

                          <span className="w-5 text-center font-semibold">
                            {value}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              setValue(
                                value + 1
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-900 text-white"
                          >
                            +
                          </button>

                        </div>
                      </div>
                    )
                  )}

                </div>

                <button
                  type="button"
                  onClick={
                    handleCheckAvailability
                  }
                  disabled={
                    checkingAvailability ||
                    loadingQuote
                  }
                  className="mt-8 w-full rounded-full bg-forest-900 px-6 py-4 font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {checkingAvailability
                    ? "Checking..."
                    : loadingQuote
                    ? "Calculating..."
                    : "Check Availability"}
                </button>

                {availability && (
                  <div
                    className={`mt-4 rounded-2xl px-5 py-4 text-sm ${
                      availability.available
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {availability.available
                      ? `${availability.remainingPackageCapacity} package spaces remain for this date.`
                      : "This date is currently unavailable."}
                  </div>
                )}

              </div>

              {/* CUSTOMER */}

              <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">

                <div className="mb-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-fire-500">
                    Step 03
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold text-forest-950">
                    Your information
                  </h2>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium">
                      Full Name
                    </label>

                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) =>
                        setCustomerName(
                          e.target.value
                        )
                      }
                      placeholder="Your full name"
                      className="w-full rounded-2xl border border-earth-200 px-4 py-4 outline-none focus:border-forest-700"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Phone / WhatsApp
                    </label>

                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) =>
                        setPhone(
                          e.target.value
                        )
                      }
                      placeholder="9876543210"
                      className="w-full rounded-2xl border border-earth-200 px-4 py-4 outline-none focus:border-forest-700"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Email
                    </label>

                    <input
                      type="email"
                      value={email}
                      onChange={(e) =>
                        setEmail(
                          e.target.value
                        )
                      }
                      placeholder="you@example.com"
                      className="w-full rounded-2xl border border-earth-200 px-4 py-4 outline-none focus:border-forest-700"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium">
                      Special Requests
                    </label>

                    <textarea
                      rows={4}
                      value={
                        specialRequests
                      }
                      onChange={(e) =>
                        setSpecialRequests(
                          e.target.value
                        )
                      }
                      placeholder="Anything you'd like us to know?"
                      className="w-full resize-none rounded-2xl border border-earth-200 px-4 py-4 outline-none focus:border-forest-700"
                    />
                  </div>

                </div>

              </div>

              {/* CONFIRM */}

              <button
                type="submit"
                disabled={
                  creatingBooking ||
                  !availability?.available ||
                  !quote
                }
                className="w-full rounded-full bg-fire-500 px-6 py-5 text-base font-semibold text-white shadow-lg transition hover:bg-fire-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creatingBooking
                  ? "Creating Booking..."
                  : "Confirm Booking"}
              </button>

            </form>

            {/* SUMMARY */}

            <aside className="lg:sticky lg:top-24 lg:self-start">

              <div className="overflow-hidden rounded-3xl bg-forest-950 text-white shadow-xl">

                {selectedPackage?.image_url && (
                  <img
                    src={
                      selectedPackage.image_url
                    }
                    alt={
                      selectedPackage.name
                    }
                    className="h-56 w-full object-cover"
                  />
                )}

                <div className="p-6 sm:p-8">

                  <p className="text-sm uppercase tracking-[0.2em] text-fire-400">
                    Your experience
                  </p>

                  <h2 className="mt-3 text-2xl font-semibold">
                    {selectedPackage?.name ||
                      "Select a package"}
                  </h2>

                  {selectedPackage?.duration && (
                    <p className="mt-2 text-white/60">
                      {selectedPackage.duration}
                    </p>
                  )}

                  <div className="my-6 border-t border-white/10" />

                  {quote ? (
                    <div className="space-y-4">

                      <div className="flex justify-between text-white/70">
                        <span>
                          Adults ×{" "}
                          {quote.adults}
                        </span>

                        <span>
                          ₹
                          {Number(
                            quote.adultTotal
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </span>
                      </div>

                      {quote.children >
                        0 && (
                        <div className="flex justify-between text-white/70">
                          <span>
                            Children ×{" "}
                            {
                              quote.children
                            }
                          </span>

                          <span>
                            ₹
                            {Number(
                              quote.childTotal
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </span>
                        </div>
                      )}

                      {quote.infants >
                        0 && (
                        <div className="flex justify-between text-white/70">
                          <span>
                            Infants ×{" "}
                            {
                              quote.infants
                            }
                          </span>

                          <span>
                            ₹
                            {Number(
                              quote.infantTotal
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between border-t border-white/10 pt-4 text-white/70">
                        <span>
                          Subtotal
                        </span>

                        <span>
                          ₹
                          {Number(
                            quote.subtotal
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </span>
                      </div>

                      {quote.tax > 0 && (
                        <div className="flex justify-between text-white/70">
                          <span>
                            GST
                          </span>

                          <span>
                            ₹
                            {Number(
                              quote.tax
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </span>
                        </div>
                      )}

                      <div className="flex items-end justify-between border-t border-white/10 pt-5">

                        <span className="text-white/60">
                          Total
                        </span>

                        <span className="text-3xl font-semibold">
                          ₹
                          {Number(
                            quote.total
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </span>

                      </div>

                    </div>
                  ) : (
                    <>
                    <div className="rounded-2xl bg-white/5 p-5 text-sm text-white/60">
                      Select your date and guests,
                      then check availability to
                      see your final price.
                    </div>
                    {/* <button
                        type="button"
                        onClick={() =>
                            navigate("/cancel-booking")
                        }
                        className="text-sm font-medium text-gray-500 underline hover:text-gray-900"
                        >
                        Need to cancel this booking?
                        </button> */}
                    </>
                  )}

                </div>
              </div>

            </aside>

          </div>
        </div>
      </section>
    </main>
  );
};

export default Booking;