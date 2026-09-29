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

    function fitHeight() {
      if (!autoHeight || !track) return;
      track.style.minHeight = slides[index].offsetHeight + "px";
    }

    var behind = -1;

    // Coloca una diapositiva en su punto de partida sin animación.
    function placeInstantly(slide, cls) {
      slide.classList.add("no-anim");
      slide.classList.remove("is-current", "is-behind", "is-gone");
      if (cls) slide.classList.add(cls);
      void slide.offsetWidth; // aplica la posición antes de animar
      slide.classList.remove("no-anim");
    }

    // Avanza (dir = 1) o retrocede (dir = -1): la nueva se sobrepone,
    // la actual pasa a segundo plano y la que estaba atrás sale por su lado.
    function render(next, dir) {
      next = (next + slides.length) % slides.length;
      if (next === index && behind !== -1) return;
      dir = dir || (next > index ? 1 : -1);
      carousel.setAttribute("data-dir", dir > 0 ? "fwd" : "back");

      var first = behind === -1 && slides[index].classList.contains("is-current") === false;
      var oldCurrent = index;
      var oldBehind = behind;
      index = next;

      slides.forEach(function (slide, i) {
        if (i === index) {
          if (!first) placeInstantly(slide, null); // entra desde su lado
          slide.classList.remove("is-behind", "is-gone");
          slide.classList.add("is-current");
        } else if (!first && i === oldCurrent) {
          slide.classList.remove("is-current", "is-gone");
          slide.classList.add("is-behind");
        } else if (i === oldBehind) {
          slide.classList.remove("is-current", "is-behind");
          slide.classList.add("is-gone");
        } else if (!slide.classList.contains("is-gone")) {
          slide.classList.remove("is-current", "is-behind");
        }
        slide.setAttribute("aria-hidden", i === index ? "false" : "true");
      });
      behind = first ? -1 : oldCurrent;

      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
      fitHeight();
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
  });
})();
