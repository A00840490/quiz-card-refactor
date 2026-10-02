/* Módulo 1-9: atajos de teclado con un teclado que se ilumina.
   - Las categorías cambian la lista de atajos (también con ← →).
   - Al elegir un atajo, sus teclas se presionan en el teclado dibujado y
     abajo aparece qué hace. Si tiene dos pasos ("Ctrl+K Ctrl+S"), el
     teclado alterna entre uno y otro.
   - Cada atajo guarda sus teclas en data-win y data-mac: "+" une teclas que
     se presionan juntas y un espacio separa pasos.
   - El selector Windows / Mac cambia qué combinación se muestra. */
(function () {
  "use strict";

  var root = document.querySelector("[data-kb]");
  if (!root) return;

  // Flechas dibujadas en SVG para que se vean igual en cualquier equipo
  // (algunas fuentes muestran ↓ como emoji de color).
  function arrow(rot) {
    return (
      '<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round" style="transform:rotate(' + rot + 'deg)" aria-hidden="true">' +
      '<path d="M8 13V3M4 7l4-4 4 4"/></svg>'
    );
  }
  var ARROWS = { Up: arrow(0), Right: arrow(90), Down: arrow(180), Left: arrow(270) };

  // Teclado dibujado: [texto, tamaño, id]. El id une la tecla con el atajo.
  var LAYOUT = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "\\"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L", ";"],
    [["Shift", "w2", "Shift"], "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/"],
    [["Ctrl", "w15", "mod"], ["Alt", "w15", "alt"], ["", "w6", "space"], ["", "", "Left"], ["", "", "Up"], ["", "", "Down"], ["", "", "Right"]],
  ];

  // Cómo se llama cada tecla del atajo en el teclado dibujado.
  var KEY_ID = { Ctrl: "mod", Cmd: "mod", Alt: "alt", Option: "alt" };

  // Texto de cada tecla en la lista, según el sistema.
  var LABELS = {
    win: { Up: ARROWS.Up, Down: ARROWS.Down, Click: "Clic" },
    mac: { Cmd: "⌘ Cmd", Option: "⌥ Option", Shift: "⇧ Shift", Up: ARROWS.Up, Down: ARROWS.Down, Click: "Clic" },
  };

  var board = root.querySelector("[data-kb-board]");
  var out = root.querySelector("[data-kb-out]");
  var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
  var items = Array.prototype.slice.call(root.querySelectorAll("[data-kb-item]"));
  var state = { os: "win", item: items[0], step: 0 };
  var timer = null;

  function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function comboOf(item) {
    return item.getAttribute("data-" + state.os) || item.getAttribute("data-win");
  }

  // Dibuja el teclado una sola vez; después solo se encienden teclas.
  var keyEls = {};
  board.innerHTML = LAYOUT.map(function (row) {
    return (
      '<div class="kb__row">' +
      row
        .map(function (k) {
          var label = typeof k === "string" ? k : k[0];
          var size = typeof k === "string" ? "" : k[1];
          var id = typeof k === "string" ? k : k[2];
          return (
            '<span class="kb__k' + (size ? " kb__k--" + size : "") + '" data-k="' + esc(id) + '">' +
            (ARROWS[id] || esc(label)) + "</span>"
          );
        })
        .join("") +
      "</div>"
    );
  }).join("");
  board.querySelectorAll("[data-k]").forEach(function (el) {
    keyEls[el.getAttribute("data-k")] = el;
  });

  function keysHtml(combo) {
    return combo
      .split(" ")
      .map(function (step) {
        return step
          .split("+")
          .map(function (k) {
            return '<kbd class="kb__key">' + (LABELS[state.os][k] || esc(k)) + "</kbd>";
          })
          .join('<span class="kb__plus">+</span>');
      })
      .join('<span class="kb__then">y después</span>');
  }

  function ariaLabel(combo) {
    return combo
      .split(" ")
      .map(function (step) {
        return step.split("+").join(" + ");
      })
      .join(", y después, ");
  }

  function paintKeys() {
    keyEls.mod.textContent = state.os === "mac" ? "⌘ Cmd" : "Ctrl";
    keyEls.alt.textContent = state.os === "mac" ? "⌥ Opt" : "Alt";

    var steps = comboOf(state.item).split(" ");
    var step = steps[state.step % steps.length].split("+");
    var on = {};
    step.forEach(function (k) {
      on[KEY_ID[k] || k] = true;
    });
    Object.keys(keyEls).forEach(function (id) {
      keyEls[id].classList.toggle("is-on", !!on[id]);
    });

    // Solo se redibuja si cambió el atajo, para que la etiqueta no se
    // vuelva a animar cada vez que alternan los pasos.
    var html =
      "<p>" + state.item.querySelector(".kb__desc").innerHTML + "</p>" +
      '<span class="kb__mouse' + (on.Click ? " is-on" : "") + '" aria-hidden="true">Clic</span>';
    if (out.innerHTML !== html) out.innerHTML = html;
  }

  // Atajos de dos pasos: alterna entre el primero y el segundo.
  function startSteps() {
    clearInterval(timer);
    state.step = 0;
    if (comboOf(state.item).split(" ").length > 1) {
      timer = setInterval(function () {
        state.step++;
        paintKeys();
      }, 1300);
    }
  }

  function selectItem(item) {
    state.item = item;
    items.forEach(function (it) {
      it.setAttribute("aria-pressed", it === item ? "true" : "false");
    });
    startSteps();
    paintKeys();
  }

  function setOs(os) {
    state.os = os;
    items.forEach(function (it) {
      var combo = comboOf(it);
      var keys = it.querySelector(".kb__keys");
      keys.innerHTML = keysHtml(combo);
      keys.setAttribute("aria-label", ariaLabel(combo));
    });
    root.querySelectorAll("[data-os]").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-os") === os ? "true" : "false");
    });
    startSteps();
    paintKeys();
  }

  function selectTab(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
    // Al cambiar de categoría la lista vuelve arriba y se elige su primer atajo.
    var list = document.getElementById(tab.getAttribute("aria-controls"));
    list.scrollTop = 0;
    selectItem(list.querySelector("[data-kb-item]"));
  }

  root.querySelectorAll("[data-os]").forEach(function (b) {
    b.addEventListener("click", function () {
      setOs(b.getAttribute("data-os"));
    });
  });

  items.forEach(function (item) {
    item.addEventListener("click", function () {
      selectItem(item);
    });
  });

  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () {
      selectTab(tab);
    });
    tab.addEventListener("keydown", function (e) {
      var to = null;
      if (e.key === "ArrowRight") to = tabs[(i + 1) % tabs.length];
      else if (e.key === "ArrowLeft") to = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === "Home") to = tabs[0];
      else if (e.key === "End") to = tabs[tabs.length - 1];
      if (!to) return;
      e.preventDefault();
      to.focus();
      selectTab(to);
    });
  });

  var isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  setOs(isMac ? "mac" : "win");
  selectTab(tabs[0]);
})();
