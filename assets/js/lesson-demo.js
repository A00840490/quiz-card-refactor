/* Demo de lección (assets/css/lesson-demo.css): numera las líneas del código.
   Los bloques de código separan sus líneas con <br>; aquí cada línea se
   envuelve en <span class="ld-line"> y el CSS le pone su número a la
   izquierda con un contador. Si una línea es larga y se parte en dos, el
   número queda solo en el primer renglón. */
(function () {
  "use strict";

  var SELECTOR = [
    '.lesson-demo > [class*="col-"]:first-child p.code',
    ".lesson-demo-stack p.code",
    ".lesson-demo-activity--editor p.code",
  ].join(",");

  function isBlank(nodes) {
    return nodes.every(function (n) {
      return n.nodeType === Node.TEXT_NODE && !n.textContent.trim();
    });
  }

  document.querySelectorAll(SELECTOR).forEach(function (code) {
    if (code.classList.contains("code--numbered")) return;

    // Agrupa los nodos de primer nivel en líneas, cortando en cada <br>.
    var lines = [[]];
    Array.prototype.slice.call(code.childNodes).forEach(function (node) {
      if (node.nodeName === "BR") lines.push([]);
      else lines[lines.length - 1].push(node);
    });

    // Quita las líneas vacías del principio y del final (solo espacios del HTML).
    while (lines.length && isBlank(lines[0])) lines.shift();
    while (lines.length && isBlank(lines[lines.length - 1])) lines.pop();
    if (!lines.length) return;

    var frag = document.createDocumentFragment();
    lines.forEach(function (nodes) {
      var line = document.createElement("span");
      line.className = "ld-line";
      nodes.forEach(function (n) {
        line.appendChild(n);
      });
      // Una línea vacía a propósito conserva su altura.
      if (isBlank(nodes)) line.innerHTML = "&nbsp;";
      frag.appendChild(line);
    });

    code.textContent = "";
    code.appendChild(frag);
    code.classList.add("code--numbered");
  });
})();
