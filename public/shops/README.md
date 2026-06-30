# Shops (data-driven)

Each subfolder here is one shop. The app discovers them at **build time**
(`scripts/build-shops-index.mjs` writes `public/index.json`) and loads each
`shop.json` at runtime. To add a shop: drop a new folder with a `shop.json`,
commit, and the next build picks it up — no code changes.

The `example/` folder is a template and is **not** loaded by the app.

## Folder layout

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

## `shop.json` schema

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
              "type": "single-select", // single-select (radio) or multi-select (checkbox)
              "required": true,
              "options": [
                { "name": "Regular", "price": 0 },
                { "name": "Upsize", "price": 1.2 }   // price = added to base
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

> Delivery time and distance are **not** in the data — they're generated at
> runtime from the customer's chosen delivery address and re-roll whenever it
> changes.
