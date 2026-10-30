/* Tema 18 (modulo3-19): estilos de los enlaces y la pseudoclase hover.
   Demo de modulo3-demo-css.js: los valores con flecha se cambian con el
   menú de vidrio y la previsualización cambia en el momento. */
(function () {
  "use strict";

  DemoCSS.crear(document.querySelector("[data-demo-css=\"enlace\"]"), {
    archivo: "estilos.css",
    tipo: "css",
    html: "<p><a href=\"#\">Pasa el puntero sobre este enlace.</a></p>",
    codigo: [
      "«a» {",
      "  font-size: {{tam}};",
      "  text-decoration: {{deco}};",
      "}",
      "",
      "«{{pseudo}}» {",
      "  color: {{color}};",
      "}"
    ],
    valores: {
      tam: { nombre: "font-size", opciones: ["30px", "20px", "40px"] },
      deco: { nombre: "text-decoration", opciones: ["none", "underline", "overline", "line-through"] },
      pseudo: { nombre: "selector", opciones: ["a:hover", "a:active", "a"] },
      color: { nombre: "color", opciones: ["red", "green", "orange", "#8e44ad"] }
    },
    base: "a{color:#0f4c91}p{margin:0}"
  });
})();
