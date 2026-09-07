export const packages = [
  {
    id: 1,
    slug: "jungle-escape",

    name: "Jungle Escape",

    tagline: "Slow down. Breathe deep. Get closer to nature.",

    shortDescription:
      "A peaceful overnight camping experience surrounded by greenery, fresh air and the sounds of nature.",

    price: 2000,

    priceLabel: "per guest",

    duration: "1 Night / 2 Days",

    accommodation: "Premium Camping Tent",

    meals: [
      "Welcome refreshments",
      "Dinner",
      "Breakfast",
    ],

    activities: [
      "Camping",
      "Bonfire",
      "Trail Walk",
      "Nature Experience",
    ],

    images: [
      "/images/trekking.jpg",
      "/images/jungle.jpg",
      "/images/bonfire.jpg",
    ],

    inclusions: [
      "Tent accommodation",
      "Welcome refreshments",
      "Dinner",
      "Breakfast",
      "Bonfire experience",
      "Trail walk",
      "Camp activities",
    ],

    exclusions: [
      "Transportation to the campsite",
      "Personal expenses",
      "Activities not mentioned in inclusions",
    ],

    capacity: 20,

    checkIn: "2:00 PM",
    checkOut: "11:00 AM",

    cancellation:
      "Cancellation policy will be applied according to the booking date and camp policy.",

    featured: true,
  },

  {
    id: 2,
    slug: "bonfire-weekend",

    name: "Bonfire Weekend",

    tagline: "Good food. Great music. Better memories.",

    shortDescription:
      "A fun-filled camping weekend with bonfire nights, music, delicious food and outdoor experiences.",

    price: 2500,

    priceLabel: "per guest",

    duration: "1 Night / 2 Days",

    accommodation: "Premium Camping Tent",

    meals: [
      "Welcome refreshments",
      "Dinner",
      "BBQ",
      "Breakfast",
    ],

    activities: [
      "Camping",
      "Bonfire Night",
      "Music",
      "BBQ",
      "Trail Walk",
    ],

    images: [
      "/images/bonfire.jpg",
      "/images/food.jpg",
      "/images/camp-tent.jpg",
    ],

    inclusions: [
      "Tent accommodation",
      "Welcome refreshments",
      "Dinner",
      "BBQ",
      "Breakfast",
      "Bonfire night",
      "Music",
      "Trail walk",
    ],

    exclusions: [
      "Transportation",
      "Personal expenses",
      "Optional paid activities",
    ],

    capacity: 25,

    checkIn: "2:00 PM",
    checkOut: "11:00 AM",

    cancellation:
      "Cancellation policy will be applied according to the booking date and camp policy.",

    featured: true,
  },

  {
    id: 3,
    slug: "adventure-escape",

    name: "Adventure Escape",

    tagline: "For those who want to explore a little further.",

    shortDescription:
      "An adventure-focused camping experience combining nature, trekking, outdoor activities and unforgettable nights.",

    price: 3000,

    priceLabel: "per guest",

    duration: "2 Nights / 3 Days",

    accommodation: "Premium Camping Tent",

    meals: [
      "Welcome refreshments",
      "Breakfast",
      "Lunch",
      "Dinner",
      "BBQ",
    ],

    activities: [
      "Camping",
      "Trekking",
      "Adventure Activities",
      "Trail Walk",
      "Bonfire",
      "Nature Experience",
    ],

    images: [
      "/images/trekking.jpg",
      "/images/adventure.jpg",
      "/images/jungle.jpg",
    ],

    inclusions: [
      "Tent accommodation",
      "All listed meals",
      "Trekking experience",
      "Adventure activities",
      "Trail walk",
      "Bonfire",
      "Camp activities",
    ],

    exclusions: [
      "Transportation",
      "Personal expenses",
      "Optional activities",
    ],

    capacity: 15,

    checkIn: "2:00 PM",
    checkOut: "11:00 AM",

    cancellation:
      "Cancellation policy will be applied according to the booking date and camp policy.",

    featured: true,
  },
];

export const getPackageBySlug = (slug) => {
  return packages.find((pkg) => pkg.slug === slug);
};