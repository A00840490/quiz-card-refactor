/* Ficha de renglones (.grafico-ficha en app.css).

   GraficoFicha.cambiar(el, html) cambia la explicación con el desvanecido
   estándar (ver abajo). Se carga antes del script del gráfico.

   Además, la ficha cambia de alto según el largo de la explicación, y con
   ella la fila del gráfico y la ventana de código. Para que el texto de la
   página que está debajo no brinque a su nuevo lugar, la fila pasa de su alto
   anterior al nuevo con una transición; al terminar vuelve a su alto natural.
   Si cambia el ancho (la ventana del navegador cambió de tamaño) se acomoda
   sin transición. */
(function () {
  "use strict";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* La explicación cambia con desvanecido: la ficha baja y se desvanece, y la
     nueva sube desde abajo (.is-fading en app.css). El primer texto entra sin
     esperar, pero igual sube desde abajo.
       GraficoFicha.cambiar(el, html)
       GraficoFicha.cambiar(el, html, { inmediato: true })  sin animación
       GraficoFicha.cambiar(el, html, { entrar: true })     sube desde abajo sin
                                                           desvanecer el texto anterior */
  window.GraficoFicha = {
    cambiar: function (el, html, op) {
      op = op || {};
      if (html === el._html && !op.entrar) return;
      el._html = html;
      clearTimeout(el._t);
      if (reduce || op.inmediato || !html) {
        el.classList.remove("is-fading");
        el.innerHTML = html;
        return;
      }
      if (op.entrar || !el.innerHTML) {
        el.classList.add("is-fading");
        void el.offsetWidth;
        el.innerHTML = html;
        el.classList.remove("is-fading");
        return;
      }
      el.classList.add("is-fading");
      el._t = setTimeout(function () {
        el.innerHTML = html;
        el.classList.remove("is-fading");
      }, 200);
    }
  };

  if (!window.ResizeObserver || reduce) return;

  Array.prototype.forEach.call(document.querySelectorAll(".grafico-ficha-col"), function (col) {
    var fila = col.parentElement; // la fila con el gráfico y la ventana de código
    var ancho = col.getBoundingClientRect().width;
    var alto = fila.getBoundingClientRect().height; // el último alto natural de la fila

    // mientras la fila tiene un alto fijo, sus renglones no se estiran
    fila.style.alignContent = "start";

    fila.addEventListener("transitionend", function (e) {
      if (e.target === fila && e.propertyName === "height") fila.style.height = "";
    });

    var primero = true;
    var ro = new ResizeObserver(function () {
      // El primer aviso llega al empezar a observar: solo toma la medida, así no
      // importa si el gráfico llena su ficha antes o después de cargar este archivo
      if (primero) {
        primero = false;
        fila.style.height = "";
        alto = fila.getBoundingClientRect().height;
        ancho = col.getBoundingClientRect().width;
        return;
      }
      // Cuando esto corre la fila ya tomó su alto nuevo; el de antes es el que
      // guardamos (o, a media transición, el alto de ese momento)
      var actual = fila.style.height ? fila.getBoundingClientRect().height : alto;
      var w = col.getBoundingClientRect().width;
      fila.style.transition = "none";
      fila.style.height = "";
      var nuevo = alto = fila.getBoundingClientRect().height;

      if (w !== ancho || Math.abs(nuevo - actual) < 1) {
        ancho = w;
        return;
      }
      fila.style.height = actual + "px";
      void fila.offsetHeight;
      fila.style.transition = "height .35s ease";
      fila.style.height = nuevo + "px";
    });
    // la ficha cambia el alto de su columna, pero el gráfico de al lado también puede cambiar
    Array.prototype.forEach.call(fila.children, function (hijo) { ro.observe(hijo); });
  });
})();
