/* Ficha de renglones (.grafico-ficha en app.css): la ficha cambia de alto
   según el largo de la explicación, y con ella la fila del gráfico y la
   ventana de código. Para que el texto de la página que está debajo no
   brinque a su nuevo lugar, la fila pasa de su alto anterior al nuevo con una
   transición; al terminar vuelve a su alto natural. Si cambia el ancho (la
   ventana del navegador cambió de tamaño) se acomoda sin transición. */
(function () {
  "use strict";

  if (!window.ResizeObserver) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  Array.prototype.forEach.call(document.querySelectorAll(".grafico-ficha-col"), function (col) {
    var fila = col.parentElement; // la fila con el gráfico y la ventana de código
    var ancho = col.getBoundingClientRect().width;
    var alto = fila.getBoundingClientRect().height; // el último alto natural de la fila

    // mientras la fila tiene un alto fijo, sus renglones no se estiran
    fila.style.alignContent = "start";

    fila.addEventListener("transitionend", function (e) {
      if (e.target === fila && e.propertyName === "height") fila.style.height = "";
    });

    var ro = new ResizeObserver(function () {
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
