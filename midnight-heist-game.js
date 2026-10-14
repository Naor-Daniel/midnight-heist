(() => {
  'use strict';

  const W = 960;
  const H = 560;
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  ctx.setTransform(2, 0, 0, 2, 0, 0);

  const ui = {
    overlay: document.getElementById('overlay'),
    start: document.getElementById('start'),
    kicker: document.getElementById('modal-kicker'),
    title: document.getElementById('modal-title'),
    text: document.getElementById('modal-text'),
    symbol: document.getElementById('modal-symbol'),
    time: document.getElementById('time'),
    alarm: document.getElementById('alarm-fill'),
    alert: document.getElementById('alert-state'),
    loot: document.getElementById('loot'),
    mission: document.getElementById('mission-name'),
    levelNumber: document.getElementById('level-number'),
    eyebrow: document.getElementById('eyebrow'),
    radarTag: document.getElementById('radar-tag'),
    sideTitle: document.getElementById('side-title'),
    lootObjective: document.getElementById('loot-objective'),
    radarObjective: document.getElementById('radar-objective'),
    radarDescription: document.getElementById('radar-description'),
    hazardObjective: document.getElementById('hazard-objective'),
    hazardDescription: document.getElementById('hazard-description'),
    smokeCount: document.getElementById('smoke-count'),
    smokeButton: document.getElementById('smoke-button'),
    progress: [...document.querySelectorAll('#campaign-track span')],
    difficultyButtons: [...document.querySelectorAll('[data-difficulty]')],
    difficultyDetail: document.getElementById('difficulty-detail'),
    cardStatus: document.getElementById('card-status'),
    intelStatus: document.getElementById('intel-status'),
    terminalStatus: document.getElementById('terminal-status'),
    stage: document.querySelector('.stage'),
    levelButtons: [...document.querySelectorAll('[data-level]')]
  };

  const baseCases = [
    { x: 170, y: 145, w: 150, h: 60 },
    { x: 170, y: 355, w: 150, h: 60 },
    { x: 405, y: 245, w: 150, h: 70 },
    { x: 685, y: 145, w: 130, h: 60 },
    { x: 685, y: 355, w: 130, h: 60 }
  ];

  const difficulties = [
    { name: 'Rookie', detect: 1.5, speed: 0.82, time: 1.25 },
    { name: 'Agent', detect: 0.8, speed: 1, time: 1 },
    { name: 'Legend', detect: 0.4, speed: 1.16, time: 0.9 }
  ];
  let difficultyIndex = 1;
  try {
    const savedRaw = window.localStorage.getItem('midnight-heist-difficulty');
    const saved = Number(savedRaw);
    if (savedRaw !== null && Number.isInteger(saved) && saved >= 0 && saved < difficulties.length) difficultyIndex = saved;
  } catch (_) { /* Game remains playable when storage is unavailable. */ }
  const waypoints = [
    { x: 86, y: 88, links: [1, 4] },
    { x: 360, y: 88, links: [0, 2, 5] },
    { x: 620, y: 88, links: [1, 3, 6] },
    { x: 873, y: 88, links: [2, 7] },
    { x: 86, y: 280, links: [0, 5, 8] },
    { x: 360, y: 280, links: [1, 4, 9] },
    { x: 620, y: 280, links: [2, 7, 10] },
    { x: 873, y: 280, links: [3, 6, 11] },
    { x: 86, y: 480, links: [4, 9] },
    { x: 360, y: 480, links: [5, 8, 10] },
    { x: 620, y: 480, links: [6, 9, 11] },
    { x: 873, y: 480, links: [7, 10] }
  ];
  const levels = [
    {
      name: 'The Glass Gallery', radar: 'forward', radarLabel: 'FORWARD RADAR',
      radarDescription: 'A narrow cone follows each guard. Use the displays as cover.',
      time: 60, speed: 72, range: 155, half: 0.52,
      accent: '#79f1df', floorA: '#172c40', floorB: '#081522',
      diamonds: [{ x: 850, y: 95 }],
      guards: [
        { node: 1, allowed: [1, 2, 5, 6] },
        { node: 7, allowed: [2, 3, 6, 7, 10, 11] }
      ],
      extraCases: [], cameras: [], lasers: [], smoke: 2,
      keycard: null, intel: { x: 590, y: 420 }, terminal: null
    },
    {
      name: 'The Prism Hall', radar: 'sweep', radarLabel: 'SWEEP RADAR',
      radarDescription: 'The cones sweep from side to side. Three faster guards patrol.',
      time: 68, speed: 96, range: 185, half: 0.61,
      accent: '#b7a3ff', floorA: '#242b4d', floorB: '#0a1124',
      diamonds: [{ x: 850, y: 95 }, { x: 358, y: 410 }],
      guards: [
        { node: 1, allowed: [1, 2, 5, 6] },
        { node: 7, allowed: [2, 3, 6, 7, 10, 11] },
        { node: 10, allowed: [5, 9, 10, 11] }
      ],
      extraCases: [{ x: 440, y: 145, w: 84, h: 48 }],
      cameras: [], lasers: [], smoke: 2,
      keycard: { x: 100, y: 280 }, intel: { x: 590, y: 420 }, terminal: null
    },
    {
      name: 'The Obsidian Vault', radar: 'pulse', radarLabel: 'PULSE RADAR',
      radarDescription: 'Sweeping cones periodically widen and reach farther. Four fast guards patrol.',
      time: 78, speed: 122, range: 205, half: 0.66,
      accent: '#ffc184', floorA: '#392d40', floorB: '#160f20',
      diamonds: [{ x: 850, y: 95 }, { x: 358, y: 410 }, { x: 835, y: 285 }],
      guards: [
        { node: 1, allowed: [1, 2, 5, 6] },
        { node: 7, allowed: [2, 3, 6, 7, 10, 11] },
        { node: 10, allowed: [5, 9, 10, 11] },
        { node: 5, allowed: [1, 4, 5, 9] }
      ],
      extraCases: [{ x: 440, y: 145, w: 84, h: 48 }, { x: 440, y: 375, w: 84, h: 48 }],
      cameras: [{ x: 480, y: 45, angle: Math.PI / 2, range: 210, half: 0.4, phase: 0 }],
      lasers: [], smoke: 2,
      keycard: { x: 100, y: 280 }, intel: { x: 100, y: 95 }, terminal: { x: 590, y: 325 }
    },
    {
      name: 'The Neon Atrium', radar: 'sweep', radarLabel: 'SWEEP RADAR',
      radarDescription: 'Four guards change routes as a ceiling camera scans the hall.',
      time: 84, speed: 115, range: 205, half: 0.66,
      accent: '#7cdbff', floorA: '#16354a', floorB: '#071b2e',
      diamonds: [{ x: 850, y: 95 }, { x: 358, y: 410 }, { x: 835, y: 285 }, { x: 100, y: 95 }],
      guards: [
        { node: 1, allowed: [1, 2, 5, 6] },
        { node: 7, allowed: [2, 3, 6, 7, 10, 11] },
        { node: 10, allowed: [5, 9, 10, 11] },
        { node: 5, allowed: [1, 4, 5, 9] }
      ],
      extraCases: [{ x: 440, y: 145, w: 84, h: 48 }, { x: 440, y: 375, w: 84, h: 48 }],
      cameras: [{ x: 480, y: 45, angle: Math.PI / 2, range: 250, half: 0.42, phase: 0.5 }],
      lasers: [{ x1: 363, y1: 315, x2: 363, y2: 425, phase: 0.3 }], smoke: 3,
      keycard: { x: 100, y: 280 }, intel: { x: 590, y: 95 }, terminal: { x: 590, y: 325 }
    },
    {
      name: 'The Clockwork Wing', radar: 'pulse', radarLabel: 'PULSE RADAR',
      radarDescription: 'Five patrols, two cameras, and alternating laser gates.',
      time: 94, speed: 124, range: 215, half: 0.69,
      accent: '#f7d27d', floorA: '#423a34', floorB: '#1b1721',
      diamonds: [{ x: 850, y: 95 }, { x: 358, y: 410 }, { x: 835, y: 285 }, { x: 100, y: 95 }, { x: 590, y: 95 }],
      guards: [
        { node: 1, allowed: [1, 2, 5, 6] },
        { node: 7, allowed: [2, 3, 6, 7, 10, 11] },
        { node: 10, allowed: [5, 9, 10, 11] },
        { node: 5, allowed: [1, 4, 5, 9] },
        { node: 3, allowed: [2, 3, 6, 7] }
      ],
      extraCases: [{ x: 440, y: 145, w: 84, h: 48 }, { x: 440, y: 375, w: 84, h: 48 }],
      cameras: [
        { x: 480, y: 45, angle: Math.PI / 2, range: 250, half: 0.42, phase: 0.5 },
        { x: 45, y: 280, angle: 0, range: 205, half: 0.39, phase: 2.1 }
      ],
      lasers: [
        { x1: 363, y1: 315, x2: 363, y2: 425, phase: 0.3 },
        { x1: 630, y1: 335, x2: 630, y2: 470, phase: 2.1 }
      ], smoke: 3,
      keycard: { x: 590, y: 420 }, intel: { x: 835, y: 475 }, terminal: { x: 590, y: 325 }
    },
    {
      name: 'The Crown Chamber', radar: 'pulse', radarLabel: 'OVERDRIVE RADAR',
      radarDescription: 'Six elite guards and three cameras sweep across the final chamber.',
      time: 108, speed: 136, range: 225, half: 0.74,
      accent: '#ff9cb2', floorA: '#482840', floorB: '#1b1028',
      diamonds: [{ x: 850, y: 95 }, { x: 358, y: 410 }, { x: 835, y: 285 }, { x: 100, y: 95 }, { x: 590, y: 95 }, { x: 590, y: 420 }],
      guards: [
        { node: 1, allowed: [1, 2, 5, 6] },
        { node: 7, allowed: [2, 3, 6, 7, 10, 11] },
        { node: 10, allowed: [5, 9, 10, 11] },
        { node: 5, allowed: [1, 4, 5, 9] },
        { node: 3, allowed: [2, 3, 6, 7] },
        { node: 9, allowed: [4, 8, 9, 10], startTarget: 10 }
      ],
      extraCases: [{ x: 440, y: 145, w: 84, h: 48 }, { x: 440, y: 375, w: 84, h: 48 }],
      cameras: [
        { x: 480, y: 45, angle: Math.PI / 2, range: 255, half: 0.45, phase: 0.5 },
        { x: 45, y: 280, angle: 0, range: 215, half: 0.42, phase: 2.1 },
        { x: 915, y: 280, angle: Math.PI, range: 215, half: 0.42, phase: 3.4 }
      ],
      lasers: [
        { x1: 363, y1: 315, x2: 363, y2: 425, phase: 0.3 },
        { x1: 630, y1: 335, x2: 630, y2: 470, phase: 2.1 },
        { x1: 825, y1: 160, x2: 825, y2: 290, phase: 1.2 }
      ], smoke: 4,
      keycard: { x: 100, y: 280 }, intel: { x: 835, y: 475 }, terminal: { x: 590, y: 325 }
    }
  ];

  const keys = new Set();
  const player = { x: 76, y: 480, r: 12, angle: 0, moving: false };
  const exit = { x: 910, y: 480 };
  let state = 'ready';
  let levelIndex = 0;
  let cases = [];
  let guards = [];
  let cameras = [];
  let lasers = [];
  let diamonds = [];
  let keycard = null;
  let intel = null;
  let terminal = null;
  let shutdownUntil = 0;
  let timer = 60;
  let alarm = 0;
  let seenNow = false;
  let visualTime = 0;
  let levelTime = 0;
  let lastFrame = 0;
  let particles = [];
  let floaters = [];
  let trail = [];
  let smokeCharges = 2;
  let smokeUntil = 0;
  let audio;

  function tone(freq, duration, wave = 'sine', volume = 0.07) {
    try {
      audio ||= new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = wave;
      oscillator.frequency.setValueAtTime(freq, audio.currentTime);
      gain.gain.setValueAtTime(volume, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration);
      oscillator.connect(gain).connect(audio.destination);
      oscillator.start();
      oscillator.stop(audio.currentTime + duration);
    } catch (_) { /* Muted browsers still play the game. */ }
  }

  function burst(x, y, color, count = 30) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 55 + Math.random() * 190;
      particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        life: 0.5 + Math.random() * 0.55, color, size: 1.4 + Math.random() * 2.6 });
    }
  }

  function chooseNext(guard) {
    const options = waypoints[guard.node].links.filter(node => guard.allowed.has(node));
    const fresh = options.filter(node => node !== guard.previous);
    const choices = fresh.length && Math.random() < 0.82 ? fresh : options;
    guard.target = choices[Math.floor(Math.random() * choices.length)];
    const destination = waypoints[guard.target];
    guard.targetAngle = Math.atan2(destination.y - guard.y, destination.x - guard.x);
  }

  function makeGuards(level) {
    return level.guards.map((profile, index) => {
      const start = waypoints[profile.node];
      const guard = {
        x: start.x, y: start.y, node: profile.node, previous: -1,
        allowed: new Set(profile.allowed), target: -1,
        heading: 0, targetAngle: 0,
        speed: level.speed * difficulties[difficultyIndex].speed * (0.93 + Math.random() * 0.15),
        range: level.range, half: level.half,
        phase: Math.random() * 4.2 + index * 0.42,
        radar: null
      };
      chooseNext(guard);
      if (profile.startTarget !== undefined) {
        guard.target = profile.startTarget;
        const destination = waypoints[guard.target];
        guard.targetAngle = Math.atan2(destination.y - guard.y, destination.x - guard.x);
      }
      guard.heading = guard.targetAngle;
      guard.radar = radarFor(guard, level);
      return guard;
    });
  }

  function makeCameras(level) {
    return level.cameras.map(profile => ({
      x: profile.x, y: profile.y, heading: profile.angle, phase: profile.phase,
      range: profile.range, half: profile.half, isCamera: true, radar: null
    }));
  }

  function cameraRadar(camera) {
    return {
      angle: camera.heading + Math.sin(levelTime * 1.25 + camera.phase) * 0.9,
      range: camera.range, half: camera.half, pulse: false
    };
  }

  function laserActive(laser) { return shutdownUntil <= levelTime && (levelTime + laser.phase) % 3.5 < 1.7; }

  function touchingLaser(laser) {
    if (!laserActive(laser)) return false;
    const dx = laser.x2 - laser.x1;
    const dy = laser.y2 - laser.y1;
    const t = Math.max(0, Math.min(1, ((player.x - laser.x1) * dx + (player.y - laser.y1) * dy) / (dx * dx + dy * dy)));
    return Math.hypot(player.x - laser.x1 - t * dx, player.y - laser.y1 - t * dy) < player.r + 4;
  }

  function radarFor(guard, level) {
    let sweep = 0;
    let pulse = false;
    let range = guard.range;
    let half = guard.half;
    if (level.radar === 'sweep') sweep = Math.sin(levelTime * 2.15 + guard.phase) * 0.44;
    if (level.radar === 'pulse') {
      sweep = Math.sin(levelTime * 1.8 + guard.phase) * 0.56;
      pulse = (levelTime + guard.phase) % 4.4 < 0.95;
      if (pulse) { range += 45; half += 0.2; }
    }
    return { angle: guard.heading + sweep, range, half, pulse };
  }

  function prepareLevel(index, begin = false) {
    levelIndex = index;
    const level = levels[levelIndex];
    cases = baseCases.concat(level.extraCases);
    diamonds = level.diamonds.map((point, i) => ({ ...point, id: i, collected: false }));
    keycard = level.keycard && { ...level.keycard, collected: false };
    intel = level.intel && { ...level.intel, collected: false };
    terminal = level.terminal && { ...level.terminal, used: false };
    shutdownUntil = 0;
    timer = Math.round(level.time * difficulties[difficultyIndex].time);
    alarm = 0;
    seenNow = false;
    levelTime = 0;
    visualTime = 0;
    particles = [];
    floaters = [];
    trail = [];
    keys.clear();
    player.x = 76;
    player.y = 480;
    player.angle = 0;
    player.moving = false;
    guards = makeGuards(level);
    cameras = makeCameras(level);
    cameras.forEach(camera => { camera.radar = cameraRadar(camera); });
    lasers = level.lasers;
    smokeCharges = level.smoke;
    smokeUntil = 0;
    document.body.style.setProperty('--level-accent', level.accent);
    ui.mission.textContent = level.name;
    ui.levelNumber.textContent = String(index + 1).padStart(2, '0');
    ui.eyebrow.textContent = `Operation Nocturne · Level 0${index + 1} / 06`;
    ui.radarTag.textContent = level.radarLabel;
    ui.sideTitle.textContent = level.name;
    ui.lootObjective.textContent = `Collect ${diamonds.length} diamond${diamonds.length === 1 ? '' : 's'}`;
    ui.radarObjective.textContent = level.radarLabel.toLowerCase().replace(/^./, letter => letter.toUpperCase());
    ui.radarDescription.textContent = level.radarDescription;
    ui.hazardObjective.textContent = level.lasers.length ? 'Cameras + laser gates'
      : level.cameras.length ? 'Sweeping CCTV' : 'Museum security';
    ui.hazardDescription.textContent = level.lasers.length
      ? `${level.cameras.length} sweeping camera${level.cameras.length === 1 ? '' : 's'} · ${level.lasers.length} timed laser gate${level.lasers.length === 1 ? '' : 's'}.`
      : level.cameras.length ? 'The ceiling camera scans beyond the guards’ patrols.'
        : 'The first wings teach cover and movement. Later wings add cameras and lasers.';
    ui.levelButtons.forEach((button, buttonIndex) => button.setAttribute('aria-pressed', String(buttonIndex === index)));
    ui.difficultyButtons.forEach((button, buttonIndex) => button.setAttribute('aria-pressed', String(buttonIndex === difficultyIndex)));
    ui.difficultyDetail.textContent = `Continuous radar exposure before capture: ${difficulties[difficultyIndex].detect.toFixed(1)} seconds. The alarm fades in cover. Changing difficulty restarts the level.`;
    ui.progress.forEach((segment, segmentIndex) => { segment.className = segmentIndex === index ? 'current' : segmentIndex < index ? 'cleared' : ''; });
    if (begin) {
      state = 'playing';
      ui.overlay.hidden = true;
      canvas.focus();
      tone(330, 0.08);
      setTimeout(() => tone(440, 0.13), 85);
    } else {
      state = 'ready';
      showModal('Mission briefing · Level 0' + (index + 1), level.name,
        `${difficulties[difficultyIndex].name} · ${difficulties[difficultyIndex].detect.toFixed(1)}s in radar. Collect ${diamonds.length} diamond${diamonds.length === 1 ? '' : 's'}${keycard ? ' and the access card' : ''}. Intel adds 10 seconds${terminal ? '; press E near the console to disable security' : ''}.`,
        `Begin level 0${index + 1} →`, '◆');
    }
    syncHud();
  }

  function showModal(kicker, title, text, button, symbol) {
    ui.kicker.textContent = kicker;
    ui.title.textContent = title;
    ui.text.textContent = text;
    ui.start.textContent = button;
    ui.symbol.textContent = symbol;
    ui.overlay.hidden = false;
  }

  function collectedCount() { return diamonds.filter(diamond => diamond.collected).length; }
  function hasAllDiamonds() { return diamonds.every(diamond => diamond.collected); }
  function exitUnlocked() { return hasAllDiamonds() && (!keycard || keycard.collected); }

  function finish(won) {
    if (state !== 'playing') return;
    state = won ? 'won' : 'lost';
    if (won) {
      const final = levelIndex === levels.length - 1;
      showModal(final ? 'Campaign complete' : `Level 0${levelIndex + 1} complete`,
        final ? 'The crown is yours.' : 'You got away clean.',
        final ? `All six missions cleared. You escaped the Crown Chamber with ${Math.ceil(timer)} seconds left.`
          : `${collectedCount()} diamond${collectedCount() === 1 ? '' : 's'} secured${intel?.collected ? ' with bonus intel' : ''} and ${Math.ceil(timer)} seconds left. The next patrols are faster.`,
        final ? 'Play campaign again →' : `Enter level 0${levelIndex + 2} →`, '✦');
      burst(player.x, player.y, '#83f7df', 70);
      tone(523, 0.18); setTimeout(() => tone(659, 0.2), 120); setTimeout(() => tone(784, 0.3), 250);
    } else {
      showModal('Mission failed · Level 0' + (levelIndex + 1),
        alarm >= 100 ? 'Security found you.' : 'The clock ran out.',
        'Patrols choose new routes each attempt. Use the display cases as cover, then try again.',
        'Retry this level →', '!');
      burst(player.x, player.y, '#ff7186', 46);
      tone(145, 0.42, 'sawtooth', 0.045);
    }
    syncHud();
  }

  ui.start.addEventListener('click', () => {
    if (state === 'won') prepareLevel((levelIndex + 1) % levels.length, true);
    else prepareLevel(levelIndex, true);
  });
  ui.levelButtons.forEach(button => button.addEventListener('click', () => prepareLevel(Number(button.dataset.level), true)));
  ui.difficultyButtons.forEach(button => button.addEventListener('click', () => {
    difficultyIndex = Number(button.dataset.difficulty);
    try { window.localStorage.setItem('midnight-heist-difficulty', String(difficultyIndex)); } catch (_) { /* Optional preference. */ }
    prepareLevel(levelIndex, false);
  }));
  ui.smokeButton.addEventListener('click', useSmoke);
  canvas.addEventListener('click', () => { if (state === 'ready') prepareLevel(levelIndex, true); });
  document.addEventListener('keydown', event => {
    const key = event.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'w', 'a', 's', 'd'].includes(key)) event.preventDefault();
    if (key === ' ' && state !== 'playing') {
      if (state === 'won') prepareLevel((levelIndex + 1) % levels.length, true);
      else prepareLevel(levelIndex, true);
      return;
    }
    if (key === ' ' && !event.repeat) useSmoke();
    if (key === 'e' && !event.repeat) hackTerminal();
    keys.add(key);
  });
  document.addEventListener('keyup', event => keys.delete(event.key.toLowerCase()));
  window.addEventListener('blur', () => keys.clear());
  document.querySelectorAll('.touch button').forEach(button => {
    const direction = button.dataset.dir;
    button.addEventListener('pointerdown', event => {
      event.preventDefault();
      button.setPointerCapture(event.pointerId);
      keys.add(direction);
    });
    const release = () => keys.delete(direction);
    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
    button.addEventListener('lostpointercapture', release);
  });

  function useSmoke() {
    if (state !== 'playing' || smokeCharges <= 0 || smokeUntil > levelTime) return;
    smokeCharges--;
    smokeUntil = levelTime + 3;
    burst(player.x, player.y, '#a9eaff', 55);
    floaters.push({ x: player.x, y: player.y - 28, text: 'SMOKE DEPLOYED', life: 1.15 });
    tone(210, 0.22, 'triangle', 0.038);
    syncHud();
  }

  function hackTerminal() {
    if (state !== 'playing' || !terminal || terminal.used || Math.hypot(player.x - terminal.x, player.y - terminal.y) > 55) return;
    terminal.used = true;
    shutdownUntil = levelTime + 8;
    alarm = Math.max(0, alarm - 35);
    burst(terminal.x, terminal.y, '#8feeff', 44);
    floaters.push({ x: terminal.x, y: terminal.y - 29, text: 'SECURITY OFFLINE · 8 SEC', life: 1.5 });
    tone(480, 0.14, 'triangle'); setTimeout(() => tone(710, 0.2, 'triangle'), 110);
    syncHud();
  }

  function inside(x, y, box) { return x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h; }
  function collides(x, y, radius) {
    if (x - radius < 25 || x + radius > W - 25 || y - radius < 25 || y + radius > H - 25) return true;
    return cases.some(box => {
      const closestX = Math.max(box.x, Math.min(x, box.x + box.w));
      const closestY = Math.max(box.y, Math.min(y, box.y + box.h));
      return (x - closestX) ** 2 + (y - closestY) ** 2 < radius ** 2;
    });
  }
  function blocked(ax, ay, bx, by) {
    const steps = Math.ceil(Math.hypot(bx - ax, by - ay) / 7);
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const x = ax + (bx - ax) * t;
      const y = ay + (by - ay) * t;
      if (cases.some(box => inside(x, y, box))) return true;
    }
    return false;
  }
  function canSee(guard) {
    const dx = player.x - guard.x;
    const dy = player.y - guard.y;
    const distance = Math.hypot(dx, dy);
    if (!guard.isCamera && distance < 21) return true;
    if (smokeUntil > levelTime || (guard.isCamera && shutdownUntil > levelTime)) return false;
    if (distance > guard.radar.range) return false;
    const angle = Math.atan2(dy, dx);
    const difference = Math.atan2(Math.sin(angle - guard.radar.angle), Math.cos(angle - guard.radar.angle));
    return Math.abs(difference) <= guard.radar.half && !blocked(guard.x, guard.y, player.x, player.y);
  }
  function turnTowards(current, target, maxStep) {
    const diff = Math.atan2(Math.sin(target - current), Math.cos(target - current));
    return current + Math.max(-maxStep, Math.min(maxStep, diff));
  }
  function moveGuard(guard, dt, level) {
    const target = waypoints[guard.target];
    const dx = target.x - guard.x;
    const dy = target.y - guard.y;
    const distance = Math.hypot(dx, dy);
    if (distance <= guard.speed * dt + 1) {
      guard.x = target.x; guard.y = target.y;
      guard.previous = guard.node;
      guard.node = guard.target;
      chooseNext(guard);
    } else {
      guard.x += dx / distance * guard.speed * dt;
      guard.y += dy / distance * guard.speed * dt;
    }
    guard.heading = turnTowards(guard.heading, guard.targetAngle, dt * 3.8);
    guard.radar = radarFor(guard, level);
  }

  function update(dt) {
    visualTime += dt;
    for (const particle of particles) {
      particle.x += particle.vx * dt; particle.y += particle.vy * dt;
      particle.vx *= 1 - dt * 0.85; particle.vy *= 1 - dt * 0.85;
      particle.life -= dt;
    }
    particles = particles.filter(particle => particle.life > 0);
    for (const floater of floaters) { floater.y -= dt * 35; floater.life -= dt; }
    floaters = floaters.filter(floater => floater.life > 0);
    for (const dot of trail) dot.life -= dt;
    trail = trail.filter(dot => dot.life > 0);
    if (state !== 'playing') return;

    const level = levels[levelIndex];
    levelTime += dt;
    timer -= dt;
    if (timer <= 0) { timer = 0; finish(false); return; }

    let mx = 0, my = 0;
    if (keys.has('arrowleft') || keys.has('a') || keys.has('left')) mx--;
    if (keys.has('arrowright') || keys.has('d') || keys.has('right')) mx++;
    if (keys.has('arrowup') || keys.has('w') || keys.has('up')) my--;
    if (keys.has('arrowdown') || keys.has('s') || keys.has('down')) my++;
    player.moving = mx !== 0 || my !== 0;
    if (player.moving) {
      const length = Math.hypot(mx, my);
      const stepX = mx / length * 220 * dt;
      const stepY = my / length * 220 * dt;
      if (!collides(player.x + stepX, player.y, player.r)) player.x += stepX;
      if (!collides(player.x, player.y + stepY, player.r)) player.y += stepY;
      player.angle = Math.atan2(stepY, stepX);
      if (Math.random() < 0.62) trail.push({ x: player.x, y: player.y, life: 0.46 });
    }

    for (const guard of guards) moveGuard(guard, dt, level);
    for (const camera of cameras) camera.radar = cameraRadar(camera);
    const seen = guards.some(canSee) || cameras.some(canSee) || lasers.some(touchingLaser);
    if (seen && !seenNow) tone(760, 0.14, 'sawtooth', 0.04);
    seenNow = seen;
    const exposureRate = 100 / difficulties[difficultyIndex].detect;
    alarm = Math.min(100, Math.max(0, alarm + (seen ? dt * exposureRate * (lasers.some(touchingLaser) ? 1.5 : 1) : -dt * 65)));
    if (alarm >= 100) { finish(false); return; }

    for (const diamond of diamonds) {
      if (!diamond.collected && Math.hypot(player.x - diamond.x, player.y - diamond.y) < 29) {
        diamond.collected = true;
        burst(diamond.x, diamond.y, '#ffde91', 42);
        floaters.push({ x: diamond.x, y: diamond.y - 25, text: `DIAMOND ${collectedCount()} / ${diamonds.length}`, life: 1.2 });
        tone(650, 0.12); setTimeout(() => tone(980, 0.22), 105);
      }
    }
    if (keycard && !keycard.collected && Math.hypot(player.x - keycard.x, player.y - keycard.y) < 26) {
      keycard.collected = true;
      burst(keycard.x, keycard.y, '#9bcfff', 34);
      floaters.push({ x: keycard.x, y: keycard.y - 30, text: 'ACCESS GRANTED', life: 1.2 });
      tone(520, 0.12); setTimeout(() => tone(760, 0.18), 90);
    }
    if (intel && !intel.collected && Math.hypot(player.x - intel.x, player.y - intel.y) < 26) {
      intel.collected = true;
      timer += 10;
      burst(intel.x, intel.y, '#aaf3b6', 32);
      floaters.push({ x: intel.x, y: intel.y - 30, text: 'INTEL FOUND · +10 SEC', life: 1.3 });
      tone(610, 0.12); setTimeout(() => tone(850, 0.18), 90);
    }
    if (exitUnlocked() && Math.hypot(player.x - exit.x, player.y - exit.y) < 36) {
      finish(true); return;
    }
    syncHud();
  }

  function syncHud() {
    ui.time.textContent = Math.ceil(timer);
    ui.alarm.style.width = alarm.toFixed(1) + '%';
    const caught = state === 'lost' && alarm >= 100;
    const alert = caught ? 'CAUGHT' : seenNow ? 'SPOTTED' : 'CLEAR';
    if (ui.alert.textContent !== alert) ui.alert.textContent = alert;
    ui.alert.classList.toggle('spotted', caught || seenNow);
    ui.stage.classList.toggle('spotted', caught || seenNow);
    ui.loot.textContent = `${collectedCount()} / ${diamonds.length}`;
    ui.loot.style.color = hasAllDiamonds() ? '#8ff2d8' : '#fbd891';
    ui.cardStatus.textContent = !keycard ? 'Not required' : keycard.collected ? 'Collected ✓' : 'Required for exit';
    ui.intelStatus.textContent = intel?.collected ? 'Found · +10s' : '+10 seconds';
    ui.terminalStatus.textContent = !terminal ? 'No console' : shutdownUntil > levelTime
      ? `Offline ${Math.ceil(shutdownUntil - levelTime)}s` : terminal.used ? 'Already hacked' : 'Press E nearby';
    ui.smokeCount.textContent = smokeUntil > levelTime ? `${smokeCharges} · ACTIVE` : smokeCharges;
    ui.smokeButton.disabled = state !== 'playing' || smokeCharges <= 0 || smokeUntil > levelTime;
    ui.smokeButton.textContent = smokeUntil > levelTime
      ? `SMOKE ACTIVE · ${Math.ceil(smokeUntil - levelTime)} SEC`
      : `DEPLOY SMOKE · SPACE (${smokeCharges})`;
  }

  function rounded(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
  }

  function floorLight(x, y, radius, color) {
    const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
    glow.addColorStop(0, color); glow.addColorStop(1, '#ffffff00');
    ctx.fillStyle = glow; ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }

  function drawFloor() {
    const level = levels[levelIndex];
    const background = ctx.createLinearGradient(0, 0, W, H);
    background.addColorStop(0, level.floorA);
    background.addColorStop(1, level.floorB);
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, W, H);

    for (let row = 0; row < 14; row++) {
      for (let column = 0; column < 24; column++) {
        if ((row + column) % 2 === 0) {
          ctx.fillStyle = '#ffffff05';
          ctx.fillRect(column * 40, row * 40, 40, 40);
        }
      }
    }
    ctx.strokeStyle = '#a9cfe317'; ctx.lineWidth = 1;
    for (let x = 0; x <= W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y <= H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    floorLight(190, 85, 210, '#6fa7bd15');
    floorLight(775, 95, 240, '#ffdc7c13');
    floorLight(610, 470, 220, '#8b88e211');
    floorLight(480, 280, 215, level.accent + '15');
    ctx.save();
    ctx.strokeStyle = level.accent + '25'; ctx.lineWidth = 7;
    for (let x = 107; x < 940; x += 265) {
      ctx.beginPath(); ctx.moveTo(x - 50, 31); ctx.quadraticCurveTo(x, 68, x + 50, 31); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - 50, H - 31); ctx.quadraticCurveTo(x, H - 68, x + 50, H - 31); ctx.stroke();
    }
    ctx.restore();
    ctx.strokeStyle = '#c9d9e449'; ctx.lineWidth = 3;
    rounded(22, 22, W - 44, H - 44, 13); ctx.stroke();
    ctx.strokeStyle = '#d4e8f21e'; ctx.lineWidth = 1;
    rounded(30, 30, W - 60, H - 60, 9); ctx.stroke();

    ctx.strokeStyle = '#b7d5e51c'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(480, 280, 174, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(480, 280, 154, 0, Math.PI * 2); ctx.stroke();
    ctx.save(); ctx.translate(480, 280); ctx.rotate(Math.PI / 4);
    ctx.strokeStyle = level.accent + '30'; ctx.lineWidth = 2;
    ctx.strokeRect(-91, -91, 182, 182);
    ctx.strokeRect(-71, -71, 142, 142);
    ctx.restore();
    for (const x of [45, 915]) {
      for (const y of [80, 480]) {
        ctx.fillStyle = '#030a14a8'; ctx.beginPath(); ctx.ellipse(x + 4, y + 6, 16, 8, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#7f9aa766'; ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = level.accent + 'aa'; ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
      }
    }
    for (let i = 0; i < 4; i++) {
      const x = 58 + i * 280;
      ctx.fillStyle = '#c1e8ec57'; ctx.fillRect(x, 21, 35, 3); ctx.fillRect(x, H - 24, 35, 3);
    }
    ctx.fillStyle = '#b2c7d566'; ctx.font = '700 11px system-ui'; ctx.textAlign = 'left';
    ctx.fillText('WEST WING', 50, 54);
    ctx.fillText(level.name.toUpperCase().replace('THE ', ''), 750, 54);
    ctx.textAlign = 'center'; ctx.font = '600 9px system-ui';
    ctx.fillStyle = '#c6dce43c'; ctx.fillText('NOCTURNE MUSEUM · SECURITY PLAN', W / 2, H - 42);
    for (let i = 0; i < 65; i++) {
      const x = 45 + (i * 167.47) % 865;
      const y = 37 + (i * 79.13) % 478;
      ctx.fillStyle = `rgba(210,236,239,${0.055 + (Math.sin(visualTime * 1.2 + i) + 1) * 0.035})`;
      ctx.fillRect(x, y, 1.5, 1.5);
    }
  }

  function radarPolygon(guard) {
    const radar = guard.radar;
    const points = [];
    const rays = 32;
    for (let i = 0; i <= rays; i++) {
      const angle = radar.angle - radar.half + i / rays * radar.half * 2;
      let endX = guard.x, endY = guard.y;
      for (let distance = 8; distance <= radar.range; distance += 8) {
        const x = guard.x + Math.cos(angle) * distance;
        const y = guard.y + Math.sin(angle) * distance;
        if (x < 25 || x > W - 25 || y < 25 || y > H - 25 || cases.some(box => inside(x, y, box))) break;
        endX = x; endY = y;
      }
      points.push([endX, endY]);
    }
    return points;
  }

  function drawRadar(guard) {
    const radar = guard.radar;
    const points = radarPolygon(guard);
    const glow = ctx.createRadialGradient(guard.x, guard.y, 0, guard.x, guard.y, radar.range);
    glow.addColorStop(0, guard.isCamera ? '#66c9ff7f' : radar.pulse ? '#ff5b6694' : '#ff667766');
    glow.addColorStop(1, guard.isCamera ? '#5dcfff08' : '#ff5d6807');
    ctx.fillStyle = glow;
    ctx.strokeStyle = guard.isCamera ? '#9be7ffc7' : radar.pulse ? '#ff9b9c9c' : '#ff7e8b69';
    ctx.lineWidth = radar.pulse ? 1.8 : 1;
    ctx.beginPath(); ctx.moveTo(guard.x, guard.y);
    for (const point of points) ctx.lineTo(point[0], point[1]);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    if (radar.pulse) {
      const radius = 21 + ((levelTime + guard.phase) % 0.95) / 0.95 * 47;
      ctx.strokeStyle = '#ff929088'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(guard.x, guard.y, radius, 0, Math.PI * 2); ctx.stroke();
    }
  }

  function drawLasers() {
    for (const laser of lasers) {
      const active = laserActive(laser);
      ctx.save();
      ctx.setLineDash(active ? [] : [5, 7]);
      ctx.strokeStyle = active ? '#ff476c' : '#b64d6b50';
      ctx.shadowColor = '#ff3d5d'; ctx.shadowBlur = active ? 20 : 0;
      ctx.lineWidth = active ? 4 : 1.5;
      ctx.beginPath(); ctx.moveTo(laser.x1, laser.y1); ctx.lineTo(laser.x2, laser.y2); ctx.stroke();
      ctx.setLineDash([]); ctx.shadowBlur = 0;
      for (const point of [[laser.x1, laser.y1], [laser.x2, laser.y2]]) {
        ctx.fillStyle = '#405570'; ctx.fillRect(point[0] - 7, point[1] - 7, 14, 14);
        ctx.fillStyle = active ? '#ff8da2' : '#8c8497';
        ctx.beginPath(); ctx.arc(point[0], point[1], 4, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }
  }

  function drawCameras() {
    for (const camera of cameras) {
      ctx.save(); ctx.translate(camera.x, camera.y); ctx.rotate(camera.radar.angle);
      const offline = shutdownUntil > levelTime;
      ctx.shadowColor = offline ? '#667987' : '#52caff'; ctx.shadowBlur = offline ? 4 : 15;
      ctx.fillStyle = offline ? '#526270' : '#316789'; rounded(-11, -9, 23, 18, 4); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#0c2234'; rounded(-8, -6, 17, 12, 3); ctx.fill();
      ctx.fillStyle = offline ? '#768c97' : '#97edff'; ctx.beginPath(); ctx.arc(12, 0, 4.5, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      ctx.fillStyle = '#a5ddf2'; ctx.font = '700 8px system-ui'; ctx.textAlign = 'center';
      ctx.fillText('CCTV', camera.x, camera.y + (camera.y < H / 2 ? -17 : 24));
    }
  }

  function drawCases() {
    for (const [index, box] of cases.entries()) {
      ctx.save();
      ctx.shadowColor = '#030810'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 12;
      ctx.fillStyle = '#12243a'; rounded(box.x, box.y, box.w, box.h, 9); ctx.fill();
      ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      const frame = ctx.createLinearGradient(box.x, box.y, box.x + box.w, box.y + box.h);
      frame.addColorStop(0, '#91a9bd'); frame.addColorStop(0.5, '#43576b'); frame.addColorStop(1, '#b7c6d1');
      ctx.strokeStyle = frame; ctx.lineWidth = 3;
      rounded(box.x + 2, box.y + 2, box.w - 4, box.h - 4, 7); ctx.stroke();
      const glass = ctx.createLinearGradient(box.x, box.y, box.x + box.w, box.y + box.h);
      glass.addColorStop(0, '#9dd4dc31'); glass.addColorStop(0.5, '#b6d5d313'); glass.addColorStop(1, '#506f866b');
      ctx.fillStyle = glass; rounded(box.x + 9, box.y + 8, box.w - 18, box.h - 16, 4); ctx.fill();
      ctx.strokeStyle = '#d0f2f233'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(box.x + 16, box.y + 13); ctx.lineTo(box.x + box.w - 16, box.y + 13); ctx.stroke();
      ctx.fillStyle = '#b2c8c9b0'; ctx.beginPath(); ctx.arc(box.x + box.w / 2, box.y + 27, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#d4e0e3a8'; ctx.textAlign = 'center'; ctx.font = '700 9px system-ui';
      ctx.fillText('EXHIBIT ' + String(index + 1).padStart(2, '0'), box.x + box.w / 2, box.y + box.h - 11);
      ctx.restore();
    }
  }

  function drawDiamonds() {
    for (const diamond of diamonds) {
      if (diamond.collected) continue;
      const offset = Math.sin(visualTime * 3 + diamond.id * 2) * 3;
      const x = diamond.x, y = diamond.y + offset;
      ctx.save(); ctx.translate(x, y);
      const aura = ctx.createRadialGradient(0, 0, 4, 0, 0, 52);
      aura.addColorStop(0, '#ffe3a47d'); aura.addColorStop(1, '#ffe3a400');
      ctx.fillStyle = aura; ctx.fillRect(-52, -52, 104, 104);
      ctx.strokeStyle = '#ffdc918a'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(0, 0, 29 + Math.sin(visualTime * 2 + diamond.id) * 2, 0, Math.PI * 2); ctx.stroke();
      ctx.rotate(Math.PI / 4 + visualTime * 0.22);
      ctx.shadowColor = '#ffd57b'; ctx.shadowBlur = 24;
      ctx.fillStyle = '#f9d78e'; ctx.fillRect(-13, -13, 26, 26);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#fff6d2'; ctx.beginPath(); ctx.moveTo(-13, -13); ctx.lineTo(13, -13); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#d39a52'; ctx.beginPath(); ctx.moveTo(13, -13); ctx.lineTo(13, 13); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill();
      ctx.restore();
      ctx.fillStyle = '#fce3a5'; ctx.textAlign = 'center'; ctx.font = '700 10px system-ui';
      ctx.fillText('DIAMOND ' + String(diamond.id + 1).padStart(2, '0'), x, y + 48);
    }
  }

  function drawMissionItems() {
    if (keycard && !keycard.collected) {
      const x = keycard.x, y = keycard.y + Math.sin(visualTime * 2.7) * 2;
      floorLight(x, y, 44, '#78bcff58');
      ctx.save(); ctx.translate(x, y); ctx.rotate(-0.12);
      ctx.shadowColor = '#74bdff'; ctx.shadowBlur = 18;
      ctx.fillStyle = '#83c8ff'; rounded(-16, -12, 32, 24, 4); ctx.fill();
      ctx.shadowBlur = 0; ctx.fillStyle = '#184663'; rounded(-13, -9, 26, 18, 2); ctx.fill();
      ctx.fillStyle = '#d6f4ff'; ctx.fillRect(-9, -5, 8, 6); ctx.fillRect(3, -5, 7, 2); ctx.fillRect(3, 0, 7, 2);
      ctx.restore();
      ctx.fillStyle = '#a8dcff'; ctx.textAlign = 'center'; ctx.font = '800 9px system-ui'; ctx.fillText('ACCESS CARD', x, y + 33);
    }
    if (intel && !intel.collected) {
      const x = intel.x, y = intel.y + Math.sin(visualTime * 2.4 + 1) * 2;
      floorLight(x, y, 42, '#8dfaab50');
      ctx.save(); ctx.translate(x, y); ctx.rotate(0.13);
      ctx.shadowColor = '#96f4b5'; ctx.shadowBlur = 17;
      ctx.fillStyle = '#7fd8a0'; rounded(-14, -12, 28, 24, 3); ctx.fill();
      ctx.shadowBlur = 0; ctx.fillStyle = '#1d504a'; rounded(-10, -9, 20, 18, 2); ctx.fill();
      ctx.fillStyle = '#bafadd'; ctx.fillRect(-6, -5, 12, 2); ctx.fillRect(-6, -1, 10, 2); ctx.fillRect(-6, 3, 7, 2);
      ctx.restore();
      ctx.fillStyle = '#9ff5be'; ctx.textAlign = 'center'; ctx.font = '800 9px system-ui'; ctx.fillText('INTEL +10s', x, y + 33);
    }
    if (terminal) {
      const x = terminal.x, y = terminal.y;
      const offline = shutdownUntil > levelTime;
      ctx.save(); ctx.translate(x, y);
      ctx.shadowColor = offline ? '#85f6b1' : '#68dfff'; ctx.shadowBlur = terminal.used && !offline ? 0 : 17;
      ctx.fillStyle = '#344b62'; rounded(-17, -16, 34, 32, 6); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = offline ? '#63cc93' : terminal.used ? '#647a88' : '#67cae9'; rounded(-12, -11, 24, 17, 3); ctx.fill();
      ctx.fillStyle = '#133247'; ctx.fillRect(-7, -7, 14, 2); ctx.fillRect(-7, -2, 10, 2);
      ctx.fillStyle = '#a4bdd0'; ctx.fillRect(-6, 10, 12, 2);
      ctx.restore();
      ctx.fillStyle = offline ? '#a0f2bf' : '#a8eaff'; ctx.textAlign = 'center'; ctx.font = '800 9px system-ui';
      ctx.fillText(offline ? 'SECURITY OFFLINE' : terminal.used ? 'CONSOLE USED' : 'HACK CONSOLE', x, y + 34);
      if (!terminal.used && state === 'playing' && Math.hypot(player.x - x, player.y - y) < 55) {
        ctx.fillStyle = '#d9f8ff'; ctx.font = '800 12px system-ui'; ctx.fillText('PRESS E', x, y - 25);
      }
    }
  }

  function drawExit() {
    const open = exitUnlocked();
    ctx.save(); ctx.translate(exit.x, exit.y);
    const pulse = Math.sin(visualTime * 4) * 0.12 + 0.88;
    ctx.shadowColor = open ? '#66f9d8' : '#60788b'; ctx.shadowBlur = open ? 28 : 8;
    ctx.fillStyle = open ? '#2b8f8299' : '#3b526588';
    rounded(-29, -40, 58, 80, 8); ctx.fill();
    ctx.strokeStyle = open ? '#8affde' : '#839bab'; ctx.lineWidth = 3;
    rounded(-29, -40, 58, 80, 8); ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = open ? `rgba(166,255,226,${pulse})` : '#adc1cb';
    ctx.font = '800 10px system-ui'; ctx.textAlign = 'center';
    ctx.fillText(open ? 'EXIT' : 'LOCKED', 0, 4);
    if (open) {
      for (let i = 0; i < 3; i++) {
        const x = -8 + i * 8;
        ctx.beginPath(); ctx.moveTo(x - 3, 18); ctx.lineTo(x, 22); ctx.lineTo(x + 3, 18); ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawPerson(x, y, angle, isGuard, moving, phase = 0) {
    const gait = moving ? Math.sin(visualTime * (isGuard ? 13 : 17) + phase) * 3.5 : 0;
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
    ctx.fillStyle = '#020711b8'; ctx.beginPath(); ctx.ellipse(5, 10, 18, 10, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = isGuard ? '#252436' : '#0a2637';
    rounded(-14 + gait, -10, 12, 7, 2); ctx.fill();
    rounded(-14 - gait, 3, 12, 7, 2); ctx.fill();
    ctx.shadowColor = isGuard ? '#ff6379' : '#64f8df'; ctx.shadowBlur = 18;
    ctx.fillStyle = isGuard ? '#a13f55' : '#1b827f';
    rounded(-8, -13, 23, 26, 6); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = isGuard ? '#321e30' : '#123043';
    rounded(-5, -10, 16, 20, 4); ctx.fill();
    ctx.fillStyle = isGuard ? '#f7909b' : '#90f3e1';
    rounded(-1, -12, 6, 24, 3); ctx.fill();
    ctx.fillStyle = isGuard ? '#8f354d' : '#12495a';
    rounded(-4 + gait * 0.35, -17, 16, 6, 3); ctx.fill();
    rounded(-4 - gait * 0.35, 11, 16, 6, 3); ctx.fill();
    ctx.fillStyle = isGuard ? '#edb6a7' : '#a0e5dc';
    ctx.beginPath(); ctx.arc(15, 0, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = isGuard ? '#603048' : '#133b4d';
    ctx.beginPath(); ctx.arc(13, 0, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = isGuard ? '#ffdade' : '#d3fff7';
    ctx.fillRect(18, -3, 4, 6);
    if (isGuard) {
      ctx.fillStyle = '#ff6c7d'; ctx.beginPath(); ctx.moveTo(23, 0); ctx.lineTo(13, -5); ctx.lineTo(13, 5); ctx.closePath(); ctx.fill();
    } else {
      ctx.strokeStyle = '#cafcf6'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(-1, -8); ctx.lineTo(8, -8); ctx.stroke();
      ctx.fillStyle = '#f6d691'; ctx.beginPath(); ctx.arc(-5, 0, 3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  function drawGuards() {
    for (const [index, guard] of guards.entries()) {
      const target = waypoints[guard.target];
      ctx.save(); ctx.setLineDash([2, 8]); ctx.strokeStyle = '#ff87913a'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(guard.x, guard.y); ctx.lineTo(target.x, target.y); ctx.stroke(); ctx.restore();
      drawPerson(guard.x, guard.y, guard.heading, true, state === 'playing', index * 1.7);
    }
  }

  function drawPlayer() {
    for (const dot of trail) {
      ctx.fillStyle = `rgba(119,241,222,${dot.life * 0.25})`;
      ctx.beginPath(); ctx.arc(dot.x, dot.y, 8 * (1 - dot.life), 0, Math.PI * 2); ctx.fill();
    }
    if (smokeUntil > levelTime && state === 'playing') {
      const radius = 45 + Math.sin(visualTime * 5) * 4;
      const fog = ctx.createRadialGradient(player.x, player.y, 5, player.x, player.y, radius + 23);
      fog.addColorStop(0, '#c5faff9c'); fog.addColorStop(0.6, '#8bcfe671'); fog.addColorStop(1, '#7adcf000');
      ctx.fillStyle = fog; ctx.beginPath(); ctx.arc(player.x, player.y, radius + 23, 0, Math.PI * 2); ctx.fill();
      for (let i = 0; i < 10; i++) {
        const angle = i * Math.PI * 2 / 10 + visualTime * 0.2;
        const x = player.x + Math.cos(angle) * (radius * 0.68);
        const y = player.y + Math.sin(angle) * (radius * 0.68);
        ctx.fillStyle = '#c7f7ff29'; ctx.beginPath(); ctx.arc(x, y, 17 + Math.sin(visualTime * 3 + i) * 3, 0, Math.PI * 2); ctx.fill();
      }
    }
    drawPerson(player.x, player.y, player.angle, false, player.moving);
    if (alarm > 10) {
      ctx.strokeStyle = `rgba(255,106,127,${alarm / 125})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(player.x, player.y, 20 + alarm / 15, 0, Math.PI * 2); ctx.stroke();
    }
  }

  function drawEffects() {
    for (const particle of particles) {
      ctx.globalAlpha = Math.min(1, particle.life * 1.4);
      ctx.fillStyle = particle.color;
      ctx.fillRect(particle.x - particle.size / 2, particle.y - particle.size / 2, particle.size, particle.size);
    }
    ctx.globalAlpha = 1;
    for (const floater of floaters) {
      ctx.globalAlpha = Math.min(1, floater.life);
      ctx.fillStyle = '#fff1c9'; ctx.textAlign = 'center'; ctx.font = '800 13px system-ui';
      ctx.fillText(floater.text, floater.x, floater.y);
    }
    ctx.globalAlpha = 1;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    drawFloor();
    for (const guard of guards) {
      if (state !== 'playing') guard.radar = radarFor(guard, levels[levelIndex]);
      drawRadar(guard);
    }
    for (const camera of cameras) {
      if (state !== 'playing') camera.radar = cameraRadar(camera);
      if (shutdownUntil <= levelTime) drawRadar(camera);
    }
    drawCases(); drawLasers(); drawExit(); drawDiamonds(); drawMissionItems(); drawCameras(); drawGuards(); drawPlayer(); drawEffects();
    if (alarm > 0 && state === 'playing') {
      ctx.fillStyle = `rgba(255,67,91,${alarm / 100 * 0.09})`;
      ctx.fillRect(0, 0, W, H);
    }
    const vignette = ctx.createRadialGradient(W / 2, H / 2, 170, W / 2, H / 2, 620);
    vignette.addColorStop(0, '#00000000'); vignette.addColorStop(1, '#02050b9c');
    ctx.fillStyle = vignette; ctx.fillRect(0, 0, W, H);
  }

  function loop(timestamp) {
    const dt = Math.min((timestamp - lastFrame) / 1000 || 0, 0.04);
    lastFrame = timestamp;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  prepareLevel(0, false);
  requestAnimationFrame(loop);
})();
