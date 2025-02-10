let button = document.getElementById("button");
const changePokemon = async () => {
    let randomNumber = Math.ceil(Math.random() * 151) + 1; // de 1 à 151

    let requestString = `https://pokeapi.co/api/v2/pokemon/${randomNumber}`;
    
    let data = await fetch(requestString); //envoie de réponse 
    console.log(data);

    let response = await data.json();
    console.log(response);
}
button.addEventListener("click",changePokemon); 