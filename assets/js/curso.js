/* Scripts comunes de todas las páginas del curso.
   Cada página carga solo este archivo al final del <body>:
     <script src="../../assets/js/curso.js"></script>
   y después, si los tiene, los scripts de su tema (assets/js/scripts/...).
   Aquí se escriben, en orden, las etiquetas de las librerías, de la plantilla
   (menú, encabezado, pie y avance) y de los componentes del curso. El
   navegador las carga una tras otra como si estuvieran escritas en la página,
   así que el script del tema ya encuentra jQuery, MenuVidrio, LessonDemo, etc.
   Cada componente solo actúa si la página trae su marcado. */
(function () {
  var base = document.currentScript.src.replace(/js\/curso\.js(\?.*)?$/, "");

  [
    // Librerías
    "vendors/jquery/dist/jquery.min.js",
    "vendors/popper.js/dist/umd/popper.min.js",
    "vendors/bootstrap/dist/js/bootstrap.js",
    "vendors/PACE/pace.min.js",
    "vendors/perfect-scrollbar/js/perfect-scrollbar.jquery.js",
    "js/progressbar.js",

    // Utilidades del curso (Curso.esc, Curso.reduce, Curso.ruta), antes de
    // todo lo que las usa
    "js/curso-util.js",

    // Plantilla del curso: la lista de páginas va antes del menú y del avance
    // (url-script.js), y el avance antes del círculo (progress-circle.js)
    "js/paginas.js",
    "js/progress/url-script.js",
    "js/progress-circle.js",
    "js/app.js",
    "js/recycled/navigationbar.js",

    // Componentes del curso (codigo.js antes de demo.js y lesson-demo.js,
    // que usan los bloques que colorea)
    "js/js-terminal.js",
    "js/menu-vidrio.js",
    "js/codigo.js",
    "js/demo.js",
    "js/lesson-demo.js",
    "js/grafico-ficha.js",
    "js/demo-carousel.js",
    "js/evo-card.js",
    "js/ejercicio-final.js",
  ].forEach(function (src) {
    document.write('<script src="' + base + src + '"><\/script>');
  });
})();
