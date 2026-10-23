/* Krithik Kambhampati — shared behaviour for every page.
   Section entrances, the shutter, the Hyderabad clock, copy buttons.
   Nothing here hides content unless GSAP is running and about to show it. */

(function () {
  "use strict";

  var root = document.documentElement;
  var hasGsap = typeof window.gsap !== "undefined";
  if (hasGsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  window.KK = window.KK || {};
  KK.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  KK.motion = hasGsap && !KK.reduced && !!window.ScrollTrigger;

  /* ---------- Hyderabad clock ---------- */

  var clocks = document.querySelectorAll("[data-clock]");
  if (clocks.length) {
    var fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" });
    var tick = function () {
      var t = fmt.format(new Date());
      clocks.forEach(function (c) { c.textContent = t; });
    };
    tick();
    setInterval(tick, 15000);
  }

  /* ---------- copy buttons ---------- */

  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    var label = btn.querySelector("[data-copy-label]") || btn;
    var original = label.textContent;
    var timer;
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");
      var done = function (msg) {
        label.textContent = msg;
        clearTimeout(timer);
        timer = setTimeout(function () { label.textContent = original; }, 1800);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function () { done("Copied"); }, function () { done("Press Ctrl+C"); });
      } else {
        done("Press Ctrl+C");
      }
    });
  });

  /* ---------- loops: real clips play only while on screen ---------- */

  var loops = document.querySelectorAll("video[data-loop]");
  if (loops.length && !KK.reduced && "IntersectionObserver" in window) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) {
          if (v.preload === "none") { v.preload = "auto"; v.load(); }
          var p = v.play();
          if (p && p.catch) p.catch(function () {});
        } else {
          v.pause();
        }
      });
    }, { threshold: 0.25 });
    loops.forEach(function (v) { vio.observe(v); });
  }

  /* ---------- shutter: the one picture on a page that opens ---------- */

  var shutters = document.querySelectorAll(".shutter");
  if (shutters.length && !KK.reduced && "IntersectionObserver" in window) {
    root.classList.add("shutter-ready");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: "0px 0px -10% 0px" });
    shutters.forEach(function (s) { io.observe(s); });
  }

  /* ---------- section entrances ----------
     [data-reveal-group] holds parts marked [data-reveal]; they arrive in
     reading order. data-reveal="rise" (default) lifts 24px, "mask" opens
     from the bottom edge, "row" is a quicker, smaller rise for list rows. */

  if (!KK.motion) return;

  var VARIANTS = {
    rise: { from: { opacity: 0, y: 24 }, to: { opacity: 1, y: 0, duration: 0.8, ease: "expo.out" }, each: 0.08 },
    row: { from: { opacity: 0, y: 12 }, to: { opacity: 1, y: 0, duration: 0.55, ease: "expo.out" }, each: 0.05 },
    mask: { from: { clipPath: "inset(0 0 100% 0)" }, to: { clipPath: "inset(0 0 0% 0)", duration: 1.1, ease: "power3.inOut" }, each: 0.1 },
  };

  KK.reveal = function (group) {
    var parts = Array.prototype.slice.call(group.querySelectorAll("[data-reveal]"));
    if (!parts.length) return;
    parts.forEach(function (p) {
      var v = VARIANTS[p.getAttribute("data-reveal")] || VARIANTS.rise;
      gsap.set(p, v.from);
    });
    ScrollTrigger.create({
      trigger: group,
      start: "clamp(top 82%)",
      once: true,
      onEnter: function () {
        var tl = gsap.timeline();
        var at = 0;
        parts.forEach(function (p) {
          var v = VARIANTS[p.getAttribute("data-reveal")] || VARIANTS.rise;
          tl.to(p, Object.assign({ clearProps: "transform,clipPath" }, v.to), at);
          at += v.each;
        });
      },
    });
  };

  document.querySelectorAll("[data-reveal-group]").forEach(KK.reveal);

  // Fonts and images change layout after load; keep trigger positions true.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
})();
