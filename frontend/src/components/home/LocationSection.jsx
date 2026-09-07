import { MapPin, Navigation } from "lucide-react";
import Container from "../common/Container";

const LocationSection = () => {
  return (
    <section className="bg-earth-900 py-20 sm:py-28">
      <Container>

        <div className="grid overflow-hidden rounded-3xl bg-forest-900 lg:grid-cols-2">

          <div className="p-8 sm:p-12 lg:p-16">
            <MapPin
              size={30}
              className="text-gold-400"
            />

            <p className="mt-8 text-xs font-bold uppercase tracking-[0.25em] text-gold-400">
              Find us
            </p>

            <h2 className="mt-3 font-display text-4xl text-white sm:text-5xl">
              7 Hills of Jungle
            </h2>

            <p className="mt-5 max-w-md text-sm leading-7 text-white/60">
              Leave the city behind and make your way into nature. Your
              escape starts here.
            </p>

            <a
              href="#"
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              <Navigation size={16} />
              Get Directions
            </a>
          </div>

          <div className="min-h-[350px] bg-earth-800 lg:min-h-full">
            {/* Google Maps will be integrated later */}
            <div className="flex h-full min-h-[350px] items-center justify-center p-8 text-center">
              <div>
                <MapPin
                  size={35}
                  className="mx-auto text-fire-500"
                />

                <p className="mt-4 font-semibold text-white">
                  7 Hills of Jungle
                </p>

                <p className="mt-2 text-sm text-white/40">
                  Google Maps integration coming soon
                </p>
              </div>
            </div>
          </div>

        </div>

      </Container>
    </section>
  );
};

export default LocationSection;