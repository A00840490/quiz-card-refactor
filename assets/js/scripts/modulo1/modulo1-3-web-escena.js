/* modulo1-3: la Web en acción (estilos en
   assets/css/modulos/modulo1/modulo1-3-web-escena.css).
   Los botones cambian el concepto activo; la escena y el texto se
   actualizan sólo con el atributo data-mode, las animaciones son CSS. */
(function () {
  "use strict";

  var root = document.querySelector("[data-web-escena]");
  if (!root) return;
  var tabs = Array.prototype.slice.call(root.querySelectorAll("[data-wa-tab]"));
  var count = root.querySelector("[data-wa-count]");
  var next = root.querySelector("[data-wa-next]");
  var modes = tabs.map(function (t) { return t.getAttribute("data-wa-tab"); });

  function select(mode, focus) {
    var i = modes.indexOf(mode);
    if (i < 0) return;
    root.setAttribute("data-mode", mode);
    tabs.forEach(function (t, j) {
      var on = j === i;
      t.classList.toggle("active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.setAttribute("tabindex", on ? "0" : "-1");
      if (on && focus) t.focus();
    });
    count.textContent = (i + 1) + " de " + modes.length;
  }

  tabs.forEach(function (t) {
    t.addEventListener("click", function (e) {
      e.preventDefault();
      select(t.getAttribute("data-wa-tab"));
    });
    t.addEventListener("keydown", function (e) {
      var step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!step) return;
      e.preventDefault();
      var i = modes.indexOf(root.getAttribute("data-mode"));
      select(modes[(i + step + modes.length) % modes.length], true);
    });
  });

  next.addEventListener("click", function () {
    var i = modes.indexOf(root.getAttribute("data-mode"));
    select(modes[(i + 1) % modes.length]);
  });

  select(root.getAttribute("data-mode") || modes[0]);
})();
