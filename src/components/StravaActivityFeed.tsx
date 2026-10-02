import React, { useState, useMemo } from 'react';
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
import { ZoomableImageModal } from './ZoomableImageModal';
import { enrichPostsWithMilestones } from '../utils/milestonesTracker';

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
  const [zoomImage, setZoomImage] = useState<{ src: string; title: string } | null>(null);

  // Automatically evaluate and enrich posts with all-time personal records and milestones
  const enrichedPosts = useMemo(() => {
    return enrichPostsWithMilestones(posts).enrichedPosts;
  }, [posts]);

  // Filter posts by athlete and sport
  const athletePosts = enrichedPosts.filter(
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
      <div className="rounded-2xl border border-white/10 bg-[#0e131b] p-5 shadow-xl border-l-4 border-l-[#ccff00]">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div
            onClick={onOpenAthleteProfile}
            className="flex items-center gap-3 cursor-pointer group"
            title="View Athlete Profile, PR Board & Heatmap"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#ccff00] to-[#ffd700] flex items-center justify-center text-2xl text-black font-black shadow-md group-hover:scale-105 transition-transform">
              {currentProfile === 'women' ? '👩' : '👨'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-main group-hover:text-[#ccff00] transition-colors leading-tight">
                  {currentProfile === 'women' ? 'Shreya Dixit' : 'Sughosh Dixit'}
                </h2>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#ccff00]/15 text-[#ccff00] border border-[#ccff00]/30 uppercase tracking-wider">
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
                className="bg-[#ccff00] hover:bg-[#b8e600] text-black font-black text-xs py-2 px-3.5 rounded-xl shadow-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Play size={14} fill="#000" />
                <span>Record Live</span>
              </button>
            )}
            <button
              onClick={onOpenCreatePost}
              className="bg-white/10 hover:bg-white/15 text-white font-bold text-xs py-2 px-3 rounded-xl border border-white/10 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Plus size={14} />
              <span>Log Post</span>
            </button>
          </div>
        </div>

        {/* Athlete Overview Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 mt-4 pt-4 border-t border-white/10">
          <div className="bg-[#141923] p-2.5 rounded-2xl border border-white/10 text-center">
            <div className="text-[10px] text-sub font-bold uppercase">ACTIVITIES</div>
            <div className="text-base font-black text-main font-mono mt-0.5">
              {athletePosts.length} <span className="text-xs text-sub font-normal">posts</span>
            </div>
          </div>

          <div className="bg-[#141923] p-2.5 rounded-2xl border border-white/10 text-center">
            <div className="text-[10px] text-sub font-bold uppercase">TOTAL DISTANCE</div>
            <div className="text-base font-black text-[#ccff00] font-mono mt-0.5">
              {totalDistanceKm.toFixed(1)} <span className="text-xs text-sub font-normal">km</span>
            </div>
          </div>

          <div className="bg-[#141923] p-2.5 rounded-2xl border border-white/10 text-center">
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
        <div className="rounded-2xl border border-white/10 bg-[#0e131b] p-8 text-center flex flex-col items-center justify-center gap-3 shadow-xl">
          <div className="w-14 h-14 rounded-full bg-[#ccff00]/15 text-[#ccff00] border border-[#ccff00]/30 flex items-center justify-center text-2xl font-black">
            🏃
          </div>
          <h3 className="text-base font-black text-white">No activities found in this filter</h3>
          <p className="text-xs text-white/60 max-w-sm">
            Record a GPS workout, log a calisthenics routine, or compile your session into a Strava-style post.
          </p>
          <div className="flex gap-2 mt-2">
            {onStartTracking && (
              <button
                onClick={onStartTracking}
                className="bg-[#ccff00] hover:bg-[#b8e600] text-black font-black text-xs py-2 px-4 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Record GPS Session
              </button>
            )}
            <button
              onClick={onOpenCreatePost}
              className="bg-white/10 hover:bg-white/15 text-white font-bold text-xs py-2 px-4 rounded-xl border border-white/10 transition-all active:scale-95 cursor-pointer"
            >
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
                className="rounded-3xl border border-white/10 bg-[#0e131b] p-5 flex flex-col gap-4 shadow-xl relative overflow-hidden transition-all hover:border-white/20"
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
                    <div className="w-10 h-10 rounded-2xl bg-white/10 text-white flex items-center justify-center text-lg font-black border border-white/10 shadow-sm">
                      {athleteAvatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs sm:text-sm font-black text-white">{athleteName}</h4>
                        <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-[#ccff00] text-black">
                          {sportIcon}
                        </span>
                      </div>
                      <div className="text-[10px] text-white/60 font-medium flex items-center gap-1.5 mt-0.5">
                        <span>{post.date}</span>
                        <span>&bull;</span>
                        <span className="text-[#ffd700] font-bold">RPE {post.rpe || 8}/10 Effort</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Share, Edit, Delete */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenSocialShare(post)}
                      className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                      title="Share to Instagram / Stories"
                    >
                      <Share2 size={15} />
                    </button>
                    <button
                      onClick={() => onEditPost(post)}
                      className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                      title="Edit Post"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => onDeletePost(post.id)}
                      className="p-1.5 rounded-full hover:bg-rose-500/20 text-white/60 hover:text-rose-400 transition-colors"
                      title="Delete Post"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Record & Milestone Badges (Fastest, Longest, Hardest) */}
                {post.recordBadges && post.recordBadges.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {post.recordBadges.map((badge) => (
                      <div
                        key={badge.id}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[11px] font-black shadow-sm"
                      >
                        <span>{badge.icon}</span>
                        <span>{badge.title}</span>
                        <span className="font-mono text-[10px] opacity-90 font-bold">&bull; {badge.statLabel}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Activity Title & Description */}
                <div
                  onClick={() => onSelectActivityDetail?.(post)}
                  className="cursor-pointer space-y-1 group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white group-hover:text-[#ccff00] transition-colors leading-snug">
                    {post.title}
                  </h3>
                  {post.description && (
                    <p className="text-xs text-white/70 leading-relaxed line-clamp-2">
                      {post.description}
                    </p>
                  )}
                </div>

                {/* Historical & Uploaded Photos & Videos Showcase */}
                {(() => {
                  const allPhotos = [
                    ...(post.photos || []),
                    ...(post.customMediaUrl && !(post.photos || []).includes(post.customMediaUrl) ? [post.customMediaUrl] : []),
                    ...(post.gpsActivity?.mediaUrls || [])
                  ].filter((url, idx, self) => url && self.indexOf(url) === idx);

                  const allVideos = [
                    ...(post.videoUrls || []),
                    ...(post.gpsActivity?.videoUrls || [])
                  ].filter((url, idx, self) => url && self.indexOf(url) === idx);

                  if (allPhotos.length === 0 && allVideos.length === 0) return null;

                  return (
                    <div className="space-y-2 pt-0.5 pb-1">
                      {/* Videos */}
                      {allVideos.map((vidUrl, vIdx) => (
                        <div key={vIdx} className="relative rounded-2xl overflow-hidden bg-black max-h-72 flex items-center justify-center border border-glass">
                          <video
                            src={vidUrl}
                            controls
                            playsInline
                            preload="metadata"
                            className="w-full max-h-72 object-contain rounded-2xl"
                          />
                        </div>
                      ))}

                      {/* Photos Grid */}
                      {allPhotos.length > 0 && (
                        <div className={`grid gap-2 ${allPhotos.length === 1 ? 'grid-cols-1' : allPhotos.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                          {allPhotos.slice(0, 3).map((photoUrl, pIdx) => (
                            <div
                              key={pIdx}
                              onClick={() => setZoomImage({ src: photoUrl, title: post.title })}
                              className={`relative rounded-xl overflow-hidden bg-slate-900 cursor-pointer group border border-glass ${
                                allPhotos.length === 1 ? 'h-60 sm:h-72' : 'h-36 sm:h-44'
                              }`}
                            >
                              <img
                                src={photoUrl}
                                alt={`Activity photo ${pIdx + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                              />
                              {pIdx === 2 && allPhotos.length > 3 && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-black text-sm">
                                  +{allPhotos.length - 3} More
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Telemetry Stage Preview (Map / Calisthenics Visual Graphic) */}
                <div
                  onClick={() => onSelectActivityDetail?.(post)}
                  className="w-full rounded-2xl bg-[#141923] border border-white/10 p-3.5 cursor-pointer hover:border-[#ccff00]/40 transition-all"
                >
                  {post.sportType === 'calisthenics' ? (
                    <div className="flex items-center justify-between py-2 px-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">💪</span>
                        <div>
                          <div className="text-xs font-bold text-white">Calisthenics Strength Protocol</div>
                          <div className="text-[11px] text-white/60">Chest, Back, Core &amp; Explosive Power</div>
                        </div>
                      </div>
                      <div className="text-right font-mono font-bold text-xs text-[#ccff00]">
                        {post.totalSets || 12} Sets &bull; {post.totalReps || 160} Reps
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between py-2 px-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{post.sportType === 'cycle' ? '🚴' : '🏃'}</span>
                        <div>
                          <div className="text-xs font-bold text-white">GPS Route Tracked &bull; Outdoor</div>
                          <div className="text-[11px] text-white/60 flex items-center gap-1">
                            <TrendingUp size={11} className="text-emerald-400" />
                            <span>+{post.elevationGainMeters || 65}m Elevation</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right font-mono font-bold text-xs text-[#ccff00]">
                        {post.totalDistanceKm.toFixed(2)} km &bull; {post.avgPaceMinKm || '5:04 /km'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Big 3 Strava Stats Grid */}
                <div
                  onClick={() => onSelectActivityDetail?.(post)}
                  className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-[#141923] border border-white/10 text-center cursor-pointer"
                >
                  <div>
                    <div className="text-[9px] font-bold text-white/60 uppercase">
                      {post.sportType === 'calisthenics' ? 'TOTAL SETS' : 'DISTANCE'}
                    </div>
                    <div className="text-base sm:text-lg font-black text-white font-mono mt-0.5">
                      {post.sportType === 'calisthenics'
                        ? `${post.totalSets || 12}`
                        : `${post.totalDistanceKm.toFixed(2)} km`}
                    </div>
                  </div>

                  <div>
                    <div className="text-[9px] font-bold text-white/60 uppercase">
                      {post.sportType === 'calisthenics' ? 'TOTAL REPS' : 'AVG PACE'}
                    </div>
                    <div className="text-base sm:text-lg font-black text-white font-mono mt-0.5">
                      {post.sportType === 'calisthenics'
                        ? `${post.totalReps || 160}`
                        : (post.avgPaceMinKm || '5:04 /km')}
                    </div>
                  </div>

                  <div>
                    <div className="text-[9px] font-bold text-white/60 uppercase">TIME</div>
                    <div className="text-base sm:text-lg font-black text-white font-mono mt-0.5">
                      {post.totalMoveMinutes}m
                    </div>
                  </div>
                </div>

                {/* Secondary Stats & PR Achievements Ribbon */}
                <div className="flex items-center justify-between text-[11px] text-white/60 px-1">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Flame size={12} className="text-amber-500" /> {post.totalCalories || 480} kcal
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap size={12} className="text-[#ccff00]" /> {post.totalHeartPoints || 32} pts
                    </span>
                  </div>

                  <div className="flex items-center gap-1 font-bold text-[#ffd700]">
                    <Trophy size={13} />
                    <span>1 PR Achievement</span>
                  </div>
                </div>

                {/* Card Footer: Kudos & Comments Action Bar */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleKudosClick(post.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        post.isLiked
                          ? 'bg-[#fc4c02] text-white shadow-md'
                          : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/10'
                      }`}
                    >
                      <span>👏</span>
                      <span>{post.likesCount || 0} Kudos</span>
                    </button>

                    <button
                      onClick={() =>
                        setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
                    >
                      <MessageSquare size={13} />
                      <span>{post.comments?.length || 0}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => onSelectActivityDetail?.(post)}
                    className="bg-white/10 hover:bg-white/15 text-white font-bold text-xs py-1.5 px-3 rounded-full border border-white/10 flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <BarChart3 size={13} />
                    <span>Analysis &amp; Splits</span>
                  </button>
                </div>

                {/* Collapsible Comments Drawer */}
                {activeCommentPostId === post.id && (
                  <div className="pt-3 border-t border-white/10 space-y-2.5 animate-fade-in">
                    {post.comments && post.comments.length > 0 ? (
                      <div className="space-y-1.5 max-h-32 overflow-y-auto">
                        {post.comments.map((c) => (
                          <div key={c.id} className="text-xs bg-[#141923] p-2 rounded-xl border border-white/10">
                            <span className="font-bold text-white mr-1.5">{c.userName}:</span>
                            <span className="text-white/70">{c.text}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-white/50 italic">No comments yet. Cheer the athlete!</p>
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
                        className="flex-1 px-3 py-1.5 rounded-xl bg-[#141923] border border-white/10 text-xs text-white focus:outline-none focus:border-[#ccff00]"
                      />
                      <button
                        type="submit"
                        disabled={!commentInputs[post.id]?.trim()}
                        className="bg-[#ccff00] hover:bg-[#b8e600] text-black font-black text-xs px-3 py-1.5 rounded-xl disabled:opacity-50 cursor-pointer"
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

      {/* Fullscreen Photo Lightbox */}
      {zoomImage && (
        <ZoomableImageModal
          imageSrc={zoomImage.src}
          title={zoomImage.title}
          onClose={() => setZoomImage(null)}
        />
      )}
    </div>
  );
};
