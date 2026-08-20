import type { SocialShareCardData } from '../types';

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
  // 1. ATHLETIC OLED / GRADIENT BACKGROUND
  // ---------------------------------------------------------------------------
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#060911');
  bgGrad.addColorStop(0.5, '#0c1527');
  bgGrad.addColorStop(1, '#05070d');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Background Ambient Glow Orbs
  const glowGrad = ctx.createRadialGradient(width * 0.8, height * 0.2, 50, width * 0.8, height * 0.2, 500);
  glowGrad.addColorStop(0, 'rgba(6, 182, 212, 0.22)');
  glowGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, width, height);

  const glowGrad2 = ctx.createRadialGradient(width * 0.2, height * 0.8, 50, width * 0.2, height * 0.8, 500);
  glowGrad2.addColorStop(0, 'rgba(204, 255, 0, 0.15)');
  glowGrad2.addColorStop(1, 'transparent');
  ctx.fillStyle = glowGrad2;
  ctx.fillRect(0, 0, width, height);

  // ---------------------------------------------------------------------------
  // 2. HEADER BRANDING & STREAK BADGE
  // ---------------------------------------------------------------------------
  const marginX = 80;
  let currentY = format === 'story' ? 140 : 100;

  // App Brand Logo & Title
  ctx.fillStyle = '#CCFF00';
  ctx.font = '800 36px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('⚡ EVERYTHING APP', marginX, currentY);

  // Streak Pill (Right Aligned)
  const streakText = `🔥 ${data.streakDays} DAYS STREAK`;
  ctx.font = '800 28px "Plus Jakarta Sans", sans-serif';
  const streakWidth = ctx.measureText(streakText).width + 50;
  
  // Streak Pill Background
  ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 3;
  drawRoundedRect(ctx, width - marginX - streakWidth, currentY - 35, streakWidth, 48, 24);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#f59e0b';
  ctx.fillText(streakText, width - marginX - streakWidth + 25, currentY);

  // ---------------------------------------------------------------------------
  // 3. WORKOUT TITLE & CATEGORY BADGE
  // ---------------------------------------------------------------------------
  currentY += format === 'story' ? 130 : 90;

  // Category Pill
  ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 2;
  const categoryText = data.workoutType.toUpperCase();
  ctx.font = '800 24px "Plus Jakarta Sans", sans-serif';
  const catWidth = ctx.measureText(categoryText).width + 40;
  drawRoundedRect(ctx, marginX, currentY - 28, catWidth, 40, 20);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#06b6d4';
  ctx.fillText(categoryText, marginX + 20, currentY);

  // Big Bold Workout Title
  currentY += 70;
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 64px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(data.title, marginX, currentY);

  // Date Tag
  currentY += 45;
  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 28px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`📅 ${data.date} · Completed Session`, marginX, currentY);

  // ---------------------------------------------------------------------------
  // 4. STATS HERO GRID CARDS
  // ---------------------------------------------------------------------------
  currentY += format === 'story' ? 80 : 50;

  const cardWidth = (width - marginX * 2 - 40) / 2;
  const cardHeight = format === 'story' ? 180 : 130;

  data.stats.slice(0, 4).forEach((stat, idx) => {
    const row = Math.floor(idx / 2);
    const col = idx % 2;
    const x = marginX + col * (cardWidth + 40);
    const y = currentY + row * (cardHeight + 30);

    // Glass Card Background
    ctx.fillStyle = 'rgba(19, 28, 46, 0.85)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 3;
    drawRoundedRect(ctx, x, y, cardWidth, cardHeight, 24);
    ctx.fill();
    ctx.stroke();

    // Metric Label
    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(stat.label.toUpperCase(), x + 30, y + 45);

    // Metric Value
    ctx.fillStyle = '#CCFF00';
    ctx.font = '900 52px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(stat.value, x + 30, y + 110);

    if (stat.unit) {
      const valWidth = ctx.measureText(stat.value).width;
      ctx.fillStyle = '#06b6d4';
      ctx.font = '800 28px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(` ${stat.unit}`, x + 30 + valWidth, y + 110);
    }
  });

  // ---------------------------------------------------------------------------
  // 5. MOTIVATIONAL QUOTE BANNER
  // ---------------------------------------------------------------------------
  currentY += (cardHeight * 2 + 80) + (format === 'story' ? 60 : 30);

  const quoteBoxHeight = format === 'story' ? 240 : 170;
  ctx.fillStyle = 'rgba(245, 158, 11, 0.08)';
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
  ctx.lineWidth = 3;
  drawRoundedRect(ctx, marginX, currentY, width - marginX * 2, quoteBoxHeight, 24);
  ctx.fill();
  ctx.stroke();

  // Left Accent Bar on Quote Box
  ctx.fillStyle = '#f59e0b';
  drawRoundedRect(ctx, marginX, currentY, 12, quoteBoxHeight, 6);
  ctx.fill();

  // Quote Text (Wrapped)
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'italic 700 32px "Plus Jakarta Sans", sans-serif';
  wrapText(ctx, `"${data.motivationalQuote}"`, marginX + 45, currentY + 65, width - marginX * 2 - 80, 42);

  // Quote Author
  ctx.fillStyle = '#f59e0b';
  ctx.font = '800 26px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`— ${data.quoteAuthor.toUpperCase()}`, marginX + 45, currentY + quoteBoxHeight - 35);

  // ---------------------------------------------------------------------------
  // 6. FOOTER WATERMARK & USER EDITION
  // ---------------------------------------------------------------------------
  if (format === 'story') {
    const footerY = height - 120;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(marginX, footerY - 40, width - marginX * 2, 2);

    ctx.fillStyle = '#64748b';
    ctx.font = '700 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('DISCIPLINE · CONSISTENCY · CALISTHENICS & FOOTBALL', marginX, footerY + 10);

    ctx.fillStyle = '#06b6d4';
    ctx.font = '800 24px "Plus Jakarta Sans", sans-serif';
    const personaLabel = data.persona === 'women' ? 'SHREYA EDITION' : 'SUGHOSH EDITION';
    const pWidth = ctx.measureText(personaLabel).width;
    ctx.fillText(personaLabel, width - marginX - pWidth, footerY + 10);
  }

  return canvas;
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
          text: `Crushed my ${data.title} session! 🔥 ${data.streakDays} Day Streak on Everything App. "${data.motivationalQuote}"`,
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
            `\n\n"${data.motivationalQuote}" — *${data.quoteAuthor}*\n\n_Tracked with Everything App_`
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
