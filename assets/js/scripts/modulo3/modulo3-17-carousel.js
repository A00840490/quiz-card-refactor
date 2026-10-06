/* Carrusel de propiedades de texto (modulo3-17).
   Un toque o clic en cualquier parte del carrusel lo detiene y otro lo
   reanuda, para quien no tiene cursor (celulares y tabletas). El :hover del
   CSS sigue funcionando aparte. */
(function () {
  "use strict";

  document.querySelectorAll(".text-carousel-stage").forEach(function (stage) {
    stage.addEventListener("click", function () {
      var paused = stage.classList.toggle("is-paused");
      // Al tocar una tarjeta esta recibe el foco; se suelta al reanudar.
      if (!paused && stage.contains(document.activeElement)) {
        document.activeElement.blur();
      }
    });
  });
})();
