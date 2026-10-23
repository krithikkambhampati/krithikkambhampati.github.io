/* Project pages: the small labs that run each project's real logic. */

(function () {
  "use strict";

  var KK = window.KK || {};
  var SVG_NS = "http://www.w3.org/2000/svg";

  /* ---------- Green Home Score: the intensity sub-score ---------- */

  var intensity = document.querySelector('[data-lab="intensity"]');
  if (intensity) {
    var input = intensity.querySelector("input");
    var out = intensity.querySelector("[data-lab-out]");
    var I_BEST = 85, I_WORST = 230; // train-split P5 / P95, kWh per m² a year
    var update = function () {
      var v = Number(input.value);
      var frac = (I_WORST - v) / (I_WORST - I_BEST);
      var s = 100 * Math.min(Math.max(frac, 0), 1);
      out.innerHTML = v + " kWh/m² gives a sub-score of <b>" + s.toFixed(1) + "</b>";
    };
    input.addEventListener("input", update);
    update();
  }

  /* ---------- LiveQuiz: scoreForAnswer and generateRoomCode ---------- */

  var quiz = document.querySelector("[data-quiz]");
  if (quiz) {
    var CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    var codeEl = quiz.querySelector("[data-quiz-code]");
    quiz.querySelector("[data-quiz-new]").addEventListener("click", function () {
      var c = "";
      for (var i = 0; i < 4; i++) c += CHARS[Math.floor(Math.random() * CHARS.length)];
      codeEl.textContent = c;
      if (KK.motion) gsap.fromTo(codeEl, { opacity: 0.2, y: 6 }, { opacity: 1, y: 0, duration: 0.25, ease: "expo.out" });
    });

    var limitEl = quiz.querySelector("[data-quiz-limit]");
    var takenEl = quiz.querySelector("[data-quiz-taken]");
    var dot = quiz.querySelector("[data-quiz-dot]");
    var qout = quiz.querySelector("[data-quiz-out]");
    var score = function (limit, taken) {
      var fraction = 1 - taken / limit;
      if (fraction < 0) fraction = 0;
      return Math.floor(500 + fraction * 500);
    };
    var redraw = function () {
      var limit = Number(limitEl.value);
      takenEl.max = String(limit);
      if (Number(takenEl.value) > limit) takenEl.value = String(limit);
      var taken = Number(takenEl.value);
      var t = taken / limit;
      dot.setAttribute("cx", String(60 + t * 510));
      dot.setAttribute("cy", String(40 + t * 90));
      qout.innerHTML = "Correct after " + taken.toFixed(1) + " s of " + limit + " s scores <b>" + score(limit, taken) + "</b> points. A wrong answer scores 0.";
    };
    limitEl.addEventListener("change", redraw);
    takenEl.addEventListener("input", redraw);
    redraw();
  }

  /* ---------- NFS: replay a write, a read, and a failover read ---------- */

  var nfs = document.querySelector("[data-nfs]");
  if (nfs) {
    var svg = nfs.querySelector("svg");
    var layer = svg.querySelector("[data-msgs]");
    var status = nfs.querySelector("[data-nfs-status]");
    var writeBtn = nfs.querySelector('[data-nfs-run="write"]');
    var readBtn = nfs.querySelector('[data-nfs-run="read"]');
    var toggle = nfs.querySelector("[data-nfs-toggle]");
    var lane1 = svg.querySelector('[data-lane="2"]');
    var X = [110, 400, 690, 960];
    var down = false;
    var tl = null;

    var el = function (name, attrs, parent) {
      var n = document.createElementNS(SVG_NS, name);
      for (var k in attrs) n.setAttribute(k, attrs[k]);
      parent.appendChild(n);
      return n;
    };

    // One arrow and its label; returns the parts to animate.
    var message = function (g, from, to, y, label, reply) {
      var x1 = X[from], x2 = X[to], dir = x2 > x1 ? 1 : -1;
      var grp = el("g", {}, g);
      var line = el("path", { "class": "d-line-tone" + (reply ? " d-dash" : ""), d: "M" + (x1 + dir * 3) + " " + y + "H" + (x2 - dir * 10) }, grp);
      var head = el("path", { "class": "d-fill-tone", d: "M" + (x2 - dir * 10) + " " + (y - 6) + "l" + dir * 10 + " 6l" + -dir * 10 + " 6z" }, grp);
      var text = el("text", { x: (x1 + x2) / 2, y: y - 12, "text-anchor": "middle" }, grp);
      text.textContent = label;
      var len = Math.abs(x2 - x1);
      line.style.strokeDasharray = reply ? "" : len + " " + len;
      return { line: line, head: head, text: text, len: len, reply: reply };
    };

    var scenarios = {
      write: function (g) {
        return [
          message(g, 0, 1, 110, "MSG_WRITE_FILE notes.txt 3"),
          message(g, 1, 0, 160, "MSG_SS_INFO 10.0.0.5:9001", true),
          message(g, 0, 2, 220, "MSG_WRITE_REQUEST sentence 3"),
          { lock: true, lane: 2, y1: 228, y2: 378, label: "sentence 3 locked" },
          message(g, 0, 2, 280, 'MSG_WRITE_UPDATE 4 "is"'),
          message(g, 0, 2, 360, "MSG_WRITE_COMPLETE"),
          { note: true, x: 710, y: 420, label: "unlock, save notes.txt.v8" },
        ];
      },
      read: function (g) {
        if (!down) {
          return [
            message(g, 0, 1, 110, "MSG_READ_FILE notes.txt"),
            message(g, 1, 0, 160, "MSG_SS_INFO 10.0.0.5:9001", true),
            message(g, 0, 2, 230, "MSG_READ_FILE notes.txt"),
            message(g, 2, 0, 290, "MSG_FILE_CONTENT", true),
          ];
        }
        return [
          { note: true, x: 700, y: 100, label: "no heartbeat for 15 s: inactive", warn: true },
          message(g, 0, 1, 150, "MSG_READ_FILE notes.txt"),
          { note: true, x: 410, y: 200, label: "[FAILOVER] Using replica SS 2", warn: true },
          message(g, 1, 0, 240, "MSG_SS_INFO 10.0.0.6:9002", true),
          message(g, 0, 3, 300, "MSG_READ_FILE notes.txt"),
          message(g, 3, 0, 360, "MSG_FILE_CONTENT", true),
        ];
      },
    };

    var STATUS = {
      write: "A write: the name server says where the file lives, then the client writes straight to that storage server, one sentence locked.",
      read: "A read: one hop to the name server for the address, then the content comes straight from storage 1.",
      failover: "Storage 1 went quiet. After 15 seconds the name server marks it inactive and hands out the replica on storage 2 instead.",
    };

    var play = function (kind) {
      if (tl) tl.kill();
      layer.innerHTML = "";
      var parts = scenarios[kind](layer);
      status.textContent = kind === "read" && down ? STATUS.failover : STATUS[kind];

      // draw locks and notes, which aren't arrows
      parts.forEach(function (p) {
        if (p.lock) {
          var x = X[p.lane];
          p.rect = el("rect", { x: x - 8, y: p.y1, width: 16, height: p.y2 - p.y1, rx: 3, fill: "#232A52", stroke: "#7AA2FF" }, layer);
          p.text = el("text", { x: x - 20, y: (p.y1 + p.y2) / 2, "text-anchor": "end", "class": "d-muted" }, layer);
          p.text.textContent = p.label;
        } else if (p.note) {
          p.text = el("text", { x: p.x, y: p.y, "class": "d-muted" }, layer);
          if (p.warn) p.text.setAttribute("fill", "#FFC15E");
          p.text.textContent = p.label;
        }
      });

      if (!KK.motion) return;

      tl = gsap.timeline();
      parts.forEach(function (p) {
        if (p.lock) {
          tl.fromTo(p.rect, { attr: { height: 0 } }, { attr: { height: p.y2 - p.y1 }, duration: 0.5, ease: "power2.out" }, ">-0.1")
            .fromTo(p.text, { opacity: 0 }, { opacity: 1, duration: 0.25 }, "<0.1");
        } else if (p.note) {
          tl.fromTo(p.text, { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: 0.35, ease: "expo.out" }, ">0.05");
        } else {
          tl.fromTo(p.line, { strokeDashoffset: p.reply ? 0 : p.len, opacity: p.reply ? 0 : 1 }, { strokeDashoffset: 0, opacity: 1, duration: 0.45, ease: "power2.inOut" }, ">0.08")
            .fromTo(p.head, { opacity: 0 }, { opacity: 1, duration: 0.12 }, ">-0.08")
            .fromTo(p.text, { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: 0.3, ease: "expo.out" }, "<-0.15");
        }
      });
    };

    writeBtn.addEventListener("click", function () { play("write"); });
    readBtn.addEventListener("click", function () { play("read"); });
    toggle.addEventListener("click", function () {
      down = !down;
      toggle.setAttribute("aria-pressed", String(down));
      toggle.textContent = down ? "Bring storage 1 back" : "Take storage 1 down";
      lane1.classList.toggle("is-down", down);
      writeBtn.disabled = down;
      writeBtn.title = down ? "This demo shows reads while storage 1 is down" : "";
      status.textContent = down
        ? "Storage 1 is down. Read the file to see the failover. This demo shows reads only while it's down."
        : "Storage 1 is back and sending heartbeats.";
    });

    // Play the write once when the diagram first comes into view.
    if (KK.motion && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) { play("write"); io.disconnect(); }
      }, { threshold: 0.4 });
      io.observe(nfs);
    }
  }
})();
