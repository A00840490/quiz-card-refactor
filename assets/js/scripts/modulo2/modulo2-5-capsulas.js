/* Módulo 2-5: las etiquetas para formatear texto como una máquina de cápsulas.
   - Lee la lista de etiquetas (.capsulas__data): de cada <li> toma la
     etiqueta (.codetag), su descripción y su ejemplo (.capsulas__ex), y arma
     una cápsula por etiqueta. La lista se oculta; sin JavaScript se ve igual
     que antes.
   - Al girar la perilla las cápsulas se revuelven: saltan, chocan entre sí y
     rebotan contra la cúpula. Luego una al azar sale por abajo; también se
     puede tocar una cápsula para sacar esa. La cápsula rueda, se abre y se
     desenrolla una ficha tipo Pokédex: la etiqueta en neón flotando sobre una
     cuadrícula con ojo de pez invertido que se mueve en una diagonal al azar, a un lado
     su descripción y debajo el ejemplo de código con su resultado.
   - Donde no caben la máquina y la ficha lado a lado, solo se ve la máquina
     y la ficha sale centrada en una ventana encima de la página. Tocar fuera
     de la ficha (o Esc) la cierra.
   - Al sacar una nueva, la cápsula anterior se cierra, sale rodando por la
     derecha y aparece a la izquierda de una repisa de madera que flota arriba
     del ejemplo ([data-capsulas-demo]). Desde ahí se arrastra con el mouse o
     el dedo al ejemplo,
     que empieza vacío y se arma con un párrafo por cápsula, en el lugar donde
     se suelta. También se puede tocar la cápsula y luego el ejemplo (o Enter
     en los dos con el teclado).
   - Cuando se acaban, la perilla vuelve a llenar la máquina y el ejemplo
     vuelve a empezar.
   - Empieza con la cápsula de <li data-start> ya abierta. */
(function () {
  "use strict";

  var root = document.querySelector("[data-capsulas]");
  var list = document.querySelector(".capsulas__data");
  if (!root || !list) return;

  var dome = root.querySelector(".capsulas__dome");
  var knob = root.querySelector(".capsulas__knob");
  var handle = root.querySelector(".capsulas__handle");
  var prize = root.querySelector(".capsulas__prize");
  var slip = root.querySelector(".capsulas__slip");
  var reduce = Curso.reduce;

  // Colores pastel de la mitad de arriba de cada cápsula.
  var COLORS = ["#fac775", "#a9c8f0", "#f4a08a", "#8fd3b6", "#c9b6f2", "#7fa6e0", "#ffd9a8", "#b9e3f5", "#f7b6c8", "#cde6a1"];
  // Montón dentro del domo: [x, y, giro] en px desde la esquina del domo.
  var PILE = [
    [60, 198, -12], [108, 200, 8], [156, 198, -20], [204, 196, 14],
    [84, 154, 22], [132, 155, -8], [180, 153, -26],
    [108, 110, -4], [156, 111, 18],
    [132, 67, -14]
  ];

  // Convierte el HTML del ejemplo en código coloreado como en el curso.
  function codeHTML(src) {
    return src
      .split(/(<\/?[a-z0-9]+>)/i)
      .map(function (part) {
        var m = part.match(/^<(\/?)([a-z0-9]+)>$/i);
        if (m) return "&lt;" + m[1] + '<span class="codetag">' + m[2] + "</span>&gt;";
        return part ? '<span class="codetext">' + part + "</span>" : "";
      })
      .join("");
  }

  var items = Array.prototype.slice.call(list.querySelectorAll("li")).map(function (li, i) {
    var tag = li.querySelector(".codetag").textContent.trim();
    var ex = li.querySelector(".capsulas__ex");
    var desc = li.cloneNode(true);
    [desc.querySelector(".code"), desc.querySelector(".capsulas__ex")].forEach(function (n) {
      if (n) n.parentNode.removeChild(n);
    });
    return {
      tag: tag,
      // Las etiquetas que menciona la descripción van en <code> (.grafico-exp)
      desc: desc.innerHTML.trim().replace(/<b>\s*(&lt;\w+&gt;)\s*<\/b>/g, "<code>$1</code>"),
      example: ex ? ex.innerHTML.trim() : "",
      color: COLORS[i % COLORS.length],
      start: li.hasAttribute("data-start"),
    };
  });

  // Arma las cápsulas.
  var caps = items.map(function (item, i) {
    var p = PILE[i % PILE.length];
    var b = document.createElement("button");
    b.type = "button";
    b.className = "capsulas__cap";
    b.style.setProperty("--x", p[0] + "px");
    b.style.setProperty("--y", p[1] + "px");
    b.style.setProperty("--r", p[2] + "deg");
    b.style.setProperty("--c", item.color);
    b.setAttribute("aria-label", "Cápsula de la etiqueta " + item.tag);
    var sticker = document.createElement("span");
    sticker.className = "capsulas__sticker";
    sticker.textContent = "<" + item.tag + ">";
    if (item.tag.length > 4) sticker.classList.add("is-long");
    b.appendChild(sticker);
    b.addEventListener("click", function () {
      pick(i);
    });
    dome.appendChild(b);
    return b;
  });
  list.classList.add("is-built");

  var turn = 0;
  var busy = false;

  // ---------- Física: las cápsulas saltan y rebotan dentro del domo ----------
  // Cada cápsula es un círculo con posición, velocidad y giro. Se mueve con
  // gravedad, choca con las demás y rebota contra la cúpula (un círculo).
  // Mientras se revuelve, cada tanto un "soplido" desde abajo las avienta.
  var RADIUS = 25;
  var bodies = caps.map(function (c, i) {
    var p = PILE[i % PILE.length];
    return { el: c, x: p[0], y: p[1], vx: 0, vy: 0, a: p[2], va: 0, falling: false };
  });

  function render(b) {
    b.el.style.setProperty("--x", b.x.toFixed(1) + "px");
    b.el.style.setProperty("--y", b.y.toFixed(1) + "px");
    b.el.style.setProperty("--r", b.a.toFixed(1) + "deg");
  }

  function inDome() {
    return bodies.filter(function (b) {
      return !b.el.classList.contains("is-gone");
    });
  }

  function step(list, dt, bounce, damp) {
    var c = dome.clientWidth / 2;
    var lim = c - RADIUS;
    list.forEach(function (b) {
      b.vy += 1500 * dt;
      if (damp) {
        b.vx *= 0.996;
        b.vy *= 0.996;
      }
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.a += b.va * dt;
      b.va *= 0.995;
    });
    var solid = list.filter(function (b) {
      return !b.falling;
    });
    for (var it = 0; it < 3; it++) {
      // Choques entre cápsulas
      for (var i = 0; i < solid.length; i++) {
        for (var j = i + 1; j < solid.length; j++) {
          var p = solid[i], q = solid[j];
          var dx = q.x - p.x, dy = q.y - p.y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d >= RADIUS * 2 || d === 0) continue;
          var nx = dx / d, ny = dy / d, push = (RADIUS * 2 - d) / 2;
          p.x -= nx * push; p.y -= ny * push;
          q.x += nx * push; q.y += ny * push;
          var rel = (q.vx - p.vx) * nx + (q.vy - p.vy) * ny;
          if (rel < 0) {
            var imp = (-(1 + bounce) * rel) / 2;
            p.vx -= imp * nx; p.vy -= imp * ny;
            q.vx += imp * nx; q.vy += imp * ny;
          }
        }
      }
      // Rebote contra la cúpula
      solid.forEach(function (b) {
        var dx = b.x - c, dy = b.y - c;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d <= lim) return;
        var nx = dx / d, ny = dy / d;
        b.x = c + nx * lim;
        b.y = c + ny * lim;
        var vn = b.vx * nx + b.vy * ny;
        if (vn > 0) {
          b.vx -= (1 + bounce) * vn * nx;
          b.vy -= (1 + bounce) * vn * ny;
          // Al rozar la cúpula, gira hacia donde rueda.
          b.va = ((-b.vx * ny + b.vy * nx) / RADIUS) * 40;
        }
      });
    }
  }

  var stirUntil = 0, simUntil = 0, nextPuff = 0, last = 0, raf = 0;

  // Revuelve durante stirMs y deja que se acomoden hasta totalMs.
  function simulate(stirMs, totalMs) {
    var now = performance.now();
    stirUntil = Math.max(stirUntil, now + stirMs);
    simUntil = Math.max(simUntil, now + totalMs);
    dome.classList.add("is-stirring");
    if (!raf) {
      last = now;
      nextPuff = now;
      raf = requestAnimationFrame(tick);
    }
  }

  function tick(t) {
    var list = inDome();
    var dt = Math.min(0.05, (t - last) / 1000);
    last = t;
    var stirring = t < stirUntil;
    if (stirring && t >= nextPuff) {
      var size = dome.clientWidth;
      list.forEach(function (b) {
        if (b.falling || Math.random() < 0.25) return;
        var low = Math.max(0.2, b.y / size); // más fuerte abajo, donde está el soplido
        b.vy -= (420 + Math.random() * 520) * low;
        b.vx += (Math.random() - 0.5) * 520;
        b.va += (Math.random() - 0.5) * 900;
      });
      nextPuff = t + 150 + Math.random() * 90;
    }
    var n = Math.max(1, Math.ceil(dt / (1 / 240)));
    for (var k = 0; k < n; k++) step(list, dt / n, stirring ? 0.8 : 0.3, !stirring);
    list.forEach(render);
    if (t < simUntil) {
      raf = requestAnimationFrame(tick);
    } else {
      raf = 0;
      dome.classList.remove("is-stirring");
    }
  }

  function left() {
    return caps.filter(function (c) {
      return !c.classList.contains("is-gone");
    });
  }

  function setGone(c, gone) {
    c.classList.toggle("is-gone", gone);
    c.disabled = gone;
  }

  function updateKnob() {
    knob.setAttribute("aria-label", left().length || current !== null ? "Girar la perilla" : "Rellenar la máquina");
  }

  function spin() {
    turn += 360;
    handle.style.setProperty("--turn", turn + "deg");
  }

  // "#fac775" → "250, 199, 117" para usarlo en rgba().
  function rgb(hex) {
    var n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255].join(", ");
  }

  // ---------- Cuadrícula con ojo de pez invertido ----------
  // Las líneas viven en un plano "real" y cada punto se lleva a la pantalla
  // con s = p · (1 + K·|p|²): el centro se ve chico y las orillas se estiran,
  // así las líneas se curvan hacia adentro (ojo de pez invertido).
  var K = 0.55; // qué tan curvado
  var EDGE = 0.88; // valor de s en la orilla del cuadro: acercado para que solo
  // se vea la parte de en medio del efecto, sin las orillas tan deformadas
  var GAP = 0.22; // separación entre líneas en el plano real
  var REACH = 1.8; // hasta dónde se dibujan las líneas (cubre las esquinas)
  var SPEED = 0.09; // plano real por segundo
  var gridRaf = 0;

  function fisheye(x, y) {
    var f = 1 + K * (x * x + y * y);
    return [x * f, y * f];
  }

  function startGrid(canvas, color) {
    cancelAnimationFrame(gridRaf);
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    var dpr = window.devicePixelRatio || 1;
    var size = canvas.clientWidth || 120;
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    var half = canvas.width / 2;
    var scale = half / EDGE;
    // Una de las cuatro diagonales al azar.
    var dx = Math.random() < 0.5 ? -1 : 1;
    var dy = Math.random() < 0.5 ? -1 : 1;
    var stroke = ctx.createRadialGradient(half, half, 0, half, half, half * 1.45);
    stroke.addColorStop(0, "rgba(" + color + ", 0.6)");
    stroke.addColorStop(1, "rgba(" + color + ", 0.3)");
    var t0 = null;

    function line(points) {
      ctx.beginPath();
      points.forEach(function (p, k) {
        var s = fisheye(p[0], p[1]);
        var X = half + s[0] * scale;
        var Y = half + s[1] * scale;
        if (k) ctx.lineTo(X, Y);
        else ctx.moveTo(X, Y);
      });
      ctx.stroke();
    }

    function draw(t) {
      if (!canvas.isConnected) return;
      if (t0 === null) t0 = t;
      var shift = (((t - t0) / 1000) * SPEED) % GAP;
      var ox = dx * shift;
      var oy = dy * shift;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = stroke;
      ctx.lineWidth = Math.max(1, dpr);
      for (var a = -REACH; a <= REACH + 0.001; a += GAP) {
        var v = [], h = [];
        for (var b = -REACH; b <= REACH + 0.001; b += REACH / 24) {
          v.push([a + ox, b]);
          h.push([b, a + oy]);
        }
        line(v);
        line(h);
      }
      if (!reduce) gridRaf = requestAnimationFrame(draw);
    }

    if (reduce) draw(0);
    else gridRaf = requestAnimationFrame(draw);
  }

  function showPrize(i, animate) {
    var item = items[i];
    prize.style.setProperty("--c", item.color);
    prize.style.setProperty("--c-rgb", rgb(item.color));
    slip.innerHTML =
      '<div class="capsulas__dex">' +
      '<div class="capsulas__dex-top" aria-hidden="true">' +
      '<span class="capsulas__dex-lens"></span><span class="capsulas__dex-led"></span>' +
      '<span class="capsulas__dex-led"></span><span class="capsulas__dex-led"></span>' +
      "</div>" +
      '<div class="capsulas__dex-screen">' +
      '<div class="capsulas__dex-entry">' +
      '<div class="capsulas__dex-sprite"><canvas class="capsulas__dex-grid" aria-hidden="true"></canvas><span class="capsulas__dex-tag" style="--chars: ' + (item.tag.length + 2) + '">&lt;' + item.tag + "&gt;</span></div>" +
      '<p class="capsulas__dex-desc grafico-exp">' + item.desc + "</p>" +
      "</div>" +
      (item.example
        ? '<div class="capsulas__demo"><div class="capsulas__src code">' + codeHTML(item.example) + "</div>" +
          '<div class="capsulas__out">' + item.example + "</div></div>"
        : "") +
      '<div class="capsulas__dex-foot" aria-hidden="true"><span class="capsulas__dex-btn"></span><span class="capsulas__dex-speaker"></span></div>' +
      "</div>" +
      "</div>" +
      '<span class="capsulas__roll" aria-hidden="true"></span>';
    startGrid(slip.querySelector(".capsulas__dex-grid"), rgb(item.color));
    prize.classList.remove("is-open", "is-rolling", "is-closing", "is-leaving", "is-empty");
    if (!animate || reduce) {
      prize.classList.add("is-open");
      return;
    }
    void prize.offsetWidth;
    prize.classList.add("is-rolling");
    setTimeout(function () {
      prize.classList.add("is-open");
    }, 760);
  }

  // ---------- Ventana en pantallas angostas ----------
  var COMPACT_AT = 820; // ancho mínimo para máquina (290) + espacio + ficha
  var compact = false;
  var modalOpen = false;
  var bodyOverflow = "";
  prize.setAttribute("tabindex", "-1");

  function layout() {
    var w = (root.parentElement || root).clientWidth;
    var c = w < COMPACT_AT;
    if (c === compact) return;
    if (!c) closeModal();
    compact = c;
    root.classList.toggle("is-compact", c);
    if (c) {
      prize.setAttribute("role", "dialog");
      prize.setAttribute("aria-modal", "true");
      prize.removeAttribute("aria-live");
    } else {
      prize.removeAttribute("role");
      prize.removeAttribute("aria-modal");
      prize.setAttribute("aria-live", "polite");
    }
  }

  function openModal() {
    if (!compact) return;
    modalOpen = true;
    root.classList.add("has-modal");
    bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    prize.scrollTop = 0;
    prize.focus({ preventScroll: true });
  }

  function closeModal() {
    if (!modalOpen) return;
    modalOpen = false;
    root.classList.remove("has-modal");
    document.body.style.overflow = bodyOverflow;
    if (prize.contains(document.activeElement)) knob.focus({ preventScroll: true });
  }

  // Cualquier toque fuera de la ficha la cierra (el fondo, la cápsula abierta…).
  prize.addEventListener("click", function (e) {
    if (modalOpen && !e.target.closest(".capsulas__dex")) closeModal();
  });

  document.addEventListener("keydown", function (e) {
    if (modalOpen && e.key === "Escape") closeModal();
  });

  layout();
  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(layout).observe(root.parentElement || root);
  } else {
    window.addEventListener("resize", layout);
  }

  // La cápsula que está abierta en la ficha (todavía no va a la repisa).
  var current = null;

  // La cápsula de la ficha se cierra, sale rodando por la derecha (como entró
  // por la izquierda) y pasa a la repisa.
  function retire() {
    if (current === null) return;
    var i = current;
    current = null;
    prize.classList.remove("is-open", "is-rolling");
    if (reduce || compact) {
      prize.classList.add("is-empty");
      toShelf(i, !reduce);
      return;
    }
    prize.classList.add("is-closing");
    setTimeout(function () {
      prize.classList.add("is-leaving");
      setTimeout(function () {
        prize.classList.remove("is-closing", "is-leaving");
        if (current === null) prize.classList.add("is-empty");
        toShelf(i, true);
      }, 750);
    }, 420);
  }

  // Revuelve, deja caer la cápsula i por el fondo y la abre.
  function pick(i) {
    if (busy || caps[i].classList.contains("is-gone")) return;
    busy = true;
    spin();
    retire();
    if (reduce) {
      setGone(caps[i], true);
      current = i;
      updateKnob();
      showPrize(i, false);
      openModal();
      busy = false;
      return;
    }
    simulate(1000, 1500);
    setTimeout(function () {
      // Sale por abajo: ya no choca con nada y la gravedad la saca del domo.
      var b = bodies[i];
      b.falling = true;
      b.vy = Math.max(b.vy, 250);
      simulate(0, 1000); // las demás se acomodan en el hueco
      setTimeout(function () {
        setGone(caps[i], true);
        b.falling = false;
        current = i;
        updateKnob();
        showPrize(i, true);
        openModal();
        setTimeout(function () {
          busy = false;
        }, 900);
      }, 350);
    }, 1250);
  }

  // Vuelve a llenar: las cápsulas caen desde arriba y se acomodan.
  function refill() {
    busy = true;
    spin();
    resetDemo();
    var c = dome.clientWidth / 2;
    bodies.forEach(function (b, k) {
      b.x = c + (Math.random() - 0.5) * 110;
      b.y = 30 + (k % 3) * 10;
      b.vx = (Math.random() - 0.5) * 120;
      b.vy = Math.random() * 80;
      b.falling = false;
      render(b);
      setGone(b.el, false);
    });
    updateKnob();
    if (reduce) {
      for (var s = 0; s < 480; s++) step(bodies, 1 / 240, 0.3, true);
      bodies.forEach(render);
      busy = false;
      return;
    }
    simulate(0, 1800);
    setTimeout(function () {
      busy = false;
    }, 1200);
  }

  knob.addEventListener("click", function () {
    if (busy) return;
    var l = left();
    if (!l.length) {
      // Primero la última cápsula se va a la repisa; la siguiente vuelta rellena.
      if (current !== null) {
        spin();
        retire();
        updateKnob();
      } else {
        refill();
      }
      return;
    }
    pick(caps.indexOf(l[Math.floor(Math.random() * l.length)]));
  });

  // ---------- Repisa y ejemplo que se arma ----------
  var demo = document.querySelector("[data-capsulas-demo]");
  var resetDemo = function () {};
  var toShelf = function () {};

  if (demo) (function () {
    var code = demo.querySelector('[class*="col-"]:first-child .code');
    var view = demo.querySelector(".example .container-fluid") || demo.querySelector('[class*="col-"]:last-child');
    if (!code || !view) return;

    // Repisa de madera flotando arriba del ejemplo. Si no caben todas las
    // cápsulas en una tabla, se ponen más tablas debajo.
    var shelf = document.createElement("div");
    shelf.className = "capsulas__repisa";
    shelf.setAttribute("role", "group");
    shelf.setAttribute("aria-label", "Repisa con tus cápsulas");
    demo.parentNode.insertBefore(shelf, demo);
    var shelfCaps = []; // de izquierda a derecha
    var perRow = 0;
    var CAP = 50, GAP = 10, PAD = 16;

    function capacity() {
      var w = Math.min(shelf.clientWidth, 720);
      return Math.max(1, Math.floor((w - PAD * 2 + GAP) / (CAP + GAP)));
    }

    function buildShelf() {
      perRow = capacity();
      var rows = Math.max(1, Math.ceil(shelfCaps.length / perRow));
      var levels = shelf.children;
      while (levels.length < rows) {
        var lv = document.createElement("div");
        lv.className = "capsulas__nivel";
        lv.innerHTML = '<div class="capsulas__nivel-caps"></div><span class="capsulas__tabla" aria-hidden="true"></span>';
        shelf.appendChild(lv);
      }
      while (levels.length > rows) shelf.removeChild(shelf.lastChild);
      shelfCaps.forEach(function (c, k) {
        var row = levels[Math.floor(k / perRow)].firstChild;
        var at = row.children[k % perRow];
        if (at !== c) row.insertBefore(c, at || null);
      });
    }

    // Reacomoda las tablas; las cápsulas que ya estaban se deslizan a su nuevo lugar.
    function relayout(animate) {
      var before = shelfCaps.map(function (c) {
        return c.isConnected ? c.getBoundingClientRect() : null;
      });
      buildShelf();
      if (!animate || reduce) return;
      shelfCaps.forEach(function (c, k) {
        var a = before[k];
        if (!a || !c.animate) return;
        var b = c.getBoundingClientRect();
        var dx = a.left - b.left, dy = a.top - b.top;
        if (dx || dy) {
          c.animate([{ transform: "translate(" + dx + "px, " + dy + "px)" }, { transform: "none" }], {
            duration: 450,
            easing: "cubic-bezier(0.3, 1.2, 0.5, 1)",
          });
        }
      });
    }

    if (typeof ResizeObserver !== "undefined") {
      new ResizeObserver(function () {
        if (capacity() !== perRow) buildShelf();
      }).observe(shelf);
    }

    demo.setAttribute("aria-label", "Ejemplo: suelta aquí tus cápsulas");

    var lines = []; // índices de items, en el orden del ejemplo
    var drag = null, picked = null, marks = null, scrollRaf = 0;

    function lineCode(i) {
      return ["<p>", "  " + items[i].example, "</p>"];
    }

    function render(nuevo) {
      // lesson-demo.js iguala el alto del código con la vista al cargar; como
      // el ejemplo crece, se quita ese alto y vuelve el de .lesson-demo--scroll.
      code.style.maxHeight = "";
      if (!lines.length) {
        code.innerHTML = '<span class="capsulas__vacio">Suelta aquí tus cápsulas</span>';
        view.innerHTML = '<div class="capsulas__vacio">Aquí se verá tu página</div>';
        return;
      }
      var c = "", h = "";
      lines.forEach(function (i, k) {
        var cls = k === nuevo ? " is-new" : "";
        Codigo.colorear(lineCode(i), "html").forEach(function (pedazos) {
          c += '<span class="ld-line' + cls + '" data-k="' + k + '">' + Codigo.html([pedazos]) + "</span>";
        });
        h += '<p data-k="' + k + '"' + (cls ? ' class="is-new"' : "") + ">" + items[i].example + "</p>";
      });
      code.innerHTML = c;
      view.innerHTML = h;
      // Que lesson-demo.js vuelva a igualar el alto con la vista ya crecida.
      window.dispatchEvent(new Event("resize"));
      if (nuevo == null) return;
      // Que el párrafo nuevo se vea dentro del código (que tiene su propio scroll).
      var first = code.querySelector('.ld-line[data-k="' + nuevo + '"]');
      if (first && code.scrollHeight > code.clientHeight) {
        var top = first.offsetTop - code.offsetTop;
        if (top < code.scrollTop || top + first.offsetHeight * 3 > code.scrollTop + code.clientHeight) {
          code.scrollTo({ top: Math.max(0, top - 24), behavior: reduce ? "auto" : "smooth" });
        }
      }
    }

    // Lugar donde entra: antes del primer párrafo cuyo centro queda debajo del puntero.
    function slot(x, y) {
      var el = document.elementFromPoint(x, y);
      var pane = el && (code.contains(el) ? code : view.contains(el) ? view : null);
      if (!pane) return lines.length;
      for (var k = 0; k < lines.length; k++) {
        var rows = pane.querySelectorAll('[data-k="' + k + '"]');
        if (!rows.length) continue;
        var a = rows[0].getBoundingClientRect(), b = rows[rows.length - 1].getBoundingClientRect();
        if (y < (a.top + b.bottom) / 2) return k;
      }
      return lines.length;
    }

    function clearMarks() {
      if (marks) marks.forEach(function (m) { m.remove(); });
      marks = null;
    }

    function showMarks(x, y) {
      clearMarks();
      if (!lines.length) return;
      var k = slot(x, y);
      marks = [code, view].map(function (pane) {
        var m = document.createElement("span");
        m.className = "capsulas__raya";
        pane.insertBefore(m, pane.querySelector('[data-k="' + k + '"]'));
        return m;
      });
    }

    function over(x, y) {
      var el = document.elementFromPoint(x, y);
      return !!el && demo.contains(el);
    }

    function hover(on, x, y) {
      demo.classList.toggle("is-over", on);
      if (on) showMarks(x, y);
      else clearMarks();
    }

    function drop(i, k) {
      clearMarks();
      demo.classList.remove("is-over");
      lines.splice(k, 0, i);
      render(k);
    }

    function pop(x, y, color) {
      if (reduce) return;
      var p = document.createElement("div");
      p.className = "capsulas__pop";
      p.style.left = x + "px";
      p.style.top = y + "px";
      p.style.setProperty("--c", color);
      p.innerHTML = "<span></span><span></span>";
      document.body.appendChild(p);
      setTimeout(function () { p.remove(); }, 600);
    }

    function used(el) {
      var k = shelfCaps.indexOf(el);
      if (k >= 0) shelfCaps.splice(k, 1);
      el.remove();
      relayout(true);
    }

    // Si el puntero llega a la orilla de la pantalla, la página se desplaza sola.
    function autoScroll() {
      if (!drag) { scrollRaf = 0; return; }
      var edge = 70, v = 0;
      if (drag.y < edge + 65) v = -(edge + 65 - drag.y) / 4; // 65: encabezado fijo
      else if (drag.y > innerHeight - edge) v = (drag.y - (innerHeight - edge)) / 4;
      if (v) {
        window.scrollBy(0, v);
        hover(over(drag.x, drag.y), drag.x, drag.y);
      }
      scrollRaf = requestAnimationFrame(autoScroll);
    }

    function setPicked(p) {
      if (picked) picked.el.classList.remove("is-picked");
      picked = p;
      if (p) p.el.classList.add("is-picked");
      document.body.classList.toggle("capsulas-picking", !!p);
      if (p) demo.setAttribute("tabindex", "0");
      else demo.removeAttribute("tabindex");
    }

    function makeCap(i, animate) {
      var item = items[i];
      var b = document.createElement("button");
      b.type = "button";
      b.className = "capsulas__suelta" + (animate && !reduce ? " is-new" : "");
      b.style.setProperty("--c", item.color);
      b.setAttribute("aria-label", "Cápsula de la etiqueta " + item.tag + ": arrástrala al ejemplo");
      var sticker = document.createElement("span");
      sticker.className = "capsulas__sticker" + (item.tag.length > 4 ? " is-long" : "");
      sticker.textContent = "<" + item.tag + ">";
      b.appendChild(sticker);

      b.addEventListener("pointerdown", function (e) {
        if (e.button !== 0) return;
        var sx = e.clientX, sy = e.clientY, started = false, ghost = null;
        try { b.setPointerCapture(e.pointerId); } catch (err) {}
        function move(ev) {
          var x = ev.clientX, y = ev.clientY;
          if (!started) {
            if (Math.abs(x - sx) + Math.abs(y - sy) < 6) return;
            started = true;
            setPicked(null);
            ghost = b.cloneNode(true);
            ghost.classList.remove("is-new", "is-picked");
            ghost.classList.add("is-ghost");
            ghost.removeAttribute("aria-label");
            ghost.setAttribute("aria-hidden", "true");
            document.body.appendChild(ghost);
            b.classList.add("is-held");
            drag = { x: x, y: y };
            if (!scrollRaf) scrollRaf = requestAnimationFrame(autoScroll);
          }
          drag.x = x;
          drag.y = y;
          ghost.style.left = x + "px";
          ghost.style.top = y + "px";
          ghost.style.setProperty("--r", Math.max(-20, Math.min(20, (x - sx) / 12)) + "deg");
          hover(over(x, y), x, y);
        }
        function up(ev) {
          b.removeEventListener("pointermove", move);
          b.removeEventListener("pointerup", up);
          b.removeEventListener("pointercancel", up);
          if (!started) {
            if (ev.type === "pointerup") setPicked(picked && picked.el === b ? null : { el: b, i: i });
            return;
          }
          var x = ev.clientX, y = ev.clientY;
          var ok = ev.type === "pointerup" && over(x, y);
          var k = ok ? slot(x, y) : 0;
          hover(false);
          drag = null;
          if (ok) {
            ghost.remove();
            pop(x, y, item.color);
            drop(i, k);
            used(b);
            return;
          }
          // Fuera del ejemplo: regresa a su lugar en la repisa.
          var r = b.getBoundingClientRect();
          ghost.classList.add("is-back");
          ghost.style.left = r.left + r.width / 2 + "px";
          ghost.style.top = r.top + r.height / 2 + "px";
          setTimeout(function () {
            ghost.remove();
            b.classList.remove("is-held");
          }, reduce ? 0 : 360);
        }
        b.addEventListener("pointermove", move);
        b.addEventListener("pointerup", up);
        b.addEventListener("pointercancel", up);
      });
      // El clic ya lo maneja pointerup; con el teclado, Enter o Espacio la elige.
      b.addEventListener("click", function (e) {
        e.preventDefault();
      });
      b.addEventListener("keydown", function (e) {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        setPicked(picked && picked.el === b ? null : { el: b, i: i });
      });
      return b;
    }

    // Con una cápsula elegida, tocar el ejemplo la suelta ahí.
    document.addEventListener("click", function (e) {
      if (!picked || e.target.closest(".capsulas__suelta")) return;
      if (!demo.contains(e.target)) { setPicked(null); return; }
      var p = picked;
      setPicked(null);
      var k = e.detail === 0 ? lines.length : slot(e.clientX, e.clientY);
      pop(e.clientX, e.clientY, items[p.i].color);
      drop(p.i, k);
      used(p.el);
    });

    document.addEventListener("keydown", function (e) {
      if (!picked) return;
      if (e.key === "Escape") setPicked(null);
      if ((e.key === "Enter" || e.key === " ") && e.target === demo) {
        e.preventDefault();
        var p = picked;
        setPicked(null);
        drop(p.i, lines.length);
        used(p.el);
        p.el = null;
        var next = shelf.querySelector(".capsulas__suelta");
        (next || knob).focus({ preventScroll: true });
      }
    });

    // Entra rodando por la izquierda y las demás se recorren a la derecha.
    toShelf = function (i, animate) {
      shelfCaps.unshift(makeCap(i, animate));
      relayout(animate);
    };

    resetDemo = function () {
      setPicked(null);
      lines = [];
      shelfCaps.forEach(function (c) { c.remove(); });
      shelfCaps = [];
      buildShelf();
      render();
    };

    resetDemo();
  })();

  var first = 0;
  items.forEach(function (item, i) {
    if (item.start) first = i;
  });
  setGone(caps[first], true);
  current = first;
  showPrize(first, false);
  updateKnob();
})();
