$(document).ready(function () {

    $.get(Curso.ruta() + "html/card-quiz/card-quiz.html", function (html_string) {
        // 1. Convertir la cadena a nodos DOM en memoria sin insertarlos al documento
        var $nodes = $($.parseHTML(html_string, document, true));

        // 2. Modificar las rutas de los estilos antes de que el navegador intente cargarlos
        $nodes.find("link").addBack("link").each(function () {
            var _href = $(this).attr("href");

            if (_href && _href.indexOf("assets/css/") !== -1) {
                $(this).attr("href", Curso.ruta() + _href);
            }
        });

        // 3. Insertar los nodos ya corregidos al DOM
        $("#cardQuiz").empty().append($nodes);
    });

});
