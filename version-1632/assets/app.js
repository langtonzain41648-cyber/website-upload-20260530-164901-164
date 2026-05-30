
(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5000);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    hero.addEventListener("mouseenter", function () {
      window.clearInterval(timer);
    });

    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupGlobalSearch() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-global-search-form]"));
    forms.forEach(function (form) {
      var input = form.querySelector("[data-global-search]");
      var panel = form.querySelector("[data-search-panel]");
      if (!input || !panel || !window.SEARCH_INDEX) {
        return;
      }

      function render() {
        var keyword = input.value.trim().toLowerCase();
        panel.innerHTML = "";
        if (!keyword) {
          panel.classList.remove("is-open");
          return;
        }
        var results = window.SEARCH_INDEX.filter(function (item) {
          return item.keywords.toLowerCase().indexOf(keyword) !== -1;
        }).slice(0, 8);
        if (!results.length) {
          panel.innerHTML = '<div class="search-empty">没有找到匹配影片</div>';
        } else {
          panel.innerHTML = results.map(function (item) {
            return '<a class="search-result" href="' + item.url + '">' +
              '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '">' +
              '<span><strong>' + escapeHtml(item.title) + '</strong>' +
              '<span>' + escapeHtml(item.region) + ' · ' + escapeHtml(item.year) + ' · ' + escapeHtml(item.type) + '</span></span>' +
              '</a>';
          }).join("");
        }
        panel.classList.add("is-open");
      }

      input.addEventListener("input", render);
      input.addEventListener("focus", render);
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var first = panel.querySelector("a");
        if (first) {
          window.location.href = first.getAttribute("href");
        }
      });
      document.addEventListener("click", function (event) {
        if (!form.contains(event.target)) {
          panel.classList.remove("is-open");
        }
      });
    });
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        """: "&quot;"
      }[char];
    });
  }

  function setupLocalFilters() {
    var bar = document.querySelector("[data-filter-bar]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    if (!bar || !cards.length) {
      return;
    }
    var textInput = bar.querySelector("[data-local-search]");
    var filters = Array.prototype.slice.call(bar.querySelectorAll("[data-filter]"));
    var noResults = document.querySelector("[data-no-results]");

    function apply() {
      var query = textInput ? textInput.value.trim().toLowerCase() : "";
      var values = {};
      filters.forEach(function (select) {
        values[select.getAttribute("data-filter")] = select.value;
      });
      var visible = 0;
      cards.forEach(function (card) {
        var keywords = (card.getAttribute("data-keywords") || "").toLowerCase();
        var matchesQuery = !query || keywords.indexOf(query) !== -1;
        var matchesYear = !values.year || card.getAttribute("data-year") === values.year;
        var matchesRegion = !values.region || card.getAttribute("data-region") === values.region;
        var matchesType = !values.type || card.getAttribute("data-type") === values.type;
        var shouldShow = matchesQuery && matchesYear && matchesRegion && matchesType;
        card.classList.toggle("is-hidden", !shouldShow);
        if (shouldShow) {
          visible += 1;
        }
      });
      if (noResults) {
        noResults.classList.toggle("is-visible", visible === 0);
      }
    }

    if (textInput) {
      textInput.addEventListener("input", apply);
    }
    filters.forEach(function (select) {
      select.addEventListener("change", apply);
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (root) {
      var video = root.querySelector("video");
      var button = root.querySelector(".play-mask");
      var url = root.getAttribute("data-video-url");
      var loaded = false;
      var hls = null;

      if (!video || !button || !url) {
        return;
      }

      function loadVideo() {
        if (loaded) {
          return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(url);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              root.classList.add("has-error");
            }
          });
        } else {
          video.src = url;
        }
      }

      function play() {
        loadVideo();
        root.classList.add("is-playing");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            root.classList.remove("is-playing");
          });
        }
      }

      button.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      });
      video.addEventListener("play", function () {
        root.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        if (!video.ended) {
          root.classList.remove("is-playing");
        }
      });
      video.addEventListener("error", function () {
        root.classList.add("has-error");
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupGlobalSearch();
    setupLocalFilters();
    setupPlayers();
  });
})();
