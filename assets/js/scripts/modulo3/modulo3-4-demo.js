/* Tema 3 (modulo3-4): id y class. Un id para el primer párrafo y clases
   para los otros dos; la clase del último párrafo también se elige en el menú.
   Demo de modulo3-demo-css.js: los valores con flecha se cambian con el
   menú de vidrio y la previsualización cambia en el momento. */
(function () {
  "use strict";

  DemoCSS.crear(document.querySelector("[data-demo-css=\"id-clase\"]"), {
    archivo: "index.html",
    tipo: "html",
    codigo: [
      "<«style»>",
      "  «p» {",
      "    font-family: {{fuente}};",
      "    font-size: {{tam}};",
      "  }",
      "  «#rojo» {",
      "    color: {{rojo}};",
      "  }",
      "  «.azul» {",
      "    color: {{azul}};",
      "  }",
      "  «.pequeño» {",
      "    font-size: {{chico}};",
      "  }",
      "</«style»>",
      "<«p» id=\"rojo\">",
      "  ‹Este texto se modificó usando un ID.›",
      "</«p»>",
      "<«p» class=\"azul\">",
      "  ‹Este texto se modificó usando una clase.›",
      "</«p»>",
      "<«p» class=\"{{clases}}\">",
      "  ‹Este texto también se modificó usando clases.›",
      "</«p»>"
    ],
    valores: {
      fuente: { nombre: "font-family", opciones: ["Arial, Helvetica, sans-serif", "Georgia, serif", "\"Courier New\", monospace", "Verdana, sans-serif"] },
      tam: { nombre: "font-size", opciones: ["32px", "24px", "40px"] },
      rojo: { nombre: "color", opciones: ["red", "crimson", "orange", "green"] },
      azul: { nombre: "color", opciones: ["blue", "navy", "teal", "purple"] },
      chico: { nombre: "font-size", opciones: ["18px", "14px", "24px"] },
      clases: { nombre: "class", opciones: ["azul pequeño", "azul", "pequeño"] }
    },
    base: "p{margin:0 0 .5em;line-height:1.3}"
  });
})();
