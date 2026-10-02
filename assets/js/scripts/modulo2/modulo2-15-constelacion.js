/* Módulo 2-15: entidades como una constelación.
   - Une los puntos con una línea (SVG) en el orden en que están en el HTML.
   - Al elegir un punto, una burbuja de vidrio líquido se desliza sobre él y
     arriba aparece un globo con sus datos.
   - La línea (punteada) se dibuja y los puntos aparecen cuando la
     constelación entra en pantalla.
   - Los puntos flotan suavemente y la línea los sigue; el elegido se queda
     quieto bajo la burbuja. Con "reducir movimiento" no flotan.
   - Con ← → se pasa al punto anterior o siguiente. */
(function () {
  "use strict";

  var root = document.querySelector("[data-const]");
  if (!root) return;

  var stars = Array.prototype.slice.call(root.querySelectorAll(".const__star"));
  var sky = root.querySelector(".const__sky");
  var svg = root.querySelector(".const__lines");
  var path = svg.querySelector(".const__path");
  var reveal = svg.querySelector(".const__reveal");
  var bubble = root.querySelector(".const__bubble");
  var lens = root.querySelector(".const__lens");

  // Posición de cada punto en % (de --x / --y del HTML).
  function pos(star) {
    var st = star.style;
    return {
      x: parseFloat(st.getPropertyValue("--x")),
      y: parseFloat(st.getPropertyValue("--y")),
    };
  }

  stars.forEach(function (star, i) {
    star.style.setProperty("--i", i);
  });

  // ---------- Flotación ----------
  // Cada punto flota con su propio ritmo; la línea se recalcula en cada
  // cuadro para seguirlos. El punto elegido se detiene suavemente.
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var float = stars.map(function (_, i) {
    return {
      phase: i * 1.9,
      sx: 0.55 + (i % 3) * 0.12, // velocidades distintas en x y en y
      sy: 0.7 + (i % 4) * 0.1,
      w: 1, // 1 = flota, 0 = quieto (punto elegido)
      fx: 0,
      fy: 0,
    };
  });

  function amplitude() {
    return sky.clientWidth < 500 ? 4 : 7;
  }

  function updateFloat(t) {
    var a = amplitude();
    stars.forEach(function (star, i) {
      var f = float[i];
      var target = star.getAttribute("aria-pressed") === "true" ? 0 : 1;
      f.w += (target - f.w) * 0.08;
      f.fx = a * Math.sin(t * f.sx + f.phase) * f.w;
      f.fy = a * Math.cos(t * f.sy + f.phase * 1.3) * f.w;
      star.style.setProperty("--fx", f.fx.toFixed(2) + "px");
      star.style.setProperty("--fy", f.fy.toFixed(2) + "px");
    });
  }

  // Dibuja la línea con las medidas reales del área de puntos (en px), así
  // el trazo no se deforma, sumando cuánto se ha movido cada punto.
  function drawLine() {
    var w = sky.clientWidth;
    var h = sky.clientHeight;
    svg.setAttribute("viewBox", "0 0 " + w + " " + h);
    var pts = stars
      .map(function (s, i) {
        var p = pos(s);
        return (
          ((p.x * w) / 100 + float[i].fx).toFixed(1) + "," + ((p.y * h) / 100 + float[i].fy).toFixed(1)
        );
      })
      .join(" ");
    path.setAttribute("points", pts);
    reveal.setAttribute("points", pts);
  }

  function measureLine() {
    // Margen extra por la flotación, para que la máscara cubra toda la línea.
    root.style.setProperty("--len", Math.ceil(reveal.getTotalLength()) + 80);
  }

  var running = false;
  function frame(now) {
    if (!running) return;
    updateFloat(now / 1000);
    drawLine();
    requestAnimationFrame(frame);
  }

  function setFloating(on) {
    if (reduce || on === running) return;
    running = on;
    if (on) requestAnimationFrame(frame);
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // Coloca la burbuja arriba del punto sin salirse por los lados.
  function placeBubble(star) {
    var w = root.clientWidth;
    var p = pos(star);
    // Centro del punto dentro de la constelación (el área de puntos tiene margen).
    var cx = sky.offsetLeft + (p.x * sky.clientWidth) / 100;
    var cy = sky.offsetTop + (p.y * sky.clientHeight) / 100;
    var bw = bubble.offsetWidth;
    var bh = bubble.offsetHeight;
    var left = Math.max(0, Math.min(w - bw, cx - bw / 2));
    bubble.style.left = left + "px";
    bubble.style.top = cy - bh - lens.offsetHeight / 2 - 14 + "px";
    bubble.style.setProperty("--tail", Math.max(18, Math.min(bw - 18, cx - left)) + "px");
  }

  // Desliza la burbuja de vidrio sobre el punto; se estira hacia donde va.
  var lensAt = null;
  function moveLens(star) {
    var p = pos(star);
    var x = (p.x * sky.clientWidth) / 100;
    var y = (p.y * sky.clientHeight) / 100;
    if (lensAt) {
      var dx = x - lensAt.x;
      var dy = y - lensAt.y;
      if (dx || dy) {
        lens.style.setProperty("--a", Math.atan2(dy, dx) + "rad");
        lens.classList.remove("is-moving");
        void lens.offsetWidth;
        lens.classList.add("is-moving");
      }
    }
    // En % (como los puntos) para que siga centrada aunque cambie el ancho.
    lens.style.setProperty("--lx", p.x + "%");
    lens.style.setProperty("--ly", p.y + "%");
    lens.classList.add("is-ready");
    lensAt = { x: x, y: y };
  }

  function select(star) {
    stars.forEach(function (s) {
      s.setAttribute("aria-pressed", s === star ? "true" : "false");
      s.tabIndex = s === star ? 0 : -1;
    });
    var d = star.dataset;
    bubble.innerHTML =
      '<div class="const__bubble-head"><span class="const__bubble-char">' + esc(d.show) + "</span>" +
      '<p class="const__bubble-title">' + esc(d.desc) + "</p></div>" +
      "<dl><dt>Nombre</dt><dd><code>" + esc(d.name) + "</code></dd>" +
      "<dt>Número</dt><dd><code>" + esc(d.num) + "</code></dd></dl>";
    bubble.hidden = false;
    // Reinicia la animación de aparición de la burbuja.
    bubble.style.animation = "none";
    void bubble.offsetWidth;
    bubble.style.animation = "";
    moveLens(star);
    placeBubble(star);
  }

  stars.forEach(function (star, i) {
    star.addEventListener("click", function () {
      select(star);
    });
    star.addEventListener("keydown", function (e) {
      var to = null;
      if (e.key === "ArrowRight") to = stars[(i + 1) % stars.length];
      else if (e.key === "ArrowLeft") to = stars[(i - 1 + stars.length) % stars.length];
      if (!to) return;
      e.preventDefault();
      to.focus();
      select(to);
    });
  });

  window.addEventListener("resize", function () {
    drawLine();
    measureLine();
    var cur = root.querySelector('.const__star[aria-pressed="true"]');
    if (cur) {
      lensAt = null; // al cambiar el tamaño se recoloca sin animación
      moveLens(cur);
      placeBubble(cur);
    }
  });

  drawLine();
  measureLine();
  select(stars[1]);

  // Se dibuja al entrar en pantalla.
  if (typeof IntersectionObserver === "undefined") {
    root.classList.add("is-visible");
    setFloating(true);
  } else {
    new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) root.classList.add("is-visible");
          // Solo flota mientras se ve, para no gastar recursos.
          setFloating(entry.isIntersecting);
        });
      },
      { threshold: 0.25 }
    ).observe(root);
  }
})();
