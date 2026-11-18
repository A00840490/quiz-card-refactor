/* Dron de reparto (assets/css/dron.css): muestra qué le hace un código de
   JavaScript a una página. Se arma desde el HTML, sin un archivo JS por
   página, y lo usan los temas 4-13, 4-14 y 4-15 (cualquier tema puede usarlo).

   A la izquierda va una página de prueba (un navegador chiquito con su botón
   de recargar) y a la derecha la ventana de código del módulo 4 con la consola
   adentro y la explicación en la ficha de renglones. Al hacer clic en un botón
   de la página, el código corre de verdad (sobre una copia de la página) y
   luego se repite a cámara lenta, renglón por renglón, con la parte que corre
   resaltada:

   - getElementById / getElementsByClassName / getElementsByTagName /
     querySelector(All): cada elemento que se encuentra recibe un marcador de
     mapa con su dirección (lista[0], lista[1]… o el nombre de la variable).
   - Cambiar algo (innerHTML, src, setAttribute, style.x, classList.add…): un
     dron sale del renglón del código con un paquete que dice el valor nuevo,
     vuela a esa dirección, lo suelta y el elemento cambia.
   - Leer algo (getAttribute, .src, .innerHTML…): el dron va al elemento y
     regresa al código con el valor.
   - lista[3] cuando el arreglo tiene 3: el dron llega a una dirección vacía
     y regresa con "undefined"; la consola marca el error.
   La explicación se escribe sola según lo que hizo cada renglón.

   Marcado:
     <div data-dron data-archivo="cambiar.js">
       <script type="text/x-codigo">
         function cambiar() {
           var lista = document.{{ getElementsByClassName("rect") | getElementsByTagName("div") }};
           lista[0].innerHTML = "¡Cambié!";
         }
       </script>
       <script type="text/x-codigo" data-parte="html">
         <div class="rect" data-nombre="la Caja 1">Caja 1</div>
         <button onclick="cambiar()">Cambiar</button>
       </script>
       <script type="text/x-codigo" data-parte="base">.rect { background: #0f4c91 }</script>
       <div data-intro hidden>Texto inicial de la ficha (HTML).</div>
     </div>

   - El código se escribe tal cual y con la sangría que se quiera.
     {{ a | *b | c }} es un valor con el menú de vidrio (empieza en el que
     lleva *, o en el primero). Al elegir otro valor la página se vuelve a cargar.
   - data-parte="html": la página de prueba. Los botones llaman a las funciones
     del código con onclick="nombre()". data-nombre="la Caja 1" es cómo se
     llama el elemento en la explicación (si no, "el <div>").
   - data-parte="base": CSS de la página de prueba (solo reglas sencillas, sin
     @media); no se muestra en el código.
   - data-archivo  nombre en la barra de la ventana de código.
     data-url      lo que dice la barra de la página (pagina.html).
     data-base     carpeta de las imágenes: src="bosque.jpg" se ve con
                   data-base + "bosque.jpg", pero el código lee y escribe
                   "bosque.jpg", tal cual.
     data-clases   qué hace cada clase, para la explicación de classList:
                   '{"resaltado": "fondo amarillo"}'.
   Con "reducir movimiento" no vuela: los cambios se ven al momento. */
(function () {
  "use strict";

  var raices = document.querySelectorAll("[data-dron]");
  if (!raices.length) return;

  var esc = Curso.esc;
  var reduce = Curso.reduce;
  var IMG = Curso.ruta() + "assets/images/course/dron/dron.webp";
  // Dónde están las hélices en la foto del dron (para el giro), en % de la foto
  var ASPAS = [[5, 14], [34, 5], [83, 16], [65, 25]];
  var ORD = ["", "primero", "segundo", "tercero", "cuarto", "quinto", "sexto", "séptimo", "octavo", "noveno", "décimo"];
  var ORD_ADJ = ["", "primer", "segundo", "tercer", "cuarto", "quinto", "sexto", "séptimo", "octavo", "noveno", "décimo"];
  var LEIBLES = /^(innerHTML|innerText|textContent|value|src|href|id|className|alt|title|checked)$/;
  var CONTENIDO = /^(innerHTML|innerText|textContent)$/;
  var MIAS = ["dron-sel", "dron-flash", "dron-cambia"];
  var cuenta = 0;

  function C(t) { return "<code>" + esc(t) + "</code>"; }
  function q(t) { return '"' + t + '"'; }
  function espera(ms) { return new Promise(function (r) { setTimeout(r, reduce ? Math.min(ms, 150) : ms); }); }
  function reinicia(el, clase) { el.classList.remove(clase); void el.offsetWidth; el.classList.add(clase); }
  function cap(t) { return t.charAt(0).toUpperCase() + t.slice(1); }
  function a(nombre) { return /^el /.test(nombre) ? "al " + nombre.slice(3) : "a " + nombre; }
  function de(nombre) { return /^el /.test(nombre) ? "del " + nombre.slice(3) : "de " + nombre; }
  function kebab(n) { return n.replace(/[A-Z]/g, function (m) { return "-" + m.toLowerCase(); }); }
  function sinMarcas(html) { return String(html).replace(/\s+data-dron-[\w-]+="[^"]*"/g, ""); }
  function direcciones(n) {
    if (n === 1) return "la 0";
    if (n > 4) return "de la 0 a la " + (n - 1);
    var l = [];
    for (var i = 0; i < n; i++) l.push("la " + i);
    return l.slice(0, -1).join(", ") + " y " + l[n - 1];
  }
  function lugares(n) {
    if (n <= 0) return "";
    var l = [];
    for (var i = 0; i < Math.min(n, 4); i++) l.push(String(i));
    if (n > 4) return "del 0 al " + (n - 1);
    return l.length === 1 ? l[0] : l.slice(0, -1).join(", ") + " y " + l[l.length - 1];
  }

  /* Cambia cada {{ ... }} por una marca y guarda sus opciones */
  function leerValores(lineas) {
    var valores = [];
    var plantilla = lineas.map(function (l) {
      return l.replace(/\{\{([^}]*)\}\}/g, function (_, dentro) {
        var inicial = 0;
        var opciones = dentro.split("|").map(function (o, i) {
          o = o.trim();
          if (o.charAt(0) === "*") { inicial = i; o = o.slice(1).trim(); }
          return o;
        });
        valores.push({ opciones: opciones, actual: opciones[inicial] });
        return "\u0000" + (valores.length - 1) + "\u0000";
      });
    });
    return { plantilla: plantilla, valores: valores };
  }

  /* CSS de la página de prueba: cada selector se limita a su página */
  function acotar(css, alcance) {
    return css.replace(/([^{}]+)\{/g, function (_, sel) {
      return sel.split(",").map(function (s) {
        s = s.trim();
        return /^(html|body)$/.test(s) ? alcance : alcance + " " + s;
      }).join(", ") + " {";
    });
  }

  function crear(root) {
    var id = ++cuenta;
    var bloques = root.querySelectorAll(':scope > script[type="text/x-codigo"]');
    function parte(nombre) {
      for (var i = 0; i < bloques.length; i++) {
        var p = bloques[i].getAttribute("data-parte") || "";
        if (p === nombre) return Codigo.limpiar(bloques[i].textContent).join("\n");
      }
      return "";
    }
    var leido = leerValores(Codigo.limpiar((function () {
      for (var i = 0; i < bloques.length; i++) if (!bloques[i].hasAttribute("data-parte")) return bloques[i].textContent;
      return "";
    })()));
    var htmlPagina = parte("html");
    var css = parte("base");
    var intro = root.querySelector(":scope > [data-intro]");
    var textoIntro = intro ? intro.innerHTML.trim() : "Al hacer clic en un botón de la página, el código corre renglón por renglón.";
    var clases = {};
    try { clases = JSON.parse(root.getAttribute("data-clases") || "{}"); } catch (e) { clases = {}; }
    var base = root.getAttribute("data-base") || "";

    root.innerHTML =
      '<div class="dron-lab__escena">' +
        '<div class="dron-pagina">' +
          '<div class="dron-pagina__bar"><button type="button" class="dron-pagina__recargar" aria-label="Recargar la página">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/></svg>' +
          '</button><span class="dron-pagina__url">' + esc(root.getAttribute("data-url") || "pagina.html") + "</span></div>" +
          '<div class="dron-pagina__body" data-pagina></div>' +
        "</div>" +
      "</div>" +
      '<div class="grafico-ficha-col">' +
        // Formato de las terminales del módulo 4, pero sin .js-term__src: así
        // js-terminal.js no la toca y el código no se escribe letra por letra
        '<div class="js-term dron-lab__code">' +
          '<div class="js-term__bar" aria-hidden="true"><i></i><i></i><i></i>' + esc(root.getAttribute("data-archivo") || "script.js") + "</div>" +
          '<div class="js-term__body"><pre class="js-term__code" data-code></pre>' +
          '<div class="dron-consola" aria-live="polite"><span>Consola:</span><span class="dron-consola__out" data-consola></span></div></div>' +
        "</div>" +
        '<div class="grafico-ficha"><p class="grafico-exp" data-status aria-live="polite"></p></div>' +
      "</div>";
    root.classList.add("dron-lab");
    root.setAttribute("data-dron-lab", id);

    var alcance = '[data-dron-lab="' + id + '"] .dron-pagina__body';
    if (css) {
      var hoja = document.createElement("style");
      hoja.textContent = acotar(css, alcance);
      document.head.appendChild(hoja);
    }

    var cuerpo = root.querySelector("[data-pagina]");
    var codeEl = root.querySelector("[data-code]");
    var term = root.querySelector(".dron-lab__code");
    var consola = root.querySelector("[data-consola]");
    var expEl = root.querySelector("[data-status]");
    var recargarBtn = root.querySelector(".dron-pagina__recargar");

    var st = {
      valores: leido.valores, lineas: [], funciones: {},
      turno: 0, ocupado: false, rec: false, linea: -1, ops: [],
      raiz: null, envueltos: null, reales: null,
      pins: [], dirs: {}, ultimaVar: {}, nid: 0
    };

    function explicar(html, op) { GraficoFicha.cambiar(expEl, html, op); }

    /* ---------- La página de prueba ---------- */
    function ruta(v) { return /^(https?:|data:|\/|\.\.?\/)/.test(v) ? v : base + v; }
    // Les pone su número a los elementos nuevos, cambia onclick="f()" por
    // data-dron-fn y muestra las imágenes desde data-base
    function preparar(dentro) {
      Array.prototype.forEach.call(dentro.querySelectorAll("*"), function (el) {
        if (!el.hasAttribute("data-dron-id")) el.setAttribute("data-dron-id", "e" + (++st.nid));
        var oc = el.getAttribute("onclick");
        if (oc !== null) {
          var m = oc.match(/^\s*([A-Za-z_$][\w$]*)\s*\(\s*\)\s*;?\s*$/);
          if (m) el.setAttribute("data-dron-fn", m[1]);
          el.removeAttribute("onclick");
        }
        if (el.tagName === "IMG" && el.hasAttribute("src")) {
          var crudo = el.getAttribute("data-dron-src") || el.getAttribute("src");
          el.setAttribute("data-dron-src", crudo);
          if (el.getAttribute("src") !== ruta(crudo)) el.setAttribute("src", ruta(crudo));
        }
      });
    }
    function cargarPagina() {
      // En una plantilla las imágenes no se cargan antes de tiempo
      var tpl = document.createElement("template");
      tpl.innerHTML = htmlPagina;
      var tmp = document.createElement("div");
      tmp.appendChild(tpl.content);
      preparar(tmp);
      cuerpo.innerHTML = "";
      while (tmp.firstChild) cuerpo.appendChild(tmp.firstChild);
    }
    function real(idEl) { return idEl ? cuerpo.querySelector('[data-dron-id="' + idEl + '"]') : null; }
    function nombreDe(idEl) {
      var el = real(idEl);
      if (!el) return "el elemento";
      return el.getAttribute("data-nombre") || "el <" + el.tagName.toLowerCase() + ">";
    }
    function posicion(idEl) { // lugar entre los elementos de la página (los de hasta arriba)
      var el = real(idEl);
      if (!el || el.parentNode !== cuerpo) return 0;
      return Array.prototype.indexOf.call(cuerpo.children, el) + 1;
    }

    /* ---------- El código ---------- */
    function pintarCodigo() {
      st.lineas = leido.plantilla.map(function (l) {
        return l.replace(/\u0000(\d+)\u0000/g, function (_, i) { return st.valores[+i].actual; });
      });
      codeEl.innerHTML = leido.plantilla.map(function (l, n) {
        var m = l.match(/^(\s*)(.*)$/);
        if (!m[2]) return "";
        if (/^\/\//.test(m[2])) return m[1] + '<span class="js-term__com">' + esc(m[2]) + "</span>";
        var cuerpoL = esc(m[2])
          .replace(/^(var|let|const)(\s+)([A-Za-z_$][\w$]*)/, '$1$2<span class="dron-var">$3</span>')
          .replace(/\u0000(\d+)\u0000/g, function (_, i) {
            var v = st.valores[+i];
            return MenuVidrio.boton(v.actual, "Valor", ' data-v="' + i + '"');
          });
        return m[1] + '<span data-part="' + n + '">' + cuerpoL + "</span>";
      }).join("\n");
    }

    codeEl.addEventListener("click", function (e) {
      var b = e.target.closest("[data-v]");
      if (!b) return;
      var v = st.valores[+b.getAttribute("data-v")];
      MenuVidrio.abrir(b, {
        opciones: MenuVidrio.valores(v.opciones, v.actual),
        dentro: root,
        alElegir: function (i) {
          if (v.opciones[i] === v.actual) return;
          v.actual = v.opciones[i];
          pintarCodigo();
          recargar("Cambiaste el código a " + C(v.actual) + ", así que la página se volvió a cargar.");
          var nb = codeEl.querySelector('[data-v="' + b.getAttribute("data-v") + '"]');
          if (nb) nb.focus({ preventScroll: true });
        }
      });
    });

    function resaltar(lineas) {
      apagar();
      lineas.forEach(function (n) {
        var p = codeEl.querySelector('[data-part="' + n + '"]');
        if (p) p.classList.add("is-on");
      });
    }
    function apagar() {
      Array.prototype.forEach.call(codeEl.querySelectorAll(".is-on"), function (el) { el.classList.remove("is-on"); });
    }
    function escribir(texto, error) {
      var sp = document.createElement("span");
      sp.textContent = texto;
      sp.className = "is-new" + (error ? " is-error" : "");
      consola.appendChild(sp);
      while (consola.children.length > 3) consola.removeChild(consola.firstChild);
    }

    /* ---------- Correr el código de verdad, sobre una copia de la página ---------- */
    function reg(op) { if (st.rec) { op.linea = st.linea; st.ops.push(op); } }
    function idDe(el) { return el && el.getAttribute ? el.getAttribute("data-dron-id") : null; }
    function desenvolver(x) { return (x && st.reales && st.reales.get(x)) || x; }

    function envolver(el) {
      if (!el) return el;
      if (st.envueltos.has(el)) return st.envueltos.get(el);
      var p = new Proxy(el, {
        get: function (t, k) {
          if (k === "style") return estilo(t);
          if (k === "classList") return listaClases(t);
          if (k === "getAttribute") return function (n) {
            var v = t.getAttribute(n);
            reg({ tipo: "leer", id: idDe(t), nombre: n, valor: v, como: "atributo" });
            return v;
          };
          if (k === "setAttribute") return function (n, v) {
            v = String(v);
            t.setAttribute(n, v);
            reg({ tipo: "escribir", id: idDe(t), nombre: n, valor: v, atributo: true });
          };
          var v = t[k];
          if (typeof v === "function") return function () {
            return envolverValor(v.apply(t, Array.prototype.map.call(arguments, desenvolver)));
          };
          if (typeof k === "string" && LEIBLES.test(k) && (typeof v !== "object" || v === null)) {
            reg({ tipo: "leer", id: idDe(t), nombre: k, valor: k === "innerHTML" ? sinMarcas(v) : v });
          }
          return envolverValor(v);
        },
        set: function (t, k, v) {
          var tenia = CONTENIDO.test(k) && !!t.querySelector("[data-dron-fn]");
          t[k] = v;
          if (k === "src" || k === "href") t.setAttribute(k, String(v));
          reg({ tipo: "escribir", id: idDe(t), nombre: k, valor: String(v), boton: tenia, html: CONTENIDO.test(k) ? t.innerHTML : null });
          return true;
        }
      });
      st.envueltos.set(el, p);
      st.reales.set(p, el);
      return p;
    }
    function envolverValor(v) {
      if (v instanceof Element) return envolver(v);
      if (v && typeof v === "object" && typeof v.length === "number" && typeof v.item === "function") return coleccion(Array.prototype.slice.call(v));
      return v;
    }
    function estilo(t) {
      return new Proxy(t.style, {
        get: function (s, k) { var v = s[k]; return typeof v === "function" ? v.bind(s) : v; },
        set: function (s, k, v) {
          s[k] = v;
          reg({ tipo: "estilo", id: idDe(t), nombre: k, valor: String(v) });
          return true;
        }
      });
    }
    function listaClases(t) {
      return new Proxy(t.classList, {
        get: function (c, k) {
          if (k === "add" || k === "remove" || k === "toggle") return function () {
            var lista = Array.prototype.slice.call(arguments).map(String);
            var ya = lista.filter(function (x) { return c.contains(x); });
            var r = c[k].apply(c, lista);
            reg({ tipo: "clase", accion: k, id: idDe(t), clases: lista, ya: ya });
            return r;
          };
          var v = c[k];
          return typeof v === "function" ? v.bind(c) : v;
        }
      });
    }
    function coleccion(els) {
      var arr = els.map(envolver);
      return new Proxy(arr, {
        get: function (x, k) {
          if (typeof k === "string" && /^\d+$/.test(k) && +k >= x.length) {
            reg({ tipo: "falta", indice: +k, total: x.length, ids: els.map(idDe) });
          }
          return x[k];
        }
      });
    }
    function buscar(como, arg, els) {
      reg({ tipo: "buscar", como: como, arg: arg, ids: els.map(idDe) });
    }
    var doc = {
      getElementById: function (i) {
        var el = st.raiz.querySelector("#" + CSS.escape(String(i)));
        buscar("id", i, el ? [el] : []);
        return el ? envolver(el) : null;
      },
      getElementsByClassName: function (c) {
        var els = Array.prototype.slice.call(st.raiz.getElementsByClassName(c));
        buscar("clase", c, els);
        return coleccion(els);
      },
      getElementsByTagName: function (t) {
        var els = Array.prototype.slice.call(st.raiz.getElementsByTagName(t));
        buscar("etiqueta", t, els);
        return coleccion(els);
      },
      querySelector: function (s) {
        var el = st.raiz.querySelector(s);
        buscar("selector", s, el ? [el] : []);
        return el ? envolver(el) : null;
      },
      querySelectorAll: function (s) {
        var els = Array.prototype.slice.call(st.raiz.querySelectorAll(s));
        buscar("todos", s, els);
        return coleccion(els);
      }
    };
    var consolaCodigo = {
      log: function () {
        var t = Array.prototype.map.call(arguments, String).join(" ");
        if (st.rec) reg({ tipo: "log", texto: t }); else escribir(t);
      }
    };

    // Antes de cada renglón que empieza una instrucción va __l(n): así se sabe
    // qué renglón hizo cada cosa
    function compilar() {
      var previo = "", src = [], nombres = [];
      st.lineas.forEach(function (l, n) {
        var t = l.trim();
        var marca = t && !/^(\}|else\b|catch\b|finally\b|\/\/|[.?:&|+\-*,)])/.test(t) && (!previo || /[{;}]$/.test(previo));
        src.push((marca ? "__l(" + n + ");" : "") + l);
        if (t && !/^\/\//.test(t)) previo = t;
        var f = l.match(/^\s*function\s+([A-Za-z_$][\w$]*)/);
        if (f) nombres.push(f[1]);
      });
      var cuerpoF = src.join("\n") + "\n;return {" + nombres.map(function (n) {
        return JSON.stringify(n) + ": typeof " + n + ' === "function" ? ' + n + " : null";
      }).join(", ") + "};";
      st.raiz = copia();
      st.envueltos = new WeakMap(); st.reales = new WeakMap();
      try {
        /* eslint-disable-next-line no-new-func */
        st.funciones = new Function("document", "console", "__l", cuerpoF)(doc, consolaCodigo, function (n) { if (st.rec) { st.linea = n; st.ops.push({ tipo: "linea", linea: n }); } });
      } catch (e) {
        st.funciones = {};
        escribir(e.name + ": " + e.message, true);
      }
    }

    // Copia de la página en un documento aparte (las imágenes no se cargan)
    function copia() {
      var tpl = document.createElement("template");
      tpl.innerHTML = "<div>" + cuerpo.innerHTML + "</div>";
      var r = tpl.content.firstChild;
      Array.prototype.forEach.call(r.querySelectorAll("*"), function (el) {
        MIAS.forEach(function (c) { el.classList.remove(c); });
        if (el.getAttribute("class") === "") el.removeAttribute("class");
        if (el.hasAttribute("data-dron-src")) el.setAttribute("src", el.getAttribute("data-dron-src"));
      });
      return r;
    }

    /* ---------- Lo que dice la ficha ---------- */
    function varDe(linea) {
      var m = (st.lineas[linea] || "").match(/^\s*(?:(?:var|let|const)\s+)?([A-Za-z_$][\w$]*)\s*=\s*document\./);
      return m ? m[1] : null;
    }
    function textoLinea(linea) { return (st.lineas[linea] || "").trim().replace(/;$/, ""); }
    function etiqueta(idEl) { // la dirección con la que el código conoce al elemento
      for (var i = st.pins.length - 1; i >= 0; i--) if (st.pins[i].id === idEl) return st.pins[i].label;
      return null;
    }
    function esCondicion(linea) { return /^(\}\s*)?(else\s+)?(if|while)\b/.test((st.lineas[linea] || "").trim()); }
    function hayElse(desde, hasta) {
      for (var j = desde + 1; j < hasta; j++) if (/^\}?\s*else\b/.test((st.lineas[j] || "").trim())) return true;
      return false;
    }

    function textoDe(op, paso, sig) {
      var n, v, lbl, nom;
      if (op.tipo === "buscar") {
        n = op.ids.length; v = varDe(op.linea);
        var dir = v && n ? (op.como === "id" || op.como === "selector" ? " La variable " + C(v) + " guarda su dirección." : " " + C(v) + " guarda la dirección de cada uno: " + direcciones(n) + ".") : "";
        var fuera = "";
        if (op.como === "clase" || op.como === "etiqueta") {
          var dentro = op.ids;
          var sobran = Array.prototype.filter.call(cuerpo.children, function (el) {
            return el.hasAttribute("data-nombre") && dentro.indexOf(idDe(el)) < 0 &&
              !dentro.some(function (d) { return el.querySelector('[data-dron-id="' + d + '"]'); });
          });
          if (sobran.length && sobran.length <= 2) fuera = " " + sobran.map(function (el) {
            return cap(el.getAttribute("data-nombre")) + " no entra porque " + (op.como === "clase" ? "no tiene esa clase." : "es un " + C("<" + el.tagName.toLowerCase() + ">") + ".");
          }).join(" ");
        }
        if (op.como === "id") return C('getElementById("' + op.arg + '")') + (n ? " encuentra el elemento que tiene " + C('id="' + op.arg + '"') + "." + dir : " no encuentra ningún elemento con " + C('id="' + op.arg + '"') + ", así que regresa " + C("null") + ".");
        if (op.como === "clase") return C('getElementsByClassName("' + op.arg + '")') + " busca todos los elementos que tienen la clase " + op.arg + " y los regresa en un arreglo, en el orden en que aparecen: " + (n ? "encontró " + n + "." : "no encontró ninguno.") + fuera + dir;
        if (op.como === "etiqueta") return C('getElementsByTagName("' + op.arg + '")') + " regresa en un arreglo todos los " + C("<" + op.arg + ">") + " de la página, en el orden en que aparecen: " + (n ? "encontró " + n + "." : "no hay ninguno.") + fuera + dir;
        if (op.como === "selector") return C('querySelector("' + op.arg + '")') + (n ? " encuentra el primer elemento que coincide con " + C(op.arg) + "." + dir : " no encuentra nada, así que regresa " + C("null") + ".");
        return C('querySelectorAll("' + op.arg + '")') + " regresa en un arreglo todos los elementos que coinciden con " + C(op.arg) + ": encontró " + n + "." + dir;
      }
      if (op.tipo === "leer") {
        var t = (op.como === "atributo" ? C('getAttribute("' + op.nombre + '")') + " lee el atributo " + op.nombre : C("." + op.nombre) + " lee " + op.nombre) + " " + de(nombreDe(op.id)) + ": vale " + (op.valor === null ? C("null") : op.valor) + ".";
        if (esCondicion(op.linea) && paso.ops[paso.ops.length - 1] === op) {
          var si = sig && sig.linea === op.linea + 1;
          t += si ? " La condición es true, así que corre lo que está dentro del " + C("if") + "."
            : " La condición es false, así que " + (sig && hayElse(op.linea, sig.linea) ? "corre el " + C("else") + "." : "se salta lo de adentro.");
        }
        return t;
      }
      if (op.tipo === "escribir") {
        lbl = etiqueta(op.id); nom = nombreDe(op.id);
        if (CONTENIDO.test(op.nombre)) {
          var quien = "", m = lbl && lbl.match(/\[(\d+)\]$/);
          if (m) {
            var i = +m[1], p = posicion(op.id);
            quien = C(lbl) + " es " + nom + (p && p !== i + 1 ? ": es el " + ORD[i + 1] + " del arreglo, aunque en la página sea el " + ORD_ADJ[p] + " elemento" : "") + ". ";
          }
          return quien + C(op.nombre) + " cambia el contenido " + de(nom) + " por " + q(op.valor) + "." +
            (op.boton ? " El botón estaba adentro, así que también desaparece. Recarga la página para traerlo de vuelta." : "");
        }
        if (op.atributo || op.nombre === "src" || op.nombre === "href") {
          return C(textoLinea(op.linea)) + " escribe " + op.valor + " en el atributo " + op.nombre + " " + de(nom) +
            (op.nombre === "src" ? ", y el navegador carga esa imagen." : ".");
        }
        return C(textoLinea(op.linea)) + " cambia " + op.nombre + " " + de(nom) + " a " + op.valor + ".";
      }
      if (op.tipo === "estilo") {
        nom = nombreDe(op.id);
        var k = kebab(op.nombre);
        if (k !== op.nombre) return C("style." + op.nombre) + " es la propiedad " + C(k) + " de CSS escrita en camel case: sin guion y con la segunda palabra en mayúscula. " + cap(nom) + " queda con " + C(k + ": " + op.valor + ";") + ".";
        return C("style." + op.nombre) + " cambia " + C(op.nombre) + " " + de(nom) + " a " + op.valor + ". " + C(op.nombre) + " es una sola palabra, así que se escribe igual en JavaScript y en CSS.";
      }
      if (op.tipo === "clase") {
        nom = nombreDe(op.id);
        var c = op.clases.join(" "), llamada = C("classList." + op.accion + "(" + op.clases.map(q).join(", ") + ")");
        if (op.accion === "add") {
          if (op.ya.length === op.clases.length) return llamada + " no cambia nada: " + nom + " ya tiene la clase " + c + " y una clase no se repite.";
          return llamada + " le agrega la clase " + c + " " + a(nom) + ", que toma el estilo que esa clase tiene en el CSS" + (clases[c] ? ": " + clases[c] + "." : ".");
        }
        if (op.accion === "remove") return llamada + " le quita la clase " + c + " " + a(nom) + ".";
        return llamada + (op.ya.length ? " le quita la clase " : " le pone la clase ") + c + " " + a(nom) + ".";
      }
      if (op.tipo === "falta") {
        var expr = exprIndice(op);
        return "El arreglo solo tiene " + op.total + " elemento" + (op.total === 1 ? "" : "s") + (op.total ? ", en los lugares " + lugares(op.total) : "") + ". " + C(expr) + " es " + C("undefined") + ": en esa dirección no hay nada, así que la consola marca un error y la función se detiene.";
      }
      if (op.tipo === "error") return "La consola marca un error y la función se detiene.";
      if (op.tipo === "log") return C("console.log") + " escribe " + q(op.texto) + " en la consola.";
      return "";
    }
    function exprIndice(op) {
      var re = /([A-Za-z_$][\w$]*)\s*\[\s*(\d+)\s*\]/g, m, l = st.lineas[op.linea] || "";
      while ((m = re.exec(l))) if (+m[2] === op.indice) return m[1] + "[" + m[2] + "]";
      return "[" + op.indice + "]";
    }

    /* ---------- Marcadores, dron y paquetes ---------- */
    function rel() { return root.getBoundingClientRect(); }
    function codigoAlLado() { return term.getBoundingClientRect().left > cuerpo.getBoundingClientRect().right - 10; }
    function lineaY(n) {
      var p = codeEl.querySelector('[data-part="' + n + '"]') || codeEl;
      var r = p.getBoundingClientRect();
      return r.top + r.height / 2 - rel().top;
    }
    function punto(pin) { // donde aterriza el dron: arriba del elemento, cerca de su orilla derecha
      var r = rel(), b = (pin.caja || real(pin.id)).getBoundingClientRect();
      return { x: b.right - r.left - Math.min(70, b.width * 0.22), y: b.top - r.top + 6 };
    }
    function acomodar() {
      st.pins.forEach(function (p) {
        if (!p.el.isConnected || (!p.caja && !real(p.id))) return;
        var pt = punto(p);
        p.el.style.left = pt.x + "px";
        p.el.style.top = pt.y + "px";
      });
    }
    function marcar(idEl, label, caja) {
      var el = document.createElement("span");
      el.className = "dron-pin" + (caja ? " dron-pin--mal" : "");
      el.setAttribute("aria-hidden", "true");
      el.textContent = label;
      root.appendChild(el);
      var p = { id: idEl, label: label, el: el, caja: caja };
      st.pins.push(p);
      acomodar();
      if (idEl && real(idEl)) real(idEl).classList.add("dron-sel");
      return p;
    }
    function pinDe(idEl) { for (var i = st.pins.length - 1; i >= 0; i--) if (st.pins[i].id === idEl) return st.pins[i]; return null; }
    function salida(n) {
      var r = rel(), t = term.getBoundingClientRect();
      if (codigoAlLado()) return { x: t.left - r.left + 16, y: lineaY(n) + 16 };
      return { x: t.left - r.left + Math.min(90, t.width * 0.25), y: t.top - r.top + 24 };
    }
    function nave(carga, tipo) {
      var d = document.createElement("div");
      d.className = "dron-vuelo";
      d.setAttribute("aria-hidden", "true");
      d.innerHTML = '<span class="dron-vuelo__nave"><img src="' + IMG + '" alt="">' +
        ASPAS.map(function (x) { return '<i class="dron-vuelo__aspa" style="left:' + x[0] + "%;top:" + x[1] + '%"></i>'; }).join("") +
        '</span><span class="dron-vuelo__cuerdas"></span><span class="dron-paquete' + (tipo ? " dron-paquete--" + tipo : "") + '"></span>';
      var pq = d.querySelector(".dron-paquete");
      pq.textContent = carga || "";
      if (!carga) pq.style.visibility = "hidden";
      root.appendChild(d);
      return d;
    }
    function volar(d, de, a, ms) {
      return new Promise(function (resolve) {
        var cx = (de.x + a.x) / 2, cy = Math.min(de.y, a.y) - 50, t0 = null;
        var n = d.querySelector(".dron-vuelo__nave");
        n.style.transform = "rotate(" + (a.x < de.x ? -8 : 8) + "deg)";
        function paso(ts) {
          if (t0 === null) t0 = ts;
          var k = Math.min(1, (ts - t0) / ms), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, u = 1 - e;
          d.style.left = (u * u * de.x + 2 * u * e * cx + e * e * a.x) + "px";
          d.style.top = (u * u * de.y + 2 * u * e * cy + e * e * a.y) + "px";
          if (k < 1) requestAnimationFrame(paso);
          else { n.style.transform = ""; resolve(); }
        }
        requestAnimationFrame(paso);
      });
    }
    function regresar(d, de, n) {
      return volar(d, de, salida(n), 800).then(function () {
        d.classList.add("is-sale");
        setTimeout(function () { d.remove(); }, 380);
      });
    }
    function notaCss(idEl, texto) {
      var el = real(idEl);
      if (!el) return;
      var r = rel(), b = el.getBoundingClientRect(), n = document.createElement("span");
      n.className = "dron-nota";
      n.setAttribute("aria-hidden", "true");
      n.textContent = texto;
      n.style.left = (b.left - r.left + 8) + "px";
      n.style.top = (b.bottom - r.top + 8) + "px";
      root.appendChild(n);
      setTimeout(function () { n.remove(); }, 2700);
    }
    function limpiar() {
      st.pins = [];
      Array.prototype.forEach.call(root.querySelectorAll(".dron-pin, .dron-vuelo, .dron-vacio, .dron-nota"), function (e) { e.remove(); });
      Array.prototype.forEach.call(codeEl.querySelectorAll(".is-ligada"), function (e) { e.classList.remove("is-ligada"); });
      Array.prototype.forEach.call(cuerpo.querySelectorAll(".dron-sel"), function (e) { e.classList.remove("dron-sel"); });
    }

    /* Lo que el código le hizo a la copia se le hace ahora a la página real */
    function aplicar(op) {
      var el = real(op.id);
      if (!el) return;
      if (op.tipo === "escribir") {
        if (op.html !== null && op.html !== undefined) { el.innerHTML = op.html; preparar(el); }
        else if (op.atributo || op.nombre === "src" || op.nombre === "href") {
          if (op.nombre === "src" && el.tagName === "IMG") {
            el.classList.add("dron-cambia");
            setTimeout(function () {
              el.setAttribute("data-dron-src", op.valor);
              el.setAttribute("src", ruta(op.valor));
              el.classList.remove("dron-cambia");
            }, 260);
          } else el.setAttribute(op.nombre, op.valor);
        } else el[op.nombre] = op.valor;
      } else if (op.tipo === "estilo") el.style[op.nombre] = op.valor;
      else if (op.tipo === "clase") el.classList[op.accion].apply(el.classList, op.clases);
      el.classList.add("dron-sel");
      reinicia(el, "dron-flash");
    }

    function vivo(mio) { return mio === st.turno; }

    async function animar(op, mio) {
      var d, de, b, pin;
      if (op.tipo === "linea") return;
      if (op.tipo === "log") { escribir(op.texto); return; }
      if (op.tipo === "error") { escribir(op.texto, true); return; }
      if (op.tipo === "buscar") {
        var v = varDe(op.linea);
        var ligada = codeEl.querySelector('[data-part="' + op.linea + '"] .dron-var');
        if (ligada) ligada.classList.add("is-ligada");
        var varios = !(op.como === "id" || op.como === "selector");
        for (var i = 0; i < op.ids.length; i++) {
          marcar(op.ids[i], (v || (op.como === "id" ? "#" + op.arg : op.arg)) + (varios ? "[" + i + "]" : ""));
          await espera(380);
          if (!vivo(mio)) return;
        }
        return espera(400);
      }
      if (op.tipo === "falta") {
        var ult = real(op.ids[op.ids.length - 1]) || cuerpo;
        var r = rel(), u = ult.getBoundingClientRect();
        var caja = document.createElement("div");
        caja.className = "dron-vacio";
        caja.setAttribute("aria-hidden", "true");
        caja.textContent = "?";
        caja.style.left = (u.left - r.left) + "px";
        caja.style.top = (u.bottom - r.top + 16) + "px";
        caja.style.width = u.width + "px";
        root.appendChild(caja);
        pin = marcar(null, exprIndice(op), caja);
        if (reduce) return;
        de = salida(op.linea);
        // lo que iba a entregar: el valor después del = en ese renglón
        var iba = (st.lineas[op.linea] || "").match(/=\s*("[^"]*"|'[^']*')/);
        d = nave(iba ? iba[1] : "?");
        b = punto(pin);
        await volar(d, de, b, 1000);
        if (!vivo(mio)) return;
        reinicia(d, "is-busca");
        await espera(1000);
        if (!vivo(mio)) return;
        var pm = d.querySelector(".dron-paquete");
        pm.textContent = "undefined";
        pm.style.visibility = "";
        pm.className = "dron-paquete dron-paquete--mal";
        await regresar(d, b, op.linea);
        caja.classList.add("is-quita");
        pin.el.classList.add("is-quita");
        return;
      }
      pin = pinDe(op.id);
      if (!pin && real(op.id)) pin = marcar(op.id, "");
      if (!pin) return;
      if (op.tipo === "leer") {
        if (reduce) return;
        de = salida(op.linea);
        d = nave("", "lee");
        b = punto(pin);
        await volar(d, de, b, 950);
        if (!vivo(mio)) return;
        reinicia(real(op.id), "dron-flash");
        var nota = d.querySelector(".dron-paquete");
        nota.textContent = op.valor === null ? "null" : q(op.valor);
        nota.style.visibility = "";
        await espera(450);
        await regresar(d, b, op.linea);
        return;
      }
      /* escribir, estilo o clase: el dron lleva el valor nuevo */
      var carga = op.tipo === "clase" ? q(op.clases.join(" ")) : q(op.valor);
      if (!reduce) {
        de = salida(op.linea);
        d = nave(carga.length > 34 ? carga.slice(0, 32) + "…\"" : carga);
        b = punto(pin);
        await volar(d, de, b, 1050);
        if (!vivo(mio)) return;
        d.querySelector(".dron-paquete").classList.add("is-suelta");
        await espera(380);
        if (!vivo(mio)) return;
      }
      aplicar(op);
      if (op.tipo === "estilo") notaCss(op.id, kebab(op.nombre) + ": " + op.valor + ";");
      if (op.tipo === "clase") notaCss(op.id, 'class="' + (real(op.id).getAttribute("class") || "").split(" ").filter(function (c) { return MIAS.indexOf(c) < 0; }).join(" ") + '"');
      if (d) regresar(d, b, op.linea);
      setTimeout(acomodar, 300);
      return espera(450);
    }

    async function correr(nombre) {
      var fn = st.funciones[nombre];
      if (st.ocupado || typeof fn !== "function") return;
      st.ocupado = true;
      var mio = ++st.turno;
      limpiar();
      st.raiz = copia();
      st.envueltos = new WeakMap(); st.reales = new WeakMap();
      st.ops = []; st.linea = -1; st.rec = true;
      var error = null;
      try { fn(); } catch (e) { error = e; }
      st.rec = false;
      if (error) {
        var ult = st.ops[st.ops.length - 1];
        st.ops.push({ tipo: "error", linea: st.linea, texto: ult && ult.tipo === "falta" ? "TypeError: " + exprIndice(ult) + " is undefined" : error.name + ": " + error.message });
      }

      // Un paso por renglón que corrió
      var pasos = [], actual = null;
      st.ops.forEach(function (op) {
        if (op.tipo === "linea") { actual = { linea: op.linea, ops: [] }; pasos.push(actual); }
        else if (actual) actual.ops.push(op);
      });
      var previo = -1;
      for (var i = 0; i < pasos.length; i++) {
        if (!vivo(mio)) return;
        var paso = pasos[i], lineas = [paso.linea];
        // Al brincar al else también se marca su renglón
        if (previo >= 0 && paso.linea > previo + 1) {
          for (var j = previo + 1; j < paso.linea; j++) if (/^\}?\s*else\b/.test(st.lineas[j].trim())) lineas.unshift(j);
        }
        previo = paso.linea;
        resaltar(lineas);
        var textos = paso.ops.map(function (op) { return textoDe(op, paso, pasos[i + 1]); }).filter(Boolean);
        // con un error, la ficha explica el error y no lo que iba a pasar
        if (paso.ops.some(function (op) { return op.tipo === "falta"; })) textos = [textoDe(paso.ops.filter(function (op) { return op.tipo === "falta"; })[0], paso)];
        if (textos.length) explicar(textos.join(" "));
        for (var k = 0; k < paso.ops.length; k++) {
          await animar(paso.ops[k], mio);
          if (!vivo(mio)) return;
          if (paso.ops[k].tipo === "falta") break;
        }
        if (paso.ops.some(function (op) { return op.tipo === "error" || op.tipo === "falta"; })) {
          var err = paso.ops.filter(function (op) { return op.tipo === "error"; })[0];
          if (err && paso.ops.indexOf(err) > k) escribir(err.texto, true);
          break;
        }
        await espera(paso.ops.length ? 700 : 900);
      }
      if (!vivo(mio)) return;
      apagar();
      st.ocupado = false;
    }

    function recargar(texto) {
      st.turno++;
      st.ocupado = false;
      apagar();
      limpiar();
      cargarPagina();
      compilar();
      explicar(texto || textoIntro);
    }

    cuerpo.addEventListener("click", function (e) {
      var b = e.target.closest("[data-dron-fn]");
      if (b) { e.preventDefault(); correr(b.getAttribute("data-dron-fn")); }
    });
    recargarBtn.addEventListener("click", function () {
      reinicia(recargarBtn, "is-gira");
      recargar("La página se volvió a cargar: todo regresó a como estaba en el HTML.");
    });
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(acomodar);
      ro.observe(root);
      ro.observe(cuerpo);
    }

    pintarCodigo();
    cargarPagina();
    compilar();
    expEl.innerHTML = textoIntro;
    expEl._html = textoIntro;
  }

  Array.prototype.forEach.call(raices, crear);
})();
