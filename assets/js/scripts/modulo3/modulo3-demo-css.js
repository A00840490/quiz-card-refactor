/* Demos de CSS del módulo 3 (antes eran CodePens). Se ven igual que los
   demás demos del curso (.lesson-demo de lesson-demo.css): el código a la
   izquierda y la previsualización del navegador a la derecha, en una sola
   tarjeta. Cada página llama
     DemoCSS.crear(contenedor, config)
   El código se aplica tal cual a la previsualización (un iframe con el HTML
   del ejemplo). Los valores con flecha abren el menú de vidrio del plano del
   3-23; al elegir, el código se vuelve a pintar y la previsualización cambia
   en el momento (lo que cambia de lugar se desliza).

   config:
     archivo   nombre del archivo en la barra del editor ("estilos.css")
     tipo      "css" (el código es la hoja de estilos de config.html) o
               "html" (el código es la página completa, con su <style>)
     html      el contenido de <body> cuando tipo es "css"
     codigo    las líneas del código. «x» es un selector o etiqueta (.codetag),
               ‹x› un valor o texto (.codetext) y {{k}} un valor con menú
     valores   { k: { opciones: [...], inicial: 0, nombre: "float" } }
     alto      alto fijo de la previsualización (con barra para desplazarse);
               si no se da, mide lo que su contenido
     base      CSS extra para la previsualización que no se muestra en el código
     ancho     true: arriba de la previsualización se dice cuánto mide de ancho */
(function () {
  "use strict";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Estilo de la previsualización que no forma parte del ejemplo: la letra del
  // curso y transiciones para que los cambios se vean pasar
  var BASE = "html{font-family:Lato,Arial,sans-serif;color:#172033;font-size:16px;line-height:1.5}" +
    "body{margin:0}h1,h2,h3{line-height:1.25;margin:0 0 .5em}p{margin:0 0 .75em}" +
    (reduce ? "" : "body *{transition:width .4s ease,height .4s ease,min-width .4s ease,max-width .4s ease,margin .4s ease,padding .4s ease,top .4s ease,left .4s ease,right .4s ease,bottom .4s ease,color .4s ease,background-color .4s ease,font-size .4s ease,border-width .4s ease}");

  function esColor(valor) {
    return !/^(inherit|initial|unset|currentcolor)$/i.test(valor) && window.CSS && CSS.supports && CSS.supports("color", valor);
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function crear(root, cfg) {
    if (!root) return;
    var v = {};
    Object.keys(cfg.valores).forEach(function (k) {
      v[k] = cfg.valores[k].opciones[cfg.valores[k].inicial || 0];
    });

    /* ---------- Estructura: la misma fila .lesson-demo de los otros demos ---------- */
    root.classList.add("demo-css");
    root.innerHTML =
      "<div class=\"row lesson-demo\">" +
        "<div class=\"col-lg-6 col-md-6 col-sm-12 col-xs-12 demo-css__editor\"><pre class=\"code code--numbered\"></pre></div>" +
        "<div class=\"col-lg-6 col-md-6 col-sm-12 col-xs-12 demo-css__vista\">" +
          "<p class=\"demo-css__ancho\" hidden></p>" +
          "<iframe class=\"demo-css__marco\" title=\"Previsualización del ejemplo\" loading=\"lazy\"></iframe>" +
        "</div>" +
      "</div>" +
      "<div class=\"demo-css__menu\" role=\"menu\" hidden></div>";

    var marco = root.querySelector("iframe");
    var anchoEl = root.querySelector(".demo-css__ancho");
    var editor = root.querySelector(".demo-css__editor");
    var pre = root.querySelector("pre");
    var menu = root.querySelector(".demo-css__menu");
    editor.setAttribute("data-archivo", cfg.archivo);

    // El código sin marcas, con los valores actuales: lo que se aplica a la previsualización
    function texto(l) {
      return l.replace(/\{\{(\w+)\}\}/g, function (_, k) { return v[k]; }).replace(/[«»‹›]/g, "");
    }

    // La línea más larga decide el tamaño de la letra (cada menú ocupa unos 3 caracteres más)
    var cols = 0;
    cfg.codigo.forEach(function (l) {
      cols = Math.max(cols, texto(l).length + 3 * (l.match(/\{\{\w+\}\}/g) || []).length);
    });
    editor.style.setProperty("--cols", Math.max(cols, 30));

    /* ---------- Código ---------- */
    function boton(k) {
      var nombre = cfg.valores[k].nombre || k;
      return "<button type=\"button\" class=\"demo-css__valor\" data-k=\"" + k + "\" aria-haspopup=\"menu\" aria-label=\"" + esc(nombre + ": " + v[k]) + ". Elegir otro valor\">" + esc(v[k]) + "</button>";
    }

    // Mismo formato que los bloques de código del curso (lesson-demo.css): cada línea es
    // un .ld-line, que el CSS numera; el selector o la etiqueta van en .codetag y los textos en .codetext
    function pintarCodigo() {
      pre.innerHTML = cfg.codigo.map(function (l) {
        var h = esc(l)
          .replace(/«([^»]*)»/g, "<span class=\"codetag\">$1</span>")
          .replace(/‹([^›]*)›/g, "<span class=\"codetext\">$1</span>")
          .replace(/\{\{(\w+)\}\}/g, function (_, k) { return boton(k); });
        return "<span class=\"ld-line\">" + (h || "&nbsp;") + "</span>";
      }).join("");
    }

    /* ---------- Previsualización ---------- */
    var doc = null, estilo = null, htmlActual = null;

    function partes() {
      var todo = cfg.codigo.map(texto).join("\n");
      if (cfg.tipo !== "html") return { css: todo, html: cfg.html };
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
      if (cfg.alto) {
        marco.style.height = cfg.alto + "px";
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
      if (!cfg.ancho || !doc) return;
      anchoEl.hidden = false;
      anchoEl.innerHTML = "Ancho de la ventana: <b>" + doc.documentElement.clientWidth + "px</b>";
    }

    /* ---------- Menú ---------- */
    var abierto = null;

    function abrirMenu(origen, opciones, alElegir) {
      cerrarMenu();
      abierto = { origen: origen, alElegir: alElegir };
      origen.classList.add("is-abierta");
      origen.setAttribute("aria-expanded", "true");
      menu.innerHTML = opciones.map(function (o, i) {
        return "<button type=\"button\" role=\"menuitem\" class=\"demo-css__opcion" + (o.actual ? " is-actual" : "") + "\" data-i=\"" + i + "\">" + o.html + "</button>";
      }).join("");
      menu.hidden = false;
      // Debajo del valor que se tocó; si no cabe, arriba
      var r = root.getBoundingClientRect(), o = origen.getBoundingClientRect();
      var w = menu.offsetWidth, h = menu.offsetHeight;
      var left = Math.max(4, Math.min(o.left - r.left, r.width - w - 4));
      var top = o.bottom - r.top + 6;
      if (o.bottom + h + 6 > window.innerHeight && o.top - h - 6 > 0) top = o.top - r.top - h - 6;
      menu.style.left = left + "px";
      menu.style.top = top + "px";
      // El menú crece desde el valor que se tocó
      menu.style.setProperty("--origen", Math.max(0, Math.min(w, o.left - r.left - left + 20)) + "px " + (top < o.top - r.top ? h + "px" : "0"));
      requestAnimationFrame(function () { menu.classList.add("is-on"); });
      var actual = menu.querySelector(".is-actual") || menu.querySelector(".demo-css__opcion");
      actual.focus({ preventScroll: true });
    }

    function cerrarMenu(devolverFoco) {
      if (!abierto) return;
      var origen = abierto.origen;
      origen.classList.remove("is-abierta");
      origen.removeAttribute("aria-expanded");
      menu.hidden = true;
      menu.classList.remove("is-on");
      abierto = null;
      if (devolverFoco) origen.focus({ preventScroll: true });
    }

    menu.addEventListener("click", function (e) {
      var b = e.target.closest(".demo-css__opcion");
      if (!b || !abierto) return;
      var elegir = abierto.alElegir;
      cerrarMenu(true);
      elegir(+b.getAttribute("data-i"));
    });

    menu.addEventListener("keydown", function (e) {
      var ops = Array.prototype.slice.call(menu.querySelectorAll(".demo-css__opcion"));
      var i = ops.indexOf(document.activeElement);
      if (e.key === "ArrowDown") { e.preventDefault(); ops[(i + 1) % ops.length].focus(); }
      if (e.key === "ArrowUp") { e.preventDefault(); ops[(i - 1 + ops.length) % ops.length].focus(); }
      if (e.key === "Escape") { e.preventDefault(); cerrarMenu(true); }
      if (e.key === "Tab") cerrarMenu();
    });

    document.addEventListener("pointerdown", function (e) {
      if (abierto && !menu.contains(e.target) && !abierto.origen.contains(e.target)) cerrarMenu();
    });

    // Los valores que son colores llevan una muestra del color
    function muestra(valor) {
      return esColor(valor) ? "<span class=\"demo-css__muestra\" style=\"background:" + esc(valor) + "\"></span>" : "";
    }

    pre.addEventListener("click", function (e) {
      var b = e.target.closest(".demo-css__valor");
      if (!b) return;
      if (abierto && abierto.origen === b) { cerrarMenu(); return; }
      var k = b.getAttribute("data-k");
      var ops = cfg.valores[k].opciones.map(function (o) {
        return { html: muestra(o) + "<code>" + esc(o) + "</code>", actual: o === v[k] };
      });
      abrirMenu(b, ops, function (i) { cambiarValor(k, i); });
    });

    function cambiarValor(k, i) {
      v[k] = cfg.valores[k].opciones[i];
      mover(aplicar);
      pintarCodigo();
      medir();
      var b = pre.querySelector("[data-k=\"" + k + "\"]");
      if (b) b.focus({ preventScroll: true });
    }

    /* ---------- Inicio ---------- */
    pintarCodigo();
    marco.addEventListener("load", function () {
      doc = marco.contentDocument;
      if (!doc) return;
      doc.head.innerHTML = "<meta charset=\"utf-8\"><base target=\"_blank\">" +
        "<link rel=\"stylesheet\" href=\"https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap\">" +
        "<style>" + BASE + (cfg.base || "") + "</style><style data-ejemplo></style>";
      estilo = doc.querySelector("[data-ejemplo]");
      aplicar();
      medir();
      pintarAncho();
      var win = doc.defaultView;
      if (win.ResizeObserver) new win.ResizeObserver(function () { medir(); pintarAncho(); }).observe(doc.body);
      doc.addEventListener("transitionend", medir);
      if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(medir);
      if (window.ResizeObserver) {
        new ResizeObserver(function () { pintarAncho(); cerrarMenu(); }).observe(marco);
      }
    });
    marco.srcdoc = "<!DOCTYPE html><html lang=\"es\"><head></head><body></body></html>";
  }

  window.DemoCSS = { crear: crear };
})();
