import Container from "../common/Container";

const FAQHero = () => {
  return (
    <section className="bg-forest-950 pt-36 sm:pt-44">
      <Container>

        <div className="pb-20 sm:pb-28">

          <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold-400">
            Frequently asked questions
          </p>

          <h1 className="mt-5 max-w-4xl font-display text-5xl font-semibold leading-[1.05] text-white sm:text-6xl lg:text-7xl">
            Everything you need
            <span className="block text-gold-400">
              to know.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-white/60 sm:text-lg">
            Find answers about camping, packages, bookings, food,
            activities and your stay at 7 Hills of Jungle.
          </p>

        </div>

      </Container>
    </section>
  );
};

export default FAQHero;