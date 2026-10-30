// Módulos del menú lateral, con la lista de assets/js/paginas.js. Va en el
// lugar del comentario <!-- modulos … --> de NavBar.html.
function menuModulos(){
    return CURSO.map(function(modulo, i){
        var n = i + 1;
        var temas = modulo.temas.map(function(tema, j){
            return '<li class="nav-item dropdown"> <a href="html/modulo' + n + '/modulo' + n + '-' + (j + 1) + '.html" class="side-index-general"> ' + tema + ' </a> </li>';
        });
        return '<li class="nav-item dropdown"> <a class="dropdown-toggle" href="javascript:void(0);"> ' +
            '<span class="title side-index-general">Módulo ' + n + ': ' + modulo.titulo + '</span> ' +
            '<span class="arrow"> <i class="ti-angle-right"></i> </span> </a> ' +
            '<ul class="dropdown-menu"> ' + temas.join(' ') + ' </ul> </li>';
    }).join(' ');
}

$(document).ready(function(){
    //file with relative path to index outside html folder
    $.get(Curso.ruta()+"assets/js/recycled/NavBar.html", function(html_string){
        html_string = html_string.replace(/<!-- modulos[^>]*-->/, menuModulos());
        $("#sideNav").html(html_string); 
        $("#sideNav a").each(function() {
            
            var _href = this.getAttribute("href"); 
            if( typeof(_href) != 'undefined' && _href!="" && _href.search(".html")!=-1){
                $(this).prop("href", Curso.ruta()+_href);
            }
        });
        $("div#sideNav > div > div.side-nav-logo > a > div.logo").each(function(){
            $(this).css("background-image","url("+Curso.ruta()+"assets/images/logo/logo.png)");
        });
    });
    $.get(Curso.ruta()+"assets/js/recycled/footer.html", function(html_string){
        $("footer.content-footer").html(html_string); 
        $("footer.content-footer a").each(function() {
            
            var _href = this.getAttribute("href"); 
            if( typeof(_href) != 'undefined' && _href!="" && _href.search(".html")!=-1){
                $(this).prop("href", Curso.ruta()+_href);
            }
        });
    });
    $.get(Curso.ruta()+"assets/js/recycled/headerstart.html", function(html_string){
        $("div.header.navbar").html(html_string); 
        $("div.header.navbar a").each(function() {
            
            var _href = this.getAttribute("href"); 
            if( typeof(_href) != 'undefined' && _href!="" && _href.search(".html")!=-1){
                $(this).prop("href", Curso.ruta()+_href);
            }
        });
        $("div.header.navbar img").each(function() {
            var _href = this.getAttribute("src"); 
            if( typeof(_href) != 'undefined' && _href!="" && _href.search("assets/images/")!=-1){
                $(this).prop("src", Curso.ruta()+_href);
            }
        });
    });


});
