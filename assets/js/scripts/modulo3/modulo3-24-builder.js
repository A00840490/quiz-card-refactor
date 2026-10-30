/* Ejercicio 3 (modulo3-24): varios ejercicios de CSS, uno tras otro.
   Mismo estilo que el Ejercicio 2 (modulo2-16): cada recuadro del código es una
   pregunta y, al responder, la regla se aplica en la vista previa.

   Cada ejercicio tiene:
   - title:    lo que se pide (referencia; no se muestra).
   - target:   el elemento HTML al que se aplica (referencia; no se muestra).
   - selector: selector de la regla.
   - lines:    declaraciones; {0}, {1}... son los recuadros (preguntas).
   - html:     contenido de la vista previa.
   - base:     estilos de apoyo para la vista previa (no forman parte del ejercicio).

   En cada pregunta:
   - a:     respuesta correcta.
   - alt:   otras respuestas que también se aceptan (opcional).
   - exact: distingue mayúsculas y minúsculas (opcional). */
(function () {
  "use strict";

  var EXERCISES = [
    {
      title: "Párrafo con letra roja, subrayada y fuente Arial.",
      target: "<p>",
      selector: "p",
      lines: [
        {
          code: "{0}: red;",
          q: [
            {
              a: "color",
              ask: "¿Qué propiedad cambia el color del texto?",
              why: "`color` define el color del texto; `background-color`, el del fondo.",
            },
          ],
        },
        {
          code: "text-decoration: {0};",
          q: [
            {
              a: "underline",
              ask: "¿Qué valor de text-decoration subraya el texto?",
              why: "`underline` subraya el texto; `line-through` lo tacha y `none` quita la decoración.",
            },
          ],
        },
        {
          code: "{0}: Arial;",
          q: [
            {
              a: "font-family",
              ask: "¿Qué propiedad define la fuente (el tipo de letra) del texto?",
              why: "`font-family` indica la fuente; `font-size`, su tamaño.",
            },
          ],
        },
      ],
      html:
        "<p>Este párrafo debe verse rojo, subrayado y con letra Arial.</p>" +
        "<p>Este también es un párrafo, así que la regla <b>p</b> lo cambia igual.</p>",
    },
    {
      title: "Contenedor con color de fondo amarillo, tamaño de fuente de 18px y texto centrado.",
      target: '<div class="contenedor">',
      selector: ".contenedor",
      lines: [
        {
          code: "{0}: yellow;",
          q: [
            {
              a: "background-color",
              alt: ["background"],
              ask: "¿Qué propiedad cambia el color de fondo del contenedor?",
              why: "`background-color` pinta el fondo del elemento.",
            },
          ],
        },
        {
          code: "{0}: 18px;",
          q: [
            {
              a: "font-size",
              ask: "¿Qué propiedad define el tamaño de la fuente?",
              why: "`font-size` define el tamaño del texto, por ejemplo en `px`.",
            },
          ],
        },
        {
          code: "{0}: {1};",
          q: [
            {
              a: "text-align",
              ask: "¿Qué propiedad alinea el texto dentro del contenedor?",
              why: "`text-align` alinea el texto: `left`, `right`, `center` o `justify`.",
            },
            {
              a: "center",
              ask: "¿Qué valor de text-align centra el texto?",
              why: "`text-align: center` centra el texto horizontalmente.",
            },
          ],
        },
      ],
      html:
        '<div class="contenedor"><p>Este texto está dentro del contenedor.</p>' +
        "<p>Debe tener fondo amarillo, letra de 18px y estar centrado.</p></div>" +
        "<p>Este párrafo está fuera del contenedor y no cambia.</p>",
    },
    {
      title:
        "Una barra de navegación fijada en la esquina superior izquierda de la ventana, con padding hacia todos los lados de 20px.",
      target: "<nav>",
      selector: "nav",
      lines: [
        {
          code: "position: {0};",
          q: [
            {
              a: "fixed",
              ask: "¿Qué valor de position fija el elemento a la ventana, aunque se haga scroll?",
              why: "`position: fixed` posiciona el elemento respecto a la ventana y lo mantiene ahí al hacer scroll.",
            },
          ],
        },
        {
          code: "{0}: 0;",
          q: [
            {
              a: "top",
              ask: "¿Qué propiedad pega la barra al borde superior?",
              why: "`top` indica la distancia al borde superior; con `0` queda pegada arriba.",
            },
          ],
        },
        {
          code: "left: {0};",
          q: [
            {
              a: "0",
              alt: ["0px"],
              ask: "¿Qué valor de left pega la barra al borde izquierdo?",
              why: "`left: 0` deja la barra sin distancia al borde izquierdo.",
            },
          ],
        },
        {
          code: "{0}: 20px;",
          q: [
            {
              a: "padding",
              ask: "¿Qué propiedad agrega espacio interno hacia todos los lados?",
              why: "`padding` es el espacio interno; con un solo valor se aplica a los cuatro lados.",
            },
          ],
        },
      ],
      html:
        "<nav>Inicio · Cursos · Contacto</nav>" +
        "<p>Haz scroll dentro de esta vista previa: cuando la barra sea <b>fixed</b> se quedará en su lugar.</p>" +
        "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante.</p>".repeat(8),
      base:
        "nav { background: #0f4c91; color: #fff; font-family: Arial, sans-serif; }" +
        "p { margin: 0 0 16px; }",
    },
    {
      title:
        "Una división con un ancho de la mitad de su elemento padre, pero que no pueda ser menos de 400px, centrada utilizando márgenes.",
      target: '<div id="division1">',
      selector: "#division1",
      lines: [
        {
          code: "width: {0};",
          q: [
            {
              a: "50%",
              ask: "¿Qué valor de width hace que mida la mitad de su elemento padre?",
              why: "Los porcentajes se calculan sobre el elemento padre: `50%` es la mitad.",
            },
          ],
        },
        {
          code: "{0}: 400px;",
          q: [
            {
              a: "min-width",
              ask: "¿Qué propiedad evita que la división sea más angosta de 400px?",
              why: "`min-width` fija el ancho mínimo; `max-width`, el máximo.",
            },
          ],
        },
        {
          code: "margin: {0};",
          q: [
            {
              a: "auto",
              alt: ["0 auto"],
              ask: "¿Qué valor de margin centra la división horizontalmente?",
              why: "Con `margin: auto` el navegador reparte el espacio sobrante a ambos lados y la centra.",
            },
          ],
        },
      ],
      html: '<div id="division1">División 1</div>',
      base:
        "#division1 { padding: 14px; border: 2px solid #0f4c91; background: #dbe9ff;" +
        " font-family: Arial, sans-serif; box-sizing: border-box; }",
    },
  ];

  var root = document.getElementById("builder");
  if (!root) return;
  var frame = root.querySelector("[data-frame]");

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // CSS del alumno hasta donde va: solo las declaraciones ya completas.
  function studentCss(ej) {
    var ei = ej.grupo();
    var ex = EXERCISES[ei];
    var decls = [];
    ex.lines.forEach(function (d, li) {
      var values = (d.q || []).map(function (_, bi) {
        var qi = ej.indice(ei, li, bi);
        return ej.respondida(qi) ? ej.respuesta(qi) : null;
      });
      if (values.indexOf(null) !== -1) return;
      decls.push(
        "  " + d.code.replace(/\{(\d)\}/g, function (_, n) {
          return values[+n];
        })
      );
    });
    return ex.selector + " {\n" + decls.join("\n") + "\n}";
  }

  // El motor está en assets/js/ejercicio-final.js.
  EjercicioFinal.crear(root, {
    clase: "builder",
    grupos: EXERCISES,
    sangria: 1,
    tramo: "css-builder__seg",
    normalizar: function (v, exact) {
      v = String(v || "").replace(/[;:"'\s]/g, "");
      return exact ? v : v.toLowerCase();
    },
    // Declaración con colores: propiedad, dos puntos, valor.
    colorear: function (raw) {
      var m = raw.match(/^([^:]*):(.*);$/);
      return m
        ? '<span class="css-builder__prop">' + m[1] + "</span>:" +
            '<span class="css-builder__val">' + m[2] + "</span>;"
        : raw;
    },
    antes: function (ex) {
      return (
        '<div class="builder__line" style="--lv:0"><span class="css-builder__sel">' +
        esc(ex.selector) + "</span> {</div>"
      );
    },
    despues: function () {
      return '<div class="builder__line" style="--lv:0">}</div>';
    },
    vista: function (ej, animar, listo) {
      var ex = EXERCISES[ej.grupo()];
      frame.srcdoc =
        '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">' +
        "<style>body { margin: 16px; }" + (ex.base || "") + "</style>" +
        "<style>" + studentCss(ej) + "</style></head><body>" + ex.html + "</body></html>";
      listo();
    },
    mensajeBien: "¡Excelente! Completaste los ejercicios casi sin errores.",
  });
})();
