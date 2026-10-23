// The home page: a contact sheet of the work with one text cell, a strip
// per project, the record on a paper field, the contact field.

import { html, esc } from "../lib/html.mjs";
import { footer } from "../lib/layout.mjs";
import { frame } from "../frames.mjs";
import { PROJECTS, SMALLER } from "../data/projects.mjs";
import { SITE } from "../data/site.mjs";

const root = "";

// The live capture: the visitor's own request, decoded (assets/js/home.js).
function capture(suffix = "") {
  return html`<figure class="frame capture tone-lime" style="--ratio: 9 / 16" data-capture data-ui aria-labelledby="cap-label${suffix}">
  <div class="frame-body">
    <p class="cap-title" data-capture-title id="cap-label${suffix}">Your request for this page, decoded layer by layer</p>
    <p class="cap-total" data-capture-total aria-live="polite"></p>
    <ul class="cap-rows" data-capture-rows></ul>
    <p class="cap-fallback">Your browser's timings for this page appear here once it loads: DNS, TCP, TLS, the HTTP exchange and the parse, each measured live.</p>
    <div class="cap-foot">
      <span class="small muted">read like C-Shark reads a packet</span>
      <button class="cap-again" type="button" data-capture-again>Capture again</button>
    </div>
  </div>
  <figcaption class="frame-strip"><span>this-request.pcap</span><span>live<span class="cap-cursor" aria-hidden="true"></span></span></figcaption>
</figure>`;
}

const f = (id, opts) => frame(id, root, opts);

function hero() {
  return html`<section class="hero" aria-labelledby="hero-name">
  <div class="sheet">
    <div class="sheet-col" aria-hidden="true">${f("gh-epc")}${f("sh-term")}${f("gb-deploy")}${f("ev-ticket")}</div>
    <div class="sheet-col" aria-hidden="true">${f("nfs-seq")}${f("gb-app")}${f("ev-roles")}</div>
    <div class="sheet-col sheet-mid">
      <div class="sheet-pair" aria-hidden="true">
        <div class="sheet-col">${f("quiz-room")}</div>
        <div class="sheet-col">${f("shark-layers")}</div>
      </div>
      <div class="hero-panel">
        <h1 class="hero-name" id="hero-name"><span class="line"><span>Krithik</span></span> <span class="line"><span>Kambhampati</span></span></h1>
        <p class="hero-lede" data-intro>Computer science student at IIIT Hyderabad. I build distributed systems, real-time backends and ML pipelines.</p>
        <p class="hero-where" data-intro>Researching LLM unlearning at Precog, IIIT Hyderabad.</p>
        <div class="hero-actions" data-intro>
          <a class="btn btn-accent" href="mailto:${SITE.email}">Email me</a>
          <span class="hero-links">
            <a class="link" href="#work">Work</a>
            <a class="link" href="${SITE.github}" target="_blank" rel="noopener">GitHub</a>
            <a class="link" href="${SITE.linkedin}" target="_blank" rel="noopener">LinkedIn</a>
          </span>
        </div>
      </div>
      <div class="sheet-pair" aria-hidden="true">
        <div class="sheet-col">${f("gh-code-check")}${f("gb-video-runner")}</div>
        <div class="sheet-col">${f("gb-phones")}${f("quiz-code-score")}</div>
      </div>
    </div>
    <div class="sheet-col" aria-hidden="true">${f("gb-confusion")}${f("quiz-curve")}${f("nfs-code-lock")}${f("ev-flow")}</div>
    <div class="sheet-col">${capture()}<div aria-hidden="true">${f("gh-retrofit")}</div><div aria-hidden="true">${f("shark-hex")}</div></div>
  </div>
  <div class="sheet-phone">
    ${capture("phone")}
    <div class="sheet-col" aria-hidden="true">${f("nfs-seq")}${f("gb-street")}${f("quiz-room")}</div>
    <div class="sheet-col" aria-hidden="true">${f("gh-epc")}${f("shark-layers")}${f("gb-app")}</div>
  </div>
</section>`;
}

function strip(p) {
  return html`<article class="strip tone-${p.tone}" data-strip data-kind="${p.kind}">
  <div class="strip-frames" aria-hidden="true">${p.frames.map((id) => f(id))}</div>
  <div class="strip-caption">
    <h3><a class="strip-name" href="projects/${p.slug}/" style="view-transition-name: t-${p.slug}"><span class="dot" aria-hidden="true"></span>${esc(p.title)}</a></h3>
    <p class="strip-desc">${esc(p.summary)}</p>
    <p class="strip-meta">${esc(p.what)}${p.when && `<br>${esc(p.when)}`}</p>
  </div>
</article>`;
}

function work() {
  return html`<section class="work" id="work" aria-labelledby="work-title">
  <div class="work-rail">
    <h2 class="work-title" id="work-title">Work</h2>
    <p class="work-note">Six projects. Each opens its own page with the architecture, code and results.</p>
    <div class="filters" role="group" aria-label="Show projects by kind">
      <button class="filter" type="button" data-filter="all" aria-pressed="true">All</button>
      <button class="filter" type="button" data-filter="systems" aria-pressed="false">Systems</button>
      <button class="filter" type="button" data-filter="ml" aria-pressed="false">Machine learning</button>
      <button class="filter" type="button" data-filter="web" aria-pressed="false">Web</button>
    </div>
  </div>
  <div class="strips">
    ${PROJECTS.map(strip)}
    <div class="smaller" data-reveal-group>
      <h3 class="smaller-title" data-reveal>Smaller things, on GitHub</h3>
      ${SMALLER.map((s) => html`<a class="tone-${s.tone}" href="${s.href}" target="_blank" rel="noopener" data-reveal="row">
        <b>${esc(s.title)}</b>
        <span>${esc(s.text)}</span>
        <em>Source on GitHub</em>
      </a>`)}
    </div>
  </div>
</section>`;
}

function record() {
  return html`<section class="record" id="record" aria-labelledby="record-title">
  <div class="record-row" data-reveal-group>
    <h2 class="record-title" id="record-title" data-reveal>About me</h2>
    <dl class="facts" data-reveal>
      <div><dt>Based in</dt><dd>Hyderabad, India</dd></div>
      <div><dt>Studying</dt><dd>Computer science, IIIT Hyderabad</dd></div>
      <div><dt>Graduating</dt><dd>2028</dd></div>
      <div><dt>CGPA</dt><dd>8.84</dd></div>
    </dl>
    <div>
      <p class="record-para" data-reveal>I like the parts of software where many things happen at once and still have to agree afterwards: two clients writing the same file, a room of phones answering in the same second, a model whose numbers a language model must not make up.</p>
      <p class="record-para" data-reveal>Right now I'm an undergraduate researcher at Precog, working on how large language models can forget chosen training data and keep everything else.</p>
    </div>
  </div>
  <div class="record-row" data-reveal-group>
    <p class="record-word" data-reveal>Record</p>
    <div class="record-lists">
      <div class="record-list" data-reveal>
        <h3>Research and work</h3>
        <ul>
          <li><b>Undergraduate researcher, Precog</b><span class="yr">Apr 2026 to now</span>
            <span class="sub">IIIT Hyderabad, with Prof. Ponnurangam Kumaraguru</span>
            <p>Curriculum unlearning in LLMs: making a model forget chosen data while keeping its general abilities, compared across three curricula.</p></li>
          <li><b>Software developer, industry collaboration</b><span class="yr">Jan to Apr 2026</span>
            <span class="sub">Centre for Digital Technologies in Healthcare, IIIT Hyderabad</span>
            <p>An LLM pipeline that classifies cancer risk from about 2,000 patient reports, comparing OpenAI, Gemini and Anthropic models and three prompting strategies.</p></li>
        </ul>
      </div>
      <div class="record-list" data-reveal>
        <h3>Team projects and hackathons</h3>
        <ul>
          <li><b>Megathon X, Team 37</b><span class="yr">Oct 2026</span>
            <span class="sub">Green Home Score, for a problem statement set by Lloyds</span></li>
          <li><b>Qualcomm QIDK project, Team Phoenix</b><span class="yr">Nov 2025</span>
            <span class="sub">Garbage monitoring on the edge, advised by Dr. Sachin Chaudari</span></li>
          <li><b>Coursework</b><span class="yr">IIIT Hyderabad</span>
            <span class="sub">Data structures and algorithms, operating systems and networks, databases, machine learning, software systems</span></li>
        </ul>
      </div>
      <dl class="tools" data-reveal>
        <div><dt>Languages</dt><dd>C, C++, Go, Python, JavaScript, TypeScript</dd></div>
        <div><dt>Backend and web</dt><dd>FastAPI, Node.js, Express, React, WebSockets</dd></div>
        <div><dt>Data and ML</dt><dd>PyTorch, YOLO, LightGBM, NumPy, Pandas</dd></div>
        <div><dt>Databases</dt><dd>PostgreSQL, MySQL, MongoDB, Redis</dd></div>
      </dl>
    </div>
  </div>
</section>`;
}

function contact() {
  const ids = ["gb-video-phone", "gb-street", "nfs-code-lock", "gh-bands", "quiz-room", "ev-ticket", "shark-layers", "gb-phones", "gh-arch", "sh-term", "quiz-curve", "gb-deploy", "ev-flow"];
  return html`<section class="contact" id="contact" aria-labelledby="contact-title">
  <div class="contact-strip" data-drift aria-hidden="true">${ids.map((id) => f(id))}</div>
  <div class="contact-inner" data-reveal-group>
    <h2 class="contact-title" id="contact-title" data-reveal>Say hello</h2>
    <p class="contact-note" data-reveal>Email is the quickest way to reach me. Tell me what it's about and this writes the email for you.</p>
    <form class="compose" data-compose data-to="${SITE.email}" data-reveal>
      <label><span class="lbl">Your name</span><input name="name" type="text" autocomplete="name" placeholder="Ada Lovelace"></label>
      <label><span class="lbl">What it's about</span><input name="topic" type="text" placeholder="An internship, a project, a question"></label>
      <button type="submit">Write the email</button>
    </form>
    <div class="compose-print" data-reveal>
      <p>Opens your email app with this filled in. Nothing is sent from this page.</p>
      <p>Or write to ${SITE.email} directly.</p>
    </div>
    <div class="direct" data-reveal>
      <a class="link" href="mailto:${SITE.email}">${SITE.email}</a>
      <button class="btn btn-small direct-copy" type="button" data-copy="${SITE.email}"><span data-copy-label>Copy address</span></button>
      <a class="link" href="${SITE.github}" target="_blank" rel="noopener">GitHub</a>
      <a class="link" href="${SITE.linkedin}" target="_blank" rel="noopener">LinkedIn</a>
    </div>
  </div>
</section>`;
}

export default function home() {
  return {
    root,
    title: "Krithik Kambhampati: distributed systems, backends and ML",
    description: "Krithik Kambhampati, computer science student at IIIT Hyderabad. Distributed file systems, real-time Go servers, packet sniffers and ML pipelines, each with its own write-up.",
    css: ["home.css"],
    js: ["home.js"],
    intro: true,
    body: html`<a class="skip" href="#work">Skip to the work</a>
<main>
${hero()}
${work()}
${record()}
${contact()}
</main>
${footer({ root })}`,
  };
}
