/* Tema 9 (modulo3-10): botón desarmado en capas.
   El botón empieza desarmado; con el scroll se recorre cada capa (una
   propiedad de color por capa) de arriba hacia abajo y, después de la
   última explicación, el botón se arma. Subiendo, se vuelve a desarmar.

   Los textos de cada capa están en el HTML ([data-capa]); aquí solo se
   define cómo se dibuja cada una. */
(function () {
  "use strict";

  // Capas de abajo hacia arriba, en el orden en que el navegador las pinta.
  var LAYERS = [
    { name: "box-shadow", cls: "shadow", color: "#062a66", value: "0 10px 0 #062a66" },
    { name: "background-color", cls: "bg", color: "#0a3d91" },
    { name: "border-color", cls: "border", color: "#7fb8ff" },
    { name: "text-shadow", cls: "tshadow", text: true, color: "#062a66", value: "3px 3px 0 #062a66" },
    { name: "color", cls: "color", text: true, color: "#ffffff" },
    { name: "text-decoration-color", cls: "deco", text: true, color: "#ffcb6b" },
  ];
  var LABEL = "Inscríbete";

  var root = document.querySelector("[data-capas]");
  if (!root) return;
  var rig = root.querySelector("[data-rig]");
  var sticky = root.querySelector(".capas__sticky");
  var callout = root.querySelector("[data-callout]");
  var dotsBox = root.querySelector("[data-dots]");
  var hint = root.querySelector("[data-hint]");
  var svg = root.querySelector("[data-connector]");
  var path = svg.querySelector("path");
  var dot = svg.querySelector("circle");

  function byName(name) {
    for (var i = 0; i < LAYERS.length; i++) if (LAYERS[i].name === name) return i;
    return -1;
  }

  // Pasos en el orden del HTML (de arriba hacia abajo); el último es el botón armado.
  var steps = Array.prototype.map.call(root.querySelectorAll("[data-capa]"), function (el) {
    return { layer: byName(el.getAttribute("data-capa")), html: el.innerHTML };
  });
  var final = root.querySelector("[data-capas-final]");
  var N = steps.length;

  var nodes = LAYERS.map(function (l, i) {
    var layer = document.createElement("div");
    layer.className = "capas__layer capas__layer--" + l.cls;
    layer.style.setProperty("--i", i);
    layer.style.setProperty("--v", l.color);
    var paint = document.createElement("div");
    if (l.text) {
      paint.className = "capas__text";
      paint.innerHTML = "<span>" + LABEL + "</span>";
    } else {
      paint.className = "capas__paint";
    }
    layer.appendChild(paint);
    rig.appendChild(layer);
    return layer;
  });

  var dots = [];
  for (var d = 0; d <= N; d++) dots.push(dotsBox.appendChild(document.createElement("span")));

  function decl(l) {
    return (
      '<span class="capas__prop">' + l.name + "</span>: " +
      '<span class="capas__swatch" style="background:' + l.color + '"></span>' +
      (l.value || l.color) + ";"
    );
  }

  function stepHtml(step) {
    if (step < N) {
      var l = LAYERS[steps[step].layer];
      return (
        '<span class="capas__count">Capa ' + (step + 1) + " de " + N + "</span>" +
        steps[step].html +
        '<code class="capas__line">' + decl(l) + "</code>"
      );
    }
    return (
      '<span class="capas__count">Botón armado</span>' +
      (final ? final.innerHTML : "") +
      '<pre><span class="capas__sel">.boton</span> {\n  border: 4px solid;\n' +
      LAYERS.map(function (l) {
        return "  " + decl(l);
      }).join("\n") +
      "\n}</pre>"
    );
  }

  var shown = -1;
  var swapTimer;
  function showStep(step) {
    if (step === shown) return;
    var first = shown === -1;
    shown = step;
    clearTimeout(swapTimer);
    dots.forEach(function (s, i) {
      s.classList.toggle("is-on", i <= step);
    });
    if (first) {
      callout.innerHTML = stepHtml(step);
      return;
    }
    callout.classList.add("is-swapping");
    swapTimer = setTimeout(function () {
      callout.innerHTML = stepHtml(step);
      callout.classList.remove("is-swapping");
      drawConnector();
    }, 180);
  }

  var active = -1;
  function update() {
    var top = parseFloat(getComputedStyle(sticky).top) || 0;
    var total = root.offsetHeight - sticky.offsetHeight;
    var p = Math.min(1, Math.max(0, (top - root.getBoundingClientRect().top) / Math.max(1, total)));
    // N tramos para las capas y 1 tramo para armar el botón.
    var seg = p * (N + 1);
    var step = Math.min(N, Math.floor(seg));
    var t = seg < N ? 1 : Math.max(0, 1 - (seg - N) * 1.6);
    rig.style.setProperty("--t", t.toFixed(3));
    active = step < N ? steps[step].layer : -1;
    nodes.forEach(function (n, i) {
      n.classList.toggle("is-active", i === active);
      n.classList.toggle("is-dim", active !== -1 && i !== active);
    });
    hint.classList.toggle("is-gone", p > 0.02);
    showStep(step);
    drawConnector();
  }

  // Línea de la capa activa a su explicación (solo en pantallas anchas).
  function drawConnector() {
    var h = callout.querySelector("h2");
    if (active === -1 || !h || getComputedStyle(svg).display === "none") {
      path.setAttribute("d", "");
      dot.setAttribute("r", 0);
      return;
    }
    var box = svg.getBoundingClientRect();
    var a = nodes[active].getBoundingClientRect();
    var b = h.getBoundingClientRect();
    var ax = a.right - box.left - 6;
    var ay = a.top + a.height * 0.35 - box.top;
    var bx = b.left - box.left - 14;
    var by = b.top + b.height / 2 - box.top;
    var mx = bx - 40;
    path.setAttribute(
      "d",
      "M" + ax + " " + ay + " C " + (ax + 60) + " " + ay + ", " + (mx - 30) + " " + by + ", " +
        mx + " " + by + " L " + bx + " " + by
    );
    dot.setAttribute("cx", ax);
    dot.setAttribute("cy", ay);
    dot.setAttribute("r", 4);
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      update();
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
})();
