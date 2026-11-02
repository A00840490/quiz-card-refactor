/* 2-10 Recursos de imágenes gratuitas: tarjetas en abanico.
   Las tarjetas forman un anillo visto desde arriba: la activa va al
   frente (centro, abajo), sus vecinas a los lados un poco más arriba, las
   siguientes más afuera y más arriba, y la opuesta hasta atrás, arriba al
   centro. Las de atrás se ven más chicas y difuminadas. Un clic en una
   tarjeta (o las flechas del teclado, o deslizar en celular) gira el
   abanico de un lugar en uno hasta traerla al frente. */
(function () {
  "use strict";

  var reduce = window.Curso ? Curso.reduce : false;

  // Lugar en el anillo según la distancia a la tarjeta activa.
  // x: fracción del corrimiento máximo; y: fracción del alto de la tarjeta.
  var LUGARES = {
    0: { x: 0, y: 0, s: 1, blur: 0, z: 10 },
    1: { x: 0.8, y: -0.15, s: 0.91, blur: 2.5, z: 8 },
    2: { x: 1, y: -0.33, s: 0.83, blur: 4, z: 6 },
    3: { x: 0, y: -0.47, s: 0.76, blur: 5, z: 4 },
  };
  var PASO_MS = 190;

  function iniciar(raiz) {
    var mesa = raiz.querySelector("[data-mesa]");
    var cartas = Array.prototype.slice.call(raiz.querySelectorAll("[data-carta]"));
    var n = cartas.length;
    if (!n) return;

    var activa = 0;
    var meta = 0;
    var timer = null;
    var medidas = { w: 260, h: 380, xMax: 220, top: 0 };

    cartas.forEach(function (carta, i) {
      var nombre = carta.querySelector(".abanico__nombre");
      carta.dataset.nombre = nombre ? nombre.textContent.trim() : "";
      carta.addEventListener("click", function () {
        if (i !== activa || i !== meta) irA(i);
      });
      carta.addEventListener("keydown", function (e) {
        if ((e.key === "Enter" || e.key === " ") && e.target === carta && i !== activa) {
          e.preventDefault();
          irA(i);
        }
      });
    });

    // Distancia con signo de la carta i a la activa, de -(n/2 - 1) a n/2.
    function distancia(i) {
      var d = (((i - activa) % n) + n) % n;
      if (d > n / 2) d -= n;
      return d;
    }

    function medir() {
      var ancho = mesa.clientWidth;
      var w = Math.round(Math.min(260, Math.max(170, ancho * 0.58)));
      raiz.classList.add("sin-animar");
      mesa.style.setProperty("--w", w + "px");
      mesa.style.setProperty("--h", "auto");
      var h = 0;
      cartas.forEach(function (c) {
        h = Math.max(h, c.offsetHeight);
      });
      mesa.style.setProperty("--h", h + "px");

      // Las tarjetas del lado (escala de la posición 2) no salen de la mesa.
      var lado = LUGARES[2];
      var xMax = Math.min(w * 0.88, ancho / 2 - (w * lado.s) / 2 - 2);
      xMax = Math.max(xMax, w * 0.18);

      // Lo que sobresale arriba la tarjeta más alta (la de atrás).
      var atras = LUGARES[3];
      var sobra = Math.ceil(-atras.y * h - ((1 - atras.s) * h) / 2);
      medidas = { w: w, h: h, xMax: xMax, top: sobra + 6 };
      mesa.style.setProperty("--top", medidas.top + "px");
      mesa.style.height = medidas.top + h + 30 + "px";

      pintar();
      void mesa.offsetWidth;
      raiz.classList.remove("sin-animar");
    }

    function pintar() {
      cartas.forEach(function (carta, i) {
        var d = distancia(i);
        var lugar = LUGARES[Math.min(Math.abs(d), 3)];
        var lado = d < 0 ? -1 : 1;
        var x = lado * lugar.x * medidas.xMax;
        var y = lugar.y * medidas.h;
        carta.style.transform =
          "translate(" + x.toFixed(1) + "px, " + y.toFixed(1) + "px) scale(" + lugar.s + ")";
        carta.style.filter = lugar.blur ? "blur(" + lugar.blur + "px) saturate(0.85)" : "none";
        carta.style.zIndex = lugar.z;

        var esActiva = d === 0;
        carta.classList.toggle("is-activa", esActiva);
        if (esActiva) {
          carta.removeAttribute("role");
          carta.removeAttribute("tabindex");
          carta.removeAttribute("aria-label");
        } else {
          carta.setAttribute("role", "button");
          carta.setAttribute("tabindex", "0");
          carta.setAttribute("aria-label", "Traer al frente: " + carta.dataset.nombre);
        }
        var enlace = carta.querySelector(".abanico__ir a");
        if (enlace) enlace.tabIndex = esActiva ? 0 : -1;
      });
    }

    // Gira el abanico un lugar a la vez hasta que la carta i quede al frente.
    function irA(i) {
      meta = ((i % n) + n) % n;
      if (reduce) {
        activa = meta;
        pintar();
        return;
      }
      if (!timer) avanzar();
    }

    function avanzar() {
      if (activa === meta) {
        timer = null;
        return;
      }
      var d = distancia(meta);
      activa = (activa + (d > 0 ? 1 : -1) + n) % n;
      pintar();
      timer = setTimeout(avanzar, PASO_MS);
    }

    function mover(paso) {
      irA((meta === activa ? activa : meta) + paso);
    }

    // Flechas del teclado mientras el foco está en el abanico.
    raiz.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        mover(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        mover(-1);
      } else {
        return;
      }
      setTimeout(function () {
        var c = cartas[meta];
        var enlace = c.querySelector(".abanico__ir a");
        (enlace || c).focus({ preventScroll: true });
      }, 0);
    });

    // Deslizar con el dedo en celular.
    var inicioX = null;
    var inicioY = null;
    mesa.addEventListener(
      "touchstart",
      function (e) {
        inicioX = e.touches[0].clientX;
        inicioY = e.touches[0].clientY;
      },
      { passive: true }
    );
    mesa.addEventListener(
      "touchend",
      function (e) {
        if (inicioX === null) return;
        var dx = e.changedTouches[0].clientX - inicioX;
        var dy = e.changedTouches[0].clientY - inicioY;
        inicioX = null;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3) mover(dx < 0 ? 1 : -1);
      },
      { passive: true }
    );

    var espera = null;
    window.addEventListener("resize", function () {
      clearTimeout(espera);
      espera = setTimeout(medir, 120);
    });
    window.addEventListener("load", medir);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(medir);
    medir();
  }

  function arrancar() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-abanico]"), iniciar);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", arrancar);
  } else {
    arrancar();
  }
})();
