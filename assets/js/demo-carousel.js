/* Carrusel de cartas: cilindro de vidrio (demo-carousel.css), lo cargan
   curso.js y curso.css. Lo usan el 1-4 y el 5-3.
   Marcado:
     <div class="demo-carousel" data-demo-carousel [data-demo-label="Paso"]>
       <div class="demo-carousel__controls">
         <button data-demo-prev>‹</button>
         <div class="demo-carousel__dots" data-demo-dots></div>
         <button data-demo-next>›</button>
       </div>
       <div class="demo-carousel__viewport">
         <div class="demo-carousel__track">
           <div class="demo-carousel__slide" data-demo-slide>…</div>
         </div>
       </div>
     </div>
   Los controles van arriba de las cartas (estándar del curso).
   Las cartas forman un cilindro que gira: la del frente nítida, las de los
   lados de perfil y difuminadas, las de atrás vistas por detrás. También se
   cambia con clic en una carta de los lados, arrastrando (mouse o dedo) y
   con las flechas del teclado. Todas las cartas miden lo que la más alta.
   (data-demo-autoheight ya no hace falta; se deja en el marcado sin efecto.) */
(function () {
  "use strict";

  var reduce = window.Curso ? Curso.reduce : !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  // distancia con signo de i a pos dando la vuelta: en [-n/2, n/2)
  function wrapDelta(x, n) { return (((x % n) + n * 1.5) % n) - n / 2; }
  function wrapIdx(i, n) { return ((i % n) + n) % n; }

  document.querySelectorAll("[data-demo-carousel]").forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-demo-slide]"));
    var n = slides.length;
    if (!n) return;
    var viewport = carousel.querySelector(".demo-carousel__viewport");
    var track = carousel.querySelector(".demo-carousel__track");
    var dotsBox = carousel.querySelector("[data-demo-dots]");
    var label = carousel.getAttribute("data-demo-label") || "Ejemplo";

    var pos = 0, target = 0, vel = 0, frame = 0, last = 0;
    var dragging = false, visible = true, shown = -1;
    var w = 460, h = 400, sw = 800;

    // auroras de fondo
    var aurora = document.createElement("div");
    aurora.className = "demo-carousel__aurora";
    aurora.setAttribute("aria-hidden", "true");
    aurora.innerHTML = "<i></i><i></i><i></i><i></i>";
    viewport.insertBefore(aurora, viewport.firstChild);
    viewport.setAttribute("tabindex", "0");
    viewport.setAttribute("role", "region");
    viewport.setAttribute("aria-roledescription", "carrusel");
    viewport.setAttribute("aria-label", carousel.getAttribute("aria-label") || "Tutorial");

    slides.forEach(function (slide, i) {
      slide.setAttribute("role", "group");
      slide.setAttribute("aria-label", label + " " + (i + 1) + " de " + n);
    });

    var dots = slides.map(function (_, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "demo-carousel__dot";
      dot.setAttribute("aria-label", label + " " + (i + 1));
      dot.addEventListener("click", function () {
        var cur = Math.round(target);
        go(cur + Math.round(wrapDelta(i - cur, n)));
      });
      if (dotsBox) dotsBox.appendChild(dot);
      return dot;
    });

    /* ---------- medidas ---------- */

    // Captura vertical (5-3) → carta angosta; horizontal (1-4) → más ancha.
    function vertical() {
      var img = slides[0].querySelector("img");
      return !!(img && img.naturalWidth && img.naturalHeight > img.naturalWidth);
    }

    function measure() {
      sw = viewport.clientWidth || 800;
      var m = sw < 576;
      w = vertical() ? Math.min(300, sw * (m ? 0.68 : 0.6)) : Math.min(460, sw * (m ? 0.76 : 0.68));
      w = Math.round(w / 2) * 2;
      var heads = [], bodies = [];
      slides.forEach(function (s) {
        s.style.width = w + "px";
        s.style.height = "";
        var head = s.querySelector(".tutorial-slide-header");
        var body = s.querySelector(".tutorial-slide-body");
        if (head) { head.style.minHeight = ""; heads.push(head); }
        if (body) { body.style.flex = "none"; bodies.push(body); }
      });
      var hh = 0, tallest = 0;
      heads.forEach(function (el) { hh = Math.max(hh, el.offsetHeight); });
      // con el texto igualado, todas miden lo que la más alta
      heads.forEach(function (el) { el.style.minHeight = hh + "px"; });
      slides.forEach(function (s) { tallest = Math.max(tallest, s.offsetHeight); });
      bodies.forEach(function (el) { el.style.flex = ""; });
      h = Math.round(tallest / 2) * 2;
      slides.forEach(function (s) { s.style.height = h + "px"; });
      track.style.minHeight = h + 70 + "px";
    }

    /* ---------- acomodo en el cilindro ---------- */

    function layout(d) {
      // ángulo entre cartas: la vuelta completa si caben; si son muchas
      // (12 en el 1-4), 50° y las que quedan atrás se ocultan
      var step = Math.max((2 * Math.PI) / n, (50 * Math.PI) / 180);
      var th = d * step;
      var cos = Math.cos(th), sin = Math.sin(th);
      var rx = Math.min(sw * 0.4, w * 1.25);
      var rz = Math.max(rx * 0.95, w * 0.9);
      var k = (1 - cos) / 2; // 0 al frente, 1 atrás
      var op = 1 - k * 0.42;
      if (n * step < 2 * Math.PI - 0.01) op *= clamp((Math.PI - Math.abs(th)) / (Math.PI * 0.18), 0, 1);
      return {
        x: sin * rx, y: -k * h * 0.05, z: (cos - 1) * rz, ry: (th * 180) / Math.PI,
        blur: k * 9, sat: 1 - k * 0.45, op: op, zi: Math.round(1000 + cos * 500)
      };
    }

    function paint() {
      var front = wrapIdx(Math.round(pos), n);
      slides.forEach(function (slide, i) {
        var d = wrapDelta(i - pos, n);
        var L = layout(d);
        slide.style.transform =
          "translate(-50%, -50%) translate3d(" + L.x.toFixed(1) + "px," + L.y.toFixed(1) + "px," + L.z.toFixed(1) + "px)" +
          (Math.abs(L.ry) > 0.01 ? " rotateY(" + L.ry.toFixed(2) + "deg)" : "");
        slide.style.filter = L.blur > 0.05 || L.sat < 0.99 ? "blur(" + L.blur.toFixed(2) + "px) saturate(" + L.sat.toFixed(3) + ")" : "none";
        slide.style.opacity = L.op.toFixed(3);
        slide.style.visibility = L.op < 0.01 ? "hidden" : "visible";
        slide.style.zIndex = L.zi;
      });
      if (front !== shown) {
        shown = front;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-current", i === front);
          slide.setAttribute("aria-hidden", i === front ? "false" : "true");
        });
        dots.forEach(function (dot, i) { dot.classList.toggle("is-active", i === front); });
      }
    }

    /* ---------- movimiento: resorte hacia la carta elegida ---------- */

    function animate() {
      if (frame || !visible) return;
      last = 0;
      frame = requestAnimationFrame(function tick(ts) {
        frame = 0;
        var dt = last ? Math.min(0.05, (ts - last) / 1000) : 1 / 60;
        last = ts;
        if (!dragging) {
          var k = 100, damp = 2 * Math.sqrt(k);
          var f = target - pos;
          vel += (f * k - vel * damp) * dt;
          pos += vel * dt;
          if (Math.abs(f) < 0.0005 && Math.abs(vel) < 0.003) { pos = target; vel = 0; }
        }
        paint();
        if ((pos !== target || dragging) && visible) frame = requestAnimationFrame(tick);
      });
    }

    function go(t) {
      target = t;
      if (reduce) { pos = t; vel = 0; paint(); return; }
      animate();
    }

    var prevBtn = carousel.querySelector("[data-demo-prev]");
    var nextBtn = carousel.querySelector("[data-demo-next]");
    if (prevBtn) prevBtn.addEventListener("click", function () { go(Math.round(target) - 1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { go(Math.round(target) + 1); });

    carousel.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); go(Math.round(target) - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); go(Math.round(target) + 1); }
    });

    /* ---------- arrastrar y clic en una carta de los lados ---------- */

    (function () {
      var id = null, x0 = 0, y0 = 0, p0 = 0, moved = false, hist = [];
      function perCard() { return w * 0.7; }
      viewport.addEventListener("pointerdown", function (e) {
        if (e.button !== 0) return;
        id = e.pointerId; x0 = e.clientX; y0 = e.clientY; p0 = pos; moved = false;
        hist = [[e.timeStamp, e.clientX]];
      });
      viewport.addEventListener("pointermove", function (e) {
        if (e.pointerId !== id) return;
        var dx = e.clientX - x0;
        if (!moved && Math.abs(dx) > 7 && Math.abs(dx) > Math.abs(e.clientY - y0)) {
          moved = true; dragging = true;
          try { viewport.setPointerCapture(id); } catch (er) {}
        }
        if (!moved) return;
        pos = p0 - dx / perCard();
        hist.push([e.timeStamp, e.clientX]);
        if (hist.length > 6) hist.shift();
        if (reduce) paint(); else animate();
      });
      viewport.addEventListener("pointerup", function (e) {
        if (e.pointerId !== id) return;
        id = null;
        if (moved) {
          var a = hist[0], b = hist[hist.length - 1];
          var v = b[0] > a[0] ? (-(b[1] - a[1]) / (b[0] - a[0])) * 1000 / perCard() : 0;
          dragging = false;
          vel = clamp(v, -12, 12);
          go(Math.round(pos + clamp(v * 0.12, -2, 2)));
          return;
        }
        var slide = e.target.closest && e.target.closest("[data-demo-slide]");
        if (!slide) return;
        var cur = Math.round(target);
        var dd = Math.round(wrapDelta(slides.indexOf(slide) - cur, n));
        if (dd) go(cur + dd);
      });
      viewport.addEventListener("pointercancel", function (e) {
        if (e.pointerId !== id) return;
        id = null;
        if (moved) { dragging = false; go(Math.round(pos)); }
      });
    })();

    /* ---------- arranque ---------- */

    function refit() { measure(); paint(); }

    slides.forEach(function (slide) {
      slide.querySelectorAll("img").forEach(function (img) {
        img.setAttribute("draggable", "false");
        if (!img.complete) img.addEventListener("load", refit);
      });
    });
    // Se espera a que termine el cambio de tamaño (y las transiciones del
    // menú lateral) antes de medir; si no, se queda con una altura vieja.
    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(refit, 350);
    });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        visible = es[0].isIntersecting;
        if (visible && pos !== target) animate();
        if (!visible && frame) { cancelAnimationFrame(frame); frame = 0; pos = target; vel = 0; paint(); }
      }, { rootMargin: "120px" }).observe(carousel);
    }

    refit();
  });
})();
