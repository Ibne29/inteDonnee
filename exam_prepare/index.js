import Fastify from 'fastify';
import dotenv from 'dotenv';
import fetch from 'axios';
import cors from '@fastify/cors';

// Charger les variables d'environnement
dotenv.config();

const fastify = Fastify({ logger: true });

// Configuration CORS
await fastify.register(cors, {
    origin: true
  });

const TMDB_API_KEY = process.env.API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Vérification de la clé API
if (!TMDB_API_KEY) {
    console.error('La clé API TMDB n\'est pas définie');
    process.exit(1);
}

// Stockage local pour la watchlist
let watchlist = [];

// Fonctions utilitaires pour TMDB
const searchTMDBMovies = async (query) => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=fr-FR`
    );
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Erreur lors de la recherche TMDB:', error);
    throw error;
  }
};

const getTMDBMovieById = async (movieId) => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=fr-FR`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération du film TMDB:', error);
    throw error;
  }
};

// Routes
fastify.get('/api/movies', async (request, reply) => {
  const { q } = request.query;
  if (!q) {
    return reply.status(400).send({ 
      error: 'Le paramètre de recherche "q" est requis' 
    });
  }


  try {
    const movies = await searchTMDBMovies(q);
    return {
      results: movies.map(movie => ({
        id: movie.id,
        title: movie.title,
        overview: movie.overview,
        releaseDate: movie.release_date,
        posterPath: movie.poster_path ? 
          `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
        voteAverage: movie.vote_average
      })),
      count: movies.length
    };
  } catch (error) {
    reply.status(500).send({ 
      error: 'Erreur lors de la recherche des films' 
    });
  }
});

fastify.get('/api/movies/:id', async (request, reply) => {
  const { id } = request.params;

  try {
    const movie = await getTMDBMovieById(id);
    if (movie.success === false) {
      return reply.status(404).send({ 
        error: 'Film non trouvé' 
      });
    }
    return {
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      releaseDate: movie.release_date,
      posterPath: movie.poster_path ? 
        `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
      voteAverage: movie.vote_average,
      genres: movie.genres,
      runtime: movie.runtime,
      budget: movie.budget,
      revenue: movie.revenue
    };
  } catch (error) {
    reply.status(500).send({ 
      error: 'Erreur lors de la récupération du film' 
    });
  }
});

fastify.get('/api/watchlist', (request, reply) => {
  reply.send({ 
    watchlist, 
    count: watchlist.length 
  });
});

fastify.post('/api/watchlist', async (request, reply) => {
  const { movieId } = request.body;

  if (!movieId) {
    return reply.status(400).send({ 
      error: 'L\'ID du film est requis' 
    });
  }

  try {
    // Vérifier si le film est déjà dans la watchlist
    if (watchlist.some(m => m.id === movieId)) {
      return reply.status(400).send({ 
        error: 'Ce film est déjà dans votre watchlist' 
      });
    }

    // Récupérer les détails du film depuis TMDB
    const movie = await getTMDBMovieById(movieId);
    if (movie.success === false) {
      return reply.status(404).send({ 
        error: 'Film non trouvé' 
      });
    }

    // Ajouter le film à la watchlist
    const movieData = {
      id: movie.id,
      title: movie.title,
      posterPath: movie.poster_path ? 
        `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
      addedAt: new Date()
    };

    watchlist.push(movieData);
    reply.send({ 
      message: 'Film ajouté à la watchlist', 
      movie: movieData 
    });
  } catch (error) {
    reply.status(500).send({ 
      error: 'Erreur lors de l\'ajout du film à la watchlist' 
    });
  }
});

fastify.delete('/api/watchlist/:id', (request, reply) => {
  const { id } = request.params;
  const movieId = parseInt(id);

  const initialLength = watchlist.length;
  watchlist = watchlist.filter(movie => movie.id !== movieId);

  if (watchlist.length === initialLength) {
    return reply.status(404).send({ 
      error: 'Film non trouvé dans la watchlist' 
    });
  }

  reply.send({ 
    message: 'Film retiré de la watchlist', 
    removedId: movieId 
  });
});

// Route racine avec documentation
fastify.get('/', (request, reply) => {
  reply.send({
    message: 'Bienvenue sur l\'API Films avec TMDB !',
    endpoints: {
      'GET /api/movies?q=:query': 'Rechercher des films',
      'GET /api/movies/:id': 'Obtenir les détails d\'un film',
      'GET /api/watchlist': 'Voir votre watchlist',
      'POST /api/watchlist': 'Ajouter un film à votre watchlist',
      'DELETE /api/watchlist/:id': 'Retirer un film de votre watchlist'
    }
  });
});

// Démarrer le serveur
const start = async () => {
    try {
        await fastify.listen({
            port: process.env.PORT || 3000,
            host: '0.0.0.0'
        });
        console.log(`Serveur démarré sur le port ${process.env.PORT || 3000}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();