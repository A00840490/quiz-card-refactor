/* Tema 21 (modulo3-22): flexbox. Todos los valores de las propiedades del
   contenedor flex, y el order del segundo elemento.
   Demo de modulo3-demo-css.js: los valores con flecha se cambian con el
   menú de vidrio y la previsualización cambia en el momento. */
(function () {
  "use strict";

  DemoCSS.crear(document.querySelector("[data-demo-css=\"flex\"]"), {
    archivo: "estilos.css",
    tipo: "css",
    html: "<div class=\"contenedor\">" + [1, 2, 3, 4, 5, 6, 7].map(function (n) { return "<div class=\"item\">" + n + "</div>"; }).join("") + "</div>",
    codigo: [
      "«.contenedor» {",
      "  display: ‹flex›;",
      "  flex-direction: {{dir}};",
      "  flex-wrap: {{wrap}};",
      "  justify-content: {{jc}};",
      "  align-items: {{ai}};",
      "  align-content: {{ac}};",
      "  height: ‹300px›;",
      "}",
      "«.item» {",
      "  width: ‹70px›;",
      "}",
      "«.item:nth-child(2)» {",
      "  order: {{order}};",
      "}"
    ],
    valores: {
      dir: { nombre: "flex-direction", opciones: ["row", "row-reverse", "column", "column-reverse"] },
      wrap: { nombre: "flex-wrap", opciones: ["wrap", "nowrap", "wrap-reverse"] },
      jc: { nombre: "justify-content", opciones: ["flex-start", "flex-end", "center", "space-between", "space-around", "space-evenly"] },
      ai: { nombre: "align-items", opciones: ["stretch", "flex-start", "flex-end", "center", "baseline"] },
      ac: { nombre: "align-content", opciones: ["stretch", "flex-start", "flex-end", "center", "space-between", "space-around"] },
      order: { nombre: "order", opciones: ["0", "-1", "1", "10"] }
    },
    base: ".contenedor{background:#eef3fa;border:2px dashed #9fb6d9}" +
      ".item{box-sizing:border-box;margin:4px;padding:6px;border-radius:6px;background:#0f4c91;color:#fff;font-weight:700;text-align:center}" +
      ".item:nth-child(3n+2){padding-top:18px;padding-bottom:18px;background:#2e8b57}.item:nth-child(3n){font-size:22px;background:#8e44ad}"
  });
})();
