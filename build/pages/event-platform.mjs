// Felicity event platform — solo coursework for Design & Analysis of
// Software Systems, Assignment 1 (Feb 2026).

import { html } from "../lib/html.mjs";
import { intro, sec, field, codePane, prose, points, decisions, stack } from "../lib/parts.mjs";

const architecture = `<svg class="diagram" viewBox="0 0 1100 420" role="img" aria-label="Architecture: a React single-page app on Vercel calls an Express API on Railway with a JWT in an httpOnly cookie; the API uses MongoDB and talks to Gmail SMTP, Discord webhooks and Google reCAPTCHA.">
  <rect x="0" y="0" width="1100" height="420" fill="#13161C"/>
  <g>
    <rect class="d-box-tone" x="40" y="60" width="260" height="150" rx="4"/>
    <text x="60" y="94">React 19 + Vite</text>
    <text x="60" y="120" class="d-muted">single-page app on Vercel</text>
    <text x="60" y="160" class="d-muted">18 pages, ProtectedRoute</text>
    <text x="60" y="184" class="d-muted">by role from the JWT</text>
  </g>
  <path class="d-line-tone" d="M300 135h130"/>
  <path class="d-fill-tone" d="M430 129l12 6-12 6z"/>
  <text x="312" y="122" class="d-muted">fetch + cookie</text>
  <g>
    <rect class="d-box-tone" x="442" y="60" width="260" height="150" rx="4"/>
    <text x="462" y="94">Express 5 API</text>
    <text x="462" y="120" class="d-muted">on Railway, Node 20</text>
    <text x="462" y="160" class="d-muted">require* role guards</text>
    <text x="462" y="184" class="d-muted">on every protected route</text>
  </g>
  <path class="d-line-tone" d="M702 135h130"/>
  <path class="d-fill-tone" d="M832 129l12 6-12 6z"/>
  <text x="714" y="122" class="d-muted">Mongoose 9</text>
  <g>
    <rect class="d-box-tone" x="844" y="60" width="220" height="150" rx="4"/>
    <text x="864" y="94">MongoDB</text>
    <text x="864" y="120" class="d-muted">7 models: Event,</text>
    <text x="864" y="144" class="d-muted">Registration, Organizer,</text>
    <text x="864" y="168" class="d-muted">Participant, Admin, ...</text>
  </g>
  <path class="d-line d-dash" d="M572 210v70M572 280H210v40M572 280h0v40M572 280h362v40"/>
  <rect class="d-box" x="80" y="320" width="260" height="64" rx="4"/>
  <text x="100" y="350">Gmail SMTP</text><text x="100" y="372" class="d-muted">QR ticket on approval</text>
  <rect class="d-box" x="442" y="320" width="260" height="64" rx="4"/>
  <text x="462" y="350">Discord webhooks</text><text x="462" y="372" class="d-muted">post when published</text>
  <rect class="d-box" x="804" y="320" width="260" height="64" rx="4"/>
  <text x="824" y="350">Google reCAPTCHA</text><text x="824" y="372" class="d-muted">v2 signup, v3 login</text>
</svg>`;

const approval = `<svg class="diagram" viewBox="0 0 720 330" role="img" aria-label="Payment approval states: an order starts Pending and Pending; approval decrements stock atomically and moves it to Registered and Approved with a QR email; rejection moves it to Cancelled and Rejected; approval is refused if the variant sold out.">
  <rect x="0" y="0" width="720" height="330" fill="#13161C"/>
  <rect class="d-box-tone" x="24" y="120" width="190" height="90" rx="4"/>
  <text x="42" y="152">order placed</text><text x="42" y="176" class="d-muted">participation Pending</text><text x="42" y="196" class="d-muted">payment Pending</text>
  <path class="d-line-tone" d="M214 150 C 300 150, 300 70, 380 70"/><path class="d-fill-tone" d="M380 64l12 6-12 6z"/>
  <text x="246" y="96" class="d-muted">approve</text>
  <path class="d-line" d="M214 182 C 300 182, 300 262, 380 262"/>
  <text x="250" y="248" class="d-muted">reject</text>
  <rect x="392" y="28" width="304" height="90" rx="4" class="d-fill-tone"/>
  <text x="410" y="60" class="d-on-tone">Registered / Approved</text><text x="410" y="84" class="d-on-tone">stock −1 where stock &gt; 0</text><text x="410" y="104" class="d-on-tone">QR ticket emailed</text>
  <rect class="d-box" x="392" y="218" width="304" height="90" rx="4"/>
  <text x="410" y="250">Cancelled / Rejected</text><text x="410" y="274" class="d-muted">rejectionReason saved</text><text x="410" y="294" class="d-muted">stock untouched</text>
  <text x="410" y="160" class="d-muted">sold out since the order?</text><text x="410" y="182" class="d-muted">approval is refused</text>
</svg>`;

const ROUTES = `POST   /api/auth/login              GET  /api/auth/me
POST   /api/participants/signup     PUT  /api/participants/:id
POST   /api/events/organizer/:id/create
POST   /api/events/:eventId/publish PATCH /api/events/:eventId
POST   /api/registrations/:eventId/register
POST   /api/registrations/:id/approve-payment
POST   /api/registrations/:id/reject-payment
POST   /api/registrations/:eventId/scan
POST   /api/registrations/:id/manual-attendance
GET    /api/discussions/:eventId/messages
POST   /api/admin/password-resets/:id/approve`;

export default function ({ root, project }) {
  const body = html`
${intro({
  project,
  kicker: "Coursework, Design and Analysis of Software Systems, Feb 2026",
  lede: "Felicity runs a college club's events from start to finish. Organizers publish events and sell merchandise, participants register and pay, and the door staff scan a QR ticket. Admins, organizers and participants each get their own dashboard.",
  meta: [
    ["Context", "Assignment 1 of Design and Analysis of Software Systems, IIIT Hyderabad. Built on my own."],
    ["Deployed", "Front end on Vercel, API on Railway, database on MongoDB"],
    ["Built with", "MongoDB, Express 5, React 19, Node.js"],
  ],
  visual: `<div class="shutter">${architecture}</div><figcaption>How the pieces talk. The JWT lives in an httpOnly cookie, so page scripts can never read it.</figcaption>`,
})}

${sec({ title: "The brief", body: html`
  ${prose(
    "The assignment fixed the stack, MERN, and the rules: bcrypt for passwords, a JWT on every protected route, and role checks on every page except login and signup. On top of a core system worth 70 marks, students picked advanced features worth 30.",
    "I chose merchandise payment approval and QR attendance because both close a loop in an event's life: an order is only real once someone has checked the payment, and a registration only counts once the person turns up."
  )}
` })}

${sec({ title: "Selling the last T-shirt once", body: html`
  <div class="p-split">
    <div>
      ${prose(
        "A merchandise order arrives with a photo of the payment and waits as pending. Stock is not touched yet, so unverified orders can't lock it up.",
        "When the organizer approves, the stock decrement and the stock check are one MongoDB update: decrement where stock is still above zero. If the variant sold out between the order and the approval, nothing is modified and the approval is refused with a clear message. Only then does the participant get their QR ticket by email."
      )}
      ${approval}
    </div>
    ${codePane({ file: "registration.controller.js", name: "event-stock.js", start: 229, note: "The check and the decrement happen in one atomic update." })}
  </div>
` })}

${sec({ title: "Tickets at the door", body: html`
  <div class="p-split">
    ${codePane({ file: "registration.controller.js", name: "event-scan.js", start: 465, note: "Each refusal says exactly why the ticket isn't valid, and a scan records who scanned it and when." })}
    <div>
      ${points([
        "The organizer scans with the phone camera through html5-qrcode, or uploads a picture of the ticket.",
        "A camera fires the scan callback many times for one ticket, so a ref gates it and only one request goes out.",
        "A second scan of the same ticket gets its own error, \"Ticket already scanned!\", with the time of the first.",
        "Organizers can mark attendance by hand, with a reason, and export everything as CSV.",
      ])}
    </div>
  </div>
` })}

${sec({ title: "A forum for each event", body: html`
  <div class="p-split">
    <div>
      ${prose(
        "Each event has its own discussion. It polls every five seconds rather than holding a socket open.",
        "Polling inside setInterval caught a stale closure: the callback kept comparing against the first list of messages it ever saw. A ref that always holds the latest list fixed it, and also made it possible to spot new @everyone posts from organizers, which notify every registered participant."
      )}
    </div>
    ${codePane({ file: "DiscussionForum.jsx", name: "event-forum.js", start: 19 })}
  </div>
` })}

${field(html`
${sec({ title: "Who can do what", body: html`
  ${points([
    "Passwords are hashed with bcrypt in a pre-save hook. The JWT carries the user's id and role, lasts a day, and sits in an httpOnly cookie.",
    "Every request re-checks that an organizer account is still active, so disabling one logs it out immediately.",
    "IIIT participants must sign up with an IIIT address, and outsiders can't use those domains.",
    "Organizers can't sign themselves up. Password resets go to an admin, who approves them and issues a generated password.",
    "Sign-up uses a reCAPTCHA checkbox and login uses invisible, score-based reCAPTCHA, because they face different threats.",
  ])}
  <figure class="pane" data-reveal data-ui>
    <figcaption class="pane-bar"><span class="file">backend/routes</span><span class="spacer"></span><span>a few of the API's routes</span></figcaption>
    <pre class="code"><code>${ROUTES.split("\n").map((l) => `<span class="ln">${l.replace(/&/g, "&amp;")}</span>`).join("")}</code></pre>
  </figure>
` })}
`)}

${sec({ title: "What I'd fix next", body: decisions([
  ["The docs drifted from the code", "The README gives ticket IDs as EVT- followed by digits, but the code takes the first three letters of the event name. The scan route moved too. Both are small, and both are the kind of thing a reader trusts.", "README.md vs registration.controller.js"],
  ["Polling over sockets", "Five-second polling was simple and robust for a class project. A busy event would want WebSockets or server-sent events.", "DiscussionForum.jsx"],
  ["Failing open on reCAPTCHA", "If the reCAPTCHA service can't be reached, verification passes so sign-ups don't break. That's a deliberate trade, and one to revisit for a public deployment.", "verifyCaptcha.js"],
]) })}

${sec({ title: "Built with", body: stack([
  ["Front end", "React 19, Vite 7, React Router 7, Fuse.js, html5-qrcode"],
  ["API", "Express 5, Mongoose 9, jsonwebtoken, bcryptjs, multer"],
  ["Integrations", "nodemailer with Gmail, Discord webhooks, reCAPTCHA v2 and v3"],
  ["Hosting", "Vercel, Railway with Nixpacks, MongoDB Atlas or local"],
]) })}
`;
  return { body, titleSuffix: "a MERN event platform" };
}
