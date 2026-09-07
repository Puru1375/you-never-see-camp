export const experiences = [
  {
    id: 1,
    slug: "bonfire-nights",
    title: "Bonfire Nights",
    category: "Night Experience",
    tagline: "Warm fires. Good music. Great memories.",

    description:
      "Gather around the fire as the sun disappears, enjoy music, share stories and experience the magic of a night in the wild.",

    image: "/images/bonfire.jpg",

    highlights: [
      "Evening bonfire",
      "Music",
      "Group gathering",
      "Outdoor atmosphere",
    ],
  },

  {
    id: 2,
    slug: "stargazing",
    title: "Stargazing",
    category: "Nature Experience",
    tagline: "Look up. Slow down. Take it all in.",

    description:
      "Leave the city lights behind and spend a quiet night beneath the stars surrounded by nature.",

    image: "/images/stargazing.jpg",

    highlights: [
      "Open sky",
      "Night experience",
      "Nature surroundings",
      "Peaceful atmosphere",
    ],
  },

  {
    id: 3,
    slug: "trekking",
    title: "Trekking & Trail Walks",
    category: "Adventure",
    tagline: "Follow the trail. Discover what lies beyond.",

    description:
      "Explore the natural surroundings through guided trails and trekking experiences designed for adventure and discovery.",

    image: "/images/trekking.jpg",

    highlights: [
      "Nature trails",
      "Trekking",
      "Scenic views",
      "Outdoor exploration",
    ],
  },

  {
    id: 4,
    slug: "food-and-bbq",
    title: "Food & BBQ",
    category: "Food Experience",
    tagline: "Good food tastes better outdoors.",

    description:
      "Enjoy delicious food, outdoor BBQ and relaxed meals surrounded by nature and good company.",

    image: "/images/food.jpg",

    highlights: [
      "Fresh meals",
      "BBQ",
      "Outdoor dining",
      "Local flavours",
    ],
  },

  {
    id: 5,
    slug: "adventure-activities",
    title: "Adventure Activities",
    category: "Adventure",
    tagline: "Step outside your comfort zone.",

    description:
      "Add a little excitement to your stay with outdoor adventure activities and experiences.",

    image: "/images/adventure.jpg",

    highlights: [
      "Outdoor activities",
      "Adventure",
      "Group experiences",
      "Fun challenges",
    ],
  },

  {
    id: 6,
    slug: "nature-experience",
    title: "Nature Experience",
    category: "Nature",
    tagline: "Reconnect with the world around you.",

    description:
      "Take a break from the noise and spend time surrounded by greenery, fresh air and the natural landscape.",

    image: "/images/jungle.jpg",

    highlights: [
      "Fresh air",
      "Green surroundings",
      "Nature walks",
      "Quiet moments",
    ],
  },

  {
    id: 7,
    slug: "sunrise-sunset",
    title: "Sunrise & Sunset",
    category: "Nature Experience",
    tagline: "Some views are worth waking up for.",

    description:
      "Experience the changing colours of the sky from the calm of the campsite and surrounding landscape.",

    image: "/images/sunrise.jpg",

    highlights: [
      "Sunrise views",
      "Sunset moments",
      "Photography",
      "Nature",
    ],
  },

  {
    id: 8,
    slug: "music-nights",
    title: "Music Nights",
    category: "Night Experience",
    tagline: "Music sounds different under the open sky.",

    description:
      "Enjoy relaxed music, conversations and a lively atmosphere around camp after sunset.",

    image: "/images/bonfire.jpg",

    highlights: [
      "Live music",
      "Bonfire",
      "Social atmosphere",
      "Night experience",
    ],
  },
];

export const getExperienceBySlug = (slug) => {
  return experiences.find(
    (experience) => experience.slug === slug
  );
};