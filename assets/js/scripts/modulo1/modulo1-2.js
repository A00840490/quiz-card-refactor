function watchForm() {
    let answer = '';
    document.getElementById('act_1').addEventListener('click', e => {
        e.preventDefault();
        for (let i = 1; i < 8; i++) {
            answer = document.getElementById(`Q${i}`)
            if (answer.value == "correct") {
                answer.parentNode.style.backgroundColor = '#cdf9c6';
                answer.style.backgroundColor = '#cdf9c6';
            }
            else {
                answer.style.backgroundColor = '#f9c6c6';
                answer.parentNode.style.backgroundColor = '#f9c6c6';
            }
        }
    });
}

function watchSelect(){
    document.getElementById("selectElem").addEventListener('change',e=>{
        e.target.style.backgroundColor="white";
        e.target.parentNode.style.backgroundColor="white";
    });
}

function init() {
    watchForm();
    watchSelect();
}

init();