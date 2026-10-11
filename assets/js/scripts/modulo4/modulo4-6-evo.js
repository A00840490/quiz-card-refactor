/* modulo4-6: tarjeta evolutiva de "Crear un arreglo" y "Acceder y modificar"
   (motor en assets/js/evo-card.js, escena en
   assets/css/modulos/modulo4/modulo4-6-evo.css).
   Pasos: 0 ¿cómo guardas 5 calificaciones? · 1 ¿y si fueran 200? ·
   2 Crear un arreglo · 3 ¿cómo sacas la del tercer alumno? ·
   4 Acceder y modificar.
   Las notas sueltas de la pregunta se juntan y se vuelven las cajas del
   arreglo; esas mismas cajas reciben luego su índice. */
(function () {
  "use strict";

  var root = document.querySelector('[data-evo="arreglos"]');
  if (!root || !window.EvoCard) return;
  var put = EvoCard.put, mk = EvoCard.mk;

  var vals = [90, 75, 88, 100, 62];
  var chips, ghosts, name, bl, br, idx, bubble, more, all;

  function build(sc) {
    chips = vals.map(function (v, k) {
      return mk(sc, "act a-chip",
        '<span class="a-var">var cal' + (k + 1) + " = " + v + ";</span>" +
        '<span class="a-short">cal' + (k + 1) + "</span>" +
        '<span class="a-val"><span>' + v + "</span></span>");
    });
    ghosts = [];
    for (var k = 0; k < 44; k++) ghosts.push(mk(sc, "act a-ghost", "cal" + (k + 6)));
    name = mk(sc, "act a-name", "var calificaciones =");
    bl = mk(sc, "act a-br", "[");
    br = mk(sc, "act a-br", "]");
    idx = vals.map(function (v, k) { return mk(sc, "act a-idx", String(k)); });
    bubble = mk(sc, "act a-bubble", "↑ tercer alumno");
    more = mk(sc, "act a-more", "");
    all = chips.concat(ghosts, [name, bl, br, bubble, more], idx);
  }

  // Giro pequeño y fijo para cada nota (-3° a 3°)
  function jit(k) { return ((k * 37) % 7) - 3; }

  EvoCard.create(root, {
    fb: {
      b: ["ok", "¡Exacto! <b>[2]</b> es el tercer alumno."],
      a: ["nope", "Casi. <b>[3]</b> sería el cuarto alumno, porque se cuenta desde 0."],
      c: ["nope", "<b>.tercero</b> no existe. A los valores se llega por su posición."]
    },
    layout: function (i, st, later, sc) {
      if (!all) build(sc);
      var W = sc.clientWidth, H = sc.clientHeight, used = [];
      function P(el, o) { used.push(el); put(el, o); }

      var v2 = chips[2].querySelector(".a-val span");
      v2.textContent = "88";
      chips[2].classList.remove("is-flash");
      chips[2].classList.toggle("is-hot", i >= 3);
      idx[2].classList.toggle("is-hot", i === 4);

      if (i === 0) {
        // Cinco notas sueltas, una variable por calificación
        var cw = Math.min(144, W * 0.44);
        var spots = [[0.06, 0.08, -4], [0.5, 0.16, 3], [0.09, 0.4, 2], [0.53, 0.48, -3], [0.22, 0.72, -2]];
        chips.forEach(function (c, k) {
          var s = spots[k];
          P(c, { x: Math.min(s[0] * W, W - cw - 10), y: s[1] * H, w: cw, h: 38, r: s[2], d: k * 70 });
        });
      } else if (i === 1) {
        // Se llenan de notas: las 5 originales quedan resaltadas entre muchas
        var cols = Math.max(4, Math.floor((W - 12) / 74));
        var cell = (W - 12) / cols;
        var rows = Math.floor((H - 50) / 29);
        var total = Math.min(cols * rows, ghosts.length + 5);
        var chipCells = [0, Math.floor(total * 0.27), Math.floor(total * 0.5) + 1, Math.floor(total * 0.72), total - 2];
        var gi = 0;
        for (var k = 0; k < total; k++) {
          var o = { x: 6 + (k % cols) * cell + 3, y: 10 + Math.floor(k / cols) * 29, w: cell - 6, h: 23, r: jit(k), d: k * 14 };
          var ci = chipCells.indexOf(k);
          if (ci > -1) P(chips[ci], o);
          else if (gi < ghosts.length) P(ghosts[gi++], o);
        }
        more.textContent = "…y faltan " + (200 - total) + " más";
        P(more, { x: W - 160, y: H - 36, w: 150, h: 26, d: total * 14 });
      } else {
        // Las notas se vuelven las cajas de un solo arreglo
        var narrow = W < 440;
        var gap = narrow ? 6 : 8;
        var bw = Math.min(64, (W - (narrow ? 64 : 96)) / 5 - gap);
        var rowW = 5 * bw + 4 * gap;
        var x0 = (W - rowW) / 2, y0 = H / 2 - 14;
        chips.forEach(function (c, k) {
          var hot = i >= 3 && k === 2;
          P(c, { x: x0 + k * (bw + gap), y: y0 - (hot ? 12 : 0), w: bw, h: 48, o: i === 3 && k !== 2 ? 0.45 : 1, d: k * 60 });
        });
        if (i === 2) {
          ghosts.forEach(function (g, k) {
            if (g.style.opacity !== "0") P(g, { x: W / 2 - 20, y: y0 + 12, w: 40, h: 23, s: 0.2, o: 0, d: k * 6 });
          });
        }
        P(name, { x: x0 - 26, y: y0 - 50, w: 200, h: 24, d: 350 });
        P(bl, { x: x0 - 26, y: y0 - 6, w: 22, h: 60, d: 300 });
        P(br, { x: x0 + rowW + 4, y: y0 - 6, w: 22, h: 60, d: 300 });
        if (i === 3) P(bubble, { x: x0 + 2 * (bw + gap) + bw / 2 - 60, y: y0 + 60, w: 120, h: 26, d: 250 });
        if (i === 4) {
          idx.forEach(function (e, k) { P(e, { x: x0 + k * (bw + gap), y: y0 + 58, w: bw, h: 20, d: 300 + k * 90 }); });
          later(function () {
            v2.textContent = "95";
            chips[2].classList.add("is-flash");
          }, 1700);
        }
      }
      EvoCard.hideRest(all, used);
    }
  });
})();
