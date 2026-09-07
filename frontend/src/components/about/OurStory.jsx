import Container from "../common/Container";
import SectionHeading from "../common/SectionHeading";

const OurStory = () => {
  return (
    <section className="bg-cream-50 py-20 sm:py-28">
      <Container>

        <div className="grid items-start gap-12 lg:grid-cols-[0.85fr_1fr] lg:gap-24">

          <div>
            <SectionHeading
              eyebrow="Why we started"
              title="It started with a love for the outdoors."
            />
          </div>

          <div className="space-y-6 text-base leading-8 text-earth-700/75 sm:text-lg">
            <p>
              At 7 Hills of Jungle, we believe camping should be more
              than simply spending a night in a tent.
            </p>

            <p>
              It should be waking up to fresh air, walking through
              natural trails, sharing stories around a bonfire,
              enjoying good food and discovering a different side of
              yourself.
            </p>

            <p>
              You Never See Camp brings these moments together into
              an outdoor experience designed for people who want to
              escape the ordinary.
            </p>

            <p>
              Whether you come looking for adventure, a peaceful
              weekend or simply a night under the stars, there is
              always something waiting to be discovered.
            </p>
          </div>

        </div>

      </Container>
    </section>
  );
};

export default OurStory;