/* Módulo 1-9: atajos de teclado.
   - Los botones de categoría cambian la tabla que se muestra (también con ← →).
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
            return '<kbd class="sc__key">' + (LABELS[os][k] || esc(k)) + "</kbd>";
          })
          .join('<span class="sc__plus">+</span>');
      })
      .join('<span class="sc__then">y después</span>');
  }

  // Selector Windows / Mac
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

  // Botones de categoría
  var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));

  function select(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () {
      select(tab);
    });
    tab.addEventListener("keydown", function (e) {
      var to = null;
      if (e.key === "ArrowRight") to = tabs[(i + 1) % tabs.length];
      else if (e.key === "ArrowLeft") to = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === "Home") to = tabs[0];
      else if (e.key === "End") to = tabs[tabs.length - 1];
      if (!to) return;
      e.preventDefault();
      to.focus();
      select(to);
    });
  });

  var isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  setOs(isMac ? "mac" : "win");
  select(tabs[0]);
})();
