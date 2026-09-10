import Hero from "../components/home/Hero";
import IntroSection from "../components/home/IntroSection";
import ExperienceStats from "../components/home/ExperienceStats";
import FeaturedPackages from "../components/home/FeaturedPackages";
import ExperiencesSection from "../components/home/ExperiencesSection";
import WhyChooseUs from "../components/home/WhyChooseUs";
import ExperienceBanner from "../components/home/ExperienceBanner";
import ReviewsSection from "../components/home/ReviewsSection";
import LocationSection from "../components/home/LocationSection";
import BookingCTA from "../components/home/BookingCTA";

const Home = () => {
  return (
    <main>
      <Hero />

      <IntroSection />

      <ExperienceStats />

      <FeaturedPackages />

      {/* <ExperiencesSection /> */}

      <WhyChooseUs />

      <ExperienceBanner />

      <ReviewsSection />

      {/* <LocationSection /> */}

      <BookingCTA />
    </main>
  );
};

export default Home;