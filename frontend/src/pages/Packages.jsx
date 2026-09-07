import PackagesHero from "../components/packages/PackagesHero";
import PackageCard from "../components/packages/PackageCard";
import Container from "../components/common/Container";
import SectionHeading from "../components/common/SectionHeading";
import { useEffect, useState } from "react";
import { getPackages } from "../services/api";
import { mapPackage } from "../services/mappers";

const Packages = () => {

    const [packages, setPackages] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
  const loadPackages = async () => {
    try {
      const response = await getPackages();
      console.log("API response:", response);
      setPackages(response.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  loadPackages();
}, []);

if (loading) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <p className="text-forest-900">Loading packages...</p>
    </div>
  );
}

if (error) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <p className="text-red-600">
        Failed to load packages: {error}
      </p>
    </div>
  );
}
  return (
    <main>

      <PackagesHero />

      <section className="bg-cream-50 py-20 sm:py-28">
        <Container>

          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <SectionHeading
              eyebrow="Camping packages"
              title="Find your perfect stay."
              description="Every package combines nature, comfort and memorable outdoor experiences."
            />

            <p className="text-sm text-earth-700/50">
              {packages.length} experiences
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {packages.map((packageData) => (
              <PackageCard
                key={packageData.id}
                packageData={packageData}
              />
            ))}
          </div>

        </Container>
      </section>

    </main>
  );
};

export default Packages;