import {
  ArrowUpRight,
  Check,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";

const PackageCard = ({ packageData }) => {
  const {
    slug,
    name,
    shortDescription,
    base_price,
    priceLabel,
    duration,
    accommodation,
    activities,
    images,
    featured,
  } = packageData;

  console.log(packageData);

  const packageActivities = activities || [];

    const image = images?.[0] || {};


  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-earth-900/10 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl">

      {/* Image */}
      <Link
        to={`/packages/${slug}`}
        className="relative block aspect-[4/3] overflow-hidden"
      >
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />

        {featured && (
          <span className="absolute left-5 top-5 rounded-full border border-white/20 bg-black/25 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md">
            Featured
          </span>
        )}

        <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">
              Starting from
            </p>

            <p className="mt-1 text-2xl font-bold text-white">
              ₹{base_price} 
            </p>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-earth-900 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1">
            <ArrowUpRight size={19} />
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-6 sm:p-7">

        <h2 className="font-display text-2xl font-semibold text-earth-900">
          {name}
        </h2>

        <p className="mt-2 text-sm leading-6 text-earth-700/65">
          {shortDescription}
        </p>

        {/* Quick information */}
        <div className="mt-6 grid grid-cols-2 gap-3">

          <div className="rounded-2xl bg-cream-50 p-4">
            <Clock
              size={17}
              className="text-fire-500"
            />

            <p className="mt-2 text-xs text-earth-700/50">
              Duration
            </p>

            <p className="mt-1 text-sm font-semibold text-earth-900">
              {duration}
            </p>
          </div>

          <div className="rounded-2xl bg-cream-50 p-4">
            <Check
              size={17}
              className="text-fire-500"
            />

            <p className="mt-2 text-xs text-earth-700/50">
              Stay
            </p>

            <p className="mt-1 text-sm font-semibold text-earth-900">
              {accommodation}
            </p>
          </div>

        </div>

        {/* Activities */}
        <div className="mt-5 flex flex-wrap gap-2">
          {packageActivities.slice(0, 3).map((activity) => (
            <span
              key={activity}
              className="rounded-full border border-earth-900/10 px-3 py-1.5 text-[11px] font-medium text-earth-700/70"
            >
              {activity}
            </span>
          ))}

          {packageActivities.length > 3 && (
            <span className="rounded-full border border-earth-900/10 px-3 py-1.5 text-[11px] font-medium text-earth-700/50">
              +{packageActivities.length - 3}
            </span>
          )}
        </div>

        {/* CTA */}
        <Link
          to={`/packages/${slug}`}
          className="mt-7 flex w-full items-center justify-center rounded-full bg-forest-900 px-5 py-3.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-forest-800"
        >
          View Package
        </Link>

      </div>
    </article>
  );
};

export default PackageCard;