/* Módulo 4-10: el ciclo for como una banda transportadora (estilos en
   assets/css/modulos/modulo4/modulo4-10-banda.css).

   El arreglo sale de la lista oculta [data-banda-src] de la página: cada
   elemento es una caja de la banda. El recorrido se arma como una lista de
   pasos (inicial, condición, cuerpo, incremento) y cada paso ilumina su parte
   del código, mueve la escena y explica lo que acaba de pasar.

   Los botones son solo íconos: Correr (se vuelve Pausa) los ejecuta solos,
   Paso avanza uno a uno y Reiniciar deja la banda como al principio. Con
   "reducir movimiento" todo ocurre sin animaciones. */
(function () {
  "use strict";

  var root = document.querySelector("[data-banda]");
  if (!root) return;

  var IMG = "../../assets/images/course/modulo4/m4-10/banda/";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var track = root.querySelector("[data-track]");
  var belt = root.querySelector("[data-belt]");
  var press = root.querySelector("[data-press]");
  var beam = root.querySelector("[data-beam]");
  var check = root.querySelector("[data-check]");
  var counter = root.querySelector("[data-counter]");
  var paper = root.querySelector("[data-paper]");
  var status = root.querySelector("[data-status]");
  var code = root.querySelector("[data-code]");
  var legend = root.querySelector("[data-legend]");
  var runBtn = root.querySelector("[data-run]");
  var stepBtn = root.querySelector("[data-step]");
  var resetBtn = root.querySelector("[data-reset]");

  // Los elementos del arreglo, tal como están escritos en la página
  var items = [].map.call(root.querySelectorAll("[data-banda-src] li"), function (li) {
    return { nombre: li.textContent.trim(), img: li.getAttribute("data-img") };
  });
  if (!items.length) return;

  var N = items.length;
  var boxes = [];

  items.forEach(function (it, k) {
    var box = document.createElement("div");
    box.className = "banda__box";
    box.style.setProperty("--k", k);
    box.innerHTML =
      '<img class="banda__box-back" src="' + IMG + 'fotos/caja-fondo.png" alt="">' +
      '<img class="banda__fruit" src="' + IMG + it.img + '" alt="">' +
      '<img class="banda__box-front" src="' + IMG + 'fotos/caja-frente.png" alt="">' +
      '<span class="banda__label" aria-hidden="true">' + k + "</span>";
    box.setAttribute("aria-hidden", "true");
    track.appendChild(box);
    boxes.push(box);
  });

  root.classList.add("banda--ready");

  /* ---------- Los pasos del ciclo ---------- */
  function makeSteps() {
    var pasos = [{ parte: "init", i: 0 }];
    for (var i = 0, vuelta = 0; ; i++, vuelta++) {
      pasos.push({ parte: "cond", i: i, ok: i < N });
      if (i >= N) break;
      pasos.push({ parte: "body", i: i, vuelta: vuelta });
      pasos.push({ parte: "inc", i: i + 1 });
    }
    pasos.push({ parte: "fin" });
    return pasos;
  }

  var PARTES = { init: "Expresión inicial", cond: "Expresión condicional", body: "Cuerpo del ciclo", inc: "Expresión cíclica" };

  function explica(st) {
    switch (st.parte) {
      case "init":
        return "<b>Expresión inicial</b>: se crea el contador <b>i = 0</b> y la banda trae la caja <b>0</b> hasta la etiquetadora. Esta parte se ejecuta una sola vez, antes de la primera vuelta.";
      case "cond":
        return st.ok
          ? "<b>Expresión condicional</b>: ¿<b>" + st.i + " &lt; " + N + "</b>? El sensor encuentra una caja enfrente, así que es <span class=\"si\">true</span> y entramos al ciclo."
          : "<b>Expresión condicional</b>: ¿<b>" + st.i + " &lt; " + N + "</b>? Ya no hay más cajas, así que es <span class=\"no\">false</span> y el ciclo termina.";
      case "body":
        return "<b>Cuerpo del ciclo</b>, vuelta " + (st.vuelta + 1) + " de " + N + ": la etiquetadora sella la caja <b>" + st.i +
          "</b> y la impresora agrega <b>\"" + st.i + ": " + items[st.i].nombre + "\"</b> a la variable <b>texto</b>.";
      case "inc":
        return "<b>Expresión cíclica</b>: <b>i++</b> sube el contador a <b>" + st.i + "</b> y la banda avanza " +
          (st.i < N ? "para traer la caja <b>" + st.i + "</b>" : "pero ya no llega ninguna caja") + ". Después volvemos a revisar la condición.";
      default:
        return "Fin del ciclo. La variable <b>texto</b> ya tiene los " + N + " elementos del arreglo y el programa sigue con la línea que está después de la llave <b>}</b>.";
    }
  }

  /* ---------- Pintar la escena ---------- */
  function marca(parte) {
    [].forEach.call(code.querySelectorAll("[data-part]"), function (el) {
      el.classList.toggle("is-on", el.getAttribute("data-part") === parte);
    });
    [].forEach.call(legend.children, function (el) {
      el.classList.toggle("is-on", el.getAttribute("data-leg") === parte);
    });
  }

  // La placa del sensor dice "i < 5 = true"; la i muestra su valor al pasar el cursor
  var iActual = "–";
  function placa(res) {
    check.classList.remove("is-true", "is-false");
    if (res !== null) check.classList.add(res ? "is-true" : "is-false");
    check.innerHTML = '<span class="banda__screen"><span class="banda__i"><span class="banda__i-nom">i</span><span class="banda__i-val">' + iActual +
      "</span></span> &lt; " + N + " = <b>" + (res === null ? "…" : res ? "true" : "false") + "</b></span>";
  }

  function imprime(linea) {
    var s = document.createElement("span");
    s.textContent = linea;
    paper.appendChild(s);
  }

  // Las cajas esperan fuera del cuadro, a la derecha, y la banda las trae
  // una por una hasta la etiquetadora
  function llega(i) {
    if (boxes[i]) boxes[i].classList.remove("is-waiting");
    belt.classList.remove("is-running", "is-returning");
    void belt.offsetWidth;
    belt.classList.add("is-running");
  }

  function aplica(st) {
    beam.classList.remove("is-true", "is-false");

    if (st.parte === "init") {
      counter.textContent = "i = 0";
      iActual = 0;
      placa(null);
      llega(0);
    }

    if (st.parte === "cond") {
      beam.classList.add(st.ok ? "is-true" : "is-false");
      iActual = st.i;
      placa(st.ok);
    }

    if (st.parte === "body") {
      press.classList.remove("is-pressing");
      void press.offsetWidth;
      press.classList.add("is-pressing");
      setTimeout(function () {
        boxes[st.i].classList.add("is-stamped");
        imprime(st.i + ": " + items[st.i].nombre);
      }, reduce ? 0 : 330);
    }

    if (st.parte === "inc") {
      counter.textContent = "i = " + st.i;
      iActual = st.i;
      placa(null);
      track.style.transform = "translateX(calc(" + -st.i + " * var(--slot)))";
      llega(st.i);
    }

    if (st.parte === "fin") {
      var corte = document.createElement("u");
      corte.textContent = "✂ fin del ciclo";
      paper.appendChild(corte);
    }
  }

  /* ---------- Los botones ---------- */
  var PLAY = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5v11l10-5.5z" fill="currentColor"/></svg>';
  var PAUSE = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5h3.2v11H4zm4.8 0H12v11H8.8z" fill="currentColor"/></svg>';

  // El botón del centro cambia entre correr y pausa: ícono, nombre y estado
  function botonCorrer(enPausa) {
    var nombre = enPausa ? "Pausa" : "Correr";
    runBtn.innerHTML = enPausa ? PAUSE : PLAY;
    runBtn.setAttribute("aria-label", nombre);
    runBtn.setAttribute("title", nombre);
    runBtn.setAttribute("data-state", enPausa ? "pause" : "play");
  }
  var INICIO = "La banda está vacía: las cajas esperan fuera del cuadro. El ciclo todavía no empieza.";

  var pasos = makeSteps();
  var k = -1;
  var timer = null;
  var corriendo = false;

  // init e inc esperan a que la caja termine de llegar (--viaje en el CSS)
  var ESPERA = { init: 2300, cond: 1000, body: 1500, inc: 2400, fin: 0 };
  var REGRESO = 1600; // --regreso en el CSS
  var volviendo = null;

  function detener() {
    corriendo = false;
    clearTimeout(timer);
    botonCorrer(false);
  }

  // Termina el regreso de las cajas: quita las etiquetas ya fuera de cuadro
  function finRegreso() {
    clearTimeout(volviendo);
    volviendo = null;
    root.classList.remove("banda--volviendo");
    boxes.forEach(function (b) { b.classList.remove("is-stamped"); });
  }

  // Deja la banda vacía con las cajas afuera, a la derecha. Al cargar la
  // página es inmediato; con el botón la cinta corre al revés y las cajas
  // regresan deslizándose.
  function reiniciar(inmediato) {
    detener();
    pasos = makeSteps();
    k = -1;
    marca(null);
    var habiaCajas = boxes.some(function (b) { return !b.classList.contains("is-waiting"); });
    if (inmediato === true || !habiaCajas || reduce) {
      root.classList.add("banda--quieta");
      track.style.transform = "translateX(0)";
      boxes.forEach(function (b) { b.classList.add("is-waiting"); });
      void track.offsetWidth;
      root.classList.remove("banda--quieta");
      finRegreso();
      belt.classList.remove("is-running", "is-returning");
    } else {
      root.classList.add("banda--volviendo");
      track.style.transform = "translateX(0)";
      boxes.forEach(function (b) { b.classList.add("is-waiting"); });
      belt.classList.remove("is-running", "is-returning");
      void belt.offsetWidth;
      belt.classList.add("is-returning");
      clearTimeout(volviendo);
      volviendo = setTimeout(finRegreso, REGRESO);
    }
    press.classList.remove("is-pressing");
    beam.classList.remove("is-true", "is-false");
    iActual = "–";
    placa(null);
    counter.textContent = "i = –";
    paper.innerHTML = "<i>texto =</i>";
    status.innerHTML = INICIO;
    stepBtn.disabled = false;
  }

  function siguiente() {
    if (k >= pasos.length - 1) return false;
    if (volviendo) finRegreso();
    var st = pasos[++k];
    marca(st.parte === "fin" ? null : st.parte);
    status.innerHTML = explica(st);
    aplica(st);
    if (k >= pasos.length - 1) {
      detener();
      stepBtn.disabled = true;
    }
    return true;
  }

  // El tiempo de espera lo marca el paso que se acaba de ejecutar
  function tic() {
    if (!corriendo) return;
    if (!siguiente()) return detener();
    if (corriendo) timer = setTimeout(tic, reduce ? 450 : ESPERA[pasos[k].parte] || 1000);
  }

  runBtn.addEventListener("click", function () {
    if (corriendo) return detener();
    var espera = 0;
    if (k >= pasos.length - 1) {
      reiniciar();
      espera = volviendo ? REGRESO : 0;
    }
    corriendo = true;
    botonCorrer(true);
    timer = setTimeout(tic, espera);
  });

  stepBtn.addEventListener("click", function () {
    detener();
    siguiente();
  });

  resetBtn.addEventListener("click", function () { reiniciar(); });

  reiniciar(true);
})();
