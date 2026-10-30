/* Tema 5 (modulo3-6): divisiones. Dos demos con el mismo CSS: en el primero
   las dos divisiones van una después de la otra y en el segundo la segunda
   va dentro de la primera, así que hereda su color y su alineación.
   Demo de modulo3-demo-css.js: los valores con flecha se cambian con el
   menú de vidrio y la previsualización cambia en el momento. */
(function () {
  "use strict";

  var ESTILO = [
    "<«style»>",
    "  «.primera» {",
    "    background-color: {{fondo1}};",
    "    color: {{color1}};",
    "    text-align: {{alinear}};",
    "    font-family: {{fuente1}};",
    "    padding: ‹12px›;",
    "  }",
    "  «.segunda» {",
    "    background-color: {{fondo2}};",
    "    font-family: ‹Arial, sans-serif›;",
    "    padding: ‹12px›;",
    "  }",
    "</«style»>",
    ""
  ];

  function valores(extra) {
    var v = {
      fondo1: { nombre: "background-color", opciones: ["#0f4c91", "#8e44ad", "#c0392b", "#2c3e50"] },
      color1: { nombre: "color", opciones: ["white", "yellow", "black"] },
      alinear: { nombre: "text-align", opciones: ["center", "left", "right"] },
      fuente1: { nombre: "font-family", opciones: ["Georgia, serif", "\"Courier New\", monospace", "Verdana, sans-serif"] },
      fondo2: { nombre: "background-color", opciones: ["#7fc8a9", "#f6bd4f", "#9ec5f8"] }
    };
    for (var k in extra) v[k] = extra[k];
    return v;
  }

  /* ---------- Una división después de la otra ---------- */
  DemoCSS.crear(document.querySelector("[data-demo-css=\"divisiones\"]"), {
    archivo: "index.html",
    tipo: "html",
    codigo: ESTILO.concat([
      "<«div» class=\"primera\">",
      "  <«h2»>‹Primera división›</«h2»>",
      "  <«p»>‹Un bloque con su propio estilo.›</«p»>",
      "</«div»>",
      "<«div» class=\"segunda\">",
      "  <«h2»>‹Segunda división›</«h2»>",
      "  <«p»>‹Otro bloque, separado del primero.›</«p»>",
      "</«div»>"
    ]),
    valores: valores()
  });

  /* ---------- Una división dentro de la otra ---------- */
  DemoCSS.crear(document.querySelector("[data-demo-css=\"divisiones-dentro\"]"), {
    archivo: "index.html",
    tipo: "html",
    codigo: ESTILO.slice(0, 11).concat(["    color: {{color2}};"], ESTILO.slice(11), [
      "<«div» class=\"primera\">",
      "  <«h2»>‹Primera división›</«h2»>",
      "  <«p»>‹Un bloque con su propio estilo.›</«p»>",
      "  <«div» class=\"segunda\">",
      "    <«h2»>‹Segunda división›</«h2»>",
      "    <«p»>‹Este bloque está dentro del primero.›</«p»>",
      "  </«div»>",
      "</«div»>"
    ]),
    valores: valores({
      color2: { nombre: "color", opciones: ["inherit", "black", "#8e1b1b"] }
    })
  });
})();
