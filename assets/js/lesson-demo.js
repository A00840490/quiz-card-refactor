/* Demo de lección (assets/css/lesson-demo.css): numera las líneas del código.
   Los bloques de código separan sus líneas con <br>; aquí cada línea se
   envuelve en <span class="ld-line"> y el CSS le pone su número a la
   izquierda con un contador. Si una línea es larga y se parte en dos, el
   número queda solo en el primer renglón. */
(function () {
  "use strict";

  var SELECTOR = [
    '.lesson-demo > [class*="col-"]:first-child p.code',
    ".lesson-demo-stack p.code",
    ".lesson-demo-activity--editor p.code",
  ].join(",");

  function isBlank(nodes) {
    return nodes.every(function (n) {
      return n.nodeType === Node.TEXT_NODE && !n.textContent.trim();
    });
  }

  document.querySelectorAll(SELECTOR).forEach(function (code) {
    if (code.classList.contains("code--numbered")) return;

    // Agrupa los nodos de primer nivel en líneas, cortando en cada <br>.
    var lines = [[]];
    Array.prototype.slice.call(code.childNodes).forEach(function (node) {
      if (node.nodeName === "BR") lines.push([]);
      else lines[lines.length - 1].push(node);
    });

    // Quita las líneas vacías del principio y del final (solo espacios del HTML).
    while (lines.length && isBlank(lines[0])) lines.shift();
    while (lines.length && isBlank(lines[lines.length - 1])) lines.pop();
    if (!lines.length) return;

    var frag = document.createDocumentFragment();
    lines.forEach(function (nodes) {
      var line = document.createElement("span");
      line.className = "ld-line";
      nodes.forEach(function (n) {
        line.appendChild(n);
      });
      // Una línea vacía a propósito conserva su altura.
      if (isBlank(nodes)) line.innerHTML = "&nbsp;";
      frag.appendChild(line);
    });

    code.textContent = "";
    code.appendChild(frag);
    code.classList.add("code--numbered");
  });
})();

/* Editor con desplazamiento solo (.lesson-demo--scroll, ver lesson-demo.css).
   Cuando el código lleva 7.5 s en pantalla baja despacio; al llegar al fondo
   espera un momento y regresa arriba igual de despacio, y vuelve a empezar.
   Si el alumno lo mueve (rueda, toque, clic o teclado) se detiene y vuelve a
   esperar los 7.5 s desde donde lo dejó. */
(function () {
  "use strict";

  var ESPERA = 7500; // ms en pantalla antes de empezar a bajar
  var PAUSA_FONDO = 2500; // ms quieto en el fondo antes de subir
  var VELOCIDAD = 30; // px por segundo

  var editores = document.querySelectorAll(
    '.lesson-demo--scroll > [class*="col-"]:first-child .code',
  );
  if (!editores.length) return;

  function iniciar(code) {
    var visible = false;
    var temporizador = null;
    var cuadro = null;
    var pos = 0;

    function limite() {
      return code.scrollHeight - code.clientHeight;
    }

    function detener() {
      clearTimeout(temporizador);
      cancelAnimationFrame(cuadro);
      temporizador = cuadro = null;
    }

    function esperar(ms, siguiente) {
      detener();
      temporizador = setTimeout(function () {
        temporizador = null;
        if (visible) siguiente();
      }, ms);
    }

    function mover(direccion) {
      var antes = null;
      pos = code.scrollTop;
      function paso(ahora) {
        if (antes !== null) {
          pos += (direccion * VELOCIDAD * (ahora - antes)) / 1000;
        }
        antes = ahora;
        var max = limite();
        if (direccion > 0 && pos >= max) {
          code.scrollTop = max;
          esperar(PAUSA_FONDO, function () {
            mover(-1);
          });
          return;
        }
        if (direccion < 0 && pos <= 0) {
          code.scrollTop = 0;
          esperar(ESPERA, function () {
            mover(1);
          });
          return;
        }
        code.scrollTop = pos;
        cuadro = requestAnimationFrame(paso);
      }
      cuadro = requestAnimationFrame(paso);
    }

    function programar() {
      if (limite() <= 1) return;
      esperar(ESPERA, function () {
        mover(code.scrollTop >= limite() - 1 ? -1 : 1);
      });
    }

    ["wheel", "touchstart", "pointerdown", "keydown"].forEach(function (tipo) {
      code.addEventListener(
        tipo,
        function () {
          if (visible) programar();
        },
        { passive: true },
      );
    });

    if (!("IntersectionObserver" in window)) {
      visible = true;
      programar();
      return;
    }

    new IntersectionObserver(
      function (entradas) {
        var ahora = entradas[entradas.length - 1].intersectionRatio >= 0.6;
        if (ahora === visible) return;
        visible = ahora;
        if (visible) programar();
        else detener();
      },
      { threshold: [0, 0.6, 1] },
    ).observe(code);
  }

  // Si la vista previa es más alta que el editor (2-6), el código crece hasta
  // llenar su columna en vez de dejar un hueco oscuro abajo.
  function igualarAltura() {
    Array.prototype.forEach.call(editores, function (code) {
      var fila = code.closest(".lesson-demo");
      var cols = fila.children;
      code.style.maxHeight = "";
      if (cols.length < 2 || cols[0].offsetTop !== cols[1].offsetTop) return;
      fila.style.alignItems = "start";
      var hueco = cols[1].offsetHeight - cols[0].offsetHeight;
      fila.style.alignItems = "";
      if (hueco > 4) code.style.maxHeight = code.offsetHeight + hueco + "px";
    });
  }

  var espera = null;
  window.addEventListener("resize", function () {
    clearTimeout(espera);
    espera = setTimeout(igualarAltura, 150);
  });
  window.addEventListener("load", igualarAltura);
  igualarAltura();

  Array.prototype.forEach.call(editores, iniciar);
})();
