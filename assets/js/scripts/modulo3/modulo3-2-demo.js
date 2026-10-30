/* Tema 1 (modulo3-2): formato de CSS. Selectores, declaraciones y un
   selector con varios elementos separados por comas. Entre las opciones
   hay valores inválidos para ver que el navegador los ignora.
   Demo de modulo3-demo-css.js: los valores con flecha se cambian con el
   menú de vidrio y la previsualización cambia en el momento. */
(function () {
  "use strict";

  DemoCSS.crear(document.querySelector("[data-demo-css=\"formato\"]"), {
    archivo: "estilos.css",
    tipo: "css",
    html:
      "<h1>Mi página con estilo</h1>" +
      "<p>Este párrafo tiene el tamaño de letra que dice el selector p.</p>" +
      "<p>Este también, porque es otro elemento p.</p>",
    codigo: [
      "«h1» {",
      "  color: {{color}};",
      "  background-color: {{fondo}};",
      "}",
      "",
      "«p» {",
      "  font-size: {{tam}};",
      "}",
      "",
      "«h1», «p» {",
      "  font-family: {{fuente}};",
      "}"
    ],
    valores: {
      color: { nombre: "color", opciones: ["white", "yellow", "#ffcc00", "rgb(255, 99, 71)", "blanco"] },
      fondo: { nombre: "background-color", opciones: ["navy", "teal", "#8e44ad", "rgb(15, 76, 145)", "azul"] },
      tam: { nombre: "font-size", opciones: ["18px", "14px", "24px", "32px", "18"] },
      fuente: { nombre: "font-family", opciones: ["Arial, sans-serif", "Georgia, serif", "\"Courier New\", monospace", "\"Comic Sans MS\", cursive"] }
    },
    base: "h1{padding:8px 12px}"
  });
})();
