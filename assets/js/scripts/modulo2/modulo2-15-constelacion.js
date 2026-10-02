/* Módulo 2-15: entidades como una constelación.
   - Une los puntos con una línea (SVG) en el orden en que están en el HTML.
   - Al elegir un punto aparece arriba una burbuja con sus datos.
   - La línea se dibuja y los puntos aparecen cuando la constelación entra
     en pantalla. Con ← → se pasa al punto anterior o siguiente. */
(function () {
  "use strict";

  var root = document.querySelector("[data-const]");
  if (!root) return;

  var stars = Array.prototype.slice.call(root.querySelectorAll(".const__star"));
  var sky = root.querySelector(".const__sky");
  var svg = root.querySelector(".const__lines");
  var line = svg.querySelector("polyline");
  var bubble = root.querySelector(".const__bubble");

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

  // Dibuja la línea con las medidas reales del área de puntos (en px), así
  // el trazo no se deforma. Se vuelve a calcular si cambia el tamaño.
  function drawLine() {
    var w = sky.clientWidth;
    var h = sky.clientHeight;
    svg.setAttribute("viewBox", "0 0 " + w + " " + h);
    line.setAttribute(
      "points",
      stars
        .map(function (s) {
          var p = pos(s);
          return ((p.x * w) / 100).toFixed(1) + "," + ((p.y * h) / 100).toFixed(1);
        })
        .join(" ")
    );
    root.style.setProperty("--len", Math.ceil(line.getTotalLength()));
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
    bubble.style.top = cy - bh - 44 + "px";
    bubble.style.setProperty("--tail", Math.max(18, Math.min(bw - 18, cx - left)) + "px");
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
    var cur = root.querySelector('.const__star[aria-pressed="true"]');
    if (cur) placeBubble(cur);
  });

  drawLine();
  select(stars[1]);

  // Se dibuja al entrar en pantalla.
  if (typeof IntersectionObserver === "undefined") {
    root.classList.add("is-visible");
  } else {
    new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) root.classList.add("is-visible");
        });
      },
      { threshold: 0.25 }
    ).observe(root);
  }
})();
