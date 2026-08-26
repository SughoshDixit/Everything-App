import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Layers
} from 'lucide-react';

interface SocialWorkoutShareModalProps {
  initialData: SocialShareCardData;
  quotesList?: MotivationalQuote[];
  onClose: () => void;
}

type ShareStudioMode = 'poster' | 'video';
type VideoMapTheme = 'dark_canvas' | 'osm' | 'satellite' | 'neon';

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
  const [copied, setCopied] = useState<boolean>(false);
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
  const [videoMapTheme, setVideoMapTheme] = useState<VideoMapTheme>('dark_canvas');
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(true);
  const [videoPlaybackSpeed, setVideoPlaybackSpeed] = useState<number>(2);
  const [videoCurrentIndex, setVideoCurrentIndex] = useState<number>(0);
  const [isRecordingVideo, setIsRecordingVideo] = useState<boolean>(false);
  const [recordProgress, setRecordProgress] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoAnimFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const defaultQuotes = [
    { text: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.', author: 'Aristotle' },
    { text: 'Do not pray for an easy life, pray for the strength to endure a difficult one.', author: 'Bruce Lee' },
    { text: 'You have power over your mind - not outside events. Realize this, and you will find strength.', author: 'Marcus Aurelius' },
    { text: 'Your work is to discover your work and then with all your heart to give yourself to it.', author: 'Bhagavad Gita' },
    { text: 'Talent without working hard is nothing.', author: 'Cristiano Ronaldo' }
  ];

  const activeQuotes = quotesList && quotesList.length > 0 ? quotesList : defaultQuotes;
  const currentQuote = activeQuotes[currentQuoteIndex % activeQuotes.length];

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

    // Background Theme
    if (videoMapTheme === 'dark_canvas') {
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    } else if (videoMapTheme === 'osm') {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.1)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
    } else if (videoMapTheme === 'satellite') {
      ctx.fillStyle = '#05121e';
      ctx.fillRect(0, 0, w, h);
      const grad = ctx.createRadialGradient(w / 2, h / 2, 50, w / 2, h / 2, w / 1.5);
      grad.addColorStop(0, '#0b2a3a');
      grad.addColorStop(1, '#020910');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    } else {
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, w, h);
    }

    // Coordinate Normalization
    let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
    routePoints.forEach((p) => {
      if (p.latitude < minLat) minLat = p.latitude;
      if (p.latitude > maxLat) maxLat = p.latitude;
      if (p.longitude < minLng) minLng = p.longitude;
      if (p.longitude > maxLng) maxLng = p.longitude;
    });

    const latR = maxLat - minLat || 0.001;
    const lngR = maxLng - minLng || 0.001;
    const padding = 50;
    const toX = (lng: number) => padding + ((lng - minLng) / lngR) * (w - padding * 2);
    const toY = (lat: number) => (h - padding) - ((lat - minLat) / latR) * (h - padding * 2);

    // Planned Base Path
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
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

    // Traversed Glowing Path
    const isDrive = initialData.workoutType.toLowerCase().includes('drive') || initialData.workoutType.toLowerCase().includes('car');
    const isCycle = initialData.workoutType.toLowerCase().includes('cycle') || initialData.workoutType.toLowerCase().includes('ride');
    const primaryColor = isDrive ? '#38bdf8' : isCycle ? '#FC4C02' : '#a855f7';
    const glowColor = isDrive ? 'rgba(56, 189, 248, 0.35)' : isCycle ? 'rgba(252, 76, 2, 0.35)' : 'rgba(168, 85, 247, 0.35)';

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
    ctx.lineWidth = 5;
    for (let i = 0; i <= videoCurrentIndex; i++) {
      const px = toX(routePoints[i].longitude);
      const py = toY(routePoints[i].latitude);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Active Athlete / Vehicle Marker
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

    if (isDrive) {
      const coneGrad = ctx.createRadialGradient(0, -10, 5, 0, -80, 70);
      coneGrad.addColorStop(0, 'rgba(254, 240, 138, 0.85)');
      coneGrad.addColorStop(0.5, 'rgba(250, 204, 21, 0.35)');
      coneGrad.addColorStop(1, 'rgba(250, 204, 21, 0)');
      ctx.fillStyle = coneGrad;
      ctx.beginPath();
      ctx.moveTo(-6, -10);
      ctx.lineTo(-40, -80);
      ctx.lineTo(40, -80);
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
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    // Top Video Telemetry HUD
    const progressRatio = totalPoints > 1 ? videoCurrentIndex / (totalPoints - 1) : 1;
    const totalDistNum = parseFloat(initialData.stats.find(s => s.label.toLowerCase().includes('dist'))?.value || '5.0') || 5.0;
    const currentDist = (totalDistNum * progressRatio).toFixed(2);
    const speedVal = currentPoint.speed ? (currentPoint.speed * 3.6).toFixed(1) : (isDrive ? '72.5' : isCycle ? '26.4' : '11.8');

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(16, 16, 260, 68, 14);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Montserrat, sans-serif';
    ctx.fillText(`${currentDist} km`, 32, 42);

    ctx.fillStyle = primaryColor;
    ctx.font = 'bold 12px Montserrat, sans-serif';
    ctx.fillText(`${speedVal} km/h • ${initialData.workoutType}`, 32, 62);

    // Progress Bar at Bottom
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(0, h - 6, w, 6);
    ctx.fillStyle = primaryColor;
    ctx.fillRect(0, h - 6, w * progressRatio, 6);

  }, [studioMode, videoCurrentIndex, routePoints, totalPoints, videoMapTheme, initialData]);

  // 3. Export / Record Animated Video Clip
  const handleRecordAndExportVideo = async (shouldShareDirectly: boolean = false) => {
    if (isRecordingVideo || !videoCanvasRef.current) return;

    try {
      setIsRecordingVideo(true);
      setRecordProgress(0);
      setVideoCurrentIndex(0);
      setIsVideoPlaying(false);

      const canvas = videoCanvasRef.current;
      const stream = canvas.captureStream(30);
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

      recordedChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(blob);
        setIsRecordingVideo(false);
        setRecordProgress(100);

        const fileName = `Strava_Activity_Track_${initialData.title.replace(/\s+/g, '_')}_${Date.now()}.webm`;
        const videoFile = new File([blob], fileName, { type: 'video/webm' });

        if (shouldShareDirectly && navigator.canShare && navigator.canShare({ files: [videoFile] })) {
          try {
            await navigator.share({
              title: initialData.title,
              text: `Check out my ${initialData.workoutType} track on Everything App! 🚀`,
              files: [videoFile]
            });
            return;
          } catch (_err) {
            // Fall through to download
          }
        }

        // Automatic Direct Download
        const a = document.createElement('a');
        a.href = videoUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      };

      mediaRecorder.start();

      let stepIdx = 0;
      const totalSteps = totalPoints;
      const stepInterval = setInterval(() => {
        stepIdx += 2;
        if (stepIdx >= totalSteps) {
          clearInterval(stepInterval);
          setVideoCurrentIndex(totalSteps - 1);
          setRecordProgress(100);
          setTimeout(() => {
            if (mediaRecorder.state === 'recording') {
              mediaRecorder.stop();
            }
          }, 300);
        } else {
          setVideoCurrentIndex(stepIdx);
          setRecordProgress(Math.round((stepIdx / totalSteps) * 100));
        }
      }, 33);

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
    await downloadSocialCardImage(cardData, format);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNextQuote = () => {
    setCurrentQuoteIndex((prev) => prev + 1);
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 10000 }}>
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

              <button
                className="absolute bottom-3 right-3 bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md text-amber-400 text-xs font-bold px-3 py-1.5 rounded-full border border-slate-700 flex items-center gap-1.5 shadow-xl transition-all cursor-pointer"
                onClick={handleNextQuote}
                title="Cycle Motivational Quote"
              >
                <RefreshCw size={12} />
                <span>Shuffle Quote</span>
              </button>
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

            {/* Poster Action Buttons */}
            <div className="grid grid-cols-2 gap-3 mt-1 pt-2 border-t border-glass">
              <button
                className="btn-google-primary text-xs py-2.5 rounded-full flex items-center justify-center gap-1.5"
                onClick={handleShareNative}
                disabled={isSharing}
              >
                <Share2 size={15} />
                <span>{isSharing ? 'Sharing...' : 'Share to Social'}</span>
              </button>

              <button
                className="btn-google-tonal text-xs py-2.5 rounded-full flex items-center justify-center gap-1.5"
                onClick={handleDownload}
              >
                {copied ? <Check size={15} className="text-emerald-500" /> : <Download size={15} />}
                <span>{copied ? 'Saved to Files!' : 'Download HD PNG'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* MODE 2: ANIMATED TRACK VIDEO CLIP STUDIO */}
        {/* ------------------------------------------------------------------- */}
        {studioMode === 'video' && (
          <div className="flex flex-col gap-3">
            {/* Map Theme Switcher */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-sub flex items-center gap-1">
                <Layers size={13} className="text-[#55198B] dark:text-[#c084fc]" />
                <span>Map Style:</span>
              </span>

              <div className="flex items-center gap-1 bg-black/20 p-1 rounded-full border border-glass">
                {[
                  { id: 'dark_canvas', label: 'Dark Canvas' },
                  { id: 'osm', label: 'OpenStreetMap' },
                  { id: 'satellite', label: 'Satellite' },
                  { id: 'neon', label: 'Cyber Neon' }
                ].map((th) => (
                  <button
                    key={th.id}
                    onClick={() => setVideoMapTheme(th.id as VideoMapTheme)}
                    className={`text-xs py-1 px-2.5 rounded-full font-bold transition-all cursor-pointer ${
                      videoMapTheme === th.id
                        ? 'bg-[#55198B] text-white shadow-md'
                        : 'text-sub hover:text-main'
                    }`}
                  >
                    {th.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Video Canvas Stage */}
            <div className="relative flex items-center justify-center bg-black/95 p-1 rounded-2xl border border-glass overflow-hidden shadow-2xl">
              <canvas
                ref={videoCanvasRef}
                width={640}
                height={360}
                className="w-full max-h-[300px] object-contain rounded-xl"
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

                <div className="flex items-center gap-1">
                  {[1, 2, 5].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setVideoPlaybackSpeed(spd)}
                      className={`text-[11px] px-2 py-0.5 rounded-full font-bold transition-all ${
                        videoPlaybackSpeed === spd
                          ? 'bg-[#55198B] text-white'
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

            {/* Video Export & Share Actions */}
            <div className="grid grid-cols-2 gap-3 mt-1 pt-2 border-t border-glass">
              <button
                className="btn-google-primary text-xs py-2.5 rounded-full flex items-center justify-center gap-1.5"
                onClick={() => handleRecordAndExportVideo(true)}
                disabled={isRecordingVideo}
              >
                <Share2 size={15} />
                <span>Share Video Directly</span>
              </button>

              <button
                className="btn-google-tonal text-xs py-2.5 rounded-full flex items-center justify-center gap-1.5"
                onClick={() => handleRecordAndExportVideo(false)}
                disabled={isRecordingVideo}
              >
                {copied ? <Check size={15} className="text-emerald-500" /> : <Download size={15} />}
                <span>{copied ? 'Video Downloaded!' : 'Download Video (.webm)'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

