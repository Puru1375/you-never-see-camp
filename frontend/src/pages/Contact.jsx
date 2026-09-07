import ContactHero from "../components/contact/ContactHero";
import ContactCards from "../components/contact/ContactCards";
import ContactForm from "../components/contact/ContactForm";
import ContactLocation from "../components/contact/ContactLocation";

import Container from "../components/common/Container";
import BookingCTA from "../components/home/BookingCTA";

const Contact = () => {
  return (
    <main>

      <ContactHero />

      <ContactCards />

      <section className="bg-cream-50 pb-20 sm:pb-28">
        <Container>

          <div className="mx-auto max-w-3xl">
            <ContactForm />
          </div>

        </Container>
      </section>

      <ContactLocation />

      <BookingCTA />

    </main>
  );
};

export default Contact;