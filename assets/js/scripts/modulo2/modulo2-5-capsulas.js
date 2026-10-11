/* Módulo 2-5: las etiquetas para formatear texto como una máquina de cápsulas.
   - Lee la lista de etiquetas (.capsulas__data): de cada <li> toma la
     etiqueta (.codetag), su descripción y su ejemplo (.capsulas__ex), y arma
     una cápsula por etiqueta. La lista se oculta; sin JavaScript se ve igual
     que antes.
   - Al girar la perilla cae una cápsula al azar; también se puede tocar una
     cápsula para sacarla. La cápsula rueda, se abre y saca un papelito con la
     descripción y el ejemplo de código con su resultado.
   - Cuando se acaban, la perilla vuelve a llenar la máquina.
   - Empieza con la cápsula de <li data-start> ya abierta. */
(function () {
  "use strict";

  var root = document.querySelector("[data-capsulas]");
  var list = document.querySelector(".capsulas__data");
  if (!root || !list) return;

  var dome = root.querySelector(".capsulas__dome");
  var knob = root.querySelector(".capsulas__knob");
  var handle = root.querySelector(".capsulas__handle");
  var count = root.querySelector(".capsulas__count");
  var prize = root.querySelector(".capsulas__prize");
  var slip = root.querySelector(".capsulas__slip");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Colores pastel de la mitad de arriba de cada cápsula.
  var COLORS = ["#fac775", "#a9c8f0", "#f4a08a", "#8fd3b6", "#c9b6f2", "#7fa6e0", "#ffd9a8", "#b9e3f5", "#f7b6c8", "#cde6a1"];
  // Montón dentro del domo: [x, y, giro] en px desde la esquina del domo.
  var PILE = [
    [60, 198, -12], [108, 200, 8], [156, 198, -20], [204, 196, 14],
    [84, 154, 22], [132, 155, -8], [180, 153, -26],
    [108, 110, -4], [156, 111, 18],
    [132, 67, -14]
  ];

  // Convierte el HTML del ejemplo en código coloreado como en el curso.
  function codeHTML(src) {
    return src
      .split(/(<\/?[a-z0-9]+>)/i)
      .map(function (part) {
        var m = part.match(/^<(\/?)([a-z0-9]+)>$/i);
        if (m) return "&lt;" + m[1] + '<span class="codetag">' + m[2] + "</span>&gt;";
        return part ? '<span class="codetext">' + part + "</span>" : "";
      })
      .join("");
  }

  var items = Array.prototype.slice.call(list.querySelectorAll("li")).map(function (li, i) {
    var tag = li.querySelector(".codetag").textContent.trim();
    var ex = li.querySelector(".capsulas__ex");
    var desc = li.cloneNode(true);
    [desc.querySelector(".code"), desc.querySelector(".capsulas__ex")].forEach(function (n) {
      if (n) n.parentNode.removeChild(n);
    });
    return {
      tag: tag,
      desc: desc.innerHTML.trim(),
      example: ex ? ex.innerHTML.trim() : "",
      color: COLORS[i % COLORS.length],
      start: li.hasAttribute("data-start"),
    };
  });

  // Arma las cápsulas.
  var caps = items.map(function (item, i) {
    var p = PILE[i % PILE.length];
    var b = document.createElement("button");
    b.type = "button";
    b.className = "capsulas__cap";
    b.style.setProperty("--x", p[0] + "px");
    b.style.setProperty("--y", p[1] + "px");
    b.style.setProperty("--r", p[2] + "deg");
    b.style.setProperty("--c", item.color);
    b.setAttribute("aria-label", "Cápsula de la etiqueta " + item.tag);
    var sticker = document.createElement("span");
    sticker.className = "capsulas__sticker";
    sticker.textContent = "<" + item.tag + ">";
    if (item.tag.length > 4) sticker.classList.add("is-long");
    b.appendChild(sticker);
    b.addEventListener("click", function () {
      pick(i);
    });
    dome.appendChild(b);
    return b;
  });
  list.classList.add("is-built");

  var turn = 0;
  var busy = false;

  function left() {
    return caps.filter(function (c) {
      return !c.classList.contains("is-gone");
    });
  }

  function setGone(c, gone) {
    c.classList.toggle("is-gone", gone);
    c.disabled = gone;
  }

  function updateCount() {
    var n = left().length;
    count.textContent = n
      ? "Quedan " + n + (n === 1 ? " cápsula" : " cápsulas")
      : "Ya no quedan. Gira la perilla para rellenar.";
    knob.setAttribute("aria-label", n ? "Girar la perilla" : "Rellenar la máquina");
  }

  function spin() {
    turn += 360;
    handle.style.setProperty("--turn", turn + "deg");
    if (reduce) return;
    dome.classList.remove("is-shake");
    void dome.offsetWidth;
    dome.classList.add("is-shake");
  }

  function showPrize(i, animate) {
    var item = items[i];
    prize.style.setProperty("--c", item.color);
    slip.innerHTML =
      '<span class="capsulas__kicker">Te salió</span>' +
      '<span class="capsulas__tag code">&lt;<span class="codetag">' + item.tag + "</span>&gt;</span>" +
      '<p class="capsulas__desc">' + item.desc + "</p>" +
      (item.example
        ? '<div class="capsulas__demo"><div class="capsulas__src code">' + codeHTML(item.example) + "</div>" +
          '<div class="capsulas__out">' + item.example + "</div></div>"
        : "");
    prize.classList.remove("is-open", "is-rolling");
    if (!animate || reduce) {
      prize.classList.add("is-open");
      return;
    }
    void prize.offsetWidth;
    prize.classList.add("is-rolling");
    setTimeout(function () {
      prize.classList.add("is-open");
    }, 760);
  }

  function pick(i) {
    if (busy || caps[i].classList.contains("is-gone")) return;
    busy = true;
    spin();
    setTimeout(
      function () {
        setGone(caps[i], true);
        updateCount();
        showPrize(i, true);
        setTimeout(function () {
          busy = false;
        }, reduce ? 0 : 900);
      },
      reduce ? 0 : 450
    );
  }

  knob.addEventListener("click", function () {
    if (busy) return;
    var l = left();
    if (!l.length) {
      // Rellena la máquina.
      spin();
      caps.forEach(function (c) {
        setGone(c, false);
      });
      updateCount();
      return;
    }
    pick(caps.indexOf(l[Math.floor(Math.random() * l.length)]));
  });

  var first = 0;
  items.forEach(function (item, i) {
    if (item.start) first = i;
  });
  setGone(caps[first], true);
  showPrize(first, false);
  updateCount();
})();
