/* Home page: the hero intro, the live request capture, work filters,
   the contact composer and the drifting contact strip. */

(function () {
  "use strict";

  var root = document.documentElement;
  var KK = window.KK || {};

  /* ======================================================================
     Live capture: the visitor's own request for this page, decoded layer
     by layer from the Navigation Timing API (real numbers, every visit).
     "Capture again" refetches the page and decodes that request instead.
     ====================================================================== */


  function ms(v) {
    if (v == null || isNaN(v)) return "n/a";
    if (v < 0.05) return "0 ms";
    return (v < 10 ? v.toFixed(1) : Math.round(v)) + " ms";
  }
  function kb(bytes) {
    if (!bytes) return null;
    return bytes < 1024 ? bytes + " B" : (bytes / 1024).toFixed(1) + " kB";
  }

  // Turn a PerformanceNavigationTiming or PerformanceResourceTiming entry
  // into the layers the capture shows.
  function decode(e, isNav) {
    var host = location.host || "local file";
    var path = location.pathname || "/";
    var dns = e.domainLookupEnd - e.domainLookupStart;
    var tcp = e.connectEnd - e.connectStart;
    var tls = e.secureConnectionStart > 0 ? e.connectEnd - e.secureConnectionStart : 0;
    var wait = e.responseStart - e.requestStart;
    var body = e.responseEnd - e.responseStart;
    var proto = e.nextHopProtocol || "http";
    var bytes = kb(e.transferSize) || kb(e.encodedBodySize);
    var reused = tcp < 0.05 && dns < 0.05;
    var cached = e.transferSize === 0 && e.decodedBodySize > 0;
    var status = e.responseStatus || null;

    var layers = [
      { k: "DNS", v: dns, text: reused ? "already resolved" : host, tone: "blue" },
      { k: "TCP", v: tcp - tls, text: reused ? "connection reused" : "handshake", tone: "violet" },
      { k: "TLS", v: tls, text: tls ? "handshake" : (location.protocol === "https:" ? "session reused" : "plain http, none"), tone: "teal" },
      { k: "HTTP", v: wait, text: "GET " + path + (status ? " " + status : "") + ", " + proto, tone: "amber" },
      { k: "Body", v: body, text: cached ? "from cache" : (bytes ? bytes : "received"), tone: "coral" },
    ];
    if (isNav) {
      layers.push({ k: "DOM", v: e.domContentLoadedEventEnd - e.responseEnd, text: "page parsed", tone: "rose" });
    }
    var total = (isNav ? e.domContentLoadedEventEnd : e.responseEnd) - e.startTime;
    return { layers: layers, total: total, proto: proto, bytes: bytes };
  }

  function render(cap, d, label) {
    var list = cap.querySelector("[data-capture-rows]");
    var max = Math.max.apply(null, d.layers.map(function (l) { return Math.max(l.v, 0); }).concat([1]));
    list.innerHTML = d.layers.map(function (l) {
      var w = Math.max(2, Math.round((Math.max(l.v, 0) / max) * 100));
      return '<li class="cap-row tone-' + l.tone + '">' +
        '<span class="cap-k">' + l.k + "</span>" +
        '<span class="cap-text">' + l.text.replace(/</g, "&lt;") + "</span>" +
        '<span class="cap-v">' + ms(l.v) + "</span>" +
        '<span class="cap-bar" style="--w:' + w + '%"></span>' +
        "</li>";
    }).join("");
    cap.querySelector("[data-capture-title]").textContent = label;
    cap.querySelector("[data-capture-total]").textContent = ms(d.total) + " total";

    if (KK.motion) {
      gsap.fromTo(list.children, { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.4, stagger: 0.06, ease: "expo.out" });
      gsap.fromTo(list.querySelectorAll(".cap-bar"), { scaleX: 0 }, { scaleX: 1, duration: 0.7, stagger: 0.06, ease: "expo.out", delay: 0.1 });
    }
  }

  function firstCapture(cap) {
    var nav = performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
    if (!nav || !nav.responseEnd) return false;
    if (!nav.domContentLoadedEventEnd) {
      // still parsing: try again when the DOM is ready
      return false;
    }
    render(cap, decode(nav, true), "Frame 1: your request for this page");
    cap.classList.add("is-live");
    return true;
  }

  function captureAgain(cap, btn) {
    var url = location.href.split("#")[0];
    var stamp = url + (url.indexOf("?") === -1 ? "?" : "&") + "capture=" + Date.now();
    btn.disabled = true;
    btn.setAttribute("aria-busy", "true");
    fetch(stamp, { cache: "no-store" })
      .then(function (r) { return r.text(); })
      .then(function () {
        var entries = performance.getEntriesByName(stamp);
        var e = entries[entries.length - 1];
        if (!e) throw new Error("no timing entry");
        cap._count = (cap._count || 1) + 1;
        render(cap, decode(e, false), "Frame " + cap._count + ": the same page, fetched again");
      })
      .catch(function () {
        cap.querySelector("[data-capture-title]").textContent = "Couldn't refetch the page. Check your connection and try again.";
      })
      .then(function () {
        btn.disabled = false;
        btn.removeAttribute("aria-busy");
      });
  }

  if (window.performance && performance.getEntriesByType) {
    document.querySelectorAll("[data-capture]").forEach(function (cap) {
      var tries = 0;
      var attempt = function () {
        if (firstCapture(cap) || ++tries > 20) return;
        setTimeout(attempt, 100);
      };
      if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(attempt, 0); });
      else setTimeout(attempt, 0);
      var again = cap.querySelector("[data-capture-again]");
      if (again) again.addEventListener("click", function () { captureAgain(cap, again); });
    });
  }

  /* ======================================================================
     Hero intro: the sheet's columns rise into their offsets, the panel's
     name lifts out of its mask. Plays once; reduced motion skips it.
     ====================================================================== */

  function intro() {
    root.classList.remove("intro-pending");
    if (!KK.motion) return;
    var tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    tl.from(".sheet-col", { yPercent: 8, opacity: 0, duration: 1.2, stagger: { each: 0.07, from: "center" } }, 0)
      .from(".hero-panel", { opacity: 0, y: 24, duration: 0.9 }, 0.15)
      .from(".hero-name .line > span", { yPercent: 110, duration: 1, stagger: 0.08 }, 0.25)
      .from(".hero-panel [data-intro]", { opacity: 0, y: 14, duration: 0.7, stagger: 0.07 }, 0.55);
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(intro);
  else intro();

  /* ======================================================================
     Work filters: show one discipline at a time.
     ====================================================================== */

  var filters = document.querySelectorAll("[data-filter]");
  var strips = document.querySelectorAll("[data-strip]");
  filters.forEach(function (f) {
    f.addEventListener("click", function () {
      var want = f.getAttribute("data-filter");
      filters.forEach(function (o) { o.setAttribute("aria-pressed", String(o === f)); });
      var shown = [];
      strips.forEach(function (s) {
        var on = want === "all" || s.getAttribute("data-kind").split(" ").indexOf(want) !== -1;
        s.hidden = !on;
        if (on) shown.push(s);
      });
      if (KK.motion) {
        gsap.fromTo(shown, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.04, ease: "expo.out", overwrite: true, clearProps: "transform" });
        ScrollTrigger.refresh();
      }
    });
  });

  /* ======================================================================
     Strip entrances: each project's frames open left to right, once.
     ====================================================================== */

  if (KK.motion) {
    strips.forEach(function (s) {
      var frames = s.querySelectorAll(".strip-frames > *");
      gsap.set(frames, { clipPath: "inset(0 100% 0 0)" });
      ScrollTrigger.create({
        trigger: s,
        start: "clamp(top 88%)",
        once: true,
        onEnter: function () {
          gsap.to(frames, { clipPath: "inset(0 0% 0 0)", duration: 0.9, stagger: 0.07, ease: "power3.inOut", clearProps: "clipPath" });
        },
      });
    });
  }

  /* ======================================================================
     Contact strip: drifts with the scroll, never on its own.
     ====================================================================== */

  var drift = document.querySelector("[data-drift]");
  if (drift && KK.motion) {
    gsap.fromTo(drift, { xPercent: 0 }, {
      xPercent: -18,
      ease: "none",
      scrollTrigger: { trigger: drift, start: "top bottom", end: "bottom top", scrub: 0.6 },
    });
  }

  /* ======================================================================
     Contact composer: no backend, so it writes the email for you.
     ====================================================================== */

  var form = document.querySelector("[data-compose]");
  if (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var name = form.elements.name.value.trim();
      var topic = form.elements.topic.value.trim();
      var subject = topic ? topic : "Hello from your site";
      var body = "Hi Krithik,\n\n" + (topic ? topic + "\n\n" : "") + (name ? "— " + name : "");
      location.href = "mailto:" + form.getAttribute("data-to") + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    });
  }
})();
