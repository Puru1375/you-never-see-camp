import Container from "../common/Container";

const AboutImageSection = () => {
  return (
    <section className="bg-cream-50 pb-20 sm:pb-28">
      <Container>

        <div className="relative min-h-[500px] overflow-hidden rounded-[2rem] bg-forest-950 sm:min-h-[600px]">

          <img
            src="/images/camp-tent.jpg"
            alt="Camping at You Never See Camp"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 via-transparent to-transparent" />

          <div className="absolute bottom-0 left-0 max-w-2xl p-7 sm:p-12 lg:p-16">

            <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold-400">
              7 Hills of Jungle
            </p>

            <h2 className="mt-4 font-display text-4xl leading-tight text-white sm:text-5xl">
              Leave the city behind.
            </h2>

            <p className="mt-5 text-sm leading-7 text-white/65 sm:text-base">
              Fresh air, open skies, natural trails and nights around
              the fire. Sometimes the best reset is simply getting
              away.
            </p>

          </div>

        </div>

      </Container>
    </section>
  );
};

export default AboutImageSection;