import axios from 'axios';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// Récupérer la clé d'API depuis .env
const API_KEY = process.env.API_KEY;

// Fonction pour récupérer les données météo
const getWeatherData = async () => {
  const url = `http://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=Papeete&dt=2025-12-24`;

  try {
    const response = await axios.get(url);
    const data = response.data;

    // Afficher la réponse complète pour comprendre la structure
    console.log('Réponse de l\'API :', JSON.stringify(data, null, 2));

    // Vérifier si la structure des données est correcte
    if (data && data.forecast && data.forecast.forecastday && data.forecast.forecastday[0] && data.forecast.forecastday[0].day) {
      // Extraire la température maximale et la phase de lune
      const maxTemp = data.forecast.forecastday[0].day.maxtemp_c;
      const moonPhase = data.forecast.forecastday[0].astro.moon_phase;

      console.log(`Température maximale le 24 décembre 2024 à Papeete : ${maxTemp}°C`);
      console.log(`Phase de lune le 24 décembre 2024 à Papeete : ${moonPhase}`);
    } else {
      console.error("Données météo non disponibles pour cette date.");
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des données :', error);
  }
};

// Appeler la fonction pour récupérer les données
getWeatherData();
