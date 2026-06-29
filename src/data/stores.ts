import type { ItemOption, Store } from "./types";

// ---------------------------------------------------------------------------
// Seed data. All stores, menus, and prices are FAKE (simulation only).
// "Photos" are emoji to keep the project free, offline, and free of scraped
// brand assets. Brand names are used for familiarity in a clearly-labelled
// fan/simulation — not affiliated with any company.
// ---------------------------------------------------------------------------

// Reusable option builders -------------------------------------------------

const drinkSize: ItemOption = {
  id: "size",
  label: "Size",
  required: true,
  choices: [
    { id: "s", label: "Small", priceDelta: 0 },
    { id: "m", label: "Medium", priceDelta: 0.8 },
    { id: "l", label: "Large", priceDelta: 1.5 },
  ],
};

const sugarLevel: ItemOption = {
  id: "sugar",
  label: "Sugar level",
  required: true,
  choices: [
    { id: "0", label: "0%", priceDelta: 0 },
    { id: "30", label: "30%", priceDelta: 0 },
    { id: "50", label: "50%", priceDelta: 0 },
    { id: "100", label: "100%", priceDelta: 0 },
  ],
};

const iceLevel: ItemOption = {
  id: "ice",
  label: "Ice level",
  required: true,
  choices: [
    { id: "no", label: "No ice", priceDelta: 0 },
    { id: "less", label: "Less ice", priceDelta: 0 },
    { id: "normal", label: "Normal ice", priceDelta: 0 },
  ],
};

const toppings: ItemOption = {
  id: "toppings",
  label: "Toppings",
  multiSelect: true,
  choices: [
    { id: "pearl", label: "Golden pearls", priceDelta: 0.7 },
    { id: "pudding", label: "Pudding", priceDelta: 0.8 },
    { id: "grass", label: "Grass jelly", priceDelta: 0.7 },
    { id: "cheese", label: "Cheese foam", priceDelta: 1.2 },
  ],
};

const spiceLevel: ItemOption = {
  id: "spice",
  label: "Spice level",
  required: true,
  choices: [
    { id: "mild", label: "Mild", priceDelta: 0 },
    { id: "medium", label: "Medium", priceDelta: 0 },
    { id: "hot", label: "Hot 🔥", priceDelta: 0 },
  ],
};

const burgerAddons: ItemOption = {
  id: "addons",
  label: "Add-ons",
  multiSelect: true,
  choices: [
    { id: "cheese", label: "Extra cheese", priceDelta: 1.0 },
    { id: "bacon", label: "Add bacon", priceDelta: 1.5 },
    { id: "egg", label: "Add egg", priceDelta: 1.0 },
    { id: "patty", label: "Extra patty", priceDelta: 2.5 },
  ],
};

const upsizeMeal: ItemOption = {
  id: "upsize",
  label: "Upsize meal?",
  required: true,
  choices: [
    { id: "no", label: "Regular", priceDelta: 0 },
    { id: "yes", label: "Upsize (+$1.20)", priceDelta: 1.2 },
  ],
};

// ---------------------------------------------------------------------------

export const STORES: Store[] = [
  {
    id: "mcd",
    name: "McDonald's",
    cuisine: "Western",
    emoji: "🍟",
    bannerFrom: "#fbbf24",
    bannerTo: "#ef4444",
    rating: 4.4,
    etaMinutes: [20, 25],
    distanceKm: 1.2,
    priceLevel: 1,
    menu: [
      {
        type: "set_meal",
        label: "Set Meals",
        items: [
          {
            id: "mcd-set-bigmac",
            name: "Big Mac Meal",
            description: "Big Mac + fries + Coke. The classic.",
            emoji: "🍔",
            basePrice: 8.9,
            tags: ["popular"],
            options: [upsizeMeal],
          },
          {
            id: "mcd-set-mcspicy",
            name: "McSpicy Meal",
            description: "Spicy chicken fillet burger + fries + drink.",
            emoji: "🌶️",
            basePrice: 9.4,
            tags: ["spicy", "popular"],
            options: [upsizeMeal, spiceLevel],
          },
        ],
      },
      {
        type: "a_la_carte",
        label: "À la carte",
        items: [
          {
            id: "mcd-bigmac",
            name: "Big Mac",
            description: "Two all-beef patties, special sauce, lettuce, cheese.",
            emoji: "🍔",
            basePrice: 6.5,
            options: [burgerAddons],
          },
          {
            id: "mcd-mcspicy",
            name: "McSpicy",
            description: "Fiery whole chicken-thigh fillet burger.",
            emoji: "🍗",
            basePrice: 7.0,
            tags: ["spicy"],
            options: [burgerAddons, spiceLevel],
          },
        ],
      },
      {
        type: "side",
        label: "Sides",
        items: [
          {
            id: "mcd-fries",
            name: "World Famous Fries",
            description: "Golden, crispy, salted.",
            emoji: "🍟",
            basePrice: 3.2,
            tags: ["popular"],
            options: [
              {
                id: "size",
                label: "Size",
                required: true,
                choices: [
                  { id: "s", label: "Small", priceDelta: 0 },
                  { id: "m", label: "Medium", priceDelta: 0.8 },
                  { id: "l", label: "Large", priceDelta: 1.4 },
                ],
              },
            ],
          },
          {
            id: "mcd-nuggets",
            name: "Chicken McNuggets (6pc)",
            description: "Crispy bite-size chicken with dip.",
            emoji: "🍗",
            basePrice: 5.5,
          },
        ],
      },
      {
        type: "drink",
        label: "Drinks",
        items: [
          {
            id: "mcd-coke",
            name: "Coca-Cola",
            description: "Ice-cold and fizzy.",
            emoji: "🥤",
            basePrice: 2.4,
            options: [drinkSize],
          },
        ],
      },
      {
        type: "dessert",
        label: "Desserts",
        items: [
          {
            id: "mcd-mcflurry",
            name: "McFlurry Oreo",
            description: "Soft serve with crushed Oreo.",
            emoji: "🍦",
            basePrice: 3.9,
            tags: ["popular"],
          },
          {
            id: "mcd-sundae",
            name: "Hot Fudge Sundae",
            description: "Vanilla soft serve, warm fudge.",
            emoji: "🍨",
            basePrice: 2.9,
          },
        ],
      },
    ],
  },

  {
    id: "kfc",
    name: "KFC",
    cuisine: "Western",
    emoji: "🍗",
    bannerFrom: "#ef4444",
    bannerTo: "#7f1d1d",
    rating: 4.3,
    etaMinutes: [25, 30],
    distanceKm: 2.1,
    priceLevel: 2,
    menu: [
      {
        type: "set_meal",
        label: "Set Meals",
        items: [
          {
            id: "kfc-set-zinger",
            name: "Zinger Burger Meal",
            description: "Zinger + whipped potato + drink.",
            emoji: "🍔",
            basePrice: 9.8,
            tags: ["popular", "spicy"],
            options: [upsizeMeal],
          },
          {
            id: "kfc-set-2pc",
            name: "2pc Chicken Meal",
            description: "2 pieces of signature fried chicken + side + drink.",
            emoji: "🍗",
            basePrice: 10.5,
            options: [upsizeMeal, spiceLevel],
          },
        ],
      },
      {
        type: "a_la_carte",
        label: "À la carte",
        items: [
          {
            id: "kfc-zinger",
            name: "Zinger Burger",
            description: "Crunchy spicy chicken fillet, lettuce, mayo.",
            emoji: "🌶️",
            basePrice: 6.8,
            tags: ["spicy"],
          },
          {
            id: "kfc-2pc",
            name: "2pc Fried Chicken",
            description: "Crispy on the outside, juicy inside.",
            emoji: "🍗",
            basePrice: 7.5,
            options: [spiceLevel],
          },
        ],
      },
      {
        type: "side",
        label: "Sides",
        items: [
          {
            id: "kfc-popcorn",
            name: "Popcorn Chicken",
            description: "Poppable golden bites.",
            emoji: "🍿",
            basePrice: 5.0,
            tags: ["popular"],
          },
          {
            id: "kfc-cheesefries",
            name: "Cheese Fries",
            description: "Fries smothered in cheese sauce.",
            emoji: "🧀",
            basePrice: 4.2,
          },
        ],
      },
      {
        type: "drink",
        label: "Drinks",
        items: [
          {
            id: "kfc-pepsi",
            name: "Pepsi",
            description: "Chilled cola.",
            emoji: "🥤",
            basePrice: 2.4,
            options: [drinkSize],
          },
        ],
      },
    ],
  },

  {
    id: "mos",
    name: "MOS Burger",
    cuisine: "Japanese",
    emoji: "🍔",
    bannerFrom: "#16a34a",
    bannerTo: "#065f46",
    rating: 4.5,
    etaMinutes: [20, 30],
    distanceKm: 2.8,
    priceLevel: 2,
    menu: [
      {
        type: "set_meal",
        label: "Set Meals",
        items: [
          {
            id: "mos-set-rice",
            name: "Rice Burger Set",
            description: "Grilled rice 'buns' + side + green tea.",
            emoji: "🍙",
            basePrice: 10.2,
            tags: ["new"],
            options: [upsizeMeal],
          },
        ],
      },
      {
        type: "a_la_carte",
        label: "À la carte",
        items: [
          {
            id: "mos-rice",
            name: "Yakiniku Rice Burger",
            description: "Savory beef between two grilled rice patties.",
            emoji: "🍙",
            basePrice: 7.4,
            tags: ["popular"],
          },
          {
            id: "mos-teriyaki",
            name: "Teriyaki Chicken Burger",
            description: "Grilled chicken glazed in teriyaki.",
            emoji: "🍔",
            basePrice: 6.9,
          },
        ],
      },
      {
        type: "side",
        label: "Sides",
        items: [
          {
            id: "mos-onion",
            name: "Onion Rings",
            description: "Crispy battered onion rings.",
            emoji: "🧅",
            basePrice: 4.0,
          },
        ],
      },
      {
        type: "drink",
        label: "Drinks",
        items: [
          {
            id: "mos-greentea",
            name: "Iced Green Tea",
            description: "Refreshing unsweetened green tea.",
            emoji: "🍵",
            basePrice: 2.6,
            options: [drinkSize, sugarLevel],
          },
        ],
      },
    ],
  },

  {
    id: "sushiro",
    name: "Sushiro",
    cuisine: "Japanese",
    emoji: "🍣",
    bannerFrom: "#38bdf8",
    bannerTo: "#1e3a8a",
    rating: 4.6,
    etaMinutes: [25, 30],
    distanceKm: 3.4,
    priceLevel: 2,
    menu: [
      {
        type: "set_meal",
        label: "Set Meals",
        items: [
          {
            id: "sushiro-set-chirashi",
            name: "Chirashi Don Set",
            description: "Assorted sashimi over rice + miso soup + chawanmushi.",
            emoji: "🍱",
            basePrice: 14.8,
            tags: ["popular"],
          },
        ],
      },
      {
        type: "a_la_carte",
        label: "À la carte",
        items: [
          {
            id: "sushiro-salmon",
            name: "Salmon Sushi (2pc)",
            description: "Fresh salmon over seasoned rice.",
            emoji: "🍣",
            basePrice: 3.6,
            tags: ["popular"],
          },
          {
            id: "sushiro-chirashi",
            name: "Chirashi Don",
            description: "A bowl of assorted sashimi over rice.",
            emoji: "🍚",
            basePrice: 12.5,
          },
          {
            id: "sushiro-tamago",
            name: "Tamago Sushi (2pc)",
            description: "Sweet Japanese omelette sushi.",
            emoji: "🍳",
            basePrice: 2.8,
          },
        ],
      },
      {
        type: "side",
        label: "Sides",
        items: [
          {
            id: "sushiro-chawanmushi",
            name: "Chawanmushi",
            description: "Silky steamed egg custard.",
            emoji: "🥚",
            basePrice: 3.2,
          },
          {
            id: "sushiro-miso",
            name: "Miso Soup",
            description: "Warm, comforting miso.",
            emoji: "🍜",
            basePrice: 1.8,
          },
        ],
      },
      {
        type: "drink",
        label: "Drinks",
        items: [
          {
            id: "sushiro-ramune",
            name: "Ramune Soda",
            description: "Classic marble-bottle soda.",
            emoji: "🥤",
            basePrice: 3.0,
          },
        ],
      },
      {
        type: "dessert",
        label: "Desserts",
        items: [
          {
            id: "sushiro-mochi",
            name: "Mochi Ice Cream",
            description: "Chewy mochi wrapped around ice cream.",
            emoji: "🍡",
            basePrice: 3.4,
            tags: ["new"],
          },
        ],
      },
    ],
  },

  {
    id: "koi",
    name: "KOI Thé",
    cuisine: "Drinks",
    emoji: "🧋",
    bannerFrom: "#a16207",
    bannerTo: "#451a03",
    rating: 4.7,
    etaMinutes: [20, 25],
    distanceKm: 0.9,
    priceLevel: 1,
    menu: [
      {
        type: "drink",
        label: "Drinks",
        items: [
          {
            id: "koi-golden",
            name: "Golden Bubble Milk Tea",
            description: "Signature milk tea with golden pearls.",
            emoji: "🧋",
            basePrice: 4.2,
            tags: ["popular"],
            options: [drinkSize, sugarLevel, iceLevel, toppings],
          },
          {
            id: "koi-macchiato",
            name: "Macchiato Milk Tea",
            description: "Milk tea topped with salty-sweet cheese macchiato foam.",
            emoji: "🥤",
            basePrice: 4.8,
            tags: ["popular"],
            options: [drinkSize, sugarLevel, iceLevel, toppings],
          },
          {
            id: "koi-thai",
            name: "Thai Milk Tea",
            description: "Bold, fragrant Thai-style milk tea.",
            emoji: "🧋",
            basePrice: 4.5,
            options: [drinkSize, sugarLevel, iceLevel, toppings],
          },
        ],
      },
    ],
  },

  {
    id: "jollibee",
    name: "Jollibee",
    cuisine: "Filipino",
    emoji: "🐝",
    bannerFrom: "#dc2626",
    bannerTo: "#facc15",
    rating: 4.5,
    etaMinutes: [25, 30],
    distanceKm: 4.0,
    priceLevel: 2,
    menu: [
      {
        type: "set_meal",
        label: "Set Meals",
        items: [
          {
            id: "jb-set-chickenjoy",
            name: "Chickenjoy + Spaghetti Combo",
            description: "1pc Chickenjoy, Jolly Spaghetti, and a drink.",
            emoji: "🍗",
            basePrice: 10.9,
            tags: ["popular"],
            options: [upsizeMeal],
          },
        ],
      },
      {
        type: "a_la_carte",
        label: "À la carte",
        items: [
          {
            id: "jb-chickenjoy",
            name: "Chickenjoy (1pc)",
            description: "Crispylicious, juicylicious fried chicken.",
            emoji: "🍗",
            basePrice: 5.2,
            tags: ["popular"],
            options: [spiceLevel],
          },
          {
            id: "jb-spaghetti",
            name: "Jolly Spaghetti",
            description: "Sweet-style spaghetti with hotdog slices.",
            emoji: "🍝",
            basePrice: 4.8,
          },
        ],
      },
      {
        type: "dessert",
        label: "Desserts",
        items: [
          {
            id: "jb-peachmango",
            name: "Peach Mango Pie",
            description: "Crispy pie with warm peach-mango filling.",
            emoji: "🥭",
            basePrice: 2.6,
            tags: ["popular"],
          },
        ],
      },
    ],
  },

  {
    id: "bk",
    name: "Burger King",
    cuisine: "Western",
    emoji: "👑",
    bannerFrom: "#f97316",
    bannerTo: "#7c2d12",
    rating: 4.2,
    etaMinutes: [20, 30],
    distanceKm: 2.5,
    priceLevel: 2,
    menu: [
      {
        type: "set_meal",
        label: "Set Meals",
        items: [
          {
            id: "bk-set-whopper",
            name: "Whopper Meal",
            description: "Flame-grilled Whopper + fries + drink.",
            emoji: "🍔",
            basePrice: 10.2,
            tags: ["popular"],
            options: [upsizeMeal],
          },
        ],
      },
      {
        type: "a_la_carte",
        label: "À la carte",
        items: [
          {
            id: "bk-whopper",
            name: "Whopper",
            description: "Flame-grilled beef, tomatoes, lettuce, mayo.",
            emoji: "🍔",
            basePrice: 7.8,
            tags: ["popular"],
            options: [burgerAddons],
          },
          {
            id: "bk-mushroom",
            name: "Mushroom Swiss",
            description: "Beef patty, sautéed mushrooms, Swiss cheese.",
            emoji: "🍄",
            basePrice: 7.2,
            options: [burgerAddons],
          },
        ],
      },
      {
        type: "side",
        label: "Sides",
        items: [
          {
            id: "bk-hashbrown",
            name: "Hash Browns",
            description: "Crispy golden hash brown bites.",
            emoji: "🥔",
            basePrice: 3.0,
          },
        ],
      },
      {
        type: "drink",
        label: "Drinks",
        items: [
          {
            id: "bk-sprite",
            name: "Sprite",
            description: "Lemon-lime fizz.",
            emoji: "🥤",
            basePrice: 2.4,
            options: [drinkSize],
          },
        ],
      },
    ],
  },

  {
    id: "subway",
    name: "Subway",
    cuisine: "Western",
    emoji: "🥪",
    bannerFrom: "#22c55e",
    bannerTo: "#facc15",
    rating: 4.3,
    etaMinutes: [20, 25],
    distanceKm: 1.6,
    priceLevel: 2,
    menu: [
      {
        type: "set_meal",
        label: "Combos",
        items: [
          {
            id: "sub-combo-bmt",
            name: "Italian B.M.T. Combo",
            description: "6-inch sub + cookie + drink.",
            emoji: "🥪",
            basePrice: 9.5,
            tags: ["popular"],
            options: [
              {
                id: "bread",
                label: "Bread",
                required: true,
                choices: [
                  { id: "italian", label: "Italian", priceDelta: 0 },
                  { id: "wheat", label: "Hearty Wheat", priceDelta: 0 },
                  { id: "parmesan", label: "Parmesan Oregano", priceDelta: 0.5 },
                ],
              },
            ],
          },
        ],
      },
      {
        type: "a_la_carte",
        label: "À la carte",
        items: [
          {
            id: "sub-bmt",
            name: "Italian B.M.T. (6-inch)",
            description: "Pepperoni, salami, ham, and your choice of veggies.",
            emoji: "🥪",
            basePrice: 6.5,
            tags: ["popular"],
          },
          {
            id: "sub-teriyaki",
            name: "Teriyaki Chicken (6-inch)",
            description: "Sweet-savory glazed chicken strips.",
            emoji: "🍗",
            basePrice: 6.8,
          },
        ],
      },
      {
        type: "dessert",
        label: "Desserts",
        items: [
          {
            id: "sub-cookie",
            name: "Choc-Chip Cookie",
            description: "Warm, gooey, freshly baked.",
            emoji: "🍪",
            basePrice: 1.6,
          },
        ],
      },
    ],
  },

  {
    id: "4fingers",
    name: "4Fingers",
    cuisine: "Korean",
    emoji: "🍗",
    bannerFrom: "#111827",
    bannerTo: "#dc2626",
    rating: 4.5,
    etaMinutes: [25, 30],
    distanceKm: 3.1,
    priceLevel: 2,
    menu: [
      {
        type: "a_la_carte",
        label: "À la carte",
        items: [
          {
            id: "4f-wings",
            name: "Crispy Wings (6pc)",
            description: "Korean-style wings tossed in soy-garlic or hot sauce.",
            emoji: "🍗",
            basePrice: 9.0,
            tags: ["popular", "spicy"],
            options: [
              {
                id: "sauce",
                label: "Sauce",
                required: true,
                choices: [
                  { id: "soy", label: "Soy Garlic", priceDelta: 0 },
                  { id: "hot", label: "Spicy 🔥", priceDelta: 0 },
                  { id: "half", label: "Half & Half", priceDelta: 0.5 },
                ],
              },
            ],
          },
          {
            id: "4f-ricebox",
            name: "Chicken Rice Box",
            description: "Wings or drumlets over rice with seaweed.",
            emoji: "🍱",
            basePrice: 8.5,
          },
        ],
      },
      {
        type: "side",
        label: "Sides",
        items: [
          {
            id: "4f-kimchi",
            name: "Kimchi Coleslaw",
            description: "Tangy, spicy slaw.",
            emoji: "🥬",
            basePrice: 3.0,
          },
        ],
      },
      {
        type: "drink",
        label: "Drinks",
        items: [
          {
            id: "4f-coke",
            name: "Coke",
            description: "Ice-cold cola.",
            emoji: "🥤",
            basePrice: 2.4,
            options: [drinkSize],
          },
        ],
      },
    ],
  },

  {
    id: "liho",
    name: "LiHO Tea",
    cuisine: "Drinks",
    emoji: "🧋",
    bannerFrom: "#7c3aed",
    bannerTo: "#2e1065",
    rating: 4.4,
    etaMinutes: [20, 25],
    distanceKm: 1.1,
    priceLevel: 1,
    menu: [
      {
        type: "drink",
        label: "Drinks",
        items: [
          {
            id: "liho-brownsugar",
            name: "Cheese Brown Sugar Pearl",
            description: "Brown sugar pearl milk with cheese foam.",
            emoji: "🧋",
            basePrice: 4.6,
            tags: ["popular"],
            options: [drinkSize, sugarLevel, iceLevel, toppings],
          },
          {
            id: "liho-fruittea",
            name: "Fruit Tea",
            description: "Refreshing tea with real fruit pieces.",
            emoji: "🍓",
            basePrice: 4.2,
            options: [drinkSize, sugarLevel, iceLevel],
          },
        ],
      },
    ],
  },

  {
    id: "occ",
    name: "Old Chang Kee",
    cuisine: "Local",
    emoji: "🥟",
    bannerFrom: "#eab308",
    bannerTo: "#b45309",
    rating: 4.3,
    etaMinutes: [20, 25],
    distanceKm: 1.4,
    priceLevel: 1,
    menu: [
      {
        type: "a_la_carte",
        label: "Snacks",
        items: [
          {
            id: "occ-currypuff",
            name: "Curry'O (Curry Puff)",
            description: "Flaky pastry with curried potato, chicken & egg.",
            emoji: "🥟",
            basePrice: 1.9,
            tags: ["popular"],
          },
          {
            id: "occ-sotong",
            name: "Sotong Ball",
            description: "Bouncy deep-fried cuttlefish balls.",
            emoji: "🦑",
            basePrice: 3.2,
          },
          {
            id: "occ-fishball",
            name: "Fishball Stick",
            description: "Skewered springy fishballs.",
            emoji: "🍢",
            basePrice: 2.4,
          },
        ],
      },
      {
        type: "drink",
        label: "Drinks",
        items: [
          {
            id: "occ-teh",
            name: "Teh Tarik",
            description: "Frothy pulled milk tea.",
            emoji: "🥤",
            basePrice: 1.8,
            options: [sugarLevel],
          },
        ],
      },
    ],
  },

  {
    id: "mrbean",
    name: "Mr Bean",
    cuisine: "Local",
    emoji: "🫘",
    bannerFrom: "#84cc16",
    bannerTo: "#365314",
    rating: 4.4,
    etaMinutes: [20, 25],
    distanceKm: 0.8,
    priceLevel: 1,
    menu: [
      {
        type: "drink",
        label: "Drinks",
        items: [
          {
            id: "mb-soya",
            name: "Soya Milk",
            description: "Freshly ground, smooth soya milk.",
            emoji: "🥛",
            basePrice: 2.0,
            tags: ["popular"],
            options: [drinkSize, sugarLevel, iceLevel],
          },
        ],
      },
      {
        type: "dessert",
        label: "Desserts",
        items: [
          {
            id: "mb-pancake",
            name: "Soya Pancake",
            description: "Fluffy pancake with a soft custard centre.",
            emoji: "🥞",
            basePrice: 2.2,
          },
          {
            id: "mb-softserve",
            name: "Soya Soft Serve",
            description: "Silky soy-based soft serve ice cream.",
            emoji: "🍦",
            basePrice: 2.8,
            tags: ["new"],
          },
        ],
      },
    ],
  },
];

/** Quick id → store lookup. */
export const STORES_BY_ID: Record<string, Store> = Object.fromEntries(
  STORES.map((s) => [s.id, s]),
);

/**
 * Broad cuisine categories for the Home chips, in display order. Only those
 * actually used by a store are kept (so we never show an empty filter).
 */
const CATEGORY_ORDER = ["Western", "Japanese", "Korean", "Chinese", "Filipino", "Local", "Drinks"];

export const CATEGORIES: string[] = CATEGORY_ORDER.filter((c) =>
  STORES.some((s) => s.cuisine === c),
);
