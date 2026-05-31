# Jake & Laine — Meal Plan

A personal household meal planning app. Single-page, no server needed — just open `index.html` in a browser with the JSON files in the right places.

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
  2026-W23.json
  2026-W24.json     ← current week (June 8–14)
```

Open locally by serving with any static server (e.g. `python3 -m http.server`) — the app fetches JSON files via `fetch()` so it won't work from `file://` directly. Or just use VS Code Live Server.

---

## Adding a new week

1. Copy the most recent week JSON (e.g. `2026-W23.json`) into `weeks/`.
2. Rename it to the new week ID (e.g. `2026-W24.json`).
3. Edit the contents — dinners, lunches, macros, shopping.
4. In `index.html`, add the new week to `WEEK_REGISTRY` and update `CURRENT_WEEK_ID`.

The `_note` field at the top is a free-text memo for yourself — week theme, what's new, what was swapped. It's not displayed in the UI.

---

## Macros

| | Jake | Laine |
|---|---|---|
| Calories | 2030 kcal | 1363 kcal |
| Protein | 203 g | 103 g |
| Carbs | 102 g | 152 g |
| Fat | 90 g | 37 g |

Jake's goal is high-protein, moderate-carb, fat-flexible. Laine's goal is lean, higher-carb, lower-fat — picky eater rules apply (no onion chunks, no strong spice, no mushrooms, no weird textures).

---

## Laine's rules

- **No raw onion** (cooked is fine; no visible chunks)
- **No mushrooms**
- **Mild spice only** — no jalapeño directly in her portion
- **No slimy textures** — eggplant, okra, overcooked zucchini are out
- **Fish is fine** — cod and shrimp are favorites; salmon accepted
- **Pasta salad format works great** for her lunch — mason jar style, dressing separate
- **Cherry tomatoes or bell pepper** rotate each week for variety
- **Egg whites** are fine scrambled; whole eggs are acceptable
- **Birch Benders pancakes** = Sunday tradition (breakfast-for-dinner)

---

## Lunch format

Both lunches are batch-cooked Sunday for the full week (5 containers).

**Jake:** Ground turkey + black bean bowl. Roasted onion garlic sauce, edamame, mixed veggies, cheese on top. Reheats well. ~917 cal / 72g protein per container.

**Laine:** Mason jar pasta salad. Garofalo pasta + canned tuna + chicken breast + crunchy veg + spinach. Dressing kept separate in a small container. 2 sittings per jar (~300 cal per sitting). ~597 cal / 76g protein per jar.

The app has a days selector (1–5) that scales ingredient amounts for the batch automatically.

---

## Nutrition database (`nutrition.json`)

Every ingredient used across all week JSONs has an entry here with:
- `serving_qty` and `serving_unit` (the reference portion)
- `cal`, `protein`, `carbs`, `fat` per serving
- `micros` object with per-serving micronutrient values (sodium, potassium, vitamin D, etc.)
- `fiber` where tracked

The app uses this to show per-ingredient nutrition inline in recipes, and to estimate daily micronutrient intake on the Targets tab.

DRI values for sodium, potassium, calcium, vitamin D, magnesium, zinc, vitamin C, B12, iron, vitamin A, folate, phosphorus, selenium, and fiber are stored in `_dri` — split by person since Jake and Laine have different targets based on body size.

---

## Week W24 notes (June 8–14)

- Taco Tuesday switches to fresh chicken + shrimp (no leftover reliance)
- Salmon moves to Wednesday for a midweek omega-3 hit
- Thursday runs pinto beans instead of black beans for variety
- Friday is a shrimp + egg white skillet — fast, high-protein, low-carb
- Saturday keeps the beloved garlic basil shrimp pasta
- Laine's mason jars rotate cherry tomatoes in (bell pepper was W23)
- Jake's bowl stays the same format — it works

---

## Tech

Plain HTML + React 18 (UMD, loaded from CDN). No build step. State is stored in `localStorage` (shopping checklist, unit preference, ingredient substitutions). The app fetches week JSONs and the nutrition DB dynamically — so it needs to be served over HTTP (not `file://`).

Typography: [Lora](https://fonts.google.com/specimen/Lora) (serif display) + [DM Mono](https://fonts.google.com/specimen/DM+Mono) (data/labels) + [Barlow](https://fonts.google.com/specimen/Barlow) (body).
