/* Módulo 5-4: las terminaciones de dominios como una calle (estilos en
   assets/css/modulos/modulo5/modulo5-4-calle.css).

   Cada edificio es un tipo de sitio web y su letrero es la terminación de su
   dominio: la tienda es .com, el centro de datos .net, el refugio .org, el
   palacio municipal .gob, la escuela .edu, el kiosco .info, la oficina .biz y
   la casa con bandera .mx. Al tocar un edificio se le prenden las luces, los
   demás se apagan un poco, el carrito maneja hasta su puerta y abajo aparece
   la ficha con la terminación, para qué sirve y una dirección de ejemplo en
   una placa de calle.

   Los muros usan texturas de fotos reales (m5-3/calle/ y las de madera y
   aluminio del tocadiscos del 4-11). En celular la calle se parte en dos
   cuadras de cuatro edificios. Con "reducir movimiento" no hay animaciones. */
(function () {
  "use strict";

  var root = document.querySelector("[data-calle-dom]");
  if (!root) return;

  var reduce = Curso.reduce;
  var esc = Curso.esc;
  var IMG = Curso.ruta() + "assets/images/course/";
  var TEX = {
    ladrillo: IMG + "modulo5/m5-3/calle/ladrillo.jpg",
    estuco: IMG + "modulo5/m5-3/calle/estuco.jpg",
    cantera: IMG + "modulo5/m5-3/calle/cantera.jpg",
    tejas: IMG + "modulo5/m5-3/calle/tejas.jpg",
    madera: IMG + "modulo4/m4-11/tocadiscos/texturas/madera.jpg",
    aluminio: IMG + "modulo4/m4-11/tocadiscos/texturas/aluminio.jpg"
  };

  var escena = root.querySelector("[data-escena]");
  var lotes = root.querySelector("[data-lotes]");
  var carro = root.querySelector("[data-carro]");
  var info = root.querySelector("[data-info]");

  /* ---------- Piezas de dibujo ---------- */

  // Un muro con textura, teñido de un color y con luz de arriba
  function muro(x, y, w, h, tex, tinte, op) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="url(#cd-' + tex + ')"/>' +
      (tinte ? '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + tinte + '" opacity="' + (op || 0.55) + '" style="mix-blend-mode:multiply"/>' : "") +
      '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="url(#cd-luz)"/>';
  }
  // Una ventana: vidrio que se ilumina cuando el edificio está elegido
  function ventana(x, y, w, h, marco) {
    return '<rect class="cd-v" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="url(#cd-vidrio)" stroke="' + (marco || "#ffffff") + '" stroke-width="2.5"/>' +
      '<path d="M' + (x + 3) + " " + (y + h - 3) + "L" + (x + w * 0.55) + " " + (y + 3) + '" stroke="#ffffff" stroke-width="2" opacity=".35"/>';
  }
  function puerta(x, y, w, h, arco) {
    var d = arco
      ? "M" + x + " " + (y + h) + "V" + (y + w / 2) + "a" + w / 2 + " " + w / 2 + " 0 0 1 " + w + " 0V" + (y + h) + "z"
      : "M" + x + " " + (y + h) + "V" + y + "h" + w + "V" + (y + h) + "z";
    return '<path d="' + d + '" fill="url(#cd-madera)"/><path d="' + d + '" fill="#4a2b14" opacity=".35" style="mix-blend-mode:multiply"/>' +
      '<circle cx="' + (x + w - 5) + '" cy="' + (y + h * 0.6) + '" r="1.8" fill="#f1d38a"/>';
  }
  // Toldo a rayas con flecos redondos
  function toldo(x, y, w, h, c1, c2, n) {
    var paso = w / n, s = "";
    for (var i = 0; i < n; i++) {
      var c = i % 2 ? c2 : c1, x0 = x + i * paso;
      s += '<path d="M' + x0 + " " + y + "h" + paso + "v" + h + "a" + paso / 2 + " " + paso / 2.6 + " 0 0 1 " + (-paso) + ' 0z" fill="' + c + '"/>';
    }
    return s + '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="3" fill="#000" opacity=".15"/>';
  }

  /* Cada edificio vive en un lienzo de 120 de ancho; la base queda en y = 200 */
  var EDIFICIOS = [
    {
      tld: ".com", nombre: "Comercial", alto: 132,
      texto: "Es la opción más popular y significa “comercial”. La usan tiendas en línea, empresas y casi cualquier tipo de sitio.",
      ejemplo: ["www.tenisrayo", ".com"],
      dibujo: function () {
        return muro(10, 78, 100, 122, "ladrillo", "#d9773a", 0.5) +
          '<rect x="6" y="70" width="108" height="10" fill="#7a3e1d"/>' +
          '<rect x="22" y="84" width="76" height="14" rx="2" fill="#1c2434"/><text x="60" y="95" text-anchor="middle" font-family="Lato, sans-serif" font-weight="900" font-size="10" fill="#ffd166" letter-spacing="1">TIENDA</text>' +
          toldo(8, 102, 104, 14, "#e8590c", "#fff4e6", 8) +
          ventana(18, 128, 50, 50, "#5a3216") +
          '<g opacity=".95"><rect x="24" y="166" width="16" height="8" rx="2" fill="#e8590c"/><rect x="44" y="164" width="18" height="10" rx="2" fill="#2f9e44"/><circle cx="32" cy="150" r="6" fill="#ffd166"/></g>' +
          puerta(76, 136, 24, 64);
      }
    },
    {
      tld: ".net", nombre: "Redes y tecnología", alto: 168,
      texto: "Se utiliza para sitios relacionados con las tecnologías de la información, como un proveedor de internet, aunque también funciona como alternativa a .com.",
      ejemplo: ["www.fibraveloz", ".net"],
      dibujo: function () {
        return '<path d="M60 36v40" stroke="#6b7280" stroke-width="3.5"/><path d="M46 78h28l-5-9H51z" fill="#4b5563"/>' +
          '<circle class="cd-parpadeo" cx="60" cy="34" r="4.5" fill="#ff4d4d"/>' +
          '<g class="cd-ondas" fill="none" stroke="#0b9bb5" stroke-width="3" stroke-linecap="round"><path d="M45 42a21 21 0 0 0 0 26M75 42a21 21 0 0 1 0 26"/><path d="M37 35a32 32 0 0 0 0 40M83 35a32 32 0 0 1 0 40"/></g>' +
          muro(14, 82, 92, 118, "aluminio", "#5c6b80", 0.6) +
          '<rect x="14" y="82" width="92" height="6" fill="#2c3644"/>' +
          (function () {
            var s = "";
            for (var y = 96; y < 182; y += 21) {
              s += '<rect x="22" y="' + y + '" width="76" height="15" rx="2" fill="#1d2633"/>' +
                '<rect x="54" y="' + (y + 5.5) + '" width="38" height="4" rx="1" fill="#3c4a5e"/>' +
                '<circle class="cd-led" cx="30" cy="' + (y + 7.5) + '" r="2.4" fill="#3fe0a0"/>' +
                '<circle class="cd-led cd-led--b" cx="38" cy="' + (y + 7.5) + '" r="2.4" fill="#3fe0a0"/>';
            }
            return s;
          })() +
          '<rect x="22" y="184" width="76" height="16" fill="#1d2633"/>';
      }
    },
    {
      tld: ".org", nombre: "Organizaciones", alto: 128,
      texto: "Es para organizaciones no gubernamentales o sin fines de lucro, como un refugio de animales o una fundación.",
      ejemplo: ["www.refugiopatitas", ".org"],
      dibujo: function () {
        return muro(16, 110, 88, 90, "estuco", "#f3b6c8", 0.55) +
          '<path d="M4 114L60 72l56 42z" fill="url(#cd-tejas)"/><path d="M4 114L60 72l56 42z" fill="#b5442c" opacity=".35" style="mix-blend-mode:multiply"/>' +
          '<path d="M2 116L60 70l58 46" fill="none" stroke="#7a2e1e" stroke-width="4" stroke-linejoin="round"/>' +
          '<circle cx="60" cy="100" r="11" fill="#ffffff" opacity=".9"/><path d="M60 107l-1.4-1.3c-5-4.5-8.2-7.4-8.2-11a5.2 5.2 0 0 1 9.6-2.9 5.2 5.2 0 0 1 9.6 2.9c0 3.6-3.3 6.5-8.2 11z" fill="#d6336c"/>' +
          ventana(24, 128, 22, 24, "#ffffff") + ventana(74, 128, 22, 24, "#ffffff") +
          puerta(48, 152, 24, 48, true) +
          '<g fill="#8a5a2b"><ellipse cx="90" cy="196" rx="7" ry="4"/><circle cx="96" cy="189" r="4"/><path d="M93 186l1-4 2 3zM98 186l1-4 1 4z"/></g>';
      }
    },
    {
      tld: ".gob", nombre: "Gobierno", alto: 150,
      texto: "<b>.gob</b> y <b>.gov</b> sirven para instituciones de gobierno. En México se usa .gob.mx y en Estados Unidos, .gov.",
      ejemplo: ["www.villaaurora", ".gob.mx"],
      dibujo: function () {
        return '<path d="M60 28v26" stroke="#57534e" stroke-width="2.5"/>' +
          '<g class="cd-bandera"><rect x="61" y="28" width="9" height="15" fill="#006847"/><rect x="70" y="28" width="9" height="15" fill="#ffffff"/><rect x="79" y="28" width="9" height="15" fill="#ce1126"/><circle cx="74.5" cy="35.5" r="2.2" fill="#8a6d3b"/></g>' +
          '<path d="M2 88L60 54l58 34z" fill="url(#cd-cantera)"/><path d="M2 88L60 54l58 34z" fill="#a16207" opacity=".25" style="mix-blend-mode:multiply"/>' +
          '<path d="M24 84L60 63l36 21z" fill="#f5efe4" opacity=".6"/>' +
          '<rect x="4" y="88" width="112" height="9" fill="#e7dcc6"/>' +
          muro(6, 97, 108, 103, "cantera", "#e8d5b0", 0.35) +
          '<g fill="#fbf6ec" opacity=".9"><rect x="13" y="100" width="9" height="86"/><rect x="31" y="100" width="9" height="86"/><rect x="80" y="100" width="9" height="86"/><rect x="98" y="100" width="9" height="86"/></g>' +
          '<g fill="#000" opacity=".12"><rect x="20" y="100" width="2" height="86"/><rect x="38" y="100" width="2" height="86"/><rect x="87" y="100" width="2" height="86"/><rect x="105" y="100" width="2" height="86"/></g>' +
          ventana(50, 104, 20, 22, "#fbf6ec") +
          puerta(46, 140, 28, 46, true) +
          '<rect x="0" y="186" width="120" height="7" fill="#d6c7a8"/><rect x="-4" y="193" width="128" height="7" fill="#c4b392"/>';
      }
    },
    {
      tld: ".edu", nombre: "Educación", alto: 150,
      texto: "Sirve para instituciones de educación, como escuelas y universidades. En México se escribe .edu.mx.",
      ejemplo: ["www.prepasol", ".edu.mx"],
      dibujo: function () {
        return muro(42, 50, 36, 46, "ladrillo", "#b34a2f", 0.55) +
          '<path d="M38 52L60 34l22 18z" fill="#1864ab"/>' +
          '<circle cx="60" cy="70" r="10" fill="#ffffff" stroke="#1864ab" stroke-width="3"/><path class="cd-reloj" d="M60 63v7l5 3" stroke="#1c2434" stroke-width="2" fill="none" stroke-linecap="round"/>' +
          muro(4, 92, 112, 108, "ladrillo", "#b34a2f", 0.55) +
          '<rect x="2" y="88" width="116" height="8" fill="#1864ab"/>' +
          '<rect x="18" y="98" width="84" height="10" fill="#f8f3e6"/><text x="60" y="106" text-anchor="middle" font-family="Lato, sans-serif" font-weight="900" font-size="7.5" fill="#1864ab" letter-spacing="1.2">PREPARATORIA</text>' +
          ventana(12, 116, 20, 22) + ventana(50, 116, 20, 22) + ventana(88, 116, 20, 22) +
          ventana(12, 150, 20, 22) + ventana(88, 150, 20, 22) +
          '<rect x="44" y="148" width="32" height="52" fill="#1864ab"/>' + puerta(47, 152, 12.5, 48) + puerta(60.5, 152, 12.5, 48);
      }
    },
    {
      tld: ".info", nombre: "Información", alto: 112,
      texto: "Es para sitios de información: artículos, guías y datos sobre algún tema.",
      ejemplo: ["www.cacaopedia", ".info"],
      dibujo: function () {
        return '<path d="M8 118h104l-12-26H20z" fill="#5f3dc4"/><path d="M8 118h104l-2 6H10z" fill="#4527a0"/>' +
          muro(18, 124, 84, 76, "estuco", "#c9bdf2", 0.5) +
          '<circle cx="60" cy="104" r="11" fill="#ffffff"/><text x="60" y="110" text-anchor="middle" font-family="Georgia, serif" font-weight="700" font-size="17" fill="#5f3dc4">i</text>' +
          '<rect x="26" y="132" width="68" height="34" rx="2" fill="#2b2140" opacity=".85"/>' +
          '<g><rect x="30" y="137" width="18" height="25" fill="#ffffff"/><rect x="51" y="137" width="18" height="25" fill="#fff4d6"/><rect x="72" y="137" width="18" height="25" fill="#e6f4ff"/></g>' +
          '<g stroke="#5f3dc4" stroke-width="1.4"><path d="M33 142h12M33 147h10M33 152h12M54 142h12M54 147h9M54 152h11M75 142h12M75 147h11M75 152h8"/></g>' +
          '<rect x="22" y="172" width="76" height="28" fill="#4527a0" opacity=".8"/><rect x="26" y="176" width="68" height="20" fill="url(#cd-madera)"/>';
      }
    },
    {
      tld: ".biz", nombre: "Negocios", alto: 190,
      texto: "Viene de <i>business</i> (negocios en inglés) y es para sitios de negocios.",
      ejemplo: ["www.consultorianorte", ".biz"],
      dibujo: function () {
        var s = muro(18, 12, 84, 188, "aluminio", "#3d4a63", 0.7) + '<rect x="18" y="10" width="84" height="6" fill="#1f2937"/>';
        for (var y = 22; y < 160; y += 14) {
          for (var x = 24; x < 96; x += 18) s += '<rect class="cd-v" x="' + x + '" y="' + y + '" width="14" height="10" fill="url(#cd-vidrio)"/>';
        }
        s += '<path d="M18 12L102 120V12z" fill="#ffffff" opacity=".07"/>';
        s += '<rect x="36" y="166" width="48" height="34" fill="#1f2937"/>' + '<rect class="cd-v" x="40" y="170" width="19" height="30" fill="url(#cd-vidrio)"/><rect class="cd-v" x="61" y="170" width="19" height="30" fill="url(#cd-vidrio)"/>';
        return s;
      }
    },
    {
      tld: ".mx", nombre: "México", alto: 140,
      texto: "Indica que el sitio es de México. Se puede usar sola o junto con otra terminación, como .com.mx.",
      ejemplo: ["www.tacosdonpepe", ".mx"],
      dibujo: function () {
        return '<path d="M92 26v68" stroke="#57534e" stroke-width="2.5"/>' +
          '<g class="cd-bandera"><rect x="93" y="26" width="8" height="15" fill="#006847"/><rect x="101" y="26" width="8" height="15" fill="#ffffff"/><rect x="109" y="26" width="8" height="15" fill="#ce1126"/><circle cx="105" cy="33.5" r="2" fill="#8a6d3b"/></g>' +
          muro(8, 92, 104, 108, "estuco", "#f4c95d", 0.6) +
          '<rect x="4" y="86" width="112" height="8" fill="#c0392b"/>' +
          '<g class="cd-papel">' +
          '<path d="M8 96q13 6 26 0v9l-4 3-4-3-5 3-4-3-5 3-4-3z" fill="#e64980"/>' +
          '<path d="M34 96q13 6 26 0v9l-4 3-5-3-4 3-4-3-5 3-4-3z" fill="#2f9e44"/>' +
          '<path d="M60 96q13 6 26 0v9l-4 3-4-3-5 3-4-3-5 3-4-3z" fill="#1c7ed6"/>' +
          '<path d="M86 96q13 6 26 0v9l-4 3-5-3-4 3-4-3-5 3-4-3z" fill="#f59f00"/></g>' +
          ventana(16, 126, 34, 30, "#a0522d") +
          '<rect x="14" y="156" width="38" height="6" fill="#a0522d"/><g><circle cx="22" cy="153" r="4" fill="#2f9e44"/><circle cx="32" cy="152" r="5" fill="#e64980"/><circle cx="43" cy="153" r="4" fill="#2f9e44"/></g>' +
          puerta(68, 132, 30, 68, true);
      }
    }
  ];

  /* ---------- Texturas compartidas (un solo <svg> oculto) ---------- */
  function patron(id, url, tam) {
    return '<pattern id="cd-' + id + '" patternUnits="userSpaceOnUse" width="' + tam + '" height="' + tam + '">' +
      '<image href="' + url + '" width="' + tam + '" height="' + tam + '" preserveAspectRatio="xMidYMid slice"/></pattern>';
  }
  var defs = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  defs.setAttribute("class", "calle-dom__defs");
  defs.setAttribute("aria-hidden", "true");
  defs.innerHTML = "<defs>" +
    patron("ladrillo", TEX.ladrillo, 70) + patron("estuco", TEX.estuco, 90) + patron("cantera", TEX.cantera, 70) +
    patron("tejas", TEX.tejas, 46) + patron("madera", TEX.madera, 60) + patron("aluminio", TEX.aluminio, 90) +
    '<linearGradient id="cd-luz" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".22"/><stop offset=".55" stop-color="#ffffff" stop-opacity="0"/><stop offset="1" stop-color="#000000" stop-opacity=".22"/></linearGradient>' +
    '<linearGradient id="cd-vidrio" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe3ff"/><stop offset="1" stop-color="#4f7fb8"/></linearGradient>' +
    '<linearGradient id="cd-encendida" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3bf"/><stop offset="1" stop-color="#ffc94d"/></linearGradient>' +
    "</defs>";
  root.appendChild(defs);

  /* ---------- La calle ---------- */
  var botones = [];
  EDIFICIOS.forEach(function (e, i) {
    var lote = document.createElement("div");
    lote.className = "calle-dom__lote";
    var top = 200 - e.alto - 30;
    lote.innerHTML =
      '<button type="button" class="calle-dom__edif" aria-pressed="false" aria-label="' + esc(e.nombre + ": " + e.tld) + '">' +
        '<span class="calle-dom__letrero">' + esc(e.tld) + "</span>" +
        '<svg viewBox="-6 ' + top + " 132 " + (200 - top) + '" preserveAspectRatio="xMidYMax meet" aria-hidden="true">' +
          '<ellipse cx="60" cy="200" rx="62" ry="5" fill="#000000" opacity=".18"/>' + e.dibujo() +
        "</svg>" +
      "</button>" +
      '<div class="calle-dom__banqueta"></div><div class="calle-dom__asfalto"></div>';
    var b = lote.querySelector("button");
    b.addEventListener("click", function () { elegir(i); });
    botones.push(b);
    lotes.appendChild(lote);
  });

  /* ---------- Ficha de información ---------- */
  function ficha(e) {
    return '<div class="calle-dom__tld">' + esc(e.tld) + "</div>" +
      '<div class="calle-dom__texto">' +
        '<h3 class="calle-dom__nombre">' + esc(e.nombre) + "</h3>" +
        '<p class="calle-dom__desc">' + e.texto + "</p>" +
        '<div class="calle-dom__placa"><small>Ejemplo</small><span>' + esc(e.ejemplo[0]) + "<b>" + esc(e.ejemplo[1]) + "</b></span></div>" +
      "</div>";
  }
  var tFicha;
  function cambiarFicha(html, inmediato) {
    clearTimeout(tFicha);
    if (reduce || inmediato) { info.innerHTML = html; return; }
    info.classList.add("is-cambiando");
    tFicha = setTimeout(function () {
      info.innerHTML = html;
      info.classList.remove("is-cambiando");
    }, 220);
  }

  /* ---------- El carrito ---------- */
  carro.innerHTML =
    '<svg viewBox="0 0 84 40" aria-hidden="true">' +
      '<ellipse cx="42" cy="37" rx="38" ry="3" fill="#000" opacity=".25"/>' +
      '<path d="M6 28c0-6 3-9 9-10l10-9c3-3 6-4 11-4h14c5 0 8 2 11 5l7 8c9 1 12 4 12 10v3H6z" fill="#e03131"/>' +
      '<path d="M27 11c2-2 5-3 9-3h5v10H19zM45 8h5c4 0 6 1 8 3l7 7H45z" fill="#bfe3ff"/>' +
      '<path d="M6 26h72" stroke="#ffffff" stroke-width="1.5" opacity=".5"/>' +
      '<rect x="74" y="21" width="5" height="4" rx="1" fill="#ffe066"/><rect x="5" y="22" width="4" height="3" rx="1" fill="#ff8787"/>' +
      '<g class="calle-dom__rueda" style="transform-origin:22px 31px"><circle cx="22" cy="31" r="7" fill="#1f2328"/><circle cx="22" cy="31" r="3.2" fill="#c9ced6"/><path d="M22 25v12M16 31h12" stroke="#1f2328" stroke-width="1.6"/></g>' +
      '<g class="calle-dom__rueda" style="transform-origin:64px 31px"><circle cx="64" cy="31" r="7" fill="#1f2328"/><circle cx="64" cy="31" r="3.2" fill="#c9ced6"/><path d="M64 25v12M58 31h12" stroke="#1f2328" stroke-width="1.6"/></g>' +
    "</svg>";

  var auto = { lote: -1, x: 0, y: 0, izq: false };
  function lugar(i) {
    var lote = lotes.children[i];
    var asf = lote.querySelector(".calle-dom__asfalto");
    var e = escena.getBoundingClientRect(), r = asf.getBoundingClientRect();
    var w = carro.offsetWidth, h = carro.offsetHeight;
    return {
      x: r.left - e.left + r.width / 2 - w / 2,
      y: r.top - e.top + r.height / 2 - h / 2 - 2,
      fila: Math.round(r.top),
      inicio: lotes.children[0].getBoundingClientRect().left - e.left - w
    };
  }
  function poner(x, y, izq) {
    carro.style.transform = "translate(" + x + "px," + y + "px)";
    carro.firstChild.style.transform = izq ? "scaleX(-1)" : "";
    auto.x = x; auto.y = y; auto.izq = izq;
  }
  function manejar(i, inmediato) {
    var p = lugar(i);
    var anterior = auto.lote >= 0 ? lugar(auto.lote) : null;
    auto.lote = i;
    if (reduce || inmediato) {
      carro.classList.add("sin-transicion");
      poner(p.x, p.y, false);
      void carro.offsetWidth;
      carro.classList.remove("sin-transicion");
      return;
    }
    var mismaFila = anterior && anterior.fila === p.fila;
    function arrancar() {
      var izq = p.x < auto.x;
      carro.classList.add("is-andando");
      carro.style.transitionDuration = Math.min(1.4, 0.45 + Math.abs(p.x - auto.x) / 700) + "s";
      poner(p.x, p.y, izq);
      clearTimeout(auto.t);
      auto.t = setTimeout(function () { carro.classList.remove("is-andando"); }, 1400);
    }
    if (mismaFila) { arrancar(); return; }
    // Otra cuadra (celular) o la primera vez: entra desde la orilla izquierda
    carro.classList.add("sin-transicion", "is-oculto");
    poner(Math.max(-carro.offsetWidth, p.inicio), p.y, false);
    void carro.offsetWidth;
    carro.classList.remove("sin-transicion", "is-oculto");
    arrancar();
  }

  /* ---------- Elegir un edificio ---------- */
  var actual = -1;
  function elegir(i, inmediato) {
    if (i === actual) return;
    actual = i;
    root.classList.add("tiene-elegido");
    botones.forEach(function (b, j) {
      b.classList.toggle("is-elegido", j === i);
      b.setAttribute("aria-pressed", j === i ? "true" : "false");
    });
    cambiarFicha(ficha(EDIFICIOS[i]), inmediato);
    manejar(i, inmediato);
  }

  // Al cambiar el ancho, el carrito se queda frente a su edificio sin animarse
  var tRes;
  window.addEventListener("resize", function () {
    clearTimeout(tRes);
    tRes = setTimeout(function () {
      if (auto.lote < 0) return;
      var p = lugar(auto.lote);
      carro.classList.add("sin-transicion");
      poner(p.x, p.y, auto.izq);
      void carro.offsetWidth;
      carro.classList.remove("sin-transicion");
    }, 120);
  });

  // Empieza con la tienda (.com) elegida y el carrito estacionado enfrente
  elegir(0, true);
})();
