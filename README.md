# 🍔 FakeEats — Food Delivery Simulator

A **food-delivery simulation game** that looks and feels like Grab Food / Uber Eats —
browse stores, build a cart, "pay", and watch a fake order get delivered.

**Nothing here is real.** There is no real food, no real money, no accounts, and no
personal data leaves your device. FakeEats is a self-contained browser sandbox built for
fun and for learning how a modern delivery-app UI fits together. Everything you see —
stores, menus, prices, drivers, delivery times, reviews, points and promotions — is
fictional.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
```

Other scripts:

```bash
npm run build      # type-check + production build → dist/
npm run preview    # serve the production build
npm run typecheck  # tsc --noEmit
```

## What's inside

- **4 tabs** — Home, Search, Orders, Profile (bottom navigation bar).
- **12 data-driven stores** grouped by broad cuisine (Western, Japanese, Korean,
  Filipino, Local, Drinks) with full menus, item customisation (size / spice /
  add-ons / toppings), tags, ratings, and **fake customer reviews**. Each store
  is a folder of static files under `public/shops/` — see
  [Shop data format](#shop-data-format) below. Adding or
  editing a store needs no code changes.
- **Rotating Special Deal** — one Home deal that cycles every 10 minutes through
  redeemable promo codes (copy & paste at checkout), special combos, and
  limited-time items.
- **Combined cart + checkout** — edit items, pick a delivery speed, and apply a
  promo code on one page. No payment step, no delivery fees.
- **Delivery tiers** — Regular (~20 min), Saver (~30 min, +50% points), or
  Express (~12 min, costs 150 points). The estimate is randomised per delivery
  address and re-rolls whenever you change the drop-off location.
- **Promo codes** — `DOUBLEUP` (2× points), `LOYALMAX` (double loyalty), `ZOOMZOOM`
  (free Express).
- **Points & loyalty** — earn 1 point per $1 spent, multiplied by your loyalty
  tier with that shop (1.0×–2.0×, with playful tier names). Ordering from a shop
  builds its loyalty; ordering elsewhere drops your previous shop a tier.
- **Live order simulation** — `Kitchen is preparing your meal → Driver is out for
  delivery → Delivered` over a randomised, speed-dependent time, with a pulsing
  segmented progress bar, ETA, a **real Leaflet / OpenStreetMap map** (store + drop
  pins, then an animated driver along the route), and a receipt-style summary.
- **Reorder, ratings, editable saved addresses** (max 3, with one-tap "use my
  current location"), profile picture & name, and a light-themed, phone-framed UI.
- **Privacy Policy and Terms & Conditions** are available in-app from the Profile tab
  (and reproduced in full below).
- **Runs entirely on your device** — static files + `localStorage`. The only
  external network request is map tiles loaded from OpenStreetMap at runtime;
  the shop catalogue is fetched from the app's own bundled static files.
- **Image-driven shop art** — each store/item points at a PNG under
  `public/shops/`; any missing image falls back to a small text label, so the app
  works before real art is added.

## Architecture

The codebase is deliberately split so the logic could be reused in a future mobile
(React Native / Expo) port — only the UI layer would be rebuilt.

```
public/
└─ shops/       # data-driven store catalogue (one folder per shop)
src/
├─ data/        # types.ts + promos.ts  (platform-agnostic types + promo seed data)
├─ lib/         # storage (localStorage seam), shopLoader, simulation, pricing,
│               # loyalty, delivery, format, hooks
├─ store/       # zustand: storesStore, cartStore, orderStore, profileStore, toastStore
├─ components/  # reusable UI (StoreCard, ItemCard, Thumb, DeliveryMap, CartBar, Toaster…)
├─ screens/     # Home, Search, Orders, Profile, StoreMenu, ItemDetail, Checkout,
│               # OrderTracking, Legal
└─ styles/      # Tailwind entry + component classes
scripts/
└─ build-shops-index.mjs   # build step: scans public/shops → shops[] in public/content.json
```

**Data-driven shops.** The store catalogue lives in `public/shops/<id>/shop.json`
(+ optional `banner.png` / `logo.png` / `icons/*.png`). A prebuild step
(`scripts/build-shops-index.mjs`, wired to `predev`/`prebuild`) scans the folder
and refreshes the `shops` array in `public/content.json`; the app fetches that at
startup and loads each shop. `src/lib/shopLoader.ts` maps the authorable file format onto the internal
types (deriving stable ids and image URLs), and `src/store/storesStore.ts` holds
the loaded catalogue. Delivery time + distance are **not** in the data — they're
generated at runtime from the chosen delivery address.

**Portability rule:** `data/`, `lib/`, and `store/` are platform-agnostic — they touch the
DOM only behind `lib/storage.ts`. Only `components/` and `screens/` are web-specific.

## Shop data format

Each subfolder under `public/shops/` is one shop. The app discovers them at
**build time** (`scripts/build-shops-index.mjs` writes the `shops` list into
`public/content.json`) and loads each `shop.json` at runtime. To add a shop: drop a new folder with a
`shop.json`, commit, and the next build picks it up — no code changes.

The `example/` folder is a template and is **not** loaded by the app.

### Folder layout

```
public/shops/<shop-id>/
├─ shop.json          # required — the menu + metadata
├─ banner.png         # optional — wide banner image
├─ logo.png           # optional — square brand logo
└─ icons/
   └─ <food-name>.png # optional — one per menu item
```

- The **folder name is the shop id** (used in URLs, cart, loyalty). No `id`
  field is needed in `shop.json`.
- Image filenames are **fixed by convention**, so they're not listed in the
  JSON: the banner is always `banner.png`, the logo always `logo.png`, and each
  item's image is `icons/<food-name>.png` where `<food-name>` is the item's
  name lower-cased with non-alphanumerics turned into `-`
  (e.g. `"Big Mac Meal"` → `icons/big-mac-meal.png`, `"Curry'O"` → `icons/curry-o.png`).
- **Any missing image falls back to a small text label** (`logo`, `banner`,
  `food`), so the app works fine before you add real art.

### `shop.json` schema

```jsonc
{
  "name": "McDonald's",
  "categories": ["Western"],   // first entry is the primary cuisine chip
  "fastfood": true,            // also show under the cross-cutting "Fast Food" chip
  "pricelevel": 1,             // 1–3  → $ / $$ / $$$
  "rating": 4.4,               // 0–5, shown on the card
  "menu": [
    {
      "category": "Set Meals",        // section heading on the store page
      "food": [
        {
          "name": "Big Mac Meal",
          "description": "Big Mac + fries + Coke.",
          "price": 8.9,
          "tags": ["popular"],        // optional: popular | new | spicy
          "section": [                 // optional customisation groups
            {
              "name": "Size",
              "multiselect": false,    // false = pick one (radio), true = pick many (checkbox)
              "required": true,
              "options": [
                { "name": "Regular", "price": 0 },
                { "name": "Upsize", "price": 1.2 }   // price = added to base
              ]
            },
            {
              "name": "Toppings",
              "multiselect": true,
              "required": false,
              "max": 3,                // multi-select only: pick up to 3
              "min": 0,                // multi-select only: must pick at least N (optional)
              "options": [
                { "name": "Pearls", "price": 0.7 },
                { "name": "Pudding", "price": 0.8 },
                { "name": "Grass jelly", "price": 0.7 },
                { "name": "Cheese foam", "price": 1.2 }
              ]
            }
          ]
        }
      ]
    }
  ],
  "reviews": [
    { "author": "Bryan T.", "emoji": "🧑", "rating": 5, "text": "Crispy!", "daysAgo": 2 }
  ]
}
```

**Multi-select bounds.** `min`/`max` only apply when `multiselect` is `true`.
`max: 3` = pick up to 3; `min: 2` = pick at least 2; `min: 3, max: 3` = pick
exactly 3. A `required: true` multi-select implies `min` of at least 1. `max` is
clamped to the number of options available.

> Delivery time and distance are **not** in the data — they're generated at
> runtime from the customer's chosen delivery address and re-roll whenever it
> changes.

## Stack

React 18 · TypeScript · Vite · Tailwind CSS · React Router · Zustand · Framer Motion ·
Leaflet / react-leaflet · lucide-react.

---

## Privacy Policy

_Last updated 29 June 2026._

FakeEats is a food-delivery simulation built for fun and learning. This policy explains,
in plain language, what happens with your information.

- **What we store.** Everything you do in FakeEats — your name, chosen avatar, saved
  addresses, orders, reward points and loyalty — is stored only on this device, in your
  browser's local storage. It never leaves your device and is not sent to any server.
- **What we collect.** Nothing. There are no analytics, no trackers, no advertising
  cookies, and no third-party data sharing. We could not see your data even if we wanted
  to. (Map tiles are requested from OpenStreetMap to draw the delivery map; this is a
  standard map request and carries none of your FakeEats data.)
- **Payments.** No real payments are processed. The "card" shown at checkout is a
  placeholder and is never charged. No payment details are collected or stored.
- **Your control.** You can clear all of your data at any time using "Reset simulation
  data" in your Profile. This permanently wipes the local storage used by FakeEats on
  this device.
- **Contact.** This is a demo project, so there is no support desk. Treat all data here
  as disposable and fictional.

## Terms & Conditions

_Last updated 29 June 2026._

By using FakeEats you agree to these simple terms. FakeEats is a simulation — a toy app —
and not a real food-delivery service.

- **No real orders.** Placing an "order" does not order any food. Stores, menus, prices,
  drivers, delivery times, reviews and promotions are all fictional and for demonstration
  only.
- **No real money.** All prices are imaginary. No charges are ever made and no refunds
  apply, because no money changes hands.
- **Points & loyalty.** Reward points and shop loyalty have no monetary value and cannot
  be redeemed for anything. They exist purely to demonstrate the feature. Ordering from a
  different shop may reduce loyalty you had built with a previous shop.
- **Brand names.** Brand and store names are used to make the simulation feel familiar.
  FakeEats is not affiliated with, endorsed by, or connected to any of the brands shown.
- **As-is.** FakeEats is provided "as is" with no warranties. Use it for fun. Your data
  lives on your device and may be lost if you clear your browser storage.

---

> ⚠️ **Simulation only.** Brand names are used for familiarity in a clearly-labelled
> fan/toy project — not affiliated with or endorsed by any company. No real food is
> delivered and no real money changes hands.
