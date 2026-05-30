(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  var menuButton = one('[data-menu-toggle]');
  var mobilePanel = one('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  all('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = one('input[name="q"]', form);
      var query = input ? input.value.trim() : '';
      var root = form.getAttribute('data-search-root') || '';
      var url = root + 'search.html';
      if (query) {
        url += '?q=' + encodeURIComponent(query);
      }
      window.location.href = url;
    });
  });

  all('[data-live-filter]').forEach(function (input) {
    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase();
      all('[data-filter-card]').forEach(function (card) {
        var hay = (card.getAttribute('data-filter-text') || card.textContent || '').toLowerCase();
        card.style.display = !q || hay.indexOf(q) !== -1 ? '' : 'none';
      });
    });
  });

  var hero = one('[data-hero]');
  if (hero) {
    var slides = all('[data-hero-slide]', hero);
    var dots = all('[data-hero-dot]', hero);
    var current = 0;
    var timer = null;

    function showHero(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function autoHero() {
      timer = window.setInterval(function () {
        showHero(current + 1);
      }, 5200);
    }

    var prev = one('[data-hero-prev]', hero);
    var next = one('[data-hero-next]', hero);

    if (prev) {
      prev.addEventListener('click', function () {
        window.clearInterval(timer);
        showHero(current - 1);
        autoHero();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        window.clearInterval(timer);
        showHero(current + 1);
        autoHero();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        showHero(parseInt(dot.getAttribute('data-hero-dot'), 10) || 0);
        autoHero();
      });
    });

    showHero(0);
    autoHero();
  }

  function startVideo(box) {
    var video = one('video', box);
    var cover = one('.player-cover', box);
    if (!video) {
      return;
    }
    var stream = video.getAttribute('data-stream');
    if (stream && video.getAttribute('data-ready') !== '1') {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        video._hls = hls;
      } else {
        video.src = stream;
      }
      video.setAttribute('data-ready', '1');
    }
    if (cover) {
      cover.classList.add('is-hidden');
    }
    video.controls = true;
    var playPromise = video.play();
    if (playPromise && playPromise.catch) {
      playPromise.catch(function () {
        if (cover) {
          cover.classList.remove('is-hidden');
        }
      });
    }
  }

  all('[data-player]').forEach(function (box) {
    var cover = one('.player-cover', box);
    var video = one('video', box);
    if (cover) {
      cover.addEventListener('click', function () {
        startVideo(box);
      });
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.getAttribute('data-ready') !== '1') {
          startVideo(box);
        }
      });
    }
  });

  var searchInput = one('#site-search-input');
  var searchResults = one('#search-results');
  if (searchInput && searchResults && window.SEARCH_DATA) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    searchInput.value = initialQuery;

    function card(item) {
      var tagHtml = item.tags.slice(0, 4).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return '<article class="movie-card" data-filter-card>' +
        '<a class="poster-link" href="' + escapeHtml(item.url) + '">' +
        '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
        '<span class="poster-shade"></span><span class="poster-play">▶</span></a>' +
        '<div class="card-body"><div class="meta-row"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
        '<h3><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h3>' +
        '<p>' + escapeHtml(item.desc) + '</p><div class="tag-row">' + tagHtml + '</div></div></article>';
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"']/g, function (ch) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[ch];
      });
    }

    function runSearch() {
      var q = searchInput.value.trim().toLowerCase();
      if (!q) {
        searchResults.innerHTML = window.SEARCH_DATA.slice(0, 24).map(card).join('');
        return;
      }
      var found = window.SEARCH_DATA.filter(function (item) {
        return item.text.indexOf(q) !== -1;
      }).slice(0, 120);
      searchResults.innerHTML = found.map(card).join('') || '<div class="empty-state">没有找到匹配影片</div>';
    }

    searchInput.addEventListener('input', runSearch);
    runSearch();
  }
})();
