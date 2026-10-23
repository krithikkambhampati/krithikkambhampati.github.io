// LiveQuiz (trivia-game repo). Facts from README and Go source.

import { html } from "../lib/html.mjs";
import { intro, sec, field, codePane, prose, points, decisions, stack, table } from "../lib/parts.mjs";

// The lab runs the repo's scoring formula and room-code alphabet in the
// browser (assets/js/project.js). Without script it shows one worked case.
const lab = `<div class="quiz-lab lab" data-quiz>
  <div class="quiz-code">
    <p class="quiz-code-chars" data-quiz-code aria-live="polite" aria-label="Room code">K7QX</p>
    <button class="btn btn-small btn-ghost" type="button" data-quiz-new>New code</button>
    <p class="small muted quiz-alpha">Room codes are drawn from ABCDEFGHJKLMNPQRSTUVWXYZ23456789, so nobody squints at O or 0.</p>
  </div>
  <div class="quiz-score">
    <div class="lab-row">
      <label for="q-limit">Time limit</label>
      <select id="q-limit" data-quiz-limit>
        <option value="10">10 s</option><option value="20" selected>20 s</option><option value="30">30 s</option><option value="60">60 s</option>
      </select>
      <label for="q-taken">Answered after</label>
      <input id="q-taken" type="range" min="0" max="20" step="0.1" value="6" data-quiz-taken>
    </div>
    <svg class="diagram quiz-plot" viewBox="0 0 600 260" aria-hidden="true">
      <rect width="600" height="260" fill="#13161C"/>
      <path d="M60 40H570M60 130H570M60 220H570" stroke="rgba(237,240,243,.1)"/>
      <text x="50" y="44" text-anchor="end" class="d-muted">1000</text><text x="50" y="134" text-anchor="end" class="d-muted">500</text><text x="50" y="224" text-anchor="end" class="d-muted">0</text>
      <path class="d-line-tone" d="M60 40L570 130" stroke-width="3"/>
      <path d="M60 220H570" stroke="#A0A8B3" stroke-width="2" stroke-dasharray="5 5"/>
      <circle r="8" cx="213" cy="67" class="d-fill-tone" data-quiz-dot/>
      <text x="570" y="250" text-anchor="end" class="d-muted">time limit</text><text x="60" y="250" class="d-muted">instant</text>
    </svg>
    <p class="lab-out" data-quiz-out aria-live="polite">Correct after 6.0 s of 20 s scores <b>850</b> points. A wrong answer scores 0.</p>
  </div>
</div>`;

const arch = `<svg class="diagram" viewBox="0 0 1100 420" role="img" aria-label="Two server instances share one Redis: game state lives under game:CODE and broadcasts go through the channel room:CODE:events, so players on different instances see the same events.">
  <rect width="1100" height="420" fill="#13161C"/>
  ${[0, 1].map((i) => `
    <rect class="d-box-tone" x="${80 + i * 420}" y="40" width="340" height="150" rx="4"/>
    <text x="${100 + i * 420}" y="72">Go server, instance ${i + 1}</text>
    <text x="${100 + i * 420}" y="100" class="d-muted">POST /api/games, /join</text>
    <text x="${100 + i * 420}" y="124" class="d-muted">GET /ws/{code}?player_id=</text>
    <text x="${100 + i * 420}" y="156" class="d-muted">timer: time.AfterFunc</text>
    <text x="${100 + i * 420}" y="178" class="d-muted">writePump per connection</text>
    ${[0, 1, 2].map((j) => `<rect class="d-box" x="${110 + i * 420 + j * 100}" y="320" width="80" height="60" rx="4"/><text x="${150 + i * 420 + j * 100}" y="356" text-anchor="middle" class="d-muted">phone</text><path class="d-line d-dash" d="M${150 + i * 420 + j * 100} 320V190"/>`).join("")}
  `).join("")}
  <rect class="d-box" x="880" y="40" width="190" height="150" rx="4"/>
  <text x="900" y="72">Redis</text>
  <text x="900" y="100" class="d-muted">game:CODE</text>
  <text x="900" y="122" class="d-muted">JSON, 6 h TTL</text>
  <text x="900" y="156" class="d-muted">room:CODE:events</text>
  <text x="900" y="178" class="d-muted">pub/sub</text>
  <path class="d-line-tone" d="M420 115H500M840 115H880"/>
  <text x="430" y="104" class="d-muted">publish</text>
  <path class="d-line-tone" d="M250 190 C 250 240, 975 240, 975 190"/>
  <text x="520" y="258" class="d-muted">every instance subscribes and delivers to its own players</text>
</svg>`;

export default function ({ root, project }) {
  const body = html`
${intro({
  project,
  kicker: "",
  lede: "A Kahoot-style quiz with no app and no sign-up. The host gets a four-character room code, everyone joins from a phone, and every question, clock, tally and leaderboard reaches all of them at the same moment, even across several servers.",
  meta: [
    ["What runs it", "Go with Gorilla WebSocket, Redis for state and pub/sub"],
    ["Front end", "Plain HTML, CSS and JavaScript, no build step"],
    ["Tested by", "A load tester that plays full games with simulated players"],
  ],
  visual: lab + `<figcaption>Both run the repo's own logic: the room-code alphabet from generateRoomCode, and the points formula from scoreForAnswer.</figcaption>`,
})}

${sec({ title: "What has to stay fair", body: html`
  ${prose(
    "A quiz on a dozen phones is a small distributed system. Everyone must see a question at the same time, nobody's local clock should decide whether an answer counted, and two answers arriving in the same millisecond mustn't overwrite each other's score.",
    "So the server owns everything. Phones only render what they're sent, and send back one thing: an answer."
  )}
  ${points([
    "The countdown is a time.AfterFunc on the server. A question always runs its full time, even if everyone has answered.",
    "The question sent to phones leaves out the correct option. It only goes out with the results, so reading the network traffic doesn't help.",
    "A player's first answer stands. A second one for the same question is ignored.",
    "Faster correct answers score more, from 1000 points for an instant answer down to 500 at the buzzer.",
  ])}
  <div class="p-split is-even">
    ${codePane({ file: "game_loop.go", name: "quiz-score.go", start: 58, note: "Half the points for being right, half for being quick." })}
    ${codePane({ file: "game.go", name: "quiz-room.go", start: 62, note: "Four characters, 32 symbols, retried against Redis on a collision." })}
  </div>
` })}

${sec({ title: "State every server shares", body: html`
  <figure class="p-fig" data-reveal="mask">${arch}<figcaption>Any instance can serve any player. A phone that reconnects to a different instance gets the current question replayed with the time it has left.</figcaption></figure>
  ${prose(
    "Each game is a single JSON document in Redis under its room code. Broadcasts don't go straight to sockets. They're published to the room's Redis channel, and every instance with players in that room delivers them. If publishing fails, the instance still delivers to its own players rather than dropping the message.",
    "Each connection has a 16-message send buffer. A phone that falls that far behind misses messages rather than slowing everyone else down."
  )}
  ${codePane({ file: "ws.go", name: "quiz-pubsub.go", start: 91 })}
` })}

${field(html`
${sec({ title: "Many phones, one document", body: html`
  <div class="p-split">
    <div>
      ${prose(
        "Joining, answering and leaving the lobby all read the game, change it and write it back. With many phones doing that at once, the writes race.",
        "Those paths use Redis optimistic locking: WATCH the key, make the change, and commit in a transaction that fails if anyone else wrote first. A failed commit retries after a random 5 to 24 millisecond pause, up to 20 times for joins, so the retries don't all collide again."
      )}
      ${table({
        caption: "What the load tester checks on every run (loadtest/main.go)",
        head: ["Check"],
        rows: [
          ["Every simulated player connected"],
          ["The host received game_over after the expected rounds"],
          ["Leaderboards are sorted, highest first"],
          ["Each round adds 0 for a wrong or missing answer and more than 0 for a right one"],
          ["Every player's final score matches the host's"],
        ],
      })}
      ${prose("According to the README, the load tester has already found a Redis contention problem in the join path, and helped fix it.")}
    </div>
    ${codePane({ file: "game.go", name: "quiz-join.go", start: 148, note: "WATCH, change, commit; on conflict, back off with jitter and try again." })}
  </div>
` })}
`)}

${sec({ title: "Limits the README lists", body: decisions([
  ["No rate limiting", "Nothing stops a client from flooding the server with requests.", "README.md"],
  ["Custom quizzes are temporary", "They aren't saved, and there's no cap on their size.", "README.md"],
  ["Reconnecting is rough", "The server can replay state to a returning phone, but the page drops back to the join screen instead of showing that it's reconnecting.", "README.md"],
  ["One process under test", "The load tester runs against a single instance, so the cross-instance pub/sub path isn't load-tested yet, and nor are latency or packet loss.", "README.md"],
  ["Open WebSocket origins", "Any origin may connect, which is fine for playing with friends and wrong for a public deployment.", "ws.go"],
]) })}

${sec({ title: "Built with", body: stack([
  ["Server", "Go 1.24, net/http routing, Gorilla WebSocket"],
  ["State", "Redis: JSON documents, WATCH transactions, pub/sub"],
  ["Client", "HTML, CSS and JavaScript, avatars drawn in CSS"],
  ["Testing", "A separate Go load-test module"],
]) })}
`;
  return { body, titleSuffix: "real-time multiplayer trivia in Go" };
}
