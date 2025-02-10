// Votre clé API et configuration TMDb
const API_KEY = 'c9b4c58f45df29f6e3ed8af4965cabe4';
const BASE_URL = 'https://api.themoviedb.org/3';
const headers = {
    accept: 'application/json',
    'Content-Type': 'application/json;charset=utf-8',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjOWI0YzU4ZjQ1ZGYyOWY2ZTNlZDhhZjQ5NjVjYWJlNCIsIm5iZiI6MTcwNTU2OTYyMy4wNzUsInN1YiI6IjY1YThlZDU3ZmM1ZjA2MDEyOGJhY2RiMSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.aKwIG8rujv3QlobvxeuVjvpbgRyB7vH6blU24Vsz4SE'
};

// ID de la liste "Ma Watchlist" (Remplacez par l'ID de votre liste)
const WATCHLIST_ID = '8507887';

// Fonction pour rechercher un film avec un titre exact
async function searchExactMovie(title) {
    try {
        const response = await fetch(`${BASE_URL}/search/movie?query=${encodeURIComponent(title)}&include_adult=false&language=en-US&page=1`, {
            method: 'GET',
            headers,
        });

        if (!response.ok) throw new Error(`Erreur lors de la recherche : ${response.status}`);

        const data = await response.json();
        const exactMatch = data.results.find(movie => movie.title.toLowerCase() === title.toLowerCase());

        if (exactMatch) {
            console.log('Film trouvé :', exactMatch);
            return exactMatch;
        } else {
            console.log('Aucun film trouvé avec le titre exact.');
            return null;
        }
    } catch (error) {
        console.error('Erreur :', error);
    }
}

// Fonction pour ajouter un film à "Ma Watchlist"
async function addToWatchlist(movie) {
    try {
        const response = await fetch(`${BASE_URL}/list/${WATCHLIST_ID}/add_item`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                media_id: movie.id, // L'ID du film à ajouter
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Erreur lors de l\'ajout à la liste:', errorData);
            throw new Error(`Erreur lors de l'ajout à la liste : ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
            console.log(`Le film "${movie.title}" a été ajouté à "Ma Watchlist".`);
        } else {
            console.log('Impossible d\'ajouter le film à la liste.', data.status_message);
        }
    } catch (error) {
        console.error('Erreur :', error);
    }
}

// Fonction pour récupérer les films de "Ma Watchlist"
async function getWatchlist() {
    try {
        const response = await fetch(`${BASE_URL}/list/${WATCHLIST_ID}`, {
            method: 'GET',
            headers,
        });

        if (!response.ok) throw new Error(`Erreur lors de la récupération de la liste : ${response.status}`);

        const data = await response.json();
        console.log('Films dans "Ma Watchlist" :', data.items);
        return data.items;
    } catch (error) {
        console.error('Erreur :', error);
    }
}

// Exemple d'utilisation
(async function main() {
    // 1. Recherche d'un film exact
    const exactMovie = await searchExactMovie('Wicked');

    if (exactMovie) {
        // 2. Ajout du film à "Ma Watchlist"
        await addToWatchlist(exactMovie);

        // 3. Récupération des films de "Ma Watchlist"
        const currentWatchlist = await getWatchlist();
        console.log('Watchlist actuelle :', currentWatchlist);
    }
})();
