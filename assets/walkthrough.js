(function () {
  var root = document.getElementById('pipewalk');
  if (!root) return;
  root.classList.add('pw-js');
  var scenes = Array.prototype.slice.call(root.querySelectorAll('.pw-scene'));
  var chips = Array.prototype.slice.call(root.querySelectorAll('.pw-chip'));
  var playBtn = root.querySelector('.pw-play');
  var replayBtn = root.querySelector('.pw-replay');
  var stNum = root.querySelector('.pw-st-num'), stName = root.querySelector('.pw-st-name');
  var stEl = root.querySelector('.pw-st-el'), stQ = root.querySelector('.pw-st-q');
  var hbT = root.querySelector('.pw-hb-t');
  var stage = root.querySelector('.pw-stage');
  var names = ['inbox', 'extract', 'scrape', 'model', 'geocode', 'docs', 'store', 'sync', 'notify'];
  var queues = [1, 1, 1, 1, 1, 1, 1, 0, 0];
  var durations = [5800, 6200, 9500, 8500, 7500, 7800, 7000, 6000, 8800]; /* ~65s loop */
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var playing = !reduced;
  var idx = 0, timer = null, elapsed = 0, rafs = [], touts = [];
  function fmt(n, dec) {
    var s = n.toFixed(dec), p = s.split('.');
    p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
    return p.length > 1 ? p[0] + '.' + p[1] : p[0];
  }
  function clearAnims() {
    rafs.forEach(cancelAnimationFrame); touts.forEach(clearTimeout);
    rafs = []; touts = [];
  }
  function runCounters(scene) {
    Array.prototype.slice.call(scene.querySelectorAll('[data-count]')).forEach(function (el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var dec = parseInt(el.getAttribute('data-dec') || '0', 10);
      var dur = parseFloat(el.getAttribute('data-cdur') || '1000');
      var delay = parseFloat(el.getAttribute('data-cdelay') || '0');
      if (reduced) { el.textContent = fmt(target, dec); return; }
      el.textContent = fmt(0, dec);
      touts.push(setTimeout(function () {
        var t0 = performance.now();
        function step(now) {
          var p = Math.min(1, (now - t0) / dur);
          p = 1 - Math.pow(1 - p, 3);
          el.textContent = fmt(target * p, dec);
          if (p < 1) rafs.push(requestAnimationFrame(step));
        }
        rafs.push(requestAnimationFrame(step));
      }, delay));
    });
  }
  function render() {
    clearAnims();
    scenes.forEach(function (s, k) { s.classList.toggle('is-active', k === idx); });
    chips.forEach(function (c, k) {
      c.classList.toggle('is-active', k === idx);
      c.classList.toggle('is-done', k < idx);
    });
    stNum.textContent = (idx + 1) + '/9';
    stName.textContent = names[idx];
    stQ.textContent = queues[idx];
    runCounters(scenes[idx]);
  }
  function schedule() {
    clearTimeout(timer);
    if (!playing) return;
    timer = setTimeout(function () {
      idx = (idx + 1) % scenes.length;
      if (idx === 0) elapsed = 0;
      render(); schedule();
    }, durations[idx]);
  }
  function setPlaying(p) {
    playing = p;
    playBtn.textContent = p ? 'Pause' : 'Play';
    hbT.textContent = p ? 'Running\u2026' : 'Paused';
    stage.classList.toggle('pw-paused', !p);
    schedule();
  }
  setInterval(function () {
    if (playing) { elapsed += 0.1; stEl.textContent = elapsed.toFixed(1) + 's'; }
  }, 100);
  playBtn.addEventListener('click', function () { setPlaying(!playing); });
  replayBtn.addEventListener('click', function () { idx = 0; elapsed = 0; render(); if (!playing) setPlaying(true); else schedule(); });
  chips.forEach(function (c, k) {
    c.addEventListener('click', function () { idx = k; render(); schedule(); });
  });
  render();
  setPlaying(playing);
})();
