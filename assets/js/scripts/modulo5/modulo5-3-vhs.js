/* Módulo 5-3: "Escogiendo Alojamiento" como cinta VHS (la misma tele del
   4-8: componente común assets/js/vhs.js y assets/css/vhs.css).
   Aquí solo se arman las escenas. Cada recurso (almacenamiento, ancho de
   banda, seguridad y servicio al cliente) es un capítulo con su propio
   color de pantalla (data-tono, ver modulo5-3-vhs.css) y la información se
   muestra con figuras geométricas de contorno brillante: cuadros que caen
   en el disco, figuras que viajan por la banda, el hexágono con candado,
   los globos de diálogo… Al final, los servicios adicionales.
   En las escenas de preguntas el fondo es la cuadrícula que avanza.
   El texto completo queda en la lista oculta [data-vhs-src] para lectores
   de pantalla. */
(function () {
  "use strict";

  var tv = document.querySelector("[data-vhs]");
  if (!tv || !window.Vhs) return;

  var scene = Vhs.escena, read = Vhs.lectura;

  // ---------- Figuras (SVG de contorno; el color sale del CSS) ----------
  function fig(vb, inner, cls) {
    return '<svg class="vhs__fig' + (cls ? " " + cls : "") + '" viewBox="' + vb + '" aria-hidden="true">' + inner + "</svg>";
  }
  function hexagono(cx, cy, r) {
    var p = [];
    for (var i = 0; i < 6; i++) { var a = Math.PI / 3 * i - Math.PI / 2; p.push((cx + r * Math.cos(a)).toFixed(1) + "," + (cy + r * Math.sin(a)).toFixed(1)); }
    return '<polygon points="' + p.join(" ") + '"/>';
  }
  function candado(x, y, s) { // esquina superior izquierda del arco y escala
    return '<path class="f-ac" d="M' + (x + 4 * s) + " " + (y + 12 * s) + "v" + (-5 * s) + "a" + (6 * s) + " " + (6 * s) + " 0 0 1 " + (12 * s) + " 0v" + (5 * s) + '"/>' +
      '<rect class="f-ac f-lleno" x="' + x + '" y="' + (y + 12 * s) + '" width="' + (20 * s) + '" height="' + (15 * s) + '" rx="' + (2 * s) + '"/>';
  }
  function disco(cx, cy, w, h) {
    var rx = w / 2, ry = h * .16;
    return '<path d="M' + (cx - rx) + " " + cy + "v" + h + "a" + rx + " " + ry + " 0 0 0 " + w + " 0v" + (-h) + '"/>' +
      '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '"/>' +
      '<path class="f-tenue" d="M' + (cx - rx) + " " + (cy + h / 2) + "a" + rx + " " + ry + " 0 0 0 " + w + ' 0"/>';
  }
  function globo(x, y, w, h, cola) { // globo de diálogo con su colita
    return '<path d="M' + (x + 8) + " " + y + "h" + (w - 16) + "q8 0 8 8v" + (h - 16) + "q0 8-8 8H" + (cola ? x + 30 : x + w - 18) +
      "l" + (cola ? -14 : 14) + " 12v-12H" + (x + 8) + "q-8 0-8-8V" + (y + 8) + "q0-8 8-8z" + '"/>';
  }
  function texto(x, y, t, cls, size) {
    return '<text x="' + x + '" y="' + y + '" text-anchor="middle"' + (size ? ' font-size="' + size + '"' : "") + (cls ? ' class="' + cls + '"' : "") + ">" + t + "</text>";
  }

  var F = {
    tres: fig("0 0 360 96",
      '<circle class="f-c2" cx="60" cy="34" r="24"/><polygon class="f-c1" points="180,10 206,58 154,58"/><rect class="f-c3" x="276" y="10" width="48" height="48"/>' +
      texto(60, 40, "✓", "f-c2", 22) + texto(180, 50, "$", "f-c1", 22) + texto(300, 41, "GB", "f-c3", 17) +
      texto(60, 88, "ACCESIBLE", "", 16) + texto(180, 88, "BUEN PRECIO", "", 16) + texto(300, 88, "RECURSOS", "", 16)),

    // Almacenamiento
    almIcono: fig("0 0 120 110", disco(60, 22, 76, 70) + '<rect class="f-ac f-lleno vhs__gira" x="14" y="76" width="16" height="16" transform="rotate(20 22 84)"/>' + '<polygon class="f-c2 f-tenue" points="96,10 108,32 84,32"/>', "vhs__fig--icono"),
    almCaja: fig("0 0 260 120",
      '<rect x="70" y="8" width="120" height="104"/>' +
      [["html", 0, 0], ["css", 1, 0], ["js", 2, 0], ["img", 0, 1], ["img", 1, 1], ["video", 2, 1]].map(function (a, i) {
        var x = 80 + a[1] * 34, y = 78 - a[2] * 30;
        return '<g class="vhs__cae" style="animation-delay:' + (i * .32) + 's"><rect class="f-c' + (i % 4 + 1) + ' f-lleno" x="' + x + '" y="' + y + '" width="32" height="26"/>' + texto(x + 16, y + 17, a[0], "", 14) + "</g>";
      }).join("") +
      '<path class="f-tenue" d="M52 112V8M46 112h12M46 8h12"/>' + texto(30, 64, "GB", "f-ac", 19) +
      '<circle class="f-c2 f-tenue" cx="222" cy="30" r="14"/><polygon class="f-c3 f-tenue" points="214,104 228,80 242,104"/>'),
    almDato: fig("0 0 240 40",
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (i) {
        return '<rect class="' + (i < 2 ? "f-ac f-lleno vhs__prende" : "f-tenue") + '" style="animation-delay:' + (i * .15) + 's" x="' + (10 + i * 22.5) + '" y="8" width="18" height="24"/>';
      }).join(""), "vhs__fig--barra"),

    // Ancho de banda
    banIcono: fig("0 0 140 110",
      '<rect x="6" y="36" width="36" height="36"/><circle cx="116" cy="54" r="18"/><path class="f-ac" d="M42 46h56M42 62h56"/>' +
      '<g class="vhs__viaja"><polygon class="f-c2 f-lleno" points="48,49 58,54 48,59"/></g>', "vhs__fig--icono"),
    banFlujo: fig("0 0 300 110",
      '<rect x="8" y="30" width="50" height="50"/>' + texto(33, 100, "SERVIDOR", "", 16) +
      '<circle cx="262" cy="55" r="27"/>' + texto(262, 100, "TU PÁGINA", "", 16) +
      '<path class="f-ac" d="M58 42h176M58 68h176"/>' +
      [0, 1, 2, 3].map(function (i) {
        var forma = i % 2 ? '<circle class="f-c3 f-lleno" cx="66" cy="55" r="6"/>' : '<polygon class="f-c2 f-lleno" points="60,48 72,55 60,62"/>';
        return '<g class="vhs__viaja vhs__viaja--largo" style="animation-delay:' + (i * .45) + 's">' + forma + "</g>";
      }).join("")),
    banVisitas: function (ancha) {
      var y1 = ancha ? 30 : 48, y2 = ancha ? 80 : 62, n = ancha ? 8 : 2, figs = "";
      for (var i = 0; i < n; i++) {
        var y = ancha ? 38 + (i % 3) * 14 : 55, x = 64 + i * (ancha ? 0 : 0);
        figs += '<g class="vhs__viaja vhs__viaja--largo" style="animation-delay:' + (i * (ancha ? .22 : .9)) + 's"><polygon class="f-c' + (i % 4 + 1) + ' f-lleno" points="' + (x - 4) + "," + (y - 6) + " " + (x + 8) + "," + y + " " + (x - 4) + "," + (y + 6) + '"/></g>';
      }
      return fig("0 0 300 110",
        '<rect x="8" y="30" width="50" height="50"/><circle cx="262" cy="55" r="27"/>' +
        '<path class="f-ac" d="M58 ' + y1 + "h176M58 " + y2 + 'h176"/>' + figs +
        texto(146, 104, ancha ? "MUCHOS VISITANTES · BANDA ANCHA" : "POCOS VISITANTES · BANDA ANGOSTA", "", 16));
    },

    // Seguridad
    segIcono: fig("0 0 120 120", hexagono(60, 60, 52) + candado(44, 34, 1.6) + hexagono(60, 60, 40).replace("<polygon", '<polygon class="f-tenue"'), "vhs__fig--icono"),
    segCifra: fig("0 0 300 100",
      '<rect class="f-c1" x="6" y="30" width="86" height="40"/>' + texto(49, 55, "gato123", "f-c1", 19) +
      hexagono(150, 50, 36) + candado(136, 30, 1.4) +
      '<rect class="f-c2" x="208" y="30" width="86" height="40"/>' + texto(251, 55, "x9#@Lq", "f-c2", 19) +
      '<path class="f-tenue" d="M92 50h20M188 50h20"/>' +
      texto(49, 92, "SIN SSL", "", 16) + texto(251, 92, "CON SSL", "", 16)),
    segUrl: fig("0 0 260 60",
      '<rect x="6" y="10" width="248" height="40" rx="20"/>' + candado(24, 14, 1.15) + texto(154, 37, "https://tupagina.mx", "", 19), "vhs__fig--url"),

    // Servicio al cliente
    sopIcono: fig("0 0 130 110", globo(8, 10, 84, 54, true) + texto(50, 46, "?", "f-ac", 30) + '<g class="vhs__f-tarde">' + globo(54, 48, 68, 42, false).replace("<path", '<path class="f-c2"') + texto(88, 76, "OK", "f-c2", 18) + "</g>", "vhs__fig--icono"),
    sopError: fig("0 0 300 110",
      '<polygon class="f-c1" points="60,10 108,92 12,92"/>' + texto(60, 80, "!", "f-c1", 40) +
      '<path class="f-tenue" d="M120 52h40"/><polygon class="f-tenue f-lleno" points="160,46 170,52 160,58"/>' +
      '<g class="vhs__f-tarde">' + globo(184, 18, 108, 62, true).replace("<path", '<path class="f-c2"') + texto(238, 56, "¡Te ayudo!", "f-c2", 18) + "</g>"),
    sopReloj: fig("0 0 120 120",
      '<circle cx="60" cy="60" r="50"/>' +
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(function (i) { var a = Math.PI / 6 * i; return '<path class="f-tenue" d="M' + (60 + 42 * Math.sin(a)).toFixed(1) + " " + (60 - 42 * Math.cos(a)).toFixed(1) + "L" + (60 + 47 * Math.sin(a)).toFixed(1) + " " + (60 - 47 * Math.cos(a)).toFixed(1) + '"/>'; }).join("") +
      '<g class="vhs__gira"><path class="f-ac" d="M60 60V26"/></g>' + texto(60, 82, "24/7", "f-ac", 20), "vhs__fig--icono"),

    // Cierre: los cuatro recursos y los servicios adicionales
    resumen: fig("0 0 320 80",
      '<g class="vhs__prende" style="animation-delay:0s">' + disco(40, 14, 40, 40).replace(/<path d=/, '<path class="f-c1" d=').replace("<ellipse", '<ellipse class="f-c1"') + "</g>" +
      '<g class="vhs__prende" style="animation-delay:.4s"><rect class="f-c2" x="94" y="22" width="16" height="16"/><path class="f-c2" d="M110 26h30M110 34h30"/><circle class="f-c2" cx="150" cy="30" r="9"/></g>' +
      '<g class="vhs__prende" style="animation-delay:.8s">' + hexagono(200, 32, 24).replace("<polygon", '<polygon class="f-c3"') + "</g>" +
      '<g class="vhs__prende" style="animation-delay:1.2s">' + globo(246, 10, 60, 38, true).replace("<path", '<path class="f-c4"') + "</g>" +
      texto(40, 76, "DISCO", "", 15) + texto(122, 76, "BANDA", "", 15) + texto(200, 76, "SSL", "", 15) + texto(276, 76, "SOPORTE", "", 15)),
    extras: fig("0 0 320 92",
      '<g class="vhs__prende"><rect class="f-c1" x="18" y="12" width="52" height="36"/><path class="f-c1" d="M18 12l26 20 26-20"/></g>' +
      '<g class="vhs__prende" style="animation-delay:.4s">' + disco(122, 14, 44, 34).replace(/<path d=/, '<path class="f-c2" d=').replace("<ellipse", '<ellipse class="f-c2"') + "</g>" +
      '<g class="vhs__prende" style="animation-delay:.8s"><circle class="f-c3" cx="200" cy="30" r="20"/><ellipse class="f-c3" cx="200" cy="30" rx="8" ry="20"/><path class="f-c3" d="M180 30h40"/></g>' +
      '<g class="vhs__prende" style="animation-delay:1.2s"><path class="f-c4" d="M258 14h12a6 6 0 0 1 12 0h12v12a6 6 0 0 1 0 12v12h-36z"/></g>' +
      texto(44, 74, "CORREOS", "", 16) + texto(122, 74, "BASES DE", "", 16) + texto(122, 87, "DATOS", "", 16) + texto(200, 74, "DOMINIOS", "", 16) + texto(276, 74, "PLUGINS", "", 16))
  };

  // ---------- Escenas ----------
  var beats = [];
  function txt(t, extra, cls) { return '<p class="vhs__text' + (cls ? " " + cls : "") + '">' + t + "</p>" + (extra || ""); }
  function plano(t) { return t.replace(/<[^>]+>/g, ""); }
  // Portada de cada recurso: su figura grande, el número y el nombre
  function portada(k, icono, nombre) {
    return scene("", icono + '<span class="vhs__name">Recurso ' + (k + 1) + " · <em>" + nombre + "</em></span>");
  }

  beats.push({ how: "fade", tono: "portada", dur: 3800, html: scene("",
    '<h3 class="vhs__title vhs__title--cover">Escogiendo<br>Alojamiento</h3>') });
  var bienvenida = "Bienvenido a la cinta de Escogiendo Alojamiento. En los próximos {min} minutos conocerás los <b>4 recursos</b> que debes revisar para elegir dónde publicar tu página.";
  beats.push({ how: "fade", tono: "portada", dur: read(plano(bienvenida), 4500), html: scene("", txt(bienvenida)) });
  var tres = "Busca que sea accesible, que no cueste mucho y que tenga <b>recursos</b>.";
  beats.push({ how: "fade", tono: "portada", dur: read(plano(tres), 4500), html: scene("Qué buscar", F.tres + txt(tres, "", "vhs__text--chico")) });

  // Recurso 1: almacenamiento
  beats.push({ how: "zap", tono: "alm", chapter: 0, dur: 3600, html: portada(0, F.almIcono, "Almacenamiento") });
  var alm1 = "Es el espacio para guardar los <b>archivos</b> de tu proyecto.";
  beats.push({ how: "fade", tono: "alm", chapter: 0, dur: read(plano(alm1), 5200), html: scene("¿Qué es?", F.almCaja + txt(alm1, "", "vhs__text--chico")) });
  beats.push({ how: "fade", tono: "alm", chapter: 0, dur: 4800, html: scene("¿Cuánto?",
    '<span class="vhs__dato">10 a 20 GB</span>' + F.almDato + txt("son suficientes para páginas pequeñas.", "", "vhs__text--chico")) });

  // Recurso 2: ancho de banda
  beats.push({ how: "zap", tono: "ban", chapter: 1, dur: 3600, html: portada(1, F.banIcono, "Ancho de banda") });
  var ban1 = "Es qué tan <b>rápido</b> viajan los datos entre el servidor y tu página.";
  beats.push({ how: "fade", tono: "ban", chapter: 1, dur: read(plano(ban1), 5000), html: scene("¿Qué es?", F.banFlujo + txt(ban1, "", "vhs__text--chico")) });
  var ban2 = "Más <b>visitantes</b> necesitan más ancho de banda.";
  beats.push({ how: "fade", tono: "ban", chapter: 1, dur: 3000, html: scene("¿Cuánto?", F.banVisitas(false) + txt(ban2, "", "vhs__text--chico")) });
  beats.push({ how: "none", tono: "ban", chapter: 1, dur: 3600, html: scene("¿Cuánto?", F.banVisitas(true) + txt(ban2, "", "vhs__text--chico")) });

  // Recurso 3: seguridad
  beats.push({ how: "zap", tono: "seg", chapter: 2, dur: 3600, html: portada(2, F.segIcono, "Seguridad") });
  var seg1 = "Un certificado <b>SSL</b> encripta los datos de tus usuarios.";
  beats.push({ how: "fade", tono: "seg", chapter: 2, dur: read(plano(seg1), 5000), html: scene("¿Qué es?", F.segCifra + txt(seg1, "", "vhs__text--chico")) });
  var seg2 = "Se nota por el <b>candado</b>. No todos los planes lo tienen.";
  beats.push({ how: "fade", tono: "seg", chapter: 2, dur: read(plano(seg2), 4500), html: scene("¿Cómo lo reconozco?", F.segUrl + txt(seg2, "", "vhs__text--chico")) });

  // Recurso 4: servicio al cliente
  beats.push({ how: "zap", tono: "sop", chapter: 3, dur: 3600, html: portada(3, F.sopIcono, "Servicio al cliente") });
  var sop1 = "Si algo falla en el servidor, <b>alguien te ayuda</b> a resolverlo.";
  beats.push({ how: "fade", tono: "sop", chapter: 3, dur: read(plano(sop1), 5000), html: scene("¿Qué es?", F.sopError + txt(sop1, "", "vhs__text--chico")) });
  var sop2 = "El <b>soporte técnico</b> mantiene tu página funcionando.";
  beats.push({ how: "fade", tono: "sop", chapter: 3, dur: read(plano(sop2), 4500), html: scene("¿Por qué importa?", F.sopReloj + txt(sop2, "", "vhs__text--chico")) });

  // Cierre: los cuatro juntos y los servicios adicionales
  var res = "Con estos <b>4 recursos</b> tu sitio será rápido y seguro.";
  beats.push({ how: "zap", tono: "extra", chapter: 4, dur: read(plano(res), 4800), html: scene("En resumen", F.resumen + txt(res, "", "vhs__text--chico")) });
  var ext = "Muchos planes incluyen <b>servicios adicionales</b>.";
  beats.push({ how: "fade", tono: "extra", chapter: 4, dur: read(plano(ext), 5000), html: scene("Y además", F.extras + txt(ext, "", "vhs__text--chico")) });
  beats.push({ how: "zap", tono: "portada", dur: 4500, end: true, html: scene("Fin de la cinta",
    '<h3 class="vhs__title">¡Listo para escoger!</h3>' +
    '<p class="vhs__sub">Revisa <b>almacenamiento</b>, <b>ancho de banda</b>, <b>seguridad</b> y <b>soporte</b>.</p>') });

  // La cuadrícula de fondo sale solo en las escenas de preguntas
  // ("¿Qué es?", "¿Cuánto?"…)
  beats.forEach(function (b) { if (b.html.indexOf('vhs__kicker">¿') >= 0) b.grid = true; });

  Vhs.crear(tv, beats);
})();
