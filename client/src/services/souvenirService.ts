import QRCode from 'qrcode';
import type { SouvenirData, LevelResult } from '../types';
import { resolveAssetUrl } from './apiService';
import { computeCorrelation } from './correlationEngine';

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

  // 7. Middle Section A: 5-Segment Level Scaffolding Strip
  const correlation = data.correlation || computeCorrelation(data.experienceId, data.levelResults, data.score);
  const levels = (data.levelResults && data.levelResults.length === 5) 
    ? data.levelResults 
    : [1, 2, 3, 4, 5].map(i => ({
        level: i,
        label: `Phase ${i}`,
        score: Math.round(data.score * [0.1, 0.15, 0.2, 0.25, 0.3][i-1]),
        maxScore: [100, 150, 200, 250, 300][i-1],
        timeTakenSec: 35 + i * 4,
        timeBudgetSec: [45, 55, 65, 65, 70][i-1],
        completedBeforeTimeout: true
      }));

  const levelStripY = 560;
  ctx.fillStyle = '#94a3b8';
  ctx.font = '700 14px "Orbitron", sans-serif';
  ctx.fillText('5-PHASE OPERATIONAL TELEMETRY (300S STANDARD)', 60, levelStripY);

  const stripBoxW = 206;
  const stripBoxH = 75;
  const stripGap = 12;

  levels.forEach((lvl, idx) => {
    const bx = 60 + idx * (stripBoxW + stripGap);
    const by = levelStripY + 12;

    ctx.fillStyle = lvl.completedBeforeTimeout ? 'rgba(8, 20, 48, 0.8)' : 'rgba(48, 20, 8, 0.8)';
    ctx.fillRect(bx, by, stripBoxW, stripBoxH);
    ctx.strokeStyle = lvl.completedBeforeTimeout ? 'rgba(0, 242, 254, 0.4)' : 'rgba(245, 158, 11, 0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, stripBoxW, stripBoxH);

    ctx.fillStyle = lvl.completedBeforeTimeout ? '#00f2fe' : '#f59e0b';
    ctx.font = '700 12px "JetBrains Mono", monospace';
    ctx.fillText(`PHASE ${lvl.level}: ${lvl.completedBeforeTimeout ? 'PASS' : 'TIME-OUT'}`, bx + 12, by + 24);

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 13px "Space Grotesk", sans-serif';
    const labelSnippet = lvl.label.split(':')[1] || lvl.label;
    ctx.fillText(labelSnippet.length > 18 ? labelSnippet.substring(0, 16) + '…' : labelSnippet, bx + 12, by + 45);

    ctx.fillStyle = '#00ff88';
    ctx.font = '600 12px "JetBrains Mono", monospace';
    ctx.fillText(`+${lvl.score} XP`, bx + 12, by + 65);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`${lvl.timeTakenSec}s/${lvl.timeBudgetSec}s`, bx + stripBoxW - 12, by + 65);
    ctx.textAlign = 'left';
  });

  // 8. Middle Section B: Cross-Level Correlation Panel (Sparkline & Composite Title)
  const corrY = 675;
  const corrW = width - 120;
  const corrH = 175;

  ctx.fillStyle = 'rgba(6, 12, 30, 0.9)';
  ctx.fillRect(60, corrY, corrW, corrH);
  ctx.strokeStyle = 'rgba(0, 242, 254, 0.5)';
  ctx.lineWidth = 1;
  ctx.strokeRect(60, corrY, corrW, corrH);

  // Correlation Header
  ctx.fillStyle = data.themeColor || '#00f2fe';
  ctx.font = '700 15px "Orbitron", sans-serif';
  ctx.fillText(`CROSS-LEVEL CORRELATION // ${correlation.compositeTitle.toUpperCase()}`, 85, corrY + 32);

  // Grade Pill (Top Right of Correlation Box)
  ctx.textAlign = 'right';
  ctx.fillStyle = '#f59e0b';
  ctx.font = '900 24px "Orbitron", sans-serif';
  ctx.fillText(`GRADE: ${correlation.compositeGrade}`, 60 + corrW - 25, corrY + 35);
  ctx.textAlign = 'left';

  // Draw 5-point Sparkline Line & Nodes
  const sparkXStart = 90;
  const sparkWidth = 460;
  const sparkPoints = correlation.sparklinePoints;

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(sparkXStart, corrY + 70); ctx.lineTo(sparkXStart + sparkWidth, corrY + 70);
  ctx.moveTo(sparkXStart, corrY + 120); ctx.lineTo(sparkXStart + sparkWidth, corrY + 120);
  ctx.stroke();

  const coords = sparkPoints.map((val, idx) => {
    const x = sparkXStart + idx * (sparkWidth / 4);
    const y = corrY + 135 - (val * 0.7); // scale into height
    return { x, y, val };
  });

  // Sparkline Stroke
  ctx.strokeStyle = data.themeColor || '#00f2fe';
  ctx.lineWidth = 3;
  ctx.beginPath();
  coords.forEach((c, idx) => {
    if (idx === 0) ctx.moveTo(c.x, c.y);
    else ctx.lineTo(c.x, c.y);
  });
  ctx.stroke();

  // Nodes & Labels
  coords.forEach((c, idx) => {
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.arc(c.x, c.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = data.themeColor || '#00f2fe';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 10px "JetBrains Mono", monospace';
    ctx.fillText(`L${idx + 1}`, c.x - 6, corrY + 155);
  });

  // Right Side Correlation Text: Trend & Consistency Callout
  const calloutX = 600;
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 15px "Space Grotesk", sans-serif';
  ctx.fillText(correlation.trendLabel, calloutX, corrY + 75);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 14px "Space Grotesk", sans-serif';
  ctx.fillText(`CONSISTENCY: ${correlation.consistencyRating}`, calloutX, corrY + 105);

  if (correlation.standoutLevel) {
    ctx.fillStyle = '#00ff88';
    ctx.font = '600 13px "JetBrains Mono", monospace';
    ctx.fillText(`PEAK PHASE: ${correlation.standoutLevel.label} (${correlation.standoutLevel.reason})`, calloutX, corrY + 135);
  }

  // 9. Lower Section: AI Intelligence Assessment
  const aiY = 875;
  const aiBoxW = width - 120;
  const aiBoxH = 150;

  ctx.fillStyle = 'rgba(6, 12, 30, 0.85)';
  ctx.fillRect(60, aiY, aiBoxW, aiBoxH);
  ctx.strokeStyle = 'rgba(0, 242, 254, 0.4)';
  ctx.lineWidth = 1;
  ctx.strokeRect(60, aiY, aiBoxW, aiBoxH);

  ctx.fillStyle = '#00f2fe';
  ctx.font = '700 15px "Orbitron", sans-serif';
  ctx.fillText('◈ AI NEURAL SYSTEM DEDUCTION & COMMENDATION', 85, aiY + 32);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '400 17px "Space Grotesk", sans-serif';
  wrapText(ctx, `"${data.aiAnalysis}"`, 85, aiY + 68, aiBoxW - 50, 26);

  // 10. Footer: Expo Seal & Dynamic QR Code
  const footerY = 1050;

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
  ctx.fillText('Instant access to your commemorative high-resolution dossier, badges, and 3D operative pass.', qrX + qrSize + 30, qrY + 75);

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

/**
 * Generates High-Resolution 300 DPI Front Side of the Operative ID Card
 */
export async function generateCardFrontCanvas(data: SouvenirData, qrCodeUrlOrDataUrl?: string): Promise<string> {
  const canvas = document.createElement('canvas');
  const w = 750;
  const h = 1050;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const themeColor = data.themeColor || '#00f2fe';

  // Background
  const bgGrad = ctx.createLinearGradient(0, 0, w, h);
  bgGrad.addColorStop(0, '#060d20');
  bgGrad.addColorStop(0.5, '#02040a');
  bgGrad.addColorStop(1, '#0b162c');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Outer Neon Card Border
  ctx.strokeStyle = themeColor;
  ctx.lineWidth = 6;
  ctx.strokeRect(16, 16, w - 32, h - 32);

  // Inner Border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(26, 26, w - 52, h - 52);

  // Lanyard Punch Hole Slot
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  const slotW = 120;
  const slotH = 20;
  const slotX = (w - slotW) / 2;
  const slotY = 36;
  ctx.beginPath();
  ctx.roundRect(slotX, slotY, slotW, slotH, 10);
  ctx.fill();
  ctx.stroke();

  // Header Title
  ctx.fillStyle = '#94a3b8';
  ctx.font = '700 13px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('SCIENCE EXPO 2026 // OFFICIAL CREDENTIAL', w / 2, 85);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 24px "Orbitron", sans-serif';
  ctx.fillText('AI INTERACTIVE WORLD', w / 2, 118);

  ctx.fillStyle = themeColor;
  ctx.font = '700 14px "Orbitron", sans-serif';
  ctx.fillText(`OPERATIVE ACCESS PASS // ${data.experienceId.toUpperCase()}`, w / 2, 142);

  // Photo Box
  const photoW = 280;
  const photoH = 340;
  const photoX = 50;
  const photoY = 175;

  ctx.fillStyle = '#020612';
  ctx.fillRect(photoX, photoY, photoW, photoH);
  ctx.strokeStyle = themeColor;
  ctx.lineWidth = 3;
  ctx.strokeRect(photoX, photoY, photoW, photoH);

  let photoRendered = false;
  if (data.visitorPhotoUrl) {
    try {
      const visitorImg = new Image();
      await new Promise<void>((resolve) => {
        imgOnLoad(visitorImg, resolveAssetUrl(data.visitorPhotoUrl), resolve);
      });
      if (visitorImg.width > 0) {
        ctx.drawImage(visitorImg, photoX, photoY, photoW, photoH);
        photoRendered = true;
      }
    } catch {
      // fallback below
    }
  }
  if (!photoRendered) {
    drawSyntheticAvatarFallback(ctx, photoX, photoY, photoW, photoH, themeColor);
  }

  // Identity Data (Right of Photo)
  const infoX = 360;
  let textY = 210;

  ctx.textAlign = 'left';
  ctx.fillStyle = '#94a3b8';
  ctx.font = '700 13px "JetBrains Mono", monospace';
  ctx.fillText('OPERATIVE CADET:', infoX, textY);
  textY += 32;
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 24px "Orbitron", sans-serif';
  ctx.fillText((data.visitorName || 'Cadet Alex').slice(0, 16), infoX, textY);

  textY += 45;
  ctx.fillStyle = '#94a3b8';
  ctx.font = '700 13px "JetBrains Mono", monospace';
  ctx.fillText('CREDENTIAL IDENTIFIER:', infoX, textY);
  textY += 26;
  ctx.fillStyle = themeColor;
  ctx.font = '700 18px "JetBrains Mono", monospace';
  ctx.fillText(`#${data.sessionId}`, infoX, textY);

  textY += 45;
  ctx.fillStyle = '#94a3b8';
  ctx.font = '700 13px "JetBrains Mono", monospace';
  ctx.fillText('OPERATIONAL RANK:', infoX, textY);
  textY += 26;
  ctx.fillStyle = '#00ff88';
  ctx.font = '900 18px "Orbitron", sans-serif';
  ctx.fillText(data.badge || 'EXPEDITION VANGUARD', infoX, textY);

  textY += 45;
  ctx.fillStyle = '#94a3b8';
  ctx.font = '700 13px "JetBrains Mono", monospace';
  ctx.fillText('EXPEDITION SCORE:', infoX, textY);
  textY += 30;
  ctx.fillStyle = '#38bdf8';
  ctx.font = '900 28px "Orbitron", sans-serif';
  ctx.fillText(`${data.score} PTS`, infoX, textY);

  // Middle Badge Bar
  const badgeBarY = 545;
  ctx.fillStyle = 'rgba(8, 16, 36, 0.9)';
  ctx.fillRect(50, badgeBarY, w - 100, 95);
  ctx.strokeStyle = 'rgba(0, 242, 254, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(50, badgeBarY, w - 100, 95);

  ctx.fillStyle = '#f59e0b';
  ctx.font = '900 26px "Orbitron", sans-serif';
  ctx.fillText('★', 75, badgeBarY + 58);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 18px "Orbitron", sans-serif';
  ctx.fillText(`OFFICIAL BADGE: ${data.badge || 'MISSION SPECIALIST'}`, 115, badgeBarY + 42);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '13px "Space Grotesk", sans-serif';
  ctx.fillText('Verified accreditation by Science Exhibition 2026 AI Assessment Council.', 115, badgeBarY + 68);

  // Bottom Section: QR Code & Security Hologram Chip
  const btmY = 670;

  // QR Code
  const qrSize = 160;
  const qrX = 50;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(qrX, btmY, qrSize, qrSize);

  try {
    let qrDataUrl = qrCodeUrlOrDataUrl;
    if (!qrDataUrl) {
      const origin = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'http://localhost:5173';
      const qrTargetUrl = `${origin}/results/${data.sessionId}?exp=${data.experienceId}&score=${data.score}`;
      qrDataUrl = await QRCode.toDataURL(qrTargetUrl, { margin: 1, width: qrSize });
    }
    const qrImg = new Image();
    await new Promise<void>((resolve) => imgOnLoad(qrImg, qrDataUrl || '', resolve));
    ctx.drawImage(qrImg, qrX, btmY, qrSize, qrSize);
  } catch (err) {
    console.warn('Card front QR error:', err);
  }

  // QR Explainer
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 16px "Orbitron", sans-serif';
  ctx.fillText('SMARTPHONE PASSPORT', qrX + qrSize + 25, btmY + 40);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '14px "Space Grotesk", sans-serif';
  ctx.fillText('Scan to take your official badges, operative pass,', qrX + qrSize + 25, btmY + 70);
  ctx.fillText('and telemetry report directly onto your phone.', qrX + qrSize + 25, btmY + 95);

  ctx.fillStyle = themeColor;
  ctx.font = '12px "JetBrains Mono", monospace';
  ctx.fillText(`AUTHENTICATED BY AI CORE // #${data.sessionId}`, qrX + qrSize + 25, btmY + 130);

  // Security Microchip
  const chipX = w - 155;
  const chipY = btmY + 40;
  const chipW = 100;
  const chipH = 80;
  const chipGrad = ctx.createLinearGradient(chipX, chipY, chipX + chipW, chipY + chipH);
  chipGrad.addColorStop(0, '#fde68a');
  chipGrad.addColorStop(0.5, '#f59e0b');
  chipGrad.addColorStop(1, '#b45309');
  ctx.fillStyle = chipGrad;
  ctx.beginPath();
  ctx.roundRect(chipX, chipY, chipW, chipH, 8);
  ctx.fill();
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Footer Tagline
  ctx.textAlign = 'center';
  ctx.fillStyle = '#64748b';
  ctx.font = '700 11px "JetBrains Mono", monospace';
  ctx.fillText('AI INTERACTIVE WORLD • SCIENCE EXHIBITION 2026 • CARD FRONT', w / 2, h - 30);

  return canvas.toDataURL('image/png', 0.95);
}

/**
 * Generates High-Resolution 300 DPI Back Side of the Operative ID Card
 */
export async function generateCardBackCanvas(data: SouvenirData): Promise<string> {
  const canvas = document.createElement('canvas');
  const w = 750;
  const h = 1050;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const themeColor = data.themeColor || '#00f2fe';

  // Background
  const bgGrad = ctx.createLinearGradient(0, 0, w, h);
  bgGrad.addColorStop(0, '#040916');
  bgGrad.addColorStop(0.5, '#02040a');
  bgGrad.addColorStop(1, '#081228');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Outer Neon Card Border
  ctx.strokeStyle = themeColor;
  ctx.lineWidth = 6;
  ctx.strokeRect(16, 16, w - 32, h - 32);

  // Inner Border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(26, 26, w - 52, h - 52);

  // Lanyard Punch Hole Slot
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  const slotW = 120;
  const slotH = 20;
  const slotX = (w - slotW) / 2;
  const slotY = 36;
  ctx.beginPath();
  ctx.roundRect(slotX, slotY, slotW, slotH, 10);
  ctx.fill();
  ctx.stroke();

  // Back Header Title
  ctx.fillStyle = '#94a3b8';
  ctx.font = '700 13px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('OPERATIONAL TELEMETRY & ASSESSMENT // CARD BACK', w / 2, 85);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 24px "Orbitron", sans-serif';
  ctx.fillText('5-PHASE MISSION TELEMETRY', w / 2, 118);

  // Behavioral Archetype Box
  const archY = 145;
  ctx.fillStyle = 'rgba(8, 20, 48, 0.85)';
  ctx.fillRect(50, archY, w - 100, 115);
  ctx.strokeStyle = 'rgba(0, 242, 254, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(50, archY, w - 100, 115);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#94a3b8';
  ctx.font = '700 12px "JetBrains Mono", monospace';
  ctx.fillText('COMPOSITE BEHAVIORAL ARCHETYPE:', 75, archY + 30);

  ctx.fillStyle = '#f59e0b';
  ctx.font = '900 20px "Orbitron", sans-serif';
  ctx.fillText(data.correlation?.compositeArchetype || data.correlation?.compositeTitle || 'Tactical Precision Analyst', 75, archY + 62);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '13px "Space Grotesk", sans-serif';
  ctx.fillText(`Performance Grade: ${data.correlation?.compositeGrade || 'S+'} • Synchrony: ${data.correlation?.consistencyRating || 'Flawless'}`, 75, archY + 92);

  // 5-Phase Level Telemetry Grid
  const gridY = 285;
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 16px "Orbitron", sans-serif';
  ctx.fillText('5-PHASE PROGRESSION MATRIX (300S STANDARD):', 50, gridY);

  const levels = (data.levelResults && data.levelResults.length === 5)
    ? data.levelResults
    : [1, 2, 3, 4, 5].map(i => ({
        level: i,
        label: `Phase ${i}`,
        score: Math.round(data.score * [0.1, 0.15, 0.2, 0.25, 0.3][i-1]),
        maxScore: [100, 150, 200, 250, 300][i-1],
        timeTakenSec: 35 + i * 4,
        timeBudgetSec: [45, 55, 65, 65, 70][i-1],
        completedBeforeTimeout: true
      }));

  const boxW = 120;
  const boxH = 140;
  const gap = 12;

  levels.forEach((lvl, idx) => {
    const bx = 50 + idx * (boxW + gap);
    const by = gridY + 15;

    ctx.fillStyle = 'rgba(8, 20, 48, 0.85)';
    ctx.fillRect(bx, by, boxW, boxH);
    ctx.strokeStyle = lvl.completedBeforeTimeout ? '#00f2fe' : '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bx, by, boxW, boxH);

    ctx.fillStyle = '#00f2fe';
    ctx.font = '900 13px "Orbitron", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`PHASE ${lvl.level}`, bx + boxW / 2, by + 28);

    ctx.fillStyle = '#10b981';
    ctx.font = '900 24px "Orbitron", sans-serif';
    ctx.fillText('✓', bx + boxW / 2, by + 68);

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 15px "Orbitron", sans-serif';
    ctx.fillText(`${lvl.score}p`, bx + boxW / 2, by + 100);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillText(`${lvl.timeTakenSec}s / ${lvl.timeBudgetSec}s`, bx + boxW / 2, by + 124);
  });

  // AI Neural System Deduction Box
  const aiY = 475;
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(8, 20, 48, 0.85)';
  ctx.fillRect(50, aiY, w - 100, 175);
  ctx.strokeStyle = 'rgba(0, 242, 254, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(50, aiY, w - 100, 175);

  ctx.fillStyle = '#00f2fe';
  ctx.font = '700 15px "Orbitron", sans-serif';
  ctx.fillText('◈ AI NEURAL SYSTEM DEDUCTION & COMMENDATION', 75, aiY + 34);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '400 16px "Space Grotesk", sans-serif';
  wrapText(ctx, `"${data.aiAnalysis || 'Exemplary mission execution. The operative demonstrated rapid sensor comprehension and intuitive strategic adaptations across all five operational phases.'}"`, 75, aiY + 70, w - 150, 26);

  // Security Verification Seal
  const sealY = 685;
  drawOfficialExpoStamp(ctx, w / 2, sealY + 75, themeColor);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 14px "Orbitron", sans-serif';
  ctx.fillText('OFFICIAL VALIDATION SEAL // SCIENCE EXHIBITION 2026', w / 2, sealY + 175);

  ctx.fillStyle = themeColor;
  ctx.font = '12px "JetBrains Mono", monospace';
  ctx.fillText(`SHA-256 HASH VERIFIED: #8A4F-E029-C7B1-${data.sessionId.toUpperCase()}`, w / 2, sealY + 200);

  // Footer Tagline
  ctx.fillStyle = '#64748b';
  ctx.font = '700 11px "JetBrains Mono", monospace';
  ctx.fillText('AI INTERACTIVE WORLD • SCIENCE EXHIBITION 2026 • CARD BACK', w / 2, h - 30);

  return canvas.toDataURL('image/png', 0.95);
}

/**
 * Generates Dual-Sided Printable Lanyard Badge Sheet (Front & Back Side-by-Side with Cut Lines)
 */
export async function generateDualCardPrintCanvas(data: SouvenirData, qrCodeUrlOrDataUrl?: string): Promise<string> {
  const canvas = document.createElement('canvas');
  // 1650 x 1200 sheet (Landscape 300 DPI layout)
  const w = 1650;
  const h = 1200;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // White Clean Print Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);

  // Print Header Banner
  ctx.fillStyle = '#0f172a';
  ctx.font = '900 26px "Orbitron", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('AI INTERACTIVE WORLD // SCIENCE EXHIBITION 2026 OPERATIVE LANYARD BADGE', w / 2, 45);

  ctx.fillStyle = '#475569';
  ctx.font = '600 13px "Space Grotesk", sans-serif';
  ctx.fillText('PRINTING INSTRUCTIONS: Cut along the outer solid border, fold along the dashed centerline, and insert into standard exhibition badge lanyard holder.', w / 2, 70);

  // Generate both Front and Back card canvases
  const frontDataUrl = await generateCardFrontCanvas(data, qrCodeUrlOrDataUrl);
  const backDataUrl = await generateCardBackCanvas(data);

  const cardW = 710;
  const cardH = 995;
  const cardY = 95;

  const frontX = 85;
  const backX = 855;

  // Draw Front Card
  if (frontDataUrl) {
    const frontImg = new Image();
    await new Promise<void>((resolve) => imgOnLoad(frontImg, frontDataUrl, resolve));
    ctx.drawImage(frontImg, frontX, cardY, cardW, cardH);
  }

  // Draw Back Card
  if (backDataUrl) {
    const backImg = new Image();
    await new Promise<void>((resolve) => imgOnLoad(backImg, backDataUrl, resolve));
    ctx.drawImage(backImg, backX, cardY, cardW, cardH);
  }

  // Center Dashed Fold Line
  const centerX = (frontX + cardW + backX) / 2;
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(centerX, cardY);
  ctx.lineTo(centerX, cardY + cardH);
  ctx.stroke();
  ctx.setLineDash([]);

  // Scissors Icon Label
  ctx.fillStyle = '#475569';
  ctx.font = '700 12px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('✂ FOLD CENTERLINE ✂', centerX, cardY - 8);

  // Outer Cut Guides
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;
  ctx.strokeRect(frontX - 4, cardY - 4, cardW * 2 + (backX - (frontX + cardW)) + 8, cardH + 8);

  // Footer
  ctx.fillStyle = '#64748b';
  ctx.font = '11px "JetBrains Mono", monospace';
  ctx.fillText(`SESSION ID: ${data.sessionId} • OPERATIVE: ${data.visitorName} • PORTAL: ${data.experienceId.toUpperCase()} • 2-SIDED FOLDABLE BADGE`, w / 2, h - 20);

  return canvas.toDataURL('image/png', 0.95);
}

