// Zendino - Zen Dino Game Logic

// Game State
let canvas, ctx;
let dino = { x: 50, y: 0, width: 44, height: 47, velocityY: 0, isJumping: false, isDucking: false };
let obstacles = [];
let particles = [];
let beauty = 0;
let gameSpeed = 5;
let isRunning = false;
let isPaused = false;
let lastTime = 0;
let consecutiveSuccesses = 0;

// Constants
const GRAVITY = 0.6;
const JUMP_FORCE = -12;
const GROUND_Y = 450;
const MAX_BEAUTY = 100;
const BEAUTY_PER_BLOOM = 5;
const BEAUTY_PER_FEATHER = 3;

// Colors
const COLORS = {
  desert: { h: 45, s: 30, l: 85 },
  bloom: { h: 120, s: 50, l: 85 },
  cactus: '#2A9D8F',
  cactusBloom: '#FF6B9D',
  flower: '#FF6B9D',
  feather: '#B8D4E3',
  rainbow: ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#9B5DE5']
};

// Initialize Game
function init() {
  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Controls
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);
  canvas.addEventListener('click', handleClick);
  canvas.addEventListener('touchstart', handleTouch);
  
  // Start screen
  showMessage('🌸 Press Space to Start 🌸', [{ text: 'Begin', action: startGame }]);
  
  // Debug
  window.zen = {
    addBeauty: (n) => { addBeauty(n); },
    bloomAll: () => { obstacles.forEach(o => { if(o.blooming) makeCactusBloom(o); }); },
    resetNow: () => resetGame(),
    beauty: () => beauty
  };
}

function resizeCanvas() {
  const container = document.getElementById('game-container');
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
}

// Game Controls
function handleKeyDown(e) {
  if (e.code === 'Space') {
    e.preventDefault();
    if (!isRunning) startGame();
    else if (!isPaused) jump();
  }
  if (e.code === 'ArrowDown') {
    e.preventDefault();
    duck(true);
  }
  if (e.code === 'Escape') {
    togglePause();
  }
}

function handleKeyUp(e) {
  if (e.code === 'ArrowDown') {
    duck(false);
  }
}

function handleClick() {
  if (!isRunning) startGame();
  else if (!isPaused) jump();
}

function handleTouch(e) {
  e.preventDefault();
  if (!isRunning) startGame();
  else if (!isPaused) jump();
}

// Game Actions
function jump() {
  if (!dino.isJumping && !dino.isDucking) {
    dino.velocityY = JUMP_FORCE;
    dino.isJumping = true;
    playJumpSound();
  }
}

function duck(isDucking) {
  if (isDucking && !dino.isJumping) {
    dino.isDucking = true;
    dino.height = 30;
  } else {
    dino.isDucking = false;
    dino.height = 47;
  }
}

function togglePause() {
  if (!isRunning) return;
  isPaused = !isPaused;
  if (isPaused) {
    showMessage('⏸ Paused', [{ text: 'Continue', action: () => { isPaused = false; hideMessage(); } }]);
  } else {
    hideMessage();
  }
}

// Game Loop
function startGame() {
  isRunning = true;
  isPaused = false;
  beauty = 0;
  gameSpeed = 5;
  obstacles = [];
  particles = [];
  consecutiveSuccesses = 0;
  dino.y = GROUND_Y - dino.height;
  dino.velocityY = 0;
  dino.isJumping = false;
  
  updateBeautyDisplay();
  updateBackground();
  hideMessage();
  
  lastTime = performance.now();
  requestAnimationFrame(gameLoop);
}

function gameLoop(currentTime) {
  if (!isRunning) return;
  if (isPaused) {
    requestAnimationFrame(gameLoop);
    return;
  }
  
  const deltaTime = (currentTime - lastTime) / 16.67; // Normalize to 60fps
  lastTime = currentTime;
  
  update(deltaTime);
  render();
  
  requestAnimationFrame(gameLoop);
}

function update(deltaTime) {
  // Update dino
  dino.velocityY += GRAVITY * deltaTime;
  dino.y += dino.velocityY * deltaTime;
  
  if (dino.y > GROUND_Y - dino.height) {
    dino.y = GROUND_Y - dino.height;
    dino.velocityY = 0;
    dino.isJumping = false;
  }
  
  // Spawn obstacles
  if (Math.random() < 0.01 * deltaTime) {
    spawnObstacle();
  }
  
  // Update obstacles
  obstacles.forEach((obs, index) => {
    obs.x -= gameSpeed * deltaTime;
    
    // Check if passed
    if (!obs.passed && obs.x + obs.width < dino.x) {
      obs.passed = true;
      handleSuccess(obs);
    }
    
    // Check collision
    if (checkCollision(dino, obs)) {
      handleCollision();
    }
  });
  
  // Remove off-screen obstacles
  obstacles = obstacles.filter(obs => obs.x > -100);
  
  // Update particles
  particles.forEach((p, index) => {
    p.x += p.vx * deltaTime;
    p.y += p.vy * deltaTime;
    p.vy += 0.05 * deltaTime; // Gravity
    p.life -= deltaTime;
    p.rotation += p.rotationSpeed * deltaTime;
  });
  
  particles = particles.filter(p => p.life > 0);
  
  // Slowly increase game speed
  gameSpeed = Math.min(10, 5 + beauty * 0.02);
}

function render() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw ground
  ctx.fillStyle = '#C4A574';
  ctx.fillRect(0, GROUND_Y, canvas.width, 3);
  
  // Draw dino
  drawDino();
  
  // Draw obstacles
  obstacles.forEach(obs => drawObstacle(obs));
  
  // Draw particles
  particles.forEach(p => drawParticle(p));
}

function drawDino() {
  ctx.save();
  ctx.fillStyle = COLORS.cactus;
  
  const x = dino.x;
  const y = dino.y;
  const w = dino.width;
  const h = dino.height;
  
  // Simple dino shape
  ctx.beginPath();
  if (dino.isDucking) {
    ctx.ellipse(x + w/2, y + h/2, w/2, h/3, 0, 0, Math.PI * 2);
  } else {
    ctx.moveTo(x + 10, y + h);
    ctx.lineTo(x + 10, y + h - 20);
    ctx.lineTo(x + w - 10, y + h - 20);
    ctx.lineTo(x + w - 10, y + h);
    ctx.closePath();
  }
  ctx.fill();
  
  // Eye
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(x + w - 15, y + 15, 5, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.arc(x + w - 13, y + 15, 2, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
}

function drawObstacle(obs) {
  ctx.save();
  
  if (obs.type === 'cactus') {
    ctx.fillStyle = obs.blooming ? COLORS.cactusBloom : COLORS.cactus;
    
    // Cactus body
    ctx.fillRect(obs.x, obs.y - obs.height, obs.width, obs.height);
    
    // Arms
    ctx.fillRect(obs.x - 15, obs.y - obs.height + 20, 20, 8);
    ctx.fillRect(obs.x - 15, obs.y - obs.height + 20, 8, 25);
    
    ctx.fillRect(obs.x + obs.width, obs.y - obs.height + 30, 20, 8);
    ctx.fillRect(obs.x + obs.width + 12, obs.y - obs.height + 10, 8, 28);
    
    // Flower if blooming
    if (obs.blooming) {
      ctx.fillStyle = COLORS.flower;
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const px = obs.x + obs.width/2 + Math.cos(angle) * 12;
        const py = obs.y - obs.height - 10 + Math.sin(angle) * 12;
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (obs.type === 'bird') {
    ctx.fillStyle = '#333';
    
    // Bird body
    ctx.beginPath();
    ctx.ellipse(obs.x + 20, obs.y, 20, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Wings
    const wingOffset = Math.sin(Date.now() / 100) * 10;
    ctx.beginPath();
    ctx.moveTo(obs.x + 10, obs.y);
    ctx.lineTo(obs.x + 5, obs.y - 15 - wingOffset);
    ctx.lineTo(obs.x + 20, obs.y);
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(obs.x + 30, obs.y);
    ctx.lineTo(obs.x + 35, obs.y - 15 + wingOffset);
    ctx.lineTo(obs.x + 20, obs.y);
    ctx.fill();
  }
  
  ctx.restore();
}

function drawParticle(p) {
  ctx.save();
  ctx.globalAlpha = p.life / p.maxLife;
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation);
  
  if (p.type === 'petal') {
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (p.type === 'feather') {
    ctx.fillStyle = COLORS.feather;
    ctx.beginPath();
    ctx.ellipse(0, 0, 3, 12, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (p.type === 'rainbow') {
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.restore();
}

// Obstacle Management
function spawnObstacle() {
  const isBird = Math.random() < 0.3;
  const obstacle = {
    type: isBird ? 'bird' : 'cactus',
    x: canvas.width + 50,
    y: isBird ? GROUND_Y - 60 : GROUND_Y,
    width: isBird ? 40 : 30,
    height: isBird ? 20 : 50 + Math.random() * 30,
    passed: false,
    blooming: false
  };
  obstacles.push(obstacle);
}

function checkCollision(dino, obs) {
  const hitMargin = 5;
  return dino.x + hitMargin < obs.x + obs.width - hitMargin &&
         dino.x + dino.width - hitMargin > obs.x + hitMargin &&
         dino.y + hitMargin < obs.y &&
         dino.y + dino.height - hitMargin > obs.y - obs.height;
}

// Success & Beauty
function handleSuccess(obs) {
  consecutiveSuccesses++;
  
  if (obs.type === 'cactus') {
    makeCactusBloom(obs);
    addBeauty(BEAUTY_PER_BLOOM);
    createPetals(obs.x, obs.y - obs.height, 5);
    playBloomSound();
  } else {
    createFeathers(obs.x, obs.y, 3);
    addBeauty(BEAUTY_PER_FEATHER);
    playFeatherSound();
  }
  
  // Rainbow for 3 consecutive successes
  if (consecutiveSuccesses >= 3) {
    createRainbow();
    consecutiveSuccesses = 0;
  }
  
  gentleScreenShake();
  edgeGlow();
}

function makeCactusBloom(obs) {
  obs.blooming = true;
  setTimeout(() => {
    obs.blooming = false;
  }, 2000);
}

function addBeauty(amount) {
  beauty = Math.min(MAX_BEAUTY, beauty + amount);
  updateBeautyDisplay();
  updateBackground();
  
  if (beauty >= MAX_BEAUTY) {
    triggerCelebration();
  }
}

function updateBeautyDisplay() {
  const percent = Math.round(beauty);
  document.getElementById('beauty-fill').style.width = percent + '%';
  document.getElementById('beauty-percent').textContent = percent + '%';
}

function updateBackground() {
  const progress = beauty / MAX_BEAUTY;
  const h = COLORS.desert.h + (COLORS.bloom.h - COLORS.desert.h) * progress;
  const s = COLORS.desert.s + (COLORS.bloom.s - COLORS.desert.s) * progress;
  document.body.style.background = `hsl(${h}, ${s}%, 85%)`;
}

// Particles
function createPetals(x, y, count) {
  for (let i = 0; i < count; i++) {
    particles.push({
      type: 'petal',
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 4,
      vy: -2 - Math.random() * 3,
      life: 120,
      maxLife: 120,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.1,
      color: ['#FF6B9D', '#FFB3C6', '#FF8FAB'][Math.floor(Math.random() * 3)]
    });
  }
}

function createFeathers(x, y, count) {
  for (let i = 0; i < count; i++) {
    particles.push({
      type: 'feather',
      x: x,
      y: y,
      vx: -1 + Math.random() * 2,
      vy: -1 - Math.random() * 2,
      life: 180,
      maxLife: 180,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.05
    });
  }
}

function createRainbow() {
  for (let i = 0; i < 20; i++) {
    particles.push({
      type: 'rainbow',
      x: canvas.width / 2 + (Math.random() - 0.5) * 200,
      y: 100,
      vx: (Math.random() - 0.5) * 2,
      vy: 1 + Math.random(),
      life: 90,
      maxLife: 90,
      rotation: 0,
      rotationSpeed: 0,
      color: COLORS.rainbow[i % COLORS.rainbow.length]
    });
  }
}

// Collision
function handleCollision() {
  isRunning = false;
  const blooms = obstacles.filter(o => o.blooming).length;
  showMessage(
    `🌸 You created ${Math.round(beauty)}% beauty 🌸`,
    [{ text: 'Create Again', action: resetGame }]
  );
}

// Celebration
function triggerCelebration() {
  document.body.classList.add('pulse-glow');
  isRunning = false;
  
  showMessage('🌸 Desert has become an oasis! 🌸', [
    { text: 'Create Again', action: resetGame },
    { text: 'Rest', action: () => hideMessage() }
  ]);
  
  // Petal rain for 10 seconds
  let rainInterval = setInterval(() => {
    if (document.getElementById('message-overlay').classList.contains('hidden')) {
      clearInterval(rainInterval);
      return;
    }
    createPetals(Math.random() * canvas.width, -20, 3);
  }, 100);
}

// Reset
function resetGame() {
  // Elegant reset with fade out
  document.body.classList.remove('pulse-glow');
  
  // Reset beauty
  beauty = 0;
  updateBeautyDisplay();
  
  // Reset background
  setTimeout(() => {
    updateBackground();
    startGame();
  }, 1000);
}

// Visual Effects
function gentleScreenShake() {
  const container = document.getElementById('game-container');
  container.style.transform = 'translateX(2px)';
  setTimeout(() => {
    container.style.transform = 'translateX(-2px)';
    setTimeout(() => {
      container.style.transform = 'translateX(1px)';
      setTimeout(() => {
        container.style.transform = 'translateX(0)';
      }, 50);
    }, 50);
  }, 50);
}

function edgeGlow() {
  const container = document.getElementById('game-container');
  container.style.boxShadow = '0 10px 40px rgba(255, 107, 157, 0.3)';
  setTimeout(() => {
    container.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.1)';
  }, 300);
}

// Message System
function showMessage(text, buttons) {
  const overlay = document.getElementById('message-overlay');
  const content = document.getElementById('message-content');
  const buttonsContainer = document.getElementById('message-buttons');
  
  content.textContent = text;
  buttonsContainer.innerHTML = '';
  
  buttons.forEach(btn => {
    const button = document.createElement('button');
    button.className = 'message-btn';
    button.textContent = btn.text;
    button.onclick = () => {
      btn.action();
    };
    buttonsContainer.appendChild(button);
  });
  
  overlay.classList.remove('hidden');
}

function hideMessage() {
  document.getElementById('message-overlay').classList.add('hidden');
}

// Sounds (Web Audio API - Simple synth)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playJumpSound() {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.frequency.setValueAtTime(200, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);
  gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + 0.1);
}

function playBloomSound() {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.frequency.setValueAtTime(800, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.15);
  gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + 0.3);
}

function playFeatherSound() {
  const noise = audioCtx.createBufferSource();
  const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.2, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < buffer.length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  noise.buffer = buffer;
  const gain = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 1000;
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);
  gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
  noise.start(audioCtx.currentTime);
  noise.stop(audioCtx.currentTime + 0.2);
}

// Start
window.onload = init;
