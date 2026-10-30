/* Tema 5 (modulo3-6): divisiones. Dos demos con el mismo CSS: en el primero
   las dos divisiones van una después de la otra y en el segundo la segunda
   va dentro de la primera, así que hereda su color y su alineación. Los
   valores se cambian con el menú de vidrio (modulo3-demo-css.js). */
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

  function fuente(v) {
    return v.split(",")[0].replace(/"/g, "");
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
    valores: valores(),
    inicio: function () {
      return "Cada <code>&lt;div&gt;</code> agrupa un encabezado y un párrafo, y su clase (<code>.primera</code> o <code>.segunda</code>) le da estilo a todo el bloque sin tocar al otro. El texto de la segunda es negro porque su regla no dice nada de <code>color</code>.";
    },
    explicar: function (k, v) {
      if (k === "fondo1") return "<code>background-color</code> de <code>.primera</code> pinta solo la primera división: ahora es " + v + ". La segunda no cambia porque es otro bloque.";
      if (k === "color1") return "<code>color</code> de <code>.primera</code> cambia el texto del encabezado y del párrafo de la primera división, que están dentro de ella. La segunda sigue en negro: no está dentro de la primera.";
      if (k === "alinear") return "<code>text-align: " + v + "</code> acomoda el texto de la primera división " + (v === "center" ? "al centro" : v === "left" ? "a la izquierda" : "a la derecha") + ". La segunda no cambia.";
      if (k === "fuente1") return "<code>font-family</code> de <code>.primera</code> le pone " + fuente(v) + " solo a la primera división. La segunda tiene su propia fuente, Arial.";
      return "<code>background-color</code> de <code>.segunda</code> pinta solo la segunda división: ahora es " + v + ".";
    }
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
    }),
    inicio: function () {
      return "Ahora la segunda <code>&lt;div&gt;</code> está dentro de la primera, así que <b>hereda</b> su <code>color</code> y su <code>text-align</code>: por eso su texto es blanco y va centrado. Su fuente no se hereda porque <code>.segunda</code> tiene su propio <code>font-family</code>. <code>color: inherit</code> dice justo eso: usa el color del padre.";
    },
    explicar: function (k, v, c) {
      var hereda = c.v.color2 === "inherit";
      if (k === "fondo1") return "<code>background-color</code> no se hereda: la segunda división conserva su propio fondo y el de la primera se ve alrededor de ella.";
      if (k === "color1") return "<code>color</code> de <code>.primera</code> cambia a " + v + (hereda ? ", y la segunda división también cambia porque lo <b>hereda</b> (<code>color: inherit</code>)." : ", pero la segunda división no cambia: su propio <code>color: " + c.v.color2 + "</code> sobrescribe al que heredaría.");
      if (k === "alinear") return "<code>text-align</code> se <b>hereda</b>: al cambiar el de <code>.primera</code> a " + v + ", el texto de la segunda división se acomoda igual, aunque su regla no diga nada de alineación.";
      if (k === "fuente1") return "La primera división ahora usa " + fuente(v) + ". La segunda no la hereda porque <code>.segunda</code> tiene su propio <code>font-family</code>, que sobrescribe al del padre.";
      if (k === "fondo2") return "<code>background-color</code> de <code>.segunda</code> pinta solo la división de adentro: ahora es " + v + ".";
      if (v === "inherit") return "<code>color: inherit</code> hace que la segunda división use el color de su padre, la primera (" + c.v.color1 + "). Es lo mismo que pasa si no le pones <code>color</code>.";
      return "<code>color: " + v + "</code> en <code>.segunda</code> sobrescribe al color heredado de la primera división: ahora la de adentro tiene su propio color.";
    }
  });
})();
