(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var video = document.querySelector('[data-player]');
    var cover = document.querySelector('[data-cover]');
    var button = document.querySelector('[data-play]');

    if (!video || !button) {
      return;
    }

    var address = video.getAttribute('data-stream');
    var attached = false;
    var hlsInstance = null;

    function attachStream() {
      if (attached || !address) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = address;
        attached = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(address);
        hlsInstance.attachMedia(video);
        attached = true;
        return;
      }

      video.src = address;
      attached = true;
    }

    function startVideo() {
      attachStream();

      if (cover) {
        cover.classList.add('is-hidden');
      }

      var request = video.play();

      if (request && request.catch) {
        request.catch(function () {});
      }
    }

    button.addEventListener('click', startVideo);

    if (cover) {
      cover.addEventListener('click', startVideo);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        startVideo();
      } else {
        video.pause();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
