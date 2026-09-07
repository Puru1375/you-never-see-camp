const SectionHeading = ({
  eyebrow,
  title,
  description,
  light = false,
}) => {
  return (
    <div className="max-w-2xl">
      {eyebrow && (
        <p
          className={`
            mb-3 text-xs font-bold uppercase tracking-[0.25em]
            ${light ? "text-gold-400" : "text-fire-600"}
          `}
        >
          {eyebrow}
        </p>
      )}

      <h2
        className={`
          font-display text-3xl font-semibold leading-tight
          sm:text-4xl lg:text-5xl
          ${light ? "text-cream-50" : "text-earth-900"}
        `}
      >
        {title}
      </h2>

      {description && (
        <p
          className={`
            mt-5 text-base leading-7 sm:text-lg
            ${light ? "text-white/65" : "text-earth-700/75"}
          `}
        >
          {description}
        </p>
      )}
    </div>
  );
};

export default SectionHeading;