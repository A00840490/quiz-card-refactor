/* Colores del código del curso: la etiqueta o el selector va en .codetag y el
   texto entre etiquetas o el valor de una propiedad en .codetext (app.css).
   Lo usan los demos (demo.js) y los bloques de código sin previsualización.

   Un bloque de código se escribe tal cual, sin &lt; y con la sangría que se
   quiera, dentro de su <p class="code">:

     <p class="code" data-codigo>
       <script type="text/x-codigo">
         <a href="https://www.google.com.mx">¡Este enlace te lleva a Google!</a>
       </script>
     </p>

   data-codigo="css" si el código es una hoja de estilos y data-codigo="js" si
   es JavaScript (los textos entre comillas en .codetext y los comentarios
   // en gris); si no, es HTML, y lo que va dentro de <style> se colorea como
   CSS. Aquí se colorea y se separa en líneas con <br>; lesson-demo.js le pone
   después sus números, así que este archivo se carga antes que lesson-demo.js
   y demo.js.

   Para los gráficos con su propio código:
     Codigo.limpiar(texto)                        líneas sin la sangría común
     Codigo.colorear(lineas, "html"|"css"|"js")   pedazos de cada línea
     Codigo.html(pedazos)                         el HTML coloreado, una línea por <br> */
(function () {
  "use strict";

  var esc = Curso.esc;

  // Quita las líneas vacías del principio y del final y la sangría que todas comparten
  function limpiar(texto) {
    var lineas = (texto || "").replace(/\r/g, "").replace(/\t/g, "  ").split("\n");
    while (lineas.length && !lineas[0].trim()) lineas.shift();
    while (lineas.length && !lineas[lineas.length - 1].trim()) lineas.pop();
    var sangria = Math.min.apply(null, lineas.filter(function (l) { return l.trim(); }).map(function (l) {
      return l.match(/^ */)[0].length;
    }).concat([Infinity]));
    return lineas.map(function (l) { return l.slice(Math.min(sangria, l.match(/^ */)[0].length)).replace(/\s+$/, ""); });
  }

  /* Cada línea queda en pedazos { tipo, t }: "tag" (.codetag), "text"
     (.codetext), "com" (comentario de JavaScript, .js-term__com), "plain" o
     "valor" (donde iba la marca; demo.js pone ahí el botón del menú). */
  function colorear(lineas, lenguaje, marca) {
    var modo = lenguaje === "css" || lenguaje === "js" ? lenguaje : "html";
    var pila = [];           // CSS: "regla" o "arroba" por cada { abierta
    var enEtiqueta = false;  // HTML: una etiqueta que sigue en la siguiente línea
    var etiqueta = "";
    var comentario = false;

    return lineas.map(function (l) {
      var p = [];

      function add(tipo, t) {
        (marca ? String(t).split(marca) : [String(t)]).forEach(function (pedazo, i) {
          if (i) p.push({ tipo: "valor" });
          if (pedazo) p.push({ tipo: tipo, t: pedazo });
        });
      }

      // Los espacios de las orillas van sin color
      function conOrillas(tipo, t) {
        var m = t.match(/^(\s*)([\s\S]*?)(\s*)$/);
        add("plain", m[1]);
        add(tipo, m[2]);
        add("plain", m[3]);
      }

      function css(s) {
        var j = 0;
        while (j < s.length) {
          var resto = s.slice(j), m;
          if (comentario || resto.indexOf("/*") === 0) {
            var fin = resto.indexOf("*/", comentario ? 0 : 2);
            comentario = fin < 0;
            m = comentario ? resto : resto.slice(0, fin + 2);
            add("plain", m);
            j += m.length;
          } else if ((m = resto.match(/^\s+/))) {
            add("plain", m[0]);
            j += m[0].length;
          } else if (resto.charAt(0) === "}") {
            pila.pop();
            add("plain", "}");
            j++;
          } else if (pila[pila.length - 1] === "regla") {
            // Declaración: la propiedad sin color y el valor en .codetext
            m = resto.match(/^([^:;{}]*):([^;{}]*)(;?)/);
            if (m) {
              add("plain", m[1] + ":");
              conOrillas("text", m[2]);
              add("plain", m[3]);
            } else {
              m = resto.match(/^[^;}]*;?/);
              add("plain", m[0]);
            }
            j += m[0].length || 1;
          } else if (resto.charAt(0) === "@") {
            // @media y compañía van sin color
            m = resto.match(/^[^{;]*([{;]?)/);
            add("plain", m[0]);
            if (m[1] === "{") pila.push("arroba");
            j += m[0].length;
          } else {
            // Selectores separados por comas
            m = resto.match(/^([^{]*)(\{?)/);
            m[1].split(",").forEach(function (sel, i) {
              if (i) add("plain", ",");
              conOrillas("tag", sel);
            });
            if (m[2]) {
              add("plain", "{");
              pila.push("regla");
            }
            j += m[0].length;
          }
        }
      }

      if (modo === "js") {
        var re = /\/\/.*$|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, j = 0, m;
        while ((m = re.exec(l))) {
          add("plain", l.slice(j, m.index));
          add(m[0].charAt(0) === "/" ? "com" : "text", m[0]);
          j = m.index + m[0].length;
        }
        add("plain", l.slice(j));
        return p;
      }

      var i = 0;
      while (i < l.length) {
        var resto = l.slice(i), m, fin;
        if (modo === "css") {
          fin = resto.indexOf("</");
          css(fin < 0 ? resto : resto.slice(0, fin));
          if (fin < 0) break;
          modo = "html";
          i += fin;
        } else if (comentario) {
          fin = resto.indexOf("-->");
          comentario = fin < 0;
          add("plain", comentario ? resto : resto.slice(0, fin + 3));
          i += comentario ? resto.length : fin + 3;
        } else if (enEtiqueta) {
          // Atributos sin color, hasta el >
          fin = resto.indexOf(">");
          add("plain", fin < 0 ? resto : resto.slice(0, fin + 1));
          if (fin < 0) break;
          enEtiqueta = false;
          if (etiqueta === "style") modo = "css";
          i += fin + 1;
        } else if ((m = resto.match(/^<(![A-Za-z][^>]*)>/))) {
          // <!DOCTYPE html>: la declaración va en .codetag
          add("plain", "<");
          add("tag", m[1]);
          add("plain", ">");
          i += m[0].length;
        } else if (resto.indexOf("<!--") === 0) {
          comentario = true;
          add("plain", "<!--");
          i += 4;
        } else if ((m = resto.match(/^<(\/?)([\w-]+)/))) {
          add("plain", "<" + m[1]);
          add("tag", m[2]);
          etiqueta = m[1] ? "" : m[2].toLowerCase();
          enEtiqueta = true;
          i += m[0].length;
        } else {
          // Texto entre etiquetas
          fin = resto.indexOf("<", resto.charAt(0) === "<" ? 1 : 0);
          m = fin < 0 ? resto : resto.slice(0, fin);
          conOrillas("text", m);
          i += m.length;
        }
      }
      return p;
    });
  }

  // El bloque no conserva los espacios (white-space normal, como los escritos a
  // mano): la sangría va con espacios duros y de varios espacios seguidos solo
  // el último se queda normal, para que la línea se pueda partir ahí
  function html(pedazos) {
    return pedazos.map(function (linea) {
      var inicio = true;
      return linea.map(function (pd) {
        var t = pd.t || "";
        if (inicio) {
          t = t.replace(/^ +/, function (m) { return m.replace(/ /g, "\u00a0"); });
          if (/[^\u00a0]/.test(t)) inicio = false;
        }
        t = t.replace(/ {2,}/g, function (m) { return m.slice(1).replace(/ /g, "\u00a0") + " "; });
        t = esc(t).replace(/\u00a0/g, "&nbsp;");
        if (pd.tipo === "tag") return "<span class=\"codetag\">" + t + "</span>";
        if (pd.tipo === "text") return "<span class=\"codetext\">" + t + "</span>";
        if (pd.tipo === "com") return "<span class=\"js-term__com\">" + t + "</span>";
        return t;
      }).join("");
    }).join("<br>");
  }

  window.Codigo = { limpiar: limpiar, colorear: colorear, html: html };

  Array.prototype.forEach.call(document.querySelectorAll("[data-codigo]"), function (el) {
    var fuente = el.querySelector("script[type=\"text/x-codigo\"]");
    if (!fuente) return;
    var lenguaje = el.getAttribute("data-codigo") || "html";
    el.innerHTML = html(colorear(limpiar(fuente.textContent), lenguaje));
  });
})();
