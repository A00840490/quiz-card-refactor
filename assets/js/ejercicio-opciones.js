/* =========================================================================
   Ejercicios finales de opción múltiple (Ejercicio 1 y Ejercicio 5).
   Estilos en assets/css/ejercicio-opciones.css. Lo carga curso.js y solo
   actúa si la página trae una <section data-opciones>.

   Mismas reglas que los ejercicios 2, 3 y 4 (ejercicio-final.js): una
   pregunta a la vez; si el alumno se equivoca se marca en rojo y se le
   muestra la correcta; la corrección va toda en verde o toda en rojo; barra
   con un tramo por pregunta y botones fuera de la escena; sin contador ni
   "¡Terminaste!", y al final la ventana de aciertos (#modal-fs).

   Las preguntas viven en el HTML de la página, como lista (así se leen aunque
   no haya JavaScript):

   <section class="opc" data-opciones="corcho">
     <ol class="opc__lista" data-preguntas>
       <li>
         <p>Es el lenguaje que le da estructura a las páginas web.</p>
         <ul>
           <li>Python</li>
           <li data-ok>HTML</li>     <- data-ok en cada respuesta correcta
         </ul>
         <p data-porque><code>HTML</code> organiza el contenido…</p>
       </li>
     </ol>
     <div class="opc__juego"> [data-escena] [data-feedback] [data-progress]
       [data-check] [data-next] </div>
   </section>

   Con más de una respuesta correcta, la pregunta es de varias respuestas.

   Escenas: EjercicioOpciones.escenas.<nombre> = function (raiz) { return {
     montar(escena, api), mostrar(p, i), marcar(sel), revelar(p, sel, ok, i),
     salir(listo) } }. Hoy solo existe "corcho" (pizarra de corcho).
   ========================================================================= */
(function () {
  "use strict";

  var esc = Curso.esc;
  var reduce = Curso.reduce;

  function later(ms, fn) { return setTimeout(fn, reduce ? 0 : ms); }
  function multi(p) { return p.ok.length > 1; }
  function nodo(html) {
    var d = document.createElement("div");
    d.innerHTML = html.trim();
    return d.firstChild;
  }
  // "A", "A y B", "A, B y C"
  function lista(arr) {
    return arr.length === 1 ? arr[0] : arr.slice(0, -1).join(", ") + " y " + arr[arr.length - 1];
  }

  // Lee las preguntas de la lista del HTML.
  function leer(raiz) {
    return Array.prototype.map.call(raiz.querySelectorAll("[data-preguntas] > li"), function (li) {
      var ops = li.querySelectorAll("ul > li");
      var porque = li.querySelector("[data-porque]");
      return {
        q: li.querySelector("p").innerHTML.trim(),
        ops: Array.prototype.map.call(ops, function (o) { return o.innerHTML.trim(); }),
        ok: Array.prototype.reduce.call(ops, function (a, o, i) {
          if (o.hasAttribute("data-ok")) a.push(i);
          return a;
        }, []),
        porque: porque ? porque.innerHTML.trim() : ""
      };
    });
  }

  /* ===================== Escena: pizarra de corcho ===================== */
  // Marcas de plumón (en un cuadro de 120 × 110 que se estira sobre la nota)
  var MARCAS = {
    "is-ok": '<path pathLength="1" stroke="#16a34a" d="M30 62 L46 80 L88 26"/>',
    "is-bad": '<path pathLength="1" stroke="#dc2626" d="M22 22 L98 88"/><path pathLength="1" stroke="#dc2626" d="M98 22 L22 88"/>',
    "is-miss": '<path pathLength="1" stroke="#16a34a" d="M60 6 C100 4 116 30 114 56 C112 86 86 104 56 104 C24 104 6 82 6 56 C6 26 30 8 66 10"/>'
  };

  function Corcho() {
    var ficha, notas, api;
    return {
      montar: function (escena, a) {
        api = a;
        escena.innerHTML =
          '<div class="opc-c">' +
          '<span class="opc-c__riel opc-c__riel--arriba" aria-hidden="true"></span>' +
          '<span class="opc-c__riel opc-c__riel--abajo" aria-hidden="true"></span>' +
          '<span class="opc-c__riel opc-c__riel--izq" aria-hidden="true"></span>' +
          '<span class="opc-c__riel opc-c__riel--der" aria-hidden="true"></span>' +
          '<div class="opc-c__tabla"><div class="opc-c__ficha" data-ficha></div>' +
          '<div class="opc-c__notas" data-notas></div></div></div>';
        ficha = escena.querySelector("[data-ficha]");
        notas = escena.querySelector("[data-notas]");
      },

      mostrar: function (p) {
        var m = multi(p);
        // Solo las preguntas de varias respuestas lo dicen, en itálica
        ficha.innerHTML = '<span class="opc-c__chin" aria-hidden="true"></span><p>' + p.q + "</p>" +
          (m ? '<em class="opc-c__varias">Elige todas las que apliquen.</em>' : "");
        ficha.classList.remove("is-in");
        void ficha.offsetWidth;
        ficha.classList.add("is-in");

        notas.setAttribute("role", m ? "group" : "radiogroup");
        notas.innerHTML = "";
        p.ops.forEach(function (o, i) {
          var b = nodo(
            '<button class="opc-c__nota is-in" type="button" role="' + (m ? "checkbox" : "radio") +
            '" aria-checked="false" style="animation-delay:' + (i * 90) + 'ms">' +
            '<span class="opc-c__chin" aria-hidden="true"></span><span>' + o + "</span></button>"
          );
          b.addEventListener("click", function () { api.elegir(i); });
          notas.appendChild(b);
        });
      },

      marcar: function (sel) {
        Array.prototype.forEach.call(notas.children, function (b, i) {
          var on = sel.indexOf(i) >= 0;
          b.setAttribute("aria-checked", on);
        });
      },

      revelar: function (p, sel) {
        Array.prototype.forEach.call(notas.children, function (b, i) {
          var bien = p.ok.indexOf(i) >= 0;
          var puso = sel.indexOf(i) >= 0;
          var clase = bien && puso ? "is-ok" : puso ? "is-bad" : bien ? "is-miss" : "";
          b.disabled = true;
          b.classList.remove("is-in");
          if (!clase) return;
          var m = nodo('<svg class="opc-c__marca" viewBox="0 0 120 110" preserveAspectRatio="none" aria-hidden="true">' + MARCAS[clase] + "</svg>");
          b.appendChild(m);
          requestAnimationFrame(function () { m.classList.add("is-on"); });
        });
      },

      // Las notas se despegan y caen antes de la siguiente pregunta
      salir: function (listo) {
        Array.prototype.forEach.call(notas.children, function (b, i) {
          b.style.animationDelay = i * 70 + "ms";
          b.classList.add("is-out");
        });
        later(700, listo);
      }
    };
  }

  /* ===================== Motor común ===================== */
  function crear(raiz) {
    var nombre = raiz.getAttribute("data-opciones") || "corcho";
    var hacer = EjercicioOpciones.escenas[nombre];
    if (!hacer) return;

    var PREGUNTAS = leer(raiz);
    var els = {
      escena: raiz.querySelector("[data-escena]"),
      feedback: raiz.querySelector("[data-feedback]"),
      progress: raiz.querySelector("[data-progress]"),
      check: raiz.querySelector("[data-check]"),
      next: raiz.querySelector("[data-next]")
    };
    var mensajeBien = raiz.getAttribute("data-mensaje") || "¡Excelente! Contestaste casi todas las preguntas sin errores.";
    var st;

    var api = {
      elegir: function (i) {
        if (st.revisado) return;
        var p = PREGUNTAS[st.i];
        if (multi(p)) {
          var k = st.sel.indexOf(i);
          if (k >= 0) st.sel.splice(k, 1);
          else st.sel.push(i);
        } else {
          st.sel = st.sel[0] === i ? [] : [i];
        }
        st.vista.marcar(st.sel);
      }
    };

    function mostrar() {
      st.sel = [];
      st.revisado = false;
      els.feedback.className = els.feedback.className.replace(/\s*is-(right|wrong|fading)/g, "");
      els.feedback.innerHTML = "";
      els.check.textContent = "Revisar";
      els.check.hidden = false;
      els.next.hidden = true;
      els.progress.children[st.i].classList.add("is-on");
      st.vista.mostrar(PREGUNTAS[st.i], st.i);
    }

    function reset() {
      st = { i: 0, sel: [], revisado: false, aciertos: 0, terminado: false, vista: hacer(raiz) };
      els.progress.innerHTML = PREGUNTAS.map(function () { return '<span class="opc__seg"><span></span></span>'; }).join("");
      st.vista.montar(els.escena, api, PREGUNTAS);
      mostrar();
    }

    function revisar() {
      if (st.revisado) return;
      if (!st.sel.length) {
        els.escena.classList.remove("is-shaking");
        void els.escena.offsetWidth;
        els.escena.classList.add("is-shaking");
        return;
      }
      st.revisado = true;
      var p = PREGUNTAS[st.i];
      var ok = st.sel.length === p.ok.length && st.sel.every(function (k) { return p.ok.indexOf(k) >= 0; });
      if (ok) st.aciertos++;
      st.vista.revelar(p, st.sel, ok, st.i);

      var resp = lista(p.ok.map(function (k) { return p.ops[k]; }));
      els.feedback.innerHTML =
        (ok ? "¡Correcto! " : (multi(p) ? "Las respuestas correctas son " : "La respuesta correcta es ") + resp + ". ") + p.porque;
      els.feedback.classList.add(ok ? "is-right" : "is-wrong");
      els.progress.children[st.i].classList.add("is-done");

      if (st.i < PREGUNTAS.length - 1) {
        els.check.hidden = true;
        els.next.hidden = false;
      } else {
        st.terminado = true;
        els.check.textContent = "Intentar de nuevo";
        later(1700, ventana);
      }
    }

    function siguiente() {
      els.next.hidden = true;
      els.feedback.classList.add("is-fading");
      st.vista.salir(function () {
        st.i++;
        mostrar();
      });
    }

    // Al terminar: ventana con los aciertos, igual que en los otros ejercicios
    function ventana() {
      var modal = document.getElementById("modal-fs");
      if (!st.terminado || !modal || !window.jQuery) return;
      var total = PREGUNTAS.length;
      var paso = st.aciertos * 100 >= total * 80;
      modal.querySelector("#modal-score").textContent = st.aciertos + " / " + total + " aciertos";
      modal.querySelector("#modal-message").textContent = paso
        ? mensajeBien
        : "Te recomendamos repasar los temas que fallaste y volver a intentarlo.";
      modal.querySelector("#correct-img").style.display = paso ? "block" : "none";
      modal.querySelector("#incorrect-img").style.display = paso ? "none" : "block";
      window.jQuery(modal).modal("show");
    }

    els.check.addEventListener("click", function () {
      if (st.terminado) {
        st.terminado = false;
        reset();
        raiz.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      } else {
        revisar();
      }
    });
    els.next.addEventListener("click", siguiente);
    raiz.classList.add("opc--ready");
    reset();
  }

  window.EjercicioOpciones = { crear: crear, escenas: { corcho: Corcho } };

  function iniciar() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-opciones]"), crear);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
