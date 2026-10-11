/* Tarjeta evolutiva (estilos y estructura en assets/css/evo-card.css).
   - Cada paso es una pregunta (data-k="q", tarjeta azul) o una explicación
     (data-k="a", tarjeta blanca). Al avanzar, la tarjeta cambia de color y
     el texto se reemplaza en la misma celda, sin cambiar de altura.
   - La mini barra de arriba se arma sola: "?" para las preguntas y un punto
     sin título para las explicaciones. En el último paso, la primera esfera
     se vuelve botón y regresa al inicio.
   - En las explicaciones (menos la última) aparece una flecha en la esquina
     inferior derecha que lleva a la siguiente pregunta.
   - El ? de fondo se vuelve una columna de signos; aparecen de abajo hacia
     arriba cuando la tarjeta entra en pantalla y cada vez que vuelve a ser
     pregunta.
   - La escena la anima cada lección con
       EvoCard.create(root, { layout: function (i, st, later, scene) {}, fb: {...} })
     layout(i) acomoda los actores para el paso i; st.pick es la última
     respuesta elegida; later(fn, ms) programa algo que se cancela si el
     alumno cambia de paso. fb[pick] = ["ok" | "nope", "frase"] llena el
     [data-fb] de la explicación según la respuesta.
   - Las terminales verdes (.js-term) dentro de un paso se escriben cuando
     ese paso aparece, no al entrar en pantalla.
   - Con "reducir movimiento" todo cambia de inmediato. */
(function () {
  "use strict";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function mk(parent, cls, html) {
    var d = document.createElement("div");
    d.className = cls;
    if (html != null) d.innerHTML = html;
    parent.appendChild(d);
    return d;
  }

  function tf(x, y, r, s) {
    return "translate(" + x + "px," + y + "px) rotate(" + r + "deg) scale(" + s + ")";
  }

  // Mueve un actor a {x, y, w, h, r (giro), s (escala), o (opacidad), d (retraso ms)}.
  // Si estaba escondido, aparece en su lugar en vez de volar desde la esquina.
  function put(el, o) {
    var x = o.x || 0, y = o.y || 0, r = o.r || 0;
    var s = o.s == null ? 1 : o.s, op = o.o == null ? 1 : o.o;
    var hidden = el.style.opacity === "" || el.style.opacity === "0";
    if (hidden && op > 0) {
      el.style.transition = "none";
      if (o.w != null) el.style.width = o.w + "px";
      if (o.h != null) el.style.height = o.h + "px";
      el.style.transform = tf(x, y, r, s * 0.85);
      void el.offsetWidth;
      el.style.transition = "";
    }
    el.style.transitionDelay = (o.d || 0) + "ms";
    if (o.w != null) el.style.width = o.w + "px";
    if (o.h != null) el.style.height = o.h + "px";
    el.style.transform = tf(x, y, r, s);
    el.style.opacity = op;
  }

  // Esconde los actores que el paso actual no usó
  function hideRest(all, used) {
    all.forEach(function (e) {
      if (used.indexOf(e) < 0) {
        e.style.transitionDelay = "0ms";
        e.style.opacity = 0;
      }
    });
  }

  function create(root, cfg) {
    var steps = Array.prototype.slice.call(root.querySelectorAll(".evo__step"));
    var track = root.querySelector(".evo__track");
    var scene = root.querySelector(".evo__scene");
    var timers = [];
    var st = { i: 0, pick: null };

    var last = steps.length - 1;
    track.removeAttribute("aria-hidden");
    steps.forEach(function (s, k) {
      // La primera esfera es un botón para volver al inicio (activo sólo en el último paso)
      var d = document.createElement(k === 0 ? "button" : "span");
      var q = s.getAttribute("data-k") === "q";
      d.className = "evo__dot" + (q ? " is-q" : "");
      if (q) d.textContent = "?";
      if (k === 0) {
        d.type = "button";
        d.className += " evo__home";
        d.setAttribute("data-go", "restart");
        d.setAttribute("aria-label", "Volver a empezar");
      } else {
        d.setAttribute("aria-hidden", "true");
      }
      track.appendChild(d);
      var h = s.querySelector("h4");
      if (h) h.setAttribute("tabindex", "-1");
    });
    var dots = Array.prototype.slice.call(track.children);

    // Columna de ? de fondo. El primero queda escondido abajo para que la
    // columna pueda subir sin que se note dónde vuelve a empezar.
    var mark = root.querySelector(".evo__mark");
    if (mark) {
      var col = "";
      for (var m = 0; m < 6; m++) col += '<i style="--k:' + Math.max(0, m - 1) + '">?</i>';
      mark.innerHTML = '<span class="evo__marks">' + col + "</span>";
    }
    // Los ? aparecen hasta que la tarjeta se ve en pantalla
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (es) {
        if (!es[0].isIntersecting) return;
        root.classList.add("is-seen");
        io.disconnect();
      }, { threshold: 0.4 });
      io.observe(root);
    } else {
      root.classList.add("is-seen");
    }

    // Flecha de la esquina inferior derecha: lleva de una explicación a la siguiente pregunta
    var next = document.createElement("button");
    next.type = "button";
    next.className = "evo__next";
    next.setAttribute("data-go", "");
    next.setAttribute("aria-label", "Siguiente pregunta");
    next.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
    root.appendChild(next);

    function later(fn, ms) {
      timers.push(setTimeout(fn, reduce ? 0 : ms));
    }

    function go(i, pick, quiet) {
      timers.forEach(clearTimeout);
      timers = [];
      if (pick !== undefined) st.pick = pick;
      st.i = i;
      var s = steps[i];
      root.setAttribute("data-kind", s.getAttribute("data-k"));
      scene.setAttribute("data-s", i);
      steps.forEach(function (x, k) { x.classList.toggle("is-on", k === i); });
      dots.forEach(function (d, k) {
        d.classList.toggle("is-on", k === i);
        d.classList.toggle("is-done", k < i);
      });
      dots[0].disabled = i !== last;
      var showNext = s.getAttribute("data-k") === "a" && i !== last;
      next.classList.toggle("is-on", showNext);
      next.disabled = !showNext;
      if (i === last) dots[0].title = "Volver a empezar";
      else dots[0].removeAttribute("title");
      var fb = s.querySelector("[data-fb]");
      if (fb) {
        var f = cfg.fb && cfg.fb[st.pick];
        fb.hidden = !f;
        if (f) {
          fb.setAttribute("data-tone", f[0]);
          fb.innerHTML = f[1];
        }
      }
      s.querySelectorAll(".js-term").forEach(function (t) {
        t.dispatchEvent(new CustomEvent("evo:show"));
      });
      cfg.layout(i, st, later, scene);
      if (!quiet) {
        var h = s.querySelector("h4");
        if (h) setTimeout(function () { h.focus({ preventScroll: true }); }, reduce ? 0 : 250);
      }
    }

    // Acomoda la escena sin animar (al cargar y al cambiar el ancho)
    function still(fn) {
      scene.classList.add("no-anim");
      fn();
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { scene.classList.remove("no-anim"); });
      });
    }

    root.addEventListener("click", function (e) {
      var b = e.target.closest("[data-go], [data-pick]");
      if (!b || !root.contains(b)) return;
      if (b.getAttribute("data-go") === "restart") {
        st.pick = null;
        go(0);
      } else if (b.hasAttribute("data-pick")) {
        go(st.i + 1, b.getAttribute("data-pick"));
      } else {
        go(st.i + 1);
      }
    });

    // Si cambia el ancho de la escena, se vuelve a acomodar el paso actual
    var lastW = scene.clientWidth, rt;
    function refit() {
      clearTimeout(rt);
      rt = setTimeout(function () {
        if (scene.clientWidth === lastW) return;
        lastW = scene.clientWidth;
        still(function () { go(st.i, undefined, true); });
      }, 150);
    }
    if ("ResizeObserver" in window) new ResizeObserver(refit).observe(scene);
    else window.addEventListener("resize", refit);

    still(function () { go(0, undefined, true); });
  }

  window.EvoCard = { create: create, put: put, mk: mk, hideRest: hideRest };
})();
