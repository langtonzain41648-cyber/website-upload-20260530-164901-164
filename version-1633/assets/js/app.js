(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function initNavigation() {
    var toggle = document.querySelector('.nav-toggle');
    var links = document.querySelector('.nav-links');
    if (!toggle || !links) {
      return;
    }
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    if (!slides.length) {
      return;
    }
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var prev = document.querySelector('.hero-prev');
    var next = document.querySelector('.hero-next');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var target = parseInt(dot.getAttribute('data-target-slide') || '0', 10);
        show(target);
        start();
      });
    });

    var stage = document.querySelector('.hero-stage');
    if (stage) {
      stage.addEventListener('mouseenter', stop);
      stage.addEventListener('mouseleave', start);
    }

    show(0);
    start();
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function initFilters() {
    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('.movie-search'));
    var selects = Array.prototype.slice.call(document.querySelectorAll('.movie-filter'));
    var items = Array.prototype.slice.call(document.querySelectorAll('.filter-item'));
    if (!items.length || (!searchInputs.length && !selects.length)) {
      return;
    }

    function collectText(item) {
      return normalize([
        item.getAttribute('data-title'),
        item.getAttribute('data-region'),
        item.getAttribute('data-type'),
        item.getAttribute('data-year'),
        item.getAttribute('data-tags'),
        item.textContent
      ].join(' '));
    }

    function apply() {
      var query = normalize(searchInputs.map(function (input) { return input.value; }).join(' '));
      var type = normalize(selects.map(function (select) { return select.value; }).filter(Boolean).join(' '));
      items.forEach(function (item) {
        var text = collectText(item);
        var matchQuery = !query || query.split(/\s+/).every(function (word) { return text.indexOf(word) !== -1; });
        var matchType = !type || text.indexOf(type) !== -1;
        item.classList.toggle('is-filtered', !(matchQuery && matchType));
      });
    }

    searchInputs.forEach(function (input) {
      input.addEventListener('input', apply);
    });
    selects.forEach(function (select) {
      select.addEventListener('change', apply);
    });
  }

  function initImages() {
    Array.prototype.slice.call(document.querySelectorAll('img')).forEach(function (img) {
      img.addEventListener('error', function () {
        img.classList.add('is-hidden');
      });
    });
  }

  function createNativeSource(video, src) {
    video.src = src;
    video.load();
  }

  function initFrame(frame) {
    var video = frame.querySelector('video');
    var button = frame.querySelector('.play-overlay');
    var src = frame.getAttribute('data-play-url');
    var hls = null;
    if (!video || !src) {
      return;
    }

    function attach() {
      if (video.getAttribute('data-ready') === '1') {
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        createNativeSource(video, src);
      }
      video.setAttribute('data-ready', '1');
    }

    function play() {
      attach();
      frame.classList.add('is-playing');
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          frame.classList.remove('is-playing');
        });
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        play();
      });
    }

    frame.addEventListener('click', function (event) {
      if (event.target === frame) {
        play();
      }
    });

    video.addEventListener('play', function () {
      frame.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        frame.classList.remove('is-playing');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  function initPlayers() {
    Array.prototype.slice.call(document.querySelectorAll('.video-frame')).forEach(initFrame);
  }

  ready(function () {
    initNavigation();
    initHero();
    initFilters();
    initImages();
    initPlayers();
  });
})();
