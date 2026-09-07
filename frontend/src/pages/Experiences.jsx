import ExperiencesHero from "../components/experiences/ExperiencesHero";
import ExperienceCard from "../components/experiences/ExperienceCard";
import Container from "../components/common/Container";
import SectionHeading from "../components/common/SectionHeading";
import { experiences } from "../data/experiences";

const Experiences = () => {
  return (
    <main>

      <ExperiencesHero />

      <section className="bg-cream-50 py-20 sm:py-28">
        <Container>

          <SectionHeading
            eyebrow="Your time at camp"
            title="Make your stay your own."
            description="Choose from peaceful nature experiences, outdoor adventures, delicious food and nights filled with music and fire."
          />

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {experiences.map((experience) => (
              <ExperienceCard
                key={experience.id}
                experience={experience}
              />
            ))}
          </div>

        </Container>
      </section>

    </main>
  );
};

export default Experiences;