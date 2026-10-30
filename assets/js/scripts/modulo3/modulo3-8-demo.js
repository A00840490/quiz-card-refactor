/* Tema 7 (modulo3-8): estilos en cascada. Hay dos reglas para .naranja y
   una para .rojo; gana la última que aplica a cada texto.
   Demo de modulo3-demo-css.js: los valores con flecha se cambian con el
   menú de vidrio y la previsualización cambia en el momento. */
(function () {
  "use strict";

  DemoCSS.crear(document.querySelector("[data-demo-css=\"cascada\"]"), {
    archivo: "index.html",
    tipo: "html",
    codigo: [
      "<«style»>",
      "  «.naranja» {",
      "    color: {{c1}};",
      "  }",
      "  «.rojo» {",
      "    color: {{c2}};",
      "  }",
      "  «.naranja» {",
      "    color: {{c3}};",
      "  }",
      "</«style»>",
      "",
      "<«p» class=\"naranja\">‹Primer texto›</«p»>",
      "<«p» class=\"{{clases}}\">‹Segundo texto›</«p»>"
    ],
    valores: {
      c1: { nombre: "color", opciones: ["white", "green", "blue"] },
      c2: { nombre: "color", opciones: ["red", "purple", "teal"] },
      c3: { nombre: "color", opciones: ["orange", "gold", "white"] },
      clases: { nombre: "class", opciones: ["rojo naranja", "naranja rojo", "rojo", "naranja"] }
    },
    base: "body{background:#f4f6f9}p{font-size:24px;font-weight:700;margin:0 0 8px}"
  });
})();
