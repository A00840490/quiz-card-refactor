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

  // Lista plana de preguntas, en orden.
  var QUESTIONS = [];
  PROBLEMS.forEach(function (pr, pi) {
    pr.lines.forEach(function (line, li) {
      (line.q || []).forEach(function (q, bi) {
        QUESTIONS.push({ pr: pi, line: li, blank: bi, data: q });
      });
    });
  });

  var root = document.getElementById("reto");
  if (!root) return;
  var els = {
    ask: root.querySelector("[data-ask]"),
    feedback: root.querySelector("[data-feedback]"),
    code: root.querySelector("[data-code]"),
    out: root.querySelector("[data-out]"),
    progress: root.querySelector("[data-progress]"),
    check: root.querySelector("[data-check]"),
    next: root.querySelector("[data-next]"),
    nextPr: root.querySelector("[data-next-pr]"),
  };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var cursor = '<span class="js-term__cursor" aria-hidden="true"></span>';

  var state;
  var runTimer = null;

  function reset() {
    state = {
      current: 0, // pregunta actual (índice en QUESTIONS)
      pr: 0, // problema que se muestra
      answers: [], // valor correcto de cada pregunta ya respondida
      correct: [], // true/false por pregunta
      waiting: false, // mostrando corrección, esperando "Continuar"
      between: false, // problema terminado, esperando "Siguiente problema"
      done: false, // todos los problemas terminados
    };
    render(false);
    setText(els.feedback, "", "reto__feedback");
  }

  // Sin espacios ni punto y coma final. JavaScript distingue mayúsculas y
  // minúsculas, así que no se cambian.
  function norm(v) {
    return String(v || "").replace(/\s+/g, "").replace(/;+$/, "");
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // Texto con `código` en <code>.
  function rich(s) {
    return esc(s).replace(/`([^`]+)`/g, "<code>$1</code>");
  }

  function qIndex(pi, li, bi) {
    for (var i = 0; i < QUESTIONS.length; i++) {
      var q = QUESTIONS[i];
      if (q.pr === pi && q.line === li && q.blank === bi) return i;
    }
    return -1;
  }

  function isDone(qi) {
    return qi < state.current || (qi === state.current && state.waiting);
  }

  function complete() {
    return state.between || state.done;
  }

  // Cambia un texto con desvanecido (estándar del curso).
  function setText(el, html, cls) {
    if (el.innerHTML === html && el.className === cls) return;
    if (reduce || !el.innerHTML) {
      el.className = cls;
      el.innerHTML = html;
      return;
    }
    el.classList.add("is-fading");
    clearTimeout(el._fade);
    el._fade = setTimeout(function () {
      el.className = cls;
      el.innerHTML = html;
    }, 180);
  }

  /* ---------------- Barra de progreso: un tramo por problema ----------------
     Los tramos se crean una sola vez y después solo cambia su ancho, así la
     transición del CSS anima el avance. */
  var segments = PROBLEMS.map(function () {
    var seg = document.createElement("span");
    seg.className = "reto__seg";
    var fill = document.createElement("span");
    fill.style.width = "0%";
    seg.appendChild(fill);
    els.progress.appendChild(seg);
    return { seg: seg, fill: fill };
  });

  function renderProgress() {
    var answered = state.done ? QUESTIONS.length : state.current + (state.waiting ? 1 : 0);
    segments.forEach(function (s, pi) {
      var total = 0;
      var done = 0;
      QUESTIONS.forEach(function (q, i) {
        if (q.pr !== pi) return;
        total++;
        if (i < answered) done++;
      });
      s.fill.style.width = (done / total) * 100 + "%";
      s.seg.classList.toggle("is-done", done === total);
      s.seg.classList.toggle("is-current", done !== total && pi === state.pr);
    });
  }

  /* ---------------- Código ---------------- */
  function blankHtml(qi) {
    if (isDone(qi)) {
      var cls = state.correct[qi] ? "is-right" : "is-fixed";
      return '<span class="reto__filled ' + cls + '">' + esc(state.answers[qi]) + "</span>";
    }
    if (qi === state.current && !complete()) {
      return (
        '<input class="reto__blank" data-input type="text" autocomplete="off" ' +
        'autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Respuesta" />'
      );
    }
    return '<span class="reto__pending">___</span>';
  }

  function lineHtml(pi, li) {
    var mark = "\u0000";
    var raw = esc(PROBLEMS[pi].lines[li].code.replace(/\{(\d)\}/g, mark + "$1" + mark));
    return raw.replace(new RegExp(mark + "(\\d)" + mark, "g"), function (_, n) {
      return blankHtml(qIndex(pi, li, +n));
    });
  }

  // Líneas visibles: hasta la de la pregunta actual; todas al terminar.
  function lastVisibleLine() {
    var pr = PROBLEMS[state.pr];
    if (complete()) return pr.lines.length - 1;
    return QUESTIONS[state.current].line;
  }

  function renderCode() {
    var pr = PROBLEMS[state.pr];
    var last = lastVisibleLine();
    var html = [
      '<div class="reto__line"><span class="js-term__com">// ' + esc(pr.title) + "</span></div>",
    ];
    for (var li = 0; li <= last; li++) {
      var isCurrent = li === last && !complete();
      html.push(
        '<div class="reto__line' + (isCurrent ? " is-current" : "") + '" style="--lv:' +
          pr.lines[li].lv + '">' + lineHtml(state.pr, li) + "</div>"
      );
    }
    els.code.innerHTML = html.join("");

    var input = els.code.querySelector("[data-input]");
    if (input) {
      input.addEventListener("input", function () {
        sizeInput(input);
      });
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          check();
        }
      });
      sizeInput(input);
      input.focus({ preventScroll: true });
    }
  }

  function sizeInput(input) {
    input.style.width = Math.max(4, input.value.length + 1) + "ch";
  }

  /* ---------------- Consola ----------------
     Mientras el problema no está completo, la consola espera. Al
     completarlo, el código corre: gira la rueda de carga y salen las
     líneas en blanco (como el botón Correr de las terminales del módulo). */
  function pageHtml(pr) {
    if (!pr.page) return "";
    // La página cambia con cada respuesta: primero se encuentra el
    // elemento y después se pinta de rojo.
    var found = isDone(qIndex(state.pr, 0, 0));
    var red = isDone(qIndex(state.pr, 1, 0));
    return (
      '<div class="reto__page"><div class="reto__page-bar">index.html</div>' +
      '<p class="reto__page-el' + (found ? " is-found" : "") + (red ? " is-red" : "") + '">' +
      (found ? '<span class="reto__page-tag">#' + esc(pr.page.id) + "</span>" : "") +
      esc(pr.page.text) + "</p></div>"
    );
  }

  function renderConsole(animate) {
    clearTimeout(runTimer);
    var pr = PROBLEMS[state.pr];
    var head = pageHtml(pr);
    if (!complete()) {
      els.out.innerHTML =
        head + '<div class="reto__wait">// Completa el código para ver el resultado' + cursor + "</div>";
      return;
    }
    if (!animate || reduce) {
      els.out.innerHTML =
        head + '<div class="reto__log">' + pr.out.map(logLine).join("") + "</div>" + cursor;
      els.out.scrollTop = els.out.scrollHeight;
      return;
    }
    els.out.innerHTML =
      head +
      '<span class="js-term__loading" role="status" aria-label="Ejecutando"><span class="js-term__spinner"></span></span>';
    runTimer = setTimeout(function () {
      els.out.innerHTML = head + '<div class="reto__log"></div>';
      var log = els.out.querySelector(".reto__log");
      var i = 0;
      // Los resultados largos (el ciclo del 1 al 100) salen más rápido.
      var speed = pr.out.length > 10 ? 18 : 160;
      (function tick() {
        log.insertAdjacentHTML("beforeend", logLine(pr.out[i]));
        els.out.scrollTop = els.out.scrollHeight;
        i++;
        if (i < pr.out.length) runTimer = setTimeout(tick, speed);
        else {
          log.insertAdjacentHTML("afterend", cursor);
          root.dispatchEvent(new CustomEvent("reto:ran"));
        }
      })();
    }, 900);
  }

  function logLine(s) {
    return '<div class="reto__log-line">' + esc(s) + "</div>";
  }

  /* ---------------- Encabezado y botones ---------------- */
  function renderHeader() {
    renderProgress();
    // Al terminar un problema se queda la última pregunta con su corrección;
    // el siguiente problema sale hasta presionar el botón.
    var q = QUESTIONS[complete() ? state.current - 1 : state.current];
    setText(els.ask, esc(q ? q.data.ask : ""), "reto__ask");

    // Al terminar todo, el botón de Revisar se vuelve "Intentar de nuevo".
    els.check.textContent = state.done ? "Intentar de nuevo" : "Revisar";
    els.check.hidden = state.waiting || state.between;
    els.next.hidden = !state.waiting;
    els.nextPr.hidden = !state.between;
  }

  function render(animateConsole) {
    renderHeader();
    renderCode();
    renderConsole(animateConsole);
  }

  // Recuadro vacío: sacudida de lado a lado (como en los ejercicios 2 y 3).
  function shake(input) {
    if (!input) return;
    input.classList.remove("is-shaking");
    void input.offsetWidth; // reinicia la animación si se presiona varias veces
    input.classList.add("is-shaking");
    ["animationend", "input"].forEach(function (type) {
      input.addEventListener(
        type,
        function () {
          input.classList.remove("is-shaking");
        },
        { once: true }
      );
    });
    input.focus();
  }

  function check() {
    if (state.waiting || complete()) return;
    var input = els.code.querySelector("[data-input]");
    var q = QUESTIONS[state.current];
    var given = input ? input.value : "";
    if (!norm(given)) {
      shake(input);
      return;
    }
    var accepted = [q.data.a].concat(q.data.alt || []);
    var ok = accepted.some(function (a) {
      return norm(given) === norm(a);
    });
    // Mismo texto con otras mayúsculas: se explica por qué no cuenta.
    var caseOnly =
      !ok &&
      accepted.some(function (a) {
        return norm(given).toLowerCase() === norm(a).toLowerCase();
      });
    state.correct[state.current] = ok;
    state.answers[state.current] = q.data.a;

    var fb = ok
      ? "<strong>¡Correcto!</strong> " + rich(q.data.why)
      : "<strong>No es correcto.</strong> Escribiste <code>" + esc(given.trim()) +
        "</code>; la respuesta es <code>" + esc(q.data.a) + "</code>. " +
        (caseOnly ? "JavaScript distingue mayúsculas de minúsculas. " : "") + rich(q.data.why);
    // Toda la corrección va en verde o en rojo; el código, en el azul del curso.
    var fbClass = "reto__feedback " + (ok ? "is-right" : "is-wrong");

    var lastOfProblem =
      state.current === QUESTIONS.length - 1 || QUESTIONS[state.current + 1].pr !== state.pr;

    if (lastOfProblem) {
      // Última pregunta del problema: no hace falta "Continuar", el código
      // corre de una vez y la consola muestra el resultado.
      state.current++;
      if (state.current >= QUESTIONS.length) state.done = true;
      else state.between = true;
      render(true);
      setText(els.feedback, fb, fbClass);
      if (state.done) {
        // La ventana de aciertos sale cuando la consola termina de imprimir.
        root.addEventListener("reto:ran", finish, { once: true });
        els.check.focus({ preventScroll: true });
      } else {
        els.nextPr.focus({ preventScroll: true });
      }
    } else {
      // Bien o mal, la siguiente pregunta sale hasta presionar "Continuar".
      state.waiting = true;
      render(false);
      setText(els.feedback, fb, fbClass);
      els.next.focus({ preventScroll: true });
    }
  }

  function next() {
    state.waiting = false;
    state.current++;
    render(false);
    setText(els.feedback, "", "reto__feedback");
  }

  function nextProblem() {
    state.between = false;
    state.pr++;
    render(false);
    setText(els.feedback, "", "reto__feedback");
  }

  // Al terminar: ventana con los aciertos y si conviene volver a intentarlo.
  function finish() {
    if (!state.done) return;
    var total = QUESTIONS.length;
    var hits = state.correct.filter(Boolean).length;
    var passed = hits * 100 >= total * 80;

    var modal = document.getElementById("modal-fs");
    if (!modal || !window.jQuery) return;
    modal.querySelector("#modal-score").textContent = hits + " / " + total + " aciertos";
    modal.querySelector("#modal-message").textContent = passed
      ? "¡Excelente! Resolviste los problemas casi sin errores."
      : "Te recomendamos repasar los temas que fallaste y volver a intentarlo.";
    modal.querySelector("#correct-img").style.display = passed ? "block" : "none";
    modal.querySelector("#incorrect-img").style.display = passed ? "none" : "block";
    setTimeout(function () {
      window.jQuery(modal).modal("show");
    }, 700);
  }

  els.check.addEventListener("click", function () {
    if (state.done) {
      reset();
      root.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      check();
    }
  });
  els.next.addEventListener("click", next);
  els.nextPr.addEventListener("click", nextProblem);
  root.classList.add("reto--ready");
  reset();
})();
