/* Módulo 4-10: el ciclo for como una banda transportadora (estilos en
   assets/css/modulos/modulo4/modulo4-10-banda.css).

   El arreglo sale de la lista oculta [data-banda-src] de la página: cada
   elemento es una caja de la banda. El recorrido se arma como una lista de
   pasos (inicial, condición, cuerpo, incremento) y cada paso ilumina su parte
   del código, mueve la escena y explica lo que acaba de pasar.

   Los botones son solo íconos: Paso siguiente avanza una parte del ciclo,
   Paso anterior regresa a la de antes y Reiniciar deja la banda como al
   principio. Con "reducir movimiento" todo ocurre sin animaciones. */
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
  var consola = root.querySelector("[data-console]");
  var status = root.querySelector("[data-status]");
  var code = root.querySelector("[data-code]");
  var backBtn = root.querySelector("[data-back]");
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

  // Explicación con el estándar .grafico-exp: la parte del for y el código en <code>
  function explica(st) {
    switch (st.parte) {
      case "init":
        return "<code>Expresión inicial</code>: se crea el contador <code>i = 0</code> y la banda trae la caja 0 hasta la etiquetadora. Esta parte se ejecuta una sola vez, antes de la primera vuelta.";
      case "cond":
        return st.ok
          ? "<code>Expresión condicional</code>: ¿<code>" + st.i + " &lt; " + N + "</code>? El sensor encuentra una caja enfrente, así que es <span class=\"si\">true</span> y entramos al ciclo."
          : "<code>Expresión condicional</code>: ¿<code>" + st.i + " &lt; " + N + "</code>? Ya no hay más cajas, así que es <span class=\"no\">false</span> y el ciclo termina.";
      case "body":
        return "<code>Cuerpo del ciclo</code>, vuelta " + (st.vuelta + 1) + " de " + N + ": la etiquetadora sella la caja " + st.i +
          " y la consola muestra <code>" + st.i + ": " + items[st.i].nombre + "</code>.";
      case "inc":
        return "<code>Expresión cíclica</code>: <code>i++</code> sube el contador a " + st.i + " y la banda avanza " +
          (st.i < N ? "para traer la caja " + st.i : "pero ya no llega ninguna caja") + ". Después volvemos a revisar la condición.";
      default:
        return "Fin del ciclo. La consola ya mostró los " + N + " elementos del arreglo y el programa sigue con la línea que está después de la llave <code>}</code>.";
    }
  }

  // La explicación cambia con el desvanecido estándar de la ficha (grafico-ficha.js)
  function explicar(html) {
    GraficoFicha.cambiar(status, html);
  }

  /* ---------- Pintar la escena ---------- */
  function marca(parte) {
    [].forEach.call(code.querySelectorAll("[data-part]"), function (el) {
      el.classList.toggle("is-on", el.getAttribute("data-part") === parte);
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

  // Un renglón nuevo en la consola de la ventana de código
  function imprime(linea) {
    var s = document.createElement("span");
    s.textContent = linea;
    consola.appendChild(s);
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
      pendiente = function () {
        boxes[st.i].classList.add("is-stamped");
        imprime(st.i + ": " + items[st.i].nombre);
      };
      sello = setTimeout(sellar, reduce ? 0 : 330);
    }

    if (st.parte === "inc") {
      counter.textContent = "i = " + st.i;
      iActual = st.i;
      placa(null);
      track.style.transform = "translateX(calc(" + -st.i + " * var(--slot)))";
      llega(st.i);
    }

  }

  /* ---------- Los botones ---------- */
  var pasos = makeSteps();
  var k = -1;
  var sello = null;      // el sello del cuerpo llega un poco después del pistón
  var pendiente = null;  // lo que hace ese sello (etiqueta e impresión)
  var REGRESO = 1600; // --regreso en el CSS
  var volviendo = null;

  // Hace ya el sello pendiente (si se avanza rápido) o lo cancela (al regresar)
  function sellar() {
    clearTimeout(sello);
    var f = pendiente;
    pendiente = null;
    if (f) f();
  }

  function cancelaSello() {
    clearTimeout(sello);
    pendiente = null;
  }

  function botones() {
    backBtn.disabled = k < 0;
    stepBtn.disabled = k >= pasos.length - 1;
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
    cancelaSello();
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
    consola.innerHTML = "";
    explicar("");
    botones();
  }

  function siguiente() {
    if (k >= pasos.length - 1) return;
    sellar();
    if (volviendo) finRegreso();
    var st = pasos[++k];
    marca(st.parte === "fin" ? null : st.parte);
    explicar(explica(st));
    aplica(st);
    botones();
  }

  // Regresa al paso anterior sin repetir las animaciones: la escena se arma
  // como queda después de ese paso y las cajas que sobran se deslizan de
  // vuelta a la derecha.
  function anterior() {
    if (k < 0) return;
    if (k === 0) return reiniciar();
    cancelaSello();
    if (volviendo) finRegreso();
    k--;

    var i = 0, llegadas = 0, selladas = {}, lineas = 0;
    for (var n = 0; n <= k; n++) {
      var p = pasos[n];
      if (p.parte === "init" || p.parte === "inc") { i = p.i; llegadas = p.i; }
      if (p.parte === "body") { selladas[p.i] = true; lineas++; }
    }
    var st = pasos[k];

    track.style.transform = "translateX(calc(" + -i + " * var(--slot)))";
    boxes.forEach(function (b, n) {
      b.classList.toggle("is-waiting", n > llegadas);
      b.classList.toggle("is-stamped", !!selladas[n]);
    });
    belt.classList.remove("is-running", "is-returning");
    press.classList.remove("is-pressing");

    // la consola se queda solo con los renglones que ya se habían mostrado
    [].slice.call(consola.children).forEach(function (el, n) {
      if (n >= lineas) consola.removeChild(el);
    });

    counter.textContent = "i = " + i;
    iActual = i;
    beam.classList.remove("is-true", "is-false");
    if (st.parte === "cond") {
      beam.classList.add(st.ok ? "is-true" : "is-false");
      placa(st.ok);
    } else {
      placa(null);
    }

    marca(st.parte);
    explicar(explica(st));
    botones();
  }

  stepBtn.addEventListener("click", siguiente);
  backBtn.addEventListener("click", anterior);
  resetBtn.addEventListener("click", function () { reiniciar(); });

  reiniciar(true);
})();
