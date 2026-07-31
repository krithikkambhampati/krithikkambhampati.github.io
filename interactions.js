/* ============================================================
   Krithik Kambhampati — site interactions
   SPA-style content router (fetch + swap, no reload) · lit-square
   cursor trail · card tilt +
   spotlight · scroll reveal · count-up stats · konami egg
   ============================================================ */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;

  /* ============================================================
     ROUTER — fetches the target page, swaps #app in place, and
     updates the URL via the History API. Nothing ever hard-navigates
     for internal links, so the dark transition never breaks into a
     different-looking page load. Every route still exists as a real
     static file, so direct loads / refreshes / shared links work
     exactly as before.
     ============================================================ */

  function fetchPage(href) {
    var abs = new URL(href, window.location.href).href;
    return fetch(abs).then(function (res) {
      if (!res.ok) throw new Error("bad response");
      return res.text();
    }).then(function (html) {
      var doc = new DOMParser().parseFromString(html, "text/html");
      var app = doc.getElementById("app");
      return {
        html: app ? app.innerHTML : doc.body.innerHTML,
        title: doc.title,
        url: abs
      };
    });
  }

  function applySwap(html, title) {
    var app = document.getElementById("app");
    if (!app) return;
    app.innerHTML = html;
    document.title = title;
    window.scrollTo(0, 0);
    initDynamic();
  }

  function wipeNavigate(href, scrollToId, doPush) {
    if (doPush === undefined) doPush = true;
    var overlay = document.createElement("div");
    overlay.className = "page-transition";
    overlay.innerHTML = '<div class="page-transition-mark">loading —</div>';
    document.body.appendChild(overlay);
    requestAnimationFrame(function () {
      overlay.classList.add("active");
    });

    fetchPage(href)
      .then(function (data) {
        setTimeout(function () {
          applySwap(data.html, data.title);
          if (doPush) history.pushState({ spa: true }, data.title, data.url);
          overlay.classList.remove("active");
          setTimeout(function () { overlay.remove(); }, 340);
          if (scrollToId) {
            setTimeout(function () {
              var el = document.getElementById(scrollToId);
              if (el) el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
            }, 120);
          }
        }, reduceMotion ? 0 : 240);
      })
      .catch(function () {
        window.location.href = href;
      });
  }

  function getProjectDetail(href) {
    return fetch(href).then(function (res) {
      if (!res.ok) throw new Error("bad response");
      return res.text();
    }).then(function (html) {
      var doc = new DOMParser().parseFromString(html, "text/html");
      var hero = doc.querySelector(".detail-hero");
      var body = doc.querySelector(".detail-body");
      if (!hero || !body) throw new Error("missing detail content");

      var back = hero.querySelector(".back-link");
      if (back) back.remove();

      return {
        title: doc.querySelector(".detail-title") ? doc.querySelector(".detail-title").textContent.trim() : "Project",
        hero: hero.innerHTML,
        body: body.innerHTML
      };
    });
  }

  function fillProjectOverlay(overlay, detail) {
    overlay.innerHTML =
      '<button class="project-close" type="button" aria-label="Close project details">×</button>' +
      '<div class="project-inspector-hero">' + detail.hero + '</div>' +
      '<div class="project-inspector-body">' + detail.body + '</div>';
    overlay.classList.add("has-detail");
    overlay.querySelector(".project-close").addEventListener("click", closeProjectOverlay);
    initDynamic();
  }

  function closeProjectOverlay() {
    var overlay = document.querySelector(".card-expand-clone.has-detail");
    if (!overlay) return;
    document.body.classList.remove("project-detail-open");
    overlay.classList.add("closing");
    setTimeout(function () { overlay.remove(); }, reduceMotion ? 0 : 360);
  }

  function expandCardNavigate(card, href) {
    var fetchPromise = getProjectDetail(href);

    if (reduceMotion) {
      fetchPromise
        .then(function (detail) {
          var overlay = document.createElement("div");
          overlay.className = "card-expand-clone lit has-detail";
          document.body.appendChild(overlay);
          document.body.classList.add("project-detail-open");
          fillProjectOverlay(overlay, detail);
        })
        .catch(function () { window.location.href = href; });
      return;
    }

    var rect = card.getBoundingClientRect();
    var name = card.querySelector(".proj-name");
    var clone = document.createElement("div");
    clone.className = "card-expand-clone";
    clone.style.top = rect.top + "px";
    clone.style.left = rect.left + "px";
    clone.style.width = rect.width + "px";
    clone.style.height = rect.height + "px";

    var mark = document.createElement("div");
    mark.className = "card-expand-mark";
    mark.textContent = "opening — " + (name ? name.textContent : "project");
    clone.appendChild(mark);

    document.body.appendChild(clone);
    document.body.classList.add("card-expanding");

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        clone.style.top = "0px";
        clone.style.left = "0px";
        clone.style.width = "100vw";
        clone.style.height = "100vh";
        clone.classList.add("lit");
      });
    });

    var minDelay = new Promise(function (res) { setTimeout(res, 560); });

    Promise.all([fetchPromise, minDelay])
      .then(function (results) {
        var detail = results[0];
        document.body.classList.remove("card-expanding");
        document.body.classList.add("project-detail-open");
        fillProjectOverlay(clone, detail);
      })
      .catch(function () {
        window.location.href = href;
      });
  }

  function initRouter() {
    history.replaceState({ spa: true }, document.title, window.location.href);

    document.addEventListener("click", function (e) {
      if (e.defaultPrevented) return;
      var a = e.target.closest("a[href]");
      if (!a) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

      var href = a.getAttribute("href");
      if (!href) return;
      if (href.indexOf("mailto:") === 0) return;
      if (a.target === "_blank") return;

      if (href.indexOf("#") === 0) {
        var id = href.slice(1);
        if (id && !document.getElementById(id)) {
          // section lives on the home page, which isn't currently loaded
          e.preventDefault();
          var brand = document.querySelector(".brand");
          var home = brand ? brand.getAttribute("href") : "index.html";
          wipeNavigate(home, id);
        }
        return; // otherwise let the browser do its native smooth scroll
      }

      // ignore external / non-relative links
      if (/^([a-z]+:)?\/\//i.test(href)) return;

      e.preventDefault();
      if (a.classList.contains("proj-card")) {
        expandCardNavigate(a, href);
      } else {
        wipeNavigate(href);
      }
    });

    window.addEventListener("popstate", function () {
      wipeNavigate(window.location.href, null, false);
    });
  }

  /* ============================================================
     CURSOR CANVAS: the cursor lights up grid squares in the same
     coordinate system as the page background.
     ============================================================ */

  var igniteGridCell = null;
  var readGridCell = null;
  var addGridBurst = null;
  var navSpyStarted = false;

  function gridTrail() {
    if (isTouch || reduceMotion) return;

    var canvas = document.createElement("canvas");
    canvas.className = "grid-trail-canvas";
    document.body.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var GRID = 32;
    var cells = new Map();
    var bursts = [];
    var gridOffsetX = 0;
    var gridOffsetY = 0;

    function backgroundGridOffset(size) {
      /* mirrors CSS `background-position: center top` on a GRID x GRID tile:
         center => offset = (containerSize - GRID) / 2 = size/2 - GRID/2 */
      return (((size - GRID) / 2) % GRID + GRID) % GRID;
    }

    function resize() {
      canvas.width = window.innerWidth * DPR;
      canvas.height = window.innerHeight * DPR;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      gridOffsetX = backgroundGridOffset(window.innerWidth);
      gridOffsetY = 0;
    }
    resize();
    window.addEventListener("resize", resize);

    igniteGridCell = function (px, py, color, intensity) {
      var cx = Math.floor((px - gridOffsetX) / GRID);
      var cy = Math.floor((py - gridOffsetY) / GRID);
      var key = cx + "," + cy;
      var existing = cells.get(key);
      cells.set(key, {
        cx: cx,
        cy: cy,
        alpha: existing ? Math.min(1, existing.alpha + intensity * 0.6) : intensity,
        color: color
      });
    };

    readGridCell = function (px, py) {
      var cx = Math.floor((px - gridOffsetX) / GRID);
      var cy = Math.floor((py - gridOffsetY) / GRID);
      return cells.get(cx + "," + cy);
    };

    addGridBurst = function (px, py) {
      bursts.push({ x: px, y: py, life: 1 });
    };

    window.addEventListener(
      "mousemove",
      function (e) {
        igniteGridCell(e.clientX, e.clientY, "94,230,168", 0.9);
      },
      { passive: true }
    );

    function tick() {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      cells.forEach(function (cell, key) {
        if (cell.alpha <= 0.02) {
          cells.delete(key);
          return;
        }
        var x = gridOffsetX + cell.cx * GRID;
        var y = gridOffsetY + cell.cy * GRID;
        ctx.fillStyle = "rgba(" + cell.color + "," + (cell.alpha * 0.34).toFixed(3) + ")";
        ctx.fillRect(x + 1, y + 1, GRID - 1, GRID - 1);
        ctx.strokeStyle = "rgba(" + cell.color + "," + (cell.alpha * 0.9).toFixed(3) + ")";
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, GRID, GRID);
        cell.alpha *= 0.92;
      });
      bursts.forEach(function (burst, i) {
        var radius = (1 - burst.life) * 44 + 6;
        ctx.strokeStyle = "rgba(94,230,168," + burst.life.toFixed(3) + ")";
        ctx.fillStyle = "rgba(94,230,168," + (burst.life * 0.18).toFixed(3) + ")";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(burst.x, burst.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.rect(burst.x - radius * 0.55, burst.y - radius * 0.55, radius * 1.1, radius * 1.1);
        ctx.stroke();
        burst.life *= 0.84;
        if (burst.life < 0.04) bursts.splice(i, 1);
      });
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function pageCircuit() {
    if (isTouch || reduceMotion) return;

    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    var dots = [0, 0.2, 0.4, 0.6, 0.8].map(function (offset) {
      var dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      dot.classList.add("page-circuit-dot");
      dot.setAttribute("r", "3.4");
      dot.dataset.offset = offset;
      return dot;
    });

    svg.classList.add("page-circuit");
    path.classList.add("page-circuit-path");
    svg.appendChild(path);
    dots.forEach(function (dot) { svg.appendChild(dot); });
    document.body.appendChild(svg);

    function setPath() {
      var w = window.innerWidth;
      var h = Math.max(document.documentElement.scrollHeight, window.innerHeight);
      /* hug close to the page edges so the trace reads as a border that
         wraps the whole page, with small inward kinks for circuit character
         rather than a shape confined to the middle of the viewport */
      var edge = Math.max(14, Math.min(34, w * 0.018));
      var kink = Math.max(20, Math.min(48, w * 0.03));
      var midKinks = Math.max(3, Math.round(h / 900)); // more kinks down long pages

      var d = ["M", edge, edge + kink];
      d.push("L", edge, edge, "L", w * 0.16, edge);
      d.push("L", w * 0.16 + kink, edge + kink, "L", w * 0.6, edge + kink);
      d.push("L", w * 0.6 + kink, edge, "L", w - edge, edge);
      d.push("L", w - edge, edge + kink * 1.4);

      // right edge, descending, with periodic inward kinks
      for (var i = 1; i <= midKinks; i++) {
        var y = edge + kink * 1.4 + ((h - edge * 2 - kink * 2.8) * i) / (midKinks + 1);
        var dir = i % 2 === 0 ? 1 : -1;
        d.push("L", w - edge, y - kink * 0.5);
        d.push("L", w - edge - kink * dir, y);
        d.push("L", w - edge, y + kink * 0.5);
      }
      d.push("L", w - edge, h - edge - kink);

      d.push("L", w - edge, h - edge, "L", w * 0.5, h - edge);
      d.push("L", w * 0.5 - kink, h - edge - kink, "L", w * 0.2, h - edge - kink);
      d.push("L", w * 0.2 - kink, h - edge, "L", edge, h - edge);
      d.push("L", edge, h - edge - kink * 1.4);

      // left edge, ascending back to start
      for (var j = midKinks; j >= 1; j--) {
        var y2 = edge + kink * 1.4 + ((h - edge * 2 - kink * 2.8) * j) / (midKinks + 1);
        var dir2 = j % 2 === 0 ? -1 : 1;
        d.push("L", edge, y2 + kink * 0.5);
        d.push("L", edge + kink * dir2, y2);
        d.push("L", edge, y2 - kink * 0.5);
      }
      d.push("L", edge, edge + kink, "Z");

      svg.setAttribute("viewBox", "0 0 " + w + " " + h);
      svg.style.height = h + "px";
      path.setAttribute("d", d.join(" "));
      path.dataset.length = path.getTotalLength();
    }

    setPath();
    window.addEventListener("resize", setPath);

    function tick() {
      if (readGridCell && addGridBurst) {
        var length = Number(path.dataset.length) || path.getTotalLength();
        var now = performance.now();
        dots.forEach(function (dot) {
          var t = ((now / 18000) + Number(dot.dataset.offset || 0)) % 1;
          var p = path.getPointAtLength(t * length);
          dot.setAttribute("cx", p.x);
          dot.setAttribute("cy", p.y);
          var x = p.x;
          var y = p.y - window.scrollY;
          var cell = readGridCell(x, y);
          if (cell && cell.alpha > 0.2 && !dot.classList.contains("is-bursting") && !dot.classList.contains("is-cooldown")) {
            addGridBurst(x, y);
            dot.classList.add("is-bursting");
            setTimeout(function () {
              dot.classList.remove("is-bursting");
              dot.classList.add("is-cooldown");
              setTimeout(function () {
                dot.classList.remove("is-cooldown");
              }, 900 + Math.random() * 700);
            }, 420);
          }
        });
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* disable SMIL motion for reduced-motion users (CSS can't reach into SVG <animateMotion>) */
  function pulseMotionGuard() {
    if (!reduceMotion) return;
    document.querySelectorAll(".pulse-track animateMotion").forEach(function (el) {
      el.setAttribute("dur", "999999s");
    });
  }

  /* ---------- ambient background orbs (created once, persist across swaps) ---------- */
  function bgOrbs() {
    if (reduceMotion) return;
    var o1 = document.createElement("div");
    o1.className = "bg-orb bg-orb-1";
    var o2 = document.createElement("div");
    o2.className = "bg-orb bg-orb-2";
    document.body.appendChild(o1);
    document.body.appendChild(o2);
  }

  /* ---------- scroll progress bar (created once) ---------- */
  function scrollProgress() {
    var bar = document.createElement("div");
    bar.className = "scroll-progress";
    var topbar = document.querySelector(".topbar");
    if (topbar) topbar.appendChild(bar);
    function update() {
      var h = document.documentElement;
      var scrolled = h.scrollTop;
      var max = h.scrollHeight - h.clientHeight;
      var pct = max > 0 ? (scrolled / max) * 100 : 0;
      bar.style.width = pct + "%";
    }
    document.addEventListener("scroll", update, { passive: true });
    update();
  }

  /* ---------- top navigation state ---------- */
  function navSpy() {
    function update() {
      var links = Array.prototype.slice.call(document.querySelectorAll(".topnav a[href^='#']"));
      if (!links.length) return;
      var sections = links.map(function (link) {
        return { link: link, el: document.getElementById(link.getAttribute("href").slice(1)) };
      }).filter(function (item) { return item.el; });
      if (!sections.length) return;
      var current = sections[0];
      sections.forEach(function (item) {
        if (item.el.getBoundingClientRect().top <= 120) current = item;
      });
      links.forEach(function (link) { link.classList.remove("is-active"); });
      if (current) current.link.classList.add("is-active");
    }

    if (!navSpyStarted) {
      document.addEventListener("scroll", update, { passive: true });
      navSpyStarted = true;
    }
    update();
  }

  /* ---------- count-up numbers, starting at zero, animating in on view ---------- */
  function countUp() {
    var nums = document.querySelectorAll(".metric .num");
    if (!nums.length) return;
    var seen = new WeakSet();

    function parseTarget(text) {
      var m = text.match(/^([\D]*)([\d.,]+)(.*)$/);
      if (!m) return null;
      return { prefix: m[1], value: parseFloat(m[2].replace(/,/g, "")), decimals: (m[2].split(".")[1] || "").length, suffix: m[3] };
    }

    nums.forEach(function (el) {
      var parsed = parseTarget(el.textContent.trim());
      if (!parsed) return;
      el.dataset.parsed = JSON.stringify(parsed);
      if (!reduceMotion) {
        el.textContent = parsed.prefix + (0).toFixed(parsed.decimals) + parsed.suffix;
      }
    });

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting || seen.has(entry.target)) return;
          var el = entry.target;
          var parsed = el.dataset.parsed ? JSON.parse(el.dataset.parsed) : parseTarget(el.textContent.trim());
          if (!parsed || reduceMotion) return;
          seen.add(el);
          var start = performance.now();
          var dur = 1000;
          function frame(now) {
            var t = Math.min(1, (now - start) / dur);
            var eased = 1 - Math.pow(1 - t, 3);
            var current = parsed.value * eased;
            el.textContent = parsed.prefix + current.toFixed(parsed.decimals) + parsed.suffix;
            if (t < 1) requestAnimationFrame(frame);
            else el.textContent = parsed.prefix + parsed.value.toFixed(parsed.decimals) + parsed.suffix;
          }
          requestAnimationFrame(frame);
        });
      },
      { threshold: 0.35 }
    );
    nums.forEach(function (el) { io.observe(el); });
  }

  /* ---------- scroll reveal ---------- */
  function scrollReveal() {
    var targets = document.querySelectorAll(
      ".exp-item, .proj-card, .skill-card, .chip, .detail-body h2, .detail-body ul, .detail-body p, .project-inspector-body h2, .project-inspector-body ul, .project-inspector-body p, .metric-strip"
    );
    if (!targets.length) return;
    targets.forEach(function (el, i) {
      el.classList.add("reveal");
      el.style.transitionDelay = reduceMotion ? "0s" : Math.min(i % 8, 7) * 0.05 + "s";
    });
    if (reduceMotion) {
      targets.forEach(function (el) { el.classList.add("reveal-in"); });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    targets.forEach(function (el) { io.observe(el); });
  }

  /* ---------- card tilt + per-card cursor spotlight ---------- */
  function cardTilt() {
    if (isTouch || reduceMotion) return;
    var cards = document.querySelectorAll(".proj-card");
    cards.forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          "perspective(700px) rotateX(" + (-y * 5) + "deg) rotateY(" + (x * 5) + "deg) translateY(-6px) translateZ(0)";
        card.style.setProperty("--px", (e.clientX - r.left) + "px");
        card.style.setProperty("--py", (e.clientY - r.top) + "px");
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });
  }

  /* ---------- magnetic buttons ---------- */
  function magneticButtons() {
    if (isTouch || reduceMotion) return;
    var btns = document.querySelectorAll(".btn");
    btns.forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        btn.style.transform = "translate(" + x * 0.22 + "px," + y * 0.22 + "px)";
      });
      btn.addEventListener("mouseleave", function () {
        btn.style.transform = "";
      });
    });
  }

  /* ---------- ambient cursor glow (created once) ---------- */
  function cursorGlow() {
    if (isTouch || reduceMotion) return;
    var glow = document.createElement("div");
    glow.className = "cursor-glow";
    document.body.appendChild(glow);
    var raf = null;
    window.addEventListener(
      "mousemove",
      function (e) {
        if (raf) return;
        raf = requestAnimationFrame(function () {
          glow.style.transform = "translate(" + e.clientX + "px," + e.clientY + "px)";
          raf = null;
        });
      },
      { passive: true }
    );
  }

  /* ---------- konami easter egg (created once) ---------- */
  function konami() {
    var seq = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    var pos = 0;
    document.addEventListener("keydown", function (e) {
      pos = e.key === seq[pos] ? pos + 1 : e.key === seq[0] ? 1 : 0;
      if (pos === seq.length) {
        pos = 0;
        document.body.classList.add("egg-active");
        var banner = document.createElement("div");
        banner.className = "egg-banner";
        banner.textContent = "root access granted";
        document.body.appendChild(banner);
        setTimeout(function () {
          banner.remove();
          document.body.classList.remove("egg-active");
        }, 3200);
      }
    });
  }

  /* ---------- behaviors that must re-run every time #app content is swapped ---------- */
  function initDynamic() {
    scrollReveal();
    countUp();
    cardTilt();
    magneticButtons();
    pulseMotionGuard();
    navSpy();
  }

  /* ---------- behaviors that only ever run once, on true page load ---------- */
  function initOnce() {
    bgOrbs();
    initRouter();
    scrollProgress();
    gridTrail();
    pageCircuit();
    cursorGlow();
    konami();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initOnce();
    initDynamic();
  });
})();
