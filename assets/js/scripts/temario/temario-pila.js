/* Temario General: pila de vidrio (ver temario-pila.css).

   La lista de módulos va en el HTML como enlaces (data-foto y data-pos son la
   foto de cada placa); de ella salen las placas. La lista se oculta a la
   vista y queda solo la pila (Ale, 27/11).

   - Desde la página inicial (o el menú) la pila llega cerrada; al pasar el
     mouse se abre y al salir se vuelve a cerrar.
   - Desde la página de cierre de un módulo (temario.html?sigue=3, o si la
     página anterior fue el cierre del módulo 2) la pila llega abierta con el
     módulo que sigue arriba; se puede elegir
     cualquier otro y la pila se queda abierta en el último elegido.
   - Con mouse, un clic en una placa o en un módulo de la lista lleva al
     módulo. El título del módulo solo aparece, a la derecha de la placa,
     mientras se señala (Ale, 27/11). En pantallas táctiles el primer toque lo levanta y el segundo
     lleva a él. Con el teclado, al llegar a un enlace de la lista oculta su
     placa sube. */
(function () {
  var raiz = document.querySelector("[data-pila]");
  if (!raiz || !window.CURSO) return;

  var conMouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var celular = window.matchMedia("(max-width: 575.98px)");

  var escena = raiz.querySelector(".pila__escena");
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
      '<span class="pila__marca">' + n + '</span><span class="pila__mod">Módulo ' + n + "</span>" +
      // Las cuatro esquinas: de la que quede más a la derecha sale el título
      '<i class="pila__ancla" style="left:0;top:0"></i><i class="pila__ancla" style="right:0;top:0"></i>' +
      '<i class="pila__ancla" style="left:0;bottom:0"></i><i class="pila__ancla" style="right:0;bottom:0"></i></div>';
    var foto = capa.querySelector(".pila__foto");
    foto.style.backgroundImage = "url('" + a.getAttribute("data-foto") + "')";
    if (a.getAttribute("data-pos")) foto.style.backgroundPosition = a.getAttribute("data-pos");

    capa.addEventListener("pointerenter", function (e) {
      if (e.pointerType === "mouse") { elegir(i); mostrar(i); }
    });
    capa.addEventListener("pointerleave", function (e) {
      if (e.pointerType === "mouse") ocultar();
    });
    capa.addEventListener("click", function () {
      if (act === i && abierta) window.location.href = a.href;
      else { elegir(i); abrir(true); mostrar(i); }
    });
    torre.appendChild(capa);
    capas.push(capa);

    a.addEventListener("pointerenter", function (e) {
      if (e.pointerType === "mouse") { abrir(true); elegir(i); }
    });
    a.addEventListener("focus", function () { abrir(true); elegir(i); mostrar(i); });
    a.addEventListener("blur", ocultar);
    a.addEventListener("click", function (e) {
      if (conMouse || (act === i && abierta)) return;
      e.preventDefault();
      elegir(i);
      abrir(true);
      mostrar(i);
    });

    if (i === sigue) {
      var marca = document.createElement("span");
      marca.textContent = " (siguiente)";
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
    if (e.pointerType !== "mouse") return;
    ocultar(true);
    if (!fija) abrir(false);
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
    escena.classList.toggle("is-abierta", abierta);
    seguir();
  }

  function abrir(v) {
    if (abierta === v) return;
    abierta = v;
    pintar();
  }

  function elegir(i) {
    act = i;
    pintar();
  }

  // ---------- Título del módulo señalado ----------
  // Solo aparece mientras se señala una placa (mouse, toque o teclado), justo a
  // la derecha de ella; al cambiar de placa se desvanece y aparece el nuevo. En
  // celular no cabe a la derecha y va debajo de la pila.
  var titulo = document.createElement("p");
  titulo.className = "pila__titulo";
  titulo.setAttribute("aria-hidden", "true");
  escena.appendChild(titulo);

  var senalada = -1, tQuitar, tCambio, hasta = 0, cuadro = 0;

  function nombre(i) {
    var partes = enlaces[i].querySelectorAll("span");
    return partes.length > 1 ? partes[1].textContent : enlaces[i].textContent;
  }

  function mostrar(i) {
    clearTimeout(tQuitar);
    if (senalada === i) return;
    var antes = senalada;
    senalada = i;
    clearTimeout(tCambio);
    if (antes === -1) {
      titulo.textContent = nombre(i);
      seguir();
      titulo.classList.add("is-on");
      return;
    }
    titulo.classList.remove("is-on");
    tCambio = setTimeout(function () {
      if (senalada === -1) return;
      titulo.textContent = nombre(senalada);
      seguir();
      titulo.classList.add("is-on");
    }, Curso.reduce ? 0 : 200);
  }

  function ocultar(yaMismo) {
    clearTimeout(tQuitar);
    tQuitar = setTimeout(function () {
      senalada = -1;
      clearTimeout(tCambio);
      titulo.classList.remove("is-on");
    }, yaMismo === true ? 0 : 120);
  }

  function colocar() {
    if (senalada === -1) return;
    var caja = escena.getBoundingClientRect();
    var punto = null;
    [].forEach.call(capas[senalada].querySelectorAll(".pila__ancla"), function (an) {
      var r = an.getBoundingClientRect();
      if (!punto || r.left > punto.x) punto = { x: r.left, y: r.top };
    });
    var x = punto.x - caja.left + 22;
    var libre = caja.width - x - 8;
    var abajo = celular.matches || libre < 150;
    titulo.classList.toggle("is-abajo", abajo);
    if (abajo) {
      titulo.style.left = "50%";
      titulo.style.top = (caja.height + 4) + "px";
      titulo.style.maxWidth = "";
    } else {
      titulo.style.left = x + "px";
      titulo.style.top = (punto.y - caja.top) + "px";
      titulo.style.maxWidth = Math.min(300, libre) + "px";
    }
  }

  // Mientras las placas se mueven, el título las sigue
  function seguir() {
    hasta = Date.now() + 900;
    if (cuadro) return;
    (function paso() {
      colocar();
      cuadro = Date.now() < hasta ? requestAnimationFrame(paso) : 0;
    })();
  }

  pintar();
  if (celular.addEventListener) celular.addEventListener("change", pintar);
  window.addEventListener("resize", seguir);
})();
