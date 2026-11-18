/* Competencias del módulo (primera página de cada módulo): convierte cada <li>
   de .competencias__lista en una competencia por descubrir. Al hacer clic, el
   "?" gira y muestra el ícono de la competencia (data-icono del <li>), el
   texto se aclara y la fila queda "Por desarrollar".
   Estilos en competencias.css. Solo actúa si la página trae
   [data-competencias]. */
(function () {
  var reduce = window.Curso ? Curso.reduce : false;

  /* Íconos de línea (24 × 24, trazo de 2). Para usar uno, el <li> lleva
     data-icono="nombre"; sin él se toman en orden. */
  var ICONOS = {
    foco: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.3 1.1 2.2h5c0-.9.4-1.6 1.1-2.2A6 6 0 0 0 12 3z"/>',
    capas: '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/>',
    servidor: '<rect x="3" y="3" width="18" height="7" rx="2"/><rect x="3" y="14" width="18" height="7" rx="2"/><path d="M7 6.5h.01M7 17.5h.01"/>',
    herramientas: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    codigo: '<path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/>',
    libro: '<path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z"/>',
    lista: '<path d="M9 6h12M9 12h12M9 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
    ventana: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>',
    pincel: '<path d="M18.4 2.6L14 7l-1.6-1.6a2 2 0 0 0-2.8 0L8 7l9 9 1.6-1.6a2 2 0 0 0 0-2.8L17 10l4.4-4.4a2.1 2.1 0 1 0-3-3z"/><path d="M9 8c-2 3-4 3.5-7 4l8 10c2-1 6-5 6-7"/>',
    dispositivos: '<rect x="2" y="4" width="13" height="10" rx="1.5"/><path d="M6 18h5M8.5 14v4"/><rect x="17" y="8" width="5" height="12" rx="1.2"/>',
    paleta: '<path d="M12 3a9 9 0 0 0 0 18c1 0 1.5-.7 1.5-1.5 0-.4-.2-.8-.4-1.1-.3-.3-.4-.6-.4-1 0-.8.7-1.5 1.5-1.5H16a5 5 0 0 0 5-5c0-4.4-4-7.9-9-7.9z"/><path d="M7.5 11h.01M10 7.2h.01M14.5 7.2h.01"/>',
    mover: '<path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20"/>',
    terminal: '<path d="M4 17l6-6-6-6M12 19h8"/>',
    llaves: '<path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5a2 2 0 0 0 2 2h1M16 21h1a2 2 0 0 0 2-2v-5a2 2 0 0 1 2-2 2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1"/>',
    arreglo: '<path d="M7 4H4v16h3M17 4h3v16h-3M8.5 12h.01M12 12h.01M15.5 12h.01"/>',
    ciclo: '<path d="M17 2l4 4-4 4"/><path d="M3 11V10a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',
    globo: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    nube: '<path d="M20 16.6A5 5 0 0 0 18 7h-1.3A8 8 0 1 0 4 15.3"/><path d="M16 16l-4-4-4 4M12 12v9"/>',
    enlace: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    cohete: '<path d="M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2.1-.1-2.9a2.2 2.2 0 0 0-2.9-.1z"/><path d="M12 15l-3-3a22 22 0 0 1 2-4A12.9 12.9 0 0 1 22 2c0 2.7-.8 7.5-6 11a22.4 22.4 0 0 1-4 2z"/><path d="M9 12H4s.6-3 2-4c1.6-1.1 5 0 5 0M12 15v5s3-.6 4-2c1.1-1.6 0-5 0-5"/>',
    bandera: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/>',
  };
  var ORDEN = Object.keys(ICONOS);

  function icono(nombre, i) {
    var trazo = ICONOS[nombre] || ICONOS[ORDEN[i % ORDEN.length]];
    return (
      '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" ' +
      'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + trazo + "</svg>"
    );
  }

  function chispas(fila) {
    var emb = fila.querySelector(".comp__emblema");
    var fr = fila.getBoundingClientRect();
    var er = emb.getBoundingClientRect();
    var cx = er.left - fr.left + er.width / 2;
    var cy = er.top - fr.top + er.height / 2;
    for (var i = 0; i < 12; i++) {
      var s = document.createElement("span");
      var a = (i / 12) * Math.PI * 2;
      var d = 30 + Math.random() * 18;
      s.className = "comp__chispa";
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
    var items = raiz.querySelectorAll(".competencias__lista > li");
    Array.prototype.forEach.call(items, function (li, i) {
      var html = li.innerHTML.trim();
      var n = i + 1;
      li.innerHTML =
        '<button type="button" class="comp" aria-label="Competencia ' + n + ': descubrir">' +
        '<span class="comp__emblema" aria-hidden="true"><span class="comp__giro">' +
        '<span class="comp__cara comp__cara--pregunta" style="--cp-retraso:' + (i * 0.35).toFixed(2) + 's">?</span>' +
        '<span class="comp__cara comp__cara--icono">' + icono(li.getAttribute("data-icono"), i) + "</span>" +
        "</span></span>" +
        '<span class="comp__texto" aria-hidden="true">' + html + "</span>" +
        '<span class="comp__estado" aria-hidden="true">Por descubrir</span>' +
        "</button>";

      var fila = li.firstChild;
      fila.addEventListener("click", function () {
        if (fila.classList.contains("is-abierta")) return;
        var texto = fila.querySelector(".comp__texto");
        fila.classList.add("is-abierta", "is-brilla");
        texto.removeAttribute("aria-hidden");
        fila.setAttribute("aria-label", "Competencia " + n + ": " + texto.textContent.replace(/\s+/g, " ").trim());
        setTimeout(function () {
          fila.querySelector(".comp__estado").textContent = "Por desarrollar";
        }, reduce ? 0 : 400);
        if (!reduce) chispas(fila);
      });
    });
  }

  function iniciar() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-competencias]"), armar);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
