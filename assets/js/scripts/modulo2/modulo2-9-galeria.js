/* Módulo 2-9: la etiqueta <img> como un cuadro colgado en una galería
   (modulo2-9-galeria.css).
   - El código de la derecha se aplica tal cual: src, alt, width y height se
     cambian con el menú de vidrio compartido (menu-vidrio.js), sin
     descripciones en las opciones.
   - El hueco del marco mide width × height (escalado para caber en la pared)
     y las cintas métricas dicen los px. Si la medida no tiene la forma de la
     foto, la foto se deforma, como en el navegador.
   - src puede ser el url de la foto en Internet, el archivo edificio.jpg o
     edificio.jp (mal escrito): con este el marco se queda vacío y adentro solo
     queda el texto de alt. La cartela dice de dónde llegó la foto.
   - La explicación va en la ficha de renglones (GraficoFicha.cambiar). */
(function () {
  "use strict";

  var root = document.querySelector("[data-galeria]");
  if (!root) return;

  var esc = Curso.esc;
  var reduce = Curso.reduce;
  var celular = window.matchMedia("(max-width: 575.98px)");

  var pared = root.querySelector("[data-pared]");
  var obra = root.querySelector("[data-obra]");
  var hueco = root.querySelector("[data-hueco]");
  var cintaW = root.querySelector("[data-cinta-w]");
  var cintaH = root.querySelector("[data-cinta-h]");
  var cartela = root.querySelector("[data-cartela]");
  var altTxt = root.querySelector("[data-alt]");
  var pre = root.querySelector("[data-code]");
  var exp = root.querySelector("[data-status]");

  var URL_FOTO = "https://images.unsplash.com/photo-1569525987258-6aa03a5e4926";
  var FORMA = 500 / 755; // ancho / alto de la foto original

  var OPCIONES = {
    src: [URL_FOTO, "edificio.jpg", "edificio.jp"],
    alt: ["edificio", "Torre vista desde abajo"],
    width: ["100", "200", "300"],
    height: ["150", "300", "450"]
  };
  var estado = { src: 1, alt: 0, width: 1, height: 1 };

  function val(k) { return OPCIONES[k][estado[k]]; }
  function tipo() { return ["url", "local", "roto"][estado.src]; }

  /* ---------- Código ---------- */
  function valor(k) {
    if (k === "src") {
      // El url es largo: va como texto que se parte, con el aspecto del botón
      return "<span class=\"menu-vidrio__valor galeria__largo\" role=\"button\" tabindex=\"0\" data-k=\"src\" aria-haspopup=\"menu\" aria-label=\"" +
        esc("src: " + val("src")) + ". Elegir otro valor\">" + esc(val("src")) + "</span>";
    }
    return MenuVidrio.boton(val(k), k, " data-k=\"" + k + "\"");
  }

  function pintarCodigo() {
    var tag = function (t) { return "<span class=\"codetag\">" + t + "</span>"; };
    var lineas = [
      "&lt;" + tag("h1") + "&gt;Edificio&lt;/" + tag("h1") + "&gt;",
      "&lt;" + tag("img") + " src=\"" + valor("src") + "\"",
      "     alt=\"" + valor("alt") + "\"",
      "     width=\"" + valor("width") + "\" height=\"" + valor("height") + "\"&gt;"
    ];
    pre.innerHTML = lineas.map(function (l) { return "<span class=\"ld-line\">" + l + "</span>"; }).join("");
  }

  /* ---------- Explicación ---------- */
  function forma() {
    var r = val("width") / val("height");
    if (r > FORMA * 1.12) return " Esa medida es más ancha que la foto, así que se ve aplastada.";
    if (r < FORMA * 0.88) return " Esa medida es más angosta que la foto, así que se ve estirada.";
    return "";
  }

  function explicacion() {
    var t = tipo();
    if (t === "roto") {
      return "No existe ningún archivo llamado <code>edificio.jp</code> (le falta la g), así que en lugar de la imagen se muestra el texto de <code>alt</code>: " + esc(val("alt")) + ".";
    }
    var inicio = t === "url"
      ? "Toda imagen en Internet tiene su propio url: <code>src</code> lleva el de esta foto, así que el navegador la descarga de ahí"
      : "<code>src</code> lleva el nombre del archivo, <code>edificio.jpg</code>, que está en la misma carpeta que la página";
    return inicio + " y la dibuja de " + val("width") + " × " + val("height") + " px, como piden <code>width</code> y <code>height</code>." + forma();
  }

  /* ---------- Escena ---------- */
  // Escala de px del código a px de la pared, para que el cuadro más grande quepa
  function escala() {
    var ancho = pared.clientWidth;
    if (celular.matches) return Math.max(0.3, Math.min(0.5, (ancho - 110) / 300));
    return Math.max(0.35, Math.min(0.78, (ancho - 320) / 300));
  }

  function pintarEscena() {
    var k = escala();
    var w = Math.round(val("width") * k), h = Math.round(val("height") * k);
    var t = tipo();
    hueco.style.width = w + "px";
    hueco.style.height = h + "px";
    cintaW.style.width = w + "px";
    cintaH.style.height = h + "px";
    cintaW.firstElementChild.textContent = val("width") + " px";
    cintaH.firstElementChild.textContent = val("height") + " px";
    hueco.classList.toggle("is-roto", t === "roto");
    altTxt.textContent = val("alt");
    cartela.innerHTML = t === "roto"
      ? "<strong>Obra no encontrada</strong>Se buscó <code>edificio.jp</code><br><span class=\"galeria__falta\">No hay ningún archivo con ese nombre.</span>"
      : "<strong>Edificio</strong>Fotografía, " + val("width") + " × " + val("height") + " px<br>" +
        (t === "url" ? "Llegó de Internet:<br><code>unsplash.com</code>" : "Llegó de la carpeta:<br><code>edificio.jpg</code>");
  }

  function colgar() {
    if (reduce) return;
    obra.classList.remove("is-colgando");
    void obra.offsetWidth;
    obra.classList.add("is-colgando");
  }

  /* ---------- Valores del código: el menú de vidrio ---------- */
  function abrir(b) {
    var k = b.getAttribute("data-k");
    MenuVidrio.abrir(b, {
      dentro: root,
      opciones: MenuVidrio.valores(OPCIONES[k], val(k)),
      alElegir: function (i) { cambiar(k, i); }
    });
  }

  pre.addEventListener("click", function (e) {
    var b = e.target.closest("[data-k]");
    if (b) abrir(b);
  });

  pre.addEventListener("keydown", function (e) {
    var b = e.target.closest(".galeria__largo");
    if (b && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); abrir(b); }
  });

  function cambiar(k, i) {
    if (estado[k] === i) return;
    estado[k] = i;
    pintarCodigo();
    pintarEscena();
    if (k === "src") colgar();
    var b = pre.querySelector("[data-k=\"" + k + "\"]");
    if (b) b.focus({ preventScroll: true });
    GraficoFicha.cambiar(exp, explicacion());
  }

  hueco.querySelector("img").addEventListener("dragstart", function (e) { e.preventDefault(); });

  var tRes;
  window.addEventListener("resize", function () {
    clearTimeout(tRes);
    tRes = setTimeout(pintarEscena, 120);
  });

  pintarCodigo();
  pintarEscena();
  GraficoFicha.cambiar(exp, explicacion());
})();
