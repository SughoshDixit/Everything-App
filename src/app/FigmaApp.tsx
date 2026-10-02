import { useEffect, useId, useRef, useState } from "react"
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
import { GoogleFitHomeDashboard } from "../components/GoogleFitHomeDashboard"
import { DisciplineTab } from "../components/DisciplineTab"
import { FootballTab } from "../components/FootballTab"
import { NutritionTab } from "../components/NutritionTab"
import { PeriodTab } from "../components/PeriodTab"
import { MusicVedasTab } from "../components/MusicVedasTab"
import { SettingsVaultTab } from "../components/SettingsVaultTab"
import { SughoshDixitPortfolioTab } from "../components/SughoshDixitPortfolioTab"
import { GpsActivityTrackerModal } from "../components/GpsActivityTrackerModal"
import { StravaRouteFlybyPlayer } from "../components/StravaRouteFlybyPlayer"
import { SocialWorkoutShareModal } from "../components/SocialWorkoutShareModal"
import { CreateActivityPostModal } from "../components/CreateActivityPostModal"
import { StravaActivityDetailModal } from "../components/StravaActivityDetailModal"
import { StravaAthleteProfileModal } from "../components/StravaAthleteProfileModal"
import { useAthleteApp } from "../context/AthleteAppContext"
import type { UserProfile, GpsActivityLog, StravaActivityPost } from "../types"
import {
  Activity,
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  Bike,
  Check,
  ChevronRight,
  Clock3,
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
  Upload,
  Users,
  Utensils,
  X,
  Zap,
} from "lucide-react"

type Sport = "All activities" | "Football" | "Running" | "Cycling" | "Calisthenics"
type Workout = {
  id: number
  title: string
  sport: Exclude<Sport, "All activities">
  date: string
  distance: string
  time: string
  pace: string
  color: string
  route: string
  record?: string
  location: string
}
const workouts: Workout[] = [
  {
    id: 1,
    title: "Morning miles, clear mind.",
    sport: "Running",
    date: "TODAY, 06:32",
    distance: "5.24",
    time: "24:12",
    pace: "4:37",
    color: "#fc4c02",
    route:
      "M87 146 L73 132 L70 104 L86 78 L104 74 L115 49 L143 41 L173 50 L181 79 L203 88 L215 110 L210 139 L189 155 L165 161 L143 180 L114 172 L105 151 L87 146 Z M115 49 L112 74 L132 87 L152 85 L173 50 M143 180 L148 147 L163 135 L189 155",
    record: "FASTEST 1K",
    location: "Cubbon Park, Bengaluru",
  },
  {
    id: 2,
    title: "Own the left wing.",
    sport: "Football",
    date: "YESTERDAY, 17:45",
    distance: "7.82",
    time: "68:24",
    pace: "29.4",
    color: "#ccff00",
    route:
      "M78 61 L187 64 L193 165 L80 169 L78 61 L180 153 L91 84 L171 81 L98 146 L174 139 L116 70 L123 160 L149 81 L154 154 L88 107 L180 116 L89 133 L173 97 L104 64 L106 166",
    location: "South United Football Club",
  },
  {
    id: 3,
    title: "The long way home.",
    sport: "Cycling",
    date: "SEP 29, 07:10",
    distance: "42.6",
    time: "1:42:08",
    pace: "25.0",
    color: "#38bdf8",
    route:
      "M48 123 L59 114 L66 82 L83 77 L105 92 L124 79 L130 53 L157 48 L171 63 L169 92 L187 104 L208 93 L231 106 L246 136 L226 159 L202 151 L183 162 L162 155 L146 178 L125 169 L115 147 L93 153 L72 139 L48 123",
    record: "LONGEST RIDE",
    location: "Nandi Hills, Bengaluru",
  },
  {
    id: 4,
    title: "Chasing the elevation.",
    sport: "Running",
    date: "SEP 28, 06:15",
    distance: "8.12",
    time: "42:36",
    pace: "5:15",
    color: "#fc4c02",
    route:
      "M76 167 L87 157 L88 140 L105 128 L93 116 L115 108 L111 89 L127 81 L117 68 L143 53 L158 64 L171 51 L191 63 L184 84 L201 102 L183 116 L197 127 L178 144 L156 133 L141 153 L120 148 L110 169 L90 179 L76 167",
    location: "Turahalli Forest, Bengaluru",
  },
  {
    id: 5,
    title: "Built, not born.",
    sport: "Calisthenics",
    date: "SEP 27, 18:00",
    distance: "320",
    time: "45:00",
    pace: "128",
    color: "#c084fc",
    route:
      "M44 142 L44 113 L60 113 L60 75 L77 75 L77 142 L94 142 L94 98 L111 98 L111 48 L128 48 L128 142 L145 142 L145 88 L162 88 L162 62 L179 62 L179 142 L196 142 L196 102 L213 102 L213 79 L230 79 L230 142 L248 142",
    location: "The Movement Studio",
  },
  {
    id: 6,
    title: "One more. Then another.",
    sport: "Football",
    date: "SEP 26, 17:30",
    distance: "6.45",
    time: "55:18",
    pace: "28.1",
    color: "#ccff00",
    route:
      "M77 160 L77 66 L195 66 L195 160 L77 160 L189 72 L84 101 L187 132 L85 153 L183 87 L85 125 L179 153 L128 73 L139 155 L162 72 L103 158",
    record: "HARDEST EFFORT",
    location: "South United Football Club",
  },
]
const sports: Sport[] = [
  "All activities",
  "Football",
  "Running",
  "Cycling",
  "Calisthenics",
]
const coreNavItems = [
  { path: "/playbook", label: "Playbook", icon: BookOpen },
  { path: "/activities", label: "Activities", icon: Activity },
  { path: "/armor", label: "Pitch armor", icon: ShieldCheck },
  { path: "/community", label: "Community", icon: Users },
  { path: "/maps", label: "Maps engine", icon: Map },
  { path: "/studio", label: "Share studio", icon: Sparkles },
]
const performanceNavItems = [
  { path: "/fithub", label: "Google Fit Hub", icon: Heart },
  { path: "/football", label: "Football Cockpit", icon: Target },
  { path: "/nutrition", label: "Fuel & Nutrition", icon: Utensils },
]
const lifestyleNavItems = [
  { path: "/discipline", label: "Daily Discipline", icon: ShieldCheck },
  { path: "/vedas", label: "Vedas & Carnatic", icon: Music },
  { path: "/cycle", label: "Cycle Sync", icon: Moon },
  { path: "/portfolio", label: "Portfolio", icon: Trophy },
]
const allAppNavItems = [...coreNavItems, ...performanceNavItems, ...lifestyleNavItems]
export const navItems = coreNavItems
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
    /* handleLogWorkout, */
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
  const [notification, setNotification] = useState(false)
  const [session, setSession] = useState(false)
  const [activityLauncherOpen, setActivityLauncherOpen] = useState(false)
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

  const formattedTime = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`

  const allWorkouts: Workout[] = [
    ...workouts,
    ...stravaPosts.map((p, idx) => ({
      id: 2000 + idx,
      title: p.title,
      sport: (p.sportType === "cycle"
        ? "Cycling"
        : p.sportType === "calisthenics"
          ? "Calisthenics"
          : p.sportType === "football"
            ? "Football"
            : "Running") as Exclude<Sport, "All activities">,
      date: p.date.toUpperCase(),
      distance: p.totalDistanceKm ? p.totalDistanceKm.toFixed(2) : "5.00",
      time: `${p.totalMoveMinutes || 25}:00`,
      pace: p.avgPaceMinKm || "4:45",
      color:
        p.sportType === "cycle"
          ? "#38bdf8"
          : p.sportType === "calisthenics"
            ? "#c084fc"
            : p.sportType === "football"
              ? "#ccff00"
              : "#fc4c02",
      route: workouts[idx % workouts.length].route,
      record: p.recordBadges?.[0]?.title,
      location: p.activities[0]?.details || "Bengaluru, India",
    })),
  ]

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
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

        {/* 1. CORE WORKSPACE */}
        <div className="mt-8 px-3 text-[9px] font-semibold tracking-[0.16em] text-[#666f7e]">
          YOUR WORKSPACE
        </div>
        <nav className="mt-3 flex flex-col gap-1.5">
          {coreNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className={({ isActive }: { isActive: boolean }) =>
                `relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[12px] font-medium transition-colors ${
                  isActive || (item.path === "/playbook" && page === "/")
                    ? item.path === "/playbook"
                      ? "bg-dude/8 text-dude"
                      : "bg-primary/8 text-primary"
                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <item.icon size={16} strokeWidth={1.7} />
              {item.label}
              {item.label === "Share studio" && (
                <span className="ml-auto rounded border border-primary/25 px-1 py-0.5 text-[7px] text-primary">
                  NEW
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* 2. ATHLETE PERFORMANCE */}
        <div className="mt-6 px-3 text-[9px] font-semibold tracking-[0.16em] text-[#666f7e]">
          ATHLETE PERFORMANCE
        </div>
        <nav className="mt-3 flex flex-col gap-1.5">
          {performanceNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className={({ isActive }: { isActive: boolean }) =>
                `relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[12px] font-medium transition-colors ${
                  isActive
                    ? "bg-primary/8 text-primary"
                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <item.icon size={16} strokeWidth={1.7} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* 3. LIFESTYLE & MIND */}
        <div className="mt-6 px-3 text-[9px] font-semibold tracking-[0.16em] text-[#666f7e]">
          LIFESTYLE & MIND
        </div>
        <nav className="mt-3 flex flex-col gap-1.5">
          {lifestyleNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className={({ isActive }: { isActive: boolean }) =>
                `relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[12px] font-medium transition-colors ${
                  isActive
                    ? "bg-[#c084fc]/10 text-[#c084fc]"
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
      <div className="lg:ml-[212px]">
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
          <div className="flex items-center gap-3 sm:gap-5">
            <span className="flex items-center gap-1.5 rounded-full border border-[#fc4c02]/20 bg-[#fc4c02]/7 px-3 py-1.5 text-[9px] font-semibold tracking-[0.06em] text-[#ff8952]">
              <Flame size={13} fill="currentColor" />
              14 <span className="hidden sm:inline">DAY STREAK</span>
            </span>
            <div className="relative">
              <button
                onClick={() => setNotification(!notification)}
                aria-label="Notifications"
                aria-expanded={notification}
                className="relative block text-muted-foreground hover:text-white"
              >
                <Bell size={18} />
                <span className="absolute right-0 top-0 h-1 w-1 rounded-full bg-primary" />
              </button>
              {notification && (
                <div className="absolute right-0 top-9 z-40 w-72 rounded-xl border border-border bg-[#151b24] p-5 shadow-2xl">
                  <h3 className="text-sm font-semibold">
                    Looking good, {currentProfile === "women" ? "Shreya" : "Sughosh"}.
                  </h3>
                  <p className="mt-3 text-xs leading-5 text-muted-foreground">
                    Your recovery is balanced this week. You’re in peak condition for training and match day.
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-xs text-[#ffd700]">
                    <Trophy size={15} />
                    New fastest 1K: {milestones.fastest1kRunSeconds ? `${Math.floor(milestones.fastest1kRunSeconds / 60)}:${String(milestones.fastest1kRunSeconds % 60).padStart(2, '0')} /km` : "3:52 /km"}
                  </div>
                  {(milestones.longestRunKm || milestones.longestCycleKm || 0) > 0 && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-sky-400">
                      <Footprints size={14} />
                      Longest effort: {(milestones.longestRunKm || milestones.longestCycleKm || 0).toFixed(1)} km
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="h-6 w-px bg-border" />
            <button
              aria-label="Toggle athlete profile"
              onClick={() => setCurrentProfile(currentProfile === "men" ? "women" : "men")}
              className="flex items-center gap-2 rounded-full border border-border px-2 py-1 text-xs text-muted-foreground hover:border-white/30"
              title="Click to toggle athlete profile"
            >
              <Avatar small profile={currentProfile} />
              <span className="hidden sm:inline text-[11px] font-semibold text-white">
                {currentProfile === "women" ? "Shreya" : "Sughosh"}
              </span>
            </button>
            <button
              onClick={() => setActivityLauncherOpen(true)}
              className="flex shrink-0 items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-[11px] font-bold text-primary-foreground shadow-[0_0_24px_#ccff0010] transition hover:bg-[#dcff4d]"
            >
              <Plus size={15} />
              <span className="hidden sm:inline">Log activity</span>
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

          {playbook ? (
            <Playbook />
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
            <SettingsVaultTab quotes={quotes} onAddQuote={handleAddQuote} />
          ) : activities ? (
            <>
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
              <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_282px]">
                <section className="min-w-0">
                  <div className="relative mb-7 hidden overflow-hidden rounded-2xl border border-[#fc4c02]/20 bg-[#101319] sm:block">
                    <div className="absolute inset-y-0 right-0 w-[55%] opacity-70 sm:w-[48%]">
                      <RouteArt
                        workout={workouts[0]}
                        big
                        className="h-full w-full scale-125"
                      />
                    </div>
                    <div className="relative z-10 p-6 sm:p-7">
                      <div className="mb-4 flex items-center gap-2 text-[8px] font-semibold uppercase tracking-[0.15em] text-[#ff9667]">
                        <span className="h-1 w-1 rounded-full bg-[#fc4c02]" />
                        Latest activity{" "}
                        <span className="ml-2 text-[#788291]">
                          Today · 06:32 AM
                        </span>
                      </div>
                      <h2 className="max-w-[190px] font-display text-[23px] font-bold leading-[1.35] sm:max-w-[260px] sm:text-[26px]">
                        Morning miles,
                        <br />
                        clear mind.
                      </h2>
                      <div className="mt-3 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <MapPin size={11} />
                        Cubbon Park, Bengaluru
                      </div>
                      <div className="mt-5 flex gap-6">
                        <div>
                          <div className="font-display text-xl font-bold">
                            5.24{" "}
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
                            4:37{" "}
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
                        onClick={() => setSelected(workouts[0])}
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
              </div>
            </>
          ) : (
            <Performance open={() => setSelected(workouts[3])} />
          )}

          <footer className="mt-10 flex items-center justify-between border-t border-border pt-5 text-[8px] text-[#667180]">
            <span>KUCHH BHII · INTENTION OVER EVERYTHING.</span>
            <span className="flex items-center gap-1.5">
              Made for the long game <span className="text-primary">↗</span>
            </span>
          </footer>
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-white/10 bg-[#0b0e14]/95 px-2 pt-2.5 pb-[max(0.85rem,env(safe-area-inset-bottom,0px))] backdrop-blur-xl lg:hidden">
        {[
          { path: "/playbook", label: "Playbook", icon: BookOpen },
          { path: "/activities", label: "Activities", icon: Activity },
          { path: "/maps", label: "Maps", icon: Map },
          { path: "/community", label: "Community", icon: Users },
          { path: "/fithub", label: "Fit Hub", icon: Heart },
        ].map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={`flex flex-1 min-w-0 flex-col items-center justify-center gap-1 rounded-xl py-1 text-[10px] font-medium transition-all ${
              page === item.path || (item.path === "/playbook" && page === "/") || (item.path === "/fithub" && page === "/armor")
                ? item.path === "/playbook"
                  ? "text-dude font-bold"
                  : "text-primary font-bold"
                : "text-muted-foreground hover:text-white"
            }`}
          >
            <item.icon size={20} strokeWidth={page === item.path || (item.path === "/playbook" && page === "/") || (item.path === "/fithub" && page === "/armor") ? 2.3 : 1.7} />
            <span className="truncate max-w-[62px] text-[10px]">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* ACTIVITY DETAIL MODAL */}
      {selected && (
        <Modal title="Activity deep-dive" close={() => setSelected(null)}>
          <div className="flex items-center gap-2 text-[10px] text-[#fc4c02]">
            <SportIcon sport={selected.sport} />
            {selected.sport}{" "}
            <span className="ml-auto text-muted-foreground">
              {selected.date}
            </span>
          </div>
          <h2 className="mt-4 font-display text-2xl font-bold">
            {selected.title}
          </h2>
          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin size={12} />
            {selected.location}
          </div>
          <div className="my-5 grid grid-cols-3 rounded-xl border border-border bg-background p-4">
            <Metric
              value={selected.distance}
              unit={selected.sport === "Calisthenics" ? "reps" : "km"}
            />
            <Metric value={selected.time} unit="moving time" />
            <Metric
              value={selected.pace}
              unit={selected.sport === "Running" ? "pace /km" : "peak km/h"}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <RouteArt
              workout={selected}
              className="w-full rounded-xl bg-background"
            />
            <div className="flex flex-col justify-center">
              <span className="text-[9px] tracking-widest text-muted-foreground">
                OVERALL SUFFER SCORE
              </span>
              <div className="mt-2 font-display text-4xl font-bold">
                88<span className="text-base text-muted-foreground"> /100</span>
              </div>
              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                A hard effort. Give your body time to recover and come back stronger.
              </p>
            </div>
          </div>
          <div className="mt-6 flex justify-between text-xs font-medium">
            <span>Elevation profile</span>
            <span className="text-[#ff9667]">+185 m</span>
          </div>
          <Ridgelines className="mt-2 w-full" />
          <Splits />
          <button
            onClick={() => {
              setSelected(null)
              navigate("/studio")
            }}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-xs font-semibold text-primary-foreground"
          >
            <Sparkles size={14} />
            Make an activity poster
          </button>
        </Modal>
      )}

      {/* QUICK ACTIVITY LAUNCHER MODAL */}
      {activityLauncherOpen && (
        <Modal title="Log an Athletic Session" close={() => setActivityLauncherOpen(false)}>
          <p className="text-xs text-muted-foreground mb-6">
            Choose how you would like to track or record your training:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <button
              onClick={() => {
                setActivityLauncherOpen(false)
                setGpsModalActivityType("run")
              }}
              className="flex flex-col items-center text-center p-5 rounded-2xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition group"
            >
              <div className="p-3 rounded-full bg-primary/20 text-primary mb-3 group-hover:scale-110 transition">
                <Footprints size={24} />
              </div>
              <div className="text-xs font-bold text-white mb-1">Live GPS Tracking</div>
              <div className="text-[9px] text-muted-foreground leading-4">
                High-accuracy satellite route with auto-splits and background screen lock
              </div>
            </button>

            <button
              onClick={() => {
                setActivityLauncherOpen(false)
                navigate("/workout")
              }}
              className="flex flex-col items-center text-center p-5 rounded-2xl border border-dude/30 bg-dude/5 hover:bg-dude/10 transition group"
            >
              <div className="p-3 rounded-full bg-dude/20 text-dude mb-3 group-hover:scale-110 transition">
                <Dumbbell size={24} />
              </div>
              <div className="text-xs font-bold text-white mb-1">Yellow Dude Workout</div>
              <div className="text-[9px] text-muted-foreground leading-4">
                Interactive workout player with voice coaching, rep counters & rest timers
              </div>
            </button>

            <button
              onClick={() => {
                setActivityLauncherOpen(false)
                setEditingPost(null)
              }}
              className="flex flex-col items-center text-center p-5 rounded-2xl border border-sky-400/30 bg-sky-400/5 hover:bg-sky-400/10 transition group"
            >
              <div className="p-3 rounded-full bg-sky-400/20 text-sky-400 mb-3 group-hover:scale-110 transition">
                <Sparkles size={24} />
              </div>
              <div className="text-xs font-bold text-white mb-1">Post to Community</div>
              <div className="text-[9px] text-muted-foreground leading-4">
                Compile multi-sport session with restored photos, 4K video clips & badges
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
          onSavePost={handleSaveStravaPost}
          onOpenShareStudio={(cardData) => {
            setEditingPost(undefined)
            setActiveShareCardData(cardData)
          }}
          onClose={() => setEditingPost(undefined)}
        />
      )}

      {activeShareCardData && (
        <SocialWorkoutShareModal
          initialData={activeShareCardData}
          quotesList={quotes}
          onClose={() => setActiveShareCardData(null)}
        />
      )}

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
function smoothRoute(route: string) {
  return (route.match(/M[^M]+/g) || [])
    .map((segment) => {
      const values = (segment.match(/\d+(?:\.\d+)?/g) || []).map(Number)
      const points = Array.from({ length: values.length / 2 }, (_, index) => ({
        x: values[index * 2],
        y: values[index * 2 + 1],
      }))
      if (points.length < 2) return segment
      let curve = `M ${points[0].x} ${points[0].y}`
      for (let index = 0; index < points.length - 1; index++) {
        const before = points[Math.max(0, index - 1)]
        const start = points[index]
        const end = points[index + 1]
        const after = points[Math.min(points.length - 1, index + 2)]
        curve += ` C ${start.x + (end.x - before.x) / 6} ${start.y + (end.y - before.y) / 6}, ${end.x - (after.x - start.x) / 6} ${end.y - (after.y - start.y) / 6}, ${end.x} ${end.y}`
      }
      return curve + (segment.includes("Z") ? " Z" : "")
    })
    .join(" ")
}
const studioRoute = smoothRoute(workouts[0].route)
function Studio({ toast }: { toast: (message: string) => void }) {
  const layered = new URLSearchParams(useLocation().search).has("layered")
  const [background, setBackground] = useState(
    layered && studioTransfer.photo ? "Workout photo" : "Dark canvas",
  )
  const [resolution, setResolution] = useState("1080p")
  const [quote, setQuote] = useState("The only way out is through.")
  const [scrim, setScrim] = useState(55)
  const [progress, setProgress] = useState(100)
  const [playing, setPlaying] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [photo, setPhoto] = useState(() =>
    layered ? studioTransfer.photo : "",
  )
  const [mapOpacity, setMapOpacity] = useState(() =>
    layered ? studioTransfer.opacity : 0,
  )
  const poster = useRef<SVGSVGElement>(null)
  const photoInput = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (!playing) return
    const timer = setInterval(
      () => setProgress((value) => (value >= 100 ? 0 : value + 1)),
      90,
    )
    return () => clearInterval(timer)
  }, [playing])
  async function exportArt(video: boolean) {
    if (!poster.current || exporting) return
    if (
      video &&
      (typeof MediaRecorder === "undefined" ||
        !HTMLCanvasElement.prototype.captureStream)
    ) {
      toast(
        "Video export isn’t supported in this browser. Export a PNG poster instead.",
      )
      return
    }
    setExporting(true)
    try {
      const svg = new XMLSerializer().serializeToString(poster.current)
      const image = new Image()
      const svgUrl = URL.createObjectURL(
        new Blob([svg], { type: "image/svg+xml;charset=utf-8" }),
      )
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve()
        image.onerror = reject
        image.src = svgUrl
      })
      const height =
        resolution === "4K UHD" ? 3840 : resolution === "1080p" ? 1920 : 1280
      const canvas = document.createElement("canvas")
      canvas.height = height
      canvas.width = (height * 9) / 16
      const context = canvas.getContext("2d")
      if (!context) throw new Error("Canvas unavailable")
      const download = (blob: Blob, extension: string) => {
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `everything-morning-miles-${resolution}.${extension}`
        link.click()
        setTimeout(() => URL.revokeObjectURL(url), 1000)
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      if (video) {
        const stream = canvas.captureStream(30)
        const mime = ["video/webm;codecs=vp9", "video/webm", "video/mp4"].find(
          (type) => MediaRecorder.isTypeSupported(type),
        )
        if (!mime) throw new Error("No supported video format")
        const recorder = new MediaRecorder(stream, {
          mimeType: mime,
          videoBitsPerSecond: height > 1920 ? 16000000 : 8000000,
        })
        const chunks: BlobPart[] = []
        recorder.ondataavailable = (event) => {
          if (event.data.size) chunks.push(event.data)
        }
        const finished = new Promise<void>((resolve, reject) => {
          recorder.onerror = reject
          recorder.onstop = () => {
            download(
              new Blob(chunks, { type: mime }),
              mime.includes("mp4") ? "mp4" : "webm",
            )
            stream.getTracks().forEach((track) => track.stop())
            resolve()
          }
        })
        recorder.start()
        const started = performance.now()
        await new Promise<void>((resolve) => {
          const frame = () => {
            const elapsed = performance.now() - started
            context.drawImage(image, 0, 0, canvas.width, canvas.height)
            const pulse = 8 + Math.sin(elapsed / 220) * 5
            context.beginPath()
            context.arc(
              canvas.width * 0.3,
              canvas.height * 0.6,
              (pulse * height) / 720,
              0,
              Math.PI * 2,
            )
            context.fillStyle = "#fc4c0280"
            context.fill()
            if (elapsed < 5000) requestAnimationFrame(frame)
            else resolve()
          }
          requestAnimationFrame(frame)
        })
        recorder.stop()
        await finished
      } else {
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/png"),
        )
        if (!blob) throw new Error("Image export failed")
        download(blob, "png")
      }
      URL.revokeObjectURL(svgUrl)
      toast(
        `${resolution} ${
          video ? "video" : "poster"
        } exported. Your effort deserves to be seen.`,
      )
    } catch {
      toast(
        "The export couldn’t finish. Try 1080p or a dark canvas background.",
      )
    } finally {
      setExporting(false)
    }
  }
  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <section className={`${panel} flex flex-col items-center p-6`}>
        <div className="mb-5 flex w-full items-center justify-between text-[9px] text-muted-foreground">
          <span className="uppercase tracking-widest">Your canvas</span>
          <span>9:16 · STORY FORMAT</span>
        </div>
        <svg
          ref={poster}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 393 698"
          className="w-full max-w-[320px] rounded-lg border border-white/10 shadow-2xl"
          role="img"
          aria-label="Activity poster preview"
        >
          <defs>
            <linearGradient id="posterbg" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#101820" />
              <stop offset="1" stopColor="#080b11" />
            </linearGradient>
            <filter id="posterglow">
              <feGaussianBlur stdDeviation="3" />
            </filter>
            <pattern
              id="posterdots"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1" cy="1" r="0.7" fill="#758194" opacity="0.25" />
            </pattern>
          </defs>
          <rect width="393" height="698" fill="url(#posterbg)" />
          {photo && background === "Workout photo" && (
            <image
              href={photo}
              width="393"
              height="698"
              preserveAspectRatio="xMidYMid slice"
            />
          )}
          {background === "Route mesh" &&
            Array.from({ length: 14 }, (_, index) => (
              <path
                key={index}
                d={studioRoute}
                transform={`translate(${-30 + index * 7} ${180 + index * 6}) scale(1.3)`}
                fill="none"
                stroke="#fc4c02"
                opacity="0.1"
                strokeWidth="1"
              />
            ))}
          <rect
            width="393"
            height="698"
            fill="#080b11"
            opacity={background === "Workout photo" ? scrim / 100 : 0.1}
          />
          <rect width="393" height="698" fill="url(#posterdots)" />
          {mapOpacity > 0 && (
            <g opacity={mapOpacity / 100}>
              <image
                href="https://mt1.google.com/vt/lyrs=y&x=1471&y=949&z=11"
                x="0"
                y="0"
                width="393"
                height="698"
                preserveAspectRatio="xMidYMid slice"
                opacity="0.85"
              />
              <rect width="393" height="698" fill="#080b11" opacity="0.2" />
            </g>
          )}
          <text
            x="28"
            y="43"
            fill="#ccff00"
            fontFamily="Arial,sans-serif"
            fontSize="17"
            fontWeight="700"
          >
            kuchh bhii.
          </text>
          <text
            x="365"
            y="41"
            fill="#929ba9"
            fontFamily="monospace"
            fontSize="9"
            textAnchor="end"
          >
            01 OCT 2026
          </text>
          <rect
            x="24"
            y="72"
            width="345"
            height="140"
            rx="12"
            fill="#121826"
            fillOpacity="0.85"
            stroke="#ffffff18"
          />
          <text
            x="43"
            y="101"
            fill="#a1a9b5"
            fontFamily="monospace"
            fontSize="10"
          >
            MORNING MILES, CLEAR MIND.
          </text>
          <text
            x="43"
            y="150"
            fill="#ffffff"
            fontFamily="Arial,sans-serif"
            fontSize="42"
            fontWeight="800"
          >
            5.24
            <tspan fontSize="16" fill="#929ba9">
              {" "}
              km
            </tspan>
          </text>
          <text
            x="43"
            y="182"
            fill="#929ba9"
            fontFamily="monospace"
            fontSize="11"
          >
            4:37 /KM 24:12 +185 M
          </text>
          <rect
            x="242"
            y="123"
            width="104"
            height="25"
            rx="12"
            fill="#ffd70015"
            stroke="#ffd70055"
          />
          <text
            x="294"
            y="139"
            fill="#e9c959"
            fontFamily="monospace"
            fontSize="8"
            textAnchor="middle"
          >
            PB · 1K 3:52
          </text>
          <g transform="translate(0 209) scale(1.35)">
            <path
              d={studioRoute}
              fill="none"
              stroke="#fc4c02"
              strokeWidth="7"
              opacity="0.4"
              filter="url(#posterglow)"
            />
            <path
              d={studioRoute}
              fill="none"
              stroke="#fc4c02"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength="100"
              strokeDasharray={`${progress} 100`}
            />
            <circle cx="87" cy="146" r="4" fill="#ff8a50" />
          </g>
          <text
            x="196"
            y="545"
            textAnchor="middle"
            fill="#929ba9"
            fontFamily="monospace"
            fontSize="9"
          >
            CUBBON PARK · BENGALURU
          </text>
          <rect
            x="24"
            y="573"
            width="345"
            height="79"
            rx="10"
            fill="#151913"
            fillOpacity="0.9"
            stroke="#d5b34d44"
          />
          <text
            x="196"
            y="608"
            textAnchor="middle"
            fill="#e9dba7"
            fontFamily="Arial,sans-serif"
            fontSize="13"
            fontWeight="600"
          >
            {quote.length > 42 ? `${quote.slice(0, 42)}…` : quote}
          </text>
          <text
            x="196"
            y="631"
            textAnchor="middle"
            fill="#929ba9"
            fontFamily="Arial,sans-serif"
            fontSize="7"
          >
            Made with an intention of doing Kuchh Bhii by Sughosh 😉
          </text>
          <text
            x="196"
            y="676"
            textAnchor="middle"
            fill="#657080"
            fontFamily="monospace"
            fontSize="8"
            letterSpacing="3"
          >
            KUCHH BHII · INTENTION OVER EVERYTHING
          </text>
        </svg>
        <div className="mt-5 flex w-full max-w-[320px] items-center gap-3">
          <button
            aria-label={playing ? "Pause preview" : "Play preview"}
            onClick={() => {
              if (!playing && progress === 100) setProgress(0)
              setPlaying(!playing)
            }}
            className="text-primary"
          >
            {playing ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <input
            type="range"
            aria-label="Playback position"
            min="0"
            max="100"
            value={progress}
            onChange={(event) => setProgress(Number(event.target.value))}
            className="h-1 flex-1 accent-[#ccff00]"
          />
          <span className="font-mono text-[9px] text-muted-foreground">
            0:{String(Math.round(progress / 20)).padStart(2, "0")} / 0:05
          </span>
        </div>
      </section>
      <section className={`${panel} h-fit p-6 sm:p-8`}>
        <div className="flex items-center gap-2">
          <Sparkles size={17} className="text-primary" />
          <h2 className="font-display text-lg font-bold">Make it yours.</h2>
        </div>
        <div className="mt-7 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          01 / Background
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {["Dark canvas", "Route mesh", "Workout photo"].map((name) => (
            <button
              onClick={() => {
                setBackground(name)
                if (name === "Workout photo" && !photo)
                  photoInput.current?.click()
              }}
              key={name}
              className={`rounded-xl border px-3 py-5 text-[11px] ${
                background === name
                  ? "border-primary/40 bg-primary/5 text-primary"
                  : "border-border bg-background text-muted-foreground hover:border-white/25"
              }`}
            >
              {name === "Workout photo" && (
                <Upload size={13} className="mr-2 inline" />
              )}
              {name}
            </button>
          ))}
        </div>
        <input
          ref={photoInput}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
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
          <div className="mt-4">
            <label className="flex justify-between text-[10px] text-muted-foreground">
              Glass scrim <span>{scrim}%</span>
            </label>
            <input
              type="range"
              aria-label="Photo scrim opacity"
              min="10"
              max="90"
              value={scrim}
              onChange={(event) => setScrim(Number(event.target.value))}
              className="mt-3 w-full accent-[#ccff00]"
            />
            <button
              onClick={() => photoInput.current?.click()}
              className="mt-3 text-[10px] text-primary"
            >
              Change workout photo
            </button>
          </div>
        )}
        <div className="mt-6">
          <label
            className="flex items-center justify-between text-[10px] text-muted-foreground"
            htmlFor="studio-map-opacity"
          >
            Map layer opacity{" "}
            <span className="font-mono text-primary">{mapOpacity}%</span>
          </label>
          <input
            id="studio-map-opacity"
            type="range"
            min="0"
            max="100"
            value={mapOpacity}
            onChange={(event) => setMapOpacity(Number(event.target.value))}
            className="mt-3 w-full accent-[#ccff00]"
          />
        </div>
        <div className="mt-8 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          02 / Your intention
        </div>
        <label
          htmlFor="quote"
          className="mt-4 block text-[10px] text-muted-foreground"
        >
          A thought worth carrying with you.
        </label>
        <textarea
          id="quote"
          value={quote}
          maxLength={75}
          onChange={(event) => setQuote(event.target.value)}
          rows={3}
          className="mt-3 w-full resize-none rounded-xl border border-border bg-background p-4 text-xs leading-6 outline-none focus:border-primary/40"
        />
        <div className="mt-8 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          03 / Export quality
        </div>
        <div className="mt-4 flex gap-2">
          {["4K UHD", "1080p", "720p"].map((value) => (
            <button
              key={value}
              onClick={() => setResolution(value)}
              className={`flex-1 rounded-lg border py-3 font-mono text-[10px] ${
                resolution === value
                  ? "border-primary/40 bg-primary/5 text-primary"
                  : "border-border text-muted-foreground"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
        <button
          disabled={exporting}
          onClick={() => exportArt(true)}
          className="mt-7 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3.5 text-[11px] font-bold text-primary-foreground disabled:opacity-50"
        >
          <ArrowDownToLine size={15} />
          {exporting
            ? "Rendering your masterpiece…"
            : `Export ${resolution} video`}
        </button>
        <button
          disabled={exporting}
          onClick={() => exportArt(false)}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-border py-3 text-[10px] text-muted-foreground hover:text-white disabled:opacity-50"
        >
          <ArrowDownToLine size={13} />
          Download poster · PNG
        </button>
        <p className="mt-4 text-center text-[8px] leading-4 text-muted-foreground">
          5-second animated video · Browser-native export
          <br />
          Photorealistic Google Maps satellite layer & telemetry HUD.
        </p>
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
