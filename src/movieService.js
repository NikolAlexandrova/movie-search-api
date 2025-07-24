// Import required modules
const axios = require('axios');
const NodeCache = require('node-cache');

// In-memory cache with 5-minute TTL
const cache = new NodeCache({ stdTTL: 300 });

/**
 * Fetches movies from the OMDb API based on a search query.
 * Applies input sanitization, caching, and error handling.
 *
 * @param {string} query - The raw search query from the user
 * @returns {Promise<Array>} - A list of movie objects
 */
async function searchMovies(query) {
    // Sanitize user input
    const cleanQuery = query.replace(/[^a-zA-Z0-9\s\-:]/g, '');
    console.log(`🔎 Raw query: "${query}" → Cleaned: "${cleanQuery}"`);

    // Check cache
    const cached = cache.get(cleanQuery);
    if (cached) {
        console.log(`✅ Cache hit for: "${cleanQuery}"`);
        return cached;
    }

    const apiKey = process.env.OMDB_API_KEY;
    if (!apiKey) {
        throw new Error('OMDB_API_KEY is not defined in environment variables.');
    }

    const url = `https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(cleanQuery)}&type=movie`;

    try {
        const response = await axios.get(url);

        if (response.data.Response === 'False') {
            console.error(`❌ OMDb API error: ${response.data.Error}`);
            throw new Error(response.data.Error);
        }

        const result = response.data.Search.map(movie => ({
            title: movie.Title,
            year: movie.Year,
            imdbID: movie.imdbID,
            type: movie.Type,
            poster: movie.Poster
        }));

        cache.set(cleanQuery, result);
        console.log(`🆕 Cached: "${cleanQuery}" for ${cache.options.stdTTL}s`);

        return result;
    } catch (error) {
        console.error(`❌ Fetch error: ${error.message}`);
        throw new Error('An error occurred while fetching movie data.');
    }
}

/**
 * Fetch detailed movie info using IMDb ID.
 * Applies input sanitization and error handling.
 *
 * @param {string} id - IMDb movie ID
 * @returns {Promise<Object>} - Movie details object
 */
async function getMovieById(id) {
    const cleanId = id.replace(/[^a-zA-Z0-9]/g, '');
    const apiKey = process.env.OMDB_API_KEY;
    if (!apiKey) {
        throw new Error('OMDB_API_KEY is not defined in environment variables.');
    }

    const url = `https://www.omdbapi.com/?apikey=${apiKey}&i=${encodeURIComponent(cleanId)}&plot=full`;

    try {
        const response = await axios.get(url);

        if (response.data.Response === 'False') {
            throw new Error(response.data.Error);
        }

        const m = response.data;
        return {
            title: m.Title,
            year: m.Year,
            genre: m.Genre,
            plot: m.Plot,
            rating: m.imdbRating,
            director: m.Director,
            actors: m.Actors,
            poster: m.Poster
        };
    } catch (error) {
        console.error(`❌ Detail fetch error: ${error.message}`);
        throw new Error('Failed to fetch detailed movie info.');
    }
}

module.exports = { searchMovies, getMovieById };
