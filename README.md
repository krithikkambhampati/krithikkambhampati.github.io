# krithikkambhampati.github.io

Static site for GitHub Pages. Pages are generated from `build/` with plain Node (no dependencies):

    node build/build.mjs

- `build/data/projects.mjs` lists the projects (order, colour, strip frames, links).
- `build/pages/<slug>.mjs` is each project's page; `build/pages/home.mjs` is the home page.
- `build/frames.mjs` defines every artifact frame; `build/snippets/` holds verbatim code excerpts.
- Styles in `assets/css/`, behaviour in `assets/js/` (GSAP from cdnjs), media in `assets/img/` and `assets/video/`.

Commit the generated `index.html`, `404.html` and `projects/` alongside the sources.
