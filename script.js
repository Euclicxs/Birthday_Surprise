const CONFIG = {
  name: "Christine Remolleno",
  firstName: "Christine",
  ageNow: 21,
  ageNew: 22,
  clicksNeeded: 21,
  surpriseClick: 22,

  welcomeText:
    "Twenty-one candles have glowed for you before, but today the world gets a little brighter because it's you who's lighting it up. " +
    "I built this tiny corner of the internet just for you, Christine, so that somewhere, somehow, you'd feel as cherished as you make everyone around you feel. " +
    "Scroll gently through it. Every tap, every sparkle, every silly little animation… is just me trying to say what words alone never quite manage.",

  finaleText:
    "Dear Christine,\n\n" +
    "Happy 22nd Birthday sa imoha, daghan na kag naagian sa imohang kinabuhi diria sa kalibutan diria, you already have a lot of experiences in life through ups and downs nimo, keep being you. " +
    "Padayun lng ang kinabuhi and stay healthy. Ang imohang dream sa pagiging Madre, may God provide it for you according to His Name. " +
    "Still Happy Birthday and wishing you have a great 22nd Birthday.",

  secretText:
    "To speak the truth, I like you. I know that you may have a hint on that or such or IDK. I am not expecting as such na mo tanggap ka, I such want to relay this to you even tho naay times na pwede ra nako ni iingon sa imoha. " +
    "I just wanted to get this off my chest and again I am not expecting anything because you wanted to prioritize your studies and such. " +
    "Nevertheless, Happy Birthday and enjoy your day :)",

  photos: [
    { src: "assets/photo1.jpg", caption: "May you have a lovely time of your day." },
    { src: "assets/photo2.jpg", caption: "Always remind yourself to be healthy and strong." },
    { src: "assets/photo3.jpg", caption: "May God bless you and Happy Birthday!" },
    { src: "assets/photo4.jpg", caption: "Mou rani akoang nakitan wa najuy lain huhu..." }
  ],

  song: null
};

const SCENES = [
  "scene-envelope",
  "scene-welcome",
  "scene-gallery",
  "scene-cake",
  "scene-finale"
];

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

/* ---------------- audio ---------------- */

let audioCtx = null;
let songPlaying = false;
let loopStartGuard = null;
let songTimer = null;
let musicNodes = [];

function ac() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function tone(freq, start, dur, vol = 0.18, type = "sine") {
  const ctx = ac();
  const t0 = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

function musicTone(freq, start, dur, vol = 0.16, type = "sine") {
  const ctx = ac();
  const t0 = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.06);
  musicNodes.push(osc);
  osc.onended = () => {
    const i = musicNodes.indexOf(osc);
    if (i > -1) musicNodes.splice(i, 1);
  };
}

function chime(index) {
  const scale = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
  const semi = scale[index % scale.length] + 12 * Math.floor(index / scale.length);
  const freq = 523.25 * Math.pow(2, semi / 12);
  tone(freq, 0, 0.55, 0.2, "triangle");
  tone(freq * 2, 0.02, 0.3, 0.07, "sine");
}

function sparkleBurstSound() {
  [0, 4, 7, 11, 14, 19].forEach((s, i) => {
    tone(784 * Math.pow(2, s / 12), i * 0.07, 0.5, 0.14, "triangle");
  });
}

const MELODY = [
  [392, 0.0, 0.35], [392, 0.4, 0.18], [440, 0.6, 0.55], [392, 1.2, 0.55],
  [523.25, 1.8, 0.55], [493.88, 2.4, 1.0],
  [392, 3.5, 0.35], [392, 3.9, 0.18], [440, 4.1, 0.55], [392, 4.7, 0.55],
  [587.33, 5.3, 0.55], [523.25, 5.9, 1.0],
  [392, 7.0, 0.35], [392, 7.4, 0.18], [784, 7.6, 0.55], [659.25, 8.2, 0.55],
  [523.25, 8.8, 0.55], [493.88, 9.4, 0.55], [440, 10.0, 1.1],
  [698.46, 11.2, 0.35], [698.46, 11.6, 0.18], [659.25, 11.8, 0.55],
  [523.25, 12.4, 0.55], [587.33, 13.0, 0.55], [523.25, 13.6, 1.4]
];

function updateMusicIcon() {
  const icon = document.getElementById("music-toggle");
  if (!icon) return;
  icon.classList.toggle("playing", songPlaying);
  icon.querySelector(".music-note").textContent = songPlaying ? "♪" : "♫";
}

function playSong() {
  if (songPlaying) {
    stopSong();
    return;
  }
  if (CONFIG.song) {
    const audio = new Audio(CONFIG.song);
    audio.loop = true;
    audio.play().catch(() => {});
    audio._custom = true;
    songTimer = audio;
    songPlaying = true;
    updateMusicIcon();
    return;
  }
  songPlaying = true;
  updateMusicIcon();
  const sing = () => {
    if (!songPlaying) return;
    MELODY.forEach(([f, t, d]) => {
      musicTone(f, t + 0.05, d, 0.16, "triangle");
      musicTone(f / 2, t + 0.05, d, 0.05, "sine");
    });
    loopStartGuard = setTimeout(sing, 15200);
  };
  sing();
}

function stopSong() {
  songPlaying = false;
  clearTimeout(loopStartGuard);
  loopStartGuard = null;
  musicNodes.forEach((osc) => {
    try { osc.stop(); } catch (e) {}
    try { osc.disconnect(); } catch (e) {}
  });
  musicNodes = [];
  if (songTimer) {
    if (songTimer._custom) songTimer.pause();
    clearTimeout(songTimer);
    songTimer = null;
  }
  updateMusicIcon();
}

/* ---------------- particles (canvas fx) ---------------- */

const fx = $("#fx");
const fctx = fx.getContext("2d");
let parts = [];

function sizeCanvas() {
  fx.width = innerWidth * devicePixelRatio;
  fx.height = innerHeight * devicePixelRatio;
  fctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}
sizeCanvas();
addEventListener("resize", sizeCanvas);

function confetti(x, y, count = 90, spread = 1) {
  const colors = ["#e8b84b", "#f3d98c", "#b76e79", "#ffd9e0", "#fff8f2", "#c97b84"];
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = (2 + Math.random() * 8) * spread;
    parts.push({
      kind: Math.random() < 0.22 ? "heart" : "confetti",
      x, y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - 3,
      g: 0.16 + Math.random() * 0.1,
      size: 5 + Math.random() * 7,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      color: colors[(Math.random() * colors.length) | 0],
      life: 1,
      decay: 0.006 + Math.random() * 0.006
    });
  }
}

function firework() {
  const x = innerWidth * (0.15 + Math.random() * 0.7);
  const y = innerHeight * (0.12 + Math.random() * 0.4);
  confetti(x, y, 70, 1.4);
}

function tickParts() {
  fctx.clearRect(0, 0, innerWidth, innerHeight);
  parts = parts.filter((p) => p.life > 0 && p.y < innerHeight + 60);
  for (const p of parts) {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.g;
    p.vx *= 0.99;
    p.rot += p.vr;
    p.life -= p.decay;
    fctx.save();
    fctx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.6));
    fctx.translate(p.x, p.y);
    fctx.rotate(p.rot);
    if (p.kind === "heart") {
      drawHeart(0, 0, p.size, p.color);
    } else {
      fctx.fillStyle = p.color;
      fctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    }
    fctx.restore();
  }
  requestAnimationFrame(tickParts);
}
tickParts();

function drawHeart(x, y, s, color) {
  fctx.fillStyle = color;
  fctx.beginPath();
  fctx.moveTo(x, y + s * 0.32);
  fctx.bezierCurveTo(x + s, y - s * 0.45, x + s * 0.5, y - s * 1.1, x, y - s * 0.5);
  fctx.bezierCurveTo(x - s * 0.5, y - s * 1.1, x - s, y - s * 0.45, x, y + s * 0.32);
  fctx.fill();
}

/* ---------------- floating hearts ---------------- */

const HEARTS = ["💗", "💖", "💕", "✨", "🌹", "🩷"];
function spawnHeart() {
  const layer = $("#hearts-layer");
  const el = document.createElement("span");
  el.className = "float-heart";
  el.textContent = HEARTS[(Math.random() * HEARTS.length) | 0];
  el.style.left = Math.random() * 100 + "vw";
  el.style.animationDuration = 7 + Math.random() * 7 + "s";
  el.style.fontSize = 14 + Math.random() * 18 + "px";
  layer.appendChild(el);
  setTimeout(() => el.remove(), 15000);
}
setInterval(spawnHeart, 750);
for (let i = 0; i < 6; i++) setTimeout(spawnHeart, i * 400);

/* ---------------- scene manager ---------------- */

function showScene(id) {
  $$(".scene").forEach((s) => s.classList.toggle("active", s.id === id));
  const idx = SCENES.indexOf(id);
  $$("#progress i").forEach((d, i) => d.classList.toggle("on", i <= idx));
  window.scrollTo(0, 0);
  navBack.classList.toggle("show", idx >= 2);
  navFwd.classList.toggle("show", idx >= 1 && idx < SCENES.length - 1);
  if (id === "scene-finale") startFinale();
}

const navBack = $("#nav-back");
const navFwd = $("#nav-fwd");

function goStep(dir) {
  const current = $$(".scene").find((s) => s.classList.contains("active"));
  const idx = SCENES.indexOf(current.id);
  const next = SCENES[idx + dir];
  if (!next) return;
  ac();
  tone(660, 0, 0.18, 0.12, "triangle");
  showScene(next);
}

navBack.addEventListener("click", () => goStep(-1));
navFwd.addEventListener("click", () => goStep(1));

const progressEl = $("#progress");
SCENES.forEach(() => progressEl.appendChild(document.createElement("i")));

$$("[data-next]").forEach((btn) => {
  btn.addEventListener("click", () => {
    ac();
    tone(660, 0, 0.18, 0.12, "triangle");
    showScene(btn.dataset.next);
  });
});

/* ---------------- scene 1 : envelope ---------------- */

const envelope = $("#envelope");
envelope.addEventListener("click", () => {
  if (envelope.classList.contains("open")) return;
  envelope.classList.add("open");
  ac();
  playSong();
  sparkleBurstSound();
  confetti(innerWidth / 2, innerHeight / 2, 60, 0.8);
  setTimeout(() => {
    showScene("scene-welcome");
    typeText($("#welcome-text"), CONFIG.welcomeText, 18);
  }, 1500);
});

/* ---------------- typewriter ---------------- */

function typeText(el, text, speed) {
  el.innerHTML = "";
  let i = 0;
  const caret = document.createElement("span");
  caret.className = "caret";
  el.appendChild(caret);
  const step = () => {
    if (i < text.length) {
      caret.insertAdjacentText("beforebegin", text[i]);
      i++;
      if (text[i - 1] === "." || text[i - 1] === ",") setTimeout(step, speed * 12);
      else setTimeout(step, speed);
    } else {
      setTimeout(() => caret.remove(), 1600);
    }
  };
  step();
}

$("#welcome-name").textContent = CONFIG.name;
$("#finale-name").textContent = CONFIG.name + "!";

/* ---------------- scene 3 : gallery ---------------- */

let photoIdx = 0;
const photoEl = $("#photo");
const captionEl = $("#photo-caption");
const dotsEl = $("#dots");

CONFIG.photos.forEach((_, i) => {
  const d = document.createElement("i");
  if (i === 0) d.classList.add("on");
  dotsEl.appendChild(d);
});

function renderPhoto() {
  const p = CONFIG.photos[photoIdx];
  photoEl.style.opacity = 0;
  setTimeout(() => {
    photoEl.className = "photo";
    photoEl.style.animation = "none";
    void photoEl.offsetWidth;
    if (p.src) {
      const img = new Image();
      img.onload = () => { photoEl.style.backgroundImage = `url("${p.src}")`; };
      img.onerror = () => photoEl.classList.add("placeholder");
      img.src = p.src;
    } else {
      photoEl.classList.add("placeholder");
    }
    photoEl.style.animation = "";
    photoEl.style.opacity = 1;
    captionEl.textContent = p.caption;
    photoIdx >= 0 && $$("#dots i").forEach((d, i) => d.classList.toggle("on", i === photoIdx));
  }, 260);
}
renderPhoto();

$("#next-photo").addEventListener("click", () => {
  photoIdx = (photoIdx + 1) % CONFIG.photos.length;
  tone(587, 0, 0.15, 0.1, "triangle");
  renderPhoto();
});
$("#prev-photo").addEventListener("click", () => {
  photoIdx = (photoIdx - 1 + CONFIG.photos.length) % CONFIG.photos.length;
  tone(523, 0, 0.15, 0.1, "triangle");
  renderPhoto();
});

/* ---------------- music toggle (corner) ---------------- */

$("#music-toggle").addEventListener("click", playSong);

/* ---------------- scene 5 : cake ---------------- */

const bottomL = $("#candles-bottom-l");
const bottomR = $("#candles-bottom-r");
const midL = $("#candles-mid-l");
const midR = $("#candles-mid-r");
const topRow = $("#candles-top");
const cakeScale = $("#cake-scale");
const clickCount = $("#click-count");
const meter = document.querySelector(".click-meter");
const hint = $("#cake-hint");
const finalBlow = $("#final-blow");
const glow = $("#cake-glow");

let clicks = 0;
let finished = false;
let surprised = false;

function newCandle(isHero = false) {
  const c = document.createElement("div");
  c.className = "candle" + (isHero ? " hero" : "");
  return c;
}

function placeCandle(n) {
  if (n <= 10) {
    (n % 2 ? bottomL : bottomR).appendChild(newCandle());
  } else if (n <= 20) {
    (n % 2 ? midL : midR).appendChild(newCandle());
  } else if (n === 21) {
    topRow.appendChild(newCandle());
  }
}

function lightNextCandle() {
  clicks++;
  clickCount.textContent = clicks;
  meter.classList.remove("pop");
  void meter.offsetWidth;
  meter.classList.add("pop");

  placeCandle(clicks);
  chime(clicks - 1);

  const scale = 0.72 + (clicks / CONFIG.surpriseClick) * 0.28;
  cakeScale.style.transform = `scale(${scale.toFixed(3)})`;
  if (clicks >= 8) glow.classList.add("on");

  if (clicks === 1) hint.textContent = "keep tapping…";
  if (clicks === 5) hint.textContent = "the bottom is glowing…";
  if (clicks === 10) hint.textContent = "now climbing the middle…";
  if (clicks === 15) hint.textContent = "it's getting brighter…";
  if (clicks === 21) hint.textContent = "one more candle… and a surprise";

  confetti(
    cakeScale.getBoundingClientRect().left + cakeScale.offsetWidth / 2,
    cakeScale.getBoundingClientRect().top,
    14,
    0.5
  );

  if (clicks >= CONFIG.clicksNeeded && !finished) {
    finished = true;
    hint.textContent = `${CONFIG.ageNow} candles glow — but wait…`;
    finalBlow.classList.remove("hidden");
    sparkleBurstSound();
  }
}

function surprise() {
  if (surprised) return;
  if (clicks < CONFIG.surpriseClick) {
    if (!finished) return;
    clicks = CONFIG.surpriseClick;
    clickCount.textContent = clicks;
  }
  surprised = true;
  topRow.appendChild(newCandle(true));
  finalBlow.classList.add("hidden");
  hint.textContent = "the real surprise ✦";
  sparkleBurstSound();
  const r = cakeScale.getBoundingClientRect();
  confetti(r.left + r.width / 2, r.top, 220, 1.6);
  let fw = 0;
  const fwTimer = setInterval(() => {
    firework();
    if (++fw > 7) clearInterval(fwTimer);
  }, 260);
  cakeScale.classList.add("shake");
  glow.classList.add("on");
  setTimeout(() => showScene("scene-finale"), 1100);
}

cakeScale.addEventListener("click", () => {
  ac();
  if (!finished) lightNextCandle();
  else surprise();
});
finalBlow.addEventListener("click", surprise);

/* ---------------- scene 6 : finale ---------------- */

const BALLOON_COLORS = ["#e8b84b", "#b76e79", "#ffd9e0", "#d9959e", "#f3d98c", "#c97b84"];
let finaleStarted = false;
let fwLoop = null;

function startFinale() {
  if (finaleStarted) return;
  finaleStarted = true;

  const letters = $("#finale-text");
  letters.textContent = "";
  const paras = CONFIG.finaleText.split("\n\n");
  paras.forEach((p, i) => {
    setTimeout(() => {
      const el = document.createElement("p");
      el.textContent = p;
      el.style.marginBottom = "16px";
      el.style.whiteSpace = "pre-line";
      el.style.animation = "letterUp 1s cubic-bezier(0.22,1,0.36,1) forwards";
      letters.appendChild(el);
    }, 1400 + i * 900);
  });

  const balloons = $("#balloons");
  for (let i = 0; i < 26; i++) {
    const b = document.createElement("div");
    b.className = "balloon";
    b.style.left = Math.random() * 96 + "vw";
    b.style.background = `radial-gradient(circle at 32% 28%, #ffffff55, ${BALLOON_COLORS[i % BALLOON_COLORS.length]})`;
    b.style.animationDuration = 9 + Math.random() * 9 + "s";
    b.style.animationDelay = Math.random() * 4 + "s";
    b.style.width = 38 + Math.random() * 34 + "px";
    b.style.height = b.offsetWidth * 1.3 + "px";
    balloons.appendChild(b);
  }

  confetti(innerWidth / 2, innerHeight * 0.3, 260, 1.7);
  fwLoop = setInterval(firework, 1300);
}

/* ---------------- secret message ---------------- */

const secretTrigger = $("#secret-trigger");
const secretReveal = $("#secret-reveal");

secretTrigger.addEventListener("click", () => {
  if (secretTrigger.dataset.shown) return;
  secretTrigger.dataset.shown = "1";
  secretReveal.hidden = false;
  const p = document.createElement("p");
  p.className = "secret-letter";
  p.textContent = CONFIG.secretText;
  secretReveal.appendChild(p);
  sparkleBurstSound();
  secretTrigger.textContent = "there. now you know ✦";
  secretTrigger.style.opacity = "0.6";
  secretReveal.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

/* ---------------- replay ---------------- */

$("#replay").addEventListener("click", () => {
  clearInterval(fwLoop);
  finaleStarted = false;
  clicks = 0;
  finished = false;
  surprised = false;
  [bottomL, bottomR, midL, midR, topRow].forEach((row) => (row.innerHTML = ""));
  clickCount.textContent = "0";
  glow.classList.remove("on");
  cakeScale.style.transform = "scale(0.72)";
  cakeScale.classList.remove("shake");
  finalBlow.classList.add("hidden");
  hint.textContent = "tap the candle!";
  photoIdx = 0;
  renderPhoto();
  stopSong();
  $("#balloons").innerHTML = "";
  $("#finale-text").innerHTML = "";
  secretTrigger.dataset.shown = "";
  secretTrigger.textContent = "psst… tap here ✦";
  secretTrigger.style.opacity = "";
  secretReveal.hidden = true;
  secretReveal.innerHTML = "";
  showScene("scene-envelope");
  envelope.classList.remove("open");
});
