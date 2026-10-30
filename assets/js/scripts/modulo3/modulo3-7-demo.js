/* Tema 6 (modulo3-7): elementos dentro de una división. El selector de la
   regla se elige en el menú. La línea punteada marca la división .azul.
   Demo de modulo3-demo-css.js: los valores con flecha se cambian con el
   menú de vidrio y la previsualización cambia en el momento. */
(function () {
  "use strict";

  DemoCSS.crear(document.querySelector("[data-demo-css=\"dentro\"]"), {
    archivo: "index.html",
    tipo: "html",
    codigo: [
      "<«style»>",
      "  {{sel}} {",
      "    color: {{color}};",
      "  }",
      "</«style»>",
      "",
      "<«div» class=\"azul\">",
      "  <«h2»>‹Encabezado en la división›</«h2»>",
      "  <«p»>‹Párrafo dentro de la división.›</«p»>",
      "</«div»>",
      "<«p»>‹Párrafo fuera de la división.›</«p»>"
    ],
    valores: {
      sel: { nombre: "selector", opciones: [".azul p", ".azul h2", ".azul", "div p", "p", "h2 p"] },
      color: { nombre: "color", opciones: ["blue", "crimson", "seagreen", "#8e44ad"] }
    },
    base: ".azul{padding:4px 14px 2px;border:2px dashed #9fb6d9;border-radius:6px;margin-bottom:12px}"
  });
})();
