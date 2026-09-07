import { ArrowLeft, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import Container from "../common/Container";

const PackageDetailsHero = ({ packageData }) => {

    console.log("packageData", packageData);
  return (
    <section className="relative min-h-[620px] overflow-hidden bg-forest-950">

      <img
        src={packageData.images[0]}
        alt={packageData.name}
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-forest-950/55" />

      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-forest-950 via-forest-950/60 to-transparent" />

      <Container>
        <div className="relative z-10 flex min-h-[620px] items-end pb-12 pt-32 sm:pb-16">

          <div className="max-w-4xl">

            <Link
              to="/packages"
              className="mb-8 inline-flex items-center gap-2 text-sm text-white/65 transition-colors hover:text-white"
            >
              <ArrowLeft size={16} />
              All packages
            </Link>

            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-gold-400">
              <MapPin size={14} />
              7 Hills of Jungle
            </div>

            <h1 className="mt-5 font-display text-5xl font-semibold leading-[1.05] text-white sm:text-6xl lg:text-7xl">
              {packageData.name}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
              {packageData.tagline}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">

              <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs text-white backdrop-blur-md">
                {packageData.duration}
              </span>

              <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs text-white backdrop-blur-md">
                {packageData.accommodation}
              </span>

              <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs text-white backdrop-blur-md">
                From ₹{packageData.base_price}
              </span>

            </div>

          </div>
        </div>
      </Container>

    </section>
  );
};

export default PackageDetailsHero;