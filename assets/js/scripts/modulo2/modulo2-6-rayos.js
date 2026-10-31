/* Módulo 2-6: el ejemplo de una página HTML con una lupa de rayos X.
   - La página es el HTML que va dentro de [data-base] en la página del tema;
     de ahí mismo se arma su código, así que para cambiar el ejemplo solo se
     cambia ese HTML. Cada bloque y cada <b>/<i> trae su explicación en
     data-exp; lo que va entre `comillas invertidas` sale como etiqueta
     (`h1` → <h1> en azul y monoespaciada).
   - La radiografía tiene un recuadro por bloque, en el mismo lugar y del
     mismo tamaño que el bloque en la página, con su código escrito con la
     letra más grande que quepa: el título ocupa en código lo mismo que en
     pantalla.
   - Con el mouse, la lupa sigue al cursor dentro de la página; un clic la
     deja fija (el cursor se mueve libre) y otro clic la lleva a donde está el
     cursor y vuelve a seguirlo. Con el dedo se arrastra o va a donde se toca;
     con el teclado se mueve con las flechas. Lo que queda bajo su centro se
     ilumina y la explicación de abajo cambia con desvanecido. */
(function () {
  "use strict";

  var root = document.querySelector("[data-rayos]");
  if (!root) return;

  var esc = Curso.esc;
  var reduce = Curso.reduce;
  var view = root.querySelector("[data-rx]");
  var base = root.querySelector("[data-base]");
  var xray = root.querySelector("[data-xray]");
  var lente = root.querySelector("[data-lente]");
  var status = root.querySelector("[data-status]");

  var bloques = [].slice.call(base.children);
  var inlines = [].slice.call(base.querySelectorAll("b, i"));
  bloques.concat(inlines).forEach(function (el, i) { el.setAttribute("data-el", "e" + i); });

  function etiqueta(nombre, cierra) {
    return "&lt;" + (cierra ? "/" : "") + "<span class=\"codetag\">" + nombre + "</span>&gt;";
  }

  // El código de un bloque en una sola tira; <b> e <i> van en su propio recuadro
  function codigoDe(el) {
    var tag = el.tagName.toLowerCase();
    var dentro = [].map.call(el.childNodes, function (n) {
      if (n.nodeType === 3) return esc(n.textContent.replace(/\s+/g, " "));
      if (n.nodeType !== 1) return "";
      var t = n.tagName.toLowerCase();
      return "<span class=\"rayos__in\" data-el=\"" + n.getAttribute("data-el") + "\">" + etiqueta(t) + esc(n.textContent.replace(/\s+/g, " ").trim()) + etiqueta(t, true) + "</span>";
    }).join("").trim();
    return etiqueta(tag) + dentro + etiqueta(tag, true);
  }

  function explicacion(el) {
    return esc(el.getAttribute("data-exp") || "").replace(/`([^`]+)`/g, function (m, t) {
      return "<code>&lt;" + t + "&gt;</code>";
    });
  }

  // La letra más grande con la que el código cabe en su recuadro
  function ajustar(caja) {
    var txt = caja.firstChild;
    var w = caja.clientWidth, h = caja.clientHeight, lo = 4, hi = 160;
    for (var k = 0; k < 16; k++) {
      var f = (lo + hi) / 2;
      txt.style.fontSize = f + "px";
      if (txt.scrollHeight <= h && txt.scrollWidth <= w) lo = f; else hi = f;
    }
    txt.style.fontSize = lo + "px";
  }

  var actual = null;

  function armar() {
    var R = view.getBoundingClientRect();
    xray.innerHTML = bloques.map(function (el) {
      var r = el.getBoundingClientRect();
      return "<div class=\"rayos__bloque\" data-el=\"" + el.getAttribute("data-el") + "\" data-tag=\"" + el.tagName.toLowerCase() + "\" style=\"left:" + (r.left - R.left) + "px;top:" + (r.top - R.top) + "px;width:" + r.width + "px;height:" + r.height + "px\"><div class=\"rayos__codigo\">" + codigoDe(el) + "</div></div>";
    }).join("");
    [].forEach.call(xray.children, ajustar);
    if (actual) marcar(actual);
  }

  function marcar(id) {
    [].forEach.call(xray.querySelectorAll(".is-on"), function (e) { e.classList.remove("is-on"); });
    var e = xray.querySelector("[data-el=\"" + id + "\"]");
    if (e) e.classList.add("is-on");
  }

  function explicar(html) {
    clearTimeout(status._t);
    if (reduce || !status.innerHTML) { status.innerHTML = html; return; }
    status.classList.add("is-fading");
    status._t = setTimeout(function () {
      status.innerHTML = html;
      status.classList.remove("is-fading");
    }, 200);
  }

  // ---------- Qué está bajo el centro de la lupa ----------
  var pos = { x: 0, y: 0 };

  function rel(r, R) {
    return { l: r.left - R.left, t: r.top - R.top, r: r.right - R.left, b: r.bottom - R.top };
  }

  function detectar() {
    var R = view.getBoundingClientRect(), x = pos.x, y = pos.y, hit = null;
    // Primero <b> e <i>, que van dentro de un párrafo
    inlines.some(function (el) {
      return [].some.call(el.getClientRects(), function (rc) {
        var q = rel(rc, R);
        if (x >= q.l - 4 && x <= q.r + 4 && y >= q.t - 2 && y <= q.b + 2) { hit = el; return true; }
        return false;
      });
    });
    // Si no, el bloque más cercano (entre dos bloques, el de arriba o el de abajo)
    if (!hit) {
      var dist = Infinity;
      bloques.forEach(function (el) {
        var q = rel(el.getBoundingClientRect(), R);
        var d = y < q.t ? q.t - y : y > q.b ? y - q.b : 0;
        if (d < dist) { dist = d; hit = el; }
      });
    }
    var id = hit.getAttribute("data-el");
    if (id === actual) return;
    actual = id;
    marcar(id);
    explicar(explicacion(hit));
  }

  function poner(x, y, animar) {
    pos.x = Math.max(0, Math.min(view.clientWidth, x));
    pos.y = Math.max(0, Math.min(view.clientHeight, y));
    view.classList.toggle("is-animando", !!animar && !reduce);
    view.style.setProperty("--x", pos.x + "px");
    view.style.setProperty("--y", pos.y + "px");
    detectar();
  }

  function centroDe(el) {
    var q = rel(el.getBoundingClientRect(), view.getBoundingClientRect());
    return { x: Math.min(q.l + 90, (q.l + q.r) / 2), y: (q.t + q.b) / 2 };
  }

  // ---------- Mouse: la lupa sigue al cursor; un clic la deja fija ----------
  // Fija, el cursor se mueve libre (aunque salga y vuelva a entrar); con otro
  // clic la lupa va a donde está el cursor y lo vuelve a seguir.
  var fija = false;

  function enView(e) {
    var R = view.getBoundingClientRect();
    return { x: e.clientX - R.left, y: e.clientY - R.top };
  }

  view.addEventListener("pointermove", function (e) {
    if (e.pointerType !== "mouse" || fija) return;
    var p = enView(e);
    poner(p.x, p.y, false);
  });

  view.addEventListener("click", function (e) {
    var p = enView(e);
    if (e.pointerType === "mouse" || (!e.pointerType && matchMedia("(hover: hover)").matches)) {
      fija = !fija;
      view.classList.toggle("is-fija", fija);
      if (!fija) poner(p.x, p.y, true);
      return;
    }
    // Con el dedo: tocar la página lleva la lupa ahí
    if (!lente.contains(e.target)) poner(p.x, p.y, true);
  });

  // ---------- Dedo: la lupa se arrastra ----------
  var arrastre = null;

  lente.addEventListener("pointerdown", function (e) {
    if (e.pointerType === "mouse") return;
    e.preventDefault();
    lente.setPointerCapture(e.pointerId);
    var R = view.getBoundingClientRect();
    arrastre = { dx: e.clientX - R.left - pos.x, dy: e.clientY - R.top - pos.y };
  });

  lente.addEventListener("pointermove", function (e) {
    if (!arrastre) return;
    var R = view.getBoundingClientRect();
    poner(e.clientX - R.left - arrastre.dx, e.clientY - R.top - arrastre.dy, false);
  });

  function soltar() { arrastre = null; }
  lente.addEventListener("pointerup", soltar);
  lente.addEventListener("pointercancel", soltar);

  // ---------- Teclado: flechas ----------
  lente.addEventListener("keydown", function (e) {
    var d = { ArrowLeft: [-20, 0], ArrowRight: [20, 0], ArrowUp: [0, -20], ArrowDown: [0, 20] }[e.key];
    if (!d) return;
    e.preventDefault();
    poner(pos.x + d[0], pos.y + d[1], true);
  });

  // ---------- Inicio: la lupa sobre el título ----------
  function inicio() {
    armar();
    var c = centroDe(bloques[0]);
    poner(c.x, c.y, false);
  }

  inicio();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(armar);

  // Si cambia el ancho, los bloques cambian de tamaño: se rearma la radiografía
  // y la lupa vuelve a lo que estaba viendo
  var ancho = view.clientWidth;
  window.addEventListener("resize", function () {
    if (view.clientWidth === ancho) return;
    ancho = view.clientWidth;
    armar();
    var el = base.querySelector("[data-el=\"" + actual + "\"]") || bloques[0];
    var c = el.getClientRects()[0] ? centroDe(el) : centroDe(bloques[0]);
    view.classList.remove("is-animando");
    pos.x = c.x; pos.y = c.y;
    view.style.setProperty("--x", c.x + "px");
    view.style.setProperty("--y", c.y + "px");
  });
})();
