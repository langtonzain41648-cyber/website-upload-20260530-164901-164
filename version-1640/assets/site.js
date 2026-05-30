(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
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
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var thumbs = Array.prototype.slice.call(hero.querySelectorAll('.hero-thumb'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
            thumbs.forEach(function (thumb, thumbIndex) {
                thumb.classList.toggle('is-active', thumbIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-slide')) || 0);
                start();
            });
        });

        thumbs.forEach(function (thumb) {
            thumb.addEventListener('mouseenter', function () {
                show(Number(thumb.getAttribute('data-slide')) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initFilters() {
        var lists = Array.prototype.slice.call(document.querySelectorAll('[data-movie-list]'));
        if (!lists.length) {
            return;
        }

        var keywordInputs = Array.prototype.slice.call(document.querySelectorAll('[data-role="movie-filter"]'));
        var categoryFilter = document.querySelector('[data-role="category-filter"]');
        var yearFilter = document.querySelector('[data-role="year-filter"]');
        var regionFilter = document.querySelector('[data-role="region-filter"]');
        var resetButton = document.querySelector('[data-role="reset-filter"]');

        function apply() {
            var keyword = normalize(keywordInputs.map(function (input) {
                return input.value;
            }).join(' '));
            var category = normalize(categoryFilter ? categoryFilter.value : '');
            var year = normalize(yearFilter ? yearFilter.value : '');
            var region = normalize(regionFilter ? regionFilter.value : '');

            lists.forEach(function (list) {
                var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-tags')
                    ].join(' '));
                    var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                    var matchCategory = !category || normalize(card.getAttribute('data-category')) === category;
                    var matchYear = !year || normalize(card.getAttribute('data-year')) === year;
                    var matchRegion = !region || normalize(card.getAttribute('data-region')) === region;
                    card.classList.toggle('is-filter-hidden', !(matchKeyword && matchCategory && matchYear && matchRegion));
                });
            });
        }

        keywordInputs.forEach(function (input) {
            input.addEventListener('input', apply);
        });
        [categoryFilter, yearFilter, regionFilter].forEach(function (select) {
            if (select) {
                select.addEventListener('change', apply);
            }
        });
        if (resetButton) {
            resetButton.addEventListener('click', function () {
                keywordInputs.forEach(function (input) {
                    input.value = '';
                });
                [categoryFilter, yearFilter, regionFilter].forEach(function (select) {
                    if (select) {
                        select.value = '';
                    }
                });
                apply();
            });
        }
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('.video-player-shell'));
        players.forEach(function (wrapper) {
            var video = wrapper.querySelector('video');
            var overlay = wrapper.querySelector('.play-overlay');
            if (!video) {
                return;
            }
            var source = video.getAttribute('data-src') || wrapper.getAttribute('data-video-src');
            var attached = false;

            function attachSource() {
                if (attached || !source) {
                    return;
                }
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    wrapper.hlsInstance = hls;
                } else {
                    video.src = source;
                }
                attached = true;
            }

            function playVideo() {
                attachSource();
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {});
                }
            }

            if (overlay) {
                overlay.addEventListener('click', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    playVideo();
                });
            }

            wrapper.addEventListener('click', function (event) {
                if (event.target === video) {
                    attachSource();
                    if (overlay) {
                        overlay.classList.add('is-hidden');
                    }
                }
            });

            video.addEventListener('play', function () {
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
            });

            video.addEventListener('pause', function () {
                if (overlay && video.currentTime === 0) {
                    overlay.classList.remove('is-hidden');
                }
            });
        });
    }

    ready(function () {
        initNavigation();
        initHero();
        initFilters();
        initPlayers();
    });
})();
