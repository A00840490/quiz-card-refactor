/* Tema 21 (modulo3-22): flexbox. Todos los valores de las propiedades del
   contenedor flex, y el order del segundo elemento, se eligen en el menú de
   vidrio (modulo3-demo-css.js). */
(function () {
  "use strict";

  var TEXTO = {
    dir: {
      row: "los elementos van en un renglón, de izquierda a derecha.",
      "row-reverse": "los elementos van en un renglón, pero de derecha a izquierda.",
      column: "los elementos van en una columna, de arriba a abajo.",
      "column-reverse": "los elementos van en una columna, pero de abajo hacia arriba."
    },
    wrap: {
      nowrap: "todos los elementos se quedan en una sola línea y se encogen para caber.",
      wrap: "los elementos que no caben pasan a la siguiente línea.",
      "wrap-reverse": "los elementos que no caben pasan a otra línea, pero las líneas se acomodan al revés."
    },
    jc: {
      "flex-start": "los elementos se juntan al inicio de la línea.",
      "flex-end": "los elementos se juntan al final de la línea.",
      center: "los elementos se juntan en el centro de la línea.",
      "space-between": "el primero va al inicio, el último al final y el espacio que sobra se reparte entre ellos.",
      "space-around": "cada elemento tiene el mismo espacio a sus lados, así que en las orillas queda la mitad.",
      "space-evenly": "todos los espacios, incluidos los de las orillas, miden lo mismo."
    },
    ai: {
      stretch: "los elementos se estiran hasta ocupar todo el alto de su línea.",
      "flex-start": "los elementos se pegan al inicio de su línea, cada uno con su propio alto.",
      "flex-end": "los elementos se pegan al final de su línea.",
      center: "los elementos se centran en su línea.",
      baseline: "los elementos se alinean por la base de su primera línea de texto."
    },
    ac: {
      stretch: "las líneas se estiran para ocupar todo el contenedor.",
      "flex-start": "las líneas se juntan al inicio del contenedor.",
      "flex-end": "las líneas se juntan al final del contenedor.",
      center: "las líneas se juntan en el centro del contenedor.",
      "space-between": "la primera línea va al inicio, la última al final y el espacio que sobra se reparte entre ellas.",
      "space-around": "cada línea tiene el mismo espacio arriba y abajo."
    }
  };

  var PROP = { dir: "flex-direction", wrap: "flex-wrap", jc: "justify-content", ai: "align-items", ac: "align-content", order: "order" };

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
      ".item:nth-child(3n+2){padding-top:18px;padding-bottom:18px;background:#2e8b57}.item:nth-child(3n){font-size:22px;background:#8e44ad}",
    inicio: function () {
      return "Con <code>display: flex</code> el contenedor acomoda a sus elementos en líneas. Cada propiedad del código tiene un menú con todos sus valores posibles: cambia uno a la vez y observa cómo se mueven los elementos.";
    },
    explicar: function (k, v, c) {
      if (k === "order") {
        if (v === "0") return "Con <code>order: 0</code>, el valor de siempre, el elemento 2 vuelve a su lugar según el HTML.";
        return "Con <code>order: " + v + "</code>, el elemento 2 va " + (+v < 0 ? "antes de todos los demás, que tienen 0" : "después de todos los demás, que tienen 0") + ": el número más bajo va primero.";
      }
      var t = "Con <code>" + PROP[k] + ": " + v + "</code>, " + TEXTO[k][v];
      var columna = /column/.test(c.v.dir);
      if (k === "jc") t += columna ? " Como la dirección es en columna, esto pasa de arriba a abajo." : "";
      if (k === "ac" && c.v.wrap === "nowrap") t += " Por ahora no se nota porque con <code>nowrap</code> hay una sola línea: prueba con <code>wrap</code>.";
      return t;
    }
  });
})();
