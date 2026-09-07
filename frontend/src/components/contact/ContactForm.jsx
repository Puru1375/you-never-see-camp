import { useState } from "react";
import Button from "../common/Button";

const ContactForm = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    setSubmitted(true);
  };

  return (
    <div className="rounded-[2rem] border border-earth-900/10 bg-white p-7 shadow-sm sm:p-9">

      <p className="text-xs font-bold uppercase tracking-[0.2em] text-fire-600">
        Send an enquiry
      </p>

      <h2 className="mt-3 font-display text-3xl font-semibold text-earth-900">
        How can we help?
      </h2>

      <p className="mt-3 text-sm leading-6 text-earth-700/60">
        Send us your question and our team can get back to you.
      </p>

      {submitted ? (
        <div className="mt-8 rounded-2xl bg-forest-900 p-6 text-white">
          <p className="font-semibold">
            Thanks for reaching out!
          </p>

          <p className="mt-2 text-sm leading-6 text-white/60">
            Your enquiry has been received. We'll get back to you soon.
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >

          <div className="grid gap-5 sm:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-medium text-earth-900">
                Name
              </label>

              <input
                type="text"
                name="name"
                required
                placeholder="Your name"
                className="w-full rounded-2xl border border-earth-900/10 bg-cream-50 px-4 py-3.5 text-sm outline-none transition focus:border-forest-700 focus:ring-2 focus:ring-forest-700/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-earth-900">
                Phone
              </label>

              <input
                type="tel"
                name="phone"
                required
                placeholder="Your phone number"
                className="w-full rounded-2xl border border-earth-900/10 bg-cream-50 px-4 py-3.5 text-sm outline-none transition focus:border-forest-700 focus:ring-2 focus:ring-forest-700/10"
              />
            </div>

          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-earth-900">
              Email
            </label>

            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              className="w-full rounded-2xl border border-earth-900/10 bg-cream-50 px-4 py-3.5 text-sm outline-none transition focus:border-forest-700 focus:ring-2 focus:ring-forest-700/10"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-earth-900">
              Message
            </label>

            <textarea
              name="message"
              required
              rows="5"
              placeholder="Tell us how we can help..."
              className="w-full resize-none rounded-2xl border border-earth-900/10 bg-cream-50 px-4 py-3.5 text-sm outline-none transition focus:border-forest-700 focus:ring-2 focus:ring-forest-700/10"
            />
          </div>

          <Button type="submit">
            Send Enquiry
          </Button>

        </form>
      )}

    </div>
  );
};

export default ContactForm;