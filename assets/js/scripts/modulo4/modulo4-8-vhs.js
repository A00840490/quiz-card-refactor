/* Módulo 4-8: los operadores booleanos como una cinta VHS de inducción
   (estilos en modulo4-8-vhs.css).
   - El contenido sale de la tabla oculta [data-vhs-src]: por cada fila,
     el operador, su nombre (data-name), la función, el ejemplo, el paso
     intermedio (data-steps), el resultado y la explicación.
   - La cinta es una lista de escenas con su duración. Por cada operador:
     el operador, lo que hace (se desvanece al cambiar) y el ejemplo, que
     se evalúa paso a paso y termina con la explicación como subtítulo.
     Los textos largos se parten en páginas, como subtítulos, y el tiempo
     de lectura de cada página depende de su número de palabras.
   - Entre operadores pasa estática; al final se rebobina y vuelve a empezar.
   - El casete descansa acostado encima de la videocasetera. Al hacerle clic
     baja hasta la ranura de enfrente, entra y la tele se prende; EJECT lo
     saca, vuelve a quedar acostado encima y la tele se apaga. ⏮ ⏯ ⏭ regresan, pausan o adelantan,
     y la perilla salta a un operador. */
(function () {
  "use strict";

  var tv = document.querySelector("[data-vhs]");
  var src = document.querySelector("[data-vhs-src]");
  if (!tv || !src) return;

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var stage = tv.querySelector(".vhs__stage");
  var mode = tv.querySelector(".vhs__mode");
  var clock = tv.querySelector(".vhs__time");
  var fill = tv.querySelector(".vhs__bar b");
  var dial = tv.querySelector(".tv__dial");
  var knob = tv.querySelector(".tv__knob");
  var leds = tv.querySelector(".tv__leds");
  var tape = tv.querySelector(".tape");
  var btnPrev = tv.querySelector("[data-vhs-prev]");
  var btnPlay = tv.querySelector("[data-vhs-play]");
  var btnNext = tv.querySelector("[data-vhs-next]");
  var btnEject = tv.querySelector("[data-vhs-eject]");
  var cv = tv.querySelector(".tv__noise");
  var ctx = cv.getContext("2d");

  var FADE = 600; // lo que tarda una escena en desvanecerse
  var ZAP = 420; // lo que dura la estática
  var LOAD = 1200; // lo que tarda el casete en llegar a la ranura y entrar
  var EJECT = 1100; // lo que tarda en salir y volver a quedar acostado

  function clean(el) { return el.textContent.replace(/\s+/g, " ").trim(); }
  function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function words(s) { return s.split(" ").length; }
  function read(s, min) { return Math.max(min, words(s) * 330 + 1800); }
  // Resalta el operador dentro de una línea de código
  function mark(code, op) {
    var i = code.indexOf(op);
    if (i < 0) return esc(code);
    return esc(code.slice(0, i)) + '<span class="op">' + esc(op) + "</span>" + esc(code.slice(i + op.length));
  }
  function bools(s) { return esc(s).replace(/\b(True|False)\b/g, "<b>$1</b>"); }
  // Parte un texto largo en páginas de subtítulo de hasta "max" palabras,
  // cortando en puntos y punto y coma (o en comas si una oración no cabe)
  function pages(s, max) {
    var parts = [];
    (s.match(/[^.;]+[.;]?\)?(\s+|$)/g) || [s]).forEach(function (sentence) {
      if (words(sentence.trim()) <= max) parts.push(sentence.trim());
      else (sentence.match(/[^,]+,?(\s+|$)/g) || [sentence]).forEach(function (c) { parts.push(c.trim()); });
    });
    var out = [], cur = "";
    parts.forEach(function (p) {
      if (cur && words(cur + " " + p) > max) { out.push(cur); cur = p; }
      else cur = cur ? cur + " " + p : p;
    });
    if (cur) out.push(cur);
    // una página que sigue a media oración empieza con puntos suspensivos
    return out.map(function (p) { return /^[a-záéíóúñ]/.test(p) ? "…" + p : p; });
  }

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
  function scene(kicker, body) {
    return '<div class="vhs__scene">' + (kicker ? '<span class="vhs__kicker">' + kicker + "</span>" : "") + body + "</div>";
  }
  function resultHtml(o) {
    return '<span class="vhs__result' + (/false/i.test(o.res) ? " is-false" : "") + '">' + esc(o.res) + "</span>";
  }
  var beats = [];
  var chapters = [];
  beats.push({
    how: "fade", dur: 4200,
    html: scene("Cinta de inducción", '<h3 class="vhs__title">Operadores<br>Booleanos</h3>' +
      '<p class="vhs__sub">Bienvenido al equipo. En los próximos minutos conocerás a los ' + total + " operadores con los que vas a trabajar.</p>")
  });
  ops.forEach(function (o, k) {
    var code = '<span class="vhs__line">' + mark(o.ex, o.op) + "</span>";
    var codeOld = '<span class="vhs__line is-old">' + mark(o.ex, o.op) + "</span>";
    var step = '<span class="vhs__line">' + mark(o.steps, o.op) + "</span>";
    var stepOld = '<span class="vhs__line is-old">' + mark(o.steps, o.op) + "</span>";
    var arrow = '<span class="vhs__arrow" aria-hidden="true">▼</span>';
    chapters.push(beats.length);
    beats.push({ how: k ? "zap" : "fade", chapter: k, dur: 3800, html: scene("",
      '<span class="vhs__op">' + esc(o.op) + '</span><span class="vhs__name">Operador <em>' + esc(o.name) + "</em></span>") });
    pages(o.fn, 30).forEach(function (txt) {
      beats.push({ how: "fade", chapter: k, dur: read(txt, 4000), html: scene("¿Qué hace?",
        '<p class="vhs__text">' + bools(txt) + "</p>") });
    });
    beats.push({ how: "fade", chapter: k, dur: 2200, html: scene("Ejemplo",
      '<div class="vhs__steps">' + code + "</div>") });
    beats.push({ how: "none", chapter: k, dur: 2000, html: scene("Ejemplo",
      '<div class="vhs__steps">' + codeOld + arrow + step + "</div>") });
    beats.push({ how: "none", chapter: k, dur: 2400, html: scene("Ejemplo",
      '<div class="vhs__steps">' + codeOld + stepOld + arrow + resultHtml(o) + "</div>") });
    pages(o.why, 24).forEach(function (txt) {
      beats.push({ how: "none", chapter: k, dur: read(txt, 4000), html: scene("Ejemplo",
        '<div class="vhs__steps vhs__steps--row">' + codeOld + resultHtml(o) + "</div>" +
        '<p class="vhs__cap">' + bools(txt) + "</p>") });
    });
  });
  beats.push({ how: "zap", dur: 4500, end: true, html: scene("Fin de la cinta",
    '<h3 class="vhs__title">¡Ya eres parte del equipo!</h3>' +
    '<p class="vhs__sub">Ahora combina condiciones con <b>&amp;&amp;</b>, <b>||</b> y <b>!</b> en tus if.</p>') });

  // Posición de cada escena en la cinta (para el contador y la barra)
  var start = [], tape0 = 0;
  beats.forEach(function (b) { start.push(tape0); tape0 += b.dur; });
  var length = tape0;

  // ---------- Perilla y focos ----------
  function ang(k) { return total > 1 ? -60 + k * (120 / (total - 1)) : 0; }
  ops.forEach(function (o, k) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "tv__num";
    b.textContent = o.op;
    b.style.setProperty("--ang", ang(k) + "deg");
    b.setAttribute("aria-label", "Ir al operador " + o.name + " (" + o.op + ")");
    b.addEventListener("click", function () { jump(chapters[k]); });
    dial.appendChild(b);
    leds.appendChild(document.createElement("i"));
  });

  // ---------- Reproductor ----------
  var on = false, busy = false, playing = true;
  var idx = 0, armed = false, left = 0, since = 0, timer = null, swapTimer = null, zapUntil = 0;

  function fmt(ms) {
    var s = Math.floor(ms / 1000);
    return Math.floor(s / 3600) + ":" + ("0" + Math.floor(s / 60) % 60).slice(-2) + ":" + ("0" + s % 60).slice(-2);
  }
  function elapsed() {
    if (!armed) return 0;
    return beats[idx].dur - left + (playing ? performance.now() - since : 0);
  }
  function showTime(t) {
    clock.textContent = fmt(t);
    fill.style.width = (t / length * 100) + "%";
  }
  function paint() { showTime(Math.min(start[idx] + elapsed(), length)); }
  setInterval(function () { if (on && armed) paint(); }, 250);

  function setMode(txt, blink) {
    mode.textContent = txt;
    mode.classList.toggle("blink", !!blink);
  }
  function playMode() { setMode(playing ? "PLAY ▶" : "PAUSA ❚❚", !playing); }
  function noise() {
    var img = ctx.createImageData(160, 120), d = img.data;
    for (var p = 0; p < d.length; p += 4) { var v = Math.random() * 255 | 0; d[p] = d[p + 1] = d[p + 2] = v; d[p + 3] = 255; }
    ctx.putImageData(img, 0, 0);
    if (performance.now() < zapUntil) requestAnimationFrame(noise);
    else tv.classList.remove("is-zapping");
  }
  function zap(ms) {
    if (reduce) return;
    tv.classList.remove("is-zapping");
    void tv.offsetWidth;
    tv.classList.add("is-zapping");
    zapUntil = performance.now() + ms;
    noise();
  }
  function restart(cls) {
    tv.classList.remove(cls);
    void tv.offsetWidth;
    tv.classList.add(cls);
  }
  function marks(k) {
    Array.prototype.forEach.call(dial.querySelectorAll(".tv__num"), function (b, i) { b.classList.toggle("on", i === k); });
    if (k != null) {
      knob.style.setProperty("--ang", ang(k) + "deg");
      for (var i = 0; i <= k; i++) leds.children[i].classList.add("on");
    }
  }
  function ledsOff() { Array.prototype.forEach.call(leds.children, function (l) { l.classList.remove("on"); }); }

  // Corre el reloj de la escena actual
  function arm() {
    armed = true;
    left = beats[idx].dur;
    since = performance.now();
    if (playing) timer = setTimeout(advance, left);
  }
  function disarm() {
    clearTimeout(timer);
    clearTimeout(swapTimer);
    armed = false;
  }
  function render(i) {
    idx = i;
    var b = beats[i];
    stage.innerHTML = b.html;
    stage.classList.remove("is-out");
    marks(b.chapter != null ? b.chapter : null);
    arm();
    paint();
  }
  function enter(i, how) {
    disarm();
    idx = i;
    if (reduce || how === "none") { render(i); return; }
    if (how === "zap") {
      zap(ZAP);
      swapTimer = setTimeout(function () { render(i); }, ZAP / 2);
      return;
    }
    stage.classList.add("is-out");
    swapTimer = setTimeout(function () { render(i); }, FADE);
  }
  function advance() {
    if (beats[idx].end) { rewind(); return; }
    enter(idx + 1, beats[idx + 1].how);
  }
  // Al terminar, la cinta se rebobina con estática y vuelve a la portada
  function rewind() {
    disarm();
    setMode("REW ◀◀");
    stage.classList.add("is-out");
    zap(1400);
    ledsOff();
    var from = length, t0 = performance.now();
    (function roll() {
      var p = reduce ? 1 : Math.min((performance.now() - t0) / 1400, 1);
      showTime(from * (1 - p));
      if (p < 1 && on) requestAnimationFrame(roll);
    })();
    swapTimer = setTimeout(function () {
      if (!on) return;
      playMode();
      render(0);
    }, reduce ? 10 : 1400);
  }
  function jump(i) {
    if (busy) return;
    if (!on) { insert(i); return; }
    if (i === idx && armed) { disarm(); render(i); return; }
    setMode(i > idx ? "FF ▶▶" : "REW ◀◀");
    setTimeout(function () { if (on) playMode(); }, 900);
    disarm();
    zap(ZAP);
    swapTimer = setTimeout(function () { render(i); }, reduce ? 0 : ZAP / 2);
  }
  function chapterOf(i) {
    var c = -1;
    chapters.forEach(function (s, k) { if (s <= i) c = k; });
    return c;
  }
  function prev() {
    var c = chapterOf(idx);
    // Si el operador acaba de empezar, regresa al anterior; si no, al inicio de este
    if (c >= 0 && (idx !== chapters[c] || elapsed() > 1500)) jump(chapters[c]);
    else jump(c > 0 ? chapters[c - 1] : 0);
  }
  function next() {
    var c = chapterOf(idx);
    jump(c + 1 < total ? chapters[c + 1] : beats.length - 1);
  }
  function setPlaying(p) {
    if (p === playing) return;
    playing = p;
    tv.classList.toggle("is-paused", !p);
    btnPlay.setAttribute("aria-label", p ? "Pausar la cinta" : "Reproducir la cinta");
    if (!on) return;
    playMode();
    if (!armed) return;
    if (p) { since = performance.now(); timer = setTimeout(advance, left); }
    else { clearTimeout(timer); left -= performance.now() - since; }
  }
  function deck(enabled) {
    [btnPrev, btnPlay, btnNext, btnEject].forEach(function (b) { b.disabled = !enabled; });
  }

  // ---------- Casete: entra y la tele se prende; EJECT lo saca y se apaga ----------
  function insert(i) {
    if (busy || on) return;
    busy = true;
    var hadFocus = document.activeElement === tape;
    // se levanta, baja frente a la ranura, se abre la tapa y entra
    tv.classList.add("is-loading");
    setTimeout(function () { tv.classList.add("is-door"); }, reduce ? 0 : LOAD * .6);
    setTimeout(function () {
      tv.classList.remove("is-loading", "is-door");
      tv.classList.add("has-tape");
      restart("is-clunk");
      on = true;
      tv.classList.remove("is-off");
      deck(true);
      setPlaying(true);
      playMode();
      render(i || 0);
      restart("is-booting");
      if (hadFocus) btnPlay.focus();
      setTimeout(function () { tv.classList.remove("is-booting", "is-clunk"); busy = false; }, reduce ? 10 : 720);
    }, reduce ? 10 : LOAD);
  }
  function eject() {
    if (busy || !on) return;
    busy = true;
    disarm();
    setMode("EJECT ⏏");
    var hadFocus = document.activeElement === btnEject;
    deck(false);
    setTimeout(function () {
      // la tele se apaga mientras el casete sale y vuelve a quedar acostado
      tv.classList.add("is-shutting", "is-door", "is-ejecting");
      tv.classList.remove("has-tape");
      setTimeout(function () { tv.classList.remove("is-door"); }, reduce ? 0 : EJECT * .35);
      setTimeout(function () {
        tv.classList.remove("is-shutting");
        tv.classList.add("is-off");
        on = false;
        marks(null);
        ledsOff();
      }, reduce ? 10 : 460);
      setTimeout(function () {
        tv.classList.remove("is-ejecting");
        busy = false;
        if (hadFocus) tape.focus();
      }, reduce ? 20 : EJECT);
    }, reduce ? 10 : 450);
  }

  deck(false);
  tape.addEventListener("click", function () { insert(0); });
  btnEject.addEventListener("click", eject);
  knob.addEventListener("click", function () {
    if (!on) { insert(0); return; }
    jump(chapters[(chapterOf(idx) + 1) % total]);
  });
  btnPrev.addEventListener("click", prev);
  btnNext.addEventListener("click", next);
  btnPlay.addEventListener("click", function () { setPlaying(!playing); });
})();
