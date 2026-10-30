/* Tema 12 (modulo3-13): margin y padding, con uno a cuatro valores. Como
   en las herramientas del navegador, el margen se ve naranja y el padding
   verde.
   Demo de modulo3-demo-css.js: los valores con flecha se cambian con el
   menú de vidrio y la previsualización cambia en el momento. */
(function () {
  "use strict";

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
    base: ".contenedor{display:flow-root;background:#f9cc9d}.caja{font-weight:700;color:#093b8b}"
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
    base: ".caja{background:#c3e2b4}.caja p{margin:0;padding:4px 6px;background:#ffffff}"
  });
})();
