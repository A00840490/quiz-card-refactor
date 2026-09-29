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
        render(i);
      });
      if (dotsBox) dotsBox.appendChild(dot);
      return dot;
    });

    function fitHeight() {
      if (!autoHeight || !track) return;
      track.style.minHeight = slides[index].offsetHeight + "px";
    }

    function render(next) {
      index = (next + slides.length) % slides.length;
      var prev = (index - 1 + slides.length) % slides.length;
      var after = (index + 1) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.remove("is-current", "is-prev", "is-next");
        if (i === index) slide.classList.add("is-current");
        else if (i === prev) slide.classList.add("is-prev");
        else if (i === after) slide.classList.add("is-next");
        slide.setAttribute("aria-hidden", i === index ? "false" : "true");
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
      fitHeight();
    }

    var prevBtn = carousel.querySelector("[data-demo-prev]");
    var nextBtn = carousel.querySelector("[data-demo-next]");
    if (prevBtn) prevBtn.addEventListener("click", function () { render(index - 1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { render(index + 1); });

    carousel.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") render(index - 1);
      if (e.key === "ArrowRight") render(index + 1);
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
