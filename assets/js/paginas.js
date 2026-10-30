/* Lista única de las páginas del curso. De aquí salen los módulos del menú
   lateral (navigationbar.js), los botones de avance entre páginas y los
   porcentajes de "Tu Progreso" (url-script.js).

   Cada módulo vive en html/moduloN/ (N es su lugar en la lista, desde 1) y sus
   temas se llaman moduloN-1.html, moduloN-2.html, … en el orden de "temas".
   Después del último tema va la página de cierre del módulo
   (moduloN-<número de temas + 1>.html): cuenta para el avance, pero no sale en
   el menú.

   Para agregar, quitar o mover un tema basta con cambiarlo aquí y numerar los
   archivos en el mismo orden. Los títulos se escriben como HTML. */
window.CURSO = [
  {
    titulo: "Preparación del Ambiente y Conceptos Básicos",
    temas: [
      "Introducción",
      "Conceptos Básicos",
      "Otros Conceptos que Debes Conocer",
      "Preparación del Ambiente de Trabajo",
      "Introducción a VS Code",
      "Organización de archivos",
      "Escribiendo código",
      "Otras Recomendaciones",
      "Atajos",
      "Ejercicio 1",
    ],
  },
  {
    titulo: "Formato y Estructura de HTML",
    temas: [
      "Introducción",
      "Estructura Básica",
      "Encabezados",
      "Párrafos",
      "Formatear Texto",
      "Ejemplo de un Texto Formateado",
      "Listas",
      "Listas Descriptivas",
      "Imágenes",
      "Recursos de Imágenes Gratuitas",
      "Formularios",
      "Enlaces",
      "Enlaces Internos",
      "Otros Elementos",
      "Spans y Entidades",
      "Ejercicio 2",
    ],
  },
  {
    titulo: "Decorando con CSS",
    temas: [
      "Introducción",
      "Formato de CSS",
      "Agregar CSS a Nuestro HTML",
      "IDs y clases",
      "Atajos de Clases e IDs",
      "Divisiones",
      "Elementos Dentro de una División",
      "Estilos en Cascada",
      "Colores y Relleno",
      "Más Propiedades de Color",
      "Métodos de Posicionamiento",
      "Posicionamientos Flotantes",
      "Márgenes y Padding",
      "Diferentes Formas de Usar Margin y Padding",
      "Unidades en CSS",
      "El Valor Auto",
      "Propiedades de Texto",
      "Fuentes y Estilos de Texto",
      "Enlaces",
      "Tamaños y Responsividad",
      "Media Queries",
      "Flexbox",
      "Grid",
      "Ejercicio 3",
    ],
  },
  {
    titulo: "Un Poco de JavaScript",
    temas: [
      "Introducción",
      "Scripts",
      "Variables y Funciones",
      "Funciones",
      "Operadores",
      "Arreglos",
      "Condicionales",
      "Operadores Booleanos",
      "Switch",
      "Ciclos",
      "El Ciclo While",
      "Accediendo a Elementos de HTML",
      "Acceder a Elementos por Clase y Tipo de Elemento",
      "Modificar Atributos",
      "Cambiando Estilos",
      "Eventos",
      "Ejercicio 4",
    ],
  },
  {
    titulo: "Publicar a <br>la Web",
    temas: [
      "Introducción",
      "Funcionamiento del Sitio Web",
      "Hosting",
      "Dominios",
      "Frameworks",
      "Ejercicio 5",
    ],
  },
];
