import {
  Flame,
  Mountain,
  Utensils,
  Users,
} from "lucide-react";

import Container from "../common/Container";
import SectionHeading from "../common/SectionHeading";

const features = [
  {
    icon: Mountain,
    title: "Nature first",
    text: "A setting designed to help you disconnect from the noise and reconnect with the outdoors.",
  },
  {
    icon: Flame,
    title: "Memorable nights",
    text: "Bonfires, music and conversations that make evenings at camp feel different.",
  },
  {
    icon: Utensils,
    title: "Good food",
    text: "Delicious meals and outdoor dining are an important part of the experience.",
  },
  {
    icon: Users,
    title: "Shared moments",
    text: "A place for friends, families and groups to spend meaningful time together.",
  },
];

const WhatMakesUsDifferent = () => {
  return (
    <section className="bg-white py-20 sm:py-28">
      <Container>

        <SectionHeading
          eyebrow="The You Never See difference"
          title="Designed around the experience."
          description="We bring together the things that make a great outdoor escape feel complete."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="rounded-3xl border border-earth-900/10 bg-cream-50 p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-8"
              >

                <Icon
                  size={27}
                  strokeWidth={1.5}
                  className="text-fire-500"
                />

                <h3 className="mt-7 font-display text-xl font-semibold text-earth-900">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-earth-700/65">
                  {feature.text}
                </p>

              </article>
            );
          })}

        </div>

      </Container>
    </section>
  );
};

export default WhatMakesUsDifferent;