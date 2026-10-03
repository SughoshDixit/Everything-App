import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Clock,
  Compass,
  Flame,
  Gauge,
  RotateCcw,
  Share2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Trophy,
  Video
} from 'lucide-react';
import type {
  ActivityDocument,
  RouteGeometryDocument,
  RouteRenderMode,
  GpsQualityGrade,
  TrailVideoDocument,
  VideoRenderPayload,
  VideoGeometryPoint
} from '../../types/routeIntelligence';
import { LeafletMapProvider, type IMapProvider } from '../../services/routeIntelligence/mapProvider';
import { ActivityMetricsService } from '../../services/routeIntelligence/activityMetricsService';
import { ActivityRouteQualityService } from '../../services/routeIntelligence/routeQualityService';
import { ActivityRouteProcessingService } from '../../services/routeIntelligence/routeProcessingService';
import { RouteIntelligenceFirestoreService } from '../../services/routeIntelligence/routeFirestoreService';
import { RouteCacheService } from '../../services/routeIntelligence/routeCacheService';
import { PerfMonitor } from '../../services/routeIntelligence/performanceMonitoring';
import { TrailVideoPlayerModal } from './TrailVideoPlayerModal';

interface ActivityRouteDetailViewProps {
  activity: ActivityDocument;
  geometries?: Record<string, RouteGeometryDocument>;
  onClose?: () => void;
  onOpenSocialShare?: (activity: ActivityDocument) => void;
}

export const ActivityRouteDetailView: React.FC<ActivityRouteDetailViewProps> = ({
  activity,
  geometries = {},
  onClose,
  onOpenSocialShare
}) => {
  const [activeRenderMode, setActiveRenderMode] = useState<RouteRenderMode>(
    activity.routeRenderMode === 'NO_MAP' ? 'NO_MAP' : 'CLEANED'
  );
  const [videoJob, setVideoJob] = useState<TrailVideoDocument | null>(null);
  const [isVideoGenerating, setIsVideoGenerating] = useState(false);
  const [videoToast, setVideoToast] = useState<string | null>(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapProviderRef = useRef<IMapProvider | null>(null);

  // Determine sport display helpers
  const isSpeedSport = activity.sportType === 'RIDE' || activity.sportType === 'ROAD_TRIP';
  const isIndoor = activity.routeRenderMode === 'NO_MAP' || activity.sportType === 'TREADMILL' || activity.sportType === 'CALISTHENICS';

  const sportEmoji =
    activity.sportType === 'RUN' ? '🏃' :
    activity.sportType === 'RIDE' ? '🚴' :
    activity.sportType === 'WALK' ? '🚶' :
    activity.sportType === 'HIKE' ? '🥾' :
    activity.sportType === 'TRAIL_RUN' ? '🌲' :
    activity.sportType === 'FOOTBALL' ? '⚽' :
    activity.sportType === 'CALISTHENICS' ? '💪' : '⚡';

  // 1. Initialize and Update Map Provider
  useEffect(() => {
    if (isIndoor || !mapContainerRef.current) return;

    PerfMonitor.start('leaflet_map_init');

    // Create Leaflet Map Provider
    const provider = new LeafletMapProvider({
      theme: 'dark_matter',
      accentColor: '#FC5200',
      interactive: true,
      padding: 40
    });

    provider.initialize(mapContainerRef.current);
    mapProviderRef.current = provider;

    PerfMonitor.end('leaflet_map_init');

    return () => {
      provider.destroy();
      mapProviderRef.current = null;
    };
  }, [isIndoor]);

  // 2. Render Active Geometry on Map
  useEffect(() => {
    if (!mapProviderRef.current || isIndoor) return;

    const geomKey = activeRenderMode === 'RAW' ? 'raw' : 'cleaned';
    const targetGeom = geometries[geomKey];

    if (!targetGeom) return;

    try {
      if (targetGeom.segments && targetGeom.segments.length > 0) {
        // MultiLineString segments for gap preservation
        const leafletSegments: [number, number][][] = targetGeom.segments.map((seg) =>
          seg.map((c) => [c[1], c[0]] as [number, number]) // Leaflet expects [lat, lng]
        );
        const flatCoords: [number, number][] = leafletSegments.flat();
        mapProviderRef.current.renderRoute(flatCoords, leafletSegments, activeRenderMode);
      } else if (targetGeom.compactGeometry) {
        // Retrieve or decode from LRU memory cache
        const cache = RouteCacheService.getInstance();
        const coords = cache.getOrDecodePolyline(targetGeom.compactGeometry, (compact) => {
          if (compact.startsWith('[')) {
            const parsed = JSON.parse(compact) as [number, number][];
            return parsed.map(([lng, lat]) => [lat, lng]);
          }
          // Decode Polyline6
          const pts = ActivityRouteProcessingService.decodePolyline(compact, 6);
          return pts.map((p) => [p.latitude, p.longitude] as [number, number]);
        });

        if (coords.length > 0) {
          mapProviderRef.current.renderRoute(coords, undefined, activeRenderMode);
        }
      }
    } catch (e) {
      console.warn('Failed to render route coordinates to map provider:', e);
    }
  }, [activeRenderMode, geometries, isIndoor]);

  // Format Helpers
  const formattedDate = new Date(activity.startedAt).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedStartTime = new Date(activity.startedAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const distanceKmFormatted = (activity.distanceMeters / 1000).toFixed(2);
  const movingTimeFormatted = ActivityMetricsService.formatDuration(activity.movingTimeSeconds);
  const elapsedTimeFormatted = ActivityMetricsService.formatDuration(activity.elapsedTimeSeconds);

  // Derived Video Render Payload
  const activeVideoPayload: VideoRenderPayload = React.useMemo(() => {
    let progressPoints: VideoGeometryPoint[] = [];
    if (geometries.video?.compactGeometry) {
      try {
        progressPoints = JSON.parse(geometries.video.compactGeometry);
      } catch (e) {
        console.warn('Failed to parse video geometry', e);
      }
    }

    if (progressPoints.length === 0 && geometries.cleaned?.segments) {
      const flat = geometries.cleaned.segments.flat();
      let cumDist = 0;
      progressPoints = flat.map((c, idx) => {
        if (idx > 0) {
          const prev = flat[idx - 1];
          cumDist += ActivityRouteQualityService.haversineMeters(prev[1], prev[0], c[1], c[0]);
        }
        const prog = activity.distanceMeters > 0
          ? Math.min(1.0, cumDist / activity.distanceMeters)
          : idx / Math.max(1, flat.length - 1);
        return {
          coordinate: [c[0], c[1]],
          cumulativeDistanceMeters: Math.round(cumDist),
          normalizedProgress: Math.round(prog * 10000) / 10000,
          timestamp: activity.startedAt + idx * 1000,
          elevation: c[2]
        };
      });
    }

    const bounds = geometries.video?.bounds || geometries.cleaned?.bounds || geometries.raw?.bounds || {
      minLat: 12.9716,
      maxLat: 12.9750,
      minLng: 77.5946,
      maxLng: 77.5980
    };

    return {
      activityId: activity.id,
      title: activity.title,
      athleteName: activity.userId === 'women' ? 'Shreya Dixit' : 'Sughosh Dixit',
      dateString: new Date(activity.startedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      sportType: activity.sportType,
      totalDistanceKm: Number((activity.distanceMeters / 1000).toFixed(2)),
      movingTimeFormatted: ActivityMetricsService.formatDuration(activity.movingTimeSeconds),
      averagePaceFormatted: activity.averagePaceString,
      elevationGainMeters: activity.elevationGainMeters,
      progressPoints,
      bounds,
      privacyRedacted: activity.privacyLevel !== 'PUBLIC',
      templateConfig: {
        template: 'SIGNATURE_TRAIL_REPLAY',
        aspectRatio: '9_16',
        width: 1080,
        height: 1920,
        fps: 30,
        durationSeconds: 16
      }
    };
  }, [activity, geometries]);

  // Trigger Trail Video Generation
  const handleCreateTrailVideo = async () => {
    setShowVideoPlayer(true);
    setIsVideoGenerating(true);
    setVideoToast('Launching Signature Trail Replay player...');

    try {
      const job = await RouteIntelligenceFirestoreService.queueTrailVideoJob(
        activity.id,
        'SIGNATURE_TRAIL_REPLAY',
        '9_16'
      );
      setVideoJob(job);
      setTimeout(() => {
        setIsVideoGenerating(false);
        setVideoToast('Trail Video preview active. Worker pipeline connected.');
      }, 1000);
    } catch {
      setIsVideoGenerating(false);
      setVideoToast('Trail Video preview active (local renderer).');
    }
  };

  // GPS Quality grade badge helper
  const renderQualityBadge = (grade?: GpsQualityGrade, score?: number) => {
    const g = grade || 'GOOD';
    const s = score ?? 95;
    const colorClasses =
      g === 'EXCELLENT'
        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
        : g === 'GOOD'
        ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
        : g === 'FAIR'
        ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30'
        : 'bg-rose-500/15 text-rose-400 border-rose-500/30';

    return (
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold ${colorClasses}`}>
        <ShieldCheck size={12} />
        <span>GPS Accuracy: {g} ({s}%)</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#0E131B] text-white select-none overflow-y-auto">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-[#0E131B]/95 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-2.5">
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
              title="Back"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <span className="text-xl">{sportEmoji}</span>
          <div>
            <h1 className="text-sm font-extrabold tracking-tight text-white leading-tight font-display">
              {activity.title}
            </h1>
            <p className="text-[11px] text-white/50 flex items-center gap-1.5 mt-0.5">
              <span>{formattedDate}</span>
              <span>&bull;</span>
              <span>{formattedStartTime}</span>
              <span>&bull;</span>
              <span className="uppercase text-[9px] font-bold px-1.5 py-0.2 rounded bg-white/10 text-white/70">
                {activity.source}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenSocialShare && (
            <button
              onClick={() => onOpenSocialShare(activity)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FC5200] hover:bg-[#e04800] text-white text-xs font-bold shadow-lg shadow-[#FC5200]/20 transition cursor-pointer"
            >
              <Share2 size={13} />
              <span>Share</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 space-y-4 p-4 pb-12 max-w-3xl mx-auto w-full">
        {/* HERO MAP OR INDOOR WORKOUT VISUAL */}
        {!isIndoor ? (
          <div className="relative w-full h-[320px] sm:h-[380px] rounded-3xl overflow-hidden border border-white/10 bg-[#090C12] shadow-2xl">
            {/* Leaflet Mount Container */}
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Top Overlay: Route Mode Selector */}
            <div className="absolute top-3 left-3 z-[1000] flex items-center gap-1.5 p-1 rounded-2xl bg-[#0E131B]/90 backdrop-blur-md border border-white/10 shadow-lg">
              <button
                onClick={() => setActiveRenderMode('CLEANED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeRenderMode === 'CLEANED'
                    ? 'bg-[#FC5200] text-white shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Cleaned
              </button>
              <button
                onClick={() => setActiveRenderMode('RAW')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeRenderMode === 'RAW'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Raw Trace
              </button>
              <button
                onClick={() => {
                  setVideoToast('Valhalla Map Matching will activate in Phase 2.');
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-white/40 hover:text-white/70 transition cursor-pointer"
                title="Valhalla Map Matching (Phase 2)"
              >
                Matched
              </button>
            </div>

            {/* Bottom Overlay: GPS Legend & Recenter */}
            <div className="absolute bottom-3 right-3 z-[1000] flex items-center gap-2">
              <button
                onClick={() => mapProviderRef.current?.fitBounds()}
                className="p-2 rounded-xl bg-[#0E131B]/90 backdrop-blur-md border border-white/10 text-white/70 hover:text-white transition shadow-lg cursor-pointer"
                title="Recenter Route"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>
        ) : (
          /* Graceful Indoor / Treadmill Workout Canvas */
          <div className="relative w-full p-6 rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-[#121824] to-[#0A0D14] shadow-2xl flex flex-col items-center justify-center text-center space-y-3 min-h-[220px]">
            <div className="w-14 h-14 rounded-2xl bg-[#FC5200]/15 border border-[#FC5200]/30 flex items-center justify-center text-2xl text-[#FC5200]">
              {activity.sportType === 'TREADMILL' ? '🏃' : '💪'}
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white font-display">
                {activity.sportType === 'TREADMILL' ? 'Indoor Treadmill Run' : 'Strength & Calisthenics Session'}
              </h2>
              <p className="text-xs text-white/50 max-w-sm mt-0.5">
                Indoor session recorded with precision telemetry. GPS map rendering is safely bypassed to preserve battery and avoid erratic drift.
              </p>
            </div>
          </div>
        )}

        {/* PRIMARY TELEMETRY STRIP (THE BIG 3) */}
        <div className="grid grid-cols-3 gap-2.5 p-4 rounded-3xl bg-[#121824] border border-white/10 text-center shadow-lg">
          <div>
            <div className="text-[10px] font-bold text-white/50 uppercase tracking-wider font-display">
              DISTANCE
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-0.5 tracking-tight">
              {distanceKmFormatted}
              <span className="text-xs font-semibold text-white/40 ml-1">km</span>
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold text-white/50 uppercase tracking-wider font-display">
              {isSpeedSport ? 'AVG SPEED' : 'AVG PACE'}
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-0.5 tracking-tight">
              {isSpeedSport ? `${activity.averageSpeedKmh}` : activity.averagePaceString}
              <span className="text-xs font-semibold text-white/40 ml-1">
                {isSpeedSport ? 'km/h' : ''}
              </span>
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold text-white/50 uppercase tracking-wider font-display">
              MOVING TIME
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-0.5 tracking-tight">
              {movingTimeFormatted}
            </div>
          </div>
        </div>

        {/* SECONDARY TELEMETRY GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-2xl bg-[#121824] border border-white/5 flex flex-col justify-between">
            <div className="text-[10px] font-bold text-white/50 uppercase flex items-center gap-1.5">
              <TrendingUp size={12} className="text-emerald-400" />
              <span>Elevation Gain</span>
            </div>
            <div className="text-lg font-bold font-mono text-white mt-1">
              +{activity.elevationGainMeters} <span className="text-xs text-white/40">m</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#121824] border border-white/5 flex flex-col justify-between">
            <div className="text-[10px] font-bold text-white/50 uppercase flex items-center gap-1.5">
              <Clock size={12} className="text-sky-400" />
              <span>Elapsed Time</span>
            </div>
            <div className="text-lg font-bold font-mono text-white mt-1">
              {elapsedTimeFormatted}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#121824] border border-white/5 flex flex-col justify-between">
            <div className="text-[10px] font-bold text-white/50 uppercase flex items-center gap-1.5">
              <Flame size={12} className="text-[#FC5200]" />
              <span>Energy</span>
            </div>
            <div className="text-lg font-bold font-mono text-white mt-1">
              {activity.calories} <span className="text-xs text-white/40">kcal</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#121824] border border-white/5 flex flex-col justify-between">
            <div className="text-[10px] font-bold text-white/50 uppercase flex items-center gap-1.5">
              <Gauge size={12} className="text-amber-400" />
              <span>Max Speed</span>
            </div>
            <div className="text-lg font-bold font-mono text-white mt-1">
              {activity.maxSpeedKmh || (activity.averageSpeedKmh * 1.3).toFixed(1)}{' '}
              <span className="text-xs text-white/40">km/h</span>
            </div>
          </div>
        </div>

        {/* GPS QUALITY & ACCURACY AUDIT CARD */}
        {activity.qualityReport && (
          <div className="p-4 rounded-3xl bg-[#121824] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  GPS Quality &amp; Provenance Analysis
                </h3>
              </div>
              {renderQualityBadge(
                activity.qualityReport.qualityGrade,
                activity.qualityReport.qualityScore
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-white/5">
                <div className="text-[10px] text-white/50">Total GPS Points</div>
                <div className="font-mono font-bold text-white mt-0.5">
                  {activity.qualityReport.totalPoints}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-white/5">
                <div className="text-[10px] text-white/50">Accepted Fixes</div>
                <div className="font-mono font-bold text-emerald-400 mt-0.5">
                  {activity.qualityReport.acceptedPoints}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-white/5">
                <div className="text-[10px] text-white/50">Jitter Drops</div>
                <div className="font-mono font-bold text-amber-400 mt-0.5">
                  {activity.qualityReport.stationaryDriftCount}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-white/5">
                <div className="text-[10px] text-white/50">Route Pauses</div>
                <div className="font-mono font-bold text-sky-400 mt-0.5">
                  {activity.qualityReport.gapCount}
                </div>
              </div>
            </div>

            {activity.qualityReport.rejectionReasons.length > 0 && (
              <p className="text-[11px] text-white/50 leading-relaxed font-mono">
                &bull; {activity.qualityReport.rejectionReasons.join(' ')}
              </p>
            )}
          </div>
        )}

        {/* KILOMETRE SPLITS TABLE */}
        {activity.splits && activity.splits.length > 0 && (
          <div className="p-4 rounded-3xl bg-[#121824] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Compass size={14} className="text-[#FC5200]" />
                <span>Kilometre Splits ({activity.splits.length})</span>
              </h3>
              <span className="text-[10px] text-white/40 font-mono">1.0 km interval</span>
            </div>

            <div className="space-y-1.5">
              {activity.splits.map((split) => (
                <div
                  key={split.splitNumber}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl border text-xs font-mono transition ${
                    split.isFastestSplit
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                      : 'bg-white/5 border-white/5 text-white/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white/60 w-5">#{split.splitNumber}</span>
                    <span className="font-bold">{split.distanceLabel}</span>
                    {split.isFastestSplit && (
                      <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                        <Trophy size={10} /> PR Split
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-white/50">
                      {ActivityMetricsService.formatDuration(split.durationSeconds)}
                    </span>
                    <span className="font-bold text-white">{split.paceMinKm}</span>
                    <span
                      className={`text-[10px] w-10 text-right ${
                        split.elevationDeltaMeters >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {split.elevationDeltaMeters >= 0
                        ? `+${split.elevationDeltaMeters}m`
                        : `${split.elevationDeltaMeters}m`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CREATE TRAIL VIDEO HERO BANNER (PHASE 3 READY) */}
        {!isIndoor && (
          <div className="relative p-5 rounded-3xl overflow-hidden bg-gradient-to-r from-[#172033] to-[#121824] border border-[#FC5200]/30 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#FC5200] uppercase tracking-wider">
                  <Sparkles size={14} />
                  <span>Cinematic Trail Video</span>
                </div>
                <h3 className="text-lg font-black text-white font-display">
                  Signature Trail Replay (9:16)
                </h3>
                <p className="text-xs text-white/60 max-w-md leading-relaxed">
                  Generate a vertical high-definition animated replay of your exact path, progressive pace line, and finishing telemetry crafted for Instagram Reels and WhatsApp Status.
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-[#FC5200]/20 border border-[#FC5200]/40 text-[#FC5200] text-[10px] font-black tracking-wider uppercase">
                9:16 HD
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={handleCreateTrailVideo}
                disabled={isVideoGenerating}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#FC5200] hover:bg-[#e04800] disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-[#FC5200]/30 transition cursor-pointer"
              >
                <Video size={15} />
                <span>{isVideoGenerating ? 'Queuing Video...' : 'Create Trail Video'}</span>
              </button>

              <div className="flex items-center gap-2 text-[11px] text-white/40">
                <span>Deterministic Remotion Engine</span>
                <span>&bull;</span>
                <span>Zero On-Device Burn</span>
              </div>
            </div>

            {videoJob && (
              <div className="p-3 rounded-xl bg-white/5 border border-emerald-500/30 text-xs text-emerald-400 font-mono flex items-center justify-between">
                <span>Job Queued: {videoJob.id} ({videoJob.template})</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 uppercase font-bold">{videoJob.status}</span>
              </div>
            )}

            {videoToast && (
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-emerald-400 font-mono">
                {videoToast}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 9:16 Vertical Signature Trail Replay Modal */}
      {showVideoPlayer && (
        <TrailVideoPlayerModal
          activity={activity}
          videoPayload={activeVideoPayload}
          onClose={() => setShowVideoPlayer(false)}
        />
      )}
    </div>
  );
};
