const GalleryFilters = ({
  categories,
  activeCategory,
  onCategoryChange,
}) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category) => {
        const active = category === activeCategory;

        return (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`
              shrink-0 rounded-full px-5 py-2.5 text-xs font-semibold
              transition-all duration-300
              ${
                active
                  ? "bg-forest-900 text-white"
                  : "border border-earth-900/10 bg-white text-earth-700/65 hover:bg-earth-900/5"
              }
            `}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
};

export default GalleryFilters;