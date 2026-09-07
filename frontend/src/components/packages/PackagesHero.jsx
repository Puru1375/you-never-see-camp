import { MapPin } from "lucide-react";
import Container from "../common/Container";

const PackagesHero = () => {
  return (
    <section className="relative overflow-hidden bg-forest-950 pt-36 sm:pt-44">

      <div className="absolute inset-0">
        <img
          src="/images/jungle.jpg"
          alt="Jungle camping surroundings"
          className="h-full w-full object-cover opacity-35"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-forest-950/80 via-forest-950/70 to-forest-950" />
      </div>

      <Container>
        <div className="relative z-10 pb-20 sm:pb-28">

          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-gold-400">
            <MapPin size={14} />
            7 Hills of Jungle
          </div>

          <h1 className="mt-6 max-w-4xl font-display text-5xl font-semibold leading-[1.05] text-white sm:text-6xl lg:text-7xl">
            Choose your
            <span className="block text-gold-400">
              escape.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-white/65 sm:text-lg">
            From peaceful nature stays to adventure-filled weekends,
            find the camping experience that feels right for you.
          </p>

        </div>
      </Container>

    </section>
  );
};

export default PackagesHero;