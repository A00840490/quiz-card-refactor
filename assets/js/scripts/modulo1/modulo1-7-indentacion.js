/* Módulo 1-7: alterna el ejemplo de HTML entre sin indentación y con
   indentación. Empieza sin indentación (.is-mal) y el estado incorrecto
   dura más que el correcto (4 s contra 3 s, 1 : 0.75). El ciclo arranca
   cuando la ventana entra en pantalla, para que se vea primero el código
   mal indentado, y se detiene mientras no se ve. */
(function () {
  "use strict";

  var root = document.querySelector("[data-indenta]");
  if (!root) return;

  var DURA_MAL = 4000;
  var DURA_BIEN = 3000;
  var timer = null;

  function paso() {
    var mal = !root.classList.contains("is-mal");
    root.classList.toggle("is-mal", mal);
    timer = setTimeout(paso, mal ? DURA_MAL : DURA_BIEN);
  }

  function iniciar() {
    if (timer) return;
    timer = setTimeout(paso, root.classList.contains("is-mal") ? DURA_MAL : DURA_BIEN);
  }

  function detener() {
    clearTimeout(timer);
    timer = null;
  }

  if (!("IntersectionObserver" in window)) {
    iniciar();
    return;
  }

  new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting) iniciar();
    else detener();
  }, { threshold: 0.6 }).observe(root);
})();
