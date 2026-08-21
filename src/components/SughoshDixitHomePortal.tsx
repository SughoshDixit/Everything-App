import React, { useState } from 'react';
import type { TabType } from './Navigation';
import type { UserProfile, UserStats } from '../types';
import {
  Activity,
  Dumbbell,
  CalendarDays,
  Trophy,
  Utensils,
  Heart,
  Music,
  ExternalLink,
  BookOpen,
  TrendingUp,
  ArrowRight,
  Flame,
  Sparkles
} from 'lucide-react';

interface SughoshDixitHomePortalProps {
  currentProfile: UserProfile;
  stats: UserStats;
  onNavigateTab: (tab: TabType) => void;
  onOpenCreatePost?: () => void;
}

export const SughoshDixitHomePortal: React.FC<SughoshDixitHomePortalProps> = ({
  onNavigateTab,
  onOpenCreatePost
}) => {
  const [featuredSlideIndex, setFeaturedSlideIndex] = useState<number>(0);

  const featuredArticles = [
    {
      id: 'liverpool',
      title: 'Why Support Liverpool F.C? The Beautiful Game vs The Lazy Game',
      author: 'Sughosh P Dixit',
      date: 'Nov 13, 2025',
      readTime: '11 min read',
      tag: 'Football & Culture',
      excerpt: "Being an ardent Liverpool fan, I can tell you supporting Liverpool is not like supporting any ordinary club—it's a way of life. This is why football, the world's most followed sport, beats cricket every single time. It's time to embrace the beautiful game.",
      url: 'https://sughoshdixit.com/blogs/why-support-liverpool-f.c-the-beautiful-game-vs-the-lazy-game'
    },
    {
      id: 'titan',
      title: "Titan's Horological Revolution: Business Strategy Lessons from Xerxes Desai & JRD Tata",
      author: 'Sughosh P Dixit',
      date: 'Jan 24, 2026',
      readTime: '4 min read',
      tag: 'Business & Strategy',
      excerpt: "How an Indian industrial giant challenged Swiss quartz supremacy and built one of the world's most admired consumer brands through visionary design and indomitable execution.",
      url: 'https://sughoshdixit.com/blogs/titan-horological-revolution-business-strategy-lessons-from-xerxes-desai-and-jrd-tata'
    },
    {
      id: 'savarkar',
      title: "Dr. Vinayak Damodar Savarkar — The Underrated Colossus of Bharat's Freedom Struggle",
      author: 'Sughosh P Dixit',
      date: 'Feb 10, 2026',
      readTime: '8 min read',
      tag: 'Civilization & History',
      excerpt: "An unyielding exploration into the intellectual depth, revolutionary zeal, and civilizational vision of Swatantryaveer Savarkar.",
      url: 'https://sughoshdixit.com/blogs/dr.-vinayak-damodar-savarkar-the-underrated-colossus-of-bharat-freedom-struggle'
    }
  ];

  const activeArticle = featuredArticles[featuredSlideIndex % featuredArticles.length];

  return (
    <div className="portal-container animate-fade-in flex flex-col gap-8 pb-12 w-full max-w-6xl mx-auto">
      {/* ------------------------------------------------------------------- */}
      {/* 1. EDITORIAL HERO SECTION (IDENTICAL TO SUGHO SHDIXIT.COM) */}
      {/* ------------------------------------------------------------------- */}
      <section className="relative overflow-hidden rounded-3xl border border-glass bg-gradient-to-br from-[#1E1B18] via-[#161513] to-[#121110] text-[#F5F4F2] p-6 sm:p-10 shadow-2xl">
        {/* Subtle Background Grid Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.3fr_1fr] items-center">
          {/* Left Column: Personal Intro & Branding */}
          <div className="flex flex-col items-start">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C74634]/20 border border-[#C74634]/40 text-[#F5E4D3] text-xs font-bold uppercase tracking-widest mb-4">
              <Sparkles size={12} className="text-[#E8572A]" />
              <span>Data Science &bull; Football &bull; Discipline Suite</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white leading-tight tracking-tight mb-4">
              Hey, <span className="text-[#F5E4D3] underline decoration-[#C74634] decoration-2 underline-offset-8">Sughosh</span> here..
            </h1>

            <p className="text-sm sm:text-base text-[#B8E0D8] max-w-lg leading-relaxed mb-6 font-medium">
              Data scientist at Oracle. Small minds discuss people; strong minds discuss ideas. Welcome to my integrated performance ecosystem.
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-3 w-full sm:w-auto">
              <button
                className="btn-google-primary px-6 py-3 text-xs font-bold shadow-lg"
                onClick={() => onNavigateTab('fithub')}
              >
                <Activity size={16} />
                <span>Launch Fit Hub & Rings</span>
              </button>

              <a
                href="https://sughoshdixit.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-google-tonal px-5 py-3 text-xs font-bold flex items-center gap-2"
              >
                <span>sughoshdixit.com</span>
                <ExternalLink size={14} />
              </a>

              <a
                href="https://www.youtube.com/@sughoshdixit"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-google-outlined px-5 py-3 text-xs font-bold flex items-center gap-2 text-rose-400 border-rose-500/30"
              >
                <svg className="w-4 h-4 fill-current text-rose-500" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <span>YouTube</span>
              </a>
            </div>
          </div>

          {/* Right Column: Live Football Ticker & Featured Card */}
          <div className="flex flex-col gap-4">
            {/* Live Football News Ticker */}
            <div className="p-3.5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] uppercase tracking-widest text-[#B8E0D8] font-bold flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E8572A] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#C74634]" />
                  </span>
                  Live Football News
                </span>
                <span className="text-[10px] text-sub font-mono font-bold">LFC FOCUS</span>
              </div>
              <p className="text-xs text-white font-semibold line-clamp-1">
                ⚡ Tactical breakdown of 4-3-3 high-press wing play & explosive sprint recovery.
              </p>
            </div>

            {/* Featured Article Slider Card */}
            <div className="p-5 rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold text-[#B8E0D8]">{activeArticle.tag} &bull; {activeArticle.readTime}</span>
                  <div className="flex gap-1">
                    {featuredArticles.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setFeaturedSlideIndex(i)}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                          featuredSlideIndex === i ? 'w-5 bg-[#E8572A]' : 'w-2 bg-white/30'
                        }`}
                        aria-label={`Slide ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>

                <h3 className="text-base sm:text-lg font-serif font-bold text-white leading-snug mb-2 hover:text-[#F5E4D3] transition-colors">
                  <a href={activeArticle.url} target="_blank" rel="noopener noreferrer">
                    {activeArticle.title}
                  </a>
                </h3>

                <p className="text-xs text-[#B8E0D8] leading-relaxed line-clamp-2 mb-4">
                  {activeArticle.excerpt}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <span className="text-[10px] text-[#F5E4D3] font-bold uppercase">{activeArticle.date}</span>
                <a
                  href={activeArticle.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#F5E4D3] hover:text-white flex items-center gap-1"
                >
                  <span>Read Article</span>
                  <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------- */}
      {/* 2. THE EVERYTHING SUITE & PERFORMANCE LAUNCHPAD */}
      {/* ------------------------------------------------------------------- */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#C74634] uppercase tracking-widest block">
              PERFORMANCE & DISCIPLINE
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-main">
              Everything App Launchpad
            </h2>
          </div>
          {onOpenCreatePost && (
            <button
              className="btn-google-primary text-xs py-2 px-4 shadow-md"
              onClick={onOpenCreatePost}
            >
              <span>➕ Compile Post</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Tile 1: Fit Hub */}
          <div
            className="google-card p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:scale-[1.02] border-t-4 border-t-[#C74634]"
            onClick={() => onNavigateTab('fithub')}
          >
            <div className="w-11 h-11 rounded-2xl bg-[#C74634]/15 text-[#C74634] flex items-center justify-center text-xl mb-2">
              <Activity size={22} />
            </div>
            <h3 className="text-xs font-bold text-main">Fit Hub & Rings</h3>
            <p className="text-[11px] text-sub mt-0.5 font-medium">150 Pts/Wk & GPS</p>
          </div>

          {/* Tile 2: Strava Feed */}
          <div
            className="google-card p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:scale-[1.02] border-t-4 border-t-[#E8572A]"
            onClick={() => onNavigateTab('feed')}
          >
            <div className="w-11 h-11 rounded-2xl bg-[#E8572A]/15 text-[#E8572A] flex items-center justify-center text-xl mb-2">
              <Flame size={22} />
            </div>
            <h3 className="text-xs font-bold text-main">Strava Feed</h3>
            <p className="text-[11px] text-sub mt-0.5 font-medium">Timeline & Flyby</p>
          </div>

          {/* Tile 3: Calisthenics */}
          <div
            className="google-card p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:scale-[1.02] border-t-4 border-t-emerald-500"
            onClick={() => onNavigateTab('calisthenics')}
          >
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl mb-2">
              <Dumbbell size={22} />
            </div>
            <h3 className="text-xs font-bold text-main">Calisthenics</h3>
            <p className="text-[11px] text-sub mt-0.5 font-medium">Push Pull Squat</p>
          </div>

          {/* Tile 4: Routine */}
          <div
            className="google-card p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:scale-[1.02] border-t-4 border-t-indigo-500"
            onClick={() => onNavigateTab('routine')}
          >
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center text-xl mb-2">
              <CalendarDays size={22} />
            </div>
            <h3 className="text-xs font-bold text-main">Timetable & Habits</h3>
            <p className="text-[11px] text-sub mt-0.5 font-medium">Daily Tracking</p>
          </div>

          {/* Tile 5: Football Winger */}
          <div
            className="google-card p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:scale-[1.02] border-t-4 border-t-amber-500"
            onClick={() => onNavigateTab('football')}
          >
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center text-xl mb-2">
              <Trophy size={22} />
            </div>
            <h3 className="text-xs font-bold text-main">Football Winger</h3>
            <p className="text-[11px] text-sub mt-0.5 font-medium">Speed & Drills</p>
          </div>

          {/* Tile 6: Nutrition */}
          <div
            className="google-card p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:scale-[1.02] border-t-4 border-t-teal-500"
            onClick={() => onNavigateTab('nutrition')}
          >
            <div className="w-11 h-11 rounded-2xl bg-teal-500/15 text-teal-500 flex items-center justify-center text-xl mb-2">
              <Utensils size={22} />
            </div>
            <h3 className="text-xs font-bold text-main">Nutrition</h3>
            <p className="text-[11px] text-sub mt-0.5 font-medium">Diet & Hydration</p>
          </div>

          {/* Tile 7: Cycle Tracker */}
          <div
            className="google-card p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:scale-[1.02] border-t-4 border-t-rose-500"
            onClick={() => onNavigateTab('period')}
          >
            <div className="w-11 h-11 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center text-xl mb-2">
              <Heart size={22} />
            </div>
            <h3 className="text-xs font-bold text-main">Cycle Tracker</h3>
            <p className="text-[11px] text-sub mt-0.5 font-medium">Women Health</p>
          </div>

          {/* Tile 8: Music & Vedas */}
          <div
            className="google-card p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:scale-[1.02] border-t-4 border-t-violet-500"
            onClick={() => onNavigateTab('music_veda')}
          >
            <div className="w-11 h-11 rounded-2xl bg-violet-500/15 text-violet-500 flex items-center justify-center text-xl mb-2">
              <Music size={22} />
            </div>
            <h3 className="text-xs font-bold text-main">Music & Vedas</h3>
            <p className="text-[11px] text-sub mt-0.5 font-medium">Carnatic & Suktas</p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------- */}
      {/* 3. OUTCOME TRACKS (CURATED LEARNING & RESEARCH) */}
      {/* ------------------------------------------------------------------- */}
      <section className="flex flex-col gap-3">
        <div>
          <span className="text-[11px] font-bold text-[#C74634] uppercase tracking-widest block">
            CHOOSE BY OUTCOME
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-main">
            Get value in your first 10 minutes
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Track 1 */}
          <div className="google-card p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#C74634] mb-2">
                <BookOpen size={16} />
                <span>Civilization & History</span>
              </div>
              <h3 className="text-base font-serif font-bold text-main mb-2">
                Civilizational & National Thought
              </h3>
              <p className="text-xs text-sub leading-relaxed mb-4">
                Long-form historical perspectives and cultural analysis on Bharat and global orders.
              </p>
            </div>
            <a
              href="https://sughoshdixit.com/topic/Civilization"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-[#C74634] hover:underline flex items-center gap-1"
            >
              <span>Explore essays</span>
              <ArrowRight size={14} />
            </a>
          </div>

          {/* Track 2 */}
          <div className="google-card p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#E8572A] mb-2">
                <TrendingUp size={16} />
                <span>Intellectual Notes</span>
              </div>
              <h3 className="text-base font-serif font-bold text-main mb-2">
                Book Summaries & Strategy
              </h3>
              <p className="text-xs text-sub leading-relaxed mb-4">
                Absorb key ideas quickly on business, global economics, geopolitics, and deep tech.
              </p>
            </div>
            <a
              href="https://sughoshdixit.com/topic/Book"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-[#E8572A] hover:underline flex items-center gap-1"
            >
              <span>Browse book notes</span>
              <ArrowRight size={14} />
            </a>
          </div>

          {/* Track 3 */}
          <div className="google-card p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                <Trophy size={16} />
                <span>Sport & Analytics</span>
              </div>
              <h3 className="text-base font-serif font-bold text-main mb-2">
                Football Lens & Tactics
              </h3>
              <p className="text-xs text-sub leading-relaxed mb-4">
                Tactical narratives, match analysis, and winger performance science.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('football')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 text-left"
            >
              <span>Launch Football Hub</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------- */}
      {/* 4. FEATURED DOCUMENTARY SPOTLIGHT & SIGNALS */}
      {/* ------------------------------------------------------------------- */}
      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr] items-start">
        {/* Documentary Card */}
        <div className="google-card overflow-hidden p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#C74634] uppercase tracking-wider">
              FEATURED CINEMATIC DOCUMENTARY
            </span>
            <span className="badge-pill bg-[#C74634]/20 text-[#C74634] text-[10px] font-bold">
              AI GENERATED
            </span>
          </div>

          <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-glass shadow-inner bg-black">
            <iframe
              title="Veer Savarkar AI cinematic documentary"
              src="https://www.youtube.com/embed/5fBTT9MwQio?rel=0"
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <div>
            <h3 className="text-base font-serif font-bold text-main">
              Veer Savarkar — AI Cinematic Documentary
            </h3>
            <p className="text-xs text-sub mt-1 leading-relaxed">
              A NotebookLM-powered documentary that captures the civilizational thread and revolutionary life of Veer Savarkar in one cinematic narrative.
            </p>
          </div>
        </div>

        {/* Signals & Research Pulse */}
        <div className="flex flex-col gap-4">
          <div className="google-card p-5">
            <h3 className="text-sm font-serif font-bold text-main mb-3">
              Research Pulse & Signals
            </h3>

            <div className="flex flex-col gap-2.5">
              <div className="p-3 rounded-2xl bg-card border border-glass flex items-center justify-between">
                <span className="text-xs text-sub font-medium">Model Drift Status</span>
                <span className="text-xs font-bold text-emerald-500 font-mono">Low (Stable)</span>
              </div>

              <div className="p-3 rounded-2xl bg-card border border-glass flex items-center justify-between">
                <span className="text-xs text-sub font-medium">Prominent Long-Form Essays</span>
                <span className="text-xs font-black font-mono text-main">6</span>
              </div>

              <div className="p-3 rounded-2xl bg-card border border-glass flex items-center justify-between">
                <span className="text-xs text-sub font-medium">Curated Topics</span>
                <span className="text-xs font-black font-mono text-main">5</span>
              </div>

              <div className="p-3 rounded-2xl bg-card border border-glass flex items-center justify-between">
                <span className="text-xs text-sub font-medium">Athlete Streak</span>
                <span className="text-xs font-bold text-[#E8572A] font-mono">14 Days Active</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
