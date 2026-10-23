// The shared page shell: <head>, the project-page top bar, the tile footer
// and the next/previous project navigation. Every page is written with a
// relative `root` ("" for the home page, "../../" for /projects/<slug>/)
// so the site works on GitHub Pages and straight from the file system.

import { html, esc } from "./html.mjs";
import { SITE } from "../data/site.mjs";

const FONTS =
  "https://fonts.googleapis.com/css2?family=Fragment+Mono&family=Mona+Sans:wdth,wght@100..125,300..700&display=swap";
const GSAP = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5";

export function page({ root, title, description, css = [], js = [], bodyClass = "", body, intro = false, ogImage }) {
  return html`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="website">
${ogImage && `<meta property="og:image" content="${esc(SITE.url + ogImage)}">`}
<meta name="theme-color" content="#0B0D11">
<link rel="icon" href="${root}assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">
<link rel="stylesheet" href="${root}assets/css/site.css">
${css.map((f) => `<link rel="stylesheet" href="${root}assets/css/${f}">`)}
${intro && `<script>
  // Hold the opening frames until the intro runs; never longer than 2.5s.
  (function (r) {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    r.classList.add("intro-pending");
    setTimeout(function () { r.classList.remove("intro-pending"); }, 2500);
  })(document.documentElement);
</script>`}
<script src="${GSAP}/gsap.min.js" defer></script>
<script src="${GSAP}/ScrollTrigger.min.js" defer></script>
<script src="${root}assets/js/site.js" defer></script>
${js.map((f) => `<script src="${root}assets/js/${f}" defer></script>`)}
</head>
<body class="${bodyClass}">
${body}
</body>
</html>
`;
}

export function bar({ root, crumb }) {
  return html`<header class="bar">
  <div class="bar-row">
    <a class="wordmark" href="${root}">Krithik<span class="wm-last"> Kambhampati</span></a>
    ${crumb && `<p class="crumb"><a href="${root}#work">work</a> / <b>${esc(crumb)}</b></p>`}
    <nav class="bar-nav" aria-label="Site">
      <a href="${root}#work">Work</a>
      <a href="${root}#record">Record</a>
      <a href="${root}#contact">Contact</a>
    </nav>
  </div>
</header>`;
}

const arrow = `<svg viewBox="0 0 56 56" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="square" aria-hidden="true"><path d="M14 42 42 14M20 14h22v22"/></svg>`;

export function footer({ root, credits = [] }) {
  return html`<footer class="tiles" aria-label="Footer">
  <div class="tile tile-word" aria-hidden="true"><span>Kambhampati</span></div>
  <a class="tile tile-go" href="mailto:${SITE.email}?subject=${encodeURIComponent("Hello from your site")}">
    <p>Write to me</p>
    ${arrow}
  </a>
  <div class="tile tile-statement">
    <p>I build systems that keep their state straight when many things happen at once.</p>
    <div class="small muted">
      <p>© 2026 Krithik Kambhampati. Site built by hand in HTML, CSS and GSAP.</p>
      ${credits.length > 0 && `<p class="credits">Pictures: ${credits.join("; ")}.</p>`}
    </div>
  </div>
  <nav class="tile tile-nav" aria-label="Footer">
    <p class="tile-label">Pages</p>
    <ul>
      <li><a href="${root}">Home</a></li>
      <li><a href="${root}#work">Work</a></li>
      <li><a href="${root}#record">Record</a></li>
      <li><a href="${SITE.github}" target="_blank" rel="noopener">GitHub</a></li>
      <li><a href="${SITE.linkedin}" target="_blank" rel="noopener">LinkedIn</a></li>
    </ul>
  </nav>
  <div class="tile tile-time">
    <p class="tile-label">Hyderabad</p>
    <p><span class="clock" data-clock>IST</span><br><span class="small muted">India Standard Time</span></p>
  </div>
  <div class="tile tile-mail">
    <p class="tile-label">Email</p>
    <a class="link" href="mailto:${SITE.email}">${SITE.email}</a>
  </div>
</footer>`;
}

export function projectNav({ root, prev, next }) {
  const cell = (p, dir) => html`<a class="pnav-cell tone-${p.tone}" href="${root}projects/${p.slug}/">
      <span class="pnav-dir small muted">${dir}</span>
      <span class="pnav-title">${esc(p.title)}</span>
      <span class="pnav-what small muted">${esc(p.what)}</span>
    </a>`;
  return html`<nav class="pnav" aria-label="More projects">
  ${cell(prev, "Previous project")}
  <a class="pnav-cell pnav-all" href="${root}#work">
    <span class="pnav-dir small muted">Back to</span>
    <span class="pnav-title">All work</span>
  </a>
  ${cell(next, "Next project")}
</nav>`;
}
