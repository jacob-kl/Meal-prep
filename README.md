# Jake & Laine — Meal Plan

A personal household meal planning app. Single-page, no server needed beyond a static file server.

---

## File structure

```
index.html          ← the app
nutrition.json      ← shared nutrition database
weeks/
  2026-W19.json
  2026-W20.json
  2026-W21.json
  2026-W22.json
  2026-W23.json     ← current week (June 1–7) · Mediterranean pivot
```

Open with any static server (e.g. `python3 -m http.server`) or VS Code Live Server — the app fetches JSON via `fetch()` and won't work from `file://` directly.

---

## Adding a new week

1. Copy the current week JSON into `weeks/` with the new ID (e.g. `2026-W24.json`).
2. Edit dinners, lunches, macros, shopping list.
3. Add the new week to `WEEK_REGISTRY` in `index.html` and update `CURRENT_WEEK_ID`.

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
