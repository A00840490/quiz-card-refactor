/* modulo4-5: los operadores son cubos de juguete con física sencilla.
   Se arrastran (o se tocan) hacia el hueco entre x y el número, y la
   pantalla muestra el resultado. La animación solo corre mientras algo se
   mueve, así que no consume recursos en reposo. */
(function () {
  "use strict";

  var root = document.querySelector("[data-op-toys]");
  if (!root) return;
  root.classList.add("op-toys--ready");

  var stage = root.querySelector(".op-toys__stage");
  var tray = root.querySelector(".op-toys__tray");
  var slot = root.querySelector("[data-slot]");
  var lhs = root.querySelector("[data-lhs]");
  var rhs = root.querySelector("[data-rhs]");
  var preEl = root.querySelector("[data-pre]");
  var resEl = root.querySelector("[data-res]");
  var infoEl = root.querySelector("[data-info]");
  var modeBtns = root.querySelectorAll("[data-mode]");
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
    ["#F5C4B3", "#FAECE7", "#F0997B", "#4A1B0C"],
  ];

  var MODES = {
    arith: {
      a: 8,
      b: 5,
      ops: [
        ["+", "suma", function (a, b) { return a + b; }],
        ["-", "resta", function (a, b) { return a - b; }],
        ["*", "multiplicación", function (a, b) { return a * b; }],
        ["/", "división", function (a, b) { return a / b; }],
        ["%", "módulo: el residuo de la división", function (a, b) { return a % b; }],
        ["**", "potencia", function (a, b) { return Math.pow(a, b); }],
      ],
    },
    assign: {
      x: 10,
      b: 3,
      ops: [
        ["+=", "suma el valor dado al valor de la variable", function (a, b) { return a + b; }],
        ["-=", "resta el valor dado al valor de la variable", function (a, b) { return a - b; }],
        ["*=", "multiplica la variable por el valor dado", function (a, b) { return a * b; }],
        ["/=", "divide la variable entre el valor dado", function (a, b) { return a / b; }],
        ["%=", "guarda en la variable el residuo de dividirla entre el valor dado", function (a, b) { return a % b; }],
        ["**=", "eleva la variable a la potencia dada", function (a, b) { return Math.pow(a, b); }],
        ["++", "incrementa en 1; no necesita un número", function (a) { return a + 1; }],
        ["--", "decrementa en 1; no necesita un número", function (a) { return a - 1; }],
      ],
    },
  };

  var mode = "arith";
  var cubes = [];
  var inSlot = null;
  var raf = 0;

  function size() {
    return stage.clientWidth < 520 ? 46 : 56;
  }

  // El número tal como lo imprimiría console.log.
  function fmt(n) {
    return String(n);
  }

  function isUnary(op) {
    return op === "++" || op === "--";
  }

  function setLabels(unary) {
    if (mode === "arith") {
      lhs.textContent = "var x = " + MODES.arith.a;
      rhs.textContent = MODES.arith.b + ";";
      rhs.classList.remove("is-unused");
      preEl.hidden = true;
    } else {
      preEl.hidden = false;
      lhs.textContent = "x";
      rhs.textContent = MODES.assign.b + ";";
      rhs.classList.toggle("is-unused", !!unary);
    }
  }

  function clearResult() {
    resEl.textContent = "";
    infoEl.classList.remove("is-visible");
    infoEl.innerHTML = "";
    setLabels(false);
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

  // Suelo efectivo: la charola o la parte de arriba de otro cubo.
  function floorFor(c, base) {
    var S = size();
    var f = base;
    cubes.forEach(function (b) {
      if (b === c || b.drag || b.snap || b.vy !== 0) return; // sostiene si ya no cae
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
      c.rest = false;
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
        else c.rest = true;
      }
    });

    // Cubos al mismo nivel no se enciman: se recorren o se apilan.
    for (var i = 0; i < cubes.length; i++) {
      for (var j = i + 1; j < cubes.length; j++) {
        var a = cubes[i];
        var b = cubes[j];
        if (a.snap || b.snap || a.drag || b.drag) continue;
        if (Math.abs(a.y - b.y) > 4 || a.vy || b.vy) continue;
        var o = S * 1.38 + 4 - Math.abs(a.x - b.x); // ancho visible del cubo girado
        if (o <= 0.5) continue;
        var left = a.x <= b.x ? a : b;
        var right = left === a ? b : a;
        left.x -= o / 2;
        right.x += o / 2;
        if (left.x < 12) { right.x += 12 - left.x; left.x = 12; }
        if (right.x > W - S - 12) {
          // No cabe: se sube encima de su vecino.
          right.x = Math.min(W - S - 12, left.x + 4);
          right.y = left.y - S;
          right.vy = 0;
        }
        left.rest = right.rest = false;
        active = true;
      }
    }
    return active;
  }

  // Tope de seguridad: si algo no se asienta en ~8 s sin que nadie toque
  // los cubos, la animación se detiene.
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

  function esc(t) {
    return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // Cuadro con la información del operador que está en el hueco.
  function showInfo(op) {
    var sym = op[0];
    var html = '<span class="op-toys__info-text">' + esc(op[1].charAt(0).toUpperCase() + op[1].slice(1)) + ".";
    if (mode === "assign") {
      var b = MODES.assign.b;
      var same = isUnary(sym)
        ? "x = x " + sym.charAt(0) + " 1"
        : "x = x " + sym.slice(0, -1) + " " + b;
      var written = isUnary(sym) ? "x" + sym : "x " + sym + " " + b;
      html += " <code>" + esc(written) + "</code> es lo mismo que <code>" + esc(same) + "</code>.";
    }
    html += "</span>";
    infoEl.innerHTML = html;
    infoEl.classList.add("is-visible");
  }

  // La consola muestra solo lo que imprimiría console.log(x).
  function compute(c) {
    var op = c.op;
    var m = MODES[mode];
    if (mode === "arith") {
      resEl.textContent = fmt(op[2](m.a, m.b));
    } else {
      setLabels(isUnary(op[0]));
      resEl.textContent = fmt(op[2](m.x, m.b));
    }
    showInfo(op);
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

    var ops = MODES[mode].ops;
    var S = size();
    var W = stage.clientWidth;
    var s = stageRect();
    var trayTop = tray.getBoundingClientRect().top - s.top;
    var gap = (W - 48 - S) / Math.max(1, ops.length - 1);

    ops.forEach(function (op, i) {
      var k = COLORS[i % COLORS.length];
      var el = document.createElement("div");
      el.className = "op-cube";
      el.setAttribute("role", "button");
      el.setAttribute("tabindex", "0");
      el.setAttribute("aria-label", "Operador " + op[0] + ": " + op[1]);
      el.style.setProperty("--c1", k[0]);
      el.style.setProperty("--c2", k[1]);
      el.style.setProperty("--c3", k[2]);
      el.style.setProperty("--tx", k[3]);
      el.style.setProperty("--s", S + "px");
      el.style.setProperty("--fs", (op[0].length > 2 ? 0.3 : op[0].length > 1 ? 0.36 : 0.44) * S + "px");
      var faces = ["front", "back", "right", "left", "top", "bottom"]
        .map(function (f) { return '<i class="op-cube__face op-cube__face--' + f + '" aria-hidden="true">' + op[0] + "</i>"; })
        .join("");
      el.innerHTML = '<div class="op-cube__body">' + faces + "</div>";
      stage.appendChild(el);
      var c = {
        el: el,
        cube: el.firstChild,
        op: op,
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

  modeBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (btn.getAttribute("data-mode") === mode) return;
      mode = btn.getAttribute("data-mode");
      modeBtns.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      build();
    });
  });

  // Si la pantalla cambia de alto, la charola se mueve: los cubos se
  // recorren con ella para no quedar desfasados.
  var screenEl = root.querySelector(".op-toys__screen");
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

  // Solo se reacomoda si cambia el ancho (en celular, la barra del
  // navegador cambia el alto al desplazarse y no debe reiniciar el juego).
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

  build();
})();
