/* Módulo 4-8: los operadores booleanos como una cinta VHS de introducción.
   La tele, la videocasetera y el reproductor son el componente común
   assets/js/vhs.js (estilos en assets/css/vhs.css); aquí solo se arman las
   escenas.
   - El contenido sale de la tabla oculta [data-vhs-src]: por cada fila,
     el operador, su nombre (data-name), la función, el ejemplo, el paso
     intermedio (data-steps), el resultado y la explicación.
   - La cinta es una lista de escenas con su duración: la portada, la
     bienvenida y, por cada operador (un capítulo), el operador, lo que hace
     (se desvanece al cambiar) y el ejemplo, que se evalúa paso a paso y
     termina con la explicación como subtítulo.
     Los textos largos se parten en páginas, como subtítulos, y el tiempo
     de lectura de cada página depende de su número de palabras.
   - Entre operadores pasa estática; al final se rebobina y vuelve a empezar.
   - En "¿Qué hace?" el fondo es una cuadrícula que avanza en diagonal. */
(function () {
  "use strict";

  var tv = document.querySelector("[data-vhs]");
  var src = document.querySelector("[data-vhs-src]");
  if (!tv || !src || !window.Vhs) return;

  var esc = Curso.esc;
  var scene = Vhs.escena, pages = Vhs.paginas, read = Vhs.lectura;
  function clean(el) { return el.textContent.replace(/\s+/g, " ").trim(); }
  // Resalta el operador dentro de una línea de código
  function mark(code, op) {
    var i = code.indexOf(op);
    if (i < 0) return esc(code);
    return esc(code.slice(0, i)) + '<span class="op">' + esc(op) + "</span>" + esc(code.slice(i + op.length));
  }
  function bools(s) { return esc(s).replace(/\b(True|False)\b/g, "<b>$1</b>"); }

  // ---------- Contenido de la tabla ----------
  var ops = Array.prototype.map.call(src.querySelectorAll("tbody tr"), function (tr) {
    var td = tr.children;
    return {
      op: clean(td[0]),
      name: tr.getAttribute("data-name") || "",
      fn: clean(td[1]),
      ex: clean(td[2]),
      steps: tr.getAttribute("data-steps") || "",
      res: clean(td[3]),
      why: clean(td[4])
    };
  });
  var total = ops.length;

  // ---------- Escenas ----------
  function resultHtml(o) {
    return '<span class="vhs__result' + (/false/i.test(o.res) ? " is-false" : "") + '">' + esc(o.res) + "</span>";
  }
  var beats = [];
  // Portada y bienvenida (los minutos se llenan cuando se sabe lo que dura la cinta)
  beats.push({ how: "fade", dur: 3600, html: scene("", '<h3 class="vhs__title vhs__title--cover">Operadores<br>Booleanos</h3>') });
  var list = ops.map(function (o) { return "<b>" + esc(o.op) + "</b> (" + esc(o.name) + ")"; });
  var welcome = "Bienvenido a la cinta de Introducción al uso de operadores booleanos. En los próximos {min} minutos " +
    "conocerás el funcionamiento de " + list.slice(0, -1).join(", ") + (total > 1 ? " y " : "") + list[total - 1] + ", con un ejemplo de cada uno.";
  beats.push({ how: "fade", dur: read(welcome.replace(/<[^>]+>/g, ""), 4000), html: scene("", '<p class="vhs__text">' + welcome + "</p>") });
  ops.forEach(function (o, k) {
    var code = '<span class="vhs__line">' + mark(o.ex, o.op) + "</span>";
    var codeOld = '<span class="vhs__line is-old">' + mark(o.ex, o.op) + "</span>";
    var step = '<span class="vhs__line">' + mark(o.steps, o.op) + "</span>";
    var stepOld = '<span class="vhs__line is-old">' + mark(o.steps, o.op) + "</span>";
    var arrow = '<span class="vhs__arrow" aria-hidden="true">▼</span>';
    beats.push({ how: k ? "zap" : "fade", chapter: k, dur: 3800, html: scene("",
      '<span class="vhs__op">' + esc(o.op) + '</span><span class="vhs__name">Operador <em>' + esc(o.name) + "</em></span>") });
    pages(o.fn, 30).forEach(function (txt) {
      beats.push({ how: "fade", chapter: k, grid: true, dur: read(txt, 4000), html: scene("¿Qué hace?",
        '<p class="vhs__text">' + bools(txt) + "</p>") });
    });
    beats.push({ how: "fade", chapter: k, dur: 2200, html: scene("Ejemplo",
      '<div class="vhs__steps">' + code + "</div>") });
    beats.push({ how: "none", chapter: k, dur: 2000, html: scene("Ejemplo",
      '<div class="vhs__steps">' + codeOld + arrow + step + "</div>") });
    beats.push({ how: "none", chapter: k, dur: 2400, html: scene("Ejemplo",
      '<div class="vhs__steps">' + codeOld + stepOld + arrow + resultHtml(o) + "</div>") });
    pages(o.why, 20).forEach(function (txt) {
      beats.push({ how: "none", chapter: k, dur: read(txt, 4000), html: scene("Ejemplo",
        '<div class="vhs__steps vhs__steps--row">' + codeOld + resultHtml(o) + "</div>" +
        '<p class="vhs__cap">' + bools(txt) + "</p>") });
    });
  });
  beats.push({ how: "zap", dur: 4500, end: true, html: scene("Fin de la cinta",
    '<h3 class="vhs__title">¡Ya conoces los operadores!</h3>' +
    '<p class="vhs__sub">Ahora combina condiciones con <b>&amp;&amp;</b>, <b>||</b> y <b>!</b> en tus if.</p>') });

  Vhs.crear(tv, beats);
})();
