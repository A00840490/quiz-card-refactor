/* Módulo 2-13: enlaces internos en un navegador con el mapa del sitio
   (modulo2-13-navegador.css).
   - El código de la derecha es una página corta: un título con id="inicio",
     un subtítulo con el id que se elija y un enlace al final. href e id se
     cambian con el menú de vidrio compartido (menu-vidrio.js), sin
     descripciones en las opciones.
   - Cada cambio se ve como un viaje: el mouse hace clic en el enlace y
       · con un #, la barra de direcciones agrega el #, la página se recorre
         hasta el elemento con ese id y se marca como en el inspector (si
         ninguno coincide, la página se queda donde está);
       · con una ruta, la selección de la carpeta del sitio pasa por cada
         parte (../ regresa una columna, modulo3/ entra a otra) y el
         navegador abre la página nueva.
     El enlace de la página y la flecha de regresar también funcionan.
   - La escena se dibuja en un lienzo de 640 × 569 px y se escala.
   - La explicación va en la ficha de renglones (GraficoFicha.cambiar). */
(function () {
  "use strict";

  var root = document.querySelector("[data-enlaces]");
  if (!root) return;

  var esc = Curso.esc;
  var reduce = Curso.reduce;
  var RUTA = Curso.ruta();

  var escena = root.querySelector("[data-escena]");
  var lienzo = root.querySelector("[data-lienzo]");
  var pre = root.querySelector("[data-code]");
  var exp = root.querySelector("[data-status]");

  var ANCHO = 640, ALTO = 569;

  var OPCIONES = {
    href: ["#inicio", "#ejemplos", "modulo2-12.html", "../modulo3/modulo3-1.html"],
    id: ["ejemplos", "ejemplo", "inicio"]
  };
  var estado = { href: 0, id: 0 };
  function val(k) { return OPCIONES[k][estado[k]]; }

  function espera(ms) { return new Promise(function (r) { setTimeout(r, reduce ? 0 : ms); }); }
  function cuadro() { return new Promise(function (r) { requestAnimationFrame(function () { requestAnimationFrame(r); }); }); }
  function limitar(v, a, b) { return Math.max(a, Math.min(b, v)); }

  /* A dónde lleva el enlace con los valores actuales */
  function destino() {
    var href = val("href");
    if (href.charAt(0) === "#") {
      var nombre = href.slice(1), el = null;
      [["h1", "inicio"], ["h2", val("id")]].forEach(function (x) { if (!el && x[1] === nombre) el = x[0]; });
      return { tipo: "id", nombre: nombre, el: el, repetido: val("id") === "inicio" };
    }
    return { tipo: "archivo", archivo: href.split("/").pop() };
  }

  // Las partes de la ruta: "../modulo3/modulo3-1.html" → ["../", "modulo3/", "modulo3-1.html"]
  function pasos() {
    var href = val("href");
    if (href.charAt(0) === "#") return [href];
    var p = href.split("/");
    return p.map(function (x, i) { return i < p.length - 1 ? x + "/" : x; });
  }

  /* ---------- Código ---------- */
  function pintarCodigo() {
    var t = function (n) { return "<span class=\"codetag\">" + n + "</span>"; };
    var x = function (s) { return "<span class=\"codetext\">" + s + "</span>"; };
    var lineas = [
      "&lt;" + t("h1") + " id=\"inicio\"&gt;" + x("Enlaces Internos") + "&lt;/" + t("h1") + "&gt;",
      "&lt;" + t("p") + "&gt;" + x("Sirven para navegar…") + "&lt;/" + t("p") + "&gt;",
      "&lt;" + t("h2") + " id=\"" + MenuVidrio.boton(val("id"), "id", " data-k=\"id\"") + "\"&gt;" + x("Ejemplos") + "&lt;/" + t("h2") + "&gt;",
      "&lt;" + t("p") + "&gt;" + x("El enlace de abajo…") + "&lt;/" + t("p") + "&gt;",
      "&lt;" + t("a") + " href=\"" + MenuVidrio.boton(val("href"), "href", " data-k=\"href\"") + "\"&gt;",
      "  " + x("Llévame allá"),
      "&lt;/" + t("a") + "&gt;"
    ];
    pre.innerHTML = lineas.map(function (l) { return "<span class=\"ld-line\">" + l + "</span>"; }).join("");
  }

  /* ---------- Explicación ---------- */
  function explicacion(k) {
    var d = destino();
    if (d.tipo === "archivo" && k === "id") {
      return "<code>id</code> le da un nombre único al subtítulo para que un enlace con <code>#</code> lo encuentre. Este enlace lleva a otro archivo, así que no lo usa.";
    }
    if (d.tipo === "id") {
      var base = "El <code>#</code> de <code>href</code> dice que el destino está en esta misma página: el navegador busca el elemento con <code>id=\"" + d.nombre + "\"</code>";
      if (d.nombre === "inicio" && d.repetido) return base + ". Aquí hay dos, pero un <code>id</code> debe ser único; el navegador se queda con el primero, el título.";
      if (d.el === "h1") return base + ", el título, y se desplaza hasta él sin cambiar de página.";
      if (d.el === "h2") return base + ", el subtítulo Ejemplos, y se desplaza hasta él sin cambiar de página.";
      if (val("id") === "ejemplo") {
        return "<code>href=\"#ejemplos\"</code> busca el elemento con <code>id=\"ejemplos\"</code>, pero el subtítulo dice <code>id=\"ejemplo\"</code>, sin s. Como ninguno coincide, el enlace no lleva a ningún lado y la página se queda donde está.";
      }
      return "<code>href=\"#ejemplos\"</code> busca el elemento con <code>id=\"ejemplos\"</code>, pero ya no hay ninguno: el subtítulo ahora dice <code>id=\"inicio\"</code>. El enlace no lleva a ningún lado y la página se queda donde está.";
    }
    if (d.archivo === "modulo2-12.html") {
      return "<code>href</code> lleva la ruta a otro archivo del mismo sitio. modulo2-12.html está en la misma carpeta que esta página, modulo2, así que basta con su nombre: el navegador abre la página de Enlaces.";
    }
    return "<code>href</code> lleva la ruta a otro archivo del mismo sitio. <code>..</code> sale de la carpeta modulo2 a la de arriba, html; <code>modulo3/</code> entra a la carpeta del módulo 3, y ahí está modulo3-1.html, la primera página de CSS.";
  }

  /* ---------- Las páginas del sitio en miniatura ---------- */
  var PAG = {
    "modulo2-12.html": { carpeta: "modulo2", tit: "Enlaces" },
    "modulo2-13.html": { carpeta: "modulo2", tit: "Enlaces Internos" },
    "modulo3-1.html": { carpeta: "modulo3", tit: "Decorando con CSS" }
  };
  var CONTENIDO = {
    "modulo2-13.html":
      "<h1 data-el=\"h1\"><span class=\"enl__mp-badge\">Tema 12</span>Enlaces Internos</h1>" +
      "<p>Sirven para navegar por el contenido de un mismo sitio: a otra de sus páginas o a otra parte de la página en la que estás.</p>" +
      "<h2 data-el=\"h2\">Ejemplos</h2>" +
      "<p>El enlace de abajo cambia según su <i>href</i>: una ruta a otro archivo o un # con el id de un elemento.</p>" +
      "<p class=\"enl__mp-enl\"><a data-enlace role=\"button\" tabindex=\"0\">Llévame allá</a></p>",
    "modulo2-12.html":
      "<h1><span class=\"enl__mp-badge\">Tema 11</span>Enlaces</h1>" +
      "<p>Los enlaces o hipervínculos son elementos muy comunes en todas las páginas web. Nos permiten navegar a través de todo el contenido de nuestro sitio y hacia páginas ajenas a las nuestras.</p>" +
      "<h2>Enlaces a Páginas Externas</h2>" +
      "<p class=\"enl__mp-enl\"><a>¡Este enlace te lleva a Google!</a></p>",
    "modulo3-1.html":
      "<h1>Módulo 3 - Decorando con CSS</h1>" +
      "<p><span class=\"enl__mp-badge\">Introducción</span></p>" +
      "<p>Con el ejercicio del módulo anterior construimos una página web bastante sencilla utilizando solo HTML, pero esa página no se ve del todo bien, o al menos no se ve como una página web moderna.</p>"
  };
  function paginaHTML(clave) {
    var n = +clave.match(/-(\d+)\.html$/)[1], nums = [];
    for (var i = Math.max(1, n - 2); i <= n + 1; i++) nums.push("<span" + (i === n ? " class=\"is-on\"" : "") + ">" + i + "</span>");
    return "<div class=\"enl__mp\">" +
      "<div class=\"enl__mp-head\"><img src=\"" + RUTA + "assets/images/logo/logo-white.png\" alt=\"\"></div>" +
      "<div class=\"enl__mp-card\">" + CONTENIDO[clave] + "</div>" +
      "<div class=\"enl__mp-foot\"><div class=\"enl__mp-pags\"><span>Atrás</span>" + nums.join("") + "<span>Siguiente</span></div>" +
      "<div class=\"enl__mp-prog\">Tu Progreso<i></i></div></div>" +
      "<div class=\"enl__mp-legal\">Se prohíbe la reproducción total o parcial sin previo y expreso consentimiento por escrito.</div>" +
      "</div>";
  }

  /* ---------- El navegador y la carpeta ---------- */
  var ICO = {
    carpeta: "<svg viewBox=\"0 0 20 16\" aria-hidden=\"true\"><path d=\"M1 3.2C1 2 2 1 3.2 1h4.3l1.9 2h7.4C18 3 19 4 19 5.2v7.6c0 1.2-1 2.2-2.2 2.2H3.2C2 15 1 14 1 12.8z\" fill=\"#3d97e6\"/><path d=\"M1 6.2C1 5.5 1.5 5 2.2 5h15.6c.7 0 1.2.5 1.2 1.2v6.6c0 1.2-1 2.2-2.2 2.2H3.2C2 15 1 14 1 12.8z\" fill=\"#6cb8f5\"/></svg>",
    html: "<svg viewBox=\"0 0 16 20\" aria-hidden=\"true\"><path d=\"M2.5 1h7.2L14 5.3V18a1 1 0 0 1-1 1H2.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z\" fill=\"#ffffff\" stroke=\"#aeb5c0\"/><path d=\"M9.7 1v4.3H14\" fill=\"#eef1f5\" stroke=\"#aeb5c0\" stroke-linejoin=\"round\"/><rect x=\"3.4\" y=\"11.6\" width=\"8.6\" height=\"4.8\" rx=\"1\" fill=\"#e44d26\"/></svg>",
    disco: "<svg viewBox=\"0 0 20 16\" aria-hidden=\"true\"><rect x=\"1\" y=\"3\" width=\"18\" height=\"10\" rx=\"2\" fill=\"#a7adb7\"/><rect x=\"1\" y=\"3\" width=\"18\" height=\"5\" rx=\"2\" fill=\"#c3c8d0\"/><circle cx=\"15.5\" cy=\"10.5\" r=\"1\" fill=\"#5d6470\"/></svg>",
    atras: "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M20 11H7.8l5.6-5.6L12 4l-8 8 8 8 1.4-1.4L7.8 13H20z\" fill=\"currentColor\"/></svg>",
    adelante: "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M4 11h12.2l-5.6-5.6L12 4l8 8-8 8-1.4-1.4 5.6-5.6H4z\" fill=\"currentColor\"/></svg>",
    recargar: "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M17.6 6.4A8 8 0 1 0 19.7 14h-2.1a6 6 0 1 1-1.4-6.2L13 11h7V4z\" fill=\"currentColor\"/></svg>",
    info: "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 15h-2v-6h2zm0-8h-2V7h2z\" fill=\"currentColor\"/></svg>",
    cerrar: "<svg viewBox=\"0 0 10 10\" aria-hidden=\"true\"><path d=\"M1 1l8 8M9 1L1 9\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\"/></svg>",
    mano: "<svg viewBox=\"0 0 24 28\" aria-hidden=\"true\"><path d=\"M9 2.5c-1.1 0-2 .9-2 2V15l-1.3-1.4c-.8-.9-2.2-1-3.1-.2-.8.7-.9 1.9-.3 2.8l4.3 6.4c1.2 1.8 3.2 2.9 5.4 2.9h2.6c3.4 0 6.1-2.7 6.1-6.1v-5.6c0-1.1-.9-2-2-2-.4 0-.7.1-1 .3-.2-.9-1-1.6-2-1.6-.5 0-.9.2-1.3.4-.3-.8-1-1.4-1.9-1.4-.4 0-.8.1-1.1.3V4.5c0-1.1-.9-2-2-2z\" fill=\"#ffffff\" stroke=\"#000000\" stroke-width=\"1.3\" stroke-linejoin=\"round\"/><path d=\"M13.2 12.6v5M16.1 13.2v4.4M19 14.2v3.4\" stroke=\"#000000\" stroke-width=\"1.1\" stroke-linecap=\"round\"/></svg>"
  };
  var ARBOL = {
    raiz: [["c", "html"], ["f", "index.html"]],
    html: [["c", "modulo1"], ["c", "modulo2"], ["c", "modulo3"]],
    modulo2: [["f", "modulo2-11.html"], ["f", "modulo2-12.html"], ["f", "modulo2-13.html"], ["f", "modulo2-14.html"]],
    modulo3: [["f", "modulo3-1.html"], ["f", "modulo3-2.html"], ["f", "modulo3-3.html"], ["f", "modulo3-4.html"]]
  };

  lienzo.innerHTML =
    "<div class=\"enl__win\">" +
      "<div class=\"enl__tabs\"><span class=\"enl__luces\"><i></i><i></i><i></i></span>" +
        "<div class=\"enl__tab\"><img src=\"" + RUTA + "assets/images/logo/favicon.png\" alt=\"\"><span class=\"enl__tit\" data-tit></span><span class=\"enl__x\">" + ICO.cerrar + "</span></div></div>" +
      "<div class=\"enl__barra\"><button type=\"button\" class=\"enl__btn\" data-atras disabled aria-label=\"Regresar\">" + ICO.atras + "</button>" +
        "<span class=\"enl__btn enl__btn--off\">" + ICO.adelante + "</span><span class=\"enl__btn\">" + ICO.recargar + "</span>" +
        "<div class=\"enl__url\">" + ICO.info + "<span data-url></span></div></div>" +
      "<div class=\"enl__carga\" data-carga></div>" +
      "<div class=\"enl__vista\" data-vista><div class=\"enl__pag\" data-pag></div><div class=\"enl__marca\" data-marca><span></span></div>" +
        "<div class=\"enl__aviso\" data-aviso></div><div class=\"enl__cursor\" data-cursor>" + ICO.mano + "</div></div>" +
    "</div>" +
    "<div class=\"enl__finder\">" +
      "<div class=\"enl__ftit\"><span class=\"enl__luces\"><i></i><i></i><i></i></span><span>programacion_web</span></div>" +
      "<div class=\"enl__cols\"><div class=\"enl__col\"></div><div class=\"enl__col\"></div><div class=\"enl__col\"></div></div>" +
      "<div class=\"enl__path\" data-path></div>" +
    "</div>";

  var q = function (s) { return lienzo.querySelector(s); };
  var pag = q("[data-pag]"), vista = q("[data-vista]"), url = q("[data-url]"), tit = q("[data-tit]"), carga = q("[data-carga]");
  var marca = q("[data-marca]"), aviso = q("[data-aviso]"), cursor = q("[data-cursor]"), atras = q("[data-atras]");
  var cols = lienzo.querySelectorAll(".enl__col"), path = q("[data-path]");

  var vuelta = 0;          // cada viaje nuevo cancela el anterior
  var pagina = null;       // la página que muestra el navegador
  var y = 0;               // cuánto está recorrida la página
  var sel = null;          // la selección de la carpeta

  function escalar() {
    var k = escena.clientWidth / ANCHO;
    lienzo.style.transform = "scale(" + k + ")";
    escena.style.height = Math.round(ALTO * k) + "px";
  }

  function ponerPagina(clave) {
    pag.innerHTML = paginaHTML(clave);
    pagina = clave;
    tit.textContent = PAG[clave].tit + " | CVA";
  }
  function maxY() { return Math.max(0, pag.offsetHeight - vista.clientHeight); }
  function recorrer(nuevo, animado) {
    pag.classList.toggle("is-desliza", !!animado && !reduce);
    pag.style.transform = "translateY(" + (-nuevo) + "px)";
    y = nuevo;
  }
  function enlace() { return pag.querySelector("[data-enlace]"); }
  function yInicial() { return limitar(enlace().offsetTop - 70, 0, maxY()); }
  function ponerCursor() {
    var a = enlace();
    if (!a) return;
    cursor.style.left = (a.offsetLeft + a.offsetWidth * 0.55) + "px";
    cursor.style.top = (a.offsetTop - y + a.offsetHeight * 0.55) + "px";
  }
  function ponerUrl(clave, hash, nuevo) {
    url.innerHTML = "<span class=\"enl__gris\">programacion_web/html/" + PAG[clave].carpeta + "/</span>" +
      "<span" + (nuevo && !hash ? " class=\"is-nuevo\"" : "") + ">" + clave + "</span>" +
      (hash ? "<span class=\"enl__hash" + (nuevo ? " is-nuevo" : "") + "\">" + esc(hash) + "</span>" : "");
  }

  function filas(lista, elegido, clase) {
    return (lista || []).map(function (it) {
      return "<div class=\"enl__fila" + (it[1] === elegido ? " is-" + clase : "") + "\">" + (it[0] === "c" ? ICO.carpeta : ICO.html) +
        "<span>" + it[1] + "</span>" + (it[0] === "c" ? "<span class=\"enl__flecha\">›</span>" : "") + "</div>";
    }).join("");
  }
  function pintarCarpeta(cambiaTercera) {
    cols[0].innerHTML = filas(ARBOL.raiz, "html", sel.activa === 1 ? "sel" : "sel2");
    cols[1].innerHTML = filas(ARBOL.html, sel.c2, sel.activa === 2 ? "sel" : "sel2");
    var tercera = filas(sel.c2 ? ARBOL[sel.c2] : null, sel.c3, "sel");
    if (cambiaTercera && !reduce) {
      cols[2].classList.add("is-cambia");
      setTimeout(function () { cols[2].innerHTML = tercera; cols[2].classList.remove("is-cambia"); }, 220);
    } else cols[2].innerHTML = tercera;
    var partes = [[ICO.disco, "programacion_web"], [ICO.carpeta, "html"]];
    if (sel.c2) partes.push([ICO.carpeta, sel.c2]);
    if (sel.c3) partes.push([ICO.html, sel.c3]);
    path.innerHTML = partes.map(function (p) { return "<span>" + p[0] + p[1] + "</span>"; }).join("<i class=\"enl__sep\">›</i>");
  }
  function marcar(el, nombre) {
    marca.style.left = (el.offsetLeft - 3) + "px";
    marca.style.top = (el.offsetTop - y - 2) + "px";
    marca.style.width = (el.offsetWidth + 6) + "px";
    marca.style.height = (el.offsetHeight + 4) + "px";
    var et = marca.firstChild;
    et.innerHTML = "<b>" + el.tagName.toLowerCase() + "</b><em>#" + esc(nombre) + "</em>";
    et.style.top = (el.offsetTop - y < 34) ? (el.offsetHeight + 10) + "px" : "-27px";
    marca.classList.add("is-on");
  }

  // Regresa a la página del ejemplo, con el enlace a la vista
  async function regresar(n) {
    marca.classList.remove("is-on");
    aviso.classList.remove("is-on");
    carga.style.transition = "none";
    carga.style.opacity = "0";
    if (pagina !== "modulo2-13.html") {
      if (pagina) {
        pag.classList.add("is-fuera");
        await espera(250);
        if (n !== vuelta) return false;
      }
      ponerPagina("modulo2-13.html");
      recorrer(yInicial(), false);
      pag.classList.remove("is-fuera");
    } else if (Math.abs(y - yInicial()) > 2) {
      recorrer(yInicial(), true);
      await espera(700);
      if (n !== vuelta) return false;
    }
    ponerUrl("modulo2-13.html", "");
    sel = { c2: "modulo2", c3: "modulo2-13.html", activa: 3 };
    pintarCarpeta(false);
    ponerCursor();
    cursor.classList.remove("is-oculto");
    atras.disabled = true;
    return true;
  }

  async function viajar() {
    var n = ++vuelta, d = destino();
    if (!(await regresar(n))) return;
    await espera(500);
    if (n !== vuelta) return;
    cursor.classList.add("is-clic");
    await espera(220);
    cursor.classList.remove("is-clic");
    if (n !== vuelta) return;

    if (d.tipo === "id") {
      ponerUrl("modulo2-13.html", val("href"), true);
      await espera(350);
      if (n !== vuelta) return;
      if (!d.el) {
        aviso.innerHTML = "Ningún elemento tiene <code>id=\"" + esc(d.nombre) + "\"</code>";
        aviso.classList.add("is-on");
        return;
      }
      var el = pag.querySelector("[data-el=\"" + d.el + "\"]");
      recorrer(limitar(el.offsetTop - 14, 0, maxY()), true);
      await espera(900);
      if (n !== vuelta) return;
      ponerCursor();
      marcar(el, d.nombre);
      atras.disabled = false;
      return;
    }

    // La selección pasa por cada parte de la ruta
    var p = pasos();
    for (var i = 0; i < p.length; i++) {
      if (p[i] === "../") { sel = { c2: null, c3: null, activa: 1 }; pintarCarpeta(true); }
      else if (p[i].slice(-1) === "/") { sel = { c2: p[i].slice(0, -1), c3: null, activa: 2 }; pintarCarpeta(true); }
      else { sel.c3 = p[i]; sel.activa = 3; pintarCarpeta(false); }
      await espera(i === p.length - 1 ? 650 : 900);
      if (n !== vuelta) return;
    }

    // El navegador abre la página nueva
    cursor.classList.add("is-oculto");
    carga.style.transition = "none";
    carga.style.width = "0";
    carga.style.opacity = "1";
    await cuadro();
    carga.style.transition = "width .55s ease";
    carga.style.width = "80%";
    await espera(450);
    if (n !== vuelta) return;
    pag.classList.add("is-fuera");
    await espera(250);
    if (n !== vuelta) return;
    ponerPagina(d.archivo);
    recorrer(0, false);
    ponerUrl(d.archivo, "", true);
    pag.classList.remove("is-fuera");
    carga.style.transition = "width .2s ease, opacity .3s ease .2s";
    carga.style.width = "100%";
    carga.style.opacity = "0";
    atras.disabled = false;
  }

  atras.addEventListener("click", function () { regresar(++vuelta); });
  pag.addEventListener("click", function (e) {
    if (e.target.closest("[data-enlace]") && pagina === "modulo2-13.html") viajar();
  });
  pag.addEventListener("keydown", function (e) {
    if ((e.key === "Enter" || e.key === " ") && e.target.closest("[data-enlace]")) { e.preventDefault(); viajar(); }
  });

  /* ---------- Valores del código: el menú de vidrio ---------- */
  pre.addEventListener("click", function (e) {
    var b = e.target.closest("[data-k]");
    if (!b) return;
    var k = b.getAttribute("data-k");
    MenuVidrio.abrir(b, {
      dentro: root,
      opciones: MenuVidrio.valores(OPCIONES[k], val(k)),
      alElegir: function (i) { cambiar(k, i); }
    });
  });

  function cambiar(k, i) {
    if (estado[k] === i) return;
    estado[k] = i;
    pintarCodigo();
    var b = pre.querySelector("[data-k=\"" + k + "\"]");
    if (b) b.focus({ preventScroll: true });
    GraficoFicha.cambiar(exp, explicacion(k));
    // Un id nuevo no cambia nada si el enlace lleva a otro archivo
    if (k === "id" && val("href").charAt(0) !== "#") return;
    viajar();
  }

  /* ---------- Arranque ---------- */
  escalar();
  if (window.ResizeObserver) new ResizeObserver(escalar).observe(escena);
  else window.addEventListener("resize", escalar);

  pintarCodigo();
  ponerPagina("modulo2-13.html");
  recorrer(yInicial(), false);
  regresar(++vuelta);
  GraficoFicha.cambiar(exp, explicacion("href"), { inmediato: true });

  // El primer viaje, cuando el gráfico aparece en pantalla
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (ents) {
      if (ents.some(function (x) { return x.isIntersecting; })) { io.disconnect(); viajar(); }
    }, { threshold: 0.45 });
    io.observe(escena);
  } else viajar();
})();
