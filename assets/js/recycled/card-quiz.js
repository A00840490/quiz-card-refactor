function getPath() {
    var str = window.location.href;
    var str_array = str.split('/');
    var construct = false;
    var res = "";
    str_array.forEach(element => {
        if (construct) {
            res += "../";
            return;
        }
        element = element.toLowerCase();
        if (element == "html" || element == "src") {
            construct = true;
        }
    });
    return res;
}

$(document).ready(function () {

    $.get(getPath() + "html/card-quiz/card-quiz.html", function (html_string) {
        // 1. Convertir la cadena a nodos DOM en memoria sin insertarlos al documento
        var $nodes = $($.parseHTML(html_string, document, true));

        // 2. Modificar las rutas de los estilos antes de que el navegador intente cargarlos
        $nodes.find("link").addBack("link").each(function () {
            var _href = $(this).attr("href");

            if (_href && _href.indexOf("assets/css/") !== -1) {
                $(this).attr("href", getPath() + _href);
            }
        });

        // 3. Insertar los nodos ya corregidos al DOM
        $("#cardQuiz").empty().append($nodes);
    });

});
