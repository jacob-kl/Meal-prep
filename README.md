# Jake & Laine — Meal Plan

A personal household meal planning app. Single-page, no server needed beyond a static file server.

---

## File structure

```text
index.html
styles.css
js/
nutrition.json
weeks/
  2026-W45/
    week.json
  2026-W46/
    week.json
    dinners-mon-thu.webp
    dinners-fri-sun.webp
    batch-lunches.webp
  2026-W47/
    week.json
    dinners-mon-thu.webp
    dinners-fri-sun.webp
    batch-lunches.webp
    chocolate-pecan-mousse.webp
```

From the project directory, run `python3 -m http.server 8000` and open
`http://localhost:8000`. The app fetches each week's `week.json` over HTTP.

When updating an existing copy of the site, use the new `weeks/` directory and
remove the old flat `weeks/2026-W*.json` files. Keep `index.html` at the site root.

## Adding a new week

1. Create `weeks/YYYY-Www/` and put the menu in `week.json`.
2. Put that week's images in the same folder. Use a site-relative photo path such as
   `weeks/2026-W47/chocolate-pecan-mousse.webp` in the meal's `photo.src` field, and
   describe the dish in `photo.alt`. For a 2 × 2 photo sheet, set `photo.tile` to
   `0`, `1`, `2`, or `3` in reading order.
3. Add the new ID and label to `WEEK_REGISTRY` in `js/theme.js` and set
   `CURRENT_WEEK_ID` to that ID when the new week should open by default.
4. Put Friday's dessert in that dinner's `desserts` array. It also appears in the
   Dessert filter in Recipes.

---

## Macros

| | Jake | Laine |
|---|---|---|
| Calories | 2030 kcal | 1363 kcal |
| Protein | 203 g | 103 g |
| Carbs | 102 g | 152 g |
| Fat | 90 g | 37 g |

---

## Laine's rules

- No raw onion (cooked fine, no visible chunks)
- No mushrooms
- Mild spice only — nothing hot directly in her portion
- No slimy textures (eggplant, okra, overcooked zucchini out)
- Fish is fine — cod and shrimp are favorites; salmon accepted
- Pasta salad mason jar format works great for lunch
- Egg whites are fine scrambled
- Birch Benders pancakes = Sunday tradition

---

## Lunch format

Both batch-cooked Sunday for the full week (5 containers).

**Jake (W23):** Chicken + chickpea bowl. Garlic basil sauce, edamame, mixed veggies, lemon herb finish. ~897 cal / 74g protein per container.

**Laine:** Mason jar pasta salad. Garofalo pasta + canned tuna + chicken breast + bell pepper + cucumber + spinach. Dressing separate. 2 sittings per jar. ~597 cal / 76g protein per jar.

The days selector (1–5) scales ingredient amounts automatically for partial-week batches.

---

## Week W23 — Mediterranean Pivot (June 1–7)

Key changes from previous weeks:
- **Olive oil replaces** most other fats throughout
- **Garlic + lemon + herbs** (oregano, paprika, cumin) are the flavor base on everything
- **Legumes take center stage** — chickpeas Wed dinner, cannellini beans Fri, Jake's lunch switches to chickpea bowl
- **Cherry tomatoes added** to Mon/Wed/Fri dinners — they're forgiving for Laine
- **Taco Tuesday stays** — chicken + shrimp, corn tortillas, sour cream
- **Saturday pasta goes olive oil + lemon** instead of jarred sauce
- **Sunday pancake night unchanged** — it's sacred

---

## Tech

Plain HTML + React 18 (UMD CDN). No build step. State stored in `localStorage`.

**New in this version:**
- Water fill animations on the Targets tab — macro goals fill like a tank
- SVG tab icons (plate, fork, sun, bottle, bag, bullseye) that match each section
- Earthy warm palette: cream background, Lora serif for titles, DM Mono for data

Typography: [Lora](https://fonts.google.com/specimen/Lora) + [DM Mono](https://fonts.google.com/specimen/DM+Mono) + [Barlow](https://fonts.google.com/specimen/Barlow).
