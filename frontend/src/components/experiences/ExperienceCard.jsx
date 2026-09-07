import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const ExperienceCard = ({ experience }) => {
  return (
    <Link
      to={`/experiences/${experience.slug}`}
      className="group relative block min-h-[380px] overflow-hidden rounded-[1.75rem] bg-forest-950"
    >
      <img
        src={experience.image}
        alt={experience.title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />

      <div className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:bg-white group-hover:text-earth-900">
        <ArrowUpRight size={19} />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-7">

        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gold-400">
          {experience.category}
        </p>

        <h2 className="mt-2 font-display text-2xl font-semibold text-white sm:text-3xl">
          {experience.title}
        </h2>

        <p className="mt-2 max-w-md text-sm leading-6 text-white/65">
          {experience.tagline}
        </p>

      </div>
    </Link>
  );
};

export default ExperienceCard;