import { Check, X } from "lucide-react";
import Container from "../common/Container";
import SectionHeading from "../common/SectionHeading";

const   PackageContent = ({ packageData }) => {
  return (
    <section className="bg-cream-50 pb-20 sm:pb-28">
      <Container>

        <div className="grid gap-12 lg:grid-cols-[1fr_380px] lg:gap-20">

          {/* Main content */}
          <div>

            <SectionHeading
              eyebrow="The experience"
              title="Everything you need for a memorable escape."
              description={packageData.shortDescription}
            />

            {/* Activities */}
            <div className="mt-14">
              <h3 className="font-display text-2xl font-semibold text-earth-900">
                Activities
              </h3>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {packageData.activities.map((activity) => (
                  <div
                    key={activity}
                    className="flex items-center gap-3 rounded-2xl border border-earth-900/10 bg-white p-4"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-fire-500/10">
                      <Check
                        size={16}
                        className="text-fire-600"
                      />
                    </div>

                    <span className="text-sm font-medium text-earth-800">
                      {activity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Meals */}
            <div className="mt-14">
              <h3 className="font-display text-2xl font-semibold text-earth-900">
                Meals
              </h3>

              <div className="mt-6 space-y-3">
                {packageData.meals.map((meal) => (
                  <div
                    key={meal}
                    className="flex items-center gap-3 text-sm text-earth-700/75"
                  >
                    <Check
                      size={17}
                      className="shrink-0 text-fire-500"
                    />

                    {meal}
                  </div>
                ))}
              </div>
            </div>

            {/* Inclusions */}
            {/* <div className="mt-14">
              <h3 className="font-display text-2xl font-semibold text-earth-900">
                What's included
              </h3>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {packageData.meals.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 text-sm text-earth-700/75"
                  >
                    <Check
                      size={17}
                      className="mt-0.5 shrink-0 text-forest-600"
                    />

                    {item}
                  </div>
                ))}
              </div>
            </div> */}

            {/* Exclusions */}
            {/* <div className="mt-14">
              <h3 className="font-display text-2xl font-semibold text-earth-900">
                Not included
              </h3>

              <div className="mt-6 space-y-3">
                {packageData.exclusions.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 text-sm text-earth-700/65"
                  >
                    <X
                      size={17}
                      className="mt-0.5 shrink-0 text-earth-700/40"
                    />

                    {item}
                  </div>
                ))}
              </div>
            </div> */}

          </div>

          {/* Booking card */}
          <aside className="lg:sticky lg:top-28 lg:h-fit">

            <div className="overflow-hidden rounded-3xl border border-earth-900/10 bg-white shadow-xl">

              <div className="bg-forest-950 p-7 text-white sm:p-8">

                <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                  Starting from
                </p>

                <div className="mt-2 flex items-end gap-2">
                  <span className="font-display text-4xl">
                    ₹{packageData.base_price}
                  </span>

                  <span className="pb-1 text-sm text-white/50">
                    / guest
                  </span>
                </div>

                <p className="mt-3 text-xs leading-5 text-white/50">
                  Final price will be calculated based on guests,
                  date, applicable taxes and booking rules.
                </p>

              </div>

              <div className="p-7 sm:p-8">

                <div className="space-y-4">

                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-earth-700/50">
                      Check-in
                    </span>

                    <span className="font-semibold text-earth-900">
                      {packageData.check_in_time}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-earth-700/50">
                      Check-out
                    </span>

                    <span className="font-semibold text-earth-900">
                      {packageData.check_out_time}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-earth-700/50">
                      Maximum guests
                    </span>

                    <span className="font-semibold text-earth-900">
                      {packageData.max_guests}
                    </span>
                  </div>

                </div>

                <div className="my-6 h-px bg-earth-900/10" />

                <a
                  href={`/booking?package=${packageData.slug}`}
                  className="flex w-full items-center justify-center rounded-full bg-fire-500 px-5 py-4 text-sm font-bold text-white transition-colors hover:bg-fire-600"
                >
                  Book This Experience
                </a>

                <p className="mt-4 text-center text-xs leading-5 text-earth-700/45">
                  Secure your preferred date by completing the booking.
                </p>

              </div>

            </div>

          </aside>

        </div>

      </Container>
    </section>
  );
};

export default PackageContent;