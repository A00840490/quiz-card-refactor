/* Módulo 2-11: los tipos de input como una navaja suiza.
   - Lee la lista .navaja__data: de cada <li data-type> toma el type y su
     descripción. La lista se oculta; sin JavaScript se ve igual que antes.
   - Arma la navaja en SVG: cuatro herramientas en cada remache. Al tocar la
     navaja salen en abanico; la punta de cada una dibuja el input que crea.
   - La navaja empieza centrada y sin ficha. Al tocar una herramienta se
     corre a la izquierda y aparece la ficha de papel con su descripción y,
     al fondo, el código y el input real para probarlo, como los ejemplos del
     curso. También se quita su punto verde.
   - Tocar el mango cierra la navaja, se va la ficha y la navaja vuelve al
     centro. */
(function () {
  "use strict";

  var root = document.querySelector("[data-navaja]");
  var list = root && root.querySelector(".navaja__data");
  if (!root || !list) return;

  var NS = "http://www.w3.org/2000/svg";
  var items = [].map.call(list.querySelectorAll("li[data-type]"), function (li) {
    var text = li.cloneNode(true);
    [].forEach.call(text.querySelectorAll(".code"), function (c) { c.remove(); });
    return { type: li.getAttribute("data-type"), desc: text.textContent.replace(/\s+/g, " ").trim() };
  });
  var byType = {};
  items.forEach(function (it) { byType[it.type] = it; });

  // Mango y remaches: [x del remache izquierdo, x del derecho], y = 195
  var PIVOT_L = 205;
  var PIVOT_R = 395;
  // Cuatro herramientas por remache; cerradas quedan bajo el mango y abiertas
  // salen hacia afuera; todas giran por encima del mango.
  // [type, remache, ángulo cerrado, ángulo abierto]
  var LAYOUT = [
    ["text", PIVOT_L, 0, -98], ["password", PIVOT_L, 0, -124], ["radio", PIVOT_L, 0, -150], ["checkbox", PIVOT_L, 0, -176],
    ["date", PIVOT_R, -180, -82], ["email", PIVOT_R, -180, -56], ["file", PIVOT_R, -180, -30], ["submit", PIVOT_R, -180, -4]
  ];
  var SHAFT = '<path class="navaja__steel" d="M0,-9 L128,-6 Q134,0 128,6 L0,9 Z"/><circle class="navaja__steel" r="15"/>';
  // Punta de cada herramienta, con la forma del input que crea
  var HEAD = {
    text: '<rect class="navaja__steel" x="-27" y="-15" width="54" height="30" rx="7"/><text class="navaja__ico" x="-17" y="6">Aa</text><rect class="navaja__ico-f" x="11" y="-8" width="2.5" height="16"/>',
    password: '<rect class="navaja__steel" x="-27" y="-15" width="54" height="30" rx="7"/><circle class="navaja__ico-f" cx="-12" r="4"/><circle class="navaja__ico-f" r="4"/><circle class="navaja__ico-f" cx="12" r="4"/>',
    radio: '<circle class="navaja__steel" r="18"/><circle class="navaja__ico-s" r="11"/><circle class="navaja__ico-f" r="5.5"/>',
    checkbox: '<rect class="navaja__steel" x="-17" y="-17" width="34" height="34" rx="7"/><path class="navaja__ico-s" d="M-9,0 l6,6 l12,-13"/>',
    date: '<rect class="navaja__steel" x="-19" y="-17" width="38" height="36" rx="5"/><rect class="navaja__ico-f" x="-19" y="-17" width="38" height="10" rx="3"/><text class="navaja__ico" x="0" y="14" text-anchor="middle">14</text>',
    email: '<circle class="navaja__steel" r="19"/><text class="navaja__ico navaja__ico--at" x="0" y="8" text-anchor="middle">@</text>',
    file: '<path class="navaja__steel" d="M-21,-13 h14 l5,5 h23 v23 h-42 z"/><path class="navaja__ico-s" d="M-21,-4 h42"/>',
    submit: '<rect class="navaja__steel" x="-27" y="-14" width="54" height="28" rx="14"/><path class="navaja__ico-f" d="M-8,-8 L12,0 L-8,8 L-4,0 Z"/>'
  };

  var tools = LAYOUT.filter(function (L) { return byType[L[0]]; }).map(function (L, k) {
    return '<g transform="translate(' + L[1] + ' 195)">' +
      '<g class="navaja__tool" data-type="' + L[0] + '" tabindex="-1" role="button" aria-label="Herramienta ' + L[0] + '"' +
      ' style="--rest: ' + L[2] + "deg; --open: " + L[3] + "deg; --delay: " + ((k % 4) * 0.07 + (L[1] === PIVOT_R ? 0.04 : 0)) + 's">' +
      '<rect x="-18" y="-26" width="204" height="52" fill="transparent"/>' + SHAFT +
      '<g transform="translate(150 0)"><g class="navaja__up">' + HEAD[L[0]] +
      '<circle class="navaja__todo" cx="20" cy="-17" r="6"/></g></g></g></g>';
  }).join("");

  var svg = document.createElementNS(NS, "svg");
  svg.setAttribute("class", "navaja__knife");
  svg.setAttribute("viewBox", "0 0 600 250");
  svg.setAttribute("tabindex", "0");
  svg.setAttribute("role", "button");
  svg.setAttribute("aria-label", "Navaja de tipos de input: tócala para abrirla o cerrarla");
  svg.innerHTML =
    '<defs>' +
    '<linearGradient id="navaja-steel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbfcfd"/><stop offset=".45" stop-color="#d7dde5"/><stop offset=".55" stop-color="#b3bdca"/><stop offset="1" stop-color="#eef1f5"/></linearGradient>' +
    '<linearGradient id="navaja-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a6fd0"/><stop offset=".55" stop-color="#093b8b"/><stop offset="1" stop-color="#062b66"/></linearGradient>' +
    '<radialGradient id="navaja-rivet" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#9eaabb"/></radialGradient>' +
    '<filter id="navaja-shadow" x="-20%" y="-30%" width="140%" height="190%"><feDropShadow dx="0" dy="8" stdDeviation="7" flood-color="#062b66" flood-opacity=".28"/></filter>' +
    '</defs>' +
    '<g class="navaja__tools">' + tools + '</g>' +
    '<g class="navaja__body">' +
    '<rect class="navaja__handle" x="170" y="160" width="260" height="70" rx="35" fill="url(#navaja-body)" filter="url(#navaja-shadow)"/>' +
    '<rect x="190" y="166" width="220" height="13" rx="6.5" fill="#ffffff" opacity=".18"/>' +
    '<rect x="248" y="180" width="104" height="30" rx="8" fill="#ffffff"/>' +
    '<text x="300" y="201" text-anchor="middle" style="font: 700 15px var(--navaja-mono); fill: #093b8b">&lt;input&gt;</text>' +
    '<circle cx="' + PIVOT_L + '" cy="195" r="7" fill="url(#navaja-rivet)" stroke="#8794a7"/>' +
    '<circle cx="' + PIVOT_R + '" cy="195" r="7" fill="url(#navaja-rivet)" stroke="#8794a7"/>' +
    '</g>';

  var slip = document.createElement("div");
  slip.className = "navaja__slip";
  slip.setAttribute("aria-live", "polite");
  slip.innerHTML =
    '<p class="navaja__desc"></p>' +
    '<div class="navaja__demo">' +
    '<div class="navaja__src code"></div>' +
    '<div class="navaja__try"></div>' +
    '</div>';

  // La navaja va dentro de un escenario que se corre a la izquierda cuando
  // aparece la ficha; así no choca con su meneo de "tócame".
  var stage = document.createElement("div");
  stage.className = "navaja__stage";
  stage.appendChild(svg);
  root.appendChild(stage);
  root.appendChild(slip);
  list.classList.add("is-built");

  var toolEls = [].slice.call(svg.querySelectorAll(".navaja__tool"));
  var codeEl = slip.querySelector(".navaja__src");
  var desc = slip.querySelector(".navaja__desc");
  var tryEl = slip.querySelector(".navaja__try");
  var uid = 0;

  // Mismos colores que los ejemplos del curso (.code / .codetag / .codetext)
  function code(type) {
    return '&lt;<span class="codetag">input</span> <span class="codetext">type="' + type + '"</span>&gt;';
  }


  // Un input real y funcional del tipo pedido
  function sample(type) {
    var name = "navaja-radio-" + (++uid);
    var box = document.createElement("div");
    box.style.display = "contents";
    box.innerHTML = {
      text: '<input type="text" placeholder="Escribe algo">',
      password: '<input type="password" placeholder="Contraseña">',
      radio: '<label><input type="radio" name="' + name + '"> Sí</label><label><input type="radio" name="' + name + '"> No</label>',
      checkbox: '<label><input type="checkbox"> Acepto</label>',
      date: '<input type="date">',
      email: '<input type="email" placeholder="nombre@dominio.com">',
      file: '<input type="file">',
      submit: '<input type="submit" value="Enviar"><span class="navaja__sent" hidden>¡Enviado!</span>'
    }[type] || '<input type="' + type + '">';
    if (type === "submit") {
      box.querySelector("input").addEventListener("click", function (e) {
        e.preventDefault();
        var sent = box.querySelector(".navaja__sent");
        sent.hidden = false;
        setTimeout(function () { sent.hidden = true; }, 1600);
      });
    }
    return box;
  }

  function open() {
    root.classList.add("is-open");
    toolEls.forEach(function (el) { el.setAttribute("tabindex", "0"); });
  }
  function close() {
    root.classList.remove("is-open", "has-slip");
    toolEls.forEach(function (el) {
      el.classList.remove("is-on");
      el.setAttribute("tabindex", "-1");
    });
  }
  function pick(el) {
    var it = byType[el.getAttribute("data-type")];
    toolEls.forEach(function (o) { o.classList.toggle("is-on", o === el); });
    el.classList.add("is-seen");
    codeEl.innerHTML = code(it.type);
    desc.textContent = it.desc;
    tryEl.innerHTML = "";
    tryEl.appendChild(sample(it.type));
    if (!root.classList.contains("has-slip")) {
      root.classList.add("has-slip");
      return;
    }
    slip.classList.remove("is-new");
    void slip.offsetWidth;
    slip.classList.add("is-new");
  }

  svg.addEventListener("click", function (e) {
    if (!root.classList.contains("is-open")) { open(); return; }
    var tool = e.target.closest(".navaja__tool");
    if (tool) pick(tool);
    else if (e.target.closest(".navaja__body")) close();
  });
  svg.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    var tool = e.target.closest && e.target.closest(".navaja__tool");
    e.preventDefault();
    if (tool) pick(tool);
    else if (root.classList.contains("is-open")) close();
    else open();
  });
})();
