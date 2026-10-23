// Distributed network file system — Operating Systems and Networks course
// project. Facts from the repo's README and source; see build/snippets/.

import { html } from "../lib/html.mjs";
import { intro, sec, field, codePane, prose, points, decisions, stack, table } from "../lib/parts.mjs";

// The live diagram. Lanes are drawn here; assets/js/project.js plays the
// messages. Without script it shows a finished write as a still.
const live = `<div class="nfs-live lab" data-nfs>
  <svg class="diagram nfs-svg" viewBox="0 0 1100 470" role="img" aria-labelledby="nfs-live-cap">
    <rect width="1100" height="470" fill="#13161C"/>
    <g data-lanes>
      ${[["client", 110], ["name server :8080", 400], ["storage 1 :9001", 690], ["storage 2 :9002", 960]].map(([n, x], i) => `
      <g data-lane="${i}">
        <rect class="d-box" x="${x - 95}" y="20" width="190" height="40" rx="4"/>
        <text x="${x}" y="46" text-anchor="middle">${n}</text>
        <path class="d-line d-dash" d="M${x} 60V455"/>
      </g>`).join("")}
    </g>
    <g data-msgs>
      <path class="d-line-tone" d="M113 110H393"/><path class="d-fill-tone" d="M393 104l10 6-10 6z"/><text x="255" y="98" text-anchor="middle">MSG_WRITE_FILE notes.txt 3</text>
      <path class="d-line-tone d-dash" d="M397 160H120"/><path class="d-fill-tone" d="M120 154l-10 6 10 6z"/><text x="255" y="148" text-anchor="middle">MSG_SS_INFO 10.0.0.5:9001</text>
      <path class="d-line-tone" d="M113 220H683"/><path class="d-fill-tone" d="M683 214l10 6-10 6z"/><text x="400" y="208" text-anchor="middle">MSG_WRITE_REQUEST sentence 3</text>
      <rect x="682" y="228" width="16" height="150" rx="3" fill="#232A52" stroke="#7AA2FF"/><text x="670" y="300" text-anchor="end" class="d-muted">sentence 3 locked</text>
      <path class="d-line-tone" d="M113 280H683"/><path class="d-fill-tone" d="M683 274l10 6-10 6z"/><text x="400" y="268" text-anchor="middle">MSG_WRITE_UPDATE 4 "is"</text>
      <path class="d-line-tone" d="M113 360H683"/><path class="d-fill-tone" d="M683 354l10 6-10 6z"/><text x="400" y="348" text-anchor="middle">MSG_WRITE_COMPLETE</text>
      <text x="710" y="420" class="d-muted">unlock, save notes.txt.v8</text>
    </g>
  </svg>
  <div class="lab-row nfs-controls">
    <button class="btn btn-small btn-accent" type="button" data-nfs-run="write">Write a sentence</button>
    <button class="btn btn-small btn-ghost" type="button" data-nfs-run="read">Read the file</button>
    <button class="btn btn-small btn-ghost" type="button" data-nfs-toggle aria-pressed="false">Take storage 1 down</button>
    <p class="lab-out" id="nfs-live-cap" data-nfs-status aria-live="polite">A write: the name server says where the file lives, then the client writes straight to that storage server.</p>
  </div>
</div>`;

const arch = `<svg class="diagram" viewBox="0 0 1100 430" role="img" aria-label="Components: clients connect to the name server on port 8080 for metadata and directly to storage servers on ports 9000 plus id for data; storage servers register with the name server on port 8081.">
  <rect width="1100" height="430" fill="#13161C"/>
  <rect class="d-box" x="30" y="150" width="230" height="130" rx="4"/>
  <text x="50" y="182">client</text><text x="50" y="208" class="d-muted">nfs&gt; prompt</text><text x="50" y="232" class="d-muted">command parser,</text><text x="50" y="256" class="d-muted">case-insensitive</text>
  <rect class="d-box-tone" x="430" y="30" width="270" height="170" rx="4"/>
  <text x="450" y="62">name server</text><text x="450" y="88" class="d-muted">select() loop, a thread</text><text x="450" y="110" class="d-muted">per connection</text><text x="450" y="140" class="d-muted">ACLs, metadata, LRU cache</text><text x="450" y="164" class="d-muted">heartbeat monitor</text><text x="450" y="186" class="d-muted">replicas and failover</text>
  ${[0, 1, 2].map((i) => `<rect class="d-box" x="${410 + i * 230}" y="290" width="210" height="110" rx="4"/><text x="${430 + i * 230}" y="322">storage ${i + 1}</text><text x="${430 + i * 230}" y="346" class="d-muted">port ${9001 + i}</text><text x="${430 + i * 230}" y="370" class="d-muted">sentence locks, undo,</text><text x="${430 + i * 230}" y="390" class="d-muted">versions, checkpoints</text>`).join("")}
  <path class="d-line-tone" d="M260 190 C 340 190, 340 115, 430 115"/><text x="282" y="140" class="d-muted">:8080 metadata</text>
  <path class="d-line-tone d-dash" d="M260 240 C 340 240, 340 345, 410 345"/><text x="270" y="318" class="d-muted">direct data</text>
  <path class="d-line" d="M565 200V290M720 200 C 720 250, 745 250, 745 290M680 200 C 680 240, 975 240, 975 290"/>
  <text x="770" y="228" class="d-muted">:8081 register, heartbeat, commands</text>
</svg>`;

const COMMANDS = [
  ["VIEW -a -l", "List files, all or with details"],
  ["READ, STREAM", "Read a file, or stream it word by word"],
  ["CREATE, DELETE, INFO", "Manage a file; only the owner deletes"],
  ["WRITE file n", "Edit sentence n, word by word, until ETIRW"],
  ["UNDO", "Revert the last change to a file"],
  ["ADDACCESS -R|-W, REMACCESS", "Grant or remove access for a user"],
  ["EXEC", "Run each sentence of a file as a shell command"],
  ["CHECKPOINT, REVERT, VERSION, RESTORE", "Snapshots and version history"],
  ["REQUESTACCESS, APPROVE, DENY", "Ask an owner for access, and answer"],
  ["CREATEFOLDER, MOVE, VIEWFOLDER", "Folders"],
];

export default function ({ root, project }) {
  const body = html`
${intro({
  project,
  kicker: "Operating Systems and Networks course project",
  lede: "Files live on several storage servers. One name server knows where each one is and who may touch it, and clients ask it first, then talk to the right storage server directly. Many people can edit the same file at once, one sentence each.",
  meta: [
    ["Context", "Course project in operating systems and networking"],
    ["Pieces", "Three programs in C: name_server, storage_server and client"],
    ["Built with", "C99, POSIX sockets, pthreads, select()"],
  ],
  visual: live + `<figcaption>Messages use the protocol's real names. Try reading the file with storage 1 down: the name server marks a silent server inactive after 15 seconds and sends the read to a replica.</figcaption>`,
})}

${sec({ title: "Naming apart from storage", body: html`
  ${prose(
    "The design splits two jobs. The name server owns metadata: where every file lives, who owns it, who may read or write it. Storage servers own the bytes. For anything that touches content, the client gets a storage server's address from the name server and then connects to it directly, so file data never passes through the name server.",
    "Each connection gets its own thread on both sides. The name server listens on two ports, one for clients and one, a port higher, for storage servers to register and stay in touch."
  )}
  <figure class="p-fig" data-reveal="mask">${arch}<figcaption>Clients ask the name server, then go straight to a storage server. Storage servers keep a connection open to the name server for commands and liveness.</figcaption></figure>
` })}

${sec({ title: "A protocol written by hand", body: html`
  <div class="p-split">
    <div>
      ${prose(
        "Every message is a fixed header, its type, a payload length and an error code, followed by exactly that many bytes. The receiver refuses a payload bigger than its buffer. There's no serialisation library: framing, message types and error codes are all defined in C.",
        "About fifty message types cover client to name server, name server to storage server, and storage server to client, plus responses and 21 named error codes like ERR_SENTENCE_LOCKED and ERR_STORAGE_SERVER_UNAVAILABLE."
      )}
    </div>
    ${codePane({ file: "common/protocol.h, protocol.c", name: "nfs-protocol.c", note: "The header and the send side of the framing." })}
  </div>
` })}

${sec({ title: "One sentence at a time", body: html`
  <div class="p-split">
    ${codePane({ file: "storage_server/sentence_lock.c", name: "nfs-lock.c", start: 38, note: "A lock per file and sentence, looked up under one mutex and owned by a user." })}
    <div>
      ${points([
        "Sentences end at a full stop, an exclamation mark or a question mark. A WRITE names one sentence, and the storage server locks just that one, so two people can edit different sentences of the same file at the same time.",
        "Inside the lock the user sends words with their position, one MSG_WRITE_UPDATE each, and finishes with ETIRW. Writing a full stop in the middle splits the sentence in two.",
        "Before the lock is taken, the server saves an undo snapshot. After the write it saves a new numbered version.",
        "A second writer on a locked sentence gets ERR_SENTENCE_LOCKED straight away rather than waiting.",
      ])}
    </div>
  </div>
` })}

${field(html`
${sec({ title: "When a server goes quiet", body: html`
  <div class="p-split">
    <div>
      ${prose(
        "A monitor thread on the name server checks every five seconds. A storage server that hasn't been heard from for 15 seconds is marked inactive. A closed socket marks it inactive at once.",
        "When a new storage server joins, the name server copies every file held on other active servers onto it and records it as a replica. A read whose primary is down goes to the first active replica instead, and the console logs it as a failover."
      )}
      ${codePane({ file: "name_server/heartbeat.c", name: "nfs-heartbeat.c", note: "The read lock is dropped before marking a server inactive, which takes the write lock." })}
    </div>
    ${codePane({ file: "name_server/client_handler.c", name: "nfs-failover.c", start: 188, note: "Primary first, then replicas; the client gets back whichever address is alive." })}
  </div>
` })}
`)}

${sec({ title: "What the client can do", body: html`
  ${table({ caption: "Commands as client/command_parser.c implements them; they're case-insensitive", head: ["Command", "What it does"], rows: COMMANDS.map(([c, d]) => [`<span class="mono">${c}</span>`, d]) })}
` })}

${sec({ title: "Trade-offs and limits", body: decisions([
  ["Undo keeps one snapshot", "The snapshot is taken when a write starts, so undo reverts only the latest change to a file, and other people's interleaved writes aren't part of it.", "storage_server/ss_server.c"],
  ["A simple cache, on purpose", "Metadata lookups go through a 100-entry LRU cache built as a linked list with linear search. A comment notes a hash map would replace it in production.", "name_server/cache.c"],
  ["One name server", "Every request starts at the name server, so it's the bottleneck and a single point of failure. The README suggests clustering it and moving metadata to a database at scale.", "README.md"],
  ["Locks live in memory", "Sentence locks are an in-memory list on each storage server, so they don't survive a restart.", "storage_server/sentence_lock.c"],
]) })}

${sec({ title: "Built with", body: stack([
  ["Language", "C99 with POSIX sockets"],
  ["Concurrency", "pthreads: detached threads, mutexes, a read-write lock"],
  ["I/O", "select() with a 1 second timeout, popen for EXEC"],
  ["Storage", "Plain files: metadata, ACLs, versions and logs on disk"],
]) })}
`;
  return { body, titleSuffix: "a distributed file system in C" };
}
