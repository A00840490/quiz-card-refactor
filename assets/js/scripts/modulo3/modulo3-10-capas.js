/* Tema 9 (modulo3-10): botón desarmado en capas.
   El botón empieza desarmado; con el control deslizante se recorre cada
   capa (una propiedad de color por capa) de arriba hacia abajo y, en el
   último paso, el botón se arma. Regresando, se vuelve a desarmar.

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
  var stage = root.querySelector(".capas__stage");
  var slider = root.querySelector("[data-slider]");
  var callout = root.querySelector("[data-callout]");
  var ticksBox = root.querySelector("[data-ticks]");
  var svg = root.querySelector("[data-connector]");
  var paths = svg.querySelectorAll("path");
  var dot = svg.querySelector("circle");
  var stageRects = svg.querySelectorAll("[data-stage-rect]");
  var maskAll = svg.querySelector("[data-mask-all]");

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

  slider.max = N;
  var ticks = [];
  for (var d = 0; d <= N; d++) {
    var tick = ticksBox.appendChild(document.createElement("span"));
    tick.textContent = d < N ? d + 1 : "armado";
    ticks.push(tick);
  }

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
        steps[step].html +
        '<code class="capas__line">' + decl(l) + "</code>"
      );
    }
    return (
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
    ticks.forEach(function (s, i) {
      s.classList.toggle("is-on", i === step);
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
  var t = 1;
  var anim;
  function update() {
    var step = +slider.value;
    slider.style.setProperty("--capas-fill", (step / N) * 100 + "%");
    slider.setAttribute("aria-valuetext", step < N ? LAYERS[steps[step].layer].name : "botón armado");
    active = step < N ? steps[step].layer : -1;
    nodes.forEach(function (n, i) {
      n.classList.toggle("is-active", i === active);
      n.classList.toggle("is-dim", active !== -1 && i !== active);
    });
    showStep(step);
    // El último paso arma el botón (t: 1 desarmado → 0 armado), con una transición corta.
    animateTo(step < N ? 1 : 0);
  }

  function animateTo(target) {
    cancelAnimationFrame(anim);
    var from = t;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var dur = reduce || from === target ? 0 : 600;
    var start = performance.now();
    (function frame(now) {
      var k = dur ? Math.min(1, (now - start) / dur) : 1;
      var e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      t = from + (target - from) * e;
      rig.style.setProperty("--t", t.toFixed(3));
      drawConnector();
      if (k < 1) anim = requestAnimationFrame(frame);
    })(start);
  }

  // Línea de la capa activa a su explicación (solo en pantallas anchas).
  function drawConnector() {
    var h = callout.querySelector("h2");
    if (active === -1 || !h || getComputedStyle(svg).display === "none") {
      setD("");
      dot.setAttribute("r", 0);
      return;
    }
    var box = svg.getBoundingClientRect();
    // El recuadro gris: dentro la línea es blanca, fuera es negra.
    var st = stage.getBoundingClientRect();
    for (var r = 0; r < stageRects.length; r++) {
      stageRects[r].setAttribute("x", st.left - box.left);
      stageRects[r].setAttribute("y", st.top - box.top);
      stageRects[r].setAttribute("width", st.width);
      stageRects[r].setAttribute("height", st.height);
    }
    maskAll.setAttribute("x", -box.width);
    maskAll.setAttribute("y", -box.height);
    maskAll.setAttribute("width", box.width * 3);
    maskAll.setAttribute("height", box.height * 3);
    var a = nodes[active].getBoundingClientRect();
    var b = h.getBoundingClientRect();
    var ax = a.right - box.left - 6;
    var ay = a.top + a.height * 0.35 - box.top;
    var bx = b.left - box.left - 14;
    var by = b.top + b.height / 2 - box.top;
    var mx = bx - 40;
    setD(
      "M" + ax + " " + ay + " C " + (ax + 60) + " " + ay + ", " + (mx - 30) + " " + by + ", " +
        mx + " " + by + " L " + bx + " " + by
    );
    dot.setAttribute("cx", ax);
    dot.setAttribute("cy", ay);
    dot.setAttribute("r", 4);
  }

  function setD(d) {
    for (var i = 0; i < paths.length; i++) paths[i].setAttribute("d", d);
  }

  slider.addEventListener("input", update);
  window.addEventListener("resize", drawConnector);
  update();
})();
