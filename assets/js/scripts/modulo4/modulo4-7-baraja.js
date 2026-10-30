/* Módulo 4-7: los operadores de comparación como una baraja.
   - "El valor de x es [−] 5 [+]" cambia x; cada carta se evalúa con ese
     valor (x <op> 2) y su reverso se actualiza.
   - Al entrar en pantalla, las cartas juntas se abren en abanico.
   - Al sacar una carta, crece y se voltea. Cuando llega, a la izquierda o a
     la derecha (al azar) sale una burbuja con lo que hace el operador, y el
     ejemplo alterna entre el valor ("1 >= 2", 6 s) y la variable ("x >= 2",
     4.2 s). Luego cae una gota mágica y desde
     donde aterriza la carta se tiñe de verde (true) o rojo (false). La
     tinta es una copia teñida del reverso que se descubre con un círculo de
     borde ondulado que crece. Al regresar la carta a la mano vuelve a su
     color. Si cambia x y cambia el resultado de la carta afuera, cae una gota
     nueva del otro color.
   - Con ← → se saca la carta anterior o siguiente; con Esc se regresa.
   - Empieza sin ninguna carta afuera. */
(function () {
  "use strict";

  var root = document.querySelector("[data-baraja]");
  if (!root) return;

  var cards = Array.prototype.slice.call(root.querySelectorAll(".baraja__card"));
  var reduce = Curso.reduce;

  // ---------- Valor de x ----------
  var N = 2; // el valor contra el que se compara en los ejemplos
  var MIN = -10;
  var MAX = 20;
  var ctl = document.querySelector("[data-baraja-x]");
  var out = ctl ? ctl.querySelector(".baraja-x__val") : null;
  var x = out ? parseInt(out.textContent, 10) : 5;
  if (isNaN(x)) x = 5;

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
    // También actualiza la copia teñida, si la hay.
    setText(card, ".baraja__ex-v", x + " " + op + " " + N);
    setText(card, ".baraja__ex-x", "x " + op + " " + N);
    setText(card, ".baraja__res", v);
    card.setAttribute(
      "aria-label",
      card.querySelector(".baraja__name").textContent + ", " + card.querySelector(".baraja__fn").textContent +
        ": " + x + " " + op + " " + N + " da " + v
    );
  }

  function setText(card, sel, text) {
    Array.prototype.forEach.call(card.querySelectorAll(sel), function (el) {
      el.textContent = text;
    });
  }

  // ---------- Tinta mágica ----------
  var DROP = { "true": "#34b865", "false": "#e0603f" };
  var SPARKS = [[-2.6, -2.2], [2.4, -2.6], [3, 0.8], [-3, 1], [0.3, -3.4]];

  // Descubre la capa teñida con un círculo de borde ondulado que crece desde
  // (px, py) hasta cubrir toda la carta.
  function reveal(layer, px, py, done) {
    var w = layer.offsetWidth;
    var h = layer.offsetHeight;
    var cx = (px / 100) * w;
    var cy = (py / 100) * h;
    var far = Math.sqrt(Math.pow(Math.max(cx, w - cx), 2) + Math.pow(Math.max(cy, h - cy), 2));
    var maxR = far * 1.3; // con la onda más chica (-23%) igual cubre la esquina más lejana
    var ph = [Math.random() * 6.3, Math.random() * 6.3, Math.random() * 6.3];
    var DUR = 1500;
    var t0 = null;
    function frame(t) {
      if (!layer.parentNode) return;
      if (t0 === null) t0 = t;
      var k = Math.min(1, (t - t0) / DUR);
      var e = 1 - Math.pow(1 - k, 3);
      var R = 2 + e * maxR;
      var pts = [];
      for (var i = 0; i < 48; i++) {
        var a = (i / 48) * Math.PI * 2;
        var wob = 1 + 0.11 * Math.sin(3 * a + ph[0] + k * 4) + 0.07 * Math.sin(5 * a + ph[1] - k * 3) + 0.05 * Math.sin(9 * a + ph[2] + k * 6);
        var r = R * wob;
        pts.push((cx + r * Math.cos(a)).toFixed(1) + "px " + (cy + r * Math.sin(a)).toFixed(1) + "px");
      }
      var clip = "polygon(" + pts.join(",") + ")";
      layer.style.webkitClipPath = clip;
      layer.style.clipPath = clip;
      if (k < 1) {
        requestAnimationFrame(frame);
      } else {
        layer.style.webkitClipPath = "";
        layer.style.clipPath = "";
        done();
      }
    }
    requestAnimationFrame(frame);
  }

  // Deja caer una gota del color del resultado y tiñe la carta desde ahí.
  function ink(card) {
    var v = String(result(card));
    var face = card.querySelector(".baraja__back");
    var px = 30 + Math.random() * 40; // % del ancho
    var py = 30 + Math.random() * 30; // % del alto
    var old = Array.prototype.slice.call(face.querySelectorAll(".baraja__dye"));

    // Copia del reverso con los colores del resultado.
    var layer = document.createElement("span");
    layer.className = "baraja__dye";
    layer.setAttribute("data-dye", v);
    layer.setAttribute("aria-hidden", "true");
    layer.appendChild(face.querySelector(".baraja__detail").cloneNode(true));

    function removeOld() {
      old.forEach(function (d) {
        if (d.parentNode) d.parentNode.removeChild(d);
      });
    }

    if (reduce) {
      face.appendChild(layer);
      removeOld();
      return;
    }

    layer.style.clipPath = "circle(0 at " + px + "% " + py + "%)";
    layer.style.webkitClipPath = layer.style.clipPath;
    face.appendChild(layer);

    var drop = document.createElement("span");
    drop.className = "baraja__drop";
    drop.setAttribute("aria-hidden", "true");
    drop.style.left = px + "%";
    drop.style.top = py + "%";
    drop.style.setProperty("--drop", DROP[v]);
    SPARKS.forEach(function (d) {
      var s = document.createElement("span");
      s.className = "baraja__spark";
      s.textContent = "✦";
      s.style.setProperty("--dx", d[0] + "em");
      s.style.setProperty("--dy", d[1] + "em");
      drop.appendChild(s);
    });
    card.appendChild(drop);
    card._inkTimers.push(setTimeout(function () {
      reveal(layer, px, py, removeOld);
    }, 400));
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
    Array.prototype.forEach.call(card.querySelectorAll(".baraja__dye"), function (d) {
      d.classList.add("is-fading");
      setTimeout(function () {
        if (d.parentNode) d.parentNode.removeChild(d);
      }, 500);
    });
  }

  // ---------- Ejemplo: valor ↔ variable ----------
  var HOLD_V = 6000; // cuánto se ve "1 >= 2"
  var HOLD_X = 4200; // cuánto se ve "x >= 2"
  var FADE = 600; // lo que tarda en cambiar (igual que en el CSS)

  // Empieza con el valor y después de `delay` + 6 s pasa a la variable.
  function cycle(card, delay) {
    clearTimeout(card._cycle);
    card.classList.remove("is-var");
    function toVar() {
      card.classList.add("is-var");
      card._cycle = setTimeout(toValue, FADE + HOLD_X);
    }
    function toValue() {
      card.classList.remove("is-var");
      card._cycle = setTimeout(toVar, FADE + HOLD_V);
    }
    card._cycle = setTimeout(toVar, delay + HOLD_V);
  }

  function stopCycle(card) {
    clearTimeout(card._cycle);
    card.classList.remove("is-var");
  }

  // ---------- Burbuja con la descripción ----------
  var bubble = document.createElement("span");
  bubble.className = "baraja__bubble";
  bubble.setAttribute("data-side", "right");
  bubble.setAttribute("aria-hidden", "true"); // la descripción ya va en el aria-label de la carta
  root.appendChild(bubble);
  var bubbleTimer = 0;

  function showBubble(card) {
    clearTimeout(bubbleTimer);
    bubble.classList.remove("is-shown");
    if (!card) return;
    bubbleTimer = setTimeout(function () {
      bubble.textContent = card.querySelector(".baraja__fn").textContent;
      bubble.setAttribute("data-side", Math.random() < 0.5 ? "left" : "right");
      bubble.classList.add("is-shown");
    }, reduce ? 0 : ARRIVE);
  }

  // ---------- Sacar y regresar cartas ----------
  var ARRIVE = 850; // la carta termina de voltearse
  var current = null;

  function open(card) {
    if (current && current !== card) {
      clearInk(current);
      stopCycle(current);
    }
    if (card !== current) showBubble(card);
    cards.forEach(function (c) {
      var on = c === card;
      c.classList.toggle("is-open", on);
      c.setAttribute("aria-pressed", on ? "true" : "false");
    });
    root.classList.toggle("has-open", !!card);
    if (card && card !== current) {
      cycle(card, reduce ? 0 : ARRIVE);
      // La gota cae cuando la carta ya terminó de voltearse.
      card._inkTimers.push(setTimeout(function () {
        ink(card);
      }, reduce ? 0 : ARRIVE));
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
      if (card !== current) return;
      // Muestra el ejemplo con el valor nuevo y vuelve a contar los 6 s.
      cycle(card, 0);
      // Si la carta abierta cambió de resultado, cae una gota del otro color.
      if (card.getAttribute("data-v") !== before) {
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
  if (reduce || typeof IntersectionObserver === "undefined") {
    root.classList.add("is-ready");
    return;
  }

  // Se reparte al entrar en pantalla: juntas → abanico. Ninguna carta sale
  // sola; se queda la mano esperando a que saquen una.
  root.classList.add("is-stacked");
  var io = new IntersectionObserver(
    function (entries) {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      root.classList.remove("is-stacked");
      setTimeout(function () {
        root.classList.add("is-ready");
      }, 800);
    },
    { threshold: 0.35 }
  );
  io.observe(root);
})();
