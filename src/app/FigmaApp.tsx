import { useEffect, useId, useRef, useState, useMemo, lazy, Suspense } from "react"
import { AUTHENTIC_STRAVA_POSTS } from "../data/authenticStravaData"
import { generateRouteSvgPath } from "../utils/milestonesTracker"
import {
  Armor,
  Community,
  MapsEngine,
  Playbook,
  WorkoutPlayer,
  studioTransfer,
} from "./AthleteCore"
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts"
import {
  createBrowserRouter,
  RouterProvider,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router"
import { RouteIntelligenceFirestoreService } from "../services/routeIntelligence/routeFirestoreService"
import { useAthleteApp } from "../context/AthleteAppContext"

// Code-split tabs and modals to minimize initial bundle size on mobile devices
const GoogleFitHomeDashboard = lazy(() => import("../components/GoogleFitHomeDashboard").then((m) => ({ default: m.GoogleFitHomeDashboard })))
const DisciplineTab = lazy(() => import("../components/DisciplineTab").then((m) => ({ default: m.DisciplineTab })))
const FootballTab = lazy(() => import("../components/FootballTab").then((m) => ({ default: m.FootballTab })))
const NutritionTab = lazy(() => import("../components/NutritionTab").then((m) => ({ default: m.NutritionTab })))
const PeriodTab = lazy(() => import("../components/PeriodTab").then((m) => ({ default: m.PeriodTab })))
const MusicVedasTab = lazy(() => import("../components/MusicVedasTab").then((m) => ({ default: m.MusicVedasTab })))
const SettingsVaultTab = lazy(() => import("../components/SettingsVaultTab").then((m) => ({ default: m.SettingsVaultTab })))
const SughoshDixitPortfolioTab = lazy(() => import("../components/SughoshDixitPortfolioTab").then((m) => ({ default: m.SughoshDixitPortfolioTab })))
const GpsActivityTrackerModal = lazy(() => import("../components/GpsActivityTrackerModal").then((m) => ({ default: m.GpsActivityTrackerModal })))
const StravaRouteFlybyPlayer = lazy(() => import("../components/StravaRouteFlybyPlayer").then((m) => ({ default: m.StravaRouteFlybyPlayer })))
const SocialWorkoutShareModal = lazy(() => import("../components/SocialWorkoutShareModal").then((m) => ({ default: m.SocialWorkoutShareModal })))
const CreateActivityPostModal = lazy(() => import("../components/CreateActivityPostModal").then((m) => ({ default: m.CreateActivityPostModal })))
const StravaActivityDetailModal = lazy(() => import("../components/StravaActivityDetailModal").then((m) => ({ default: m.StravaActivityDetailModal })))
const StravaAthleteProfileModal = lazy(() => import("../components/StravaAthleteProfileModal").then((m) => ({ default: m.StravaAthleteProfileModal })))
const ActivityRouteDetailView = lazy(() => import("../components/routeIntelligence/ActivityRouteDetailView").then((m) => ({ default: m.ActivityRouteDetailView })))
const NotificationCenterDrawer = lazy(() => import("../components/NotificationCenterDrawer").then((m) => ({ default: m.NotificationCenterDrawer })))
const AiCoachBriefingCard = lazy(() => import("../components/AiCoachBriefingCard").then((m) => ({ default: m.AiCoachBriefingCard })))
const MorningStandupCard = lazy(() => import("../components/MorningStandupCard").then((m) => ({ default: m.MorningStandupCard })))
const AthleteSkillTreeModal = lazy(() => import("../components/AthleteSkillTreeModal").then((m) => ({ default: m.AthleteSkillTreeModal })))
const ManualActivityLogModal = lazy(() => import("../components/ManualActivityLogModal").then((m) => ({ default: m.ManualActivityLogModal })))
const AutoDetectedActivityModal = lazy(() => import("../components/AutoDetectedActivityModal").then((m) => ({ default: m.AutoDetectedActivityModal })))
const GeminiAiHarnessModal = lazy(() => import("../components/GeminiAiHarnessModal").then((m) => ({ default: m.GeminiAiHarnessModal })))
import type { ManualCategory } from "../components/ManualActivityLogModal"
import { notificationService } from "../services/notificationService"
import { autoActivityDetectionService } from "../services/autoActivityDetectionService"
import { ActivityMapPreview } from "../components/ActivityMapPreview"
import { getRoutePointsForWorkout, createAspectRatioProjector } from "../utils/routeGeometryGenerator"
import { ActivityExportService } from "../utils/activityExportService"
import { drawAnimatedAthleteMarker } from "../utils/googleMapsRenderer"
import { calculateHaversineKm } from "../utils/gpsFilter"
import type { UserProfile, GpsActivityLog, StravaActivityPost, SocialShareCardData, Workout, Sport, AutoDetectedActivity } from "../types"
import type { ActivityDocument, RouteGeometryDocument } from "../types/routeIntelligence"
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Bike,
  Check,
  ChevronRight,
  Clock3,
  Compass,
  Download,
  Dumbbell,
  Flame,
  Footprints,
  Grid2X2,
  Heart,
  List,
  MapPin,
  Map,
  Moon,
  MoreHorizontal,
  Mountain,
  Music,
  Pause,
  Play,
  Plus,
  Settings2,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Users,
  Utensils,
  Share2,
  Video,
  X,
  Zap,
} from "lucide-react"

function buildWorkoutFromStravaPost(p: any, idx: number): Workout {
  let routeSvg = "M87 146 L73 132 L70 104 L86 78 L104 74 L115 49 L143 41 L173 50 L181 79 L203 88 L215 110 L210 139 L189 155 L165 161 L143 180 L114 172 L105 151 L87 146 Z";
  if (p.gpsActivity?.routePoints && p.gpsActivity.routePoints.length > 2) {
    routeSvg = generateRouteSvgPath(p.gpsActivity.routePoints, 280, 140);
  }

  const durationSec = p.gpsActivity?.durationSeconds || (p.totalMoveMinutes ? p.totalMoveMinutes * 60 : 1500);
  const timeStr = `${Math.floor(durationSec / 60)}:${String(durationSec % 60).padStart(2, '0')}`;

  return {
    id: 1000 + idx,
    title: p.title,
    sport: (p.sportType === "cycle"
      ? "Cycling"
      : p.sportType === "calisthenics"
        ? "Calisthenics"
        : p.sportType === "football"
          ? "Football"
          : "Running") as Exclude<Sport, "All activities">,
    date: p.date.toUpperCase(),
    distance: p.totalDistanceKm ? p.totalDistanceKm.toFixed(2) : "0.00",
    time: timeStr,
    pace: p.avgPaceMinKm || "4:45",
    color:
      p.sportType === "cycle"
        ? "#38bdf8"
        : p.sportType === "calisthenics"
          ? "#c084fc"
          : p.sportType === "football"
            ? "#ccff00"
            : "#fc4c02",
    route: routeSvg,
    record: p.recordBadges?.[0]?.title,
    location: p.activities?.[0]?.details || p.description || "Karnataka, India",
  };
}

const workouts: Workout[] = AUTHENTIC_STRAVA_POSTS.map((p, idx) => buildWorkoutFromStravaPost(p, idx));

const sports: Sport[] = [
  "All activities",
  "Football",
  "Running",
  "Cycling",
  "Calisthenics",
]
const todayNavItems = [
  { path: "/playbook", label: "Today Cockpit", icon: Compass },
]
const trainNavItems = [
  { path: "/activities", label: "Performance Hub", icon: Activity },
  { path: "/football", label: "Football Cockpit", icon: Target },
  { path: "/armor", label: "Pitch Armor", icon: ShieldCheck },
  { path: "/maps", label: "Maps Engine", icon: Map },
  { path: "/studio", label: "Share Studio", icon: Sparkles },
]
const progressNavItems = [
  { path: "/fithub", label: "Google Fit Hub", icon: Heart },
  { path: "/community", label: "Strava Community", icon: Users },
  { path: "/portfolio", label: "Athlete Portfolio", icon: Trophy },
]
const vaultNavItems = [
  { path: "/discipline", label: "Daily Discipline", icon: ShieldCheck },
  { path: "/nutrition", label: "Fuel & Nutrition", icon: Utensils },
  { path: "/vedas", label: "Vedas & Carnatic", icon: Music },
  { path: "/cycle", label: "Cycle Sync", icon: Moon },
  { path: "/settings", label: "Settings Vault", icon: Settings2 },
]
const allAppNavItems = [...todayNavItems, ...trainNavItems, ...progressNavItems, ...vaultNavItems]
export const navItems = allAppNavItems
const panel = "rounded-2xl border border-white/10 bg-[#0e131b] shadow-xl shadow-black/40"
interface SportIconProps {
  sport: string
  size?: number
}
function SportIcon({ sport, size = 15 }: SportIconProps) {
  const Icon =
    sport === "Football"
      ? Target
      : sport === "Cycling"
        ? Bike
        : sport === "Calisthenics"
          ? Dumbbell
          : Footprints
  return <Icon size={size} />
}
function RouteArt({
  workout,
  className = "",
  big = false,
}: {
  workout: Workout
  className?: string
  big?: boolean
}) {
  const id = useId().replace(/:/g, "")
  return (
    <svg
      viewBox="0 0 290 220"
      className={className}
      aria-label={`${workout.sport} route visualization`}
      role="img"
    >
      <defs>
        <filter id={`glow${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={big ? "3" : "2"} />
        </filter>
        <pattern
          id={`dots${id}`}
          width="13"
          height="13"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="1" cy="1" r="0.6" fill="#738299" opacity="0.18" />
        </pattern>
      </defs>
      <rect width="290" height="220" fill={`url(#dots${id})`} />
      <path
        d={workout.route}
        fill="none"
        stroke={workout.color}
        strokeWidth="5"
        opacity="0.19"
        filter={`url(#glow${id})`}
      />
      <path
        d={workout.route}
        fill="none"
        stroke={workout.color}
        strokeWidth={big ? "1.5" : "1.25"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={workout.sport === "Running" ? "87" : "77"}
        cy={workout.sport === "Running" ? "146" : "160"}
        r="3.5"
        fill={workout.color}
        stroke="#10151d"
        strokeWidth="2"
      />
    </svg>
  )
}
function Readiness({ large = false }: { large?: boolean }) {
  const id = useId().replace(/:/g, "")
  return (
    <div className={`relative mx-auto ${large ? "h-64 w-64" : "h-44 w-44"}`}>
      <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
        <defs>
          <linearGradient id={id}>
            <stop stopColor="#52e9c4" />
            <stop offset="1" stopColor="#ccff00" />
          </linearGradient>
        </defs>
        <circle
          cx="100"
          cy="100"
          r="83"
          fill="none"
          stroke="#232c29"
          strokeWidth="8"
        />
        <circle
          cx="100"
          cy="100"
          r="83"
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth="8"
          strokeDasharray="480 522"
          strokeLinecap="round"
        />
        <circle
          cx="100"
          cy="100"
          r="69"
          fill="none"
          stroke="#ffffff06"
          strokeWidth="1"
          strokeDasharray="1 8"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`font-display font-extrabold ${
            large ? "text-6xl" : "text-[43px]"
          }`}
        >
          92<span className="ml-0.5 text-xl text-muted-foreground">%</span>
        </span>
        <span className="mt-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Peak condition
        </span>
      </div>
    </div>
  )
}
function Ridgelines({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 640 280"
      className={className}
      role="img"
      aria-label="Stacked elevation ridgelines showing a 185-meter climb"
    >
      <defs>
        <linearGradient id="ridgefill" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#fc4c02" stopOpacity="0.15" />
          <stop offset="1" stopColor="#10151d" />
        </linearGradient>
      </defs>
      {Array.from({ length: 19 }, (_, index) => {
        const baseline = 32 + index * 12
        const points = Array.from({ length: 95 }, (_, point) => {
          const position = point / 94
          const amplitude =
            Math.exp(-Math.pow((position - 0.54) / 0.23, 2)) *
            (24 + index * 2.8)
          const elevation =
            amplitude *
            (0.62 +
              0.22 * Math.sin(point * 0.7 + index * 0.3) +
              0.16 * Math.cos(point * 1.9))
          return `${20 + position * 600},${baseline - elevation}`
        })
        return (
          <path
            key={index}
            d={`M20 ${baseline} L${points.join(" L")} L620 ${baseline} Z`}
            fill="#10151d"
            stroke={index % 4 === 0 ? "#fc4c02" : "#9c6650"}
            strokeOpacity={0.3 + index / 32}
            strokeWidth="1"
          />
        )
      })}
    </svg>
  )
}
function AppShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const {
    currentProfile,
    setCurrentProfile,
    routines,
    quotes,
    workoutLogs,
    gpsActivities,
    stravaPosts,
    milestones,
    footballDrills,
    carnaticItems,
    instrumentSongs,
    vedaSuktas,
    stats,
    periodLogs,
    periodSettings,
    setPeriodLogs,
    setPeriodSettings,
    handleToggleRoutine,
    handleAddRoutine,
    handleAddQuote,
    handleLogWorkout,
    handleSaveGpsActivity,
    handleSaveStravaPost,
    /* handleDeletePost, */
    handleLikePost,
    handleAddComment,
    gpsModalActivityType,
    setGpsModalActivityType,
    activeShareCardData,
    setActiveShareCardData,
    flybyActivity,
    setFlybyActivity,
    editingPost,
    setEditingPost,
    selectedStravaActivityDetail,
    setSelectedStravaActivityDetail,
    showAthleteProfileModal,
    setShowAthleteProfileModal,
    openShareFromGps,
    openShareFromPost,
  } = useAthleteApp()

  const [filter, setFilter] = useState<Sport>("All activities")
  const [list, setList] = useState(false)
  const [selected, setSelected] = useState<Workout | null>(null)
  const [routeDetailData, setRouteDetailData] = useState<{
    activity: ActivityDocument;
    geometries: Record<string, RouteGeometryDocument>;
  } | null>(null)
  const [activityPreviewMode, setActivityPreviewMode] = useState<'map' | 'art'>('map')
  const [exportingPoster, setExportingPoster] = useState(false)
  const [exportingVideo, setExportingVideo] = useState(false)
  const [videoExportProgress, setVideoExportProgress] = useState(0)
  const [activitiesViewMode, setActivitiesViewMode] = useState<'simple' | 'pro'>('simple')
  const [notification, setNotification] = useState(false)
  const [skillTreeOpen, setSkillTreeOpen] = useState(false)
  const [showGeminiHarness, setShowGeminiHarness] = useState(false)
  const [session, setSession] = useState(false)
  const [activityLauncherOpen, setActivityLauncherOpen] = useState(false)
  const [manualLogOpen, setManualLogOpen] = useState(false)
  const [manualLogCategory, setManualLogCategory] = useState<ManualCategory>('calisthenics')
  const [isDailyRecapMode, setIsDailyRecapMode] = useState(false)
  const [autoActivitiesModalOpen, setAutoActivitiesModalOpen] = useState(false)
  const [pendingAutoActivities, setPendingAutoActivities] = useState<AutoDetectedActivity[]>([])
  const [activeSession, setActiveSession] = useState(false)
  const [sessionSport, setSessionSport] = useState("Running")
  const [elapsed, setElapsed] = useState(0)
  const [toast, setToast] = useState("")
  const [settings, setSettings] = useState(false)
  const [completed, setCompleted] = useState<number[]>([0])
  const [period, setPeriod] = useState("This week")
  const [weeklyGoal, setWeeklyGoal] = useState(
    () => Number(localStorage.getItem("everything-weekly-goal")) || 75,
  )
  const [goalDraft, setGoalDraft] = useState(String(weeklyGoal))
  const page = location.pathname
  const activities = page === "/activities"
  const playbook = page === "/" || page === "/playbook"
  const corePage =
    playbook ||
    [
      "/armor",
      "/community",
      "/maps",
      "/fithub",
      "/discipline",
      "/routine",
      "/nutrition",
      "/vedas",
      "/cycle",
      "/period",
      "/portfolio",
      "/settings",
    ].includes(page)

  useEffect(() => {
    if (!toast) return
    const timeout = setTimeout(() => setToast(""), 4500)
    return () => clearTimeout(timeout)
  }, [toast])

  useEffect(() => {
    if (!activeSession) return
    const interval = setInterval(() => setElapsed((value: number) => value + 1), 1000)
    return () => clearInterval(interval)
  }, [activeSession])

  useEffect(() => {
    setSelected(null)
    window.scrollTo(0, 0)
  }, [page])

  const handleExecuteNotificationAction = (payload: { tab?: string; modal?: string; initialCategory?: string }) => {
    if (payload.tab) {
      if (payload.tab === "discipline") navigate("/discipline")
      else if (payload.tab === "activities") navigate("/activities")
      else if (payload.tab === "calisthenics") navigate("/workout")
      else navigate(`/${payload.tab}`)
    }

    if (payload.modal === 'manual_log') {
      if (payload.initialCategory) {
        setManualLogCategory(payload.initialCategory as ManualCategory)
      }
      setManualLogOpen(true)
    } else if (payload.modal === 'daily_recap') {
      setIsDailyRecapMode(true)
      setEditingPost(null)
    } else if (payload.modal === 'auto_detected_review') {
      setAutoActivitiesModalOpen(true)
    }
  }

  useEffect(() => {
    // Load pending auto-detected missed activities
    autoActivityDetectionService.getPendingActivities().then(setPendingAutoActivities).catch(console.error)
    const unsubscribeAuto = autoActivityDetectionService.subscribe(setPendingAutoActivities)

    try {
      notificationService.syncAllActiveAlarms()
      const params = new URLSearchParams(window.location.search)
      const action = params.get("action")
      if (action === "start_run") {
        setGpsModalActivityType("run")
      } else if (action === "football") {
        navigate("/football")
      } else if (action === "log_workout") {
        navigate("/discipline")
      } else if (action === "vedas") {
        navigate("/vedas")
      } else if (action === "manual_log") {
        const cat = (params.get("category") as ManualCategory) || "calisthenics"
        setManualLogCategory(cat)
        setManualLogOpen(true)
      } else if (action === "daily_recap") {
        setIsDailyRecapMode(true)
        setEditingPost(null)
      } else if (action === "auto_review") {
        setAutoActivitiesModalOpen(true)
      }
    } catch (e) {
      console.warn("Shortcut parameter parsing error:", e)
    }

    const handleDeepLink = (e: any) => {
      const act = e.detail?.action
      if (act === 'daily_recap') {
        setIsDailyRecapMode(true)
        setEditingPost(null)
      } else if (act === 'manual_calisthenics' || act === 'calisthenics') {
        setManualLogCategory('calisthenics')
        setManualLogOpen(true)
      } else if (act === 'manual_badminton' || act === 'badminton') {
        setManualLogCategory('badminton')
        setManualLogOpen(true)
      } else if (act === 'manual_football' || act === 'football') {
        setManualLogCategory('football')
        setManualLogOpen(true)
      } else if (act === 'discipline' || act === 'anfield_pulse') {
        navigate('/discipline')
      } else if (act === 'OPEN_AUTO_DETECTED_REVIEW' || act === 'auto_detected_review') {
        setAutoActivitiesModalOpen(true)
      }
    }

    window.addEventListener('kuchh_bhii_deep_link', handleDeepLink)

    // Check AndroidBridge on boot for notification click
    if (typeof window !== 'undefined' && window.AndroidBridge && typeof window.AndroidBridge.getPendingNotificationAction === 'function') {
      const pending = window.AndroidBridge.getPendingNotificationAction()
      if (pending) {
        handleDeepLink({ detail: { action: pending } })
      }
    }

    return () => {
      window.removeEventListener('kuchh_bhii_deep_link', handleDeepLink)
      unsubscribeAuto()
    }
  }, [])

  const formattedTime = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`

  const allWorkouts: Workout[] = useMemo(() => {
    if (stravaPosts && stravaPosts.length > 0) {
      return stravaPosts.map((p, idx) => buildWorkoutFromStravaPost(p, idx));
    }
    return workouts;
  }, [stravaPosts])

  return (
    <div className="min-h-screen bg-background font-sans text-foreground overflow-x-hidden">
      {/* DESKTOP SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[212px] flex-col border-r border-border bg-[#0b0e14] px-5 py-8 lg:flex overflow-y-auto scrollbar-none">
        <NavLink to="/" className="mb-1 flex items-center gap-2.5 px-2">
          <BrandMark />
          <span className="font-display text-[20px] font-extrabold tracking-[-0.8px]">
            kuchh bhii<span className="text-primary">.</span>
          </span>
        </NavLink>
        <span className="ml-10 mt-2 text-[8px] font-medium tracking-[0.21em] text-muted-foreground">
          LIFE MASTERY & PERFORMANCE
        </span>

        {/* 1. TODAY COCKPIT */}
        <div className="mt-8 px-3 text-[9px] font-semibold tracking-[0.16em] text-[#666f7e]">
          TODAY COCKPIT
        </div>
        <nav className="mt-3 flex flex-col gap-1.5">
          {todayNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className={({ isActive }: { isActive: boolean }) =>
                `relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[12px] font-medium transition-colors ${
                  isActive || (item.path === "/playbook" && page === "/")
                    ? "bg-primary/10 text-primary font-bold shadow-sm"
                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <item.icon size={16} strokeWidth={1.7} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* 2. TRAIN & LIVE TRACKING */}
        <div className="mt-6 px-3 text-[9px] font-semibold tracking-[0.16em] text-[#666f7e]">
          TRAIN & LIVE TRACKING
        </div>
        <nav className="mt-3 flex flex-col gap-1.5">
          {trainNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className={({ isActive }: { isActive: boolean }) =>
                `relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[12px] font-medium transition-colors ${
                  isActive
                    ? "bg-primary/8 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <item.icon size={16} strokeWidth={1.7} />
              {item.label}
              {item.label === "Share Studio" && (
                <span className="ml-auto rounded border border-primary/25 px-1 py-0.5 text-[7px] text-primary">
                  NEW
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* 3. PROGRESS & TELEMETRY */}
        <div className="mt-6 px-3 text-[9px] font-semibold tracking-[0.16em] text-[#666f7e]">
          PROGRESS & TELEMETRY
        </div>
        <nav className="mt-3 flex flex-col gap-1.5">
          {progressNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className={({ isActive }: { isActive: boolean }) =>
                `relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[12px] font-medium transition-colors ${
                  isActive
                    ? "bg-sky-400/10 text-sky-400 font-semibold"
                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <item.icon size={16} strokeWidth={1.7} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* 4. VAULT & HABITS */}
        <div className="mt-6 px-3 text-[9px] font-semibold tracking-[0.16em] text-[#666f7e]">
          VAULT & HABITS
        </div>
        <nav className="mt-3 flex flex-col gap-1.5">
          {vaultNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className={({ isActive }: { isActive: boolean }) =>
                `relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[12px] font-medium transition-colors ${
                  isActive
                    ? "bg-[#c084fc]/10 text-[#c084fc] font-semibold"
                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <item.icon size={16} strokeWidth={1.7} />
              {item.label}
              {item.path === "/cycle" && currentProfile === "women" && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-pink-400" />
              )}
            </NavLink>
          ))}
        </nav>

        {/* FOOTER */}
        <div className="mt-auto pt-6">
          <div className="mb-4 rounded-xl border border-primary/15 bg-linear-to-br from-primary/8 to-transparent p-3.5">
            <div className="mb-2 flex items-center gap-2 text-primary">
              <Zap size={14} fill="currentColor" />
              <span className="text-[10px] font-semibold tracking-wider">
                KUCHH BHII PRO
              </span>
            </div>
            <p className="text-[10px] leading-4 text-[#a7b09b]">
              Unlocked for {currentProfile === "women" ? "Shreya" : "Sughosh"} · All telemetry active
            </p>
          </div>
          <button
            onClick={() => navigate("/settings")}
            className="mb-4 flex items-center gap-3 px-3 text-[12px] text-muted-foreground hover:text-white"
          >
            <Settings2 size={16} />
            Settings & vault
          </button>
          <div className="flex items-center gap-3 border-t border-border pt-4">
            <button
              onClick={() => setCurrentProfile(currentProfile === "men" ? "women" : "men")}
              className="flex items-center gap-3 text-left group flex-1"
              title="Click to toggle athlete profile"
            >
              <Avatar small profile={currentProfile} />
              <div className="min-w-0">
                <div className="text-[12px] font-semibold truncate group-hover:text-primary transition">
                  {currentProfile === "women" ? "Shreya Dixit" : "Sughosh Dixit"}
                </div>
                <div className="text-[9px] text-muted-foreground flex items-center gap-1">
                  <span>{currentProfile === "women" ? "👩 Athlete" : "👨 Athlete"}</span>
                  <span>·</span>
                  <span className="text-primary/75">Toggle ⇄</span>
                </div>
              </div>
            </button>
            <button
              aria-label="Open athlete profile"
              onClick={() => setShowAthleteProfileModal(true)}
              className="ml-auto text-muted-foreground hover:text-white"
            >
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN LAYOUT */}
      <div className="lg:ml-[212px] min-w-0 max-w-full overflow-x-hidden">
        {/* TOP HEADER */}
        <header className="sticky top-0 z-20 flex min-h-[58px] sm:min-h-[64px] items-center justify-between border-b border-white/10 bg-[#080b11]/95 px-4 sm:px-8 xl:px-10 pt-[max(0.75rem,env(safe-area-inset-top,0px))] pb-2 backdrop-blur-xl">
          <div className="hidden items-center gap-2 text-[11px] text-muted-foreground lg:flex">
            Your workspace <ChevronRight size={12} />
            <span className="text-[#d6dae0]">
              {playbook
                ? "Yellow Dude playbook"
                : allAppNavItems.find((item) => item.path === page)?.label ||
                  (page === "/football" ? "Football Cockpit" : "Performance")}
            </span>
          </div>
          <NavLink to="/" className="flex items-center gap-2 lg:hidden">
            <BrandMark />
            <span className="font-display text-[17px] sm:text-lg font-extrabold tracking-tight">
              kuchh bhii<span className="text-primary">.</span>
            </span>
          </NavLink>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setSkillTreeOpen(true)}
              className="flex items-center gap-1.5 rounded-full border border-[#fc4c02]/30 bg-gradient-to-r from-[#fc4c02]/15 to-[#CCFF00]/10 px-2 sm:px-2.5 py-1 text-[9px] font-bold tracking-[0.06em] text-[#ff8952] hover:brightness-110 transition cursor-pointer shadow-sm shrink-0"
              title="Duo Co-Op Flame: 14-day joint consistency"
            >
              <Flame size={12} fill="currentColor" className="text-[#FC5200] animate-pulse" />
              <span>14D</span>
              <span className="hidden sm:inline">DUO FLAME</span>
            </button>
            <button
              onClick={() => setShowGeminiHarness(true)}
              className="flex items-center gap-1.5 rounded-full bg-[#CCFF00] hover:bg-[#b8e600] px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs font-black tracking-wider text-black shadow-md shadow-[#CCFF00]/25 active:scale-95 transition cursor-pointer font-mono shrink-0"
              title="Open Gemini AI Interactive Test Harness"
              aria-label="Open Gemini AI"
            >
              <Sparkles size={12} fill="currentColor" />
              <span className="hidden sm:inline">AI HARNESS</span>
              <span className="sm:hidden font-extrabold">AI</span>
            </button>
            <div className="relative shrink-0">
              <button
                onClick={() => setNotification(true)}
                aria-label="Notifications"
                aria-expanded={notification}
                className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white transition"
                title="Open Notification Center & Alarms"
              >
                <Bell size={16} />
                {notificationService.getUnreadCount() > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#FC5200] text-[9px] font-black text-white shadow-sm">
                    {notificationService.getUnreadCount()}
                  </span>
                )}
              </button>
            </div>
            <div className="hidden sm:block h-6 w-px bg-border" />
            <button
              aria-label="Toggle athlete profile"
              onClick={() => setCurrentProfile(currentProfile === "men" ? "women" : "men")}
              className="flex items-center gap-1.5 rounded-full border border-border px-1.5 sm:px-2 py-1 text-xs text-muted-foreground hover:border-white/30 shrink-0"
              title="Click to toggle athlete profile"
            >
              <Avatar small profile={currentProfile} />
              <span className="hidden sm:inline text-[11px] font-semibold text-white">
                {currentProfile === "women" ? "Shreya" : "Sughosh"}
              </span>
            </button>
            <button
              onClick={() => setActivityLauncherOpen(true)}
              className="hidden sm:flex shrink-0 items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-[11px] font-bold text-primary-foreground shadow-[0_0_24px_#ccff0010] transition hover:bg-[#dcff4d]"
            >
              <Plus size={15} />
              <span>Log activity</span>
            </button>
          </div>
        </header>

        {/* MAIN BODY */}
        <main className="mx-auto max-w-[1640px] px-4 pb-32 pt-5 sm:px-8 sm:pt-8 sm:pb-20 lg:pb-10 xl:px-10">
          <div
            className={
              corePage ? "hidden" : "mb-7 flex items-end justify-between gap-4"
            }
          >
            <div>
              <div className="mb-2 flex items-center gap-2 text-[9px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Thursday, October 1, 2026
              </div>
              <h1 className="font-display text-[29px] font-extrabold leading-tight sm:text-[34px]">
                {activities ? (
                  <>
                    Every effort.{" "}
                    <span className="text-[#737c8b]">A work of art.</span>
                  </>
                ) : page === "/football" ? (
                  <>
                    Made for <span className="text-primary">match day.</span>
                  </>
                ) : page === "/studio" ? (
                  <>
                    Your effort.{" "}
                    <span className="text-[#737c8b]">Your masterpiece.</span>
                  </>
                ) : (
                  <>
                    Go deeper.{" "}
                    <span className="text-[#737c8b]">Get better.</span>
                  </>
                )}
              </h1>
              <p className="mt-2 text-[12px] leading-5 text-muted-foreground">
                {activities
                  ? "Your movement, mapped. Your progress, undeniable."
                  : page === "/football"
                    ? "Train with intention. Step onto the pitch with confidence."
                    : page === "/studio"
                      ? "Turn the miles into something worth sharing."
                      : "The numbers behind your next breakthrough."}
              </p>
            </div>
            <button
              onClick={() => setActivityLauncherOpen(true)}
              className="hidden shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-3 text-[11px] font-bold text-primary-foreground shadow-[0_0_24px_#ccff0010] transition hover:bg-[#dcff4d] sm:flex"
            >
              <Plus size={15} />
              Log activity
            </button>
          </div>

          {/* SUB-PILLAR QUICK SWITCHER PILL BAR */}
          {(page === "/activities" || page === "/football" || page === "/armor" || page === "/maps" || page === "/studio") && (
            <div className="mb-5 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { path: "/activities", label: "Performance Hub", icon: Activity },
                { path: "/football", label: "Football Cockpit", icon: Target },
                { path: "/armor", label: "Pitch Armor", icon: ShieldCheck },
                { path: "/maps", label: "Maps Engine", icon: Map },
                { path: "/studio", label: "4K Studio", icon: Sparkles },
              ].map((sub) => (
                <NavLink
                  key={sub.path}
                  to={sub.path}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                      isActive
                        ? "bg-primary text-black shadow-md shadow-primary/20"
                        : "bg-white/5 border border-white/10 text-zinc-400 hover:text-white"
                    }`
                  }
                >
                  <sub.icon size={13} />
                  <span>{sub.label}</span>
                </NavLink>
              ))}
            </div>
          )}

          {(page === "/fithub" || page === "/community" || page === "/portfolio") && (
            <div className="mb-5 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { path: "/fithub", label: "Google Fit Hub (1,456d)", icon: Heart },
                { path: "/community", label: "Strava Community", icon: Users },
                { path: "/portfolio", label: "Athlete Portfolio", icon: Trophy },
              ].map((sub) => (
                <NavLink
                  key={sub.path}
                  to={sub.path}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                      isActive
                        ? "bg-primary text-black shadow-md shadow-primary/20"
                        : "bg-white/5 border border-white/10 text-zinc-400 hover:text-white"
                    }`
                  }
                >
                  <sub.icon size={13} />
                  <span>{sub.label}</span>
                </NavLink>
              ))}
            </div>
          )}

          {(page === "/discipline" || page === "/routine" || page === "/nutrition" || page === "/vedas" || page === "/cycle" || page === "/period" || page === "/settings") && (
            <div className="mb-5 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { path: "/discipline", label: "Daily Discipline", icon: ShieldCheck },
                { path: "/nutrition", label: "Fuel & Nutrition", icon: Utensils },
                { path: "/vedas", label: "Vedas & Carnatic", icon: Music },
                { path: "/cycle", label: "Cycle Sync", icon: Moon },
                { path: "/settings", label: "Settings Vault", icon: Settings2 },
              ].map((sub) => (
                <NavLink
                  key={sub.path}
                  to={sub.path}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                      isActive
                        ? "bg-[#c084fc] text-black shadow-md shadow-[#c084fc]/20"
                        : "bg-white/5 border border-white/10 text-zinc-400 hover:text-white"
                    }`
                  }
                >
                  <sub.icon size={13} />
                  <span>{sub.label}</span>
                </NavLink>
              ))}
            </div>
          )}

          <Suspense fallback={<div className="p-8 text-center text-xs text-white/40 font-mono animate-pulse">Loading view...</div>}>
          {playbook ? (
            <div className="space-y-6">
              {pendingAutoActivities.length > 0 && (
                <div className="overflow-hidden rounded-2xl border border-primary/40 bg-gradient-to-r from-primary/15 via-[#18231c] to-black/60 p-4 backdrop-blur-md shadow-xl shadow-primary/10 animate-in fade-in slide-in-from-top-2">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-black font-extrabold shadow-lg shadow-primary/25">
                        <Compass className="h-5 w-5 animate-pulse" />
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-black uppercase tracking-wider text-primary">
                            🎯 Missed Workout Detected
                          </span>
                          <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">
                            {pendingAutoActivities.length} Unconfirmed
                          </span>
                        </div>
                        <p className="text-xs text-white/80 line-clamp-1 mt-0.5">
                          {pendingAutoActivities[0].suggestedTitle} • {pendingAutoActivities[0].distanceKm.toFixed(1)} km in {Math.round(pendingAutoActivities[0].durationSeconds / 60)}m ({pendingAutoActivities[0].avgCadenceSpm} spm)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => setAutoActivitiesModalOpen(true)}
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-extrabold text-black shadow-lg shadow-primary/25 hover:brightness-110 active:scale-95 transition-all w-full sm:w-auto"
                      >
                        <span>Review & Add</span>
                        <ChevronRight className="h-4 w-4 stroke-[3]" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <AiCoachBriefingCard
                athleteName={currentProfile === "women" ? "Shreya" : "Sughosh"}
                streakCount={14}
                weeklyDistanceKm={milestones.longestRunKm || 18.5}
                recentPace={milestones.fastest1kRunSeconds ? `${Math.floor(milestones.fastest1kRunSeconds / 60)}:${String(milestones.fastest1kRunSeconds % 60).padStart(2, '0')} /km` : "4:52 /km"}
                onQuickAction={(action) => {
                  if (action === "run") setGpsModalActivityType("run")
                  else if (action === "football") navigate("/football")
                }}
                onOpenAiHarness={() => setShowGeminiHarness(true)}
              />
              <MorningStandupCard
                currentProfile={currentProfile}
                streakCount={14}
                completedHabitsCount={routines.filter(r => r.completed).length}
                totalHabitsCount={routines.length}
                onQuickAction={(action) => {
                  if (action === "run") setGpsModalActivityType("run")
                  else if (action === "football") navigate("/football")
                }}
              />
              <Playbook />
            </div>
          ) : page === "/armor" ? (
            <Armor />
          ) : page === "/community" ? (
            <Community
              toast={setToast}
              posts={stravaPosts}
              currentProfile={currentProfile}
              onLikePost={handleLikePost}
              onAddComment={handleAddComment}
              onOpenFlyby={(act: GpsActivityLog) => setFlybyActivity(act)}
              onOpenSocialShare={(p: StravaActivityPost) => openShareFromPost(p)}
              onSelectDetail={(p: StravaActivityPost) => setSelectedStravaActivityDetail(p)}
              onOpenCreatePost={() => setEditingPost(null)}
            />
          ) : page === "/maps" ? (
            <MapsEngine toast={setToast} />
          ) : page === "/studio" ? (
            <Studio toast={setToast} />
          ) : page === "/fithub" ? (
            <GoogleFitHomeDashboard
              currentProfile={currentProfile}
              workoutLogs={workoutLogs}
              gpsActivities={gpsActivities}
              milestones={milestones}
              quotes={quotes}
              onOpenGpsTracker={(type) => setGpsModalActivityType(type)}
              onOpenCalisthenics={() => navigate("/playbook")}
              onOpenFootball={() => navigate("/football")}
              onOpenSocialShare={(data) => setActiveShareCardData(data)}
              onOpenFlyby={(act: GpsActivityLog) => setFlybyActivity(act)}
              onOpenCreatePost={() => setEditingPost(null)}
              onOpenFeed={() => navigate("/community")}
            />
          ) : page === "/discipline" || page === "/routine" ? (
            <DisciplineTab
              currentProfile={currentProfile}
              routines={routines}
              quotes={quotes}
              stats={stats}
              onToggleRoutine={handleToggleRoutine}
              onAddRoutine={handleAddRoutine}
            />
          ) : page === "/football" ? (
            <div className="space-y-10">
              <Football completed={completed} setCompleted={setCompleted} />
              <div className="border-t border-border pt-8">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-2xl font-bold">
                      Tactical Match Drills & Protocol
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Positional agility, sprint conditioning, and match-day drill library.
                    </p>
                  </div>
                  <button
                    onClick={() => setEditingPost(null)}
                    className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground"
                  >
                    <Plus size={14} /> Log Drill
                  </button>
                </div>
                <FootballTab
                  drills={footballDrills}
                  onOpenCreatePost={() => setEditingPost(null)}
                />
              </div>
            </div>
          ) : page === "/nutrition" ? (
            <NutritionTab currentProfile={currentProfile} />
          ) : page === "/vedas" ? (
            <MusicVedasTab
              carnaticItems={carnaticItems}
              instrumentSongs={instrumentSongs}
              vedaSuktas={vedaSuktas}
            />
          ) : page === "/cycle" || page === "/period" ? (
            <PeriodTab
              currentProfile={currentProfile}
              logs={periodLogs}
              settings={periodSettings}
              onUpdateLogs={setPeriodLogs}
              onUpdateSettings={setPeriodSettings}
            />
          ) : page === "/portfolio" ? (
            <SughoshDixitPortfolioTab
              onOpenCreatePost={() => setEditingPost(null)}
            />
          ) : page === "/settings" ? (
            <SettingsVaultTab quotes={quotes} onAddQuote={handleAddQuote} onOpenAiHarness={() => setShowGeminiHarness(true)} />
          ) : activities ? (
            <>
              {/* TOP PERFORMANCE DASHBOARD HEADER & SIMPLIFIED TOGGLE */}
              <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2 font-display">
                    <span>Performance Dashboard</span>
                    <span className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[9px] font-bold text-primary">
                      {activitiesViewMode === 'simple' ? '✨ Simple Mode' : '📊 Lab Telemetry'}
                    </span>
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {activitiesViewMode === 'simple'
                      ? 'Clean, intuitive overview of your training, movement, and progress.'
                      : 'Comprehensive biomechanical data, ridgeline climbs, and weekly pace distribution.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setAutoActivitiesModalOpen(true)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                      pendingAutoActivities.length > 0
                        ? 'border-primary/50 bg-primary/20 text-primary shadow-lg shadow-primary/20 animate-pulse'
                        : 'border-white/10 bg-[#0E131B] text-zinc-300 hover:text-white'
                    }`}
                    title="Continuous low-power sensor cadence & passive activity tracker"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span>Passive Detection</span>
                    {pendingAutoActivities.length > 0 && (
                      <span className="ml-1 rounded-full bg-primary px-1.5 py-0.2 text-[9px] font-black text-black">
                        {pendingAutoActivities.length}
                      </span>
                    )}
                  </button>

                  <div className="flex rounded-xl border border-white/10 bg-[#0E131B] p-0.5 shadow-md">
                    <button
                      type="button"
                      onClick={() => setActivitiesViewMode('simple')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        activitiesViewMode === 'simple'
                          ? 'bg-primary text-black font-black shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      ✨ Simple
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivitiesViewMode('pro')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        activitiesViewMode === 'pro'
                          ? 'bg-[#38bdf8] text-black font-black shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      📊 Lab Pro
                    </button>
                  </div>
                </div>
              </div>

              {/* RECOVERED AUTO-DETECTED ACTIVITIES BANNER */}
              {pendingAutoActivities.length > 0 && (
                <div className="mb-6 overflow-hidden rounded-2xl border border-primary/40 bg-gradient-to-r from-primary/15 via-[#18231c] to-black/60 p-4 backdrop-blur-md shadow-xl shadow-primary/10 animate-in fade-in slide-in-from-top-2">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-black font-extrabold shadow-lg shadow-primary/25">
                        <Compass className="h-5 w-5 animate-pulse" />
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-black uppercase tracking-wider text-primary">
                            🎯 Missed Activity Detected in Background
                          </span>
                          <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">
                            {pendingAutoActivities.length} Unconfirmed
                          </span>
                        </div>
                        <p className="text-xs text-white/80 line-clamp-1 mt-0.5">
                          {pendingAutoActivities[0].suggestedTitle} • {pendingAutoActivities[0].distanceKm.toFixed(1)} km in {Math.round(pendingAutoActivities[0].durationSeconds / 60)}m ({pendingAutoActivities[0].avgCadenceSpm} spm)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => setAutoActivitiesModalOpen(true)}
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-extrabold text-black shadow-lg shadow-primary/25 hover:brightness-110 active:scale-95 transition-all w-full sm:w-auto"
                      >
                        <span>Review & Add to Streak</span>
                        <ChevronRight className="h-4 w-4 stroke-[3]" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <AiCoachBriefingCard
                  athleteName={currentProfile === "women" ? "Shreya" : "Sughosh"}
                  streakCount={14}
                  weeklyDistanceKm={milestones.longestRunKm || 64.8}
                  recentPace={milestones.fastest1kRunSeconds ? `${Math.floor(milestones.fastest1kRunSeconds / 60)}:${String(milestones.fastest1kRunSeconds % 60).padStart(2, '0')} /km` : "4:45 /km"}
                />
              </div>

              {/* DAILY ACTIVITY CONSOLIDATION & QUICK MANUAL ENTRY CARD */}
              <div className="mb-6 rounded-2xl border border-white/10 bg-gradient-to-r from-[#121824] via-[#172130] to-[#0f1622] p-4 sm:p-5 text-white shadow-xl flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-[#CCFF00] text-black shadow-lg shadow-amber-500/20">
                    <Share2 size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#CCFF00]">
                        Daily Ledger & Social Media Post
                      </span>
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-bold text-zinc-300">
                        {workoutLogs.length + gpsActivities.length} Activities Today
                      </span>
                    </div>
                    <h4 className="text-sm sm:text-base font-black text-white mt-0.5">
                      Consolidate Today's Badminton, Calisthenics & Cardio
                    </h4>
                    <p className="text-xs text-zinc-300 mt-0.5">
                      Bundle all your sets, reps, and match scores into a shareable 4K athlete card.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      setManualLogCategory("calisthenics")
                      setManualLogOpen(true)
                    }}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-white/10 transition"
                  >
                    <Plus size={14} />
                    <span>+ Quick Log Reps</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsDailyRecapMode(true)
                      setEditingPost(null)
                    }}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-[#CCFF00] px-4 py-2.5 text-xs font-black uppercase tracking-wider text-black hover:bg-[#b8e600] transition shadow-md shadow-[#CCFF00]/20"
                  >
                    <Share2 size={14} />
                    <span>Consolidate & Share</span>
                  </button>
                </div>
              </div>
              <div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                {[
                  {
                    label: "DISTANCE THIS WEEK",
                    value: "64.8",
                    unit: "km",
                    change: "+12.4%",
                    icon: Footprints,
                    color: "text-primary",
                    detail: "vs. last week",
                  },
                  {
                    label: "TIME IN MOTION",
                    value: "6",
                    unit: "h 24m",
                    change: "+8.2%",
                    icon: Clock3,
                    color: "text-[#38bdf8]",
                    detail: "vs. last week",
                  },
                  {
                    label: "ACTIVITIES",
                    value: String(allWorkouts.length),
                    unit: "sessions",
                    change: "+2",
                    icon: Activity,
                    color: "text-[#c084fc]",
                    detail: "synced with Firestore",
                  },
                  {
                    label: "PERSONAL RECORDS",
                    value: "3",
                    unit: "new PBs",
                    change: "Your best, yet",
                    icon: Trophy,
                    color: "text-[#e9c959]",
                    detail: "",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className={`${panel} px-4 py-4 sm:px-5 ${
                      stat.label === "ACTIVITIES" ||
                      stat.label === "PERSONAL RECORDS"
                        ? "hidden sm:block"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[8px] font-medium tracking-[0.09em] text-muted-foreground xl:text-[9px]">
                        {stat.label}
                      </span>
                      <stat.icon size={14} className={stat.color} />
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="font-display text-[29px] font-extrabold">
                        {stat.value}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {stat.unit}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[9px]">
                      <span
                        className={
                          stat.icon === Trophy
                            ? "text-[#e9c959]"
                            : "text-primary"
                        }
                      >
                        {stat.icon !== Trophy && (
                          <ArrowUpRight size={11} className="mr-0.5 inline" />
                        )}
                        {stat.change}
                      </span>
                      <span className="text-[#788291]">{stat.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className={`grid items-start gap-6 ${activitiesViewMode === 'simple' ? 'grid-cols-1' : 'xl:grid-cols-[minmax(0,1fr)_282px]'}`}>
                <section className="min-w-0">
                  <div className="relative mb-7 hidden overflow-hidden rounded-2xl border border-[#fc4c02]/20 bg-[#101319] sm:block">
                    <div className="absolute inset-y-0 right-0 w-[55%] opacity-70 sm:w-[48%]">
                      <RouteArt
                        workout={allWorkouts[0] || workouts[0]}
                        big
                        className="h-full w-full scale-125"
                      />
                    </div>
                    <div className="relative z-10 p-6 sm:p-7">
                      <div className="mb-4 flex items-center gap-2 text-[8px] font-semibold uppercase tracking-[0.15em] text-[#ff9667]">
                        <span className="h-1 w-1 rounded-full bg-[#fc4c02]" />
                        Latest authentic activity{" "}
                        <span className="ml-2 text-[#788291]">
                          {(allWorkouts[0] || workouts[0]).date}
                        </span>
                      </div>
                      <h2 className="max-w-[190px] font-display text-[20px] font-bold leading-[1.35] sm:max-w-[280px] sm:text-[24px] text-white">
                        {(allWorkouts[0] || workouts[0]).title}
                      </h2>
                      <div className="mt-3 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <MapPin size={11} />
                        {(allWorkouts[0] || workouts[0]).location}
                      </div>
                      <div className="mt-5 flex gap-6">
                        <div>
                          <div className="font-display text-xl font-bold">
                            {(allWorkouts[0] || workouts[0]).distance}{" "}
                            <span className="text-[10px] font-normal text-muted-foreground">
                              km
                            </span>
                          </div>
                          <div className="mt-1 text-[8px] uppercase tracking-wider text-muted-foreground">
                            Distance
                          </div>
                        </div>
                        <div>
                          <div className="font-display text-xl font-bold">
                            {(allWorkouts[0] || workouts[0]).pace}{" "}
                            <span className="text-[10px] font-normal text-muted-foreground">
                              /km
                            </span>
                          </div>
                          <div className="mt-1 text-[8px] uppercase tracking-wider text-muted-foreground">
                            Avg. pace
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelected(allWorkouts[0] || workouts[0])}
                        className="mt-6 flex items-center gap-2 text-[10px] font-semibold text-[#ff9667]"
                      >
                        Explore activity <ArrowRight size={13} />
                      </button>
                    </div>
                    <div className="absolute bottom-6 right-5 hidden items-center gap-1.5 rounded-full border border-[#e9c959]/25 bg-[#201c12]/90 px-2.5 py-1.5 text-[8px] font-semibold text-[#e9c959] sm:flex">
                      <Trophy size={10} />
                      NEW PB · FASTEST 1K
                    </div>
                  </div>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <h2 className="font-display text-[16px] font-bold">
                        Your activity collection
                      </h2>
                      <span className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">
                        {String(allWorkouts.length).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="flex rounded-lg border border-border bg-card p-1">
                      <button
                        aria-label="Grid view"
                        aria-pressed={!list}
                        onClick={() => setList(false)}
                        className={`rounded p-1.5 ${
                          !list
                            ? "bg-white/8 text-primary"
                            : "text-muted-foreground"
                        }`}
                      >
                        <Grid2X2 size={13} />
                      </button>
                      <button
                        aria-label="List view"
                        aria-pressed={list}
                        onClick={() => setList(true)}
                        className={`rounded p-1.5 ${
                          list
                            ? "bg-white/8 text-primary"
                            : "text-muted-foreground"
                        }`}
                      >
                        <List size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="scrollbar-none mb-5 flex gap-2 overflow-x-auto pb-1">
                    {sports.map((sport) => (
                      <button
                        key={sport}
                        onClick={() => setFilter(sport)}
                        aria-pressed={filter === sport}
                        className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-[9px] font-medium transition ${
                          filter === sport
                            ? "border-primary/40 bg-primary/8 text-primary"
                            : "border-border text-muted-foreground hover:border-white/20 hover:text-white"
                        }`}
                      >
                        {sport !== "All activities" && (
                          <SportIcon sport={sport} size={12} />
                        )}
                        {sport}
                      </button>
                    ))}
                  </div>
                  <div
                    className={
                      list
                        ? "flex flex-col gap-3"
                        : "grid grid-cols-2 gap-3 sm:gap-4 min-[1350px]:grid-cols-3"
                    }
                  >
                    {allWorkouts
                      .filter(
                        (workout) =>
                          filter === "All activities" ||
                          workout.sport === filter,
                      )
                      .map((workout) => (
                        <button
                          key={workout.id}
                          onClick={() => setSelected(workout)}
                          className={`group overflow-hidden rounded-xl border border-border bg-[#0e131b] text-left transition hover:-translate-y-0.5 hover:border-white/20 ${
                            list ? "flex items-center gap-4 pr-4" : ""
                          }`}
                        >
                          <div
                            className={
                              list ? "relative h-24 w-28 shrink-0" : "relative"
                            }
                          >
                            <div
                              className={`flex items-center justify-between gap-1 ${
                                list ? "hidden" : "px-3.5 pt-3.5"
                              }`}
                            >
                              <div className="flex items-center gap-1.5 text-[8px] font-medium text-muted-foreground">
                                <SportIcon sport={workout.sport} size={11} />
                                <span>{workout.sport.toUpperCase()}</span>
                              </div>
                              <span className="font-mono text-[7px] text-[#7b8595]">
                                {workout.date.split(",")[0]}
                              </span>
                            </div>
                            <RouteArt
                              workout={workout}
                              className={
                                list
                                  ? "h-full w-full"
                                  : "h-[145px] w-full transition-transform duration-500 group-hover:scale-105 sm:h-[155px]"
                              }
                            />
                            {workout.record && !list && (
                              <span
                                className={`absolute bottom-2 left-3 flex items-center gap-1 rounded border px-1.5 py-1 text-[6px] font-semibold tracking-wide ${
                                  workout.id === 3
                                    ? "border-[#38bdf8]/20 bg-[#38bdf8]/5 text-[#7dd3fc]"
                                    : workout.id === 6
                                      ? "border-rose-400/20 bg-rose-400/5 text-rose-300"
                                      : "border-[#e9c959]/20 bg-[#e9c959]/5 text-[#e9c959]"
                                }`}
                              >
                                <Trophy size={8} />
                                {workout.record}
                              </span>
                            )}
                          </div>
                          <div
                            className={
                              list
                                ? "min-w-0 flex-1 py-3"
                                : "border-t border-border px-3.5 pb-3.5 pt-3"
                            }
                          >
                            <h3 className="truncate text-[10px] font-semibold sm:text-[11px]">
                              {workout.title}
                            </h3>
                            <div
                              className={`mt-3 grid grid-cols-3 ${
                                list ? "max-w-md" : ""
                              }`}
                            >
                              <Metric
                                value={workout.distance}
                                unit={
                                  workout.sport === "Calisthenics"
                                    ? "reps"
                                    : "km"
                                }
                              />
                              <Metric value={workout.time} unit="time" />
                              <Metric
                                value={workout.pace}
                                unit={
                                  workout.sport === "Running"
                                    ? "/km"
                                    : workout.sport === "Calisthenics"
                                      ? "avg bpm"
                                      : "km/h"
                                }
                              />
                            </div>
                            <div className="mt-2.5 flex items-center gap-1.5 pt-2 border-t border-white/5">
                              <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-[8px] font-bold text-primary">
                                🗺️ Map
                              </span>
                              <span className="inline-flex items-center gap-1 rounded bg-white/10 px-1.5 py-0.5 text-[8px] font-bold text-zinc-300">
                                📥 Poster
                              </span>
                              <span className="inline-flex items-center gap-1 rounded bg-[#fc4c02]/15 px-1.5 py-0.5 text-[8px] font-bold text-[#ff8952]">
                                🎬 Video
                              </span>
                            </div>
                          </div>
                          {list && (
                            <ArrowUpRight
                              size={15}
                              className="text-muted-foreground"
                            />
                          )}
                        </button>
                      ))}
                  </div>
                  <div className="mt-6 flex items-center justify-center gap-2 text-[9px] text-[#687282]">
                    <span className="h-px w-8 bg-border" />
                    Every line tells your story.
                    <span className="h-px w-8 bg-border" />
                  </div>
                </section>
                {activitiesViewMode === 'pro' && (
                <aside className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
                  <div className={`${panel} p-5`}>
                    <div className="flex items-center justify-between">
                      <h2 className="text-[12px] font-semibold">
                        Match readiness
                      </h2>
                      <span className="flex items-center gap-1 text-[8px] font-medium text-primary">
                        <span className="h-1 w-1 rounded-full bg-primary" />
                        LIVE
                      </span>
                    </div>
                    <div className="mb-1 mt-3">
                      <Readiness />
                    </div>
                    <p className="mb-5 text-center text-[10px] text-muted-foreground">
                      Recovered. Recharged. Ready to go.
                    </p>
                    <div className="space-y-3 border-t border-border pt-4">
                      {[
                        ["Muscle recovery", "94%", "w-[94%]"],
                        ["Aerobic fuel", "88%", "w-[88%]"],
                        ["HRV balance", "Optimal", "w-[82%]"],
                      ].map(([name, value, width]) => (
                        <div key={name}>
                          <div className="mb-2 flex justify-between text-[9px]">
                            <span className="text-muted-foreground">
                              {name}
                            </span>
                            <span className="font-mono text-[8px] text-[#d9e6b6]">
                              {value}
                            </span>
                          </div>
                          <div className="h-[3px] rounded-full bg-white/5">
                            <div
                              className={`h-full rounded-full bg-primary/70 ${width}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => navigate("/football")}
                      className="mt-5 flex w-full items-center justify-between rounded-lg border border-border px-3 py-2.5 text-[9px] font-medium text-[#cad1da] hover:border-primary/30"
                    >
                      Open football cockpit <ArrowRight size={12} />
                    </button>
                  </div>
                  <div className={`${panel} p-5`}>
                    <div className="flex items-center justify-between">
                      <h2 className="text-[12px] font-semibold">
                        Weekly momentum
                      </h2>
                      <select
                        aria-label="Chart period"
                        value={period}
                        onChange={(event) => setPeriod(event.target.value)}
                        className="max-w-22 bg-transparent text-[8px] text-muted-foreground"
                      >
                        <option className="bg-card">This week</option>
                        <option className="bg-card">Last week</option>
                      </select>
                    </div>
                    <div className="mt-4 flex items-baseline gap-1.5">
                      <span className="font-display text-2xl font-bold">
                        {period === "This week" ? "64.8" : "57.7"}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        km
                      </span>
                      <span className="ml-auto text-[8px] text-primary">
                        {period === "This week" ? "↗ 12.4%" : "↗ 6.8%"}
                      </span>
                    </div>
                    <WeeklyChart period={period} />
                    <div className="mt-5 flex justify-between border-t border-border pt-3 text-[9px]">
                      <span className="text-muted-foreground">
                        Weekly goal{" "}
                        <span className="text-white">{weeklyGoal} km</span>
                      </span>
                      <span className="text-primary">
                        {Math.round(
                          ((period === "This week" ? 64.8 : 57.7) /
                            weeklyGoal) *
                            100,
                        )}
                        %
                      </span>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-[#c084fc]/15 bg-linear-to-br from-[#c084fc]/7 to-card p-5">
                    <div className="mb-3 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-wider text-[#c084fc]">
                      <ShieldCheck size={13} />
                      The inner game
                    </div>
                    <p className="font-display text-sm font-medium leading-relaxed">
                      “You don’t rise to the occasion.
                      <br />
                      You fall to your training.”
                    </p>
                    <div className="mt-3 text-[8px] text-muted-foreground">
                      SHOW UP. DO THE WORK. REPEAT.
                    </div>
                    <button
                      onClick={() => navigate("/discipline")}
                      className="mt-5 flex items-center gap-2 text-[9px] font-medium text-[#c084fc]"
                    >
                      Your daily discipline <ArrowRight size={12} />
                    </button>
                  </div>
                </aside>
                )}
              </div>
            </>
          ) : (
            <Performance open={() => setSelected(workouts[3])} />
          )}
          </Suspense>

          <footer className="mt-10 flex items-center justify-between border-t border-border pt-5 text-[8px] text-[#667180]">
            <span>KUCHH BHII · INTENTION OVER EVERYTHING.</span>
            <span className="flex items-center gap-1.5">
              Made for the long game <span className="text-primary">↗</span>
            </span>
          </footer>
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION - 5 PILLARS INCLUDING AI */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between border-t border-white/10 bg-[#0b0e14]/95 px-2 pt-1.5 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] backdrop-blur-xl lg:hidden">
        {/* 1. Today */}
        <NavLink
          to="/playbook"
          className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-1 text-[9px] font-medium transition-all ${
            page === "/" || page === "/playbook"
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-white"
          }`}
        >
          <Compass size={19} strokeWidth={page === "/" || page === "/playbook" ? 2.5 : 1.7} />
          <span>Today</span>
        </NavLink>

        {/* 2. Train */}
        <NavLink
          to="/activities"
          className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-1 text-[9px] font-medium transition-all ${
            page === "/activities" || page === "/football" || page === "/armor" || page === "/maps" || page === "/studio" || page === "/workout"
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-white"
          }`}
        >
          <Zap size={19} strokeWidth={page === "/activities" || page === "/football" || page === "/armor" || page === "/maps" || page === "/studio" || page === "/workout" ? 2.5 : 1.7} />
          <span>Train</span>
        </NavLink>

        {/* ⚡ CENTER 3. GEMINI AI COACH TRIGGER */}
        <div className="flex items-center justify-center px-1">
          <button
            type="button"
            onClick={() => setShowGeminiHarness(true)}
            className="-mt-4 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr from-[#FC5200] to-[#CCFF00] text-black shadow-lg shadow-[#CCFF00]/25 hover:scale-105 active:scale-95 transition-all border-2 border-[#0b0e14] cursor-pointer shrink-0"
            title="Open Gemini AI Coach & Harness"
            aria-label="Open Gemini AI Coach"
          >
            <Sparkles size={18} strokeWidth={2.5} fill="currentColor" className="text-black" />
          </button>
        </div>

        {/* 4. Progress */}
        <NavLink
          to="/fithub"
          className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-1 text-[9px] font-medium transition-all ${
            page === "/fithub" || page === "/community" || page === "/portfolio"
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-white"
          }`}
        >
          <Heart size={19} strokeWidth={page === "/fithub" || page === "/community" || page === "/portfolio" ? 2.5 : 1.7} />
          <span>Progress</span>
        </NavLink>

        {/* 5. Vault */}
        <NavLink
          to="/discipline"
          className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-1 text-[9px] font-medium transition-all ${
            page === "/discipline" || page === "/routine" || page === "/nutrition" || page === "/vedas" || page === "/cycle" || page === "/period" || page === "/settings"
              ? "text-[#c084fc] font-bold"
              : "text-muted-foreground hover:text-white"
          }`}
        >
          <ShieldCheck size={19} strokeWidth={page === "/discipline" || page === "/routine" || page === "/nutrition" || page === "/vedas" || page === "/cycle" || page === "/period" || page === "/settings" ? 2.5 : 1.7} />
          <span>Vault</span>
        </NavLink>
      </nav>

      {/* ACTIVITY DETAIL & WORLD-CLASS EXPORT MODAL */}
      {selected && (() => {
        const routePoints = getRoutePointsForWorkout(selected);
        const athleteName = currentProfile === "women" ? "Shreya Dixit" : "Sughosh Dixit";

        return (
          <Modal title="Activity deep-dive" close={() => setSelected(null)}>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5 font-medium">
                <SportIcon sport={selected.sport} />
                <span>{selected.sport}</span>
              </div>
              <span className="font-mono text-[11px]">{selected.date}</span>
            </div>

            <h2 className="mt-3 font-display text-2xl font-black text-white">
              {selected.title}
            </h2>

            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin size={13} className="text-[#fc4c02]" />
              <span>{selected.location}</span>
            </div>

            {/* Quick Metrics Bar */}
            <div className="my-4 grid grid-cols-3 rounded-2xl border border-white/10 bg-[#121824] p-3 text-center shadow-lg">
              <Metric
                value={selected.distance}
                unit={selected.sport === "Calisthenics" ? "reps" : "km"}
              />
              <Metric value={selected.time} unit="moving time" />
              <Metric
                value={selected.pace}
                unit={selected.sport === "Running" ? "pace /km" : selected.sport === "Calisthenics" ? "avg bpm" : "km/h"}
              />
            </div>

            {/* Map Preview vs Route Art Toggle Bar */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-1 p-0.5 rounded-xl border border-white/10 bg-white/5">
                <button
                  type="button"
                  onClick={() => setActivityPreviewMode('map')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activityPreviewMode === 'map'
                      ? 'bg-[#fc4c02] text-white shadow-md font-black'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  🗺️ Live Map Preview
                </button>
                <button
                  type="button"
                  onClick={() => setActivityPreviewMode('art')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activityPreviewMode === 'art'
                      ? 'bg-primary text-black shadow-md font-black'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  ⚡ Route Art
                </button>
              </div>

              <span className="text-[10px] font-mono font-semibold text-zinc-400">
                {routePoints.length} GPS Points
              </span>
            </div>

            {/* Visualizer Frame */}
            {activityPreviewMode === 'map' ? (
              <ActivityMapPreview
                workout={selected}
                routePoints={routePoints}
                height="240px"
                className="mb-4"
              />
            ) : (
              <div className="mb-4 rounded-2xl border border-white/10 bg-background overflow-hidden p-2">
                <RouteArt
                  workout={selected}
                  className="w-full h-[200px]"
                />
              </div>
            )}

            {/* DOWNLOAD POSTER & VIDEO BUTTONS */}
            <div className="grid grid-cols-2 gap-2.5 mb-3">
              <button
                type="button"
                disabled={exportingPoster}
                onClick={async () => {
                  try {
                    setExportingPoster(true);
                    setToast("Rendering 4K athletic poster...");
                    const res = await ActivityExportService.downloadPoster(selected, routePoints, athleteName);
                    setToast(res);
                  } catch (e: any) {
                    setToast("Poster export failed: " + (e?.message || e));
                  } finally {
                    setExportingPoster(false);
                  }
                }}
                className="flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 py-3 text-xs font-bold text-white transition cursor-pointer disabled:opacity-50"
              >
                <Download size={14} className="text-[#CCFF00]" />
                <span>{exportingPoster ? "Saving..." : "📥 Download Poster"}</span>
              </button>

              <button
                type="button"
                disabled={exportingVideo}
                onClick={async () => {
                  try {
                    setExportingVideo(true);
                    setToast("Generating 9:16 vertical trail video...");
                    const res = await ActivityExportService.downloadVideo(
                      selected,
                      routePoints,
                      athleteName,
                      (pct) => setVideoExportProgress(pct)
                    );
                    setToast(res);
                  } catch (e: any) {
                    setToast("Video export failed: " + (e?.message || e));
                  } finally {
                    setExportingVideo(false);
                    setVideoExportProgress(0);
                  }
                }}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#FC5200] hover:bg-[#e04800] py-3 text-xs font-bold text-white shadow-lg shadow-[#FC5200]/25 transition cursor-pointer disabled:opacity-50"
              >
                <Video size={14} />
                <span>{exportingVideo ? `Rendering (${videoExportProgress}%)...` : "🎬 Download Video"}</span>
              </button>
            </div>

            {/* ROUTE INTELLIGENCE & TRAIL VIDEO FULL LAUNCH */}
            <button
              type="button"
              onClick={() => {
                const distKm = parseFloat(selected.distance) || 5.0;
                const result = RouteIntelligenceFirestoreService.normalizeFromHistoricalGpsLog({
                  id: `act_${selected.id}`,
                  title: selected.title,
                  activityType: selected.sport === "Running" ? "run" : selected.sport === "Cycling" ? "cycle" : "walk",
                  date: selected.date,
                  startTime: Date.now() - 3600000,
                  endTime: Date.now(),
                  durationSeconds: 1800,
                  distanceKm: distKm,
                  avgSpeedKmh: 12.5,
                  topSpeedKmh: 18.2,
                  avgPaceMinKm: selected.pace,
                  elevationGainMeters: 85,
                  caloriesBurned: 450,
                  heartPointsEarned: 35,
                  stepsCount: 5400,
                  splits: [],
                  routePoints: routePoints,
                  milestonesReached: [],
                  userId: currentProfile === "women" ? "women" : "men"
                });

                setSelected(null);
                setRouteDetailData({
                  activity: result.activity,
                  geometries: result.geometries
                });
              }}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl border border-[#FC5200]/40 bg-[#FC5200]/10 py-3 text-xs font-bold text-[#FC5200] hover:bg-[#FC5200]/20 transition cursor-pointer"
            >
              <Compass size={15} />
              <span>Route Intelligence &amp; Trail Video</span>
            </button>

            {/* OPEN FULL 4K SHARE STUDIO */}
            <button
              type="button"
              onClick={() => {
                const cardData: SocialShareCardData = {
                  title: selected.title,
                  workoutType: selected.sport,
                  stats: [
                    { label: "Distance", value: selected.distance, unit: selected.sport === "Calisthenics" ? "reps" : "km" },
                    { label: "Pace / Speed", value: selected.pace },
                    { label: "Moving Time", value: selected.time },
                    { label: "Location", value: selected.location }
                  ],
                  motivationalQuote: "Discipline equals freedom! - Jocko Willink",
                  quoteAuthor: "Commander Iron",
                  streakDays: 14,
                  date: selected.date,
                  persona: currentProfile,
                  routePoints: routePoints,
                  showRouteOverlay: routePoints.length > 1,
                  templateStyle: "strava_classic"
                };
                setSelected(null);
                setActiveShareCardData(cardData);
              }}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-xs font-black text-primary-foreground hover:bg-[#dcff4d] transition shadow-md shadow-primary/20 cursor-pointer"
            >
              <Sparkles size={15} />
              <span>Customize in 4K Share Studio</span>
            </button>
          </Modal>
        );
      })()}

      {/* QUICK ACTIVITY LAUNCHER MODAL */}
      {activityLauncherOpen && (
        <Modal title="Log an Athletic Session" close={() => setActivityLauncherOpen(false)}>
          <p className="text-xs text-muted-foreground mb-4">
            Select a manual sport match, quick reps entry, live GPS tracking, or daily recap:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            {/* 0. Gemini AI Coach */}
            <button
              onClick={() => {
                setActivityLauncherOpen(false)
                setShowGeminiHarness(true)
              }}
              className="flex flex-col items-center text-center p-4 rounded-2xl border border-[#CCFF00]/40 bg-[#CCFF00]/10 hover:bg-[#CCFF00]/15 transition group cursor-pointer"
            >
              <div className="p-3 rounded-full bg-[#CCFF00]/20 text-[#CCFF00] mb-2 group-hover:scale-110 transition">
                <Sparkles size={22} />
              </div>
              <div className="text-xs font-extrabold text-[#CCFF00] mb-0.5">✨ Ask Gemini AI</div>
              <div className="text-[10px] text-muted-foreground leading-snug">
                Pre-run directives, excuse buster, tactical advice &amp; fuel diagnostics
              </div>
            </button>

            {/* 1. Quick Push-ups / Calisthenics */}
            <button
              onClick={() => {
                setActivityLauncherOpen(false)
                setManualLogCategory("calisthenics")
                setManualLogOpen(true)
              }}
              className="flex flex-col items-center text-center p-4 rounded-2xl border border-primary/40 bg-primary/5 hover:bg-primary/10 transition group cursor-pointer"
            >
              <div className="p-3 rounded-full bg-primary/20 text-primary mb-2 group-hover:scale-110 transition">
                <Dumbbell size={22} />
              </div>
              <div className="text-xs font-bold text-white mb-0.5">💪 Quick Push-ups / Reps</div>
              <div className="text-[10px] text-muted-foreground leading-snug">
                Log 15 push-ups, pull-ups, squats, or multi-set ladders in 5 seconds
              </div>
            </button>

            {/* 2. Badminton Match */}
            <button
              onClick={() => {
                setActivityLauncherOpen(false)
                setManualLogCategory("badminton")
                setManualLogOpen(true)
              }}
              className="flex flex-col items-center text-center p-4 rounded-2xl border border-[#CCFF00]/40 bg-[#CCFF00]/5 hover:bg-[#CCFF00]/10 transition group cursor-pointer"
            >
              <div className="p-3 rounded-full bg-[#CCFF00]/20 text-[#CCFF00] mb-2 group-hover:scale-110 transition">
                <Trophy size={22} />
              </div>
              <div className="text-xs font-bold text-white mb-0.5">🏸 Badminton Match</div>
              <div className="text-[10px] text-muted-foreground leading-snug">
                Singles / doubles scores, smash drills, minutes, and caloric burn
              </div>
            </button>

            {/* 3. Football Match */}
            <button
              onClick={() => {
                setActivityLauncherOpen(false)
                setManualLogCategory("football")
                setManualLogOpen(true)
              }}
              className="flex flex-col items-center text-center p-4 rounded-2xl border border-[#FC5200]/40 bg-[#FC5200]/5 hover:bg-[#FC5200]/10 transition group cursor-pointer"
            >
              <div className="p-3 rounded-full bg-[#FC5200]/20 text-[#FC5200] mb-2 group-hover:scale-110 transition">
                <Flame size={22} />
              </div>
              <div className="text-xs font-bold text-white mb-0.5">⚽ Football Match</div>
              <div className="text-[10px] text-muted-foreground leading-snug">
                Turf 5v5/7v7, winger minutes, goals scored, and pitch intensity
              </div>
            </button>

            {/* 4. Live GPS Run / Cycle */}
            <button
              onClick={() => {
                setActivityLauncherOpen(false)
                setGpsModalActivityType("run")
              }}
              className="flex flex-col items-center text-center p-4 rounded-2xl border border-sky-400/40 bg-sky-400/5 hover:bg-sky-400/10 transition group cursor-pointer"
            >
              <div className="p-3 rounded-full bg-sky-400/20 text-sky-400 mb-2 group-hover:scale-110 transition">
                <Footprints size={22} />
              </div>
              <div className="text-xs font-bold text-white mb-0.5">🏃 Live GPS Run / Ride</div>
              <div className="text-[10px] text-muted-foreground leading-snug">
                Satellite pacing, auto-splits, elevation gain, and 3D flyby
              </div>
            </button>

            {/* 5. Consolidate Daily Recap Post */}
            <button
              onClick={() => {
                setActivityLauncherOpen(false)
                setIsDailyRecapMode(true)
                setEditingPost(null)
              }}
              className="flex flex-col items-center text-center p-4 rounded-2xl border border-amber-400/40 bg-amber-400/5 hover:bg-amber-400/10 transition group cursor-pointer"
            >
              <div className="p-3 rounded-full bg-amber-400/20 text-amber-400 mb-2 group-hover:scale-110 transition">
                <Share2 size={22} />
              </div>
              <div className="text-xs font-bold text-white mb-0.5">🔥 Daily Recap Social Card</div>
              <div className="text-[10px] text-muted-foreground leading-snug">
                Consolidate today's matches, push-ups and runs into a 4K shareable card
              </div>
            </button>

            {/* 6. Guided Combos */}
            <button
              onClick={() => {
                setActivityLauncherOpen(false)
                navigate("/workout")
              }}
              className="flex flex-col items-center text-center p-4 rounded-2xl border border-white/20 bg-white/5 hover:bg-white/10 transition group cursor-pointer"
            >
              <div className="p-3 rounded-full bg-white/10 text-zinc-300 mb-2 group-hover:scale-110 transition">
                <Play size={22} />
              </div>
              <div className="text-xs font-bold text-white mb-0.5">⚡ Guided Combos</div>
              <div className="text-[10px] text-muted-foreground leading-snug">
                Yellow Dude playbook player with audio voice coaching and rest timers
              </div>
            </button>
          </div>

          <div className="flex justify-end pt-3 border-t border-border">
            <button
              onClick={() => {
                setActivityLauncherOpen(false)
                setSession(true)
              }}
              className="text-xs text-muted-foreground hover:text-white flex items-center gap-1.5"
            >
              <Clock3 size={13} /> Or use quick stopwatch timer
            </button>
          </div>
        </Modal>
      )}

      {/* QUICK TIMED SESSION MODAL */}
      {session && (
        <Modal
          title={
            activeSession
              ? "Session in progress"
              : "A little better, every day."
          }
          close={() => setSession(false)}
        >
          <p className="text-xs leading-5 text-muted-foreground">
            {activeSession
              ? "Your session timer is running. Close this window to keep it going."
              : "Choose your discipline and start a timed session."}
          </p>
          <div className="my-6 grid grid-cols-2 gap-3">
            {sports.slice(1).map((sport) => (
              <button
                disabled={activeSession}
                onClick={() => setSessionSport(sport)}
                key={sport}
                className={`flex items-center gap-2 rounded-xl border p-4 text-xs ${
                  sessionSport === sport
                    ? "border-primary/50 bg-primary/5 text-primary"
                    : "border-border text-muted-foreground"
                }`}
              >
                <SportIcon sport={sport} />
                {sport}
              </button>
            ))}
          </div>
          {activeSession && (
            <div className="mb-6 text-center font-mono text-5xl text-primary">
              {formattedTime}
            </div>
          )}
          <button
            onClick={() => {
              if (activeSession) {
                setActiveSession(false)
                setSession(false)
                setToast(
                  `${sessionSport} session complete — ${formattedTime}. Nice work.`,
                )
              } else {
                setElapsed(0)
                setActiveSession(true)
              }
            }}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-xs font-bold text-primary-foreground"
          >
            {activeSession ? <Check size={15} /> : <Play size={15} />}
            {activeSession ? "Finish session" : "Start session"}
          </button>
        </Modal>
      )}

      {/* ATHLETE PREFERENCES MODAL */}
      {settings && (
        <Modal title="Your athlete profile" close={() => setSettings(false)}>
          <div className="flex items-center gap-4">
            <Avatar profile={currentProfile} />
            <div>
              <h3 className="font-display text-lg font-semibold">
                {currentProfile === "women" ? "Shreya Dixit" : "Sughosh Dixit"}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Bengaluru, India · Everything Pro
              </p>
            </div>
          </div>
          <div className="my-6 rounded-xl border border-border p-4">
            <h4 className="text-xs font-semibold">Training preferences</h4>
            <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
              <span>Distance units</span>
              <span>Kilometers</span>
            </div>
            <label className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              Weekly goal
              <input
                type="number"
                min="1"
                max="500"
                value={goalDraft}
                onChange={(event) => setGoalDraft(event.target.value)}
                aria-label="Weekly distance goal in kilometers"
                className="w-20 rounded-lg border border-border bg-background p-2 text-white"
              />
            </label>
          </div>
          <button
            onClick={() => {
              const goal = Number(goalDraft)
              if (!Number.isFinite(goal) || goal < 1 || goal > 500) {
                setToast("Choose a weekly goal between 1 and 500 km.")
                return
              }
              setWeeklyGoal(goal)
              localStorage.setItem("everything-weekly-goal", String(goal))
              setSettings(false)
              setToast("Your weekly training goal is saved.")
            }}
            className="w-full rounded-lg bg-primary py-3 text-xs font-bold text-primary-foreground"
          >
            Save preferences
          </button>
        </Modal>
      )}

      {/* REAL CORE MODALS */}
      <Suspense fallback={null}>
      {selectedStravaActivityDetail && (
        <StravaActivityDetailModal
          activity={selectedStravaActivityDetail}
          currentProfile={currentProfile}
          onClose={() => setSelectedStravaActivityDetail(null)}
          onKudos={handleLikePost}
          onAddComment={handleAddComment}
          onOpenSocialShare={(act) => openShareFromPost(act)}
          onOpenFlyby={(act) => {
            if (act.gpsActivity) {
              setSelectedStravaActivityDetail(null)
              setFlybyActivity(act.gpsActivity)
            }
          }}
        />
      )}

      {/* ROUTE INTELLIGENCE MODAL */}
      {routeDetailData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 animate-fade-in">
          <div className="w-full max-w-2xl h-[92vh] bg-[#0E131B] border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-scale-up">
            <ActivityRouteDetailView
              activity={routeDetailData.activity}
              geometries={routeDetailData.geometries}
              onClose={() => setRouteDetailData(null)}
              onOpenSocialShare={(actDoc) => {
                const routePoints = getRoutePointsForWorkout({
                  id: 999,
                  title: actDoc.title,
                  sport: actDoc.sportType === 'RIDE' ? 'Cycling' : actDoc.sportType === 'WALK' ? 'Running' : actDoc.sportType === 'FOOTBALL' ? 'Football' : 'Running',
                  date: new Date(actDoc.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                  distance: `${(actDoc.distanceMeters / 1000).toFixed(2)}`,
                  time: `${Math.floor(actDoc.movingTimeSeconds / 60)}m ${actDoc.movingTimeSeconds % 60}s`,
                  pace: actDoc.averagePaceString,
                  color: '#fc4c02',
                  route: '',
                  location: 'Bengaluru'
                });

                const cardData: SocialShareCardData = {
                  title: actDoc.title,
                  workoutType: actDoc.sportType === 'RIDE' ? 'Cycling' : actDoc.sportType === 'WALK' ? 'Walking' : actDoc.sportType === 'FOOTBALL' ? 'Football Match' : actDoc.sportType === 'CALISTHENICS' ? 'Calisthenics' : 'Running',
                  stats: [
                    { label: 'Distance', value: `${(actDoc.distanceMeters / 1000).toFixed(2)}`, unit: 'km' },
                    { label: 'Avg Pace', value: actDoc.averagePaceString },
                    { label: 'Moving Time', value: `${Math.floor(actDoc.movingTimeSeconds / 60)}m ${actDoc.movingTimeSeconds % 60}s` },
                    { label: 'Ascent', value: `+${actDoc.elevationGainMeters || 0}`, unit: 'm' }
                  ],
                  motivationalQuote: 'Discipline equals freedom! - Jocko Willink',
                  quoteAuthor: 'Commander Iron',
                  streakDays: 14,
                  date: new Date(actDoc.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                  persona: currentProfile,
                  routePoints: routePoints,
                  showRouteOverlay: routePoints.length > 1,
                  templateStyle: 'strava_classic'
                };
                setRouteDetailData(null);
                setActiveShareCardData(cardData);
              }}
            />
          </div>
        </div>
      )}

      {showAthleteProfileModal && (
        <StravaAthleteProfileModal
          currentProfile={currentProfile}
          milestones={milestones}
          onClose={() => setShowAthleteProfileModal(false)}
        />
      )}

      {gpsModalActivityType && (
        <GpsActivityTrackerModal
          initialActivityType={gpsModalActivityType}
          currentProfile={currentProfile}
          currentMilestones={milestones}
          onSaveActivity={handleSaveGpsActivity}
          onOpenFlyby={(log) => {
            setGpsModalActivityType(null)
            setFlybyActivity(log)
          }}
          onOpenSocialShare={(log) => {
            setGpsModalActivityType(null)
            openShareFromGps(log)
          }}
          onClose={() => setGpsModalActivityType(null)}
        />
      )}

      {flybyActivity && (
        <StravaRouteFlybyPlayer
          activity={flybyActivity}
          onOpenSocialShare={(act) => {
            openShareFromGps(act)
          }}
          onCreatePostFromActivity={() => {
            setFlybyActivity(null)
            setEditingPost(null)
          }}
          onClose={() => setFlybyActivity(null)}
        />
      )}

      {editingPost !== undefined && (
        <CreateActivityPostModal
          initialPost={editingPost}
          todayGpsActivities={gpsActivities}
          todayWorkoutLogs={workoutLogs}
          todayFootballDrills={footballDrills}
          currentProfile={currentProfile}
          quotesList={quotes}
          isDailyRecapMode={isDailyRecapMode}
          onSavePost={handleSaveStravaPost}
          onOpenShareStudio={(cardData) => {
            setEditingPost(undefined)
            setIsDailyRecapMode(false)
            setActiveShareCardData(cardData)
          }}
          onClose={() => {
            setEditingPost(undefined)
            setIsDailyRecapMode(false)
          }}
        />
      )}

      {manualLogOpen && (
        <ManualActivityLogModal
          initialCategory={manualLogCategory}
          currentProfile={currentProfile}
          onSaveWorkoutLog={handleLogWorkout}
          onSaveActivityLog={(act) => handleSaveGpsActivity(act, milestones)}
          onOpenShareCard={(cardData) => {
            setManualLogOpen(false)
            setActiveShareCardData(cardData)
          }}
          onClose={() => setManualLogOpen(false)}
        />
      )}

      {activeShareCardData && (
        <SocialWorkoutShareModal
          initialData={activeShareCardData}
          quotesList={quotes}
          onClose={() => setActiveShareCardData(null)}
        />
      )}

      {notification && (
        <NotificationCenterDrawer
          isOpen={notification}
          onClose={() => setNotification(false)}
          onNavigateTab={(tab) => {
            if (tab === "discipline") navigate("/discipline")
            else if (tab === "activities") navigate("/activities")
            else navigate(`/${tab}`)
          }}
          onExecuteAction={handleExecuteNotificationAction}
        />
      )}

      {skillTreeOpen && (
        <AthleteSkillTreeModal
          isOpen={skillTreeOpen}
          onClose={() => setSkillTreeOpen(false)}
          streakCount={14}
          totalDistanceKm={milestones.longestRunKm || 142.8}
          athleteName={currentProfile === "women" ? "Shreya" : "Sughosh"}
        />
      )}

      {autoActivitiesModalOpen && (
        <AutoDetectedActivityModal
          initialActivities={pendingAutoActivities}
          userPersona={currentProfile === "women" ? "women" : "men"}
          onConfirmActivity={(log) => {
            handleSaveGpsActivity(log, milestones)
            setToast(`Workout Recovered: ${log.distanceKm} km logged to discipline streak!`)
          }}
          onClose={() => setAutoActivitiesModalOpen(false)}
        />
      )}

      {showGeminiHarness && (
        <GeminiAiHarnessModal onClose={() => setShowGeminiHarness(false)} />
      )}
      </Suspense>

      {activeSession && !session && (
        <button
          onClick={() => setSession(true)}
          className="fixed bottom-24 right-5 z-40 flex items-center gap-3 rounded-full border border-primary/30 bg-[#151e12] px-5 py-3 text-xs text-primary shadow-xl lg:bottom-6"
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          {sessionSport} · {formattedTime}
        </button>
      )}

      {toast && (
        <div
          role="status"
          className="fixed bottom-24 left-1/2 z-50 flex w-max max-w-[90vw] -translate-x-1/2 items-center gap-3 rounded-xl border border-primary/25 bg-[#18201b] px-5 py-4 text-xs shadow-2xl lg:bottom-7"
        >
          <Check size={16} className="shrink-0 text-primary" />
          {toast}
          <button onClick={() => setToast("")} aria-label="Dismiss message">
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
function WeeklyChart({ period }: { period: string }) {
  const values =
    period === "This week"
      ? [6.5, 10.4, 7.6, 14.4, 8.8, 12.0, 5.1]
      : [4.9, 7.4, 11.5, 6.7, 12.9, 9.9, 4.4]
  const data = values.map((distance, index) => ({
    day: ["M", "T", "W", "T", "F", "S", "S"][index],
    distance,
    index,
  }))
  return (
    <div
      className="mt-4 h-[110px] w-full"
      role="img"
      aria-label={`${period} training distances by day, in kilometers`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
          barSize={19}
        >
          <XAxis
            dataKey="day"
            axisLine={{ stroke: "#ffffff12" }}
            tickLine={false}
            tick={{
              fill: "#929ba9",
              fontSize: 8,
              fontFamily: "JetBrains Mono",
            }}
          />
          <Tooltip
            cursor={{ fill: "#ffffff04" }}
            content={({ active, payload }: any) =>
              active && payload?.length ? (
                <div className="rounded-lg border border-border bg-[#1a222d] p-2 font-mono text-[9px] text-primary">
                  {payload[0].value} km
                </div>
              ) : null
            }
          />
          <Bar
            dataKey="distance"
            radius={[3, 3, 0, 0]}
            isAnimationActive={false}
          >
            {data.map((entry) => (
              <Cell
                key={entry.index}
                fill={entry.index === 3 ? "#ccff00" : "#ccff0033"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
function BrandMark() {
  return (
    <svg width="24" height="27" viewBox="0 0 24 27" aria-hidden="true">
      <path
        d="M2 6 13 1 22 6 11 11ZM2 13 11 18 22 13M2 20 11 25 22 20"
        fill="none"
        stroke="#ccff00"
        strokeWidth="2.7"
        strokeLinejoin="round"
      />
    </svg>
  )
}
function Avatar({ small = false, profile = "men" }: { small?: boolean; profile?: UserProfile }) {
  const isWomen = profile === "women"
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-display font-bold transition shadow-md ${
        isWomen
          ? "border border-pink-400/40 bg-gradient-to-br from-purple-700 via-pink-600 to-rose-700 text-white"
          : "border border-[#d5b389]/40 bg-linear-to-br from-[#b89d78] via-[#60543c] to-[#242d26] text-[#f1e5d0]"
      } ${small ? "h-7 w-7 text-[9px]" : "h-9 w-9 text-[11px]"}`}
    >
      {isWomen ? "SH" : "SD"}
    </div>
  )
}
interface MetricProps {
  value: string
  unit: string
}
function Metric({ value, unit }: MetricProps) {
  return (
    <div>
      <div className="font-mono text-[11px] font-medium sm:text-[12px]">
        {value}
      </div>
      <div className="mt-1 text-[7px] text-muted-foreground sm:text-[8px]">
        {unit}
      </div>
    </div>
  )
}
function Modal({
  children,
  title,
  close,
}: {
  children: React.ReactNode
  title: string
  close: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const previous = document.activeElement as HTMLElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    ref.current?.focus()
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") close()
      if (event.key === "Tab") {
        const focusable = ref.current?.querySelectorAll<HTMLElement>(
          'button, input, select, a[href], [tabindex="0"]',
        )
        if (!focusable?.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (
          event.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === ref.current)
        ) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener("keydown", handler)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", handler)
      previous?.focus()
    }
  }, [])
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
      onClick={close}
    >
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
        className="scrollbar-none max-h-[90dvh] w-full max-w-[680px] overflow-y-auto rounded-2xl border border-white/10 bg-card p-6 shadow-2xl sm:p-8"
      >
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="font-display text-lg font-bold">{title}</h2>
          <button
            aria-label="Close dialog"
            onClick={close}
            className="rounded-full bg-white/5 p-2 text-muted-foreground hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
function Splits() {
  return (
    <div className="mt-5">
      <div className="mb-4 flex justify-between text-xs font-semibold">
        <h3>Every split tells a story</h3>
        <span className="text-[9px] text-muted-foreground">PACE / KM</span>
      </div>
      {["4:52", "4:41", "4:35", "3:52", "4:48"].map((pace, index) => (
        <div
          key={pace}
          className="grid grid-cols-[24px_1fr_48px_44px] items-center gap-3 border-t border-border py-2.5 text-[10px]"
        >
          <span className="font-mono text-muted-foreground">{index + 1}</span>
          <div
            className={`h-2 rounded-sm ${
              index === 0 || index === 4 ? "bg-[#eab308]/35" : "bg-primary/35"
            }`}
            style={{ width: `${[92, 83, 77, 58, 88][index]}%` }}
          />
          <span className={`font-mono ${index === 3 ? "text-primary" : ""}`}>
            {pace}
          </span>
          <span className="font-mono text-[8px] text-muted-foreground">
            {["+42m", "+28m", "+10m", "−12m", "+35m"][index]}
          </span>
        </div>
      ))}
      <div className="mt-6 flex items-center gap-2 text-xs font-semibold">
        <Heart size={14} className="text-rose-400" />
        Intensity zones
      </div>
      {[
        ["Zone 5 · Anaerobic", "18%", "bg-rose-500", "w-[18%]"],
        ["Zone 4 · Threshold", "46%", "bg-[#fc4c02]", "w-[46%]"],
        ["Zone 3 · Tempo", "36%", "bg-[#eab308]", "w-[36%]"],
      ].map(([name, percentage, color, width]) => (
        <div key={name} className="mt-3">
          <div className="mb-1.5 flex justify-between text-[9px] text-muted-foreground">
            <span>{name}</span>
            <span className="font-mono">{percentage}</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/5">
            <div className={`h-full rounded-full ${color} ${width}`} />
          </div>
        </div>
      ))}
    </div>
  )
}
function Football({
  completed,
  setCompleted,
}: {
  completed: number[]
  setCompleted: (value: number[]) => void
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <section className={`${panel} p-6 sm:p-8`}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">
            Your engine is ready.
          </h2>
          <span className="rounded-full bg-primary/10 px-2 py-1 text-[8px] text-primary">
            LIVE TELEMETRY
          </span>
        </div>
        <div className="my-7">
          <Readiness large />
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            ["94%", "Muscle recovery"],
            ["88%", "Aerobic fuel"],
            ["Optimal", "HRV balance"],
          ].map(([value, label]) => (
            <div
              key={label}
              className="rounded-lg border border-border bg-background py-4"
            >
              <div className="font-display text-lg font-bold text-primary">
                {value}
              </div>
              <div className="mt-2 text-[8px] text-muted-foreground">
                {label}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 flex items-center gap-2 text-xs font-semibold">
          <ShieldCheck size={15} className="text-primary" />
          Tomorrow · 18:00 · Match day
        </div>
        <p className="mt-3 text-xs leading-6 text-muted-foreground">
          Your recovery and training load are balanced. Keep today light,
          hydrate well, and aim for 8 hours of sleep.
        </p>
      </section>
      <div className="space-y-6">
        <section className={`${panel} p-6`}>
          <h2 className="font-display text-base font-bold">
            Own your position.
          </h2>
          <div className="mt-5 flex items-center gap-6">
            <svg
              viewBox="0 0 140 180"
              className="h-44 w-36 shrink-0"
              role="img"
              aria-label="Football pitch with left-wing position highlighted"
            >
              <rect
                x="8"
                y="5"
                width="124"
                height="170"
                rx="3"
                fill="#ccff0005"
                stroke="#ccff0035"
              />
              <path
                d="M8 90H132M41 5V33H99V5M41 175V147H99V175M56 5V17H84V5M56 175V163H84V175"
                fill="none"
                stroke="#ccff0035"
              />
              <circle cx="70" cy="90" r="19" fill="none" stroke="#ccff0035" />
              <circle cx="27" cy="52" r="19" fill="#ccff0015" />
              <circle cx="27" cy="52" r="6" fill="#ccff00" />
              <path d="M28 43L34 22" stroke="#ccff00" strokeDasharray="3 3" />
            </svg>
            <div>
              <div className="text-[9px] uppercase tracking-widest text-muted-foreground">
                Your position
              </div>
              <h3 className="mt-2 font-display text-xl font-bold">
                Left Winger
              </h3>
              <p className="mt-1 text-[10px] text-primary">
                Inverted forward · #11
              </p>
              <div className="mt-5 space-y-3">
                {[
                  ["Top sprint burst", "29.4 km/h"],
                  ["High-intensity distance", "2.1 km"],
                  ["Agility shuttle", "14.8 s"],
                ].map(([name, value]) => (
                  <div key={name}>
                    <div className="text-[8px] text-muted-foreground">
                      {name}
                    </div>
                    <div className="mt-1 font-mono text-xs">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        <section className={`${panel} p-6`}>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold">
              Daily performance protocol
            </h2>
            <span className="font-mono text-[10px] text-primary">
              {completed.length}/4
            </span>
          </div>
          <div className="mt-4 space-y-2">
            {[
              "Pre-session dynamic warmup",
              "Tactical footwork drills",
              "Match endurance intervals",
              "Post-session calisthenics",
            ].map((name, index) => (
              <button
                key={name}
                onClick={() =>
                  setCompleted(
                    completed.includes(index)
                      ? completed.filter((value) => value !== index)
                      : [...completed, index],
                  )
                }
                aria-pressed={completed.includes(index)}
                className={`flex w-full items-center gap-3 rounded-xl border p-3.5 text-left text-[11px] transition ${
                  completed.includes(index)
                    ? "border-primary/20 bg-primary/5"
                    : "border-border hover:border-white/20"
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                    completed.includes(index)
                      ? "border-primary bg-primary text-black"
                      : "border-white/20 text-muted-foreground"
                  }`}
                >
                  {completed.includes(index) ? <Check size={13} /> : index + 1}
                </span>
                <span
                  className={
                    completed.includes(index)
                      ? "text-muted-foreground line-through"
                      : ""
                  }
                >
                  {name}
                </span>
                <span className="ml-auto font-mono text-[8px] text-muted-foreground">
                  {["10", "20", "25", "15"][index]} MIN
                </span>
              </button>
            ))}
          </div>
          {completed.length === 4 && (
            <p className="mt-4 text-xs text-primary">
              Protocol complete. You’ve put in the work. ↗
            </p>
          )}
        </section>
      </div>
    </div>
  )
}
function Performance({ open }: { open: () => void }) {
  const [breathing, setBreathing] = useState(false)
  const [seconds, setSeconds] = useState(0)
  useEffect(() => {
    if (!breathing) return
    const timer = setInterval(() => setSeconds((value: number) => value + 1), 1000)
    return () => clearInterval(timer)
  }, [breathing])
  const cycle = seconds % 16
  const breath =
    cycle < 4
      ? "Breathe in"
      : cycle < 8
        ? "Hold"
        : cycle < 12
          ? "Breathe out"
          : "Hold"
  return (
    <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
      <div className={`${panel} p-6 sm:p-8`}>
        <div className="flex justify-between">
          <span className="text-[9px] uppercase tracking-widest text-[#ff9667]">
            Elevation deep-dive
          </span>
          <Mountain size={18} className="text-[#ff9667]" />
        </div>
        <h2 className="mt-4 font-display text-2xl font-bold">
          Morning Trail & Hills Tempo
        </h2>
        <p className="mt-2 text-xs text-muted-foreground">
          Sep 28 · Turahalli Forest · Running
        </p>
        <div className="mt-6 grid grid-cols-3">
          <Metric value="8.12 km" unit="Distance" />
          <Metric value="+185 m" unit="Elevation gain" />
          <Metric value="88 /100" unit="Suffer score" />
        </div>
        <div className="relative mt-8">
          <span className="absolute left-1/2 top-0 rounded-md border border-[#fc4c02]/20 bg-background px-2 py-1 text-[8px] text-[#ff9667]">
            Peak ascent · 68 m
          </span>
          <Ridgelines className="w-full" />
        </div>
        <Splits />
        <button
          onClick={open}
          className="mt-6 flex items-center gap-2 text-xs text-[#ff9667]"
        >
          View full activity <ArrowRight size={14} />
        </button>
      </div>
      <div className="space-y-6">
        <section id="discipline" className={`${panel} border-[#c084fc]/20 p-6`}>
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-[#c084fc]">
            <ShieldCheck size={15} />
            Mental discipline
          </div>
          <h2 className="mt-4 font-display text-2xl font-bold">
            Train the quiet.
          </h2>
          <p className="mt-3 text-xs leading-6 text-muted-foreground">
            A steady mind is your competitive edge. Take a moment. Find your
            center.
          </p>
          <div className="my-8 flex flex-col items-center">
            <div
              className={`flex h-40 w-40 flex-col items-center justify-center rounded-full border border-[#c084fc]/40 bg-[#c084fc]/5 transition-all duration-[4000ms] ${
                breathing && cycle < 8
                  ? "scale-110 shadow-[0_0_50px_#c084fc15]"
                  : "scale-90"
              }`}
            >
              <span className="text-sm font-semibold text-[#dec0fa]">
                {breathing ? breath : "Box breathing"}
              </span>
              <span className="mt-2 font-mono text-[10px] text-muted-foreground">
                {breathing ? `${4 - (seconds % 4)} seconds` : "4 · 4 · 4 · 4"}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              setBreathing(!breathing)
              setSeconds(0)
            }}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#c084fc]/30 bg-[#c084fc]/10 py-3 text-xs font-medium text-[#dec0fa]"
          >
            {breathing ? <Pause size={14} /> : <Play size={14} />}
            {breathing ? "End breathing practice" : "Begin breathing practice"}
          </button>
        </section>
        <section className={`${panel} p-6`}>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#e9c959]">
            <Trophy size={17} />
            Your all-time best
          </div>
          {[
            ["Fastest 1 km", "3:52", "Oct 01"],
            ["Longest ride", "42.6 km", "Sep 29"],
            ["Highest suffer score", "94", "Sep 26"],
          ].map(([name, value, date]) => (
            <div
              key={name}
              className="mt-4 flex justify-between border-t border-border pt-4"
            >
              <div>
                <div className="text-[11px]">{name}</div>
                <div className="mt-1 text-[8px] text-muted-foreground">
                  {date}, 2026
                </div>
              </div>
              <div className="font-mono text-sm text-[#e9c959]">{value}</div>
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}
function Studio({ toast }: { toast: (message: string) => void }) {
  const { currentProfile } = useAthleteApp()
  const athleteName = currentProfile === "women" ? "Shreya Dixit" : "Sughosh Dixit"

  // Step 1: Activity & Footage
  const [selectedWorkoutIdx, setSelectedWorkoutIdx] = useState(0)
  const selectedWorkout = workouts[selectedWorkoutIdx] || workouts[0]
  const routePoints = useMemo(() => getRoutePointsForWorkout(selectedWorkout), [selectedWorkout])

  // Precompute cumulative geodetic Haversine distances to prevent numeral jitter
  const cumDists = useMemo(() => {
    if (!routePoints || routePoints.length === 0) return [0]
    const dists = new Array(routePoints.length).fill(0)
    for (let i = 1; i < routePoints.length; i++) {
      dists[i] = dists[i - 1] + calculateHaversineKm(
        routePoints[i - 1].latitude,
        routePoints[i - 1].longitude,
        routePoints[i].latitude,
        routePoints[i].longitude
      )
    }
    return dists
  }, [routePoints])
  const finalDistKm = cumDists[cumDists.length - 1] || parseFloat(selectedWorkout.distance) || 5.24

  // Backdrop state
  const layered = new URLSearchParams(useLocation().search).has("layered")
  const [background, setBackground] = useState(
    layered && studioTransfer.photo ? "Workout photo" : "Dark canvas"
  )
  const [photo, setPhoto] = useState(() => (layered ? studioTransfer.photo : ""))
  const [scrim, setScrim] = useState(55)
  const [mapOpacity, setMapOpacity] = useState(() => (layered ? studioTransfer.opacity : 70))
  const photoInput = useRef<HTMLInputElement>(null)

  // Step 2: HUD & Telemetry
  const [quote, setQuote] = useState("The only way out is through.")
  const [showTelemetry, setShowTelemetry] = useState(true)
  const [showQuote, setShowQuote] = useState(true)
  const [videoDuration, setVideoDuration] = useState(15) // 15s (Instagram Reels default), 30s, 60s

  // Step 3: Export & Quality
  const [resolution, setResolution] = useState<"1080p" | "4K UHD">("1080p")
  const [exporting, setExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)

  // Live Canvas Preview & Playback state
  const [progress, setProgress] = useState(100)
  const [playing, setPlaying] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Animation playback loop
  useEffect(() => {
    if (!playing) return
    const stepInterval = 1000 / 30 // ~30fps preview loop
    const totalSteps = (videoDuration * 1000) / stepInterval
    const increment = 100 / totalSteps

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0
        }
        return Math.min(100, prev + increment)
      })
    }, stepInterval)

    return () => clearInterval(timer)
  }, [playing, videoDuration])

  // Draw interactive preview canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height
    const scale = w / 360
    const ratio = Math.max(0, Math.min(1, progress / 100))

    // 1. Background
    const bgGrad = ctx.createLinearGradient(0, 0, w, h)
    bgGrad.addColorStop(0, "#080c14")
    bgGrad.addColorStop(0.5, "#0f172a")
    bgGrad.addColorStop(1, "#05070c")
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, w, h)

    // Satellite or photo overlay
    if (background === "Satellite" && mapOpacity > 0) {
      ctx.fillStyle = `rgba(14, 116, 144, ${mapOpacity / 400})`
      ctx.fillRect(0, 0, w, h)
    }

    // Dot Matrix Pattern
    ctx.fillStyle = "rgba(255, 255, 255, 0.04)"
    const dotStep = Math.round(18 * scale)
    for (let x = 10 * scale; x < w; x += dotStep) {
      for (let y = 10 * scale; y < h; y += dotStep) {
        ctx.beginPath()
        ctx.arc(x, y, 0.8 * scale, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // 2. Header: Brand + Reels Audio Indicator
    ctx.fillStyle = "#CCFF00"
    ctx.font = `900 ${Math.round(16 * scale)}px "Montserrat", sans-serif`
    ctx.fillText("kuchh bhii.", 20 * scale, 34 * scale)

    ctx.fillStyle = "rgba(204, 255, 0, 0.15)"
    ctx.strokeStyle = "#CCFF00"
    ctx.lineWidth = 1 * scale
    ctx.beginPath()
    ctx.roundRect(w - 145 * scale, 18 * scale, 125 * scale, 22 * scale, 11 * scale)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = "#CCFF00"
    ctx.font = `800 ${Math.round(8.5 * scale)}px monospace`
    ctx.fillText("🎵 REEL-READY AUDIO", w - 137 * scale, 32 * scale)

    ctx.fillStyle = "#94a3b8"
    ctx.font = `700 ${Math.round(8 * scale)}px monospace`
    ctx.fillText(`${selectedWorkout.sport.toUpperCase()} • ${selectedWorkout.location.toUpperCase()}`, 20 * scale, 50 * scale)

    // 3. Draw Route with Dual-Stroke Glow
    if (routePoints.length >= 2) {
      const mapX = 24 * scale
      const mapY = 64 * scale
      const mapW = w - 48 * scale
      const mapH = h - 250 * scale

      const { project } = createAspectRatioProjector(
        routePoints,
        { x: mapX, y: mapY, width: mapW, height: mapH },
        20 * scale
      )

      // Ghost path
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
      ctx.lineWidth = 2 * scale
      ctx.setLineDash([4 * scale, 4 * scale])
      ctx.beginPath()
      routePoints.forEach((p, idx) => {
        const [x, y] = project(p.latitude, p.longitude)
        if (idx === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.stroke()
      ctx.setLineDash([])

      // Active completed path
      const pointsCount = Math.max(2, Math.floor(routePoints.length * ratio))
      const currentSlice = routePoints.slice(0, pointsCount)
      const themeColor = selectedWorkout.color || "#FC5200"

      // Outer glow
      ctx.save()
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.shadowColor = themeColor
      ctx.shadowBlur = 12 * scale
      ctx.strokeStyle = `${themeColor}88`
      ctx.lineWidth = 7 * scale
      ctx.beginPath()
      currentSlice.forEach((p, idx) => {
        const [x, y] = project(p.latitude, p.longitude)
        if (idx === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.stroke()

      // Inner stroke
      ctx.shadowBlur = 3 * scale
      ctx.strokeStyle = themeColor
      ctx.lineWidth = 3.5 * scale
      ctx.beginPath()
      currentSlice.forEach((p, idx) => {
        const [x, y] = project(p.latitude, p.longitude)
        if (idx === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.stroke()

      // Razor core
      ctx.shadowBlur = 0
      ctx.strokeStyle = "#FFFFFF"
      ctx.lineWidth = 1.2 * scale
      ctx.beginPath()
      currentSlice.forEach((p, idx) => {
        const [x, y] = project(p.latitude, p.longitude)
        if (idx === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.stroke()
      ctx.restore()

      // Start Pin
      const [startX, startY] = project(routePoints[0].latitude, routePoints[0].longitude)
      ctx.fillStyle = "#10B981"
      ctx.beginPath()
      ctx.arc(startX, startY, 4.5 * scale, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = "#FFFFFF"
      ctx.lineWidth = 1.5 * scale
      ctx.stroke()

      // Athlete Marker with Directional Beam
      const activePt = currentSlice[currentSlice.length - 1]
      const prevPt = currentSlice[Math.max(0, currentSlice.length - 2)]
      const [curX, curY] = project(activePt.latitude, activePt.longitude)
      const [prevX, prevY] = project(prevPt.latitude, prevPt.longitude)

      let headingRad = 0
      const dx = curX - prevX
      const dy = curY - prevY
      if (Math.abs(dx) > 0.001 || Math.abs(dy) > 0.001) {
        headingRad = Math.atan2(dx, -dy)
      }

      drawAnimatedAthleteMarker(ctx, {
        x: curX,
        y: curY,
        headingRad,
        scale: scale * 0.9,
        accentColor: themeColor,
        activityType: selectedWorkout.sport.toLowerCase(),
        elapsedMs: performance.now(),
        showRadar: true,
        showHeadingBeam: true,
      })
    }

    // 4. Live Telemetry HUD Card
    if (showTelemetry) {
      const hudX = 20 * scale
      const hudY = h - 176 * scale
      const hudW = w - 40 * scale
      const hudH = 110 * scale

      ctx.fillStyle = "rgba(15, 23, 42, 0.9)"
      ctx.strokeStyle = "rgba(255, 255, 255, 0.12)"
      ctx.lineWidth = 1 * scale
      ctx.beginPath()
      ctx.roundRect(hudX, hudY, hudW, hudH, 12 * scale)
      ctx.fill()
      ctx.stroke()

      // Left Accent bar
      ctx.fillStyle = selectedWorkout.color || "#FC5200"
      ctx.beginPath()
      ctx.roundRect(hudX, hudY, 4 * scale, hudH, 2 * scale)
      ctx.fill()

      // Title
      ctx.fillStyle = "#ffffff"
      ctx.font = `800 ${Math.round(13 * scale)}px "Montserrat", sans-serif`
      const titleTrunc = selectedWorkout.title.length > 22 ? selectedWorkout.title.slice(0, 20) + "..." : selectedWorkout.title
      ctx.fillText(titleTrunc, hudX + 14 * scale, hudY + 22 * scale)

      // Live Tabular Odometer
      const activeIdx = Math.min(routePoints.length - 1, Math.floor(ratio * (routePoints.length - 1)))
      const liveKm = (routePoints.length > 0 ? cumDists[activeIdx] : ratio * finalDistKm).toFixed(2)

      ctx.fillStyle = "#94a3b8"
      ctx.font = `700 ${Math.round(8 * scale)}px monospace`
      ctx.fillText("LIVE DISTANCE", hudX + 14 * scale, hudY + 39 * scale)

      ctx.fillStyle = "#ffffff"
      ctx.font = `900 ${Math.round(22 * scale)}px monospace`
      const slotX = hudX + 14 * scale
      const charSlot = 14 * scale
      for (let c = 0; c < liveKm.length; c++) {
        ctx.fillText(liveKm[c], slotX + c * charSlot, hudY + 66 * scale)
      }

      ctx.fillStyle = "#CCFF00"
      ctx.font = `800 ${Math.round(11 * scale)}px "Montserrat", sans-serif`
      ctx.fillText("KM", slotX + liveKm.length * charSlot + 5 * scale, hudY + 65 * scale)

      // Sub-metrics
      ctx.fillStyle = "#94a3b8"
      ctx.font = `700 ${Math.round(7.5 * scale)}px monospace`
      ctx.fillText(`PACE: ${selectedWorkout.pace}`, hudX + 14 * scale, hudY + 92 * scale)
      ctx.fillText(`TIME: ${selectedWorkout.time}`, hudX + 110 * scale, hudY + 92 * scale)
      ctx.fillText(`ELEV: +185m`, hudX + 210 * scale, hudY + 92 * scale)
    }

    // 5. Quote Box
    if (showQuote) {
      const qX = 20 * scale
      const qY = h - 56 * scale
      const qW = w - 40 * scale
      const qH = 44 * scale

      ctx.fillStyle = "rgba(15, 23, 42, 0.85)"
      ctx.strokeStyle = "rgba(204, 255, 0, 0.25)"
      ctx.lineWidth = 1 * scale
      ctx.beginPath()
      ctx.roundRect(qX, qY, qW, qH, 8 * scale)
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = "#CCFF00"
      ctx.fillRect(qX, qY, 3 * scale, qH)

      ctx.fillStyle = "#f8fafc"
      ctx.font = `italic 700 ${Math.round(8.5 * scale)}px "Montserrat", sans-serif`
      const qSnippet = quote.length > 40 ? quote.slice(0, 38) + "..." : quote
      ctx.fillText(`"${qSnippet}"`, qX + 10 * scale, qY + 18 * scale)

      ctx.fillStyle = "#94a3b8"
      ctx.font = `600 ${Math.round(6.5 * scale)}px monospace`
      ctx.fillText(`⚡ Made with intention doing Kuchh Bhii by Sughosh 😉`, qX + 10 * scale, qY + 34 * scale)
    }

    // 6. Bottom Scrub Line
    ctx.fillStyle = "rgba(255, 255, 255, 0.15)"
    ctx.fillRect(0, h - 5 * scale, w, 5 * scale)
    ctx.fillStyle = "#CCFF00"
    ctx.fillRect(0, h - 5 * scale, w * ratio, 5 * scale)
  }, [progress, selectedWorkout, background, photo, scrim, mapOpacity, quote, showTelemetry, showQuote, routePoints, cumDists, finalDistKm])

  // Export handling
  async function exportArt(video: boolean) {
    if (exporting) return
    setExporting(true)
    setExportProgress(0)

    try {
      if (video) {
        toast(`Generating ${resolution} Reel-Ready 60FPS video replay...`)
        const res = await ActivityExportService.downloadVideo(
          selectedWorkout,
          routePoints,
          athleteName,
          {
            resolution: resolution === "4K UHD" ? "4k" : "1080p",
            durationSec: videoDuration,
            quote,
            onProgress: (pct) => setExportProgress(pct)
          }
        )
        toast(res)
      } else {
        toast("Generating 4K Ultra-HD athletic poster...")
        const res = await ActivityExportService.downloadPoster(
          selectedWorkout,
          routePoints,
          athleteName
        )
        toast(res)
      }
    } catch (err: unknown) {
      toast("Export encountered an issue: " + (err instanceof Error ? err.message : String(err)))
    } finally {
      setExporting(false)
      setExportProgress(0)
    }
  }

  const quotePresets = [
    "The only way out is through.",
    "Discipline equals freedom.",
    "Intention over everything.",
    "What hurts today makes you stronger tomorrow."
  ]

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      {/* LEFT: LIVE 9:16 CANVAS PREVIEW & SCRUB STAGE */}
      <section className={`${panel} flex flex-col items-center p-6`}>
        <div className="mb-4 flex w-full items-center justify-between text-[10px] text-muted-foreground">
          <span className="font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
            <Sparkles size={12} /> Live Reel Studio Preview
          </span>
          <span className="font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded-md text-[9px]">
            9:16 VERTICAL • {resolution}
          </span>
        </div>

        {/* Live Canvas Viewport */}
        <div className="relative group flex justify-center w-full">
          <canvas
            ref={canvasRef}
            width={360}
            height={640}
            className="w-full max-w-[320px] rounded-2xl border border-white/15 shadow-2xl bg-[#080c14] aspect-[9/16] object-contain"
          />

          {/* Quick Play/Pause Floating Overlay */}
          <button
            type="button"
            onClick={() => {
              if (!playing && progress >= 100) setProgress(0)
              setPlaying(!playing)
            }}
            className="absolute bottom-4 right-4 bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 p-2.5 rounded-full text-white transition cursor-pointer shadow-lg"
            aria-label={playing ? "Pause preview" : "Play preview"}
          >
            {playing ? <Pause size={16} /> : <Play size={16} className="text-[#CCFF00]" />}
          </button>
        </div>

        {/* Scrubber & Timeline Bar */}
        <div className="mt-5 flex w-full max-w-[320px] items-center gap-3">
          <button
            type="button"
            aria-label={playing ? "Pause" : "Play"}
            onClick={() => {
              if (!playing && progress >= 100) setProgress(0)
              setPlaying(!playing)
            }}
            className="text-primary hover:opacity-85 transition cursor-pointer"
          >
            {playing ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <input
            type="range"
            aria-label="Playback position"
            min="0"
            max="100"
            value={progress}
            onChange={(event) => {
              setPlaying(false)
              setProgress(Number(event.target.value))
            }}
            className="h-1.5 flex-1 accent-[#CCFF00] bg-white/15 rounded-lg cursor-pointer"
          />
          <span className="font-mono text-[10px] text-muted-foreground w-16 text-right">
            0:{String(Math.round((progress / 100) * videoDuration)).padStart(2, "0")} / 0:{String(videoDuration).padStart(2, "0")}
          </span>
        </div>
      </section>

      {/* RIGHT: 3-STEP INTUITIVE CREATION WORKFLOW */}
      <section className={`${panel} h-fit p-6 sm:p-8 space-y-7`}>
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <Video size={18} className="text-primary" />
            <h2 className="font-display text-lg font-bold">Activity Video Studio</h2>
          </div>
          <span className="text-[10px] font-mono text-[#CCFF00] bg-[#CCFF00]/10 border border-[#CCFF00]/25 px-2 py-0.5 rounded-full">
            Reel-Ready v2.4
          </span>
        </div>

        {/* STEP 1: ACTIVITY & FOOTAGE */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[9px] font-mono font-bold">1</span>
            Select Activity & Backdrop
          </div>

          {/* Activity Selector */}
          <div className="mt-3">
            <label className="text-[10px] text-muted-foreground block mb-1">Target Workout</label>
            <select
              value={selectedWorkoutIdx}
              onChange={(e) => setSelectedWorkoutIdx(Number(e.target.value))}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs text-white outline-none focus:border-primary/50 cursor-pointer"
            >
              {workouts.map((w, idx) => (
                <option key={w.id || idx} value={idx}>
                  {w.sport} • {w.title} ({w.distance} km)
                </option>
              ))}
            </select>
          </div>

          {/* Backdrop Type Selector */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[
              { id: "Dark canvas", label: "Dark Canvas" },
              { id: "Satellite", label: "Google Satellite" },
              { id: "Route mesh", label: "Route Mesh" },
              { id: "Workout photo", label: "Photo Backdrop" },
            ].map(({ id, label }) => (
              <button
                type="button"
                key={id}
                onClick={() => {
                  setBackground(id)
                  if (id === "Workout photo" && !photo) photoInput.current?.click()
                }}
                className={`rounded-xl border px-3 py-3 text-[11px] font-semibold text-center transition cursor-pointer ${
                  background === id
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "border-border bg-background/50 text-muted-foreground hover:border-white/20 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <input
            ref={photoInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                const reader = new FileReader()
                reader.onload = () => {
                  setPhoto(reader.result as string)
                  setBackground("Workout photo")
                }
                reader.readAsDataURL(file)
              }
            }}
          />

          {background === "Workout photo" && (
            <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Glass Scrim</span>
                <span className="font-mono text-white">{scrim}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                value={scrim}
                onChange={(e) => setScrim(Number(e.target.value))}
                className="mt-2 w-full accent-[#CCFF00]"
              />
              <button
                type="button"
                onClick={() => photoInput.current?.click()}
                className="mt-2 text-[10px] text-primary underline"
              >
                Upload different photo
              </button>
            </div>
          )}

          {background === "Satellite" && (
            <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Satellite Opacity</span>
                <span className="font-mono text-white">{mapOpacity}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={mapOpacity}
                onChange={(e) => setMapOpacity(Number(e.target.value))}
                className="mt-2 w-full accent-[#CCFF00]"
              />
            </div>
          )}
        </div>

        {/* STEP 2: HUD & INTENTION */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[9px] font-mono font-bold">2</span>
            HUD & Intention
          </div>

          {/* Telemetry Toggles */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setShowTelemetry(!showTelemetry)}
              className={`rounded-xl border px-3 py-2 text-[11px] font-semibold text-center transition cursor-pointer ${
                showTelemetry
                  ? "border-[#38bdf8] bg-[#38bdf8]/10 text-[#38bdf8]"
                  : "border-border text-muted-foreground hover:border-white/20"
              }`}
            >
              {showTelemetry ? "✓ Live Odometer HUD" : "+ Live Odometer HUD"}
            </button>

            <button
              type="button"
              onClick={() => setShowQuote(!showQuote)}
              className={`rounded-xl border px-3 py-2 text-[11px] font-semibold text-center transition cursor-pointer ${
                showQuote
                  ? "border-[#ffd700] bg-[#ffd700]/10 text-[#ffd700]"
                  : "border-border text-muted-foreground hover:border-white/20"
              }`}
            >
              {showQuote ? "✓ Quote Banner" : "+ Quote Banner"}
            </button>
          </div>

          {/* Motivational Quote Input */}
          {showQuote && (
            <div className="mt-3">
              <label className="text-[10px] text-muted-foreground block mb-1">Motivational Quote</label>
              <textarea
                value={quote}
                maxLength={70}
                onChange={(e) => setQuote(e.target.value)}
                rows={2}
                className="w-full resize-none rounded-xl border border-border bg-background p-3 text-xs leading-5 outline-none focus:border-primary/50 text-white"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {quotePresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setQuote(preset)}
                    className="text-[9px] bg-white/5 hover:bg-white/10 border border-white/10 rounded-md px-2 py-1 text-muted-foreground hover:text-white transition cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Video Duration Selector */}
          <div className="mt-3">
            <label className="text-[10px] text-muted-foreground block mb-1">Video Duration (Pacing)</label>
            <div className="flex gap-2">
              {[
                { sec: 15, label: "15s (Reels Standard)" },
                { sec: 30, label: "30s (Detailed)" },
                { sec: 60, label: "60s (Slow-mo)" },
              ].map(({ sec, label }) => (
                <button
                  type="button"
                  key={sec}
                  onClick={() => setVideoDuration(sec)}
                  className={`flex-1 rounded-lg border py-2 text-[10px] font-semibold transition cursor-pointer ${
                    videoDuration === sec
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-white/20"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* STEP 3: EXPORT & SOCIAL DELIVERY */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[9px] font-mono font-bold">3</span>
            Resolution & Reel Export
          </div>

          {/* Resolution Options */}
          <div className="mt-3 flex gap-2">
            {(["1080p", "4K UHD"] as const).map((val) => (
              <button
                type="button"
                key={val}
                onClick={() => setResolution(val)}
                className={`flex-1 rounded-lg border py-2.5 font-mono text-[11px] font-bold transition cursor-pointer ${
                  resolution === val
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-white/20"
                }`}
              >
                {val} {val === "1080p" ? "⚡ (Reels Native)" : "🎬"}
              </button>
            ))}
          </div>

          {/* Instagram Music Compatibility Callout */}
          <div className="mt-3 p-3 rounded-xl bg-[#CCFF00]/10 border border-[#CCFF00]/25 text-[10px] leading-relaxed text-[#f8fafc]">
            <span className="font-bold text-[#CCFF00] flex items-center gap-1 mb-1">
              🎵 Instagram Trending Music Compatible
            </span>
            Includes an embedded silent stereo audio carrier track so Instagram Reels recognizes valid audio channels and allows you to add any trending song directly in the Instagram app!
          </div>

          {/* Export Action Buttons */}
          <div className="mt-4 space-y-2">
            <button
              type="button"
              disabled={exporting}
              onClick={() => exportArt(true)}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#FC5200] hover:bg-[#e04800] py-3.5 text-xs font-bold text-white shadow-lg shadow-[#FC5200]/25 transition cursor-pointer disabled:opacity-50"
            >
              <Video size={15} />
              {exporting ? `Rendering Video (${exportProgress}%)...` : `🎬 Export ${resolution} Video (Reel-Ready)`}
            </button>

            <button
              type="button"
              disabled={exporting}
              onClick={() => exportArt(false)}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 py-3 text-xs font-bold text-white transition cursor-pointer disabled:opacity-50"
            >
              <Download size={14} className="text-[#CCFF00]" />
              Download High-Res Poster (PNG)
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
const router = createBrowserRouter([
  { path: "/", Component: AppShell },
  { path: "/playbook", Component: AppShell },
  { path: "/workout", Component: WorkoutPlayer },
  { path: "/armor", Component: AppShell },
  { path: "/community", Component: AppShell },
  { path: "/maps", Component: AppShell },
  { path: "/activities", Component: AppShell },
  { path: "/performance", Component: AppShell },
  { path: "/football", Component: AppShell },
  { path: "/studio", Component: AppShell },
  { path: "/fithub", Component: AppShell },
  { path: "/discipline", Component: AppShell },
  { path: "/routine", Component: AppShell },
  { path: "/nutrition", Component: AppShell },
  { path: "/vedas", Component: AppShell },
  { path: "/cycle", Component: AppShell },
  { path: "/period", Component: AppShell },
  { path: "/portfolio", Component: AppShell },
  { path: "/settings", Component: AppShell },
  { path: "*", Component: AppShell },
])
export default function App() {
  return <RouterProvider router={router} />
}
