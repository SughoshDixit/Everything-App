import type { Workout, GpsLocationPoint } from '../types';
import { drawAnimatedAthleteMarker } from './googleMapsRenderer';

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

    // 5. Draw Route Path on Canvas
    if (routePoints.length >= 2) {
      const lats = routePoints.map((p) => p.latitude);
      const lngs = routePoints.map((p) => p.longitude);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);

      const mapAreaX = 100;
      const mapAreaY = 460;
      const mapAreaW = width - 200;
      const mapAreaH = 680;

      const deltaLat = maxLat - minLat || 0.001;
      const deltaLng = maxLng - minLng || 0.001;

      const project = (lat: number, lng: number) => {
        const px = mapAreaX + ((lng - minLng) / deltaLng) * mapAreaW;
        const py = mapAreaY + mapAreaH - ((lat - minLat) / deltaLat) * mapAreaH;
        return [px, py] as [number, number];
      };

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
   * Generates a 9:16 vertical animated replay video clip and saves directly to Movies.
   */
  public static async downloadVideo(
    workout: Workout,
    routePoints: GpsLocationPoint[],
    athleteName: string = 'Sughosh Dixit',
    onProgress?: (percent: number) => void
  ): Promise<string> {
    const width = 720;
    const height = 1280;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable');

    if (typeof MediaRecorder === 'undefined' || !HTMLCanvasElement.prototype.captureStream) {
      // Graceful fallback to high-res poster
      return this.downloadPoster(workout, routePoints, athleteName);
    }

    const stream = canvas.captureStream(30);
    const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm';

    const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 6000000 });
    const chunks: Blob[] = [];

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    const durationMs = 5000;
    const startTime = performance.now();

    return new Promise((resolve, reject) => {
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          const fileName = `video_${workout.sport.toLowerCase()}_${Date.now()}.webm`;

          if (window.AndroidBridge && typeof window.AndroidBridge.downloadBase64File === 'function') {
            window.AndroidBridge.downloadBase64File(base64, fileName, 'video/webm');
            resolve('9:16 Video saved to Android Gallery / Movies! 🎬');
          } else {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            resolve('Video replay exported successfully! 🎬');
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

        // Draw Frame
        ctx.fillStyle = '#080c14';
        ctx.fillRect(0, 0, width, height);

        // Header
        ctx.fillStyle = '#CCFF00';
        ctx.font = '900 32px "Montserrat", sans-serif';
        ctx.fillText('kuchh bhii.', 40, 70);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '700 16px monospace';
        ctx.fillText(`${workout.sport.toUpperCase()} • ${workout.location}`, 40, 110);

        // Draw animated progressive route
        if (routePoints.length >= 2) {
          const lats = routePoints.map((p) => p.latitude);
          const lngs = routePoints.map((p) => p.longitude);
          const minLat = Math.min(...lats);
          const maxLat = Math.max(...lats);
          const minLng = Math.min(...lngs);
          const maxLng = Math.max(...lngs);

          const deltaLat = maxLat - minLat || 0.001;
          const deltaLng = maxLng - minLng || 0.001;

          const project = (lat: number, lng: number) => {
            const px = 60 + ((lng - minLng) / deltaLng) * (width - 120);
            const py = 180 + (height - 480) - ((lat - minLat) / deltaLat) * (height - 480);
            return [px, py] as [number, number];
          };

          const pointsCount = Math.max(2, Math.floor(routePoints.length * progress));
          const currentSlice = routePoints.slice(0, pointsCount);

          // Route Path
          ctx.strokeStyle = workout.color || '#fc4c02';
          ctx.lineWidth = 8;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();
          currentSlice.forEach((p, idx) => {
            const [x, y] = project(p.latitude, p.longitude);
            if (idx === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.stroke();

          // Active Athlete Runner Icon & Animation (Cadence Stride Bounce + Directional Beam)
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
            scale: 1.6,
            accentColor: workout.color || '#CCFF00',
            activityType: workout.sport.toLowerCase(),
            elapsedMs: elapsed,
            showRadar: true,
            showHeadingBeam: true,
          });
        }

        // Bottom Telemetry HUD
        ctx.fillStyle = 'rgba(18, 24, 38, 0.9)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(40, height - 220, width - 80, 160, 20);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 36px "Montserrat", sans-serif';
        ctx.fillText(workout.title, 65, height - 160);

        ctx.fillStyle = '#CCFF00';
        ctx.font = '800 24px monospace';
        ctx.fillText(`${workout.distance} KM • ${workout.pace} • ${workout.time}`, 65, height - 105);

        // Progress bar line at bottom
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(0, height - 10, width, 10);
        ctx.fillStyle = '#CCFF00';
        ctx.fillRect(0, height - 10, width * progress, 10);

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
