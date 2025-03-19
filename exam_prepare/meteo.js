import axios from 'axios';

const apiKey ='7622567c9dff4127a93164205251603';
const cities = ['Papeete', 'Moorea', 'Tahiti'];  // Liste des villes de la région
const date = '2024-12-24';  // La date pour laquelle tu veux récupérer les données

async function getWeatherForRegion(cities, date) {
  for (let city of cities) {
    const url = `https://api.weatherapi.com/v1/history.json?key=${apiKey}&q=${city}&dt=${date}`;

    try {
      const response = await axios.get(url);
      const data = response.data;

      // Température maximale
      const maxTemp = data.forecast.forecastday[0].day.maxtemp_c;
      // Phase de lune
      const moonPhase = data.forecast.forecastday[0].astro.moon_phase;

      console.log(`La température maximale à ${city} le ${date} était de ${maxTemp}°C.`);
      console.log(`La phase de la lune à ${city} était : ${moonPhase}.`);
    } catch (error) {
      console.error(`Erreur pour ${city}:`, error.message);
    }
  }
}

// Appel de la fonction pour obtenir la météo pour plusieurs villes
getWeatherForRegion(cities, date);