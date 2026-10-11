/* Módulo 4-7: los operadores de comparación como una baraja.
   - "El valor de x es [−] 10 [+]" cambia x; cada carta se evalúa con ese
     valor (x <op> 2) y su reverso se actualiza.
   - Al entrar en pantalla, las cartas juntas se abren en abanico.
   - Al sacar una carta, crece y se voltea; luego cae una gota de tinta mágica
     que la tiñe de verde (true) o rojo (false) desde donde aterriza. Al
     regresarla a la mano, la tinta se desvanece. Si cambia x y cambia el
     resultado de la carta abierta, cae una gota nueva del otro color.
   - Con ← → se saca la carta anterior o siguiente; con Esc se regresa.
   - Empieza con la carta marcada con data-start afuera. */
(function () {
  "use strict";

  var root = document.querySelector("[data-baraja]");
  if (!root) return;

  var cards = Array.prototype.slice.call(root.querySelectorAll(".baraja__card"));
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var NS = "http://www.w3.org/2000/svg";

  // ---------- Valor de x ----------
  var N = 2; // el valor contra el que se compara en los ejemplos
  var MIN = -10;
  var MAX = 20;
  var ctl = document.querySelector("[data-baraja-x]");
  var out = ctl ? ctl.querySelector(".baraja-x__val") : null;
  var x = out ? parseInt(out.textContent, 10) : 10;
  if (isNaN(x)) x = 10;

  var TESTS = {
    "==": function (a, b) { return a === b; },
    "!=": function (a, b) { return a !== b; },
    "<": function (a, b) { return a < b; },
    ">": function (a, b) { return a > b; },
    "<=": function (a, b) { return a <= b; },
    ">=": function (a, b) { return a >= b; },
  };

  function result(card) {
    return TESTS[card.getAttribute("data-op")](x, N);
  }

  // Actualiza el reverso de la carta con el valor actual de x.
  function refresh(card) {
    var op = card.getAttribute("data-op");
    var v = String(result(card));
    card.setAttribute("data-v", v);
    card.querySelector(".baraja__with").textContent = "con x = " + x;
    card.querySelector(".baraja__sub").textContent = x + " " + op + " " + N;
    card.querySelector(".baraja__res").textContent = v;
    card.setAttribute("aria-label", card.querySelector(".baraja__name").textContent + ": x " + op + " " + N + " da " + v);
  }

  // ---------- Tinta mágica ----------
  // Filtro compartido: deforma el borde de la tinta como si se difundiera en agua.
  var defs = document.createElementNS(NS, "svg");
  defs.setAttribute("width", "0");
  defs.setAttribute("height", "0");
  defs.setAttribute("aria-hidden", "true");
  defs.style.position = "absolute";
  defs.innerHTML =
    '<filter id="baraja-ink" x="-30%" y="-30%" width="160%" height="160%">' +
    '<feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="7" result="ruido" />' +
    '<feDisplacementMap in="SourceGraphic" in2="ruido" scale="16" xChannelSelector="R" yChannelSelector="G" />' +
    '<feGaussianBlur stdDeviation="0.5" />' +
    "</filter>";
  document.body.appendChild(defs);

  var INK = { "true": "#6fd391", "false": "#f08f7d" };
  // Manchas que crecen desde donde cae la gota: [dx, dy, radio, escala final, retraso ms, duración ms]
  var BLOBS = [
    [0, 0, 10, 12.5, 0, 2300],
    [-9, 7, 7, 11, 150, 2100],
    [8, -8, 6, 12, 80, 2500],
    [6, 11, 5, 13, 260, 2600],
    [-7, -10, 5, 12, 200, 2200],
  ];
  var SPARKS = [[-2.6, -2.2], [2.4, -2.6], [3, 0.8], [-3, 1], [0.3, -3.4]];

  function svgEl(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  // Deja caer una gota del color del resultado y tiñe la carta desde ahí.
  function ink(card) {
    var v = String(result(card));
    var face = card.querySelector(".baraja__back");
    var px = 30 + Math.random() * 40; // % del ancho
    var py = 30 + Math.random() * 30; // % del alto
    var old = Array.prototype.slice.call(face.querySelectorAll(".baraja__tint"));

    // Todas las tintas van en una capa que se mezcla con el papel; entre ellas
    // la nueva tapa a la anterior, así el color cambia sin mezclarse.
    var layer = face.querySelector(".baraja__inks");
    if (!layer) {
      layer = document.createElement("span");
      layer.className = "baraja__inks";
      layer.setAttribute("aria-hidden", "true");
      face.appendChild(layer);
    }
    var tint = svgEl("svg", { "class": "baraja__tint", viewBox: "0 0 100 140", preserveAspectRatio: "none" });
    var g = svgEl("g", { filter: "url(#baraja-ink)", fill: INK[v] });
    var blobs = BLOBS.map(function (b) {
      var c = svgEl("circle", { cx: px + b[0], cy: py * 1.4 + b[1], r: b[2] });
      c.style.transitionDuration = reduce ? "0s" : b[5] + "ms";
      c.style.transitionDelay = reduce ? "0s" : b[4] + "ms";
      g.appendChild(c);
      return { el: c, scale: b[3] };
    });
    tint.appendChild(g);
    layer.appendChild(tint);

    function spread() {
      blobs.forEach(function (b) {
        b.el.style.transform = "scale(" + b.scale + ")";
      });
      // La tinta anterior se quita cuando la nueva ya la cubrió.
      setTimeout(function () {
        old.forEach(function (t) {
          if (t.parentNode) t.parentNode.removeChild(t);
        });
      }, reduce ? 0 : 2800);
    }

    if (reduce) {
      spread();
      return;
    }

    var drop = document.createElement("span");
    drop.className = "baraja__drop";
    drop.setAttribute("aria-hidden", "true");
    drop.style.left = px + "%";
    drop.style.top = py + "%";
    drop.style.setProperty("--drop", INK[v]);
    SPARKS.forEach(function (d) {
      var s = document.createElement("span");
      s.className = "baraja__spark";
      s.textContent = "✦";
      s.style.setProperty("--dx", d[0] + "em");
      s.style.setProperty("--dy", d[1] + "em");
      drop.appendChild(s);
    });
    card.appendChild(drop);
    void tint.getBoundingClientRect();
    card._inkTimers.push(setTimeout(spread, 400));
    card._inkTimers.push(setTimeout(function () {
      if (drop.parentNode) drop.parentNode.removeChild(drop);
    }, 1500));
  }

  // Quita la tinta: la carta vuelve a su color normal.
  function clearInk(card) {
    card._inkTimers.forEach(clearTimeout);
    card._inkTimers = [];
    Array.prototype.forEach.call(card.querySelectorAll(".baraja__drop"), function (d) {
      d.parentNode.removeChild(d);
    });
    Array.prototype.forEach.call(card.querySelectorAll(".baraja__tint"), function (t) {
      t.classList.add("is-fading");
      setTimeout(function () {
        if (t.parentNode) t.parentNode.removeChild(t);
      }, 500);
    });
  }

  // ---------- Sacar y regresar cartas ----------
  var current = null;

  function open(card) {
    if (current && current !== card) clearInk(current);
    cards.forEach(function (c) {
      var on = c === card;
      c.classList.toggle("is-open", on);
      c.setAttribute("aria-pressed", on ? "true" : "false");
    });
    root.classList.toggle("has-open", !!card);
    if (card && card !== current) {
      // La gota cae cuando la carta ya terminó de voltearse.
      card._inkTimers.push(setTimeout(function () {
        ink(card);
      }, reduce ? 0 : 850));
    }
    current = card;
  }

  cards.forEach(function (card, i) {
    card._inkTimers = [];
    card.style.setProperty("--i", i);
    refresh(card);
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

  // ---------- Botones − y + ----------
  function setX(value) {
    x = Math.max(MIN, Math.min(MAX, value));
    out.textContent = x;
    out.classList.remove("is-bump");
    void out.offsetWidth;
    out.classList.add("is-bump");
    ctl.querySelector('[data-step="-1"]').disabled = x <= MIN;
    ctl.querySelector('[data-step="1"]').disabled = x >= MAX;
    cards.forEach(function (card) {
      var before = card.getAttribute("data-v");
      refresh(card);
      // Si la carta abierta cambió de resultado, cae una gota del otro color.
      if (card === current && card.getAttribute("data-v") !== before) {
        card._inkTimers.forEach(clearTimeout);
        card._inkTimers = [];
        ink(card);
      }
    });
  }

  if (ctl && out) {
    Array.prototype.forEach.call(ctl.querySelectorAll("[data-step]"), function (btn) {
      btn.addEventListener("click", function () {
        setX(x + parseInt(btn.getAttribute("data-step"), 10));
      });
    });
  }

  // ---------- Reparto inicial ----------
  var first = root.querySelector(".baraja__card[data-start]") || cards[0];

  if (reduce || typeof IntersectionObserver === "undefined") {
    root.classList.add("is-ready");
    open(first);
    return;
  }

  // Se reparte al entrar en pantalla: juntas → abanico → sale la primera.
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
