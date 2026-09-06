import QRCode from 'qrcode';
import type { SouvenirData } from '../types';
import { resolveAssetUrl } from './apiService';

/**
 * High-Resolution Canvas 2D Souvenir Dossier / Poster Generator
 * Composites visitor photo, thematic background, HUD graphics, stamps, metrics, and QR code.
 */
export async function generateSouvenirPoster(
  data: SouvenirData,
  qrCodeUrlOrDataUrl?: string
): Promise<string> {
  const width = 1200;
  const height = 1500;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // 1. Dark Atmospheric Background with theme tint
  const bgGrad = ctx.createRadialGradient(width / 2, height / 3, 50, width / 2, height / 2, 850);
  if (data.experienceId === 'detective') {
    bgGrad.addColorStop(0, '#0a1738');
    bgGrad.addColorStop(0.6, '#050c1e');
    bgGrad.addColorStop(1, '#020408');
  } else if (data.experienceId === 'smart-city') {
    bgGrad.addColorStop(0, '#042838');
    bgGrad.addColorStop(0.6, '#03141f');
    bgGrad.addColorStop(1, '#01060a');
  } else if (data.experienceId === 'ai-defense') {
    bgGrad.addColorStop(0, '#2d0938');
    bgGrad.addColorStop(0.6, '#15041a');
    bgGrad.addColorStop(1, '#050108');
  } else {
    // The Last Signal
    bgGrad.addColorStop(0, '#2b1b06');
    bgGrad.addColorStop(0.6, '#130d04');
    bgGrad.addColorStop(1, '#030201');
  }
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. High-tech Grid overlay
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // 3. Futuristic Outer Border Frame
  ctx.strokeStyle = data.themeColor || '#00f2fe';
  ctx.lineWidth = 2;
  ctx.strokeRect(30, 30, width - 60, height - 60);

  // Corner Brackets
  const cornerSize = 40;
  ctx.fillStyle = data.themeColor || '#00f2fe';
  // Top-Left
  ctx.fillRect(25, 25, cornerSize, 6);
  ctx.fillRect(25, 25, 6, cornerSize);
  // Top-Right
  ctx.fillRect(width - 25 - cornerSize, 25, cornerSize, 6);
  ctx.fillRect(width - 31, 25, 6, cornerSize);
  // Bottom-Left
  ctx.fillRect(25, height - 31, cornerSize, 6);
  ctx.fillRect(25, height - 25 - cornerSize, 6, cornerSize);
  // Bottom-Right
  ctx.fillRect(width - 25 - cornerSize, height - 31, cornerSize, 6);
  ctx.fillRect(width - 31, height - 25 - cornerSize, 6, cornerSize);

  // 4. Header Section
  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 16px "JetBrains Mono", monospace';
  ctx.letterSpacing = '3px';
  ctx.fillText('AI INTERACTIVE WORLD // SCIENCE EXHIBITION 2026', 60, 75);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 44px "Orbitron", sans-serif';
  ctx.letterSpacing = '2px';
  ctx.fillText(data.experienceTitle.toUpperCase(), 60, 130);

  ctx.fillStyle = data.themeColor || '#00f2fe';
  ctx.font = '700 20px "Space Grotesk", sans-serif';
  ctx.fillText(data.experienceSubtitle, 60, 165);

  // Top Right Session & Explorer Badge
  const explorerName = data.visitorName?.trim() || 'Cadet Alex';
  ctx.textAlign = 'right';
  ctx.fillStyle = '#00ff88';
  ctx.font = 'bold 16px "JetBrains Mono", monospace';
  ctx.fillText(`EXPLORER: ${explorerName.toUpperCase()}`, width - 60, 55);

  ctx.fillStyle = '#64748b';
  ctx.font = '14px "JetBrains Mono", monospace';
  ctx.fillText(`SESSION ID: ${data.sessionId}`, width - 60, 80);
  ctx.fillText(`TIMESTAMP: ${data.dateStr}`, width - 60, 105);
  ctx.fillStyle = data.themeColor || '#00f2fe';
  ctx.font = 'bold 16px "Orbitron", sans-serif';
  ctx.fillText(`[ ${data.badge} ]`, width - 60, 135);
  ctx.textAlign = 'left';

  // 5. Visitor Photo Placement
  const photoX = 60;
  const photoY = 200;
  const photoW = 500;
  const photoH = 500;

  // Photo Frame Backdrop
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(photoX, photoY, photoW, photoH);
  ctx.strokeStyle = data.themeColor;
  ctx.lineWidth = 2;
  ctx.strokeRect(photoX, photoY, photoW, photoH);

  // Load and draw photo
  let photoDrawn = false;
  if (data.visitorPhotoUrl) {
    try {
      const img = new Image();
      let src = resolveAssetUrl(data.visitorPhotoUrl.trim());
      // Only set crossOrigin for external HTTP/HTTPS images, NOT for data: URLs
      if (src.startsWith('http://') || src.startsWith('https://')) {
        img.crossOrigin = 'anonymous';
      }
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = src;
      });
      if (img.width > 0 && img.height > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(photoX, photoY, photoW, photoH);
        ctx.clip();

        // Aspect-ratio cover centering (no squashing)
        const imgAspect = img.width / img.height;
        const targetAspect = photoW / photoH;
        let sx = 0;
        let sy = 0;
        let sw = img.width;
        let sh = img.height;

        if (imgAspect > targetAspect) {
          sw = img.height * targetAspect;
          sx = (img.width - sw) / 2;
        } else {
          sh = img.width / targetAspect;
          sy = (img.height - sh) / 2;
        }

        ctx.drawImage(img, sx, sy, sw, sh, photoX, photoY, photoW, photoH);
        ctx.restore();
        photoDrawn = true;
      }
    } catch (e) {
      console.warn('Failed to draw visitor photo on canvas:', e);
    }
  }

  // Fallback: draw glowing holographic cyber avatar if photo is missing or failed
  if (!photoDrawn) {
    drawSyntheticAvatarFallback(ctx, photoX, photoY, photoW, photoH, data.themeColor || '#00f2fe');
  }

  // Prominent Holographic Nameplate on Top of Photo Frame
  ctx.fillStyle = 'rgba(2, 6, 20, 0.88)';
  ctx.fillRect(photoX + 10, photoY + 10, photoW - 20, 52);
  ctx.strokeStyle = data.themeColor || '#00f2fe';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(photoX + 10, photoY + 10, photoW - 20, 52);

  ctx.fillStyle = '#00ff88';
  ctx.font = 'bold 11px "JetBrains Mono", monospace';
  ctx.fillText('★ OFFICIAL PARTICIPANT CREDENTIAL:', photoX + 22, photoY + 28);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 20px "Orbitron", sans-serif';
  ctx.fillText(explorerName.toUpperCase(), photoX + 22, photoY + 52);

  // Photo Target Crosshairs & HUD elements
  ctx.strokeStyle = 'rgba(0, 242, 254, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(photoX + photoW / 2 - 25, photoY + photoH / 2);
  ctx.lineTo(photoX + photoW / 2 + 25, photoY + photoH / 2);
  ctx.moveTo(photoX + photoW / 2, photoY + photoH / 2 - 25);
  ctx.lineTo(photoX + photoW / 2, photoY + photoH / 2 + 25);
  ctx.stroke();

  // Photo Tag Banner
  ctx.fillStyle = 'rgba(0, 0, 0, 0.82)';
  ctx.fillRect(photoX + 10, photoY + photoH - 45, photoW - 20, 35);
  ctx.fillStyle = '#00f2fe';
  ctx.font = '600 13px "JetBrains Mono", monospace';
  ctx.fillText(`SUBJECT: ${explorerName.toUpperCase()} • BIOMETRIC PROFILE VERIFIED`, photoX + 25, photoY + photoH - 22);

  // 6. Right Column: Performance Stats & Score Box
  const statsX = 600;
  const statsY = 200;
  const statsW = 540;

  // Primary Score Box
  ctx.fillStyle = 'rgba(8, 20, 48, 0.7)';
  ctx.fillRect(statsX, statsY, statsW, 140);
  ctx.strokeStyle = 'rgba(0, 242, 254, 0.3)';
  ctx.lineWidth = 1;
  ctx.strokeRect(statsX, statsY, statsW, 140);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '700 14px "Orbitron", sans-serif';
  ctx.fillText('MISSION COMPOSITE PERFORMANCE', statsX + 25, statsY + 35);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 64px "Orbitron", sans-serif';
  ctx.fillText(`${data.score}`, statsX + 25, statsY + 105);

  ctx.fillStyle = data.themeColor || '#00f2fe';
  ctx.font = '700 22px "Orbitron", sans-serif';
  ctx.fillText('/ 1000 PTS', statsX + 175, statsY + 95);

  // Metrics Grid
  let currY = statsY + 165;
  data.metrics.forEach(m => {
    ctx.fillStyle = 'rgba(8, 16, 36, 0.5)';
    ctx.fillRect(statsX, currY, statsW, 45);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.strokeRect(statsX, currY, statsW, 45);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '500 16px "Space Grotesk", sans-serif';
    ctx.fillText(m.label, statsX + 20, currY + 28);

    ctx.textAlign = 'right';
    ctx.fillStyle = data.themeColor;
    ctx.font = '700 16px "JetBrains Mono", monospace';
    ctx.fillText(String(m.value), statsX + statsW - 20, currY + 28);
    ctx.textAlign = 'left';

    currY += 55;
  });

  // 7. Middle: Achievements Unlocked
  const achY = 740;
  ctx.fillStyle = '#94a3b8';
  ctx.font = '700 18px "Orbitron", sans-serif';
  ctx.fillText('MISSION ACHIEVEMENTS UNLOCKED', 60, achY);

  let achBadgeX = 60;
  data.achievements.forEach(ach => {
    ctx.fillStyle = 'rgba(121, 40, 202, 0.25)';
    ctx.fillRect(achBadgeX, achY + 15, 340, 50);
    ctx.strokeStyle = '#7928ca';
    ctx.lineWidth = 1;
    ctx.strokeRect(achBadgeX, achY + 15, 340, 50);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '600 14px "Space Grotesk", sans-serif';
    ctx.fillText(`★ ${ach}`, achBadgeX + 16, achY + 45);

    achBadgeX += 360;
  });

  // 8. Lower Section: AI Intelligence Assessment
  const aiY = 840;
  const aiBoxW = width - 120;
  const aiBoxH = 170;

  ctx.fillStyle = 'rgba(6, 12, 30, 0.85)';
  ctx.fillRect(60, aiY, aiBoxW, aiBoxH);
  ctx.strokeStyle = 'rgba(0, 242, 254, 0.4)';
  ctx.lineWidth = 1;
  ctx.strokeRect(60, aiY, aiBoxW, aiBoxH);

  ctx.fillStyle = '#00f2fe';
  ctx.font = '700 16px "Orbitron", sans-serif';
  ctx.fillText('◈ AI NEURAL SYSTEM DEDUCTION & COMMENDATION', 85, aiY + 35);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '400 18px "Space Grotesk", sans-serif';
  wrapText(ctx, `"${data.aiAnalysis}"`, 85, aiY + 75, aiBoxW - 50, 28);

  // 9. Footer: Expo Seal & Dynamic QR Code
  const footerY = 1040;

  // QR Code Box
  const qrX = 60;
  const qrY = footerY;
  const qrSize = 160;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(qrX, qrY, qrSize, qrSize);

  try {
    let qrDataUrlToDraw: string = '';

    if (qrCodeUrlOrDataUrl && qrCodeUrlOrDataUrl.startsWith('data:image')) {
      // Pre-generated QR data URL from backend
      qrDataUrlToDraw = qrCodeUrlOrDataUrl;
    } else {
      let qrTargetUrl = qrCodeUrlOrDataUrl;
      if (!qrTargetUrl) {
        const origin = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'http://localhost:5173';
        qrTargetUrl = `${origin}/results/${data.sessionId}?exp=${data.experienceId}&score=${data.score}`;
      }
      qrDataUrlToDraw = await QRCode.toDataURL(qrTargetUrl, {
        margin: 1,
        width: qrSize,
        color: { dark: '#040915', light: '#ffffff' }
      });
    }

    const qrImg = new Image();
    await new Promise<void>((resolve) => {
      imgOnLoad(qrImg, qrDataUrlToDraw, resolve);
    });
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
  } catch (err) {
    console.warn('QR Code generation error:', err);
  }

  // QR Label
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 18px "Orbitron", sans-serif';
  ctx.fillText('SCAN WITH PHONE TO TAKE EXPERIENCE HOME', qrX + qrSize + 30, qrY + 45);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '15px "Space Grotesk", sans-serif';
  ctx.fillText('Instant access to your commemorative high-resolution dossier, achievements, and certificate.', qrX + qrSize + 30, qrY + 75);

  ctx.fillStyle = data.themeColor;
  ctx.font = '13px "JetBrains Mono", monospace';
  ctx.fillText(`AUTHENTICATED BY AI INTERACTIVE CORE // SECURE HASH: #SHA256-${data.sessionId.toUpperCase()}`, qrX + qrSize + 30, qrY + 115);

  // Science Expo Official Stamp (circular emblem)
  drawOfficialExpoStamp(ctx, width - 180, qrY + 80, data.themeColor);

  try {
    return canvas.toDataURL('image/png', 0.95);
  } catch (err) {
    console.warn('Canvas toDataURL PNG export failed, trying JPEG fallback:', err);
    try {
      return canvas.toDataURL('image/jpeg', 0.85);
    } catch (innerErr) {
      console.error('All canvas exports failed:', innerErr);
      return '';
    }
  }
}

function imgOnLoad(img: HTMLImageElement, src: string, resolve: () => void) {
  img.onload = () => resolve();
  img.onerror = () => resolve();
  img.src = src;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ');
  let line = '';
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

function drawOfficialExpoStamp(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.15); // Authentic tilted stamp look

  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 65, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, 58, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.font = 'bold 12px "Orbitron", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SCIENCE EXPO 2026', 0, -28);
  ctx.font = '900 16px "Orbitron", sans-serif';
  ctx.fillText('VERIFIED', 0, 5);
  ctx.font = 'bold 10px "JetBrains Mono", monospace';
  ctx.fillText('AI INTERACTIVE', 0, 28);
  ctx.fillText('★ OFFICIAL ★', 0, 42);

  ctx.restore();
}

function drawSyntheticAvatarFallback(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  // Dark cyber gradient
  const grad = ctx.createLinearGradient(x, y, x, y + h);
  grad.addColorStop(0, '#040d21');
  grad.addColorStop(0.5, '#071838');
  grad.addColorStop(1, '#020612');
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);

  // Holographic grid
  ctx.strokeStyle = 'rgba(0, 242, 254, 0.12)';
  ctx.lineWidth = 1;
  for (let gx = x; gx < x + w; gx += 25) {
    ctx.beginPath();
    ctx.moveTo(gx, y);
    ctx.lineTo(gx, y + h);
    ctx.stroke();
  }
  for (let gy = y; gy < y + h; gy += 25) {
    ctx.beginPath();
    ctx.moveTo(x, gy);
    ctx.lineTo(x + w, gy);
    ctx.stroke();
  }

  // Centered Cyber Avatar Silhouette
  const cx = x + w / 2;
  const cy = y + h / 2 - 10;

  // Pulse rings
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, 90, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(121, 40, 202, 0.6)';
  ctx.beginPath();
  ctx.arc(cx, cy, 115, 0, Math.PI * 2);
  ctx.stroke();

  // Head
  ctx.fillStyle = 'rgba(0, 242, 254, 0.2)';
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(cx, cy - 25, 42, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Visor slit
  ctx.fillStyle = color;
  ctx.fillRect(cx - 28, cy - 30, 56, 8);

  // Shoulders
  ctx.beginPath();
  ctx.moveTo(cx - 75, cy + 65);
  ctx.quadraticCurveTo(cx, cy + 20, cx + 75, cy + 65);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Avatar Banner
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(x + 20, y + h - 45, w - 40, 30);
  ctx.fillStyle = color;
  ctx.font = 'bold 12px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('◈ SYNTHETIC AGENT AVATAR ACTIVE ◈', cx, y + h - 25);

  ctx.restore();
}
