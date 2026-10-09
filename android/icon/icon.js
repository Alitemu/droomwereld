// Tekent het app-pictogram van De Droom Wereld op een canvas. Alles in een raster van 108 x 108
// (de maat van een adaptief Android-pictogram); het zichtbare deel is het midden (18..90),
// de belangrijke inhoud blijft binnen de "veilige" cirkel met straal 33 rond het midden.
// Gebruikt door make_icons.js; open icon.html om het pictogram te bekijken.
(function (root) {
  function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function star(c, x, y, R, col) { c.fillStyle = col; c.beginPath(); for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4, r = k % 2 ? R * 0.32 : R; c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } c.closePath(); c.fill(); }

  // achtergrond: droomlucht met sterretjes
  function background(c) {
    const g = c.createLinearGradient(0, 0, 0, 108);
    g.addColorStop(0, '#160a46'); g.addColorStop(0.5, '#5a2fb0'); g.addColorStop(1, '#ff9ec8'); c.fillStyle = g; c.fillRect(0, 0, 108, 108);
    const glow = c.createRadialGradient(54, 62, 4, 54, 62, 44); glow.addColorStop(0, 'rgba(160,230,255,.45)'); glow.addColorStop(1, 'rgba(160,230,255,0)'); c.fillStyle = glow; c.fillRect(0, 0, 108, 108);
    let s = 7; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 46; i++) { const x = rnd() * 108, y = rnd() * 70, r = 0.35 + rnd() * 0.7; c.fillStyle = `rgba(255,255,255,${0.45 + rnd() * 0.5})`; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }
    star(c, 30, 30, 3.2, '#fff6c0'); star(c, 80, 76, 2.4, '#ffffff'); star(c, 27, 74, 2.0, '#ffe3f4');
  }

  // voorgrond: maansikkel en de vrolijke robot
  function foreground(c) {
    // maan (op een eigen laag, zodat het uitsnijden de robot niet raakt)
    const m = document.createElement('canvas'); m.width = m.height = 108 * 8; const mc = m.getContext('2d'); mc.scale(8, 8);
    const mg = mc.createRadialGradient(66, 33, 2, 69, 37, 12); mg.addColorStop(0, '#fff7c8'); mg.addColorStop(1, '#ffc23a');
    mc.fillStyle = mg; mc.beginPath(); mc.arc(69, 37, 11, 0, 7); mc.fill();
    mc.globalCompositeOperation = 'destination-out'; mc.beginPath(); mc.arc(63.5, 33, 9.5, 0, 7); mc.fill();
    c.save(); c.shadowColor = 'rgba(255,214,90,.8)'; c.shadowBlur = 5; c.drawImage(m, 0, 0, 108, 108); c.restore();

    // antenne
    c.strokeStyle = '#d8def0'; c.lineWidth = 1.8; c.lineCap = 'round'; c.beginPath(); c.moveTo(52, 47); c.lineTo(52, 39); c.stroke();
    c.save(); c.shadowColor = '#ff5ea8'; c.shadowBlur = 4; c.fillStyle = '#ff5ea8'; c.beginPath(); c.arc(52, 37, 3.4, 0, 7); c.fill(); c.restore();
    c.fillStyle = 'rgba(255,255,255,.8)'; c.beginPath(); c.arc(51, 36, 1.1, 0, 7); c.fill();
    // oren
    c.fillStyle = '#c8d0e8'; rr(c, 34.5, 55, 4, 9, 1.8); c.fill(); rr(c, 65.5, 55, 4, 9, 1.8); c.fill();
    // hoofd
    c.save(); c.shadowColor = 'rgba(10,0,40,.45)'; c.shadowBlur = 4; c.shadowOffsetY = 1.5;
    const hg = c.createLinearGradient(0, 46, 0, 74); hg.addColorStop(0, '#5ff0ff'); hg.addColorStop(1, '#14a8d0');
    c.fillStyle = hg; rr(c, 37, 46, 30, 28, 9); c.fill(); c.restore();
    c.fillStyle = 'rgba(255,255,255,.35)'; rr(c, 40, 48, 18, 4, 2); c.fill();
    // vizier
    c.fillStyle = '#10163a'; rr(c, 41, 53, 22, 15, 6); c.fill();
    // ogen
    for (const x of [47, 57]) {
      c.save(); c.shadowColor = '#7af0ff'; c.shadowBlur = 3; c.fillStyle = '#9ff6ff'; c.beginPath(); c.arc(x, 59, 3, 0, 7); c.fill(); c.restore();
      c.fillStyle = '#ffffff'; c.beginPath(); c.arc(x + 0.9, 58, 1.1, 0, 7); c.fill();
    }
    // glimlach en wangetjes
    c.strokeStyle = '#9ff6ff'; c.lineWidth = 1.3; c.beginPath(); c.arc(52, 62.5, 3.2, 0.2 * Math.PI, 0.8 * Math.PI); c.stroke();
    c.fillStyle = 'rgba(255,110,170,.75)'; c.beginPath(); c.arc(41.5, 70, 2, 0, 7); c.arc(62.5, 70, 2, 0, 7); c.fill();
  }

  // klassiek pictogram (Android 7 en ouder launchers): afgeronde tegel met beide lagen
  function legacy(c, size) {
    c.save(); rr(c, size * 0.04, size * 0.04, size * 0.92, size * 0.92, size * 0.22); c.clip();
    c.scale(size / 72, size / 72); c.translate(-18, -18); // toon het zichtbare deel 18..90 van het 108-raster
    background(c); foreground(c); c.restore();
  }

  function render(kind, size) {
    const cv = document.createElement('canvas'); cv.width = cv.height = size; const c = cv.getContext('2d');
    c.imageSmoothingQuality = 'high';
    if (kind === 'legacy') legacy(c, size); else { c.scale(size / 108, size / 108); (kind === 'bg' ? background : foreground)(c); }
    return cv;
  }
  root.DWIcon = { render, background, foreground, legacy };
})(window);
