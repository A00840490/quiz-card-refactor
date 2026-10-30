/* Ejercicio 4 (modulo4-17): problemas de JavaScript, uno tras otro.
   Misma estructura que el Ejercicio 2 (modulo2-16) y el Ejercicio 3
   (modulo3-24): cada recuadro del código es una pregunta, se responde una a
   la vez y, si la respuesta no es correcta, se muestra la correcta para
   seguir. Con el formato de consola verde del módulo 4 (js-terminal.css):
   al completar un problema, el código "corre" y la consola muestra su
   resultado.

   Cada problema tiene:
   - title: lo que se pide; se muestra como comentario en la primera línea.
   - lines: líneas del código; lv es la sangría y {0}, {1}... son los
            recuadros (preguntas) de la línea.
   - out:   lo que imprime la consola al correr.
   - page:  (opcional) página de ejemplo que el código modifica; se muestra
            arriba de la consola.

   En cada pregunta:
   - a:   respuesta correcta.
   - alt: otras respuestas que también se aceptan (opcional).
   - ask: la pregunta.
   - why: explicación; lo que va entre `comillas invertidas` se pinta como
          código. */
(function () {
  "use strict";

  var numeros = [];
  for (var n = 1; n <= 100; n++) numeros.push(String(n));

  var PROBLEMS = [
    {
      title: "Crea una variable llamada num con valor de 120.",
      lines: [
        {
          lv: 0,
          code: "{0} num = 120;",
          q: [
            {
              a: "var",
              alt: ["let", "const"],
              ask: "¿Qué palabra reservada crea una variable?",
              why: "`var` crea una variable; también puedes usar `let` o `const`.",
            },
          ],
        },
        { lv: 0, code: "console.log(num);" },
      ],
      out: ["120"],
    },
    {
      title: "Multiplica x por 8 usando un solo operador.",
      lines: [
        { lv: 0, code: "var x = 5;" },
        {
          lv: 0,
          code: "x {0} 8;",
          q: [
            {
              a: "*=",
              ask: "¿Qué operador multiplica x por 8 y guarda el resultado en la misma x?",
              why: "`x *= 8` es lo mismo que `x = x * 8`: multiplica y asigna en un solo paso.",
            },
          ],
        },
        { lv: 0, code: "console.log(x);" },
      ],
      out: ["40"],
    },
    {
      title: 'Cambia el tercer valor del arreglo palabras por "JavaScript".',
      lines: [
        { lv: 0, code: 'var palabras = ["Ejercicio", "de", "programación", "web"];' },
        {
          lv: 0,
          code: '{0} = "JavaScript";',
          q: [
            {
              a: "palabras[2]",
              ask: "¿Cómo se escribe el tercer valor del arreglo palabras?",
              why: "Los índices empiezan en 0, así que el tercer valor es `palabras[2]`.",
            },
          ],
        },
        { lv: 0, code: "console.log(palabras);" },
      ],
      out: ['["Ejercicio", "de", "JavaScript", "web"]'],
    },
    {
      title: 'Imprime "mayor" si x es mayor que y; si no, imprime "menor".',
      lines: [
        { lv: 0, code: "var x = 27;" },
        { lv: 0, code: "var y = 7 * 4;" },
        {
          lv: 0,
          code: "if ({0}) {",
          q: [
            {
              a: "x > y",
              alt: ["y < x"],
              ask: "¿Qué condición revisa si x es mayor que y?",
              why: "`x > y` solo es verdadera cuando x es mayor que y. Aquí y vale 28, así que es falsa.",
            },
          ],
        },
        {
          lv: 1,
          code: '{0}.log("mayor");',
          q: [
            {
              a: "console",
              ask: "¿Qué objeto usamos para imprimir en la consola?",
              why: "`console.log()` imprime en la consola del navegador.",
            },
          ],
        },
        {
          lv: 0,
          code: "} {0} {",
          q: [
            {
              a: "else",
              ask: "¿Qué palabra abre el bloque que corre cuando la condición no se cumple?",
              why: "`else` corre su bloque cuando la condición del `if` es falsa.",
            },
          ],
        },
        {
          lv: 1,
          code: '{0}.log("menor");',
          q: [
            {
              a: "console",
              ask: "Ahora imprime \"menor\". ¿Qué objeto va antes de .log?",
              why: "Igual que arriba, `console.log()` imprime el texto en la consola.",
            },
          ],
        },
        { lv: 0, code: "}" },
      ],
      out: ["menor"],
    },
    {
      title: "Imprime en la consola los números del 1 al 100 con un ciclo.",
      lines: [
        {
          lv: 0,
          code: "{0} (var i = 1; i {1} 100; i{2}) {",
          q: [
            {
              a: "for",
              ask: "¿Qué ciclo lleva inicio, condición e incremento dentro de sus paréntesis?",
              why: "`for (inicio; condición; incremento)` repite su bloque mientras la condición sea verdadera.",
            },
            {
              a: "<=",
              ask: "¿Qué operador hace que el ciclo llegue hasta 100, incluyéndolo?",
              why: "Con `i <= 100` el ciclo también corre cuando i vale 100; con `<` se detendría en 99.",
            },
            {
              a: "++",
              alt: ["+=1", "=i+1"],
              ask: "¿Qué operador suma 1 a i en cada vuelta?",
              why: "`i++` suma 1 a i; es lo mismo que `i += 1`.",
            },
          ],
        },
        { lv: 1, code: "console.log(i);" },
        { lv: 0, code: "}" },
      ],
      out: numeros,
    },
    {
      title: "Guarda el elemento con ID cont en una variable y pon su texto en rojo.",
      lines: [
        {
          lv: 0,
          code: 'var elem = document.{0}("cont");',
          q: [
            {
              a: "getElementById",
              ask: "¿Qué función de document busca un elemento por su ID?",
              why: "`document.getElementById()` regresa el elemento que tiene ese ID.",
            },
          ],
        },
        {
          lv: 0,
          code: 'elem.{0} = "red";',
          q: [
            {
              a: "style.color",
              ask: "¿Qué propiedad de elem cambia el color de su texto?",
              why: "`elem.style.color` cambia el color del texto; con `style` llegas a los estilos del elemento.",
            },
          ],
        },
        { lv: 0, code: "console.log(elem.style.color);" },
      ],
      out: ["red"],
      page: { id: "cont", text: "Soy el elemento con ID cont." },
    },
  ];

  var root = document.getElementById("reto");
  if (!root) return;
  var out = root.querySelector("[data-out]");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var cursor = '<span class="js-term__cursor" aria-hidden="true"></span>';
  var runTimer = null;

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /* ---------------- Consola ----------------
     Mientras el problema no está completo, la consola espera. Al
     completarlo, el código corre: gira la rueda de carga y salen las
     líneas en blanco (como el botón Correr de las terminales del módulo). */
  function pageHtml(ej, pr) {
    if (!pr.page) return "";
    // La página cambia con cada respuesta: primero se encuentra el
    // elemento y después se pinta de rojo.
    var found = ej.respondida(ej.indice(ej.grupo(), 0, 0));
    var red = ej.respondida(ej.indice(ej.grupo(), 1, 0));
    return (
      '<div class="reto__page"><div class="reto__page-bar">index.html</div>' +
      '<p class="reto__page-el' + (found ? " is-found" : "") + (red ? " is-red" : "") + '">' +
      (found ? '<span class="reto__page-tag">#' + esc(pr.page.id) + "</span>" : "") +
      esc(pr.page.text) + "</p></div>"
    );
  }

  function logLine(s) {
    return '<div class="reto__log-line">' + esc(s) + "</div>";
  }

  function renderConsole(ej, animate, listo) {
    clearTimeout(runTimer);
    var pr = PROBLEMS[ej.grupo()];
    var head = pageHtml(ej, pr);
    if (!ej.completo()) {
      out.innerHTML =
        head + '<div class="reto__wait">// Completa el código para ver el resultado' + cursor + "</div>";
      return;
    }
    if (!animate || reduce) {
      out.innerHTML = head + '<div class="reto__log">' + pr.out.map(logLine).join("") + "</div>" + cursor;
      out.scrollTop = out.scrollHeight;
      listo();
      return;
    }
    out.innerHTML =
      head +
      '<span class="js-term__loading" role="status" aria-label="Ejecutando"><span class="js-term__spinner"></span></span>';
    runTimer = setTimeout(function () {
      out.innerHTML = head + '<div class="reto__log"></div>';
      var log = out.querySelector(".reto__log");
      var i = 0;
      // Los resultados largos (el ciclo del 1 al 100) salen más rápido.
      var speed = pr.out.length > 10 ? 18 : 160;
      (function tick() {
        log.insertAdjacentHTML("beforeend", logLine(pr.out[i]));
        out.scrollTop = out.scrollHeight;
        i++;
        if (i < pr.out.length) runTimer = setTimeout(tick, speed);
        else {
          log.insertAdjacentHTML("afterend", cursor);
          listo();
        }
      })();
    }, 900);
  }

  // El motor está en assets/js/ejercicio-final.js.
  EjercicioFinal.crear(root, {
    clase: "reto",
    grupos: PROBLEMS,
    // Sin espacios ni punto y coma final. JavaScript distingue mayúsculas y
    // minúsculas, así que no se cambian.
    normalizar: function (v) {
      return String(v || "").replace(/\s+/g, "").replace(/;+$/, "");
    },
    avisoMayusculas: "JavaScript distingue mayúsculas de minúsculas.",
    desvanecer: true,
    antes: function (pr) {
      return '<div class="reto__line"><span class="js-term__com">// ' + esc(pr.title) + "</span></div>";
    },
    vista: renderConsole,
    // La ventana de aciertos sale un momento después de que la consola termina.
    esperaVentana: 700,
    mensajeBien: "¡Excelente! Resolviste los problemas casi sin errores.",
  });
})();
