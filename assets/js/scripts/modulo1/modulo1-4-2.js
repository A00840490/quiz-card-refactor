let card= document.getElementById('myFlipCards');
let cardsArr= document.getElementsByClassName('flip-card-inner');

function watchCards(){
    card.addEventListener('click', e => {
            e.preventDefault();        
        let cardElement= e.target.parentNode.parentNode;
        if(cardElement.className == 'flip-card-inner'){
            if(cardElement.style.transform === "none")
                cardElement.style.transform = "rotateY(180deg)";
            else{
                cardElement.style.transform= "none";
            }
        }
        });
}

function setDefault(){
    Array.from(cardsArr).forEach(element => element.style.transform = "none");
}

function init(){
    setDefault();
    watchCards();
}

init();