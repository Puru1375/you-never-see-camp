import {
  BedDouble,
  Clock,
  Utensils,
  Users,
} from "lucide-react";

import Container from "../common/Container";

const PackageOverview = ({ packageData }) => {
  const details = [
    {
      icon: Clock,
      label: "Duration",
      value: packageData.duration,
    },
    {
      icon: BedDouble,
      label: "Accommodation",
      value: packageData.accommodation,
    },
    {
      icon: Utensils,
      label: "Meals",
      value: `${packageData.meals.length} included`,
    },
    {
      icon: Users,
      label: "Capacity",
      value: `Up to ${packageData.max_guests} guests`,
    },
  ];

  return (
    <section className="bg-cream-50 py-12 sm:py-16">
      <Container>

        <div className="grid grid-cols-2 overflow-hidden rounded-3xl border border-earth-900/10 bg-white lg:grid-cols-4">

          {details.map((detail) => {
            const Icon = detail.icon;

            return (
              <div
                key={detail.label}
                className="border-b border-r border-earth-900/10 p-5 last:border-r-0 sm:p-7 lg:border-b-0"
              >
                <Icon
                  size={22}
                  strokeWidth={1.5}
                  className="text-fire-500"
                />

                <p className="mt-5 text-xs text-earth-700/50">
                  {detail.label}
                </p>

                <p className="mt-1 text-sm font-semibold leading-5 text-earth-900">
                  {detail.value}
                </p>
              </div>
            );
          })}

        </div>

      </Container>
    </section>
  );
};

export default PackageOverview;