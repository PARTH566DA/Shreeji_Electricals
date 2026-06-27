Hero background image
=====================

Save your hero background photo in THIS folder named exactly:

    hero-bg.jpg

Vite serves this folder at the site root, so the file becomes /hero-bg.jpg,
which src/components/SkyBackdrop.jsx loads as the hero background.

Notes
- Use a properly licensed / royalty-free photo (no watermark). Good sources:
  Unsplash or Pexels — search "solar panels field sky".
- Recommended: landscape, ~1920x1080 or larger, JPG, optimized (< ~400 KB).
- If the file is absent, the hero gracefully falls back to the CSS gradient sky
  with clouds and an SVG solar-panel row — nothing breaks.
- To use a different filename or format, update the url('/hero-bg.jpg') line in
  src/components/SkyBackdrop.jsx.
