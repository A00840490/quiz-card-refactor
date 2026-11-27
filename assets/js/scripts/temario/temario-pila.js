/* Temario General: pila de vidrio (ver temario-pila.css).

   La lista de módulos va en el HTML como enlaces (data-foto y data-pos son la
   foto de cada placa); de aquí salen las placas y los temas de cada módulo,
   que se toman de la lista del curso (paginas.js).

   - Desde la página inicial (o el menú) la pila llega cerrada; al pasar el
     mouse se abre y al salir se vuelve a cerrar.
   - Desde la página de cierre de un módulo (temario.html?sigue=3, o si la
     página anterior fue el cierre del módulo 2) la pila llega abierta con el
     módulo que sigue arriba y marcado como "Siguiente"; se puede elegir
     cualquier otro y la pila se queda abierta en el último elegido.
   - Con mouse, un clic en una placa o en un módulo de la lista lleva al
     módulo. En pantallas táctiles el primer toque lo levanta y el segundo
     lleva a él. */
(function () {
  var raiz = document.querySelector("[data-pila]");
  if (!raiz || !window.CURSO) return;

  var esc = Curso.esc;
  var reduce = Curso.reduce;
  var conMouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var celular = window.matchMedia("(max-width: 575.98px)");

  var escena = raiz.querySelector(".pila__escena");
  var detalle = raiz.querySelector(".pila__detalle");
  var enlaces = [].slice.call(raiz.querySelectorAll(".pila__lista a"));
  var total = enlaces.length;
  var capas = [];

  // ¿Qué módulo sigue? Primero ?sigue=N; si no, la página anterior.
  function moduloQueSigue() {
    var n = parseInt(new URLSearchParams(window.location.search).get("sigue"), 10);
    if (!n) {
      var m = document.referrer.match(/modulo(\d+)-(\d+)\.html/);
      if (m && CURSO[m[1] - 1] && parseInt(m[2], 10) === CURSO[m[1] - 1].temas.length + 1) n = parseInt(m[1], 10) + 1;
    }
    return n >= 1 && n <= total ? n - 1 : -1;
  }

  var sigue = moduloQueSigue();
  var fija = sigue !== -1;      // llegó al terminar un módulo: se queda abierta
  var abierta = fija;
  var act = fija ? sigue : 0;

  // ---------- Armar las placas ----------
  var torre = document.createElement("div");
  torre.className = "pila__torre";
  torre.innerHTML = '<div class="pila__sombra"></div>';

  enlaces.forEach(function (a, i) {
    var n = i + 1;
    var capa = document.createElement("div");
    capa.className = "pila__capa";
    capa.innerHTML =
      '<div class="pila__canto"></div><div class="pila__canto"></div><div class="pila__canto"></div>' +
      '<div class="pila__vidrio"><div class="pila__foto"></div>' +
      '<span class="pila__marca">' + n + '</span><span class="pila__mod">Módulo ' + n + "</span></div>";
    var foto = capa.querySelector(".pila__foto");
    foto.style.backgroundImage = "url('" + a.getAttribute("data-foto") + "')";
    if (a.getAttribute("data-pos")) foto.style.backgroundPosition = a.getAttribute("data-pos");

    capa.addEventListener("pointerenter", function (e) {
      if (e.pointerType === "mouse") elegir(i);
    });
    capa.addEventListener("click", function () {
      if (act === i && abierta) window.location.href = a.href;
      else { elegir(i); abrir(true); }
    });
    torre.appendChild(capa);
    capas.push(capa);

    a.addEventListener("pointerenter", function (e) {
      if (e.pointerType === "mouse") { abrir(true); elegir(i); }
    });
    a.addEventListener("focus", function () { abrir(true); elegir(i); });
    a.addEventListener("click", function (e) {
      if (conMouse || (act === i && abierta)) return;
      e.preventDefault();
      elegir(i);
      abrir(true);
    });

    if (i === sigue) {
      var marca = document.createElement("span");
      marca.className = "pila__sigue";
      marca.textContent = "Siguiente";
      a.appendChild(marca);
    }
  });

  escena.appendChild(torre);
  escena.hidden = false;
  raiz.classList.add("is-lista");

  raiz.addEventListener("pointerenter", function (e) {
    if (e.pointerType === "mouse") abrir(true);
  });
  raiz.addEventListener("pointerleave", function (e) {
    if (e.pointerType === "mouse" && !fija) abrir(false);
  });
  // En pantallas táctiles, una vez abierta se queda así
  raiz.addEventListener("click", function () { if (!conMouse) fija = true; });

  // ---------- Dibujar ----------
  function pintar() {
    var cel = celular.matches;
    var paso = abierta ? (cel ? 44 : 58) : (cel ? 16 : 20);
    capas.forEach(function (c, i) {
      var z = (total - 1 - i) * paso, x = 0, y = 0;
      if (abierta) {
        if (i < act) z += cel ? 40 : 60;            // las de arriba se apartan
        if (i === act) { z += 26; x = -14; y = 40; } // la elegida sube y sale un poco
      }
      c.style.transform = "translate3d(" + x + "px," + y + "px," + z + "px)";
      c.style.zIndex = total - i;
      c.classList.toggle("is-act", abierta && i === act);
    });
    enlaces.forEach(function (a, i) { a.classList.toggle("is-act", i === act); });
    escena.classList.toggle("is-abierta", abierta);
  }

  function abrir(v) {
    if (abierta === v) return;
    abierta = v;
    pintar();
  }

  function sinEtiquetas(html) {
    var d = document.createElement("div");
    d.innerHTML = html;
    return d.textContent.replace(/\s+/g, " ").trim();
  }

  function detalleHtml(i) {
    var temas = CURSO[i].temas;
    var ejercicio = temas[temas.length - 1];
    var lista = temas.filter(function (t) { return t !== "Introducción" && t !== ejercicio; });
    var max = 6;
    var chips = lista.slice(0, max).map(function (t) { return "<li>" + esc(sinEtiquetas(t)) + "</li>"; }).join("");
    if (lista.length > max) chips += '<li class="pila__mas">y ' + (lista.length - max) + " más</li>";
    return "<p>" + lista.length + " temas, la introducción y el " + esc(sinEtiquetas(ejercicio)) + ".</p>" +
      '<ul class="pila__temas">' + chips + "</ul>" +
      '<a class="pila__ir" href="' + esc(enlaces[i].getAttribute("href")) + '"><span class="ico-clic" aria-hidden="true"></span>' +
      (i === sigue ? "Continuar con el módulo " + (i + 1) : "Empezar el módulo") + "</a>";
  }

  var espera;
  function elegir(i) {
    if (i === act) { pintar(); return; }
    act = i;
    pintar();
    clearTimeout(espera);
    if (reduce) { detalle.innerHTML = detalleHtml(act); return; }
    detalle.classList.add("is-fuera");
    espera = setTimeout(function () {
      detalle.innerHTML = detalleHtml(act);
      detalle.classList.remove("is-fuera");
    }, 220);
  }

  detalle.innerHTML = detalleHtml(act);
  pintar();
  if (celular.addEventListener) celular.addEventListener("change", pintar);
})();
