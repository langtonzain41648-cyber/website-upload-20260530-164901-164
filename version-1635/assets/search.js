(function () {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var input = document.getElementById('searchInput');
    var title = document.getElementById('searchTitle');
    var intro = document.getElementById('searchIntro');
    var results = document.getElementById('searchResults');

    if (input) {
        input.value = query;
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function createCard(item) {
        var tags = (item.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return [
            '<article class="movie-card compact-card">',
            '<a class="poster-link" href="' + escapeHtml(item.url) + '" aria-label="观看' + escapeHtml(item.title) + '">',
            '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
            '<span class="poster-year">' + escapeHtml(item.year) + '</span>',
            '</a>',
            '<div class="movie-card-body">',
            '<div class="movie-meta-line"><a href="' + escapeHtml(item.categoryUrl) + '">' + escapeHtml(item.category) + '</a><span>' + escapeHtml(item.region) + '</span></div>',
            '<h3><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h3>',
            '<p>' + escapeHtml(item.description) + '</p>',
            '<div class="chip-row">' + tags + '</div>',
            '<div class="card-foot"><span>评分 ' + escapeHtml(item.rating) + '</span><span>热度 ' + escapeHtml(item.heat) + '</span></div>',
            '</div>',
            '</article>'
        ].join('');
    }

    if (!query || !results || !window.SEARCH_INDEX) {
        return;
    }

    var words = query.toLowerCase().split(/\s+/).filter(Boolean);
    var matched = window.SEARCH_INDEX.filter(function (item) {
        var haystack = [
            item.title,
            item.region,
            item.type,
            item.year,
            item.genre,
            item.category,
            (item.tags || []).join(' '),
            item.description
        ].join(' ').toLowerCase();
        return words.every(function (word) {
            return haystack.indexOf(word) !== -1;
        });
    }).slice(0, 120);

    if (title) {
        title.textContent = '搜索：' + query;
    }
    if (intro) {
        intro.textContent = matched.length ? '以下影片与关键词相关。' : '没有找到完全匹配的影片，可以尝试更短的关键词。';
    }
    results.innerHTML = matched.map(createCard).join('');
})();
