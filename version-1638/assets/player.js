import { H as Hls } from './hls-dru42stk.js';

const box = document.querySelector('[data-play]');
const video = document.getElementById('movieVideo');
const overlay = document.getElementById('playOverlay');

if (box && video && overlay) {
  const stream = box.getAttribute('data-play');
  let ready = false;

  const prepare = () => {
    if (ready || !stream) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      ready = true;
      return;
    }

    if (Hls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      ready = true;
    }
  };

  const start = async () => {
    prepare();
    overlay.classList.add('is-hidden');
    try {
      await video.play();
    } catch (error) {
      overlay.classList.remove('is-hidden');
    }
  };

  overlay.addEventListener('click', start);
  video.addEventListener('click', () => {
    if (!ready) {
      prepare();
    }
  });
}
