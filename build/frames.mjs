// Frames: single artifacts of the work, each wearing a status strip with
// its file name and kind, coloured in its project's tone. The same frame
// appears in the hero sheet, its project's strip and the contact strip,
// so every picture of the work is defined once, here.
//
// Kinds of frame:
//   img   a real picture from the project's repo (assets/img/...)
//   code  a verbatim excerpt from build/snippets/, highlighted at build time
//   svg   a drawing made from the project's real names and numbers

import { readFileSync } from "node:fs";
import { html, esc } from "./lib/html.mjs";
import { highlight } from "./lib/highlight.mjs";

const SNIPPETS = new URL("./snippets/", import.meta.url);

export function snippet(name) {
  return readFileSync(new URL(name, SNIPPETS), "utf8");
}

function lines(name, from = 1, to = Infinity) {
  return snippet(name).split("\n").slice(from - 1, to).join("\n");
}

const LANG = { py: "python", js: "js", kt: "kotlin", c: "c", go: "go", h: "c" };

const img = (src, alt, pos = "50% 50%") => {
  const fn = (root) => `<img src="${root}assets/img/${src}" alt="${esc(alt)}" loading="lazy" decoding="async" style="object-position:${pos}">`;
  fn.kind = "img";
  return fn;
};

// A real clip from the project's own demo video: muted, looping, played
// only while on screen (assets/js/site.js), poster frame without script.
const vid = (src, poster, label) => {
  const fn = (root) => `<video muted loop playsinline preload="none" poster="${root}assets/video/${poster}" aria-label="${esc(label)}" data-loop><source src="${root}assets/video/${src}" type="video/mp4"></video>`;
  fn.kind = "img";
  return fn;
};

const code = (name, from, to) => () => {
  const lang = LANG[name.split(".").pop()];
  return `<pre class="code frame-code" aria-hidden="true">${highlight(lines(name, from, to), lang)}</pre>`;
};

const svg = (viewBox, body, label) => () =>
  `<svg viewBox="${viewBox}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(label)}">${body}</svg>`;

/* ---------- drawings ---------- */

const EPC = [
  ["A", "92+", "#008054"], ["B", "81–91", "#19B459"], ["C", "69–80", "#8DCE46"],
  ["D", "55–68", "#FFD500"], ["E", "39–54", "#FCAA65"], ["F", "21–38", "#EF8023"], ["G", "1–20", "#E9153B"],
];
const epcLadder = EPC.map(([band, range, colour], i) => {
  const y = 34 + i * 62;
  const w = 150 + i * 34;
  const ink = i >= 2 && i <= 4 ? "#0B0D11" : "#FFFFFF";
  return `<path d="M24 ${y}h${w}l22 24-22 24H24z" fill="${colour}"/>
    <text x="38" y="${y + 31}" fill="${ink}" font-size="17" font-family="Mona Sans, sans-serif" font-weight="600">${band}</text>
    <text x="${24 + w - 12}" y="${y + 30}" fill="${ink}" font-size="13" text-anchor="end" font-family="Fragment Mono, monospace">SAP ${range}</text>`;
}).join("");

const eventFlow = `
  <g font-family="Fragment Mono, monospace" font-size="13">
    <rect x="20" y="24" width="440" height="58" rx="4" fill="#1B1F27" stroke="#B49BFF"/>
    <text x="36" y="50" fill="#EDF0F3">participant uploads payment proof</text>
    <text x="36" y="70" fill="#A0A8B3">Pending / Pending</text>
    <path d="M240 82v40" stroke="#A0A8B3" stroke-width="1.5"/>
    <rect x="20" y="122" width="440" height="58" rx="4" fill="#1B1F27" stroke="rgba(237,240,243,.16)"/>
    <text x="36" y="148" fill="#EDF0F3">organizer opens Pending Payments</text>
    <text x="36" y="168" fill="#A0A8B3">approve or reject</text>
    <path d="M130 180v44M350 180v44" stroke="#A0A8B3" stroke-width="1.5"/>
    <rect x="20" y="224" width="220" height="112" rx="4" fill="#B49BFF"/>
    <text x="34" y="250" fill="#0B0D11">approve</text>
    <text x="34" y="276" fill="#0B0D11">$inc stock −1</text>
    <text x="34" y="296" fill="#0B0D11">where stock &gt; 0</text>
    <text x="34" y="322" fill="#0B0D11">→ Registered + QR</text>
    <rect x="250" y="224" width="210" height="112" rx="4" fill="#1B1F27" stroke="rgba(237,240,243,.16)"/>
    <text x="264" y="250" fill="#EDF0F3">reject</text>
    <text x="264" y="276" fill="#A0A8B3">Cancelled</text>
    <text x="264" y="296" fill="#A0A8B3">/ Rejected</text>
    <text x="264" y="322" fill="#A0A8B3">stock untouched</text>
  </g>`;

const eventTicket = `
  <g font-family="Fragment Mono, monospace">
    <rect x="20" y="40" width="440" height="200" rx="6" fill="#EDF0F3"/>
    <circle cx="20" cy="140" r="16" fill="#13161C"/><circle cx="460" cy="140" r="16" fill="#13161C"/>
    <path d="M330 52v176" stroke="#0B0D11" stroke-dasharray="4 6" opacity=".35"/>
    <text x="44" y="84" font-size="13" fill="#4A5058">ticketId</text>
    <text x="44" y="128" font-size="30" fill="#0B0D11" letter-spacing="-1">FEL-482913-0571</text>
    <text x="44" y="168" font-size="13" fill="#4A5058">event name, first 3 letters</text>
    <text x="44" y="188" font-size="13" fill="#4A5058">last 6 digits of Date.now()</text>
    <text x="44" y="208" font-size="13" fill="#4A5058">4 random digits</text>
    <text x="352" y="128" font-size="13" fill="#4A5058">QR of</text><text x="352" y="148" font-size="13" fill="#4A5058">the ticketId,</text><text x="352" y="168" font-size="13" fill="#4A5058">sent by email</text>
  </g>`;

const eventRoles = `
  <g font-family="Fragment Mono, monospace" font-size="13">
    ${[
      ["ADMIN", ["create organizers", "approve password resets", "disable accounts"], 20],
      ["ORGANIZER", ["draft and publish events", "approve payments", "scan QR tickets"], 176],
      ["PARTICIPANT", ["register and pay", "follow organizers", "post in the forum"], 332],
    ].map(([role, can, x], i) => `
      <rect x="${x}" y="28" width="148" height="300" rx="4" fill="${i === 1 ? "#B49BFF" : "#1B1F27"}" ${i === 1 ? "" : 'stroke="rgba(237,240,243,.16)"'}/>
      <text x="${x + 14}" y="56" fill="${i === 1 ? "#0B0D11" : "#EDF0F3"}">${role}</text>
      ${can.map((c, j) => `<text x="${x + 14}" y="${104 + j * 54}" fill="${i === 1 ? "#0B0D11" : "#A0A8B3"}">${c.split(" ").slice(0, 2).join(" ")}</text><text x="${x + 14}" y="${122 + j * 54}" fill="${i === 1 ? "#0B0D11" : "#A0A8B3"}">${c.split(" ").slice(2).join(" ")}</text>`).join("")}
    `).join("")}
    <text x="20" y="352" fill="#A0A8B3">require* middleware on every route</text>
  </g>`;

// Plain text as the program prints or stores it, no highlighting.
const text = (name, from, to, cls = "") => () =>
  `<pre class="code frame-code frame-text ${cls}" aria-hidden="true">${lines(name, from, to).split("\n").map((l) => `<span class="ln">${esc(l) || " "}</span>`).join("")}</pre>`;

const raw = (s) => () => s;

const M = "Fragment Mono, monospace";
const INK = "#EDF0F3", MUTED = "#A0A8B3", LINE = "rgba(237,240,243,.16)", SURF = "#1B1F27";

// NFS: a read-then-write as the protocol really runs it.
function nfsSeq() {
  const lanes = [["client", 60], ["name server", 200], ["storage 2", 340]];
  const msg = (y, from, to, label, reply) => {
    const x1 = lanes[from][1], x2 = lanes[to][1];
    const dir = x2 > x1 ? 1 : -1;
    return `<path d="M${x1 + dir * 3} ${y}H${x2 - dir * 6}" stroke="#7AA2FF" stroke-width="1.8" ${reply ? 'stroke-dasharray="5 4"' : ""}/>
      <path d="M${x2 - dir * 6} ${y - 5}l${dir * 7} 5l${-dir * 7} 5z" fill="#7AA2FF"/>
      <text x="${(x1 + x2) / 2}" y="${y - 9}" text-anchor="middle" font-family="${M}" font-size="12.5" fill="${INK}">${label}</text>`;
  };
  return `<rect width="400" height="500" fill="#13161C"/>
    ${lanes.map(([n, x]) => `<rect x="${x - 52}" y="22" width="104" height="30" rx="4" fill="${SURF}" stroke="${LINE}"/><text x="${x}" y="42" text-anchor="middle" font-family="${M}" font-size="13" fill="${INK}">${n}</text><path d="M${x} 52V480" stroke="${LINE}" stroke-dasharray="3 5"/>`).join("")}
    ${msg(96, 0, 1, "MSG_WRITE_FILE")}
    ${msg(142, 1, 0, "MSG_SS_INFO :9002", true)}
    ${msg(196, 0, 2, "MSG_WRITE_REQUEST")}
    <rect x="334" y="204" width="12" height="190" rx="3" fill="#232A52" stroke="#7AA2FF"/>
    <text x="324" y="300" text-anchor="end" font-family="${M}" font-size="12" fill="#7AA2FF">sentence 3</text>
    <text x="324" y="316" text-anchor="end" font-family="${M}" font-size="12" fill="#7AA2FF">locked</text>
    ${msg(250, 0, 2, "MSG_WRITE_UPDATE")}
    ${msg(352, 0, 2, "MSG_WRITE_COMPLETE")}
    <text x="324" y="436" text-anchor="end" font-family="${M}" font-size="12" fill="${MUTED}">unlock, save version</text>`;
}

function nfsHeartbeat() {
  const ticks = [0, 1, 2, 3].map((i) => {
    const x = 50 + i * 70;
    return `<circle cx="${x}" cy="120" r="6" fill="#7AA2FF"/><text x="${x}" y="150" text-anchor="middle" font-family="${M}" font-size="12" fill="${MUTED}">${i * 5}s</text>`;
  }).join("");
  return `<rect width="480" height="270" fill="#13161C"/>
    <text x="30" y="46" font-family="${M}" font-size="13" fill="${INK}">storage 1, as the name server sees it</text>
    <path d="M30 120H450" stroke="${LINE}"/>
    ${ticks}
    <path d="M260 106v28" stroke="#FFC15E" stroke-width="2"/>
    <text x="268" y="98" font-family="${M}" font-size="12" fill="#FFC15E">last heartbeat</text>
    <path d="M260 190H420" stroke="#FFC15E" stroke-width="1.6" stroke-dasharray="4 4"/>
    <path d="M420 184l8 6-8 6z" fill="#FFC15E"/>
    <text x="268" y="214" font-family="${M}" font-size="12" fill="${MUTED}">15 000 ms with no word</text>
    <rect x="300" y="226" width="150" height="28" rx="4" fill="#FFC15E"/>
    <text x="312" y="245" font-family="${M}" font-size="13" fill="#0B0D11">marked inactive</text>`;
}

const NFS_TREE = `<pre class="code frame-code frame-text" aria-hidden="true"><span class="ln">data/</span><span class="ln">  name_server/</span><span class="ln">    file_metadata.dat</span><span class="ln">    acls/hello.txt.acl</span><span class="ln"><span class="t-c">      OWNER:kaund</span></span><span class="ln"><span class="t-c">      USER:krithik:3</span></span><span class="ln">  storage_servers/ss1/</span><span class="ln">    files/</span><span class="ln">    metadata/versions/</span><span class="ln">logs/storage_server_1.log</span></pre>`;

// LiveQuiz: the room-code alphabet, with the four confusable characters gone.
function quizRoom() {
  const all = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("");
  const gone = new Set(["O", "0", "I", "1"]);
  const grid = all.map((c, i) => {
    const x = 34 + (i % 9) * 37, y = 268 + Math.floor(i / 9) * 34;
    const out = gone.has(c);
    return `<text x="${x}" y="${y}" text-anchor="middle" font-family="${M}" font-size="17" fill="${out ? "#FF8E7A" : MUTED}">${c}</text>${out ? `<path d="M${x - 10} ${y - 6}h20" stroke="#FF8E7A" stroke-width="2"/>` : ""}`;
  }).join("");
  return `<rect width="360" height="400" fill="#13161C"/>
    <text x="24" y="44" font-family="${M}" font-size="13" fill="${MUTED}">join with a room code</text>
    ${"K7QX".split("").map((c, i) => `<rect x="${24 + i * 80}" y="66" width="70" height="104" rx="4" fill="#FF8E7A"/><text x="${59 + i * 80}" y="140" text-anchor="middle" font-family="Mona Sans, sans-serif" font-weight="600" font-size="58" fill="#0B0D11">${c}</text>`).join("")}
    <text x="24" y="214" font-family="${M}" font-size="13" fill="${MUTED}">32 characters, never O 0 I 1</text>
    ${grid}`;
}

function quizCurve() {
  const X = (t) => 50 + t * 330, Y = (p) => 300 - p * 0.24;
  return `<rect width="440" height="340" fill="#13161C"/>
    <text x="24" y="38" font-family="${M}" font-size="13" fill="${INK}">points for a correct answer</text>
    ${[0, 500, 1000].map((p) => `<path d="M50 ${Y(p)}H390" stroke="${LINE}"/><text x="42" y="${Y(p) + 4}" text-anchor="end" font-family="${M}" font-size="12" fill="${MUTED}">${p}</text>`).join("")}
    <path d="M${X(0)} ${Y(1000)}L${X(1)} ${Y(500)}" stroke="#FF8E7A" stroke-width="3"/>
    <circle cx="${X(0)}" cy="${Y(1000)}" r="5" fill="#FF8E7A"/><circle cx="${X(1)}" cy="${Y(500)}" r="5" fill="#FF8E7A"/>
    <path d="M${X(0)} ${Y(0)}H${X(1)}" stroke="${MUTED}" stroke-width="2" stroke-dasharray="5 5"/>
    <text x="${X(0.5)}" y="${Y(0) - 10}" text-anchor="middle" font-family="${M}" font-size="12" fill="${MUTED}">wrong or no answer: 0</text>
    <text x="${X(0)}" y="326" font-family="${M}" font-size="12" fill="${MUTED}">instant</text>
    <text x="${X(1)}" y="326" text-anchor="end" font-family="${M}" font-size="12" fill="${MUTED}">time limit</text>`;
}

function quizFlow() {
  const states = [["lobby", "player_joined"], ["live", "question, answer_tally"], ["results", "question_result"], ["finished", "game_over"]];
  return `<rect width="440" height="330" fill="#13161C"/>
    ${states.map(([s, m], i) => {
      const y = 28 + i * 74;
      return `<rect x="24" y="${y}" width="120" height="48" rx="4" fill="${i === 1 ? "#FF8E7A" : SURF}" ${i === 1 ? "" : `stroke="${LINE}"`}/>
        <text x="40" y="${y + 30}" font-family="${M}" font-size="14" fill="${i === 1 ? "#0B0D11" : INK}">${s}</text>
        <text x="164" y="${y + 30}" font-family="${M}" font-size="12.5" fill="${MUTED}">${m}</text>
        ${i < 3 ? `<path d="M84 ${y + 48}v26" stroke="${MUTED}" stroke-width="1.5"/>` : ""}`;
    }).join("")}
    <path d="M144 190 C 200 190, 200 120, 144 120" stroke="#FF8E7A" stroke-width="1.5" fill="none" stroke-dasharray="4 4"/>
    <text x="206" y="160" font-family="${M}" font-size="12" fill="#FF8E7A">next_question</text>`;
}

const SHELL_GRAMMAR = `<pre class="code frame-code frame-text" aria-hidden="true"><span class="ln"><span class="t-c">// src/parser.c, recursive descent</span></span><span class="ln"> </span><span class="ln"><span class="t-k">shell_cmd</span> := cmd_group</span><span class="ln">   ((<span class="t-s">';'</span> | <span class="t-s">'&amp;'</span>) cmd_group)*</span><span class="ln">   <span class="t-s">'&amp;'</span>?</span><span class="ln"> </span><span class="ln"><span class="t-k">cmd_group</span> := atomic (<span class="t-s">'|'</span> atomic)*</span><span class="ln"> </span><span class="ln"><span class="t-k">atomic</span> := name</span><span class="ln">   (name | input | output)*</span><span class="ln"> </span><span class="ln"><span class="t-k">input</span>  := <span class="t-s">'&lt;'</span> name</span><span class="ln"><span class="t-k">output</span> := (<span class="t-s">'&gt;'</span> | <span class="t-s">'&gt;&gt;'</span>) name</span></pre>`;

// C-Shark: where each field sits in an Ethernet + IPv4 + TCP frame.
function sharkLayers() {
  const bands = [
    ["Ethernet II", "0", "13", "#F48FC8", ["dst MAC 0–5", "src MAC 6–11", "EtherType 12–13"]],
    ["IPv4", "14", "33", "#7AA2FF", ["TTL 22", "protocol 23", "src IP 26–29", "dst IP 30–33"]],
    ["TCP", "34", "53", "#4FDDC0", ["ports 34–37", "seq 38–41", "flags 47"]],
    ["payload", "54", "…", "#FFC15E", ["first 64 bytes as hex"]],
  ];
  return `<rect width="420" height="420" fill="#13161C"/>
    <text x="24" y="38" font-family="${M}" font-size="13" fill="${MUTED}">bytes of one frame</text>
    ${bands.map(([name, a, b, c, fields], i) => {
      const y = 56 + i * 90;
      return `<rect x="24" y="${y}" width="10" height="76" fill="${c}"/>
        <text x="48" y="${y + 18}" font-family="${M}" font-size="14" fill="${INK}">${name}</text>
        <text x="396" y="${y + 18}" text-anchor="end" font-family="${M}" font-size="12" fill="${MUTED}">${a}–${b}</text>
        ${fields.map((f, j) => `<text x="${48 + (j % 2) * 170}" y="${y + 44 + Math.floor(j / 2) * 22}" font-family="${M}" font-size="12.5" fill="${MUTED}">${f}</text>`).join("")}`;
    }).join("")}`;
}

/* ---------- the registry ---------- */

export const FRAMES = {
  /* Network file system — blue */
  "nfs-seq": { tone: "blue", file: "write, sentence 3", tag: "protocol", ratio: "4 / 5", body: svg("0 0 400 500", nfsSeq(), "Sequence diagram: the client asks the name server where a file lives, then writes a sentence directly to the storage server, which locks it.") },
  "nfs-code-lock": { tone: "blue", file: "sentence_lock.c", tag: "c", ratio: "4 / 3", body: code("nfs-lock.c", 1, 15) },
  "nfs-tree": { tone: "blue", file: "data/", tag: "on disk", ratio: "3 / 4", body: raw(NFS_TREE) },
  "nfs-heartbeat": { tone: "blue", file: "heartbeat.c", tag: "5 s / 15 s", ratio: "16 / 9", body: svg("0 0 480 270", nfsHeartbeat(), "Timeline of heartbeats every five seconds; after fifteen seconds of silence a storage server is marked inactive.") },
  "nfs-code-proto": { tone: "blue", file: "protocol.c", tag: "c", ratio: "4 / 3", body: code("nfs-protocol.c", 1, 16) },

  /* LiveQuiz — coral */
  "quiz-room": { tone: "coral", file: "generateRoomCode", tag: "go", ratio: "9 / 10", body: svg("0 0 360 400", quizRoom(), "A four-character room code, drawn from 32 characters that leave out O, 0, I and 1.") },
  "quiz-curve": { tone: "coral", file: "scoreForAnswer", tag: "1000 → 500", ratio: "4 / 3", body: svg("0 0 440 340", quizCurve(), "Points for a correct answer fall in a straight line from 1000 when instant to 500 at the time limit; wrong answers score 0.") },
  "quiz-code-score": { tone: "coral", file: "game_loop.go", tag: "go", ratio: "4 / 3", body: code("quiz-score.go", 3, 16) },
  "quiz-flow": { tone: "coral", file: "game.Status", tag: "states", ratio: "4 / 3", body: svg("0 0 440 330", quizFlow(), "Game states lobby, live, results and finished, with the WebSocket messages each sends.") },
  "quiz-code-room": { tone: "coral", file: "game.go", tag: "go", ratio: "4 / 3", body: code("quiz-room.go") },

  /* C-Shell and C-Shark — rose */
  "sh-term": { tone: "rose", file: "parser.c", tag: "grammar", ratio: "3 / 4", body: raw(SHELL_GRAMMAR) },
  "shark-layers": { tone: "rose", file: "inspect_packet", tag: "offsets", ratio: "1 / 1", body: svg("0 0 420 420", sharkLayers(), "Layout of an Ethernet, IPv4 and TCP frame with the byte offsets C-Shark labels for each field.") },
  "sh-code-pipe": { tone: "rose", file: "pipeline.c", tag: "c", ratio: "4 / 3", body: code("shell-pipe.c", 1, 16) },
  "shark-hex": { tone: "rose", file: "README example", tag: "output", ratio: "4 / 3", body: text("shark-readme.txt", 19, 27) },
  "shark-code": { tone: "rose", file: "sniffer.c", tag: "c", ratio: "4 / 3", body: code("shark-tcp.c", 1, 11) },

  /* Green Home Score — teal */
  "gh-arch": { tone: "teal", file: "docs/architecture.png", tag: "diagram", ratio: "23 / 12", body: img("green-home/architecture.webp", "Architecture of the Green Home Score engine: data foundation, models, core engine, LLM layer and product.", "0% 40%") },
  "gh-epc": { tone: "teal", file: "EnergyRating", tag: "A–G", ratio: "4 / 5", body: svg("0 0 400 500", `<rect width="400" height="500" fill="#13161C"/>${epcLadder}`, "The seven UK EPC bands from A to G with their SAP point ranges.") },
  "gh-retrofit": { tone: "teal", file: "retrofit_delta_sap.png", tag: "plot", ratio: "16 / 9", body: img("green-home/retrofit-gain.webp", "Observed median SAP gain from single-change repeat EPCs: solid wall insulation adds the most, smart thermostats the least.", "0% 50%") },
  "gh-code-check": { tone: "teal", file: "llm/checker.py", tag: "python", ratio: "4 / 3", body: code("green-checker.py", 1, 16) },
  "gh-bands": { tone: "teal", file: "band_mix.png", tag: "plot", ratio: "2 / 1", body: img("green-home/band-mix.webp", "Bar chart of EPC band mix in the product sample against England and Wales.") },
  "gh-calibration": { tone: "teal", file: "calibration_gas.png", tag: "plot", ratio: "5 / 4", body: img("green-home/calibration-gas.webp", "Synthetic annual gas use against real NEED data by property type and age.") },

  /* Garbage monitoring — amber */
  "gb-street": { tone: "amber", file: "annotation", tag: "CCTV", ratio: "16 / 9", body: img("garbage/annotated-street.webp", "A CCTV frame of a roadside dump annotated into waste, person and animal masks.") },
  "gb-phones": { tone: "amber", file: "QIDK v1 · v2", tag: "photo", ratio: "3 / 2", body: img("garbage/qidk-phones.webp", "Two Qualcomm QIDK devices running the segmentation app side by side.") },
  "gb-deploy": { tone: "amber", file: "field test", tag: "photo", ratio: "4 / 5", body: img("garbage/campus-deployment.webp", "The model's green waste masks over a dump on the IIIT Hyderabad campus during the field test.") },
  "gb-app": { tone: "amber", file: "ESW Segmentation", tag: "app", ratio: "9 / 16", body: img("garbage/android-app.webp", "The Android app showing segmented waste, capture buttons and the NNAPI delegate.", "50% 30%") },
  "gb-confusion": { tone: "amber", file: "confusion_matrix", tag: "plot", ratio: "4 / 3", body: img("garbage/yolo-confusion.webp", "Normalised confusion matrix for YOLO11s-seg across animal, waste, person and background.") },
  "gb-preds": { tone: "amber", file: "val_batch1_pred", tag: "YOLO", ratio: "16 / 9", body: img("garbage/yolo-val-predictions.webp", "YOLO11s-seg predictions on validation CCTV frames, labelled waste and person.") },
  "gb-video-phone": { tone: "amber", file: "Demos/demo.mp4", tag: "video", ratio: "16 / 9", body: vid("garbage-phone.mp4", "garbage-phone-poster.webp", "The Android app on a QIDK device segmenting a photo and reporting waste coverage and NPU timings.") },
  "gb-video-runner": { tone: "amber", file: "Demos/demo.mp4", tag: "video", ratio: "16 / 9", body: vid("garbage-runner.mp4", "garbage-runner-poster.webp", "The desktop runner segmenting a waste pile with each of the trained models in turn.") },
  "gb-code-decode": { tone: "amber", file: "SegmentationHelper.kt", tag: "kotlin", ratio: "4 / 3", body: code("garbage-decode.kt", 12, 30) },

  /* Felicity event platform — violet */
  "ev-flow": { tone: "violet", file: "approve-payment", tag: "flow", ratio: "4 / 3", body: svg("0 0 480 360", `<rect width="480" height="360" fill="#13161C"/>${eventFlow}`, "Merchandise payment approval: a pending order is approved with an atomic stock decrement, or rejected.") },
  "ev-code-stock": { tone: "violet", file: "registration.controller.js", tag: "js", ratio: "4 / 3", body: code("event-stock.js", 1, 15) },
  "ev-ticket": { tone: "violet", file: "ticketId", tag: "format", ratio: "16 / 9", body: svg("0 0 480 280", `<rect width="480" height="280" fill="#13161C"/>${eventTicket}`, "A ticket drawing showing how ticket IDs are built from the event name, a timestamp and random digits.") },
  "ev-roles": { tone: "violet", file: "auth.middleware.js", tag: "roles", ratio: "4 / 3", body: svg("0 0 500 370", `<rect width="500" height="370" fill="#13161C"/>${eventRoles}`, "The three roles, admin, organizer and participant, and what each can do.") },
  "ev-code-scan": { tone: "violet", file: "scan ticket", tag: "js", ratio: "4 / 3", body: code("event-scan.js", 13, 26) },
};

export function frame(id, root, { cls = "", eager = false } = {}) {
  const f = FRAMES[id];
  if (!f) throw new Error(`Unknown frame: ${id}`);
  let body = f.body(root);
  if (eager) body = body.replace(' loading="lazy"', "");
  const ui = f.body.kind === "img" ? "" : " data-ui";
  return html`<figure class="frame tone-${f.tone} ${cls}" style="--ratio:${f.ratio}"${ui}>
  <div class="frame-body">${body}</div>
  <figcaption class="frame-strip"><span>${esc(f.file)}</span><span>${esc(f.tag)}</span></figcaption>
</figure>`;
}
