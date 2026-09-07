import { Link } from "react-router-dom";
import Container from "../common/Container";
import Button from "../common/Button";

const ExperienceBanner = () => {
  return (
    <section className="bg-cream-50 py-20 sm:py-28">
      <Container>

        <div className="relative min-h-[500px] overflow-hidden rounded-[2rem] bg-forest-950">

          <img
            src="/images/sunrise.jpg"
            alt="Sunrise camping experience"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-forest-950/55" />

          <div className="relative z-10 flex min-h-[500px] items-end p-7 sm:p-12 lg:p-16">

            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold-400">
                Wake up somewhere different
              </p>

              <h2 className="mt-4 font-display text-4xl leading-tight text-white sm:text-5xl lg:text-6xl">
                Start your morning with the wild.
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-white/70 sm:text-base">
                Fresh air, quiet trails, warm sunlight and a completely
                different way to begin the day.
              </p>

              <Link to="/booking" className="mt-8 inline-block">
                <Button>
                  Plan Your Escape
                </Button>
              </Link>
            </div>

          </div>
        </div>

      </Container>
    </section>
  );
};

export default ExperienceBanner;