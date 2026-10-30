/* Tema 20 (modulo3-21): media queries. Arriba de la previsualización se ve
   cuánto mide su ventana, que es el ancho con el que se compara la condición.
   Demo de modulo3-demo-css.js: los valores con flecha se cambian con el
   menú de vidrio y la previsualización cambia en el momento. */
(function () {
  "use strict";

  DemoCSS.crear(document.querySelector("[data-demo-css=\"media\"]"), {
    archivo: "estilos.css",
    tipo: "css",
    ancho: true,
    html:
      "<div class=\"col\">Columna 1</div>" +
      "<div class=\"col\">Columna 2</div>" +
      "<div class=\"col\">Columna 3</div>",
    codigo: [
      "«.col» {",
      "  float: ‹left›;",
      "  width: ‹33.33%›;",
      "  box-sizing: ‹border-box›;",
      "  padding: ‹16px›;",
      "  border: ‹2px solid white›;",
      "  background-color: ‹#0f4c91›;",
      "  color: ‹white›;",
      "}",
      "",
      "@media (max-width: {{bp}}) {",
      "  «.col» {",
      "    width: {{w}};",
      "    background-color: {{fondo}};",
      "  }",
      "}"
    ],
    valores: {
      bp: { nombre: "max-width", opciones: ["400px", "300px", "600px", "900px"] },
      w: { nombre: "width", opciones: ["100%", "50%"] },
      fondo: { nombre: "background-color", opciones: ["#2e8b57", "#8e44ad", "#e67e22"] }
    },
    base: "body{display:flow-root}.col{font-weight:700;text-align:center}"
  });
})();
