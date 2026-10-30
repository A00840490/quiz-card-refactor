/* Módulo 4-11: el ciclo while como un tocadiscos (estilos en
   assets/css/modulos/modulo4/modulo4-11-tocadiscos.css).

   El arreglo sale de la lista oculta [data-tt-src] de la página: cada
   elemento es un disco de vinil del color de su género. Antes del ciclo,
   var i = 0 sube el disco 0 al tocadiscos; la condición es el foco junto al
   brazo (si es true, la aguja baja); el cuerpo hace sonar el disco (salen notas
   junto a la aguja) e i++ levanta la aguja y cambia el disco: el que sonó sale por
   la izquierda y el siguiente sube desde abajo.

   El recorrido se arma como una lista de pasos (antes del ciclo, condición,
   cuerpo, i++) y la escena se pinta a partir del paso en el que vamos, así
   que avanzar y regresar usan el mismo código. Dentro de la ventana de
   código, i++ y la condición son listas desplegables (el menú de vidrio del
   3-23): sin i++ el disco se raya (ciclo infinito: se enciende la torreta de
   emergencia y reiniciar se marca en dorado) y la otra condición compara
   texto. Con "reducir movimiento" todo ocurre sin
   animaciones. */
(function () {
  "use strict";

  var root = document.querySelector("[data-tocadiscos]");
  if (!root) return;

  var FOTOS = "../../assets/images/course/modulo4/m4-11/tocadiscos/fotos/";
  var TEXTURAS = "../../assets/images/course/modulo4/m4-11/tocadiscos/texturas/";

  // Los elementos del arreglo, tal como están escritos en la página
  var items = [].map.call(root.querySelectorAll("[data-tt-src] li"), function (li) {
    return { nombre: li.textContent.trim(), img: li.getAttribute("data-img"), color: li.getAttribute("data-color") || "#fac775" };
  });
  if (!items.length) return;

  var N = items.length;
  var ALT = items[Math.min(3, N - 1)].nombre; // la condición de texto se detiene en este elemento

  var codeEl = root.querySelector("[data-code]");
  var status = root.querySelector("[data-status]");
  var counter = root.querySelector("[data-counter]");
  var b = {
    reset: root.querySelector("[data-reset]"),
    back: root.querySelector("[data-back]"),
    step: root.querySelector("[data-step]")
  };

  function each(list, fn) { Array.prototype.forEach.call(list, fn); }

  /* ---------- El tocadiscos (SVG) ----------
     Visto desde arriba: el plato gira alrededor de (210, 220) y el brazo
     alrededor de su base en (440, 74). Cada elemento del arreglo es un disco
     de vinil del color de su género, con su nombre escrito cuatro veces
     alrededor (así siempre se alcanza a leer uno mientras gira) y el
     instrumento en la etiqueta. Los discos esperan abajo, fuera del mueble;
     con i++ el disco que sonó sale por la izquierda y el siguiente sube. */
  var CX = 210, CY = 220;
  var CABEZA = 20; // la cabeza del brazo va girada hacia el centro del disco

  function dibujaDisco(it, k) {
    var s = [];
    s.push('<g class="tt__disco" data-disco="' + k + '"><g class="tt__giro">');
    s.push('<circle cx="' + CX + '" cy="' + CY + '" r="190" fill="' + it.color + '"/>');
    s.push('<circle cx="' + CX + '" cy="' + CY + '" r="190" fill="url(#tt-sombra)"/>');
    for (var r = 186; r > 72; r -= 2.6) {
      s.push('<circle cx="' + CX + '" cy="' + CY + '" r="' + r.toFixed(1) + '" fill="none" stroke="#000" stroke-opacity=".2" stroke-width=".7"/>');
    }
    // El nombre del género, cuatro veces alrededor del disco
    s.push('<text font-family="Roboto, Arial, sans-serif" font-size="32" font-weight="800" letter-spacing="6" dominant-baseline="central" fill="#ffffff" fill-opacity=".9">');
    for (var q = 0; q < 4; q++) {
      s.push('<textPath href="#tt-anillo" startOffset="' + (12.5 + 25 * q) + '%" text-anchor="middle">' + it.nombre.toUpperCase() + "</textPath>");
    }
    s.push("</text>");
    // Etiqueta: solo el instrumento
    s.push('<circle cx="' + CX + '" cy="' + CY + '" r="64" fill="#fff6df"/>');
    s.push('<circle cx="' + CX + '" cy="' + CY + '" r="60.5" fill="none" stroke="' + it.color + '" stroke-width="5"/>');
    s.push('<image href="' + FOTOS + it.img + '" x="' + (CX - 50) + '" y="' + (CY - 50) + '" width="100" height="100" clip-path="url(#tt-etq)" preserveAspectRatio="xMidYMid meet"/>');
    // El rayón del disco 0 (solo se ve sin i++)
    if (k === 0) s.push('<path class="tt__rayon" d="M357 158q6 8 9 17l-4 1q4 6 5 14" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>');
    s.push("</g>");
    // Reflejos fijos sobre el vinil (no giran)
    s.push('<path d="M' + CX + ' ' + CY + 'L' + (CX + 120) + ' ' + (CY - 150) + 'A190 190 0 0 1 ' + (CX + 168) + ' ' + (CY - 88) + 'Z" fill="url(#tt-brillo)"/>');
    s.push('<path d="M' + CX + ' ' + CY + 'L' + (CX - 120) + ' ' + (CY + 150) + 'A190 190 0 0 1 ' + (CX - 168) + ' ' + (CY + 88) + 'Z" fill="url(#tt-brillo)"/>');
    s.push("</g>");
    return s.join("");
  }

  function dibujaTocadiscos() {
    var s = [];
    s.push('<svg class="tt__svg" viewBox="0 0 520 500" role="img" aria-label="Tocadiscos: cada elemento del arreglo es un disco y el brazo toca uno por vuelta del ciclo">');
    s.push('<defs>' +
      '<linearGradient id="tt-madera" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5a2e12" stop-opacity=".25"/><stop offset=".6" stop-color="#3b1d0b" stop-opacity=".45"/><stop offset="1" stop-color="#24110a" stop-opacity=".62"/></linearGradient>' +
      // Texturas de fotos reales: chapa de nogal, aluminio cepillado y hule del tapete
      '<pattern id="tt-nogal" width="520" height="520" patternUnits="userSpaceOnUse"><image href="' + TEXTURAS + 'madera.jpg" width="520" height="520" preserveAspectRatio="none"/></pattern>' +
      '<pattern id="tt-cepillado" x="384" y="10" width="300" height="300" patternUnits="userSpaceOnUse"><image href="' + TEXTURAS + 'aluminio.jpg" width="300" height="300" preserveAspectRatio="none"/></pattern>' +
      '<pattern id="tt-hule" width="160" height="160" patternUnits="userSpaceOnUse"><image href="' + TEXTURAS + 'hule.jpg" width="160" height="160" preserveAspectRatio="none"/></pattern>' +
      '<linearGradient id="tt-luz" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></linearGradient>' +
      '<linearGradient id="tt-alu" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f6f8"/><stop offset=".5" stop-color="#cfd5dd"/><stop offset="1" stop-color="#a9b1bc"/></linearGradient>' +
      '<linearGradient id="tt-borde" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e6e9ee"/><stop offset=".5" stop-color="#aab2be"/><stop offset="1" stop-color="#d4d9e0"/></linearGradient>' +
      '<radialGradient id="tt-sombra"><stop offset=".3" stop-color="#000" stop-opacity=".1"/><stop offset=".8" stop-color="#000" stop-opacity=".25"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></radialGradient>' +
      '<linearGradient id="tt-brillo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".16"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
      '<linearGradient id="tt-tubo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8e99aa"/><stop offset=".4" stop-color="#f7f9fb"/><stop offset="1" stop-color="#7d8796"/></linearGradient>' +
      '<linearGradient id="tt-contrapeso" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5b6577"/><stop offset=".45" stop-color="#c9d0da"/><stop offset="1" stop-color="#3a4352"/></linearGradient>' +
      '<clipPath id="tt-etq"><circle cx="' + CX + '" cy="' + CY + '" r="58"/></clipPath>' +
      '<clipPath id="tt-mueble"><rect x="6" y="6" width="508" height="428" rx="22"/></clipPath>' +
      // El círculo sobre el que se escribe el nombre del género (empieza arriba, en el sentido del reloj)
      '<path id="tt-anillo" d="M' + CX + ' ' + (CY - 128) + 'a128 128 0 1 1 0 256a128 128 0 1 1 0 -256"/>' +
      '</defs>');

    // Mueble de madera, placa de aluminio, descanso del brazo y foco de la condición
    // el nogal de la foto, entintado más oscuro y con sombra hacia la esquina de abajo
    // El mueble llega más abajo que el plato: ahí va el frente con la pantallita,
    // las teclas y la torreta (son HTML, encima del dibujo; ver .tt__panel)
    s.push('<rect x="6" y="6" width="508" height="488" rx="22" fill="url(#tt-nogal)"/>');
    s.push('<rect x="6" y="6" width="508" height="488" rx="22" fill="url(#tt-madera)"/>');
    s.push('<rect x="12" y="12" width="496" height="476" rx="18" fill="none" stroke="#ffdcb4" stroke-opacity=".2" stroke-width="2"/>');
    s.push('<rect x="384" y="22" width="114" height="272" rx="12" fill="url(#tt-cepillado)" stroke="#8f98a5" stroke-width="1"/>');
    s.push('<rect x="384" y="22" width="114" height="272" rx="12" fill="url(#tt-luz)"/>');
    s.push('<path d="M392 32H490" stroke="#fff" stroke-opacity=".7"/>');
    s.push('<rect x="430" y="306" width="20" height="16" rx="4" fill="#2b3346"/><path d="M432 306v-6h4v6M444 306v-6h4v6" fill="#2b3346"/>');
    s.push('<circle cx="472" cy="232" r="10" fill="#2b3346"/><circle class="tt__led" data-led cx="472" cy="232" r="6.5"/>');
    s.push('<text x="472" y="256" text-anchor="middle" font-family="Consolas, monospace" font-size="8.6" font-weight="700" fill="#3a4352">condición</text>');

    // Plato: borde con puntos estroboscópicos (giran) y el tapete de hule
    s.push('<g class="tt__plato"><g class="tt__giro">');
    s.push('<circle cx="' + CX + '" cy="' + CY + '" r="206" fill="url(#tt-borde)" stroke="#6c7480" stroke-width="1.5"/>');
    s.push('<circle cx="' + CX + '" cy="' + CY + '" r="199" fill="none" stroke="#5f6773" stroke-width="5" stroke-dasharray="3.5 6.97"/>');
    s.push("</g></g>");
    s.push('<circle cx="' + CX + '" cy="' + CY + '" r="193" fill="url(#tt-hule)"/>');
    for (var r = 180; r > 40; r -= 14) {
      s.push('<circle cx="' + CX + '" cy="' + CY + '" r="' + r + '" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="2.5"/>');
    }

    // Los discos, recortados al mueble para que entren por abajo y salgan por la izquierda
    s.push('<g clip-path="url(#tt-mueble)">');
    items.forEach(function (it, k) { s.push(dibujaDisco(it, k)); });
    s.push("</g>");
    s.push('<circle cx="' + CX + '" cy="' + CY + '" r="5" fill="url(#tt-alu)" stroke="#6c7480"/>');

    // Notas musicales: salen junto a la aguja mientras suena un disco
    var nota = function (c, x, y) {
      return '<g transform="translate(' + x + ' ' + y + ')"><g class="tt__nota" fill="' + c + '"><ellipse cx="0" cy="0" rx="5" ry="3.6" transform="rotate(-22)"/>' +
        '<rect x="3.6" y="-18" width="1.8" height="18"/><path d="M5.4 -18q8 3 6.5 11q-1.5 -5 -6.5 -6z"/></g></g>';
    };
    s.push('<g data-notas>' + nota("#fac775", -4, -6) + nota("#ffffff", 10, -2) + nota("#ffd98a", 2, 4) + '</g>');

    // Base del brazo (fija) y brazo, dibujado hacia la derecha desde la base.
    // La cabeza va girada hacia el centro del disco, como en un tocadiscos de
    // verdad, con la palanquita para levantarla del lado de afuera; la aguja
    // (el punto dorado) queda debajo de la cápsula.
    s.push('<circle cx="440" cy="74" r="31" fill="url(#tt-cepillado)" stroke="#8f98a5" stroke-width="1.5"/><circle cx="440" cy="74" r="19" fill="#2b3346"/>');
    s.push('<g class="tt__brazo" data-brazo>' +
      '<rect x="382" y="61" width="32" height="26" rx="6" fill="url(#tt-contrapeso)" stroke="#2b3346" stroke-width="1"/>' +
      '<path d="M388 61v26M394 61v26M400 61v26" stroke="#2b3346" stroke-opacity=".35"/>' +
      '<rect x="412" y="71" width="256" height="6" rx="3" fill="url(#tt-tubo)" stroke="#6c7480" stroke-width=".6"/>' +
      '<circle cx="440" cy="74" r="11" fill="#d7dce3" stroke="#6c7480" stroke-width="1.2"/><circle cx="440" cy="74" r="3" fill="#2b3346"/>' +
      '<g class="tt__cabeza"><g transform="rotate(' + CABEZA + ' 666 74)">' +
      '<path d="M684 66v-8" stroke="#c9d0da" stroke-width="3" stroke-linecap="round"/>' +
      '<rect x="662" y="66" width="38" height="18" rx="3" fill="#1c2434"/>' +
      '<rect x="676" y="69" width="20" height="13" rx="2" fill="#093b8b"/>' +
      '<circle cx="690" cy="79" r="2.4" fill="#fac775"/></g></g>' +
      '</g>');
    s.push('</svg>');
    return s.join("");
  }

  root.querySelector("[data-tt-disco]").innerHTML = dibujaTocadiscos();

  var brazo = root.querySelector("[data-brazo]");
  var notas = root.querySelector("[data-notas]");
  var led = root.querySelector("[data-led]");
  var discos = root.querySelectorAll("[data-disco]");

  // El brazo gira sobre su base P. La aguja está en (690, 79) dentro de la
  // cabeza, que va girada CABEZA grados alrededor de (666, 74); S es dónde
  // queda la aguja y DELTA el pequeño ángulo entre el tubo y la aguja. Para
  // dejar la aguja a la distancia r del centro del disco se usa la ley de
  // cosenos. En reposo el brazo apunta hacia abajo (90°).
  var P = { x: 440, y: 74 }, REPOSO = 90;
  var RAD = Math.PI / 180;
  var S = {
    x: 666 + 24 * Math.cos(CABEZA * RAD) - 5 * Math.sin(CABEZA * RAD),
    y: 74 + 24 * Math.sin(CABEZA * RAD) + 5 * Math.cos(CABEZA * RAD)
  };
  var L = Math.sqrt((S.x - P.x) * (S.x - P.x) + (S.y - P.y) * (S.y - P.y));
  var DELTA = Math.atan2(S.y - P.y, S.x - P.x) / RAD;
  var D = Math.sqrt((CX - P.x) * (CX - P.x) + (CY - P.y) * (CY - P.y));
  var PHI = Math.atan2(CY - P.y, CX - P.x);
  function angulo(r) { return (PHI - Math.acos((L * L + D * D - r * r) / (2 * L * D))) / RAD - DELTA; }
  var INICIO = 178, AVANCE = 146; // dónde baja la aguja y hasta dónde llega mientras suena el disco

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
  function valor(k, html, nombre, extra) {
    return '<button type="button" class="menu-vidrio__valor' + (extra || "") + '" data-k="' + k + '" aria-haspopup="menu" aria-label="' + nombre + '. Elegir otro valor">' + html + "</button>";
  }

  function pintaCodigo() {
    var cond = texto ? "elementos[i] != \"" + ALT + "\"" : "i &lt; elementos.length";
    var lista = items.map(function (it) { return '"' + it.nombre + '"'; });
    var linea = lista.slice(0, 3).join(", ") + ",\n                 " + lista.slice(3).join(", ");
    var masMenos = inc
      ? '<span data-part="inc">' + valor("inc", "i++;", "Actualizar el contador: i++") + "</span>"
      : valor("inc", "// i++;", "Actualizar el contador: quitado", " js-term__com");
    codeEl.querySelector(".js-term__code").innerHTML =
      "var elementos = [" + linea + "];\n" +
      '<span data-part="init">var i = 0;</span>\n\n' +
      'while (<span data-part="cond">' + valor("cond", cond, "Condición: " + cond.replace("&lt;", "<").replace(/"/g, "&quot;")) + "</span>) {\n" +
      '  <span data-part="body">console.log(i + ": " + elementos[i]);</span>\n' +
      "  " + masMenos + "\n}";
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

  /* ---------- La explicación ----------
     Estándar .grafico-exp (como el tren del 4-6): el nombre de la parte y el
     código que se menciona van en <code> (azul, en negritas); lo demás en
     texto normal. */
  function nom(t) { return '<span class="concepto">' + t + "</span>"; }
  function cod(t) { return "<code>" + t + "</code>"; }

  function explica(f) {
    var st = f.st, i = st.i;
    var cond = texto ? cod("elementos[" + i + '] != "' + ALT + '"') : cod(i + " &lt; " + N);
    if (loco) return nom("Ciclo infinito") + ": la aguja nunca se levanta y el disco se queda rayado, repitiendo el disco 0. La torreta de emergencia se encendió: presiona reiniciar para detenerlo.";
    switch (st.parte) {
      case "init":
        return nom("Antes del ciclo") + ": el " + cod("while") + " no tiene lugar para la expresión inicial, así que el contador " + cod("i = 0") + " se crea afuera, en la línea de arriba, y el disco 0 sube al tocadiscos.";
      case "cond":
        if (!st.ok) {
          return nom("Expresión condicional") + ": ¿" + cond + "? " +
            (texto ? "El disco " + i + ' es "' + ALT + '"' : "Ya no queda ningún disco por tocar") +
            ', así que es <span class="no">false</span>, la aguja no baja y el ciclo termina.';
        }
        if (!inc && f.vueltas >= 1) {
          return nom("Expresión condicional") + ": ¿" + cond + '? Otra vez <span class="si">true</span>: como quitamos ' + cod("i++") + ", i sigue valiendo 0 y la condición nunca cambia.";
        }
        return nom("Expresión condicional") + ": ¿" + cond + "? " +
          (texto ? 'El disco es "' + items[i].nombre + '"' : "Hay un disco " + i + " en el tocadiscos") +
          ', así que es <span class="si">true</span>, la aguja baja y entramos al ciclo.';
      case "body":
        if (!inc && st.vuelta >= 2) {
          return nom("Cuerpo del ciclo") + ", vuelta " + st.vuelta + ": la aguja vuelve a tocar el disco 0, como un disco rayado, y la consola vuelve a mostrar " + cod("0: " + items[0].nombre) + ".";
        }
        return nom("Cuerpo del ciclo") + ", vuelta " + st.vuelta + ": suena el disco " + i + " y la consola muestra " + cod(i + ": " + items[i].nombre) + ".";
      case "inc":
        return nom("Actualizar el contador") + ": " + cod("i++") + " es la última línea del cuerpo. Sube i a " + i + " y " +
          (i < N ? "cambia el disco: la aguja se levanta, el disco " + (i - 1) + " sale y llega el disco " + i : "la aguja se levanta y el disco " + (i - 1) + " sale, pero ya no llega otro") + ". Después el " + cod("while") + " vuelve a revisar la condición.";
      default:
        return nom("Fin del ciclo") + ": " + (texto ? 'la aguja no tocó el disco "' + ALT + '".' : "sonaron los " + N + " discos y el brazo se queda en su lugar.") +
          " El programa sigue con la línea que está después de la llave " + cod("}") + ".";
    }
  }

  function textoAlto(f) {
    return nom("Ciclo infinito") + ": el tocadiscos se apagó solo después de " + f.vueltas + " vueltas. En un programa de verdad nadie lo apaga: la página se queda trabada. Presiona reiniciar y cambia " + cod("// i++;") + " en el código para volver a ponerlo.";
  }
  function textoReinicio(v) {
    return nom("Ciclo infinito") + ": detuviste el tocadiscos después de " + v + " vueltas. En un programa de verdad no hay cómo detenerlo: la página se queda trabada. Cambia " + cod("// i++;") + " en el código para volver a ponerlo.";
  }

  // La explicación cambia con desvanecido (en el ciclo infinito va demasiado rápido para eso)
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function explicar(html) {
    if (html === status._html) return;
    status._html = html;
    clearTimeout(status._t);
    if (reduce || loco || !html) {
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

    // Los discos: los que ya sonaron se fueron por la izquierda, el disco i
    // está en el plato y los que faltan esperan abajo. Al avanzar con i++,
    // primero se levanta la aguja, luego sale el disco que sonó y después
    // sube el siguiente.
    // Un disco que pasa de la izquierda a abajo (o al revés), como al
    // reiniciar, va de un lado escondido a otro: cambia de lugar sin
    // animación para no cruzar por encima del plato.
    var cambio = dir > 0 && !!st && st.parte === "inc";
    each(discos, function (d, n) {
      var lugar = !hay || n > f.i ? "abajo" : n < f.i ? "izq" : "plato";
      var pos = lugar === "abajo" ? "translate(0px, 470px)" : lugar === "izq" ? "translate(-430px, 0px)" : "translate(0px, 0px)";
      var salta = d._lugar && d._lugar !== lugar && d._lugar !== "plato" && lugar !== "plato";
      d._lugar = lugar;
      d.style.transitionDelay = !cambio ? "0s" : n === f.i ? ".8s" : ".45s";
      if (salta) {
        d.style.transition = "none";
        d.style.transform = pos;
        void d.getBoundingClientRect();
        d.style.transition = "";
      } else {
        d.style.transform = pos;
      }
    });

    // La aguja baja cuando la condición es true y avanza un poco mientras suena el disco
    var suena = !!st && st.parte === "body";
    var baja = suena || (!!st && st.parte === "cond" && st.ok);
    var th = baja ? angulo(suena ? AVANCE : INICIO) : REPOSO;
    brazo.style.transitionDuration = suena && !loco ? "2.2s" : "";
    brazo.style.transform = "rotate(" + th + "deg)";
    var rad = (th + DELTA) * RAD;
    notas.setAttribute("transform", "translate(" + (P.x + L * Math.cos(rad)).toFixed(1) + " " + (P.y + L * Math.sin(rad)).toFixed(1) + ")");
    root.classList.toggle("is-playing", baja);
    root.classList.toggle("is-singing", suena);
    led.classList.remove("is-true", "is-false");
    if (st && (st.parte === "cond" || fin)) led.classList.add(f.ok ? "is-true" : "is-false");

    counter.textContent = "i = " + (hay ? f.i : "–");

    // Sin i++, a la tercera vuelta el tocadiscos sigue solo: ciclo infinito
    if (!inc && dir > 0 && st && st.parte === "body" && f.vueltas >= 3 && !loco && !detenido) arranca();

    explicar(detenido ? textoAlto(f) : st ? explica(f) : nota);

    b.back.disabled = k < 0 || detenido;
    b.step.disabled = detenido || loco || fin;
  }

  function para() {
    clearTimeout(timer);
    timer = null;
    loco = false;
    root.classList.remove("is-loco", "is-halted");
  }

  // El ciclo infinito avanza solo, cada vez más rápido, hasta que se presiona reiniciar
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
  function cambia(que, valor) {
    if (que === "inc") {
      if (inc === valor) return;
      inc = valor;
    } else {
      if (texto === valor) return;
      texto = valor;
    }
    root.classList.toggle("is-sin-inc", !inc);
    root.classList.toggle("is-texto", texto);
    pintaCodigo();
    if (que === "inc") {
      nota = inc
        ? "Volviste a poner " + cod("i++") + " al final del cuerpo: el ciclo ya puede terminar."
        : "Quitaste " + cod("i++") + " del cuerpo del ciclo (quedó como comentario). Avanza paso a paso para ver qué pasa.";
    } else {
      nota = texto
        ? "Ahora la condición compara texto: el ciclo sigue mientras el disco no sea \"" + ALT + "\", sin contar cuántos hay."
        : "La condición volvió a ser " + cod("i &lt; elementos.length") + ".";
    }
    reiniciar();
    var t = codeEl.querySelector('[data-k="' + que + '"]');
    if (t) t.focus({ preventScroll: true });
  }

  /* ---------- El menú de vidrio para cambiar los valores (estándar del 3-23) ---------- */

  var OPCIONES = {
    cond: function () {
      return [
        { html: "<code>i &lt; elementos.length</code>", valor: false, actual: !texto },
        { html: "<code>elementos[i] != \"" + ALT + "\"</code>", valor: true, actual: texto }
      ];
    },
    inc: function () {
      return [
        { html: "<code>i++;</code>", valor: true, actual: inc },
        { html: "<code>// i++;</code>", valor: false, actual: !inc }
      ];
    }
  };

  // El menú es el compartido del curso (assets/js/menu-vidrio.js)
  function abrirMenu(origen) {
    var que = origen.getAttribute("data-k");
    var opciones = OPCIONES[que]();
    MenuVidrio.abrir(origen, {
      dentro: root,
      opciones: opciones,
      alElegir: function (i) { cambia(que, opciones[i].valor); }
    });
  }

  window.addEventListener("resize", function () { MenuVidrio.cerrar(); });

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
  // En el ciclo infinito, reiniciar es la única salida (la torreta lo avisa)
  b.reset.addEventListener("click", function () {
    nota = loco || detenido ? textoReinicio(f.vueltas) : "";
    reiniciar();
  });

  codeEl.addEventListener("click", function (e) {
    var t = e.target.closest("[data-k]");
    if (!t) return;
    abrirMenu(t);
  });

  pintaCodigo();
  reiniciar();
})();
