import Fastify from 'fastify';



import dotenv from "dotenv";
dotenv.config();

// Votre clé API et configuration TMDb
//const API_KEY = 'c9b4c58f45df29f6e3ed8af4965cabe4';
//const BASE_URL = 'https://api.themoviedb.org/3';


const headers = {
    accept: 'application/json',
    'Content-Type': 'application/json;charset=utf-8',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjOWI0YzU4ZjQ1ZGYyOWY2ZTNlZDhhZjQ5NjVjYWJlNCIsIm5iZiI6MTcwNTU2OTYyMy4wNzUsInN1YiI6IjY1YThlZDU3ZmM1ZjA2MDEyOGJhY2RiMSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.aKwIG8rujv3QlobvxeuVjvpbgRyB7vH6blU24Vsz4SE'
};


// ID de la liste "Ma Watchlist" (Remplacez par l'ID de votre liste)
let watchList = [];  // Change la chaîne de caractères en tableau pour stocker des films

const fastify = Fastify();

// Utilisation des variables d'environnement
const API_KEY = process.env.API_KEY;
const BASE_URL = process.env.BASE_URL;
const WATCHLIST_ID = process.env.WATCHLIST_ID;

console.log('API Key:', API_KEY);
console.log('Base URL:', BASE_URL);
console.log('Watchlist ID:', WATCHLIST_ID);

// Route pour la racine "/"
fastify.get('/', async (request, reply) => {
  return { message: 'Bienvenue sur le serveur Fastify de la Watchlist !' };
});

// Route pour rechercher un film
fastify.get('/search', async (request, reply) => {
  const { title } = request.query;
  const movie = watchList.find(movie => movie.title.toLowerCase() === title.toLowerCase());
  if (movie) {
    return reply.send(movie);
  } else {
    return reply.status(404).send({ message: 'Film non trouvé' });
  }
});

// Route pour ajouter un film à la watch list en utilisant son id
fastify.post('/add-id', async (request, reply) => {
  const { id, title } = request.body;
  if (!id || !title) {
    return reply.status(400).send({ message: 'ID et titre nécessaires' });
  }

  const movie = { id, title };
  watchList.push(movie);
  return reply.send({ message: 'Film ajouté à la watch list', movie });
});

// Route pour ajouter un film à la watch list en utilisant son titre
fastify.post('/add-title', async (request, reply) => {
  const { title } = request.body;
  if (!title) {
    return reply.status(400).send({ message: 'Titre nécessaire' });
  }

  const movie = { id: Date.now(), title }; // Utilisation de Date.now() comme ID unique
  watchList.push(movie);
  return reply.send({ message: 'Film ajouté à la watch list', movie });
});

// Route pour retirer un film de la watch list en utilisant son id
fastify.delete('/remove-id', async (request, reply) => {
  const { id } = request.body;
  const index = watchList.findIndex(movie => movie.id === id);
  if (index !== -1) {
    const removedMovie = watchList.splice(index, 1);
    return reply.send({ message: 'Film retiré de la watch list', removedMovie });
  } else {
    return reply.status(404).send({ message: 'Film non trouvé' });
  }
});

// Route pour retirer un film de la watch list en utilisant son titre
fastify.delete('/remove-title', async (request, reply) => {
  const { title } = request.body;
  const index = watchList.findIndex(movie => movie.title.toLowerCase() === title.toLowerCase());
  if (index !== -1) {
    const removedMovie = watchList.splice(index, 1);
    return reply.send({ message: 'Film retiré de la watch list', removedMovie });
  } else {
    return reply.status(404).send({ message: 'Film non trouvé' });
  }
});

// Démarrer le serveur
const start = async () => {
  try {
    await fastify.listen({ port: 8888, host: '0.0.0.0' });
    console.log('Serveur démarré sur http://localhost:8888');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
