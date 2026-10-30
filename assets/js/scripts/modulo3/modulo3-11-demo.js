/* Tema 10 (modulo3-11): métodos de posicionamiento. Cuadros azules, verdes,
   naranja y rojo; el position de cada uno se elige en el menú de vidrio
   (modulo3-demo-css.js). La vista previa tiene alto fijo y se desplaza, para
   ver qué se queda a la vista con fixed y sticky. */
(function () {
  "use strict";

  var CUADRO = {
    pAzulHijo: { sel: ".azul-hijo", nombre: "el cuadro azul hijo", padre: "el cuadro azul" },
    pVerde: { sel: ".verde", nombre: "el cuadro verde padre" },
    pVerdeHijo: { sel: ".verde-hijo", nombre: "el cuadro verde hijo", padre: "el cuadro verde" },
    pNaranja: { sel: ".naranja", nombre: "el cuadro naranja" },
    pRojo: { sel: ".rojo", nombre: "el cuadro rojo" }
  };

  var POSICIONES = ["static", "relative", "absolute", "fixed", "sticky"];

  function texto(k, v, c) {
    var q = CUADRO[k];
    if (v === "static") return "Con <code>static</code>, " + q.nombre + " va en su lugar normal, de arriba a abajo, e ignora <code>top</code>, <code>left</code>, <code>right</code> y <code>bottom</code>.";
    if (v === "relative") return "Con <code>relative</code>, " + q.nombre + " se mueve desde su lugar normal según <code>top</code>, <code>left</code>, <code>right</code> o <code>bottom</code>, pero su lugar original se sigue apartando" + (q.padre ? ": por eso " + q.padre + " lo sigue encerrando." : ".");
    if (v === "absolute") {
      var verdeRel = c.v.pVerde !== "static";
      var ref = k === "pVerdeHijo" ? (verdeRel ? "dentro del cuadro verde, porque su padre tiene <code>position: " + c.v.pVerde + "</code>" : "respecto a la página, porque su padre es <code>static</code> y no sirve de referencia")
        : k === "pAzulHijo" ? "respecto a la página, porque el cuadro azul no tiene <code>position</code>"
        : "respecto al primer elemento posicionado que lo contiene (aquí, la página)";
      return "Con <code>absolute</code>, " + q.nombre + " sale del flujo: los demás elementos se acomodan como si no estuviera" + (q.padre ? " y " + q.padre + " ya no lo encierra" : "") + ". Se coloca " + ref + ".";
    }
    if (v === "fixed") return "Con <code>fixed</code>, " + q.nombre + " se queda en el mismo lugar de la ventana aunque te desplaces dentro de la vista previa, y sale del flujo como <code>absolute</code>.";
    return "Con <code>sticky</code>, " + q.nombre + " se comporta como <code>relative</code> hasta que se va a salir de la ventana; ahí se queda pegado como <code>fixed</code> mientras su padre siga a la vista. Desplázate en la vista previa para verlo.";
  }

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
    base: "div{font-weight:700;z-index:1}p{color:#172033}.verde{min-height:22px}",
    inicio: function () {
      return "El cuadro azul hijo es <code>relative</code>: se movió 20px, pero su lugar se sigue apartando y el azul lo encierra. El verde hijo es <code>absolute</code>: sale del flujo y el verde ya no lo encierra. El naranja es <code>sticky</code> y el rojo <code>fixed</code>: desplázate en la vista previa para ver cómo se quedan a la vista.";
    },
    explicar: texto
  });
})();
