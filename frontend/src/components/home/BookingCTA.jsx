import { Link } from "react-router-dom";
import Container from "../common/Container";
import Button from "../common/Button";

const BookingCTA = () => {
  return (
    <section className="bg-cream-50 py-20 sm:py-28">
      <Container>

        <div className="relative overflow-hidden rounded-[2rem] bg-fire-500 px-7 py-16 text-center sm:px-12 sm:py-20">

          {/* Decorative circles */}
          <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full border border-white/20" />
          <div className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full border border-white/10" />

          <div className="relative z-10 mx-auto max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/70">
              Your adventure starts here
            </p>

            <h2 className="mt-4 font-display text-4xl leading-tight text-white sm:text-5xl lg:text-6xl">
              Ready to escape the ordinary?
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/75 sm:text-base">
              Choose your experience, pick your date and get ready for
              an unforgettable time in the wild.
            </p>

            <Link
              to="/booking"
              className="mt-8 inline-block"
            >
              <Button
                variant="dark"
              >
                Book Your Camping Experience
              </Button>
            </Link>
          </div>

        </div>

      </Container>
    </section>
  );
};

export default BookingCTA;