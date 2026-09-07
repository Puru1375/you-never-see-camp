import FAQHero from "../components/faq/FAQHero";
import FAQAccordion from "../components/faq/FAQAccordion";

import Container from "../components/common/Container";
import BookingCTA from "../components/home/BookingCTA";

import { faqs } from "../data/faqs";

const FAQ = () => {
  return (
    <main>

      <FAQHero />

      <section className="bg-cream-50 py-20 sm:py-28">
        <Container>

          <div className="mx-auto max-w-3xl">

            <FAQAccordion
              faqs={faqs}
            />

          </div>

        </Container>
      </section>

      <BookingCTA />

    </main>
  );
};

export default FAQ;