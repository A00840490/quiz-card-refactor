/* Tema 15 (modulo3-16): el valor auto en los márgenes. Como en las
   herramientas del navegador, el margen se ve naranja.
   Demo de modulo3-demo-css.js: los valores con flecha se cambian con el
   menú de vidrio y la previsualización cambia en el momento. */
(function () {
  "use strict";

  DemoCSS.crear(document.querySelector("[data-demo-css=\"auto\"]"), {
    archivo: "estilos.css",
    tipo: "css",
    html: "<div class=\"contenedor\"><div class=\"caja\">Caja</div></div>",
    codigo: [
      "«.caja» {",
      "  width: {{w}};",
      "  margin: {{m}};",
      "  padding: ‹12px›;",
      "  background-color: ‹#0f4c91›;",
      "  color: ‹white›;",
      "}"
    ],
    valores: {
      w: { nombre: "width", opciones: ["200px", "50%", "120px", "auto"] },
      m: { nombre: "margin", opciones: ["0 auto", "0", "0 0 0 auto", "0 auto 0 0", "20px auto"] }
    },
    base: ".contenedor{display:flow-root;background:#f9cc9d}.caja{box-sizing:border-box;font-weight:700;text-align:center}"
  });
})();
