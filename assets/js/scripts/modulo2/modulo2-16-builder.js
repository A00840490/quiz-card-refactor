/* Ejercicio 2 (modulo2-16): armar la página paso a paso.
   Cada línea del código puede tener recuadros ({0}, {1}...). Cada recuadro es
   una pregunta. {=0} repite lo que se escribió en el recuadro 0 (para la
   etiqueta de cierre). Las líneas sin recuadros aparecen solas cuando llega
   su turno. */
(function () {
  "use strict";

  var LINES = [
    { lv: 0, code: "<!DOCTYPE html>" },
    {
      lv: 0,
      code: '<{0} lang="en">',
      q: [
        {
          a: "html",
          ask: "Todo documento empieza con la etiqueta que envuelve la página completa. ¿Cuál es?",
          why: "La etiqueta html envuelve todo el documento; dentro de ella van head y body.",
        },
      ],
    },
    {
      lv: 1,
      code: "<{0}>",
      q: [
        {
          a: "head",
          ask: "¿Qué etiqueta guarda la información de la página que no se muestra, como el título?",
          why: "En head va la información sobre la página: codificación, título, estilos, etc.",
        },
      ],
    },
    {
      lv: 2,
      code: '<{0} charset="UTF-8">',
      q: [
        {
          a: "meta",
          ask: "¿Qué etiqueta indica la codificación de caracteres de la página?",
          why: "La etiqueta meta con charset=\"UTF-8\" permite mostrar acentos y la ñ correctamente.",
        },
      ],
    },
    { lv: 2, code: '<meta name="viewport" content="width=device-width, initial-scale=1.0">' },
    { lv: 2, code: "<title>Ejercicio 2</title>" },
    { lv: 1, code: "</head>" },
    {
      lv: 1,
      code: "<{0}>",
      q: [
        {
          a: "body",
          ask: "¿Qué etiqueta contiene todo lo que se ve en la página?",
          why: "Todo el contenido visible (textos, imágenes, formularios) va dentro de body.",
        },
      ],
    },
    {
      lv: 2,
      code: "<{0}>Ejercicio 2</{=0}>",
      q: [
        {
          a: "h1",
          ask: "¿Qué etiqueta usamos para el título principal de la página?",
          why: "h1 es el encabezado de mayor nivel; se usa para el título principal.",
        },
      ],
    },
    {
      lv: 2,
      code:
        "<{0}>Este ejercicio probará tus conocimientos de <{1}>HTML</{=1}>. Al final de él el codigo que completes deberá verse de esta forma. Utilizaremos todos los elementos vistos hasta ahora como lo son:</{=0}>",
      preview: true,
      q: [
        {
          a: "p",
          ask: "¿Qué etiqueta crea un párrafo de texto?",
          why: "La etiqueta p crea un párrafo.",
        },
        {
          a: "b",
          fb: "span",
          ask: "¿Qué etiqueta pone la palabra HTML en negritas?",
          why: "La etiqueta b muestra el texto en negritas.",
        },
      ],
    },
    {
      lv: 2,
      code: '<{0} type="{1}">',
      q: [
        {
          a: "ol",
          ask: "¿Qué etiqueta crea una lista ordenada (con números o letras)?",
          why: "ol (ordered list) crea una lista ordenada.",
        },
        {
          a: "A",
          fb: "1",
          exact: true,
          ask: "¿Qué valor de type hace que la lista use letras mayúsculas?",
          why: "Con type=\"A\" la lista se numera A, B, C… (con \"a\" serían minúsculas).",
        },
      ],
    },
    {
      lv: 3,
      code: "<{0}><p>Encabezados</p></{=0}>",
      q: [
        {
          a: "li",
          ask: "¿Qué etiqueta crea cada elemento de una lista?",
          why: "li (list item) es cada elemento de una lista ol o ul.",
        },
      ],
    },
    { lv: 3, code: "<li><p>Párrafos</p></li>" },
    { lv: 3, code: "<li><p>Listas</p></li>" },
    { lv: 3, code: "<li>" },
    { lv: 4, code: "<p>Formularios</p>" },
    {
      lv: 4,
      code: "<{0}>",
      q: [
        {
          a: "ul",
          ask: "Dentro de «Formularios» va una lista sin orden (con viñetas). ¿Qué etiqueta la crea?",
          why: "ul (unordered list) crea una lista con viñetas.",
        },
      ],
    },
    { lv: 5, code: "<li><p>Inputs</p></li>" },
    { lv: 5, code: "<li><p>Labels</p></li>" },
    { lv: 4, code: "</ul>" },
    { lv: 3, code: "</li>" },
    { lv: 3, code: "<li><p>Imágenes</p></li>" },
    { lv: 3, code: "<li><p>Enlaces</p></li>" },
    { lv: 2, code: "</ol>" },
    {
      lv: 2,
      code: "<{0}>",
      q: [
        {
          a: "br",
          ask: "¿Qué etiqueta agrega un salto de línea?",
          why: "br hace un salto de línea y no necesita etiqueta de cierre.",
        },
      ],
    },
    {
      lv: 2,
      code: "<{0}>Pronto este podrías ser tú</{=0}>",
      q: [
        {
          a: "h2",
          ask: "¿Qué etiqueta crea un encabezado de segundo nivel?",
          why: "h2 es el encabezado que sigue en importancia después de h1.",
        },
      ],
    },
    {
      lv: 2,
      code: '<img {0}="imagenes/persona.jpg" alt="persona" height="300" {1}="500">',
      q: [
        {
          a: "src",
          ask: "¿Qué atributo indica la ruta de la imagen?",
          why: "src (source) indica dónde está el archivo de la imagen.",
        },
        {
          a: "width",
          fb: "data-ancho",
          ask: "¿Qué atributo define el ancho de la imagen?",
          why: "width define el ancho; height, el alto.",
        },
      ],
    },
    {
      lv: 2,
      code:
        '<p>Si no recuerdas algunos elementos puedes regresar al inicio del módulo <{0} href="modulo2-1.html" target="{1}">aquí</{=0}>. Este enlace te abre una nueva ventana para que no tengas que regresar al ejercicio.</p>',
      q: [
        {
          a: "a",
          ask: "¿Qué etiqueta crea un enlace?",
          why: "La etiqueta a (anchor) crea un enlace con el atributo href.",
        },
        {
          a: "_blank",
          fb: "_self",
          ask: "¿Qué valor de target abre el enlace en una nueva ventana?",
          why: "target=\"_blank\" abre el enlace en una nueva pestaña o ventana.",
        },
      ],
    },
    { lv: 2, code: "<p>Ahora solo pediremos un nombre:</p>" },
    {
      lv: 2,
      code: '<{0} action="/">',
      q: [
        {
          a: "form",
          ask: "¿Qué etiqueta agrupa los campos de un formulario?",
          why: "form agrupa los campos y define a dónde se envían con action.",
        },
      ],
    },
    {
      lv: 3,
      code: '<{0} for="nombre">Nombre:</{=0}>',
      q: [
        {
          a: "label",
          ask: "¿Qué etiqueta pone el texto que describe un campo del formulario?",
          why: "label describe un campo; su atributo for apunta al id del input.",
        },
      ],
    },
    {
      lv: 3,
      code: '<input type="{0}" id="nombre" name="nombre" placeholder="tu nombre">',
      q: [
        {
          a: "text",
          ask: "¿Qué tipo de input muestra una caja para escribir texto?",
          why: "type=\"text\" muestra una caja de texto de una línea.",
        },
      ],
    },
    { lv: 3, code: "<br>" },
    {
      lv: 3,
      code: '<input type="{0}" value="Listo!">',
      q: [
        {
          a: "submit",
          ask: "¿Qué tipo de input crea el botón que envía el formulario?",
          why: "type=\"submit\" crea el botón que envía el formulario.",
        },
      ],
    },
    { lv: 2, code: "</form>" },
    { lv: 1, code: "</body>" },
    { lv: 0, code: "</html>" },
  ];

  // Lista plana de preguntas, en orden.
  var QUESTIONS = [];
  LINES.forEach(function (line, li) {
    (line.q || []).forEach(function (q, bi) {
      QUESTIONS.push({ line: li, blank: bi, data: q });
    });
  });
  var PREVIEW_FROM = LINES.findIndex(function (l) {
    return l.preview;
  });

  var root = document.getElementById("builder");
  if (!root) return;
  var els = {
    actions: root.querySelector("[data-actions]"),
    bar: root.querySelector("[data-bar]"),
    ask: root.querySelector("[data-ask]"),
    feedback: root.querySelector("[data-feedback]"),
    check: root.querySelector("[data-check]"),
    next: root.querySelector("[data-next]"),
    code: root.querySelector("[data-code]"),
    frame: root.querySelector("[data-frame]"),
    empty: root.querySelector("[data-empty]"),
    question: root.querySelector("[data-question]"),
    result: root.querySelector("[data-result]"),
    resultScore: root.querySelector("[data-result-score]"),
    resultMsg: root.querySelector("[data-result-msg]"),
    resultList: root.querySelector("[data-result-list]"),
    restart: root.querySelector("[data-restart]"),
  };

  var state;

  function reset() {
    state = {
      current: 0,
      answers: [], // valor final (correcto) de cada pregunta
      correct: [], // true/false por pregunta
      waiting: false, // mostrando corrección, esperando "Continuar"
    };
    els.result.hidden = true;
    els.question.hidden = false;
    els.actions.hidden = false;
    render();
  }

  function norm(v, exact) {
    v = String(v || "").replace(/[<>\/"'=\s]/g, "");
    return exact ? v : v.toLowerCase();
  }

  function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // Resalta una línea de código ya escapada.
  function highlight(escaped) {
    return escaped
      .replace(
        /&lt;(\/?)(!DOCTYPE html|[a-zA-Z][a-zA-Z0-9]*)/g,
        '&lt;$1<span class="codetag">$2</span>'
      )
      .replace(/&gt;([^&]+?)(?=&lt;)/g, '&gt;<span class="codetext">$1</span>');
  }

  function qIndex(li, bi) {
    for (var i = 0; i < QUESTIONS.length; i++) {
      if (QUESTIONS[i].line === li && QUESTIONS[i].blank === bi) return i;
    }
    return -1;
  }

  // Estado del recuadro bi de la línea li: "done", "current" o "future".
  function blankState(li, bi) {
    var qi = qIndex(li, bi);
    if (qi < state.current || (qi === state.current && state.waiting)) return "done";
    if (qi === state.current) return "current";
    return "future";
  }

  // Línea visible: todas hasta la línea de la pregunta actual.
  function lastVisibleLine() {
    if (state.current >= QUESTIONS.length) return LINES.length - 1;
    return QUESTIONS[state.current].line;
  }

  function renderCode() {
    var html = [];
    var last = lastVisibleLine();
    for (var li = 0; li <= last; li++) {
      var line = LINES[li];
      var tokens = [];
      var mark = "\u0000";
      var raw = line.code.replace(/\{(=?)(\d)\}/g, function (_, eq, n) {
        tokens.push({ mirror: !!eq, bi: +n });
        return mark + (tokens.length - 1) + mark;
      });
      var out = highlight(esc(raw)).replace(
        new RegExp(mark + "(\\d+)" + mark, "g"),
        function (_, t) {
          var tok = tokens[+t];
          var st = blankState(li, tok.bi);
          var qi = qIndex(li, tok.bi);
          if (tok.mirror) {
            var val = st === "done" ? state.answers[qi] : "";
            return (
              '<span class="builder__mirror' +
              (val ? "" : " is-empty") +
              '" data-mirror="' + qi + '">' + esc(val || "") + "</span>"
            );
          }
          if (st === "done") {
            var cls = state.correct[qi] ? "is-right" : "is-fixed";
            return '<span class="builder__filled ' + cls + '">' + esc(state.answers[qi]) + "</span>";
          }
          if (st === "current") {
            return (
              '<input class="builder__blank" data-input type="text" autocomplete="off" ' +
              'autocapitalize="off" spellcheck="false" aria-label="Respuesta" />'
            );
          }
          return '<span class="builder__pending">___</span>';
        }
      );
      var isCurrent = li === last && state.current < QUESTIONS.length;
      html.push(
        '<div class="builder__line' + (isCurrent ? " is-current" : "") + '" style="--lv:' + line.lv + '">' +
          out + "</div>"
      );
    }
    els.code.innerHTML = html.join("");

    var input = els.code.querySelector("[data-input]");
    if (input) {
      input.addEventListener("input", function () {
        sizeInput(input);
        var qi = state.current;
        els.code.querySelectorAll('[data-mirror="' + qi + '"]').forEach(function (m) {
          m.textContent = input.value;
          m.classList.toggle("is-empty", !input.value);
        });
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
    var cur = els.code.querySelector(".is-current") || els.code.lastElementChild;
    if (cur) els.code.scrollTop = cur.offsetTop - els.code.clientHeight / 2;
  }

  function sizeInput(input) {
    input.style.width = Math.max(3, input.value.length + 1) + "ch";
  }

  // Código real de la página hasta donde va el alumno.
  function pageSource() {
    var parts = [];
    var last = lastVisibleLine();
    for (var li = 0; li <= last; li++) {
      var line = LINES[li];
      var blanks = (line.q || []).map(function (q, bi) {
        return blankState(li, bi) === "done" ? state.answers[qIndex(li, bi)] : null;
      });
      if (blanks.length && blanks[0] === null) break; // línea aún sin empezar
      parts.push(
        line.code.replace(/\{=?(\d)\}/g, function (_, n) {
          var v = blanks[+n];
          return v === null ? line.q[+n].fb || "span" : v;
        })
      );
    }
    return parts
      .join("\n")
      .replace('action="/"', 'action="/" onsubmit="return false;"');
  }

  function previewReady() {
    if (PREVIEW_FROM < 0) return true;
    return blankState(PREVIEW_FROM, 0) === "done";
  }

  function renderPreview() {
    var ready = previewReady();
    els.empty.hidden = ready;
    els.frame.hidden = !ready;
    if (ready) els.frame.srcdoc = pageSource();
  }

  function renderHeader() {
    var total = QUESTIONS.length;
    els.bar.style.width = (state.current / total) * 100 + "%";
    var q = QUESTIONS[state.current];
    els.ask.textContent = q ? q.data.ask : "";
    els.check.hidden = state.waiting;
    els.next.hidden = !state.waiting;
    if (!state.waiting) {
      els.feedback.className = "builder__feedback";
      els.feedback.innerHTML = "";
    }
  }

  function render() {
    if (state.current >= QUESTIONS.length) return finish();
    renderHeader();
    renderCode();
    renderPreview();
  }

  function check() {
    if (state.waiting) return;
    var input = els.code.querySelector("[data-input]");
    var q = QUESTIONS[state.current];
    var given = input ? input.value : "";
    if (!norm(given)) {
      els.feedback.className = "builder__feedback is-hint";
      els.feedback.textContent = "Escribe tu respuesta en el recuadro del código.";
      if (input) input.focus();
      return;
    }
    var ok = norm(given, q.data.exact) === norm(q.data.a, q.data.exact);
    state.correct[state.current] = ok;
    state.answers[state.current] = q.data.a;

    if (ok) {
      els.feedback.className = "builder__feedback is-right";
      els.feedback.innerHTML = "<strong>¡Correcto!</strong> " + esc(q.data.why);
      state.current++;
      // Muestra el avance y deja leer el mensaje antes de la siguiente pregunta.
      var fb = els.feedback.innerHTML;
      render();
      if (state.current < QUESTIONS.length) {
        els.feedback.className = "builder__feedback is-right";
        els.feedback.innerHTML = fb;
      }
    } else {
      state.waiting = true;
      els.feedback.className = "builder__feedback is-wrong";
      els.feedback.innerHTML =
        "<strong>No es correcto.</strong> Escribiste <code>" + esc(given.trim()) +
        "</code>; la respuesta es <code>" + esc(q.data.a) + "</code>. " + esc(q.data.why);
      renderHeader();
      renderCode();
      renderPreview();
      els.next.focus();
    }
  }

  function next() {
    state.waiting = false;
    state.current++;
    render();
  }

  function finish() {
    var total = QUESTIONS.length;
    var hits = state.correct.filter(Boolean).length;
    els.bar.style.width = "100%";
    els.question.hidden = true;
    els.actions.hidden = true;
    renderCode();
    renderPreview();

    els.resultScore.textContent = hits + " de " + total;
    var score = Math.round((hits * 100) / total);
    els.resultMsg.textContent =
      score >= 80
        ? "¡Excelente! Armaste la página casi sin errores."
        : "Repasa los temas de las respuestas que fallaste y vuelve a intentarlo.";
    var missed = QUESTIONS.filter(function (_, i) {
      return !state.correct[i];
    });
    els.resultList.innerHTML = missed.length
      ? "<p>Respuestas que fallaste:</p><ul>" +
        missed
          .map(function (q) {
            return "<li><code>" + esc(q.data.a) + "</code> — " + esc(q.data.why) + "</li>";
          })
          .join("") +
        "</ul>"
      : "";
    els.result.hidden = false;

    // Ventana de resultado que ya tenía la página.
    var modal = document.getElementById("modal-fs");
    if (modal && window.jQuery) {
      modal.querySelector("#modal-score").textContent = hits + " / " + total + " aciertos";
      modal.querySelector("#modal-message").textContent =
        score >= 80 ? "¡Excelente!" : "Vuelve a intentarlo...";
      modal.querySelector("#correct-img").style.display = score >= 80 ? "block" : "none";
      modal.querySelector("#incorrect-img").style.display = score >= 80 ? "none" : "block";
      window.jQuery(modal).modal("show");
    }
  }

  els.check.addEventListener("click", check);
  els.next.addEventListener("click", next);
  els.restart.addEventListener("click", reset);
  reset();
})();
