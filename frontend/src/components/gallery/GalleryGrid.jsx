import { Maximize2 } from "lucide-react";

const GalleryGrid = ({ images, onImageClick }) => {

  console.log("GalleryGrid images:", images);
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">

      {images.map((item, index) => (
        <button
          key={item.id}
          onClick={() => onImageClick(index)}
          className={`
            group relative overflow-hidden rounded-2xl bg-earth-900
            text-left
            ${
              index % 7 === 0
                ? "col-span-2 row-span-2 aspect-square"
                : "aspect-square"
            }
          `}
        >
          <img
            src={item.imageUrl}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <div className="absolute bottom-4 left-4 right-4 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">

            <p className="text-xs font-semibold text-white">
              {item.title}
            </p>

            <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-white/55">
              {item.category}
            </p>

          </div>

          <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/20 text-white opacity-0 backdrop-blur-md transition-opacity duration-300 group-hover:opacity-100">
            <Maximize2 size={15} />
          </div>
        </button>
      ))}

    </div>
  );
};

export default GalleryGrid;