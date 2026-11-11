/* Tema 20 (modulo3-21): ventana elástica para las media queries.
   La ventana se estira con la agarradera de su orilla derecha (con el mouse,
   el dedo o las flechas del teclado). La cinta métrica de arriba mide la ventana y, encima, dos tramos
   dicen dónde se aplica @media (de 0 al corte de max-width) y dónde no;
   se ilumina el tramo donde cae la orilla. Cuando la condición se cumple,
   se ilumina en el código, sus reglas se encienden y las columnas se
   deslizan a su nuevo lugar. Los valores del código son el menú de vidrio
   compartido y la explicación va en la ficha de renglones (grafico-ficha.js). */
(function () {
  "use strict";

  var root = document.querySelector("[data-elastica]");
  if (!root) return;

  var area = root.querySelector("[data-area]");
  var medida = root.querySelector("[data-medida]");
  var nav = root.querySelector("[data-nav]");
  var cols = root.querySelector("[data-cols]");
  var asa = root.querySelector("[data-asa]");
  var pre = root.querySelector("[data-code]");
  var exp = root.querySelector("[data-status]");
  var reduce = Curso.reduce;

  var MIN = 240, MAX = 1000, ALTO = 56;
  var OPCIONES = {
    bp: ["300px", "400px", "600px", "800px"],
    cw: ["100%", "50%"],
    bg: ["#2e8b57", "#8e44ad", "#e67e22"]
  };
  var PROPIEDAD = { bp: "max-width", cw: "width", bg: "background-color" };
  var COLOR = { "#0f4c91": "azul", "#2e8b57": "verde", "#8e44ad": "morado", "#e67e22": "naranja" };
  var estado = { w: 600, bp: 1, cw: 0, bg: 0 };
  var antes = null;

  function corte() { return parseInt(OPCIONES.bp[estado.bp], 10); }
  function seAplica() { return estado.w <= corte(); }
  function escala() { return (area.clientWidth - 18) / MAX; }

  /* ---------- Cinta métrica y tramos ---------- */
  medida.innerHTML =
    "<div class=\"elastica__zona elastica__zona--si\" data-zona=\"si\"><span class=\"elastica__letrero\"><b>Se aplica</b></span></div>" +
    "<div class=\"elastica__zona elastica__zona--no\" data-zona=\"no\"><span class=\"elastica__letrero\"><b>No se aplica</b></span></div>" +
    "<div class=\"elastica__franja\" data-franja></div>" +
    "<div class=\"elastica__cinta\" data-cinta></div>" +
    "<div class=\"elastica__medidor\" data-medidor></div>";
  var zonaSi = medida.querySelector("[data-zona=\"si\"]");
  var zonaNo = medida.querySelector("[data-zona=\"no\"]");
  var cinta = medida.querySelector("[data-cinta]");
  var franja = medida.querySelector("[data-franja]");
  var medidor = medida.querySelector("[data-medidor]");
  var linea = document.createElement("div");
  linea.className = "elastica__corte";
  area.appendChild(linea);

  function armarCinta() {
    var s = escala(), html = "";
    var numeros = s * 100 < 40 ? 200 : 100; // cada cuánto va un número
    var paso = s * 10 >= 4 ? 10 : s * 50 >= 6 ? 50 : 100;
    for (var v = 0; v <= MAX; v += paso) {
      var cls = v % numeros === 0 ? " is-grande" : v % 50 === 0 ? " is-media" : "";
      html += "<span class=\"elastica__marca" + cls + "\" style=\"left:" + (v * s) + "px\">" + (v % numeros === 0 && v < MAX ? "<b>" + v + "</b>" : "") + "</span>";
    }
    cinta.innerHTML = html + "<span class=\"elastica__lectura\" data-lectura></span>";
  }

  function pintarMedida() {
    var s = escala(), bp = corte(), x = bp * s, total = MAX * s;
    zonaSi.style.left = "0px";
    zonaSi.style.width = x + "px";
    zonaNo.style.left = x + "px";
    zonaNo.style.width = (total - x) + "px";
    [zonaSi, zonaNo].forEach(function (z) {
      var letrero = z.querySelector(".elastica__letrero");
      z.classList.toggle("is-angosta", letrero.offsetWidth > parseFloat(z.style.width) - 4);
    });
    linea.style.left = x + "px";
    franja.style.width = x + "px";
    // Si no cabe "max-width: 400px", la franja solo dice el valor
    franja.innerHTML = "<span>max-width: " + bp + "px</span>";
    if (franja.firstChild.offsetWidth > x - 8) franja.firstChild.textContent = bp + "px";
    medidor.textContent = estado.w + " px";
    var mx = estado.w * s, mw = medidor.offsetWidth / 2;
    medidor.style.left = Math.max(mw, Math.min(total + 18 - mw, mx)) + "px";
    cinta.querySelector("[data-lectura]").style.width = estado.w * s + "px";
    var on = seAplica();
    zonaSi.classList.toggle("is-activa", on);
    zonaNo.classList.toggle("is-activa", !on);
  }

  /* ---------- Columnas de la ventana ---------- */
  for (var k = 0; k < 3; k++) {
    var c = document.createElement("div");
    c.className = "elastica__col";
    cols.appendChild(c);
  }
  var columnas = Array.prototype.slice.call(cols.children);

  function acomodar() {
    var on = seAplica();
    var pct = on ? OPCIONES.cw[estado.cw] : "33.33%";
    var n = pct === "100%" ? 1 : pct === "50%" ? 2 : 3;
    var vista = estado.w * escala();
    var w = (vista - 20) / n;
    nav.style.width = vista + "px";
    columnas.forEach(function (col, i) {
      col.style.left = (i % n) * w + "px";
      col.style.top = Math.floor(i / n) * ALTO + "px";
      col.style.width = w + "px";
      col.style.height = ALTO + "px";
      col.style.backgroundColor = on ? OPCIONES.bg[estado.bg] : "#0f4c91";
      col.textContent = w > 84 ? "Columna " + (i + 1) : String(i + 1);
    });
    cols.style.height = Math.ceil(3 / n) * ALTO + "px";
    asa.setAttribute("aria-valuenow", estado.w);
    asa.setAttribute("aria-valuetext", estado.w + " px");
  }

  /* ---------- Código ---------- */
  function valor(k) {
    return MenuVidrio.boton(OPCIONES[k][estado[k]], PROPIEDAD[k], " data-k=\"" + k + "\"");
  }

  // Mismo formato que los bloques de código del curso: cada línea es un .ld-line numerado
  function pintarCodigo() {
    var lineas = [
      "<span class=\"codetag\">.col</span> {",
      "  float: <span class=\"codetext\">left</span>;",
      "  width: <span class=\"codetext\">33.33%</span>;",
      "  padding: <span class=\"codetext\">16px</span>;",
      "  background-color: <span class=\"codetext\">#0f4c91</span>;",
      "  color: <span class=\"codetext\">white</span>;",
      "}",
      "",
      "<span class=\"elastica__cond\" data-cond><span class=\"codetag\">@media</span> (max-width: " + valor("bp") + ")</span> {",
      "  <span class=\"codetag\">.col</span> {",
      "    width: " + valor("cw") + ";",
      "    background-color: " + valor("bg") + ";",
      "  }",
      "}"
    ];
    pre.innerHTML = lineas.map(function (l, i) {
      return "<span class=\"ld-line\"" + (i >= 9 && i <= 12 ? " data-dentro" : "") + ">" + (l || "&nbsp;") + "</span>";
    }).join("");
  }

  function marcarCodigo() {
    var on = seAplica();
    pre.querySelector("[data-cond]").classList.toggle("is-on", on);
    Array.prototype.forEach.call(pre.querySelectorAll("[data-dentro]"), function (l) { l.classList.toggle("is-off", !on); });
  }

  /* ---------- Explicación ---------- */
  function texto() {
    var w = estado.w, bp = corte();
    if (seAplica()) {
      var cw = OPCIONES.cw[estado.cw];
      var comp = w === bp ? "es igual a " + bp + " px (<code>max-width</code> también incluye ese ancho)" : "es menor que " + bp + " px";
      var acomodo = cw === "100%" ? "una debajo de otra" : "dos por fila y la tercera abajo";
      return "La ventana mide " + w + " px. Como " + w + " px " + comp + ", la condición de <code>@media</code> se cumple: las columnas toman <code>width: " + cw + "</code> y se acomodan " + acomodo + ", en " + COLOR[OPCIONES.bg[estado.bg]] + ".";
    }
    return "La ventana mide " + w + " px. Como " + w + " px es más que " + bp + " px, la condición de <code>max-width</code> no se cumple: el navegador se salta lo que está dentro de <code>@media</code> y las columnas se quedan con <code>width: 33.33%</code>.";
  }

  // Si la condición cambió, la ficha cambia con su animación; si no, solo se actualiza la medida
  function explicar(forzar) {
    var on = seAplica(), html = texto();
    if (forzar || on !== antes || exp.classList.contains("is-fading")) {
      GraficoFicha.cambiar(exp, html);
    } else if (html !== exp._html) {
      exp._html = html;
      exp.innerHTML = html;
    }
    if (on !== antes && antes !== null && !reduce) {
      var z = on ? zonaSi : zonaNo;
      z.classList.remove("is-pulso");
      void z.offsetWidth;
      z.classList.add("is-pulso");
    }
    antes = on;
  }

  function pintar() {
    acomodar();
    pintarMedida();
    marcarCodigo();
  }

  /* ---------- Cambiar el ancho ---------- */
  function fijar(w, animar) {
    estado.w = Math.round(Math.max(MIN, Math.min(MAX, w)));
    nav.style.transition = animar && !reduce ? "width 0.45s cubic-bezier(0.3, 0.7, 0.3, 1)" : "none";
    pintar();
    explicar();
  }

  function sinPista() { asa.classList.remove("is-pista"); }

  asa.addEventListener("pointerdown", function (e) {
    e.preventDefault();
    sinPista();
    asa.setPointerCapture(e.pointerId);
    asa.classList.add("is-arrastrando");
    var x0 = nav.getBoundingClientRect().left;
    function mover(ev) { fijar((ev.clientX - x0) / escala(), false); }
    function soltar() {
      asa.classList.remove("is-arrastrando");
      asa.removeEventListener("pointermove", mover);
      asa.removeEventListener("pointerup", soltar);
      asa.removeEventListener("pointercancel", soltar);
    }
    asa.addEventListener("pointermove", mover);
    asa.addEventListener("pointerup", soltar);
    asa.addEventListener("pointercancel", soltar);
  });

  asa.addEventListener("keydown", function (e) {
    var d = { ArrowRight: 20, ArrowUp: 20, ArrowLeft: -20, ArrowDown: -20 }[e.key];
    if (e.key === "Home") { e.preventDefault(); sinPista(); fijar(MIN, true); }
    else if (e.key === "End") { e.preventDefault(); sinPista(); fijar(MAX, true); }
    else if (d) { e.preventDefault(); sinPista(); fijar(estado.w + d, true); }
  });


  /* ---------- Valores del código: el menú de vidrio ---------- */
  pre.addEventListener("click", function (e) {
    var b = e.target.closest(".menu-vidrio__valor");
    if (!b) return;
    var k = b.getAttribute("data-k");
    MenuVidrio.abrir(b, {
      dentro: root,
      opciones: MenuVidrio.valores(OPCIONES[k], OPCIONES[k][estado[k]]),
      alElegir: function (i) {
        if (i === estado[k]) return;
        estado[k] = i;
        pintarCodigo();
        nav.style.transition = "none";
        pintar();
        explicar(true);
        var nuevo = pre.querySelector("[data-k=\"" + k + "\"]");
        if (nuevo) nuevo.focus({ preventScroll: true });
      }
    });
  });

  /* ---------- Inicio ---------- */
  armarCinta();
  pintarCodigo();
  pintar();
  antes = seAplica();
  exp._html = texto();
  exp.innerHTML = exp._html;

  function reajustar() {
    armarCinta();
    nav.style.transition = "none";
    pintar();
    explicar();
  }
  if (window.ResizeObserver) {
    var ultimo = area.clientWidth;
    new ResizeObserver(function () {
      if (area.clientWidth === ultimo) return;
      ultimo = area.clientWidth;
      reajustar();
    }).observe(area);
  } else {
    window.addEventListener("resize", reajustar);
  }
})();
