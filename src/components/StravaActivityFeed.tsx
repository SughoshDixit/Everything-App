import React, { useState } from 'react';
import type {
  StravaActivityPost,
  GpsActivityLog,
  UserProfile,
  MotivationalQuote
} from '../types';
import {
  Plus,
  Share2,
  Edit3,
  Trash2,
  Heart,
  Film,
  Sparkles
} from 'lucide-react';

interface StravaActivityFeedProps {
  currentProfile: UserProfile;
  posts: StravaActivityPost[];
  quotes: MotivationalQuote[];
  onOpenCreatePost: () => void;
  onEditPost: (post: StravaActivityPost) => void;
  onDeletePost: (id: string) => void;
  onLikePost: (id: string) => void;
  onOpenFlyby: (activity: GpsActivityLog) => void;
  onOpenSocialShare: (post: StravaActivityPost) => void;
}

export const StravaActivityFeed: React.FC<StravaActivityFeedProps> = ({
  currentProfile,
  posts,
  onOpenCreatePost,
  onEditPost,
  onDeletePost,
  onLikePost,
  onOpenFlyby,
  onOpenSocialShare
}) => {
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('all');

  // Filter posts by user and date if applicable
  const athletePosts = posts.filter(
    (p) => currentProfile === 'couple' || p.userId === currentProfile || p.userId === 'couple'
  );

  // Unique dates for filter pills
  const availableDates = Array.from(new Set(athletePosts.map((p) => p.date)));

  const filteredPosts = selectedDateFilter === 'all'
    ? athletePosts
    : athletePosts.filter((p) => p.date === selectedDateFilter);

  // Total Athlete Stats
  const totalDistanceKm = athletePosts.reduce((acc, p) => acc + p.totalDistanceKm, 0);
  const totalHeartPoints = athletePosts.reduce((acc, p) => acc + p.totalHeartPoints, 0);

  return (
    <div className="tab-container animate-fade-in flex flex-col gap-4">
      {/* ------------------------------------------------------------------- */}
      {/* 1. STRAVA ATHLETE PROFILE HEADER */}
      {/* ------------------------------------------------------------------- */}
      <div className="google-card p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-xl text-white font-black shadow-md">
              {currentProfile === 'women' ? '👩' : '👨'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base md:text-lg font-black text-main leading-tight">
                  {currentProfile === 'women' ? 'Shreya Dixit' : 'Sughosh Dixit'}
                </h2>
                <span className="oled-badge-lime text-[10px] uppercase">
                  {currentProfile === 'women' ? 'Athlete Profile' : 'Pro Athlete'}
                </span>
              </div>
              <p className="text-[11px] text-sub font-medium mt-0.5">
                Everything App &bull; Performance & Discipline Suite
              </p>
            </div>
          </div>

          <button
            className="btn-google-primary text-xs py-2.5 px-4 shadow-md"
            onClick={onOpenCreatePost}
          >
            <Plus size={16} />
            <span>Create Activity Post</span>
          </button>
        </div>

        {/* Athlete Overview Stats */}
        <div className="grid grid-cols-3 gap-2.5 mt-4 pt-4 border-t border-glass">
          <div className="bg-card p-2.5 rounded-2xl border border-glass text-center">
            <div className="text-[10px] text-sub font-bold uppercase">POSTS LOGGED</div>
            <div className="text-base font-black text-main font-mono mt-0.5">
              {athletePosts.length} <span className="text-xs text-sub font-normal">posts</span>
            </div>
          </div>

          <div className="bg-card p-2.5 rounded-2xl border border-glass text-center">
            <div className="text-[10px] text-sub font-bold uppercase">TOTAL DISTANCE</div>
            <div className="text-base font-black text-cyan-600 dark:text-cyan-400 font-mono mt-0.5">
              {totalDistanceKm.toFixed(1)} <span className="text-xs text-sub font-normal">km</span>
            </div>
          </div>

          <div className="bg-card p-2.5 rounded-2xl border border-glass text-center">
            <div className="text-[10px] text-sub font-bold uppercase">HEART POINTS</div>
            <div className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
              {totalHeartPoints} <span className="text-xs text-sub font-normal">pts</span>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 2. DATE FILTER PILLS (SUPPORTING MULTIPLE POSTS PER DAY) */}
      {/* ------------------------------------------------------------------- */}
      {availableDates.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            className={selectedDateFilter === 'all' ? 'btn-google-primary text-xs py-1 px-3' : 'btn-google-outlined text-xs py-1 px-3'}
            onClick={() => setSelectedDateFilter('all')}
          >
            All Dates ({athletePosts.length})
          </button>
          {availableDates.map((d) => (
            <button
              key={d}
              className={selectedDateFilter === d ? 'btn-google-primary text-xs py-1 px-3' : 'btn-google-outlined text-xs py-1 px-3'}
              onClick={() => setSelectedDateFilter(d)}
            >
              📅 {d}
            </button>
          ))}
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 3. ACTIVITY POSTS TIMELINE */}
      {/* ------------------------------------------------------------------- */}
      {filteredPosts.length === 0 ? (
        <div className="google-card p-8 text-center flex flex-col items-center justify-center">
          <Sparkles className="icon-lg text-cyan-500 mb-2" />
          <h3 className="text-base font-black text-main">No Activity Posts Yet</h3>
          <p className="text-xs text-sub max-w-sm my-2">
            Complete your daily run, ride, calisthenics combo, or football drills and tap "Create Activity Post" to share and log your progress!
          </p>
          <button
            className="btn-google-primary text-xs py-2.5 px-5 mt-2"
            onClick={onOpenCreatePost}
          >
            <Plus size={16} />
            <span>Create Today's First Post</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredPosts.map((post) => (
            <div key={post.id} className="google-card p-5 flex flex-col gap-3 shadow-md">
              {/* Post Header */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-purple-500/15 text-[#55198B] dark:text-[#c084fc] flex items-center justify-center text-sm font-black shadow-sm">
                    {post.userId === 'women' ? '👩' : '👨'}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-main">{post.title}</h4>
                    <div className="text-[11px] text-sub font-medium flex items-center gap-1.5">
                      <span>{post.date}</span>
                      <span>&bull;</span>
                      <span className="text-amber-500 font-bold">RPE {post.rpe || 8}/10</span>
                    </div>
                  </div>
                </div>

                {/* Edit & Delete Controls */}
                <div className="flex items-center gap-1.5">
                  <button
                    className="btn-google-icon"
                    onClick={() => onEditPost(post)}
                    title="Edit Activity Post"
                  >
                    <Edit3 size={15} />
                  </button>

                  <button
                    className="btn-google-icon text-rose-500"
                    onClick={() => onDeletePost(post.id)}
                    title="Delete Post"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Description / Notes */}
              {post.description && (
                <p className="text-xs text-sub font-normal leading-relaxed bg-card p-3 rounded-2xl border border-glass">
                  {post.description}
                </p>
              )}

              {/* Compiled Workouts List (Strictly Sets & Reps, No Warm-Up) */}
              <div className="flex flex-col gap-2">
                <div className="text-[10px] font-bold text-sub uppercase tracking-wider">
                  Logged Activities ({post.activities.length})
                </div>
                {post.activities.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-2xl bg-card border border-glass flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">
                        {item.category === 'calisthenics' ? '⚡' : item.category.includes('run') ? '🏃' : '🚴'}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-main">{item.title}</div>
                        <div className="text-[11px] text-cyan-600 dark:text-cyan-400 font-medium">
                          {item.details}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Attached Custom Media or Glowing Route Preview */}
              {post.customMediaUrl && (
                <div className="relative rounded-2xl overflow-hidden border border-glass max-h-56">
                  <img
                    src={post.customMediaUrl}
                    alt="Workout Attached Photo"
                    className="w-full h-auto object-cover max-h-56"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-white font-bold flex items-center gap-1">
                    <span>❤️ Made with Love on The Everything App</span>
                  </div>
                </div>
              )}

              {/* Motivational Quote Watermark */}
              <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-2xl flex items-center justify-between gap-2">
                <p className="text-[11px] italic font-medium text-main">
                  "{post.motivationalQuote}" &mdash; <span className="font-bold text-amber-500">{post.quoteAuthor}</span>
                </p>
              </div>

              {/* Bottom Post Actions Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-glass flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <button
                    className={`btn-google-tonal text-xs py-1.5 px-3 flex items-center gap-1 ${
                      post.isLiked ? 'bg-rose-500/20 text-rose-500 border-rose-500/40' : ''
                    }`}
                    onClick={() => onLikePost(post.id)}
                  >
                    <Heart size={14} className={post.isLiked ? 'fill-rose-500 text-rose-500' : ''} />
                    <span>{post.likesCount || 0} Kudos</span>
                  </button>

                  {post.gpsActivity && (
                    <button
                      className="btn-google-tonal text-xs py-1.5 px-3 flex items-center gap-1"
                      onClick={() => onOpenFlyby(post.gpsActivity!)}
                      title="Play Animated Route Flyby"
                    >
                      <Film size={14} />
                      <span>Route Flyby</span>
                    </button>
                  )}
                </div>

                <button
                  className="btn-google-primary text-xs py-1.5 px-4 flex items-center gap-1.5"
                  onClick={() => onOpenSocialShare(post)}
                  title="Generate & Share High-Resolution Poster"
                >
                  <Share2 size={14} />
                  <span>Share Story (WhatsApp / Insta)</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
