import React, { useState, useEffect, useRef } from 'react';
import type { GpsActivityLog } from '../types';
import { formatDuration } from '../utils/milestonesTracker';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  X,
  Share2,
  ListOrdered
} from 'lucide-react';

interface StravaRouteFlybyPlayerProps {
  activity: GpsActivityLog;
  onOpenSocialShare?: (act: GpsActivityLog) => void;
  onClose: () => void;
}

export const StravaRouteFlybyPlayer: React.FC<StravaRouteFlybyPlayerProps> = ({
  activity,
  onOpenSocialShare,
  onClose
}) => {
  const points = activity.routePoints || [];
  const splits = activity.splits || [];

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(2); // 1x, 2x, 5x, 10x
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [showSplitsTable, setShowSplitsTable] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  const totalPoints = points.length;

  // ---------------------------------------------------------------------------
  // 1. ANIMATION LOOP
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!isPlaying || totalPoints < 2) return;

    const animate = (time: number) => {
      const delta = time - lastTimeRef.current;
      if (delta > 30 / playbackSpeed) {
        setCurrentIndex((prev) => {
          if (prev >= totalPoints - 1) {
            setIsPlaying(false);
            return totalPoints - 1;
          }
          return prev + 1;
        });
        lastTimeRef.current = time;
      }
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, playbackSpeed, totalPoints]);

  // ---------------------------------------------------------------------------
  // 2. CANVAS DRAWING (ROUTE & HUD)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || totalPoints < 2) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Dark Map Grid Background
    ctx.fillStyle = '#060911';
    ctx.fillRect(0, 0, width, height);

    // Subtle Map Grid Lines
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

    // Coordinate Bounding Box
    let minLat = Infinity, maxLat = -Infinity;
    let minLon = Infinity, maxLon = -Infinity;

    points.forEach((p) => {
      if (p.latitude < minLat) minLat = p.latitude;
      if (p.latitude > maxLat) maxLat = p.latitude;
      if (p.longitude < minLon) minLon = p.longitude;
      if (p.longitude > maxLon) maxLon = p.longitude;
    });

    const latRange = maxLat - minLat || 0.0001;
    const lonRange = maxLon - minLon || 0.0001;
    const padding = 50;

    const toX = (lon: number) => padding + ((lon - minLon) / lonRange) * (width - padding * 2);
    const toY = (lat: number) => height - (padding + ((lat - minLat) / latRange) * (height - padding * 2));

    // 1. Draw Full Planned Route in subtle gray
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.3)';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    points.forEach((p, i) => {
      const x = toX(p.longitude);
      const y = toY(p.latitude);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // 2. Draw Traversed Animated Glowing Trail
    if (currentIndex > 0) {
      // Glow Layer
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(204, 255, 0, 0.3)';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (let i = 0; i <= currentIndex; i++) {
        const x = toX(points[i].longitude);
        const y = toY(points[i].latitude);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Sharp Core Layer
      ctx.beginPath();
      ctx.strokeStyle = '#CCFF00';
      ctx.lineWidth = 5;
      for (let i = 0; i <= currentIndex; i++) {
        const x = toX(points[i].longitude);
        const y = toY(points[i].latitude);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // 3. Start Marker (Green Circle)
    const startX = toX(points[0].longitude);
    const startY = toY(points[0].latitude);
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(startX, startY, 8, 0, Math.PI * 2);
    ctx.fill();

    // 4. Current Athlete Pulsing Marker
    if (currentIndex < totalPoints) {
      const currP = points[currentIndex];
      const currX = toX(currP.longitude);
      const currY = toY(currP.latitude);

      // Pulse Ring
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(currX, currY, 18, 0, Math.PI * 2);
      ctx.stroke();

      // Center Dot
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(currX, currY, 9, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(currX, currY, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. Finish Marker (Chequered / Red Circle)
    const endX = toX(points[totalPoints - 1].longitude);
    const endY = toY(points[totalPoints - 1].latitude);
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(endX, endY, 8, 0, Math.PI * 2);
    ctx.fill();
  }, [currentIndex, points, totalPoints]);

  // Telemetry Calculations for Current Frame
  const progressRatio = totalPoints > 1 ? currentIndex / (totalPoints - 1) : 1;
  const currentDistanceKm = Number((activity.distanceKm * progressRatio).toFixed(2));
  const currentDurationSec = Math.round(activity.durationSeconds * progressRatio);
  const currentPoint = points[currentIndex] || points[0];
  const currentAltitude = currentPoint?.altitude ? Math.round(currentPoint.altitude) : 0;

  // Active 100m split calculation
  const activeSplitIndex = Math.min(
    splits.length - 1,
    Math.floor((currentDistanceKm * 1000) / 100)
  );
  const activeSplit = splits[Math.max(0, activeSplitIndex)];

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setCurrentIndex(val);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsPlaying(true);
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 10000 }}>
      <div className="modal-content google-card animate-scale-up max-w-lg w-full max-h-[94vh] overflow-y-auto p-5 md:p-6 flex flex-col justify-between">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-glass pb-3 mb-2">
          <button
            className="btn-google-outlined text-xs py-1.5 px-3 flex items-center gap-1"
            onClick={onClose}
          >
            <ChevronLeft size={16} />
            <span>Back</span>
          </button>

          <div className="text-center">
            <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">
              STRAVA-STYLE FLYBY
            </span>
            <h3 className="text-sm md:text-base font-black text-main mt-0.5 uppercase tracking-wide">
              {activity.distanceKm} km {activity.activityType === 'run' ? 'Run Route Replay' : 'Cycling Route Replay'}
            </h3>
          </div>

          <button className="btn-google-icon" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* 1. CINEMATIC GPS ROUTE CANVAS STAGE */}
        {/* ------------------------------------------------------------------- */}
        <div className="relative bg-black rounded-2xl border border-glass overflow-hidden my-2 shadow-2xl flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={480}
            height={280}
            className="w-full h-auto max-h-[280px] object-contain"
          />

          {/* Floating Top Telemetry HUD */}
          <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-800 flex items-center gap-3 shadow-lg">
            <div>
              <div className="text-[9px] text-slate-400 font-bold uppercase">DISTANCE</div>
              <div className="text-sm font-black text-white font-mono leading-none mt-0.5">
                {currentDistanceKm} <span className="text-[10px] text-lime-400 font-normal">km</span>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-800" />

            <div>
              <div className="text-[9px] text-slate-400 font-bold uppercase">ELAPSED</div>
              <div className="text-sm font-black text-cyan-400 font-mono leading-none mt-0.5">
                {formatDuration(currentDurationSec)}
              </div>
            </div>

            {currentAltitude > 0 && (
              <>
                <div className="h-6 w-px bg-slate-800" />
                <div>
                  <div className="text-[9px] text-slate-400 font-bold uppercase">ALTITUDE</div>
                  <div className="text-sm font-black text-amber-400 font-mono leading-none mt-0.5">
                    {currentAltitude}m
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Floating Active 100m Split Pill */}
          {activeSplit && (
            <div className="absolute bottom-3 left-3 bg-slate-950/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-lime-500/40 text-[11px] text-lime-400 font-bold flex items-center gap-1.5 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
              <span>Split #{activeSplit.splitNumber} ({activeSplit.distanceLabel}): {activeSplit.durationSeconds}s</span>
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* 2. PLAYBACK CONTROLS & TIMELINE SCRUBBER */}
        {/* ------------------------------------------------------------------- */}
        <div className="bg-card p-3 rounded-2xl border border-glass my-2">
          {/* Progress Slider */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono text-sub">{formatDuration(currentDurationSec)}</span>
            <input
              type="range"
              min="0"
              max={Math.max(1, totalPoints - 1)}
              value={currentIndex}
              onChange={handleSeek}
              className="flex-1 accent-cyan-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg"
            />
            <span className="text-[10px] font-mono text-sub">{formatDuration(activity.durationSeconds)}</span>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                className="btn-google-icon"
                onClick={() => setIsPlaying(!isPlaying)}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
              </button>

              <button
                className="btn-google-icon"
                onClick={handleReset}
                title="Restart Flyby"
              >
                <RotateCcw size={16} />
              </button>
            </div>

            {/* Playback Speed Multiplier Pills */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-full border border-glass">
              {[1, 2, 5, 10].map((s) => (
                <button
                  key={s}
                  className={`py-0.5 px-2.5 rounded-full text-[10px] font-bold transition-all ${
                    playbackSpeed === s
                      ? 'bg-cyan-500 text-white font-black shadow-sm'
                      : 'text-sub hover:text-main'
                  }`}
                  onClick={() => setPlaybackSpeed(s)}
                >
                  {s}x
                </button>
              ))}
            </div>

            {/* Toggle 100m Splits Table */}
            <button
              className={showSplitsTable ? 'btn-google-primary text-xs py-1.5 px-3' : 'btn-google-outlined text-xs py-1.5 px-3'}
              onClick={() => setShowSplitsTable(!showSplitsTable)}
            >
              <ListOrdered size={14} />
              <span>Splits</span>
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* 3. 100m SPLIT TIMES EXPANDABLE DRAWER */}
        {/* ------------------------------------------------------------------- */}
        {showSplitsTable && (
          <div className="bg-card p-3 rounded-2xl border border-glass my-2 max-h-48 overflow-y-auto animate-fade-in">
            <h4 className="text-[11px] font-black text-sub uppercase tracking-wider mb-2">
              100m Split Times & Elevation Analysis
            </h4>
            <div className="grid grid-cols-4 text-[10px] font-bold text-sub border-b border-glass pb-1 mb-1">
              <div>SPLIT</div>
              <div>TIME</div>
              <div>PACE</div>
              <div className="text-right">ELEVATION</div>
            </div>
            {splits.map((s) => (
              <div
                key={s.splitNumber}
                className="grid grid-cols-4 text-[11px] font-mono py-1 border-b border-glass/50 items-center text-sub"
              >
                <div className="font-bold text-main">#{s.splitNumber} ({s.distanceLabel})</div>
                <div className="text-emerald-600 dark:text-emerald-400 font-bold">{s.durationSeconds}s</div>
                <div className="text-cyan-600 dark:text-cyan-400">{s.paceMinKm}</div>
                <div className="text-right text-amber-600 dark:text-amber-400">
                  {s.elevationDeltaMeters >= 0 ? `+${s.elevationDeltaMeters}m` : `${s.elevationDeltaMeters}m`}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* 4. TOTAL SUMMARY CARDS & SHARE BUTTON */}
        {/* ------------------------------------------------------------------- */}
        <div className="grid grid-cols-3 gap-2 my-2">
          <div className="bg-card p-2.5 rounded-2xl border border-glass text-center">
            <div className="text-[9px] text-sub font-bold uppercase">ELEVATION GAIN</div>
            <div className="text-sm font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5">
              +{activity.elevationGainMeters || 0}m
            </div>
          </div>

          <div className="bg-card p-2.5 rounded-2xl border border-glass text-center">
            <div className="text-[9px] text-sub font-bold uppercase">AVG PACE</div>
            <div className="text-sm font-black text-cyan-600 dark:text-cyan-400 font-mono mt-0.5">
              {activity.avgPaceMinKm}
            </div>
          </div>

          <div className="bg-card p-2.5 rounded-2xl border border-glass text-center">
            <div className="text-[9px] text-sub font-bold uppercase">STEPS TAKEN</div>
            <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
              {activity.stepsCount ? activity.stepsCount.toLocaleString() : '—'}
            </div>
          </div>
        </div>

        {/* Share Button */}
        {onOpenSocialShare && (
          <button
            className="btn-google-primary w-full py-3 text-xs uppercase tracking-wider mt-2"
            onClick={() => onOpenSocialShare(activity)}
          >
            <Share2 size={16} />
            <span>Create & Share Route Poster (WhatsApp / Insta)</span>
          </button>
        )}
      </div>
    </div>
  );
};
