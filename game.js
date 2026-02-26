const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const levelEl = document.getElementById("level");
const timeEl = document.getElementById("time");
const powerEl = document.getElementById("power");
const energyTextEl = document.getElementById("energyText");
const diamondsEl = document.getElementById("diamonds");
const overlay = document.getElementById("overlay");
const statusEl = document.getElementById("status");
const overlaySubEl = document.getElementById("overlaySub");
const resumeButton = document.getElementById("resumeButton");
const mainMenuButton = document.getElementById("mainMenuButton");
const pauseSettingsButton = document.getElementById("pauseSettingsButton");
const pauseSettings = document.getElementById("pauseSettings");
const pauseMusicSlider = document.getElementById("pauseMusicSlider");
const pauseMusicValue = document.getElementById("pauseMusicValue");
const pauseSfxSlider = document.getElementById("pauseSfxSlider");
const pauseSfxValue = document.getElementById("pauseSfxValue");
const levelProgressFillEl = document.getElementById("levelProgressFill");
const levelProgressTextEl = document.getElementById("levelProgressText");
const energyMeterFillEl = document.getElementById("energyMeterFill");
const energyMeterTextEl = document.getElementById("energyMeterText");
const powerMeterFillEl = document.getElementById("powerMeterFill");
const powerMeterTextEl = document.getElementById("powerMeterText");

const muteButton = document.getElementById("muteButton");
const volumeSlider = document.getElementById("volumeSlider");
const volumeValue = document.getElementById("volumeValue");
const menuMuteButton = document.getElementById("menuMuteButton");
const menuVolumeSlider = document.getElementById("menuVolumeSlider");
const menuVolumeValue = document.getElementById("menuVolumeValue");
const menuMusicSlider = document.getElementById("menuMusicSlider");
const menuMusicValue = document.getElementById("menuMusicValue");
const menuSfxSlider = document.getElementById("menuSfxSlider");
const menuSfxValue = document.getElementById("menuSfxValue");

const menuOverlay = document.getElementById("menuOverlay");
const startButton = document.getElementById("startButton");
const settingsButton = document.getElementById("settingsButton");
const creditsButton = document.getElementById("creditsButton");
const leaderboardsButton = document.getElementById("leaderboardsButton");
const menuLeaderboards = document.getElementById("menuLeaderboards");
const leaderboardList = document.getElementById("leaderboardList");
const resetLeaderboardButton = document.getElementById("resetLeaderboardButton");
const highScoreOverlay = document.getElementById("highScoreOverlay");
const highScoreName = document.getElementById("highScoreName");
const highScoreError = document.getElementById("highScoreError");
const highScoreSave = document.getElementById("highScoreSave");
const highScoreCancel = document.getElementById("highScoreCancel");
const highScoreClose = document.getElementById("highScoreClose");
const resetConfirmOverlay = document.getElementById("resetConfirmOverlay");
const resetConfirmYes = document.getElementById("resetConfirmYes");
const resetConfirmNo = document.getElementById("resetConfirmNo");
const menuSettings = document.getElementById("menuSettings");
const menuCredits = document.getElementById("menuCredits");
const toggleSoundSettings = document.getElementById("toggleSoundSettings");
const toggleDifficultySettings = document.getElementById("toggleDifficultySettings");
const soundSettingsPanel = document.getElementById("soundSettingsPanel");
const difficultyPanel = document.getElementById("difficultyPanel");
const reviveOverlay = document.getElementById("reviveOverlay");
const reviveFillEl = document.getElementById("reviveFill");
const reviveTimerTextEl = document.getElementById("reviveTimerText");
const reviveErrorEl = document.getElementById("reviveError");
const reviveYes = document.getElementById("reviveYes");
const reviveRetry = document.getElementById("reviveRetry");
const reviveClose = document.getElementById("reviveClose");
const difficultyButtons = Array.from(document.querySelectorAll(".difficulty button"));

const WORLD = { w: canvas.width, h: canvas.height };
const BASE_PLAYER_SPEED = 235;
const ROUND_TIME = 60;
const BASE_MINE_COUNT = 4;
const LEVEL_SCORE_STEP = 160;
const LEVEL_GROWTH = 0.18;
const MAX_MINES = 20;
const POWER_SPAWN_MIN = 7;
const POWER_SPAWN_MAX = 12;
const DIAMOND_SPAWN_MIN = 7;
const DIAMOND_SPAWN_MAX = 12;
const DIAMOND_SPAWN_CHANCE = 0.2;

const ENERGY_MAX = 100;
const ENERGY_DRAIN = 30;
const ENERGY_REGEN = 18;
const BOOST_MULT = 1.75;

const POWER_META = {
  shield: { color: "#60a5fa", label: "Shield", duration: 10 },
  speed: { color: "#fbbf24", label: "Speed", duration: 8 },
  freeze: { color: "#a78bfa", label: "Freeze", duration: 6 },
  time: { color: "#34d399", label: "+12s", duration: 0 }
};

const ORB_TYPES = {
  green: { color: "#43d17a", glow: "#9bffcc", points: 10 },
  yellow: { color: "#fbbf24", glow: "#ffe59a", points: 20 },
  purple: { color: "#8b5cf6", glow: "#d8c3ff", points: 50 }
};

const PLAYER_COLORS = ["#45d7ff", "#ff7ab6", "#7aa2ff", "#3ff3d1", "#b9f0ff"];

const DIFFICULTY = {
  easy: { mineSpeed: 0.7, mineEveryLevels: 2, god: false },
  normal: { mineSpeed: 1, mineEveryLevels: 1, god: false },
  hard: { mineSpeed: 1.25, mineEveryLevels: 1, god: false },
  god: { mineSpeed: 1.35, mineEveryLevels: 1, god: true }
};

let keys = new Set();
let running = false;
let paused = false;
let lastStamp = 0;
let backgroundStars = [];
let levelPulse = 0;
let playerColorIndex = 0;

let player;
let orbs;
let mines;
let powerUps;
let diamonds;
let score = 0;
let level = 1;
let levelStep = LEVEL_SCORE_STEP;
let nextLevelScore = LEVEL_SCORE_STEP;
let timeLeft = ROUND_TIME;
let energy = ENERGY_MAX;
let diamondsCount = 0;
let best = 0;
let nextPowerSpawn = 9;
let nextDiamondSpawn = 8;
let shieldUntil = 0;
let speedUntil = 0;
let freezeUntil = 0;
let invulnUntil = 0;
let reviveActive = false;
let reviveDeadline = 0;
let reviveTimer = 0;
let difficultyMode = localStorage.getItem("orbRunnerDifficulty") || "normal";
let godPulse = 0;
let godPulseDir = 1;
let nextGodPulse = 4;
let powerMeterUntil = 0;
let powerMeterLabel = "None";
let runStart = 0;
let pendingHighScore = null;
let highScorePause = false;
let runBestThreshold = 0;
let highScoreTriggered = false;
let lastPowerActive = false;

let audioCtx = null;
let masterGain = null;
let musicGain = null;
let sfxGain = null;
let soundEnabled = true;
let volumeLevel = Number(localStorage.getItem("orbRunnerVolume") || 0.7);
let musicLevel = Number(localStorage.getItem("orbRunnerMusic") || 0.6);
let sfxLevel = Number(localStorage.getItem("orbRunnerSfx") || 0.7);
let musicTimer = null;
let musicStep = 0;
let menuMusicTimer = null;
let menuStep = 0;
const powerupAudio = new Audio("media/powerup.mp3");
const bgmAudio = new Audio("media/bgm.mp3");
const menuAudio = new Audio("media/menu.mp3");
const shieldBreakAudio = new Audio("media/shield_break.mp3");
const powerdownAudio = new Audio("media/powerdown.mp3");
const levelupAudio = new Audio("media/levelup.mp3");
const deathAudio = new Audio("media/death.mp3");
bgmAudio.loop = true;
bgmAudio.preload = "auto";
menuAudio.loop = true;
menuAudio.preload = "auto";
shieldBreakAudio.preload = "auto";
powerdownAudio.preload = "auto";
levelupAudio.preload = "auto";
deathAudio.preload = "auto";
powerupAudio.preload = "auto";

function resetAllRecords() {
  const keysToClear = [
    "orbRunnerBest",
    "orbRunnerBest_easy",
    "orbRunnerBest_normal",
    "orbRunnerBest_hard",
    "orbRunnerBest_god",
    "orbRunnerDiamonds",
    "orbRunnerVolume",
    "orbRunnerMusic",
    "orbRunnerSfx",
    "orbRunnerDifficulty"
  ];
  keysToClear.forEach((key) => localStorage.removeItem(key));
}

function maybeResetRecords() {
  if (localStorage.getItem("orbRunnerResetDone")) return;
  resetAllRecords();
  localStorage.setItem("orbRunnerResetDone", "true");
}

function getBestKey(mode) {
  return `orbRunnerBest_${mode}`;
}

maybeResetRecords();
difficultyMode = localStorage.getItem("orbRunnerDifficulty") || "normal";
best = Number(localStorage.getItem(getBestKey(difficultyMode)) || 0);
bestEl.textContent = best;

function nowSeconds() {
  return performance.now() / 1000;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function initAudio() {
  volumeLevel = Number.isFinite(volumeLevel) ? clamp(volumeLevel, 0, 1) : 0.7;
  musicLevel = Number.isFinite(musicLevel) ? clamp(musicLevel, 0, 1) : 0.6;
  sfxLevel = Number.isFinite(sfxLevel) ? clamp(sfxLevel, 0, 1) : 0.7;

  if (!audioCtx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    audioCtx = new AudioCtx();
    masterGain = audioCtx.createGain();
    musicGain = audioCtx.createGain();
    sfxGain = audioCtx.createGain();
    masterGain.gain.value = soundEnabled ? volumeLevel : 0;
    musicGain.gain.value = musicLevel;
    sfxGain.gain.value = sfxLevel;
    musicGain.connect(masterGain);
    sfxGain.connect(masterGain);
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

function setVolume(value) {
  volumeLevel = clamp(value, 0, 1);
  localStorage.setItem("orbRunnerVolume", String(volumeLevel));
  if (masterGain) {
    const now = audioCtx.currentTime;
    const target = soundEnabled ? volumeLevel : 0;
    masterGain.gain.setTargetAtTime(target, now, 0.01);
  }
  const pct = Math.round(volumeLevel * 100);
  if (volumeSlider) volumeSlider.value = String(pct);
  if (volumeValue) volumeValue.textContent = `${pct}%`;
  if (menuVolumeSlider) menuVolumeSlider.value = String(pct);
  if (menuVolumeValue) menuVolumeValue.textContent = `${pct}%`;
}

function setMusicVolume(value) {
  musicLevel = clamp(value, 0, 1);
  localStorage.setItem("orbRunnerMusic", String(musicLevel));
  if (musicGain) {
    const now = audioCtx.currentTime;
    musicGain.gain.setTargetAtTime(musicLevel, now, 0.01);
  }
  bgmAudio.volume = volumeLevel * musicLevel;
  menuAudio.volume = volumeLevel * musicLevel;
  const pct = Math.round(musicLevel * 100);
  if (menuMusicSlider) menuMusicSlider.value = String(pct);
  if (menuMusicValue) menuMusicValue.textContent = `${pct}%`;
  if (pauseMusicSlider) pauseMusicSlider.value = String(pct);
  if (pauseMusicValue) pauseMusicValue.textContent = `${pct}%`;
}

function setSfxVolume(value) {
  sfxLevel = clamp(value, 0, 1);
  localStorage.setItem("orbRunnerSfx", String(sfxLevel));
  if (sfxGain) {
    const now = audioCtx.currentTime;
    sfxGain.gain.setTargetAtTime(sfxLevel, now, 0.01);
  }
  const pct = Math.round(sfxLevel * 100);
  if (menuSfxSlider) menuSfxSlider.value = String(pct);
  if (menuSfxValue) menuSfxValue.textContent = `${pct}%`;
  if (pauseSfxSlider) pauseSfxSlider.value = String(pct);
  if (pauseSfxValue) pauseSfxValue.textContent = `${pct}%`;
}

function setSoundEnabled(enabled) {
  soundEnabled = enabled;
  if (masterGain && audioCtx) {
    const now = audioCtx.currentTime;
    masterGain.gain.setTargetAtTime(soundEnabled ? volumeLevel : 0, now, 0.01);
  }
  const label = soundEnabled ? "Mute" : "Unmute";
  if (muteButton) {
    muteButton.textContent = label;
    muteButton.classList.toggle("is-muted", !soundEnabled);
  }
  if (menuMuteButton) {
    menuMuteButton.textContent = label;
    menuMuteButton.classList.toggle("is-muted", !soundEnabled);
  }
}

function toggleSound(showOverlay = false) {
  setSoundEnabled(!soundEnabled);

  if (!soundEnabled) {
    stopMusic();
    stopMenuMusic();
  } else if (running && !paused && !reviveActive) {
    startMusic();
  } else if (menuOverlay && !menuOverlay.classList.contains("hide")) {
    startMenuMusic();
  }

  if (showOverlay && (!running || paused)) {
    setOverlay(
      soundEnabled ? "Sound On" : "Sound Off",
      soundEnabled ? "Press M to mute." : "Press M to unmute.",
      true
    );
  }
}

function playTone(freq, duration, type, volume, slideTo = null, channel = "sfx") {
  if (!soundEnabled || !audioCtx || !masterGain) return;

  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  if (slideTo !== null) {
    osc.frequency.linearRampToValueAtTime(slideTo, now + duration);
  }

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(gain);
  const targetGain = channel === "music" ? musicGain : sfxGain;
  if (!targetGain) return;
  gain.connect(targetGain);
  osc.start(now);
  osc.stop(now + duration);
}

function startMusic() {
  if (!soundEnabled) return;
  stopMenuMusic();
  bgmAudio.volume = volumeLevel * musicLevel;
  bgmAudio.play().catch(() => {});
}

function stopMusic() {
  bgmAudio.pause();
}

function startMenuMusic() {
  if (!soundEnabled) return;
  stopMusic();
  menuAudio.volume = 0;
  menuAudio.currentTime = 0;
  menuAudio.play().catch(() => {});
  const target = volumeLevel * musicLevel;
  const fadeMs = 1200;
  const stepMs = 40;
  let elapsed = 0;
  const fadeTimer = setInterval(() => {
    if (menuAudio.paused || !soundEnabled) {
      clearInterval(fadeTimer);
      return;
    }
    elapsed += stepMs;
    const t = Math.min(elapsed / fadeMs, 1);
    menuAudio.volume = target * t;
    if (t >= 1) clearInterval(fadeTimer);
  }, stepMs);
}

function stopMenuMusic() {
  menuAudio.pause();
}

function playCollectSound() {
  playTone(760, 0.07, "triangle", 0.1, 980);
  playTone(520, 0.05, "sawtooth", 0.04, 700);
}

function playStartSound() {
  playTone(360, 0.08, "square", 0.1, 520);
  playTone(560, 0.1, "sawtooth", 0.07, 760);
}

function playPauseSound(isPaused) {
  if (isPaused) {
    playTone(260, 0.07, "sine", 0.06, 210);
  } else {
    playTone(300, 0.06, "sine", 0.06, 420);
  }
}

function playGameOverSound() {
  if (soundEnabled) {
    deathAudio.currentTime = 0;
    deathAudio.volume = volumeLevel * sfxLevel;
    deathAudio.play().catch(() => {});
  }
}

function playLevelUpSound() {
  if (soundEnabled) {
    levelupAudio.currentTime = 0;
    levelupAudio.volume = volumeLevel * sfxLevel;
    levelupAudio.play().catch(() => {});
  }
}

function playPowerSound() {
  if (soundEnabled) {
    powerupAudio.currentTime = 0;
    powerupAudio.volume = volumeLevel * sfxLevel;
    powerupAudio.play().catch(() => {});
  }
}

function playShieldBreakSound() {
  if (soundEnabled) {
    shieldBreakAudio.currentTime = 0;
    shieldBreakAudio.volume = volumeLevel * sfxLevel;
    shieldBreakAudio.play().catch(() => {});
  }
}

function playReviveSound() {
  playTone(540, 0.08, "triangle", 0.08, 720);
  playTone(720, 0.12, "triangle", 0.07, 900);
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function circleHit(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy <= (a.r + b.r) * (a.r + b.r);
}

function keepInBounds(obj) {
  obj.x = Math.max(obj.r, Math.min(WORLD.w - obj.r, obj.x));
  obj.y = Math.max(obj.r, Math.min(WORLD.h - obj.r, obj.y));
}

function setOverlay(text, sub, visible) {
  statusEl.textContent = text;
  overlaySubEl.textContent = sub;
  overlay.className = visible ? "overlay show centered" : "overlay hide";
  if (visible) keys.clear();
}

function showMenu() {
  menuOverlay.classList.remove("hide");
  menuOverlay.classList.add("show");
  startMenuMusic();
  keys.clear();
}

function hideMenu() {
  menuOverlay.classList.add("hide");
  menuOverlay.classList.remove("show");
  stopMenuMusic();
}

function buildStars() {
  backgroundStars = Array.from({ length: 90 }, () => ({
    x: rand(0, WORLD.w),
    y: rand(0, WORLD.h),
    r: rand(0.4, 2.1),
    alpha: rand(0.12, 0.6),
    drift: rand(8, 22)
  }));
}

function getMineSpeedScale() {
  const difficulty = DIFFICULTY[difficultyMode] || DIFFICULTY.normal;
  const pulse = difficulty.god ? 1 + godPulse * 0.35 : 1;
  if (level <= 1) return 1;
  return difficulty.mineSpeed * pulse;
}

function spawnSafePoint(minDistance) {
  for (let i = 0; i < 12; i += 1) {
    const x = rand(22, WORLD.w - 22);
    const y = rand(22, WORLD.h - 22);
    const dx = x - player.x;
    const dy = y - player.y;
    if (Math.hypot(dx, dy) > minDistance) return { x, y };
  }
  return { x: rand(22, WORLD.w - 22), y: rand(22, WORLD.h - 22) };
}

function createMine(speedScale = 1) {
  const speed = rand(90, 150) * speedScale;
  const angle = rand(0, Math.PI * 2);
  const point = player ? spawnSafePoint(80) : { x: rand(22, WORLD.w - 22), y: rand(22, WORLD.h - 22) };
  return {
    x: point.x,
    y: point.y,
    r: rand(10, 13),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    spin: rand(0, Math.PI * 2)
  };
}

function addMine() {
  if (mines.length >= MAX_MINES) return;
  const speedScale = 1 + (level - 1) * 0.08;
  mines.push(createMine(speedScale));
}

function getOrbType() {
  const purple = Math.min(0.1 + (level - 1) * 0.01, 0.35);
  let yellow = Math.min(0.3 + (level - 1) * 0.005, 0.6);
  if (yellow + purple > 0.85) yellow = 0.85 - purple;
  const roll = Math.random();
  if (roll < purple) return "purple";
  if (roll < purple + yellow) return "yellow";
  return "green";
}

function spawnOrb(existing = null) {
  const type = getOrbType();
  const target = existing || {};
  target.x = rand(20, WORLD.w - 20);
  target.y = rand(20, WORLD.h - 20);
  target.r = 8;
  target.phase = rand(0, Math.PI * 2);
  target.type = type;
  return target;
}

function spawnPowerUp() {
  const types = ["shield", "speed", "freeze", "time"];
  const type = types[Math.floor(Math.random() * types.length)];
  powerUps.push({
    x: rand(24, WORLD.w - 24),
    y: rand(24, WORLD.h - 24),
    r: 12,
    type,
    ttl: 10,
    pulse: rand(0, Math.PI * 2),
    spin: rand(0, Math.PI * 2)
  });
}

function spawnDiamond() {
  diamonds.push({
    x: rand(22, WORLD.w - 22),
    y: rand(22, WORLD.h - 22),
    r: 10,
    pulse: rand(0, Math.PI * 2),
    ttl: 10
  });
}

function resetGame() {
  player = { x: WORLD.w / 2, y: WORLD.h / 2, r: 12 };
  orbs = Array.from({ length: 6 }, () => spawnOrb());

  level = 1;
  playerColorIndex = 0;
  levelStep = LEVEL_SCORE_STEP;
  nextLevelScore = LEVEL_SCORE_STEP;
  mines = Array.from({ length: BASE_MINE_COUNT }, () => createMine(level === 1 ? 1 : getMineSpeedScale()));
  powerUps = [];
  diamonds = [];
  nextPowerSpawn = rand(POWER_SPAWN_MIN, POWER_SPAWN_MAX);
  nextDiamondSpawn = rand(DIAMOND_SPAWN_MIN, DIAMOND_SPAWN_MAX);

  shieldUntil = 0;
  invulnUntil = nowSeconds() + 5;
  speedUntil = 0;
  freezeUntil = 0;

  score = 0;
  timeLeft = ROUND_TIME;
  energy = ENERGY_MAX;
  diamondsCount = Number(localStorage.getItem("orbRunnerDiamonds") || 0);
  runBestThreshold = best;
  highScoreTriggered = false;

  scoreEl.textContent = score;
  levelEl.textContent = level;
  powerEl.textContent = "None";
  timeEl.textContent = String(Math.ceil(timeLeft));
  energyTextEl.textContent = "100%";
  diamondsEl.textContent = String(diamondsCount);
  updateLevelMeter();
  updateEnergyMeter();
}

function startGame() {
  initAudio();
  resetGame();
  running = true;
  paused = false;
  runStart = performance.now();
  lastStamp = performance.now();
  setOverlay("", "", false);
  playStartSound();
  startMusic();
  hideMenu();
  requestAnimationFrame(loop);
}

function maybeRecordBest() {
  const timePlayed = runStart ? Math.max(0, (performance.now() - runStart) / 1000) : 0;
  if (highScoreTriggered && score >= best) {
    openHighScorePrompt({
      score,
      level,
      timePlayed: Number(timePlayed.toFixed(1)),
      mode: difficultyMode
    });
  }
}

function endGame(reason) {
  running = false;
  reviveActive = false;
  playGameOverSound();
  stopMusic();
  showMenu();

  maybeRecordBest();

  setOverlay(
    `Game Over: ${reason}`,
    `Final Score: ${score} | Level ${level}. Press Enter or R to play again.`,
    true
  );
}

function updateHUDPower(now) {
  const active = [];
  if (shieldUntil > now) active.push(`Shield ${Math.ceil(shieldUntil - now)}s`);
  if (speedUntil > now) active.push(`Speed ${Math.ceil(speedUntil - now)}s`);
  if (freezeUntil > now) active.push(`Freeze ${Math.ceil(freezeUntil - now)}s`);
  powerEl.textContent = active.length ? active.join(" | ") : "None";
}

function updatePowerMeter(now) {
  const remaining = Math.max(shieldUntil - now, speedUntil - now, freezeUntil - now, 0);
  const hasPower = remaining > 0;
  if (lastPowerActive && !hasPower) {
    if (soundEnabled) {
      powerdownAudio.currentTime = 0;
      powerdownAudio.volume = volumeLevel * sfxLevel;
      powerdownAudio.play().catch(() => {});
    }
  }
  lastPowerActive = hasPower;
  if (remaining <= 0) {
    powerMeterUntil = 0;
    powerMeterLabel = "None";
  }

  if (powerMeterUntil > 0) {
    const pct = clamp(remaining / powerMeterUntil, 0, 1);
    powerMeterFillEl.style.width = `${Math.round(pct * 100)}%`;
    powerMeterTextEl.textContent = `${powerMeterLabel} ${Math.ceil(remaining)}s`;
  } else {
    powerMeterFillEl.style.width = "0%";
    powerMeterTextEl.textContent = "None";
  }
}

function updateLevelMeter() {
  const start = nextLevelScore - levelStep;
  const progress = clamp((score - start) / levelStep, 0, 1);
  const percent = Math.round(progress * 100);
  levelProgressFillEl.style.width = `${percent}%`;
  levelProgressTextEl.textContent = `${score} / ${nextLevelScore}`;
}

function updateEnergyMeter() {
  const pct = Math.round((energy / ENERGY_MAX) * 100);
  energyMeterFillEl.style.width = `${pct}%`;
  energyMeterTextEl.textContent = `${pct}%`;
  energyTextEl.textContent = `${pct}%`;
}

function updateLevelProgress() {
  while (score >= nextLevelScore) {
    level += 1;
    levelStep = Math.round(LEVEL_SCORE_STEP * (1 + (level - 1) * LEVEL_GROWTH));
    nextLevelScore += levelStep;
    if (level % DIFFICULTY[difficultyMode].mineEveryLevels === 0) {
      addMine();
    }
    playerColorIndex = Math.floor((level - 1) / 2) % PLAYER_COLORS.length;

    for (const mine of mines) {
      mine.vx *= 1.03;
      mine.vy *= 1.03;
    }

    levelPulse = 1;
    levelEl.textContent = level;
    playLevelUpSound();
  }
}

function updatePlayer(dt, now) {
  let dx = 0;
  let dy = 0;
  if (keys.has("ArrowUp") || keys.has("KeyW")) dy -= 1;
  if (keys.has("ArrowDown") || keys.has("KeyS")) dy += 1;
  if (keys.has("ArrowLeft") || keys.has("KeyA")) dx -= 1;
  if (keys.has("ArrowRight") || keys.has("KeyD")) dx += 1;

  const wantsBoost = keys.has("ShiftLeft") || keys.has("ShiftRight");
  const canBoost = wantsBoost && energy > 0;
  const boostFactor = canBoost ? BOOST_MULT : 1;

  if (dx !== 0 || dy !== 0) {
    const speedBoost = speedUntil > now ? 1.45 : 1;
    const mag = Math.hypot(dx, dy);
    player.x += (dx / mag) * BASE_PLAYER_SPEED * speedBoost * boostFactor * dt;
    player.y += (dy / mag) * BASE_PLAYER_SPEED * speedBoost * boostFactor * dt;
  }

  if (canBoost) {
    energy = clamp(energy - ENERGY_DRAIN * dt, 0, ENERGY_MAX);
  } else {
    energy = clamp(energy + ENERGY_REGEN * dt, 0, ENERGY_MAX);
  }

  keepInBounds(player);
}

function updateMines(dt, now) {
  const freezeFactor = freezeUntil > now ? 0.4 : 1;

  for (const mine of mines) {
    mine.x += mine.vx * dt * freezeFactor;
    mine.y += mine.vy * dt * freezeFactor;
    mine.spin += dt * 3;

    if (mine.x <= mine.r) {
      mine.x = mine.r;
      mine.vx = Math.abs(mine.vx);
    } else if (mine.x >= WORLD.w - mine.r) {
      mine.x = WORLD.w - mine.r;
      mine.vx = -Math.abs(mine.vx);
    }
    if (mine.y <= mine.r) {
      mine.y = mine.r;
      mine.vy = Math.abs(mine.vy);
    } else if (mine.y >= WORLD.h - mine.r) {
      mine.y = WORLD.h - mine.r;
      mine.vy = -Math.abs(mine.vy);
    }
    keepInBounds(mine);

    if (circleHit(player, mine)) {
      if (invulnUntil > now) {
        continue;
      }
      if (shieldUntil > now) {
        shieldUntil = 0;
        invulnUntil = now + 0.6;
        playShieldBreakSound();
        continue;
      } else if (!reviveActive) {
        triggerRevive();
        return;
      } else {
        playGameOverSound();
        endGame("You touched a mine");
        return;
      }
    }
  }
}

function updateOrbs() {
  for (const orb of orbs) {
    orb.phase += 0.06;
    if (circleHit(player, orb)) {
      const meta = ORB_TYPES[orb.type];
      score += meta.points;
      scoreEl.textContent = score;
      playCollectSound();
      spawnOrb(orb);
      if (!highScoreTriggered && score > runBestThreshold) {
        best = score;
        localStorage.setItem(getBestKey(difficultyMode), String(best));
        bestEl.textContent = best;
        highScoreTriggered = true;
      }
      updateLevelProgress();
      updateLevelMeter();
    }
  }
}

function triggerRevive() {
  reviveActive = true;
  paused = true;
  reviveDeadline = 6;
  reviveTimer = reviveDeadline;
  reviveFillEl.style.width = "100%";
  reviveTimerTextEl.textContent = `${reviveTimer.toFixed(1)}s`;
  reviveErrorEl.textContent = diamondsCount < 5 ? "Not enough diamonds." : "";
  reviveYes.disabled = diamondsCount < 5;
  reviveOverlay.classList.remove("hide");
  keys.clear();
}

function doRevive() {
  if (diamondsCount < 5) {
    reviveErrorEl.textContent = "Not enough diamonds.";
    return;
  }
  diamondsCount -= 5;
  diamondsEl.textContent = String(diamondsCount);
  localStorage.setItem("orbRunnerDiamonds", String(diamondsCount));
  reviveActive = false;
  reviveOverlay.classList.add("hide");
  paused = false;
  invulnUntil = nowSeconds() + 3;
  player.x = WORLD.w / 2;
  player.y = WORLD.h / 2;
  playReviveSound();
}

function cancelRevive() {
  reviveActive = false;
  reviveOverlay.classList.add("hide");
  endGame("No revive");
}

function getLeaderboard() {
  return JSON.parse(localStorage.getItem("orbRunnerLeaderboard") || "[]");
}

function setLeaderboard(entries) {
  localStorage.setItem("orbRunnerLeaderboard", JSON.stringify(entries));
}

function renderLeaderboard() {
  if (!leaderboardList) return;
  const entries = getLeaderboard();
  leaderboardList.innerHTML = entries
    .slice(0, 10)
    .map(
      (e, i) =>
        `<li><span>${i + 1}. ${e.name} | Lv ${e.level} | ${e.mode.toUpperCase()}</span><span>${e.score}</span></li>`
    )
    .join("");
  if (!entries.length) {
    leaderboardList.innerHTML = "<li><span>No records yet.</span><span></span></li>";
  }
}

function openHighScorePrompt(entry) {
  pendingHighScore = entry;
  highScoreError.textContent = "";
  highScoreName.value = "";
  highScoreOverlay.classList.remove("hide");
  if (running && !paused) {
    paused = true;
    highScorePause = true;
  }
  keys.clear();
  playTone(760, 0.12, "square", 0.08, 980, "sfx");
  playTone(1040, 0.12, "triangle", 0.06, 1200, "sfx");
  setTimeout(() => highScoreName.focus(), 0);
}

function saveHighScore() {
  if (!pendingHighScore) return;
  const name = highScoreName.value.trim();
  if (!name) {
    highScoreError.textContent = "Please enter a name.";
    return;
  }

  const entries = getLeaderboard();
  const existingIndex = entries.findIndex((e) => e.name.toLowerCase() === name.toLowerCase());
  if (existingIndex !== -1) {
    const overwrite = confirm("Name exists. Overwrite record?");
    if (!overwrite) return;
    entries.splice(existingIndex, 1);
  }

  entries.push({
    name,
    score: pendingHighScore.score,
    level: pendingHighScore.level,
    timePlayed: pendingHighScore.timePlayed,
    mode: pendingHighScore.mode
  });

  entries.sort((a, b) => b.score - a.score);
  setLeaderboard(entries);
  renderLeaderboard();
  pendingHighScore = null;
  highScoreOverlay.classList.add("hide");
  if (highScorePause) {
    highScorePause = false;
    paused = false;
  }
}

function cancelHighScore() {
  pendingHighScore = null;
  highScoreOverlay.classList.add("hide");
  if (highScorePause) {
    highScorePause = false;
    paused = false;
  }
}

function updateGodMode(dt) {
  const difficulty = DIFFICULTY[difficultyMode];
  if (!difficulty || !difficulty.god) return;
  nextGodPulse -= dt;
  if (nextGodPulse <= 0) {
    godPulseDir = 1;
    godPulse = 0;
    nextGodPulse = rand(4, 7);
    playTone(980, 0.12, "square", 0.1, 1400, "sfx");
    playTone(520, 0.16, "sawtooth", 0.07, 680, "sfx");
  }

  godPulse += godPulseDir * dt * 0.9;
  if (godPulse >= 1) {
    godPulse = 1;
    godPulseDir = -1;
  } else if (godPulse <= 0) {
    godPulse = 0;
  }
}
function applyPower(type, now) {
  if (type === "shield") {
    shieldUntil = Math.max(shieldUntil, now + POWER_META.shield.duration);
    powerMeterUntil = POWER_META.shield.duration;
    powerMeterLabel = "Shield";
  }

  if (type === "speed") {
    speedUntil = Math.max(speedUntil, now + POWER_META.speed.duration);
    powerMeterUntil = POWER_META.speed.duration;
    powerMeterLabel = "Speed";
  }

  if (type === "freeze") {
    freezeUntil = Math.max(freezeUntil, now + POWER_META.freeze.duration);
    powerMeterUntil = POWER_META.freeze.duration;
    powerMeterLabel = "Freeze";
  }

  if (type === "time") {
    timeLeft += 12;
    timeEl.textContent = String(Math.ceil(timeLeft));
    powerMeterUntil = 2;
    powerMeterLabel = "+Time";
  }

  playPowerSound();
}

function updatePowerUps(dt, now) {
  nextPowerSpawn -= dt;
  if (nextPowerSpawn <= 0) {
    spawnPowerUp();
    nextPowerSpawn = rand(POWER_SPAWN_MIN, POWER_SPAWN_MAX);
  }

  for (let i = powerUps.length - 1; i >= 0; i -= 1) {
    const p = powerUps[i];
    p.ttl -= dt;
    p.pulse += dt * 6;
    p.spin += dt * 1.6;

    if (p.ttl <= 0) {
      powerUps.splice(i, 1);
      continue;
    }

    if (circleHit(player, p)) {
      applyPower(p.type, now);
      powerUps.splice(i, 1);
    }
  }
}

function updateRevive(dt) {
  if (!reviveActive) return false;
  reviveTimer = Math.max(0, reviveTimer - dt);
  const pct = reviveTimer / reviveDeadline;
  reviveFillEl.style.width = `${Math.round(pct * 100)}%`;
  reviveTimerTextEl.textContent = `${reviveTimer.toFixed(1)}s`;
  if (reviveTimer <= 0) {
    reviveActive = false;
    reviveOverlay.classList.add("hide");
    endGame("Out of time");
    return true;
  }
  return false;
}

function updateDiamonds(dt) {
  nextDiamondSpawn -= dt;
  if (nextDiamondSpawn <= 0) {
    if (Math.random() < DIAMOND_SPAWN_CHANCE) {
      spawnDiamond();
    }
    nextDiamondSpawn = rand(DIAMOND_SPAWN_MIN, DIAMOND_SPAWN_MAX);
  }

  for (let i = diamonds.length - 1; i >= 0; i -= 1) {
    const d = diamonds[i];
    d.ttl -= dt;
    d.pulse += dt * 5;

    if (d.ttl <= 0) {
      diamonds.splice(i, 1);
      continue;
    }

    if (circleHit(player, d)) {
      diamondsCount += 1;
      diamondsEl.textContent = String(diamondsCount);
      localStorage.setItem("orbRunnerDiamonds", String(diamondsCount));
      playPowerSound();
      diamonds.splice(i, 1);
    }
  }
}

function drawBackground(stamp) {
  const t = stamp * 0.00015;
  const g = ctx.createLinearGradient(0, 0, 0, WORLD.h);
  g.addColorStop(0, `hsl(${220 + Math.sin(t) * 10} 40% 20%)`);
  g.addColorStop(0.6, `hsl(${230 + Math.cos(t * 1.3) * 12} 35% 14%)`);
  g.addColorStop(1, "#091122");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, WORLD.w, WORLD.h);

  for (let i = 0; i < 3; i += 1) {
    const cx = WORLD.w * (0.2 + i * 0.3) + Math.sin(t * (i + 1)) * 40;
    const cy = WORLD.h * (0.2 + i * 0.25) + Math.cos(t * (i + 1.4)) * 30;
    const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 140);
    grad.addColorStop(0, `rgb(90 130 255 / ${0.12 + i * 0.05})`);
    grad.addColorStop(1, "rgb(10 20 40 / 0%)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, 150, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const star of backgroundStars) {
    const y = (star.y + t * star.drift) % WORLD.h;
    ctx.beginPath();
    ctx.arc(star.x, y, star.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgb(255 255 255 / ${star.alpha})`;
    ctx.fill();
  }

  ctx.strokeStyle = "rgb(255 255 255 / 5%)";
  const step = 32;
  for (let x = 0; x < WORLD.w; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, WORLD.h);
    ctx.stroke();
  }
  for (let y = 0; y < WORLD.h; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(WORLD.w, y);
    ctx.stroke();
  }

  if (levelPulse > 0.01) {
    const pulse = levelPulse;
    ctx.fillStyle = `rgb(110 200 255 / ${pulse * 0.2})`;
    ctx.fillRect(0, 0, WORLD.w, WORLD.h);
    levelPulse *= 0.94;
  }

  const difficulty = DIFFICULTY[difficultyMode];
  if (difficulty && difficulty.god && godPulse > 0.01) {
    const eased = 0.5 - Math.cos(godPulse * Math.PI) / 2;
    const alpha = 0.12 + eased * 0.3;
    ctx.fillStyle = `rgb(255 60 60 / ${alpha})`;
    ctx.fillRect(0, 0, WORLD.w, WORLD.h);
  }
}

function drawOrb(orb) {
  const meta = ORB_TYPES[orb.type];
  const glow = 11 + Math.sin(orb.phase) * 2.4;
  const grad = ctx.createRadialGradient(orb.x - 2, orb.y - 3, 1, orb.x, orb.y, orb.r + glow);
  grad.addColorStop(0, meta.glow);
  grad.addColorStop(0.4, meta.color);
  grad.addColorStop(1, "rgb(63 229 125 / 0%)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(orb.x, orb.y, orb.r + glow, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(orb.x, orb.y, orb.r + 2, 0, Math.PI * 2);
  ctx.fillStyle = meta.color;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(orb.x - 2, orb.y - 2, 2.2, 0, Math.PI * 2);
  ctx.fillStyle = "rgb(255 255 255 / 75%)";
  ctx.fill();
}

function drawMine(mine) {
  const pulse = 1 + Math.sin(mine.spin * 2) * 0.08;
  const coreR = mine.r * pulse;

  for (let i = 0; i < 8; i += 1) {
    const a = mine.spin + (i / 8) * Math.PI * 2;
    const x1 = mine.x + Math.cos(a) * (coreR + 1);
    const y1 = mine.y + Math.sin(a) * (coreR + 1);
    const x2 = mine.x + Math.cos(a) * (coreR + 5);
    const y2 = mine.y + Math.sin(a) * (coreR + 5);
    ctx.strokeStyle = "#ff7a7a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  const grad = ctx.createRadialGradient(mine.x - 2, mine.y - 2, 1, mine.x, mine.y, coreR + 5);
  grad.addColorStop(0, "#ffd2d2");
  grad.addColorStop(0.4, "#fb5b5b");
  grad.addColorStop(1, "rgb(251 91 91 / 10%)");

  ctx.beginPath();
  ctx.arc(mine.x, mine.y, coreR + 5, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(mine.x, mine.y, coreR, 0, Math.PI * 2);
  ctx.fillStyle = "#ef4444";
  ctx.fill();
}

function drawPowerUp(p) {
  const meta = POWER_META[p.type];
  const halo = p.r + 8 + Math.sin(p.pulse) * 2;

  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.spin);

  ctx.beginPath();
  ctx.arc(0, 0, halo, 0, Math.PI * 2);
  ctx.fillStyle = `${meta.color}22`;
  ctx.fill();

  const ring = ctx.createRadialGradient(0, 0, 2, 0, 0, p.r + 8);
  ring.addColorStop(0, `${meta.color}88`);
  ring.addColorStop(1, "rgb(255 255 255 / 0%)");
  ctx.beginPath();
  ctx.arc(0, 0, p.r + 8, 0, Math.PI * 2);
  ctx.fillStyle = ring;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(0, 0, p.r, 0, Math.PI * 2);
  ctx.fillStyle = meta.color;
  ctx.fill();

  ctx.strokeStyle = "rgb(255 255 255 / 70%)";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(0, 0, p.r - 3, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 11px Orbitron";

  if (p.type === "shield") {
    ctx.beginPath();
    ctx.moveTo(0, -4);
    ctx.lineTo(4, -1);
    ctx.lineTo(3, 5);
    ctx.lineTo(0, 7);
    ctx.lineTo(-3, 5);
    ctx.lineTo(-4, -1);
    ctx.closePath();
    ctx.fill();
  } else if (p.type === "speed") {
    ctx.beginPath();
    ctx.moveTo(-4, -3);
    ctx.lineTo(5, 0);
    ctx.lineTo(-4, 3);
    ctx.closePath();
    ctx.fill();
  } else if (p.type === "freeze") {
    ctx.beginPath();
    ctx.moveTo(0, -5);
    ctx.lineTo(1.5, -1.5);
    ctx.lineTo(5, 0);
    ctx.lineTo(1.5, 1.5);
    ctx.lineTo(0, 5);
    ctx.lineTo(-1.5, 1.5);
    ctx.lineTo(-5, 0);
    ctx.lineTo(-1.5, -1.5);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.font = "bold 12px Orbitron";
    ctx.fillText("+", 0, 0.5);
  }

  ctx.restore();
}

function drawDiamond(d) {
  const pulse = 1 + Math.sin(d.pulse) * 0.08;
  const r = d.r * pulse;
  ctx.save();
  ctx.translate(d.x, d.y);

  const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, r + 8);
  glow.addColorStop(0, "rgb(120 240 255 / 80%)");
  glow.addColorStop(1, "rgb(120 240 255 / 0%)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, r + 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.lineTo(r, 0);
  ctx.lineTo(0, r);
  ctx.lineTo(-r, 0);
  ctx.closePath();
  ctx.fillStyle = "#7ee7ff";
  ctx.fill();

  ctx.strokeStyle = "rgb(255 255 255 / 70%)";
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.restore();
}

function drawPlayer(stamp) {
  const now = stamp * 0.001;
  const ringPulse = 2 + Math.sin(now * 8) * 1.5;

  const shieldActive = shieldUntil > nowSeconds() || invulnUntil > nowSeconds();
  if (shieldActive) {
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.r + 7 + ringPulse, 0, Math.PI * 2);
    ctx.strokeStyle = shieldUntil > nowSeconds()
      ? "rgb(96 165 250 / 70%)"
      : "rgb(99 230 190 / 70%)";
    ctx.lineWidth = 2.4;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(player.x, player.y, player.r + 12 + ringPulse * 1.5, 0, Math.PI * 2);
    ctx.strokeStyle = shieldUntil > nowSeconds()
      ? "rgb(96 165 250 / 30%)"
      : "rgb(99 230 190 / 35%)";
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }

  const glowBoost = 1 + Math.min(level / 20, 0.8);
  const color = PLAYER_COLORS[playerColorIndex % PLAYER_COLORS.length];
  const grad = ctx.createRadialGradient(player.x - 4, player.y - 5, 2, player.x, player.y, player.r + 9 * glowBoost);
  grad.addColorStop(0, "#d4f2ff");
  grad.addColorStop(0.35, color);
  grad.addColorStop(1, "rgb(125 211 252 / 5%)");

  ctx.beginPath();
  ctx.arc(player.x, player.y, player.r + 9 * glowBoost, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(player.x - 3, player.y - 4, 3, 0, Math.PI * 2);
  ctx.fillStyle = "rgb(255 255 255 / 70%)";
  ctx.fill();
}

function render(stamp) {
  drawBackground(stamp);

  for (const orb of orbs) drawOrb(orb);
  for (const p of powerUps) drawPowerUp(p);
  for (const d of diamonds) drawDiamond(d);
  for (const mine of mines) drawMine(mine);
  drawPlayer(stamp);
}

function loop(stamp) {
  if (!running) return;

  const dt = Math.min((stamp - lastStamp) / 1000, 0.033);
  const now = nowSeconds();
  lastStamp = stamp;

  updateGodMode(dt);

  if (reviveActive) {
    updateRevive(dt);
  }

  if (!paused) {
    timeLeft -= dt;
    if (timeLeft <= 0) {
      timeLeft = 0;
      timeEl.textContent = "0";
      endGame("Time up");
      return;
    }

    timeEl.textContent = String(Math.ceil(timeLeft));
    updatePlayer(dt, now);
    updateMines(dt, now);
    updateOrbs();
    updatePowerUps(dt, now);
    updateDiamonds(dt);
    updateHUDPower(now);
    updateEnergyMeter();
    updatePowerMeter(now);
  }

  render(stamp);
  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (e) => {
  initAudio();
  const menuVisible = menuOverlay && !menuOverlay.classList.contains("hide");
  const pauseVisible = overlay && overlay.classList.contains("show");
  const reviveVisible = reviveOverlay && !reviveOverlay.classList.contains("hide");
  const highScoreVisible = highScoreOverlay && !highScoreOverlay.classList.contains("hide");
  const uiActive = menuVisible || pauseVisible || reviveVisible || highScoreVisible;

  if (!uiActive) {
    keys.add(e.code);
  }

  const getFocusable = (root) => {
    if (!root) return [];
    const all = Array.from(root.querySelectorAll("button, input[type='range']"));
    return all.filter((el) => !el.disabled && el.offsetParent !== null);
  };

  const allowWASDNav = !highScoreVisible;
  const navKeys = allowWASDNav
    ? ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "KeyW", "KeyA", "KeyS", "KeyD"]
    : ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

  if (uiActive && navKeys.includes(e.code)) {
    e.preventDefault();
    const root = highScoreVisible ? highScoreOverlay : (reviveVisible ? reviveOverlay : (menuVisible ? menuOverlay : overlay));
    const focusables = getFocusable(root);
    if (!focusables.length) return;
    const current = document.activeElement;
    let idx = focusables.indexOf(current);
    if (idx === -1) idx = 0;

    const useHorizontalOnly = reviveVisible || pauseVisible || highScoreVisible;

    if (!useHorizontalOnly && (e.code === "ArrowUp" || e.code === "ArrowDown" || (allowWASDNav && (e.code === "KeyW" || e.code === "KeyS")))) {
      const dir = (e.code === "ArrowDown" || e.code === "KeyS") ? 1 : -1;
      idx = (idx + dir + focusables.length) % focusables.length;
      focusables[idx].focus();
      return;
    }

    if (e.code === "ArrowLeft" || e.code === "ArrowRight" || (allowWASDNav && (e.code === "KeyA" || e.code === "KeyD"))) {
      const el = focusables[idx];
      if (el && el.tagName === "INPUT") {
        const step = Number(el.step || 1);
        const val = Number(el.value);
        const delta = (e.code === "ArrowRight" || e.code === "KeyD") ? step : -step;
        el.value = String(clamp(val + delta, Number(el.min || 0), Number(el.max || 100)));
        el.dispatchEvent(new Event("input", { bubbles: true }));
        return;
      }
      if (useHorizontalOnly) {
        const dir = (e.code === "ArrowRight" || e.code === "KeyD") ? 1 : -1;
        idx = (idx + dir + focusables.length) % focusables.length;
        focusables[idx].focus();
        return;
      }
    }
  }
  const blockKeys = highScoreVisible
    ? ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"]
    : ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space", "KeyW", "KeyA", "KeyS", "KeyD"];

  if (blockKeys.includes(e.code)) {
    e.preventDefault();
  }

  if (e.key === "Enter" && !running) {
    startGame();
  }

  if ((e.key === "r" || e.key === "R") && !running) {
    startGame();
  }

  if ((e.key === "p" || e.key === "P" || e.key === "Escape") && running && !reviveActive) {
    paused = !paused;
    setOverlay(paused ? "Paused" : "", paused ? "Press P or Esc to resume." : "", paused);
    playPauseSound(paused);
    if (!paused) {
      setOverlay("", "", false);
      pauseSettings.classList.add("hide");
    }
    if (paused) {
      stopMusic();
    } else {
      startMusic();
    }
  }

  if (e.key === "m" || e.key === "M") {
    toggleSound(true);
  }
});

window.addEventListener("keyup", (e) => {
  keys.delete(e.code);
});


if (menuMuteButton) {
  menuMuteButton.addEventListener("click", () => {
    initAudio();
    toggleSound(true);
  });
}

if (menuVolumeSlider) {
  menuVolumeSlider.addEventListener("input", (e) => {
    initAudio();
    const raw = Number(e.target.value);
    setVolume(raw / 100);
  });
}

if (menuMusicSlider) {
  menuMusicSlider.addEventListener("input", (e) => {
    initAudio();
    const raw = Number(e.target.value);
    setMusicVolume(raw / 100);
  });
}

if (menuSfxSlider) {
  menuSfxSlider.addEventListener("input", (e) => {
    initAudio();
    const raw = Number(e.target.value);
    setSfxVolume(raw / 100);
  });
}

if (pauseMusicSlider) {
  pauseMusicSlider.addEventListener("input", (e) => {
    initAudio();
    const raw = Number(e.target.value);
    setMusicVolume(raw / 100);
  });
}

if (pauseSfxSlider) {
  pauseSfxSlider.addEventListener("input", (e) => {
    initAudio();
    const raw = Number(e.target.value);
    setSfxVolume(raw / 100);
  });
}

if (startButton) {
  startButton.addEventListener("click", () => startGame());
}

if (settingsButton) {
  settingsButton.addEventListener("click", () => {
    menuSettings.classList.toggle("hide");
    menuCredits.classList.add("hide");
    soundSettingsPanel?.classList.add("hide");
    difficultyPanel?.classList.add("hide");
  });
}

if (creditsButton) {
  creditsButton.addEventListener("click", () => {
    menuCredits.classList.toggle("hide");
    menuSettings.classList.add("hide");
    menuLeaderboards.classList.add("hide");
  });
}

if (toggleSoundSettings) {
  toggleSoundSettings.addEventListener("click", () => {
    soundSettingsPanel.classList.toggle("hide");
    difficultyPanel.classList.add("hide");
  });
}

if (toggleDifficultySettings) {
  toggleDifficultySettings.addEventListener("click", () => {
    difficultyPanel.classList.toggle("hide");
    soundSettingsPanel.classList.add("hide");
  });
}

if (resumeButton) {
  resumeButton.addEventListener("click", () => {
    paused = false;
    setOverlay("", "", false);
    pauseSettings.classList.add("hide");
    startMusic();
  });
}

if (mainMenuButton) {
  mainMenuButton.addEventListener("click", () => {
    paused = false;
    running = false;
    setOverlay("", "", false);
    pauseSettings.classList.add("hide");
    stopMusic();
    keys.clear();
    resetGame();
    showMenu();
  });
}

if (pauseSettingsButton) {
  pauseSettingsButton.addEventListener("click", () => {
    pauseSettings.classList.toggle("hide");
  });
}

if (leaderboardsButton) {
  leaderboardsButton.addEventListener("click", () => {
    menuLeaderboards.classList.toggle("hide");
    menuSettings.classList.add("hide");
    menuCredits.classList.add("hide");
    renderLeaderboard();
  });
}

if (resetLeaderboardButton) {
  resetLeaderboardButton.addEventListener("click", () => {
    resetConfirmOverlay.classList.remove("hide");
  });
}

if (resetConfirmYes) {
  resetConfirmYes.addEventListener("click", () => {
    localStorage.removeItem("orbRunnerLeaderboard");
    ["easy", "normal", "hard", "god"].forEach((mode) => {
      localStorage.removeItem(getBestKey(mode));
    });
    best = Number(localStorage.getItem(getBestKey(difficultyMode)) || 0);
    bestEl.textContent = best;
    renderLeaderboard();
    resetConfirmOverlay.classList.add("hide");
  });
}

if (resetConfirmNo) {
  resetConfirmNo.addEventListener("click", () => {
    resetConfirmOverlay.classList.add("hide");
  });
}

if (highScoreSave) {
  highScoreSave.addEventListener("click", () => saveHighScore());
}

if (highScoreCancel) {
  highScoreCancel.addEventListener("click", () => cancelHighScore());
}

if (highScoreClose) {
  highScoreClose.addEventListener("click", () => cancelHighScore());
}

if (reviveYes) {
  reviveYes.addEventListener("click", () => doRevive());
}

if (reviveRetry) {
  reviveRetry.addEventListener("click", () => {
    reviveActive = false;
    reviveOverlay.classList.add("hide");
    maybeRecordBest();
    startGame();
  });
}

if (reviveClose) {
  reviveClose.addEventListener("click", () => {
    reviveActive = false;
    reviveOverlay.classList.add("hide");
    maybeRecordBest();
    showMenu();
  });
}

if (difficultyButtons.length) {
  const applyDifficulty = (mode) => {
    const prev = DIFFICULTY[difficultyMode] || DIFFICULTY.normal;
    difficultyMode = mode;
    localStorage.setItem("orbRunnerDifficulty", mode);
    best = Number(localStorage.getItem(getBestKey(difficultyMode)) || 0);
    bestEl.textContent = best;
    difficultyButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.difficulty === mode);
    });
    const next = DIFFICULTY[difficultyMode] || DIFFICULTY.normal;
    const ratio = next.mineSpeed / prev.mineSpeed;
    mines?.forEach((mine) => {
      mine.vx *= ratio;
      mine.vy *= ratio;
    });
    document.body.classList.toggle("god-mode", mode === "god");
    document.body.classList.remove("hard-mode");
  };
  difficultyButtons.forEach((btn) => {
    btn.addEventListener("click", () => applyDifficulty(btn.dataset.difficulty));
  });
  applyDifficulty(difficultyMode);
}

setVolume(volumeLevel);
setMusicVolume(musicLevel);
setSfxVolume(sfxLevel);
setSoundEnabled(true);
buildStars();
resetGame();
showMenu();
render(0);
