const input = document.getElementById('searchInput');
const button = document.getElementById('searchButton');
const results = document.getElementById('searchResults');
const count = document.getElementById('searchCount');

const params = new URLSearchParams(window.location.search);
const initialQuery = params.get('q') || '';

const render = (query) => {
  const text = query.trim().toLowerCase();
  const list = text
    ? window.SEARCH_MOVIES.filter((movie) => movie.searchText.includes(text))
    : window.SEARCH_MOVIES.slice(0, 40);

  results.innerHTML = list.slice(0, 120).map((movie) => `
    <article class="movie-card">
      <a class="poster" href="${movie.url}">
        <img src="${movie.cover}" alt="${movie.title}" loading="lazy">
        <span class="poster-year">${movie.year}</span>
      </a>
      <div class="movie-card-body">
        <a class="movie-title" href="${movie.url}">${movie.title}</a>
        <div class="movie-meta">${movie.region} · ${movie.genre}</div>
        <p>${movie.oneLine}</p>
        <div class="tag-row">
          ${movie.tags.slice(0, 3).map((tag) => `<span>${tag}</span>`).join('')}
        </div>
      </div>
    </article>
  `).join('');

  count.textContent = text ? `匹配到 ${list.length} 条相关内容` : '展示近期推荐内容';
};

if (input && button && results && count) {
  input.value = initialQuery;
  button.addEventListener('click', () => render(input.value));
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      render(input.value);
    }
  });
  render(initialQuery);
}
