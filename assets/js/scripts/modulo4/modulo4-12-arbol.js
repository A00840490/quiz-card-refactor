/* Módulo 4-12: el árbol DOM se arma frente al estudiante (estilos en
   assets/css/modulos/modulo4/modulo4-12-arbol.css).

   El árbol es un modelo: cada nodo sabe en qué paso lo crea el navegador (s).
   Los controles eligen hasta qué paso se ha leído el HTML (k) y todo se vuelve
   a pintar desde ahí: el árbol, las líneas leídas del código y la barra de
   progreso. Los nodos nuevos aparecen como los caracteres de Matrix: les cae
   una gota de caracteres y su nombre se descifra letra por letra. Al tocar
   un nodo se marca su parte del código y la explicación dice qué es. */
(function () {
  "use strict";

  var root = document.querySelector("[data-dom]");
  if (!root) return;

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ICON = {
    reset: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 8a5 5 0 1 1-1.5-3.6"/><path d="M13 2.5v3h-3"/></svg>',
    back: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13.5 2.5v11l-8-5.5z" fill="currentColor"/><path d="M2.3 2.5h2.2v11H2.3z" fill="currentColor"/></svg>',
    step: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 2.5v11l8-5.5z" fill="currentColor"/><path d="M11.5 2.5h2.2v11h-2.2z" fill="currentColor"/></svg>',
    play: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.2v11.6l9.5-5.8z" fill="currentColor"/></svg>',
    pause: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 2.5h3.2v11H3.5zM9.3 2.5h3.2v11H9.3z" fill="currentColor"/></svg>'
  };
  var GLIFOS = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789<>/=*+";

  function $(s, r) { return (r || root).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || root).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function glifo() { return GLIFOS.charAt(Math.floor(Math.random() * GLIFOS.length)); }

  /* ---------- El HTML del ejemplo ----------
     r: paso en que el navegador ya leyó la línea; s: paso que la resalta completa.
     Dentro de las líneas, data-s marca la parte exacta que crea cada nodo. */
  var INIT = "Hola, soy el rectángulo";
  var PASOS = 10, TOTAL = 13;
  function tok(s, html) { return '<span data-s="' + s + '">' + html + "</span>"; }
  function funcion(nombre, txt) {
    return [
      { h: "    function " + nombre + "() {", r: 10, s: 10 },
      { h: '      var elem = document.getElementById("rect");', r: 10, s: 10 },
      { h: "      elem.innerHTML = " + esc(txt) + ";", r: 10, s: 10 },
      { h: "    }", r: 10, s: 10 }
    ];
  }
  var LINEAS = [
    { h: tok(1, esc("<html>")), r: 1 },
    { h: tok(2, esc("<head>")), r: 2 },
    { h: "  " + tok(3, esc("<title>")) + tok(4, esc("Mi página")) + esc("</title>"), r: 3 },
    { h: esc("</head>"), r: 4 },
    { h: tok(5, esc("<body>")), r: 5 },
    { h: "  " + tok(6, esc('<div id="rect">')) + tok(7, esc(INIT)) + esc("</div>"), r: 6 },
    { h: "  " + tok(8, esc('<button onclick="cambiar()">Cambiar</button>')), r: 8 },
    { h: "  " + tok(9, esc('<button onclick="enlace()">Enlace</button>')), r: 9 },
    { h: "  " + esc("<script>"), r: 10, s: 10 }
  ].concat(funcion("cambiar", '"¡Me cambió JavaScript!"'), [{ h: " ", r: 10, s: 10 }], funcion("enlace", "\"<a href='#'>Ve al curso</a>\""), [
    { h: "  " + esc("</script>"), r: 10, s: 10 },
    { h: esc("</body>"), r: 10 },
    { h: esc("</html>"), r: 10 }
  ]);

  var MSG = [
    "",
    'El navegador empieza a leer el HTML. Encuentra <code>&lt;html&gt;</code> y crea el primer nodo, debajo de document.',
    'Dentro de html está <code>&lt;head&gt;</code>, así que se vuelve un nodo hijo de html.',
    'Ahora encuentra <code>&lt;title&gt;</code> dentro de head. Cada etiqueta se convierte en un nodo de elemento.',
    'El texto "Mi página" también es un nodo: un <code>nodo de texto</code>, hijo de title.',
    '<code>&lt;body&gt;</code> es hermano de head: los dos son hijos de html. Todo lo que se ve en la página va dentro de body.',
    'Crea el nodo <code>&lt;div&gt;</code> con su atributo id="rect". Por ese id, <code>getElementById("rect")</code> lo podrá encontrar.',
    'Su texto, "' + INIT + '", queda como nodo hijo del div.',
    'Llega el primer <code>&lt;button&gt;</code>, con su atributo <code>onclick</code> y su texto como nodo hijo.',
    'El segundo <code>&lt;button&gt;</code> queda como hermano del primero: los dos son hijos de body.',
    'Por último lee el <code>&lt;script&gt;</code>. No se ve en la página, pero también es un nodo, y con él ya existen <code>cambiar()</code> y <code>enlace()</code>. El árbol está completo.'
  ];

  /* ---------- El modelo del árbol ---------- */
  function modelo() {
    return { t: "#document", s: 0, c: [{ t: "html", s: 1, c: [
      { t: "head", s: 2, c: [{ t: "title", s: 3, c: [{ x: "Mi página", s: 4 }] }] },
      { t: "body", s: 5, c: [
        { t: "div", s: 6, a: [["id", "rect"]], c: [{ x: INIT, s: 7 }] },
        { t: "button", s: 8, a: [["onclick", "cambiar()"]], c: [{ x: "Cambiar", s: 8 }] },
        { t: "button", s: 9, a: [["onclick", "enlace()"]], c: [{ x: "Enlace", s: 9 }] },
        { t: "script", s: 10 }
      ] }
    ] }] };
  }
  var st = { k: 0, m: null, nodo: {}, padre: {}, sig: 0, sel: null, nuevos: [], playing: false, hl: null };
  function numera(n, p) {
    n.u = "n" + (st.sig++);
    st.nodo[n.u] = n;
    st.padre[n.u] = p || null;
    (n.c || []).forEach(function (k) { numera(k, n); });
  }
  function visible(n) { return n.s <= st.k; }
  function cuenta(n) { return visible(n) ? 1 + (n.c || []).reduce(function (a, k) { return a + cuenta(k); }, 0) : 0; }
  function idDe(n) { var a = (n.a || []).filter(function (p) { return p[0] === "id"; })[0]; return a ? a[1] : null; }
  function nombre(n) { return n.t === "#document" ? "document" : "&lt;" + esc(n.t) + "&gt;"; }

  /* ---------- Referencias ---------- */
  var treeBox = $(".dom__tree"), tree = $("[data-tree]");
  var prog = $("[data-prog]"), status = $("[data-status]");
  var btnPlay = $("[data-play]"), btnBack = $("[data-back]"), btnStep = $("[data-step]"), btnReset = $("[data-reset]");
  var codeEl = $("[data-code] .js-term__code");

  btnReset.innerHTML = ICON.reset; btnBack.innerHTML = ICON.back; btnStep.innerHTML = ICON.step; btnPlay.innerHTML = ICON.play;
  $$("[data-ico]", document).forEach(function (el) { el.innerHTML = ICON[el.getAttribute("data-ico")]; });

  /* ---------- Lluvia de fondo (solo mientras algo pasa) ---------- */
  var canvas = $(".dom__rain"), ctx = canvas.getContext && canvas.getContext("2d");
  var gotas = [], lluvia = 0, lluviaHasta = 0, ultimo = 0;
  function llueve(ms) {
    if (reduce || !ctx) return;
    lluviaHasta = Math.max(lluviaHasta, performance.now() + ms);
    treeBox.classList.add("is-lluvia");
    if (!lluvia) lluvia = requestAnimationFrame(cuadro);
  }
  function cuadro(t) {
    var w = treeBox.clientWidth, h = treeBox.clientHeight, dpr = window.devicePixelRatio || 1;
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      gotas = [];
      for (var c = 0; c < Math.ceil(w / 14); c++) gotas.push(Math.random() * -h / 14);
    }
    if (t - ultimo > 55) {
      ultimo = t;
      ctx.fillStyle = "rgba(2, 8, 4, .16)";
      ctx.fillRect(0, 0, w, h);
      ctx.font = "13px Consolas, monospace";
      for (var i = 0; i < gotas.length; i++) {
        var y = gotas[i] * 14;
        ctx.fillStyle = Math.random() < .08 ? "#d1fae5" : "#22c55e";
        ctx.fillText(glifo(), i * 14, y);
        if (y > h && Math.random() > .96) gotas[i] = 0;
        gotas[i] += 1;
      }
    }
    if (t < lluviaHasta) { lluvia = requestAnimationFrame(cuadro); return; }
    lluvia = 0;
    treeBox.classList.remove("is-lluvia");
  }

  /* ---------- Efecto Matrix en un nodo ---------- */
  // La gota cae desde arriba del árbol hasta el nodo
  function gota(nd) {
    if (reduce) return;
    var b = treeBox.getBoundingClientRect(), r = nd.getBoundingClientRect();
    var alto = Math.max(30, r.top - b.top + r.height / 2);
    var g = document.createElement("span");
    g.className = "dom__gota";
    g.style.left = (r.left - b.left + 4) + "px";
    g.style.top = "0px";
    g.style.height = alto + "px";
    var n = Math.ceil(alto / 13.6), s = "";
    for (var i = 0; i < n; i++) s += "<i>" + glifo() + "</i>";
    g.innerHTML = "<span>" + s + "</span>";
    treeBox.appendChild(g);
    setTimeout(function () { g.classList.add("is-fin"); }, 520);
    setTimeout(function () { g.remove(); }, 950);
  }
  // El texto del nodo se descifra de izquierda a derecha
  function descifra(nd, retraso) {
    if (reduce) return;
    var partes = [];
    (function camina(el) {
      Array.prototype.forEach.call(el.childNodes, function (k) {
        if (k.nodeType === 3) { if (k.nodeValue.trim()) partes.push({ n: k, f: k.nodeValue }); }
        else camina(k);
      });
    })(nd);
    var largo = partes.reduce(function (a, p) { return a + p.f.length; }, 0);
    var inicio = performance.now() + (retraso || 0), dura = 380 + largo * 22;
    partes.forEach(function (p) { p.n.nodeValue = p.f.replace(/\S/g, glifo); });
    (function paso(t) {
      var avance = Math.max(0, (t - inicio) / dura), corte = Math.floor(avance * largo), pos = 0;
      partes.forEach(function (p) {
        var txt = "";
        for (var i = 0; i < p.f.length; i++, pos++) txt += pos < corte || p.f.charAt(i) === " " ? p.f.charAt(i) : glifo();
        p.n.nodeValue = txt;
      });
      if (avance < 1) requestAnimationFrame(paso);
      else partes.forEach(function (p) { p.n.nodeValue = p.f; });
    })(performance.now());
  }

  /* ---------- Pintar ---------- */
  function ficha(n) {
    var cls = ["dom__nd"];
    cls.push(n.x != null ? "dom__nd--tx" : n.t === "#document" ? "dom__nd--doc" : "dom__nd--el");
    if (st.sel === n.u) cls.push("is-sel");
    var dentro;
    if (n.x != null) dentro = '"' + esc(n.x) + '"';
    else if (n.t === "#document") dentro = "document";
    else dentro = "<b>&lt;" + esc(n.t) + "&gt;</b>" + (n.a || []).map(function (a) { return '<i class="at">' + esc(a[0]) + '="' + esc(a[1]) + '"</i>'; }).join("");
    return '<span class="' + cls.join(" ") + '" data-u="' + n.u + '" tabindex="0" role="button">' + dentro + "</span>";
  }
  function rama(n) {
    var hijos = (n.c || []).filter(visible);
    return "<li" + (st.nuevos.indexOf(n.u) >= 0 ? ' class="is-in"' : "") + ">" + ficha(n) +
      (hijos.length ? "<ul>" + hijos.map(rama).join("") + "</ul>" : "") + "</li>";
  }
  function pintaArbol() {
    tree.innerHTML = '<ul class="dom__tr">' + rama(st.m) + "</ul>";
    var nuevos = $$(".is-in > .dom__nd", tree);
    nuevos.forEach(function (nd, i) { gota(nd); descifra(nd, 160 + i * 60); });
    if (nuevos.length) llueve(1600);
  }
  function pintaCodigo() {
    codeEl.innerHTML = LINEAS.map(function (l) {
      return '<span class="dom__ln" data-r="' + l.r + '"' + (l.s ? ' data-s="' + l.s + '"' : "") + ">" + l.h + "</span>";
    }).join("");
  }
  function resalta(s) {
    st.hl = s;
    $$(".dom__ln", codeEl).forEach(function (l) { l.classList.toggle("is-unread", +l.getAttribute("data-r") > st.k); });
    $$("[data-s]", codeEl).forEach(function (e) { e.classList.toggle("is-on", s != null && e.getAttribute("data-s") === String(s)); });
  }
  function barra() {
    var n = cuenta(st.m);
    prog.className = "dom__prog dom__prog--build";
    $("i", prog).style.width = Math.round(st.k / PASOS * 100) + "%";
    $(".dom__lbl", prog).innerHTML = st.k >= PASOS ? "Árbol completo: <b>" + n + "</b> nodos" : "Nodos en el árbol: <b>" + n + "</b> de " + TOTAL;
  }
  // La explicación cambia con desvanecido, como la x del 4-7
  function say(html) {
    if (html === status._html) return;
    status._html = html;
    clearTimeout(status._t);
    if (reduce || !status.innerHTML || !html) { status.classList.remove("is-fading"); status.innerHTML = html; return; }
    status.classList.add("is-fading");
    status._t = setTimeout(function () { status.innerHTML = html; status.classList.remove("is-fading"); }, 200);
  }
  function controles() {
    btnBack.disabled = st.k <= 0;
    btnStep.disabled = st.k >= PASOS;
    btnPlay.innerHTML = st.playing ? ICON.pause : ICON.play;
    btnPlay.setAttribute("aria-label", st.playing ? "Pausa" : "Reproducir");
    btnPlay.title = st.playing ? "Pausa" : "Reproducir";
  }

  /* ---------- Armar el árbol paso a paso ---------- */
  function ir(k, conTexto) {
    st.k = k; st.sel = null;
    st.nuevos = Object.keys(st.nodo).filter(function (u) { return st.nodo[u].s === k && k > 0; });
    pintaArbol(); resalta(k || null); barra();
    if (conTexto && MSG[k]) say(MSG[k]);
    controles();
  }
  var timer = null;
  function para() { st.playing = false; clearTimeout(timer); controles(); }
  function sigue() {
    if (!st.playing) return;
    if (st.k >= PASOS) { para(); return; }
    ir(st.k + 1, true);
    if (st.k >= PASOS) { para(); return; }
    timer = setTimeout(sigue, reduce ? 600 : 1800);
  }
  btnPlay.addEventListener("click", function () {
    btnPlay.classList.remove("is-hint");
    if (st.playing) { para(); return; }
    st.playing = true;
    if (st.k >= PASOS) ir(0, false);
    controles();
    sigue();
  });
  btnStep.addEventListener("click", function () { btnPlay.classList.remove("is-hint"); para(); if (st.k < PASOS) ir(st.k + 1, true); });
  btnBack.addEventListener("click", function () { para(); if (st.k > 0) ir(st.k - 1, true); });
  btnReset.addEventListener("click", function () {
    para();
    ir(0, false);
    say("");
    btnPlay.classList.add("is-hint");
  });

  /* ---------- Tocar un nodo ---------- */
  var DESC = {
    html: "es el elemento raíz: todos los demás elementos están dentro de él.",
    head: "guarda datos de la página que no se ven en ella, como el título.",
    title: "es el título que aparece en la pestaña del navegador.",
    body: "contiene todo lo que se ve en la página.",
    script: "no se ve en la página, pero también es un nodo del árbol. Aquí viven las funciones <code>cambiar()</code> y <code>enlace()</code>."
  };
  function hijosDe(n) {
    var h = (n.c || []).filter(visible).length;
    return h ? "tiene " + h + " hijo" + (h === 1 ? "" : "s") + "." : "no tiene hijos.";
  }
  function explica(n) {
    var p = st.padre[n.u], txt;
    if (n.t === "#document") return '<code>document</code> es la raíz del árbol y representa toda la página. Por eso escribimos <code>document.getElementById()</code>: la búsqueda empieza aquí. Este nodo ' + hijosDe(n);
    if (n.x != null) return '"' + esc(n.x) + '" es un <code>nodo de texto</code>: el contenido de su padre, ' + nombre(p) + ". Los nodos de texto no tienen hijos.";
    var id = idDe(n), on = (n.a || []).filter(function (a) { return a[0] === "onclick"; })[0];
    if (id) txt = 'tiene el atributo id="' + esc(id) + '". Como ningún otro elemento usa ese id, <code>getElementById("' + esc(id) + '")</code> lo puede encontrar.';
    else if (on) txt = "tiene el atributo <code>onclick</code>: al hacerle clic ejecuta <code>" + esc(on[1]) + "</code>.";
    else txt = DESC[n.t] || "es un nodo de elemento.";
    return "<code>&lt;" + esc(n.t) + "&gt;</code> " + txt + " Su padre es " + nombre(p) + " y " + hijosDe(n);
  }
  function selecciona(u) {
    var n = st.nodo[u];
    if (!n) return;
    para();
    st.sel = u; st.nuevos = [];
    pintaArbol();
    resalta(n.s || null);
    say(explica(n));
  }
  tree.addEventListener("click", function (e) { var nd = e.target.closest(".dom__nd"); if (nd) selecciona(nd.getAttribute("data-u")); });
  tree.addEventListener("keydown", function (e) {
    if ((e.key === "Enter" || e.key === " ") && e.target.matches(".dom__nd")) { e.preventDefault(); selecciona(e.target.getAttribute("data-u")); }
  });

  root.classList.add("dom--ready");
  st.m = modelo(); numera(st.m);
  pintaCodigo();
  ir(0, false);
})();
