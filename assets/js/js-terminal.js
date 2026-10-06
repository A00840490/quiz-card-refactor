/* Terminal de JavaScript (estilos en assets/css/js-terminal.css).
   - Escribe el código letra por letra la primera vez que aparece en pantalla.
   - Al terminar muestra el botón ▶ Correr solo si el bloque tiene
     data-result (sin él, el código no muestra nada y no hay botón); al
     presionarlo se quita, gira una rueda de carga y luego aparece en blanco
     "Resultado: ..." con el cursor parpadeando al final.
   - Con "reducir movimiento" el código aparece completo de inmediato. */
(function () {
  "use strict";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll(".js-term").forEach(function (term) {
    var src = term.querySelector(".js-term__src");
    // Las terminales que arma otro script (sin .js-term__src) se dejan igual.
    if (!src) return;
    var text = src.textContent.replace(/^\n+|\s+$/g, "");

    var bar = document.createElement("div");
    bar.className = "js-term__bar";
    bar.innerHTML = "<i></i><i></i><i></i>" + (term.getAttribute("data-file") || "script.js");

    var body = document.createElement("div");
    body.className = "js-term__body";
    var code = document.createElement("pre");
    code.className = "js-term__code";
    code.setAttribute("aria-label", text);
    var row = document.createElement("div");
    row.className = "js-term__run-row";
    row.setAttribute("aria-live", "polite");
    body.appendChild(code);
    body.appendChild(row);

    term.insertBefore(bar, src);
    term.appendChild(body);
    term.classList.add("is-ready");

    var cursor = '<span class="js-term__cursor" aria-hidden="true"></span>';

    function esc(s) {
      return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    // Pinta los comentarios (desde // hasta el final de la línea).
    function paint(s) {
      return s
        .split("\n")
        .map(function (line) {
          var i = line.indexOf("//");
          return i === -1
            ? esc(line)
            : esc(line.slice(0, i)) + '<span class="js-term__com">' + esc(line.slice(i)) + "</span>";
        })
        .join("\n");
    }

    function showRun() {
      code.innerHTML = paint(text);
      if (!term.hasAttribute("data-result")) return;
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "js-term__run";
      btn.textContent = "Correr";
      btn.addEventListener("click", run);
      row.appendChild(btn);
    }

    function run() {
      row.innerHTML =
        '<span class="js-term__loading" role="status" aria-label="Ejecutando"><span class="js-term__spinner"></span></span>';
      setTimeout(function () {
        row.innerHTML =
          '<span class="js-term__result">Resultado: ' + esc(term.getAttribute("data-result") || "") + cursor + "</span>";
      }, 1100);
    }

    function type() {
      if (reduce) return showRun();
      var i = 0;
      // Los bloques largos se escriben más rápido para no tardar demasiado.
      var speed = Math.max(8, Math.min(26, Math.round(2600 / text.length)));
      (function tick() {
        i++;
        code.innerHTML = paint(text.slice(0, i)) + cursor;
        if (i < text.length) {
          // Pausa un poco más en saltos de línea, como al teclear
          setTimeout(tick, text[i - 1] === "\n" ? 120 : speed);
        } else {
          setTimeout(showRun, 250);
        }
      })();
    }

    // Se escribe solo la primera vez que entra en pantalla
    if (!("IntersectionObserver" in window)) return showRun();
    var io = new IntersectionObserver(
      function (entries) {
        if (entries[0].isIntersecting) {
          io.disconnect();
          type();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(term);
  });
})();
