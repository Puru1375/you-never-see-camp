import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Star,
  StarOff,
  Edit3,
  Image as ImageIcon,
  Eye,
  EyeOff,
  X,
} from "lucide-react";

import {
  getAdminGallery,
  addGalleryImage,
  updateGalleryImage,
  setFeaturedGalleryImage,
  deleteGalleryImage,
} from "../services/gallery";

import {
  createPresignedUpload,
  uploadFileToS3,
} from "../services/uploads";

const categories = [
  "camping",
  "bonfire",
  "music",
  "food",
  "adventure",
  "nature",
  "trek",
  "general",
];

const emptyForm = {
  title: "",
  caption: "",
  altText: "",
  category: "general",
  sortOrder: 0,
  isFeatured: false,
  isActive: true,
};

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [filter, setFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editingImage, setEditingImage] =
    useState(null);

  const [form, setForm] = useState(emptyForm);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadGallery = async () => {
    try {
      setLoading(true);

      const data = await getAdminGallery();

      setImages(data);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();
  }, []);

  const openCreate = () => {
    setEditingImage(null);
    setForm(emptyForm);
    setFile(null);
    setPreview("");
    setShowForm(true);
  };

  const openEdit = (image) => {
    setEditingImage(image);

    setForm({
      title: image.title || "",
      caption: image.caption || "",
      altText: image.altText || "",
      category: image.category || "general",
      sortOrder: image.sortOrder || 0,
      isFeatured: image.isFeatured || false,
      isActive: image.isActive ?? true,
    });

    setFile(null);
    setPreview(image.imageUrl || "");
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingImage(null);
    setFile(null);
    setPreview("");
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    setFile(selectedFile);

    const objectUrl =
      URL.createObjectURL(selectedFile);

    setPreview(objectUrl);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);

      let s3Key = editingImage?.s3Key;

      /*
       * Upload a new file only when creating
       * or replacing an existing image.
       */
      if (file) {
        const upload = await createPresignedUpload({
          type: "gallery",
          category: form.category,
          file,
        });

        await uploadFileToS3(
          upload.uploadUrl,
          file
        );

        s3Key = upload.key;
      }

      if (!editingImage && !s3Key) {
        throw new Error(
          "Please select an image."
        );
      }

      const payload = {
        s3Key,
        category: form.category,
        title: form.title || null,
        caption: form.caption || null,
        altText: form.altText || null,
        sortOrder: Number(form.sortOrder) || 0,
        isFeatured: form.isFeatured,
        isActive: form.isActive,
      };

      if (editingImage) {
        await updateGalleryImage(
          editingImage.id,
          payload
        );
      } else {
        await addGalleryImage(payload);
      }

      closeForm();

      await loadGallery();
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleFeatured = async (id) => {
    try {
      await setFeaturedGalleryImage(id);

      await loadGallery();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDelete = async (image) => {
    const confirmed = window.confirm(
      `Delete "${image.title || "this image"}"?`
    );

    if (!confirmed) return;

    try {
      await deleteGalleryImage(image.id);

      await loadGallery();
    } catch (error) {
      alert(error.message);
    }
  };

  const filteredImages =
    filter === "all"
      ? images
      : images.filter(
          (image) =>
            image.category === filter
        );

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 pb-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-fire-500">
            Content Management
          </p>

          <h1 className="mt-1 text-3xl font-bold text-forest-950">
            Gallery
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage your camp photos and gallery
            content.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest-900"
        >
          <Plus size={18} />
          Add Image
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-full px-4 py-2 text-sm font-medium ${
            filter === "all"
              ? "bg-forest-950 text-white"
              : "bg-white text-gray-600 border border-gray-200"
          }`}
        >
          All
        </button>

        {categories.map((category) => (
          <button
            key={category}
            onClick={() =>
              setFilter(category)
            }
            className={`rounded-full px-4 py-2 text-sm font-medium capitalize ${
              filter === category
                ? "bg-forest-950 text-white"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Gallery */}
      {loading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500">
            Loading gallery...
          </p>
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-16 text-center">
          <ImageIcon
            className="mx-auto text-gray-400"
            size={42}
          />

          <h3 className="mt-4 font-semibold text-gray-800">
            No images found
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Add your first gallery image.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredImages.map((image) => (
            <div
              key={image.id}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                <img
                  src={image.imageUrl}
                  alt={
                    image.altText ||
                    image.title ||
                    "Gallery image"
                  }
                  className="h-full w-full object-cover"
                />

                {image.isFeatured && (
                  <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-gold-400 px-3 py-1.5 text-xs font-semibold text-forest-950">
                    <Star size={13} />
                    Featured
                  </div>
                )}

                {!image.isActive && (
                  <div className="absolute right-3 top-3 rounded-full bg-black/70 px-3 py-1.5 text-xs font-medium text-white">
                    Inactive
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="space-y-4 p-4">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-gray-900">
                      {image.title ||
                        "Untitled Image"}
                    </h3>

                    <span className="rounded-full bg-forest-50 px-2.5 py-1 text-xs font-medium capitalize text-forest-800">
                      {image.category}
                    </span>
                  </div>

                  {image.caption && (
                    <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                      {image.caption}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
                  <button
                    onClick={() =>
                      openEdit(image)
                    }
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Edit3 size={15} />
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      handleFeatured(image.id)
                    }
                    className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50"
                    title={
                      image.isFeatured
                        ? "Featured"
                        : "Set featured"
                    }
                  >
                    {image.isFeatured ? (
                      <Star size={17} />
                    ) : (
                      <StarOff size={17} />
                    )}
                  </button>

                  <button
                    onClick={() =>
                      handleDelete(image)
                    }
                    className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                    title="Delete"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-forest-950">
                  {editingImage
                    ? "Edit Gallery Image"
                    : "Add Gallery Image"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Upload and manage camp photography.
                </p>
              </div>

              <button
                onClick={closeForm}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-6 p-6"
            >
              {/* Upload */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Image
                </label>

                {preview && (
                  <div className="mb-4 overflow-hidden rounded-2xl bg-gray-100">
                    <img
                      src={preview}
                      alt="Preview"
                      className="h-64 w-full object-cover"
                    />
                  </div>
                )}

                <label className="flex cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 px-6 py-10 text-center transition hover:border-forest-500 hover:bg-forest-50">
                  <div>
                    <ImageIcon
                      className="mx-auto text-gray-400"
                      size={34}
                    />

                    <p className="mt-3 text-sm font-medium text-gray-700">
                      {file
                        ? file.name
                        : editingImage
                        ? "Choose a replacement image"
                        : "Choose an image"}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      JPG, PNG or WebP • Max 10 MB
                    </p>
                  </div>

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              {/* Category */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Category
                </label>

                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      category: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-forest-500"
                >
                  {categories.map(
                    (category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category
                          .charAt(0)
                          .toUpperCase() +
                          category.slice(1)}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Title
                </label>

                <input
                  value={form.title}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      title: e.target.value,
                    })
                  }
                  placeholder="Jungle camping experience"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-forest-500"
                />
              </div>

              {/* Caption */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Caption
                </label>

                <textarea
                  rows={3}
                  value={form.caption}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      caption: e.target.value,
                    })
                  }
                  placeholder="A peaceful evening under the stars."
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-forest-500"
                />
              </div>

              {/* Alt text */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Alt Text
                </label>

                <input
                  value={form.altText}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      altText: e.target.value,
                    })
                  }
                  placeholder="Camping tents surrounded by jungle"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-forest-500"
                />
              </div>

              {/* Sort order */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Sort Order
                </label>

                <input
                  type="number"
                  min="0"
                  value={form.sortOrder}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      sortOrder: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-forest-500"
                />
              </div>

              {/* Options */}
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        isFeatured:
                          e.target.checked,
                      })
                    }
                    className="h-4 w-4"
                  />

                  <span className="text-sm text-gray-700">
                    Set as featured image
                  </span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        isActive:
                          e.target.checked,
                      })
                    }
                    className="h-4 w-4"
                  />

                  <span className="text-sm text-gray-700">
                    Active on website
                  </span>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 border-t border-gray-100 pt-5">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="flex-1 rounded-xl border border-gray-200 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-forest-950 px-5 py-3 font-semibold text-white hover:bg-forest-900 disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingImage
                    ? "Update Image"
                    : "Upload Image"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;