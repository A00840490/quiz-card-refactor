/* modulo4-6: los métodos de arreglos son cubos de juguete (misma física que
   los operadores de 4-5). Al soltar un método en el hueco, la repisa muestra
   cómo cambia miArreglo y la consola imprime lo que regresa el método.
   La animación solo corre mientras algo se mueve. */
(function () {
  "use strict";

  var root = document.querySelector("[data-arr-toys]");
  if (!root) return;
  root.classList.add("arr-toys--ready");

  var stage = root.querySelector(".arr-toys__stage");
  var tray = root.querySelector(".arr-toys__tray");
  var slot = root.querySelector("[data-slot]");
  var argsEl = root.querySelector("[data-args]");
  var resEl = root.querySelector("[data-res]");
  var infoEl = root.querySelector("[data-info]");
  var shelf = root.querySelector("[data-shelf]");
  var outRow = root.querySelector("[data-out-row]");
  var outShelf = root.querySelector("[data-out]");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var G = 0.8;
  var COLORS = [
    ["#CECBF6", "#EEEDFE", "#AFA9EC", "#26215C"],
    ["#F4C0D1", "#FBEAF0", "#ED93B1", "#4B1528"],
    ["#C0DD97", "#EAF3DE", "#97C459", "#173404"],
    ["#FAC775", "#FAEEDA", "#EF9F27", "#412402"],
    ["#B5D4F4", "#E6F1FB", "#85B7EB", "#042C53"],
    ["#F7C1C1", "#FCEBEB", "#F09595", "#501313"],
    ["#9FE1CB", "#E1F5EE", "#5DCAA5", "#04342C"],
  ];

  // El arreglo de los ejemplos: ["Hola", "Mundo", 7]
  var START = [
    { id: "a", v: "Hola" },
    { id: "b", v: "Mundo" },
    { id: "c", v: 7 },
  ];
  var uid = 0;
  function item(v) {
    uid += 1;
    return { id: "n" + uid, v: v };
  }

  // Cada método: argumentos que se muestran, qué hace y qué explica.
  var METHODS = [
    {
      name: "length",
      args: ";",
      run: function (a) { return { arr: a, r: a.length, count: true }; },
      info: "<code>.length</code> es una propiedad, no un método: no lleva paréntesis. Regresa cuántos elementos tiene el arreglo.",
    },
    {
      name: "pop",
      args: "();",
      run: function (a) { return { arr: a.slice(0, -1), r: a[a.length - 1].v }; },
      info: "<code>.pop()</code> elimina el último elemento y lo regresa.",
    },
    {
      name: "push",
      args: '("nuevo");',
      run: function (a) { return { arr: a.concat([item("nuevo")]), r: a.length + 1 }; },
      info: "<code>.push()</code> agrega un elemento al final y regresa la nueva longitud del arreglo.",
    },
    {
      name: "shift",
      args: "();",
      run: function (a) { return { arr: a.slice(1), r: a[0].v }; },
      info: "<code>.shift()</code> elimina el primer elemento y lo regresa. Los demás se recorren un índice.",
    },
    {
      name: "unshift",
      args: "(5);",
      run: function (a) { return { arr: [item(5)].concat(a), r: a.length + 1 }; },
      info: "<code>.unshift()</code> agrega un elemento al inicio y regresa la nueva longitud. Los demás se recorren un índice.",
    },
    {
      name: "splice",
      args: '(1, 2, 8, "world");',
      run: function (a) {
        return {
          arr: [a[0], item(8), item("world")],
          r: a.slice(1, 3).map(function (x) { return x.v; }),
        };
      },
      info: '<code>.splice()</code>: desde el índice 1 borra 2 elementos y pone 8 y "world" en su lugar. Regresa los borrados.',
    },
    {
      name: "slice",
      args: "(1, 2);",
      run: function (a) { return { arr: a, r: [a[1].v], picked: [1] }; },
      info: "<code>.slice()</code> copia del índice 1 hasta antes del 2. El arreglo original no cambia.",
    },
  ];

  /* ---------------------------- Repisa ---------------------------- */

  function show(v) {
    return typeof v === "string" ? '"' + v + '"' : String(v);
  }

  // Lo que imprimiría console.log(r).
  function fmt(r) {
    if (Array.isArray(r)) return "[" + r.map(show).join(", ") + "]";
    return String(r);
  }

  function makeBox(it) {
    var el = document.createElement("div");
    el.className = "arr-box";
    el.setAttribute("data-id", it.id);
    var num = typeof it.v === "number";
    el.style.setProperty("--c1", num ? "#FAEEDA" : "#E6F1FB");
    el.style.setProperty("--tx", num ? "#412402" : "#042C53");
    el.innerHTML = '<span class="arr-box__val"></span><span class="arr-box__idx"></span>';
    el.firstChild.textContent = show(it.v);
    return el;
  }

  // Dibuja la lista en el contenedor; anima entradas, salidas y recorridos.
  function render(box, list, opts) {
    opts = opts || {};
    var animate = !reduce && !opts.instant;
    var old = {};
    Array.prototype.forEach.call(box.querySelectorAll(".arr-box:not(.is-leaving)"), function (el) {
      old[el.getAttribute("data-id")] = { el: el, rect: el.getBoundingClientRect() };
    });
    var keep = {};
    list.forEach(function (it) { keep[it.id] = true; });

    var boxRect = box.getBoundingClientRect();
    Object.keys(old).forEach(function (id) {
      if (keep[id]) return;
      var el = old[id].el;
      if (!animate) return el.remove();
      // Sale de la fila sin empujar a las demás.
      el.style.position = "absolute";
      el.style.left = old[id].rect.left - boxRect.left + "px";
      el.style.top = old[id].rect.top - boxRect.top + "px";
      requestAnimationFrame(function () { el.classList.add("is-leaving"); });
      setTimeout(function () { el.remove(); }, 400);
    });

    var count = box.querySelector(".arr-toys__count");
    if (count) count.remove();

    var entering = [];
    list.forEach(function (it, i) {
      var el = old[it.id] ? old[it.id].el : makeBox(it);
      if (!old[it.id] && animate) {
        el.classList.add("is-entering");
        entering.push(el);
      }
      el.lastChild.textContent = "[" + i + "]";
      el.classList.toggle("is-picked", !!(opts.picked && opts.picked.indexOf(i) >= 0));
      el.classList.toggle("is-counted", !!opts.count);
      box.appendChild(el); // también reordena
    });

    if (opts.count) {
      var badge = document.createElement("span");
      badge.className = "arr-toys__count";
      badge.textContent = list.length + " elementos";
      box.appendChild(badge);
    }

    if (!animate) return;
    // FLIP: las cajas que se quedan viajan de su lugar anterior al nuevo.
    list.forEach(function (it) {
      var o = old[it.id];
      if (!o) return;
      var r = o.el.getBoundingClientRect();
      var dx = o.rect.left - r.left;
      var dy = o.rect.top - r.top;
      if (!dx && !dy) return;
      o.el.style.transition = "none";
      o.el.style.transform = "translate(" + dx + "px," + dy + "px)";
      o.el.getBoundingClientRect();
      o.el.style.transition = "";
      o.el.style.transform = "";
    });
    if (entering.length) {
      box.getBoundingClientRect();
      requestAnimationFrame(function () {
        entering.forEach(function (el) { el.classList.remove("is-entering"); });
      });
    }
  }

  var current = START;
  function resetShelf(instant) {
    current = START;
    render(shelf, current, { instant: instant });
    outRow.hidden = true;
    outShelf.innerHTML = "";
  }

  function clearResult() {
    resEl.textContent = "";
    argsEl.textContent = "";
    infoEl.classList.remove("is-visible");
    infoEl.innerHTML = "";
    if (current !== START) resetShelf(false);
    else render(shelf, current, { instant: true });
    outRow.hidden = true;
  }

  function compute(c) {
    var m = c.m;
    argsEl.textContent = m.args;
    infoEl.innerHTML = '<span class="arr-toys__info-text">' + m.info + "</span>";
    infoEl.classList.add("is-visible");
    // Cada método parte del arreglo original.
    if (current !== START) resetShelf(true);
    var out = m.run(START);
    current = out.arr;
    render(shelf, current, { picked: out.picked, count: out.count });
    resEl.textContent = fmt(out.r);
    if (Array.isArray(out.r)) {
      outRow.hidden = false;
      outShelf.innerHTML = "";
      render(outShelf, out.r.map(function (v) { return item(v); }));
    } else {
      outRow.hidden = true;
    }
  }

  /* ------------------- Cubos con física (como 4-5) ------------------- */

  var cubes = [];
  var inSlot = null;
  var raf = 0;

  function size() {
    return stage.clientWidth < 520 ? 46 : 56;
  }

  function stageRect() {
    return stage.getBoundingClientRect();
  }

  function floorY() {
    var s = stageRect();
    var t = tray.getBoundingClientRect();
    return t.bottom - s.top - size() - 12;
  }

  function slotPos() {
    var s = stageRect();
    var r = slot.getBoundingClientRect();
    return {
      x: r.left - s.left + (r.width - size()) / 2,
      y: r.top - s.top + (r.height - size()) / 2,
    };
  }

  function overSlot(c) {
    var p = slotPos();
    return Math.abs(c.x - p.x) < size() * 0.9 && Math.abs(c.y - p.y) < size() * 0.9;
  }

  function apply(c) {
    c.el.style.transform = "translate(" + c.x + "px," + c.y + "px)";
    c.cube.style.transform = "rotateX(" + c.rx + "deg) rotateY(" + c.ry + "deg)";
  }

  function floorFor(c, base) {
    var S = size();
    var f = base;
    cubes.forEach(function (b) {
      if (b === c || b.drag || b.snap || b.vy !== 0) return;
      if (Math.abs(b.x - c.x) < S - 6 && b.y > c.y + S * 0.4) f = Math.min(f, b.y - S);
    });
    return f;
  }

  function step() {
    var active = false;
    var S = size();
    var W = stage.clientWidth;
    var base = floorY();

    cubes.forEach(function (c) {
      if (c.drag) {
        active = true;
        return;
      }
      if (c.snap) {
        var t = c.snap;
        c.vx = (c.vx + (t.x - c.x) * 0.16) * 0.64;
        c.vy = (c.vy + (t.y - c.y) * 0.16) * 0.64;
        c.x += c.vx;
        c.y += c.vy;
        c.rx += -c.rx * 0.18;
        c.ry += -c.ry * 0.18;
        var d = Math.abs(t.x - c.x) + Math.abs(t.y - c.y) + Math.abs(c.vx) + Math.abs(c.vy) + Math.abs(c.rx) + Math.abs(c.ry);
        if (d > 0.6) {
          active = true;
        } else {
          c.x = t.x;
          c.y = t.y;
          c.rx = 0;
          c.ry = 0;
          if (!c.done) {
            c.done = true;
            compute(c);
          }
        }
        return;
      }

      var fl = floorFor(c, base);
      c.vy += G;
      c.x += c.vx;
      c.y += c.vy;
      if (c.y >= fl) {
        c.y = fl;
        if (Math.abs(c.vy) > 2.4) c.vy *= -0.42;
        else c.vy = 0;
        c.vx *= 0.8;
      }
      if (c.x < 12) { c.x = 12; c.vx *= -0.5; }
      if (c.x > W - S - 12) { c.x = W - S - 12; c.vx *= -0.5; }

      var onFloor = c.y >= fl && c.vy === 0;
      if (!onFloor) {
        c.ry += c.vx * 1.8;
        active = true;
      } else {
        var g = Math.round((c.ry + 28) / 90) * 90 - 28;
        c.ry += (g - c.ry) * 0.2;
        c.rx += (-18 - c.rx) * 0.2;
        if (Math.abs(c.vx) < 0.05) c.vx = 0;
        if (c.vx || Math.abs(g - c.ry) > 0.3 || Math.abs(c.rx + 18) > 0.3) active = true;
      }
    });

    // Cubos al mismo nivel no se enciman: se recorren o se apilan.
    for (var i = 0; i < cubes.length; i++) {
      for (var j = i + 1; j < cubes.length; j++) {
        var a = cubes[i];
        var b = cubes[j];
        if (a.snap || b.snap || a.drag || b.drag) continue;
        if (Math.abs(a.y - b.y) > 4 || a.vy || b.vy) continue;
        var o = S * 1.38 + 4 - Math.abs(a.x - b.x);
        if (o <= 0.5) continue;
        var left = a.x <= b.x ? a : b;
        var right = left === a ? b : a;
        left.x -= o / 2;
        right.x += o / 2;
        if (left.x < 12) { right.x += 12 - left.x; left.x = 12; }
        if (right.x > W - S - 12) {
          right.x = Math.min(W - S - 12, left.x + 4);
          right.y = left.y - S;
          right.vy = 0;
        }
        active = true;
      }
    }
    return active;
  }

  var idleFrames = 0;
  function tick() {
    var active = step();
    cubes.forEach(apply);
    var touching = cubes.some(function (c) { return c.drag; });
    idleFrames = touching ? 0 : idleFrames + 1;
    raf = active && idleFrames < 480 ? requestAnimationFrame(tick) : 0;
  }

  function run() {
    idleFrames = 0;
    if (reduce) {
      for (var k = 0; k < 900 && step(); k++);
      cubes.forEach(apply);
      return;
    }
    if (!raf) raf = requestAnimationFrame(tick);
  }

  function eject(c) {
    c.snap = null;
    c.done = false;
    c.vy = -13;
    c.vx = (Math.random() < 0.5 ? -1 : 1) * (4 + Math.random() * 4);
  }

  function place(c) {
    if (inSlot && inSlot !== c) eject(inSlot);
    inSlot = c;
    c.snap = slotPos();
    c.done = false;
    clearResult();
    run();
  }

  function bind(c) {
    var el = c.el;
    el.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      el.setPointerCapture(e.pointerId);
      if (inSlot === c) {
        inSlot = null;
        clearResult();
      }
      c.snap = null;
      c.done = false;
      c.drag = true;
      c.moved = 0;
      var r = stageRect();
      c.ox = e.clientX - r.left - c.x;
      c.oy = e.clientY - r.top - c.y;
      el.classList.add("is-dragging");
      run();
    });
    el.addEventListener("pointermove", function (e) {
      if (!c.drag) return;
      var r = stageRect();
      var nx = e.clientX - r.left - c.ox;
      var ny = e.clientY - r.top - c.oy;
      c.vx = nx - c.x;
      c.vy = ny - c.y;
      c.moved += Math.abs(c.vx) + Math.abs(c.vy);
      c.x = nx;
      c.y = ny;
      c.ry = -28 + c.vx * 3;
      c.rx = -18 - c.vy * 2;
      slot.classList.toggle("is-hot", overSlot(c));
      apply(c);
    });
    function release() {
      if (!c.drag) return;
      c.drag = false;
      el.classList.remove("is-dragging");
      slot.classList.remove("is-hot");
      if (c.moved < 6 || overSlot(c)) {
        place(c);
      } else {
        c.vx = Math.max(-24, Math.min(24, c.vx));
        c.vy = Math.max(-24, Math.min(24, c.vy));
      }
      run();
    }
    el.addEventListener("pointerup", release);
    el.addEventListener("pointercancel", release);
    el.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        place(c);
      }
    });
  }

  function build() {
    cubes.forEach(function (c) { c.el.remove(); });
    cubes = [];
    inSlot = null;
    clearResult();

    var S = size();
    var W = stage.clientWidth;
    var s = stageRect();
    var trayTop = tray.getBoundingClientRect().top - s.top;
    var gap = (W - 48 - S) / Math.max(1, METHODS.length - 1);

    METHODS.forEach(function (m, i) {
      var k = COLORS[i % COLORS.length];
      var el = document.createElement("div");
      el.className = "arr-cube";
      el.setAttribute("role", "button");
      el.setAttribute("tabindex", "0");
      el.setAttribute("aria-label", "Método " + m.name);
      el.style.setProperty("--c1", k[0]);
      el.style.setProperty("--c2", k[1]);
      el.style.setProperty("--c3", k[2]);
      el.style.setProperty("--tx", k[3]);
      el.style.setProperty("--s", S + "px");
      el.style.setProperty("--fs", (m.name.length > 5 ? 0.2 : m.name.length > 3 ? 0.24 : 0.3) * S + "px");
      var faces = ["front", "back", "right", "left", "top", "bottom"]
        .map(function (f) { return '<i class="arr-cube__face arr-cube__face--' + f + '" aria-hidden="true">' + m.name + "</i>"; })
        .join("");
      el.innerHTML = '<div class="arr-cube__body">' + faces + "</div>";
      stage.appendChild(el);
      var c = {
        el: el,
        cube: el.firstChild,
        m: m,
        x: 24 + i * gap,
        y: reduce ? floorY() : trayTop - 70 - i * 26,
        vx: reduce ? 0 : (Math.random() - 0.5) * 2,
        vy: 0,
        rx: -18,
        ry: -28 + (reduce ? 0 : Math.random() * 40 - 20),
      };
      cubes.push(c);
      bind(c);
      apply(c);
    });
    run();
  }

  // Si la pantalla cambia de alto (aparece la fila "r"), la charola se
  // mueve: los cubos se recorren con ella.
  var screenEl = root.querySelector(".arr-toys__screen");
  if (window.ResizeObserver && screenEl) {
    var lastH = screenEl.offsetHeight;
    new ResizeObserver(function () {
      var h = screenEl.offsetHeight;
      var d = h - lastH;
      lastH = h;
      if (!d) return;
      cubes.forEach(function (c) {
        if (c.snap) c.snap = slotPos();
        else if (!c.drag) c.y += d;
        apply(c);
      });
      run();
    }).observe(screenEl);
  }

  var resizeTimer = 0;
  var lastW = stage.clientWidth;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (Math.abs(stage.clientWidth - lastW) < 2) return;
      lastW = stage.clientWidth;
      build();
    }, 200);
  });

  resetShelf(true);
  build();
})();
