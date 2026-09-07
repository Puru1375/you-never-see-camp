import Container from "../common/Container";

const stats = [
  {
    number: "01",
    title: "Camp",
    text: "Sleep closer to nature",
  },
  {
    number: "02",
    title: "Explore",
    text: "Trails, treks & adventure",
  },
  {
    number: "03",
    title: "Gather",
    text: "Bonfire, music & food",
  },
  {
    number: "04",
    title: "Remember",
    text: "Moments worth keeping",
  },
];

const ExperienceStats = () => {
  return (
    <section className="bg-forest-950 py-16 sm:py-20">
      <Container>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 lg:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.number}
              className="bg-forest-950 p-6 sm:p-8"
            >
              <span className="text-xs font-semibold tracking-[0.2em] text-gold-400">
                {item.number}
              </span>

              <h3 className="mt-5 font-display text-2xl text-white">
                {item.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-white/50">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default ExperienceStats;