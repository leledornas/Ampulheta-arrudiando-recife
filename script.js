(() => {
  'use strict';

  /* ===== Configuração ===== */
  const MIN_SECONDS = 25;       // menor duração de uma rodada
  const MAX_SECONDS = 40;       // maior duração de uma rodada
  const ALARM_REPEATS = 4;      // quantas vezes o alarme toca antes de reiniciar
  const ALARM_GAP = 0.7;        // segundos entre um toque e o próximo
  // depois do último toque, a próxima rodada começa sozinha
  const ALARM_MS = Math.round(ALARM_REPEATS * ALARM_GAP * 1000) + 300;

  /* ===== Elementos ===== */
  const $ = (id) => document.getElementById(id);
  const el = {
    app: $('app'), glass: $('glass'),
    pill: $('pill'), pillText: $('pillText'),
    time: $('time'), timeLabel: $('timeLabel'),
    mainBtn: $('mainBtn'), mainBtnText: $('mainBtnText'),
    soundBtn: $('soundBtn'),
    slash: $('slash'), waves: $('waves'),
    topSand: $('topSand'), botSand: $('botSand'), stream: $('stream'),
    rounds: $('roundsText')
  };

  /* ===== Estado ===== */
  // idle    = esperando começar
  // running = ampulheta correndo (rodada em andamento)
  // alarm   = alarme tocando; ao terminar, a próxima rodada começa sozinha
  // ended   = jogador apertou "Finalizar partida"
  let state = 'idle';
  let rounds = 0;               // rodadas concluídas na partida atual
  let duration = 0;             // segundos da rodada atual (sorteado, fica escondido do jogador)
  let startedAt = 0;
  let raf = 0;
  let endTimeout = 0;
  let alarmTimeout = 0;
  let soundOn = true;
  let wakeLock = null;

  /* ===== Utilidades ===== */
  const pad = (n) => String(n).padStart(2, '0');
  const fmt = (s) => pad(Math.floor(s / 60)) + ':' + pad(Math.floor(s % 60));
  const randomDuration = () => MIN_SECONDS + Math.floor(Math.random() * (MAX_SECONDS - MIN_SECONDS + 1));
  const isActive = () => state === 'running' || state === 'alarm';

  function clearTimers() {
    cancelAnimationFrame(raf);
    clearTimeout(endTimeout);
    clearTimeout(alarmTimeout);
  }

  /* ===== Ampulheta (areia) ===== */
  function drawSand(p) {
    const topY = 36 + p * 94;                       // nível da areia de cima (36 → 130)
    el.topSand.setAttribute('y', topY);
    el.topSand.setAttribute('height', Math.max(0, 130 - topY));
    el.topSand.style.display = p >= 1 ? 'none' : '';

    const h = p * 84;                                // altura da areia de baixo
    if (h <= 0.5) {
      el.botSand.style.display = 'none';
    } else {
      const y = 236 - h;
      const peak = Math.min(14, h * 0.5);
      el.botSand.setAttribute('d',
        `M40 236 L40 ${y + peak} Q100 ${y - peak} 160 ${y + peak} L160 236 Z`);
      el.botSand.style.display = '';
    }

    const flowing = state === 'running' && p > 0 && p < 1;
    el.stream.style.display = flowing ? '' : 'none';
    if (flowing) el.stream.setAttribute('y2', 236 - h);
  }

  /* ===== Interface por estado ===== */
  function render() {
    el.rounds.textContent = rounds;
    const finished = state === 'alarm' || state === 'ended';
    el.pill.className = 'pill ' + (finished ? 'done' : state);
    el.app.classList.toggle('done', finished);

    if (state === 'idle') {
      el.pillText.textContent = 'Pronto para jogar';
      el.timeLabel.textContent = 'Aguardando início';
      setMain('play', 'Começar partida', false);
    } else if (state === 'running') {
      el.pillText.textContent = 'Partida em andamento';
      el.timeLabel.textContent = 'Tempo decorrido';
      setMain('stop', 'Finalizar partida', true);
    } else if (state === 'alarm') {
      el.pillText.textContent = 'Vez de girar a roleta!';
      el.timeLabel.textContent = 'Tempo da rodada';
      setMain('stop', 'Finalizar partida', true);
    } else {
      el.pillText.textContent = 'Partida encerrada';
      el.timeLabel.textContent = 'Partida finalizada';
      setMain('play', 'Começar nova partida', false);
    }
  }

  function setMain(icon, text, cancel) {
    el.mainBtnText.textContent = text;
    el.mainBtn.classList.toggle('cancel', cancel);
    const dot = el.mainBtn.querySelector('.dot');
    dot.style.background = cancel ? 'var(--navy)' : 'var(--coral)';
    dot.innerHTML = icon === 'play'
      ? '<svg viewBox="0 0 16 16" fill="none" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"><path d="M4 2.5v11l9-5.5z"/></svg>'
      : '<svg viewBox="0 0 16 16" fill="#fff"><rect x="3" y="3" width="10" height="10" rx="2"/></svg>';
  }

  /* ===== Fluxo da partida ===== */
  function startGame() {            // botão "Começar partida"
    unlockAudio();
    rounds = 0;
    startRound();
  }

  function startRound() {           // inicia (ou reinicia) a ampulheta com um novo tempo sorteado
    clearTimers();
    duration = randomDuration();
    startedAt = performance.now();
    state = 'running';
    el.glass.classList.remove('alarm');
    el.time.textContent = '00:00';
    drawSand(0);
    render();
    requestWakeLock();
    // segurança: se a aba ficar em segundo plano e o rAF pausar, o setTimeout ainda dispara
    endTimeout = setTimeout(() => { if (state === 'running') finishRound(); }, duration * 1000 + 30);
    raf = requestAnimationFrame(tick);
  }

  function tick() {
    if (state !== 'running') return;
    const elapsed = (performance.now() - startedAt) / 1000;
    if (elapsed >= duration) { finishRound(); return; }
    el.time.textContent = fmt(elapsed);
    drawSand(elapsed / duration);
    raf = requestAnimationFrame(tick);
  }

  function finishRound() {          // tempo acabou: toca o alarme e, depois dos toques, reinicia sozinho
    if (state !== 'running') return;
    cancelAnimationFrame(raf);
    clearTimeout(endTimeout);
    state = 'alarm';
    rounds++;
    el.time.textContent = fmt(duration);
    drawSand(1);
    render();
    el.glass.classList.remove('alarm');
    void el.glass.getBoundingClientRect();
    el.glass.classList.add('alarm');
    alarm();
    alarmTimeout = setTimeout(() => { if (state === 'alarm') startRound(); }, ALARM_MS);
  }

  function endGame() {              // botão "Finalizar partida"
    clearTimers();
    stopSounds();
    stopKeepAlive();
    state = 'ended';
    el.stream.style.display = 'none';
    el.glass.classList.remove('alarm');
    render();
    releaseWakeLock();
  }

  /* ===== Som (Web Audio – não precisa de arquivo de áudio) ===== */
  let ctx = null;
  const live = new Set();           // tons agendados/tocando, para poder parar ao finalizar
  function unlockAudio() {
    // iPhone: pede ao Safari para tratar o áudio como "reprodução de mídia",
    // o que faz o som tocar mesmo com a chave lateral no silencioso
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
    startKeepAlive();
    try {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
    } catch (e) {}
  }

  // Plano B para iPhones/Safari mais antigos: um áudio mudo em loop durante a partida
  // mantém a sessão de áudio em modo "mídia", e o alarme passa a tocar no silencioso.
  let keepAlive = null;
  function silentWavUrl() {
    const rate = 8000, n = rate / 2;               // 0,5 s de silêncio
    const buf = new ArrayBuffer(44 + n);
    const v = new DataView(buf);
    const w = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    w(0, 'RIFF'); v.setUint32(4, 36 + n, true); w(8, 'WAVE'); w(12, 'fmt ');
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, rate, true); v.setUint32(28, rate, true);
    v.setUint16(32, 1, true); v.setUint16(34, 8, true);
    w(36, 'data'); v.setUint32(40, n, true);
    for (let i = 0; i < n; i++) v.setUint8(44 + i, 128);
    return URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }));
  }
  function startKeepAlive() {
    try {
      if (!keepAlive) {
        keepAlive = new Audio(silentWavUrl());
        keepAlive.loop = true;
        keepAlive.setAttribute('playsinline', '');
      }
      const p = keepAlive.play();
      if (p && p.catch) p.catch(() => {});
    } catch (e) {}
  }
  function stopKeepAlive() {
    try { if (keepAlive) keepAlive.pause(); } catch (e) {}
  }
  function beep(freq, when, dur, type = 'square', vol = 0.35) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(vol, when + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    o.connect(g).connect(ctx.destination);
    live.add(o);
    o.onended = () => live.delete(o);
    o.start(when);
    o.stop(when + dur + 0.05);
  }
  function stopSounds() {
    live.forEach((o) => { try { o.stop(); } catch (e) {} });
    live.clear();
    if (navigator.vibrate) navigator.vibrate(0);
  }
  function alarm() {
    if (navigator.vibrate) navigator.vibrate([400, 150, 400, 150, 700]);
    if (!soundOn) return;
    unlockAudio();
    if (!ctx) return;
    const t0 = ctx.currentTime + 0.05;
    // ALARM_REPEATS "toques" de dois tons, bem audíveis
    for (let i = 0; i < ALARM_REPEATS; i++) {
      const t = t0 + i * ALARM_GAP;
      beep(880, t, 0.28);
      beep(1175, t + 0.3, 0.28);
    }
  }

  /* ===== Tela sempre ligada durante a partida ===== */
  async function requestWakeLock() {
    try {
      if ('wakeLock' in navigator && !wakeLock) {
        wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener('release', () => { wakeLock = null; });
      }
    } catch (e) {}
  }
  function releaseWakeLock() {
    try { if (wakeLock) { wakeLock.release(); wakeLock = null; } } catch (e) {}
  }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible' || !isActive()) return;
    requestWakeLock();
    if (state === 'running' && (performance.now() - startedAt) / 1000 >= duration) finishRound();
  });

  /* ===== Eventos ===== */
  el.mainBtn.addEventListener('click', () => (isActive() ? endGame() : startGame()));
  el.soundBtn.addEventListener('click', () => {
    soundOn = !soundOn;
    el.soundBtn.setAttribute('aria-pressed', String(soundOn));
    el.slash.style.display = soundOn ? 'none' : '';
    el.waves.style.display = soundOn ? '' : 'none';
    if (!soundOn) stopSounds();
    else { unlockAudio(); if (ctx) beep(988, ctx.currentTime + 0.02, 0.18, 'triangle', 0.3); }
  });


  /* ===== Início ===== */
  drawSand(0);
  render();
})();