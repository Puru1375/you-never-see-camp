import {
  Heart,
  Leaf,
  Music,
  ShieldCheck,
} from "lucide-react";

import Container from "../common/Container";
import SectionHeading from "../common/SectionHeading";

const reasons = [
  {
    icon: Leaf,
    title: "Closer to nature",
    text: "Wake up surrounded by greenery, fresh air and beautiful landscapes.",
  },
  {
    icon: Heart,
    title: "Made for memories",
    text: "Every part of the experience is designed to bring people together.",
  },
  {
    icon: Music,
    title: "Good vibes",
    text: "Enjoy music, bonfire nights, food and an atmosphere you will remember.",
  },
  {
    icon: ShieldCheck,
    title: "Comfort & care",
    text: "A thoughtfully managed camping experience with your comfort in mind.",
  },
];

const WhyChooseUs = () => {
  return (
    <section className="bg-forest-900 py-20 sm:py-28">
      <Container>

        <SectionHeading
          eyebrow="Why You Never See Camp"
          title="Come for the camp. Stay for the feeling."
          description="We believe the best outdoor experiences are not about luxury alone. They are about nature, people, stories and moments."
          light
        />

        <div className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((reason) => {
            const Icon = reason.icon;

            return (
              <div
                key={reason.title}
                className="bg-forest-900 p-7 transition-colors duration-300 hover:bg-forest-800 sm:p-8"
              >
                <Icon
                  size={28}
                  strokeWidth={1.5}
                  className="text-gold-400"
                />

                <h3 className="mt-8 font-display text-xl text-white">
                  {reason.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-white/55">
                  {reason.text}
                </p>
              </div>
            );
          })}
        </div>

      </Container>
    </section>
  );
};

export default WhyChooseUs;