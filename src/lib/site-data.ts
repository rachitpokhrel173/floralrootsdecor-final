/**
 * Most content below is now real: services, packages, pricing, design
 * photography and testimonials reflect the actual business. What's
 * still placeholder: the "Birthday & Parties" design category (needs
 * real photos), and any location/date details on "Moments We've
 * Created" beyond the generic "Nepal" — swap those in as they're
 * confirmed.
 * ---------------------------------------------------------------
 */

export const eventCategories = [
  {
    slug: "weddings",
    label: "Weddings",
    image: "/images/wedding-real/wedding-real-01.jpg",
    description:
      "Mandap, stage and aisle design built around your rituals — from intimate ceremonies to grand celebrations.",
  },
  {
    slug: "engagements",
    label: "Engagements",
    image: "/images/engagement-real/engagement-real-03.jpg",
    description:
      "Soft, romantic settings for the moment a promise is made — florals, arches and light done with restraint.",
  },
  {
    slug: "birthdays",
    label: "Annaprashana & Birthdays",
    image: "/images/reception/reception-03.jpg",
    description:
      "From first birthdays to milestone celebrations — playful, personal decor that fits the honoree.",
  },
  {
    slug: "corporate",
    label: "Corporate Events",
    image: "/images/events/event-1.jpeg",
    description:
      "Brand-considered staging for launches, conferences and celebrations that still need to feel polished.",
  },
  {
    slug: "parties",
    label: "Parties",
    image: "/images/events/event-2.jpeg",
    description:
      "Anniversaries, reunions and private celebrations styled with the same care as our largest events.",
  },
  {
    slug: "traditional",
    label: "Traditional Celebrations",
    image: "/images/mandap/mandap-09.jpg",
    description:
      "Bratabandha, Pasni, pujas and cultural ceremonies decorated with respect for ritual and detail.",
  },
] as const;

/**
 * Design categories for the /designs page.
 * "mandap", "stage", "entrance", "engagement" and "wedding" are now
 * populated with real photography. "car-decoration", "reception-table"
 * and "birthday" stay as placeholder brand-toned art until real photos
 * are supplied for those categories.
 */
export const mandapPhotos = Array.from({ length: 19 }, (_, i) => {
  const n = String(i + 1).padStart(2, "0");
  return {
    id: n,
    image: `/images/mandap/mandap-${n}.jpg`,
    alt: `Mandap decoration by Floral Roots & Decor — design ${i + 1}`,
  };
});

export const stagePhotos = Array.from({ length: 24 }, (_, i) => {
  const n = String(i + 1).padStart(2, "0");
  return {
    id: n,
    image: `/images/stage/stage-${n}.jpg`,
    alt: `Stage and backdrop decoration by Floral Roots & Decor — design ${i + 1}`,
  };
});

export const entrancePhotos = Array.from({ length: 14 }, (_, i) => {
  const n = String(i + 1).padStart(2, "0");
  return {
    id: n,
    image: `/images/entrance-real/entrance-real-${n}.jpg`,
    alt: `Entrance and gate decoration by Floral Roots & Decor — design ${i + 1}`,
  };
});

export const mehndiPhotos = Array.from({ length: 9 }, (_, i) => {
  const n = String(i + 1).padStart(2, "0");
  return {
    id: n,
    image: `/images/mehndi/mehndi-${n}.jpg`,
    alt: `Mehndi ceremony decoration by Floral Roots & Decor — design ${i + 1}`,
  };
});

export const receptionPhotos = Array.from({ length: 3 }, (_, i) => {
  const n = String(i + 1).padStart(2, "0");
  return {
    id: n,
    image: `/images/reception/reception-${n}.jpg`,
    alt: `Reception and seating decoration by Floral Roots & Decor — design ${i + 1}`,
  };
});

export const carPhotos = Array.from({ length: 14 }, (_, i) => {
  const n = String(i + 1).padStart(2, "0");
  return {
    id: n,
    image: `/images/car-decoration/car-${n}.jpg`,
    alt: `Wedding car decoration by Floral Roots & Decor — design ${i + 1}`,
  };
});

export const nameBoardPhotos = Array.from({ length: 10 }, (_, i) => {
  const n = String(i + 1).padStart(2, "0");
  return {
    id: n,
    image: `/images/name-board/name-board-${n}.jpg`,
    alt: `Welcome / name board decoration by Floral Roots & Decor — design ${i + 1}`,
  };
});

export const engagementPhotos = Array.from({ length: 3 }, (_, i) => {
  const n = String(i + 1).padStart(2, "0");
  return {
    id: n,
    image: `/images/engagement-real/engagement-real-${n}.jpg`,
    alt: `Engagement decoration by Floral Roots & Decor — design ${i + 1}`,
  };
});

export const weddingPhotos = Array.from({ length: 2 }, (_, i) => {
  const n = String(i + 1).padStart(2, "0");
  return {
    id: n,
    image: `/images/wedding-real/wedding-real-${n}.jpg`,
    alt: `Outdoor wedding decoration by Floral Roots & Decor — design ${i + 1}`,
  };
});

export type DesignCategory = {
  slug: string;
  label: string;
  cover: string;
  description: string;
  isReal: boolean;
  photos: { id: string; image: string; alt: string }[];
};

export const designCategories: DesignCategory[] = [
  {
    slug: "mandap",
    label: "Mandap",
    cover: mandapPhotos[0].image,
    description: "Wedding mandap design — from traditional to contemporary, built around your rituals.",
    isReal: true,
    photos: mandapPhotos,
  },
  {
    slug: "wedding",
    label: "Wedding",
    cover: weddingPhotos[0].image,
    description: "Full wedding ceremony and reception design, indoor and outdoor.",
    isReal: true,
    photos: weddingPhotos,
  },
  {
    slug: "stage",
    label: "Stage Decoration",
    cover: stagePhotos[5].image,
    description: "Statement stage and backdrop design tailored to your event's theme.",
    isReal: true,
    photos: stagePhotos,
  },
  {
    slug: "entrance",
    label: "Entrance & Gate",
    cover: entrancePhotos[0].image,
    description: "Welcoming entrance, gate and aisle design as the first impression of your event.",
    isReal: true,
    photos: entrancePhotos,
  },
  {
    slug: "engagement",
    label: "Engagement",
    cover: engagementPhotos[2].image,
    description: "Soft, romantic engagement decor — arches, swings and floral installations.",
    isReal: true,
    photos: engagementPhotos,
  },
  {
    slug: "car-decoration",
    label: "Car Decoration",
    cover: carPhotos[2].image,
    description: "Bridal and groom car decoration with fresh florals and ribbon work.",
    isReal: true,
    photos: carPhotos,
  },
  {
    slug: "mehndi",
    label: "Mehndi",
    cover: mehndiPhotos[0].image,
    description: "Colorful mehndi ceremony staging — swings, backdrops and playful detail.",
    isReal: true,
    photos: mehndiPhotos,
  },
  {
    slug: "reception-table",
    label: "Reception & Table",
    cover: receptionPhotos[0].image,
    description: "Table styling, seating and reception backdrops designed for the evening.",
    isReal: true,
    photos: receptionPhotos,
  },
  {
    slug: "name-board",
    label: "Welcome / Name Board",
    cover: nameBoardPhotos[3].image,
    description: "Floral welcome boards and name signage — the first detail your guests see.",
    isReal: true,
    photos: nameBoardPhotos,
  },
  {
    slug: "birthday",
    label: "Birthday & Parties",
    cover: "/images/collection-6.svg",
    description: "Playful, personal decor for birthdays, anniversaries and private parties.",
    isReal: false,
    photos: [
      { id: "1", image: "/images/collection-6.svg", alt: "Birthday decoration placeholder design 1" },
      { id: "2", image: "/images/event-3.svg", alt: "Birthday decoration placeholder design 2" },
    ],
  },
];

export const collectionItems = [
  { id: 1, name: "Ivory Mandap Study", type: "Wedding", image: "/images/mandap/mandap-18.jpg", size: "tall" },
  { id: 2, name: "Happily Ever After", type: "Stage", image: "/images/stage/stage-06.jpg", size: "wide" },
  { id: 3, name: "Heart-Shaped Engagement Swing", type: "Engagement", image: "/images/engagement-real/engagement-real-03.jpg", size: "tall" },
  { id: 4, name: "Crimson Arch Ceremony", type: "Wedding", image: "/images/wedding-real/wedding-real-01.jpg", size: "wide" },
  { id: 5, name: "Modern Wave Backdrop", type: "Stage", image: "/images/stage/stage-22.jpg", size: "square" },
  { id: 6, name: "Colorful Mehndi Swing", type: "Mehndi", image: "/images/mehndi/mehndi-01.jpg", size: "square" },
] as const;

export const services = [
  {
    index: "01",
    name: "Event Decoration",
    description: "Full-concept decoration planning and execution for events of any scale.",
    image: "/images/entrance-real/entrance-real-13.jpg",
  },
  {
    index: "02",
    name: "Wedding Styling",
    description: "Mandap, stage, aisle and reception design built around your rituals.",
    image: "/images/mandap/mandap-05.jpg",
  },
  {
    index: "03",
    name: "Bouquet Floral Design",
    description: "Fresh floral installations, centerpieces and bouquets crafted in-house.",
    image: "/images/bouquet.jpeg",
  },
  {
    index: "04",
    name: "Stage & Backdrop Design",
    description: "Statement backdrops and stage design tailored to your event's theme.",
    image: "/images/stage/stage-22.jpg",
  },
  {
    index: "05",
    name: "Lighting Design",
    description: "Ambient, fairy and architectural lighting that shapes the evening.",
    image: "/images/lighting.jpeg",
  },
  {
    index: "06",
    name: "Full Event Services",
    description: "Catering coordination, entertainment and on-site execution, handled end to end.",
    image: "/images/car-decoration/car-06.jpg",
  },
] as const;

export type Package = {
  tier: string;
  suitedFor: string;
  startingPrice: string;
  image: string;
  inclusions: string[];
  featured?: boolean;
};

/**
 * Real wedding decoration packages — Baisakh booking flyer.
 * Update seasonally if pricing or inclusions change.
 */
export const packages: Package[] = [
  {
    tier: "Silver",
    suitedFor: "Simple, elegant wedding decoration essentials",
    startingPrice: "Rs. 55,000",
    image: "/images/entrance-real/entrance-real-05.jpg",
    inclusions: ["Mandap", "Stage Backdrop", "Gate", "Welcome Board (Complementary)"],
  },
  {
    tier: "Gold",
    suitedFor: "Complete wedding decoration with rituals covered",
    startingPrice: "Rs. 77,000",
    image: "/images/stage/stage-13.jpg",
    inclusions: [
      "Mandap",
      "Stage Backdrop",
      "Gate",
      "Fire Works",
      "Barmala",
      "Chadar",
      "Welcome Board (Complementary)",
    ],
    featured: true,
  },
  {
    tier: "Diamond",
    suitedFor: "Our most complete wedding decoration experience",
    startingPrice: "Rs. 1,21,000",
    image: "/images/mandap/mandap-14.jpg",
    inclusions: [
      "Mandap",
      "Stage Backdrop",
      "Gate",
      "Fire Works",
      "Barmala",
      "Chadar",
      "Photo Booth Setup",
      "Welcome Board (Complementary)",
    ],
  },
];

export const whyUs = [
  {
    title: "Creative",
    description: "Unique decoration concepts built for your event, never pulled off a shelf.",
  },
  {
    title: "Personal",
    description: "Every design is shaped around your story, your rituals and your people.",
  },
  {
    title: "Professional",
    description: "Reliable planning, clear communication and dependable execution.",
  },
  {
    title: "Detailed",
    description: "Every stem, drape and light considered — nothing left to chance.",
  },
  {
    title: "Experienced",
    description: "A team focused on one thing: celebrations people remember.",
  },
] as const;

/**
 * "Moments We've Created" — real completed work. Captions describe the
 * decoration itself (verified from the photo, e.g. names printed on a
 * couple's own welcome board) rather than inventing client stories.
 * Add exact venue/city per photo once you're ready to share it — until
 * then "Nepal" is used as a truthful, non-specific location.
 */
export const realEvents = [
  { id: 1, name: "Abhiyan & Shreya's Reception", type: "Wedding", location: "Nepal", image: "/images/name-board/name-board-04.jpg" },
  { id: 2, name: "Traditional Mehndi Ceremony", type: "Mehndi", location: "Nepal", image: "/images/mehndi/mehndi-01.jpg" },
  { id: 3, name: "Bridal Car Styling", type: "Wedding", location: "Nepal", image: "/images/car-decoration/car-08.jpg" },
  { id: 4, name: "Poolside Engagement Setup", type: "Engagement", location: "Nepal", image: "/images/engagement-real/engagement-real-01.jpg" },
  { id: 5, name: "Reception Table Styling", type: "Reception", location: "Nepal", image: "/images/reception/reception-02.jpg" },
  { id: 6, name: "Temple Bratabandha Ceremony", type: "Traditional", location: "Nepal", image: "/images/mandap/mandap-09.jpg" },
] as const;

export const testimonials = [
  {
    name: "Amit & Urmila",
    event: "Wedding, Banepa, Kavrepalanchok",
    quote:
      "From the entrance décor to the stage backdrop, everything was breathtaking. Professional, punctual, and so easy to work with. Highly recommend!",
    image: "/images/testimonial-1.svg",
  },
  {
    name: "Prasesh & Spohiya",
    event: "Wedding, Kavrepalanchok",
    quote:
      "The flowers were fresh, fragrant, and arranged with so much love. It felt like they truly understood our vision. Thank you for the magic!",
    image: "/images/testimonial-2.svg",
  },
  {
    name: "Suresh Bajracharya, HR Manager",
    event: "Corporate Event, Kathmandu",
    quote:
      "We hired them for our company's annual event in Kathmandu, and the decor was outstanding. Elegant stage setup, fresh floral arrangements, and everything delivered right on schedule. Highly professional team!",
    image: "/images/testimonial-3.svg",
  },
] as const;

export const howItWorks = [
  { step: "01", title: "Tell Us Your Vision", description: "Share your event date, venue and the feeling you want to create." },
  { step: "02", title: "Choose Your Design", description: "We propose concepts drawn from our collection or built new for you." },
  { step: "03", title: "Customize Your Event", description: "Refine florals, colors, lighting and layout until it feels right." },
  { step: "04", title: "Confirm Your Booking", description: "Lock in your date with a clear plan, timeline and quote." },
  { step: "05", title: "Enjoy Your Celebration", description: "Our team handles setup and execution — you enjoy the day." },
] as const;

/** Routes — wire these to the existing site's real pages */
export const routes = {
  book: "/book",
  quote: "/book?type=quote",
  designs: "/designs",
  services: "/services",
  packages: "/packages",
  about: "/about",
  contact: "/contact",
  admin: "/login",
};

export const contact = {
  phones: ["+977-9840261629", "+977-9843729421"],
  email: "floralrootsdecors@gmail.com",
  location: "Banepa-Nala Road, Banepa, Kavrepalanchok 45210, Nepal",
  instagram: "https://instagram.com/floraldecoroots",
  facebook: "https://facebook.com/floraldecoroots",
};

export const builtBy = {
  name: "Rachit Pokhrel",
  url: "https://rachitpokhrel.com.np/",
};

/**
 * Team roster — placeholder names, roles and photos only. No real
 * identities invented. Replace `name` and `photo` per person, and swap
 * `photo` from the generic placeholder to a real headshot, when ready.
 */
export const ourTeam = [
  {
    name: "Nishan Khadka",
    role: "Founder & Creative Director",
    photo: "/images/team/nishan__khadka.jpg" ,
  },
  {
    name: "Add Name",
    role: "Lead Florist",
    photo: null,
  },
  {
    name: "Add Name",
    role: "Event Coordinator",
    photo: null,
  },
  {
    name: "Add Name",
    role: "Setup & Installation Lead",
    photo: null,
  },
] as const;

/** Full list of services the decor team can realistically deliver — for the /services page */
export const allServices = [
  {
    category: "Wedding & Ceremony",
    items: [
      { name: "Mandap Design & Decoration", description: "Traditional to contemporary mandap setups built around your rituals." },
      { name: "Wedding Stage Decoration", description: "Statement stage design for the ceremony and reception." },
      { name: "Aisle & Entrance Decoration", description: "Floral aisles, gates and welcome arches." },
      { name: "Bratabandha & Pasni Decoration", description: "Traditional ceremony decoration with cultural detailing." },
      { name: "Bridal Car Decoration", description: "Fresh floral and ribbon work for the wedding car." },
    ],
  },
  {
    category: "Floral Design",
    items: [
      { name: "Fresh Floral Installations", description: "Large-scale floral walls, arches and hanging installations." },
      { name: "Centerpieces & Table Florals", description: "Table centerpieces styled to match your event's palette." },
      { name: "Bouquets & Personal Florals", description: "Bridal bouquets, boutonnieres and floral accessories." },
    ],
  },
  {
    category: "Event & Stage Production",
    items: [
      { name: "Stage & Backdrop Design", description: "Custom backdrops built around your event's theme and colors." },
      { name: "Lighting Design", description: "Ambient, fairy-light and architectural lighting setups." },
      { name: "Draping & Fabric Styling", description: "Ceiling drapes, wall fabric and tent styling." },
      { name: "Seating & Table Layout", description: "Full seating arrangement and table layout planning." },
    ],
  },
  {
    category: "Celebrations & Corporate",
    items: [
      { name: "Birthday Decoration", description: "From first birthdays to milestone celebrations." },
      { name: "Anniversary & Private Party Decor", description: "Styled decor for anniversaries and private gatherings." },
      { name: "Corporate Event Staging", description: "Brand-considered staging for launches and conferences." },
      { name: "Balloon Decoration", description: "Balloon arches, backdrops and installations." },
    ],
  },
  {
    category: "Full Event Coordination",
    items: [
      { name: "Event Planning & Concept Design", description: "Full-concept planning from first idea to final walkthrough." },
      { name: "On-Site Setup & Execution", description: "Dedicated on-site team handling setup, styling and breakdown." },
      { name: "Vendor & Catering Coordination", description: "Coordination with catering, entertainment and other vendors." },
    ],
  },
] as const;
