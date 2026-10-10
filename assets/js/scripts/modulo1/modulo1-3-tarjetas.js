/* modulo1-3: tarjetas que se voltean (estilos en
   assets/css/modulos/modulo1/modulo1-3-tarjetas.css).
   Abrir: la tarjeta gira, una copia grande (.cc__open) toma su lugar y crece
   hasta cubrir el bloque mientras las demás se van hacia ella; luego aparece
   el texto. Cerrar hace lo mismo al revés y la tarjeta regresa a su frente.
   fit() mide el texto más largo y fija la altura de las tarjetas para que
   quepa abierto; así el bloque mide siempre lo mismo mientras se usa. */
(function () {
  "use strict";

  var root = document.querySelector("[data-cc]");
  if (!root) return;
  var grid = root.querySelector(".cc__grid");
  var cards = Array.prototype.slice.call(root.querySelectorAll("[data-cc-card]"));
  var open = root.querySelector("[data-cc-open]");
  var nameEl = root.querySelector("[data-cc-name]");
  var panels = Array.prototype.slice.call(root.querySelectorAll("[data-cc-panel]"));
  var closeBtn = root.querySelector("[data-cc-close]");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var T = reduce ? { flip: 0, grow: 0, fade: 0 } : { flip: 520, grow: 470, fade: 250 };
  var active = null;
  var busy = false;

  function wait(ms) { return new Promise(function (done) { setTimeout(done, ms); }); }

  // Posición de un elemento relativa al bloque
  function rectOf(el) {
    var r = el.getBoundingClientRect();
    var c = root.getBoundingClientRect();
    return { left: r.left - c.left, top: r.top - c.top, width: r.width, height: r.height };
  }

  function place(r) {
    open.style.left = r.left + "px";
    open.style.top = r.top + "px";
    open.style.width = r.width + "px";
    open.style.height = r.height + "px";
  }

  function full() { return { left: 0, top: 0, width: root.clientWidth, height: root.clientHeight }; }

  // Altura de tarjeta = la que necesita el texto más largo repartida en las filas
  function fit() {
    if (active) return;
    var tops = [];
    cards.forEach(function (c) { if (tops.indexOf(c.offsetTop) < 0) tops.push(c.offsetTop); });
    var rows = tops.length;
    open.style.visibility = "hidden";
    open.style.left = "0";
    open.style.top = "0";
    open.style.width = "100%";
    open.style.height = "auto";
    open.hidden = false;
    var need = 0;
    panels.forEach(function (p) {
      panels.forEach(function (q) { q.hidden = q !== p; });
      need = Math.max(need, open.offsetHeight);
    });
    open.hidden = true;
    open.style.visibility = "";
    open.style.height = "";
    var gap = parseFloat(window.getComputedStyle(grid).rowGap) || 0;
    var base = parseFloat(window.getComputedStyle(root).getPropertyValue("--cc-base")) || 0;
    root.style.setProperty("--cc-h", Math.max(base, Math.ceil((need - gap * (rows - 1)) / rows)) + "px");
  }

  function expand(card) {
    busy = true;
    active = card;
    var id = card.getAttribute("data-cc-card");
    var label = card.querySelector(".cc__back strong").textContent;
    card.classList.add("is-flipped");
    card.setAttribute("aria-expanded", "true");

    wait(T.flip).then(function () {
      panels.forEach(function (p) { p.hidden = p.getAttribute("data-cc-panel") !== id; });
      nameEl.textContent = label;
      open.setAttribute("aria-label", label);

      var from = rectOf(card);
      place(from);
      open.hidden = false;
      card.classList.add("is-hidden");

      var cx = from.left + from.width / 2;
      var cy = from.top + from.height / 2;
      cards.forEach(function (o) {
        if (o === card) return;
        var r = rectOf(o);
        o.style.setProperty("--cc-dx", (cx - (r.left + r.width / 2)) * 0.85 + "px");
        o.style.setProperty("--cc-dy", (cy - (r.top + r.height / 2)) * 0.85 + "px");
        o.classList.add("is-absorbed");
        o.setAttribute("tabindex", "-1");
      });

      void open.offsetWidth; // aplica la posición inicial antes de crecer
      place(full());
      return wait(T.grow);
    }).then(function () {
      open.style.width = "100%";
      open.style.height = "100%";
      open.classList.add("is-full");
      return wait(T.fade);
    }).then(function () {
      busy = false;
      closeBtn.focus({ preventScroll: true });
    });
  }

  function collapse() {
    var card = active;
    busy = true;
    open.classList.remove("is-full");

    wait(T.fade).then(function () {
      place(full());
      void open.offsetWidth;
      place(rectOf(card));
      cards.forEach(function (o) {
        o.classList.remove("is-absorbed");
        o.removeAttribute("tabindex");
      });
      return wait(T.grow);
    }).then(function () {
      open.hidden = true;
      card.classList.remove("is-hidden");
      void card.offsetWidth;
      card.classList.remove("is-flipped");
      card.setAttribute("aria-expanded", "false");
      return wait(T.flip);
    }).then(function () {
      busy = false;
      active = null;
      card.focus({ preventScroll: true });
      fit();
    });
  }

  cards.forEach(function (card) {
    card.addEventListener("click", function () {
      if (!busy && !active) expand(card);
    });
  });

  // Tocar cualquier parte de la tarjeta abierta la voltea de nuevo (menos los enlaces)
  open.addEventListener("click", function (e) {
    if (e.target.closest("a")) return;
    if (!busy && active) collapse();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !busy && active) collapse();
  });

  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(fit, 150);
  });
  window.addEventListener("load", fit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  fit();
})();
