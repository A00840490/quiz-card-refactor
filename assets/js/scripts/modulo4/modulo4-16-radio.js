/* Módulo 4-16: los eventos como una radio sintonizada (estilos en
   assets/css/modulos/modulo4/modulo4-16-radio.css).

   Todo lo que hace el alumno en la página de prueba (el botón "Clic" y el
   campo de texto) activa eventos: click, dblclick, mouseover, mouseout y
   keydown. Cada uno sale del elemento como una señal con su nombre y viaja
   hasta la antena de la radio. El código elige qué elemento escuchar
   (getElementById) y qué evento (el.onclick, el.onmouseover…), y la aguja
   del cuadrante está en esa estación:

   - La señal que escucha el código va en azul: al llegar, su estación se
     ilumina, la bocina suena y la función corre (se resalta y la consola
     escribe "¡Te escuché!").
   - Cualquier otra señal va en gris. Si sale del elemento que escucha el
     código, llega a la radio y solo se oye estática; si sale del otro
     elemento, se apaga a medio camino.

   Al pasar el mouse por una estación del cuadrante (o tocarla en celular)
   sale una burbuja debajo con cuándo ocurre ese evento. La segunda banda
   tiene eventos que no se prueban aquí (load, submit, resize y scroll).

   El elemento que escucha el código lleva un borde fino y la palabra
   "escuchando", montada sobre el mismo borde, le da vueltas. Dentro de la
   ventana de código, el elemento y el evento son listas desplegables (el
   menú de vidrio del 3-23). Con "reducir movimiento" no hay animaciones ni vueltas. */
(function () {
  "use strict";

  var root = document.querySelector("[data-radio-ev]");
  if (!root) return;

  var EVENTOS = ["click", "dblclick", "mouseover", "mouseout", "keydown"];
  var NOMBRE = { boton: "el botón", campo: "el campo" };
  var QUE = {
    onclick: "un clic",
    ondblclick: "un doble clic",
    onmouseover: "que el puntero entre al elemento",
    onmouseout: "que el puntero salga del elemento",
    onkeydown: "una tecla presionada mientras el elemento está seleccionado"
  };
  var SVGNS = "http://www.w3.org/2000/svg";

  var reduce = Curso.reduce;

  var st = { el: "boton", ev: "onclick" };

  var scene = root.querySelector(".radio-ev__scene");
  var codeEl = root.querySelector("[data-code]");
  var consola = root.querySelector("[data-console]");
  var status = root.querySelector("[data-status]");
  var objs = { boton: root.querySelector('[data-obj="boton"]'), campo: root.querySelector('[data-obj="campo"]') };
  var antena = root.querySelector(".radio-ev__antena");
  var bocina = root.querySelector(".radio-ev__bocina");
  var foco = root.querySelector(".radio-ev__foco");
  var aguja = root.querySelector(".radio-ev__aguja");
  var perilla = root.querySelectorAll(".radio-ev__perilla")[1];
  var ests = {};
  Array.prototype.forEach.call(root.querySelectorAll(".radio-ev__est span"), function (s) { ests[s.getAttribute("data-ev")] = s; });

  function each(list, fn) { Array.prototype.forEach.call(list, fn); }
  var esc = Curso.esc;
  function cod(t) { return "<code>" + esc(t) + "</code>"; }
  function reinicia(el, clase) { el.classList.remove(clase); void el.getBoundingClientRect(); el.classList.add(clase); }

  /* ---------- Sonido (Web Audio, volumen bajo) ---------- */
  var ac = null;
  function audio() {
    if (!ac) {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      ac = new Ctx();
    }
    if (ac.state === "suspended") ac.resume();
    return ac;
  }

  function nota(freq, dur, vol, delay) {
    var a = audio();
    if (!a) return;
    var t = a.currentTime + (delay || 0);
    var o = a.createOscillator(), g = a.createGain();
    o.type = "triangle";
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(a.destination);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  function estatica() {
    var a = audio();
    if (!a) return;
    var len = Math.floor(a.sampleRate * 0.3), buf = a.createBuffer(1, len, a.sampleRate), data = buf.getChannelData(0);
    for (var i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    var src = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
    src.buffer = buf;
    f.type = "lowpass";
    f.frequency.value = 2400;
    g.gain.value = 0.05;
    src.connect(f);
    f.connect(g);
    g.connect(a.destination);
    src.start();
  }

  /* ---------- El código ----------
     Cada renglón de una parte lleva su propio data-part, así el resaltado
     cubre solo el texto y no la sangría (estándar de js-terminal.css). */
  function valor(k, texto, nombre) {
    return '<button type="button" class="menu-vidrio__valor" data-k="' + k + '" aria-haspopup="menu" aria-label="' + nombre + '. Elegir otro valor">' + esc(texto) + "</button>";
  }

  function parte(nombre, html) {
    return html.split("\n").map(function (l) {
      var m = l.match(/^(\s*)(.*)$/);
      return m[1] + '<span data-part="' + nombre + '">' + m[2] + "</span>";
    }).join("\n");
  }

  function pintaCodigo() {
    codeEl.innerHTML =
      parte("sel", "var el = document.getElementById(" + valor("el", '"' + st.el + '"', "Elemento: " + st.el) + ");") + "\n" +
      parte("fn", "el." + valor("ev", st.ev, "Evento: " + st.ev) + ' = function () {\n  console.log("¡Te escuché!");\n};');
  }

  var hlT;
  function resalta() {
    each(codeEl.querySelectorAll('[data-part="fn"], [data-part="fn"] .menu-vidrio__valor'), function (el) { el.classList.add("is-on"); });
    clearTimeout(hlT);
    hlT = setTimeout(function () {
      each(codeEl.querySelectorAll(".is-on"), function (el) { el.classList.remove("is-on"); });
    }, 1500);
  }

  function escribe(linea) {
    var sp = document.createElement("span");
    sp.className = "is-new";
    sp.textContent = linea;
    consola.appendChild(sp);
    while (consola.children.length > 3) consola.removeChild(consola.firstChild);
  }

  /* ---------- La explicación ----------
     Estándar .grafico-exp (como el tren del 4-6): el concepto y el código que
     se menciona van en <code> (azul, en negritas); lo demás en texto normal. */
  // La explicación cambia con el desvanecido estándar de la ficha (grafico-ficha.js)
  function explicar(html) {
    GraficoFicha.cambiar(status, html);
  }

  // Las explicaciones de "la función no corre" esperan un poco por si el evento escuchado llega enseguida
  var faltaT;
  function explicarLuego(html, espera) {
    clearTimeout(faltaT);
    faltaT = setTimeout(function () { explicar(html); }, espera);
  }

  /* ---------- "escuchando": borde fino y el texto dando vueltas ----------
     Cada marco lleva un SVG con el borde (un rectángulo redondeado) y la
     palabra "escuchando" montada sobre la misma línea, en blanco sobre una
     pastilla verde, así la palabra es parte del contorno. El texto va sobre
     una ruta que da tres vueltas al marco y avanza por la de en medio, así
     nunca se corta. La pastilla es la misma ruta con un trazo grueso y un
     solo tramo (stroke-dasharray) que avanza con el texto. */
  var MARGEN = 12, RADIO = 9, GRUESO = 15, HOLGURA = 6, VELOCIDAD = 34;
  var oidos = {};

  function rutaVuelta(x0, y0, x1, y1, r) {
    return "H" + (x1 - r) + "A" + r + " " + r + " 0 0 1 " + x1 + " " + (y0 + r) +
      "V" + (y1 - r) + "A" + r + " " + r + " 0 0 1 " + (x1 - r) + " " + y1 +
      "H" + (x0 + r) + "A" + r + " " + r + " 0 0 1 " + x0 + " " + (y1 - r) +
      "V" + (y0 + r) + "A" + r + " " + r + " 0 0 1 " + (x0 + r) + " " + y0;
  }

  function creaOido(k) {
    var svg = document.createElementNS(SVGNS, "svg");
    svg.setAttribute("class", "radio-ev__oido");
    svg.setAttribute("aria-hidden", "true");
    var id = "radio-ev-ruta-" + k;
    svg.innerHTML = '<defs><path id="' + id + '"/></defs><path class="radio-ev__borde"/><path class="radio-ev__pastilla"/><text><textPath>escuchando</textPath></text>';
    var tp = svg.querySelector("textPath");
    tp.setAttribute("href", "#" + id);
    tp.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#" + id);
    objs[k].appendChild(svg);
    oidos[k] = { svg: svg, ruta: svg.querySelector("defs path"), borde: svg.querySelector(".radio-ev__borde"), pastilla: svg.querySelector(".radio-ev__pastilla"), texto: svg.querySelector("text"), tp: tp, vuelta: 1, largo: 0, off: reduce ? 6 : 0 };
    mideOido(k);
  }

  function mideOido(k) {
    var o = oidos[k], w = objs[k].offsetWidth, h = objs[k].offsetHeight;
    if (!w || !h) return;
    o.svg.style.left = -MARGEN + "px";
    o.svg.style.top = -MARGEN + "px";
    o.svg.setAttribute("width", w + 2 * MARGEN);
    o.svg.setAttribute("height", h + 2 * MARGEN);
    o.svg.setAttribute("viewBox", -MARGEN + " " + -MARGEN + " " + (w + 2 * MARGEN) + " " + (h + 2 * MARGEN));
    var x0 = 0.5, y0 = 0.5, x1 = w - 0.5, y1 = h - 0.5, r = RADIO;
    var inicio = "M" + (x0 + r) + " " + y0, vuelta = rutaVuelta(x0, y0, x1, y1, r);
    o.borde.setAttribute("d", inicio + vuelta);
    // Tres vueltas: el texto va en la segunda, así la pastilla nunca se corta
    // en el inicio ni en el final de la ruta
    o.ruta.setAttribute("d", inicio + vuelta + vuelta + vuelta);
    o.pastilla.setAttribute("d", inicio + vuelta + vuelta + vuelta);
    o.vuelta = 2 * (x1 - x0 + y1 - y0) - 8 * r + 2 * Math.PI * r;
    o.largo = o.texto.getComputedTextLength() || 70;
    // La pastilla es un trazo grueso con puntas redondas sobre el borde: cada
    // punta suma medio grueso, así que el tramo es más corto que el texto
    var tramo = Math.max(1, o.largo + 2 * HOLGURA - GRUESO);
    o.pastilla.setAttribute("stroke-dasharray", tramo.toFixed(1) + " " + (3 * o.vuelta).toFixed(1));
    pon(o, o.off);
  }

  // Pone la palabra a "off" del inicio del contorno y mueve la pastilla con ella
  function pon(o, off) {
    o.off = off;
    var t = off + o.vuelta;
    o.tp.setAttribute("startOffset", t.toFixed(1));
    o.pastilla.setAttribute("stroke-dashoffset", (-(t - HOLGURA + GRUESO / 2)).toFixed(1));
  }

  var visible = true, girando = false, t0 = performance.now();
  function gira(ahora) {
    if (!visible || reduce) { girando = false; return; }
    var o = oidos[st.el];
    pon(o, ((ahora - t0) / 1000 * VELOCIDAD) % o.vuelta);
    requestAnimationFrame(gira);
  }
  function arrancaGiro() {
    if (girando || !visible || reduce) return;
    girando = true;
    requestAnimationFrame(gira);
  }

  /* ---------- Escena ---------- */
  function marcar() {
    Object.keys(objs).forEach(function (k) { objs[k].classList.toggle("is-oye", k === st.el); });
    var i = EVENTOS.indexOf(st.ev.slice(2));
    aguja.style.left = ((i + 0.5) / EVENTOS.length * 100) + "%";
    perilla.style.transform = "rotate(" + (i * 60 - 120) + "deg)";
    EVENTOS.forEach(function (e) { ests[e].classList.toggle("is-sint", "on" + e === st.ev); });
  }

  // La señal viaja del elemento a la antena; al llegar, la radio responde
  function senal(obj, tipo, escuchada, alLlegar) {
    var sr = scene.getBoundingClientRect();
    var or = objs[obj].getBoundingClientRect(), ar = antena.getBoundingClientRect();
    var sx = or.left + or.width / 2 - sr.left, sy = or.top + or.height / 2 - sr.top;
    var ex = ar.left + ar.width / 2 - sr.left, ey = ar.top - sr.top;
    var p = document.createElement("span");
    p.className = "radio-ev__senal" + (escuchada ? "" : " is-gris");
    p.textContent = tipo;
    p.style.left = sx + "px";
    p.style.top = sy + "px";
    scene.appendChild(p);

    var llega = obj === st.el;
    if (reduce || !p.animate) {
      setTimeout(function () { p.remove(); if (llega) alLlegar(); }, reduce ? 0 : 650);
      return;
    }
    if (!llega) {
      // No es el elemento que escucha el código: la señal se apaga a medio camino
      var a1 = p.animate([
        { left: sx + "px", top: sy + "px", opacity: 1 },
        { left: (sx + ex) / 2 + "px", top: (sy + ey) / 2 + "px", opacity: 0 }
      ], { duration: 800, easing: "ease-out", fill: "forwards" });
      a1.onfinish = function () { p.remove(); };
      return;
    }
    var a2 = p.animate([
      { left: sx + "px", top: sy + "px" },
      { left: ex + "px", top: ey + "px", transform: "translate(-50%, -50%) scale(.6)" }
    ], { duration: 650, easing: "cubic-bezier(.5, 0, .8, .6)", fill: "forwards" });
    a2.onfinish = function () { p.remove(); alLlegar(); };
  }

  function llega(tipo, escuchada) {
    reinicia(antena, "is-capta");
    setTimeout(function () { antena.classList.remove("is-capta"); }, 400);
    var s = ests[tipo], clase = escuchada ? "is-oye" : "is-flash";
    reinicia(s, clase);
    clearTimeout(s._t);
    s._t = setTimeout(function () { s.classList.remove(clase); }, 900);
    if (escuchada) {
      reinicia(bocina, "is-suena");
      foco.classList.add("is-on");
      clearTimeout(foco._t);
      foco._t = setTimeout(function () { foco.classList.remove("is-on"); }, 1100);
      nota(784, 0.35, 0.1);
      nota(1046.5, 0.45, 0.08, 0.12);
    } else {
      reinicia(bocina, "is-ruido");
      estatica();
    }
  }

  /* ---------- Burbuja con la descripción de cada estación ---------- */
  var DESC = {
    click: "Ocurre cuando se hace clic sobre el elemento.",
    dblclick: "Ocurre cuando se hace doble clic sobre el elemento.",
    mouseover: "Ocurre cuando el puntero está sobre el elemento.",
    mouseout: "Ocurre cuando el puntero sale del elemento.",
    keydown: "Ocurre cuando se presiona una tecla.",
    load: "Ocurre cuando termina de cargar la página.",
    submit: "Ocurre cuando se envía un formulario.",
    resize: "Ocurre cuando cambia el tamaño de la ventana.",
    scroll: "Ocurre cuando la ventana se desplaza."
  };
  var burbuja = document.createElement("div");
  burbuja.className = "radio-ev__burbuja";
  burbuja.hidden = true;
  burbuja.setAttribute("role", "tooltip");
  burbuja.id = "radio-ev-burbuja";
  scene.appendChild(burbuja);
  var tipDe = null;

  function muestraTip(s) {
    if (tipDe === s) return;
    escondeTip();
    tipDe = s;
    s.classList.add("is-tip");
    s.setAttribute("aria-describedby", burbuja.id);
    var ev = s.getAttribute("data-ev");
    burbuja.innerHTML = '<span class="radio-ev__burbuja-ev">on' + esc(ev) + "</span><p>" + esc(DESC[ev]) + "</p>";
    burbuja.hidden = false;
    var sr = scene.getBoundingClientRect(), r = s.getBoundingClientRect();
    var bw = burbuja.offsetWidth, cx = r.left + r.width / 2 - sr.left;
    var left = Math.max(0, Math.min(sr.width - bw, cx - bw / 2));
    burbuja.style.left = left + "px";
    burbuja.style.top = (r.bottom - sr.top + 12) + "px";
    burbuja.style.setProperty("--tail", Math.max(18, Math.min(bw - 18, cx - left)) + "px");
    burbuja.style.animation = "none";
    void burbuja.offsetWidth;
    burbuja.style.animation = "";
  }

  function escondeTip() {
    if (!tipDe) return;
    tipDe.classList.remove("is-tip");
    tipDe.removeAttribute("aria-describedby");
    tipDe = null;
    burbuja.hidden = true;
  }

  each(root.querySelectorAll(".radio-ev__est span, .radio-ev__est2 span"), function (s) {
    s.setAttribute("tabindex", "0");
    s.addEventListener("mouseenter", function () { muestraTip(s); });
    // Si se tocó o se eligió con el teclado, la burbuja se queda hasta salir de la estación
    s.addEventListener("mouseleave", function () { if (document.activeElement !== s) escondeTip(); });
    s.addEventListener("focus", function () { muestraTip(s); });
    s.addEventListener("blur", escondeTip);
  });
  document.addEventListener("pointerdown", function (e) {
    if (tipDe && !tipDe.contains(e.target)) escondeTip();
  });
  // En celular tocar una estación la enfoca y abre su burbuja; tocar fuera la cierra
  var anchoTip = window.innerWidth;
  window.addEventListener("resize", function () {
    if (window.innerWidth === anchoTip) return;
    anchoTip = window.innerWidth;
    escondeTip();
  });

  /* ---------- Los eventos de la página de prueba ---------- */
  var ultimoAcierto = 0;
  function registrar(obj, tipo) {
    var escuchada = obj === st.el && "on" + tipo === st.ev;
    if (escuchada) {
      clearTimeout(faltaT);
      ultimoAcierto = Date.now() + 650;
      senal(obj, tipo, true, function () {
        llega(tipo, true);
        resalta();
        escribe("¡Te escuché!");
        reinicia(objs[obj], "is-hit");
        setTimeout(function () { objs[obj].classList.remove("is-hit"); }, 400);
        explicar(cod(st.ev) + " en " + NOMBRE[obj] + ": es justo el evento que escucha tu código, así que la función corre.");
      });
      return;
    }
    senal(obj, tipo, false, function () { llega(tipo, false); });
    // Justo después de que la función corrió, se deja su explicación un momento
    if (Date.now() - ultimoAcierto < 2500) return;
    // Un doble clic también son dos clics: esos ya corrieron la función
    if (tipo === "dblclick" && st.ev === "onclick" && obj === st.el) return;
    if (obj !== st.el) explicarLuego("Se activó " + cod(tipo) + " en " + NOMBRE[obj] + ", pero tu código escucha " + NOMBRE[st.el] + ": la función no corre.", 700);
    else explicarLuego("Se activó " + cod(tipo) + " en " + NOMBRE[obj] + ", pero tu código solo escucha " + cod(st.ev) + ": la función no corre.", 1300);
  }

  Object.keys(objs).forEach(function (k) {
    var target = objs[k].querySelector(k === "boton" ? "button" : "input");
    EVENTOS.forEach(function (ev) {
      target.addEventListener(ev, function (e) {
        if (ev === "keydown" && e.key === "Tab") return;
        registrar(k, ev);
      });
    });
    if (k === "campo") {
      target.addEventListener("input", function () { if (target.value.length > 18) target.value = target.value.slice(-18); });
    }
  });

  /* ---------- Cambiar el elemento o el evento ---------- */
  function cambia(que, v) {
    if (que === "el") {
      if (v === st.el) return;
      st.el = v;
      explicar("Ahora " + cod("getElementById") + " selecciona " + NOMBRE[v] + ": es el único elemento que tu código escucha.");
    } else {
      if (v === st.ev) return;
      st.ev = v;
      explicar("Ahora tu código escucha " + cod(v) + ": la función corre con " + QUE[v] + ".");
    }
    clearTimeout(faltaT);
    pintaCodigo();
    marcar();
    var b = codeEl.querySelector('[data-k="' + que + '"]');
    if (b) b.focus({ preventScroll: true });
  }

  /* ---------- Menú de vidrio (estándar del 3-23) ---------- */
  var MENUS = {
    el: function () {
      return ["boton", "campo"].map(function (o) { return { html: cod('"' + o + '"'), valor: o, actual: o === st.el }; });
    },
    ev: function () {
      return EVENTOS.map(function (e) { return { html: cod("on" + e), valor: "on" + e, actual: "on" + e === st.ev }; });
    }
  };

  // El menú es el compartido del curso (assets/js/menu-vidrio.js)
  function abrirMenu(origen) {
    var que = origen.getAttribute("data-k");
    var opciones = MENUS[que]();
    MenuVidrio.abrir(origen, {
      dentro: root,
      opciones: opciones,
      alElegir: function (i) { cambia(que, opciones[i].valor); }
    });
  }

  // En celular la barra del navegador cambia el alto al hacer scroll: solo se cierra si cambia el ancho
  var ancho = window.innerWidth;
  window.addEventListener("resize", function () {
    if (window.innerWidth === ancho) return;
    ancho = window.innerWidth;
    MenuVidrio.cerrar();
  });

  codeEl.addEventListener("click", function (e) {
    var t = e.target.closest("[data-k]");
    if (!t) return;
    abrirMenu(t);
  });

  /* ---------- Arranque ---------- */
  root.classList.add("radio-ev--ready");
  pintaCodigo();
  Object.keys(objs).forEach(creaOido);
  marcar();
  if (window.ResizeObserver) {
    var ro = new ResizeObserver(function () { Object.keys(objs).forEach(mideOido); });
    Object.keys(objs).forEach(function (k) { ro.observe(objs[k]); });
  }
  if (window.IntersectionObserver) {
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; arrancaGiro(); }).observe(scene);
  }
  arrancaGiro();
  explicar("Todo lo que haces en la página de prueba activa eventos. Tu código elige qué elemento y qué evento escuchar.");
})();
