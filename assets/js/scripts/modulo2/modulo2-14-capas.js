/* Módulo 2-14: el <iframe> como una página en capas (modulo2-14-capas.css).
   - El código de la derecha se aplica tal cual: src, width y height se
     cambian con el menú de vidrio compartido (menu-vidrio.js), sin
     descripciones en las opciones.
   - La hoja de enfrente es una maqueta de la página con un hueco de
     width × height; detrás, alineada con el hueco, va un iframe de verdad con
     lo que diga src: la página de inicio del curso, el video de YouTube o
     Google, que no se deja mostrar y el navegador pone su aviso.
   - El botón de arriba gira la vista: las dos hojas se separan y un túnel de
     luz las une. La escena se dibuja en un lienzo de 900 px y se escala.
   - La explicación va en la ficha de renglones (GraficoFicha.cambiar). */
(function () {
  "use strict";

  var root = document.querySelector("[data-capas]");
  if (!root) return;

  var esc = Curso.esc;
  var reduce = Curso.reduce;

  var escena = root.querySelector("[data-escena]");
  var lienzo = root.querySelector("[data-lienzo]");
  var mundo = root.querySelector("[data-mundo]");
  var frente = root.querySelector("[data-frente]");
  var hueco = root.querySelector("[data-hueco]");
  var atras = root.querySelector("[data-atras]");
  var iframe = root.querySelector("[data-iframe]");
  var dir = root.querySelector("[data-dir]");
  var lados = root.querySelectorAll("[data-lado]");
  var giro = root.querySelector("[data-giro]");
  var pre = root.querySelector("[data-code]");
  var exp = root.querySelector("[data-status]");

  var ANCHO = 900;   // ancho del lienzo
  var HOJA = 800;    // ancho de la hoja de enfrente

  var URL_YT = "https://www.youtube.com/embed/yTr_3Q50orM";
  var URL_GO = "https://www.google.com";
  var OPCIONES = {
    src: ["../../index.html", URL_YT, URL_GO],
    width: ["320", "480", "640"],
    height: ["200", "300", "400"]
  };
  var estado = { src: 0, width: 1, height: 1 };
  var abajo = null; // lo que mide la hoja debajo del hueco

  function val(k) { return OPCIONES[k][estado[k]]; }
  function tipo() { return ["local", "video", "rechazo"][estado.src]; }

  /* ---------- Código ---------- */
  function valor(k) {
    if (k === "src") {
      // El url de YouTube es largo: va como texto que se parte, con el aspecto del botón
      return "<span class=\"menu-vidrio__valor capas__largo\" role=\"button\" tabindex=\"0\" data-k=\"src\" aria-haspopup=\"menu\" aria-label=\"" +
        esc("src: " + val("src")) + ". Elegir otro valor\">" + esc(val("src")) + "</span>";
    }
    return MenuVidrio.boton(val(k), k, " data-k=\"" + k + "\"");
  }

  function pintarCodigo() {
    var tag = "<span class=\"codetag\">iframe</span>";
    var lineas = [
      "&lt;" + tag,
      "  src=\"" + valor("src") + "\"",
      "  width=\"" + valor("width") + "\"",
      "  height=\"" + valor("height") + "\"&gt;",
      "&lt;/" + tag + "&gt;"
    ];
    pre.innerHTML = lineas.map(function (l) { return "<span class=\"ld-line\">" + l + "</span>"; }).join("");
  }

  /* ---------- Explicación ---------- */
  function franjas() {
    var r = val("width") / val("height"), video = 16 / 9;
    if (r > video * 1.15) return " Como el marco es más ancho que el video, le quedan franjas negras a los lados.";
    if (r < video * 0.85) return " Como el marco es más alto que el video, le quedan franjas negras arriba y abajo.";
    return "";
  }

  function explicacion(k) {
    var t = tipo(), med = val("width") + " × " + val("height") + " px";
    if (k === "width" || k === "height") {
      var base = "<code>width</code> y <code>height</code> son el tamaño del marco: ahora mide " + med + ". ";
      if (t === "local") return base + "La página de adentro se acomoda a ese ancho y lo que no cabe se recorre con su propio scroll.";
      if (t === "video") return base + "El video se acomoda a ese espacio." + franjas();
      return base + "El aviso del navegador se acomoda a ese espacio.";
    }
    if (t === "local") {
      return "<code>src</code> le dice al navegador qué página mostrar dentro del marco: <code>../../index.html</code> es la página de inicio de nuestro propio sitio. " +
        "Se ve completa y con su propio scroll en un espacio de " + med + ", como piden <code>width</code> y <code>height</code>.";
    }
    if (t === "video") {
      return "<code>src</code> lleva el url de un video de YouTube, una página externa: se ve sin salir de nuestro sitio, en un espacio de " + med +
        ", como piden <code>width</code> y <code>height</code>.";
    }
    return "<code>src</code> lleva el url de Google, pero Google no deja que otros sitios lo muestren en un <code>iframe</code>, así que el navegador pone un aviso en el espacio de " + med + ".";
  }

  /* ---------- Escena ---------- */
  function pintarEscena() {
    var w = +val("width"), h = +val("height");
    var k = escena.clientWidth / ANCHO;
    lienzo.style.transform = "scale(" + k + ")";
    hueco.style.width = w + "px";
    hueco.style.height = h + "px";

    // El hueco no cambia de altura en la hoja: lo de arriba siempre mide lo mismo
    var top = hueco.offsetTop, left = (HOJA - w) / 2;
    if (abajo === null) abajo = frente.offsetHeight - top - hueco.offsetHeight;
    var alto = 34 + top + h + abajo + 40;
    lienzo.style.height = alto + "px";
    escena.style.height = Math.round(alto * k) + "px";

    // La hoja de atrás, alineada con el hueco
    atras.style.left = left + "px";
    atras.style.top = top + "px";
    atras.style.width = w + "px";
    atras.style.height = h + "px";

    // El túnel: arriba, abajo, izquierda y derecha del hueco
    var pos = [[left, top, w, null], [left, top + h, w, null], [left, top, null, h], [left + w, top, null, h]];
    pos.forEach(function (p, i) {
      lados[i].style.left = p[0] + "px";
      lados[i].style.top = p[1] + "px";
      if (p[2] !== null) lados[i].style.width = p[2] + "px";
      if (p[3] !== null) lados[i].style.height = p[3] + "px";
    });
  }

  // La página nueva entra cuando el iframe termina de cargar (o al poco rato,
  // porque el aviso de una página que no se deja mostrar a veces no avisa)
  var tCarga;
  function cargar() {
    var src = val("src");
    dir.textContent = ["index.html", "youtube.com", "google.com"][estado.src];
    if (reduce) { iframe.src = src; return; }
    atras.classList.add("is-cargando");
    clearTimeout(tCarga);
    tCarga = setTimeout(function () {
      var listo = function () { clearTimeout(tCarga); atras.classList.remove("is-cargando"); };
      iframe.onload = listo;
      iframe.src = src;
      tCarga = setTimeout(listo, 1500);
    }, 260);
  }

  /* ---------- Girar la vista ---------- */
  giro.addEventListener("click", function () {
    var en3d = !escena.classList.contains("is-3d");
    escena.classList.toggle("is-3d", en3d);
    giro.setAttribute("aria-pressed", String(en3d));
    giro.setAttribute("aria-label", en3d ? "Ver la página de frente" : "Ver la página en capas");
  });

  // En capas, la vista se mueve un poco con el mouse
  escena.addEventListener("pointermove", function (e) {
    if (e.pointerType !== "mouse" || reduce) return;
    var b = escena.getBoundingClientRect();
    mundo.style.setProperty("--px", ((e.clientX - b.left) / b.width - 0.5).toFixed(3));
    mundo.style.setProperty("--py", ((e.clientY - b.top) / b.height - 0.5).toFixed(3));
  });
  escena.addEventListener("pointerleave", function () {
    mundo.style.setProperty("--px", 0);
    mundo.style.setProperty("--py", 0);
  });

  /* ---------- Valores del código: el menú de vidrio ---------- */
  function abrir(b) {
    var k = b.getAttribute("data-k");
    MenuVidrio.abrir(b, {
      dentro: root,
      opciones: MenuVidrio.valores(OPCIONES[k], val(k)),
      alElegir: function (i) { cambiar(k, i); }
    });
  }

  pre.addEventListener("click", function (e) {
    var b = e.target.closest("[data-k]");
    if (b) abrir(b);
  });

  pre.addEventListener("keydown", function (e) {
    var b = e.target.closest(".capas__largo");
    if (b && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); abrir(b); }
  });

  function cambiar(k, i) {
    if (estado[k] === i) return;
    estado[k] = i;
    pintarCodigo();
    pintarEscena();
    if (k === "src") cargar();
    var b = pre.querySelector("[data-k=\"" + k + "\"]");
    if (b) b.focus({ preventScroll: true });
    GraficoFicha.cambiar(exp, explicacion(k));
  }

  var tRes;
  window.addEventListener("resize", function () {
    clearTimeout(tRes);
    tRes = setTimeout(pintarEscena, 120);
  });

  pintarCodigo();
  pintarEscena();
  dir.textContent = "index.html";
  GraficoFicha.cambiar(exp, explicacion("src"));
})();
