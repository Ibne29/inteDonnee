import Fastify from 'fastify';
import dotenv from 'dotenv';
import axios from 'axios';
import cors from '@fastify/cors';

// Charger les variables d'environnement
dotenv.config();

const fastify = Fastify({ 
    logger: true,
    trustProxy: true
});

// Configuration CORS
await fastify.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
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
        const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
            params: {
                api_key: TMDB_API_KEY,
                query: query,
                language: 'fr-FR'
            }
        });
        return response.data.results;
    } catch (error) {
        console.error('Erreur lors de la recherche TMDB:', error.message);
        throw error;
    }
};

const getTMDBMovieById = async (movieId) => {
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
            params: {
                api_key: TMDB_API_KEY,
                language: 'fr-FR'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération du film TMDB:', error.message);
        throw error;
    }
};

// Middleware pour gérer les erreurs
fastify.setErrorHandler((error, request, reply) => {
    fastify.log.error(error);
    reply.status(500).send({
        error: 'Une erreur est survenue sur le serveur',
        message: error.message
    });
});

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
            error: 'Erreur lors de la recherche des films',
            message: error.message 
        });
    }
});

// [Autres routes restent identiques...]

// Route de santé pour Render
fastify.get('/health', async (request, reply) => {
    return { status: 'OK', timestamp: new Date().toISOString() };
});

// Démarrer le serveur
const start = async () => {
    try {
        const PORT = process.env.PORT || 3000;
        await fastify.listen({ 
            port: PORT, 
            host: '0.0.0.0'
        });
        console.log(`Serveur démarré sur le port ${PORT}`);
        console.log(`Environnement: ${process.env.NODE_ENV || 'development'}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

// Gestion des signaux pour l'arrêt gracieux
const shutdown = async () => {
    try {
        await fastify.close();
        console.log('Serveur arrêté avec succès');
        process.exit(0);
    } catch (err) {
        console.error('Erreur lors de l\'arrêt du serveur:', err);
        process.exit(1);
    }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

start();