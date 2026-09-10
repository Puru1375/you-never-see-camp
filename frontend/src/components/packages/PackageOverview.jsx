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
    // {
    //   icon: BedDouble,
    //   label: "Accommodation",
    //   value: packageData.accommodation,
    // },
    {
      icon: Utensils,
      label: "Meals",
      value: packageData.meals?.length
        ? `${packageData.meals.length} included`
        : null,
    },
    {
      icon: Users,
      label: "Capacity",
      value: packageData.max_guests
        ? `Up to ${packageData.max_guests} guests`
        : null,
    },
  ];

  const visibleDetails = details.filter((detail) => detail.value);

  return (
    <section className="bg-cream-50 py-12 sm:py-16">
      <Container>
        <div
          className={`
            grid
            overflow-hidden
            rounded-3xl
            border
            border-earth-900/10
            bg-white
            ${
              visibleDetails.length === 3
                ? "grid-cols-3"
                : visibleDetails.length === 2
                  ? "grid-cols-2"
                  : "grid-cols-1"
            }
          `}
        >
          {visibleDetails.map((detail, index) => {
            const Icon = detail.icon;

            return (
              <div
                key={detail.label}
                className={`
                  p-5
                  sm:p-7
                  border-earth-900/10

                  ${
                    index < visibleDetails.length - 1
                      ? "border-r"
                      : ""
                  }
                `}
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

