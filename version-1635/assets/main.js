(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobilePanel = document.querySelector('.mobile-panel');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === current);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var player = document.querySelector('.movie-video');
    var shell = document.querySelector('.video-shell');
    var overlay = document.querySelector('.play-overlay');
    var hlsInstance = null;

    function attachStream() {
        var streamUrl = window.__MOVIE_STREAM__;
        if (!player || !streamUrl || player.dataset.ready === '1') {
            return;
        }

        if (player.canPlayType('application/vnd.apple.mpegurl')) {
            player.src = streamUrl;
            player.dataset.ready = '1';
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                maxBufferLength: 30,
                enableWorker: true
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(player);
            player.dataset.ready = '1';
        } else {
            player.src = streamUrl;
            player.dataset.ready = '1';
        }
    }

    function startVideo() {
        if (!player) {
            return;
        }
        attachStream();
        if (shell) {
            shell.classList.add('playing');
        }
        var promise = player.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
                player.controls = true;
            });
        }
    }

    if (overlay) {
        overlay.addEventListener('click', startVideo);
    }

    if (player) {
        player.addEventListener('click', function () {
            if (player.paused) {
                startVideo();
            }
        });
        player.addEventListener('play', function () {
            if (shell) {
                shell.classList.add('playing');
            }
        });
    }
})();
