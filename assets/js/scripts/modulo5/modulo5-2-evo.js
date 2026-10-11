/* modulo5-2: tarjeta evolutiva de "Conceptos clave" y "El proceso"
   (motor en assets/js/evo-card.js, escena en
   assets/css/modulos/modulo5/modulo5-2-evo.css).
   Pasos: 0 escribes google.com y presionas Enter · 1 ¿tu computadora sabe
   dónde está? · 2 Conceptos clave (DNS e IP) · 3 ¿cómo pide la página? ·
   4 El proceso (HTTP y paquetes por TCP/IP).
   La barra de direcciones se vuelve el navegador; "google.com" viaja al DNS
   y regresa como IP; luego los paquetes del servidor arman la página. */
(function () {
  "use strict";

  var root = document.querySelector('[data-evo="internet"]');
  if (!root || !window.EvoCard) return;
  var put = EvoCard.put, mk = EvoCard.mk;

  var brow, url, lines, bubble, dns, srv, tok, req, pk = [], all;

  function build(sc) {
    brow = mk(sc, "act c-brow",
      '<div class="c-url"><span class="c-lock"></span><span class="c-txt"></span><i class="c-caret"></i></div>' +
      '<div class="c-body"><b class="c-l c-l1"></b><b class="c-l c-l2"></b><b class="c-l c-l3"></b><b class="c-l c-l4"></b></div>');
    url = brow.querySelector(".c-txt");
    lines = Array.prototype.slice.call(brow.querySelectorAll(".c-l"));
    bubble = mk(sc, "act c-bubble", "¿Dónde vive google.com?");
    dns = mk(sc, "act c-node", "<b>DNS</b><small>libreta de nombres</small>");
    srv = mk(sc, "act c-node", "<b>Servidor</b><small>74.125.198.104</small>");
    tok = mk(sc, "act c-tok", "google.com");
    req = mk(sc, "act c-req", "petición HTTP");
    for (var k = 0; k < 6; k++) pk.push(mk(sc, "act c-pk", ""));
    all = [brow, bubble, dns, srv, tok, req].concat(pk);
  }

  EvoCard.create(root, {
    fb: {
      no: ["ok", "¡Bien pensado! Tiene que preguntar."],
      si: ["nope", "En realidad no lo sabe. Tiene que preguntar."]
    },
    layout: function (i, st, later, sc) {
      if (!all) build(sc);
      var W = sc.clientWidth, H = sc.clientHeight, used = [];
      function P(el, o) { used.push(el); put(el, o); }

      var narrow = W < 440;
      var BW = narrow ? W * 0.42 : Math.min(210, W * 0.46);
      var B = { x: 12, y: 40, w: BW, h: H - 80 };
      var NW = narrow ? W * 0.5 : Math.min(184, W * 0.44);
      var D = { x: W - NW - 12, y: 14, w: NW, h: 62 };
      var S = { x: W - NW - 12, y: H - 92, w: NW, h: 76 };
      var TW = Math.min(140, BW - 14);
      var T = { x: B.x + 7, y: B.y + 48, w: TW, h: 28 };

      brow.classList.toggle("is-bar", i === 0);
      lines.forEach(function (l) { l.classList.remove("is-on"); });
      srv.classList.toggle("is-pulse", i === 3);
      srv.classList.remove("is-hot");
      dns.classList.remove("is-hot");
      tok.textContent = i >= 3 ? "74.125.198.104" : "google.com";
      tok.classList.toggle("is-ip", i >= 3);

      if (i === 0) {
        // Sólo la barra de direcciones; se escribe google.com
        var bw = Math.min(W - 32, 380);
        P(brow, { x: (W - bw) / 2, y: H / 2 - 28, w: bw, h: 56 });
        url.textContent = "";
        var t = "google.com", n = 0;
        later(function type() {
          url.textContent = t.slice(0, n);
          if (n++ < t.length) later(type, 110);
        }, 400);
      } else {
        url.textContent = "google.com";
        P(brow, B);
        if (i === 1) P(bubble, { x: B.x + B.w + 18, y: B.y + 20, w: W - B.x - B.w - 30, h: 70, d: 450 });
        if (i >= 2) P(dns, { x: D.x, y: D.y, w: D.w, h: D.h, o: i >= 3 ? 0.65 : 1, d: 250 });
        if (i === 2) {
          // google.com va al DNS y regresa como dirección IP
          P(tok, { x: T.x, y: T.y, w: T.w, h: T.h, d: 500 });
          later(function () {
            put(tok, { x: D.x + (D.w - T.w) / 2, y: D.y + D.h + 10, w: T.w, h: T.h });
            dns.classList.add("is-hot");
          }, 1100);
          later(function () {
            tok.textContent = "74.125.198.104";
            tok.classList.add("is-ip");
          }, 2100);
          later(function () {
            put(tok, { x: T.x, y: T.y, w: T.w, h: T.h });
            dns.classList.remove("is-hot");
          }, 2700);
        }
        if (i === 3) P(tok, { x: T.x, y: T.y, w: T.w, h: T.h });
        if (i >= 3) P(srv, { x: S.x, y: S.y, w: S.w, h: S.h, d: 250 });
        if (i === 4) {
          // La petición HTTP viaja al servidor...
          var RW = Math.min(124, W * 0.36);
          P(req, { x: B.x + B.w - RW / 2, y: B.y + B.h / 2 - 13, w: RW, h: 26, d: 300 });
          later(function () { put(req, { x: S.x + (S.w - RW) / 2, y: S.y - 34, w: RW, h: 26 }); }, 900);
          later(function () {
            srv.classList.add("is-hot");
            put(req, { x: S.x + (S.w - RW) / 2, y: S.y - 34, w: RW, h: 26, o: 0 });
          }, 1800);
          // ...y los paquetes regresan y van armando la página
          var map = [0, 1, 1, 2, 3, 3];
          pk.forEach(function (p, k) {
            var home = { x: S.x + 14 + k * 18, y: S.y + S.h / 2 - 7, w: 14, h: 14 };
            var dest = { x: B.x + 24 + (k % 3) * 34, y: B.y + 70 + Math.floor(k / 3) * 26, w: 14, h: 14 };
            P(p, { x: home.x, y: home.y, w: 14, h: 14, o: 0 });
            later(function () { put(p, home); }, 2000 + k * 260);
            later(function () { put(p, { x: dest.x, y: dest.y, w: 14, h: 14, r: 90 }); }, 2150 + k * 260);
            later(function () {
              put(p, { x: dest.x, y: dest.y, w: 14, h: 14, s: 0.3, o: 0 });
              lines[map[k]].classList.add("is-on");
            }, 2950 + k * 260);
          });
        }
      }
      EvoCard.hideRest(all, used);
    }
  });
})();
