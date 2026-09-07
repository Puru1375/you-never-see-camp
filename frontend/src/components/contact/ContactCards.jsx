import {
  Mail,
  MessageCircle,
  Phone,
  MapPin,
} from "lucide-react";

import Container from "../common/Container";

const ContactCards = () => {
  const phoneNumbers = [
    "8849976804",
    "8733967890",
    "9173315837",
  ];

  return (
    <section className="bg-cream-50 py-12 sm:py-16">
      <Container>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* Phone */}
          <div className="rounded-3xl border border-earth-900/10 bg-white p-6 sm:p-7">

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-fire-500/10">
              <Phone
                size={20}
                className="text-fire-600"
              />
            </div>

            <h2 className="mt-6 font-display text-xl font-semibold text-earth-900">
              Call us
            </h2>

            <div className="mt-4 space-y-2">
              {phoneNumbers.map((phone) => (
                <a
                  key={phone}
                  href={`tel:${phone}`}
                  className="block text-sm text-earth-700/65 hover:text-forest-900"
                >
                  {phone}
                </a>
              ))}
            </div>

          </div>

          {/* WhatsApp */}
          <a
            href="https://wa.me/918849976804"
            target="_blank"
            rel="noreferrer"
            className="rounded-3xl border border-earth-900/10 bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-xl sm:p-7"
          >

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-forest-600/10">
              <MessageCircle
                size={20}
                className="text-forest-700"
              />
            </div>

            <h2 className="mt-6 font-display text-xl font-semibold text-earth-900">
              WhatsApp
            </h2>

            <p className="mt-3 text-sm text-earth-700/65">
              Chat with us about your camping experience.
            </p>

            <p className="mt-4 text-sm font-semibold text-forest-900">
              Start a conversation →
            </p>

          </a>

          {/* Email */}
          <a
            href="mailto:youneverseecamp@gmail.com"
            className="rounded-3xl border border-earth-900/10 bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-xl sm:p-7"
          >

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-400/15">
              <Mail
                size={20}
                className="text-gold-500"
              />
            </div>

            <h2 className="mt-6 font-display text-xl font-semibold text-earth-900">
              Email
            </h2>

            <p className="mt-3 break-all text-sm text-earth-700/65">
              youneverseecamp@gmail.com
            </p>

            <p className="mt-4 text-sm font-semibold text-forest-900">
              Send an email →
            </p>

          </a>

          {/* Location */}
          <div className="rounded-3xl border border-earth-900/10 bg-white p-6 sm:p-7">

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-fire-500/10">
              <MapPin
                size={20}
                className="text-fire-600"
              />
            </div>

            <h2 className="mt-6 font-display text-xl font-semibold text-earth-900">
              Visit us
            </h2>

            <p className="mt-3 text-sm leading-6 text-earth-700/65">
              7 Hills of Jungle
            </p>

            <p className="mt-4 text-xs text-earth-700/45">
              Exact map location will be added soon.
            </p>

          </div>

        </div>

      </Container>
    </section>
  );
};

export default ContactCards;