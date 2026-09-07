export const mapPackage = (item) => ({
  id: item.id,
  slug: item.slug,

  name: item.name,
  tagline: item.tagline,
  description: item.description,

  price: Number(item.base_price),

  priceLabel:
    item.price_label,

  duration:
    item.duration,

  accommodation:
    item.accommodation,

  capacity:
    item.max_guests,

  maxGuests:
    item.max_guests,

  checkIn:
    item.check_in_time,

  checkOut:
    item.check_out_time,

  featured:
    item.featured,

  meals:
    Array.isArray(item.meals)
      ? item.meals
      : [],

  activities:
    Array.isArray(item.activities)
      ? item.activities
      : [],

  image:
    item.image_url ||
    item.image ||
    null,
});