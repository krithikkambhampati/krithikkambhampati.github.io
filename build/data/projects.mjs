// The projects, in the order they appear. Each one has a page at
// /projects/<slug>/ built from build/pages/<slug>.mjs, wears one syntax
// colour (tone) everywhere, and lists the frames its home-page strip shows.

const GH = "https://github.com/krithikkambhampati/";

export const PROJECTS = [
  {
    slug: "network-file-system",
    title: "Distributed network file system",
    what: "C, sockets, threads",
    when: "",
    kind: "systems",
    tone: "blue",
    summary: "A file system spread across machines: one name server knows where every file lives, storage servers hold the data, and clients reach both over a protocol written by hand.",
    frames: ["nfs-seq", "nfs-code-lock", "nfs-tree", "nfs-heartbeat", "nfs-code-proto"],
    repos: [{ label: "Source on GitHub", href: GH + "Network-File-System" }],
  },
  {
    slug: "livequiz",
    title: "LiveQuiz",
    what: "Go, Redis, WebSockets",
    when: "",
    kind: "systems web",
    tone: "coral",
    summary: "Kahoot-style multiplayer trivia. A host shares a four-character room code and everyone sees the same question, clock and leaderboard at the same moment.",
    frames: ["quiz-room", "quiz-curve", "quiz-code-score", "quiz-flow", "quiz-code-room"],
    repos: [{ label: "Source on GitHub", href: GH + "trivia-game" }],
  },
  {
    slug: "green-home-score",
    title: "Green Home Score",
    what: "LightGBM, FastAPI, LLM",
    when: "Oct 2026",
    kind: "ml web",
    tone: "teal",
    summary: "Scores how energy-efficient a UK home is and which retrofits are worth it, from models trained on 2.9 million real certificates. Team 37 at Megathon X, for Lloyds.",
    frames: ["gh-arch", "gh-epc", "gh-retrofit", "gh-code-check", "gh-bands"],
    repos: [{ label: "Source on GitHub", href: GH + "Megathon-2026" }],
  },
  {
    slug: "garbage-monitoring",
    title: "Garbage monitoring on the edge",
    what: "YOLO, Android, Qualcomm",
    when: "Nov 2025",
    kind: "ml",
    tone: "amber",
    summary: "Segments waste, people and animals in CCTV frames on a Qualcomm dev kit, then measures how much of the street is covered. A four-person team project, followed by a separate comparison of two segmentation models.",
    frames: ["gb-video-phone", "gb-street", "gb-deploy", "gb-code-decode", "gb-phones", "gb-confusion"],
    repos: [
      { label: "Android app and report", href: GH + "Garbage-Vulnerable-Points-Monitoring-System" },
      { label: "Model comparison", href: GH + "GVP" },
    ],
  },
  {
    slug: "c-shell-c-shark",
    title: "C-Shell and C-Shark",
    what: "C, POSIX, libpcap",
    when: "",
    kind: "systems",
    tone: "rose",
    summary: "Two tools for seeing a machine from the inside: a Unix shell with pipes and job control, and a Wireshark-style sniffer that decodes packets layer by layer.",
    frames: ["sh-term", "shark-layers", "sh-code-pipe", "shark-hex", "shark-code"],
    repos: [
      { label: "C-Shell source", href: GH + "C-Shell" },
      { label: "C-Shark source", href: GH + "C-Shark" },
    ],
  },
  {
    slug: "event-platform",
    title: "Felicity event platform",
    what: "MongoDB, Express, React",
    when: "Feb 2026",
    kind: "web",
    tone: "violet",
    summary: "Runs college club events end to end: registration, merchandise with payment approval, QR check-in at the door and a forum for each event.",
    frames: ["ev-flow", "ev-code-stock", "ev-ticket", "ev-roles", "ev-code-scan"],
    repos: [{ label: "Source on GitHub", href: GH + "Event-Management-System" }],
  },
];

export const SMALLER = [
  {
    title: "3D car scene",
    text: "A drivable car in an OpenGL 3.3 city with headlights, a thunderstorm mode and five camera views. C++17.",
    href: GH + "3D-Car-Scene",
    tone: "blue",
  },
  {
    title: "Pattern matching on a genome",
    text: "Nine exact and fuzzy matchers, from KMP to Ukkonen's suffix tree, benchmarked on the 4.6 million-base E. coli genome.",
    href: GH + "AAD_Fireflies",
    tone: "amber",
  },
  {
    title: "Family knowledge graph",
    text: "Community detection, rule mining and TransE link prediction on 1,316 people and 13,821 relations.",
    href: GH + "Meta-F-A-M-I-L-Y",
    tone: "teal",
  },
];

export function neighbours(slug) {
  const i = PROJECTS.findIndex((p) => p.slug === slug);
  const n = PROJECTS.length;
  return { prev: PROJECTS[(i - 1 + n) % n], next: PROJECTS[(i + 1) % n] };
}
