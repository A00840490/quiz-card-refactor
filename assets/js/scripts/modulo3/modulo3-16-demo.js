/* Tema 15 (modulo3-16): el valor auto en los márgenes. El ancho y el margen
   de la caja se eligen en el menú de vidrio (modulo3-demo-css.js) y la
   explicación dice cuánto calculó el navegador para cada lado. Como en las
   herramientas del navegador, el margen se ve naranja. */
(function () {
  "use strict";

  function margenes(c) {
    return { izq: c.px(".caja", "marginLeft"), der: c.px(".caja", "marginRight"), ancho: c.px(".caja", "width"), total: c.px(".contenedor", "width") };
  }

  DemoCSS.crear(document.querySelector("[data-demo-css=\"auto\"]"), {
    archivo: "estilos.css",
    tipo: "css",
    html: "<div class=\"contenedor\"><div class=\"caja\">Caja</div></div>",
    codigo: [
      "«.caja» {",
      "  width: {{w}};",
      "  margin: {{m}};",
      "  padding: ‹12px›;",
      "  background-color: ‹#0f4c91›;",
      "  color: ‹white›;",
      "}"
    ],
    valores: {
      w: { nombre: "width", opciones: ["200px", "50%", "120px", "auto"] },
      m: { nombre: "margin", opciones: ["0 auto", "0", "0 0 0 auto", "0 auto 0 0", "20px auto"] }
    },
    base: ".contenedor{display:flow-root;background:#f9cc9d}.caja{box-sizing:border-box;font-weight:700;text-align:center}",
    inicio: function (c) {
      var m = margenes(c);
      return "Con <code>margin: 0 auto</code> el margen de arriba y abajo es 0 y el de los lados es <code>auto</code>: el navegador reparte el espacio que sobra en partes iguales, " + m.izq + "px a cada lado (la franja naranja), y la caja queda centrada.";
    },
    explicar: function (k, v, c) {
      var m = margenes(c), mg = c.v.m;
      if (c.v.w === "auto" && /auto/.test(mg)) return "Con <code>width: auto</code> la caja ocupa todo el ancho disponible, " + m.ancho + "px, y no sobra espacio: el margen <code>auto</code> se queda en 0 y no hay nada que centrar.";
      if (k === "w") {
        var ancho = v === "50%" ? "<code>50%</code> es la mitad del contenedor, " + m.ancho + "px" : "La caja mide " + m.ancho + "px";
        return ancho + ". " + (/auto/.test(mg) ? "El margen <code>auto</code> se vuelve a calcular con lo que sobra: " + m.izq + "px a la izquierda y " + m.der + "px a la derecha." : "Como el margen no es <code>auto</code>, la caja se queda a la izquierda.");
      }
      if (mg === "0") return "Con <code>margin: 0</code> no hay margen y la caja se queda a la izquierda, como cualquier bloque.";
      if (mg === "0 0 0 auto") return "Solo el margen de la izquierda es <code>auto</code>: se queda con todo lo que sobra, " + m.izq + "px, y la caja se va a la derecha.";
      if (mg === "0 auto 0 0") return "Solo el margen de la derecha es <code>auto</code>: se queda con todo lo que sobra, " + m.der + "px, y la caja se queda a la izquierda.";
      if (mg === "20px auto") return "Arriba y abajo hay 20px de margen, y a los lados <code>auto</code> reparte lo que sobra: " + m.izq + "px a cada lado. La caja sigue centrada.";
      return "Con <code>margin: 0 auto</code> el navegador reparte el espacio que sobra en partes iguales, " + m.izq + "px a cada lado, y la caja queda centrada.";
    }
  });
})();
