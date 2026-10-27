/* Tema 22 (modulo3-23): plano de un departamento hecho con CSS grid.
   El código del panel se aplica tal cual al plano. Los valores con flecha
   abren una lista con otras opciones; las celdas del plano abren una lista
   de cuartos y cambian la palabra que les toca en grid-template-areas.
   Cada cambio trae una explicación abajo (con desvanecido), y las cotas
   marcan las líneas donde empieza y termina el último cuarto que se tocó. */
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
  var menu = root.querySelector("[data-menu]");
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
    "2fr 1fr 1fr": "La primera columna recibe <span class=\"nom\">2fr</span>, el doble del espacio libre que las otras dos, que tienen <span class=\"nom\">1fr</span>. La unidad <span class=\"nom\">fr</span> es exclusiva de grid: reparte el espacio libre en partes.",
    "repeat(3, 1fr)": "La función <span class=\"nom\">repeat</span> repite los valores: el primer número indica cuántas veces y el segundo el tamaño, así que aquí hay tres de <span class=\"nom\">1fr</span>, todas del mismo tamaño.",
    "200px 1fr 1fr": "La primera mide <span class=\"nom\">200px</span> fijos y las otras dos se reparten lo que sobra: <span class=\"nom\">1fr</span> cada una.",
    "minmax(150px, 1fr) 2fr 1fr": "La función <span class=\"nom\">minmax</span> da un rango mínimo y máximo: la primera columna nunca mide menos de 150px ni más de 1fr. La de en medio recibe <span class=\"nom\">2fr</span>.",
    "repeat(3, 1fr)#rows": "La función <span class=\"nom\">repeat</span> repite los valores: el primer número indica cuántas veces y el segundo el tamaño, así que aquí hay tres renglones de <span class=\"nom\">1fr</span>, todos del mismo alto.",
    "1fr 1fr 120px": "Los primeros dos renglones se reparten el espacio libre con <span class=\"nom\">1fr</span> cada uno y el último mide <span class=\"nom\">120px</span> fijos.",
    "auto minmax(200px, 1fr) auto": "<span class=\"nom\">auto</span> hace que el renglón mida lo que su contenido necesita, y <span class=\"nom\">minmax(200px, 1fr)</span> hace que el de en medio nunca mida menos de 200px ni más de 1fr."
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
    for (var k = 0; k < CUARTOS.length; k++) {
      var caja = cajaDe(mapa, CUARTOS[k].id);
      if (!caja) continue;
      var cuenta = 0;
      mapa.forEach(function (fila) { fila.forEach(function (x) { if (x === CUARTOS[k].id) cuenta++; }); });
      if (cuenta !== (caja.re - caja.rs) * (caja.ce - caja.cs)) return CUARTOS[k].id;
    }
    return null;
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
    cerrarMenu();
  }

  /* ---------- Aplicar el código al plano ---------- */
  function aplicar() {
    var cols = OPCIONES.cols[estado.cols], rows = OPCIONES.rows[estado.rows], gap = OPCIONES.gap[estado.gap];
    grid.style.gridTemplateColumns = cols;
    grid.style.gridTemplateRows = rows;
    grid.style.gap = celdas.style.gap = gap;
    hoja.style.setProperty("--muro", gap);

    var roto = cuartoRoto(estado.mapa);
    var usados = {};
    estado.mapa.forEach(function (fila) { fila.forEach(function (x) { usados[x] = true; }); });
    // Si un área no es rectángulo, el navegador ignora todo el mapa
    grid.style.gridTemplateAreas = roto ? "none" : estado.mapa.map(function (f) { return "\"" + f.join(" ") + "\""; }).join(" ");
    cuartos.forEach(function (el) {
      var id = el.getAttribute("data-item");
      el.style.gridArea = roto ? "auto" : id;
      el.classList.toggle("is-fuera", !usados[id]);
      el.classList.toggle("is-sel", id === estado.sel && !roto);
    });

    Array.prototype.forEach.call(celdas.children, function (b) {
      var x = estado.mapa[+b.getAttribute("data-r")][+b.getAttribute("data-c")];
      b.classList.toggle("is-vacia", x === ".");
      b.innerHTML = x === "." ? "<span aria-hidden=\"true\">.</span>" : "";
      b.setAttribute("aria-label", "Renglón " + (+b.getAttribute("data-r") + 1) + ", columna " + (+b.getAttribute("data-c") + 1) + ": " + (x === "." ? "vacía" : porId[x].nombre) + ". Elegir otro cuarto");
    });
    medidas();
    dibujarCotas();
  }

  // Lo que mide cada cuarto, en las unidades del código: las pistas que ocupa
  function medidas() {
    var cols = pistas(OPCIONES.cols[estado.cols]), rows = pistas(OPCIONES.rows[estado.rows]);
    var roto = cuartoRoto(estado.mapa);
    cuartos.forEach(function (el) {
      var caja = !roto && cajaDe(estado.mapa, el.getAttribute("data-item"));
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
    return "<button type=\"button\" class=\"plano__valor\" data-k=\"" + k + "\" aria-haspopup=\"menu\" aria-label=\"" + PROPIEDAD[k] + ": " + esc(OPCIONES[k][estado[k]]) + ". Elegir otro valor\">" + esc(OPCIONES[k][estado[k]]) + "</button>";
  }

  function pintarCodigo() {
    var roto = cuartoRoto(estado.mapa);
    var anchos = [0, 1, 2].map(function (c) {
      return Math.max.apply(null, estado.mapa.map(function (f) { return f[c].length; }));
    });
    var filas = estado.mapa.map(function (fila, r) {
      return "    <span class=\"q\">\"" + fila.map(function (x, c) {
        var cls = "w" + (roto && x === roto ? " is-mal" : "");
        var relleno = c < 2 ? " " + new Array(anchos[c] - x.length + 1).join(" ") : "";
        return "<span class=\"" + cls + "\" data-r=\"" + r + "\" data-c=\"" + c + "\">" + x + "</span>" + relleno;
      }).join("") + "\"</span>";
    }).join("\n");
    var sel = estado.sel || "sala";
    pre.innerHTML =
      "<span class=\"s\">.departamento</span> {\n" +
      "  <span class=\"p\">display</span>: grid;\n" +
      "  <span class=\"p\">grid-template-columns</span>: " + valor("cols") + ";\n" +
      "  <span class=\"p\">grid-template-rows</span>: " + valor("rows") + ";\n" +
      "  <span class=\"p\">grid-gap</span>: " + valor("gap") + ";\n" +
      "  <span class=\"p\">grid-template-areas</span>:\n" + filas + ";\n" +
      "}\n" +
      "<span class=\"s\">." + sel + "</span> {\n" +
      "  <span class=\"p\">grid-area</span>: " + sel + ";\n" +
      "}";
  }

  // Ilumina en el código la palabra de una celda
  function marcarPalabra(r, c, on) {
    var w = pre.querySelector(".w[data-r=\"" + r + "\"][data-c=\"" + c + "\"]");
    if (w) w.classList.toggle("is-hot", on);
  }

  /* ---------- Explicación con desvanecido ---------- */
  function explicar(html) {
    exp.classList.add("is-fading");
    clearTimeout(exp._t);
    exp._t = setTimeout(function () {
      exp.innerHTML = html;
      exp.classList.remove("is-fading");
    }, reduce || !exp.innerHTML ? 0 : 200);
  }

  function textoCuarto(id, inicio) {
    var c = porId[id], caja = cajaDe(estado.mapa, id);
    return inicio + "<span class=\"nom\">." + id + "</span> tiene <span class=\"nom\">grid-area: " + id + "</span>, así que ocupa todas las celdas que dicen <b>" + id + "</b> en el mapa. En las cotas se ve que " + c.con + " va de la línea de columna " + caja.cs + " a la " + caja.ce + " y de la línea de renglón " + caja.rs + " a la " + caja.re + ": sería lo mismo escribir <span class=\"nom\">grid-column-start: " + caja.cs + "; grid-column-end: " + caja.ce + "; grid-row-start: " + caja.rs + "; grid-row-end: " + caja.re + ";</span>";
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

  /* ---------- Menú ---------- */
  var abierto = null;

  function abrirMenu(origen, titulo, opciones, alElegir) {
    cerrarMenu();
    abierto = { origen: origen, alElegir: alElegir };
    origen.classList.add("is-abierta");
    origen.setAttribute("aria-expanded", "true");
    menu.innerHTML = (titulo ? "<p class=\"plano__menu-titulo\">" + titulo + "</p>" : "") + opciones.map(function (o, i) {
      return "<button type=\"button\" role=\"menuitem\" class=\"plano__opcion" + (o.actual ? " is-actual" : "") + "\" data-i=\"" + i + "\">" + o.html + "</button>";
    }).join("");
    menu.hidden = false;
    // Debajo del elemento que se tocó; si no cabe, arriba
    var r = root.getBoundingClientRect(), o = origen.getBoundingClientRect();
    var w = menu.offsetWidth, h = menu.offsetHeight;
    var left = Math.max(4, Math.min(o.left - r.left, r.width - w - 4));
    var top = o.bottom - r.top + 6;
    if (o.bottom + h + 6 > window.innerHeight && o.top - h - 6 > 0) top = o.top - r.top - h - 6;
    menu.style.left = left + "px";
    menu.style.top = top + "px";
    // El menú crece desde el elemento que se tocó
    menu.style.setProperty("--origen", Math.max(0, Math.min(w, o.left - r.left - left + 20)) + "px " + (top < o.top - r.top ? h + "px" : "0"));
    requestAnimationFrame(function () { menu.classList.add("is-on"); });
    var actual = menu.querySelector(".is-actual") || menu.querySelector(".plano__opcion");
    actual.focus({ preventScroll: true });
  }

  function cerrarMenu(devolverFoco) {
    if (!abierto) return;
    var origen = abierto.origen;
    origen.classList.remove("is-abierta");
    origen.removeAttribute("aria-expanded");
    if (origen.hasAttribute("data-r") && origen.classList.contains("plano__celda")) {
      marcarPalabra(origen.getAttribute("data-r"), origen.getAttribute("data-c"), false);
    }
    menu.hidden = true;
    menu.classList.remove("is-on");
    abierto = null;
    if (devolverFoco) origen.focus({ preventScroll: true });
  }

  menu.addEventListener("click", function (e) {
    var b = e.target.closest(".plano__opcion");
    if (!b || !abierto) return;
    var elegir = abierto.alElegir;
    cerrarMenu(true);
    elegir(+b.getAttribute("data-i"));
  });

  menu.addEventListener("keydown", function (e) {
    var ops = Array.prototype.slice.call(menu.querySelectorAll(".plano__opcion"));
    var i = ops.indexOf(document.activeElement);
    if (e.key === "ArrowDown") { e.preventDefault(); ops[(i + 1) % ops.length].focus(); }
    if (e.key === "ArrowUp") { e.preventDefault(); ops[(i - 1 + ops.length) % ops.length].focus(); }
    if (e.key === "Escape") { e.preventDefault(); cerrarMenu(true); }
    if (e.key === "Tab") cerrarMenu();
  });

  document.addEventListener("pointerdown", function (e) {
    if (abierto && !menu.contains(e.target) && !abierto.origen.contains(e.target)) cerrarMenu();
  });

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
    if (abierto && abierto.origen === celda) { cerrarMenu(); return; }
    var r = +celda.getAttribute("data-r"), c = +celda.getAttribute("data-c");
    var actual = estado.mapa[r][c];
    var ops = CUARTOS.map(function (q) {
      return { html: muestra(q.id) + "<span>" + q.nombre + "</span>", actual: q.id === actual, id: q.id };
    });
    ops.push({ html: muestra(".") + "<span>Vacía <code>.</code></span>", actual: actual === ".", id: "." });
    abrirMenu(celda, "¿Qué cuarto va en esta celda?", ops, function (i) { cambiarCelda(r, c, ops[i].id); });
    marcarPalabra(r, c, true);
  });

  celdas.addEventListener("pointerover", function (e) {
    var celda = e.target.closest(".plano__celda");
    if (celda) marcarPalabra(celda.getAttribute("data-r"), celda.getAttribute("data-c"), true);
  });

  celdas.addEventListener("pointerout", function (e) {
    var celda = e.target.closest(".plano__celda");
    if (celda && !(abierto && abierto.origen === celda)) marcarPalabra(celda.getAttribute("data-r"), celda.getAttribute("data-c"), false);
  });

  function cambiarCelda(r, c, id) {
    var antes = estado.mapa[r][c];
    estado.mapa[r][c] = id;
    estado.sel = id === "." ? null : id;
    mover(aplicar);
    pintarCodigo();
    marcarPalabra(r, c, true);
    setTimeout(function () { marcarPalabra(r, c, false); }, 1200);
    var lugar = "En <span class=\"nom\">grid-template-areas</span> cada texto entre comillas es un renglón y cada palabra una celda. La palabra del renglón " + (r + 1) + ", columna " + (c + 1) + " ";
    var roto = cuartoRoto(estado.mapa);
    if (antes === id) {
      explicar(id === "." ? lugar + "es un <span class=\"nom\">.</span>, que deja la celda vacía." : textoCuarto(id, lugar + "dice <b>" + id + "</b>. "));
    } else if (roto) {
      explicar("<span class=\"mal\">Cuidado:</span> en <span class=\"nom\">grid-template-areas</span> cada cuarto tiene que formar un rectángulo, y " + porId[roto].con + " ya no lo forma. Cuando eso pasa, el navegador ignora todo el mapa y el departamento se desarma. Elige otro cuarto en alguna celda para arreglarlo.");
    } else if (id === ".") {
      explicar(lugar + "ahora es un <span class=\"nom\">.</span>, que deja la celda vacía: ese pedazo del terreno se queda sin construir.");
    } else {
      explicar(textoCuarto(id, lugar + "ahora dice <b>" + id + "</b>, así que esa celda pasó a ser parte " + porId[id].de + ". "));
    }
  }

  /* ---------- Valores del código: elegir otro de la lista ---------- */
  pre.addEventListener("click", function (e) {
    var b = e.target.closest(".plano__valor");
    if (!b) return;
    if (abierto && abierto.origen === b) { cerrarMenu(); return; }
    var k = b.getAttribute("data-k");
    var ops = OPCIONES[k].map(function (v, i) { return { html: "<code>" + esc(v) + "</code>", actual: i === estado[k] }; });
    abrirMenu(b, null, ops, function (i) { cambiarValor(k, i); });
  });

  function cambiarValor(k, i) {
    estado[k] = i;
    mover(aplicar);
    pintarCodigo();
    var b = pre.querySelector("[data-k=\"" + k + "\"]");
    if (b) b.focus({ preventScroll: true });
    var v = OPCIONES[k][i];
    if (k === "cols") explicar("<span class=\"nom\">grid-template-columns</span> define el tamaño de las columnas. " + TEXTO[v] + " En este plano, las columnas quedaron de " + enPx("cols") + ".");
    if (k === "rows") explicar("<span class=\"nom\">grid-template-rows</span> define el tamaño de los renglones. " + (TEXTO[v + "#rows"] || TEXTO[v]) + " En este plano, los renglones quedaron de " + enPx("rows") + ".");
    if (k === "gap") explicar("<span class=\"nom\">grid-gap</span> especifica el espacio entre cada renglón y columna: aquí es el grosor de los muros, " + v + ". Si solo quieres uno de los dos, usa <span class=\"nom\">grid-row-gap</span> para el espacio entre renglones o <span class=\"nom\">grid-column-gap</span> para el espacio entre columnas.");
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
    return "El <span class=\"nom\">.departamento</span> es el contenedor <b>grid</b>. Con <span class=\"nom\">grid-template-columns: " + OPCIONES.cols[estado.cols] + "</span> tiene columnas de " + enPx("cols") + ", y con <span class=\"nom\">grid-template-rows: " + OPCIONES.rows[estado.rows] + "</span> renglones de " + enPx("rows") + ". El <span class=\"nom\">grid-gap</span> de " + OPCIONES.gap[estado.gap] + " es el grosor de los muros. Cada cuarto (" + nombres.slice(0, -1).join(", ") + " y " + nombres[nombres.length - 1] + ") ocupa las celdas que tienen su nombre en <span class=\"nom\">grid-template-areas</span>.";
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
