import Fastify from 'fastify';

const fastify = Fastify({ logger: true });

// Simuler une base de données pour les films et la watchlist
const movies = [
  { id: 1, title: 'Inception' },
  { id: 2, title: 'Titanic' },
  { id: 3, title: 'The Matrix' },
];

let watchlist = [];

/**
 * Route : GET /api/movies
 * Description : Recherche un film par son titre.
 * Query Parameters :
 *   - q (string) : Le nom du film à rechercher.
 * Response :
 *   - 200 : Liste des films correspondant à la recherche.
 *   - 400 : Si le paramètre "q" est manquant.
 */
fastify.get('/api/movies', (request, reply) => {
  const { q } = request.query;
  if (!q) {
    return reply.status(400).send({ error: 'Query parameter "q" is required' });
  }
  const results = movies.filter((movie) =>
    movie.title.toLowerCase().includes(q.toLowerCase())
  );
  reply.send(results);
});

/**
 * Route : GET /api/watchlist
 * Description : Retourne la liste des films dans la watchlist de l'utilisateur.
 * Response :
 *   - 200 : Liste des films dans la watchlist.
 */
fastify.get('/api/watchlist', (request, reply) => {
  reply.send(watchlist);
});

/**
 * Route : POST /api/watchlist
 * Description : Ajoute un film à la watchlist de l'utilisateur.
 * Body Parameters (JSON) :
 *   - movieId (number) : L'ID du film à ajouter. (optionnel)
 *   - title (string) : Le titre du film à ajouter. (optionnel)
 * Response :
 *   - 200 : Confirmation de l'ajout et la watchlist mise à jour.
 *   - 400 : Si ni "movieId" ni "title" ne sont fournis.
 *   - 404 : Si le film n'est pas trouvé.
 */
fastify.post('/api/watchlist', (request, reply) => {
  const { movieId, title } = request.body;

  if (movieId) {
    const movie = movies.find((m) => m.id === movieId);
    if (!movie) {
      return reply.status(404).send({ error: 'Movie not found' });
    }
    if (!watchlist.some((m) => m.id === movieId)) {
      watchlist.push(movie);
    }
  } else if (title) {
    const movie = movies.find((m) => m.title.toLowerCase() === title.toLowerCase());
    if (!movie) {
      return reply.status(404).send({ error: 'Movie not found' });
    }
    if (!watchlist.some((m) => m.title.toLowerCase() === title.toLowerCase())) {
      watchlist.push(movie);
    }
  } else {
    return reply.status(400).send({ error: 'Either "movieId" or "title" is required' });
  }

  reply.send({ message: 'Movie added to watchlist', watchlist });
});

/**
 * Route : DELETE /api/watchlist
 * Description : Retire un film de la watchlist de l'utilisateur.
 * Body Parameters (JSON) :
 *   - movieId (number) : L'ID du film à retirer. (optionnel)
 *   - title (string) : Le titre du film à retirer. (optionnel)
 * Response :
 *   - 200 : Confirmation de la suppression et la watchlist mise à jour.
 *   - 400 : Si ni "movieId" ni "title" ne sont fournis.
 */
fastify.delete('/api/watchlist', (request, reply) => {
  const { movieId, title } = request.body;

  if (movieId) {
    watchlist = watchlist.filter((m) => m.id !== movieId);
  } else if (title) {
    watchlist = watchlist.filter((m) => m.title.toLowerCase() !== title.toLowerCase());
  } else {
    return reply.status(400).send({ error: 'Either "movieId" or "title" is required' });
  }

  reply.send({ message: 'Movie removed from watchlist', watchlist });
});

/**
 * Route par défaut : GET /
 * Description : Fournit une réponse par défaut pour la racine.
 */
fastify.get('/', (request, reply) => {
  reply.send({ message: 'Bienvenue sur l\'API Fastify !' });
});

/**
 * Gestion des routes non définies
 * Description : Retourne une erreur 404 pour les routes inexistantes.
 */
fastify.setNotFoundHandler((request, reply) => {
  reply.status(404).send({ error: 'Route not found' });
});

// Démarrer le serveur
const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    console.log('Server is running on http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();