(() => {
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
  let didStroke = false;
  let dpr = 1;
  const history = [];
  const maxHistory = 40;

  function getLogicalSize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    return { w: rect.width, h: rect.height };
  }

  function setupCanvas() {
    dpr = window.devicePixelRatio || 1;
    const { w, h } = getLogicalSize();
    const snapshot = document.createElement('canvas');
    snapshot.width = canvas.width;
    snapshot.height = canvas.height;
    try { snapshot.getContext('2d').drawImage(canvas, 0, 0); } catch (_) { /* ignore empty canvas */ }

    canvas.width = Math.max(1, Math.floor(w * dpr));
    canvas.height = Math.max(1, Math.floor(h * dpr));
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (snapshot.width > 1 && snapshot.height > 1) {
      ctx.drawImage(snapshot, 0, 0, w, h);
    } else {
      paintBackground();
      drawStarterSketch();
    }
  }

  function paintBackground() {
    const { w, h } = getLogicalSize();
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, '#121529');
    gradient.addColorStop(1, '#090b18');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(255,255,255,0.045)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 32) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += 32) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
  }

  function drawStarterSketch() {
    const { w, h } = getLogicalSize();
    ctx.save();
    ctx.translate(w / 2, h / 2);

    // Curve
    ctx.strokeStyle = 'rgba(255,61,242,0.9)';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(-180, 90);
    ctx.bezierCurveTo(-115, -120, 110, -130, 185, 70);
    ctx.stroke();

    // Triangle
    ctx.strokeStyle = 'rgba(51,247,255,0.88)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-210, -70);
    ctx.lineTo(0, -175);
    ctx.lineTo(205, -70);
    ctx.stroke();

    // Rounded rect
    ctx.fillStyle = 'rgba(184,255,77,0.18)';
    ctx.strokeStyle = 'rgba(184,255,77,0.86)';
    ctx.lineWidth = 3;
    roundRect(ctx, -130, -20, 260, 130, 26);
    ctx.fill();
    ctx.stroke();

    // Label
    ctx.fillStyle = 'rgba(246,247,255,0.92)';
    ctx.font = '800 22px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Draw here', 0, 45);
    ctx.restore();
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

  function applyStrokeStyle() {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = Number(brushSize.value);
    if (activeTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = colorPicker.value;
    }
  }

  function startDrawing(event) {
    if (event.button && event.button !== 0) return;
    event.preventDefault();
    drawing = true;
    didStroke = false;
    lastPoint = getPoint(event);
    applyStrokeStyle();
  }

  function draw(event) {
    if (!drawing) return;
    event.preventDefault();
    const point = getPoint(event);
    if (!didStroke) {
      // Save state before the stroke begins
      saveHistory();
      didStroke = true;
    }
    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    lastPoint = point;
  }

  function stopDrawing() {
    if (drawing && !didStroke) {
      saveHistory();
    }
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
      const { w, h } = getLogicalSize();
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
    };
    img.src = url;
  }

  // Pointer events
  canvas.addEventListener('pointerdown', startDrawing);
  canvas.addEventListener('pointermove', draw);
  window.addEventListener('pointerup', stopDrawing);

  // Touch events
  canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startDrawing(e); }, { passive: false });
  canvas.addEventListener('touchmove', (e) => { e.preventDefault(); draw(e); }, { passive: false });
  window.addEventListener('touchend', stopDrawing);

  // Tool switching
  for (const button of toolButtons) {
    button.addEventListener('click', () => {
      setTool(button.dataset.tool);
    });
  }

  function setTool(tool) {
    activeTool = tool;
    toolButtons.forEach((btn) => {
      const isActive = btn.dataset.tool === tool;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive);
    });
    canvas.classList.toggle('eraser-cursor', tool === 'eraser');
  }

  // Clear / Undo / Export
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

  // Invite copy
  copyInvite.addEventListener('click', async () => {
    const invite = window.location.href.split('#')[0] + '#demo';
    try {
      await navigator.clipboard.writeText(invite);
      copyInvite.textContent = 'Copied!';
    } catch {
      copyInvite.textContent = 'Copy failed';
    }
    setTimeout(() => { copyInvite.textContent = 'Copy invite'; }, 1400);
  });

  // Chat
  chatForm.addEventListener('submit', (event) => {
    event.preventDefault();
    sendChat();
  });

  function sendChat() {
    const value = chatInput.value.trim();
    if (!value) return;
    const p = document.createElement('p');
    p.innerHTML = '<b>You</b> ' + escapeHtml(value);
    chatLog.appendChild(p);
    chatLog.scrollTop = chatLog.scrollHeight;
    chatInput.value = '';
  }

  function escapeHtml(value) {
    return value.replace(/[&<>'"]/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    })[char]);
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', (event) => {
    // Don't intercept when typing in an input
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;

    if (event.key === 'b' || event.key === 'B') {
      setTool('brush');
    } else if (event.key === 'e' || event.key === 'E') {
      setTool('eraser');
    } else if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
      event.preventDefault();
      undoBtn.click();
    }
  });

  // Resize handler with debounce
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(setupCanvas, 160);
  });

  // Orientation change
  window.addEventListener('orientationchange', () => {
    setTimeout(setupCanvas, 300);
  });

  // Initial setup
  setupCanvas();
})();
