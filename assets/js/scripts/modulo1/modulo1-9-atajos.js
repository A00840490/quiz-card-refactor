/* Módulo 1-9: atajos de teclado.
   - Cada tarjeta se abre o cierra al hacer clic en su encabezado.
   - Las teclas se dibujan a partir de data-win y data-mac de cada atajo:
     "+" une teclas que se presionan juntas y un espacio separa pasos
     ("Ctrl+K Ctrl+S" = Ctrl+K y después Ctrl+S).
   - El selector Windows / Mac cambia qué combinación se muestra. */
(function () {
  "use strict";

  var root = document.querySelector("[data-sc]");
  if (!root) return;

  var MOUSE =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" aria-hidden="true"><rect x="6" y="3" width="12" height="18" rx="6"/>' +
    '<path d="M12 7v4"/></svg>';

  // Texto de cada tecla según el sistema.
  var LABELS = {
    win: { Ctrl: "Ctrl", Alt: "Alt", Shift: "Shift", Up: "↑", Down: "↓", Click: MOUSE + "Clic" },
    mac: { Cmd: "⌘ Cmd", Option: "⌥ Option", Shift: "⇧ Shift", Up: "↑", Down: "↓", Click: MOUSE + "Clic" },
  };

  function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function keysHtml(combo, os) {
    return combo
      .split(" ")
      .map(function (step) {
        return step
          .split("+")
          .map(function (k) {
            var label = LABELS[os][k] || esc(k);
            return '<kbd class="sc__key">' + label + "</kbd>";
          })
          .join('<span class="sc__plus">+</span>');
      })
      .join('<span class="sc__then">y después</span>');
  }

  function setOs(os) {
    root.querySelectorAll("[data-win]").forEach(function (el) {
      var combo = el.getAttribute("data-" + os) || el.getAttribute("data-win");
      el.innerHTML = keysHtml(combo, os);
      el.setAttribute(
        "aria-label",
        combo
          .split(" ")
          .map(function (step) {
            return step.split("+").join(" + ");
          })
          .join(", y después, ")
      );
    });
    root.querySelectorAll("[data-os]").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-os") === os ? "true" : "false");
    });
  }

  root.querySelectorAll("[data-os]").forEach(function (b) {
    b.addEventListener("click", function () {
      setOs(b.getAttribute("data-os"));
    });
  });

  root.querySelectorAll(".sc__card").forEach(function (card) {
    var head = card.querySelector(".sc__head");
    var body = card.querySelector(".sc__body");
    head.addEventListener("click", function () {
      var open = !card.classList.contains("is-open");
      card.classList.toggle("is-open", open);
      head.setAttribute("aria-expanded", open ? "true" : "false");
      body.setAttribute("aria-hidden", open ? "false" : "true");
    });
  });

  var isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  setOs(isMac ? "mac" : "win");
})();
