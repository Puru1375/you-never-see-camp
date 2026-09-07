import Container from "../common/Container";

const ContactHero = () => {
  return (
    <section className="relative overflow-hidden bg-forest-950 pt-36 sm:pt-44">

      <div className="absolute inset-0">
        <img
          src="/images/jungle.jpg"
          alt="7 Hills of Jungle"
          className="h-full w-full object-cover opacity-25"
        />

        <div className="absolute inset-0 bg-forest-950/85" />

        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-forest-950 to-transparent" />
      </div>

      <Container>
        <div className="relative z-10 pb-20 sm:pb-28">

          <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold-400">
            Get in touch
          </p>

          <h1 className="mt-5 max-w-4xl font-display text-5xl font-semibold leading-[1.05] text-white sm:text-6xl lg:text-7xl">
            Your next escape
            <span className="block text-gold-400">
              starts with a hello.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-white/65 sm:text-lg">
            Have a question about camping, packages, availability or
            your upcoming visit? We'd love to hear from you.
          </p>

        </div>
      </Container>

    </section>
  );
};

export default ContactHero;