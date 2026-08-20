import React, { useState, useEffect } from 'react';
import type { SocialShareCardData, MotivationalQuote } from '../types';
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
  Check
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
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState<number>(0);
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');

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
    quoteAuthor: currentQuote.author
  };

  // Re-generate Canvas preview whenever format or quote changes
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
  }, [format, currentQuoteIndex, initialData]);

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
      <div className="modal-content google-card animate-scale-up max-w-lg w-full max-h-[94vh] overflow-y-auto p-5 md:p-6 flex flex-col justify-between">
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
            <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">
              SOCIAL SHARE STUDIO
            </span>
            <h3 className="text-sm md:text-base font-black text-main mt-0.5">Workout Share Card</h3>
          </div>

          <button className="btn-google-icon" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Format Selector Pills (Story 9:16 vs Square 1:1) */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <button
            className={format === 'story' ? 'btn-google-primary text-xs py-1.5 px-3.5' : 'btn-google-outlined text-xs py-1.5 px-3.5'}
            onClick={() => setFormat('story')}
          >
            <Smartphone size={14} />
            <span>Story (9:16)</span>
          </button>

          <button
            className={format === 'square' ? 'btn-google-primary text-xs py-1.5 px-3.5' : 'btn-google-outlined text-xs py-1.5 px-3.5'}
            onClick={() => setFormat('square')}
          >
            <Square size={14} />
            <span>Square (1:1)</span>
          </button>
        </div>

        {/* Card Live Preview Stage */}
        <div className="relative flex items-center justify-center bg-black/95 p-3 rounded-2xl border border-glass my-2 overflow-hidden max-h-[380px] shadow-xl">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Social Workout Share Card Preview"
              className="max-h-[360px] object-contain rounded-xl shadow-2xl"
            />
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-sub font-bold">
              Rendering HD Poster...
            </div>
          )}

          {/* Quick Quote Cycler Floating Pill */}
          <button
            className="absolute bottom-4 bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md text-amber-400 text-xs font-bold px-3.5 py-1.5 rounded-full border border-slate-700 flex items-center gap-1.5 shadow-xl transition-all cursor-pointer"
            onClick={handleNextQuote}
            title="Cycle Motivational Quote"
          >
            <RefreshCw size={13} />
            <span>Shuffle Quote</span>
          </button>
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
            <span>{copied ? 'Saved to Gallery!' : 'Download PNG'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
