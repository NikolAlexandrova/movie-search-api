const express = require('express');
const rateLimit = require('express-rate-limit');
const { searchMovies, getMovieById } = require('./movieService');
require('dotenv').config({ quiet: true });

const app = express();

// Serve static files from the "public" folder
app.use(express.static('public'));

// Rate limiter middleware for /search endpoint
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute window
    max: 30, // limit each IP to 30 requests per window
    message: { error: 'Too many requests. Please try again later.' }
});
app.use('/search', limiter);

// In-memory storage for recent searches
let recentSearches = [];

/**
 * GET /search
 * Search for movies by query string.
 */
app.get('/search', async (req, res) => {
    const query = req.query.q;

    if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid search query' });
    }

    try {
        const results = await searchMovies(query);

        // Update recent searches
        if (!recentSearches.includes(query)) {
            recentSearches.unshift(query);
            if (recentSearches.length > 5) recentSearches.pop();
        }

        res.json(results);
    } catch (err) {
        console.error('❌ Error in /search:', err.message);
        res.status(500).json({ error: 'Failed to fetch movies' });
    }
});

/**
 * GET /movie
 * Get full details for a specific movie by IMDb ID.
 */
app.get('/movie', async (req, res) => {
    const id = req.query.id;

    if (!id) {
        return res.status(400).json({ error: 'Missing movie ID' });
    }

    try {
        const detail = await getMovieById(id);
        res.json(detail);
    } catch (err) {
        console.error('❌ Error in /movie:', err.message);
        res.status(500).json({ error: 'Failed to fetch movie details' });
    }
});

/**
 * GET /recent
 * Return the last 5 search queries.
 */
app.get('/recent', (req, res) => {
    res.json(recentSearches);
});

module.exports = app;
