import Container from "../common/Container";
import SectionHeading from "../common/SectionHeading";

const reviews = [
  {
    name: "Rahul",
    location: "Mumbai",
    rating: 5,
    text: "Amazing atmosphere, beautiful location and the bonfire night was the highlight of our trip.",
  },
  {
    name: "Priya",
    location: "Ahmedabad",
    rating: 5,
    text: "A perfect weekend escape. The food, camping and overall experience were wonderful.",
  },
  {
    name: "Amit",
    location: "Surat",
    rating: 5,
    text: "Loved the peaceful surroundings and adventure activities. Definitely coming back.",
  },
];

const ReviewsSection = () => {
  return (
    <section className="bg-white py-20 sm:py-28">
      <Container>

        <SectionHeading
          eyebrow="Guest stories"
          title="Good memories speak for themselves."
          description="A few words from people who experienced the camp."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {reviews.map((review) => (
            <article
              key={review.name}
              className="rounded-3xl border border-earth-900/10 bg-cream-50 p-7 sm:p-8"
            >
              <div className="flex gap-1 text-fire-500">
                {Array.from({ length: review.rating }).map((_, index) => (
                  <span key={index}>★</span>
                ))}
              </div>

              <p className="mt-6 text-base leading-7 text-earth-800">
                “{review.text}”
              </p>

              <div className="mt-7 border-t border-earth-900/10 pt-5">
                <p className="font-semibold text-earth-900">
                  {review.name}
                </p>

                <p className="mt-1 text-xs text-earth-700/50">
                  {review.location}
                </p>
              </div>
            </article>
          ))}
        </div>

      </Container>
    </section>
  );
};

export default ReviewsSection;