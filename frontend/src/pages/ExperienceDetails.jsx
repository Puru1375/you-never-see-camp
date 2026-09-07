import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";

import { getExperienceBySlug } from "../data/experiences";

import Container from "../components/common/Container";
import Button from "../components/common/Button";

const ExperienceDetails = () => {
  const { slug } = useParams();

  const experience = getExperienceBySlug(slug);

  if (!experience) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream-50 px-5">
        <div className="text-center">

          <p className="text-xs font-bold uppercase tracking-[0.2em] text-fire-600">
            Experience not found
          </p>

          <h1 className="mt-3 font-display text-4xl text-earth-900">
            This experience doesn't exist.
          </h1>

          <Link
            to="/experiences"
            className="mt-7 inline-flex rounded-full bg-forest-900 px-6 py-3.5 text-sm font-semibold text-white"
          >
            Explore Experiences
          </Link>

        </div>
      </main>
    );
  }

  return (
    <main>

      {/* Hero */}
      <section className="relative min-h-[650px] overflow-hidden bg-forest-950">

        <img
          src={experience.image}
          alt={experience.title}
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-black/50" />

        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-forest-950 via-forest-950/60 to-transparent" />

        <Container>
          <div className="relative z-10 flex min-h-[650px] items-end pb-14 pt-32 sm:pb-16">

            <div className="max-w-3xl">

              <Link
                to="/experiences"
                className="mb-8 inline-flex items-center gap-2 text-sm text-white/65 hover:text-white"
              >
                <ArrowLeft size={16} />
                All experiences
              </Link>

              <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold-400">
                {experience.category}
              </p>

              <h1 className="mt-4 font-display text-5xl font-semibold leading-[1.05] text-white sm:text-6xl lg:text-7xl">
                {experience.title}
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/70">
                {experience.tagline}
              </p>

            </div>

          </div>
        </Container>

      </section>

      {/* Content */}
      <section className="bg-cream-50 py-20 sm:py-28">
        <Container>

          <div className="grid gap-12 lg:grid-cols-[1fr_380px] lg:gap-20">

            <div>

              <p className="text-lg leading-8 text-earth-700/80 sm:text-xl">
                {experience.description}
              </p>

              <h2 className="mt-12 font-display text-3xl font-semibold text-earth-900">
                What to expect
              </h2>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {experience.highlights.map((highlight) => (
                  <div
                    key={highlight}
                    className="flex items-center gap-3 rounded-2xl border border-earth-900/10 bg-white p-4"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-fire-500/10">
                      <Check
                        size={16}
                        className="text-fire-600"
                      />
                    </div>

                    <span className="text-sm font-medium text-earth-800">
                      {highlight}
                    </span>
                  </div>
                ))}
              </div>

            </div>

            <div className="rounded-3xl bg-forest-950 p-7 text-white sm:p-8 lg:h-fit">

              <p className="text-xs uppercase tracking-[0.2em] text-gold-400">
                Plan your visit
              </p>

              <h3 className="mt-3 font-display text-3xl">
                Ready to experience it?
              </h3>

              <p className="mt-4 text-sm leading-6 text-white/55">
                Explore our camping packages and choose the stay that
                includes the experiences you want.
              </p>

              <Link
                to="/packages"
                className="mt-7 block"
              >
                <Button className="w-full">
                  Explore Packages
                </Button>
              </Link>

            </div>

          </div>

        </Container>
      </section>

    </main>
  );
};

export default ExperienceDetails;