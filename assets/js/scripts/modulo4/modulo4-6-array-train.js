/* modulo4-6: el arreglo como un tren (estilos en
   assets/css/modulos/modulo4/modulo4-6-array-train.css).
   Cada vagón es un elemento y el número bajo la vía es su índice. Los botones
   aplican un método: los vagones entran, salen o se recorren, la terminal
   muestra el código con su resultado y debajo se explica el método.
   El tren conserva su estado entre clics; "Reiniciar" lo regresa al inicio. */
(function () {
  "use strict";

  var root = document.querySelector("[data-arr-train]");
  if (!root) return;
  root.classList.add("arr-train--ready");
  var line = root.querySelector("[data-line]");
  var buttons = root.querySelector("[data-buttons]");
  var termCode = root.querySelector("[data-term-code]");
  var termOut = root.querySelector("[data-term-out]");
  var infoEl = root.querySelector("[data-info]");
  var photo = root.querySelector("[data-photo]");
  var photoRow = root.querySelector("[data-photo-row]");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var uid = 0;
  function item(v) { uid += 1; return { id: "w" + uid, v: v }; }
  function show(v) { return typeof v === "string" ? '"' + v + '"' : String(v); }
  function fmt(r) { return Array.isArray(r) ? "[" + r.map(show).join(", ") + "]" : String(r); }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }

  // Colores: strings en azul claro, números en ámbar
  function palette(v) {
    return typeof v === "number"
      ? { bg: "#faeeda", st: "#b07818", tx: "#412402", roof: "#e8c98e" }
      : { bg: "#e6f1fb", st: "#3b6fb6", tx: "#042c53", roof: "#b5d4f4" };
  }

  // Íconos de los botones (flechas que indican por dónde entra o sale)
  var ICON = {
    out: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 8h9M9 4l4 4-4 4"/></svg>',
    in: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M13 8H4M7 4L3 8l4 4"/></svg>',
    up: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8 13V4M4 7l4-4 4 4"/></svg>',
    down: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8 3v9M4 9l4 4 4-4"/></svg>',
    swap: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 3v10M12 3v10M4 8h8"/></svg>',
    photo: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="12" height="9" rx="2"/><circle cx="8" cy="8.5" r="2.2"/><path d="M6 4l1-2h2l1 2"/></svg>',
    count: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 4h10M3 8h10M3 12h6"/></svg>',
  };

  var START = ["Hola", "Mundo", 7];

  // Cada método: args visibles, ícono, por dónde salen/entran los vagones y explicación
  var METHODS = [
    { name: "length", args: "", icon: "count", info: "<code>.length</code> no mueve el tren: cuenta los vagones. Es una propiedad, por eso no lleva paréntesis.",
      run: function (a) { return { a: a, r: a.length, count: true }; } },
    { name: "push", args: '("nuevo")', icon: "in", enter: "in-right", info: "<code>.push()</code> engancha un vagón al final y regresa cuántos vagones hay ahora.",
      run: function (a) { return { a: a.concat([item("nuevo")]), r: a.length + 1 }; } },
    { name: "pop", args: "()", icon: "out", leave: "out-right", info: "<code>.pop()</code> suelta el último vagón y regresa lo que llevaba.",
      run: function (a) { return { a: a.slice(0, -1), r: a.length ? a[a.length - 1].v : undefined }; } },
    { name: "unshift", args: "(5)", icon: "down", enter: "in-up", info: "<code>.unshift()</code> pone un vagón al frente, junto a la locomotora. Todos los demás cambian de índice.",
      run: function (a) { return { a: [item(5)].concat(a), r: a.length + 1 }; } },
    { name: "shift", args: "()", icon: "up", leave: "out-up", info: "<code>.shift()</code> retira el primer vagón y regresa lo que llevaba. Los demás avanzan y cambian de índice.",
      run: function (a) { return { a: a.slice(1), r: a.length ? a[0].v : undefined }; } },
    { name: "splice", args: '(1, 2, 8, "world")', icon: "swap", leave: "out-up", enter: "in-up", info: '<code>.splice(1, 2, 8, "world")</code>: desde el índice 1 quita 2 vagones y pone 8 y "world" en su lugar. Regresa los que quitó.',
      run: function (a) { var b = a.slice(); var del = b.splice(1, 2, item(8), item("world")); return { a: b, r: del.map(function (x) { return x.v; }) }; } },
    { name: "slice", args: "(1, 2)", icon: "photo", info: "<code>.slice(1, 2)</code> le toma una foto a los vagones del índice 1 hasta antes del 2. El tren no cambia.",
      run: function (a) { return { a: a, r: a.slice(1, 2).map(function (x) { return x.v; }), photo: [1, 2] }; } },
  ];

  function wagonSVG(p) {
    return '<svg viewBox="0 0 104 76" preserveAspectRatio="none" aria-hidden="true">' +
      '<rect x="2" y="2" width="100" height="6" rx="3" fill="' + p.roof + '"/>' +
      '<rect class="body" x="4" y="6" width="96" height="46" rx="6" fill="' + p.bg + '" stroke="' + p.st + '" stroke-width="2"/>' +
      '<rect x="0" y="50" width="104" height="8" rx="2" fill="#2b3445"/>' +
      '<rect x="-6" y="52" width="8" height="3" fill="#6b7686"/>' +
      '<g class="arr-wheel"><circle cx="26" cy="64" r="11" fill="#2b3445"/><circle cx="26" cy="64" r="6" fill="#9aa4b2"/><path d="M26 57v14M19 64h14" stroke="#2b3445" stroke-width="2"/></g>' +
      '<g class="arr-wheel"><circle cx="78" cy="64" r="11" fill="#2b3445"/><circle cx="78" cy="64" r="6" fill="#9aa4b2"/><path d="M78 57v14M71 64h14" stroke="#2b3445" stroke-width="2"/></g>' +
      "</svg>";
  }

  function makeWagon(it) {
    var p = palette(it.v);
    var el = document.createElement("div");
    el.className = "arr-wagon";
    el.setAttribute("data-id", it.id);
    el.style.setProperty("--tx", p.tx);
    el.innerHTML = wagonSVG(p) + '<div class="arr-wagon__val"></div><div class="arr-wagon__idx"><span></span></div>';
    el.querySelector(".arr-wagon__val").textContent = show(it.v);
    return el;
  }

  var train = [];

  function rolling(on) {
    root.classList.toggle("is-rolling", on);
  }

  // Dibuja el tren; anima los vagones que se quedan (FLIP), los que entran y los que salen.
  function render(list, opts) {
    opts = opts || {};
    var instant = reduce || opts.instant;
    var old = {};
    line.querySelectorAll(".arr-wagon:not([data-leaving])").forEach(function (el) {
      old[el.getAttribute("data-id")] = { el: el, x: el.getBoundingClientRect().left, idx: el.querySelector(".arr-wagon__idx span").textContent };
    });
    var keep = {};
    list.forEach(function (it) { keep[it.id] = true; });
    var lineLeft = line.getBoundingClientRect().left;

    Object.keys(old).forEach(function (id) {
      if (keep[id]) return;
      var el = old[id].el;
      if (instant) return el.remove();
      el.setAttribute("data-leaving", "");
      el.style.position = "absolute";
      el.style.left = old[id].x - lineLeft + "px";
      el.style.top = "0";
      requestAnimationFrame(function () { el.classList.add(opts.leave || "out-right"); });
      setTimeout(function () { el.remove(); }, 750);
    });

    fit(list.length);
    var entering = [];
    list.forEach(function (it, i) {
      var o = old[it.id];
      var el = o ? o.el : makeWagon(it);
      if (!o && !instant) {
        el.classList.add(opts.enter || "in-right");
        entering.push(el);
      }
      var idx = el.querySelector(".arr-wagon__idx span");
      var label = "[" + i + "]";
      idx.className = "";
      if (o && o.idx !== label && !instant) idx.classList.add("is-changed");
      idx.textContent = label;
      el.classList.toggle("is-photo", !!(opts.photo && i >= opts.photo[0] && i < opts.photo[1]));
      line.appendChild(el);
    });

    if (instant) return;
    var moved = false;
    list.forEach(function (it) {
      var o = old[it.id];
      if (!o) return;
      var dx = o.x - o.el.getBoundingClientRect().left;
      if (!dx) return;
      moved = true;
      o.el.style.transition = "none";
      o.el.style.transform = "translateX(" + dx + "px)";
      o.el.getBoundingClientRect();
      o.el.style.transition = "";
      o.el.style.transform = "";
    });
    line.getBoundingClientRect();
    requestAnimationFrame(function () {
      entering.forEach(function (el) { el.classList.remove(opts.enter || "in-right"); });
    });
    if (moved || entering.length || opts.leave) {
      rolling(true);
      setTimeout(function () { rolling(false); }, 800);
    }
    setTimeout(function () {
      line.querySelectorAll(".arr-wagon__idx span.is-changed").forEach(function (s) { s.classList.remove("is-changed"); });
    }, 1400);
  }

  // Los vagones se encogen si no caben todos en la vía (en celular).
  function fit(n) {
    var yard = root.querySelector("[data-yard]");
    var locoW = root.querySelector(".arr-train__loco").offsetWidth + 4;
    var gap = parseFloat(getComputedStyle(root).getPropertyValue("--gap")) || 6;
    var pad = line.offsetLeft * 2;
    var free = yard.clientWidth - pad - locoW;
    var maxW = Math.min(104, Math.round((parseFloat(getComputedStyle(root).getPropertyValue("--rail-y")) || 132) * 0.8));
    var w = Math.max(42, Math.min(maxW, Math.floor((free - 4) / Math.max(n, 1)) - gap));
    root.style.setProperty("--wagon-w", w + "px");
    root.style.setProperty("--val-fs", (w < 50 ? 10 : w < 60 ? 11 : w < 80 ? 12 : 15) + "px");
    root.style.setProperty("--s", (w / 104).toFixed(3));
  }

  function countWagons() {
    var spans = line.querySelectorAll(".arr-wagon:not([data-leaving]) .arr-wagon__idx span");
    spans.forEach(function (s, i) {
      setTimeout(function () { s.classList.add("is-count"); }, i * 280);
      setTimeout(function () { s.classList.remove("is-count"); }, spans.length * 280 + 900);
    });
  }

  // Terminal: el código del método con su resultado, sin botón de Correr.
  function paint(text) {
    return text.split("\n").map(function (l) {
      var i = l.indexOf("//");
      var e = function (t) { return esc(t).replace(/>/g, "&gt;"); };
      return i === -1 ? e(l) : e(l.slice(0, i)) + '<span class="js-term__com">' + e(l.slice(i)) + "</span>";
    }).join("\n");
  }

  function state(list) {
    return "// miArreglo = " + fmt(list.map(function (x) { return x.v; }));
  }

  function terminal(code, result) {
    termCode.innerHTML = paint(code);
    termOut.innerHTML = result === undefined && arguments.length < 2 ? "" :
      '<span class="js-term__result">Resultado: ' + esc(fmt(result)) + '<span class="js-term__cursor" aria-hidden="true"></span></span>';
  }

  var MAX = 6;

  function reset() {
    line.querySelectorAll(".arr-wagon").forEach(function (w) { w.remove(); });
    train = START.map(item);
    render(train, { instant: true });
    terminal(state(train) + "\n// Presiona un botón para usar un método");
    infoEl.innerHTML = "";
    photo.classList.remove("is-visible");
    buttons.querySelectorAll(".arr-train__btn").forEach(function (b) { b.classList.remove("is-on"); });
  }

  METHODS.forEach(function (m) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "arr-train__btn";
    b.innerHTML = '<span class="arr-train__btn-ring"><span class="arr-train__btn-cap">' + ICON[m.icon] + '</span></span><span class="arr-train__btn-label">.' + m.name + "</span>";
    b.addEventListener("click", function () {
      buttons.querySelectorAll(".arr-train__btn").forEach(function (x) { x.classList.toggle("is-on", x === b); });
      if (m.enter && !m.leave && train.length >= MAX) {
        infoEl.innerHTML = "El tren ya es muy largo para la vía. Quita vagones o presiona <b>Reiniciar</b>.";
        return;
      }
      var before = state(train);
      var out = m.run(train);
      train = out.a;
      terminal(before + "\nvar r = miArreglo." + m.name + m.args + ";\nconsole.log(r);", out.r);
      infoEl.innerHTML = m.info;
      render(train, { leave: m.leave, enter: m.enter, photo: out.photo });
      if (out.count) countWagons();
      photo.classList.remove("is-visible");
      if (out.photo) {
        photoRow.innerHTML = "";
        out.r.forEach(function (v) {
          var p = palette(v);
          var w = document.createElement("span");
          w.className = "arr-mini-wagon";
          w.style.setProperty("--bg", p.bg);
          w.style.setProperty("--st", p.st);
          w.style.setProperty("--tx", p.tx);
          w.textContent = show(v);
          photoRow.appendChild(w);
        });
        void photo.offsetWidth;
        photo.classList.add("is-visible");
      }
    });
    buttons.insertBefore(b, buttons.querySelector("[data-reset]"));
  });

  root.querySelector("[data-reset]").addEventListener("click", reset);
  reset();
})();
