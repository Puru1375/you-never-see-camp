import { ArrowDown, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../common/Button";

const Hero = () => {
  return (
    <section className="relative min-h-[760px] overflow-hidden bg-forest-950 sm:min-h-[820px]">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="/cinematic.jpg"
          alt="Camping experience at You Never See Camp"
          className="h-full w-full object-cover"
        />

        {/* Dark cinematic overlay */}
        <div className="absolute inset-0 bg-forest-950/55" />

        {/* Bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-forest-950 via-forest-950/60 to-transparent" />
      </div>

      {/* Hero content */}
      <div className="relative z-10 flex min-h-[760px] items-center sm:min-h-[820px]">
        <div className="mx-auto w-full max-w-7xl px-5 pt-28 sm:px-6 lg:px-8">
          <div className="max-w-3xl">

            {/* Location */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 backdrop-blur-md">
              <MapPin size={14} className="text-gold-400" />
              7 Hills of Jungle
            </div>

            {/* Heading */}
            <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-8xl">
              Escape Into
              <span className="block text-gold-400">
                The Wild.
              </span>
            </h1>

            {/* Description */}
            <p className="mt-7 max-w-xl text-base leading-7 text-white/75 sm:text-lg">
              Camp beneath the stars, explore hidden trails, gather around
              the bonfire and create unforgettable memories at You Never
              See Camp.
            </p>

            {/* Actions */}
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to="/booking">
                <Button className="w-full sm:w-auto">
                  Book Your Experience
                </Button>
              </Link>

              <Link to="/packages">
                <Button
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  Explore Packages
                </Button>
              </Link>
            </div>

            {/* Experience highlights */}
            <div className="mt-12 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/60">
              <span>Camping</span>
              <span>•</span>
              <span>Bonfire Nights</span>
              <span>•</span>
              <span>Music</span>
              <span>•</span>
              <span>Adventure</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-7 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-2 text-white/50 sm:flex">
        <span className="text-[10px] uppercase tracking-[0.3em]">
          Explore
        </span>

        <ArrowDown
          size={17}
          className="animate-bounce"
        />
      </div>
    </section>
  );
};

export default Hero;