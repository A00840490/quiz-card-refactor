/* Tema 10 (modulo3-11): métodos de posicionamiento. Cuadros azules, verdes,
   naranja y rojo con el position de cada uno en el menú. La
   previsualización tiene alto fijo y se desplaza, para ver qué se queda a la
   vista con fixed y sticky.
   Demo de modulo3-demo-css.js: los valores con flecha se cambian con el
   menú de vidrio y la previsualización cambia en el momento. */
(function () {
  "use strict";

  var POSICIONES = ["static", "relative", "absolute", "fixed", "sticky"];

  DemoCSS.crear(document.querySelector("[data-demo-css=\"posiciones\"]"), {
    archivo: "estilos.css",
    tipo: "css",
    alto: 430,
    html:
      "<div class=\"azul\">Azul (padre)<div class=\"azul-hijo\">Azul (hijo)</div></div>" +
      "<div class=\"naranja\">Naranja</div>" +
      "<div class=\"verde\">Verde (padre)<div class=\"verde-hijo\">Verde (hijo)</div></div>" +
      "<div class=\"rojo\">Rojo</div>" +
      "<p>Desplázate dentro de esta vista previa para ver qué cuadros se quedan a la vista.</p>" +
      "<p>Los cuadros con <b>fixed</b> se quedan en el mismo lugar de la ventana. Los cuadros con <b>sticky</b> se quedan pegados solo cuando se van a salir.</p>" +
      "<p>Los cuadros con <b>relative</b> y <b>absolute</b> se mueven con la página.</p>" +
      "<p>Sigue bajando…</p><p>Un poco más…</p><p>Aquí termina la página.</p>",
    codigo: [
      "«div» {",
      "  padding: ‹10px›;",
      "  margin: ‹10px 0›;",
      "  color: ‹white›;",
      "}",
      "«.azul» {",
      "  background-color: ‹#4a7fd4›;",
      "}",
      "«.azul-hijo» {",
      "  position: {{pAzulHijo}};",
      "  top: ‹20px›;",
      "  left: ‹20px›;",
      "  background-color: ‹#1f4fa3›;",
      "}",
      "«.naranja» {",
      "  position: {{pNaranja}};",
      "  top: ‹0›;",
      "  background-color: ‹#f0a030›;",
      "}",
      "«.verde» {",
      "  position: {{pVerde}};",
      "  background-color: ‹#5cb85c›;",
      "}",
      "«.verde-hijo» {",
      "  position: {{pVerdeHijo}};",
      "  top: ‹20px›;",
      "  left: ‹40px›;",
      "  background-color: ‹#2e7d32›;",
      "}",
      "«.rojo» {",
      "  position: {{pRojo}};",
      "  bottom: ‹10px›;",
      "  right: ‹10px›;",
      "  background-color: ‹#d9534f›;",
      "}"
    ],
    valores: {
      pAzulHijo: { nombre: "position", opciones: POSICIONES, inicial: 1 },
      pNaranja: { nombre: "position", opciones: POSICIONES, inicial: 4 },
      pVerde: { nombre: "position", opciones: POSICIONES, inicial: 1 },
      pVerdeHijo: { nombre: "position", opciones: POSICIONES, inicial: 2 },
      pRojo: { nombre: "position", opciones: POSICIONES, inicial: 3 }
    },
    base: "div{font-weight:700;z-index:1}p{color:#172033}.verde{min-height:22px}"
  });
})();
