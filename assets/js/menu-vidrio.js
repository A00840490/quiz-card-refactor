/* Menú de vidrio (assets/css/menu-vidrio.css): la forma estándar del curso de
   cambiar un valor dentro de un bloque de código. Lo usan los demos (demo.js)
   y el plano del 3-23; cualquier ajuste al menú se hace aquí.

   Se abre debajo de lo que se tocó (arriba si no cabe) y crece desde ahí; se
   cierra al elegir, al hacer clic fuera o con Escape, y se navega con las
   flechas del teclado. Solo hay un menú abierto a la vez.

     $(origen).menuVidrio({
       opciones: [{ html: "<code>left</code>", actual: true }, ...],
       alElegir: function (i) { ... },   // índice de la opción elegida
       dentro: contenedor,               // elemento con position: relative donde se coloca el menú
       alCerrar: function () { ... }     // opcional
     });

   Tocar otra vez el mismo origen con el menú abierto lo cierra.
   Ayudas:
     MenuVidrio.boton(valor, nombre, attrs)   el botón del valor dentro del código
     MenuVidrio.valores(lista, actual)        opciones con el valor en monoespaciada
                                              y su muestra si es un color
     MenuVidrio.cerrar(devolverFoco)
     MenuVidrio.abiertoDesde(origen) */
(function ($) {
  "use strict";

  var abierto = null;

  var esc = Curso.esc;

  function esColor(valor) {
    return !/^(inherit|initial|unset|currentcolor)$/i.test(valor) && window.CSS && CSS.supports && CSS.supports("color", valor);
  }

  // Un menú por contenedor; se crea la primera vez que se usa
  function menuDe(dentro) {
    var $dentro = $(dentro);
    var $menu = $dentro.data("menuVidrio");
    if (!$menu) {
      $menu = $("<div class=\"menu-vidrio\" role=\"menu\" hidden></div>").appendTo($dentro);
      $dentro.data("menuVidrio", $menu);
    }
    return $menu;
  }

  function abrir(origen, cfg) {
    if (abierto && abierto.origen === origen) { cerrar(); return; }
    cerrar();
    var dentro = cfg.dentro || origen.offsetParent || document.body;
    var $menu = menuDe(dentro), menu = $menu[0];
    abierto = { origen: origen, menu: menu, alElegir: cfg.alElegir, alCerrar: cfg.alCerrar };
    $(origen).addClass("is-abierta").attr("aria-expanded", "true");
    $menu.html($.map(cfg.opciones, function (o, i) {
      return "<button type=\"button\" role=\"menuitem\" class=\"menu-vidrio__opcion" + (o.actual ? " is-actual" : "") + "\" data-i=\"" + i + "\">" + o.html + "</button>";
    }).join(""));
    menu.hidden = false;
    // Debajo de lo que se tocó; si no cabe, arriba
    var r = dentro.getBoundingClientRect(), o = origen.getBoundingClientRect();
    var w = menu.offsetWidth, h = menu.offsetHeight;
    var left = Math.max(4, Math.min(o.left - r.left, r.width - w - 4));
    var top = o.bottom - r.top + 6;
    if (o.bottom + h + 6 > window.innerHeight && o.top - h - 6 > 0) top = o.top - r.top - h - 6;
    $menu.css({ left: left + "px", top: top + "px" });
    // El menú crece desde lo que se tocó
    menu.style.setProperty("--origen", Math.max(0, Math.min(w, o.left - r.left - left + 20)) + "px " + (top < o.top - r.top ? h + "px" : "0"));
    requestAnimationFrame(function () { $menu.addClass("is-on"); });
    var actual = menu.querySelector(".is-actual") || menu.querySelector(".menu-vidrio__opcion");
    actual.focus({ preventScroll: true });
  }

  function cerrar(devolverFoco) {
    if (!abierto) return;
    var a = abierto;
    abierto = null;
    $(a.origen).removeClass("is-abierta").removeAttr("aria-expanded");
    $(a.menu).removeClass("is-on").prop("hidden", true);
    if (a.alCerrar) a.alCerrar();
    if (devolverFoco) a.origen.focus({ preventScroll: true });
  }

  $(document).on("click", ".menu-vidrio__opcion", function () {
    if (!abierto) return;
    var elegir = abierto.alElegir;
    cerrar(true);
    elegir(+this.getAttribute("data-i"));
  });

  $(document).on("keydown", ".menu-vidrio", function (e) {
    var ops = $(this).children(".menu-vidrio__opcion").get();
    var i = ops.indexOf(document.activeElement);
    if (e.key === "ArrowDown") { e.preventDefault(); ops[(i + 1) % ops.length].focus(); }
    if (e.key === "ArrowUp") { e.preventDefault(); ops[(i - 1 + ops.length) % ops.length].focus(); }
    if (e.key === "Escape") { e.preventDefault(); cerrar(true); }
    if (e.key === "Tab") cerrar();
  });

  document.addEventListener("pointerdown", function (e) {
    if (abierto && !abierto.menu.contains(e.target) && !abierto.origen.contains(e.target)) cerrar();
  });

  window.MenuVidrio = {
    abrir: abrir,
    cerrar: cerrar,
    abiertoDesde: function (origen) { return !!abierto && abierto.origen === origen; },
    boton: function (valor, nombre, attrs) {
      return "<button type=\"button\" class=\"menu-vidrio__valor\"" + (attrs || "") + " aria-haspopup=\"menu\" aria-label=\"" + esc(nombre + ": " + valor) + ". Elegir otro valor\">" + esc(valor) + "</button>";
    },
    valores: function (lista, actual) {
      return $.map(lista, function (v) {
        var muestra = esColor(v) ? "<span class=\"menu-vidrio__muestra\" style=\"background:" + esc(v) + "\"></span>" : "";
        return { html: muestra + "<code>" + esc(v) + "</code>", actual: v === actual };
      });
    }
  };

  $.fn.menuVidrio = function (cfg) {
    if (this[0]) abrir(this[0], cfg);
    return this;
  };
})(jQuery);
