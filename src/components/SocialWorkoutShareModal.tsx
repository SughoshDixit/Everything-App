import React, { useState, useEffect, useRef } from 'react';
import type { SocialShareCardData, MotivationalQuote, SocialCardTemplate } from '../types';
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
  Plus
} from 'lucide-react';

interface SocialWorkoutShareModalProps {
  initialData: SocialShareCardData;
  quotesList?: MotivationalQuote[];
  onClose: () => void;
}

export const SocialWorkoutShareModal: React.FC<SocialWorkoutShareModalProps> = ({
  initialData,
  quotesList,
  onClose
}) => {
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

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const defaultQuotes = [
    { text: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.', author: 'Aristotle' },
    { text: 'Do not pray for an easy life, pray for the strength to endure a difficult one.', author: 'Bruce Lee' },
    { text: 'You have power over your mind - not outside events. Realize this, and you will find strength.', author: 'Marcus Aurelius' },
    { text: 'Your work is to discover your work and then with all your heart to give yourself to it.', author: 'Bhagavad Gita' },
    { text: 'Talent without working hard is nothing.', author: 'Cristiano Ronaldo' }
  ];

  const activeQuotes = quotesList && quotesList.length > 0 ? quotesList : defaultQuotes;
  const currentQuote = activeQuotes[currentQuoteIndex % activeQuotes.length];

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

  // Re-generate Canvas preview whenever format, photo, scrim, template, or quote changes
  useEffect(() => {
    let isMounted = true;
    generateSocialCardCanvas(cardData, format).then((canvas) => {
      if (isMounted) {
        setPreviewUrl(canvas.toDataURL('image/png'));
      }
    });
    return () => {
      isMounted = false;
    };
  }, [format, currentQuoteIndex, photos, selectedPhotoIdx, scrimIntensity, showRouteOverlay, template]);

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
        setSelectedPhotoIdx(updated.length - 1); // select the latest uploaded photo
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
        {/* Header */}
        <div className="flex items-center justify-between border-b border-glass pb-3 mb-3">
          <button
            className="btn-google-outlined text-xs flex items-center gap-1 py-1.5 px-3"
            onClick={onClose}
          >
            <ChevronLeft size={16} />
            <span>Back</span>
          </button>

          <div className="text-center">
            <span className="text-[10px] font-bold text-[#55198B] dark:text-[#c084fc] uppercase tracking-widest block">
              STRAVA SOCIAL STUDIO
            </span>
            <h3 className="text-sm md:text-base font-black text-main mt-0.5">Workout Share Poster</h3>
          </div>

          <button className="btn-google-icon" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Top Controls: Format & Template Switcher */}
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          {/* Format (Story vs Square) */}
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

          {/* Template Style */}
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

        {/* Live Canvas Preview Stage */}
        <div className="relative flex items-center justify-center bg-black/95 p-2 md:p-3 rounded-2xl border border-glass my-1 overflow-hidden max-h-[360px] shadow-2xl">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Social Workout Share Card Preview"
              className="max-h-[340px] object-contain rounded-xl shadow-2xl"
            />
          ) : (
            <div className="h-60 flex items-center justify-center text-xs text-sub font-bold">
              Rendering HD Strava Poster...
            </div>
          )}

          {/* Quick Quote Cycler Floating Pill */}
          <button
            className="absolute bottom-3 right-3 bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md text-amber-400 text-xs font-bold px-3 py-1.5 rounded-full border border-slate-700 flex items-center gap-1.5 shadow-xl transition-all cursor-pointer"
            onClick={handleNextQuote}
            title="Cycle Motivational Quote"
          >
            <RefreshCw size={12} />
            <span>Shuffle Quote</span>
          </button>
        </div>

        {/* Custom Photo Management (Unlimited Photos) */}
        <div className="mt-3 p-3 rounded-xl bg-card border border-glass">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-main">
              <UploadCloud size={15} className="text-[#55198B] dark:text-[#c084fc]" />
              <span>Background Photos ({photos.length} uploaded)</span>
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

          {/* Photo Thumbnail Strip */}
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
              No custom photos selected. Tap "Upload Photos" to pick your running/cycling photos as the poster background!
            </p>
          )}

          {/* Photo Customization Controls: Scrim Slider & Route Overlay Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-2.5 border-t border-glass text-xs">
            {/* Scrim Darkness Slider */}
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

            {/* Route Overlay Toggle */}
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

        {/* Actions Grid: Share to WhatsApp / Instagram & Download PNG */}
        <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-glass">
          <button
            className="btn-google-primary text-xs py-3 rounded-full"
            onClick={handleShareNative}
            disabled={isSharing}
          >
            <Share2 size={16} />
            <span>{isSharing ? 'Sharing...' : 'Share (WhatsApp / Insta)'}</span>
          </button>

          <button
            className="btn-google-tonal text-xs py-3 rounded-full"
            onClick={handleDownload}
          >
            {copied ? <Check size={16} className="text-emerald-500" /> : <Download size={16} />}
            <span>{copied ? 'Saved to Gallery!' : 'Download HD PNG'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

