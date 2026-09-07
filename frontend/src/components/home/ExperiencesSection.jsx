import Container from "../common/Container";
import SectionHeading from "../common/SectionHeading";
import { experiences } from "../../data/experiences";

const ExperiencesSection = () => {
  return (
    <section className="bg-white py-20 sm:py-28">
      <Container>

        <SectionHeading
          eyebrow="Experience the difference"
          title="There is always something to discover."
          description="From quiet moments in nature to nights filled with energy, your time at camp is yours to experience."
        />

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">

          <div className="group relative min-h-[430px] overflow-hidden rounded-3xl md:col-span-2 lg:row-span-2">
            <img
              src={experiences[0].image}
              alt={experiences[0].title}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

            <div className="absolute bottom-0 left-0 p-7 sm:p-9">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
                Featured experience
              </p>

              <h3 className="mt-3 font-display text-3xl text-white sm:text-4xl">
                {experiences[0].title}
              </h3>

              <p className="mt-3 max-w-sm text-sm leading-6 text-white/70">
                {experiences[0].tagline}
              </p>
            </div>
          </div>

          {experiences.slice(1).map((experience) => (
            <div
              key={experience.title}
              className="group relative min-h-[210px] overflow-hidden rounded-3xl"
            >
              <img
                src={experience.image}
                alt={experience.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

              <div className="absolute bottom-0 left-0 p-5">
                <h3 className="font-display text-xl text-white">
                  {experience.title}
                </h3>

                <p className="mt-1 text-xs leading-5 text-white/65">
                  {experience.tagline}
                </p>
              </div>
            </div>
          ))}

        </div>
      </Container>
    </section>
  );
};

export default ExperiencesSection;