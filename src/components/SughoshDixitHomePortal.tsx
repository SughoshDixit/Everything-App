import React, { useState, useEffect } from 'react';
import type { TabType } from './Navigation';
import type { UserProfile, UserStats } from '../types';
import {
  Search,
  Moon,
  Sun,
  Menu,
  X,
  ExternalLink,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

interface SughoshDixitHomePortalProps {
  currentProfile?: UserProfile;
  stats?: UserStats;
  onNavigateTab: (tab: TabType) => void;
  onOpenCreatePost?: () => void;
}

export const SughoshDixitHomePortal: React.FC<SughoshDixitHomePortalProps> = ({
  onNavigateTab,
  onOpenCreatePost
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [featuredIndex, setFeaturedIndex] = useState(0);

  useEffect(() => {
    const savedTheme = localStorage.getItem('everything_app_theme') || 'dark';
    setTheme(savedTheme as 'dark' | 'light');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('everything_app_theme', newTheme);
  };

  const featuredStories = [
    {
      id: 'liverpool',
      title: 'Why Support Liverpool F.C? The Beautiful Game vs The Lazy Game',
      date: '2025-11-13',
      readTime: '11 min read',
      tag: 'Football & Culture',
      excerpt: "Being an ardent Liverpool fan, I can tell you supporting Liverpool is not like supporting any ordinary club—it's a way of life. This is why football, the world's most followed sport, beats cricket every single time. It's time to stop watching the lazy game and embrace the beautiful game.",
      url: 'https://sughoshdixit.com/blogs/why-support-liverpool-f.c-the-beautiful-game-vs-the-lazy-game'
    },
    {
      id: 'savarkar',
      title: "Dr. Vinayak Damodar Savarkar — The Underrated Colossus of Bharat's Freedom Struggle",
      date: '2026-04-05',
      readTime: '8 min read',
      tag: 'Civilization',
      excerpt: "I was invited to give a session on Dr. Vinayak Damodar Savarkar — one of the most consequential yet misunderstood figures of Bharat's freedom struggle. Here is my in-depth analysis.",
      url: 'https://sughoshdixit.com/blogs/dr.-vinayak-damodar-savarkar-the-underrated-colossus-of-bharat-freedom-struggle'
    },
    {
      id: 'titan',
      title: "Titan's Horological Revolution: Business Strategy Lessons from Xerxes Desai & JRD Tata",
      date: '2026-06-16',
      readTime: '4 min read',
      tag: 'Business',
      excerpt: "How an Indian industrial giant challenged Swiss quartz supremacy and built one of the world's most admired consumer brands through visionary design and indomitable execution.",
      url: 'https://sughoshdixit.com/blogs/titan-horological-revolution-business-strategy-lessons-from-xerxes-desai-and-jrd-tata'
    }
  ];

  const trendingEssays = [
    {
      rank: '01',
      title: "Dr. Vinayak Damodar Savarkar — The Underrated Colossus of Bharat's Freedom Struggle",
      author: 'Sughosh P Dixit',
      date: '2026-04-05',
      readTime: '8 min read',
      excerpt: "I was invited to give a session on Dr. Vinayak Damodar Savarkar — one of the most consequential yet misunderstood figures of Bharat's freedom struggle. With little time to prepare, I bought a detailed book and an Amar Chitra Katha comic on him, read both cover to cover, and here is my take.",
      url: 'https://sughoshdixit.com/blogs/dr.-vinayak-damodar-savarkar-the-underrated-colossus-of-bharat-freedom-struggle'
    },
    {
      rank: '02',
      title: 'Why Support Liverpool F.C? The Beautiful Game vs The Lazy Game',
      author: 'Sughosh P Dixit',
      date: '2025-11-13',
      readTime: '11 min read',
      excerpt: "Being an ardent Liverpool fan, I can tell you supporting Liverpool is not like supporting any ordinary club—it's a way of life. This is why football, the world's most followed sport, beats cricket every single time. It's time to stop watching the lazy game and embrace the beautiful game.",
      url: 'https://sughoshdixit.com/blogs/why-support-liverpool-f.c-the-beautiful-game-vs-the-lazy-game'
    },
    {
      rank: '03',
      title: 'India in a Shifting Global Order — Book Notes',
      author: 'Sughosh P Dixit',
      date: '2024-12-31',
      readTime: '5 min read',
      excerpt: 'A comprehensive blurb and analytical breakdown of a book exploring the Indian strategic perspective in the rapidly changing geopolitical world order.',
      url: 'https://sughoshdixit.com/blogs/india-in-a-shifting-global-order-book-notes'
    },
    {
      rank: '04',
      title: 'Five Years at Oracle: From Cloud Analyst to Data Scientist',
      author: 'Sughosh P Dixit',
      date: '2024-12-27',
      readTime: '5 min read',
      excerpt: 'My journey at Oracle from being a fresh graduate hire to building enterprise AI and machine learning solutions as a Data Scientist.',
      url: 'https://sughoshdixit.com/blogs/five-years-at-oracle-from-cloud-analyst-to-data-scientist'
    }
  ];

  const wordCloudKeywords = [
    { text: 'Data Science', size: 'text-base font-bold', color: 'bg-[#C74634]/15 text-[#E8572A] border-[#C74634]/30' },
    { text: 'Statistics', size: 'text-sm font-semibold', color: 'bg-teal-500/15 text-teal-400 border-teal-500/30' },
    { text: 'AI', size: 'text-base font-bold', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    { text: 'Machine Learning', size: 'text-sm font-medium', color: 'bg-teal-500/15 text-teal-400 border-teal-500/30' },
    { text: 'Civilization', size: 'text-base font-bold', color: 'bg-[#C74634]/15 text-[#E8572A] border-[#C74634]/30' },
    { text: 'Indian Knowledge Systems', size: 'text-sm font-medium', color: 'bg-violet-500/15 text-violet-400 border-violet-500/30' },
    { text: 'Football', size: 'text-sm font-semibold', color: 'bg-teal-500/15 text-teal-400 border-teal-500/30' },
    { text: 'Bayesian', size: 'text-xs font-normal', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    { text: 'Nonparametric', size: 'text-xs font-normal', color: 'bg-[#C74634]/15 text-[#E8572A] border-[#C74634]/30' },
    { text: 'Robust Methods', size: 'text-xs font-normal', color: 'bg-teal-500/15 text-teal-400 border-teal-500/30' },
    { text: 'Hypothesis Testing', size: 'text-xs font-normal', color: 'bg-violet-500/15 text-violet-400 border-violet-500/30' },
    { text: 'Causal Thinking', size: 'text-xs font-normal', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    { text: 'Generative AI', size: 'text-sm font-bold', color: 'bg-[#C74634]/15 text-[#E8572A] border-[#C74634]/30' },
    { text: 'LLMs', size: 'text-xs font-medium', color: 'bg-teal-500/15 text-teal-400 border-teal-500/30' },
    { text: 'LoRA', size: 'text-xs font-normal', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    { text: 'Oracle Cloud', size: 'text-xs font-medium', color: 'bg-violet-500/15 text-violet-400 border-violet-500/30' },
    { text: 'Time Series', size: 'text-xs font-normal', color: 'bg-teal-500/15 text-teal-400 border-teal-500/30' },
    { text: 'Vedic Studies', size: 'text-xs font-medium', color: 'bg-violet-500/15 text-violet-400 border-violet-500/30' },
    { text: 'Productivity', size: 'text-xs font-normal', color: 'bg-teal-500/15 text-teal-400 border-teal-500/30' }
  ];

  const currentFeatured = featuredStories[featuredIndex % featuredStories.length];

  return (
    <div className="index-portal min-h-screen bg-[#FAF8F6] dark:bg-[#161513] text-[#161513] dark:text-[#F5F4F2] transition-colors duration-300 font-sans -mx-4 sm:-mx-8 -my-6">
      <style>{`
        .font-serif-title { font-family: 'Charter', 'Georgia', serif; }
        .rw-btn-primary {
          background-color: #C74634;
          color: #ffffff;
          border-radius: 9999px;
          transition: all 0.2s ease;
        }
        .rw-btn-primary:hover {
          background-color: #A73A2C;
          transform: translateY(-1px);
        }
        .rw-btn-ghost {
          border: 1px solid rgba(224, 221, 217, 0.6);
          border-radius: 9999px;
          color: inherit;
          transition: all 0.2s ease;
        }
        .dark .rw-btn-ghost {
          border-color: rgba(61, 58, 54, 0.8);
        }
        .rw-btn-ghost:hover {
          border-color: #C74634;
          color: #C74634;
        }
      `}</style>

      {/* ------------------------------------------------------------------- */}
      {/* 1. TOP HEADER (PORTFOLIO NAVBAR) */}
      {/* ------------------------------------------------------------------- */}
      <header className="sticky top-0 z-40 bg-[#FAF8F6]/90 dark:bg-[#201E1C]/90 border-b border-[#E0DDD9] dark:border-[#3D3A36] backdrop-blur-xl transition-all duration-300 px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand & Monogram */}
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open Navigation Menu"
            >
              <Menu size={22} />
            </button>

            <a href="https://sughoshdixit.com" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-full bg-[#C74634] text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-md transition-transform group-hover:scale-105">
                SD
              </div>
              <span className="text-xl font-bold tracking-tight font-serif-title text-[#161513] dark:text-white">
                Sughosh Dixit
              </span>
            </a>
          </div>

          {/* Desktop Search Bar (Ctrl+K) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <button
              onClick={() => setSearchModalOpen(true)}
              className="w-full flex items-center justify-between px-4 py-2 bg-white/80 dark:bg-[#2C2A27] rounded-full text-[#6E6B68] dark:text-[#B8B4B0] hover:bg-white dark:hover:bg-[#3D3A36] transition-colors border border-[#E0DDD9] dark:border-[#3D3A36] shadow-sm text-xs"
            >
              <div className="flex items-center gap-2">
                <Search size={14} />
                <span>Search articles, topics...</span>
              </div>
              <kbd className="px-2 py-0.5 text-[10px] font-medium bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Nav Links & Controls */}
          <div className="flex items-center gap-3 sm:gap-4">
            <nav className="hidden xl:flex items-center space-x-6 text-sm text-[#6E6B68] dark:text-[#F5F4F2] font-medium">
              <a href="https://sughoshdixit.com/start-here" className="hover:text-[#C74634] transition-colors">Start Here</a>
              <a href="https://sughoshdixit.com/projects" className="hover:text-[#C74634] transition-colors">Portfolio</a>
              <a href="https://sughoshdixit.com/garden" className="hover:text-[#C74634] transition-colors">Garden</a>
              <a href="https://sughoshdixit.com/consulting" className="hover:text-[#C74634] transition-colors">Consulting</a>
              <a href="https://sughoshdixit.com/about" className="hover:text-[#C74634] transition-colors">About</a>
              <button onClick={() => onNavigateTab('fithub')} className="text-[#C74634] font-bold hover:underline">
                Fit Hub
              </button>
            </nav>

            {/* Theme Switcher Button */}
            <button
              className="p-2 rounded-full text-[#6E6B68] dark:text-[#B8B4B0] hover:text-gray-900 dark:hover:text-white transition-colors"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
            </button>

            {/* Direct Suite Button */}
            <button
              onClick={() => onNavigateTab('fithub')}
              className="rw-btn-primary px-4 py-1.5 text-xs font-bold shadow-sm"
            >
              Fit Suite
            </button>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------------- */}
      {/* 2. MOBILE DRAWER SIDEBAR */}
      {/* ------------------------------------------------------------------- */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-80 max-w-[85vw] h-full bg-white dark:bg-[#201E1C] border-r border-[#E0DDD9] dark:border-[#3D3A36] p-6 flex flex-col justify-between overflow-y-auto z-10 shadow-2xl">
            <div>
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#E0DDD9] dark:border-[#3D3A36]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#C74634] text-white flex items-center justify-center font-bold text-xs">
                    SD
                  </div>
                  <h2 className="text-lg font-bold font-serif-title">Sughosh Dixit</h2>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-sub">
                  <X size={20} />
                </button>
              </div>

              <nav className="space-y-3 font-medium text-sm">
                <button
                  onClick={() => { setMobileMenuOpen(false); onNavigateTab('home'); }}
                  className="w-full text-left py-2 px-3 rounded-xl bg-[#C74634]/10 text-[#C74634] font-bold"
                >
                  🏠 Home Portal
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); onNavigateTab('fithub'); }}
                  className="w-full text-left py-2 px-3 rounded-xl hover:bg-card text-main"
                >
                  📊 Google Fit Hub & Rings
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); onNavigateTab('feed'); }}
                  className="w-full text-left py-2 px-3 rounded-xl hover:bg-card text-main"
                >
                  🏃 Strava Activity Feed
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); onNavigateTab('calisthenics'); }}
                  className="w-full text-left py-2 px-3 rounded-xl hover:bg-card text-main"
                >
                  💪 Calisthenics Playbook
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); onNavigateTab('football'); }}
                  className="w-full text-left py-2 px-3 rounded-xl hover:bg-card text-main"
                >
                  ⚽ Football Winger Drills
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); onNavigateTab('routine'); }}
                  className="w-full text-left py-2 px-3 rounded-xl hover:bg-card text-main"
                >
                  📅 Daily Habits & Timetable
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); onNavigateTab('nutrition'); }}
                  className="w-full text-left py-2 px-3 rounded-xl hover:bg-card text-main"
                >
                  🥗 Nutrition & Recovery
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); onNavigateTab('music_veda'); }}
                  className="w-full text-left py-2 px-3 rounded-xl hover:bg-card text-main"
                >
                  🎵 Music & Vedas
                </button>
              </nav>
            </div>

            <div className="pt-6 border-t border-[#E0DDD9] dark:border-[#3D3A36]">
              <div className="flex gap-4 text-sub">
                <a href="https://github.com/SughoshDixit" target="_blank" rel="noopener noreferrer" className="hover:text-[#C74634]">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                </a>
                <a href="https://linkedin.com/in/sughosh-dixit" target="_blank" rel="noopener noreferrer" className="hover:text-[#C74634]">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>
                <a href="https://youtube.com/@sughoshdixit" target="_blank" rel="noopener noreferrer" className="hover:text-[#C74634]">
                  <svg className="w-5 h-5 fill-current text-rose-500" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
                <a href="https://twitter.com/PSughosh" target="_blank" rel="noopener noreferrer" className="hover:text-[#C74634]">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 3. HERO SECTION (RW-HERO IDENTICAL TO SUGHO SHDIXIT.COM) */}
      {/* ------------------------------------------------------------------- */}
      <section className="relative overflow-hidden border-b border-[#E0DDD9] dark:border-[#3D3A36] bg-[#161513] text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr] items-center">
            {/* Left Column */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
              <p className="text-xs sm:text-sm font-medium uppercase tracking-[0.2em] text-[#B8E0D8]/80 mb-4">
                Data Science · Football · Personal Essays · Ideas
              </p>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.15] text-white mb-6 font-serif-title">
                Hey, <span className="text-[#F5E4D3]">Sughosh</span> here..
              </h1>

              <p className="text-base sm:text-xl text-[#B8E0D8] max-w-xl leading-relaxed mb-10">
                Data scientist at Oracle. Small minds discuss people; strong minds discuss ideas.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                <a
                  href="#latest-posts"
                  className="rw-btn-primary inline-flex items-center justify-center px-8 py-3.5 text-sm font-bold shadow-lg"
                >
                  Read the latest
                </a>
                <a
                  href="https://www.youtube.com/@sughoshdixit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rw-btn-ghost inline-flex items-center gap-2 justify-center px-7 py-3.5 text-sm font-medium text-white"
                >
                  <svg className="w-5 h-5 fill-current text-rose-500" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  <span>YouTube</span>
                </a>
                <a
                  href="https://sughoshdixit.com/about"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rw-btn-ghost inline-flex items-center justify-center px-7 py-3.5 text-sm font-medium text-white"
                >
                  About me
                </a>
              </div>
            </div>

            {/* Right Column: Live Football Ticker & Featured Card */}
            <div className="space-y-4 w-full max-w-md mx-auto lg:max-w-none">
              {/* Football Ticker */}
              <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md px-4 py-3 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-[#B8E0D8]/80 flex items-center gap-2 m-0 font-bold">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E8572A] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C74634]" />
                    </span>
                    Live Football News
                  </p>
                  <span className="text-[10px] text-white/50 font-mono">ANALYTICS</span>
                </div>
                <p className="text-xs text-white/90 font-medium">
                  Why Liverpool's pressing metrics represent the ultimate synergy of data science and tactical discipline.
                </p>
              </div>

              {/* Featured Essay Card */}
              <article className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md shadow-xl p-6 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center flex-wrap gap-x-2 text-xs text-[#B8E0D8]/80 font-medium">
                    <span>Sughosh P Dixit</span>
                    <span>·</span>
                    <span>{currentFeatured.date}</span>
                    <span>·</span>
                    <span>{currentFeatured.readTime}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {featuredStories.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setFeaturedIndex(i)}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                          featuredIndex === i ? 'w-4 bg-[#E8572A]' : 'w-1.5 bg-white/20'
                        }`}
                        aria-label={`Story ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>

                <h2 className="text-xl sm:text-2xl text-white font-semibold leading-tight font-serif-title">
                  <a href={currentFeatured.url} target="_blank" rel="noopener noreferrer" className="hover:text-[#F5E4D3] transition-colors">
                    {currentFeatured.title}
                  </a>
                </h2>

                <p className="text-xs sm:text-sm text-[#B8E0D8] leading-relaxed line-clamp-3">
                  {currentFeatured.excerpt}
                </p>

                <div className="flex items-center justify-between pt-2">
                  <span className="inline-block px-3 py-1 rounded-full bg-[#C74634] text-white text-[10px] font-bold uppercase">
                    Featured
                  </span>
                  <a
                    href={currentFeatured.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#F5E4D3] hover:text-white font-bold flex items-center gap-1"
                  >
                    <span>Read Full Essay</span>
                    <ArrowRight size={13} />
                  </a>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------- */}
      {/* 4. CHOOSE BY OUTCOME (3 CURATED TRACKS) */}
      {/* ------------------------------------------------------------------- */}
      <section className="border-b border-[#E0DDD9] dark:border-[#3D3A36] py-14 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.2em] text-[#9A8F75] dark:text-[#6E6B68] mb-2 font-bold">
              Choose by outcome
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#161513] dark:text-[#F5F4F2] mb-3 font-serif-title">
              Get value in your first 10 minutes
            </h2>
            <p className="text-sm text-[#5E5645] dark:text-[#B8B4B0] max-w-3xl leading-relaxed">
              Pick a goal and jump straight to the most relevant posts from the current archive. Each track is curated to help you learn, apply, and think better.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Track 1 */}
            <article className="rounded-3xl border border-[#E0DDD9] dark:border-[#3D3A36] bg-white dark:bg-[#2C2A27] p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#161513] dark:text-[#F5F4F2] mb-2 font-serif-title">
                  History, Civilization & National Thought
                </h3>
                <p className="text-xs text-[#5E5645] dark:text-[#B8B4B0] mb-4 leading-relaxed">
                  Get perspective with long-form historical and cultural analysis.
                </p>

                <div className="space-y-2.5 mb-5">
                  <a
                    href="https://sughoshdixit.com/blogs/titan-horological-revolution-business-strategy-lessons-from-xerxes-desai-and-jrd-tata"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-2xl border border-[#EEE4D5] dark:border-[#3D3A36] bg-[#FFFaf3] dark:bg-[#23211f] p-3 hover:border-[#C74634] transition-colors"
                  >
                    <p className="text-xs font-bold text-[#352F25] dark:text-[#F5F4F2] line-clamp-2 font-serif-title">
                      Titan's Horological Revolution: Business Strategy Lessons
                    </p>
                    <p className="text-[10px] text-sub mt-1">4 min read</p>
                  </a>

                  <a
                    href="https://sughoshdixit.com/blogs/dr.-vinayak-damodar-savarkar-the-underrated-colossus-of-bharat-freedom-struggle"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-2xl border border-[#EEE4D5] dark:border-[#3D3A36] bg-[#FFFaf3] dark:bg-[#23211f] p-3 hover:border-[#C74634] transition-colors"
                  >
                    <p className="text-xs font-bold text-[#352F25] dark:text-[#F5F4F2] line-clamp-2 font-serif-title">
                      Dr. Vinayak Damodar Savarkar — The Underrated Colossus
                    </p>
                    <p className="text-[10px] text-sub mt-1">8 min read</p>
                  </a>
                </div>
              </div>

              <a
                href="https://sughoshdixit.com/start-here"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs font-bold text-[#C74634] dark:text-[#E8572A] hover:underline"
              >
                Open curated guide &rarr;
              </a>
            </article>

            {/* Track 2 */}
            <article className="rounded-3xl border border-[#E0DDD9] dark:border-[#3D3A36] bg-white dark:bg-[#2C2A27] p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#161513] dark:text-[#F5F4F2] mb-2 font-serif-title">
                  Book Summaries & Intellectual Notes
                </h3>
                <p className="text-xs text-[#5E5645] dark:text-[#B8B4B0] mb-4 leading-relaxed">
                  Absorb key ideas quickly on geopolitics, philosophy, and strategic systems.
                </p>

                <div className="space-y-2.5 mb-5">
                  <a
                    href="https://sughoshdixit.com/blogs/india-in-a-shifting-global-order-book-notes"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-2xl border border-[#EEE4D5] dark:border-[#3D3A36] bg-[#FFFaf3] dark:bg-[#23211f] p-3 hover:border-[#C74634] transition-colors"
                  >
                    <p className="text-xs font-bold text-[#352F25] dark:text-[#F5F4F2] line-clamp-2 font-serif-title">
                      India in a Shifting Global Order — Book Notes
                    </p>
                    <p className="text-[10px] text-sub mt-1">5 min read</p>
                  </a>
                </div>
              </div>

              <a
                href="https://sughoshdixit.com/topic/Book"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs font-bold text-[#C74634] dark:text-[#E8572A] hover:underline"
              >
                Browse book notes &rarr;
              </a>
            </article>

            {/* Track 3 */}
            <article className="rounded-3xl border border-[#E0DDD9] dark:border-[#3D3A36] bg-white dark:bg-[#2C2A27] p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#161513] dark:text-[#F5F4F2] mb-2 font-serif-title">
                  Football Lens & Performance Suite
                </h3>
                <p className="text-xs text-[#5E5645] dark:text-[#B8B4B0] mb-4 leading-relaxed">
                  See sport, tactics, speed drills, and calisthenics through a data scientist's lens.
                </p>

                <div className="space-y-2.5 mb-5">
                  <a
                    href="https://sughoshdixit.com/blogs/why-support-liverpool-f.c-the-beautiful-game-vs-the-lazy-game"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-2xl border border-[#EEE4D5] dark:border-[#3D3A36] bg-[#FFFaf3] dark:bg-[#23211f] p-3 hover:border-[#C74634] transition-colors"
                  >
                    <p className="text-xs font-bold text-[#352F25] dark:text-[#F5F4F2] line-clamp-2 font-serif-title">
                      Why Support Liverpool F.C? The Beautiful Game vs The Lazy Game
                    </p>
                    <p className="text-[10px] text-sub mt-1">11 min read</p>
                  </a>
                </div>
              </div>

              <button
                onClick={() => onNavigateTab('football')}
                className="inline-flex items-center text-xs font-bold text-[#C74634] dark:text-[#E8572A] hover:underline text-left cursor-pointer"
              >
                Launch Football & Fitness Suite &rarr;
              </button>
            </article>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------- */}
      {/* 5. TOPIC COVERAGE WORD CLOUD */}
      {/* ------------------------------------------------------------------- */}
      <section className="border-b border-[#E0DDD9] dark:border-[#3D3A36] py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-3xl border border-[#E0DDD9] dark:border-[#3D3A36] bg-white dark:bg-[#2C2A27] p-6 md:p-8 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-[#9A8F75] dark:text-[#6E6B68] mb-2 font-bold">
              Topic Coverage
            </p>
            <h3 className="text-2xl sm:text-3xl font-semibold text-[#161513] dark:text-[#F5F4F2] mb-2 font-serif-title">
              Word Cloud
            </h3>
            <p className="text-xs sm:text-sm text-[#5E5645] dark:text-[#B8B4B0] mb-6">
              A quick map of the ideas, methods, and domains this platform explores.
            </p>

            <div className="flex flex-wrap gap-2.5">
              {wordCloudKeywords.map((kw, i) => (
                <span
                  key={i}
                  className={`px-3.5 py-1.5 rounded-full border ${kw.color} ${kw.size} shadow-xs transition-transform hover:scale-105 cursor-default`}
                >
                  {kw.text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------- */}
      {/* 6. TRENDING ESSAYS (RANKED 01-04) */}
      {/* ------------------------------------------------------------------- */}
      <section className="border-b border-[#E0DDD9] dark:border-[#3D3A36] py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-10">
            <TrendingUp size={24} className="text-[#C74634]" />
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#161513] dark:text-[#F5F4F2] font-serif-title">
              Trending essays
            </h2>
          </div>

          <div className="grid gap-10 md:grid-cols-2">
            {trendingEssays.map((essay) => (
              <article key={essay.rank} className="flex space-x-4 md:space-x-6">
                <span className="text-3xl md:text-5xl font-bold font-serif-title text-[#D4C5A7] dark:text-[#F3D6A8] leading-none shrink-0">
                  {essay.rank}
                </span>
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-[#6E6B68] dark:text-[#B8B4B0]">
                    <span className="font-medium">{essay.author}</span>
                    <span>•</span>
                    <span>{essay.date}</span>
                  </div>

                  <h3 className="text-lg md:text-xl font-semibold text-[#161513] dark:text-[#F5F4F2] leading-snug font-serif-title hover:text-[#C74634] transition-colors">
                    <a href={essay.url} target="_blank" rel="noopener noreferrer">
                      {essay.title}
                    </a>
                  </h3>

                  <p className="text-xs sm:text-sm text-[#494132] dark:text-[#B8B4B0] line-clamp-3 leading-relaxed">
                    {essay.excerpt}
                  </p>

                  <div className="text-xs text-[#7C7461] dark:text-[#6E6B68] font-bold">
                    <span>{essay.readTime}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------- */}
      {/* 7. FEATURED AI CINEMATIC DOCUMENTARY */}
      {/* ------------------------------------------------------------------- */}
      <section className="border-b border-[#E0DDD9] dark:border-[#3D3A36] py-14 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-3xl overflow-hidden border border-[#E0DDD9] dark:border-[#3D3A36] bg-white dark:bg-[#2C2A27] shadow-sm">
            <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr] items-center">
              {/* Embedded Player */}
              <div className="relative w-full aspect-video bg-black">
                <iframe
                  title="Veer Savarkar AI cinematic documentary"
                  src="https://www.youtube.com/embed/5fBTT9MwQio?rel=0"
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Info Column */}
              <div className="p-6 md:p-8 flex flex-col justify-center">
                <p className="text-xs uppercase tracking-[0.2em] text-[#9A8F75] dark:text-[#6E6B68] mb-2 font-bold">
                  Featured Documentary
                </p>
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#161513] dark:text-[#F5F4F2] mb-3 font-serif-title">
                  Veer Savarkar — AI Cinematic Documentary
                </h2>
                <p className="text-xs sm:text-sm text-[#5E5645] dark:text-[#B8B4B0] leading-relaxed mb-6">
                  A NotebookLM-powered documentary that captures the civilizational thread in one cinematic narrative.
                </p>

                <div className="flex flex-wrap gap-3">
                  <a
                    href="https://youtu.be/5fBTT9MwQio?si=ENxM8fQhtUCEOrm4"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rw-btn-primary px-6 py-2.5 text-xs font-bold shadow-sm"
                  >
                    Watch on YouTube
                  </a>
                  <a
                    href="https://sughoshdixit.com/savarkar-documentary"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rw-btn-ghost px-5 py-2.5 text-xs font-bold"
                  >
                    Explore Notes
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------- */}
      {/* 8. YOUTUBE SERIES SHELF: DATA SCIENCE & AI */}
      {/* ------------------------------------------------------------------- */}
      <section className="py-16 px-4 md:px-8 border-b border-[#E0DDD9] dark:border-[#3D3A36]">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="rounded-3xl border border-[#E0DDD9] dark:border-[#3D3A36] bg-white/90 dark:bg-[#2C2A27]/90 p-6 md:p-8 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-[#E0DDD9] dark:border-[#3D3A36]">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#C74634] dark:text-[#E8572A] block mb-1">
                  Data Science on YouTube
                </span>
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#161513] dark:text-[#F5F4F2] font-serif-title">
                  Data Science & AI Tech Journey
                </h2>
                <p className="text-xs sm:text-sm text-[#6E6B68] dark:text-[#B8B4B0] mt-1 max-w-xl">
                  Conversations, tutorials, and career insights — from breaking into data science to building ML products at Oracle.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <a
                  href="https://www.youtube.com/playlist?list=PL6OvmCeVVrDtOBGNO7uL89ZahyRgR6yjg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rw-btn-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <span>Watch Playlist</span>
                  <ExternalLink size={13} />
                </a>
                <a
                  href="https://www.youtube.com/@sughoshdixit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rw-btn-ghost px-4 py-2 text-xs font-bold flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4 fill-current text-rose-500" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  <span>@sughoshdixit</span>
                </a>
              </div>
            </div>

            {/* Embedded YouTube Playlist Player */}
            <div className="pt-6">
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-inner">
                <iframe
                  title="Data Science Podcasts by Sughosh Dixit"
                  src="https://www.youtube.com/embed/videoseries?list=PL6OvmCeVVrDtOBGNO7uL89ZahyRgR6yjg"
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------- */}
      {/* 9. EVERYTHING SUITE INTEGRATED JUMP-BAR */}
      {/* ------------------------------------------------------------------- */}
      <section className="py-12 px-4 md:px-8 bg-slate-100/60 dark:bg-[#201E1C]/60 border-b border-[#E0DDD9] dark:border-[#3D3A36]">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <span className="text-xs uppercase tracking-widest text-[#C74634] font-bold">
            INTEGRATED PERFORMANCE ECOSYSTEM
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif-title font-bold text-main">
            Launch Your Daily Performance Suite
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto">
            <button
              onClick={() => onNavigateTab('fithub')}
              className="google-card p-4 flex flex-col items-center justify-center text-center gap-1 hover:scale-105 transition-all cursor-pointer border-t-4 border-t-[#C74634]"
            >
              <span className="text-2xl">📊</span>
              <span className="text-xs font-bold text-main">Google Fit Hub</span>
              <span className="text-[10px] text-sub">Rings & GPS Run</span>
            </button>

            <button
              onClick={() => onNavigateTab('feed')}
              className="google-card p-4 flex flex-col items-center justify-center text-center gap-1 hover:scale-105 transition-all cursor-pointer border-t-4 border-t-[#E8572A]"
            >
              <span className="text-2xl">🏃</span>
              <span className="text-xs font-bold text-main">Strava Timeline</span>
              <span className="text-[10px] text-sub">Feed & Flyby Replay</span>
            </button>

            <button
              onClick={() => onNavigateTab('calisthenics')}
              className="google-card p-4 flex flex-col items-center justify-center text-center gap-1 hover:scale-105 transition-all cursor-pointer border-t-4 border-t-emerald-500"
            >
              <span className="text-2xl">💪</span>
              <span className="text-xs font-bold text-main">Calisthenics</span>
              <span className="text-[10px] text-sub">Combos & Playbook</span>
            </button>

            <button
              onClick={() => onNavigateTab('routine')}
              className="google-card p-4 flex flex-col items-center justify-center text-center gap-1 hover:scale-105 transition-all cursor-pointer border-t-4 border-t-indigo-500"
            >
              <span className="text-2xl">📅</span>
              <span className="text-xs font-bold text-main">Habits & Routine</span>
              <span className="text-[10px] text-sub">Timetable Tracker</span>
            </button>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------- */}
      {/* 10. EDITORIAL FOOTER */}
      {/* ------------------------------------------------------------------- */}
      <footer className="py-12 px-4 md:px-8 border-t border-[#E0DDD9] dark:border-[#3D3A36] text-center text-xs text-sub">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center gap-4">
          <div className="flex items-center gap-2 font-bold text-sm text-main font-serif-title">
            <div className="w-6 h-6 rounded-full bg-[#C74634] text-white flex items-center justify-center text-[10px]">
              SD
            </div>
            <span>Sughosh Dixit</span>
          </div>

          <p className="max-w-md text-sub leading-relaxed">
            Data Science, Civilization Studies, Football Analytics & Performance Discipline Suite.
          </p>

          <div className="flex gap-5 text-sub">
            <a href="https://github.com/SughoshDixit" target="_blank" rel="noopener noreferrer" className="hover:text-[#C74634]">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>
            <a href="https://linkedin.com/in/sughosh-dixit" target="_blank" rel="noopener noreferrer" className="hover:text-[#C74634]">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
            <a href="https://youtube.com/@sughoshdixit" target="_blank" rel="noopener noreferrer" className="hover:text-[#C74634]">
              <svg className="w-5 h-5 fill-current text-rose-500" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
            <a href="https://twitter.com/PSughosh" target="_blank" rel="noopener noreferrer" className="hover:text-[#C74634]">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
          </div>

          <p className="mt-2 text-[11px] text-muted">
            &copy; {new Date().getFullYear()} Sughosh Dixit. All rights reserved. Made with love on The Everything App.
          </p>
        </div>
      </footer>

      {/* ------------------------------------------------------------------- */}
      {/* 11. SEARCH MODAL DIALOG (⌘K) */}
      {/* ------------------------------------------------------------------- */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-[#201E1C] border border-[#E0DDD9] dark:border-[#3D3A36] rounded-3xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E0DDD9] dark:border-[#3D3A36]">
              <div className="flex items-center gap-2 flex-1">
                <Search size={16} className="text-[#C74634]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles, topics, workouts..."
                  className="w-full bg-transparent border-none outline-none text-sm text-main font-medium"
                  autoFocus
                />
              </div>
              <button onClick={() => setSearchModalOpen(false)} className="p-1 text-sub">
                <X size={18} />
              </button>
            </div>

            <div className="py-4 space-y-2 max-h-60 overflow-y-auto">
              <p className="text-[11px] uppercase tracking-wider text-sub font-bold px-2">Quick Navigation</p>
              <button
                onClick={() => { setSearchModalOpen(false); onNavigateTab('fithub'); }}
                className="w-full text-left p-2.5 rounded-2xl hover:bg-card text-xs font-bold flex items-center justify-between"
              >
                <span>📊 Google Fit Hub (Rings & GPS)</span>
                <ArrowRight size={12} />
              </button>
              <button
                onClick={() => { setSearchModalOpen(false); onNavigateTab('calisthenics'); }}
                className="w-full text-left p-2.5 rounded-2xl hover:bg-card text-xs font-bold flex items-center justify-between"
              >
                <span>💪 Calisthenics Playbook</span>
                <ArrowRight size={12} />
              </button>
              <button
                onClick={() => { setSearchModalOpen(false); onNavigateTab('feed'); }}
                className="w-full text-left p-2.5 rounded-2xl hover:bg-card text-xs font-bold flex items-center justify-between"
              >
                <span>🏃 Strava Timeline & Activity Feed</span>
                <ArrowRight size={12} />
              </button>
              <button
                onClick={() => { setSearchModalOpen(false); onNavigateTab('football'); }}
                className="w-full text-left p-2.5 rounded-2xl hover:bg-card text-xs font-bold flex items-center justify-between"
              >
                <span>⚽ Football Winger Drills</span>
                <ArrowRight size={12} />
              </button>
              {onOpenCreatePost && (
                <button
                  onClick={() => { setSearchModalOpen(false); onOpenCreatePost(); }}
                  className="w-full text-left p-2.5 rounded-2xl bg-[#C74634]/10 text-[#C74634] text-xs font-bold flex items-center justify-between"
                >
                  <span>✨ Compile & Share Daily Post</span>
                  <ArrowRight size={12} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
