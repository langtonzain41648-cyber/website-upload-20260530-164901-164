(function() {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initMenu() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function() {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var thumbs = Array.prototype.slice.call(root.querySelectorAll('[data-hero-thumb]'));
    if (!slides.length) {
      return;
    }
    var active = 0;
    var timer;
    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      thumbs.forEach(function(thumb, i) {
        thumb.classList.toggle('is-active', i === active);
      });
    }
    function start() {
      timer = window.setInterval(function() {
        show(active + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }
    thumbs.forEach(function(thumb) {
      thumb.addEventListener('click', function() {
        stop();
        show(Number(thumb.getAttribute('data-hero-thumb')) || 0);
        start();
      });
    });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    start();
  }

  function initFilters() {
    var panel = document.querySelector('[data-filter-panel]');
    var list = document.querySelector('[data-card-list]');
    if (!panel || !list) {
      return;
    }
    var input = panel.querySelector('[data-card-search]');
    var category = panel.querySelector('[data-filter-category]');
    var year = panel.querySelector('[data-filter-year]');
    var type = panel.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));
    var empty = document.querySelector('[data-empty-state]');
    function apply() {
      var keyword = normalize(input && input.value);
      var catValue = normalize(category && category.value);
      var yearValue = normalize(year && year.value);
      var typeValue = normalize(type && type.value);
      var visible = 0;
      cards.forEach(function(card) {
        var text = normalize(card.getAttribute('data-search'));
        var cardCategory = normalize(card.getAttribute('data-category'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var cardType = normalize(card.getAttribute('data-type'));
        var ok = true;
        if (keyword && text.indexOf(keyword) === -1) {
          ok = false;
        }
        if (catValue && cardCategory !== catValue) {
          ok = false;
        }
        if (yearValue && cardYear !== yearValue) {
          ok = false;
        }
        if (typeValue && cardType.indexOf(typeValue) === -1) {
          ok = false;
        }
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }
    [input, category, year, type].forEach(function(control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
    apply();
  }

  function createSearchCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function(tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '<article class="movie-card">' +
      '<a href="' + movie.href + '">' +
      '<span class="card-cover">' +
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '<span class="card-play">▶</span>' +
      '<span class="card-rating">' + escapeHtml(movie.rating) + '</span>' +
      '</span>' +
      '<span class="card-body">' +
      '<strong>' + escapeHtml(movie.title) + '</strong>' +
      '<span class="card-desc">' + escapeHtml(movie.desc) + '</span>' +
      '<span class="card-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</span>' +
      '<span class="tag-row">' + tags + '</span>' +
      '</span>' +
      '</a>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initSearchPage() {
    var results = document.getElementById('searchResults');
    var empty = document.getElementById('searchEmpty');
    if (!results || !empty || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var input = document.querySelector('[data-search-page-input]');
    if (input) {
      input.value = query;
      input.addEventListener('input', function() {
        render(input.value);
      });
    }
    function render(value) {
      var q = normalize(value);
      if (!q) {
        results.innerHTML = '';
        empty.textContent = '请输入关键词开始搜索';
        empty.classList.add('is-visible');
        return;
      }
      var matches = window.SEARCH_MOVIES.filter(function(movie) {
        return normalize(movie.title + ' ' + movie.category + ' ' + movie.region + ' ' + movie.type + ' ' + movie.year + ' ' + movie.genre + ' ' + movie.tags.join(' ') + ' ' + movie.desc).indexOf(q) !== -1;
      }).slice(0, 120);
      results.innerHTML = matches.map(createSearchCard).join('');
      empty.textContent = '未找到相关内容';
      empty.classList.toggle('is-visible', matches.length === 0);
    }
    render(query);
  }

  function initBackTop() {
    var button = document.querySelector('[data-back-top]');
    if (!button) {
      return;
    }
    function update() {
      button.classList.toggle('is-visible', window.scrollY > 420);
    }
    button.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  ready(function() {
    initMenu();
    initHero();
    initFilters();
    initSearchPage();
    initBackTop();
  });
})();
