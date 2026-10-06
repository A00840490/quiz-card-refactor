/* Carrusel de propiedades de texto (modulo3-17).
   Un clic o toque en cualquier parte del escenario alterna el carrusel: si se
   está moviendo se detiene y si está quieto (aunque sea por el :hover) se
   vuelve a mover. Sirve para quien no tiene cursor (celulares y tabletas).
   Al sacar el cursor del escenario, el :hover vuelve a funcionar normal. */
(function () {
  "use strict";

  document.querySelectorAll(".text-carousel-stage").forEach(function (stage) {
    var carousel = stage.querySelector(".text-carousel");
    if (!carousel) return;

    stage.addEventListener("click", function () {
      var moving = getComputedStyle(carousel).animationPlayState === "running";
      stage.classList.toggle("is-paused", moving);
      stage.classList.toggle("is-playing", !moving);
      // Al tocar una tarjeta esta recibe el foco; se suelta al reanudar.
      if (!moving && stage.contains(document.activeElement)) {
        document.activeElement.blur();
      }
    });

    // "Reanudar con clic" solo dura mientras el cursor siga encima.
    stage.addEventListener("mouseleave", function () {
      stage.classList.remove("is-playing");
    });
  });
})();
