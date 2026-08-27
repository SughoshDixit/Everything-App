import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { SocialShareCardData, MotivationalQuote, SocialCardTemplate, GpsLocationPoint } from '../types';
import {
  generateSocialCardCanvas,
  downloadSocialCardImage,
  shareSocialCardNative
} from '../utils/socialCardGenerator';
import {
  Share2,
  Download,
  ChevronLeft,
  X,
  Smartphone,
  Square,
  RefreshCw,
  Check,
  UploadCloud,
  MapPin,
  Sliders,
  Trash2,
  Plus,
  Video,
  Image as ImageIcon,
  Play,
  Pause,
  RotateCcw,
  Music
} from 'lucide-react';

interface SocialWorkoutShareModalProps {
  initialData: SocialShareCardData;
  quotesList?: MotivationalQuote[];
  onClose: () => void;
}

type ShareStudioMode = 'poster' | 'video';
type VideoMapTheme = 'dark_canvas' | 'osm' | 'satellite' | 'neon' | 'custom_media';

// Tile URLs for photorealistic and real-time map views
const TILE_URL_MAP: Record<string, string> = {
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  osm: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  dark_canvas: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
};

export const SocialWorkoutShareModal: React.FC<SocialWorkoutShareModalProps> = ({
  initialData,
  quotesList,
  onClose
}) => {
  // Studio Mode: Poster (Image) vs Video (Animated Route Clip)
  const [studioMode, setStudioMode] = useState<ShareStudioMode>('poster');

  // Poster state
  const [format, setFormat] = useState<'story' | 'square'>('story');
  const [template, setTemplate] = useState<SocialCardTemplate>(initialData.templateStyle || 'strava_classic');
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState<number>(0);
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Multi-photo state (Unlimited photos upload)
  const [photos, setPhotos] = useState<string[]>(() => {
    if (initialData.photos && initialData.photos.length > 0) return initialData.photos;
    if (initialData.customMediaUrl) return [initialData.customMediaUrl];
    return [];
  });
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState<number>(0);
  const [scrimIntensity, setScrimIntensity] = useState<number>(0.65);
  const [showRouteOverlay, setShowRouteOverlay] = useState<boolean>(!!initialData.routePoints && initialData.routePoints.length > 1);

  // Video Mode State
  const [videoMapTheme, setVideoMapTheme] = useState<VideoMapTheme>('satellite');
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(true);
  const [videoPlaybackSpeed, setVideoPlaybackSpeed] = useState<number>(2);
  const [videoCurrentIndex, setVideoCurrentIndex] = useState<number>(0);
  const [isRecordingVideo, setIsRecordingVideo] = useState<boolean>(false);
  const [recordProgress, setRecordProgress] = useState<number>(0);
  const [customVideoUrl, setCustomVideoUrl] = useState<string | null>(null);
  const [customAudioUrl, setCustomAudioUrl] = useState<string | null>(null);
  const [customAudioName, setCustomAudioName] = useState<string | null>(null);
  const [audioStartTime, setAudioStartTime] = useState<number>(0);
  const [audioTotalDuration, setAudioTotalDuration] = useState<number>(0);
  const [isAudioPreviewPlaying, setIsAudioPreviewPlaying] = useState<boolean>(false);
  const [showVideoTelemetry, setShowVideoTelemetry] = useState<boolean>(true);
  const [showVideoQuote, setShowVideoQuote] = useState<boolean>(true);

  // Map Tile Cache for Real-Time Satellite / OSM / Dark Canvas
  const [mapTilesCache, setMapTilesCache] = useState<Map<string, HTMLImageElement>>(new Map());
  const [mapTilesReady, setMapTilesReady] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoFileInputRef = useRef<HTMLInputElement | null>(null);
  const audioFileInputRef = useRef<HTMLInputElement | null>(null);
  const videoCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const userVideoElementRef = useRef<HTMLVideoElement | null>(null);
  const userAudioElementRef = useRef<HTMLAudioElement | null>(null);
  const videoAnimFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const [customQuoteText, setCustomQuoteText] = useState<string>(initialData.motivationalQuote || '');
  const [customQuoteAuthor, setCustomQuoteAuthor] = useState<string>(initialData.quoteAuthor || (initialData.persona === 'women' ? 'Shreya' : 'Sughosh'));
  const [useCustomQuote, setUseCustomQuote] = useState<boolean>(!!initialData.motivationalQuote);

  const defaultQuotes = [
    { text: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.', author: 'Aristotle' },
    { text: 'Do not pray for an easy life, pray for the strength to endure a difficult one.', author: 'Bruce Lee' },
    { text: 'You have power over your mind - not outside events. Realize this, and you will find strength.', author: 'Marcus Aurelius' },
    { text: 'Your work is to discover your work and then with all your heart to give yourself to it.', author: 'Bhagavad Gita' },
    { text: 'Talent without working hard is nothing.', author: 'Cristiano Ronaldo' }
  ];

  const activeQuotes = quotesList && quotesList.length > 0 ? quotesList : defaultQuotes;
  const defaultQuote = activeQuotes[currentQuoteIndex % activeQuotes.length];
  const currentQuote = useCustomQuote && customQuoteText.trim()
    ? { text: customQuoteText.trim(), author: customQuoteAuthor.trim() || (initialData.persona === 'women' ? 'Shreya' : 'Sughosh') }
    : defaultQuote;

  // Route Points for animated video
  const routePoints: GpsLocationPoint[] = useMemo(() => {
    if (initialData.routePoints && initialData.routePoints.length > 1) {
      return initialData.routePoints;
    }
    const distNum = parseFloat(initialData.stats.find(s => s.label.toLowerCase().includes('dist'))?.value || '5.0') || 5.0;
    const baseLat = 12.9716;
    const baseLng = 77.5946;
    const pts: GpsLocationPoint[] = [];
    const count = Math.max(40, Math.min(150, Math.round(distNum * 20)));
    const radius = (distNum / 111) * 0.45;
    const now = Date.now();

    for (let i = 0; i < count; i++) {
      const theta = (i / (count - 1)) * Math.PI * 2;
      const r = radius * (0.85 + 0.3 * Math.sin(theta * 3) + 0.15 * Math.cos(theta * 5));
      const lat = baseLat + r * Math.cos(theta);
      const lng = baseLng + r * Math.sin(theta) * 1.25;
      const speed = initialData.workoutType.toLowerCase().includes('drive') ? 22 : initialData.workoutType.toLowerCase().includes('cycle') ? 7.5 : 3.2;
      pts.push({
        latitude: lat,
        longitude: lng,
        altitude: 900 + Math.sin(i * 0.2) * 25,
        speed,
        timestamp: now - (count - i) * 3000
      });
    }
    return pts;
  }, [initialData.routePoints, initialData.stats, initialData.workoutType]);

  const totalPoints = routePoints.length;

  const cardData: SocialShareCardData = {
    ...initialData,
    motivationalQuote: currentQuote.text,
    quoteAuthor: currentQuote.author,
    photos,
    selectedPhotoIndex: selectedPhotoIdx,
    scrimIntensity,
    showRouteOverlay,
    templateStyle: template
  };

  // Calculated stats
  const distStat = initialData.stats.find(s => s.label.toLowerCase().includes('dist'))?.value || '5.0';
  const totalDistNum = parseFloat(distStat) || 5.0;
  const timeStat = initialData.stats.find(s => s.label.toLowerCase().includes('time') || s.label.toLowerCase().includes('dur'))?.value || '28:45';

  // Convert lat/lng to Web Mercator Tile X/Y at Zoom level
  const latLngToTile = useCallback((lat: number, lng: number, zoom: number) => {
    const n = Math.pow(2, zoom);
    const x = Math.floor(((lng + 180) / 360) * n);
    const latRad = (lat * Math.PI) / 180;
    const y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n);
    return { x, y, zoom };
  }, []);

  // Convert Tile X/Y to lat/lng bounding box
  const tileToBoundingBox = useCallback((x: number, y: number, zoom: number) => {
    const n = Math.pow(2, zoom);
    const minLng = (x / n) * 360 - 180;
    const maxLng = ((x + 1) / n) * 360 - 180;
    const minLatRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * (y + 1)) / n)));
    const maxLatRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n)));
    const minLat = (minLatRad * 180) / Math.PI;
    const maxLat = (maxLatRad * 180) / Math.PI;
    return { minLat, maxLat, minLng, maxLng };
  }, []);

  // 0. Pre-fetch Real Map Tiles for current Route & Theme
  useEffect(() => {
    if (studioMode !== 'video' || videoMapTheme === 'neon' || videoMapTheme === 'custom_media' || !TILE_URL_MAP[videoMapTheme]) {
      setMapTilesReady(true);
      return;
    }

    let isMounted = true;
    let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
    routePoints.forEach((p) => {
      if (p.latitude < minLat) minLat = p.latitude;
      if (p.latitude > maxLat) maxLat = p.latitude;
      if (p.longitude < minLng) minLng = p.longitude;
      if (p.longitude > maxLng) maxLng = p.longitude;
    });

    // Determine optimal zoom level
    const latDiff = maxLat - minLat;
    const lngDiff = maxLng - minLng;
    const maxDiff = Math.max(latDiff, lngDiff);
    let zoom = 14;
    if (maxDiff > 0.4) zoom = 11;
    else if (maxDiff > 0.15) zoom = 12;
    else if (maxDiff > 0.05) zoom = 13;
    else if (maxDiff > 0.02) zoom = 14;
    else zoom = 15;

    const minTile = latLngToTile(maxLat, minLng, zoom);
    const maxTile = latLngToTile(minLat, maxLng, zoom);

    const tilePromises: Promise<{ key: string; img: HTMLImageElement; bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number } }>[] = [];
    const urlPattern = TILE_URL_MAP[videoMapTheme];

    // Fetch bounding tiles with margin
    const startX = Math.max(0, minTile.x - 1);
    const endX = maxTile.x + 1;
    const startY = Math.max(0, minTile.y - 1);
    const endY = maxTile.y + 1;

    for (let tx = startX; tx <= endX; tx++) {
      for (let ty = startY; ty <= endY; ty++) {
        const key = `${videoMapTheme}_${zoom}_${tx}_${ty}`;
        const url = urlPattern.replace('{z}', zoom.toString()).replace('{x}', tx.toString()).replace('{y}', ty.toString());
        const bounds = tileToBoundingBox(tx, ty, zoom);

        const p = new Promise<{ key: string; img: HTMLImageElement; bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number } }>((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve({ key, img, bounds });
          img.onerror = () => {
            const blank = new Image();
            blank.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
            resolve({ key, img: blank, bounds });
          };
          img.src = url;
        });
        tilePromises.push(p);
      }
    }

    Promise.all(tilePromises).then((results) => {
      if (!isMounted) return;
      const cache = new Map<string, HTMLImageElement>();
      results.forEach((r) => {
        cache.set(r.key, r.img);
      });
      setMapTilesCache(cache);
      setMapTilesReady(true);
    });

    return () => {
      isMounted = false;
    };
  }, [studioMode, videoMapTheme, routePoints, latLngToTile, tileToBoundingBox]);

  // 1. Poster Canvas Preview
  useEffect(() => {
    if (studioMode !== 'poster') return;
    let isMounted = true;
    generateSocialCardCanvas(cardData, format).then((canvas) => {
      if (isMounted) {
        setPreviewUrl(canvas.toDataURL('image/png'));
      }
    });
    return () => {
      isMounted = false;
    };
  }, [format, currentQuoteIndex, photos, selectedPhotoIdx, scrimIntensity, showRouteOverlay, template, studioMode]);

  // 2. Animated Video Playback Loop
  useEffect(() => {
    if (studioMode !== 'video') return;

    if (!isVideoPlaying) {
      if (videoAnimFrameRef.current) cancelAnimationFrame(videoAnimFrameRef.current);
      return;
    }

    const animateVideo = (time: number) => {
      const delta = time - lastTimeRef.current;
      if (delta > 30 / videoPlaybackSpeed) {
        setVideoCurrentIndex((prev) => {
          if (prev >= totalPoints - 1) {
            return 0;
          }
          return prev + 1;
        });
        lastTimeRef.current = time;
      }
      videoAnimFrameRef.current = requestAnimationFrame(animateVideo);
    };

    videoAnimFrameRef.current = requestAnimationFrame(animateVideo);
    return () => {
      if (videoAnimFrameRef.current) cancelAnimationFrame(videoAnimFrameRef.current);
    };
  }, [studioMode, isVideoPlaying, videoPlaybackSpeed, totalPoints]);

  // Render Video Frame on Canvas
  useEffect(() => {
    if (studioMode !== 'video' || !videoCanvasRef.current || totalPoints < 2) return;

    const canvas = videoCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Coordinate Normalization
    let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
    routePoints.forEach((p) => {
      if (p.latitude < minLat) minLat = p.latitude;
      if (p.latitude > maxLat) maxLat = p.latitude;
      if (p.longitude < minLng) minLng = p.longitude;
      if (p.longitude > maxLng) maxLng = p.longitude;
    });

    const latMargin = (maxLat - minLat) * 0.12 || 0.002;
    const lngMargin = (maxLng - minLng) * 0.12 || 0.002;
    const routeMinLat = minLat - latMargin;
    const routeMaxLat = maxLat + latMargin;
    const routeMinLng = minLng - lngMargin;
    const routeMaxLng = maxLng + lngMargin;

    const latR = routeMaxLat - routeMinLat || 0.001;
    const lngR = routeMaxLng - routeMinLng || 0.001;

    const toX = (lng: number) => ((lng - routeMinLng) / lngR) * w;
    const toY = (lat: number) => h - ((lat - routeMinLat) / latR) * h;

    // 1. Draw Background: Real Tiles vs Custom Media vs Neon
    if (customVideoUrl && userVideoElementRef.current && userVideoElementRef.current.readyState >= 2) {
      ctx.drawImage(userVideoElementRef.current, 0, 0, w, h);
      ctx.fillStyle = `rgba(5, 7, 13, ${scrimIntensity})`;
      ctx.fillRect(0, 0, w, h);
    } else if (photos.length > 0 && photos[selectedPhotoIdx]) {
      const bgImg = new Image();
      bgImg.src = photos[selectedPhotoIdx];
      if (bgImg.complete && bgImg.width > 0) {
        ctx.drawImage(bgImg, 0, 0, w, h);
        ctx.fillStyle = `rgba(5, 7, 13, ${scrimIntensity})`;
        ctx.fillRect(0, 0, w, h);
      } else {
        renderRealisticMapBackground(ctx, w, h, videoMapTheme, routeMinLat, routeMaxLat, routeMinLng, routeMaxLng, toX, toY);
      }
    } else {
      renderRealisticMapBackground(ctx, w, h, videoMapTheme, routeMinLat, routeMaxLat, routeMinLng, routeMaxLng, toX, toY);
    }

    // 2. Planned Route Base Path
    ctx.beginPath();
    ctx.strokeStyle = videoMapTheme === 'satellite' ? 'rgba(255, 255, 255, 0.45)' : 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 6]);
    routePoints.forEach((p, idx) => {
      const px = toX(p.longitude);
      const py = toY(p.latitude);
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. Traversed Glowing Path (Multi-Stage Sequential Transition Support)
    const hasStages = initialData.multiStageRoutes && initialData.multiStageRoutes.length > 1;
    let activeStageName = initialData.workoutType;
    let activeStageColor = '#06b6d4';
    let currentStageIndex = 1;
    let totalStagesCount = 1;

    if (hasStages && initialData.multiStageRoutes) {
      totalStagesCount = initialData.multiStageRoutes.length;
      let cumulativePts = 0;
      for (let s = 0; s < initialData.multiStageRoutes.length; s++) {
        const st = initialData.multiStageRoutes[s];
        const stagePts = st.points.length;
        if (videoCurrentIndex <= cumulativePts + stagePts) {
          activeStageName = st.title || st.activityType.toUpperCase();
          currentStageIndex = s + 1;
          const isStRide = st.activityType === 'cycle' || st.title.toLowerCase().includes('ride');
          const isStRun = st.activityType === 'run' || st.title.toLowerCase().includes('run');
          const isStWalk = st.activityType === 'walk' || st.title.toLowerCase().includes('walk');
          activeStageColor = isStRide ? '#FC4C02' : isStRun ? '#06b6d4' : isStWalk ? '#10b981' : '#a855f7';
          break;
        }
        cumulativePts += stagePts;
      }
    } else {
      const isDrive = initialData.workoutType.toLowerCase().includes('drive') || initialData.workoutType.toLowerCase().includes('car');
      const isCycle = initialData.workoutType.toLowerCase().includes('cycle') || initialData.workoutType.toLowerCase().includes('ride');
      const isWalk = initialData.workoutType.toLowerCase().includes('walk');
      activeStageColor = isDrive ? '#38bdf8' : isCycle ? '#FC4C02' : isWalk ? '#10b981' : '#06b6d4';
    }

    const primaryColor = activeStageColor;
    const glowColor = `${primaryColor}80`;

    // Draw Glowing Path
    ctx.beginPath();
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let i = 0; i <= videoCurrentIndex; i++) {
      const px = toX(routePoints[i].longitude);
      const py = toY(routePoints[i].latitude);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 6;
    for (let i = 0; i <= videoCurrentIndex; i++) {
      const px = toX(routePoints[i].longitude);
      const py = toY(routePoints[i].latitude);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // 4. Start & Finish Point Pins
    const startPt = routePoints[0];
    const endPt = routePoints[totalPoints - 1];

    // Start Pin (Green)
    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.arc(toX(startPt.longitude), toY(startPt.latitude), 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Finish Pin (Red)
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(toX(endPt.longitude), toY(endPt.latitude), 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 5. Active Moving Athlete / Vehicle Marker
    const currentPoint = routePoints[videoCurrentIndex];
    const prevPoint = routePoints[Math.max(0, videoCurrentIndex - 1)];
    const ax = toX(currentPoint.longitude);
    const ay = toY(currentPoint.latitude);

    let heading = 0;
    const dLat = currentPoint.latitude - prevPoint.latitude;
    const dLng = currentPoint.longitude - prevPoint.longitude;
    if (Math.abs(dLat) > 0.00001 || Math.abs(dLng) > 0.00001) {
      heading = Math.atan2(dLng, dLat);
    }

    ctx.save();
    ctx.translate(ax, ay);
    ctx.rotate(heading);

    const isCurrentDrive = activeStageName.toLowerCase().includes('drive') || activeStageName.toLowerCase().includes('car');
    const isCurrentCycle = activeStageName.toLowerCase().includes('cycle') || activeStageName.toLowerCase().includes('ride');

    if (isCurrentDrive) {
      const coneGrad = ctx.createRadialGradient(0, -10, 5, 0, -90, 75);
      coneGrad.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
      coneGrad.addColorStop(0.4, 'rgba(250, 204, 21, 0.4)');
      coneGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = coneGrad;
      ctx.beginPath();
      ctx.moveTo(-6, -10);
      ctx.lineTo(-45, -90);
      ctx.lineTo(45, -90);
      ctx.lineTo(6, -10);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#0284c7';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-8, -14, 16, 28, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#bae6fd';
      ctx.beginPath();
      ctx.roundRect(-6, -8, 12, 6, 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(0, 0, 15, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    // 6. HUD & Overlays: Telemetry, Quotes, Brand & "Made with intention doing Kuchh Bhii"
    const progressRatio = totalPoints > 1 ? videoCurrentIndex / (totalPoints - 1) : 1;
    const currentDist = (totalDistNum * progressRatio).toFixed(2);
    const speedVal = currentPoint.speed ? (currentPoint.speed * 3.6).toFixed(1) : (isCurrentDrive ? '72.5' : isCurrentCycle ? '26.4' : '11.8');

    // Aesthetic Top Gradient Scrim for Story View
    const topGrad = ctx.createLinearGradient(0, 0, 0, 220);
    topGrad.addColorStop(0, 'rgba(5, 10, 20, 0.85)');
    topGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, w, 220);

    // Aesthetic Bottom Gradient Scrim
    const btmGrad = ctx.createLinearGradient(0, h - 260, 0, h);
    btmGrad.addColorStop(0, 'transparent');
    btmGrad.addColorStop(1, 'rgba(5, 10, 20, 0.92)');
    ctx.fillStyle = btmGrad;
    ctx.fillRect(0, h - 260, w, 260);

    if (showVideoTelemetry) {
      // Sleek Glassmorphic Top Telemetry Card
      const cardW = w - 64;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(32, 48, cardW, 140, 24);
      ctx.fill();
      ctx.stroke();

      // Top Accent glow bar
      ctx.fillStyle = primaryColor;
      ctx.beginPath();
      ctx.roundRect(32, 48, 10, 140, 5);
      ctx.fill();

      // Big Live Metric: Distance + Stage indicator
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 44px "Montserrat", sans-serif';
      ctx.fillText(`⚡ ${currentDist} km`, 60, 105);

      // Stage Pill & Details
      ctx.fillStyle = primaryColor;
      ctx.font = '800 22px "Montserrat", sans-serif';
      const stagePill = hasStages ? `STAGE ${currentStageIndex}/${totalStagesCount}: ${activeStageName.toUpperCase()}` : activeStageName.toUpperCase();
      ctx.fillText(`${stagePill} · ${speedVal} km/h`, 60, 145);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 16px "Montserrat", sans-serif';
      ctx.fillText(`⏱️ Active Elapsed: ${timeStat}`, 60, 172);
    }

    if (showVideoQuote) {
      // Sleek Bottom Glassmorphic Quote Card
      const quoteBoxW = w - 64;
      const quoteBoxH = 150;
      const quoteBoxY = h - 200;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.90)';
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(32, quoteBoxY, quoteBoxW, quoteBoxH, 24);
      ctx.fill();
      ctx.stroke();

      // Left Gold Bar
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.roundRect(32, quoteBoxY, 8, quoteBoxH, 4);
      ctx.fill();

      // Motivational Quote Text
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'italic 700 22px "Montserrat", sans-serif';
      const quoteSnippet = currentQuote.text.length > 75 ? currentQuote.text.substring(0, 72) + '...' : currentQuote.text;
      ctx.fillText(`"${quoteSnippet}"`, 56, quoteBoxY + 50);

      // Author
      ctx.fillStyle = '#FFD700';
      ctx.font = '800 18px "Montserrat", sans-serif';
      ctx.fillText(`— ${currentQuote.author.toUpperCase()}`, 56, quoteBoxY + 92);

      // Witty Signature
      ctx.fillStyle = '#06b6d4';
      ctx.font = '700 17px "Montserrat", sans-serif';
      ctx.fillText('⚡ Made with an intention of doing Kuchh Bhii by Sughosh 😉', 56, quoteBoxY + 125);
    }

    // Bottom Animated Neon Progress Bar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(0, h - 12, w, 12);
    ctx.fillStyle = primaryColor;
    ctx.fillRect(0, h - 12, w * progressRatio, 12);

  }, [studioMode, videoCurrentIndex, routePoints, totalPoints, videoMapTheme, initialData, customVideoUrl, photos, selectedPhotoIdx, scrimIntensity, showVideoTelemetry, showVideoQuote, currentQuote, mapTilesCache, mapTilesReady, timeStat, totalDistNum]);

  // Realistic Map Background Drawer with Cached Satellite / OSM Tiles
  function renderRealisticMapBackground(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    theme: VideoMapTheme,
    minLat: number,
    maxLat: number,
    minLng: number,
    maxLng: number,
    toX: (lng: number) => number,
    toY: (lat: number) => number
  ) {
    if (theme === 'neon') {
      // Cyber Neon Vector Map Grid
      ctx.fillStyle = '#05070e';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(204, 255, 0, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += 30) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
      const neonGlow = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w / 1.2);
      neonGlow.addColorStop(0, 'rgba(85, 25, 139, 0.25)');
      neonGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = neonGlow;
      ctx.fillRect(0, 0, w, h);
      return;
    }

    // Real-Time Satellite / OSM / Dark Canvas Tile Blitting
    let tilesRendered = 0;
    if (mapTilesCache.size > 0) {
      const latDiff = maxLat - minLat;
      const lngDiff = maxLng - minLng;
      const maxDiff = Math.max(latDiff, lngDiff);
      let zoom = 14;
      if (maxDiff > 0.4) zoom = 11;
      else if (maxDiff > 0.15) zoom = 12;
      else if (maxDiff > 0.05) zoom = 13;
      else if (maxDiff > 0.02) zoom = 14;
      else zoom = 15;

      const minTile = latLngToTile(maxLat, minLng, zoom);
      const maxTile = latLngToTile(minLat, maxLng, zoom);

      for (let tx = minTile.x - 1; tx <= maxTile.x + 1; tx++) {
        for (let ty = minTile.y - 1; ty <= maxTile.y + 1; ty++) {
          const key = `${theme}_${zoom}_${tx}_${ty}`;
          const img = mapTilesCache.get(key);
          if (img && img.complete && img.width > 1) {
            const b = tileToBoundingBox(tx, ty, zoom);
            const x1 = toX(b.minLng);
            const y1 = toY(b.maxLat);
            const x2 = toX(b.maxLng);
            const y2 = toY(b.minLat);
            const dw = x2 - x1;
            const dh = y2 - y1;
            ctx.drawImage(img, x1, y1, dw, dh);
            tilesRendered++;
          }
        }
      }
    }

    // If tiles are still loading or offline, draw rich atmospheric vector fallback
    if (tilesRendered === 0) {
      if (theme === 'satellite') {
        const satGrad = ctx.createLinearGradient(0, 0, w, h);
        satGrad.addColorStop(0, '#041019');
        satGrad.addColorStop(0.5, '#072433');
        satGrad.addColorStop(1, '#020b12');
        ctx.fillStyle = satGrad;
        ctx.fillRect(0, 0, w, h);
      } else if (theme === 'osm') {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
        ctx.lineWidth = 1;
        for (let x = 0; x < w; x += 45) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
        }
        for (let y = 0; y < h; y += 45) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        }
      } else {
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1;
        for (let x = 0; x < w; x += 40) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
        }
        for (let y = 0; y < h; y += 40) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        }
      }
    }

    // Darkened atmospheric scrim for route and telemetry legibility
    if (theme === 'satellite') {
      ctx.fillStyle = 'rgba(5, 10, 18, 0.35)';
      ctx.fillRect(0, 0, w, h);
    }
  }

  // 3. Export / Record Animated Video Clip (with Audio Track support)
  const handleRecordAndExportVideo = async (shouldShareDirectly: boolean = false) => {
    if (isRecordingVideo || !videoCanvasRef.current) return;

    try {
      setIsRecordingVideo(true);
      setRecordProgress(0);
      setVideoCurrentIndex(0);
      setIsVideoPlaying(false);

      const canvas = videoCanvasRef.current;
      const canvasStream = canvas.captureStream(60);

      // Mix Audio Track if user uploaded local audio or custom video has audio
      let combinedStream = canvasStream;
      if (customAudioUrl && userAudioElementRef.current) {
        try {
          userAudioElementRef.current.currentTime = audioStartTime;
          userAudioElementRef.current.play();
          // Capture audio stream
          // @ts-expect-error captureStream on HTMLMediaElement
          const audioStream: MediaStream = userAudioElementRef.current.captureStream ? userAudioElementRef.current.captureStream() : (userAudioElementRef.current.mozCaptureStream ? userAudioElementRef.current.mozCaptureStream() : null);
          if (audioStream && audioStream.getAudioTracks().length > 0) {
            const tracks = [...canvasStream.getVideoTracks(), ...audioStream.getAudioTracks()];
            combinedStream = new MediaStream(tracks);
          }
        } catch (e) {
          console.warn('Audio capture stream fallback:', e);
        }
      }

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
        ? 'video/webm;codecs=vp8,opus'
        : 'video/webm';

      recordedChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 6_000_000,
        audioBitsPerSecond: 192_000
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (userAudioElementRef.current) {
          userAudioElementRef.current.pause();
        }
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const fileName = `KuchhBhii_Track_${initialData.title.replace(/\s+/g, '_')}_${Date.now()}.webm`;
        const shareTitle = `${initialData.title} Video Track 🚀`;
        const shareText = `Check out my ${initialData.workoutType} track on Kuchh Bhii App! 🔥 "${currentQuote.text}" — Made with an intention of doing Kuchh Bhii by Sughosh 😉⚡`;

        // Convert blob to Base64 for AndroidBridge native file saving / sharing
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Data = reader.result as string;

          if (shouldShareDirectly) {
            if (window.AndroidBridge && typeof window.AndroidBridge.shareBase64Media === 'function') {
              const ok = window.AndroidBridge.shareBase64Media(base64Data, fileName, 'video/webm', shareTitle, shareText);
              if (ok) {
                setIsRecordingVideo(false);
                setRecordProgress(100);
                setToastMessage('Sharing video with audio to social apps... 🎶');
                setTimeout(() => setToastMessage(null), 3000);
                return;
              }
            }

            const videoFile = new File([blob], fileName, { type: 'video/webm' });
            if (navigator.canShare && navigator.canShare({ files: [videoFile] })) {
              try {
                await navigator.share({
                  title: shareTitle,
                  text: shareText,
                  files: [videoFile]
                });
                setIsRecordingVideo(false);
                setRecordProgress(100);
                return;
              } catch {
                // Fall through to download
              }
            }
          }

          // Direct Download: Try AndroidBridge first
          if (window.AndroidBridge && typeof window.AndroidBridge.downloadBase64File === 'function') {
            const saved = window.AndroidBridge.downloadBase64File(base64Data, fileName, 'video/webm');
            if (saved) {
              setIsRecordingVideo(false);
              setRecordProgress(100);
              setToastMessage('Video saved to Gallery / Storage! 🎬');
              setTimeout(() => setToastMessage(null), 3000);
              return;
            }
          }

          // Fallback browser download
          const videoUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = videoUrl;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setIsRecordingVideo(false);
          setRecordProgress(100);
          setToastMessage('Video Downloaded to Files! 🎬');
          setTimeout(() => setToastMessage(null), 3000);
        };
        reader.readAsDataURL(blob);
      };

      mediaRecorder.start();

      let stepIdx = 0;
      const totalSteps = totalPoints;
      // Precision calculation for selected videoPlaybackSpeed (0.5x, 1x, 2x, 5x)
      // At 0.5x speed, advance by 1 step every 40ms (~25 FPS real-time slow-motion)
      // At 1x speed, advance by 2 steps every 33ms (~60 FPS)
      // At 2x speed, advance by 4 steps every 33ms
      // At 5x speed, advance by 8 steps every 33ms
      const stepIncrement = videoPlaybackSpeed === 0.5 ? 1 : videoPlaybackSpeed === 1 ? 2 : videoPlaybackSpeed === 2 ? 4 : 8;
      const intervalDuration = videoPlaybackSpeed === 0.5 ? 40 : 33;

      const stepInterval = setInterval(() => {
        stepIdx += stepIncrement;
        if (stepIdx >= totalSteps) {
          clearInterval(stepInterval);
          setVideoCurrentIndex(totalSteps - 1);
          setRecordProgress(100);
          setTimeout(() => {
            if (mediaRecorder.state === 'recording') {
              mediaRecorder.stop();
            }
          }, 450);
        } else {
          setVideoCurrentIndex(stepIdx);
          setRecordProgress(Math.round((stepIdx / totalSteps) * 100));
        }
      }, intervalDuration);

    } catch (err) {
      console.error('Video recording failed:', err);
      setIsRecordingVideo(false);
    }
  };

  const handleMultiplePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const readers: Promise<string>[] = Array.from(files).map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (ev.target?.result) resolve(ev.target.result as string);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((newPhotos) => {
      setPhotos((prev) => {
        const updated = [...prev, ...newPhotos];
        setSelectedPhotoIdx(updated.length - 1);
        return updated;
      });
    });
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    setPhotos((prev) => {
      const updated = prev.filter((_, idx) => idx !== indexToRemove);
      if (selectedPhotoIdx >= updated.length) {
        setSelectedPhotoIdx(Math.max(0, updated.length - 1));
      }
      return updated;
    });
  };

  const handleShareNative = async () => {
    setIsSharing(true);
    await shareSocialCardNative(cardData, format);
    setIsSharing(false);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    await downloadSocialCardImage(cardData, format);
    setIsDownloading(false);
    setToastMessage('HD Poster saved to Gallery / Files! 🖼️');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleNextQuote = () => {
    setCurrentQuoteIndex((prev) => prev + 1);
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 10000 }}>
      {/* Hidden User Video Tag for Canvas Drawing */}
      {customVideoUrl && (
        <video
          ref={userVideoElementRef}
          src={customVideoUrl}
          autoPlay
          loop
          muted
          playsInline
          className="hidden"
          onLoadedMetadata={() => userVideoElementRef.current?.play()}
        />
      )}

      {/* Hidden User Audio Tag for Sound Track Mixing & Live Preview */}
      {customAudioUrl && (
        <audio
          ref={userAudioElementRef}
          src={customAudioUrl}
          loop
          crossOrigin="anonymous"
          className="hidden"
          onLoadedMetadata={(e) => {
            const dur = (e.target as HTMLAudioElement).duration || 0;
            setAudioTotalDuration(dur);
          }}
          onPlay={() => setIsAudioPreviewPlaying(true)}
          onPause={() => setIsAudioPreviewPlaying(false)}
        />
      )}

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-slate-900/95 border border-emerald-500/50 text-emerald-400 text-xs font-black py-2 px-4 rounded-full shadow-2xl z-[10001] flex items-center gap-2 animate-scale-up">
          <Check size={14} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="modal-content google-card animate-scale-up max-w-xl w-full max-h-[96vh] overflow-y-auto p-4 md:p-6 flex flex-col justify-between">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-glass pb-3 mb-2">
          <button
            className="btn-google-outlined text-xs flex items-center gap-1 py-1.5 px-3"
            onClick={onClose}
          >
            <ChevronLeft size={16} />
            <span>Back</span>
          </button>

          <div className="text-center">
            <span className="text-[10px] font-bold text-[#55198B] dark:text-[#c084fc] uppercase tracking-widest block">
              STRAVA MEDIA STUDIO
            </span>
            <h3 className="text-sm md:text-base font-black text-main mt-0.5">
              {studioMode === 'poster' ? 'Curate Share Poster' : 'Animated Track Video Clip'}
            </h3>
          </div>

          <button className="btn-google-icon" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Studio Mode Switcher Tabs */}
        <div className="flex items-center justify-center p-1 bg-black/30 rounded-full border border-glass mb-3 max-w-md mx-auto w-full">
          <button
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-4 rounded-full text-xs font-bold transition-all cursor-pointer ${
              studioMode === 'poster'
                ? 'bg-[#55198B] text-white shadow-md'
                : 'text-sub hover:text-main'
            }`}
            onClick={() => setStudioMode('poster')}
          >
            <ImageIcon size={14} />
            <span>Curated Poster</span>
          </button>

          <button
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-4 rounded-full text-xs font-bold transition-all cursor-pointer ${
              studioMode === 'video'
                ? 'bg-[#55198B] text-white shadow-md'
                : 'text-sub hover:text-main'
            }`}
            onClick={() => setStudioMode('video')}
          >
            <Video size={14} />
            <span>Track Video Clip</span>
          </button>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* MODE 1: CURATED POSTER STUDIO */}
        {/* ------------------------------------------------------------------- */}
        {studioMode === 'poster' && (
          <div className="flex flex-col gap-3">
            {/* Top Format & Template Switcher */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1 bg-black/20 p-1 rounded-full border border-glass">
                <button
                  className={format === 'story' ? 'btn-google-primary text-xs py-1 px-3 rounded-full' : 'text-xs text-sub py-1 px-3 rounded-full hover:text-main cursor-pointer'}
                  onClick={() => setFormat('story')}
                >
                  <Smartphone size={13} className="inline mr-1" />
                  <span>Story 9:16</span>
                </button>
                <button
                  className={format === 'square' ? 'btn-google-primary text-xs py-1 px-3 rounded-full' : 'text-xs text-sub py-1 px-3 rounded-full hover:text-main cursor-pointer'}
                  onClick={() => setFormat('square')}
                >
                  <Square size={13} className="inline mr-1" />
                  <span>Square 1:1</span>
                </button>
              </div>

              <div className="flex items-center gap-1 bg-black/20 p-1 rounded-full border border-glass">
                {(['strava_classic', 'minimal', 'cyber_neon'] as SocialCardTemplate[]).map((tmpl) => (
                  <button
                    key={tmpl}
                    onClick={() => setTemplate(tmpl)}
                    className={`text-xs py-1 px-2.5 rounded-full capitalize font-bold transition-all cursor-pointer ${
                      template === tmpl
                        ? 'bg-[#55198B] text-white shadow-md'
                        : 'text-sub hover:text-main'
                    }`}
                  >
                    {tmpl.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Poster Canvas Preview */}
            <div className="relative flex items-center justify-center bg-black/95 p-2 md:p-3 rounded-2xl border border-glass overflow-hidden max-h-[320px] shadow-2xl">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Social Workout Share Card Preview"
                  className="max-h-[300px] object-contain rounded-xl shadow-2xl"
                />
              ) : (
                <div className="h-56 flex items-center justify-center text-xs text-sub font-bold">
                  Rendering HD Strava Poster...
                </div>
              )}
            </div>

            {/* Custom Quote & Feeling Editor */}
            <div className="p-3 rounded-xl bg-card border border-glass flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-sub uppercase tracking-wider flex items-center gap-1">
                  <span>✍️ Workout Feeling / Custom Quote</span>
                </span>
                <div className="flex items-center gap-1 bg-black/20 p-0.5 rounded-full border border-glass">
                  <button
                    type="button"
                    onClick={() => setUseCustomQuote(true)}
                    className={`text-[10px] font-bold py-1 px-2 rounded-full transition-all ${
                      useCustomQuote ? 'bg-amber-500 text-black shadow-sm' : 'text-sub hover:text-main'
                    }`}
                  >
                    Custom Quote
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseCustomQuote(false)}
                    className={`text-[10px] font-bold py-1 px-2 rounded-full transition-all ${
                      !useCustomQuote ? 'bg-[#55198B] text-white shadow-sm' : 'text-sub hover:text-main'
                    }`}
                  >
                    Preset Quotes
                  </button>
                </div>
              </div>

              {useCustomQuote ? (
                <div className="flex flex-col gap-1.5 animate-fade-in">
                  <textarea
                    value={customQuoteText}
                    onChange={(e) => setCustomQuoteText(e.target.value)}
                    placeholder="Type what you're feeling after your workout..."
                    rows={2}
                    className="w-full bg-slate-900/60 border border-amber-500/40 rounded-xl p-2 text-xs text-main font-medium placeholder-zinc-500 outline-none focus:border-amber-400 transition-all resize-none"
                  />
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-1">
                      <span className="text-[10px] font-bold text-sub">Author:</span>
                      <input
                        type="text"
                        value={customQuoteAuthor}
                        onChange={(e) => setCustomQuoteAuthor(e.target.value)}
                        placeholder="Author"
                        className="bg-slate-900/60 border border-glass rounded-lg px-2 py-0.5 text-[11px] text-amber-400 font-bold outline-none flex-1"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-2 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <p className="text-xs font-medium text-main italic truncate flex-1">
                    "{defaultQuote.text}"
                  </p>
                  <button
                    className="btn-google-tonal text-xs py-1 px-2.5 flex items-center gap-1 rounded-full shrink-0"
                    onClick={handleNextQuote}
                    title="Cycle Motivational Quote"
                  >
                    <RefreshCw size={11} />
                    <span>Shuffle</span>
                  </button>
                </div>
              )}
            </div>

            {/* Custom Photo Management */}
            <div className="p-3 rounded-xl bg-card border border-glass">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-main">
                  <UploadCloud size={15} className="text-[#55198B] dark:text-[#c084fc]" />
                  <span>Custom Background Photos ({photos.length})</span>
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-google-tonal text-[11px] py-1 px-2.5 flex items-center gap-1"
                >
                  <Plus size={13} />
                  <span>Upload Photos</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleMultiplePhotoUpload}
                />
              </div>

              {photos.length > 0 ? (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {photos.map((photoUrl, idx) => {
                    const isSelected = selectedPhotoIdx === idx;
                    return (
                      <div
                        key={idx}
                        className={`relative group shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                          isSelected ? 'border-[#55198B] scale-105 shadow-md' : 'border-glass opacity-70 hover:opacity-100'
                        }`}
                        onClick={() => setSelectedPhotoIdx(idx)}
                      >
                        <img src={photoUrl} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                        {isSelected && (
                          <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-[#55198B] text-white flex items-center justify-center text-[9px] font-black">
                            ✓
                          </div>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemovePhoto(idx);
                          }}
                          className="absolute bottom-0.5 right-0.5 p-0.5 rounded bg-red-600/90 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove Photo"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[11px] text-sub italic">
                  No custom photos selected. Tap "Upload Photos" to pick background photos!
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2.5 pt-2 border-t border-glass text-xs">
                <div>
                  <div className="flex items-center justify-between text-sub mb-1">
                    <span className="flex items-center gap-1 font-semibold">
                      <Sliders size={12} />
                      <span>Photo Darkness / Dim</span>
                    </span>
                    <span className="font-bold">{Math.round(scrimIntensity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="0.9"
                    step="0.05"
                    value={scrimIntensity}
                    onChange={(e) => setScrimIntensity(parseFloat(e.target.value))}
                    className="w-full accent-[#55198B] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-semibold text-sub">
                    <MapPin size={13} className="text-orange-500" />
                    <span>Draw GPS Route on Photo</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowRouteOverlay(!showRouteOverlay)}
                    className={`py-1 px-3 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      showRouteOverlay
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'bg-card border border-glass text-sub'
                    }`}
                  >
                    {showRouteOverlay ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
            </div>

            {/* Poster Action Buttons: 1 Share Button and 1 Download Button */}
            <div className="grid grid-cols-2 gap-3 mt-1 pt-2 border-t border-glass">
              <button
                className="btn-google-primary text-xs py-3 rounded-full flex items-center justify-center gap-1.5 shadow-lg"
                onClick={handleShareNative}
                disabled={isSharing}
              >
                <Share2 size={16} />
                <span>{isSharing ? 'Sharing...' : 'Share to Social (WhatsApp/Insta)'}</span>
              </button>

              <button
                className="btn-google-tonal text-xs py-3 rounded-full flex items-center justify-center gap-1.5 shadow-lg"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                <Download size={16} />
                <span>{isDownloading ? 'Saving...' : 'Download HD PNG (Files)'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* MODE 2: ANIMATED TRACK VIDEO CLIP STUDIO */}
        {/* ------------------------------------------------------------------- */}
        {studioMode === 'video' && (
          <div className="flex flex-col gap-3">
            {/* Top Media & Map Theme Switcher */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1 bg-black/20 p-1 rounded-full border border-glass">
                {[
                  { id: 'satellite', label: '🛰️ Satellite' },
                  { id: 'osm', label: '🗺️ Map' },
                  { id: 'dark_canvas', label: '🌑 Dark Canvas' },
                  { id: 'neon', label: '⚡ Cyber Neon' }
                ].map((th) => (
                  <button
                    key={th.id}
                    onClick={() => {
                      setVideoMapTheme(th.id as VideoMapTheme);
                      setCustomVideoUrl(null);
                    }}
                    className={`text-xs py-1.5 px-3 rounded-full font-bold transition-all cursor-pointer ${
                      videoMapTheme === th.id && !customVideoUrl
                        ? 'bg-[#55198B] text-white shadow-md'
                        : 'text-sub hover:text-main'
                    }`}
                  >
                    {th.label}
                  </button>
                ))}
              </div>

              {/* Upload Custom Video / Photo Background */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => videoFileInputRef.current?.click()}
                  className={`btn-google-outlined text-[11px] py-1 px-2.5 flex items-center gap-1 rounded-full ${
                    customVideoUrl ? 'border-emerald-500 text-emerald-400 font-bold' : ''
                  }`}
                >
                  <Video size={12} />
                  <span>{customVideoUrl ? 'Custom Video Loaded' : 'Add My Video'}</span>
                </button>
                <input
                  ref={videoFileInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = URL.createObjectURL(file);
                    setCustomVideoUrl(url);
                    setVideoMapTheme('custom_media');
                    setToastMessage('Custom video loaded! 🎥');
                    setTimeout(() => setToastMessage(null), 3000);
                  }}
                />
              </div>
            </div>

            {/* Video Canvas Stage (Instagram Story 9:16 Aspect Ratio) */}
            <div className="relative flex items-center justify-center bg-black/95 p-1 rounded-2xl border border-glass overflow-hidden shadow-2xl">
              <canvas
                ref={videoCanvasRef}
                width={720}
                height={1280}
                className="w-full max-h-[390px] aspect-[9/16] object-contain rounded-xl"
              />

              {/* Video Playback Floating Overlay Bar */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-zinc-950/85 backdrop-blur-md py-1.5 px-3 rounded-full border border-zinc-800 shadow-xl">
                <div className="flex items-center gap-2">
                  <button
                    className="p-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 transition-all cursor-pointer"
                    onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                    title={isVideoPlaying ? 'Pause Animation' : 'Play Animation'}
                  >
                    {isVideoPlaying ? <Pause size={13} fill="#fff" /> : <Play size={13} fill="#fff" />}
                  </button>

                  <button
                    className="p-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 transition-all cursor-pointer"
                    onClick={() => {
                      setVideoCurrentIndex(0);
                      setIsVideoPlaying(true);
                    }}
                    title="Replay from Start"
                  >
                    <RotateCcw size={13} />
                  </button>
                </div>

                {/* Speed Selector: 0.5x, 1x, 2x, 5x */}
                <div className="flex items-center gap-1">
                  {[0.5, 1, 2, 5].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setVideoPlaybackSpeed(spd)}
                      className={`text-[11px] px-2 py-0.5 rounded-full font-bold transition-all ${
                        videoPlaybackSpeed === spd
                          ? 'bg-[#55198B] text-white shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Recording In-Progress Banner */}
              {isRecordingVideo && (
                <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-4 z-20">
                  <div className="w-12 h-12 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin mb-3" />
                  <h4 className="text-sm font-black text-white">Rendering HD Track Video Clip...</h4>
                  <p className="text-xs text-cyan-400 font-bold mt-1 font-mono">{recordProgress}% completed</p>
                  <div className="w-48 bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-cyan-400 h-full transition-all duration-100" style={{ width: `${recordProgress}%` }} />
                  </div>
                </div>
              )}
            </div>

            {/* Video Overlay Toggles: Telemetry & Quote */}
            <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-card border border-glass text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-sub font-semibold">
                  <MapPin size={12} className="text-orange-500" />
                  <span>Telemetry HUD</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowVideoTelemetry(!showVideoTelemetry)}
                  className={`py-0.5 px-2 rounded-full font-bold text-[11px] ${
                    showVideoTelemetry ? 'bg-orange-500 text-white' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {showVideoTelemetry ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-sub font-semibold">
                  <RefreshCw size={12} className="text-amber-400" />
                  <span>Quote & Joke Pill</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowVideoQuote(!showVideoQuote)}
                  className={`py-0.5 px-2 rounded-full font-bold text-[11px] ${
                    showVideoQuote ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {showVideoQuote ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            {/* Local Audio Soundtrack Selector & Precision Part/Trim Selector */}
            <div className="flex flex-col gap-2 p-3 rounded-2xl bg-card border border-glass text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-full bg-[#55198B]/20 text-[#c084fc]">
                    <Music size={14} />
                  </div>
                  <div>
                    <span className="font-bold text-main block text-[11px]">
                      {customAudioName ? `🎵 ${customAudioName}` : 'Add Local Device Audio (Song / BGM)'}
                    </span>
                    <span className="text-[10px] text-sub">
                      {customAudioUrl ? 'Choose which part of the song to play in your post' : 'MP3, WAV, AAC, M4A from your device'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {customAudioUrl && (
                    <button
                      onClick={() => {
                        if (userAudioElementRef.current) {
                          userAudioElementRef.current.pause();
                        }
                        setCustomAudioUrl(null);
                        setCustomAudioName(null);
                        setAudioStartTime(0);
                        setAudioTotalDuration(0);
                        setIsAudioPreviewPlaying(false);
                      }}
                      className="p-1 text-red-400 hover:text-red-300"
                      title="Remove Audio"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => audioFileInputRef.current?.click()}
                    className={`btn-google-outlined text-[11px] py-1 px-2.5 rounded-full font-bold ${
                      customAudioUrl ? 'border-emerald-500 text-emerald-400' : ''
                    }`}
                  >
                    {customAudioUrl ? 'Change Song' : 'Choose Song'}
                  </button>
                  <input
                    ref={audioFileInputRef}
                    type="file"
                    accept="audio/*,audio/mp3,audio/mpeg,audio/wav,audio/m4a,audio/aac,audio/ogg,.mp3,.wav,.m4a,.aac,.ogg,.opus,.flac"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      // Read as Data URL for robust playback on Android WebView & Safari
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        if (event.target?.result) {
                          setCustomAudioUrl(event.target.result as string);
                          setCustomAudioName(file.name);
                          setAudioStartTime(0);
                          setIsAudioPreviewPlaying(false);
                          setToastMessage(`Loaded: ${file.name} 🎵`);
                          setTimeout(() => setToastMessage(null), 3000);
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </div>
              </div>

              {/* Audio Part Trimmer & Live Preview Row */}
              {customAudioUrl && (
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-glass flex flex-col gap-2 mt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-cyan-400 flex items-center gap-1">
                      <span>✂️ Select Song Start Point:</span>
                      <span className="font-mono bg-cyan-950/80 px-1.5 py-0.5 rounded text-white border border-cyan-800">
                        {Math.floor(audioStartTime / 60)}:{String(Math.floor(audioStartTime % 60)).padStart(2, '0')}
                      </span>
                    </span>
                    <span className="text-[10px] text-sub font-mono">
                      Total: {Math.floor(audioTotalDuration / 60)}:{String(Math.floor(audioTotalDuration % 60)).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Scrubber Range */}
                  <input
                    type="range"
                    min={0}
                    max={Math.max(10, Math.floor(audioTotalDuration))}
                    step={1}
                    value={audioStartTime}
                    onChange={(e) => {
                      const newTime = Number(e.target.value);
                      setAudioStartTime(newTime);
                      if (userAudioElementRef.current) {
                        userAudioElementRef.current.currentTime = newTime;
                      }
                    }}
                    className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />

                  {/* Live Preview Button */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-zinc-400">
                      Plays starting from {Math.floor(audioStartTime / 60)}:{String(Math.floor(audioStartTime % 60)).padStart(2, '0')}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (!userAudioElementRef.current) return;
                        if (isAudioPreviewPlaying) {
                          userAudioElementRef.current.pause();
                        } else {
                          userAudioElementRef.current.currentTime = audioStartTime;
                          userAudioElementRef.current.play();
                        }
                      }}
                      className={`text-[11px] py-1 px-3 rounded-full font-bold flex items-center gap-1.5 transition-all shadow-md ${
                        isAudioPreviewPlaying
                          ? 'bg-amber-500 text-black'
                          : 'bg-[#55198B] text-white hover:bg-[#6c21b0]'
                      }`}
                    >
                      {isAudioPreviewPlaying ? <Pause size={12} /> : <Play size={12} />}
                      <span>{isAudioPreviewPlaying ? 'Pause Song Preview' : '🎧 Listen Preview'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Video Export & Share Actions */}
            <div className="grid grid-cols-2 gap-3 mt-1 pt-2 border-t border-glass">
              <button
                className="btn-google-primary text-xs py-3 rounded-full flex items-center justify-center gap-1.5 shadow-lg"
                onClick={() => handleRecordAndExportVideo(true)}
                disabled={isRecordingVideo}
              >
                <Share2 size={16} />
                <span>Share Video (Social Apps)</span>
              </button>

              <button
                className="btn-google-tonal text-xs py-3 rounded-full flex items-center justify-center gap-1.5 shadow-lg"
                onClick={() => handleRecordAndExportVideo(false)}
                disabled={isRecordingVideo}
              >
                <Download size={16} />
                <span>Download Video (.webm)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

