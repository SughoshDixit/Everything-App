import type { Workout, GpsLocationPoint } from '../types';
import { drawAnimatedAthleteMarker } from './googleMapsRenderer';
import { createAspectRatioProjector } from './routeGeometryGenerator';
import { calculateHaversineKm } from './gpsFilter';

export interface VideoExportOptions {
  resolution?: '4k' | '1080p' | '720p';
  durationSec?: number; // 15s (Instagram Reels default), 30s, or 60s
  quote?: string;
  photoUrl?: string;
  scrimOpacity?: number; // 0 to 1
  mapTheme?: 'satellite' | 'dark' | 'mesh';
  mapOpacity?: number; // 0 to 1
  instagramReelReady?: boolean; // includes clean stereo audio carrier for Instagram music overlay
  onProgress?: (percent: number) => void;
}

export class ActivityExportService {
  /**
   * Renders a 9:16 high-definition poster to an offscreen canvas and saves it to Android Gallery / Downloads.
   */
  public static async downloadPoster(
    workout: Workout,
    routePoints: GpsLocationPoint[],
    athleteName: string = 'Sughosh Dixit'
  ): Promise<string> {
    const width = 1080;
    const height = 1920;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable');

    // 1. Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#0a0e17');
    bgGrad.addColorStop(0.5, '#101726');
    bgGrad.addColorStop(1, '#070a0f');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Dot Matrix Overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    const dotSpacing = 40;
    for (let x = 20; x < width; x += dotSpacing) {
      for (let y = 20; y < height; y += dotSpacing) {
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 3. Top Branding Header
    ctx.fillStyle = '#CCFF00';
    ctx.font = '900 48px "Montserrat", sans-serif';
    ctx.fillText('kuchh bhii.', 70, 110);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 24px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(workout.date.toUpperCase(), width - 70, 105);
    ctx.textAlign = 'left';

    // 4. Activity Title Box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(70, 160, width - 140, 240, 28);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '800 24px monospace';
    ctx.fillText(`${workout.sport.toUpperCase()} • ${workout.location.toUpperCase()}`, 110, 215);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 54px "Montserrat", sans-serif';
    const titleSnippet = workout.title.length > 28 ? workout.title.substring(0, 26) + '...' : workout.title;
    ctx.fillText(titleSnippet, 110, 285);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 24px "Montserrat", sans-serif';
    ctx.fillText(`Logged by ${athleteName} • Verified Athlete Telemetry`, 110, 345);

    // 5. Draw Route Path on Canvas (Aspect-Ratio Preserved)
    if (routePoints.length >= 2) {
      const mapAreaX = 100;
      const mapAreaY = 460;
      const mapAreaW = width - 200;
      const mapAreaH = 680;

      const { project } = createAspectRatioProjector(
        routePoints,
        { x: mapAreaX, y: mapAreaY, width: mapAreaW, height: mapAreaH },
        40
      );

      // Subtle Map Grid Box
      ctx.fillStyle = 'rgba(18, 24, 38, 0.6)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.roundRect(mapAreaX - 30, mapAreaY - 30, mapAreaW + 60, mapAreaH + 60, 32);
      ctx.fill();
      ctx.stroke();

      // Route Glow
      ctx.strokeStyle = workout.color || '#fc4c02';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = workout.color || '#fc4c02';
      ctx.shadowBlur = 25;
      ctx.beginPath();
      routePoints.forEach((p, idx) => {
        const [x, y] = project(p.latitude, p.longitude);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Sharp Core Route
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      routePoints.forEach((p, idx) => {
        const [x, y] = project(p.latitude, p.longitude);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Start Marker (Green)
      const [startX, startY] = project(routePoints[0].latitude, routePoints[0].longitude);
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(startX, startY, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Finish Marker (Checkered / Orange)
      const endPoint = routePoints[routePoints.length - 1];
      const [endX, endY] = project(endPoint.latitude, endPoint.longitude);
      ctx.fillStyle = '#fc4c02';
      ctx.beginPath();
      ctx.arc(endX, endY, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // 6. Primary Metric Blocks (The Big 3)
    const statBoxY = 1220;
    const statBoxW = (width - 140 - 40) / 3;

    // Stat 1: Distance / Reps
    ctx.fillStyle = '#121824';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.roundRect(70, statBoxY, statBoxW, 200, 24);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '800 20px monospace';
    ctx.fillText('DISTANCE', 95, statBoxY + 50);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 52px "Montserrat", sans-serif';
    ctx.fillText(workout.distance, 95, statBoxY + 125);
    ctx.fillStyle = '#CCFF00';
    ctx.font = '700 24px "Montserrat", sans-serif';
    ctx.fillText(workout.sport === 'Calisthenics' ? 'reps' : 'km', 95, statBoxY + 165);

    // Stat 2: Moving Time
    ctx.fillStyle = '#121824';
    ctx.beginPath();
    ctx.roundRect(70 + statBoxW + 20, statBoxY, statBoxW, 200, 24);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '800 20px monospace';
    ctx.fillText('TIME', 70 + statBoxW + 45, statBoxY + 50);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 52px "Montserrat", sans-serif';
    ctx.fillText(workout.time, 70 + statBoxW + 45, statBoxY + 125);
    ctx.fillStyle = '#38bdf8';
    ctx.font = '700 24px "Montserrat", sans-serif';
    ctx.fillText('moving', 70 + statBoxW + 45, statBoxY + 165);

    // Stat 3: Pace / Speed
    ctx.fillStyle = '#121824';
    ctx.beginPath();
    ctx.roundRect(70 + (statBoxW + 20) * 2, statBoxY, statBoxW, 200, 24);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '800 20px monospace';
    ctx.fillText(workout.sport === 'Running' ? 'PACE' : 'SPEED', 70 + (statBoxW + 20) * 2 + 25, statBoxY + 50);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 52px "Montserrat", sans-serif';
    ctx.fillText(workout.pace, 70 + (statBoxW + 20) * 2 + 25, statBoxY + 125);
    ctx.fillStyle = '#ff8952';
    ctx.font = '700 24px "Montserrat", sans-serif';
    ctx.fillText(workout.sport === 'Running' ? '/km' : 'km/h', 70 + (statBoxW + 20) * 2 + 25, statBoxY + 165);

    // 7. Motivational Bottom Quote Box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.strokeStyle = 'rgba(204, 255, 0, 0.3)';
    ctx.beginPath();
    ctx.roundRect(70, 1460, width - 140, 240, 28);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#CCFF00';
    ctx.fillRect(70, 1460, 10, 240);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'italic 700 32px "Montserrat", sans-serif';
    ctx.fillText('"Discipline equals freedom."', 115, 1540);

    ctx.fillStyle = '#FFD700';
    ctx.font = '800 24px "Montserrat", sans-serif';
    ctx.fillText('— JOCKO WILLINK / COMMANDER IRON', 115, 1600);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 20px monospace';
    ctx.fillText('⚡ 4K Athletic Poster Engine • Everything App', 115, 1655);

    // 8. Export via AndroidBridge or Web
    const base64 = canvas.toDataURL('image/png', 0.98);
    const fileName = `poster_${workout.sport.toLowerCase()}_${Date.now()}.png`;

    if (window.AndroidBridge && typeof window.AndroidBridge.downloadBase64File === 'function') {
      window.AndroidBridge.downloadBase64File(base64, fileName, 'image/png');
      return 'Saved to Android Gallery / Pictures! 🖼️';
    }

    const a = document.createElement('a');
    a.href = base64;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return 'Poster downloaded successfully! 🖼️';
  }

  /**
   * Generates a 9:16 vertical animated replay video clip in Full HD 1080p (or 4K) at 60 FPS.
   * Includes a silent stereo audio carrier track so Instagram Reels/Stories can seamlessly
   * apply trending music overlays without format or audio-mixer errors.
   */
  public static async downloadVideo(
    workout: Workout,
    routePoints: GpsLocationPoint[],
    athleteName: string = 'Sughosh Dixit',
    optionsOrProgress?: VideoExportOptions | ((percent: number) => void)
  ): Promise<string> {
    const options: VideoExportOptions = typeof optionsOrProgress === 'function'
      ? { onProgress: optionsOrProgress }
      : (optionsOrProgress || {});

    const resolution = options.resolution || '1080p';
    const is4k = resolution === '4k';
    const width = is4k ? 2160 : resolution === '720p' ? 720 : 1080;
    const height = is4k ? 3840 : resolution === '720p' ? 1280 : 1920;
    const scale = width / 1080;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable');

    if (typeof MediaRecorder === 'undefined' || !HTMLCanvasElement.prototype.captureStream) {
      // Graceful fallback to high-res poster
      return this.downloadPoster(workout, routePoints, athleteName);
    }

    // Precompute cumulative geodetic Haversine distances to guarantee monotonic, non-jittery odometer
    const cumDists: number[] = new Array(routePoints.length).fill(0);
    for (let i = 1; i < routePoints.length; i++) {
      cumDists[i] = cumDists[i - 1] + calculateHaversineKm(
        routePoints[i - 1].latitude,
        routePoints[i - 1].longitude,
        routePoints[i].latitude,
        routePoints[i].longitude
      );
    }
    const finalCalculatedDist = cumDists[cumDists.length - 1] || parseFloat(workout.distance) || 5.24;

    // Parse workout duration to seconds for live elapsed clock
    let totalSecs = 1452; // fallback 24:12
    if (workout.time) {
      const parts = workout.time.split(':').map(Number);
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        totalSecs = parts[0] * 60 + parts[1];
      } else if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
        totalSecs = parts[0] * 3600 + parts[1] * 60 + parts[2];
      }
    }

    // 60 FPS high-bitrate video stream
    const canvasStream = canvas.captureStream(60);

    // Instagram Music Overlay Compatibility:
    // When Instagram Reels encounters a video without an audio track, it treats it as a muted loop
    // and frequently disables or errors on the Music Sticker. We inject a clean silent stereo carrier
    // track using Web Audio API so Instagram detects valid audio and enables the music library.
    let combinedStream: MediaStream = canvasStream;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.00001, audioCtx.currentTime); // virtually silent
        const dest = audioCtx.createMediaStreamDestination();
        osc.connect(gain);
        gain.connect(dest);
        osc.start();
        const silentTrack = dest.stream.getAudioTracks()[0];
        if (silentTrack) {
          combinedStream = new MediaStream([...canvasStream.getVideoTracks(), silentTrack]);
        }
      }
    } catch (audioErr) {
      console.warn('Silent audio carrier creation skipped:', audioErr);
    }

    // Determine highest supported MIME container
    const mimeCandidates = [
      'video/mp4;codecs=avc1,mp4a.40.2',
      'video/mp4',
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm'
    ];
    let selectedMime = 'video/webm';
    for (const cand of mimeCandidates) {
      if (MediaRecorder.isTypeSupported(cand)) {
        selectedMime = cand;
        break;
      }
    }

    const isMp4 = selectedMime.includes('mp4');
    const targetBitrate = is4k ? 32000000 : resolution === '720p' ? 8000000 : 18000000;

    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(combinedStream, {
        mimeType: selectedMime,
        videoBitsPerSecond: targetBitrate,
        audioBitsPerSecond: 192000
      });
    } catch {
      recorder = new MediaRecorder(combinedStream, {
        videoBitsPerSecond: 12000000
      });
    }

    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    const durationSec = options.durationSec || 15;
    const durationMs = durationSec * 1000;
    const startTime = performance.now();
    const onProgress = options.onProgress;

    // Optional user quote
    const quoteText = options.quote || '"Discipline equals freedom."';

    return new Promise((resolve, reject) => {
      recorder.onstop = () => {
        const fileExt = isMp4 ? 'mp4' : 'webm';
        const fileType = isMp4 ? 'video/mp4' : 'video/webm';
        const blob = new Blob(chunks, { type: fileType });
        const reader = new FileReader();

        reader.onloadend = () => {
          const base64 = reader.result as string;
          const fileName = `trail_${workout.sport.toLowerCase()}_${resolution}_${Date.now()}.${fileExt}`;

          if (window.AndroidBridge && typeof window.AndroidBridge.downloadBase64File === 'function') {
            window.AndroidBridge.downloadBase64File(base64, fileName, fileType);
            resolve(`Saved ${resolution.toUpperCase()} Reel-Ready video to Android Movies! 🎬`);
          } else {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            resolve(`Reel-Ready ${resolution.toUpperCase()} 60FPS video exported successfully! 🎬`);
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      };

      recorder.start();

      const animateFrame = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(1.0, elapsed / durationMs);

        if (onProgress) {
          onProgress(Math.round(progress * 100));
        }

        // 1. Background
        const bgGrad = ctx.createLinearGradient(0, 0, width, height);
        bgGrad.addColorStop(0, '#060a12');
        bgGrad.addColorStop(0.5, '#0b111e');
        bgGrad.addColorStop(1, '#05070c');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // 2. High-precision Subtle Grid Matrix
        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        const dotGap = Math.round(40 * scale);
        for (let x = 20 * scale; x < width; x += dotGap) {
          for (let y = 20 * scale; y < height; y += dotGap) {
            ctx.beginPath();
            ctx.arc(x, y, 1.5 * scale, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // 3. Top Header: Branding + Live GPS Telemetry Pulse
        ctx.fillStyle = '#CCFF00';
        ctx.font = `900 ${Math.round(44 * scale)}px "Montserrat", sans-serif`;
        ctx.fillText('kuchh bhii.', 60 * scale, 95 * scale);

        // Reel-Ready Audio indicator badge
        ctx.fillStyle = 'rgba(204, 255, 0, 0.15)';
        ctx.strokeStyle = '#CCFF00';
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.roundRect(width - 320 * scale, 58 * scale, 260 * scale, 48 * scale, 24 * scale);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#CCFF00';
        ctx.font = `800 ${Math.round(18 * scale)}px monospace`;
        ctx.fillText('🎵 REEL-READY AUDIO', width - 298 * scale, 89 * scale);

        // 4. Activity Title & Category Sub-header
        ctx.fillStyle = '#94a3b8';
        ctx.font = `700 ${Math.round(20 * scale)}px monospace`;
        ctx.fillText(`${workout.sport.toUpperCase()} • ${workout.location.toUpperCase()}`, 60 * scale, 138 * scale);

        // 5. Draw Animated Progressive Route with Dual-Stroke Neon Glow
        if (routePoints.length >= 2) {
          const mapAreaX = 60 * scale;
          const mapAreaY = 175 * scale;
          const mapAreaW = width - 120 * scale;
          const mapAreaH = height - 760 * scale;

          const { project } = createAspectRatioProjector(
            routePoints,
            { x: mapAreaX, y: mapAreaY, width: mapAreaW, height: mapAreaH },
            50 * scale
          );

          // Subtle Map Container Frame
          ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.lineWidth = 2 * scale;
          ctx.beginPath();
          ctx.roundRect(mapAreaX - 20 * scale, mapAreaY - 20 * scale, mapAreaW + 40 * scale, mapAreaH + 40 * scale, 32 * scale);
          ctx.fill();
          ctx.stroke();

          // Full Ghost Track (Uncompleted path in faint dashed stroke)
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
          ctx.lineWidth = 3 * scale;
          ctx.setLineDash([8 * scale, 8 * scale]);
          ctx.beginPath();
          routePoints.forEach((p, idx) => {
            const [x, y] = project(p.latitude, p.longitude);
            if (idx === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.stroke();
          ctx.setLineDash([]);

          // Progressive Route Slice
          const pointsCount = Math.max(2, Math.floor(routePoints.length * progress));
          const currentSlice = routePoints.slice(0, pointsCount);

          const themeColor = workout.color || '#FC5200';

          // Outer Neon Bloom
          ctx.save();
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.shadowColor = themeColor;
          ctx.shadowBlur = 28 * scale;
          ctx.strokeStyle = `${themeColor}88`;
          ctx.lineWidth = 18 * scale;
          ctx.beginPath();
          currentSlice.forEach((p, idx) => {
            const [x, y] = project(p.latitude, p.longitude);
            if (idx === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.stroke();

          // Inner Vibrant Stroke
          ctx.shadowBlur = 8 * scale;
          ctx.strokeStyle = themeColor;
          ctx.lineWidth = 8 * scale;
          ctx.beginPath();
          currentSlice.forEach((p, idx) => {
            const [x, y] = project(p.latitude, p.longitude);
            if (idx === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.stroke();

          // Ultra-Crisp White Razor Core
          ctx.shadowBlur = 0;
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2.5 * scale;
          ctx.beginPath();
          currentSlice.forEach((p, idx) => {
            const [x, y] = project(p.latitude, p.longitude);
            if (idx === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.stroke();
          ctx.restore();

          // Start Point Pin (Green)
          const [startX, startY] = project(routePoints[0].latitude, routePoints[0].longitude);
          ctx.fillStyle = '#10B981';
          ctx.beginPath();
          ctx.arc(startX, startY, 11 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 3 * scale;
          ctx.stroke();

          // Moving Athlete Marker
          const activePt = currentSlice[currentSlice.length - 1];
          const prevPt = currentSlice[Math.max(0, currentSlice.length - 2)];
          const [curX, curY] = project(activePt.latitude, activePt.longitude);
          const [prevX, prevY] = project(prevPt.latitude, prevPt.longitude);

          let headingRad = 0;
          const dx = curX - prevX;
          const dy = curY - prevY;
          if (Math.abs(dx) > 0.001 || Math.abs(dy) > 0.001) {
            headingRad = Math.atan2(dx, -dy);
          }

          drawAnimatedAthleteMarker(ctx, {
            x: curX,
            y: curY,
            headingRad,
            scale: scale * 1.5,
            accentColor: themeColor,
            activityType: workout.sport.toLowerCase(),
            elapsedMs: elapsed,
            showRadar: true,
            showHeadingBeam: true,
          });
        }

        // 6. Primary Live Telemetry Card (Glassmorphic)
        const hudY = height - 540 * scale;
        const hudH = 340 * scale;
        const hudW = width - 120 * scale;
        const hudX = 60 * scale;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.roundRect(hudX, hudY, hudW, hudH, 28 * scale);
        ctx.fill();
        ctx.stroke();

        // Left Accent neon bar
        ctx.fillStyle = workout.color || '#FC5200';
        ctx.beginPath();
        ctx.roundRect(hudX, hudY, 10 * scale, hudH, 5 * scale);
        ctx.fill();

        // Activity Title inside HUD
        ctx.fillStyle = '#ffffff';
        ctx.font = `900 ${Math.round(36 * scale)}px "Montserrat", sans-serif`;
        const titleText = workout.title.length > 26 ? workout.title.substring(0, 24) + '...' : workout.title;
        ctx.fillText(titleText, hudX + 36 * scale, hudY + 56 * scale);

        // Precise Odometer Distance (True cumulative geodetic Haversine)
        const activeIdx = Math.min(routePoints.length - 1, Math.floor(progress * (routePoints.length - 1)));
        const liveDistNum = routePoints.length > 0 ? cumDists[activeIdx] : (progress * finalCalculatedDist);
        const liveDistStr = liveDistNum.toFixed(2);

        // Odometer Box with Tabular Numerals
        ctx.fillStyle = '#94a3b8';
        ctx.font = `800 ${Math.round(18 * scale)}px monospace`;
        ctx.fillText('LIVE DISTANCE', hudX + 36 * scale, hudY + 104 * scale);

        ctx.fillStyle = '#ffffff';
        ctx.font = `900 ${Math.round(58 * scale)}px monospace`;
        // Tabular slot rendering to prevent character jumping
        const distStartX = hudX + 36 * scale;
        const charStep = 36 * scale;
        for (let c = 0; c < liveDistStr.length; c++) {
          ctx.fillText(liveDistStr[c], distStartX + c * charStep, hudY + 172 * scale);
        }

        ctx.fillStyle = '#CCFF00';
        ctx.font = `800 ${Math.round(26 * scale)}px "Montserrat", sans-serif`;
        ctx.fillText(workout.sport === 'Calisthenics' ? 'REPS' : 'KM', distStartX + (liveDistStr.length * charStep) + 12 * scale, hudY + 170 * scale);

        // Secondary Metrics: Dynamic Elapsed Time & Pace
        const curSecs = Math.floor(progress * totalSecs);
        const curMinStr = Math.floor(curSecs / 60).toString().padStart(2, '0');
        const curSecStr = (curSecs % 60).toString().padStart(2, '0');
        const liveTime = `${curMinStr}:${curSecStr}`;

        const subMetricsY = hudY + 230 * scale;
        ctx.fillStyle = '#94a3b8';
        ctx.font = `800 ${Math.round(16 * scale)}px monospace`;
        ctx.fillText('MOVING TIME', hudX + 36 * scale, subMetricsY);
        ctx.fillText('AVG PACE', hudX + 340 * scale, subMetricsY);
        ctx.fillText('ELEVATION', hudX + 640 * scale, subMetricsY);

        ctx.fillStyle = '#38bdf8';
        ctx.font = `900 ${Math.round(32 * scale)}px monospace`;
        ctx.fillText(liveTime, hudX + 36 * scale, subMetricsY + 40 * scale);

        ctx.fillStyle = '#ff8952';
        ctx.fillText(workout.pace, hudX + 340 * scale, subMetricsY + 40 * scale);

        ctx.fillStyle = '#10b981';
        const curElev = routePoints[activeIdx]?.altitude ? Math.round(routePoints[activeIdx].altitude!) : 185;
        ctx.fillText(`+${curElev}m`, hudX + 640 * scale, subMetricsY + 40 * scale);

        // 7. Motivational Bottom Quote Box
        const quoteY = height - 165 * scale;
        const quoteH = 115 * scale;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.strokeStyle = 'rgba(204, 255, 0, 0.3)';
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.roundRect(60 * scale, quoteY, width - 120 * scale, quoteH, 20 * scale);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#CCFF00';
        ctx.fillRect(60 * scale, quoteY, 6 * scale, quoteH);

        ctx.fillStyle = '#f8fafc';
        ctx.font = `italic 700 ${Math.round(20 * scale)}px "Montserrat", sans-serif`;
        const displayQuote = quoteText.length > 55 ? quoteText.substring(0, 52) + '...' : quoteText;
        ctx.fillText(displayQuote, 85 * scale, quoteY + 45 * scale);

        ctx.fillStyle = '#94a3b8';
        ctx.font = `600 ${Math.round(15 * scale)}px monospace`;
        ctx.fillText(`⚡ Logged by ${athleteName} • Made with intention doing Kuchh Bhii 😉`, 85 * scale, quoteY + 85 * scale);

        // 8. Bottom Neon Scrub Progress Bar
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fillRect(0, height - 12 * scale, width, 12 * scale);
        ctx.fillStyle = '#CCFF00';
        ctx.fillRect(0, height - 12 * scale, width * progress, 12 * scale);

        if (elapsed < durationMs) {
          requestAnimationFrame(animateFrame);
        } else {
          recorder.stop();
        }
      };

      requestAnimationFrame(animateFrame);
    });
  }
}
