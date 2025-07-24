// DOM Elements
const form = document.getElementById('searchForm');
const input = document.getElementById('searchInput');
const results = document.getElementById('results');
const recent = document.getElementById('recent');

// Handle form submit event
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (!query) return;

    showLoading();
    try {
        const res = await fetch(`/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();

        if (data.error) {
            showError(data.error);
        } else {
            renderMovies(data);
            await fetchRecent();
        }
    } catch (err) {
        console.error('Search error:', err);
        showError('Something went wrong.');
    }
});

// Display loading state
function showLoading() {
    results.textContent = '';
    const p = document.createElement('p');
    p.className = 'text-center text-gray-500';
    p.textContent = 'Loading…';
    results.appendChild(p);
}

// Display error message
function showError(message) {
    results.textContent = '';
    const p = document.createElement('p');
    p.className = 'text-red-600';
    p.textContent = message;
    results.appendChild(p);
}

// Render list of movie cards
function renderMovies(movies) {
    results.textContent = '';
    movies.forEach(movie => {
        const card = createMovieCard(movie);
        results.appendChild(card);
    });
}

// Create movie card element
function createMovieCard(movie) {
    const { title, year, poster, imdbID } = movie;
    const container = document.createElement('div');
    container.className = 'bg-white p-4 rounded shadow';

    const h2 = document.createElement('h2');
    h2.className = 'text-xl font-semibold';
    h2.textContent = `${title} (${year})`;
    container.appendChild(h2);

    if (poster !== 'N/A') {
        const img = document.createElement('img');
        img.src = poster;
        img.alt = title;
        img.className = 'mt-2 max-h-64';
        container.appendChild(img);
    } else {
        const p = document.createElement('p');
        p.className = 'text-sm text-gray-500 italic';
        p.textContent = 'No poster available';
        container.appendChild(p);
    }

    const btn = document.createElement('button');
    btn.className = 'mt-3 px-3 py-1 bg-gray-800 text-white text-sm rounded hover:bg-gray-900';
    btn.textContent = 'More Info';
    btn.addEventListener('click', () => loadDetails(imdbID, container));
    container.appendChild(btn);

    const detailDiv = document.createElement('div');
    detailDiv.id = `detail-${imdbID}`;
    detailDiv.className = 'mt-2 text-sm text-gray-700';
    container.appendChild(detailDiv);

    return container;
}

// Load additional movie details
async function loadDetails(imdbID, container) {
    const detailDiv = container.querySelector(`#detail-${imdbID}`);
    detailDiv.textContent = 'Loading details…';

    try {
        const res = await fetch(`/movie?id=${encodeURIComponent(imdbID)}`);
        const data = await res.json();

        if (data.error) {
            detailDiv.textContent = data.error;
        } else {
            detailDiv.innerHTML = `
        <p><strong>Genre:</strong> ${data.genre}</p>
        <p><strong>Director:</strong> ${data.director}</p>
        <p><strong>Plot:</strong> ${data.plot}</p>
        <p><strong>IMDB Rating:</strong> ${data.rating}</p>
      `;
        }
    } catch (err) {
        console.error('Detail fetch error:', err);
        detailDiv.textContent = 'Failed to load details.';
    }
}

// Fetch and display recent search history
async function fetchRecent() {
    try {
        const res = await fetch('/recent');
        const data = await res.json();

        recent.textContent = '';
        data.forEach(item => {
            const tag = document.createElement('span');
            tag.textContent = item;
            tag.className = 'bg-blue-100 px-2 py-1 rounded hover:bg-blue-200 cursor-pointer';
            tag.addEventListener('click', () => {
                input.value = item;
                form.dispatchEvent(new Event('submit'));
            });
            recent.appendChild(tag);
        });
    } catch (err) {
        console.error('Failed to load recent searches:', err);
    }
}

// Initial recent search load
fetchRecent();
