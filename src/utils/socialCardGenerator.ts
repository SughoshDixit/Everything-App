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
  const theme = data.backgroundTheme || 'cyber_neon';

  if (theme === 'custom_image' && data.customMediaUrl) {
    try {
      const customImg = await loadImage(data.customMediaUrl);
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
      const scrim = ctx.createLinearGradient(0, 0, 0, height);
      scrim.addColorStop(0, 'rgba(0, 0, 0, 0.75)');
      scrim.addColorStop(0.4, 'rgba(9, 13, 22, 0.85)');
      scrim.addColorStop(1, 'rgba(5, 7, 13, 0.95)');
      ctx.fillStyle = scrim;
      ctx.fillRect(0, 0, width, height);
    } catch {
      // Fallback to cyber_neon if image load fails
      drawPresetBackground(ctx, width, height, 'cyber_neon');
    }
  } else {
    drawPresetBackground(ctx, width, height, theme);
  }

  // ---------------------------------------------------------------------------
  // 2. HEADER BRANDING & STREAK BADGE
  // ---------------------------------------------------------------------------
  const marginX = 75;
  let currentY = format === 'story' ? 130 : 90;

  // App Brand Logo & Title
  ctx.fillStyle = '#CCFF00';
  ctx.font = '800 36px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('⚡ EVERYTHING APP', marginX, currentY);

  // Streak Pill (Right Aligned)
  const streakText = `🔥 ${data.streakDays} DAYS STREAK`;
  ctx.font = '800 26px "Plus Jakarta Sans", sans-serif';
  const streakWidth = ctx.measureText(streakText).width + 44;

  ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 3;
  drawRoundedRect(ctx, width - marginX - streakWidth, currentY - 32, streakWidth, 44, 22);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#f59e0b';
  ctx.fillText(streakText, width - marginX - streakWidth + 22, currentY);

  // ---------------------------------------------------------------------------
  // 3. WORKOUT TITLE & DATE
  // ---------------------------------------------------------------------------
  currentY += format === 'story' ? 110 : 80;

  // Category Pill
  ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 2;
  const categoryText = data.workoutType.toUpperCase();
  ctx.font = '800 22px "Plus Jakarta Sans", sans-serif';
  const catWidth = ctx.measureText(categoryText).width + 36;
  drawRoundedRect(ctx, marginX, currentY - 26, catWidth, 36, 18);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#06b6d4';
  ctx.fillText(categoryText, marginX + 18, currentY);

  // Big Bold Workout Title
  currentY += 65;
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 58px "Plus Jakarta Sans", sans-serif';
  wrapText(ctx, data.title, marginX, currentY, width - marginX * 2, 64);
  
  // Advance based on title length
  const titleLines = Math.ceil(ctx.measureText(data.title).width / (width - marginX * 2));
  currentY += (titleLines - 1) * 60 + 40;

  // Date Tag
  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 26px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`📅 ${data.date} · Completed Activity`, marginX, currentY);

  // ---------------------------------------------------------------------------
  // 4. STATS HERO GRID CARDS
  // ---------------------------------------------------------------------------
  currentY += format === 'story' ? 65 : 45;

  const cardWidth = (width - marginX * 2 - 30) / 2;
  const cardHeight = format === 'story' ? 150 : 110;

  data.stats.slice(0, 4).forEach((stat, idx) => {
    const row = Math.floor(idx / 2);
    const col = idx % 2;
    const x = marginX + col * (cardWidth + 30);
    const y = currentY + row * (cardHeight + 20);

    // Glass Card Background
    ctx.fillStyle = 'rgba(19, 28, 46, 0.85)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
    ctx.lineWidth = 2.5;
    drawRoundedRect(ctx, x, y, cardWidth, cardHeight, 20);
    ctx.fill();
    ctx.stroke();

    // Metric Label
    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(stat.label.toUpperCase(), x + 24, y + 38);

    // Metric Value
    ctx.fillStyle = '#CCFF00';
    ctx.font = '900 44px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(stat.value, x + 24, y + 95);

    if (stat.unit) {
      const valWidth = ctx.measureText(stat.value).width;
      ctx.fillStyle = '#06b6d4';
      ctx.font = '800 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(` ${stat.unit}`, x + 24 + valWidth, y + 95);
    }
  });

  currentY += (cardHeight * 2 + 40);

  // ---------------------------------------------------------------------------
  // 5. MULTI-ACTIVITY WORKOUT BREAKDOWN (IF PRESENT)
  // ---------------------------------------------------------------------------
  if (data.activityItems && data.activityItems.length > 0 && format === 'story') {
    currentY += 25;
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '800 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('📋 WORKOUT BREAKDOWN', marginX, currentY);

    currentY += 20;
    data.activityItems.slice(0, 3).forEach((item) => {
      const itemBoxH = 75;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 2;
      drawRoundedRect(ctx, marginX, currentY, width - marginX * 2, itemBoxH, 16);
      ctx.fill();
      ctx.stroke();

      // Title & sets/reps
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`${item.icon || '⚡'} ${item.title}`, marginX + 24, currentY + 34);

      ctx.fillStyle = '#06b6d4';
      ctx.font = '700 20px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(item.details, marginX + 24, currentY + 62);

      currentY += itemBoxH + 12;
    });
  }

  // ---------------------------------------------------------------------------
  // 6. MOTIVATIONAL QUOTE BANNER
  // ---------------------------------------------------------------------------
  currentY += format === 'story' ? 25 : 20;

  const quoteBoxHeight = format === 'story' ? 200 : 150;
  ctx.fillStyle = 'rgba(245, 158, 11, 0.09)';
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
  ctx.lineWidth = 2.5;
  drawRoundedRect(ctx, marginX, currentY, width - marginX * 2, quoteBoxHeight, 20);
  ctx.fill();
  ctx.stroke();

  // Left Accent Bar on Quote Box
  ctx.fillStyle = '#f59e0b';
  drawRoundedRect(ctx, marginX, currentY, 10, quoteBoxHeight, 5);
  ctx.fill();

  // Quote Text (Wrapped)
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'italic 700 28px "Plus Jakarta Sans", sans-serif';
  wrapText(ctx, `"${data.motivationalQuote}"`, marginX + 36, currentY + 55, width - marginX * 2 - 65, 36);

  // Quote Author
  ctx.fillStyle = '#f59e0b';
  ctx.font = '800 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`— ${data.quoteAuthor.toUpperCase()}`, marginX + 36, currentY + quoteBoxHeight - 25);

  // ---------------------------------------------------------------------------
  // 7. FOOTER WATERMARK: "Made with Love on The Everything App"
  // ---------------------------------------------------------------------------
  const footerY = height - (format === 'story' ? 100 : 60);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.fillRect(marginX, footerY - 30, width - marginX * 2, 2);

  // Bottom-Left Watermark
  ctx.fillStyle = '#f43f5e';
  ctx.font = '800 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('❤️', marginX, footerY + 12);

  ctx.fillStyle = '#f8fafc';
  ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Made with Love on The Everything App', marginX + 36, footerY + 10);

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

/**
 * Exports Canvas as a downloadable PNG image.
 */
export async function downloadSocialCardImage(
  data: SocialShareCardData,
  format: 'story' | 'square' = 'story'
): Promise<void> {
  const canvas = await generateSocialCardCanvas(data, format);
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `Workout_${data.title.replace(/\s+/g, '_')}_${Date.now()}.png`;
  link.href = dataUrl;
  link.click();
}

/**
 * Shares workout card using Web Share API (native WhatsApp/Instagram share dialog).
 */
export async function shareSocialCardNative(
  data: SocialShareCardData,
  format: 'story' | 'square' = 'story'
): Promise<boolean> {
  try {
    const canvas = await generateSocialCardCanvas(data, format);
    
    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          resolve(false);
          return;
        }

        const file = new File([blob], `Workout_${Date.now()}.png`, { type: 'image/png' });
        const shareData: ShareData = {
          title: `${data.title} Workout Complete! ⚡`,
          text: `Crushed my ${data.title} session! 🔥 ${data.streakDays} Day Streak on Everything App. "${data.motivationalQuote}" — Made with Love on The Everything App ❤️`,
          files: [file]
        };

        if (navigator.canShare && navigator.canShare(shareData)) {
          await navigator.share(shareData);
          resolve(true);
        } else {
          // Fallback: direct WhatsApp share text link
          const shareText = encodeURIComponent(
            `⚡ *Workout Crushed: ${data.title}*\n` +
            `🔥 *${data.streakDays} Day Streak*\n` +
            data.stats.map((s) => `• ${s.label}: *${s.value}${s.unit ? ' ' + s.unit : ''}*`).join('\n') +
            (data.activityItems && data.activityItems.length > 0 ? `\n\n*Workouts Done:*\n` + data.activityItems.map((i) => `• ${i.title}: ${i.details}`).join('\n') : '') +
            `\n\n"${data.motivationalQuote}" — *${data.quoteAuthor}*\n\n_❤️ Made with Love on The Everything App_`
          );
          window.open(`https://api.whatsapp.com/send?text=${shareText}`, '_blank');
          resolve(true);
        }
      }, 'image/png');
    });
  } catch {
    return false;
  }
}
