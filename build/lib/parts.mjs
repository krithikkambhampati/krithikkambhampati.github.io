// Building blocks for project pages. Pages compose these in their own order
// and layout; the look stays one system.

import { html, esc } from "./html.mjs";
import { highlight } from "./highlight.mjs";
import { snippet } from "../frames.mjs";

const LANG = { py: "python", js: "js", kt: "kotlin", c: "c", go: "go", h: "c" };

export function intro({ project, kicker, lede, meta, links, visual }) {
  return html`<section class="p-hero" aria-labelledby="p-title">
  <div class="p-title-block">
    <h1 class="p-title" id="p-title" style="view-transition-name: t-${project.slug}"><span class="dot" aria-hidden="true"></span>${esc(project.title)}</h1>
    <p class="p-lede">${lede}</p>
  </div>
  <dl class="p-meta">
    ${kicker && html`<div><dt>Project</dt><dd>${esc(kicker)}</dd></div>`}
    ${meta.map(([k, v]) => html`<div><dt>${esc(k)}</dt><dd>${v}</dd></div>`)}
    <div class="p-meta-links"><dt>Links</dt><dd class="p-links">
      ${(links || project.repos).map((l, i) => html`<a class="btn btn-small ${i === 0 ? "btn-accent" : "btn-ghost"}" href="${l.href}" target="_blank" rel="noopener">${esc(l.label)}</a>`)}
    </dd></div>
  </dl>
  ${visual && html`<figure class="p-visual">${visual}</figure>`}
</section>`;
}

// One picture per page opens like a shutter (assets/js/site.js).
export function shutterImg({ root, src, alt, w, h, caption }) {
  return html`<div class="shutter"><img src="${root}assets/img/${src}" alt="${esc(alt)}" width="${w}" height="${h}" decoding="async"></div>
${caption && `<figcaption>${caption}</figcaption>`}`;
}

export function sec({ id, title, body, wide = false, cls = "" }) {
  return html`<section class="p-sec ${wide ? "is-wide" : ""} ${cls}" ${id && `id="${id}"`} aria-labelledby="${id || slugify(title)}-h" data-reveal-group>
  <div class="p-sec-head"><h2 id="${id || slugify(title)}-h" data-reveal>${esc(title)}</h2></div>
  <div class="p-sec-body">${body}</div>
</section>`;
}

export function field(inner) {
  return `<div class="p-field">${inner}</div>`;
}

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function codePane({ file, name, from = 1, to = Infinity, start, note, reveal = true }) {
  const lang = LANG[name.split(".").pop()];
  const src = snippet(name).split("\n").slice(from - 1, to).join("\n");
  const first = start || 1;
  return html`<figure class="pane p-code" ${reveal && 'data-reveal'} data-ui>
  <figcaption class="pane-bar"><span class="file">${esc(file)}</span><span class="spacer"></span><span>${esc(lang)}</span></figcaption>
  <pre class="code" style="--start:${first - 1}"><code>${highlight(src, lang)}</code></pre>
  ${note && `<p class="code-note">${note}</p>`}
</figure>`;
}

export function prose(...paras) {
  return `<div class="prose" data-reveal>${paras.map((p) => `<p>${p}</p>`).join("")}</div>`;
}

export function points(items) {
  return `<ul class="points" data-reveal>${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;
}

export function decisions(items) {
  return html`<div class="decisions">${items.map(([title, text, src]) => html`<div class="decision" data-reveal="row">
    <h3>${title}</h3>
    <p>${text}</p>
    ${src && `<p class="src">${esc(src)}</p>`}
  </div>`)}</div>`;
}

export function stack(groups) {
  return html`<dl class="stack" data-reveal>${groups.map(([k, v]) => html`<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`)}</dl>`;
}

export function table({ caption, head, rows, best = -1, num = [] }) {
  const cell = (v, i, tag) => `<${tag}${num.includes(i) ? ' class="num"' : ""}>${v}</${tag}>`;
  return html`<div class="table-wrap" data-reveal><table class="results">
  ${caption && `<caption>${caption}</caption>`}
  <thead><tr>${head.map((h, i) => cell(h, i, "th"))}</tr></thead>
  <tbody>${rows.map((r, ri) => `<tr${ri === best ? ' class="is-best"' : ""}>${r.map((v, i) => cell(v, i, "td")).join("")}</tr>`)}</tbody>
</table></div>`;
}

export function clip({ root, src, poster, label, caption }) {
  return html`<figure class="p-fig p-clip" data-reveal="mask">
  <video muted loop playsinline preload="none" poster="${root}assets/video/${poster}" aria-label="${esc(label)}" data-loop><source src="${root}assets/video/${src}" type="video/mp4"></video>
  ${caption && `<figcaption>${caption}</figcaption>`}
</figure>`;
}

export function fig({ root, src, alt, w, h, caption, dark = false, cls = "" }) {
  return html`<figure class="p-fig ${dark ? "is-dark" : ""} ${cls}" data-reveal="mask">
  <img src="${root}assets/img/${src}" alt="${esc(alt)}" width="${w}" height="${h}" loading="lazy" decoding="async">
  ${caption && `<figcaption>${caption}</figcaption>`}
</figure>`;
}
