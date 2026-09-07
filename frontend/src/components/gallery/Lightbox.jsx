import {
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

const Lightbox = ({
  images,
  activeIndex,
  onClose,
  onPrevious,
  onNext,
}) => {
  if (activeIndex === null) {
    return null;
  }

  console.log("images", images);

  const image = images[activeIndex];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 sm:p-8"
      onClick={onClose}
    >

      <button
        onClick={onClose}
        className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20"
        aria-label="Close gallery"
      >
        <X size={22} />
      </button>

      <button
        onClick={(event) => {
          event.stopPropagation();
          onPrevious();
        }}
        className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20 sm:left-6"
        aria-label="Previous image"
      >
        <ChevronLeft size={23} />
      </button>

      <div
        className="relative max-h-[90vh] max-w-6xl"
        onClick={(event) => event.stopPropagation()}
      >

        <img
          src={image.imageUrl}
          alt={image.title}
          className="max-h-[75vh] w-auto max-w-full rounded-xl object-contain"
        />

        <div className="mt-4 text-center">
          <p className="text-sm font-semibold text-white">
            {image.title}
          </p>

          <p className="mt-1 text-xs text-white/40">
            {image.category}
          </p>
        </div>

      </div>

      <button
        onClick={(event) => {
          event.stopPropagation();
          onNext();
        }}
        className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20 sm:right-6"
        aria-label="Next image"
      >
        <ChevronRight size={23} />
      </button>

    </div>
  );
};

export default Lightbox;