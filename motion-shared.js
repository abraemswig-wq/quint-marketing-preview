/**
 * Quint — Geteiltes Motion-One-Setup für alle Varianten
 *
 * Motion One ist die Vanilla-JS-Schwester von Framer Motion,
 * gebaut vom selben Maintainer (Matt Perry), ~3.8 KB gzipped.
 *
 * Wir nutzen ES-Module-Import direkt aus dem CDN, kein Build-Step.
 */

import { animate, inView, stagger, spring } from "https://cdn.jsdelivr.net/npm/motion@10.18/+esm";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* =====================================
   1) HERO STAGGER REVEAL
   ===================================== */
export function heroReveal(selector = "[data-hero-reveal]", opts = {}) {
  if (reduceMotion) return;
  const els = document.querySelectorAll(selector);
  if (!els.length) return;
  animate(
    els,
    { opacity: [0, 1], y: [24, 0] },
    {
      delay: stagger(opts.stagger || 0.08, { start: opts.start || 0.2 }),
      duration: opts.duration || 0.9,
      easing: spring({ stiffness: 80, damping: 18 }),
    }
  );
}

/* =====================================
   2) SCROLL-REVEAL (Intersection-based)
   ===================================== */
export function scrollReveal(selector = "[data-scroll-reveal]") {
  if (reduceMotion) {
    document.querySelectorAll(selector).forEach((el) => (el.style.opacity = 1));
    return;
  }
  inView(
    selector,
    (info) => {
      animate(
        info.target,
        { opacity: [0, 1], y: [40, 0] },
        { duration: 0.9, easing: [0.2, 0.8, 0.2, 1] }
      );
    },
    { amount: 0.15 }
  );
}

/* =====================================
   3) MAGNETIC HOVER (für CTAs)
   ===================================== */
export function magneticHover(selector = "[data-magnet]", strength = 0.25) {
  if (reduceMotion) return;
  document.querySelectorAll(selector).forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * strength;
      const dy = (e.clientY - cy) * strength;
      animate(el, { x: dx, y: dy }, { duration: 0.4, easing: [0.2, 0.8, 0.2, 1] });
    });
    el.addEventListener("mouseleave", () => {
      animate(el, { x: 0, y: 0 }, { duration: 0.6, easing: spring({ stiffness: 120, damping: 12 }) });
    });
  });
}

/* =====================================
   4) CARD TILT (3D auf Mauspos.)
   ===================================== */
export function cardTilt(selector = "[data-tilt]", maxDeg = 6) {
  if (reduceMotion) return;
  document.querySelectorAll(selector).forEach((card) => {
    card.style.transformStyle = "preserve-3d";
    card.style.willChange = "transform";
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rx = ((y - cy) / cy) * -maxDeg;
      const ry = ((x - cx) / cx) * maxDeg;
      animate(card, { rotateX: rx, rotateY: ry }, { duration: 0.25, easing: [0.2, 0.8, 0.2, 1] });
    });
    card.addEventListener("mouseleave", () => {
      animate(card, { rotateX: 0, rotateY: 0 }, { duration: 0.5, easing: spring({ stiffness: 100, damping: 15 }) });
    });
  });
}

/* =====================================
   5) BUTTON SPRING (für Buttons & Links)
   ===================================== */
export function buttonSpring(selector = "[data-spring]") {
  if (reduceMotion) return;
  document.querySelectorAll(selector).forEach((btn) => {
    btn.addEventListener("mouseenter", () =>
      animate(btn, { scale: 1.04 }, { duration: 0.25, easing: spring({ stiffness: 200, damping: 12 }) })
    );
    btn.addEventListener("mouseleave", () =>
      animate(btn, { scale: 1 }, { duration: 0.3, easing: spring({ stiffness: 150, damping: 14 }) })
    );
  });
}

/* =====================================
   AUTO-INIT mit Defaults
   ===================================== */
export function initAll() {
  scrollReveal();
  magneticHover();
  cardTilt();
  buttonSpring();
}
