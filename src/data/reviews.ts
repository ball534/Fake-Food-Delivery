import type { Review } from "./types";

// Fake customer reviews per store. All fictional (simulation only).

const REVIEWS_BY_STORE: Record<string, Review[]> = {
  mcd: [
    { id: "r-mcd-1", author: "Bryan T.", emoji: "🧑", rating: 5, text: "Fries were hot and crispy, classic never misses.", daysAgo: 2 },
    { id: "r-mcd-2", author: "Nurul", emoji: "🧕", rating: 4, text: "McSpicy had a good kick. Delivery was quick.", daysAgo: 5 },
    { id: "r-mcd-3", author: "Daniel L.", emoji: "🧔", rating: 4, text: "Reliable comfort food. Big Mac sauce hits.", daysAgo: 9 },
  ],
  kfc: [
    { id: "r-kfc-1", author: "Priya", emoji: "👩", rating: 5, text: "Zinger is unbeatable. Crispy and juicy!", daysAgo: 1 },
    { id: "r-kfc-2", author: "Wei Jie", emoji: "🧑", rating: 4, text: "Popcorn chicken was great for sharing.", daysAgo: 6 },
    { id: "r-kfc-3", author: "Sam", emoji: "👨", rating: 3, text: "Bit oily this time but flavour was solid.", daysAgo: 12 },
  ],
  mos: [
    { id: "r-mos-1", author: "Aiko", emoji: "👩", rating: 5, text: "Rice burger is genius. So filling and tasty.", daysAgo: 3 },
    { id: "r-mos-2", author: "Marcus", emoji: "🧑", rating: 4, text: "Teriyaki chicken burger was lovely. Onion rings 10/10.", daysAgo: 8 },
  ],
  sushiro: [
    { id: "r-sushiro-1", author: "Hana", emoji: "👩", rating: 5, text: "Salmon was fresh and the chirashi don was generous.", daysAgo: 2 },
    { id: "r-sushiro-2", author: "Jun", emoji: "🧑", rating: 5, text: "Best value sushi delivery. Mochi ice cream is a must.", daysAgo: 4 },
    { id: "r-sushiro-3", author: "Cheryl", emoji: "👩‍🦰", rating: 4, text: "Came well-packed, nothing squished. Tamago was sweet.", daysAgo: 10 },
  ],
  koi: [
    { id: "r-koi-1", author: "Xin Yi", emoji: "👩", rating: 5, text: "Golden bubbles are chewy perfection. 50% sugar just right.", daysAgo: 1 },
    { id: "r-koi-2", author: "Faris", emoji: "🧑", rating: 4, text: "Macchiato foam is so good. A bit pricey but worth it.", daysAgo: 7 },
  ],
  jollibee: [
    { id: "r-jb-1", author: "Maria", emoji: "👩", rating: 5, text: "Chickenjoy + Jolly Spaghetti = childhood in a box.", daysAgo: 2 },
    { id: "r-jb-2", author: "Ken", emoji: "🧑", rating: 4, text: "Peach mango pie was piping hot. Loved it.", daysAgo: 9 },
  ],
  bk: [
    { id: "r-bk-1", author: "Tom", emoji: "👨", rating: 4, text: "Flame-grilled Whopper actually tastes grilled. Nice.", daysAgo: 3 },
    { id: "r-bk-2", author: "Siti", emoji: "🧕", rating: 4, text: "Mushroom Swiss is underrated. Quick delivery too.", daysAgo: 6 },
  ],
  subway: [
    { id: "r-sub-1", author: "Hui Min", emoji: "👩", rating: 4, text: "Fresh and customisable. B.M.T. never disappoints.", daysAgo: 4 },
    { id: "r-sub-2", author: "Arjun", emoji: "🧑", rating: 5, text: "Cookie arrived warm somehow. Made my day.", daysAgo: 11 },
  ],
  "4fingers": [
    { id: "r-4f-1", author: "Jin", emoji: "🧑", rating: 5, text: "Soy garlic wings are addictive. Get the rice box too.", daysAgo: 1 },
    { id: "r-4f-2", author: "Rachel", emoji: "👩", rating: 4, text: "Spicy is genuinely spicy. Kimchi slaw balances it.", daysAgo: 5 },
  ],
  liho: [
    { id: "r-liho-1", author: "Joel", emoji: "🧑", rating: 4, text: "Cheese brown sugar pearl is decadent. Loved it.", daysAgo: 2 },
    { id: "r-liho-2", author: "Mei", emoji: "👩", rating: 4, text: "Fruit tea was refreshing with real fruit bits.", daysAgo: 8 },
  ],
  occ: [
    { id: "r-occ-1", author: "Uncle Lim", emoji: "👨", rating: 5, text: "Curry'O is still the GOAT. Flaky and fragrant.", daysAgo: 3 },
    { id: "r-occ-2", author: "Farah", emoji: "🧕", rating: 4, text: "Sotong balls bouncy and fresh. Nostalgic snack run.", daysAgo: 7 },
  ],
  mrbean: [
    { id: "r-mb-1", author: "Wen", emoji: "👩", rating: 5, text: "Soya milk so smooth and not too sweet. Pancakes fluffy.", daysAgo: 2 },
    { id: "r-mb-2", author: "Hafiz", emoji: "🧑", rating: 4, text: "Soya soft serve is a guilt-free treat. Yum.", daysAgo: 6 },
  ],
};

const FALLBACK: Review[] = [
  { id: "r-generic-1", author: "A. Foodie", emoji: "🙂", rating: 4, text: "Tasty and arrived on time. Would order again.", daysAgo: 4 },
];

export function getReviews(storeId: string): Review[] {
  return REVIEWS_BY_STORE[storeId] ?? FALLBACK;
}
