# Vimaksh website — variant 3 (no ocean)

Copy of v2 with the ocean removed: paper hero, giant wordmark, the 3D mark large and centred with Electric Blue rising through it, and an animated mark in the footer. v1 (`../site/`) and v2 (`../site-v2/`) are untouched.

## Run

    npm install
    npm run dev       # local dev server
    npm run build     # production files in dist/
    npm run preview   # serve dist/ locally

## What's different from v1

- Hero: a live sea in the blue family only, with flow streaks and three scales of ripple, plus grain.
  It is driven by the real Indian Ocean: wave height, sea temperature and wave direction come from the
  Open-Meteo marine model (6.0 N, 77.5 E, south of Kanyakumari; refreshed every 15 min). Two sliders change
  wave height and temperature; at 100 °C the sea boils and steams. "Back to live" restores the real values.
- The 3D mark hangs like a wall-clock pendulum: the red arrow is the weight, at the bottom; it swings in the
  screen plane about its hub (real pendulum physics with an escapement kick), never tilting, never a full turn.
- Navigation: four stroked boxes stacked top right, with > < in each; the current section's > < turn red.
- Section index 01-06 on the right edge, no background; turns light over dark sections.
- Shoreline: the sea dissolves into the page in pixels sampled live from the water, rising like bubbles.
- Whole-site pattern: fine dot grid with + marks. Identity graphics: Heat Field and Offset Interference.

## Files

- `index.html` — the v2 home page.
- `src/v2/sea.js` — the ocean. `src/v2/mark.js` — the pendulum mark. `src/v2/main.js` — graphics, index, nav, clock. `src/v2/v2.css` — all styles.
- `work/*` — project pages, still in the v1 style.

## Still needed

Same `[PLACEHOLDER]` items as v1: real service names, a real studio photo, Paryatech screenshots, Wingman research images.
