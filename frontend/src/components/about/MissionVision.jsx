import { Compass, Heart } from "lucide-react";
import Container from "../common/Container";

const MissionVision = () => {
  return (
    <section className="bg-forest-950 py-20 sm:py-28">
      <Container>

        <div className="grid gap-5 md:grid-cols-2">

          <article className="rounded-[2rem] border border-white/10 bg-white/5 p-8 sm:p-10 lg:p-12">

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-400/10">
              <Compass
                size={23}
                className="text-gold-400"
                strokeWidth={1.5}
              />
            </div>

            <p className="mt-8 text-xs font-bold uppercase tracking-[0.25em] text-gold-400">
              Our mission
            </p>

            <h2 className="mt-3 font-display text-3xl text-white sm:text-4xl">
              Create experiences worth remembering.
            </h2>

            <p className="mt-5 text-sm leading-7 text-white/55 sm:text-base">
              To create memorable outdoor experiences that bring
              people closer to nature, adventure and each other.
            </p>

          </article>

          <article className="rounded-[2rem] border border-white/10 bg-white/5 p-8 sm:p-10 lg:p-12">

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-fire-500/10">
              <Heart
                size={23}
                className="text-fire-500"
                strokeWidth={1.5}
              />
            </div>

            <p className="mt-8 text-xs font-bold uppercase tracking-[0.25em] text-gold-400">
              Our vision
            </p>

            <h2 className="mt-3 font-display text-3xl text-white sm:text-4xl">
              Leave with a story.
            </h2>

            <p className="mt-5 text-sm leading-7 text-white/55 sm:text-base">
              To become a destination where every guest leaves with
              a story worth remembering and a reason to return.
            </p>

          </article>

        </div>

      </Container>
    </section>
  );
};

export default MissionVision;