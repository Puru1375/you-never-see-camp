import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import Container from "../common/Container";
import SectionHeading from "../common/SectionHeading";

const IntroSection = () => {
  return (
    <section className="bg-cream-50 py-20 sm:py-28">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.8fr] lg:gap-20">

          <div>
            <SectionHeading
              eyebrow="Welcome to the wild"
              title="More than camping. It's an experience."
              description="You Never See Camp is a place to slow down, reconnect with nature and experience the outdoors in a completely different way."
            />
          </div>

          <div className="lg:pl-10">
            <p className="text-lg leading-8 text-earth-700/80">
              From peaceful mornings and jungle trails to energetic music,
              delicious food and warm bonfire nights, every stay is designed
              to give you something worth remembering.
            </p>

            <Link
              to="/about"
              className="group mt-7 inline-flex items-center gap-2 font-semibold text-forest-900"
            >
              Discover our story

              <ArrowUpRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </Link>
          </div>

        </div>
      </Container>
    </section>
  );
};

export default IntroSection;