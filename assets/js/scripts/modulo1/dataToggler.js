var topCard = 1;
var facingUp = true;

function dataToggle(n) {
  if (topCard === n) return;

  // Replace the contents of the current back-face with the contents
  // of the element that should rotate into view.
  var curBackFace = $("." + (facingUp ? "back" : "front"));
  var nextContent = $(".store" + n).html();
  var nextContent = $(".store > li:nth-child(" + n + ")").html();
  curBackFace.html(nextContent);

  // Rotate the content
  $(".dataToggler").toggleClass("isFlipped");
  topCard = n;
  facingUp = !facingUp;
}

$("#dato1").on("click", function () {
  dataToggle(1);
});
$("#dato2").on("click", function () {
  dataToggle(2);
});
$("#dato3").on("click", function () {
  dataToggle(3);
});
$("#dato4").on("click", function () {
  dataToggle(4);
});
$("#dato5").on("click", function () {
  dataToggle(5);
});

$(document).ready(function () {
  var frontFace = $(".front");
  var frontContent = $(".store li:first-child").html();
  frontFace.html(frontContent);
});
