# Week 49: Laine's Hobbit Pantry

This package contains the changed and new files for the existing Meal-prep app.
Merge its contents into the repository root, overwriting matching files. Keep the
existing week folders and images. Commit and push through your normal GitHub
Pages workflow, then refresh the page. This download does not publish the changes.

The app now opens Week 49, November 30-December 6, 2026. Its JSON is provided at
both `weeks/2026-W49/week.json` (the current app path) and
`weeks/2026-W49.json` (a convenient flat copy).

Laine's area has a Shire palette, a round-door emblem, Middle-earth meal names
with plain food descriptions, Hobbit meal tabs, and LOTR rating labels. The
existing peach and eggplant icons and old rating keys are preserved.

Choose a day, then a meal slot. Tap **I had this** to record an option. That option
is removed from the other days in its own slot. **Undo choice** returns it.
Choices persist on the same device/browser and start fresh with each week;
they do not sync between devices.

Breakfast and Elevenses have three Mon-Wed options because Thursday has fixed
shared road meals. Second Breakfast and Afternoon Tea have four Mon-Thu options.
Friday has three shared meals, with peach crumble at supper. Laine's full weekend
menu includes her two additional mini-meals.

Thursday's breakfast is bacon-cheddar mini egg bites; lunch is thick turkey,
bacon and cauliflower chowder. All advance prep, storage, thawing and thermos
packing are in the opening **Weekly prep & packing** section. Recipe methods
cover only their own meal.

All groceries, recipe portions, menu averages and micronutrient estimates are
generated from quantities. Net carbs and total carbs are stored separately.
Small herbs and spices are excluded from the approximate macros. Laine's menu
average is shown without assigning her a new calorie target.

Rebuild and validate with Python 3 and Node:

```sh
python3 tools/build_week49.py
python3 tests/validate-week49.py
node tests/meal-choices.test.cjs
```

Verified in the browser at desktop and 390 px width, including dark mode,
selection/undo, reload persistence, Thursday travel meals, nutrition, recipes and
older-week snack cards. No new JavaScript dependency is required.

Base: GitHub repository commit `354ffd1ca1d99bdd32d66ec1ab1329229c113c2e`.
