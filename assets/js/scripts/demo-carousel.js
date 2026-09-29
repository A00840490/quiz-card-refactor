/* Carrusel de demostraciones (modulo2-9, modulo1-4).
   Marcado:
     <div class="demo-carousel" data-demo-carousel [data-demo-autoheight]>
       <div class="demo-carousel__viewport">
         <div class="demo-carousel__track">
           <div class="demo-carousel__slide" data-demo-slide>…</div>
         </div>
       </div>
       <div class="demo-carousel__controls">
         <button data-demo-prev>‹</button>
         <div class="demo-carousel__dots" data-demo-dots></div>
         <button data-demo-next>›</button>
       </div>
     </div>
   Con data-demo-autoheight, la altura del carrusel se ajusta a la
   diapositiva actual (útil cuando cada una mide distinto). */
(function () {
  "use strict";

  document.querySelectorAll("[data-demo-carousel]").forEach(function (carousel) {
    var slides = Array.prototype.slice.call(
      carousel.querySelectorAll("[data-demo-slide]")
    );
    if (!slides.length) return;
    var dotsBox = carousel.querySelector("[data-demo-dots]");
    var track = carousel.querySelector(".demo-carousel__track");
    var autoHeight = carousel.hasAttribute("data-demo-autoheight");
    var label = carousel.getAttribute("data-demo-label") || "Ejemplo";
    var index = 0;

    var dots = slides.map(function (_, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "demo-carousel__dot";
      dot.setAttribute("aria-label", label + " " + (i + 1));
      dot.addEventListener("click", function () {
        if (i !== index) render(i, i > index ? 1 : -1);
      });
      if (dotsBox) dotsBox.appendChild(dot);
      return dot;
    });

    // Altura fija: la de la diapositiva más alta, para que los controles
    // no se muevan al cambiar de diapositiva.
    function fitHeight() {
      if (!autoHeight || !track) return;
      var tallest = 0;
      slides.forEach(function (slide) {
        tallest = Math.max(tallest, slide.offsetHeight);
      });
      track.style.minHeight = tallest + "px";
    }

    var n = slides.length;
    var behind = -1;
    function wrap(i) {
      return (i + n) % n;
    }

    // Pone una diapositiva en un estado sin animar el cambio.
    function place(slide, cls) {
      slide.classList.add("no-anim");
      slide.classList.remove("is-current", "is-behind", "is-gone");
      if (cls) slide.classList.add(cls);
      void slide.offsetWidth; // aplica la posición antes de animar
      slide.classList.remove("no-anim");
    }

    function setState(slide, cls) {
      slide.classList.remove("is-current", "is-behind", "is-gone");
      if (cls) slide.classList.add(cls);
    }

    /* Avanzar: la nueva entra por la derecha y se sobrepone; la actual pasa
       atrás (difuminada, a la izquierda) y la que estaba atrás sale por la
       izquierda.
       Retroceder es la misma animación al revés: la actual sale por la
       derecha, la de atrás vuelve al frente y la anterior a ella aparece
       atrás desde la izquierda. */
    function render(next, dir) {
      next = wrap(next);
      var started = slides[index].classList.contains("is-current");
      if (started && next === index) return;

      if (!started) {
        setState(slides[next], "is-current");
        index = next;
      } else if (dir > 0) {
        if (behind !== -1 && behind !== next) setState(slides[behind], "is-gone");
        setState(slides[index], "is-behind");
        place(slides[next], null); // espera a la derecha
        setState(slides[next], "is-current");
        behind = index;
        index = next;
      } else {
        var old = index;
        setState(slides[old], null); // sale por la derecha
        if (next !== behind) {
          if (behind !== -1) setState(slides[behind], "is-gone");
          place(slides[next], "is-gone"); // llega desde la izquierda
        }
        setState(slides[next], "is-current");
        index = next;
        var newBehind = wrap(next - 1);
        if (n > 2 && newBehind !== old) {
          if (!slides[newBehind].classList.contains("is-gone")) place(slides[newBehind], "is-gone");
          setState(slides[newBehind], "is-behind");
          behind = newBehind;
        } else {
          behind = -1;
        }
      }

      slides.forEach(function (slide, i) {
        slide.setAttribute("aria-hidden", i === index ? "false" : "true");
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    var prevBtn = carousel.querySelector("[data-demo-prev]");
    var nextBtn = carousel.querySelector("[data-demo-next]");
    if (prevBtn) prevBtn.addEventListener("click", function () { render(index - 1, -1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { render(index + 1, 1); });

    carousel.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") render(index - 1, -1);
      if (e.key === "ArrowRight") render(index + 1, 1);
    });

    if (autoHeight) {
      slides.forEach(function (slide) {
        slide.querySelectorAll("img").forEach(function (img) {
          if (!img.complete) img.addEventListener("load", fitHeight);
        });
      });
      window.addEventListener("resize", fitHeight);
    }

    render(0);
    fitHeight();
  });
})();
