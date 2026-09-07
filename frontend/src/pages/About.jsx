import AboutHero from "../components/about/AboutHero";
import OurStory from "../components/about/OurStory";
import MissionVision from "../components/about/MissionVision";
import WhatMakesUsDifferent from "../components/about/WhatMakesUsDifferent";
import AboutImageSection from "../components/about/AboutImageSection";
import BookingCTA from "../components/home/BookingCTA";

const About = () => {
  return (
    <main>
      <AboutHero />

      <OurStory />

      <MissionVision />

      <WhatMakesUsDifferent />

      <AboutImageSection />

      <BookingCTA />
    </main>
  );
};

export default About;