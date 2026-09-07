import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import { getPackageBySlug } from "../services/api";

import PackageDetailsHero from "../components/packages/PackageDetailsHero";
import PackageOverview from "../components/packages/PackageOverview";
import PackageContent from "../components/packages/PackageContent";

const PackageDetails = () => {
  const { slug } = useParams();

  const [packageDetails, setPackageDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadPackage = async () => {
      try {
        setLoading(true);
        setError(false);

        const res = await getPackageBySlug(slug);

        setPackageDetails(res);
      } catch (err) {
        console.error("Failed to load package:", err);
        setError(true);
        setPackageDetails(null);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadPackage();
    }
  }, [slug]);

  // Loading state
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream-50 px-5">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-forest-900 border-t-transparent" />

          <p className="mt-4 text-sm text-earth-900">
            Loading package...
          </p>
        </div>
      </main>
    );
  }

  // Package not found / API error
  if (error || !packageDetails) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream-50 px-5">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-fire-600">
            Package not found
          </p>

          <h1 className="mt-3 font-display text-4xl text-earth-900">
            This experience doesn't exist.
          </h1>

          <Link
            to="/packages"
            className="mt-7 inline-flex rounded-full bg-forest-900 px-6 py-3.5 text-sm font-semibold text-white"
          >
            Explore Packages
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main>
      <PackageDetailsHero packageData={packageDetails.data} />

      <PackageOverview packageData={packageDetails.data} />

      <PackageContent packageData={packageDetails.data} />
    </main>
  );
};

export default PackageDetails;