import { Link } from "react-router-dom";
import Container from "../common/Container";
import SectionHeading from "../common/SectionHeading";
import PackageCard from "../packages/PackageCard";
import { getPackages } from "../../services/api";
import { useEffect, useState } from "react";

const FeaturedPackages = () => {
  const [featuredPackages, setPackageDetails] = useState([]);

  useEffect(() => {
      const loadPackage = async () => {
        try {
          const res = await getPackages();
          setPackageDetails(res.data);
        } catch (err) {
          console.error("Failed to load package:", err);
          setPackageDetails(null);
        }
      };

      loadPackage();
    }, []);


    console.log("featuredPackages", featuredPackages);


  return (
    <section className="bg-cream-50 py-20 sm:py-28">
      <Container>

        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="Stay with us"
            title="Choose your escape"
            description="Thoughtfully designed camping experiences for peaceful getaways, memorable weekends and adventurous escapes."
          />

          <Link
            to="/packages"
            className="hidden text-sm font-semibold text-forest-900 sm:block"
          >
            View all packages →
          </Link>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {/* // need to show only 3 packages here, so slicing the array to first 3 elements */}
          {featuredPackages.slice(0, 3).map((packageData) => (
            <PackageCard
              key={packageData.id}
              packageData={packageData}
            />
          ))}
        </div>

        <Link
          to="/packages"
          className="mt-8 block text-center text-sm font-semibold text-forest-900 sm:hidden"
        >
          View all packages →
        </Link>

      </Container>
    </section>
  );
};

export default FeaturedPackages;