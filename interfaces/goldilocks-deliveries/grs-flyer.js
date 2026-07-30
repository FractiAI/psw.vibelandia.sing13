/**
 * Valet Pru Concierge · postcard flyer (6×4") download.
 * Composes a print-ready PNG with brand art + QR for guests to save/print.
 */
(function (global) {
  'use strict';

  var HOME = 'https://www.ssvibelandiaquestfest24x365.com/hire-a-goldilocks-valet-concierge';
  var ASSET = '/interfaces/goldilocks-deliveries/assets';
  var QR_SRC = ASSET + '/valet-pru-concierge-qr-print.png';
  var PHOTO_SRC = ASSET + '/valet-pru-concierge-poster-2026-07.jpg';
  var HOST_SRC = '/interfaces/assets/questfest-crew/valet-pru-guayabera-panama.jpg';

  // 6" × 4" at 300 dpi
  var W = 1800;
  var H = 1200;

  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = function () { resolve(img); };
      img.onerror = function () { reject(new Error('Failed to load ' + src)); };
      img.src = src;
    });
  }

  function roundRect(ctx, x, y, w, h, r) {
    var rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function coverDraw(ctx, img, x, y, w, h) {
    var ir = img.width / img.height;
    var tr = w / h;
    var sx; var sy; var sw; var sh;
    if (ir > tr) {
      sh = img.height;
      sw = sh * tr;
      sx = (img.width - sw) / 2;
      sy = 0;
    } else {
      sw = img.width;
      sh = sw / tr;
      sx = 0;
      sy = (img.height - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  }

  function drawFlyer(poster, host, qr) {
    var canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    var ctx = canvas.getContext('2d');

    // Ship-deck base
    var g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#1a120c');
    g.addColorStop(0.45, '#0a0806');
    g.addColorStop(1, '#14100c');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // Left art panel
    coverDraw(ctx, poster, 0, 0, 720, H);
    var shade = ctx.createLinearGradient(480, 0, 720, 0);
    shade.addColorStop(0, 'rgba(10,8,6,0)');
    shade.addColorStop(1, 'rgba(10,8,6,0.92)');
    ctx.fillStyle = shade;
    ctx.fillRect(480, 0, 240, H);
    ctx.fillStyle = 'rgba(10,8,6,0.28)';
    ctx.fillRect(0, 0, 720, H);

    // Gold frame
    ctx.strokeStyle = 'rgba(212,175,55,0.55)';
    ctx.lineWidth = 6;
    ctx.strokeRect(24, 24, W - 48, H - 48);

    // Host circular crop
    var hx = 560;
    var hy = 860;
    var hr = 110;
    ctx.save();
    ctx.beginPath();
    ctx.arc(hx, hy, hr, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    coverDraw(ctx, host, hx - hr, hy - hr, hr * 2, hr * 2);
    ctx.restore();
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(hx, hy, hr, 0, Math.PI * 2);
    ctx.stroke();

    // Copy column
    var left = 780;
    ctx.fillStyle = '#d4af37';
    ctx.font = '700 28px Inter, system-ui, sans-serif';
    ctx.fillText('VALET PRU’S CONCIERGE', left, 120);
    ctx.fillStyle = '#fef3c7';
    ctx.font = '600 64px "Cormorant Garamond", Georgia, serif';
    ctx.fillText('Downtown Reno', left, 195);
    ctx.fillStyle = '#f5e6c8';
    ctx.font = 'italic 34px "Cormorant Garamond", Georgia, serif';
    ctx.fillText('Practical help · Fair Exchange · Human first', left, 250);

    ctx.fillStyle = 'rgba(212,175,55,0.35)';
    ctx.fillRect(left, 280, 920, 2);

    var services = [
      'Food deliveries · Errands · Pharmacy pickup',
      'Personal assistance · Event planning',
      'House & pet sitting · Hotel / Airbnb help',
      'Goldilocks EcoReset Service',
      'E-scooter courier · Downtown · Midtown · Idlewild'
    ];
    ctx.font = '500 26px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#d6cfc4';
    var y = 325;
    for (var i = 0; i < services.length; i++) {
      ctx.fillText('·  ' + services[i], left, y);
      y += 40;
    }

    // Contact card
    roundRect(ctx, left, 545, 520, 280, 18);
    ctx.fillStyle = 'rgba(26,18,12,0.72)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(212,175,55,0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#fef3c7';
    ctx.font = '700 26px Inter, system-ui, sans-serif';
    ctx.fillText('BOOK NOW', left + 36, 600);
    ctx.fillStyle = '#f5e6c8';
    ctx.font = '600 36px Inter, system-ui, sans-serif';
    ctx.fillText('(775) 203-1281', left + 36, 660);
    ctx.font = '500 26px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#d4af37';
    ctx.fillText('valetpru@gmail.com', left + 36, 710);
    ctx.fillStyle = '#a8a29e';
    ctx.font = '400 22px Inter, system-ui, sans-serif';
    ctx.fillText('Text, call, or email — I’ll take care of the rest.', left + 36, 765);

    // QR panel
    var qx = 1340;
    var qy = 545;
    var qs = 320;
    roundRect(ctx, qx - 16, qy - 16, qs + 32, qs + 100, 18);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.drawImage(qr, qx, qy, qs, qs);
    ctx.fillStyle = '#1a120c';
    ctx.font = '700 22px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SCAN TO BOOK', qx + qs / 2, qy + qs + 42);
    ctx.font = '500 16px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#5a5248';
    ctx.fillText('ssvibelandiaquestfest24x365.com', qx + qs / 2, qy + qs + 68);
    ctx.textAlign = 'left';

    // Footer
    ctx.fillStyle = 'rgba(212,175,55,0.55)';
    ctx.fillRect(left, 1080, 920, 2);
    ctx.fillStyle = '#a8a29e';
    ctx.font = '500 22px Inter, system-ui, sans-serif';
    ctx.fillText('SS Vibelandia QUESTFEST · Your host on the ship · Old School honor', left, 1130);

    return canvas;
  }

  function downloadCanvas(canvas, filename) {
    return new Promise(function (resolve, reject) {
      if (canvas.toBlob) {
        canvas.toBlob(function (blob) {
          if (!blob) {
            reject(new Error('Could not create flyer image'));
            return;
          }
          var a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          setTimeout(function () {
            URL.revokeObjectURL(a.href);
            a.remove();
          }, 1500);
          resolve();
        }, 'image/png');
      } else {
        var a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        resolve();
      }
    });
  }

  function setStatus(el, msg, isErr) {
    if (!el) return;
    el.textContent = msg;
    el.hidden = !msg;
    el.classList.toggle('grs-flyer__status--err', !!isErr);
  }

  function generateAndDownload(opts) {
    opts = opts || {};
    var statusEl = opts.statusEl || null;
    var btn = opts.button || null;
    setStatus(statusEl, 'Composing postcard…', false);
    if (btn) btn.disabled = true;

    return Promise.all([
      loadImage(PHOTO_SRC),
      loadImage(HOST_SRC),
      loadImage(QR_SRC)
    ]).then(function (imgs) {
      var canvas = drawFlyer(imgs[0], imgs[1], imgs[2]);
      return downloadCanvas(canvas, 'valet-pru-concierge-postcard.png');
    }).then(function () {
      setStatus(statusEl, 'Saved — print at 6×4″ postcard size (landscape).', false);
    }).catch(function (err) {
      console.error(err);
      setStatus(statusEl, 'Could not build the flyer. Try again, or open the print flyer.', true);
    }).then(function () {
      if (btn) btn.disabled = false;
    });
  }

  function bind() {
    var btn = document.getElementById('grs-download-flyer');
    var status = document.getElementById('grs-flyer-status');
    if (!btn) return;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      generateAndDownload({ button: btn, statusEl: status });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }

  global.GRSFlyer = {
    generateAndDownload: generateAndDownload,
    HOME: HOME
  };
})(window);
