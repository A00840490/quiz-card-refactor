/* Tema 19 (modulo3-20): anchura mínima y máxima. width, min-width y
   max-width se eligen en el menú de vidrio (modulo3-demo-css.js) y la
   explicación dice cuál de los tres decidió el ancho, con las medidas reales
   de la vista previa. */
(function () {
  "use strict";

  function porcentaje(v) {
    return /%$/.test(v) ? parseFloat(v) / 100 : null;
  }

  // Cuánto pide width, y si min-width o max-width lo corrigen
  function decide(c) {
    var total = c.px(".contenedor", "width"), v = c.v;
    var pide = porcentaje(v.w) !== null ? Math.round(total * porcentaje(v.w)) : parseFloat(v.w);
    var min = v.min === "0" ? 0 : parseFloat(v.min), max = v.max === "none" ? Infinity : parseFloat(v.max);
    var queda = c.px(".caja", "width");
    var t = "El contenedor mide " + total + "px, así que <code>width: " + v.w + "</code> pide " + pide + "px. ";
    if (min > max && queda === min) return t + "Aquí <code>min-width</code> (" + v.min + ") es mayor que <code>max-width</code> (" + v.max + "): cuando chocan, gana <code>min-width</code> y la caja mide " + queda + "px.";
    if (pide < min) return t + "Como es menos que <code>min-width: " + v.min + "</code>, la caja no se encoge más: mide " + queda + "px.";
    if (pide > max) return t + "Como es más que <code>max-width: " + v.max + "</code>, la caja no crece más: mide " + queda + "px.";
    return t + "Queda entre <code>min-width</code> y <code>max-width</code>, así que la caja mide justo eso: " + queda + "px.";
  }

  DemoCSS.crear(document.querySelector("[data-demo-css=\"min-max\"]"), {
    archivo: "estilos.css",
    tipo: "css",
    html: "<div class=\"contenedor\"><div class=\"caja\">Caja</div></div>",
    codigo: [
      "«.caja» {",
      "  width: {{w}};",
      "  min-width: {{min}};",
      "  max-width: {{max}};",
      "  padding: ‹12px 0›;",
      "  background-color: ‹#0f4c91›;",
      "  color: ‹white›;",
      "}"
    ],
    valores: {
      w: { nombre: "width", opciones: ["50%", "20%", "80%", "100%"] },
      min: { nombre: "min-width", opciones: ["200px", "0", "120px", "300px"] },
      max: { nombre: "max-width", opciones: ["800px", "none", "250px", "350px"] }
    },
    base: ".caja{font-weight:700;text-align:center}",
    inicio: function (c) {
      return "La caja pide la mitad del ancho con <code>width: 50%</code>, pero <code>min-width</code> y <code>max-width</code> le ponen límites: siempre medirá entre 200 y 800 píxeles. " + decide(c);
    },
    explicar: function (k, v, c) {
      return decide(c);
    }
  });
})();
