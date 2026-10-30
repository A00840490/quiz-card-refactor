/* Tema 19 (modulo3-20): anchura mínima y máxima.
   Demo de modulo3-demo-css.js: los valores con flecha se cambian con el
   menú de vidrio y la previsualización cambia en el momento. */
(function () {
  "use strict";

  DemoCSS.crear(document.querySelector("[data-demo-css=\"min-max\"]"), {
    archivo: "estilos.css",
    tipo: "css",
    html: "<div class=\"contenedor\"><div class=\"caja\">Caja</div></div>",
    codigo: [
      "«.caja» {",
      "  width: {{w}};",
      "  min-width: {{min}};",
      "  max-width: {{max}};",
      "  padding: ‹12px 0›;",
      "  background-color: ‹#0f4c91›;",
      "  color: ‹white›;",
      "}"
    ],
    valores: {
      w: { nombre: "width", opciones: ["50%", "20%", "80%", "100%"] },
      min: { nombre: "min-width", opciones: ["200px", "0", "120px", "300px"] },
      max: { nombre: "max-width", opciones: ["800px", "none", "250px", "350px"] }
    },
    base: ".caja{font-weight:700;text-align:center}"
  });
})();
