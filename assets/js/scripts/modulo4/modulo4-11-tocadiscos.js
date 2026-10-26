/* Módulo 4-11: el ciclo while como un tocadiscos (estilos en
   assets/css/modulos/modulo4/modulo4-11-tocadiscos.css).

   El arreglo sale de la lista oculta [data-tt-src] de la página: cada
   elemento es una canción del disco, de afuera hacia adentro. Antes del
   ciclo, var i = 0 baja la aguja al inicio del disco; la condición es el
   foco junto al brazo; el cuerpo hace sonar la canción (la etiqueta muestra
   su instrumento y el medidor se mueve) e i++ pasa la aguja a la siguiente.

   El recorrido se arma como una lista de pasos (antes del ciclo, condición,
   cuerpo, i++) y la escena se pinta a partir del paso en el que vamos, así
   que avanzar y regresar usan el mismo código. Dentro de la ventana de
   código se puede hacer clic en i++ para quitarlo (el disco se raya: ciclo
   infinito, con un botón ALTO) y en la condición para cambiarla por una que
   compara texto. Con "reducir movimiento" todo ocurre sin animaciones. */
(function () {
  "use strict";

  var root = document.querySelector("[data-tocadiscos]");
  if (!root) return;

  var FOTOS = "../../assets/images/course/modulo4/m4-11/tocadiscos/fotos/";

  // Los elementos del arreglo, tal como están escritos en la página
  var items = [].map.call(root.querySelectorAll("[data-tt-src] li"), function (li) {
    return { nombre: li.textContent.trim(), img: li.getAttribute("data-img"), color: li.getAttribute("data-color") || "#fac775" };
  });
  if (!items.length) return;

  var N = items.length;
  var ALT = items[Math.min(3, N - 1)].nombre; // la condición de texto se detiene en este elemento

  var tt = root.querySelector("[data-tt-scene]");
  var codeEl = root.querySelector("[data-code]");
  var status = root.querySelector("[data-status]");
  var counter = root.querySelector("[data-counter]");
  var check = root.querySelector("[data-check]");
  var b = {
    reset: root.querySelector("[data-reset]"),
    back: root.querySelector("[data-back]"),
    step: root.querySelector("[data-step]"),
    alto: root.querySelector("[data-alto]")
  };

  function each(list, fn) { Array.prototype.forEach.call(list, fn); }

  /* ---------- El tocadiscos (SVG) ----------
     Visto desde arriba: el disco gira alrededor de (210, 220) y el brazo
     alrededor de su base en (440, 74); la aguja queda a 250 unidades de la
     base. Cada canción es un anillo del disco, de afuera hacia adentro. */
  var CX = 210, CY = 220;
  function radio(k) { return 184 - 21 * k - 9.5; }

  function dibujaTocadiscos() {
    var s = [];
    s.push('<svg class="tt__svg" viewBox="0 0 520 440" role="img" aria-label="Tocadiscos con un disco de ' + N +
      ' canciones; el brazo avanza una canción por vuelta del ciclo">');
    s.push('<defs>' +
      '<linearGradient id="tt-madera" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#83502d"/><stop offset=".5" stop-color="#6b3f22"/><stop offset="1" stop-color="#4f2c16"/></linearGradient>' +
      '<pattern id="tt-veta" width="520" height="46" patternUnits="userSpaceOnUse"><path d="M0 10c80 -6 160 8 260 0s180 -6 260 2M0 26c90 6 170 -6 260 2s170 8 260 -2M0 38c60 -4 140 6 230 0s200 -4 290 2" fill="none" stroke="#2e170a" stroke-opacity=".28" stroke-width="1.4"/></pattern>' +
      '<linearGradient id="tt-alu" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f6f8"/><stop offset=".5" stop-color="#cfd5dd"/><stop offset="1" stop-color="#a9b1bc"/></linearGradient>' +
      '<linearGradient id="tt-borde" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e6e9ee"/><stop offset=".5" stop-color="#aab2be"/><stop offset="1" stop-color="#d4d9e0"/></linearGradient>' +
      '<radialGradient id="tt-vinilo"><stop offset=".3" stop-color="#1d1d1f"/><stop offset="1" stop-color="#0c0c0d"/></radialGradient>' +
      '<linearGradient id="tt-brillo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".13"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
      '<linearGradient id="tt-tubo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8e99aa"/><stop offset=".4" stop-color="#f7f9fb"/><stop offset="1" stop-color="#7d8796"/></linearGradient>' +
      '<linearGradient id="tt-contrapeso" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5b6577"/><stop offset=".45" stop-color="#c9d0da"/><stop offset="1" stop-color="#3a4352"/></linearGradient>' +
      '<clipPath id="tt-etq"><circle cx="' + CX + '" cy="' + CY + '" r="58"/></clipPath>' +
      '</defs>');

    // Mueble de madera, placa de aluminio, descanso del brazo y foco de la condición
    s.push('<rect x="6" y="6" width="508" height="428" rx="22" fill="url(#tt-madera)"/>');
    s.push('<rect x="6" y="6" width="508" height="428" rx="22" fill="url(#tt-veta)"/>');
    s.push('<rect x="12" y="12" width="496" height="416" rx="18" fill="none" stroke="#ffdcb4" stroke-opacity=".2" stroke-width="2"/>');
    s.push('<rect x="384" y="22" width="114" height="272" rx="12" fill="url(#tt-alu)" stroke="#8f98a5" stroke-width="1"/>');
    s.push('<path d="M392 32H490" stroke="#fff" stroke-opacity=".7"/>');
    s.push('<rect x="430" y="306" width="20" height="16" rx="4" fill="#2b3346"/><path d="M432 306v-6h4v6M444 306v-6h4v6" fill="#2b3346"/>');
    s.push('<circle cx="472" cy="232" r="10" fill="#2b3346"/><circle class="tt__led" data-led cx="472" cy="232" r="6.5"/>');
    s.push('<text x="472" y="256" text-anchor="middle" font-family="Consolas, monospace" font-size="8.6" font-weight="700" fill="#3a4352">condición</text>');

    // Disco que gira: plato, puntos estroboscópicos, vinilo, surcos, canciones y etiqueta
    s.push('<g class="tt__disco">');
    s.push('<circle cx="' + CX + '" cy="' + CY + '" r="206" fill="url(#tt-borde)" stroke="#6c7480" stroke-width="1.5"/>');
    s.push('<circle cx="' + CX + '" cy="' + CY + '" r="199" fill="none" stroke="#5f6773" stroke-width="5" stroke-dasharray="3.5 6.97"/>');
    s.push('<circle cx="' + CX + '" cy="' + CY + '" r="188" fill="url(#tt-vinilo)"/>');
    for (var r = 186; r > 62; r -= 2.3) {
      s.push('<circle cx="' + CX + '" cy="' + CY + '" r="' + r.toFixed(1) + '" fill="none" stroke="#2a2a2c" stroke-width=".7"/>');
    }
    for (var k = 0; k < N; k++) {
      s.push('<circle class="tt__pista" data-pista="' + k + '" cx="' + CX + '" cy="' + CY + '" r="' + radio(k) +
        '" fill="none" stroke="#fac775" stroke-opacity=".28" stroke-width="18"/>');
      s.push('<circle cx="' + CX + '" cy="' + CY + '" r="' + (184 - 21 * k - 19.5) + '" fill="none" stroke="#4a4a4e" stroke-width="2.2"/>');
    }
    // El rayón del disco (solo se ve sin i++)
    s.push('<path class="tt__rayon" d="M357 158q6 8 9 17l-4 1q4 6 5 14" fill="none" stroke="#f2f2f2" stroke-width="1.8" stroke-linecap="round"/>');
    // Etiqueta azul del disco: "Lado A" y el nombre del arreglo
    s.push('<circle cx="' + CX + '" cy="' + CY + '" r="58" fill="#093b8b"/><circle cx="' + CX + '" cy="' + CY + '" r="52" fill="none" stroke="#fac775" stroke-width="1.5"/>');
    s.push('<text x="' + CX + '" y="' + (CY - 14) + '" text-anchor="middle" font-family="Roboto, Arial, sans-serif" font-size="13" font-weight="700" letter-spacing="2" fill="#fac775">LADO A</text>');
    s.push('<text x="' + CX + '" y="' + (CY + 26) + '" text-anchor="middle" font-family="Consolas, monospace" font-size="12" font-weight="700" fill="#ffffff">elementos</text>');
    s.push('<circle cx="' + CX + '" cy="' + CY + '" r="4" fill="url(#tt-alu)" stroke="#6c7480"/>');
    s.push('</g>');
    // La etiqueta de la canción que suena no gira con el disco, para que se
    // alcance a ver su instrumento
    items.forEach(function (it, k) {
      s.push('<g class="tt__etq" data-etq="' + k + '">' +
        '<circle cx="' + CX + '" cy="' + CY + '" r="66" fill="#fff6df"/>' +
        '<circle cx="' + CX + '" cy="' + CY + '" r="62" fill="none" stroke="' + it.color + '" stroke-width="6"/>' +
        '<image href="' + FOTOS + it.img + '" x="' + (CX - 42) + '" y="' + (CY - 54) + '" width="84" height="76" clip-path="url(#tt-etq)" preserveAspectRatio="xMidYMid meet"/>' +
        '<text x="' + CX + '" y="' + (CY + 40) + '" text-anchor="middle" font-family="Consolas, monospace" font-size="13" font-weight="700" fill="#1c2434">' + it.nombre + '</text>' +
        '<circle cx="' + CX + '" cy="' + CY + '" r="4" fill="url(#tt-alu)" stroke="#6c7480"/>' +
        '</g>');
    });
    // Reflejos fijos sobre el vinilo
    s.push('<path d="M' + CX + ' ' + CY + 'L' + (CX + 120) + ' ' + (CY - 150) + 'A190 190 0 0 1 ' + (CX + 168) + ' ' + (CY - 88) + 'Z" fill="url(#tt-brillo)"/>');
    s.push('<path d="M' + CX + ' ' + CY + 'L' + (CX - 120) + ' ' + (CY + 150) + 'A190 190 0 0 1 ' + (CX - 168) + ' ' + (CY + 88) + 'Z" fill="url(#tt-brillo)"/>');

    // Notas musicales: salen junto a la aguja mientras suena una canción
    var nota = function (c, x, y) {
      return '<g transform="translate(' + x + ' ' + y + ')"><g class="tt__nota" fill="' + c + '"><ellipse cx="0" cy="0" rx="5" ry="3.6" transform="rotate(-22)"/>' +
        '<rect x="3.6" y="-18" width="1.8" height="18"/><path d="M5.4 -18q8 3 6.5 11q-1.5 -5 -6.5 -6z"/></g></g>';
    };
    s.push('<g data-notas>' + nota("#fac775", -4, -6) + nota("#ffffff", 10, -2) + nota("#ffd98a", 2, 4) + '</g>');

    // Base del brazo (fija) y brazo, dibujado hacia la derecha desde la base; la aguja queda en (690, 74)
    s.push('<circle cx="440" cy="74" r="31" fill="url(#tt-alu)" stroke="#8f98a5" stroke-width="1.5"/><circle cx="440" cy="74" r="19" fill="#2b3346"/>');
    s.push('<g class="tt__brazo" data-brazo>' +
      '<rect x="382" y="61" width="32" height="26" rx="6" fill="url(#tt-contrapeso)" stroke="#2b3346" stroke-width="1"/>' +
      '<path d="M388 61v26M394 61v26M400 61v26" stroke="#2b3346" stroke-opacity=".35"/>' +
      '<rect x="412" y="71" width="254" height="6" rx="3" fill="url(#tt-tubo)" stroke="#6c7480" stroke-width=".6"/>' +
      '<circle cx="440" cy="74" r="11" fill="#d7dce3" stroke="#6c7480" stroke-width="1.2"/><circle cx="440" cy="74" r="3" fill="#2b3346"/>' +
      '<g class="tt__cabeza"><g transform="rotate(-14 664 74)"><rect x="662" y="64" width="40" height="20" rx="3" fill="#1c2434"/><rect x="666" y="67" width="22" height="13" rx="2" fill="#093b8b"/>' +
      '<path d="M702 68l12 -8" stroke="#c9d0da" stroke-width="3" stroke-linecap="round"/></g><circle cx="690" cy="76" r="2.4" fill="#fac775"/></g>' +
      '</g>');
    s.push('</svg>');
    return s.join("");
  }

  // Medidor VU del amplificador: la aguja baila mientras suena una canción
  function dibujaVumetro() {
    var s = ['<svg class="tt__vu" viewBox="0 0 160 92" aria-hidden="true">',
      '<rect x="1" y="1" width="158" height="90" rx="7" fill="#f6ecd2" stroke="#8f98a5"/>',
      '<path d="M38.4 37.6A56 56 0 0 1 121.6 37.6" fill="none" stroke="#1c2434" stroke-width="1.6"/>',
      '<path d="M108 30A56 56 0 0 1 121.6 37.6" fill="none" stroke="#d23a22" stroke-width="4"/>'];
    for (var t = 0; t <= 10; t++) {
      var a = (90 + 48 - t * 9.6) * Math.PI / 180;
      s.push('<path d="M' + (80 + 56 * Math.cos(a)).toFixed(1) + " " + (78 - 56 * Math.sin(a)).toFixed(1) +
        "L" + (80 + 62 * Math.cos(a)).toFixed(1) + " " + (78 - 62 * Math.sin(a)).toFixed(1) +
        '" stroke="' + (t > 7 ? "#d23a22" : "#1c2434") + '" stroke-width="1.4"/>');
    }
    s.push('<text x="80" y="62" text-anchor="middle" font-family="Roboto, Arial, sans-serif" font-size="13" font-weight="700" fill="#1c2434">VU</text>');
    s.push('<g class="tt__vu-aguja"><path d="M80 78V24" stroke="#1c2434" stroke-width="1.6" stroke-linecap="round"/></g>');
    s.push('<rect x="60" y="74" width="40" height="18" rx="3" fill="#2b3346"/>');
    s.push('<path d="M6 6h148v30C110 20 50 20 6 36z" fill="#fff" opacity=".25"/>');
    s.push("</svg>");
    return s.join("");
  }

  root.querySelector("[data-tt-disco]").innerHTML = dibujaTocadiscos();
  root.querySelector("[data-tt-vu]").innerHTML = dibujaVumetro();

  var brazo = root.querySelector("[data-brazo]");
  var notas = root.querySelector("[data-notas]");
  var led = root.querySelector("[data-led]");
  var pistas = root.querySelectorAll("[data-pista]");
  var etqs = root.querySelectorAll("[data-etq]");

  // Para cada canción se busca el ángulo del brazo que deja la aguja a la
  // distancia r del centro del disco (ley de cosenos). En reposo, 90°.
  var P = { x: 440, y: 74 }, L = 250, REPOSO = 90;
  var D = Math.sqrt((CX - P.x) * (CX - P.x) + (CY - P.y) * (CY - P.y));
  var PHI = Math.atan2(CY - P.y, CX - P.x);
  function angulo(r) { return (PHI - Math.acos((L * L + D * D - r * r) / (2 * L * D))) * 180 / Math.PI; }

  root.classList.add("tt--ready");

  /* ---------- Los pasos del ciclo ---------- */
  var inc = true;      // ¿el cuerpo termina con i++?
  var texto = false;   // ¿la condición compara texto en lugar de contar?

  function cumple(i) { return texto ? (i < N ? items[i].nombre : undefined) != ALT : i < N; }

  function makeSteps() {
    var s = [{ parte: "init", i: 0 }];
    var i = 0, vuelta = 0;
    while (s.length < 700) {
      var ok = cumple(i);
      s.push({ parte: "cond", i: i, ok: ok });
      if (!ok) { s.push({ parte: "fin", i: i }); break; }
      s.push({ parte: "body", i: i, vuelta: ++vuelta });
      if (inc) { i++; s.push({ parte: "inc", i: i }); }
    }
    return s;
  }

  // Cómo queda todo después del paso k
  function foto(k) {
    var f = { st: k >= 0 ? pasos[k] : null, i: null, ok: null, lineas: [], visitas: [], vueltas: 0 };
    for (var n = 0; n <= k; n++) {
      var p = pasos[n];
      if (p.parte === "init" || p.parte === "inc") { f.i = p.i; f.ok = null; }
      else if (p.parte === "cond") { f.i = p.i; f.ok = p.ok; }
      else if (p.parte === "body") { f.lineas.push(p.i + ": " + items[p.i].nombre); f.visitas[p.i] = true; f.vueltas = p.vuelta; }
    }
    return f;
  }

  /* ---------- La ventana de código ---------- */
  function pintaCodigo() {
    var cond = texto ? "elementos[i] != \"" + ALT + "\"" : "i &lt; elementos.length";
    var lista = items.map(function (it) { return '"' + it.nombre + '"'; });
    var linea = lista.slice(0, 3).join(", ") + ",\n                 " + lista.slice(3).join(", ");
    var masMenos = inc
      ? '<span data-part="inc" class="tt__tog" data-tog="inc" role="button" tabindex="0" title="Quitar i++">i++;</span>'
      : '<span class="tt__tog js-term__com" data-tog="inc" role="button" tabindex="0" title="Volver a poner i++">// i++;</span>';
    codeEl.querySelector(".js-term__code").innerHTML =
      "var elementos = [" + linea + "];\n" +
      '<span data-part="init">var i = 0;</span>\n\n' +
      'while (<span data-part="cond" class="tt__tog" data-tog="cond" role="button" tabindex="0" title="Cambiar la condición">' + cond + "</span>) {\n" +
      '  <span data-part="body">console.log(i + ": " + elementos[i]);</span>\n' +
      "  " + masMenos + "\n}";
  }

  // La pantalla del amplificador dice "i < 5 = true"; al pasar el cursor
  // sobre la i (o sobre elementos[i]) se ve el valor que tiene
  function pantalla(f) {
    var res = f.ok === null ? "<b>…</b>" : f.ok ? '<b class="is-true">true</b>' : '<b class="is-false">false</b>';
    if (texto) {
      var e = f.i === null ? "–" : f.i < N ? '"' + items[f.i].nombre + '"' : "undefined";
      return '<span class="tt__i" tabindex="0"><span class="tt__i-nom">elementos[i]</span><span class="tt__i-val">' + e + "</span></span>\n!= \"" + ALT + "\"\n= " + res;
    }
    return '<span class="tt__i" tabindex="0"><span class="tt__i-nom">i</span><span class="tt__i-val">' + (f.i === null ? "–" : f.i) +
      "</span></span> &lt; " + N + " = " + res;
  }

  // Solo caben 6 renglones: si hay más, arriba se avisa cuántos se fueron
  function pintaConsola(f, nuevo) {
    var MAX = 6, html = "";
    var desde = f.lineas.length > MAX ? f.lineas.length - (MAX - 1) : 0;
    if (desde > 0) html += '<span class="tt__mas">↑ ' + desde + " renglones más</span>";
    for (var j = desde; j < f.lineas.length; j++) {
      html += "<span" + (nuevo && j === f.lineas.length - 1 ? ' class="is-new"' : "") + ">" + f.lineas[j] + "</span>";
    }
    consola.innerHTML = html;
  }

  /* ---------- La explicación ---------- */
  function nom(t) { return '<span class="code">' + t + "</span>"; }

  function explica(f) {
    var st = f.st, i = st.i;
    var cond = texto ? '<b>elementos[' + i + '] != "' + ALT + '"</b>' : "<b>" + i + " &lt; " + N + "</b>";
    if (loco) return nom("Ciclo infinito") + ": la aguja nunca avanza y el disco se queda rayado, repitiendo la canción 0. Presiona <b>ALTO</b> para detenerlo.";
    switch (st.parte) {
      case "init":
        return nom("Antes del ciclo") + ": el <b>while</b> no tiene lugar para la expresión inicial, así que el contador <b>i = 0</b> se crea afuera, en la línea de arriba. El brazo pone la aguja al inicio del disco, en la canción <b>0</b>, y el disco empieza a girar.";
      case "cond":
        if (!st.ok) {
          return nom("Expresión condicional") + ": ¿" + cond + "? " +
            (texto ? "La canción <b>" + i + '</b> es <b>"' + ALT + '"</b>' : "La aguja llegó al centro del disco, donde ya no hay canciones") +
            ', así que es <span class="no">false</span> y el ciclo termina.';
        }
        if (!inc && f.vueltas >= 1) {
          return nom("Expresión condicional") + ": ¿" + cond + '? Otra vez <span class="si">true</span>: como quitamos <b>i++</b>, i sigue valiendo <b>0</b> y la condición nunca cambia.';
        }
        return nom("Expresión condicional") + ": ¿" + cond + "? " +
          (texto ? 'La canción es <b>"' + items[i].nombre + '"</b>' : "Hay una canción <b>" + i + "</b> debajo de la aguja") +
          ', así que es <span class="si">true</span> y entramos al ciclo.';
      case "body":
        if (!inc && st.vuelta >= 2) {
          return nom("Cuerpo del ciclo") + ", vuelta " + st.vuelta + ": la aguja vuelve a tocar la canción 0, como un disco rayado, y la consola vuelve a mostrar <b>0: " + items[0].nombre + "</b>.";
        }
        return nom("Cuerpo del ciclo") + ", vuelta " + st.vuelta + ": suena la canción <b>" + i + "</b> y la consola muestra <b>" + i + ": " + items[i].nombre + "</b>.";
      case "inc":
        return nom("Actualizar el contador") + ": <b>i++</b> es la última línea del cuerpo. Sube i a <b>" + i + "</b> y " +
          (i < N ? "la aguja pasa a la canción <b>" + i + "</b>" : "la aguja llega al centro del disco") + ". Después el while vuelve a revisar la condición.";
      default:
        return "Fin del ciclo: " + (texto ? "el brazo se levanta antes de tocar la canción <b>\"" + ALT + "\"</b>." : "sonaron las " + N + " canciones y el brazo regresa a su lugar.") +
          " El programa sigue con la línea que está después de la llave <b>}</b>.";
    }
  }

  function textoAlto(f) {
    return nom("Ciclo infinito") + ": detuviste el tocadiscos después de <b>" + f.vueltas + "</b> vueltas. En un programa de verdad no hay botón de ALTO: la página se queda trabada. Haz clic en <b>// i++;</b> dentro del código para volver a ponerlo.";
  }

  /* ---------- Pintar la escena ---------- */
  var pasos, k, f = null, nota = "", loco = false, detenido = false, timer = null;
  var consola = codeEl.querySelector("[data-console]");

  function pinta(nk, dir) {
    var antes = f;
    k = nk;
    f = foto(k);
    var st = f.st, hay = f.i !== null, fin = !!st && st.parte === "fin";

    each(codeEl.querySelectorAll("[data-part]"), function (el) {
      el.classList.toggle("is-on", !!st && !fin && el.getAttribute("data-part") === st.parte);
    });
    pintaConsola(f, dir > 0 && antes && f.lineas.length > antes.lineas.length);

    // El brazo: en reposo, o con la aguja sobre la canción i (en el centro si ya no hay)
    var th = !hay || fin ? REPOSO : angulo(f.i >= N ? 70 : radio(f.i));
    brazo.style.transform = "rotate(" + th + "deg)";
    var rad = th * Math.PI / 180;
    notas.setAttribute("transform", "translate(" + (P.x + L * Math.cos(rad)).toFixed(1) + " " + (P.y + L * Math.sin(rad)).toFixed(1) + ")");
    tt.classList.toggle("is-playing", hay && !fin);
    tt.classList.toggle("is-singing", !!st && st.parte === "body");
    each(pistas, function (p, n) {
      p.classList.toggle("is-here", !!st && st.parte === "body" && st.i === n);
      p.classList.toggle("is-done", !!f.visitas[n]);
    });
    var etq = hay && !fin && f.i < N ? f.i : -1;
    each(etqs, function (e, n) { e.classList.toggle("is-on", n === etq); });
    led.classList.remove("is-true", "is-false");
    if (st && (st.parte === "cond" || fin)) led.classList.add(f.ok ? "is-true" : "is-false");

    counter.textContent = "i = " + (hay ? f.i : "–");
    check.innerHTML = pantalla(f);

    // Sin i++, a la tercera vuelta el tocadiscos sigue solo: ciclo infinito
    if (!inc && dir > 0 && st && st.parte === "body" && f.vueltas >= 3 && !loco && !detenido) arranca();

    status.innerHTML = detenido ? textoAlto(f) : st ? explica(f) : nota;

    b.back.disabled = k < 0 || detenido;
    b.step.disabled = detenido || loco || fin;
    b.alto.disabled = !loco;
  }

  function para() {
    clearTimeout(timer);
    timer = null;
    loco = false;
    root.classList.remove("is-loco", "is-halted");
  }

  // El ciclo infinito avanza solo, cada vez más rápido, hasta que se presiona ALTO
  function arranca() {
    var espera = 700;
    loco = true;
    root.classList.add("is-loco");
    function tic() {
      if (!loco) return;
      if (f.vueltas >= 99) return alto();
      pinta(k + 1, 1);
      espera = Math.max(140, espera * 0.86);
      timer = setTimeout(tic, espera);
    }
    timer = setTimeout(tic, espera);
  }

  function alto() {
    if (!loco) return;
    clearTimeout(timer);
    timer = null;
    loco = false;
    detenido = true;
    root.classList.remove("is-loco");
    root.classList.add("is-halted");
    pinta(k, 0);
  }

  function reiniciar() {
    para();
    detenido = false;
    pasos = makeSteps();
    f = null;
    pinta(-1, 0);
  }

  // Quitar o poner i++, o cambiar la condición: el programa cambió, así que empieza de nuevo
  function cambia(que) {
    if (que === "inc") inc = !inc;
    else texto = !texto;
    root.classList.toggle("is-sin-inc", !inc);
    root.classList.toggle("is-texto", texto);
    pintaCodigo();
    if (que === "inc") {
      nota = inc
        ? "Volviste a poner <b>i++</b> al final del cuerpo: el ciclo ya puede terminar."
        : "Quitaste <b>i++</b> del cuerpo del ciclo (quedó como comentario). Avanza paso a paso para ver qué pasa.";
    } else {
      nota = texto
        ? "Ahora la condición compara texto: el ciclo sigue <b>mientras</b> la canción no sea <b>\"" + ALT + "\"</b>, sin contar cuántas hay."
        : "La condición volvió a ser <b>i &lt; elementos.length</b>.";
    }
    reiniciar();
    var t = codeEl.querySelector('[data-tog="' + que + '"]');
    if (t) t.focus();
  }

  /* ---------- Los botones ---------- */
  b.step.addEventListener("click", function () {
    if (detenido || loco || k >= pasos.length - 1) return;
    nota = "";
    pinta(k + 1, 1);
  });
  b.back.addEventListener("click", function () {
    if (k < 0) return;
    para();
    pinta(k - 1, -1);
  });
  b.reset.addEventListener("click", function () {
    nota = "";
    reiniciar();
  });
  b.alto.addEventListener("click", alto);

  codeEl.addEventListener("click", function (e) {
    var t = e.target.closest("[data-tog]");
    if (t) cambia(t.getAttribute("data-tog"));
  });
  codeEl.addEventListener("keydown", function (e) {
    var t = e.target.closest("[data-tog]");
    if (t && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      cambia(t.getAttribute("data-tog"));
    }
  });

  pintaCodigo();
  reiniciar();
})();
