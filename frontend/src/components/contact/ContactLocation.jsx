import {
  MapPin,
  Navigation,
} from "lucide-react";

import Container from "../common/Container";

const ContactLocation = () => {
  return (
    <section className="bg-earth-900 py-20 sm:py-28">
      <Container>

        <div className="grid overflow-hidden rounded-[2rem] bg-forest-950 lg:grid-cols-2">

          <div className="p-8 sm:p-12 lg:p-16">

            <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold-400">
              Find us
            </p>

            <h2 className="mt-4 font-display text-4xl text-white sm:text-5xl">
              7 Hills of Jungle
            </h2>

            <p className="mt-5 max-w-md text-sm leading-7 text-white/55 sm:text-base">
              Your escape from the ordinary starts here.
            </p>

            <div className="mt-8 flex items-start gap-3">
              <MapPin
                size={20}
                className="mt-0.5 shrink-0 text-fire-500"
              />

              <div>
                <p className="font-semibold text-white">
                  You Never See Camp
                </p>

                <p className="mt-1 text-sm text-white/50">
                  7 Hills of Jungle
                </p>
              </div>
            </div>

            <div className="mt-8">
              <button
                type="button"
                disabled
                className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white/40"
              >
                <Navigation size={16} />
                Exact directions coming soon
              </button>
            </div>

          </div>

          <div className="relative min-h-[350px] overflow-hidden bg-forest-800">

            <img
              src="/images/jungle.jpg"
              alt="7 Hills of Jungle surroundings"
              className="absolute inset-0 h-full w-full object-cover opacity-50"
            />

            <div className="absolute inset-0 bg-forest-950/50" />

            <div className="relative flex min-h-[350px] items-center justify-center p-8 text-center">

              <div>
                <MapPin
                  size={40}
                  className="mx-auto text-fire-500"
                />

                <p className="mt-4 font-display text-2xl text-white">
                  7 Hills of Jungle
                </p>

                <p className="mt-2 text-sm text-white/45">
                  Google Maps integration will be connected
                  once the exact location is provided.
                </p>
              </div>

            </div>

          </div>

        </div>

      </Container>
    </section>
  );
};

export default ContactLocation;