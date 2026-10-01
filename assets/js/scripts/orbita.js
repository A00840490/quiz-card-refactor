/* Carrusel en órbita (componente compartido: módulos 1-2 y 5-5)
   Estilos en assets/css/orbita.css. Funciona con cualquier número de .orbita-item.
   - Clic en un elemento lateral: la órbita gira por el camino corto hasta centrarlo.
   - Clic en el elemento central: abre su modal de Bootstrap (data-target).
   - Flechas ← → del teclado: giran la órbita. */
document.querySelectorAll('.orbita').forEach(function (orbita) {
  var items = Array.prototype.slice.call(orbita.querySelectorAll('.orbita-item'));
  var n = items.length;
  var paso = -360 / n;   // negativo: el siguiente elemento aparece a la derecha
  var giro = 0;          // rotación acumulada de toda la órbita
  var activo = 0;        // índice del elemento centrado

  // Lleva un ángulo al rango (-180, 180] para girar siempre por el camino corto
  function normalizar(a) { return ((a % 360) + 540) % 360 - 180; }

  function pintar() {
    items.forEach(function (item, i) {
      item.style.setProperty('--ang', (i * paso + giro) + 'deg');
      var esActivo = i === activo;
      item.classList.toggle('es-activo', esActivo);
      item.setAttribute('aria-current', esActivo ? 'true' : 'false');
      item.tabIndex = esActivo ? 0 : -1;
    });
  }

  function irA(i) {
    giro -= normalizar(i * paso + giro);
    activo = i;
    pintar();
  }

  items.forEach(function (item, i) {
    item.addEventListener('click', function () {
      if (i === activo) {
        if (window.jQuery) jQuery(item.getAttribute('data-target')).modal('show');
      } else {
        irA(i);
      }
    });
  });

  // Flechas del teclado para girar
  orbita.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    irA(e.key === 'ArrowRight' ? (activo + 1) % n : (activo - 1 + n) % n);
    items[activo].focus();
  });

  pintar();
  // Activa las transiciones después de la primera colocación
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { orbita.classList.add('lista'); });
  });
});
