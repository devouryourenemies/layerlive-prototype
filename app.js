const canvas = document.getElementById('drawCanvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const brushSize = document.getElementById('brushSize');
const toolButtons = Array.from(document.querySelectorAll('[data-tool]'));
const clearBtn = document.getElementById('clearBtn');
const undoBtn = document.getElementById('undoBtn');
const exportBtn = document.getElementById('exportBtn');
const copyInvite = document.getElementById('copyInvite');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatLog = document.getElementById('chatLog');

let drawing = false;
let activeTool = 'brush';
let lastPoint = null;
const history = [];
const maxHistory = 20;

function setupCanvas() {
  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const snapshot = document.createElement('canvas');
  snapshot.width = canvas.width;
  snapshot.height = canvas.height;
  snapshot.getContext('2d').drawImage(canvas, 0, 0);

  canvas.width = Math.max(1, Math.floor(rect.width * ratio));
  canvas.height = Math.max(1, Math.floor(rect.height * ratio));
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  paintBackground();
  if (snapshot.width > 1 && snapshot.height > 1) {
    ctx.drawImage(snapshot, 0, 0, rect.width, rect.height);
  } else {
    drawStarterSketch();
  }
}

function paintBackground() {
  const rect = canvas.getBoundingClientRect();
  const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
  gradient.addColorStop(0, '#121529');
  gradient.addColorStop(1, '#090b18');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, rect.width, rect.height);

  ctx.strokeStyle = 'rgba(255,255,255,0.045)';
  ctx.lineWidth = 1;
  for (let x = 0; x < rect.width; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, rect.height);
    ctx.stroke();
  }
  for (let y = 0; y < rect.height; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(rect.width, y);
    ctx.stroke();
  }
}

function drawStarterSketch() {
  const rect = canvas.getBoundingClientRect();
  ctx.save();
  ctx.translate(rect.width / 2, rect.height / 2);
  ctx.strokeStyle = 'rgba(255,61,242,0.9)';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(-180, 90);
  ctx.bezierCurveTo(-115, -120, 110, -130, 185, 70);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(51,247,255,0.88)';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-210, -70);
  ctx.lineTo(0, -175);
  ctx.lineTo(205, -70);
  ctx.stroke();

  ctx.fillStyle = 'rgba(184,255,77,0.18)';
  ctx.strokeStyle = 'rgba(184,255,77,0.86)';
  ctx.lineWidth = 3;
  roundRect(ctx, -130, -20, 260, 130, 26);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = 'rgba(246,247,255,0.92)';
  ctx.font = '800 22px ui-sans-serif, system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('Draw here', 0, 45);
  ctx.restore();
  saveHistory();
}

function roundRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}

function getPoint(event) {
  const rect = canvas.getBoundingClientRect();
  const clientX = event.touches ? event.touches[0].clientX : event.clientX;
  const clientY = event.touches ? event.touches[0].clientY : event.clientY;
  return { x: clientX - rect.left, y: clientY - rect.top };
}

function startDrawing(event) {
  event.preventDefault();
  drawing = true;
  lastPoint = getPoint(event);
  saveHistory();
}

function draw(event) {
  if (!drawing) return;
  event.preventDefault();
  const point = getPoint(event);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = Number(brushSize.value);
  ctx.globalCompositeOperation = activeTool === 'eraser' ? 'destination-out' : 'source-over';
  ctx.strokeStyle = activeTool === 'eraser' ? 'rgba(0,0,0,1)' : colorPicker.value;
  ctx.beginPath();
  ctx.moveTo(lastPoint.x, lastPoint.y);
  ctx.lineTo(point.x, point.y);
  ctx.stroke();
  lastPoint = point;
}

function stopDrawing() {
  drawing = false;
  lastPoint = null;
  ctx.globalCompositeOperation = 'source-over';
}

function saveHistory() {
  try {
    history.push(canvas.toDataURL('image/png'));
    if (history.length > maxHistory) history.shift();
  } catch (err) {
    console.warn('Could not save history', err);
  }
}

function restoreFromDataUrl(url) {
  const img = new Image();
  img.onload = () => {
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.drawImage(img, 0, 0, rect.width, rect.height);
  };
  img.src = url;
}

canvas.addEventListener('pointerdown', startDrawing);
canvas.addEventListener('pointermove', draw);
window.addEventListener('pointerup', stopDrawing);
canvas.addEventListener('touchstart', startDrawing, { passive: false });
canvas.addEventListener('touchmove', draw, { passive: false });
window.addEventListener('touchend', stopDrawing);

for (const button of toolButtons) {
  button.addEventListener('click', () => {
    activeTool = button.dataset.tool;
    toolButtons.forEach((btn) => btn.classList.toggle('active', btn === button));
  });
}

clearBtn.addEventListener('click', () => {
  saveHistory();
  paintBackground();
});

undoBtn.addEventListener('click', () => {
  if (history.length < 2) return;
  history.pop();
  restoreFromDataUrl(history[history.length - 1]);
});

exportBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'layerlive-canvas.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});

copyInvite.addEventListener('click', async () => {
  const invite = `${window.location.href.split('#')[0]}#demo`;
  try {
    await navigator.clipboard.writeText(invite);
    copyInvite.textContent = 'Invite copied';
  } catch {
    copyInvite.textContent = 'Copy failed';
  }
  setTimeout(() => { copyInvite.textContent = 'Copy invite'; }, 1400);
});

chatForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const value = chatInput.value.trim();
  if (!value) return;
  const p = document.createElement('p');
  p.innerHTML = `<b>You</b> ${escapeHtml(value)}`;
  chatLog.appendChild(p);
  chatLog.scrollTop = chatLog.scrollHeight;
  chatInput.value = '';
});

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  })[char]);
}

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(setupCanvas, 160);
});

setupCanvas();
