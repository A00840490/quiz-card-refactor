/* Módulo 1-5: barra de actividad de VS Code.
   - Clic en un ícono: lo marca y despliega su explicación.
   - Clic en el ícono ya marcado: cierra la explicación (como en VS Code).
   - Flechas ← →, Inicio y Fin: moverse entre íconos con el teclado. */
(function () {
  "use strict";

  document.querySelectorAll("[data-vsc-bar]").forEach(function (bar) {
    var tabs = Array.prototype.slice.call(bar.querySelectorAll('[role="tab"]'));

    function select(tab) {
      var open = tab && tab.getAttribute("aria-selected") !== "true";
      tabs.forEach(function (t) {
        var on = open && t === tab;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on || (!open && t === tab) ? 0 : -1;
        document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
      });
      bar.classList.toggle("is-open", open);
    }

    tabs.forEach(function (tab, i) {
      tab.tabIndex = i === 0 ? 0 : -1;
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
        if (bar.classList.contains("is-open")) select(to);
      });
    });
  });
})();
