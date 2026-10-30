/* Tema 11 (modulo3-12): posicionamientos flotantes. Cuatro cuadros; el
   float de tres de ellos y el clear del tercero se eligen en el menú.
   Demo de modulo3-demo-css.js: los valores con flecha se cambian con el
   menú de vidrio y la previsualización cambia en el momento. */
(function () {
  "use strict";

  DemoCSS.crear(document.querySelector("[data-demo-css=\"flotantes\"]"), {
    archivo: "estilos.css",
    tipo: "css",
    html:
      "<div class=\"uno\">uno</div>" +
      "<div class=\"dos\">dos</div>" +
      "<div class=\"tres\">tres</div>" +
      "<div class=\"cuatro\">cuatro</div>",
    codigo: [
      "«div» {",
      "  width: ‹100px›;",
      "  height: ‹70px›;",
      "  margin: ‹6px›;",
      "  color: ‹white›;",
      "}",
      "«.uno» {",
      "  float: {{f1}};",
      "  background-color: ‹#0f4c91›;",
      "}",
      "«.dos» {",
      "  float: {{f2}};",
      "  background-color: ‹#2e8b57›;",
      "}",
      "«.tres» {",
      "  clear: {{clear}};",
      "  background-color: ‹#8e44ad›;",
      "}",
      "«.cuatro» {",
      "  float: {{f4}};",
      "  background-color: ‹#e67e22›;",
      "}"
    ],
    valores: {
      f1: { nombre: "float", opciones: ["left", "right", "none"] },
      f2: { nombre: "float", opciones: ["left", "right", "none"] },
      clear: { nombre: "clear", opciones: ["both", "none", "left", "right"] },
      f4: { nombre: "float", opciones: ["right", "left", "none"] }
    },
    base: "body{display:flow-root}div{padding:6px 10px;font-weight:700}"
  });
})();
