import { useState, useEffect } from "react";

import GalleryHero from "../components/gallery/GalleryHero";
import GalleryFilters from "../components/gallery/GalleryFilters";
import GalleryGrid from "../components/gallery/GalleryGrid";
import Lightbox from "../components/gallery/Lightbox";

import Container from "../components/common/Container";

import { galleryCategories } from "../data/gallery";
import { getGallery } from "../services/api";

const Gallery = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeIndex, setActiveIndex] = useState(null);

  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGallery = async () => {
      try {
        setLoading(true);

        const res = await getGallery();

        console.log("Gallery API response:", res);

        // API returns:
        // {
        //   success: true,
        //   data: [...]
        // }

        const images = Array.isArray(res?.data)
          ? res.data
          : [];

        setGalleryImages(images);
      } catch (err) {
        console.error(
          "Failed to load gallery:",
          err
        );

        setGalleryImages([]);
      } finally {
        setLoading(false);
      }
    };

    loadGallery();
  }, []);

  console.log("galleryImages:", galleryImages);

  /*
   * API category:
   * "bonfire"
   *
   * Frontend category:
   * "Bonfire"
   *
   * So compare them in lowercase.
   */
  const filteredImages =
    activeCategory === "All"
      ? galleryImages
      : galleryImages.filter(
          (image) =>
            image.category?.toLowerCase() ===
            activeCategory.toLowerCase()
        );

  const handleOpenImage = (index) => {
    setActiveIndex(index);
  };

  const handleClose = () => {
    setActiveIndex(null);
  };

  const handlePrevious = () => {
    setActiveIndex((current) => {
      if (current === null) return null;

      return current === 0
        ? filteredImages.length - 1
        : current - 1;
    });
  };

  const handleNext = () => {
    setActiveIndex((current) => {
      if (current === null) return null;

      return current ===
        filteredImages.length - 1
        ? 0
        : current + 1;
    });
  };

  return (
    <main>
      <GalleryHero />

      <section className="bg-cream-50 py-20 sm:py-28">
        <Container>
          <GalleryFilters
            categories={galleryCategories}
            activeCategory={activeCategory}
            onCategoryChange={(category) => {
              setActiveCategory(category);
              setActiveIndex(null);
            }}
          />

          <div className="mt-8">
            {loading ? (
              <div className="py-20 text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-forest-900 border-t-transparent" />

                <p className="mt-4 text-sm text-earth-900">
                  Loading gallery...
                </p>
              </div>
            ) : filteredImages.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-sm text-earth-900">
                  No images found.
                </p>
              </div>
            ) : (
              <GalleryGrid
                images={filteredImages}
                onImageClick={handleOpenImage}
              />
            )}
          </div>
        </Container>
      </section>

      <Lightbox
        images={filteredImages}
        activeIndex={activeIndex}
        onClose={handleClose}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />
    </main>
  );
};

export default Gallery;