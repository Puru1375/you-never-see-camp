import { useEffect, useState } from "react";
import {
  Image as ImageIcon,
  Plus,
  Star,
  StarOff,
  Edit3,
  Trash2,
  X,
  Eye,
  EyeOff,
} from "lucide-react";

import {
  getPackageImages,
  addPackageImage,
  updatePackageImage,
  setPrimaryPackageImage,
  deletePackageImage,
} from "../services/packageImages";

import {
  createPresignedUpload,
  uploadFileToS3,
} from "../services/uploads";

const PackageImages = ({ packageId, packageSlug }) => {
  const [images, setImages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingImage, setEditingImage] =
    useState(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

  const [form, setForm] = useState({
    altText: "",
    sortOrder: 0,
    isPrimary: false,
    isActive: true,
  });

  const loadImages = async () => {
    try {
      setLoading(true);

      const data =
        await getPackageImages(packageId);

      setImages(data);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (packageId) {
      loadImages();
    }
  }, [packageId]);

  const resetForm = () => {
    setEditingImage(null);
    setFile(null);
    setPreview("");

    setForm({
      altText: "",
      sortOrder: 0,
      isPrimary: false,
      isActive: true,
    });
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (image) => {
    setEditingImage(image);

    setForm({
      altText: image.altText || "",
      sortOrder: image.sortOrder ?? 0,
      isPrimary: image.isPrimary || false,
      isActive: image.isActive ?? true,
    });

    setFile(null);
    setPreview(image.imageUrl || "");

    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    resetForm();
  };

  const handleFileChange = (event) => {
    const selectedFile =
      event.target.files?.[0];

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

      let s3Key =
        editingImage?.s3Key || null;

      /*
       * Upload image to S3 when:
       * - creating a new image
       * - replacing an existing image
       */
      if (file) {
        const upload =
          await createPresignedUpload({
            type: "package",
            packageSlug,
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
        altText: form.altText || null,
        sortOrder:
          Number(form.sortOrder) || 0,
        isPrimary: form.isPrimary,
        isActive: form.isActive,
      };

      if (editingImage) {
        await updatePackageImage(
          packageId,
          editingImage.id,
          payload
        );
      } else {
        await addPackageImage(
          packageId,
          payload
        );
      }

      closeForm();

      await loadImages();
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePrimary = async (imageId) => {
    try {
      await setPrimaryPackageImage(
        packageId,
        imageId
      );

      await loadImages();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDelete = async (image) => {
    const confirmed = window.confirm(
      "Delete this package image?"
    );

    if (!confirmed) return;

    try {
      await deletePackageImage(
        packageId,
        image.id
      );

      await loadImages();
    } catch (error) {
      alert(error.message);
    }
  };

  if (!packageId) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
        <ImageIcon
          size={36}
          className="mx-auto text-gray-400"
        />

        <p className="mt-3 text-sm text-gray-500">
          Save the package first to manage
          package images.
        </p>
      </div>
    );
  }

  return (
    <section className="mt-8 space-y-5 rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ImageIcon
              size={20}
              className="text-forest-900"
            />

            <h2 className="text-xl font-bold text-forest-950">
              Package Images
            </h2>
          </div>

          <p className="mt-1 text-sm text-gray-500">
            Manage photos shown on the package
            page.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-forest-900"
        >
          <Plus size={17} />
          Add Image
        </button>
      </div>

      {/* Images */}
      {loading ? (
        <div className="py-10 text-center text-sm text-gray-500">
          Loading images...
        </div>
      ) : images.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
          <ImageIcon
            size={38}
            className="mx-auto text-gray-400"
          />

          <p className="mt-3 font-medium text-gray-700">
            No package images
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Add photos to make this package
            more attractive.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => (
            <div
              key={image.id}
              className="overflow-hidden rounded-2xl border border-gray-200"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] bg-gray-100">
                <img
                  src={image.imageUrl}
                  alt={
                    image.altText ||
                    "Package image"
                  }
                  className="h-full w-full object-cover"
                />

                {image.isPrimary && (
                  <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-gold-400 px-3 py-1.5 text-xs font-bold text-forest-950">
                    <Star size={13} />
                    Primary
                  </div>
                )}

                {!image.isActive && (
                  <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/70 px-3 py-1.5 text-xs text-white">
                    <EyeOff size={13} />
                    Hidden
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="space-y-3 p-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Alt Text
                  </p>

                  <p className="mt-1 line-clamp-2 text-sm text-gray-700">
                    {image.altText ||
                      "No alt text"}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    Order: {image.sortOrder}
                  </span>

                  <span className="flex items-center gap-1">
                    {image.isActive ? (
                      <>
                        <Eye size={13} />
                        Active
                      </>
                    ) : (
                      <>
                        <EyeOff size={13} />
                        Inactive
                      </>
                    )}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 border-t border-gray-100 pt-3">
                  <button
                    type="button"
                    onClick={() =>
                      openEdit(image)
                    }
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Edit3 size={14} />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handlePrimary(image.id)
                    }
                    className="rounded-lg border border-gray-200 px-3 py-2 text-gray-600 hover:bg-gray-50"
                    title="Set primary"
                  >
                    {image.isPrimary ? (
                      <Star size={16} />
                    ) : (
                      <StarOff size={16} />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(image)
                    }
                    className="rounded-lg border border-red-200 px-3 py-2 text-red-600 hover:bg-red-50"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h3 className="text-xl font-bold text-forest-950">
                  {editingImage
                    ? "Edit Package Image"
                    : "Add Package Image"}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Upload a high-quality package
                  photo.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-6 p-6"
            >
              {/* Preview / upload */}
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

                <label className="flex cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 px-6 py-8 text-center hover:border-forest-500 hover:bg-forest-50">
                  <div>
                    <ImageIcon
                      size={32}
                      className="mx-auto text-gray-400"
                    />

                    <p className="mt-2 text-sm font-medium text-gray-700">
                      {file
                        ? file.name
                        : editingImage
                        ? "Choose replacement image"
                        : "Choose image"}
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

              {/* Alt text */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Alt Text
                </label>

                <input
                  type="text"
                  value={form.altText}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      altText: e.target.value,
                    })
                  }
                  placeholder="Jungle Escape camping tents"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-forest-500"
                />
              </div>

              {/* Sort */}
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
                    checked={form.isPrimary}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        isPrimary:
                          e.target.checked,
                      })
                    }
                    className="h-4 w-4"
                  />

                  <span className="text-sm text-gray-700">
                    Set as primary image
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
                    Show on website
                  </span>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 border-t border-gray-100 pt-5">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-forest-950 px-4 py-3 font-semibold text-white hover:bg-forest-900 disabled:opacity-60"
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
    </section>
  );
};

export default PackageImages;