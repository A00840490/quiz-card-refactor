/* Módulo 4-12: el árbol DOM se arma frente al estudiante (estilos en
   assets/css/modulos/modulo4/modulo4-12-arbol.css).

   El árbol es un modelo: cada nodo sabe en qué paso lo crea el navegador (s).
   Los controles eligen hasta qué paso se ha leído el HTML (k) y todo se vuelve
   a pintar desde ahí: el árbol, la página, las líneas leídas del código y la
   barra de progreso. Cambiar y Enlace modifican el mismo modelo, así que el
   árbol y la página nunca se contradicen. Los nodos nuevos aparecen como los
   caracteres de Matrix: les cae una gota de caracteres y su nombre se
   descifra letra por letra. */
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
  function wait(ms) { return new Promise(function (r) { setTimeout(r, reduce ? Math.min(ms, 80) : ms); }); }

  /* ---------- Los valores que se pueden elegir en el código ---------- */
  var INIT = "Hola, soy el rectángulo";
  var OPC = {
    id: ["rect", "Rect", "caja"],
    c: ["¡Me cambió JavaScript!", "<b>Hola</b> mundo", ""],
    e: ["<a href='#'>Ve al curso</a>", "<a href='#'><b>Ve</b> al curso</a>", "<a href='#'>Uno</a> <a href='#'>Dos</a>"]
  };
  var val = { "id-c": "rect", "txt-c": OPC.c[0], "id-e": "rect", "txt-e": OPC.e[0] };

  function aviso(que, v) {
    if (que.indexOf("id") === 0) {
      if (v === "rect") return 'El id "rect" es el del div de la página, así que <code>getElementById</code> lo va a encontrar.';
      if (v === "Rect") return '<code>getElementById</code> distingue mayúsculas de minúsculas: "Rect" no es lo mismo que "rect", así que no va a encontrar el div.';
      return 'Ningún elemento de la página tiene el id "' + esc(v) + '": <code>getElementById</code> va a regresar <code>null</code>.';
    }
    if (v === "") return 'Con un texto vacío, <code>innerHTML</code> borra todo lo que hay dentro del div y no crea ningún nodo.';
    if (v.indexOf("<a href='#'><b>") === 0) return 'El enlace trae otra etiqueta adentro: <code>innerHTML</code> va a crear un &lt;a&gt; con un &lt;b&gt; dentro, dos niveles nuevos en el árbol.';
    if (v.indexOf("Uno") >= 0) return 'Son dos enlaces: <code>innerHTML</code> va a crear dos elementos &lt;a&gt; hermanos dentro del div.';
    if (v.indexOf("<b>") === 0) return 'Este texto trae la etiqueta &lt;b&gt;: <code>innerHTML</code> va a crear un elemento nuevo y un nodo de texto a su lado.';
    if (v.indexOf("<a") === 0) return 'Este texto trae la etiqueta &lt;a&gt;: <code>innerHTML</code> va a crear un enlace con su nodo de texto.';
    return 'Este texto no trae etiquetas: <code>innerHTML</code> va a crear un solo nodo de texto dentro del div.';
  }

  /* ---------- El HTML del ejemplo ----------
     r: paso en que el navegador ya leyó la línea; s: paso que la resalta completa.
     Dentro de las líneas, data-s marca la parte exacta que crea cada nodo. */
  var PASOS = 10, TOTAL = 13;
  function tok(s, html) { return '<span data-s="' + s + '">' + html + "</span>"; }
  function valor(k, nombre) {
    return '<button type="button" class="dom__valor" data-k="' + k + '" aria-haspopup="menu" aria-label="' + nombre + '. Elegir otro valor">"' + esc(val[k]) + '"</button>';
  }
  function funcion(nombre, k) {
    return [
      { h: "    function " + nombre + "() {", r: 10, s: 10 },
      { h: '      <span data-part="get-' + k + '">var elem = document.getElementById(' + valor("id-" + k, "Id que se busca") + ");</span>", r: 10, s: 10 },
      { h: '      <span data-part="inner-' + k + '">elem.innerHTML = ' + valor("txt-" + k, "Texto para innerHTML") + ";</span>", r: 10, s: 10 },
      { h: '      <span data-part="log-' + k + '">console.log(elem.innerHTML);</span>', r: 10, s: 10 },
      { h: "    }", r: 10, s: 10 }
    ];
  }
  function lineas() {
    return [
      { h: tok(1, esc("<html>")), r: 1 },
      { h: tok(2, esc("<head>")), r: 2 },
      { h: "  " + tok(3, esc("<title>")) + tok(4, esc("Mi página")) + esc("</title>"), r: 3 },
      { h: esc("</head>"), r: 4 },
      { h: tok(5, esc("<body>")), r: 5 },
      { h: "  " + tok(6, esc('<div id="rect">')) + tok(7, esc(INIT)) + esc("</div>"), r: 6 },
      { h: "  " + tok(8, esc("<button ") + '<span data-part="click-c">onclick="cambiar()"</span>' + esc(">Cambiar</button>")), r: 8 },
      { h: "  " + tok(9, esc("<button ") + '<span data-part="click-e">onclick="enlace()"</span>' + esc(">Enlace</button>")), r: 9 },
      { h: "  " + esc("<script>"), r: 10, s: 10 }
    ].concat(funcion("cambiar", "c"), [{ h: " ", r: 10, s: 10 }], funcion("enlace", "e"), [
      { h: "  " + esc("</script>"), r: 10, s: 10 },
      { h: esc("</body>"), r: 10 },
      { h: esc("</html>"), r: 10 }
    ]);
  }

  var MSG = [
    "",
    'El navegador empieza a leer el HTML. Encuentra <code>&lt;html&gt;</code> y crea el primer nodo, debajo de document.',
    'Dentro de html está <code>&lt;head&gt;</code>, así que se vuelve un nodo hijo de html.',
    'Ahora encuentra <code>&lt;title&gt;</code> dentro de head. Cada etiqueta se convierte en un nodo de elemento.',
    'El texto "Mi página" también es un nodo: un <code>nodo de texto</code>, hijo de title. Ya aparece en la pestaña del navegador.',
    '<code>&lt;body&gt;</code> es hermano de head: los dos son hijos de html. Todo lo que se ve en la página va dentro de body.',
    'Crea el nodo <code>&lt;div&gt;</code> con su atributo id="rect". En la página aparece el rectángulo, todavía vacío.',
    'Su texto, "' + INIT + '", queda como nodo hijo del div y aparece dentro del rectángulo.',
    'Llega el primer <code>&lt;button&gt;</code>, con su atributo <code>onclick</code> y su texto. El botón ya se ve, pero la función <code>cambiar()</code> todavía no existe.',
    'El segundo <code>&lt;button&gt;</code> queda como hermano del primero: los dos son hijos de body.',
    'Por último lee el <code>&lt;script&gt;</code>. No se ve en la página, pero también es un nodo, y con él ya existen <code>cambiar()</code> y <code>enlace()</code>. El árbol está completo y los botones Cambiar y Enlace ya funcionan.'
  ];

  /* ---------- El modelo del árbol ---------- */
  function modelo() {
    return { t: "#document", s: 0, c: [{ t: "html", s: 1, c: [
      { t: "head", s: 2, c: [{ t: "title", s: 3, ref: "tab", c: [{ x: "Mi página", s: 4 }] }] },
      { t: "body", s: 5, ref: "body", c: [
        { t: "div", s: 6, a: [["id", "rect"]], ref: "rect", c: [{ x: INIT, s: 7 }] },
        { t: "button", s: 8, a: [["onclick", "cambiar()"]], ref: "b1", c: [{ x: "Cambiar", s: 8 }] },
        { t: "button", s: 9, a: [["onclick", "enlace()"]], ref: "b2", c: [{ x: "Enlace", s: 9 }] },
        { t: "script", s: 10 }
      ] }
    ] }] };
  }
  var st = { k: 0, m: null, nodo: {}, padre: {}, sig: 0, sel: null, found: null, nuevos: [], rect: esc(INIT), cambio: false, last: "c", busy: false, playing: false, hl: null, part: null };
  function numera(n, p) {
    n.u = "n" + (st.sig++);
    st.nodo[n.u] = n;
    st.padre[n.u] = p || null;
    (n.c || []).forEach(function (k) { numera(k, n); });
  }
  function visible(n) { return n.s <= st.k && !n.pend; }
  function cuenta(n) { return visible(n) ? 1 + (n.c || []).reduce(function (a, k) { return a + cuenta(k); }, 0) : 0; }
  function idDe(n) { var a = (n.a || []).filter(function (p) { return p[0] === "id"; })[0]; return a ? a[1] : null; }
  function nombre(n) { return n.t === "#document" ? "document" : n.x != null ? "texto" : "&lt;" + esc(n.t) + "&gt;"; }
  function enOrden(n, lista) { lista.push(n); (n.c || []).forEach(function (k) { enOrden(k, lista); }); return lista; }

  /* ---------- Referencias ---------- */
  var treeBox = $(".dom__tree"), tree = $("[data-tree]"), page = $("[data-body]"), rectEl = $("[data-page]"), tab = $("[data-tab]");
  var b1 = $('[data-run="c"]'), b2 = $('[data-run="e"]');
  var REF = { tab: tab, body: page, rect: rectEl, b1: b1, b2: b2 };
  var prog = $("[data-prog]"), status = $("[data-status]"), menu = $("[data-menu]");
  var btnPlay = $("[data-play]"), btnBack = $("[data-back]"), btnStep = $("[data-step]"), btnReset = $("[data-reset]");
  var codeEl = $("[data-code] .js-term__code"), out = $("[data-console]");

  btnReset.innerHTML = ICON.reset; btnBack.innerHTML = ICON.back; btnStep.innerHTML = ICON.step; btnPlay.innerHTML = ICON.play;
  $$("[data-ico]", document).forEach(function (el) { el.innerHTML = ICON[el.getAttribute("data-ico")]; });

  /* ---------- Lluvia de fondo (solo mientras algo pasa) ---------- */
  var canvas = $(".dom__rain"), ctx = canvas.getContext && canvas.getContext("2d");
  var gotas = [], lluvia = 0, lluviaHasta = 0;
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
    if (!cuadro.last || t - cuadro.last > 55) {
      cuadro.last = t;
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
    nd.classList.add("is-cifrado");
    (function paso(t) {
      var avance = Math.max(0, (t - inicio) / dura), corte = Math.floor(avance * largo), pos = 0;
      partes.forEach(function (p) {
        var txt = "";
        for (var i = 0; i < p.f.length; i++, pos++) txt += pos < corte || p.f.charAt(i) === " " ? p.f.charAt(i) : glifo();
        p.n.nodeValue = txt;
      });
      if (avance < 1) requestAnimationFrame(paso);
      else { partes.forEach(function (p) { p.n.nodeValue = p.f; }); nd.classList.remove("is-cifrado"); }
    })(performance.now());
  }
  // Al irse, el texto se vuelve caracteres
  function cifra(nd) {
    if (reduce) return;
    var textos = [];
    (function camina(el) {
      Array.prototype.forEach.call(el.childNodes, function (k) {
        if (k.nodeType === 3) textos.push(k); else camina(k);
      });
    })(nd);
    var n = 0, t = setInterval(function () {
      textos.forEach(function (k) { k.nodeValue = k.nodeValue.replace(/\S/g, glifo); });
      if (++n > 10) clearInterval(t);
    }, 50);
  }
  function animaNuevos() {
    $$(".is-in > .dom__nd", tree).forEach(function (nd, i) { gota(nd); descifra(nd, 160 + i * 60); });
    if (st.nuevos.length) llueve(1600);
  }

  /* ---------- Pintar ---------- */
  function ficha(n) {
    var cls = ["dom__nd"];
    cls.push(n.x != null ? "dom__nd--tx" : n.t === "#document" ? "dom__nd--doc" : "dom__nd--el");
    if (st.sel === n.u) cls.push("is-sel");
    if (st.found === n.u) cls.push("is-found");
    var id = idDe(n), dentro;
    if (n.x != null) dentro = '"' + esc(n.x) + '"';
    else if (n.t === "#document") dentro = "document";
    else dentro = "<b>&lt;" + esc(n.t) + "&gt;</b>" + (n.a || []).map(function (a) { return '<i class="at">' + esc(a[0]) + '="' + esc(a[1]) + '"</i>'; }).join("");
    return '<span class="' + cls.join(" ") + '" data-u="' + n.u + '"' + (id != null ? ' data-id="' + esc(id) + '"' : "") + ' tabindex="0" role="button">' + dentro + "</span>" +
      (st.found === n.u ? '<span class="dom__elem">elem</span>' : "");
  }
  function rama(n) {
    var hijos = (n.c || []).filter(visible);
    return "<li" + (st.nuevos.indexOf(n.u) >= 0 ? ' class="is-in"' : "") + ">" + ficha(n) +
      (hijos.length ? "<ul>" + hijos.map(rama).join("") + "</ul>" : "") + "</li>";
  }
  function pintaArbol() {
    tree.innerHTML = '<ul class="dom__tr">' + rama(st.m) + "</ul>";
    animaNuevos();
  }

  function aparece(el, si) {
    var antes = !el.hidden;
    el.hidden = !si;
    if (si && !antes) { el.classList.remove("is-new"); void el.offsetWidth; el.classList.add("is-new"); }
  }
  function pintaPagina() {
    var k = st.k, t = k >= 4 ? "Mi página" : "mi-pagina.html";
    if (tab.textContent !== t) { tab.textContent = t; if (k >= 4) { tab.classList.remove("is-new"); void tab.offsetWidth; tab.classList.add("is-new"); } }
    page.classList.toggle("is-on", k >= 5);
    aparece(rectEl, k >= 6);
    var html = k >= 7 ? st.rect : "";
    if (rectEl.innerHTML !== html) rectEl.innerHTML = html;
    aparece(b1, k >= 8);
    aparece(b2, k >= 9);
  }
  function pintaCodigo() {
    codeEl.innerHTML = lineas().map(function (l) {
      return '<span class="dom__ln" data-r="' + l.r + '"' + (l.s ? ' data-s="' + l.s + '"' : "") + ">" + l.h + "</span>";
    }).join("");
    marcaCodigo();
  }
  function marcaCodigo() {
    $$(".dom__ln", codeEl).forEach(function (l) { l.classList.toggle("is-unread", +l.getAttribute("data-r") > st.k); });
    $$("[data-s]", codeEl).forEach(function (e) { e.classList.toggle("is-on", st.hl != null && e.getAttribute("data-s") === String(st.hl)); });
    $$("[data-part]", codeEl).forEach(function (p) { p.classList.toggle("is-on", p.getAttribute("data-part") === st.part); });
  }
  function resalta(s) { st.hl = s; st.part = null; marcaCodigo(); }
  function part(name) { st.part = name; st.hl = null; marcaCodigo(); }
  function barra(modo, frac, lbl) {
    prog.className = "dom__prog dom__prog--" + modo;
    $("i", prog).style.width = Math.round(Math.max(0, Math.min(1, frac)) * 100) + "%";
    $(".dom__lbl", prog).innerHTML = lbl;
  }
  function barraArbol() {
    var n = cuenta(st.m);
    if (st.cambio) barra("found", 1, "Nodos en el árbol: <b>" + n + "</b>");
    else barra("build", st.k / PASOS, st.k >= PASOS ? "Árbol completo: <b>" + n + "</b> nodos" : "Nodos en el árbol: <b>" + n + "</b> de " + TOTAL);
  }
  // La explicación cambia con desvanecido, como la x del 4-7
  function say(html) {
    if (html === status._html) return;
    status._html = html;
    clearTimeout(status._t);
    if (reduce || !status.innerHTML) { status.classList.remove("is-fading"); status.innerHTML = html; return; }
    status.classList.add("is-fading");
    status._t = setTimeout(function () { status.innerHTML = html; status.classList.remove("is-fading"); }, 200);
  }
  function marcaPagina(el) {
    $$(".is-sel", page.parentNode).forEach(function (e) { e.classList.remove("is-sel"); });
    if (el) el.classList.add("is-sel");
  }
  function controles() {
    btnBack.disabled = st.busy || st.k <= 0;
    btnStep.disabled = st.busy || st.k >= PASOS;
    btnPlay.disabled = st.busy;
    btnPlay.innerHTML = st.playing ? ICON.pause : ICON.play;
    btnPlay.setAttribute("aria-label", st.playing ? "Pausa" : "Reproducir");
    btnPlay.title = st.playing ? "Pausa" : "Reproducir";
    b1.disabled = b2.disabled = st.busy;
    $$(".dom__valor", codeEl).forEach(function (v) { v.disabled = st.busy; });
  }

  /* ---------- Armar el árbol paso a paso ---------- */
  function reinicia() {
    st.sig = 0; st.nodo = {}; st.padre = {};
    st.m = modelo(); numera(st.m);
    st.rect = esc(INIT); st.cambio = false; st.found = null; st.sel = null; st.nuevos = [];
    out.innerHTML = "";
    root.classList.remove("is-null", "dom--corrio");
  }
  function ir(k, conTexto) {
    if (st.cambio) reinicia();   // regresar o avanzar es volver a leer el HTML
    st.k = k; st.sel = null; st.found = null;
    st.nuevos = Object.keys(st.nodo).filter(function (u) { return st.nodo[u].s === k && k > 0; });
    pintaArbol(); pintaPagina(); resalta(k || null); barraArbol(); marcaPagina(null);
    $$(".is-found", page).forEach(function (e) { e.classList.remove("is-found"); });
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
    if (st.k >= PASOS || st.cambio) ir(0, false);
    controles();
    sigue();
  });
  btnStep.addEventListener("click", function () { btnPlay.classList.remove("is-hint"); para(); if (st.k < PASOS) ir(st.k + 1, true); });
  btnBack.addEventListener("click", function () { para(); if (st.k > 0) ir(st.k - 1, true); });
  btnReset.addEventListener("click", function () {
    token++; para(); st.busy = false;
    reinicia(); ir(0, false);
    say(""); status._html = "";
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
    if (n.x != null) {
      txt = '"' + esc(n.x) + '" es un <code>nodo de texto</code>: el contenido de su padre, ' + nombre(p) + ". Los nodos de texto no tienen hijos.";
      if (n.s === 0) txt += " Lo creó <code>innerHTML</code>.";
      return txt;
    }
    var id = idDe(n), on = (n.a || []).filter(function (a) { return a[0] === "onclick"; })[0];
    if (n.s === 0) txt = "es un elemento nuevo: lo creó <code>innerHTML</code> a partir del texto entre comillas.";
    else if (id) txt = 'tiene el atributo id="' + esc(id) + '". Como ningún otro elemento usa ese id, <code>getElementById("' + esc(id) + '")</code> lo puede encontrar.';
    else if (on) txt = "tiene el atributo <code>onclick</code>: al hacerle clic ejecuta <code>" + esc(on[1]) + "</code>.";
    else txt = DESC[n.t] || "es un nodo de elemento.";
    return "<code>&lt;" + esc(n.t) + "&gt;</code> " + txt + " Su padre es " + nombre(p) + " y " + hijosDe(n);
  }
  function enPagina(n) {
    while (n && !n.ref) n = st.padre[n.u];
    return n ? REF[n.ref] : null;
  }
  function selecciona(u) {
    if (st.busy || !st.nodo[u]) return;
    para();
    var n = st.nodo[u];
    st.sel = u; st.nuevos = [];
    pintaArbol();
    if (n.s === 0 && n.t !== "#document") part("inner-" + st.last);
    else resalta(n.s || null);
    marcaPagina(n.t === "#document" ? null : enPagina(n));
    say(explica(n));
  }
  tree.addEventListener("click", function (e) { var nd = e.target.closest(".dom__nd"); if (nd) selecciona(nd.getAttribute("data-u")); });
  tree.addEventListener("keydown", function (e) {
    if ((e.key === "Enter" || e.key === " ") && e.target.matches(".dom__nd")) { e.preventDefault(); selecciona(e.target.getAttribute("data-u")); }
  });
  function nodoDe(ref) { return Object.keys(st.nodo).filter(function (u) { return st.nodo[u].ref === ref; })[0]; }
  rectEl.addEventListener("click", function (e) { e.preventDefault(); selecciona(nodoDe("rect")); });
  tab.addEventListener("click", function () { if (st.k >= 3) selecciona(nodoDe("tab")); });

  /* ---------- Cambiar y Enlace ---------- */
  var token = 0;
  function log(text, cls) {
    $$("span.is-new", out).forEach(function (s) { s.classList.remove("is-new"); });
    var s = document.createElement("span");
    s.className = "is-new" + (cls ? " " + cls : "");
    s.textContent = text;
    out.appendChild(s);
    while (out.children.length > 4) out.removeChild(out.firstChild);
  }
  // Las opciones son fijas, pero igual se le quitan al HTML los eventos antes de pintarlo
  function fragmento(html) {
    var t = document.createElement("template");
    t.innerHTML = html;
    $$("*", t.content).forEach(function (el) {
      Array.prototype.slice.call(el.attributes).forEach(function (a) { if (/^on/i.test(a.name)) el.removeAttribute(a.name); });
    });
    return t.content;
  }
  function deFrag(p) {
    var r = [];
    Array.prototype.forEach.call(p.childNodes, function (k) {
      if (k.nodeType === 3 && k.nodeValue.trim()) r.push({ x: k.nodeValue, s: 0, pend: true });
      else if (k.nodeType === 1) r.push({ t: k.tagName.toLowerCase(), s: 0, pend: true, a: Array.prototype.map.call(k.attributes, function (a) { return [a.name, a.value]; }), c: deFrag(k) });
    });
    return r;
  }
  function etiquetas(frag) {
    var t = [];
    $$("*", frag).forEach(function (el) { var n = el.tagName.toLowerCase(); if (t.indexOf(n) < 0) t.push(n); });
    return t;
  }

  async function run(key, boton) {
    if (st.busy) return;
    if (st.k < PASOS) {
      boton.classList.remove("is-nofn"); void boton.offsetWidth; boton.classList.add("is-nofn");
      say("Todavía no existe la función <code>" + (key === "c" ? "cambiar()" : "enlace()") + "</code>: el navegador aún no lee el <code>&lt;script&gt;</code> donde está escrita.");
      return;
    }
    var my = ++token;
    cerrarMenu();
    para();
    st.busy = true; st.last = key; controles();
    root.classList.add("dom--corrio");
    root.classList.remove("is-null");
    var id = val["id-" + key], html = val["txt-" + key];
    var fname = key === "c" ? "cambiar" : "enlace", label = key === "c" ? "Cambiar" : "Enlace";
    st.sel = null; st.found = null; st.nuevos = [];
    pintaArbol(); marcaPagina(null);
    $$(".is-found", page).forEach(function (e) { e.classList.remove("is-found"); });

    part("click-" + key);
    say("Al hacer clic en el botón " + label + ", su atributo <code>onclick</code> ejecuta la función <code>" + fname + "()</code>.");
    await wait(1500); if (my !== token) return;

    // getElementById revisa los nodos de elemento en orden, empezando por document
    part("get-" + key);
    say('<code>document.getElementById("' + esc(id) + '")</code> recorre el árbol desde document, nodo por nodo, buscando el que tenga el id "' + esc(id) + '"…');
    llueve(4000);
    var lista = enOrden(st.m, []).filter(function (n) { return n.x == null && visible(n); });
    var hallado = null, i;
    for (i = 0; i < lista.length; i++) {
      var chip = tree.querySelector('[data-u="' + lista[i].u + '"]');
      chip.classList.add("is-scan");
      barra("search", (i + 1) / lista.length, "getElementById revisó <b>" + (i + 1) + "</b> de " + lista.length + " nodos");
      await wait(330);
      chip.classList.remove("is-scan");
      if (my !== token) return;
      if (idDe(lista[i]) === id) { hallado = lista[i]; break; }
    }
    if (!hallado) {
      root.classList.add("is-null");
      barra("null", 1, "Revisó los <b>" + lista.length + "</b> nodos y ninguno tiene el id \"" + esc(id) + "\"");
      say('No hay ningún elemento con el id "' + esc(id) + '", así que <code>document.getElementById("' + esc(id) + '")</code> regresa <code>null</code> y la variable elem queda vacía.');
      await wait(2000); if (my !== token) return;
      part("inner-" + key);
      log("Uncaught TypeError: Cannot set properties of null (setting 'innerHTML')", "err");
      say("Como elem es <code>null</code>, la línea <code>elem.innerHTML</code> marca error y la función se detiene. El id del código tiene que ser igual, letra por letra, al de la página.");
      st.busy = false; controles();
      return;
    }
    st.found = hallado.u;
    pintaArbol();
    var pel = enPagina(hallado);
    if (pel) pel.classList.add("is-found");
    barra("found", (i + 1) / lista.length, "Lo encontró en el nodo <b>" + nombre(hallado) + "</b> después de revisar " + (i + 1) + " de " + lista.length);
    say('<code>document.getElementById("' + esc(id) + '")</code> encontró el elemento con el id "' + esc(id) + '" y lo guardó en la variable elem.');
    await wait(1800); if (my !== token) return;

    // innerHTML: los hijos de elem se deshacen en caracteres y nacen los nuevos, uno por uno
    part("inner-" + key);
    var frag = fragmento(html), tags = etiquetas(frag), extra = "";
    if (tags.indexOf("a") >= 0) extra = " Como el texto trae la etiqueta &lt;a&gt;, el navegador crea elementos nuevos dentro de elem.";
    else if (tags.length) extra = " Como el texto trae la etiqueta &lt;" + esc(tags[0]) + "&gt;, el navegador crea un elemento nuevo dentro de elem.";
    say("<code>innerHTML</code> borra todo lo que había dentro de elem y lo reemplaza por el texto entre comillas." + extra);
    var li = tree.querySelector('[data-u="' + hallado.u + '"]').parentNode, ul = li.querySelector(":scope > ul");
    if (ul) $$(":scope > li", ul).forEach(function (l) { l.classList.add("is-out"); $$(".dom__nd", l).forEach(cifra); });
    (hallado.c || []).forEach(function (k) { delete st.nodo[k.u]; });
    barra("build", 0, "Borrando lo que había dentro de <b>" + nombre(hallado) + "</b>…");
    llueve(3000);
    await wait(750); if (my !== token) return;
    var nuevos = deFrag(frag);
    hallado.c = nuevos;
    nuevos.forEach(function (n) { numera(n, hallado); });
    var orden = [];
    nuevos.forEach(function (n) { enOrden(n, orden); });
    st.cambio = true;
    if (!orden.length) { pintaArbol(); barra("build", 1, "innerHTML dejó el elemento vacío"); }
    for (var j = 0; j < orden.length; j++) {
      orden[j].pend = false;
      st.nuevos = [orden[j].u];
      pintaArbol();
      barra("build", (j + 1) / orden.length, "innerHTML creó <b>" + (j + 1) + "</b> de " + orden.length + " nodo" + (orden.length === 1 ? "" : "s") + " nuevo" + (orden.length === 1 ? "" : "s"));
      await wait(800); if (my !== token) return;
    }
    st.nuevos = [];
    var tmp = document.createElement("div");
    tmp.appendChild(frag.cloneNode(true));
    $$("a", tmp).forEach(function (a) { a.setAttribute("href", "#"); });
    st.rect = tmp.innerHTML;
    pintaPagina();
    if (pel) { pel.classList.remove("is-flash"); void pel.offsetWidth; pel.classList.add("is-flash", "is-found"); }
    await wait(700); if (my !== token) return;

    part("log-" + key);
    var d = document.createElement("div"); d.appendChild(frag.cloneNode(true));
    log(d.innerHTML || '""');
    barraArbol();
    await wait(900); if (my !== token) return;
    part(null);
    st.busy = false; controles();
  }
  b1.addEventListener("click", function () { run("c", b1); });
  b2.addEventListener("click", function () { run("e", b2); });

  /* ---------- El menú de vidrio para cambiar los valores (estándar del 3-23) ---------- */
  var abierto = null;
  function opciones(que) {
    var lista = que.indexOf("id") === 0 ? OPC.id : OPC[que.slice(-1)];
    return lista.map(function (v) { return { html: "<code>\"" + esc(v) + "\"</code>", valor: v, actual: v === val[que] }; });
  }
  function abrirMenu(origen) {
    cerrarMenu();
    var que = origen.getAttribute("data-k"), ops = opciones(que);
    abierto = { origen: origen, que: que, opciones: ops };
    origen.classList.add("is-abierta");
    origen.setAttribute("aria-expanded", "true");
    menu.innerHTML = ops.map(function (o, n) {
      return '<button type="button" role="menuitem" class="dom__opcion' + (o.actual ? " is-actual" : "") + '" data-i="' + n + '">' + o.html + "</button>";
    }).join("");
    menu.hidden = false;
    var r = root.getBoundingClientRect(), o = origen.getBoundingClientRect();
    var w = menu.offsetWidth, h = menu.offsetHeight;
    var left = Math.max(4, Math.min(o.left - r.left, r.width - w - 4));
    var top = o.bottom - r.top + 6;
    if (o.bottom + h + 6 > window.innerHeight && o.top - h - 6 > 0) top = o.top - r.top - h - 6;
    menu.style.left = left + "px";
    menu.style.top = top + "px";
    menu.style.setProperty("--origen", Math.max(0, Math.min(w, o.left - r.left - left + 20)) + "px " + (top < o.top - r.top ? h + "px" : "0"));
    requestAnimationFrame(function () { menu.classList.add("is-on"); });
    (menu.querySelector(".is-actual") || menu.querySelector(".dom__opcion")).focus({ preventScroll: true });
  }
  function cerrarMenu(devolverFoco) {
    if (!abierto) return;
    var origen = abierto.origen;
    origen.classList.remove("is-abierta");
    origen.removeAttribute("aria-expanded");
    menu.hidden = true;
    menu.classList.remove("is-on");
    abierto = null;
    if (devolverFoco && document.body.contains(origen)) origen.focus({ preventScroll: true });
  }
  function cambia(que, v) {
    if (val[que] === v) return;
    val[que] = v;
    pintaCodigo();
    say(aviso(que, v));
    var t = codeEl.querySelector('[data-k="' + que + '"]');
    if (t) t.focus({ preventScroll: true });
  }
  menu.addEventListener("click", function (e) {
    var op = e.target.closest(".dom__opcion");
    if (!op || !abierto) return;
    var que = abierto.que, o = abierto.opciones[+op.getAttribute("data-i")];
    cerrarMenu();
    cambia(que, o.valor);
  });
  menu.addEventListener("keydown", function (e) {
    var ops = Array.prototype.slice.call(menu.querySelectorAll(".dom__opcion"));
    var n = ops.indexOf(document.activeElement);
    if (e.key === "ArrowDown") { e.preventDefault(); ops[(n + 1) % ops.length].focus(); }
    if (e.key === "ArrowUp") { e.preventDefault(); ops[(n - 1 + ops.length) % ops.length].focus(); }
    if (e.key === "Escape") { e.preventDefault(); cerrarMenu(true); }
    if (e.key === "Tab") cerrarMenu();
  });
  document.addEventListener("pointerdown", function (e) {
    if (abierto && !menu.contains(e.target) && !abierto.origen.contains(e.target)) cerrarMenu();
  });
  window.addEventListener("resize", function () { cerrarMenu(); });
  codeEl.addEventListener("click", function (e) {
    var t = e.target.closest("[data-k]");
    if (!t || t.disabled) return;
    if (abierto && abierto.origen === t) cerrarMenu();
    else abrirMenu(t);
  });

  root.classList.add("dom--ready");
  reinicia();
  pintaCodigo();
  ir(0, false);
})();
