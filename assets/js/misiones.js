/* Misiones del módulo (primera página de cada módulo): convierte cada <li> de
   .misiones__lista en una misión por descubrir. Al hacer clic, el "?" gira y
   muestra la bandera, el texto se aclara y la fila queda "Por conquistar".
   Estilos en misiones.css. Solo actúa si la página trae [data-misiones]. */
(function () {
  var reduce = window.Curso ? Curso.reduce : false;

  var BANDERA =
    '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M6 21V4" stroke="#fff" stroke-width="2.2"/>' +
    '<path d="M6 4.5c3-1.6 5.2 1.4 8.2 0 1.6-.7 2.8-.6 3.8 0v8.2c-1-.6-2.2-.7-3.8 0-3 1.4-5.2-1.6-8.2 0z" fill="#f5d77a" stroke="#f5d77a" stroke-width="1.2"/>' +
    "</svg>";

  function chispas(fila) {
    var emb = fila.querySelector(".mision__emblema");
    var fr = fila.getBoundingClientRect();
    var er = emb.getBoundingClientRect();
    var cx = er.left - fr.left + er.width / 2;
    var cy = er.top - fr.top + er.height / 2;
    for (var i = 0; i < 12; i++) {
      var s = document.createElement("span");
      var a = (i / 12) * Math.PI * 2;
      var d = 30 + Math.random() * 18;
      s.className = "mision__chispa";
      s.style.left = cx - 3 + "px";
      s.style.top = cy - 3 + "px";
      s.style.setProperty("--dx", Math.cos(a) * d + "px");
      s.style.setProperty("--dy", Math.sin(a) * d + "px");
      s.style.animationDelay = 0.4 + Math.random() * 0.1 + "s";
      fila.appendChild(s);
      s.addEventListener("animationend", function () {
        if (this.parentNode) this.parentNode.removeChild(this);
      });
    }
  }

  function armar(raiz) {
    raiz.classList.add("is-lista");
    var items = raiz.querySelectorAll(".misiones__lista > li");
    Array.prototype.forEach.call(items, function (li, i) {
      var html = li.innerHTML.trim();
      var n = i + 1;
      li.innerHTML =
        '<button type="button" class="mision" aria-label="Misión ' + n + ': descubrir">' +
        '<span class="mision__emblema" aria-hidden="true"><span class="mision__giro">' +
        '<span class="mision__cara mision__cara--pregunta" style="--mis-retraso:' + (i * 0.35).toFixed(2) + 's">?</span>' +
        '<span class="mision__cara mision__cara--meta">' + BANDERA + "</span>" +
        "</span></span>" +
        '<span class="mision__cuerpo"><span class="mision__num">Misión ' + n + "</span>" +
        '<span class="mision__texto" aria-hidden="true">' + html + "</span></span>" +
        '<span class="mision__estado" aria-hidden="true">Por descubrir</span>' +
        "</button>";

      var fila = li.firstChild;
      fila.addEventListener("click", function () {
        if (fila.classList.contains("is-abierta")) return;
        var texto = fila.querySelector(".mision__texto");
        fila.classList.add("is-abierta", "is-brilla");
        texto.removeAttribute("aria-hidden");
        fila.setAttribute("aria-label", "Misión " + n + ": " + texto.textContent.replace(/\s+/g, " ").trim());
        setTimeout(function () {
          fila.querySelector(".mision__estado").textContent = "Por conquistar";
        }, reduce ? 0 : 400);
        if (!reduce) chispas(fila);
      });
    });
  }

  function iniciar() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-misiones]"), armar);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
