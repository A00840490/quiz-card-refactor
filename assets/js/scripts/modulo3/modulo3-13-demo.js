/* Tema 12 (modulo3-13): margin y padding. Dos demos; el valor de cada
   propiedad se elige en el menú de vidrio (modulo3-demo-css.js) y la
   explicación dice cuánto mide cada lado. Como en las herramientas del
   navegador, el margen se ve naranja y el padding verde. */
(function () {
  "use strict";

  function lados(c, sel, prop) {
    var n = ["Top", "Right", "Bottom", "Left"].map(function (l) { return c.px(sel, prop + l) + "px"; });
    return "arriba " + n[0] + ", a la derecha " + n[1] + ", abajo " + n[2] + " y a la izquierda " + n[3];
  }

  function forma(prop, v) {
    var n = v.split(" ").length;
    if (n === 1) return "Con un solo valor, <code>" + prop + ": " + v + "</code> le da lo mismo a los cuatro lados";
    if (n === 2) return "Con dos valores, el primero es para arriba y abajo y el segundo para la izquierda y la derecha";
    if (n === 3) return "Con tres valores, el primero es para arriba, el segundo para la izquierda y la derecha y el tercero para abajo";
    return "Con cuatro valores, van en el sentido de las manecillas del reloj: arriba, derecha, abajo e izquierda";
  }

  /* ---------- margin ---------- */
  DemoCSS.crear(document.querySelector("[data-demo-css=\"margin\"]"), {
    archivo: "estilos.css",
    tipo: "css",
    html: "<div class=\"contenedor\"><div class=\"caja\">Caja</div></div>",
    codigo: [
      "«.caja» {",
      "  margin: {{m}};",
      "  padding: ‹16px›;",
      "  border: ‹4px solid #0f4c91›;",
      "  background-color: ‹#eaf3ff›;",
      "}"
    ],
    valores: {
      m: { nombre: "margin", opciones: ["24px", "0", "10px 60px", "10px 40px 30px", "10px 20px 40px 80px"] }
    },
    base: ".contenedor{display:flow-root;background:#f9cc9d}.caja{font-weight:700;color:#093b8b}",
    inicio: function (c) {
      return "La franja naranja es el <code>margin</code> de la caja: el espacio que la separa de lo que tiene alrededor. Con <code>margin: 24px</code> mide " + lados(c, ".caja", "margin") + ".";
    },
    explicar: function (k, v, c) {
      if (v === "0") return "Con <code>margin: 0</code> la caja no tiene margen: queda pegada a lo que tiene alrededor y la franja naranja desaparece.";
      return forma("margin", v) + ". Aquí el margen mide " + lados(c, ".caja", "margin") + ".";
    }
  });

  /* ---------- padding ---------- */
  DemoCSS.crear(document.querySelector("[data-demo-css=\"padding\"]"), {
    archivo: "estilos.css",
    tipo: "css",
    html: "<div class=\"caja\"><p>El contenido se aleja del borde según el padding.</p></div>",
    codigo: [
      "«.caja» {",
      "  padding: {{p}};",
      "  border: ‹4px solid #0f4c91›;",
      "}"
    ],
    valores: {
      p: { nombre: "padding", opciones: ["16px", "0", "8px 40px", "30px 10px 5px", "10px 20px 30px 60px"] }
    },
    base: ".caja{background:#c3e2b4}.caja p{margin:0;padding:4px 6px;background:#ffffff}",
    inicio: function (c) {
      return "La franja verde es el <code>padding</code>: el espacio entre el contenido (en blanco) y el borde azul. Con <code>padding: 16px</code> mide " + lados(c, ".caja", "padding") + ".";
    },
    explicar: function (k, v, c) {
      if (v === "0") return "Con <code>padding: 0</code> el contenido queda pegado al borde: la franja verde desaparece.";
      return forma("padding", v) + ". Aquí el padding mide " + lados(c, ".caja", "padding") + ".";
    }
  });
})();
