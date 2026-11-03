/* Módulo 2-12: enlaces externos en un tablero de corcho
   (modulo2-12-corcho.css).
   - El código de la derecha es un solo enlace: <a href="…" target="…"> con
     lo que encierra. href (Google, el artículo "Paisaje" de Wikipedia o
     YouTube), target (_blank o _self) y el contenido (solo texto, un <p> o
     la foto del paisaje) se cambian con el menú de vidrio compartido
     (menu-vidrio.js), sin descripciones en las opciones.
   - La página del curso es una hoja clavada en el corcho y los tres sitios
     son fotos instantáneas. Un estambre rojo va del enlace a la foto que dice
     href: al cambiarlo, el estambre se descuelga y se clava en otra.
   - La zona de clic va marcada con plumón y la tachuela del enlace es del
     color de su estado: azul sin visitar, roja mientras se presiona (activo)
     y morada si ya se visitó esa dirección.
   - Clic en el enlace: con _blank se clava una hoja nueva con el sitio al
     lado de la del curso; con _self la hoja nueva tapa la del curso y
     después se quita (Atrás). Al cambiar target se ve solo.
   - La escena se dibuja en un lienzo de 640 × 520 px y se escala.
   - La explicación va en la ficha de renglones (GraficoFicha.cambiar). */
(function () {
  "use strict";

  var root = document.querySelector("[data-corcho]");
  if (!root) return;

  var esc = Curso.esc;
  var reduce = Curso.reduce;
  var IMG = Curso.ruta() + "assets/images/course/modulo2/m2-12/";

  var escena = root.querySelector("[data-escena]");
  var lienzo = root.querySelector("[data-lienzo]");
  var pre = root.querySelector("[data-code]");
  var exp = root.querySelector("[data-status]");

  var ANCHO = 640, ALTO = 520;
  var k = 1; // escala del lienzo

  var TEXTO = "¡Este enlace te lleva a Google!";
  var SITIOS = [
    { href: "https://www.google.com.mx", n: "Google", dom: "google.com.mx", x: 470, y: 38, r: 4 },
    { href: "https://es.wikipedia.org/wiki/Paisaje", n: "Wikipedia", dom: "es.wikipedia.org", x: 446, y: 192, r: -3.5 },
    { href: "https://www.youtube.com", n: "YouTube", dom: "youtube.com", x: 478, y: 350, r: 2.5 }
  ];
  var CONT = { texto: TEXTO, p: "<p>" + TEXTO + "</p>", img: "<img src=\"paisaje.jpg\" alt=\"paisaje\">" };
  var OPCIONES = {
    href: SITIOS.map(function (s) { return s.href; }),
    target: ["_blank", "_self"],
    cont: ["texto", "p", "img"]
  };
  var estado = { href: 0, target: 0, cont: 0 };
  var visitados = {};

  function val(c) { return OPCIONES[c][estado[c]]; }
  function sitio() { return SITIOS[estado.href]; }
  function espera(ms) { return new Promise(function (r) { setTimeout(r, reduce ? Math.min(ms, 60) : ms); }); }
  function cuadro() { return new Promise(function (r) { requestAnimationFrame(function () { requestAnimationFrame(r); }); }); }
  function suave(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function animar(ms, paso) {
    return new Promise(function (r) {
      if (reduce) { paso(1); r(); return; }
      var t0 = performance.now();
      (function f(t) { var x = Math.min(1, (t - t0) / ms); paso(x); if (x < 1) requestAnimationFrame(f); else r(); })(t0);
    });
  }

  /* ---------- Código ---------- */
  function valor(c) {
    var v = c === "cont" ? CONT[val(c)] : val(c);
    if (c === "target") return MenuVidrio.boton(v, c, " data-k=\"target\"");
    // La dirección y el contenido son largos: van como texto que se parte, con el aspecto del botón
    return "<span class=\"menu-vidrio__valor corcho__largo\" role=\"button\" tabindex=\"0\" data-k=\"" + c + "\" aria-haspopup=\"menu\" aria-label=\"" +
      esc((c === "cont" ? "contenido" : c) + ": " + v) + ". Elegir otro valor\">" + esc(v) + "</span>";
  }
  function pintarCodigo() {
    var a = "<span class=\"codetag\">a</span>";
    var lineas = [
      "&lt;" + a + " href=\"" + valor("href") + "\"",
      "   target=\"" + valor("target") + "\"&gt;",
      "  " + valor("cont"),
      "&lt;/" + a + "&gt;"
    ];
    pre.innerHTML = lineas.map(function (l) { return "<span class=\"ld-line\">" + l + "</span>"; }).join("");
  }

  /* ---------- Explicación ---------- */
  function explicacion(c) {
    var s = sitio(), visto = !!visitados[s.href];
    if (c === "href") {
      var t = "<code>href</code> es la dirección a la que lleva el enlace; ahora es " + s.dom + ".";
      if (estado.href > 0 && val("cont") !== "img") t += " El texto sigue diciendo Google, pero eso no importa: a dónde vas lo decide <code>href</code>.";
      if (val("cont") !== "img") t += visto ? " Ya visitaste esa dirección, así que el enlace se ve morado." : " Como nunca has visitado esa dirección, el enlace se ve azul.";
      return t;
    }
    if (c === "target") {
      if (val("target") === "_blank") return "<code>target=\"_blank\"</code> abre el enlace en una pestaña nueva: la página del curso se queda abierta en la suya.";
      return "<code>target=\"_self\"</code> abre el enlace en la misma pestaña (es lo mismo que no poner <code>target</code>): " + s.n + " reemplaza a la página del curso, y para volver hay que usar Atrás.";
    }
    if (c === "cont") {
      if (val("cont") === "texto") return "<code>&lt;a&gt;</code> encierra solo el texto, así que solo las letras son el enlace: un clic en el espacio de al lado no hace nada.";
      if (val("cont") === "p") return "Ahora <code>&lt;a&gt;</code> encierra un <code>&lt;p&gt;</code>, y el enlace ocupa todo el párrafo de orilla a orilla: también funciona el clic en el espacio en blanco junto al texto.";
      return "<code>&lt;a&gt;</code> puede encerrar cualquier elemento, también un <code>&lt;img&gt;</code>: un clic en la foto abre el enlace. La foto no se pinta de azul ni de morado, pero el cursor sí cambia a la manita.";
    }
    if (c === "clic") {
      var donde = val("target") === "_blank" ? s.n + " se abrió en una pestaña nueva y la del curso siguió abierta." : s.n + " reemplazó a la página del curso en la misma pestaña, y con Atrás regresaste.";
      if (val("cont") === "img") return "Un clic en la foto funcionó igual que en un texto: " + donde;
      return donde + " Mientras se presionaba, el enlace se vio rojo (activo); ahora se ve morado porque ya visitaste esa dirección.";
    }
    return "Un enlace se hace con <code>&lt;a&gt;</code>: lo que encierra se vuelve clicable y <code>href</code> dice a dónde lleva. Este lleva a Google y, con <code>target=\"_blank\"</code>, se abre en una pestaña nueva.";
  }

  /* ---------- Las páginas en miniatura ---------- */
  function enlaceHTML() {
    var cls = "corcho__lk" + (visitados[sitio().href] ? " is-visit" : "");
    var a = " data-lk role=\"link\" tabindex=\"0\" title=\"" + esc(sitio().href) + "\"";
    if (val("cont") === "texto") return "<a class=\"" + cls + "\"" + a + ">" + esc(TEXTO) + "</a>";
    if (val("cont") === "p") return "<a class=\"" + cls + " corcho__lk--p\"" + a + "><p>" + esc(TEXTO) + "</p></a>";
    return "<a class=\"" + cls + " corcho__lk--img\"" + a + "><img src=\"" + IMG + "paisaje.jpg\" alt=\"paisaje\"></a>";
  }
  function paginaCurso() {
    return "<div class=\"corcho__pg corcho__mp\"><div class=\"corcho__mp-head\"><b>CVA</b><span>Centro Virtual<br>de Aprendizaje</span></div>" +
      "<div class=\"corcho__mp-card\"><div class=\"corcho__mp-t\"><span class=\"corcho__mp-badge\">Tema 11</span>Enlaces</div>" +
      "<div class=\"corcho__mp-linea\"></div><div class=\"corcho__mp-linea is-corta\"></div>" +
      "<div class=\"corcho__mp-ej\" data-ej>" + enlaceHTML() + "</div>" +
      "<div class=\"corcho__mp-linea\"></div><div class=\"corcho__mp-linea is-corta\"></div></div></div>";
  }
  var VIDEOS = [
    ["paisaje.jpg", "50% 60%", "Paisajes de montaña en 4K", "Naturaleza viva · 2.1 M de vistas"],
    ["miniatura-escritorio.jpg", "40% 50%", "Mi escritorio para programar", "Código diario · 340 k vistas"],
    ["miniatura-fotos.jpg", "50% 50%", "Fotografía de paisajes", "Lente abierto · 98 k vistas"],
    ["paisaje.jpg", "10% 30%", "Un día en el bosque", "Ruta verde · 512 k vistas"],
    ["miniatura-escritorio.jpg", "90% 50%", "HTML desde cero", "Aprende web · 1.4 M de vistas"],
    ["miniatura-fotos.jpg", "20% 70%", "Música para estudiar", "Calma · 3.8 M de vistas"]
  ];
  function paginaSitio(i) {
    if (i === 0) {
      var c = ["#4285f4", "#ea4335", "#fbbc05", "#4285f4", "#34a853", "#ea4335"];
      return "<div class=\"corcho__pg corcho__g\"><div class=\"corcho__g-top\"><span>Gmail</span><span>Imágenes</span><i></i></div><div class=\"corcho__g-logo\">" +
        "Google".split("").map(function (l, j) { return "<b style=\"color:" + c[j] + "\">" + l + "</b>"; }).join("") +
        "</div><div class=\"corcho__g-caja\"><i class=\"corcho__g-lupa\"></i>Buscar en Google</div>" +
        "<div class=\"corcho__g-btns\"><span>Buscar con Google</span><span>Voy a tener suerte</span></div><div class=\"corcho__g-pie\">México</div></div>";
    }
    if (i === 1) {
      return "<div class=\"corcho__pg corcho__w\"><div class=\"corcho__w-top\"><span class=\"corcho__w-logo\">W</span><div class=\"corcho__w-marca\"><b>WIKIPEDIA</b><small>La enciclopedia libre</small></div><span class=\"corcho__w-busca\">Buscar en Wikipedia</span></div>" +
        "<div class=\"corcho__w-art\"><h3>Paisaje</h3><p class=\"corcho__w-de\">De Wikipedia, la enciclopedia libre</p>" +
        "<figure><img src=\"" + IMG + "paisaje.jpg\" alt=\"\"><figcaption>Paisaje de montaña con pinos.</figcaption></figure>" +
        "<p>Un <b>paisaje</b> es la parte de un territorio que se puede ver desde un lugar: montañas, ríos, bosques y también lo que las personas han construido en él.</p>" +
        "<p>La palabra viene del francés <i>paysage</i>, de <i>pays</i>, “país” o “territorio”. Los paisajes se estudian en la <a>geografía</a>, la <a>ecología</a> y el <a>arte</a>.</p></div></div>";
    }
    return "<div class=\"corcho__pg corcho__y\"><div class=\"corcho__y-top\"><span class=\"corcho__y-logo\"><i></i>YouTube</span><span class=\"corcho__y-busca\">Buscar</span></div><div class=\"corcho__y-grid\">" +
      VIDEOS.map(function (v) {
        return "<div class=\"corcho__y-v\"><div class=\"corcho__y-th\" style=\"background-image:url(" + IMG + v[0] + ");background-position:" + v[1] + "\"></div><b>" + v[2] + "</b><small>" + v[3] + "</small></div>";
      }).join("") + "</div></div>";
  }

  /* ---------- La escena ---------- */
  lienzo.innerHTML =
    "<div class=\"corcho__tablero\"></div>" +
    SITIOS.map(function (s, i) {
      return "<div class=\"corcho__foto\" data-foto=\"" + i + "\" style=\"left:" + s.x + "px;top:" + s.y + "px;transform:rotate(" + s.r + "deg)\">" +
        "<span class=\"corcho__tach corcho__tach--foto\"></span><div class=\"corcho__ventana\">" + paginaSitio(i) + "</div>" +
        "<div class=\"corcho__pie\">" + s.dom + "</div></div>";
    }).join("") +
    "<div class=\"corcho__hoja corcho__curso\"><span class=\"corcho__tach corcho__tach--hoja\"></span>" + paginaCurso() + "</div>" +
    "<svg class=\"corcho__hilo\" data-hilo viewBox=\"0 0 640 520\" aria-hidden=\"true\">" +
      "<path data-h1 fill=\"none\" stroke=\"#a3221a\" stroke-width=\"3.4\" stroke-linecap=\"round\"/>" +
      "<path data-h2 fill=\"none\" stroke=\"#e0503e\" stroke-width=\"1.3\" stroke-dasharray=\"3 4\" stroke-linecap=\"round\"/></svg>" +
    "<span class=\"corcho__tach corcho__tach--lk is-azul\" data-tlk aria-hidden=\"true\"></span>";

  var q = function (s) { return lienzo.querySelector(s); };
  var svgHilo = q("[data-hilo]"), h1 = q("[data-h1]"), h2 = q("[data-h2]"), tlk = q("[data-tlk]");

  var vuelta = 0;       // cada cambio cancela lo que estaba pasando
  var ocupado = false;  // mientras se sigue el enlace
  var fin = null;       // dónde está clavado el estambre
  var hoja = null;      // la hoja nueva que se clavó

  function escalar() {
    k = escena.clientWidth / ANCHO;
    lienzo.style.transform = "scale(" + k + ")";
    escena.style.height = Math.round(ALTO * k) + "px";
  }
  /* Un punto de un elemento en coordenadas del lienzo sin escalar */
  function punto(el, fx, fy) {
    var r = el.getBoundingClientRect(), L = lienzo.getBoundingClientRect();
    return { x: (r.left + r.width * fx - L.left) / k, y: (r.top + r.height * fy - L.top) / k };
  }
  function enlace() { return q("[data-lk]"); }
  function inicioHilo() {
    var img = val("cont") === "img";
    var p = punto(enlace(), 1, img ? 0 : 0.5);
    return { x: p.x + (img ? -2 : 11), y: p.y + (img ? 4 : 0) };
  }
  function finHilo() { return punto(q("[data-foto=\"" + estado.href + "\"] .corcho__tach"), 0.5, 0.5); }
  function trazar(A, B, extra) {
    var dx = B.x - A.x, dy = B.y - A.y, dist = Math.sqrt(dx * dx + dy * dy);
    var cx = (A.x + B.x) / 2, cy = (A.y + B.y) / 2 + 28 + dist * 0.12 + (extra || 0);
    var d = "M" + A.x.toFixed(1) + " " + A.y.toFixed(1) + " Q" + cx.toFixed(1) + " " + cy.toFixed(1) + " " + B.x.toFixed(1) + " " + B.y.toFixed(1);
    h1.setAttribute("d", d);
    h2.setAttribute("d", d);
    tlk.style.left = A.x + "px";
    tlk.style.top = A.y + "px";
  }
  function redibujar() { fin = finHilo(); trazar(inicioHilo(), fin); }
  function colorTach(c) { tlk.className = "corcho__tach corcho__tach--lk is-" + c; }
  function estadoTach() { colorTach(visitados[sitio().href] ? "morado" : "azul"); }
  function marcar(animado) {
    var lk = enlace();
    if (!animado || reduce) { lk.classList.add("is-marcado"); return; }
    cuadro().then(function () { lk.classList.add("is-marcado"); });
  }
  function pintarEnlace(animado) {
    q("[data-ej]").innerHTML = enlaceHTML();
    var img = q("[data-ej] img");
    if (img && !img.complete) img.addEventListener("load", function () { if (!ocupado) redibujar(); });
    marcar(animado);
    estadoTach();
  }
  function ocultarHilo(si) {
    svgHilo.style.opacity = si ? "0" : "";
    tlk.style.opacity = si ? "0" : "";
  }
  function quitarHoja() {
    if (!hoja) return;
    var h = hoja;
    hoja = null;
    h.classList.remove("is-cae");
    h.classList.add("is-sale");
    setTimeout(function () { h.remove(); }, 650);
  }
  async function mudarHilo(n) {
    var A = inicioHilo(), B0 = fin || finHilo(), B1 = finHilo();
    await animar(750, function (t) {
      if (n !== vuelta) return;
      var e = suave(t), alza = Math.sin(Math.PI * t);
      trazar(A, { x: B0.x + (B1.x - B0.x) * e, y: B0.y + (B1.y - B0.y) * e - alza * 26 }, alza * 60);
    });
    if (n === vuelta) { fin = B1; trazar(A, fin); }
  }

  /* Seguir el enlace: activo (rojo), la hoja nueva se clava y queda visitado */
  async function seguir(porUsuario) {
    if (ocupado) return;
    var lk = enlace();
    if (!lk) return;
    ocupado = true;
    var n = vuelta, s = sitio(), mismo = val("target") === "_self";
    var ok = await (async function () {
      quitarHoja();
      lk.classList.add("is-activo");
      colorTach("rojo");
      await espera(450); if (n !== vuelta) return false;
      lk.classList.remove("is-activo");
      visitados[s.href] = true;
      lk.classList.add("is-visit");
      var h = document.createElement("div");
      h.className = "corcho__hoja corcho__dest is-cae" + (mismo ? " is-encima" : "");
      h.innerHTML = "<span class=\"corcho__tach corcho__tach--dest\"></span>" + paginaSitio(estado.href);
      lienzo.insertBefore(h, svgHilo);
      hoja = h;
      if (mismo) ocultarHilo(true);
      colorTach("morado");
      await espera(600); if (n !== vuelta) return false;
      if (mismo) {
        // Atrás: la hoja del sitio se quita y vuelve a verse la del curso
        await espera(1800); if (n !== vuelta) return false;
        quitarHoja();
        await espera(450);
        if (n === vuelta) ocultarHilo(false);
      }
      return true;
    })();
    ocupado = false;
    if (ok && porUsuario) GraficoFicha.cambiar(exp, explicacion("clic"));
  }

  lienzo.addEventListener("click", function (e) { if (e.target.closest("[data-lk]")) seguir(true); });
  lienzo.addEventListener("keydown", function (e) {
    if ((e.key === "Enter" || e.key === " ") && e.target.closest("[data-lk]")) { e.preventDefault(); seguir(true); }
  });

  /* ---------- Valores del código: el menú de vidrio ---------- */
  function abrir(b) {
    var c = b.getAttribute("data-k");
    var lista = c === "cont" ? OPCIONES.cont.map(function (x) { return CONT[x]; }) : OPCIONES[c];
    MenuVidrio.abrir(b, {
      dentro: root,
      opciones: MenuVidrio.valores(lista, c === "cont" ? CONT[val(c)] : val(c)),
      alElegir: function (i) { cambiar(c, i); }
    });
  }
  pre.addEventListener("click", function (e) {
    var b = e.target.closest("[data-k]");
    if (b) abrir(b);
  });
  pre.addEventListener("keydown", function (e) {
    var b = e.target.closest(".corcho__largo");
    if (b && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); abrir(b); }
  });

  async function cambiar(c, i) {
    if (estado[c] === i) return;
    estado[c] = i;
    var n = ++vuelta;
    pintarCodigo();
    var b = pre.querySelector("[data-k=\"" + c + "\"]");
    if (b) b.focus({ preventScroll: true });
    GraficoFicha.cambiar(exp, explicacion(c));
    quitarHoja();
    ocultarHilo(false);
    pintarEnlace(c === "cont");
    await cuadro(); if (n !== vuelta) return;
    if (c === "href") mudarHilo(n);
    else redibujar();
    if (c === "target") { await espera(600); if (n === vuelta) seguir(false); }
  }

  /* ---------- Arranque ---------- */
  escalar();
  pintarCodigo();
  pintarEnlace(false);
  GraficoFicha.cambiar(exp, explicacion("inicio"), { inmediato: true });
  if (window.ResizeObserver) {
    new ResizeObserver(function () { escalar(); if (!ocupado) redibujar(); }).observe(escena);
  } else {
    window.addEventListener("resize", function () { escalar(); redibujar(); });
  }
  requestAnimationFrame(redibujar);
  // Con la letra ya cargada el enlace cambia de ancho: el estambre se vuelve a clavar
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { requestAnimationFrame(redibujar); });
})();
