/* Módulo 4-2: el botón Ejecutar muestra el aviso del alert() dentro de la
   vista previa, en lugar de una ventana del navegador que bloquea la página. */
(function () {
  "use strict";

  document.querySelectorAll("[data-js-run]").forEach(function (run) {
    var button = run.querySelector("[data-js-exec]");
    var alertBox = run.querySelector("[data-js-alert]");
    var ok = run.querySelector("[data-js-ok]");

    button.addEventListener("click", function () {
      alertBox.hidden = false;
      ok.focus();
    });

    function close() {
      alertBox.hidden = true;
      button.focus();
    }

    ok.addEventListener("click", close);
    alertBox.addEventListener("keydown", function (e) {
      if (e.key === "Escape" || e.key === "Enter") {
        e.preventDefault();
        close();
      }
    });
  });
})();
