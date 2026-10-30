/* Tema 20 (modulo3-21): media queries. El ancho de la condición y lo que
   cambia dentro de @media se eligen en el menú de vidrio
   (modulo3-demo-css.js). La barra de la vista previa dice cuánto mide su
   ventana, que es el ancho con el que se compara la condición. */
(function () {
  "use strict";

  function cumple(c) {
    return c.ancho <= parseFloat(c.v.bp);
  }

  function estado(c) {
    var w = c.ancho, bp = c.v.bp;
    if (cumple(c)) return "La ventana de la vista previa mide " + w + "px, que es " + (w === parseFloat(bp) ? "igual a" : "menos que") + " " + bp + ": la condición se cumple y se aplica lo que está dentro de <code>@media</code>, así que las columnas miden " + c.v.w + " y cambian de color.";
    return "La ventana de la vista previa mide " + w + "px, que es más que " + bp + ": la condición no se cumple, se ignora lo que está dentro de <code>@media</code> y las columnas siguen en tres, azules.";
  }

  DemoCSS.crear(document.querySelector("[data-demo-css=\"media\"]"), {
    archivo: "estilos.css",
    tipo: "css",
    ancho: true,
    html:
      "<div class=\"col\">Columna 1</div>" +
      "<div class=\"col\">Columna 2</div>" +
      "<div class=\"col\">Columna 3</div>",
    codigo: [
      "«.col» {",
      "  float: ‹left›;",
      "  width: ‹33.33%›;",
      "  box-sizing: ‹border-box›;",
      "  padding: ‹16px›;",
      "  border: ‹2px solid white›;",
      "  background-color: ‹#0f4c91›;",
      "  color: ‹white›;",
      "}",
      "",
      "@media (max-width: {{bp}}) {",
      "  «.col» {",
      "    width: {{w}};",
      "    background-color: {{fondo}};",
      "  }",
      "}"
    ],
    valores: {
      bp: { nombre: "max-width", opciones: ["400px", "300px", "600px", "900px"] },
      w: { nombre: "width", opciones: ["100%", "50%"] },
      fondo: { nombre: "background-color", opciones: ["#2e8b57", "#8e44ad", "#e67e22"] }
    },
    base: "body{display:flow-root}.col{font-weight:700;text-align:center}",
    inicio: function (c) {
      return "<code>@media (max-width: 400px)</code> se lee: si la ventana mide 400px o menos, aplica lo que está entre las llaves. " + estado(c);
    },
    explicar: function (k, v, c) {
      if (k === "bp") return "Ahora la condición es <code>max-width: " + v + "</code>. " + estado(c);
      var aplica = cumple(c);
      if (k === "w") return "Dentro de <code>@media</code>, <code>.col</code> ahora pide <code>width: " + v + "</code>" + (v === "50%" ? ": dos columnas por renglón." : ": una columna por renglón.") + (aplica ? "" : " Por ahora no se ve porque la condición no se cumple: prueba con un <code>max-width</code> mayor que " + c.ancho + "px.");
      return "Dentro de <code>@media</code>, las columnas ahora cambian a " + v + "." + (aplica ? "" : " Por ahora no se ve porque la condición no se cumple: prueba con un <code>max-width</code> mayor que " + c.ancho + "px.");
    }
  });
})();
