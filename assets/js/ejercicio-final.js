/* Ejercicio final de cada módulo (2-16, 3-24 y 4-17): el código se arma
   pregunta por pregunta. Cada recuadro del código es una pregunta, se responde
   una a la vez y, si la respuesta no es correcta, se muestra la correcta para
   seguir. Bien o mal, la siguiente pregunta sale hasta presionar "Continuar";
   al acabar un grupo (ejercicio o problema) el siguiente sale con su propio
   botón, y al acabar todo sale la ventana de aciertos (#modal-fs).

   El script de cada ejercicio solo trae su contenido y cómo se ven su código y
   su vista previa:

     EjercicioFinal.crear(document.getElementById("builder"), {
       clase: "builder",
       grupos: [{ lines: [{ lv: 0, code: "<{0}>", q: [{ a: "html", ask: "…", why: "…" }] }] }],
       normalizar: function (v, exact) { … },
       vista: function (ej, animar, listo) { … },
     });

   Marcado dentro de la raíz:
     [data-ask]         la pregunta
     [data-feedback]    la corrección (va en verde o en rojo)
     [data-code]        el código
     [data-bar]         barra de avance continua, o bien
     [data-progress]    barra con un tramo por grupo
     [data-check]       Revisar (al terminar, "Intentar de nuevo")
     [data-next]        Continuar
     [data-next-group]  Siguiente ejercicio / problema (si hay varios grupos)

   En el código de cada línea, {0}, {1}… son sus recuadros y {=0} repite lo que
   se escribe en el recuadro 0 (como la etiqueta de cierre en HTML). lv es la
   sangría de la línea.

   Cada pregunta (q):
     a      respuesta correcta
     alt    otras respuestas que también se aceptan (opcional)
     exact  se compara tal cual, sin pasar a minúsculas (opcional)
     ask    la pregunta
     why    explicación; lo que va entre `comillas invertidas` va como código

   Opciones:
     clase            prefijo de las clases del ejercicio (builder__line, reto__line…)
     grupos           [{ lines: […] }, …]; cada grupo puede traer más datos para su vista
     normalizar(v, exact)  cómo se comparan las respuestas
     vista(ej, animar, listo)  pinta la vista previa o la consola del grupo actual;
                      llama listo() cuando ya se ve el resultado (la ventana de
                      aciertos espera a que lo haga)
     colorear(html)   colores del código de una línea, ya escapada (opcional)
     antes(grupo)     línea que va antes del código del grupo (opcional)
     despues(grupo)   línea que va después, cuando el grupo está completo (opcional)
     sangria          lv de las líneas que no traen el suyo (0 si no se dice)
     minimo           ancho mínimo del recuadro, en caracteres (4 si no se dice)
     tramo            clase de cada tramo de [data-progress] (clase + "__seg")
     desvanecer       la pregunta y la corrección cambian con desvanecido
     avisoMayusculas  texto extra cuando la respuesta solo difiere en mayúsculas
     esperaVentana    ms entre que se ve el resultado y la ventana de aciertos
     mensajeBien      mensaje de la ventana cuando se aprueba (80 % o más) */
(function () {
  "use strict";

  var reduce = Curso.reduce;

  var esc = Curso.esc;

  // Texto con `código` en <code> (va en el azul del curso).
  function rich(s) {
    return esc(s).replace(/`([^`]+)`/g, "<code>$1</code>");
  }

  function crear(root, op) {
    if (!root) return;
    var c = op.clase;
    var grupos = op.grupos;
    var norm = op.normalizar;

    // Lista plana de preguntas, en orden.
    var QUESTIONS = [];
    grupos.forEach(function (g, gi) {
      g.lines.forEach(function (line, li) {
        (line.q || []).forEach(function (q, bi) {
          QUESTIONS.push({ grupo: gi, line: li, blank: bi, data: q });
        });
      });
    });

    var els = {
      ask: root.querySelector("[data-ask]"),
      feedback: root.querySelector("[data-feedback]"),
      code: root.querySelector("[data-code]"),
      bar: root.querySelector("[data-bar]"),
      progress: root.querySelector("[data-progress]"),
      check: root.querySelector("[data-check]"),
      next: root.querySelector("[data-next]"),
      nextGroup: root.querySelector("[data-next-group]"),
    };

    var state;
    var alListo = null; // qué hacer cuando la vista termine de mostrar el resultado

    function reset() {
      alListo = null;
      state = {
        current: 0, // pregunta actual (índice en QUESTIONS)
        grupo: 0, // grupo que se muestra
        answers: [], // valor correcto de cada pregunta ya respondida
        correct: [], // true/false por pregunta
        waiting: false, // mostrando corrección, esperando "Continuar"
        between: false, // grupo terminado, esperando el botón del siguiente
        done: false, // todas las preguntas respondidas
      };
      render(false);
      texto(els.feedback, "", c + "__feedback");
    }

    function qIndex(gi, li, bi) {
      for (var i = 0; i < QUESTIONS.length; i++) {
        var q = QUESTIONS[i];
        if (q.grupo === gi && q.line === li && q.blank === bi) return i;
      }
      return -1;
    }

    function isDone(qi) {
      return qi < state.current || (qi === state.current && state.waiting);
    }

    // ¿El grupo que se muestra ya tiene todas sus preguntas respondidas?
    function complete() {
      return state.between || state.done;
    }

    // Cambia un texto, con desvanecido si el ejercicio lo pide.
    function texto(el, html, cls) {
      if (el.innerHTML === html && el.className === cls) return;
      if (!op.desvanecer || reduce || !el.innerHTML) {
        clearTimeout(el._fade);
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

    /* ---------------- Barra de avance ----------------
       Continua: avanza al pasar a la siguiente pregunta. Por tramos: un tramo
       por grupo que se llena con cada respuesta. Los tramos se crean una sola
       vez y después solo cambia su ancho, así la transición del CSS anima el
       avance (si se recrearan, aparecerían ya llenos, sin animación). */
    var segments = !els.progress
      ? []
      : grupos.map(function () {
          var seg = document.createElement("span");
          seg.className = op.tramo || c + "__seg";
          var fill = document.createElement("span");
          fill.style.width = "0%";
          seg.appendChild(fill);
          els.progress.appendChild(seg);
          return { seg: seg, fill: fill };
        });

    function renderProgress() {
      if (els.bar) els.bar.style.width = (state.current / QUESTIONS.length) * 100 + "%";
      var answered = state.done ? QUESTIONS.length : state.current + (state.waiting ? 1 : 0);
      segments.forEach(function (s, gi) {
        var total = 0;
        var done = 0;
        QUESTIONS.forEach(function (q, i) {
          if (q.grupo !== gi) return;
          total++;
          if (i < answered) done++;
        });
        s.fill.style.width = (done / total) * 100 + "%";
        s.seg.classList.toggle("is-done", done === total);
        s.seg.classList.toggle("is-current", done !== total && gi === state.grupo);
      });
    }

    /* ---------------- Código ---------------- */
    function blankHtml(qi) {
      if (isDone(qi)) {
        var cls = state.correct[qi] ? "is-right" : "is-fixed";
        return '<span class="' + c + "__filled " + cls + '">' + esc(state.answers[qi]) + "</span>";
      }
      if (qi === state.current && !complete()) {
        return (
          '<input class="' + c + '__blank" data-input type="text" autocomplete="off" ' +
          'autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Respuesta" />'
        );
      }
      return '<span class="' + c + '__pending">___</span>';
    }

    function lineHtml(gi, li) {
      var tokens = [];
      var mark = "\u0000";
      var raw = grupos[gi].lines[li].code.replace(/\{(=?)(\d)\}/g, function (_, eq, n) {
        tokens.push({ mirror: !!eq, bi: +n });
        return mark + (tokens.length - 1) + mark;
      });
      var html = esc(raw);
      if (op.colorear) html = op.colorear(html);
      return html.replace(new RegExp(mark + "(\\d+)" + mark, "g"), function (_, t) {
        var tok = tokens[+t];
        var qi = qIndex(gi, li, tok.bi);
        if (!tok.mirror) return blankHtml(qi);
        var val = isDone(qi) ? state.answers[qi] : "";
        return (
          '<span class="' + c + "__mirror" + (val ? "" : " is-empty") + '" data-mirror="' + qi + '">' +
          esc(val || "") + "</span>"
        );
      });
    }

    // Líneas visibles: hasta la de la pregunta actual; todas al completar el grupo.
    function lastVisibleLine() {
      var g = grupos[state.grupo];
      if (complete()) return g.lines.length - 1;
      return QUESTIONS[state.current].line;
    }

    function renderCode() {
      var g = grupos[state.grupo];
      var last = lastVisibleLine();
      var html = [];
      if (op.antes) html.push(op.antes(g));
      for (var li = 0; li <= last; li++) {
        var isCurrent = li === last && !complete();
        var lv = g.lines[li].lv != null ? g.lines[li].lv : op.sangria || 0;
        html.push(
          '<div class="' + c + "__line" + (isCurrent ? " is-current" : "") + '" style="--lv:' + lv + '">' +
            lineHtml(state.grupo, li) + "</div>"
        );
      }
      if (op.despues && complete()) html.push(op.despues(g));
      els.code.innerHTML = html.join("");

      var input = els.code.querySelector("[data-input]");
      if (input) {
        input.addEventListener("input", function () {
          sizeInput(input);
          // Lo que se escribe se repite en los {=n} del mismo recuadro.
          els.code.querySelectorAll('[data-mirror="' + state.current + '"]').forEach(function (m) {
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
      // Si el código no cabe, la línea actual queda a media altura.
      var cur = els.code.querySelector(".is-current") || els.code.lastElementChild;
      if (cur && els.code.scrollHeight > els.code.clientHeight) {
        els.code.scrollTop = cur.offsetTop - els.code.clientHeight / 2;
      }
    }

    function sizeInput(input) {
      input.style.width = Math.max(op.minimo || 4, input.value.length + 1) + "ch";
    }

    /* ---------------- Encabezado y botones ---------------- */
    function renderHeader() {
      renderProgress();
      // Al terminar un grupo se queda la última pregunta con su corrección.
      var q = QUESTIONS[complete() ? state.current - 1 : state.current];
      texto(els.ask, esc(q ? q.data.ask : ""), c + "__ask");

      // Al terminar todo, el botón de Revisar se vuelve "Intentar de nuevo".
      els.check.textContent = state.done ? "Intentar de nuevo" : "Revisar";
      els.check.hidden = state.waiting || state.between;
      els.next.hidden = !state.waiting;
      if (els.nextGroup) els.nextGroup.hidden = !state.between;
    }

    // Lo que la vista de cada ejercicio puede consultar.
    var ej = {
      grupo: function () {
        return state.grupo;
      },
      completo: complete,
      respondida: isDone,
      indice: qIndex,
      respuesta: function (qi) {
        return state.answers[qi];
      },
      ultimaLinea: lastVisibleLine,
    };

    function listo() {
      var f = alListo;
      alListo = null;
      if (f) f();
    }

    function render(animar) {
      renderHeader();
      renderCode();
      op.vista(ej, animar, listo);
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

    // Pasa a la siguiente pregunta; si el grupo se acabó, se queda en él.
    function advance() {
      state.waiting = false;
      state.current++;
      if (state.current >= QUESTIONS.length) state.done = true;
      else if (QUESTIONS[state.current].grupo !== state.grupo) state.between = true;
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
      var exact = q.data.exact;
      var accepted = [q.data.a].concat(q.data.alt || []);
      var ok = accepted.some(function (a) {
        return norm(given, exact) === norm(a, exact);
      });
      // Mismo texto con otras mayúsculas: se explica por qué no cuenta.
      var caseOnly =
        !ok &&
        !!op.avisoMayusculas &&
        accepted.some(function (a) {
          return norm(given, exact).toLowerCase() === norm(a, exact).toLowerCase();
        });
      state.correct[state.current] = ok;
      state.answers[state.current] = q.data.a;

      var fb = ok
        ? "<strong>¡Correcto!</strong> " + rich(q.data.why)
        : "<strong>No es correcto.</strong> Escribiste <code>" + esc(given.trim()) +
          "</code>; la respuesta es <code>" + esc(q.data.a) + "</code>. " +
          (caseOnly ? op.avisoMayusculas + " " : "") + rich(q.data.why);
      var fbClass = c + "__feedback " + (ok ? "is-right" : "is-wrong");

      var lastOfGroup =
        state.current === QUESTIONS.length - 1 || QUESTIONS[state.current + 1].grupo !== state.grupo;

      if (lastOfGroup) {
        // Última pregunta del grupo: no hace falta "Continuar". Se queda la
        // corrección y la vista muestra el resultado de una vez.
        advance();
        if (state.done) alListo = finish;
        render(true);
        texto(els.feedback, fb, fbClass);
        if (state.done) els.check.focus({ preventScroll: true });
        else els.nextGroup.focus({ preventScroll: true });
      } else {
        state.waiting = true;
        render(false);
        texto(els.feedback, fb, fbClass);
        els.next.focus({ preventScroll: true });
      }
    }

    function next() {
      advance();
      render(false);
      texto(els.feedback, "", c + "__feedback");
    }

    function nextGroup() {
      state.between = false;
      state.grupo++;
      render(false);
      texto(els.feedback, "", c + "__feedback");
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
        ? op.mensajeBien
        : "Te recomendamos repasar los temas que fallaste y volver a intentarlo.";
      modal.querySelector("#correct-img").style.display = passed ? "block" : "none";
      modal.querySelector("#incorrect-img").style.display = passed ? "none" : "block";
      if (op.esperaVentana) {
        setTimeout(function () {
          window.jQuery(modal).modal("show");
        }, op.esperaVentana);
      } else {
        window.jQuery(modal).modal("show");
      }
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
    if (els.nextGroup) els.nextGroup.addEventListener("click", nextGroup);
    root.classList.add(c + "--ready");
    reset();
  }

  window.EjercicioFinal = { crear: crear };
})();
