/* Tema 1 (modulo3-2): formato de CSS. Selectores, declaraciones y un
   selector con varios elementos separados por comas. Los valores del código
   se cambian con el menú de vidrio (modulo3-demo-css.js); entre las opciones
   hay valores inválidos para ver que el navegador los ignora. */
(function () {
  "use strict";

  function tipoDeColor(c) {
    if (/^#/.test(c)) return "<code>" + c + "</code> es un código hexadecimal: dos cifras para el rojo, dos para el verde y dos para el azul.";
    if (/^rgb/.test(c)) return "<code>" + c + "</code> mezcla rojo, verde y azul, cada uno del 0 al 255.";
    return "<code>" + c + "</code> es el nombre de un color en inglés.";
  }

  function invalido(prop, valor, quien) {
    return "<span class=\"mal\">" + valor + "</span> no es un valor válido para <code>" + prop + "</code>, así que el navegador ignora la declaración y " + quien + ".";
  }

  DemoCSS.crear(document.querySelector("[data-demo-css=\"formato\"]"), {
    archivo: "estilos.css",
    tipo: "css",
    html:
      "<h1>Mi página con estilo</h1>" +
      "<p>Este párrafo tiene el tamaño de letra que dice el selector p.</p>" +
      "<p>Este también, porque es otro elemento p.</p>",
    codigo: [
      "«h1» {",
      "  color: {{color}};",
      "  background-color: {{fondo}};",
      "}",
      "",
      "«p» {",
      "  font-size: {{tam}};",
      "}",
      "",
      "«h1», «p» {",
      "  font-family: {{fuente}};",
      "}"
    ],
    valores: {
      color: { nombre: "color", opciones: ["white", "yellow", "#ffcc00", "rgb(255, 99, 71)", "blanco"] },
      fondo: { nombre: "background-color", opciones: ["navy", "teal", "#8e44ad", "rgb(15, 76, 145)", "azul"] },
      tam: { nombre: "font-size", opciones: ["18px", "14px", "24px", "32px", "18"] },
      fuente: { nombre: "font-family", opciones: ["Arial, sans-serif", "Georgia, serif", "\"Courier New\", monospace", "\"Comic Sans MS\", cursive"] }
    },
    base: "h1{padding:8px 12px}",
    inicio: function () {
      return "Cada regla empieza con un <b>selector</b> (<code>h1</code>, <code>p</code>) y entre llaves lleva sus <b>declaraciones</b>, cada una con una propiedad, su valor y un <code>;</code> al final. La última regla usa <code>h1, p</code>: los selectores separados por comas reciben el mismo estilo.";
    },
    explicar: function (k, v, c) {
      if (k === "color") {
        if (!DemoCSS.esColor(v)) return invalido("color", v, "el título se queda con su color normal");
        return "<code>color</code> cambia el color del texto del <code>h1</code>. " + tipoDeColor(v);
      }
      if (k === "fondo") {
        if (!DemoCSS.esColor(v)) return invalido("background-color", v, "el título se queda sin fondo" + (/^(white|yellow|#ffcc00)$/.test(c.v.color) ? ": por eso su texto claro casi no se ve" : ""));
        return "<code>background-color</code> pinta el fondo del <code>h1</code>. " + tipoDeColor(v);
      }
      if (k === "tam") {
        if (!DemoCSS.valido("font-size", v)) return invalido("font-size", v, "los párrafos se quedan con su tamaño normal de " + c.px("p", "fontSize") + "px: a los tamaños les falta la unidad, como <code>px</code>");
        return "<code>font-size</code> cambia el tamaño de letra de los dos párrafos, porque el selector <code>p</code> elige a todos los elementos p: ahora miden " + v + ".";
      }
      return "<code>font-family</code> cambia el tipo de letra. Como el selector es <code>h1, p</code>, el título y los párrafos reciben el mismo: " + v.split(",")[0] + ". La segunda fuente de la lista se usa si la primera no está instalada.";
    }
  });
})();
