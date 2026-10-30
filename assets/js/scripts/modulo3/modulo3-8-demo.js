/* Tema 7 (modulo3-8): estilos en cascada. Hay dos reglas para .naranja y
   una para .rojo; gana la última que aplica a cada texto. Los colores y las
   clases del segundo texto se cambian con el menú de vidrio
   (modulo3-demo-css.js). */
(function () {
  "use strict";

  // Las reglas en el orden del archivo
  function reglas(v) {
    return [
      { clase: "naranja", color: v.c1, linea: 3 },
      { clase: "rojo", color: v.c2, linea: 6 },
      { clase: "naranja", color: v.c3, linea: 9 }
    ];
  }

  // La última regla que aplica a un texto con esas clases
  function gana(v, clases) {
    var g = null;
    reglas(v).forEach(function (r) { if (clases.split(" ").indexOf(r.clase) >= 0) g = r; });
    return g;
  }

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
    base: "body{background:#f4f6f9}p{font-size:24px;font-weight:700;margin:0 0 8px}",
    inicio: function () {
      return "La clase <code>.naranja</code> se modifica dos veces: primero con <code>white</code> y al final con <code>orange</code>. En cascada gana la <b>última</b>, por eso el primer texto es naranja. El segundo texto también tiene la clase <code>rojo</code>, pero la regla de <code>.naranja</code> va después en el archivo, así que también se ve naranja.";
    },
    explicar: function (k, v, c) {
      var g1 = gana(c.v, "naranja"), g2 = gana(c.v, c.v.clases);
      var segundo = "El segundo texto (<code>class=\"" + c.v.clases + "\"</code>) toma el color de la regla de la línea " + g2.linea + ", <code>." + g2.clase + "</code>, que es la última que le aplica: " + g2.color + ".";
      if (k === "c1") return "La primera regla de <code>.naranja</code> ahora dice " + v + ", pero no se ve en ningún texto: la de la línea 9 también modifica <code>.naranja</code> y va después, así que la sobrescribe.";
      if (k === "c2") return "<code>.rojo</code> ahora dice " + v + ". " + segundo + (g2.clase === "naranja" ? " El de <code>.rojo</code> pierde porque su regla va antes en el archivo." : "");
      if (k === "c3") return "La última regla de <code>.naranja</code> ahora dice " + v + ", y como va al final gana sobre la primera: el primer texto se ve " + g1.color + ". " + segundo;
      if (v === "rojo") return "<b>¡Listo!</b> Sin la clase <code>naranja</code>, al segundo texto solo le aplica <code>.rojo</code>, así que se ve " + c.v.c2 + ".";
      if (v === "naranja rojo") return "El orden de las clases dentro de <code>class</code> no importa: lo que cuenta es el orden de las reglas en el CSS. " + segundo;
      return segundo;
    }
  });
})();
