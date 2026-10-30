/* Demos del curso armados desde el HTML, sin un archivo JS por página.
   Se ven como los demás demos (.lesson-demo de lesson-demo.css): el código a
   la izquierda y la previsualización del navegador a la derecha, en una sola
   tarjeta. Los valores con flecha abren el menú de vidrio (menu-vidrio.js);
   al elegir, el código se vuelve a pintar y la previsualización cambia en el
   momento (lo que cambia de lugar se desliza).

   Marcado:
     <div data-demo data-archivo="estilos.css">
       <script type="text/x-codigo">
         .caja {
           float: {{ left | *right | none }};
         }
       </script>
       <script type="text/x-codigo" data-parte="html"><div class="caja">Caja</div></script>
       <script type="text/x-codigo" data-parte="base">.caja { font-weight: 700 }</script>
     </div>

   - El código se escribe tal cual (sin &lt;) y con la sangría que se quiera.
     Se colorea solo: la etiqueta o el selector va en .codetag y el texto o
     el valor en .codetext.
   - {{ a | *b | c }}  valor con menú; empieza en el marcado con * (o en el primero)
     {{ @lista b }}    usa una lista de data-listas y empieza en b
     El nombre del menú sale de lo que va antes: "float:" -> float,
     class="..." -> class, un selector -> selector.
   - data-archivo  nombre en la barra del editor. Si termina en .css, el código
                   es la hoja de estilos del bloque data-parte="html"; si no, el
                   código es la página completa, con su <style>.
     data-alto     alto fijo de la previsualización (con barra para desplazarse);
                   si no se da, mide lo que su contenido
     data-ancho    arriba de la previsualización se dice cuánto mide de ancho
     data-listas   listas de opciones que se repiten, en JSON: {"pos": ["static", ...]}
     data-scroll="no"  sin el scroll automático de los códigos largos
     data-parte="base" CSS de la previsualización que no se muestra en el código
   - Cada cambio dispara "demo:cambio" en el contenedor con { nombre, valor }. */
(function ($) {
  "use strict";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var VALOR = ""; // marca de cada valor con menú mientras se colorea el código

  // Estilo de la previsualización que no forma parte del ejemplo: la letra del
  // curso y transiciones para que los cambios se vean pasar
  var BASE = "html{font-family:Lato,Arial,sans-serif;color:#172033;font-size:16px;line-height:1.5}" +
    "body{margin:0}h1,h2,h3{line-height:1.25;margin:0 0 .5em}p{margin:0 0 .75em}" +
    (reduce ? "" : "body *{transition:width .4s ease,height .4s ease,min-width .4s ease,max-width .4s ease,margin .4s ease,padding .4s ease,top .4s ease,left .4s ease,right .4s ease,bottom .4s ease,color .4s ease,background-color .4s ease,font-size .4s ease,border-width .4s ease}");

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /* ---------- Lectura del HTML ---------- */

  // Cambia cada {{ ... }} por la marca VALOR y devuelve sus opciones en orden
  function leerValores(lineas, listas) {
    var valores = [];
    var codigo = lineas.map(function (l) {
      return l.replace(/\{\{([^}]*)\}\}/g, function (_, dentro, pos) {
        var opciones, inicial = 0, lista = dentro.trim().match(/^@([\w-]+)\s*(.*)$/);
        if (lista) {
          opciones = (listas && listas[lista[1]]) || [];
          inicial = Math.max(0, opciones.indexOf(lista[2].trim()));
        } else {
          opciones = dentro.split("|").map(function (o, i) {
            o = o.trim();
            if (o.charAt(0) === "*") { inicial = i; o = o.slice(1).trim(); }
            return o;
          });
        }
        valores.push({ opciones: opciones, actual: opciones[inicial], nombre: nombreDe(l.slice(0, pos).replace(/\{\{[^}]*\}\}/g, "x"), l.slice(pos + _.length)) });
        return VALOR;
      });
    });
    return { codigo: codigo, valores: valores };
  }

  // "float: " -> float; class=" -> class; lo que va antes de { -> selector
  function nombreDe(antes, despues) {
    var m = antes.match(/([\w-]+)\s*:\s*[^:;{}]*$/) || antes.match(/([\w-]+)\s*=\s*"[^"]*$/);
    if (m) return m[1];
    return /^[^{}]*\{/.test(despues) ? "selector" : "valor";
  }

  /* ---------- Colores del código: los de codigo.js ---------- */
  function limpiar(texto) { return Codigo.limpiar(texto); }
  function colorear(lineas, esCss) { return Codigo.colorear(lineas, esCss ? "css" : "html", VALOR); }

  /* ---------- Demo ---------- */
  function crear(root) {
    var $root = $(root);
    var opciones = $root.data();
    var $bloques = $root.children("script[type=\"text/x-codigo\"]");
    function parte(nombre) {
      var b = $bloques.filter(nombre ? "[data-parte=\"" + nombre + "\"]" : ":not([data-parte])");
      return b.length ? limpiar(b.text()).join("\n") : "";
    }

    var archivo = opciones.archivo || "index.html";
    var esCss = /\.css$/i.test(archivo);
    var leido = leerValores(limpiar($bloques.filter(":not([data-parte])").text()), opciones.listas);
    var valores = leido.valores;
    var pedazos = colorear(leido.codigo, esCss);
    var htmlVista = parte("html");
    var base = parte("base");
    var alto = +opciones.alto || 0;
    var conAncho = root.hasAttribute("data-ancho") && opciones.ancho !== false;

    // Cada valor sabe qué número le toca, en el orden en que aparece
    var k = 0;
    pedazos.forEach(function (linea) {
      linea.forEach(function (pd) { if (pd.tipo === "valor") pd.k = k++; });
    });

    /* ---------- Estructura: la misma fila .lesson-demo de los otros demos ---------- */
    $root.addClass("demo").html(
      "<div class=\"row lesson-demo\">" +
        "<div class=\"col-lg-6 col-md-6 col-sm-12 col-xs-12 demo__editor\"><pre class=\"code code--numbered\"></pre></div>" +
        "<div class=\"col-lg-6 col-md-6 col-sm-12 col-xs-12 demo__vista\">" +
          "<p class=\"demo__ancho\" hidden></p>" +
          "<iframe class=\"demo__marco\" title=\"Previsualización del ejemplo\" loading=\"lazy\"></iframe>" +
        "</div>" +
      "</div>"
    );

    var fila = root.querySelector(".lesson-demo");
    var editor = root.querySelector(".demo__editor");
    var pre = root.querySelector("pre");
    var marco = root.querySelector("iframe");
    var anchoEl = root.querySelector(".demo__ancho");
    editor.setAttribute("data-archivo", archivo);

    // El código sin colores, con los valores actuales: lo que se aplica a la previsualización
    function texto(linea) {
      return linea.map(function (pd) { return pd.tipo === "valor" ? valores[pd.k].actual : pd.t; }).join("");
    }

    // La línea más larga decide el tamaño de la letra (cada menú ocupa unos 3 caracteres más)
    var cols = 0;
    pedazos.forEach(function (linea) {
      var menus = linea.filter(function (pd) { return pd.tipo === "valor"; }).length;
      cols = Math.max(cols, texto(linea).length + 3 * menus);
    });
    editor.style.setProperty("--cols", Math.max(cols, 30));

    /* ---------- Código ---------- */
    // Mismo formato que los bloques de código del curso (lesson-demo.css): cada línea es
    // un .ld-line, que el CSS numera
    function pintarCodigo() {
      pre.innerHTML = pedazos.map(function (linea) {
        var h = linea.map(function (pd) {
          if (pd.tipo === "valor") return MenuVidrio.boton(valores[pd.k].actual, valores[pd.k].nombre, " data-k=\"" + pd.k + "\"");
          if (pd.tipo === "tag") return "<span class=\"codetag\">" + esc(pd.t) + "</span>";
          if (pd.tipo === "text") return "<span class=\"codetext\">" + esc(pd.t) + "</span>";
          return esc(pd.t);
        }).join("");
        return "<span class=\"ld-line\">" + (h || "&nbsp;") + "</span>";
      }).join("");
    }

    /* ---------- Previsualización ---------- */
    var doc = null, estilo = null, htmlActual = null;

    function partes() {
      var todo = pedazos.map(texto).join("\n");
      if (esCss) return { css: todo, html: htmlVista };
      var m = todo.match(/<style>([\s\S]*?)<\/style>/);
      return { css: m ? m[1] : "", html: todo.replace(/<style>[\s\S]*?<\/style>/, "") };
    }

    function aplicar() {
      if (!doc) return;
      var p = partes();
      estilo.textContent = p.css;
      if (p.html !== htmlActual) {
        doc.body.innerHTML = p.html;
        htmlActual = p.html;
      }
    }

    // Lo que cambia de lugar se desliza desde donde estaba. Lo que cambia de
    // tamaño, color o margen lo hacen las transiciones de BASE.
    function mover(cambio) {
      if (!doc || reduce || !Element.prototype.animate) { cambio(); return; }
      var antes = Array.prototype.map.call(doc.body.querySelectorAll("*"), function (el) { return el.getBoundingClientRect(); });
      cambio();
      var els = doc.body.querySelectorAll("*");
      if (els.length !== antes.length) return;
      var deltas = Array.prototype.map.call(els, function (el, i) {
        var b = el.getBoundingClientRect();
        return { x: antes[i].left - b.left, y: antes[i].top - b.top };
      });
      Array.prototype.forEach.call(els, function (el, i) {
        // El padre ya mueve a sus hijos: cada uno se mueve solo lo que le toca a él
        var d = deltas[i], j = Array.prototype.indexOf.call(els, el.parentElement);
        var dx = d.x - (j >= 0 ? deltas[j].x : 0), dy = d.y - (j >= 0 ? deltas[j].y : 0);
        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
        el.animate([
          { transform: "translate(" + dx + "px, " + dy + "px)" },
          { transform: "none" }
        ], { duration: 450, easing: "cubic-bezier(.2,.7,.2,1)" });
      });
    }

    // La previsualización mide lo que su contenido (salvo que tenga alto fijo)
    function medir() {
      if (!doc) return;
      if (alto) {
        marco.style.height = alto + "px";
        return;
      }
      var fondo = doc.body.getBoundingClientRect().bottom;
      Array.prototype.forEach.call(doc.body.querySelectorAll("*"), function (el) {
        fondo = Math.max(fondo, el.getBoundingClientRect().bottom);
      });
      var h = Math.ceil(fondo + (doc.defaultView.scrollY || 0));
      if (Math.abs(h - (marco._h || 0)) > 1) {
        marco._h = h;
        marco.style.height = h + "px";
      }
    }

    function pintarAncho() {
      if (!conAncho || !doc) return;
      anchoEl.hidden = false;
      anchoEl.innerHTML = "Ancho de la ventana: <b>" + doc.documentElement.clientWidth + "px</b>";
    }

    /* ---------- Menú ---------- */
    // Si el menú abierto es de este demo, se cierra (al desplazarse el código, el valor se mueve)
    function cerrarMenu() {
      if (pre.querySelector(".is-abierta")) MenuVidrio.cerrar();
    }

    $(pre).on("click", ".menu-vidrio__valor", function () {
      var n = +this.getAttribute("data-k");
      MenuVidrio.abrir(this, {
        dentro: root,
        opciones: MenuVidrio.valores(valores[n].opciones, valores[n].actual),
        alElegir: function (i) { cambiarValor(n, i); }
      });
    });

    function cambiarValor(n, i) {
      valores[n].actual = valores[n].opciones[i];
      mover(aplicar);
      pintarCodigo();
      medir();
      var b = pre.querySelector("[data-k=\"" + n + "\"]");
      if (b) b.focus({ preventScroll: true });
      $root.trigger("demo:cambio", [{ nombre: valores[n].nombre, valor: valores[n].actual }]);
    }

    pre.addEventListener("scroll", cerrarMenu);

    /* ---------- Inicio ---------- */
    pintarCodigo();
    // Si el código es largo, el editor se corta y se desplaza solo, como en los
    // otros demos (.lesson-demo--scroll; lo mueve lesson-demo.js)
    var largo = pre.scrollHeight > (window.matchMedia("(max-width: 767px)").matches ? 360 : 440) + 40;
    if (largo && opciones.scroll !== "no") {
      fila.classList.add("lesson-demo--scroll");
      if (window.LessonDemo) LessonDemo.desplazar(fila);
    }
    marco.addEventListener("load", function () {
      doc = marco.contentDocument;
      if (!doc) return;
      doc.head.innerHTML = "<meta charset=\"utf-8\"><base target=\"_blank\">" +
        "<link rel=\"stylesheet\" href=\"https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap\">" +
        "<style>" + BASE + base + "</style><style data-ejemplo></style>";
      estilo = doc.querySelector("[data-ejemplo]");
      aplicar();
      medir();
      pintarAncho();
      var win = doc.defaultView;
      if (win.ResizeObserver) new win.ResizeObserver(function () { medir(); pintarAncho(); }).observe(doc.body);
      doc.addEventListener("transitionend", medir);
      // Los enlaces vacíos y los formularios del ejemplo no sacan de la página a la previsualización
      doc.addEventListener("click", function (e) {
        var link = e.target.closest && e.target.closest("a");
        if (link && /^#?$/.test(link.getAttribute("href") || "")) e.preventDefault();
      });
      doc.addEventListener("submit", function (e) { e.preventDefault(); });
      if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(medir);
      if (window.ResizeObserver) {
        new ResizeObserver(function () { pintarAncho(); cerrarMenu(); }).observe(marco);
      }
    });
    marco.srcdoc = "<!DOCTYPE html><html lang=\"es\"><head></head><body></body></html>";
  }

  $.fn.demo = function () {
    return this.each(function () {
      if ($.data(this, "demoListo")) return;
      $.data(this, "demoListo", true);
      crear(this);
    });
  };

  $(function () {
    $("[data-demo]").demo();
  });
})(jQuery);
