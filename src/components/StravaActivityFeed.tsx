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
  Trophy,
  Flame,
  Zap,
  TrendingUp,
  MessageSquare,
  BarChart3,
  Play,
  Send
} from 'lucide-react';

interface StravaActivityFeedProps {
  currentProfile: UserProfile;
  posts: StravaActivityPost[];
  quotes?: MotivationalQuote[];
  onOpenCreatePost: () => void;
  onEditPost: (post: StravaActivityPost) => void;
  onDeletePost: (id: string) => void;
  onLikePost: (id: string) => void;
  onOpenFlyby?: (activity: GpsActivityLog) => void;
  onOpenSocialShare: (post: StravaActivityPost) => void;
  onSelectActivityDetail?: (post: StravaActivityPost) => void;
  onOpenAthleteProfile?: () => void;
  onStartTracking?: () => void;
  onAddComment?: (activityId: string, text: string) => void;
}

export const StravaActivityFeed: React.FC<StravaActivityFeedProps> = ({
  currentProfile,
  posts,
  onOpenCreatePost,
  onEditPost,
  onDeletePost,
  onLikePost,
  onOpenSocialShare,
  onSelectActivityDetail,
  onOpenAthleteProfile,
  onStartTracking,
  onAddComment
}) => {
  const [sportFilter, setSportFilter] = useState<'all' | 'run' | 'cycle' | 'drive' | 'calisthenics' | 'football'>('all');
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [floatingKudosId, setFloatingKudosId] = useState<string | null>(null);

  // Filter posts by athlete and sport
  const athletePosts = posts.filter(
    (p) => currentProfile === 'couple' || p.userId === currentProfile || p.userId === 'couple'
  );

  const filteredPosts = athletePosts.filter((p) => {
    if (sportFilter === 'all') return true;
    return p.sportType === sportFilter;
  });

  // Athlete Totals
  const totalDistanceKm = athletePosts.reduce((acc, p) => acc + (p.totalDistanceKm || 0), 0);
  const totalHeartPoints = athletePosts.reduce((acc, p) => acc + (p.totalHeartPoints || 0), 0);

  const handleKudosClick = (postId: string) => {
    onLikePost(postId);
    setFloatingKudosId(postId);
    setTimeout(() => {
      setFloatingKudosId(null);
    }, 1000);
  };

  const handleCommentSubmit = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const text = commentInputs[postId]?.trim();
    if (!text || !onAddComment) return;
    onAddComment(postId, text);
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
  };

  return (
    <div className="tab-container animate-fade-in flex flex-col gap-5">
      {/* ------------------------------------------------------------------- */}
      {/* 1. STRAVA ATHLETE PROFILE & TRACKING ACTION HUB */}
      {/* ------------------------------------------------------------------- */}
      <div className="google-card p-5 border-l-4 border-[#55198B]">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div
            onClick={onOpenAthleteProfile}
            className="flex items-center gap-3 cursor-pointer group"
            title="View Athlete Profile, PR Board & Heatmap"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#55198B] to-[#7b29be] flex items-center justify-center text-2xl text-white font-black shadow-md group-hover:scale-105 transition-transform">
              {currentProfile === 'women' ? '👩' : '👨'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-main group-hover:text-[#55198B] dark:group-hover:text-[#c084fc] transition-colors leading-tight">
                  {currentProfile === 'women' ? 'Shreya Dixit' : 'Sughosh Dixit'}
                </h2>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-[#55198B] dark:text-[#c084fc] uppercase tracking-wider">
                  Pro Athlete
                </span>
              </div>
              <p className="text-[11px] text-sub font-medium flex items-center gap-1 mt-0.5">
                <span>View PRs &amp; Training Heatmap</span>
                <span>&rarr;</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onStartTracking && (
              <button
                onClick={onStartTracking}
                className="btn-google-primary text-xs py-2 px-3.5 shadow-md flex items-center gap-1.5"
              >
                <Play size={14} fill="#fff" />
                <span>Record Live</span>
              </button>
            )}
            <button
              onClick={onOpenCreatePost}
              className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
            >
              <Plus size={14} />
              <span>Log Post</span>
            </button>
          </div>
        </div>

        {/* Athlete Overview Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 mt-4 pt-4 border-t border-glass">
          <div className="bg-card p-2.5 rounded-2xl border border-glass text-center">
            <div className="text-[10px] text-sub font-bold uppercase">ACTIVITIES</div>
            <div className="text-base font-black text-main font-mono mt-0.5">
              {athletePosts.length} <span className="text-xs text-sub font-normal">posts</span>
            </div>
          </div>

          <div className="bg-card p-2.5 rounded-2xl border border-glass text-center">
            <div className="text-[10px] text-sub font-bold uppercase">TOTAL DISTANCE</div>
            <div className="text-base font-black text-[#55198B] dark:text-[#c084fc] font-mono mt-0.5">
              {totalDistanceKm.toFixed(1)} <span className="text-xs text-sub font-normal">km</span>
            </div>
          </div>

          <div className="bg-card p-2.5 rounded-2xl border border-glass text-center">
            <div className="text-[10px] text-sub font-bold uppercase">HEART POINTS</div>
            <div className="text-base font-black text-amber-500 font-mono mt-0.5">
              {totalHeartPoints} <span className="text-xs text-sub font-normal">pts</span>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 2. SPORT FILTER PILLS */}
      {/* ------------------------------------------------------------------- */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSportFilter('all')}
          className={`cat-pill ${sportFilter === 'all' ? 'active' : ''}`}
        >
          All Sports ({athletePosts.length})
        </button>
        <button
          onClick={() => setSportFilter('run')}
          className={`cat-pill ${sportFilter === 'run' ? 'active' : ''}`}
        >
          🏃 Running
        </button>
        <button
          onClick={() => setSportFilter('cycle')}
          className={`cat-pill ${sportFilter === 'cycle' ? 'active' : ''}`}
        >
          🚴 Cycling
        </button>
        <button
          onClick={() => setSportFilter('drive')}
          className={`cat-pill ${sportFilter === 'drive' ? 'active' : ''}`}
        >
          🚗 Road Trips
        </button>
        <button
          onClick={() => setSportFilter('calisthenics')}
          className={`cat-pill ${sportFilter === 'calisthenics' ? 'active' : ''}`}
        >
          💪 Calisthenics
        </button>
        <button
          onClick={() => setSportFilter('football')}
          className={`cat-pill ${sportFilter === 'football' ? 'active' : ''}`}
        >
          ⚽ Football
        </button>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 3. STRAVA ACTIVITY FEED CARDS */}
      {/* ------------------------------------------------------------------- */}
      {filteredPosts.length === 0 ? (
        <div className="google-card p-8 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-full bg-purple-500/10 text-[#55198B] dark:text-[#c084fc] flex items-center justify-center text-2xl font-black">
            🏃
          </div>
          <h3 className="text-base font-black text-main">No activities found in this filter</h3>
          <p className="text-xs text-sub max-w-sm">
            Record a GPS workout, log a calisthenics routine, or compile your session into a Strava-style post.
          </p>
          <div className="flex gap-2 mt-2">
            {onStartTracking && (
              <button onClick={onStartTracking} className="btn-google-primary text-xs py-2 px-4">
                Record GPS Session
              </button>
            )}
            <button onClick={onOpenCreatePost} className="btn-secondary text-xs py-2 px-4">
              Create Manual Post
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {filteredPosts.map((post) => {
            const isWomen = post.userId === 'women';
            const athleteName = isWomen ? 'Shreya Dixit' : 'Sughosh Dixit';
            const athleteAvatar = isWomen ? '👩' : '👨';

            const sportIcon =
              post.sportType === 'run'
                ? '🏃'
                : post.sportType === 'cycle'
                ? '🚴'
                : post.sportType === 'drive'
                ? '🚗'
                : post.sportType === 'calisthenics'
                ? '💪'
                : post.sportType === 'football'
                ? '⚽'
                : '⚡';

            return (
              <div
                key={post.id}
                className="google-card p-4 sm:p-5 flex flex-col gap-3.5 shadow-md relative overflow-hidden"
              >
                {/* Floating Kudos Animation */}
                {floatingKudosId === post.id && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 animate-scale-up">
                    <span className="text-5xl drop-shadow-lg">👏</span>
                  </div>
                )}

                {/* Card Header: Athlete Info + Actions */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-purple-500/15 text-[#55198B] dark:text-[#c084fc] flex items-center justify-center text-lg font-black shadow-sm">
                      {athleteAvatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs sm:text-sm font-black text-main">{athleteName}</h4>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#55198B] text-white">
                          {sportIcon}
                        </span>
                      </div>
                      <div className="text-[10px] text-sub font-medium flex items-center gap-1.5 mt-0.5">
                        <span>{post.date}</span>
                        <span>&bull;</span>
                        <span className="text-amber-500 font-bold">RPE {post.rpe || 8}/10 Effort</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Share, Edit, Delete */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenSocialShare(post)}
                      className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-sub hover:text-main transition-colors"
                      title="Share to Instagram / Stories"
                    >
                      <Share2 size={15} />
                    </button>
                    <button
                      onClick={() => onEditPost(post)}
                      className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-sub hover:text-main transition-colors"
                      title="Edit Post"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => onDeletePost(post.id)}
                      className="p-1.5 rounded-full hover:bg-rose-500/10 text-sub hover:text-rose-500 transition-colors"
                      title="Delete Post"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Activity Title & Description */}
                <div
                  onClick={() => onSelectActivityDetail?.(post)}
                  className="cursor-pointer space-y-1 group"
                >
                  <h3 className="text-base sm:text-lg font-black text-main group-hover:text-[#55198B] dark:group-hover:text-[#c084fc] transition-colors leading-snug">
                    {post.title}
                  </h3>
                  {post.description && (
                    <p className="text-xs text-sub leading-relaxed line-clamp-2">
                      {post.description}
                    </p>
                  )}
                </div>

                {/* Telemetry Stage Preview (Map / Calisthenics Visual Graphic) */}
                <div
                  onClick={() => onSelectActivityDetail?.(post)}
                  className="w-full rounded-2xl bg-slate-100 dark:bg-[#181c26] border border-glass p-3 cursor-pointer hover:border-[#55198B] transition-all"
                >
                  {post.sportType === 'calisthenics' ? (
                    <div className="flex items-center justify-between py-2 px-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">💪</span>
                        <div>
                          <div className="text-xs font-bold text-main">Calisthenics Strength Protocol</div>
                          <div className="text-[11px] text-sub">Chest, Back, Core &amp; Explosive Power</div>
                        </div>
                      </div>
                      <div className="text-right font-mono font-bold text-xs text-[#55198B] dark:text-[#c084fc]">
                        {post.totalSets || 12} Sets &bull; {post.totalReps || 160} Reps
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between py-2 px-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{post.sportType === 'cycle' ? '🚴' : '🏃'}</span>
                        <div>
                          <div className="text-xs font-bold text-main">GPS Route Tracked &bull; Outdoor</div>
                          <div className="text-[11px] text-sub flex items-center gap-1">
                            <TrendingUp size={11} className="text-emerald-500" />
                            <span>+{post.elevationGainMeters || 65}m Elevation</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right font-mono font-bold text-xs text-[#55198B] dark:text-[#c084fc]">
                        {post.totalDistanceKm.toFixed(2)} km &bull; {post.avgPaceMinKm || '5:04 /km'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Big 3 Strava Stats Grid */}
                <div
                  onClick={() => onSelectActivityDetail?.(post)}
                  className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-[#181c26] border border-glass text-center cursor-pointer"
                >
                  <div>
                    <div className="text-[9px] font-bold text-sub uppercase">
                      {post.sportType === 'calisthenics' ? 'TOTAL SETS' : 'DISTANCE'}
                    </div>
                    <div className="text-base sm:text-lg font-black text-main font-mono mt-0.5">
                      {post.sportType === 'calisthenics'
                        ? `${post.totalSets || 12}`
                        : `${post.totalDistanceKm.toFixed(2)} km`}
                    </div>
                  </div>

                  <div>
                    <div className="text-[9px] font-bold text-sub uppercase">
                      {post.sportType === 'calisthenics' ? 'TOTAL REPS' : 'AVG PACE'}
                    </div>
                    <div className="text-base sm:text-lg font-black text-main font-mono mt-0.5">
                      {post.sportType === 'calisthenics'
                        ? `${post.totalReps || 160}`
                        : (post.avgPaceMinKm || '5:04 /km')}
                    </div>
                  </div>

                  <div>
                    <div className="text-[9px] font-bold text-sub uppercase">TIME</div>
                    <div className="text-base sm:text-lg font-black text-main font-mono mt-0.5">
                      {post.totalMoveMinutes}m
                    </div>
                  </div>
                </div>

                {/* Secondary Stats & PR Achievements Ribbon */}
                <div className="flex items-center justify-between text-[11px] text-sub px-1">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Flame size={12} className="text-amber-500" /> {post.totalCalories || 480} kcal
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap size={12} className="text-[#55198B] dark:text-[#c084fc]" /> {post.totalHeartPoints || 32} pts
                    </span>
                  </div>

                  <div className="flex items-center gap-1 font-bold text-amber-500">
                    <Trophy size={13} />
                    <span>1 PR Achievement</span>
                  </div>
                </div>

                {/* Card Footer: Kudos & Comments Action Bar */}
                <div className="pt-2 border-t border-glass flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleKudosClick(post.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                        post.isLiked
                          ? 'bg-[#55198B] text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-sub hover:text-main'
                      }`}
                    >
                      <span>👏</span>
                      <span>{post.likesCount || 0} Kudos</span>
                    </button>

                    <button
                      onClick={() =>
                        setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-sub hover:text-main bg-slate-100 dark:bg-slate-800 transition-all"
                    >
                      <MessageSquare size={13} />
                      <span>{post.comments?.length || 0}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => onSelectActivityDetail?.(post)}
                    className="btn-google-tonal text-xs py-1.5 px-3 flex items-center gap-1"
                  >
                    <BarChart3 size={13} />
                    <span>Analysis &amp; Splits</span>
                  </button>
                </div>

                {/* Collapsible Comments Drawer */}
                {activeCommentPostId === post.id && (
                  <div className="pt-3 border-t border-glass space-y-2.5 animate-fade-in">
                    {post.comments && post.comments.length > 0 ? (
                      <div className="space-y-1.5 max-h-32 overflow-y-auto">
                        {post.comments.map((c) => (
                          <div key={c.id} className="text-xs bg-slate-50 dark:bg-[#181c26] p-2 rounded-xl border border-glass">
                            <span className="font-bold text-main mr-1.5">{c.userName}:</span>
                            <span className="text-sub">{c.text}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-sub italic">No comments yet. Cheer the athlete!</p>
                    )}

                    <form
                      onSubmit={(e) => handleCommentSubmit(post.id, e)}
                      className="flex gap-2"
                    >
                      <input
                        type="text"
                        placeholder="Leave kudos comment..."
                        value={commentInputs[post.id] || ''}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                        }
                        className="flex-1 px-3 py-1.5 rounded-xl bg-card border border-glass text-xs text-main focus:outline-none focus:border-[#55198B]"
                      />
                      <button
                        type="submit"
                        disabled={!commentInputs[post.id]?.trim()}
                        className="btn-google-primary text-xs px-3 py-1.5 disabled:opacity-50"
                      >
                        <Send size={12} />
                      </button>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
