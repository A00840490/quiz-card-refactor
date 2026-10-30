/* Utilidades que comparten los scripts del curso.
   curso.js lo carga antes de la plantilla y de los componentes, así que
   cualquier script (también los de cada tema) puede usar:
     Curso.esc(texto)  texto listo para ir dentro de HTML o de un atributo
     Curso.reduce      true si el sistema pide menos movimiento
     Curso.ruta()      ruta de la página a la raíz del sitio ("../../" en
                       html/moduloN/, "" en index.html) */
window.Curso = {
  esc: function (s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  },

  reduce: !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches),

  // Un "../" por cada carpeta después de html/ (o src/) en la dirección.
  ruta: function () {
    var res = "";
    var dentro = false;
    window.location.href.split("/").forEach(function (parte) {
      if (dentro) {
        res += "../";
        return;
      }
      parte = parte.toLowerCase();
      if (parte == "html" || parte == "src") dentro = true;
    });
    return res;
  },
};
