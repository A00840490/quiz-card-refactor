/* Módulo 4-9: el switch como una máquina expendedora (estilos en
   assets/css/modulos/modulo4/modulo4-9-maquina.css).

   var codigo guarda el código que se marcó en la máquina y switch (codigo)
   lo compara con cada case, de arriba hacia abajo: la etiqueta de cada
   producto se pone roja si no coincide y verde si sí. En el case que
   coincide, el resorte que sostiene el producto da una vuelta, el producto
   sale hacia el frente y cae a la charola, y la consola muestra su nombre.
   break termina la compra (la pantalla cambia el código por GRACIAS). Sin
   el break de A2, el código sigue de largo al case de A3 y caen dos
   productos. Si ningún case coincide (B7), se ejecuta el default y la
   máquina regresa la moneda.

   El recorrido se arma como una lista de pasos y la escena se pinta a partir
   del paso en el que vamos, así que avanzar y regresar usan el mismo código.
   Dentro de la ventana de código, el valor de codigo y el break de A2 son
   listas desplegables (el menú de vidrio del 3-23). Con "reducir
   movimiento" todo ocurre sin animaciones. */
(function () {
  "use strict";

  var root = document.querySelector("[data-maquina]");
  if (!root) return;

  var TEXTURAS = "../../assets/images/course/modulo4/m4-11/tocadiscos/texturas/";

  // El ejemplo: cada case es un producto de la repisa
  var VAR = "codigo";
  var CASES = [
    { val: "A1", out: "Papas", cae: "las papas caen" },
    { val: "A2", out: "Galletas", cae: "las galletas caen" },
    { val: "A3", out: "Chocolate", cae: "el chocolate cae" }
  ];
  var DEF = "Código no válido";
  var OPCIONES = ["A1", "A2", "A3", "B7"];
  var CON_MENU = 1; // el break de este case es una lista desplegable

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var st = { valor: "A2", brk: true, n: -1, pasos: [] };

  var codeEl = root.querySelector("[data-code]");
  var consola = root.querySelector("[data-console]");
  var status = root.querySelector("[data-status]");
  var menu = root.querySelector("[data-menu]");
  var b = {
    reset: root.querySelector("[data-reset]"),
    back: root.querySelector("[data-back]"),
    step: root.querySelector("[data-step]")
  };

  function each(list, fn) { Array.prototype.forEach.call(list, fn); }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function lit(v) { return '"' + v + '"'; }
  function reinicia(el, clase) { el.classList.remove(clase); void el.getBoundingClientRect(); el.classList.add(clase); }

  /* ---------- La máquina (SVG) ----------
     De frente: a la izquierda el vidrio con la repisa (tres productos, cada
     uno dentro de su resorte) y abajo la charola; a la derecha el panel de
     aluminio con la pantalla, el hueco de las teclas (las teclas son botones
     de la página encima del dibujo), la ranura de monedas y el cambio. */
  var X = [74, 153, 232];         // centro de cada producto
  var PISO = 212;                 // donde se apoyan los productos
  var RC = 31, CY = PISO - 29;    // radio y centro del resorte
  var FUGA = { x: 153, y: 150 };  // punto de fuga del fondo de la máquina
  var CAIDA = [{ dy: 192, a: -7, s: 1.06 }, { dy: 192, a: 5, s: 1.06 }, { dy: 191, a: -9, s: 1.06 }];
  var QUIETO = { dy: 0, a: 0, s: 1 };

  function dibujaProducto(i, cx) {
    var y = PISO;
    if (i === 0) { // bolsa de papas
      return '<path d="M' + (cx - 25) + " " + y + " L" + (cx - 27) + " " + (y - 70) + " Q" + cx + " " + (y - 78) + " " + (cx + 27) + " " + (y - 70) + " L" + (cx + 25) + " " + y + ' Z" fill="url(#maqPapas)" stroke="#a87b0c"/>' +
        '<path d="M' + (cx - 27) + " " + (y - 70) + " Q" + cx + " " + (y - 78) + " " + (cx + 27) + " " + (y - 70) + '" fill="none" stroke="#fff0a8" stroke-width="3" stroke-dasharray="2 2"/>' +
        '<path d="M' + (cx - 25) + " " + (y - 3) + " L" + (cx + 25) + " " + (y - 3) + '" stroke="#c89512" stroke-width="3" stroke-dasharray="2 2"/>' +
        '<rect x="' + (cx - 25.5) + '" y="' + (y - 47) + '" width="51" height="18" fill="#d63b2a"/>' +
        '<text x="' + cx + '" y="' + (y - 34.5) + '" text-anchor="middle" font-family="Fira Sans, Arial, sans-serif" font-weight="800" font-size="10" fill="#ffffff">PAPAS</text>' +
        '<ellipse cx="' + (cx - 9) + '" cy="' + (y - 16) + '" rx="8" ry="5" fill="#f7dd84" stroke="#c99a1e"/>' +
        '<ellipse cx="' + (cx + 8) + '" cy="' + (y - 13) + '" rx="7" ry="4.5" fill="#f7dd84" stroke="#c99a1e"/>' +
        '<path d="M' + (cx - 17) + " " + (y - 64) + " L" + (cx - 15) + " " + (y - 8) + '" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity=".28"/>';
    }
    if (i === 1) { // caja de galletas
      return '<rect x="' + (cx - 25) + '" y="' + (y - 62) + '" width="50" height="62" rx="3" fill="url(#maqGalletas)" stroke="#1a4589"/>' +
        '<rect x="' + (cx - 25) + '" y="' + (y - 62) + '" width="50" height="14" rx="3" fill="#1a4589"/>' +
        '<text x="' + cx + '" y="' + (y - 51.5) + '" text-anchor="middle" font-family="Fira Sans, Arial, sans-serif" font-weight="800" font-size="8" fill="#ffffff">GALLETAS</text>' +
        '<circle cx="' + (cx - 9) + '" cy="' + (y - 28) + '" r="10" fill="#d9a35b" stroke="#a8742e"/>' +
        '<circle cx="' + (cx + 10) + '" cy="' + (y - 18) + '" r="10" fill="#d9a35b" stroke="#a8742e"/>' +
        '<circle cx="' + (cx - 12) + '" cy="' + (y - 31) + '" r="1.8" fill="#5a3412"/><circle cx="' + (cx - 5) + '" cy="' + (y - 25) + '" r="1.8" fill="#5a3412"/>' +
        '<circle cx="' + (cx + 7) + '" cy="' + (y - 20) + '" r="1.8" fill="#5a3412"/><circle cx="' + (cx + 13) + '" cy="' + (y - 15) + '" r="1.8" fill="#5a3412"/>' +
        '<rect x="' + (cx - 21) + '" y="' + (y - 46) + '" width="4" height="42" rx="2" fill="#ffffff" opacity=".2"/>';
    }
    // barra de chocolate
    return '<rect x="' + (cx - 15) + '" y="' + (y - 78) + '" width="30" height="78" rx="2" fill="#4a2516" stroke="#2c140a"/>' +
      '<rect x="' + (cx - 15) + '" y="' + (y - 78) + '" width="30" height="9" fill="url(#maqAcero)"/>' +
      '<rect x="' + (cx - 15) + '" y="' + (y - 55) + '" width="30" height="34" fill="#c8322a"/>' +
      '<text transform="translate(' + (cx + 4) + " " + (y - 38) + ') rotate(-90)" text-anchor="middle" font-family="Fira Sans, Arial, sans-serif" font-weight="800" font-size="9.5" fill="#ffffff">CHOCO</text>' +
      '<rect x="' + (cx - 12) + '" y="' + (y - 68) + '" width="3.5" height="64" rx="1.7" fill="#ffffff" opacity=".18"/>';
  }

  // El resorte visto de frente: anillos que se van haciendo chicos hacia el
  // fondo (detrás del producto) y la punta de enfrente, abierta, que se ve
  // girar (delante del producto)
  function espiral(cx, cy, r, vuelta, punta) {
    var d = "", pasos = 36;
    for (var k = 0; k <= pasos; k++) {
      var t = k / pasos, ang = (-70 + vuelta * t) * Math.PI / 180, rr = r * (1 - .05 * t);
      d += (k ? " L" : "M") + (cx + rr * Math.cos(ang)).toFixed(2) + " " + (cy + rr * Math.sin(ang)).toFixed(2);
    }
    if (punta) {
      var fin = (-70 + vuelta) * Math.PI / 180;
      d += " L" + (cx + (r + 7) * Math.cos(fin + .18)).toFixed(2) + " " + (cy + (r + 7) * Math.sin(fin + .18)).toFixed(2);
    }
    return d;
  }

  function dibujaResorte(i, cx) {
    var atras = "", centro = cx + "px " + CY + "px";
    for (var k = 3; k >= 1; k--) {
      var s = 1 - .14 * k;
      var c = { x: FUGA.x + (cx - FUGA.x) * s, y: FUGA.y + (CY - FUGA.y) * s };
      atras += '<path d="' + espiral(c.x, c.y, RC * s, 340, false) + '" stroke-width="' + (1.8 * s).toFixed(2) + '" opacity="' + (1 - .2 * k).toFixed(2) + '"/>';
    }
    var frente = espiral(cx, CY, RC, 330, true);
    return {
      atras: '<g class="maq__giro" data-giro="' + i + '" style="transform-origin:' + centro + '" fill="none" stroke="#6f7884" stroke-linecap="round">' + atras + "</g>",
      frente: '<g class="maq__giro" data-giro="' + i + '" style="transform-origin:' + centro + '" fill="none" stroke-linecap="round">' +
        '<path d="' + frente + '" stroke="#2a2f37" stroke-width="3" opacity=".8"/>' +
        '<path d="' + frente + '" stroke="#aeb6c1" stroke-width="1.7"/>' +
        '<path d="' + frente + '" stroke="#ffffff" stroke-width=".7" opacity=".7" stroke-dasharray="10 26"/></g>'
    };
  }

  function dibujaMaquina() {
    var luces = "", casas = "", etiquetas = "";
    X.forEach(function (cx, i) {
      luces += '<polygon class="maq__luz" data-luz="' + i + '" points="' + (cx - 11) + ",65 " + (cx + 11) + ",65 " + (cx + 40) + "," + (PISO + 2) + " " + (cx - 40) + "," + (PISO + 2) + '" fill="url(#maqLuz)"/>';
      var r = dibujaResorte(i, cx);
      casas += r.atras +
        '<g data-casa="' + i + '"><g class="maq__prod" data-prod="' + i + '"><g class="maq__prod-in">' + dibujaProducto(i, cx) + "</g></g></g>" +
        r.frente;
      etiquetas += '<g class="maq__tag" data-tag="' + i + '"><rect x="' + (cx - 19) + '" y="229" width="38" height="19" rx="3"/>' +
        '<text x="' + cx + '" y="242.5">' + CASES[i].val + "</text></g>" +
        '<rect class="maq__onda" data-onda="' + i + '" x="' + (cx - 19) + '" y="229" width="38" height="19" rx="3"/>';
    });

    return '<svg class="maq__svg" viewBox="0 0 400 440" role="img" aria-label="Máquina expendedora con tres productos: A1 papas, A2 galletas y A3 chocolate">' +
      "<defs>" +
        '<linearGradient id="maqCuerpo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#dc3a40"/><stop offset=".55" stop-color="#b8242b"/><stop offset="1" stop-color="#8a181e"/></linearGradient>' +
        '<linearGradient id="maqDentro" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2e384d"/><stop offset="1" stop-color="#121722"/></linearGradient>' +
        '<linearGradient id="maqVidrio" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".24"/><stop offset=".3" stop-color="#ffffff" stop-opacity=".05"/><stop offset=".55" stop-color="#ffffff" stop-opacity="0"/><stop offset="1" stop-color="#ffffff" stop-opacity=".1"/></linearGradient>' +
        '<linearGradient id="maqAcero" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1f3f6"/><stop offset="1" stop-color="#8f98a5"/></linearGradient>' +
        '<linearGradient id="maqSombra" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000000" stop-opacity=".28"/><stop offset=".12" stop-color="#000000" stop-opacity="0"/><stop offset=".85" stop-color="#ffffff" stop-opacity="0"/><stop offset="1" stop-color="#ffffff" stop-opacity=".25"/></linearGradient>' +
        '<linearGradient id="maqLuz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6d6" stop-opacity=".95"/><stop offset="1" stop-color="#fff6d6" stop-opacity=".05"/></linearGradient>' +
        '<linearGradient id="maqLuzAmbar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd27a" stop-opacity=".95"/><stop offset="1" stop-color="#ffd27a" stop-opacity=".05"/></linearGradient>' +
        '<linearGradient id="maqPapas" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d9a116"/><stop offset=".35" stop-color="#ffd84d"/><stop offset=".7" stop-color="#f2c230"/><stop offset="1" stop-color="#c98f10"/></linearGradient>' +
        '<linearGradient id="maqGalletas" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2a63bf"/><stop offset=".4" stop-color="#3d82e6"/><stop offset="1" stop-color="#1f56ad"/></linearGradient>' +
        '<radialGradient id="maqMonedaG" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#fff1b8"/><stop offset=".6" stop-color="#e2b23c"/><stop offset="1" stop-color="#a57a1c"/></radialGradient>' +
        '<clipPath id="maqClip"><rect x="30" y="56" width="246" height="236" rx="6"/><rect x="40" y="330" width="226" height="80" rx="8"/></clipPath>' +
        '<clipPath id="maqTaza"><rect x="306" y="344" width="56" height="48" rx="7"/></clipPath>' +
      "</defs>" +
      // el cuerpo, con un brillo en la orilla izquierda
      '<rect x="8" y="8" width="384" height="424" rx="20" fill="url(#maqCuerpo)" stroke="#6d1217" stroke-width="2"/>' +
      '<rect x="14" y="14" width="372" height="5" rx="2.5" fill="#ffffff" opacity=".2"/>' +
      '<rect x="14" y="22" width="5" height="402" rx="2.5" fill="#ffffff" opacity=".12"/>' +
      '<text class="maq__titulo" x="200" y="43">SNACKS</text>' +
      // el vidrio con la repisa
      '<rect x="30" y="56" width="246" height="236" rx="6" fill="url(#maqDentro)"/>' +
      '<rect x="36" y="60" width="234" height="5" rx="2.5" fill="#fff6d0" opacity=".7"/>' +
      '<rect x="40" y="330" width="226" height="80" rx="8" fill="#0d1018"/>' +
      '<g clip-path="url(#maqClip)">' + luces + "</g>" +
      '<rect x="34" y="214" width="238" height="9" rx="2" fill="url(#maqAcero)"/>' +
      etiquetas +
      '<g clip-path="url(#maqClip)">' + casas + '<g data-frente></g></g>' +
      '<rect x="40" y="330" width="226" height="38" rx="8" fill="#3a4152" opacity=".72"/>' +
      '<rect x="40" y="330" width="226" height="3" rx="1.5" fill="#ffffff" opacity=".18"/>' +
      '<rect x="30" y="56" width="246" height="236" rx="6" fill="url(#maqVidrio)"/>' +
      '<rect x="30" y="56" width="246" height="236" rx="6" fill="none" stroke="#5c0f13" stroke-width="3"/>' +
      // el panel de aluminio
      '<clipPath id="maqPanel"><rect x="288" y="56" width="92" height="354" rx="8"/></clipPath>' +
      '<image href="' + TEXTURAS + 'aluminio.jpg" x="200" y="56" width="354" height="354" preserveAspectRatio="xMidYMid slice" clip-path="url(#maqPanel)"/>' +
      '<rect x="288" y="56" width="92" height="354" rx="8" fill="url(#maqSombra)" stroke="#4b525d"/>' +
      '<g class="maq__pantalla" data-pantalla><rect x="294" y="64" width="80" height="58" rx="5" fill="#15181d"/>' +
      '<rect x="298" y="68" width="72" height="50" rx="3" fill="#0b2214"/>' +
      '<text class="maq__codigo" x="334" y="98" data-codigo></text><text class="maq__msg" x="334" y="112" data-msg></text></g>' +
      // el hueco de las teclas
      '<rect x="299" y="133" width="70" height="128" rx="6" fill="#20242b" stroke="#0e1014"/>' +
      '<rect x="300" y="134" width="68" height="4" rx="2" fill="#000000" opacity=".35"/>' +
      // ranura de monedas y cambio
      '<rect x="318" y="274" width="32" height="40" rx="4" fill="url(#maqAcero)" stroke="#6f7886"/>' +
      '<rect x="331" y="282" width="6" height="24" rx="3" fill="#1b1e24"/>' +
      '<rect x="306" y="344" width="56" height="48" rx="7" fill="#0d1018" stroke="#1b1e24" stroke-width="2"/>' +
      '<g clip-path="url(#maqTaza)"><g class="maq__moneda"><ellipse cx="334" cy="381" rx="12" ry="5.5" fill="#a57a1c"/><ellipse cx="334" cy="379" rx="12" ry="5.5" fill="url(#maqMonedaG)"/></g></g>' +
      "</svg>";
  }

  root.querySelector("[data-maq-svg]").innerHTML = dibujaMaquina();

  var prods = root.querySelectorAll("[data-prod]");
  var casas = root.querySelectorAll("[data-casa]");
  var frente = root.querySelector("[data-frente]");
  var tags = root.querySelectorAll("[data-tag]");
  var ondas = root.querySelectorAll("[data-onda]");
  var luces = root.querySelectorAll("[data-luz]");
  var pantalla = root.querySelector("[data-pantalla]");
  var codigoTxt = root.querySelector("[data-codigo]");
  var msgTxt = root.querySelector("[data-msg]");

  /* ---------- Los productos se mueven con requestAnimationFrame ----------
     Así el producto puede pasar de su lugar (detrás de la punta del resorte)
     a la capa de enfrente justo cuando sale del resorte, sin cortar el
     movimiento. */
  var prodEstado = [QUIETO, QUIETO, QUIETO], prodCaido = [false, false, false], prodRaf = [0, 0, 0];

  function tfProd(i, p) {
    var bx = X[i];
    return "translate(0 " + p.dy.toFixed(2) + ") translate(" + bx + " " + PISO + ") rotate(" + p.a.toFixed(2) + ") scale(" + p.s.toFixed(3) + ") translate(" + (-bx) + " " + (-PISO) + ")";
  }
  function ponProd(i, p) { prodEstado[i] = p; prods[i].setAttribute("transform", tfProd(i, p)); }
  function capa(i, alFrente) {
    var dest = alFrente ? frente : casas[i];
    if (prods[i].parentNode !== dest) dest.appendChild(prods[i]);
  }
  function mezcla(a, c, t) { return { dy: a.dy + (c.dy - a.dy) * t, a: a.a + (c.a - a.a) * t, s: a.s + (c.s - a.s) * t }; }
  var EASE = {
    suave: function (t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; },
    cae: function (t) { return t * t; },
    sube: function (t) { return 1 - (1 - t) * (1 - t); }
  };

  // Recorre tramos {dur, a, ease, luego}; cada uno empieza donde quedó el anterior
  function mueve(i, tramos) {
    cancelAnimationFrame(prodRaf[i]);
    var k = 0, desde = prodEstado[i], t0 = performance.now();
    (function tic(ahora) {
      var tr = tramos[k], t = Math.min(1, (ahora - t0) / tr.dur);
      ponProd(i, mezcla(desde, tr.a, EASE[tr.ease](t)));
      if (t < 1) { prodRaf[i] = requestAnimationFrame(tic); return; }
      if (tr.luego) tr.luego();
      k++;
      if (k < tramos.length) { desde = tr.a; t0 = ahora; prodRaf[i] = requestAnimationFrame(tic); }
    })(t0);
  }

  function cae(i) {
    var c = CAIDA[i];
    mueve(i, [
      { dur: 1100, a: { dy: 4, a: 0, s: 1.12 }, ease: "suave", luego: function () { capa(i, true); } }, // el resorte lo empuja al frente
      { dur: 480, a: c, ease: "cae" },
      { dur: 140, a: { dy: c.dy - 6, a: c.a * .5, s: c.s }, ease: "sube" },
      { dur: 160, a: c, ease: "cae" }
    ]);
  }

  function regresa(i) {
    capa(i, true);
    mueve(i, [{ dur: 500, a: QUIETO, ease: "sube", luego: function () { capa(i, false); } }]);
  }

  function fijaProd(i, caido) {
    cancelAnimationFrame(prodRaf[i]);
    capa(i, caido);
    ponProd(i, caido ? CAIDA[i] : QUIETO);
  }

  /* ---------- Los pasos del switch ---------- */
  function hayBreak(i) { return i !== CON_MENU || st.brk; }

  function armaPasos() {
    var s = [{ k: "decl" }, { k: "sw" }], m = -1, fin = false;
    for (var i = 0; i < CASES.length; i++) {
      if (m < 0) {
        var ok = CASES[i].val === st.valor;
        s.push({ k: "cmp", i: i, ok: ok });
        if (!ok) continue;
        m = i;
        s.push({ k: "body", i: i, fall: false });
      } else {
        s.push({ k: "body", i: i, fall: true });
      }
      if (hayBreak(i)) { s.push({ k: "brk", i: i }); fin = true; break; }
    }
    if (!fin) {
      if (m < 0) { s.push({ k: "def" }); s.push({ k: "body", i: "d", fall: false }); }
      else s.push({ k: "body", i: "d", fall: true });
      s.push({ k: "end" });
    }
    st.pasos = s;
  }

  function parteDe(s) {
    if (s.k === "cmp") return "c" + s.i;
    if (s.k === "body") return s.i === "d" ? "bd" : "b" + s.i;
    if (s.k === "brk") return "k" + s.i;
    if (s.k === "def") return "d";
    return s.k; // decl, sw, end
  }

  /* ---------- El código ---------- */
  function valor(k, html, nombre, extra, parte) {
    return '<button type="button" class="maq__valor' + (extra || "") + '" data-k="' + k + '" data-part="' + parte + '" aria-haspopup="menu" aria-label="' + nombre + '. Elegir otro valor">' + html + "</button>";
  }

  function pintaCodigo() {
    var L = [];
    L.push('<span data-part="decl">var ' + VAR + " = </span>" + valor("valor", esc(lit(st.valor)), "Código marcado: " + st.valor, "", "decl") + '<span data-part="decl">;</span>');
    L.push("");
    L.push('<span data-part="sw">switch (' + VAR + ")</span> {");
    CASES.forEach(function (c, i) {
      L.push('  <span data-part="c' + i + '">case ' + esc(lit(c.val)) + ":</span>");
      L.push('    <span data-part="b' + i + '">console.log(' + esc(lit(c.out)) + ");</span>");
      if (i === CON_MENU) {
        L.push("    " + (st.brk
          ? valor("break", "break;", "break del case " + c.val, "", "k" + i)
          : valor("break", "// break;", "break del case " + c.val + ": quitado", " js-term__com", "k" + i)));
      } else {
        L.push('    <span data-part="k' + i + '">break;</span>');
      }
    });
    L.push('  <span data-part="d">default:</span>');
    L.push('    <span data-part="bd">console.log(' + esc(lit(DEF)) + ");</span>");
    L.push('<span data-part="end">}</span>');
    codeEl.innerHTML = L.join("\n");
  }

  function salida(i) { return i === "d" ? DEF : CASES[i].out; }

  function pintaConsola(dir) {
    var lineas = st.pasos.slice(0, st.n + 1).filter(function (s) { return s.k === "body"; }).map(function (s) { return salida(s.i); });
    var habia = consola.children.length;
    if (dir === 1 && lineas.length === habia + 1) {
      var sp = document.createElement("span");
      sp.className = "is-new";
      sp.textContent = lineas[lineas.length - 1];
      consola.appendChild(sp);
    } else if (lineas.length !== habia || dir === 0) {
      consola.innerHTML = lineas.map(function (l) { return "<span>" + esc(l) + "</span>"; }).join("");
    }
  }

  /* ---------- La explicación ----------
     Estándar .grafico-exp (como el tren del 4-6): el concepto y el código que
     se menciona van en <code> (azul, en negritas); lo demás en texto normal. */
  function cod(t) { return "<code>" + esc(t) + "</code>"; }

  function explica(s) {
    var v = lit(st.valor);
    switch (s.k) {
      case "decl":
        return cod("var " + VAR + " = " + v) + " guarda el código que se marcó en el teclado; la máquina lo muestra en su pantalla.";
      case "sw":
        return cod("switch (" + VAR + ")") + " toma el valor " + v + " y lo compara con cada " + cod("case") + ", de arriba hacia abajo. La máquina empieza a revisar las etiquetas de la repisa.";
      case "cmp":
        var c = CASES[s.i].val, comp = cod(v + " === " + lit(c));
        if (s.ok) return cod("case " + lit(c)) + ": " + comp + " da true, así que aquí empieza a ejecutarse el código. La etiqueta " + c + " se pone en verde.";
        return cod("case " + lit(c)) + ": " + comp + " da false. La etiqueta " + c + " se pone en rojo y el switch pasa al siguiente case.";
      case "body":
        var log = cod("console.log(" + lit(salida(s.i)) + ")");
        if (s.i === "d") return log + " muestra " + DEF + " en la consola y la máquina regresa la moneda.";
        if (s.fall) return "Como el case de arriba no tiene " + cod("break") + ", el código sigue de largo sin comparar " + cod("case " + lit(CASES[s.i].val)) + ": " + log + " también se ejecuta. ¡Salieron dos productos por un solo código!";
        return log + " muestra " + CASES[s.i].out + " en la consola: el resorte de " + CASES[s.i].val + " da una vuelta y " + CASES[s.i].cae + " a la charola.";
      case "brk":
        return cod("break") + " termina el switch aquí: la compra terminó y la pantalla dice GRACIAS. Los case que siguen ya no se revisan.";
      case "def":
        return "Ningún " + cod("case") + " coincidió con " + v + ", así que se ejecuta el código de " + cod("default") + ".";
      default:
        return "Como " + cod("default") + " va al final, ahí termina el switch y no necesita " + cod("break") + ".";
    }
  }

  function explicar(html) {
    if (html === status._html) return;
    status._html = html;
    clearTimeout(status._t);
    if (reduce || !html) {
      status.classList.remove("is-fading");
      status.innerHTML = html;
      return;
    }
    // El primer texto entra sin esperar, pero igual sube desde abajo (ver .grafico-ficha en app.css)
    if (!status.innerHTML) {
      status.classList.add("is-fading");
      void status.offsetWidth;
      status.innerHTML = html;
      status.classList.remove("is-fading");
      return;
    }
    status.classList.add("is-fading");
    status._t = setTimeout(function () {
      status.innerHTML = html;
      status.classList.remove("is-fading");
    }, 200);
  }

  /* ---------- Pintar la escena ---------- */
  function pantallaCodigo(texto, gracias, dir) {
    if (codigoTxt.textContent === texto) return;
    clearTimeout(codigoTxt._t);
    var pon = function () {
      codigoTxt.textContent = texto;
      codigoTxt.classList.toggle("is-gracias", gracias);
      codigoTxt.classList.remove("is-cambia");
    };
    if (reduce || dir === 0 || !codigoTxt.textContent) { pon(); return; }
    codigoTxt.classList.add("is-cambia");
    codigoTxt._t = setTimeout(pon, 200);
  }

  function pinta(n, dir) {
    st.n = n;
    var hechos = st.pasos.slice(0, n + 1), s = hechos[hechos.length - 1];
    var parte = s ? parteDe(s) : "";

    each(codeEl.querySelectorAll("[data-part]"), function (el) { el.classList.toggle("is-on", el.getAttribute("data-part") === parte); });
    pintaConsola(dir);

    // La pantalla: el código grande (o GRACIAS al terminar la compra) y un renglón chico
    var compro = hechos.some(function (p) { return p.k === "brk"; });
    var sinCase = hechos.some(function (p) { return p.k === "def"; });
    pantallaCodigo(compro ? "GRACIAS" : st.valor, compro, dir);
    var msg = "";
    if (s && !compro) {
      if (s.k === "sw") msg = "LEYENDO…";
      if (s.k === "cmp") msg = CASES[s.i].val + (s.ok ? " ✓" : " ✗");
      if (s.k === "body" && s.i !== "d") msg = "ENTREGANDO";
      if (sinCase) msg = "NO VÁLIDO";
    }
    msgTxt.textContent = msg;
    if (dir === 1 && s && s.k === "decl") reinicia(pantalla, "is-flash");

    // Etiquetas y luces: lo que ya se comparó se queda marcado
    var caidos = {};
    each(tags, function (t) { t.classList.remove("is-si", "is-no", "is-pasa"); });
    each(luces, function (l) { l.classList.remove("is-si", "is-pasa"); });
    hechos.forEach(function (p) {
      if (p.k === "cmp") {
        tags[p.i].classList.add(p.ok ? "is-si" : "is-no");
        if (p.ok) { luces[p.i].classList.add("is-si"); luces[p.i].setAttribute("fill", "url(#maqLuz)"); }
      }
      if (p.k === "body" && p.i !== "d") {
        caidos[p.i] = true;
        if (p.fall) { tags[p.i].classList.add("is-pasa"); luces[p.i].classList.add("is-pasa"); luces[p.i].setAttribute("fill", "url(#maqLuzAmbar)"); }
      }
    });

    // Lo que pasa justo en este paso (solo al avanzar)
    if (dir === 1 && s && s.k === "cmp" && !reduce) {
      if (s.ok) {
        reinicia(ondas[s.i], "is-on");
        reinicia(prods[s.i].firstChild, "is-elegido");
      } else {
        reinicia(tags[s.i], "is-tiembla");
      }
    }
    if (dir === 1 && s && s.k === "body" && s.i !== "d" && !reduce) {
      each(root.querySelectorAll('[data-giro="' + s.i + '"]'), function (g) { reinicia(g, "is-gira"); });
    }

    // Los productos: solo se anima el que cambia en este paso
    X.forEach(function (x, i) {
      var quiere = !!caidos[i];
      if (quiere === prodCaido[i]) return;
      prodCaido[i] = quiere;
      if (reduce || dir === 0) fijaProd(i, quiere);
      else if (quiere) cae(i);
      else regresa(i);
    });

    root.classList.toggle("is-moneda", hechos.some(function (p) { return p.k === "body" && p.i === "d"; }));

    b.back.disabled = n < 0;
    b.step.disabled = n >= st.pasos.length - 1;
    b.reset.classList.toggle("is-fin", n >= st.pasos.length - 1);

    explicar(s ? explica(s) : "");
  }

  function reiniciar() {
    each(root.querySelectorAll(".is-gira, .is-elegido, .is-tiembla"), function (el) { el.classList.remove("is-gira", "is-elegido", "is-tiembla"); });
    each(ondas, function (o) { o.classList.remove("is-on"); });
    pinta(-1, 0);
  }

  /* ---------- Cambiar los valores del código ---------- */
  function cambia(que, v) {
    if (que === "valor" ? v === st.valor : v === st.brk) return;
    if (que === "valor") st.valor = v; else st.brk = v;
    armaPasos();
    pintaCodigo();
    reiniciar();
    if (que === "valor") reinicia(pantalla, "is-flash");
    explicar(que === "valor"
      ? "Ahora " + cod(VAR) + " vale " + lit(v) + ". Recorre el switch para ver qué " + cod("case") + " se ejecuta."
      : v
        ? "Regresaste el " + cod("break") + " del " + cod("case " + lit(CASES[CON_MENU].val)) + ": la máquina vuelve a entregar un solo producto."
        : "Quitaste el " + cod("break") + " del " + cod("case " + lit(CASES[CON_MENU].val)) + ". Recorre el switch con " + CASES[CON_MENU].val + " para ver qué pasa.");
    var foco = codeEl.querySelector('[data-k="' + que + '"]');
    if (foco) foco.focus({ preventScroll: true });
  }

  /* ---------- Menú de vidrio (estándar del 3-23) ---------- */
  var abierto = null;
  var MENUS = {
    valor: function () {
      return OPCIONES.map(function (o) { return { html: "<code>" + esc(lit(o)) + "</code>", valor: o, actual: o === st.valor }; });
    },
    "break": function () {
      return [
        { html: "<code>break;</code>", valor: true, actual: st.brk },
        { html: "<code>// break;</code> <small>sin break</small>", valor: false, actual: !st.brk }
      ];
    }
  };

  function abrirMenu(origen) {
    cerrarMenu();
    var que = origen.getAttribute("data-k");
    var opciones = MENUS[que]();
    abierto = { origen: origen, que: que, opciones: opciones };
    origen.classList.add("is-abierta");
    origen.setAttribute("aria-expanded", "true");
    menu.innerHTML = opciones.map(function (o, n) {
      return '<button type="button" role="menuitem" class="maq__opcion' + (o.actual ? " is-actual" : "") + '" data-i="' + n + '">' + o.html + "</button>";
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
    var actual = menu.querySelector(".is-actual") || menu.querySelector(".maq__opcion");
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
    var op = e.target.closest(".maq__opcion");
    if (!op || !abierto) return;
    var que = abierto.que, o = abierto.opciones[+op.getAttribute("data-i")];
    cerrarMenu(true);
    cambia(que, o.valor);
  });

  menu.addEventListener("keydown", function (e) {
    var ops = [].slice.call(menu.querySelectorAll(".maq__opcion"));
    var n = ops.indexOf(document.activeElement);
    if (e.key === "ArrowDown") { e.preventDefault(); ops[(n + 1) % ops.length].focus(); }
    if (e.key === "ArrowUp") { e.preventDefault(); ops[(n - 1 + ops.length) % ops.length].focus(); }
    if (e.key === "Escape") { e.preventDefault(); cerrarMenu(true); }
    if (e.key === "Tab") cerrarMenu();
  });

  document.addEventListener("pointerdown", function (e) {
    if (abierto && !menu.contains(e.target) && !abierto.origen.contains(e.target)) cerrarMenu();
  });

  // En celular la barra del navegador cambia el alto al hacer scroll: solo se cierra si cambia el ancho
  var ancho = window.innerWidth;
  window.addEventListener("resize", function () {
    if (window.innerWidth === ancho) return;
    ancho = window.innerWidth;
    cerrarMenu();
  });

  codeEl.addEventListener("click", function (e) {
    var t = e.target.closest("[data-k]");
    if (!t) return;
    if (abierto && abierto.origen === t) cerrarMenu();
    else abrirMenu(t);
  });

  /* ---------- Las teclas ---------- */
  b.step.addEventListener("click", function () { if (st.n < st.pasos.length - 1) pinta(st.n + 1, 1); });
  b.back.addEventListener("click", function () { if (st.n >= 0) pinta(st.n - 1, -1); });
  b.reset.addEventListener("click", reiniciar);

  root.classList.add("maq--ready");
  armaPasos();
  pintaCodigo();
  reiniciar();
})();
