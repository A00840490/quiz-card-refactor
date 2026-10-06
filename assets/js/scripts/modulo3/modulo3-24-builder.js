/* Ejercicio 3 (modulo3-24): varios ejercicios de CSS, uno tras otro.
   Mismo estilo que el Ejercicio 2 (modulo2-16): cada recuadro del código es una
   pregunta y, al responder, la regla se aplica en la vista previa.

   Cada ejercicio tiene:
   - title:    lo que se pide (referencia; no se muestra).
   - target:   el elemento HTML al que se aplica (referencia; no se muestra).
   - selector: selector de la regla.
   - decls:    declaraciones; {0}, {1}... son los recuadros (preguntas).
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
      decls: [
        {
          code: "{0}: red;",
          q: [
            {
              a: "color",
              ask: "¿Qué propiedad cambia el color del texto?",
              why: "color define el color del texto; background-color, el del fondo.",
            },
          ],
        },
        {
          code: "text-decoration: {0};",
          q: [
            {
              a: "underline",
              ask: "¿Qué valor de text-decoration subraya el texto?",
              why: "underline subraya el texto; line-through lo tacha y none quita la decoración.",
            },
          ],
        },
        {
          code: "{0}: Arial;",
          q: [
            {
              a: "font-family",
              ask: "¿Qué propiedad define la fuente (el tipo de letra) del texto?",
              why: "font-family indica la fuente; font-size, su tamaño.",
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
      decls: [
        {
          code: "{0}: yellow;",
          q: [
            {
              a: "background-color",
              alt: ["background"],
              ask: "¿Qué propiedad cambia el color de fondo del contenedor?",
              why: "background-color pinta el fondo del elemento.",
            },
          ],
        },
        {
          code: "{0}: 18px;",
          q: [
            {
              a: "font-size",
              ask: "¿Qué propiedad define el tamaño de la fuente?",
              why: "font-size define el tamaño del texto, por ejemplo en px.",
            },
          ],
        },
        {
          code: "{0}: {1};",
          q: [
            {
              a: "text-align",
              ask: "¿Qué propiedad alinea el texto dentro del contenedor?",
              why: "text-align alinea el texto: left, right, center o justify.",
            },
            {
              a: "center",
              ask: "¿Qué valor de text-align centra el texto?",
              why: "text-align: center centra el texto horizontalmente.",
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
      decls: [
        {
          code: "position: {0};",
          q: [
            {
              a: "fixed",
              ask: "¿Qué valor de position fija el elemento a la ventana, aunque se haga scroll?",
              why: "position: fixed posiciona el elemento respecto a la ventana y lo mantiene ahí al hacer scroll.",
            },
          ],
        },
        {
          code: "{0}: 0;",
          q: [
            {
              a: "top",
              ask: "¿Qué propiedad pega la barra al borde superior?",
              why: "top indica la distancia al borde superior; con 0 queda pegada arriba.",
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
              why: "left: 0 deja la barra sin distancia al borde izquierdo.",
            },
          ],
        },
        {
          code: "{0}: 20px;",
          q: [
            {
              a: "padding",
              ask: "¿Qué propiedad agrega espacio interno hacia todos los lados?",
              why: "padding es el espacio interno; con un solo valor se aplica a los cuatro lados.",
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
      decls: [
        {
          code: "width: {0};",
          q: [
            {
              a: "50%",
              ask: "¿Qué valor de width hace que mida la mitad de su elemento padre?",
              why: "Los porcentajes se calculan sobre el elemento padre: 50% es la mitad.",
            },
          ],
        },
        {
          code: "{0}: 400px;",
          q: [
            {
              a: "min-width",
              ask: "¿Qué propiedad evita que la división sea más angosta de 400px?",
              why: "min-width fija el ancho mínimo; max-width, el máximo.",
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
              why: "Con margin: auto el navegador reparte el espacio sobrante a ambos lados y la centra.",
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

  // Lista plana de preguntas, en orden.
  var QUESTIONS = [];
  EXERCISES.forEach(function (ex, ei) {
    ex.decls.forEach(function (d, li) {
      (d.q || []).forEach(function (q, bi) {
        QUESTIONS.push({ ex: ei, line: li, blank: bi, data: q });
      });
    });
  });

  var root = document.getElementById("builder");
  if (!root) return;
  var els = {
    actions: root.querySelector("[data-actions]"),
    progress: root.querySelector("[data-progress]"),
    ask: root.querySelector("[data-ask]"),
    feedback: root.querySelector("[data-feedback]"),
    check: root.querySelector("[data-check]"),
    next: root.querySelector("[data-next]"),
    nextEx: root.querySelector("[data-next-ex]"),
    code: root.querySelector("[data-code]"),
    frame: root.querySelector("[data-frame]"),
  };

  var state;

  function reset() {
    state = {
      current: 0, // pregunta actual (índice en QUESTIONS)
      ex: 0, // ejercicio que se muestra
      answers: [], // valor correcto de cada pregunta ya respondida
      correct: [], // true/false por pregunta
      waiting: false, // mostrando corrección, esperando "Continuar"
      between: false, // ejercicio terminado, esperando "Siguiente ejercicio"
      done: false, // todos los ejercicios terminados
    };
    render();
  }

  function norm(v, exact) {
    v = String(v || "").replace(/[;:"'\s]/g, "");
    return exact ? v : v.toLowerCase();
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function qIndex(ei, li, bi) {
    for (var i = 0; i < QUESTIONS.length; i++) {
      var q = QUESTIONS[i];
      if (q.ex === ei && q.line === li && q.blank === bi) return i;
    }
    return -1;
  }

  function isDone(qi) {
    return qi < state.current || (qi === state.current && state.waiting);
  }

  // ¿El ejercicio que se muestra ya tiene todas sus preguntas respondidas?
  function exerciseComplete() {
    return state.between || state.done;
  }

  // Última declaración visible del ejercicio que se muestra.
  function lastVisibleDecl() {
    var ex = EXERCISES[state.ex];
    if (exerciseComplete()) return ex.decls.length - 1;
    return QUESTIONS[state.current].line;
  }

  // Barra de progreso con un segmento por ejercicio; cada uno se llena
  // según las preguntas respondidas de ese ejercicio. Los segmentos se crean
  // una sola vez y después solo cambia su ancho, así la transición del CSS
  // anima el avance (si se recrearan, aparecerían ya llenos, sin animación).
  var segments = EXERCISES.map(function () {
    var seg = document.createElement("span");
    seg.className = "css-builder__seg";
    var fill = document.createElement("span");
    fill.style.width = "0%";
    seg.appendChild(fill);
    els.progress.appendChild(seg);
    return { seg: seg, fill: fill };
  });

  function renderProgress() {
    var answered = state.done ? QUESTIONS.length : state.current + (state.waiting ? 1 : 0);
    segments.forEach(function (s, ei) {
      var total = 0;
      var done = 0;
      QUESTIONS.forEach(function (q, i) {
        if (q.ex !== ei) return;
        total++;
        if (i < answered) done++;
      });
      s.fill.style.width = (done / total) * 100 + "%";
      s.seg.classList.toggle("is-done", done === total);
      s.seg.classList.toggle("is-current", done !== total && ei === state.ex);
    });
  }

  function blankHtml(qi) {
    if (isDone(qi)) {
      var cls = state.correct[qi] ? "is-right" : "is-fixed";
      return '<span class="builder__filled ' + cls + '">' + esc(state.answers[qi]) + "</span>";
    }
    if (qi === state.current && !state.between && !state.done) {
      return (
        '<input class="builder__blank" data-input type="text" autocomplete="off" ' +
        'autocapitalize="off" spellcheck="false" aria-label="Respuesta" />'
      );
    }
    return '<span class="builder__pending">___</span>';
  }

  // Declaración con colores: propiedad, dos puntos, valor.
  function declHtml(ei, li) {
    var decl = EXERCISES[ei].decls[li];
    var mark = "\u0000";
    var raw = esc(decl.code.replace(/\{(\d)\}/g, mark + "$1" + mark));
    var m = raw.match(/^([^:]*):(.*);$/);
    var colored = m
      ? '<span class="css-builder__prop">' + m[1] + "</span>:" +
        '<span class="css-builder__val">' + m[2] + "</span>;"
      : raw;
    return colored.replace(new RegExp(mark + "(\\d)" + mark, "g"), function (_, n) {
      return blankHtml(qIndex(ei, li, +n));
    });
  }

  function renderCode() {
    var ex = EXERCISES[state.ex];
    var last = lastVisibleDecl();
    var html = [
      '<div class="builder__line" style="--lv:0"><span class="css-builder__sel">' +
        esc(ex.selector) + "</span> {</div>",
    ];
    for (var li = 0; li <= last; li++) {
      var isCurrent = li === last && !exerciseComplete();
      html.push(
        '<div class="builder__line' + (isCurrent ? " is-current" : "") + '" style="--lv:1">' +
          declHtml(state.ex, li) + "</div>"
      );
    }
    if (exerciseComplete()) html.push('<div class="builder__line" style="--lv:0">}</div>');
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

  // CSS del alumno hasta donde va: solo las declaraciones ya completas.
  function studentCss() {
    var ex = EXERCISES[state.ex];
    var decls = [];
    ex.decls.forEach(function (d, li) {
      var values = (d.q || []).map(function (_, bi) {
        var qi = qIndex(state.ex, li, bi);
        return isDone(qi) ? state.answers[qi] : null;
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

  function renderPreview() {
    var ex = EXERCISES[state.ex];
    els.frame.srcdoc =
      '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">' +
      "<style>body { margin: 16px; }" + (ex.base || "") + "</style>" +
      "<style>" + studentCss() + "</style></head><body>" + ex.html + "</body></html>";
  }

  function renderHeader() {
    renderProgress();

    var q = QUESTIONS[state.current];
    if (state.done) {
      els.ask.textContent = "¡Completaste los ejercicios!";
    } else if (exerciseComplete()) {
      els.ask.textContent = "¡Terminaste el ejercicio " + (state.ex + 1) + "!";
    } else {
      els.ask.textContent = q ? q.data.ask : "";
    }

    // Al terminar todo, el botón de Revisar se vuelve "Intentar de nuevo".
    els.check.textContent = state.done ? "Intentar de nuevo" : "Revisar";
    els.check.hidden = state.waiting || state.between;
    els.next.hidden = !state.waiting;
    els.nextEx.hidden = !state.between;

    if (!state.waiting && !exerciseComplete()) {
      els.feedback.className = "builder__feedback";
      els.feedback.innerHTML = "";
    }
  }

  function render() {
    renderHeader();
    renderCode();
    renderPreview();
  }

  // Aciertos del ejercicio ei.
  function exerciseScore(ei) {
    var total = 0;
    var hits = 0;
    QUESTIONS.forEach(function (q, i) {
      if (q.ex !== ei) return;
      total++;
      if (state.correct[i]) hits++;
    });
    return { hits: hits, total: total };
  }

  // Pasa a la siguiente pregunta; si el ejercicio se acabó, se queda en él.
  function advance() {
    state.waiting = false;
    state.current++;
    if (state.current >= QUESTIONS.length) state.done = true;
    else if (QUESTIONS[state.current].ex !== state.ex) state.between = true;
  }

  function summaryHtml() {
    var s = exerciseScore(state.ex);
    return (
      ' <span class="css-builder__summary">Ejercicio ' + (state.ex + 1) + ": " +
      s.hits + " de " + s.total + " aciertos.</span>"
    );
  }

  // Recuadro vacío: sacudida de lado a lado (como al fallar una contraseña en macOS).
  function shake(input) {
    if (!input) return;
    input.classList.remove("is-shaking");
    void input.offsetWidth; // reinicia la animación si se presiona varias veces
    input.classList.add("is-shaking");
    // Se quita al terminar la animación o al escribir (sin animación, por
    // "reducir movimiento", animationend no llega).
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
    if (state.waiting || exerciseComplete()) return;
    var input = els.code.querySelector("[data-input]");
    var q = QUESTIONS[state.current];
    var given = input ? input.value : "";
    if (!norm(given)) {
      shake(input);
      return;
    }
    var accepted = [q.data.a].concat(q.data.alt || []);
    var ok = accepted.some(function (a) {
      return norm(given, q.data.exact) === norm(a, q.data.exact);
    });
    state.correct[state.current] = ok;
    state.answers[state.current] = q.data.a;

    var wrongFb =
      "<strong>No es correcto.</strong> Escribiste <code>" + esc(given.trim()) +
      "</code>; la respuesta es <code>" + esc(q.data.a) + "</code>. " + esc(q.data.why);

    if (ok) {
      var fb = "<strong>¡Correcto!</strong> " + esc(q.data.why);
      advance();
      render();
      els.feedback.className = "builder__feedback is-right";
      els.feedback.innerHTML = fb + (exerciseComplete() ? summaryHtml() : "");
      if (state.done) finish();
      else if (exerciseComplete()) els.nextEx.focus();
    } else if (state.current === QUESTIONS.length - 1) {
      // Última pregunta: no hace falta "Continuar", se va directo al resultado.
      advance();
      render();
      els.feedback.className = "builder__feedback is-wrong";
      els.feedback.innerHTML = wrongFb + summaryHtml();
      finish();
    } else {
      state.waiting = true;
      render();
      els.feedback.className = "builder__feedback is-wrong";
      els.feedback.innerHTML = wrongFb;
      els.next.focus();
    }
  }

  function next() {
    advance();
    render();
    if (exerciseComplete()) {
      els.feedback.className = "builder__feedback is-hint";
      els.feedback.innerHTML = summaryHtml();
      els.nextEx.focus();
    }
  }

  function nextExercise() {
    state.between = false;
    state.ex++;
    render();
  }

  // Al terminar: ventana con los aciertos y si conviene volver a intentarlo.
  function finish() {
    var total = QUESTIONS.length;
    var hits = state.correct.filter(Boolean).length;
    var passed = hits * 100 >= total * 80;
    els.check.focus({ preventScroll: true });

    var modal = document.getElementById("modal-fs");
    if (!modal || !window.jQuery) return;
    modal.querySelector("#modal-score").textContent = hits + " / " + total + " aciertos";
    modal.querySelector("#modal-message").textContent = passed
      ? "¡Excelente! Completaste los ejercicios casi sin errores."
      : "Te recomendamos repasar los temas que fallaste y volver a intentarlo.";
    modal.querySelector("#correct-img").style.display = passed ? "block" : "none";
    modal.querySelector("#incorrect-img").style.display = passed ? "none" : "block";
    window.jQuery(modal).modal("show");
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
  els.nextEx.addEventListener("click", nextExercise);
  reset();
})();
