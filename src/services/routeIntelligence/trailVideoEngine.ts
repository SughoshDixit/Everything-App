/**
 * Trail Video Engine
 * Generates deterministic 9:16 vertical video frames and client-side canvas animation
 * following the exact Signature Trail Replay timeline:
 * 0.0 - 1.5s: Cinematic fly-in and title reveal
 * 1.5 - 10.5s: Progressive path drawing with moving athlete marker
 * 10.5 - 14.0s: Smooth full-route zoom out
 * 14.0 - 18.0s: Final athletic recap card with distance, time, pace, elevation
 */

import type {
  ActivityDocument,
  VideoGeometryPoint,
  VideoRenderPayload
} from '../../types/routeIntelligence';

export interface VideoFrameState {
  currentProgress: number; // 0.0 to 1.0
  activeCoordinate: [number, number]; // [lng, lat]
  drawnPoints: [number, number][];
  remainingPoints: [number, number][];
  currentDistanceKm: number;
  currentPaceString: string;
  phase: 'intro' | 'route_draw' | 'zoom_out' | 'recap';
  recapOpacity: number;
  zoomScale: number;
}

export class TrailVideoEngine {
  /**
   * Evaluates the animation frame state for a given elapsed time in seconds (0 to 18 seconds).
   */
  public static evaluateFrame(
    timeSeconds: number,
    totalDurationSeconds: number,
    progressPoints: VideoGeometryPoint[],
    activity: ActivityDocument
  ): VideoFrameState {
    const totalDistMeters = activity.distanceMeters || 1;
    const duration = Math.max(12, totalDurationSeconds || 16);

    // Timeline phases
    const tIntro = 1.5;
    const tDrawEnd = duration * 0.68; // ~11s
    const tZoomEnd = duration * 0.85; // ~13.6s

    let phase: VideoFrameState['phase'] = 'intro';
    let progress = 0;
    let recapOpacity = 0;
    let zoomScale = 1.0;

    if (timeSeconds < tIntro) {
      phase = 'intro';
      progress = 0;
      zoomScale = 1.4 - (timeSeconds / tIntro) * 0.2; // slight push-in
    } else if (timeSeconds < tDrawEnd) {
      phase = 'route_draw';
      const drawProgress = (timeSeconds - tIntro) / (tDrawEnd - tIntro);
      progress = Math.min(1.0, Math.max(0, drawProgress));
      zoomScale = 1.2;
    } else if (timeSeconds < tZoomEnd) {
      phase = 'zoom_out';
      progress = 1.0;
      const zoomProgress = (timeSeconds - tDrawEnd) / (tZoomEnd - tDrawEnd);
      zoomScale = 1.2 - zoomProgress * 0.2; // zoom back out to 1.0
    } else {
      phase = 'recap';
      progress = 1.0;
      const recapProgress = (timeSeconds - tZoomEnd) / (duration - tZoomEnd);
      recapOpacity = Math.min(1.0, recapProgress * 2.5);
      zoomScale = 1.0;
    }

    if (progressPoints.length === 0) {
      return {
        currentProgress: progress,
        activeCoordinate: [77.5946, 12.9716],
        drawnPoints: [],
        remainingPoints: [],
        currentDistanceKm: 0,
        currentPaceString: activity.averagePaceString,
        phase,
        recapOpacity,
        zoomScale
      };
    }

    // Determine drawn vs remaining points
    const pointIndex = Math.min(
      progressPoints.length - 1,
      Math.floor(progress * (progressPoints.length - 1))
    );

    const activePoint = progressPoints[pointIndex];
    const drawnPoints: [number, number][] = progressPoints
      .slice(0, pointIndex + 1)
      .map((p) => p.coordinate);
    const remainingPoints: [number, number][] = progressPoints
      .slice(pointIndex)
      .map((p) => p.coordinate);

    const currentDistMeters = activePoint.cumulativeDistanceMeters || progress * totalDistMeters;
    const currentDistanceKm = Math.round((currentDistMeters / 1000) * 100) / 100;

    return {
      currentProgress: progress,
      activeCoordinate: activePoint.coordinate,
      drawnPoints,
      remainingPoints,
      currentDistanceKm,
      currentPaceString: activity.averagePaceString,
      phase,
      recapOpacity,
      zoomScale
    };
  }

  /**
   * Renders a complete 9:16 vertical video frame onto an HTML5 canvas.
   */
  public static renderFrameToCanvas(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    frame: VideoFrameState,
    payload: VideoRenderPayload
  ): void {
    ctx.save();

    // 1. Charcoal / Obsidian Background
    ctx.fillStyle = '#090C12';
    ctx.fillRect(0, 0, width, height);

    // Subtle dark gradient background glow
    const bgGrad = ctx.createRadialGradient(
      width * 0.5,
      height * 0.45,
      width * 0.1,
      width * 0.5,
      height * 0.45,
      width * 0.8
    );
    bgGrad.addColorStop(0, '#151C2A');
    bgGrad.addColorStop(1, '#090C12');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Coordinate Projector to Canvas Space
    const { bounds } = payload;
    const pad = width * 0.14;
    const mapW = width - pad * 2;
    const mapH = height * 0.55;
    const mapTop = height * 0.18;

    const latSpan = Math.max(0.001, bounds.maxLat - bounds.minLat);
    const lngSpan = Math.max(0.001, bounds.maxLng - bounds.minLng);

    const project = (lng: number, lat: number): [number, number] => {
      const x = pad + ((lng - bounds.minLng) / lngSpan) * mapW;
      const y = mapTop + mapH - ((lat - bounds.minLat) / latSpan) * mapH;
      return [x, y];
    };

    // 3. Draw Upcoming / Remaining Faint Route
    if (frame.remainingPoints.length > 1) {
      ctx.beginPath();
      const [startLng, startLat] = frame.remainingPoints[0];
      const [sx, sy] = project(startLng, startLat);
      ctx.moveTo(sx, sy);

      for (let i = 1; i < frame.remainingPoints.length; i++) {
        const [lng, lat] = frame.remainingPoints[i];
        const [x, y] = project(lng, lat);
        ctx.lineTo(x, y);
      }

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }

    // 4. Draw Completed Glowing Route
    if (frame.drawnPoints.length > 1) {
      // Glow Layer
      ctx.beginPath();
      const [firstLng, firstLat] = frame.drawnPoints[0];
      const [fx, fy] = project(firstLng, firstLat);
      ctx.moveTo(fx, fy);

      for (let i = 1; i < frame.drawnPoints.length; i++) {
        const [lng, lat] = frame.drawnPoints[i];
        const [x, y] = project(lng, lat);
        ctx.lineTo(x, y);
      }

      ctx.strokeStyle = 'rgba(252, 82, 0, 0.35)';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Sharp Core Polyline
      ctx.strokeStyle = '#FC5200';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }

    // 5. Start Beacon
    if (payload.progressPoints.length > 0) {
      const [sLng, sLat] = payload.progressPoints[0].coordinate;
      const [sx, sy] = project(sLng, sLat);

      ctx.fillStyle = '#10B981';
      ctx.beginPath();
      ctx.arc(sx, sy, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    // 6. Moving Athlete Puck
    if (frame.drawnPoints.length > 0) {
      const [currLng, currLat] = frame.activeCoordinate;
      const [cx, cy] = project(currLng, currLat);

      // Pulse ring
      ctx.fillStyle = 'rgba(252, 82, 0, 0.3)';
      ctx.beginPath();
      ctx.arc(cx, cy, 16, 0, Math.PI * 2);
      ctx.fill();

      // Core puck
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#FC5200';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // 7. Top HUD (Athlete & Title)
    ctx.textAlign = 'center';

    // Sport Emoji / Tag
    ctx.fillStyle = '#FC5200';
    ctx.font = '700 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(payload.sportType, width * 0.5, height * 0.08);

    // Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(payload.title, width * 0.5, height * 0.12);

    // Date
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '500 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(payload.dateString, width * 0.5, height * 0.15);

    // 8. Bottom Live Progress Telemetry Card
    const cardY = height * 0.77;
    const cardW = width * 0.86;
    const cardH = height * 0.13;
    const cardX = (width - cardW) / 2;

    ctx.fillStyle = 'rgba(18, 24, 36, 0.85)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    this.roundRect(ctx, cardX, cardY, cardW, cardH, 24);
    ctx.fill();
    ctx.stroke();

    // Metric 1: Distance
    const col1X = cardX + cardW * 0.2;
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '700 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('DISTANCE', col1X, cardY + cardH * 0.38);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 34px monospace';
    ctx.fillText(`${frame.currentDistanceKm.toFixed(2)} km`, col1X, cardY + cardH * 0.78);

    // Metric 2: Pace
    const col2X = cardX + cardW * 0.5;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '700 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('AVG PACE', col2X, cardY + cardH * 0.38);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 34px monospace';
    ctx.fillText(payload.averagePaceFormatted, col2X, cardY + cardH * 0.78);

    // Metric 3: Time
    const col3X = cardX + cardW * 0.8;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '700 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('TIME', col3X, cardY + cardH * 0.38);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 34px monospace';
    ctx.fillText(payload.movingTimeFormatted, col3X, cardY + cardH * 0.78);

    // 9. Watermark Branding
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = '700 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('kuchh bhii. athletic performance', width * 0.5, height * 0.94);

    // 10. Final Recap Overlay Card
    if (frame.recapOpacity > 0.05) {
      ctx.fillStyle = `rgba(14, 19, 27, ${frame.recapOpacity * 0.92})`;
      ctx.fillRect(0, 0, width, height);

      const recapY = height * 0.35;
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 48px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('EFFORT COMPLETE', width * 0.5, recapY);

      ctx.fillStyle = '#FC5200';
      ctx.font = '800 72px monospace';
      ctx.fillText(`${payload.totalDistanceKm.toFixed(2)} KM`, width * 0.5, recapY + 90);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '600 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(
        `${payload.movingTimeFormatted}  •  ${payload.averagePaceFormatted}  •  +${payload.elevationGainMeters}m`,
        width * 0.5,
        recapY + 150
      );

      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '700 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(`Recorded by ${payload.athleteName}`, width * 0.5, recapY + 220);
    }

    ctx.restore();
  }

  private static roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ): void {
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
}
