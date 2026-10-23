// Builds the static site: index.html, 404.html and projects/<slug>/index.html.
// Run from anywhere with `node build/build.mjs`. No dependencies.

import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { page, bar, footer, projectNav } from "./lib/layout.mjs";
import { html, esc } from "./lib/html.mjs";
import { PROJECTS, neighbours } from "./data/projects.mjs";
import home from "./pages/home.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "..");

function write(rel, content) {
  const file = join(out, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
  console.log("wrote", rel);
}

// home
const h = home();
write("index.html", page({ ...h, bodyClass: "home" }));

// projects
const root = "../../";
for (const p of PROJECTS) {
  const mod = join(here, "pages", `${p.slug}.mjs`);
  if (!existsSync(mod)) {
    console.warn("missing page module", p.slug);
    continue;
  }
  const { default: build } = await import(pathToFileURL(mod).href);
  const pg = build({ root, project: p });
  const { prev, next } = neighbours(p.slug);
  write(`projects/${p.slug}/index.html`, page({
    root,
    title: `${p.title}: ${pg.titleSuffix || p.what}, by Krithik Kambhampati`,
    description: pg.description || p.summary,
    css: ["project.css", ...(pg.css || [])],
    js: ["project.js", ...(pg.js || [])],
    bodyClass: `project tone-${p.tone}`,
    body: html`<a class="skip" href="#main">Skip to the write-up</a>
${bar({ root, crumb: p.slug })}
<main class="p-main" id="main">
${pg.body}
${projectNav({ root, prev, next })}
</main>
${footer({ root })}`,
  }));
}

// 404: a terminal that could not find the page
write("404.html", page({
  root: "/",
  title: "Page not found: Krithik Kambhampati",
  description: "This page does not exist.",
  css: ["project.css"],
  bodyClass: "project tone-lime",
  body: html`${bar({ root: "/" })}
<main class="p-main" id="main">
  <section class="p-hero">
    <div class="p-title-block">
      <p class="p-kicker"><span class="dot"></span>HTTP 404</p>
      <h1 class="p-title">Nothing lives at this address</h1>
      <p class="p-lede">The page may have moved when the site was rebuilt. Every project now has its own page under the work index.</p>
      <p style="margin-top:32px"><a class="btn btn-accent" href="/#work">Go to the work</a></p>
    </div>
    <div class="p-meta">
      <div class="pane term"><div class="pane-bar"><span class="file">c-shell</span></div>
        <pre class="code"><span class="ln"><span class="prompt">krithik@site:~$</span> cd this-page</span><span class="ln"><span class="out">cd: no such file or directory</span></span><span class="ln"><span class="prompt">krithik@site:~$</span> ls work/</span><span class="ln"><span class="out">${PROJECTS.map((p) => esc(p.slug)).join("  ")}</span></span></pre>
      </div>
    </div>
  </section>
</main>
${footer({ root: "/" })}`,
}));
