import type { SocialShareCardData } from '../types';

/**
 * Loads an image from URL or Data URL asynchronously.
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * Generates an HD Canvas Workout Poster / Story Card for Instagram, WhatsApp, and Social Media.
 */
export async function generateSocialCardCanvas(
  data: SocialShareCardData,
  format: 'story' | 'square' = 'story'
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  const width = 1080;
  const height = format === 'story' ? 1920 : 1080;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get Canvas context');

  // ---------------------------------------------------------------------------
  // 1. MESMERIZING BACKGROUND THEME OR CUSTOM USER PHOTO
  // ---------------------------------------------------------------------------
  // ---------------------------------------------------------------------------
  // 1. BACKGROUND: MULTI-PHOTO USER UPLOAD OR ATHLETIC PRESET
  // ---------------------------------------------------------------------------
  const theme = data.backgroundTheme || 'cyber_neon';
  const customPhotoSrc = (data.photos && data.photos.length > 0 && data.selectedPhotoIndex !== undefined && data.photos[data.selectedPhotoIndex])
    ? data.photos[data.selectedPhotoIndex]
    : (data.photos && data.photos.length > 0 ? data.photos[0] : data.customMediaUrl);

  if ((theme === 'custom_image' || customPhotoSrc) && customPhotoSrc) {
    try {
      const customImg = await loadImage(customPhotoSrc);
      // Draw image cover-fit
      const imgRatio = customImg.width / customImg.height;
      const canvasRatio = width / height;
      let drawW = width;
      let drawH = height;
      let offX = 0;
      let offY = 0;

      if (imgRatio > canvasRatio) {
        drawW = height * imgRatio;
        offX = (width - drawW) / 2;
      } else {
        drawH = width / imgRatio;
        offY = (height - drawH) / 2;
      }

      ctx.drawImage(customImg, offX, offY, drawW, drawH);

      // Darkened athletic gradient scrim overlay for crystal-clear readability
      const intensity = typeof data.scrimIntensity === 'number' ? data.scrimIntensity : 0.65;
      const topAlpha = Math.max(0.25, intensity * 0.85);
      const midAlpha = Math.max(0.4, intensity);
      const bottomAlpha = Math.min(0.98, intensity * 1.25);

      const scrim = ctx.createLinearGradient(0, 0, 0, height);
      scrim.addColorStop(0, `rgba(10, 10, 15, ${topAlpha})`);
      scrim.addColorStop(0.35, `rgba(15, 18, 26, ${midAlpha})`);
      scrim.addColorStop(1, `rgba(5, 7, 13, ${bottomAlpha})`);
      ctx.fillStyle = scrim;
      ctx.fillRect(0, 0, width, height);
    } catch {
      drawPresetBackground(ctx, width, height, 'strava_sunset');
    }
  } else {
    drawPresetBackground(ctx, width, height, theme);
  }

  // ---------------------------------------------------------------------------
  // 1.5 GPS ROUTE POLYLINE OVERLAY (STRAVA SIGNATURE FEATURE)
  // ---------------------------------------------------------------------------
  if (data.showRouteOverlay && data.routePoints && data.routePoints.length > 1) {
    drawGpsRouteOverlay(ctx, data.routePoints, width, height, format);
  }

  // ---------------------------------------------------------------------------
  // 2. HEADER BRANDING & STREAK BADGE
  // ---------------------------------------------------------------------------
  const marginX = 75;
  let currentY = format === 'story' ? 130 : 90;
  const template = data.templateStyle || 'strava_classic';

  // App Brand Logo & Title
  const brandColor = template === 'strava_classic' ? '#FC4C02' : template === 'minimal' ? '#FFFFFF' : '#CCFF00';
  ctx.fillStyle = brandColor;
  ctx.font = '800 36px "Montserrat", sans-serif';
  ctx.fillText('⚡ EVERYTHING APP', marginX, currentY);

  // Streak Pill (Right Aligned)
  const streakText = `🔥 ${data.streakDays} DAYS STREAK`;
  ctx.font = '800 24px "Montserrat", sans-serif';
  const streakWidth = ctx.measureText(streakText).width + 44;

  ctx.fillStyle = 'rgba(255, 215, 0, 0.18)';
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 2.5;
  drawRoundedRect(ctx, width - marginX - streakWidth, currentY - 32, streakWidth, 44, 22);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FFD700';
  ctx.fillText(streakText, width - marginX - streakWidth + 22, currentY);

  // ---------------------------------------------------------------------------
  // 3. WORKOUT TITLE & DATE
  // ---------------------------------------------------------------------------
  currentY += format === 'story' ? 100 : 75;

  // Category Pill
  const pillBg = template === 'strava_classic' ? 'rgba(252, 76, 2, 0.25)' : 'rgba(85, 25, 139, 0.35)';
  const pillBorder = template === 'strava_classic' ? '#FC4C02' : '#55198B';
  ctx.fillStyle = pillBg;
  ctx.strokeStyle = pillBorder;
  ctx.lineWidth = 2;
  const categoryText = data.workoutType.toUpperCase();
  ctx.font = '800 22px "Montserrat", sans-serif';
  const catWidth = ctx.measureText(categoryText).width + 36;
  drawRoundedRect(ctx, marginX, currentY - 26, catWidth, 36, 18);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(categoryText, marginX + 18, currentY);

  // Big Bold Workout Title
  currentY += 65;
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 56px "Montserrat", sans-serif';
  wrapText(ctx, data.title, marginX, currentY, width - marginX * 2, 64);
  
  // Advance based on title length
  const titleLines = Math.ceil(ctx.measureText(data.title).width / (width - marginX * 2));
  currentY += (titleLines - 1) * 60 + 38;

  // Date Tag
  ctx.fillStyle = '#adb5bd';
  ctx.font = '600 24px "Montserrat", sans-serif';
  ctx.fillText(`📅 ${data.date} · Completed Activity`, marginX, currentY);

  // ---------------------------------------------------------------------------
  // 4. STATS HERO GRID CARDS
  // ---------------------------------------------------------------------------
  currentY += format === 'story' ? 60 : 40;

  const cardWidth = (width - marginX * 2 - 30) / 2;
  const cardHeight = format === 'story' ? 145 : 105;

  data.stats.slice(0, 4).forEach((stat, idx) => {
    const row = Math.floor(idx / 2);
    const col = idx % 2;
    const x = marginX + col * (cardWidth + 30);
    const y = currentY + row * (cardHeight + 20);

    // Glass Card Background
    ctx.fillStyle = template === 'minimal' ? 'rgba(0, 0, 0, 0.65)' : 'rgba(26, 26, 26, 0.85)';
    ctx.strokeStyle = template === 'strava_classic' && idx === 0 ? '#FC4C02' : 'rgba(255, 255, 255, 0.16)';
    ctx.lineWidth = 2.5;
    drawRoundedRect(ctx, x, y, cardWidth, cardHeight, 18);
    ctx.fill();
    ctx.stroke();

    // Metric Label
    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 20px "Montserrat", sans-serif';
    ctx.fillText(stat.label.toUpperCase(), x + 24, y + 36);

    // Metric Value
    ctx.fillStyle = template === 'strava_classic' ? '#FFFFFF' : '#CCFF00';
    ctx.font = '900 44px "Montserrat", sans-serif';
    ctx.fillText(stat.value, x + 24, y + 92);

    if (stat.unit) {
      const valWidth = ctx.measureText(stat.value).width;
      ctx.fillStyle = template === 'strava_classic' ? '#FC4C02' : '#007ACC';
      ctx.font = '800 24px "Montserrat", sans-serif';
      ctx.fillText(` ${stat.unit}`, x + 24 + valWidth, y + 92);
    }
  });

  currentY += (cardHeight * 2 + 35);

  // ---------------------------------------------------------------------------
  // 5. MULTI-ACTIVITY WORKOUT BREAKDOWN (IF PRESENT)
  // ---------------------------------------------------------------------------
  if (data.activityItems && data.activityItems.length > 0 && format === 'story') {
    currentY += 20;
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '800 22px "Montserrat", sans-serif';
    ctx.fillText('📋 WORKOUT BREAKDOWN', marginX, currentY);

    currentY += 18;
    data.activityItems.slice(0, 4).forEach((item, idx) => {
      const itemBoxH = 78;
      const lowerTitle = item.title.toLowerCase();
      const isRide = lowerTitle.includes('ride') || lowerTitle.includes('cycle') || item.icon?.includes('🚴');
      const isRun = lowerTitle.includes('run') || item.icon?.includes('🏃');
      const isWalk = lowerTitle.includes('walk') || item.icon?.includes('🚶');

      const stageColor = isRide ? '#FC4C02' : isRun ? '#06b6d4' : isWalk ? '#10b981' : '#a855f7';
      const stageBorder = isRide ? 'rgba(252, 76, 2, 0.35)' : isRun ? 'rgba(6, 182, 212, 0.35)' : isWalk ? 'rgba(16, 185, 129, 0.35)' : 'rgba(168, 85, 247, 0.35)';

      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.strokeStyle = stageBorder;
      ctx.lineWidth = 2;
      drawRoundedRect(ctx, marginX, currentY, width - marginX * 2, itemBoxH, 16);
      ctx.fill();
      ctx.stroke();

      // Left Accent Color Bar
      ctx.fillStyle = stageColor;
      drawRoundedRect(ctx, marginX, currentY, 6, itemBoxH, 3);
      ctx.fill();

      // Stage Number & Icon Badge
      ctx.fillStyle = stageColor;
      ctx.font = '800 13px "Montserrat", sans-serif';
      ctx.fillText(`STAGE ${idx + 1}`, marginX + 20, currentY + 24);

      // Title
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 22px "Montserrat", sans-serif';
      ctx.fillText(item.title, marginX + 90, currentY + 24);

      // Details / Pace / Time
      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 17px "Montserrat", sans-serif';
      ctx.fillText(`⏱️ ${item.details}`, marginX + 20, currentY + 56);

      currentY += itemBoxH + 12;
    });
  }

  // ---------------------------------------------------------------------------
  // 6. MOTIVATIONAL QUOTE BANNER
  // ---------------------------------------------------------------------------
  currentY += format === 'story' ? 20 : 15;

  const quoteBoxHeight = format === 'story' ? 180 : 135;
  ctx.fillStyle = 'rgba(255, 215, 0, 0.08)';
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.35)';
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, marginX, currentY, width - marginX * 2, quoteBoxHeight, 18);
  ctx.fill();
  ctx.stroke();

  // Left Accent Bar on Quote Box
  ctx.fillStyle = '#FFD700';
  drawRoundedRect(ctx, marginX, currentY, 8, quoteBoxHeight, 4);
  ctx.fill();

  // Quote Text (Wrapped)
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'italic 700 26px "Montserrat", sans-serif';
  wrapText(ctx, `"${data.motivationalQuote}"`, marginX + 32, currentY + 48, width - marginX * 2 - 60, 34);

  // Quote Author
  ctx.fillStyle = '#FFD700';
  ctx.font = '800 20px "Montserrat", sans-serif';
  ctx.fillText(`— ${data.quoteAuthor.toUpperCase()}`, marginX + 32, currentY + quoteBoxHeight - 20);

  // ---------------------------------------------------------------------------
  // 7. FOOTER WATERMARK: "Made with an intention of doing Kuchh Bhii by Sughosh"
  // ---------------------------------------------------------------------------
  const footerY = height - (format === 'story' ? 90 : 55);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.fillRect(marginX, footerY - 25, width - marginX * 2, 2);

  // Bottom-Left Watermark
  ctx.fillStyle = '#f43f5e';
  ctx.font = '800 24px "Montserrat", sans-serif';
  ctx.fillText('⚡', marginX, footerY + 12);

  ctx.fillStyle = '#f8fafc';
  ctx.font = '700 20px "Montserrat", sans-serif';
  ctx.fillText('Made with an intention of doing Kuchh Bhii by Sughosh 😉', marginX + 36, footerY + 10);

  // Bottom-Right Persona Edition
  ctx.fillStyle = '#06b6d4';
  ctx.font = '800 22px "Plus Jakarta Sans", sans-serif';
  const personaLabel = data.persona === 'women' ? 'SHREYA EDITION' : 'SUGHOSH EDITION';
  const pWidth = ctx.measureText(personaLabel).width;
  ctx.fillText(personaLabel, width - marginX - pWidth, footerY + 10);

  return canvas;
}

/**
 * Draws preset background gradients and atmospheric glowing orbs.
 */
function drawPresetBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  theme: string
) {
  if (theme === 'strava_sunset') {
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#1A002C');
    bgGrad.addColorStop(0.4, '#4A0E4E');
    bgGrad.addColorStop(0.7, '#D32F2F');
    bgGrad.addColorStop(1, '#FF6D00');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Sunset sun glow
    const sunGrad = ctx.createRadialGradient(width * 0.5, height * 0.85, 30, width * 0.5, height * 0.85, 450);
    sunGrad.addColorStop(0, 'rgba(255, 214, 0, 0.35)');
    sunGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = sunGrad;
    ctx.fillRect(0, 0, width, height);
  } else if (theme === 'electric_aurora') {
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#031926');
    bgGrad.addColorStop(0.5, '#0B3954');
    bgGrad.addColorStop(1, '#087E8B');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Emerald aurora wave
    const auroraGrad = ctx.createRadialGradient(width * 0.2, height * 0.3, 50, width * 0.2, height * 0.3, 600);
    auroraGrad.addColorStop(0, 'rgba(0, 245, 160, 0.25)');
    auroraGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = auroraGrad;
    ctx.fillRect(0, 0, width, height);
  } else if (theme === 'monochrome_titanium') {
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#1E293B');
    bgGrad.addColorStop(0.5, '#0F172A');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);
  } else {
    // Default: cyber_neon (OLED athletic dark with lime/cyan orbs)
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#060911');
    bgGrad.addColorStop(0.5, '#0c1527');
    bgGrad.addColorStop(1, '#05070d');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Cyan glow orb
    const glowGrad = ctx.createRadialGradient(width * 0.8, height * 0.2, 50, width * 0.8, height * 0.2, 500);
    glowGrad.addColorStop(0, 'rgba(6, 182, 212, 0.25)');
    glowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, width, height);

    // Lime glow orb
    const glowGrad2 = ctx.createRadialGradient(width * 0.2, height * 0.75, 50, width * 0.2, height * 0.75, 500);
    glowGrad2.addColorStop(0, 'rgba(204, 255, 0, 0.2)');
    glowGrad2.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGrad2;
    ctx.fillRect(0, 0, width, height);
  }
}

/**
 * Draws the GPS track route polyline directly onto the canvas poster.
 */
function drawGpsRouteOverlay(
  ctx: CanvasRenderingContext2D,
  points: { latitude: number; longitude: number }[],
  canvasWidth: number,
  canvasHeight: number,
  format: 'story' | 'square'
) {
  if (points.length < 2) return;

  let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
  points.forEach((p) => {
    if (p.latitude < minLat) minLat = p.latitude;
    if (p.latitude > maxLat) maxLat = p.latitude;
    if (p.longitude < minLng) minLng = p.longitude;
    if (p.longitude > maxLng) maxLng = p.longitude;
  });

  const latSpan = maxLat - minLat || 0.001;
  const lngSpan = maxLng - minLng || 0.001;

  const boxW = canvasWidth * 0.75;
  const boxH = format === 'story' ? canvasHeight * 0.26 : canvasHeight * 0.22;
  const boxX = (canvasWidth - boxW) / 2;
  const boxY = format === 'story' ? 440 : 330;

  const toCanvasX = (lng: number) => boxX + ((lng - minLng) / lngSpan) * boxW;
  const toCanvasY = (lat: number) => boxY + boxH - ((lat - minLat) / latSpan) * boxH;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Outer glow
  ctx.strokeStyle = 'rgba(252, 76, 2, 0.45)';
  ctx.lineWidth = 14;
  ctx.beginPath();
  points.forEach((p, idx) => {
    const x = toCanvasX(p.longitude);
    const y = toCanvasY(p.latitude);
    if (idx === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Core line
  ctx.strokeStyle = '#FC4C02';
  ctx.lineWidth = 6;
  ctx.stroke();

  // Start marker (Green)
  const startP = points[0];
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.arc(toCanvasX(startP.longitude), toCanvasY(startP.latitude), 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Finish marker (Orange-Red)
  const endP = points[points.length - 1];
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(toCanvasX(endP.longitude), toCanvasY(endP.latitude), 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.restore();
}

/**
 * Utility to draw smooth rounded rectangles on Canvas.
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Utility to wrap multi-line text cleanly on Canvas.
 */
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

declare global {
  interface Window {
    AndroidBridge?: {
      downloadBase64File: (base64Data: string, fileName: string, mimeType: string) => boolean;
      shareBase64Media: (base64Data: string, fileName: string, mimeType: string, title: string, text: string) => boolean;
    };
  }
}

/**
 * Exports Canvas as a downloadable PNG image.
 */
export async function downloadSocialCardImage(
  data: SocialShareCardData,
  format: 'story' | 'square' = 'story'
): Promise<void> {
  const canvas = await generateSocialCardCanvas(data, format);
  const dataUrl = canvas.toDataURL('image/png');
  const fileName = `Workout_${data.title.replace(/\s+/g, '_')}_${Date.now()}.png`;

  // 1. If AndroidBridge is available in WebView app, save directly to Android Gallery / Pictures
  if (window.AndroidBridge && typeof window.AndroidBridge.downloadBase64File === 'function') {
    const success = window.AndroidBridge.downloadBase64File(dataUrl, fileName, 'image/png');
    if (success) return;
  }

  // 2. Standard Web Browser download fallback
  const link = document.createElement('a');
  link.download = fileName;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Shares workout card using Web Share API or native AndroidBridge share dialog.
 */
export async function shareSocialCardNative(
  data: SocialShareCardData,
  format: 'story' | 'square' = 'story'
): Promise<boolean> {
  try {
    const canvas = await generateSocialCardCanvas(data, format);
    const dataUrl = canvas.toDataURL('image/png');
    const fileName = `Workout_${data.title.replace(/\s+/g, '_')}_${Date.now()}.png`;
    const shareTitle = `${data.title} Workout Complete! ⚡`;
    const shareText = `Crushed my ${data.title} session! 🔥 ${data.streakDays} Day Streak on Everything App.\n"${data.motivationalQuote}" — ${data.quoteAuthor}\n\n❤️ Made with Love on The Everything App`;

    // 1. If inside Android native WebView bridge, trigger direct Android Intent Chooser
    if (window.AndroidBridge && typeof window.AndroidBridge.shareBase64Media === 'function') {
      const ok = window.AndroidBridge.shareBase64Media(dataUrl, fileName, 'image/png', shareTitle, shareText);
      if (ok) return true;
    }

    // 2. Try Web Share API with File
    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          resolve(false);
          return;
        }

        const file = new File([blob], fileName, { type: 'image/png' });
        const shareData: ShareData = {
          title: shareTitle,
          text: shareText,
          files: [file]
        };

        if (navigator.canShare && navigator.canShare(shareData)) {
          try {
            await navigator.share(shareData);
            resolve(true);
            return;
          } catch {
            // User dismissed or failed
          }
        }

        // 3. Fallback: direct WhatsApp share text link
        const whatsappText = encodeURIComponent(
          `⚡ *Workout Crushed: ${data.title}*\n` +
          `🔥 *${data.streakDays} Day Streak*\n` +
          data.stats.map((s) => `• ${s.label}: *${s.value}${s.unit ? ' ' + s.unit : ''}*`).join('\n') +
          (data.activityItems && data.activityItems.length > 0 ? `\n\n*Workouts Done:*\n` + data.activityItems.map((i) => `• ${i.title}: ${i.details}`).join('\n') : '') +
          `\n\n"${data.motivationalQuote}" — *${data.quoteAuthor}*\n\n_❤️ Made with Love on The Everything App_`
        );
        window.open(`https://api.whatsapp.com/send?text=${whatsappText}`, '_blank');
        resolve(true);
      }, 'image/png');
    });
  } catch {
    return false;
  }
}
