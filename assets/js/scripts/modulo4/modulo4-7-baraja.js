/* Módulo 4-7: los operadores de comparación como una baraja.
   - Al entrar en pantalla, las cartas juntas se abren en abanico.
   - Al elegir una carta sale de la mano y se voltea; al elegirla de nuevo
     regresa. Solo puede haber una abierta.
   - Con ← → se abre la carta anterior o siguiente; con Esc se regresa.
   - Empieza con la carta marcada con data-start abierta. */
(function () {
  "use strict";

  var root = document.querySelector("[data-baraja]");
  if (!root) return;

  var cards = Array.prototype.slice.call(root.querySelectorAll(".baraja__card"));
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function open(card) {
    cards.forEach(function (c) {
      var on = c === card;
      c.classList.toggle("is-open", on);
      c.setAttribute("aria-pressed", on ? "true" : "false");
    });
    root.classList.toggle("has-open", !!card);
  }

  cards.forEach(function (card, i) {
    card.style.setProperty("--i", i);
    card.addEventListener("click", function () {
      open(card.classList.contains("is-open") ? null : card);
    });
    card.addEventListener("keydown", function (e) {
      var to = null;
      if (e.key === "ArrowRight") to = cards[(i + 1) % cards.length];
      else if (e.key === "ArrowLeft") to = cards[(i - 1 + cards.length) % cards.length];
      else if (e.key === "Escape") {
        open(null);
        return;
      }
      if (!to) return;
      e.preventDefault();
      to.focus();
      open(to);
    });
  });

  var first = root.querySelector(".baraja__card[data-start]") || cards[0];

  if (reduce || typeof IntersectionObserver === "undefined") {
    root.classList.add("is-ready");
    open(first);
    return;
  }

  // Se reparte al entrar en pantalla: juntas → abanico → se abre la primera.
  root.classList.add("is-stacked");
  var io = new IntersectionObserver(
    function (entries) {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      root.classList.remove("is-stacked");
      setTimeout(function () {
        root.classList.add("is-ready");
        open(first);
      }, 800);
    },
    { threshold: 0.35 }
  );
  io.observe(root);
})();
