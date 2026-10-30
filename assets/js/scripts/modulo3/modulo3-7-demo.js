/* Tema 6 (modulo3-7): elementos dentro de una división. El selector de la
   regla se elige en el menú de vidrio (modulo3-demo-css.js) y la explicación
   dice qué elementos eligió. La línea punteada marca la división .azul. */
(function () {
  "use strict";

  var NOMBRE = {
    h2: "el encabezado de la división",
    p1: "el párrafo de la división",
    p2: "el párrafo de afuera"
  };

  function lista(xs) {
    return xs.length > 1 ? xs.slice(0, -1).join(", ") + " y " + xs[xs.length - 1] : xs[0];
  }

  DemoCSS.crear(document.querySelector("[data-demo-css=\"dentro\"]"), {
    archivo: "index.html",
    tipo: "html",
    codigo: [
      "<«style»>",
      "  {{sel}} {",
      "    color: {{color}};",
      "  }",
      "</«style»>",
      "",
      "<«div» class=\"azul\">",
      "  <«h2»>‹Encabezado en la división›</«h2»>",
      "  <«p»>‹Párrafo dentro de la división.›</«p»>",
      "</«div»>",
      "<«p»>‹Párrafo fuera de la división.›</«p»>"
    ],
    valores: {
      sel: { nombre: "selector", opciones: [".azul p", ".azul h2", ".azul", "div p", "p", "h2 p"] },
      color: { nombre: "color", opciones: ["blue", "crimson", "seagreen", "#8e44ad"] }
    },
    base: ".azul{padding:4px 14px 2px;border:2px dashed #9fb6d9;border-radius:6px;margin-bottom:12px}",
    inicio: function () {
      return "El selector <code>.azul p</code> se lee de izquierda a derecha: los <code>p</code> que están dentro de un elemento con la clase <code>azul</code>. Por eso solo el párrafo de la división se ve azul; el encabezado no es un <code>p</code> y el último párrafo no está dentro de <code>.azul</code>.";
    },
    explicar: function (k, v, c) {
      var sel = c.v.sel;
      if (k === "color") return "Los elementos que elige <code>" + sel + "</code> ahora se ven de color " + v + ".";
      var elegidos = [];
      var els = { h2: c.el(".azul h2"), p1: c.el(".azul p"), p2: c.el("body > p") };
      Object.keys(els).forEach(function (id) { if (els[id].matches(sel)) elegidos.push(NOMBRE[id]); });
      if (sel === ".azul") return "<code>.azul</code> elige a la división completa. El encabezado y el párrafo de adentro no están elegidos, pero <b>heredan</b> su <code>color</code>, así que también cambian. El párrafo de afuera no.";
      if (sel === "p") return "<code>p</code> sin nada antes elige a todos los párrafos de la página, estén donde estén: " + lista(elegidos) + ".";
      if (sel === "h2 p") return "<code>h2 p</code> busca párrafos que estén dentro de un <code>h2</code>, y aquí no hay ninguno: la regla no elige nada y todo se queda igual.";
      if (sel === "div p") return "<code>div p</code> elige los párrafos que están dentro de cualquier <code>div</code>: aquí es " + lista(elegidos) + ", igual que con <code>.azul p</code>, porque solo hay una división.";
      if (sel === ".azul h2") return "<code>.azul h2</code> elige los <code>h2</code> dentro de un elemento con la clase <code>azul</code>: solo " + lista(elegidos) + ".";
      return "<code>.azul p</code> elige los <code>p</code> que están dentro de un elemento con la clase <code>azul</code>: solo " + lista(elegidos) + ".";
    }
  });
})();
