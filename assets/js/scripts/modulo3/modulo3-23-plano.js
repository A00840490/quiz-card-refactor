/* Tema 22 (modulo3-23): plano de un departamento hecho con CSS grid.
   El código del panel se aplica tal cual al plano. Los valores con flecha
   abren una lista con otras opciones; las celdas del plano abren una lista
   de cuartos y cambian la palabra que les toca en grid-template-areas.
   Cada cambio trae una explicación abajo (con desvanecido), y las cotas
   marcan las líneas donde empieza y termina el último cuarto que se tocó.
   Los valores y las listas son el menú de vidrio compartido
   (assets/js/menu-vidrio.js y assets/css/menu-vidrio.css). */
(function () {
  "use strict";

  var root = document.querySelector("[data-plano]");
  if (!root) return;

  var fitEl = root.querySelector("[data-fit]");
  var inner = fitEl.firstElementChild;
  var hoja = root.querySelector(".plano__hoja");
  var grid = root.querySelector("[data-grid]");
  var celdas = root.querySelector("[data-celdas]");
  var cotas = root.querySelector("[data-cotas]");
  var pre = root.querySelector("[data-code]");
  var exp = root.querySelector("[data-exp]");
  var cuartos = Array.prototype.slice.call(grid.querySelectorAll("[data-item]"));
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var OPCIONES = {
    cols: ["2fr 1fr 1fr", "repeat(3, 1fr)", "200px 1fr 1fr", "minmax(150px, 1fr) 2fr 1fr"],
    rows: ["repeat(3, 1fr)", "1fr 1fr 120px", "auto minmax(200px, 1fr) auto"],
    gap: ["8px", "4px", "16px"]
  };
  var PROPIEDAD = { cols: "grid-template-columns", rows: "grid-template-rows", gap: "grid-gap" };

  var CUARTOS = [
    { id: "sala", nombre: "Sala", con: "la sala", de: "de la sala" },
    { id: "comedor", nombre: "Comedor", con: "el comedor", de: "del comedor" },
    { id: "cocina", nombre: "Cocina", con: "la cocina", de: "de la cocina" },
    { id: "recamara", nombre: "Recámara", con: "la recámara", de: "de la recámara" },
    { id: "bano", nombre: "Baño", con: "el baño", de: "del baño" }
  ];
  var porId = {};
  CUARTOS.forEach(function (c) { porId[c.id] = c; });

  var estado = {
    cols: 0,
    rows: 0,
    gap: 0,
    sel: null,
    mapa: [
      ["sala", "sala", "recamara"],
      ["sala", "sala", "bano"],
      ["cocina", "comedor", "comedor"]
    ]
  };

  /* ---------- Textos de cada valor ---------- */
  var TEXTO = {
    "2fr 1fr 1fr": "La primera columna recibe <span class=\"concepto\">2fr</span>, el doble del espacio libre que las otras dos, que tienen <span class=\"concepto\">1fr</span>. La unidad <span class=\"concepto\">fr</span> es exclusiva de grid: reparte el espacio libre en partes.",
    "repeat(3, 1fr)": "La función <span class=\"concepto\">repeat</span> repite los valores: el primer número indica cuántas veces y el segundo el tamaño, así que aquí hay tres de <span class=\"concepto\">1fr</span>, todas del mismo tamaño.",
    "200px 1fr 1fr": "La primera mide <span class=\"concepto\">200px</span> fijos y las otras dos se reparten lo que sobra: <span class=\"concepto\">1fr</span> cada una.",
    "minmax(150px, 1fr) 2fr 1fr": "La función <span class=\"concepto\">minmax</span> da un rango mínimo y máximo: la primera columna nunca mide menos de 150px ni más de 1fr. La de en medio recibe <span class=\"concepto\">2fr</span>.",
    "repeat(3, 1fr)#rows": "La función <span class=\"concepto\">repeat</span> repite los valores: el primer número indica cuántas veces y el segundo el tamaño, así que aquí hay tres renglones de <span class=\"concepto\">1fr</span>, todos del mismo alto.",
    "1fr 1fr 120px": "Los primeros dos renglones se reparten el espacio libre con <span class=\"concepto\">1fr</span> cada uno y el último mide <span class=\"concepto\">120px</span> fijos.",
    "auto minmax(200px, 1fr) auto": "<span class=\"concepto\">auto</span> hace que el renglón mida lo que su contenido necesita, y <span class=\"concepto\">minmax(200px, 1fr)</span> hace que el de en medio nunca mida menos de 200px ni más de 1fr."
  };

  /* ---------- Utilidades ---------- */
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  }

  // "repeat(3, 1fr)" -> ["1fr", "1fr", "1fr"]; "minmax(150px, 1fr) 2fr 1fr" -> ["minmax(150px, 1fr)", "2fr", "1fr"]
  function pistas(valor) {
    var m = valor.match(/^repeat\((\d+),\s*(.+)\)$/);
    if (m) {
      var out = [];
      for (var i = 0; i < +m[1]; i++) out.push(m[2]);
      return out;
    }
    var lista = [], actual = "", nivel = 0;
    for (var j = 0; j < valor.length; j++) {
      var ch = valor[j];
      if (ch === "(") nivel++;
      if (ch === ")") nivel--;
      if (ch === " " && !nivel) {
        if (actual) lista.push(actual);
        actual = "";
      } else {
        actual += ch;
      }
    }
    if (actual) lista.push(actual);
    return lista;
  }

  // Nombre del primer cuarto que no forma un rectángulo (o null si el mapa es válido)
  function cuartoRoto(mapa) {
    return cuartosRotos(mapa)[0] || null;
  }

  // Todos los cuartos que no forman un rectángulo
  function cuartosRotos(mapa) {
    var rotos = [];
    CUARTOS.forEach(function (q) {
      var caja = cajaDe(mapa, q.id);
      if (!caja) return;
      var cuenta = 0;
      mapa.forEach(function (fila) { fila.forEach(function (x) { if (x === q.id) cuenta++; }); });
      if (cuenta !== (caja.re - caja.rs) * (caja.ce - caja.cs)) rotos.push(q.id);
    });
    return rotos;
  }

  // Líneas donde empieza y termina un área (numeradas desde 1)
  function cajaDe(mapa, id) {
    var r0 = 99, r1 = -1, c0 = 99, c1 = -1;
    mapa.forEach(function (fila, r) {
      fila.forEach(function (x, c) {
        if (x !== id) return;
        r0 = Math.min(r0, r); r1 = Math.max(r1, r);
        c0 = Math.min(c0, c); c1 = Math.max(c1, c);
      });
    });
    return r1 < 0 ? null : { rs: r0 + 1, re: r1 + 2, cs: c0 + 1, ce: c1 + 2 };
  }

  function escala() {
    return fitEl._escala || 1;
  }

  /* ---------- El plano se escala para caber; en pantallas angostas es más cuadrado ---------- */
  function ajustar() {
    var compacta = fitEl.clientWidth < 560;
    hoja.classList.toggle("is-compacta", compacta);
    var w = compacta ? 440 : 620, h = compacta ? 440 : 470;
    var s = Math.min(1, fitEl.clientWidth / w);
    inner.style.transform = "scale(" + s + ")";
    fitEl.style.height = h * s + "px";
    fitEl._escala = s;
    dibujarCotas();
    MenuVidrio.cerrar();
  }

  /* ---------- Aplicar el código al plano ---------- */
  function aplicar() {
    var cols = OPCIONES.cols[estado.cols], rows = OPCIONES.rows[estado.rows], gap = OPCIONES.gap[estado.gap];
    grid.style.gridTemplateColumns = cols;
    grid.style.gridTemplateRows = rows;
    grid.style.gap = celdas.style.gap = gap;
    hoja.style.setProperty("--muro", gap);

    var rotos = cuartosRotos(estado.mapa), roto = rotos.length > 0;
    var usados = {};
    estado.mapa.forEach(function (fila) { fila.forEach(function (x) { usados[x] = true; }); });
    // Si un área no es rectángulo, el mapa no es válido. En vez de dejar que el plano
    // se desarme, se dibuja el intento: cada cuarto se coloca por sus líneas y el que
    // no es rectángulo se arma con pedazos, cubiertos de franjas rojas.
    grid.style.gridTemplateAreas = roto ? "none" : estado.mapa.map(function (f) { return "\"" + f.join(" ") + "\""; }).join(" ");
    cuartos.forEach(function (el) {
      var id = el.getAttribute("data-item"), caja = cajaDe(estado.mapa, id);
      var esRoto = rotos.indexOf(id) >= 0;
      el.style.gridArea = !roto ? id : caja && !esRoto ? caja.rs + " / " + caja.cs + " / " + caja.re + " / " + caja.ce : "auto";
      el.classList.toggle("is-fuera", !usados[id] || esRoto);
      el.classList.toggle("is-sel", id === estado.sel && !roto);
    });
    pintarPedazos(rotos);

    Array.prototype.forEach.call(celdas.children, function (b) {
      var x = estado.mapa[+b.getAttribute("data-r")][+b.getAttribute("data-c")];
      b.classList.toggle("is-vacia", x === ".");
      b.innerHTML = x === "." ? "<span aria-hidden=\"true\">.</span>" : "";
      b.setAttribute("aria-label", "Renglón " + (+b.getAttribute("data-r") + 1) + ", columna " + (+b.getAttribute("data-c") + 1) + ": " + (x === "." ? "vacía" : porId[x].nombre) + ". Elegir otro cuarto");
    });
    medidas();
    dibujarCotas();
  }

  // Pedazos del cuarto que no es rectángulo: uno por celda, con su piso de siempre.
  // Cada pedazo se estira sobre el muro que lo separa de otro pedazo del mismo cuarto,
  // así se ve la forma completa. Encima va la zona de error (ver pintarError).
  var pedazos = [];
  function pintarPedazos(rotos) {
    pedazos.forEach(function (el) { el.parentNode.removeChild(el); });
    pedazos = [];
    rotos.forEach(function (id) {
      var fondo = getComputedStyle(grid.querySelector("[data-item=\"" + id + "\"]"));
      estado.mapa.forEach(function (fila, r) {
        fila.forEach(function (x, c) {
          if (x !== id) return;
          var el = document.createElement("div");
          el.className = "plano__pedazo";
          el.setAttribute("aria-hidden", "true");
          el.style.gridArea = (r + 1) + " / " + (c + 1);
          el.style.backgroundImage = fondo.backgroundImage;
          el.style.backgroundSize = fondo.backgroundSize;
          var der = fila[c + 1] === id, abajo = estado.mapa[r + 1] && estado.mapa[r + 1][c] === id;
          if (der) el.style.marginRight = "calc(-1 * var(--muro, 8px))";
          if (abajo) el.style.marginBottom = "calc(-1 * var(--muro, 8px))";
          // La esquina del muro solo se cubre si la celda en diagonal también es del cuarto
          if (der && abajo && estado.mapa[r + 1][c + 1] !== id) {
            el.style.clipPath = "polygon(0 0, 100% 0, 100% calc(100% - var(--muro, 8px)), calc(100% - var(--muro, 8px)) calc(100% - var(--muro, 8px)), calc(100% - var(--muro, 8px)) 100%, 0 100%)";
          }
          grid.insertBefore(el, celdas);
          pedazos.push(el);
        });
      });
    });
    // La madera sigue de un pedazo al otro, como si fuera una sola pieza
    pedazos.forEach(function (el) {
      el.style.backgroundPosition = -el.offsetLeft + "px " + -el.offsetTop + "px";
    });
  }

  /* ---------- Zona de error: encima del plano, la forma que no es rectángulo ----------
     Se dibuja el contorno del cuarto con esquinas redondeadas, relleno de franjas rojas
     y blancas que laten, y su nombre encima. */
  var NS = "http://www.w3.org/2000/svg";
  var capaError = document.createElement("div");
  capaError.className = "plano__error";
  capaError.setAttribute("aria-hidden", "true");
  grid.appendChild(capaError);

  function pintarError(rotos) {
    capaError.innerHTML = "";
    if (!rotos.length) return;
    var b = celdas.children, ox = celdas.offsetLeft, oy = celdas.offsetTop;
    // Bordes de cada columna y renglón: X[0..5] y Y[0..5] (inicio y fin de cada pista)
    var X = [], Y = [];
    for (var i = 0; i < 3; i++) {
      X.push(ox + b[i].offsetLeft, ox + b[i].offsetLeft + b[i].offsetWidth);
      Y.push(oy + b[i * 3].offsetTop, oy + b[i * 3].offsetTop + b[i * 3].offsetHeight);
    }
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("width", grid.clientWidth);
    svg.setAttribute("height", grid.clientHeight);
    svg.innerHTML =
      "<defs><pattern id=\"plano-franjas\" width=\"22\" height=\"22\" patternUnits=\"userSpaceOnUse\" patternTransform=\"rotate(45)\">" +
      "<rect width=\"11\" height=\"22\" fill=\"#d62626\"></rect><rect x=\"11\" width=\"11\" height=\"22\" fill=\"#ffffff\" fill-opacity=\"0.45\"></rect></pattern></defs>";
    rotos.forEach(function (id) {
      var d = contorno(id, X, Y);
      var relleno = document.createElementNS(NS, "path");
      relleno.setAttribute("d", d);
      relleno.setAttribute("class", "plano__error-franjas");
      var borde = document.createElementNS(NS, "path");
      borde.setAttribute("d", d);
      borde.setAttribute("class", "plano__error-borde");
      svg.appendChild(relleno);
      svg.appendChild(borde);
      // El nombre del cuarto, en la primera celda que ocupa
      var primera = null;
      estado.mapa.forEach(function (fila, r) { fila.forEach(function (x, c) { if (x === id && !primera) primera = [r, c]; }); });
      var rotulo = document.createElement("div");
      rotulo.className = "plano__rotulo plano__error-rotulo";
      rotulo.innerHTML = "<strong>" + porId[id].nombre + "</strong>";
      rotulo.style.left = (X[primera[1] * 2] + X[primera[1] * 2 + 1]) / 2 + "px";
      rotulo.style.top = (Y[primera[0] * 2] + Y[primera[0] * 2 + 1]) / 2 + "px";
      capaError.appendChild(rotulo);
    });
    // Las franjas van encima del nombre del cuarto
    capaError.appendChild(svg);
  }

  // Contorno de las celdas de un cuarto como una sola figura con esquinas redondeadas.
  // Se trabaja sobre una cuadrícula fina de 5 × 5: las celdas (índices pares) y los
  // muros entre ellas (impares); un muro cuenta si sus dos lados son del cuarto.
  function contorno(id, X, Y) {
    function lleno(i, j) {
      if (i < 0 || j < 0 || i > 4 || j > 4) return false;
      var rs = i % 2 ? [(i - 1) / 2, (i + 1) / 2] : [i / 2];
      var cs = j % 2 ? [(j - 1) / 2, (j + 1) / 2] : [j / 2];
      return rs.every(function (r) { return cs.every(function (c) { return estado.mapa[r][c] === id; }); });
    }
    // Aristas del borde, en el sentido de las manecillas del reloj; los vértices son "fila,columna"
    var sig = {};
    for (var i = 0; i < 5; i++) {
      for (var j = 0; j < 5; j++) {
        if (!lleno(i, j)) continue;
        if (!lleno(i - 1, j)) sig[i + "," + j] = [i, j + 1];
        if (!lleno(i, j + 1)) sig[i + "," + (j + 1)] = [i + 1, j + 1];
        if (!lleno(i + 1, j)) sig[(i + 1) + "," + (j + 1)] = [i + 1, j];
        if (!lleno(i, j - 1)) sig[(i + 1) + "," + j] = [i, j];
      }
    }
    var d = "", R = 16;
    while (Object.keys(sig).length) {
      // Recorre un contorno y quita los puntos que quedan en línea recta
      var inicio = Object.keys(sig)[0], k = inicio, pts = [];
      do {
        var p = k.split(",").map(Number), n = sig[k];
        delete sig[k];
        pts.push([X[p[1]], Y[p[0]]]);
        k = n[0] + "," + n[1];
      } while (k !== inicio && sig[k]);
      pts = pts.filter(function (pt, idx) {
        var a = pts[(idx - 1 + pts.length) % pts.length], c = pts[(idx + 1) % pts.length];
        return !((a[0] === pt[0] && pt[0] === c[0]) || (a[1] === pt[1] && pt[1] === c[1]));
      });
      pts.forEach(function (pt, idx) {
        var a = pts[(idx - 1 + pts.length) % pts.length], c = pts[(idx + 1) % pts.length];
        var la = Math.hypot(a[0] - pt[0], a[1] - pt[1]), lc = Math.hypot(c[0] - pt[0], c[1] - pt[1]);
        var r = Math.min(R, la / 2, lc / 2);
        var p1 = [pt[0] + (a[0] - pt[0]) / la * r, pt[1] + (a[1] - pt[1]) / la * r];
        var p2 = [pt[0] + (c[0] - pt[0]) / lc * r, pt[1] + (c[1] - pt[1]) / lc * r];
        d += (idx ? "L" : "M") + p1[0] + " " + p1[1] + "Q" + pt[0] + " " + pt[1] + " " + p2[0] + " " + p2[1];
      });
      d += "Z";
    }
    return d;
  }


  // Lo que mide cada cuarto, en las unidades del código: las pistas que ocupa
  function medidas() {
    var cols = pistas(OPCIONES.cols[estado.cols]), rows = pistas(OPCIONES.rows[estado.rows]);
    var rotos = cuartosRotos(estado.mapa);
    cuartos.forEach(function (el) {
      var id = el.getAttribute("data-item");
      var caja = rotos.indexOf(id) < 0 && cajaDe(estado.mapa, id);
      var medida = el.querySelector("[data-medida]");
      if (!caja) { medida.hidden = true; return; }
      medida.hidden = false;
      medida.innerHTML =
        "<span><i>ancho:</i> " + esc(cols.slice(caja.cs - 1, caja.ce - 1).join(" + ")) + "</span>" +
        "<span><i>alto:</i> " + esc(rows.slice(caja.rs - 1, caja.re - 1).join(" + ")) + "</span>";
    });
  }

  /* ---------- Cotas con el tamaño de cada pista y el número de cada línea ---------- */
  function dibujarCotas() {
    var cs = getComputedStyle(grid);
    // Las celdas para hacer clic copian las pistas ya calculadas en px (con "auto" quedarían vacías)
    celdas.style.gridTemplateColumns = cs.gridTemplateColumns;
    celdas.style.gridTemplateRows = cs.gridTemplateRows;
    var anchos = cs.gridTemplateColumns.split(" ").map(parseFloat);
    var altos = cs.gridTemplateRows.split(" ").map(parseFloat);
    var gap = parseFloat(cs.columnGap) || 0, muro = parseFloat(cs.paddingLeft) || 0;
    var ox = grid.offsetLeft, oy = grid.offsetTop;
    var xs = lineas(anchos, gap, muro, grid.clientWidth);
    var ys = lineas(altos, gap, muro, grid.clientHeight);
    var nombresX = pistas(OPCIONES.cols[estado.cols]), nombresY = pistas(OPCIONES.rows[estado.rows]);
    var caja = estado.sel && !cuartoRoto(estado.mapa) ? cajaDe(estado.mapa, estado.sel) : null;
    var html = "";
    anchos.forEach(function (_, i) {
      var w = xs[i + 1] - xs[i];
      html += "<div class=\"plano__cota plano__cota--x\" style=\"left:" + (ox + xs[i]) + "px;width:" + w + "px\"><em" + letra(nombresX[i], w) + ">" + esc(nombresX[i] || "") + "</em></div>";
    });
    altos.forEach(function (_, i) {
      var h = ys[i + 1] - ys[i];
      html += "<div class=\"plano__cota plano__cota--y\" style=\"top:" + (oy + ys[i]) + "px;height:" + h + "px\"><em" + letra(nombresY[i], h) + ">" + esc(nombresY[i] || "") + "</em></div>";
    });
    xs.forEach(function (x, i) {
      var hot = caja && (i + 1 === caja.cs || i + 1 === caja.ce);
      html += "<span class=\"plano__num" + (hot ? " is-hot" : "") + "\" style=\"left:" + (ox + x) + "px;top:25px\">" + (i + 1) + "</span>";
    });
    ys.forEach(function (y, i) {
      var hot = caja && (i + 1 === caja.rs || i + 1 === caja.re);
      html += "<span class=\"plano__num" + (hot ? " is-hot" : "") + "\" style=\"left:38px;top:" + (oy + y) + "px\">" + (i + 1) + "</span>";
    });
    cotas.innerHTML = html;
    // La zona de error se mide con las celdas, que se acaban de acomodar
    pintarError(cuartosRotos(estado.mapa));
  }

  // Si el valor no cabe entre los dos números de línea, la letra se achica
  function letra(texto, largo) {
    var cabe = (largo - 40) / ((texto || "").length * 0.62);
    return cabe < 12.5 ? " style=\"font-size:" + Math.max(7, cabe).toFixed(1) + "px\"" : "";
  }

  // Posición de cada línea: los bordes de afuera quedan a media pared y las de adentro a la mitad del gap
  function lineas(tamanos, gap, muro, total) {
    var out = [muro / 2], p = muro;
    tamanos.forEach(function (t, i) {
      p += t;
      out.push(i === tamanos.length - 1 ? total - muro / 2 : p + gap / 2);
      p += gap;
    });
    return out;
  }

  /* ---------- Código ---------- */
  function valor(k) {
    return MenuVidrio.boton(OPCIONES[k][estado[k]], PROPIEDAD[k], " data-k=\"" + k + "\"");
  }

  // Mismo formato que los bloques de código del curso (lesson-demo.css): cada línea es
  // un .ld-line, que el CSS numera; el selector va en .codetag y los textos en .codetext.
  function pintarCodigo() {
    var rotos = cuartosRotos(estado.mapa);
    var anchos = [0, 1, 2].map(function (c) {
      return Math.max.apply(null, estado.mapa.map(function (f) { return f[c].length; }));
    });
    var filas = estado.mapa.map(function (fila, r) {
      return "    <span class=\"codetext\">\"" + fila.map(function (x, c) {
        var cls = "w" + (rotos.indexOf(x) >= 0 ? " is-mal" : "");
        var relleno = c < 2 ? " " + new Array(anchos[c] - x.length + 1).join(" ") : "";
        return "<span class=\"" + cls + "\" data-r=\"" + r + "\" data-c=\"" + c + "\">" + x + "</span>" + relleno;
      }).join("") + "\"</span>" + (r === estado.mapa.length - 1 ? ";" : "");
    });
    var sel = estado.sel || "sala";
    var lineas = [
      "<span class=\"codetag\">.departamento</span> {",
      "  display: <span class=\"codetext\">grid</span>;",
      "  grid-template-columns: " + valor("cols") + ";",
      "  grid-template-rows: " + valor("rows") + ";",
      "  grid-gap: " + valor("gap") + ";",
      "  grid-template-areas:"
    ].concat(filas, [
      "}",
      "",
      "<span class=\"codetag\">." + sel + "</span> {",
      "  grid-area: <span class=\"codetext\">" + sel + "</span>;",
      "}"
    ]);
    pre.innerHTML = lineas.map(function (l) {
      return "<span class=\"ld-line\">" + (l || "&nbsp;") + "</span>";
    }).join("");
  }


  // Ilumina en el código la palabra de una celda
  function marcarPalabra(r, c, on) {
    var w = pre.querySelector(".w[data-r=\"" + r + "\"][data-c=\"" + c + "\"]");
    if (w) w.classList.toggle("is-hot", on);
  }

  /* ---------- Explicación con el desvanecido estándar de la ficha (grafico-ficha.js) ---------- */
  function explicar(html) {
    GraficoFicha.cambiar(exp, html);
  }

  function textoCuarto(id, inicio) {
    var c = porId[id], caja = cajaDe(estado.mapa, id);
    return inicio + "<span class=\"concepto\">." + id + "</span> tiene <span class=\"concepto\">grid-area: " + id + "</span>, así que ocupa todas las celdas que dicen <b>" + id + "</b> en el mapa. En las cotas se ve que " + c.con + " va de la línea de columna " + caja.cs + " a la " + caja.ce + " y de la línea de renglón " + caja.rs + " a la " + caja.re + ": sería lo mismo escribir <span class=\"concepto\">grid-column-start: " + caja.cs + "; grid-column-end: " + caja.ce + "; grid-row-start: " + caja.rs + "; grid-row-end: " + caja.re + ";</span>";
  }

  /* ---------- Los cuartos se deslizan a su nuevo lugar ---------- */
  function mover(cambio) {
    var s = escala();
    var antes = cuartos.map(function (el) { return el.getBoundingClientRect(); });
    cambio();
    if (reduce || !Element.prototype.animate) return;
    cuartos.forEach(function (el, i) {
      var a = antes[i], b = el.getBoundingClientRect();
      if (!a.width || !b.width) return;
      var dx = (a.left - b.left) / s, dy = (a.top - b.top) / s, sx = a.width / b.width, sy = a.height / b.height;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1 && Math.abs(sx - 1) < 0.01 && Math.abs(sy - 1) < 0.01) return;
      el.animate([
        { transformOrigin: "0 0", transform: "translate(" + dx + "px, " + dy + "px) scale(" + sx + ", " + sy + ")" },
        { transformOrigin: "0 0", transform: "none" }
      ], { duration: 450, easing: "cubic-bezier(.2,.7,.2,1)" });
    });
  }

  /* ---------- Menú: el menú de vidrio compartido (assets/js/menu-vidrio.js) ---------- */
  function abrirMenu(origen, opciones, alElegir, alCerrar) {
    MenuVidrio.abrir(origen, { dentro: root, opciones: opciones, alElegir: alElegir, alCerrar: alCerrar });
  }

  /* ---------- Celdas del plano: elegir qué cuarto va ahí ---------- */
  for (var r = 0; r < 3; r++) {
    for (var c = 0; c < 3; c++) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "plano__celda";
      b.setAttribute("data-r", r);
      b.setAttribute("data-c", c);
      b.setAttribute("aria-haspopup", "menu");
      b.style.gridArea = (r + 1) + " / " + (c + 1);
      celdas.appendChild(b);
    }
  }

  function muestra(id) {
    if (id === ".") return "<span class=\"plano__muestra plano__muestra--vacia\"></span>";
    var bg = getComputedStyle(grid.querySelector("[data-item=\"" + id + "\"]")).backgroundImage;
    return "<span class=\"plano__muestra\" style='background-image:" + bg.replace(/'/g, "%27") + "'></span>";
  }

  celdas.addEventListener("click", function (e) {
    var celda = e.target.closest(".plano__celda");
    if (!celda) return;
    if (MenuVidrio.abiertoDesde(celda)) { MenuVidrio.cerrar(); return; }
    var r = +celda.getAttribute("data-r"), c = +celda.getAttribute("data-c");
    var actual = estado.mapa[r][c];
    var ops = CUARTOS.map(function (q) {
      return { html: muestra(q.id) + "<span>" + q.nombre + "</span>", actual: q.id === actual, id: q.id };
    });
    ops.push({ html: muestra(".") + "<span>Vacía <code>.</code></span>", actual: actual === ".", id: "." });
    abrirMenu(celda, ops, function (i) { cambiarCelda(r, c, ops[i].id); }, function () { marcarPalabra(r, c, false); });
    marcarPalabra(r, c, true);
  });

  celdas.addEventListener("pointerover", function (e) {
    var celda = e.target.closest(".plano__celda");
    if (celda) marcarPalabra(celda.getAttribute("data-r"), celda.getAttribute("data-c"), true);
  });

  celdas.addEventListener("pointerout", function (e) {
    var celda = e.target.closest(".plano__celda");
    if (celda && !MenuVidrio.abiertoDesde(celda)) marcarPalabra(celda.getAttribute("data-r"), celda.getAttribute("data-c"), false);
  });

  function cambiarCelda(r, c, id) {
    var antes = estado.mapa[r][c];
    estado.mapa[r][c] = id;
    estado.sel = id === "." ? null : id;
    mover(aplicar);
    pintarCodigo();
    marcarPalabra(r, c, true);
    setTimeout(function () { marcarPalabra(r, c, false); }, 1200);
    var lugar = "En <span class=\"concepto\">grid-template-areas</span> cada texto entre comillas es un renglón y cada palabra una celda. La palabra del renglón " + (r + 1) + ", columna " + (c + 1) + " ";
    var roto = cuartoRoto(estado.mapa);
    if (antes === id) {
      explicar(id === "." ? lugar + "es un <span class=\"concepto\">.</span>, que deja la celda vacía." : textoCuarto(id, lugar + "dice <b>" + id + "</b>. "));
    } else if (roto) {
      var rotos = cuartosRotos(estado.mapa).map(function (q) { return porId[q].con; });
      var quien = rotos.length > 1 ? rotos.slice(0, -1).join(", ") + " y " + rotos[rotos.length - 1] + " ya no lo forman" : rotos[0] + " ya no lo forma";
      explicar("<span class=\"mal\">Cuidado:</span> en <span class=\"concepto\">grid-template-areas</span> cada cuarto tiene que formar un rectángulo, y " + quien + ": por eso se ve con franjas rojas. Con un mapa así, el navegador ignora todo <span class=\"concepto\">grid-template-areas</span> y el departamento no se acomoda. Elige otro cuarto en alguna celda para arreglarlo.");
    } else if (id === ".") {
      explicar(lugar + "ahora es un <span class=\"concepto\">.</span>, que deja la celda vacía: ese pedazo del terreno se queda sin construir.");
    } else {
      explicar(textoCuarto(id, lugar + "ahora dice <b>" + id + "</b>, así que esa celda pasó a ser parte " + porId[id].de + ". "));
    }
  }

  /* ---------- Valores del código: elegir otro de la lista ---------- */
  pre.addEventListener("click", function (e) {
    var b = e.target.closest(".menu-vidrio__valor");
    if (!b) return;
    var k = b.getAttribute("data-k");
    abrirMenu(b, MenuVidrio.valores(OPCIONES[k], OPCIONES[k][estado[k]]), function (i) { cambiarValor(k, i); });
  });

  function cambiarValor(k, i) {
    estado[k] = i;
    mover(aplicar);
    pintarCodigo();
    var b = pre.querySelector("[data-k=\"" + k + "\"]");
    if (b) b.focus({ preventScroll: true });
    var v = OPCIONES[k][i];
    if (k === "cols") explicar("<span class=\"concepto\">grid-template-columns</span> define el tamaño de las columnas. " + TEXTO[v] + " En este plano, las columnas quedaron de " + enPx("cols") + ".");
    if (k === "rows") explicar("<span class=\"concepto\">grid-template-rows</span> define el tamaño de los renglones. " + (TEXTO[v + "#rows"] || TEXTO[v]) + " En este plano, los renglones quedaron de " + enPx("rows") + ".");
    if (k === "gap") explicar("<span class=\"concepto\">grid-gap</span> especifica el espacio entre cada renglón y columna: aquí es el grosor de los muros, " + v + ". Si solo quieres uno de los dos, usa <span class=\"concepto\">grid-row-gap</span> para el espacio entre renglones o <span class=\"concepto\">grid-column-gap</span> para el espacio entre columnas.");
  }

  // Lo que mide cada pista en pantalla (al tamaño real del plano): "312px, 156px y 156px"
  function enPx(k) {
    var cs = getComputedStyle(grid);
    var lista = (k === "cols" ? cs.gridTemplateColumns : cs.gridTemplateRows).split(" ").map(function (v) {
      return Math.round(parseFloat(v)) + "px";
    });
    return lista.slice(0, -1).join(", ") + " y " + lista[lista.length - 1];
  }

  // Explicación inicial: describe el plano como está
  function resumen() {
    var nombres = [];
    cuartos.forEach(function (el) {
      if (!el.classList.contains("is-fuera")) nombres.push(porId[el.getAttribute("data-item")].nombre.toLowerCase());
    });
    return "El <span class=\"concepto\">.departamento</span> es el contenedor <b>grid</b>. Con <span class=\"concepto\">grid-template-columns: " + OPCIONES.cols[estado.cols] + "</span> tiene columnas de " + enPx("cols") + ", y con <span class=\"concepto\">grid-template-rows: " + OPCIONES.rows[estado.rows] + "</span> renglones de " + enPx("rows") + ". El <span class=\"concepto\">grid-gap</span> de " + OPCIONES.gap[estado.gap] + " es el grosor de los muros. Cada cuarto (" + nombres.slice(0, -1).join(", ") + " y " + nombres[nombres.length - 1] + ") ocupa las celdas que tienen su nombre en <span class=\"concepto\">grid-template-areas</span>.";
  }

  /* ---------- Inicio ---------- */
  aplicar();
  pintarCodigo();
  ajustar();
  exp.innerHTML = resumen();
  if (window.ResizeObserver) {
    new ResizeObserver(ajustar).observe(fitEl);
  } else {
    window.addEventListener("resize", ajustar);
  }
  // Las letras del plano llegan de Google Fonts; al cargar, las cotas se vuelven a medir
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(dibujarCotas);
})();
