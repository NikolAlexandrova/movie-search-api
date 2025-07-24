const request = require('supertest');       // Used to simulate HTTP requests to the Express app
const app = require('../src/app');          // Import the actual Express application
const axios = require('axios');             // External HTTP client used in app logic

// Mock axios to avoid making real HTTP requests
jest.mock('axios');

// Clear mocks after each test to prevent interference
afterEach(() => {
  jest.clearAllMocks();
});

describe('GET /search endpoint', () => {
  // Mocked response from OMDb API
  const mockMovie = {
    Title: 'Test Movie',
    Year: '2025',
    imdbID: 'tt1234567',
    Type: 'movie',
    Poster: 'N/A'
  };

  // Expected output after transformation by movieService.js
  const expectedTransformedMovie = {
    title: 'Test Movie',
    year: '2025',
    imdbID: 'tt1234567',
    type: 'movie',
    poster: 'N/A'
  };

  it('should return movie array for a valid query', async () => {
    // Simulate successful response from OMDb
    axios.get.mockResolvedValue({
      data: {
        Response: 'True',
        Search: [mockMovie]
      }
    });

    // Make request to /search endpoint
    const res = await request(app).get('/search?q=test');

    // Assert status code and returned structure
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toEqual([expectedTransformedMovie]);
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  it('should return 400 if query is missing', async () => {
    // Missing query param should trigger validation error
    const res = await request(app).get('/search');

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Missing or invalid search query/);
  });

  it('should handle OMDb API returning an error', async () => {
    // Simulate OMDb API responding with failure
    axios.get.mockResolvedValue({
      data: {
        Response: 'False',
        Error: 'Movie not found!'
      }
    });

    const res = await request(app).get('/search?q=unknown');

    // App should translate OMDb error to 500 response
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Failed to fetch movies');
  });
});
