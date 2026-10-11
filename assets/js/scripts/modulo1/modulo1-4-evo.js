/* modulo1-4: tarjeta evolutiva de "Editor de texto" y "El Navegador"
   (motor en assets/js/evo-card.js, escena en
   assets/css/modulos/modulo1/modulo1-4-evo.css).
   Pasos: 0 ¿dónde escribirías una página? (Word, editor o navegador) ·
   1 Editor de texto · 2 ¿dónde la ves como página? · 3 El Navegador.
   La app elegida brilla, el editor crece hasta volverse la ventana de
   VS Code y escribe la página; luego el navegador se abre al lado y la
   dibuja. */
(function () {
  "use strict";

  var root = document.querySelector('[data-evo="herramientas"]');
  if (!root || !window.EvoCard) return;
  var put = EvoCard.put, mk = EvoCard.mk;

  var SRC = "<h1>Hola</h1>\n<p>Mi primera página</p>";
  var HI = '<span class="t-tag">&lt;h1&gt;</span>Hola<span class="t-tag">&lt;/h1&gt;</span>\n' +
    '<span class="t-tag">&lt;p&gt;</span>Mi primera página<span class="t-tag">&lt;/p&gt;</span>';
  var GLOBE = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">' +
    '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.6 2.6 15.4 0 18M12 3c-2.6 2.6-2.6 15.4 0 18"/></svg>';
  var paper, word, code, web, arrow, pre, all;

  function build(sc) {
    paper = mk(sc, "act b-paper", "<small>Tu página</small><code>&lt;h1&gt;Hola&lt;/h1&gt;</code>");
    word = mk(sc, "act b-app b-word", '<div class="b-icon"><i>W</i><span>Word</span></div>');
    code = mk(sc, "act b-app b-code",
      '<div class="b-icon"><i>&lt;/&gt;</i><span>Editor de código</span></div>' +
      '<div class="b-win"><div class="b-bar"><b></b><b></b><b></b>&nbsp;index.html · Visual Studio Code</div><pre></pre></div>');
    web = mk(sc, "act b-app b-web",
      '<div class="b-icon"><i>' + GLOBE + "</i><span>Navegador</span></div>" +
      '<div class="b-win"><div class="b-bar"><span class="b-url">index.html</span></div>' +
      '<div class="b-page"><h1>Hola</h1><p>Mi primera página</p></div></div>');
    arrow = mk(sc, "act b-arrow", "→");
    pre = code.querySelector("pre");
    all = [paper, word, code, web, arrow];
  }

  EvoCard.create(root, {
    fb: {
      code: ["ok", "¡Exacto!"],
      word: ["nope", "Word agrega formato escondido que el navegador no entiende."],
      web: ["nope", "El navegador muestra páginas, pero no sirve para escribirlas."]
    },
    layout: function (i, st, later, sc) {
      if (!all) build(sc);
      var W = sc.clientWidth, H = sc.clientHeight, wide = W >= 440, used = [];
      function P(el, o) { used.push(el); put(el, o); }
      [word, code, web].forEach(function (a) { a.classList.remove("is-win", "is-pick", "is-pulse"); });

      // Íconos de las tres apps en fila
      var tw = Math.min(124, (W - 48) / 3), th = 108, ty = H - th - 24;
      var tx0 = (W - (3 * tw + 24)) / 2;
      function tile(k, extra) {
        var o = { x: tx0 + k * (tw + 12), y: ty, w: tw, h: th, d: k * 70 };
        for (var p in extra) o[p] = extra[p];
        return o;
      }
      // Ventanas: lado a lado si cabe, si no una arriba de la otra
      var L = wide ? { x: 12, y: 20, w: W * 0.56 - 18, h: H - 40 } : { x: 10, y: 10, w: W - 20, h: H / 2 - 16 };
      var R = wide ? { x: W * 0.56 + 8, y: 20, w: W * 0.44 - 20, h: H - 40 } : { x: 10, y: H / 2 + 6, w: W - 20, h: H / 2 - 16 };
      var paperBox = { x: (W - 210) / 2, y: 30, w: 210, h: 66, r: -2 };

      if (i === 0) {
        pre.textContent = "";
        P(paper, paperBox);
        [word, code, web].forEach(function (t, k) { P(t, tile(k)); });
      } else if (i === 1) {
        // La app elegida brilla un momento; luego el editor crece y escribe la página
        var picked = { word: word, code: code, web: web }[st.pick] || code;
        picked.classList.add("is-pick");
        P(word, tile(0, { d: 0 }));
        P(code, tile(1, { d: 0 }));
        P(web, tile(2, { d: 0 }));
        P(paper, paperBox);
        later(function () {
          picked.classList.remove("is-pick");
          code.classList.add("is-win");
          put(code, { x: 14, y: 14, w: W - 28, h: H - 28 });
          put(word, tile(0, { s: 0.6, o: 0, d: 0 }));
          put(web, tile(2, { s: 0.6, o: 0, d: 0 }));
          put(paper, { x: paperBox.x, y: H / 2 - 30, w: 210, h: 66, s: 0.6, o: 0 });
        }, picked === code ? 250 : 900);
        pre.textContent = "";
        var n = 0;
        later(function type() {
          if (n <= SRC.length) {
            pre.textContent = SRC.slice(0, n);
            n++;
            later(type, 42);
          } else {
            pre.innerHTML = HI;
          }
        }, picked === code ? 1100 : 1750);
      } else {
        code.classList.add("is-win");
        pre.innerHTML = HI;
        P(code, L);
        if (i === 2) {
          // El navegador espera al lado, latiendo
          web.classList.add("is-pulse");
          P(web, wide
            ? { x: L.x + L.w + (W - L.x - L.w - tw) / 2, y: (H - th) / 2, w: tw, h: th, d: 350 }
            : { x: (W - tw) / 2, y: H / 2 + (H / 2 - th) / 2, w: tw, h: th - 10, d: 350 });
        } else {
          web.classList.add("is-win");
          P(web, R);
          arrow.textContent = wide ? "→" : "↓";
          P(arrow, wide
            ? { x: L.x + L.w - 10, y: H / 2 - 16, w: 32, h: 32, d: 700 }
            : { x: W / 2 - 16, y: H / 2 - 16, w: 32, h: 32, d: 700 });
        }
      }
      EvoCard.hideRest(all, used);
    }
  });
})();
