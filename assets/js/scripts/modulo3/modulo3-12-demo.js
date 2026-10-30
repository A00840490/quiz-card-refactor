/* Tema 11 (modulo3-12): posicionamientos flotantes. Cuatro cuadros; el
   float de tres de ellos y el clear del tercero se eligen en el menú de
   vidrio (modulo3-demo-css.js). */
(function () {
  "use strict";

  var NOMBRE = { f1: "<code>.uno</code>", f2: "<code>.dos</code>", f4: "<code>.cuatro</code>" };

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
    base: "body{display:flow-root}div{padding:6px 10px;font-weight:700}",
    inicio: function () {
      return "<code>.uno</code> y <code>.dos</code> tienen <code>float: left</code>, así que se alinean de forma horizontal a la izquierda. <code>.tres</code> no flota y con <code>clear: both</code> se coloca debajo de los flotantes. <code>.cuatro</code> tiene <code>float: right</code> y se va a la derecha, debajo de <code>.tres</code>.";
    },
    explicar: function (k, v, c) {
      if (k === "clear") {
        if (v === "both") return "<code>clear: both</code> hace que <code>.tres</code> se coloque debajo de todos los flotantes que van antes, estén a la izquierda o a la derecha.";
        if (v === "none") return "Con <code>clear: none</code>, <code>.tres</code> no esquiva a los flotantes: su caja sube hasta arriba y queda <b>detrás</b> de ellos, y solo su texto se recorre para no quedar tapado.";
        var lado = v === "left" ? "izquierda" : "derecha";
        var hay = ["f1", "f2"].some(function (f) { return c.v[f] === v; });
        return "<code>clear: " + v + "</code> hace que <code>.tres</code> se coloque debajo de los flotantes de la " + lado + (hay ? "." : ", pero ninguno de los de antes flota a la " + lado + ", así que es como no tener <code>clear</code>: su caja queda detrás de ellos.");
      }
      if (v === "none") return "Con <code>float: none</code>, " + NOMBRE[k] + " deja de flotar y se acomoda en el flujo normal: ocupa su propio renglón, de arriba a abajo.";
      return "<code>float: " + v + "</code> manda a " + NOMBRE[k] + " a la " + (v === "left" ? "izquierda" : "derecha") + ", y lo que viene después se acomoda a su lado mientras haya espacio.";
    }
  });
})();
