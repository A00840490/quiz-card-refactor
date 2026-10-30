function getstr(str) {
    return str.substring(str.search("html"));
}

// Solo las páginas de módulo (html/moduloN/moduloN-M.html) llevan botones de
// avance y porcentajes; curso.js carga este script en todas las páginas.
function isValid() {
    return /\/html\/modulo\d+\/modulo\d+-\d+\.html$/.test(window.location.pathname);
}

function getfilename() {
    var url = window.location.href;
    var filename = url.substring(url.lastIndexOf('/') + 1);
    if (filename == "") {
        return "index.html";
    }

    return filename;
}

function getModuloPercentage() {
    var res = 0;

    var files = getFiles();
    var url = window.location.href;
    url = url.substr(url.indexOf("html/"));
    var url_split = url.split('/');
    url_split.shift(); // aqui solo se tiene modulo1/modulo2-1.html
    var jsonTmp = files[url_split.shift()]; // se tiene el modulo como objeto
    let nombrePag = url_split[0]; // se saca el nombre de la pagina que se busca
    var totalLevel = 100;

    let numPag;
    let thisPage;
    for (page in jsonTmp) {
        thisPage = jsonTmp[page];
        if (thisPage == nombrePag) {
            numPag = parseInt(page);
        }
    }

    totalLevel = totalLevel / Object.keys(jsonTmp).length;

    return (totalLevel * numPag).toFixed(0);

}

function getTotalPercentage() {
    var res = 0;

    var files = getFiles();
    var url = window.location.href;
    url = url.substr(url.indexOf("html/"));
    var url_split = url.split('/');
    url_split.shift(); // se deshace del html
    let nombreMod = url_split[0];
    let nombrePag = url_split[1];

    // calcula el numero de paginas que hay
    let numPags = 0;
    let numPagsPasadas = 0;
    let status = true;
    let thisMod;
    let thisPage;
    for (modulo in files) {
        numPags += Object.keys(files[modulo]).length;

        if (modulo == nombreMod) {
            thisMod = files[modulo];
            for (pagNum in thisMod) {
                thisPage = thisMod[pagNum];
                if (thisPage == nombrePag) {
                    numPagsPasadas += parseInt(pagNum);
                    status = false;
                    break;
                }
            }
        } else if (status) {
            numPagsPasadas = numPags;
        }
    }
    return ((numPagsPasadas) / numPags).toFixed(2);
}

function generatePage(name, count) {
    var html = "";
    if (name == "temario") {
        html += '<a class="btn btn-default" role="button" href="../temario/temario.html"';
    }
    if (name == "index.html") { name = ""; }
    if (count == "Atrás" || count == "Siguiente") {
        html += '<a class="btn btn-default" role="button" href="./' + name + '">';
    } else {
        html += '<a class="btn btn-default" role="button" id="' + (name == "" ? "index.html" : name) + '" href="./' + name + '">';
    }
    html += '<span>' + count + '</span>';
    html += '</a>';
    return html;
}

function getLast() {
    var url = window.location.href;
    url = url.substr(url.indexOf("html/"));
    var url_split = url.split('/');
    url_split.pop();
    // alert(url_split.join('/'));
    // if(getSpecialLasts().hasOwnProperty(url_split.join('/')))
    //     return getSpecialLasts().url_split.join('/');
    url_split.pop();
    var res = "";
    var flag = false;
    for (var i = url_split.length - 1; i >= 0; i--) {
        if (url_split[i].indexOf("modulo") != -1) {
            flag = true;
            res += "../";
            break;
        } else {
            res += "../";
        }
    }
    if (!flag) {
        res += "temario/";
    }
    return res;
}

function getMovementBar() {
    var res = 0;

    var files = getFiles();
    var url = window.location.href;
    url = url.substr(url.indexOf("html/"));
    var url_split = url.split('/');
    url_split.shift();

    var jsonTmp = files;
    var idtmp;

    //Get Id
    for (var i = 0; i < url_split.length; i++) {
        if (!jsonTmp.hasOwnProperty(url_split[i])) {
            if (i != url_split.length - 1) { break; }
            if (url_split[i] == "") { url_split[i] = "index.html"; }
            for (idtmp in jsonTmp) {
                if (jsonTmp[idtmp] == url_split[i]) {
                    break;
                }
            }
        } else {
            jsonTmp = jsonTmp[url_split[i]];
        }
    }


    var filescount = Object.keys(jsonTmp).length;

    var html = "";
    var html_back = "";
    var count = 0;



    //before button
    if (parseInt(idtmp) > 1) {
        html_back += generatePage(jsonTmp[parseInt(idtmp) - 1], "Atrás");
    } else {
        html_back += generatePage("temario", "Atrás");
    }

    // hay 4 archivos
    var rightmax = filescount - parseInt(idtmp);
    var leftmax = parseInt(idtmp) - 1; // inclusivo con la pag actual
    leftmax = leftmax >= 2 ? 2 : leftmax;
    leftmax = rightmax >= 2 ? leftmax : 4 - rightmax;


    //before overall max 5
    for (var left = parseInt(idtmp) - 1; left > 0 && count < leftmax; left--) {
        html = generatePage(jsonTmp[left], left) + html;
        count++;
    }
    html = html_back + html;
    /*
    if(getLast().indexOf("temario")==-1){
        html=html+generatePage(jsonTmp[idtmp],parseInt(idtmp));count++;
    }
    */
    html = html + generatePage(jsonTmp[idtmp], parseInt(idtmp));
    count++;
    //after overall max 5
    for (var right = parseInt(idtmp) + 1; right <= filescount && count < 5; right++) {
        html = html + generatePage(jsonTmp[right], right);
        count++;
    }
    //after button
    if (parseInt(idtmp) + 1 <= filescount) {
        html += generatePage(jsonTmp[parseInt(idtmp) + 1], "Siguiente");
    } else {
        html += generatePage("temario", "Siguiente");
    }

    return html;
}
// Mapa de los archivos de cada módulo, sacado de la lista de assets/js/paginas.js:
// { modulo1: { 1: "modulo1-1.html", 2: "modulo1-2.html", … }, … }. Cada módulo
// cuenta sus temas más la página de cierre.
function getFiles() {
    var files = {};
    CURSO.forEach(function (modulo, i) {
        var n = i + 1;
        var paginas = {};
        for (var p = 1; p <= modulo.temas.length + 1; p++) {
            paginas[p] = "modulo" + n + "-" + p + ".html";
        }
        files["modulo" + n] = paginas;
    });
    return files;
}


// Final de cada página de módulo: en el lugar de <div data-avance></div> van
// los botones de avance (menos en la página de cierre del módulo) y el cuadro
// de "Tu Progreso". Se arma en cuanto carga este script, antes de
// progress-circle.js, que dibuja el círculo dentro de #circlecontainer.
function avanceHtml() {
    var m = window.location.pathname.match(/modulo(\d+)-(\d+)\.html$/);
    var modulo = parseInt(m[1]);
    var cierre = parseInt(m[2]) == CURSO[modulo - 1].temas.length + 1;
    return (cierre ? '' : '<div class="mrg-btm-20 text-center"><div class="btn-group"></div></div>') +
        '<div class="card widget-feed"><div class="row">' +
        '<div class="col-lg-8">' +
        '<h1 class="feed-title tag tag-info">Módulo ' + modulo + '</h1>' +
        '<h3 class="feed-subtitle">Tu Progreso</h3>' +
        '<div class="progress" style="height: 20px;" id="bar">' +
        '<div class="progress-bar bg-info" role="progressbar" aria-valuemin="0" aria-valuemax="100"></div>' +
        '</div></div>' +
        '<div class="col-lg-4">' +
        '<div id="circlecontainer"></div>' +
        '<div class="text-center"><h3 class="feed-subtitle">Progreso General del Curso</h3></div>' +
        '</div></div></div>';
}

if (isValid()) {
    var lugarAvance = document.querySelector("[data-avance]");
    if (lugarAvance) lugarAvance.outerHTML = avanceHtml();
}

$(document).ready(function() {
    if (isValid()) {

        $(".btn-group").html(getMovementBar());
        setTimeout(function() {
            // Las páginas de cierre de módulo no tienen botones de avance
            var actual = document.getElementById(getfilename());
            if (!actual) return;
            actual.classList.remove("btn-default");
            actual.classList.add("btn-actual-page");
        }, 250);

        show(getTotalPercentage());
        let modulePercentage = getModuloPercentage();
        document.getElementsByClassName("progress-bar")[0].innerHTML = modulePercentage + "%";
        document.getElementsByClassName("progress-bar")[0].setAttribute("aria-valuenow", modulePercentage);
        document.getElementsByClassName("progress-bar")[0].style.maxWidth = "" + modulePercentage + "%";
        document.getElementsByClassName("progress-bar")[0].style.minWidth = "" + 5 + "%";

    }

});