import { useEffect, useId, useRef, useState, type RefObject } from "react"
import { Link, useNavigate, useSearchParams } from "react-router"
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Dumbbell,
  Flame,
  Hand,
  Layers,
  LockKeyhole,
  MapPin,
  Maximize2,
  MessageCircle,
  Minus,
  Navigation,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Satellite,
  Send,
  ShieldCheck,
  Sparkles,
    Trophy,
  Upload,
  Volume2,
  VolumeX,
  X,
  Zap,
  ZoomIn,
  ZoomOut,
} from "lucide-react"

const box = "rounded-2xl border border-white/10 bg-[#0e131b] shadow-xl shadow-black/40"
const yellowButton =
  "flex items-center justify-center gap-2 rounded-xl bg-dude px-5 py-3.5 text-xs font-bold text-[#181600] transition hover:bg-[#fff16a] disabled:opacity-40"
const pitchPhoto = "/media/night-pitch.jpg"
const runnerPhoto = "/media/track-runner.jpg"
const fieldPhoto = "/media/aerial-pitch.jpg"
export const studioTransfer = { photo: "", opacity: 65 }
interface GeoPoint {
  lat: number
  lng: number
}
interface DragOrigin {
  x: number
  y: number
  px: number
  py: number
}
interface SessionVolume {
  reps: number
  sets: number
  date?: string
  rpe?: number
}
function readSessionHistory(): SessionVolume[] {
  try {
    const history = JSON.parse(
      localStorage.getItem("dude-session-history") || "[]",
    )
    if (Array.isArray(history) && history.length) return history
    const last = JSON.parse(localStorage.getItem("dude-last-session") || "null")
    return last ? [last] : []
  } catch {
    return []
  }
}
type Pose = "push" | "plank" | "pull" | "squat" | "pistol" | "archer" | "flex" | "rest" | "wrist" | "windmill" | "shrug" | "catcow" | "highknees" | "diamond" | "pike"
interface Exercise {
  id: number
  name: string
  level: number
  category: "Push" | "Pull" | "Legs"
  volume: string
  page: number
  cues: string[]
  pose: Pose
  detail: string
  unlocked: boolean
}
const exercises: Exercise[] = [
  {
    id: 1,
    name: "Plank Hold",
    level: 1,
    category: "Push",
    volume: "3 sets × 30–45 sec",
    page: 12,
    cues: ["Rigid core", "Neutral neck"],
    pose: "plank",
    detail:
      "Place your elbows directly below your shoulders. Brace your abs and glutes, keep a straight line from head to heels, and breathe steadily.",
    unlocked: true,
  },
  {
    id: 2,
    name: "Standard Push-Ups",
    level: 4,
    category: "Push",
    volume: "3 sets × 10–15 reps",
    page: 20,
    cues: ["45° elbows", "Full lockout"],
    pose: "push",
    detail:
      "Start in a high plank, hands just wider than your shoulders. Lower your chest with elbows about 45° from your torso. Keep your core rigid and push the floor away.",
    unlocked: true,
  },
  {
    id: 3,
    name: "Strict Pull-Ups",
    level: 5,
    category: "Pull",
    volume: "4 sets × 6–10 reps",
    page: 34,
    cues: ["No swing", "Chin over bar"],
    pose: "pull",
    detail:
      "Begin from a controlled dead hang. Pull your shoulders down, drive your elbows toward your ribs, and bring your chin over the bar. Lower with control; do not kip.",
    unlocked: true,
  },
  {
    id: 4,
    name: "Deep Bodyweight Squats",
    level: 3,
    category: "Legs",
    volume: "3 sets × 15–20 reps",
    page: 48,
    cues: ["Heels grounded", "Knees track toes"],
    pose: "squat",
    detail:
      "Stand with your feet about shoulder-width apart. Brace, sit down between your hips, and keep your heels grounded. Stand tall by driving through your whole foot.",
    unlocked: true,
  },
  {
    id: 5,
    name: "Archer Push-Ups",
    level: 8,
    category: "Push",
    volume: "3 sets × 5–8 / side",
    page: 26,
    cues: ["Wide stance", "Controlled shift"],
    pose: "archer",
    detail:
      "Use a wide hand position. Shift your weight toward one hand as you lower, keeping the other arm nearly straight. Push back to center. Build control before adding repetitions.",
    unlocked: false,
  },
  {
    id: 6,
    name: "Pistol Squat",
    level: 8,
    category: "Legs",
    volume: "3 sets × 6–8 / leg",
    page: 56,
    cues: ["Stable ankle", "Slow descent"],
    pose: "pistol",
    detail:
      "Extend one leg in front of you. Lower slowly on the supporting leg, keeping its heel grounded and knee tracking your toes. Use a support or reduced range while building balance.",
    unlocked: false,
  },
  {
    id: 7,
    name: "One-Arm Push-Up",
    level: 10,
    category: "Push",
    volume: "3 sets × 3–5 / side",
    page: 30,
    cues: ["Anti-rotation", "Own the depth"],
    pose: "archer",
    detail:
      "Place one hand below your shoulder and use a wide foot stance. Resist torso rotation and lower under control. Practice elevated variations before attempting the floor version.",
    unlocked: false,
  },
  {
    id: 8,
    name: "L-Sit Pull-Up",
    level: 9,
    category: "Pull",
    volume: "3 sets × 4–6 reps",
    page: 42,
    cues: ["Legs horizontal", "Shoulders down"],
    pose: "pull",
    detail:
      "Hold your legs forward as you perform a controlled pull-up. Keep your shoulders away from your ears. Start with tucked knees if needed and progress gradually.",
    unlocked: false,
  },
]
const warmups = [
  "Wrist & forearm rotations",
  "Shoulder windmills",
  "Scapular shrugs",
  "Cat-cow waves",
  "Deep squat pry",
  "High knees",
]
const warmupPoses: Pose[] = [
  "wrist",
  "windmill",
  "shrug",
  "catcow",
  "squat",
  "highknees",
]

interface DudeProps {
  pose?: Pose
  className?: string
  faceOnly?: boolean
}
export function YellowDude({
  pose = "flex",
  className = "",
  faceOnly = false,
}: DudeProps) {
  const id = useId().replace(/:/g, "")
  const prone = [
    "push",
    "plank",
    "archer",
    "pike",
    "diamond",
    "catcow",
  ].includes(pose)
  const head =
    pose === "pike"
      ? [80, 131]
      : pose === "catcow"
        ? [70, 104]
        : prone
          ? [66, 84]
          : pose === "rest"
            ? [130, 79]
            : [150, 48]
  const limbs =
    pose === "pike"
      ? [
          "M119 105 L104 137 L96 170",
          "M164 83 L222 164 L243 164",
          "M158 84 L202 170 L218 170",
        ]
      : pose === "catcow"
        ? [
            "M108 117 L107 170",
            "M174 122 L205 146 L192 169",
            "M181 125 L218 147 L209 167",
          ]
        : pose === "wrist"
          ? [
              "M129 89 L111 120 L139 122",
              "M173 89 L188 120 L159 122",
              "M139 140 L126 185",
              "M164 141 L177 185",
            ]
          : pose === "windmill"
            ? [
                "M129 89 L93 83 L66 67",
                "M173 89 L199 65 L215 27",
                "M139 140 L126 185",
                "M164 141 L177 185",
              ]
            : pose === "shrug"
              ? [
                  "M128 84 L109 125",
                  "M174 84 L191 125",
                  "M139 140 L126 185",
                  "M164 141 L177 185",
                ]
              : pose === "highknees"
                ? [
                    "M129 89 L108 110 L87 90",
                    "M173 89 L195 76 L205 55",
                    "M139 141 L113 116 L110 155",
                    "M164 141 L177 185",
                  ]
                : prone
                  ? [
                      pose === "archer"
                        ? "M108 107 Q82 125 40 162"
                        : pose === "diamond"
                          ? "M105 109 L93 143 L119 169"
                          : pose === "plank"
                            ? "M106 109 L92 145 L61 161"
                            : "M105 109 L86 128 L95 166",
                      "M177 126 L224 146 L265 164",
                      "M178 119 L226 136 L276 151",
                    ]
                  : pose === "pull"
                    ? [
                        "M129 89 Q101 75 108 32",
                        "M169 90 Q195 76 189 32",
                        "M140 142 L129 177 L145 192",
                        "M160 142 L173 177 L158 192",
                      ]
                    : pose === "squat" || pose === "pistol"
                      ? [
                          "M128 91 L104 109 L83 83",
                          "M173 91 L199 109 L220 85",
                          "M137 135 L100 141 L116 184",
                          pose === "pistol"
                            ? "M167 132 L219 127 L263 126"
                            : "M165 135 L201 141 L186 184",
                        ]
                      : pose === "rest"
                        ? [
                            "M118 113 L93 139 L140 157",
                            "M156 109 L184 140 L164 157",
                            "M136 154 L197 161 L209 188",
                            "M137 158 L93 172 L73 189",
                          ]
                        : [
                            "M127 88 L103 108 L82 80 L84 61",
                            "M173 88 L197 105 L214 79 L209 61",
                            "M139 140 L126 185",
                            "M164 141 L177 185",
                          ]
  return (
    <svg
      viewBox={faceOnly ? "110 10 80 80" : "0 0 300 220"}
      className={className}
      role="img"
      aria-label={
        faceOnly
          ? "Yellow Dude smiling mascot"
          : `Yellow Dude demonstrating ${pose}`
      }
    >
      <defs>
        <pattern
          id={`dudedots-${id}`}
          width="14"
          height="14"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="1" cy="1" r="0.55" fill="#ffe600" opacity="0.13" />
        </pattern>
      </defs>
      {!faceOnly && (
        <>
          <rect width="300" height="220" fill={`url(#dudedots-${id})`} />
          <ellipse
            cx="153"
            cy="190"
            rx="106"
            ry="7"
            fill="#ffe600"
            opacity="0.07"
          />
          {pose === "pull" && (
            <>
              <path
                d="M65 28 H235"
                stroke="#737d8d"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <path d="M72 28V10M228 28V10" stroke="#737d8d" strokeWidth="4" />
            </>
          )}
          {limbs.map((path, index) => (
            <g key={index}>
              <path
                d={path}
                fill="none"
                stroke="#05070a"
                strokeWidth="23"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={path}
                fill="none"
                stroke="#ffe600"
                strokeWidth="15"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          ))}
          <path
            d={
              pose === "pike"
                ? "M88 116 L124 82 L157 61 L179 80 L143 108 L107 140 Z"
                : pose === "catcow"
                  ? "M93 105 Q122 80 160 105 L188 117 L174 138 Q126 107 96 129 Z"
                  : prone
                    ? "M92 96 Q116 94 139 106 L188 114 L181 137 L143 127 L98 121 Z"
                    : pose === "rest"
                      ? "M114 103 Q132 93 157 104 L172 148 L130 159 Z"
                      : "M125 84 Q151 72 175 85 L168 143 L133 143 Z"
            }
            fill="#ffe600"
            stroke="#05070a"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path
            d={
              pose === "pike"
                ? "M151 63 L176 72 L180 88 L160 99 L147 83 Z"
                : prone
                  ? "M163 111 L190 115 L183 139 L163 133 Z"
                  : pose === "rest"
                    ? "M129 144 L171 139 L178 159 L132 168 Z"
                    : "M132 132 L170 132 L173 151 L150 154 L130 151 Z"
            }
            fill="#252d39"
            stroke="#05070a"
            strokeWidth="4"
          />
          <path
            d={
              pose === "pike"
                ? "M114 113 L139 91 M116 103 L128 115"
                : prone
                  ? "M116 109 L148 118 M133 106 L132 121"
                  : "M148 100 L148 127 M136 108 L158 108 M137 120 L158 120"
            }
            fill="none"
            stroke="#9b8800"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {!prone && pose !== "rest" && (
            <>
              <path
                d="M110 190H131M172 190H194"
                stroke="#ffe600"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <path
                d="M55 80 L44 73 M66 56 L62 44 M236 55 L244 45"
                stroke="#ffe600"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.6"
              />
            </>
          )}
        </>
      )}
      <g
        transform={`translate(${head[0]} ${head[1]}) ${
          prone ? "rotate(-16)" : ""
        }`}
      >
        <path
          d="M-21 -7 Q-24 -31 0 -31 Q25 -30 24 -7 L21 10 Q13 25 0 25 Q-18 23 -21 8 Z"
          fill="#ffe600"
          stroke="#05070a"
          strokeWidth="4"
        />
        <path
          d="M-19 -9 Q0 -19 21 -8"
          fill="none"
          stroke="#baa500"
          strokeWidth="2"
        />
        <path
          d="M-15 -1 L-7 -3 M7 -3 L15 -1"
          stroke="#05070a"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <ellipse cx="-10" cy="4" rx="3.5" ry="5" fill="#fff9cf" />
        <ellipse cx="10" cy="4" rx="3.5" ry="5" fill="#fff9cf" />
        <circle cx="-9" cy="5" r="2" fill="#05070a" />
        <circle cx="9" cy="5" r="2" fill="#05070a" />
        <path
          d="M-7 14 Q0 21 8 13"
          fill="none"
          stroke="#05070a"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </g>
    </svg>
  )
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-dude">
      <span className="h-1.5 w-1.5 rounded-full bg-dude" />
      {children}
    </div>
  )
}
function PageTitle({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow: string
  title: React.ReactNode
  subtitle: string
  action?: React.ReactNode
}) {
  return (
    <div className="mb-7 flex items-end justify-between gap-4">
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-3 font-display text-[29px] font-extrabold leading-[1.2] sm:text-[36px]">
          {title}
        </h1>
        <p className="mt-3 max-w-lg text-[11px] leading-5 text-muted-foreground sm:text-xs">
          {subtitle}
        </p>
      </div>
      {action}
    </div>
  )
}

export function Playbook() {
  const navigate = useNavigate()
  const [category, setCategory] = useState("All progressions")
  const [reader, setReader] = useState<Exercise | null>(null)
  const [warmupStep, setWarmupStep] = useState(0)
  const [mastered, setMastered] = useState<number[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("dude-mastered") || "[1]")
    } catch {
      return [1]
    }
  })
  const filtered = exercises.filter(
    (exercise) =>
      category === "All progressions" ||
      category === `${exercise.category} ladder` ||
      (category === "Legs & pistol" && exercise.category === "Legs"),
  )
  function markMastered(id: number) {
    const next = mastered.includes(id)
      ? mastered.filter((value) => value !== id)
      : [...mastered, id]
    setMastered(next)
    localStorage.setItem("dude-mastered", JSON.stringify(next))
  }
  return (
    <>
      {/* 1. ATHLETIC HERO SPOTLIGHT CARD */}
      <section className="relative mb-6 overflow-hidden rounded-3xl border border-dude/25 bg-gradient-to-br from-[#1c1d0c] via-[#12161b] to-[#0a0d13] p-5 sm:p-7 shadow-2xl shadow-black/60">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-dude/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div className="max-w-md">
            <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border border-dude/30 bg-dude/10 px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-dude">
              <BookOpen size={11} />
              YELLOW DUDE CALISTHENICS PLAYBOOK
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-black text-white leading-tight">
              Build your body. <span className="text-dude">Own your game.</span>
            </h1>

            <p className="mt-2 text-xs text-muted-foreground leading-relaxed max-w-sm">
              Progressive bodyweight mastery. Strict form, zero machines. Push, pull, legs & core built for match-day armor.
            </p>

            <div className="mt-4 flex items-center gap-3 flex-wrap">
              <button
                onClick={() => navigate("/workout")}
                className="flex items-center gap-2 rounded-xl bg-dude px-4 py-2.5 text-xs font-black text-black shadow-[0_0_20px_#ffe60030] hover:bg-[#fff066] active:scale-95 transition cursor-pointer"
              >
                <Play size={13} fill="currentColor" />
                Start Push Combo <ArrowUpRight size={13} />
              </button>

              <Link
                to="/armor"
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-semibold text-white/80 hover:text-white hover:border-white/20 transition cursor-pointer"
              >
                <ShieldCheck size={14} className="text-primary" />
                Pitch Armor
              </Link>
            </div>
          </div>

          {/* Yellow Dude Mascot Showcase */}
          <div className="relative flex shrink-0 items-center justify-center self-center sm:self-auto h-36 w-36 sm:h-44 sm:w-44">
            <div className="absolute inset-2 rounded-full bg-dude/15 blur-xl" />
            <YellowDude
              pose="flex"
              className="relative h-full w-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]"
            />
            <span className="absolute -bottom-1 rotate-[-6deg] rounded-full border border-dude/40 bg-black/80 px-2 py-0.5 font-mono text-[8px] font-bold text-dude shadow">
              STRICT FORM ↗
            </span>
          </div>
        </div>
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_285px]">
        <div className="min-w-0">
          <div className="mb-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-base font-bold text-white">
                Progression Ladder
              </h2>
              <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[9px] font-bold text-dude">
                {category === "3-min warm-up"
                  ? "06"
                  : String(filtered.length).padStart(2, "0")}
              </span>
            </div>
            <span className="hidden items-center gap-1 text-[9px] text-muted-foreground sm:flex">
              <Sparkles size={12} className="text-dude" />
              Strength is earned rep by rep
            </span>
          </div>

          <div className="scrollbar-none mb-4 flex gap-2 overflow-x-auto pb-1">
            {[
              "All progressions",
              "Push ladder",
              "Pull ladder",
              "Legs & pistol",
              "3-min warm-up",
            ].map((label, index) => {
              const Icon = [Flame, Zap, Dumbbell, Activity, Clock3][index]
              const isSelected = category === label
              return (
                <button
                  key={label}
                  onClick={() => setCategory(label)}
                  aria-pressed={isSelected}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-[10px] font-bold transition cursor-pointer ${
                    isSelected
                      ? "border-dude bg-dude/15 text-dude shadow-sm shadow-dude/10"
                      : "border-white/10 bg-[#121620] text-muted-foreground hover:border-white/25 hover:text-white"
                  }`}
                >
                  <Icon size={12} />
                  {label}
                </button>
              )
            })}
          </div>

          {category !== "3-min warm-up" ? (
            <div className="grid gap-3 min-[1300px]:grid-cols-2">
              {filtered.map((exercise) => {
                const isMastered = mastered.includes(exercise.id)
                return (
                  <button
                    key={exercise.id}
                    onClick={() => setReader(exercise)}
                    className="group relative flex items-center gap-3.5 sm:gap-4 overflow-hidden rounded-2xl border border-white/10 bg-[#0e131b] p-3 sm:p-4 text-left transition-all hover:border-dude/40 hover:bg-[#131924] shadow-lg shadow-black/30 cursor-pointer"
                  >
                    {/* Visual Mascot Preview Box */}
                    <div className="relative flex h-20 w-20 sm:h-22 sm:w-22 shrink-0 items-center justify-center rounded-xl border border-white/5 bg-[#141b16] p-1.5 overflow-hidden group-hover:border-dude/30 transition">
                      <div className="absolute inset-0 bg-radial from-dude/10 to-transparent pointer-events-none" />
                      <YellowDude
                        pose={exercise.pose}
                        className="h-full w-full object-contain transition duration-300 group-hover:scale-110"
                      />
                      <span className="absolute left-1.5 top-1.5 flex items-center gap-0.5 rounded border border-[#38bdf8]/30 bg-[#0d1620]/90 px-1 py-0.5 text-[7px] font-bold text-[#7dd3fc]">
                        P.{exercise.page}
                      </span>
                      {isMastered && (
                        <span className="absolute bottom-1.5 right-1.5 rounded-full bg-dude p-0.5 text-black shadow">
                          <Check size={9} strokeWidth={3} />
                        </span>
                      )}
                    </div>

                    {/* Content Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider ${
                            exercise.unlocked ? "text-dude" : "text-muted-foreground"
                          }`}
                        >
                          LEVEL {String(exercise.level).padStart(2, "0")} · {exercise.category}
                        </span>
                        <ArrowUpRight
                          size={14}
                          className="shrink-0 text-muted-foreground transition group-hover:text-dude group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        />
                      </div>

                      <h3 className="mt-0.5 font-display text-[15px] sm:text-base font-extrabold text-white truncate tracking-tight">
                        {exercise.name}
                      </h3>

                      <p className="mt-1 font-mono text-[10px] sm:text-[11px] font-semibold text-[#b8c2cc]">
                        {exercise.volume} <span className="text-muted-foreground/70 font-normal">· 60s rest</span>
                      </p>

                      <div className="mt-2 flex flex-wrap gap-1">
                        {exercise.cues.slice(0, 2).map((cue) => (
                          <span
                            key={cue}
                            className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[8px] font-medium text-white/80"
                          >
                            {cue}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <section className={`${box} p-5 sm:p-7`}>
              <div className="mb-4 flex items-center justify-between">
                <span className="font-mono text-[9px] text-dude">
                  {String(warmupStep + 1).padStart(2, "0")} / 06
                </span>
                <span className="text-[9px] text-muted-foreground">
                  30 SECONDS EACH · 3 MIN TOTAL
                </span>
              </div>
              <YellowDude
                pose={warmupPoses[warmupStep]}
                className="mx-auto h-52 w-full max-w-sm"
              />
              <div className="mt-2 flex items-center justify-between">
                <button
                  onClick={() => setWarmupStep((warmupStep + 5) % 6)}
                  aria-label="Previous warm-up"
                  className="rounded-full border border-border p-2.5"
                >
                  <ChevronLeft size={16} />
                </button>
                <h3 className="mx-3 text-center font-display text-base font-bold">
                  {warmups[warmupStep]}
                </h3>
                <button
                  onClick={() => setWarmupStep((warmupStep + 1) % 6)}
                  aria-label="Next warm-up"
                  className="rounded-full border border-border p-2.5"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
              <div className="mt-5 flex justify-center gap-1.5">
                {warmups.map((name, index) => (
                  <button
                    key={name}
                    aria-label={name}
                    onClick={() => setWarmupStep(index)}
                    className={`h-1.5 rounded-full transition ${
                      warmupStep === index ? "w-6 bg-dude" : "w-1.5 bg-white/20"
                    }`}
                  />
                ))}
              </div>
              <Link
                to="/workout?mode=warmup"
                className={`${yellowButton} mt-7`}
              >
                <Play size={14} />
                Start guided 3-minute warm-up
              </Link>
              <p className="mt-3 text-center text-[8px] text-muted-foreground">
                Voice coaching available · No equipment needed
              </p>
            </section>
          )}
          <p className="mt-6 flex items-center justify-center gap-2 text-[8px] text-[#737d8c]">
            <span className="h-px w-8 bg-border" />
            Technique over ego. Always.
            <span className="h-px w-8 bg-border" />
          </p>
        </div>
        <aside className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
          <section className={`${box} p-5`}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 overflow-hidden rounded-full border border-dude/30 bg-dude/10">
                <YellowDude faceOnly className="h-full w-full" />
              </div>
              <div>
                <h3 className="text-[12px] font-semibold">Hey, Sughosh.</h3>
                <p className="mt-1 text-[9px] text-muted-foreground">
                  Your coach. Your hype dude.
                </p>
              </div>
            </div>
            <p className="mt-5 font-display text-[15px] font-semibold leading-6">
              “You don’t need to be great
              <br />
              to start. Just <span className="text-dude">start.</span>”
            </p>
            <div className="mt-5 border-t border-border pt-4">
              <div className="flex items-center justify-between text-[9px]">
                <span className="text-muted-foreground">
                  Your playbook mastery
                </span>
                <span className="font-mono text-dude">
                  {mastered.length} / {exercises.length}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-8 gap-1">
                {exercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className={`h-1.5 rounded ${
                      mastered.includes(exercise.id) ? "bg-dude" : "bg-white/7"
                    }`}
                  />
                ))}
              </div>
              <p className="mt-3 text-[9px] leading-5 text-muted-foreground">
                Open a movement, learn the cues, and mark it mastered when your
                form is ready.
              </p>
            </div>
          </section>
          <section className="overflow-hidden rounded-2xl border border-primary/15 bg-linear-to-br from-primary/5 to-card p-5">
            <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-wider text-primary">
              <ShieldCheck size={14} />
              From reps to resilience
            </div>
            <h3 className="mt-4 font-display text-[17px] font-bold">
              Build your pitch armor.
            </h3>
            <div className="mt-5 flex items-baseline gap-1">
              <span className="font-display text-4xl font-extrabold">92</span>
              <span className="text-sm text-muted-foreground">%</span>
              <span className="ml-auto rounded-full bg-primary/8 px-2 py-1 text-[7px] font-semibold text-primary">
                MATCH READY
              </span>
            </div>
            <p className="mt-3 text-[9px] leading-5 text-muted-foreground">
              Every controlled rep is an investment in your next duel, sprint,
              and cut.
            </p>
            <Link
              to="/armor"
              className="mt-5 flex items-center justify-between rounded-lg border border-primary/20 px-3 py-3 text-[9px] font-semibold text-primary"
            >
              Open pitch armor <ArrowRight size={12} />
            </Link>
          </section>
          <section className={`${box} p-5`}>
            <div className="flex items-center justify-between">
              <h3 className="text-[12px] font-semibold">
                Before you go all in
              </h3>
              <Clock3 size={14} className="text-dude" />
            </div>
            <p className="mt-3 text-[10px] leading-5 text-muted-foreground">
              6 movements. 30 seconds each.
              <br />
              Warm joints. Better reps.
            </p>
            <div className="my-3 flex h-24 items-center">
              <YellowDude pose="squat" className="h-full w-1/2" />
              <div>
                <div className="font-display text-xl font-bold">03:00</div>
                <div className="mt-1 text-[8px] text-dude">
                  YOUR BODY WILL THANK YOU.
                </div>
              </div>
            </div>
            <Link
              to="/workout?mode=warmup"
              className={`${yellowButton} w-full !py-3 !text-[10px]`}
            >
              <Play size={12} fill="currentColor" />
              Get warm. Get moving.
            </Link>
          </section>
        </aside>
      </div>
      {reader && (
        <PlaybookReader
          exercise={reader}
          close={() => setReader(null)}
          mastered={mastered.includes(reader.id)}
          master={() => markMastered(reader.id)}
        />
      )}
    </>
  )
}

function PlaybookReader({
  exercise,
  close,
  mastered,
  master,
}: {
  exercise: Exercise
  close: () => void
  mastered: boolean
  master: () => void
}) {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const drag = useRef<DragOrigin | null>(null)
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    ref.current?.showModal()
    const old = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = old
    }
  }, [])
  return (
    <dialog
      ref={ref}
      onCancel={close}
      className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none border-0 bg-background p-0 text-foreground backdrop:bg-black/80"
    >
      <div className="mx-auto flex h-full max-w-3xl flex-col">
        <header className="flex shrink-0 items-center justify-between border-b border-border px-5 py-5">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-dude" />
            <span className="text-xs font-semibold">
              Yellow Dude · Page {exercise.page}
            </span>
          </div>
          <button
            onClick={close}
            aria-label="Close playbook reader"
            className="rounded-full bg-white/5 p-2"
          >
            <X size={18} />
          </button>
        </header>
        <div className="scrollbar-none flex-1 overflow-y-auto p-5 sm:p-8">
          <Eyebrow>
            LEVEL {exercise.level} · {exercise.category.toUpperCase()} LADDER
          </Eyebrow>
          <h2 className="mt-3 font-display text-2xl font-bold">
            {exercise.name}
          </h2>
          <div
            className="relative my-6 overflow-hidden rounded-2xl border border-dude/15 bg-[#141a13] touch-none"
            onPointerDown={(event) => {
              if ((event.target as Element).closest("button")) return
              drag.current = {
                x: event.clientX,
                y: event.clientY,
                px: pan.x,
                py: pan.y,
              }
              event.currentTarget.setPointerCapture(event.pointerId)
            }}
            onPointerMove={(event) => {
              if (drag.current && zoom > 1)
                setPan({
                  x: drag.current.px + event.clientX - drag.current.x,
                  y: drag.current.py + event.clientY - drag.current.y,
                })
            }}
            onPointerUp={() => {
              drag.current = null
            }}
          >
            <div
              className="origin-center transition-transform duration-100 motion-reduce:transition-none"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              }}
            >
              <YellowDude
                pose={exercise.pose}
                className="mx-auto h-64 w-full sm:h-80"
              />
            </div>
            <div className="absolute bottom-3 right-3 flex items-center gap-3 rounded-full border border-border bg-background/90 px-3 py-2">
              <button
                aria-label="Zoom out"
                onClick={() => {
                  setZoom(Math.max(1, zoom - 0.25))
                  setPan({ x: 0, y: 0 })
                }}
              >
                <ZoomOut size={14} />
              </button>
              <span className="font-mono text-[9px]">
                {Math.round(zoom * 100)}%
              </span>
              <button
                aria-label="Zoom in"
                onClick={() => setZoom(Math.min(3, zoom + 0.25))}
              >
                <ZoomIn size={14} />
              </button>
              <button
                aria-label="Reset zoom"
                onClick={() => {
                  setZoom(1)
                  setPan({ x: 0, y: 0 })
                }}
              >
                <RotateCcw size={12} />
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {exercise.cues.map((cue) => (
              <span
                key={cue}
                className="rounded-full border border-dude/25 bg-dude/5 px-3 py-2 text-[10px] text-dude"
              >
                {cue}
              </span>
            ))}
          </div>
          <h3 className="mt-6 text-sm font-semibold">
            Make every rep a good rep.
          </h3>
          <p className="mt-3 text-xs leading-6 text-muted-foreground">
            {exercise.detail}
          </p>
          <div className="mt-6 rounded-xl border border-border p-4">
            <div className="text-[9px] uppercase tracking-widest text-muted-foreground">
              Your target volume
            </div>
            <div className="mt-2 font-display text-lg font-bold">
              {exercise.volume}
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">
              Rest 60s between sets. Stop if you feel pain.
            </p>
          </div>
          <p className="mt-5 text-[8px] text-muted-foreground">
            Original movement illustration · Editorial page numbering, not a
            source-book scan.
          </p>
        </div>
        <div className="grid shrink-0 grid-cols-2 gap-3 border-t border-border p-5">
          <button
            onClick={master}
            className="flex items-center justify-center gap-2 rounded-xl border border-dude/30 px-2 py-3 text-[10px] font-semibold text-dude"
          >
            <Check size={13} />
            {mastered ? "Mastered ✓" : "Mark mastered"}
          </button>
          <Link
            to={`/workout?exercise=${exercise.id}`}
            className={`${yellowButton} !px-2 !text-[10px]`}
          >
            <Play size={13} />
            Practice this move
          </Link>
        </div>
      </div>
    </dialog>
  )
}

function clock(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`
}
function useOverlayFocus(
  active: boolean,
  ref: RefObject<HTMLDivElement | null>,
  close: () => void,
) {
  useEffect(() => {
    if (!active) return
    const previous = document.activeElement as HTMLElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    ref.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close()
      if (event.key !== "Tab") return
      const focusable = ref.current?.querySelectorAll<HTMLElement>(
        "button:not(:disabled), input, select, a[href]",
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
      } else if (
        !event.shiftKey &&
        (document.activeElement === last ||
          document.activeElement === ref.current)
      ) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", onKey)
      previous?.focus()
    }
  }, [active, ref])
}
export function WorkoutPlayer() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const warmup = params.get("mode") === "warmup"
  const chosen = exercises.find(
    (exercise) => exercise.id === Number(params.get("exercise")),
  )
  const routine = chosen
    ? [chosen]
    : [
        exercises[1],
        {
          ...exercises[1],
          name: "Diamond Push-Ups",
          pose: "diamond" as Pose,
          cues: ["Hands together", "Core rigid"],
        },
        {
          ...exercises[1],
          name: "Pike Push-Ups",
          pose: "pike" as Pose,
          cues: ["Hips high", "Head between hands"],
        },
        exercises[4],
        exercises[0],
      ]
  const [index, setIndex] = useState(0)
  const [set, setSet] = useState(1)
  const [reps, setReps] = useState(15)
  const [audio, setAudio] = useState(false)
  const [running, setRunning] = useState(false)
  const [remaining, setRemaining] = useState(warmup ? 30 : 45)
  const [rest, setRest] = useState<number | null>(null)
  const [restTotal, setRestTotal] = useState(60)
  const [rpe, setRpe] = useState(8)
  const [finished, setFinished] = useState(false)
  const [totalReps, setTotalReps] = useState(0)
  const [setsDone, setSetsDone] = useState(0)
  const restOverlay = useRef<HTMLDivElement>(null)
  useOverlayFocus(rest !== null, restOverlay, advanceSet)
  const current = routine[Math.min(index, routine.length - 1)]
  const name = warmup ? warmups[Math.min(index, 5)] : current.name
  const duration = warmup || current.pose === "plank"
  const cue = warmup
    ? "Move gently, breathe steadily. You’re preparing, not performing."
    : current.detail
  function speak(text: string) {
    if (audio && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(text))
    }
  }
  function endWorkout() {
    setRunning(false)
    setFinished(true)
    if (!warmup) {
      const entry = {
        reps: totalReps,
        sets: setsDone,
        rpe,
        date: new Date().toISOString(),
      }
      const history = readSessionHistory()
      localStorage.setItem(
        "dude-session-history",
        JSON.stringify([...history, entry]),
      )
      localStorage.setItem("dude-last-session", JSON.stringify(entry))
    }
  }
  function nextExercise() {
    if (index + 1 >= (warmup ? 6 : routine.length)) {
      endWorkout()
      return
    }
    setIndex(index + 1)
    setSet(1)
    setReps(15)
    setRemaining(warmup ? 30 : 45)
  }
  function advanceSet() {
    setRest(null)
    setRestTotal(60)
    if (set < 4 && !warmup) setSet(set + 1)
    else nextExercise()
    setRemaining(warmup ? 30 : 45)
    setRunning(warmup)
  }
  useEffect(() => {
    if (audio)
      speak(
        `${name}. ${
          warmup ? "Thirty seconds." : `Set ${set}.`
        } ${current.cues.join(". ")}`,
      )
    return () => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel()
    }
  }, [index, set, audio])
  useEffect(() => {
    if (!running || !duration || rest !== null || finished) return
    const timer = setInterval(
      () => setRemaining((value) => Math.max(0, value - 1)),
      1000,
    )
    return () => clearInterval(timer)
  }, [running, duration, rest, finished])
  useEffect(() => {
    if (remaining === 0 && running && !finished) {
      if (warmup) {
        speak("Next movement.")
        nextExercise()
      } else {
        setRunning(false)
        setSetsDone((value) => value + 1)
        setRest(60)
        speak("Set complete. Rest for sixty seconds.")
      }
    }
  }, [remaining])
  useEffect(() => {
    if (rest === null) return
    const timer = setInterval(
      () =>
        setRest((value) => (value === null ? null : Math.max(0, value - 1))),
      1000,
    )
    return () => clearInterval(timer)
  }, [rest !== null])
  useEffect(() => {
    if (rest === 0) {
      speak("Rest complete. Let’s go.")
      advanceSet()
    }
  }, [rest])
  if (finished)
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 pt-safe pb-safe text-center">
        <div className="rounded-full bg-dude/10 p-5">
          <Trophy size={35} className="text-dude" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-extrabold">
          Work done. <span className="text-dude">Armor built.</span>
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          {warmup
            ? "Six movements. Your body is ready."
            : `${setsDone} sets completed · ${totalReps} reps logged · RPE ${rpe}/10`}
        </p>
        <YellowDude className="my-5 h-52 w-72" />
        <Link to="/armor" className={yellowButton}>
          See your pitch armor <ArrowRight size={15} />
        </Link>
        <Link to="/playbook" className="mt-5 text-xs text-muted-foreground">
          Back to the playbook
        </Link>
      </div>
    )
  return (
    <div className="min-h-dvh bg-background text-foreground pt-safe pb-safe">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-10">
        <header className="flex items-center justify-between">
          <button
            onClick={() => navigate("/playbook")}
            aria-label="Exit workout"
            className="rounded-full border border-border p-2.5"
          >
            <ArrowLeft size={17} />
          </button>
          <div className="mx-3 text-center">
            <div className="text-[8px] uppercase tracking-[0.13em] text-dude">
              {warmup
                ? "3-minute dynamic warm-up"
                : "Upper body push armor combo"}
            </div>
            <div className="mt-1.5 font-mono text-[9px] text-muted-foreground">
              Exercise {index + 1} of {warmup ? 6 : routine.length}
              {!warmup && ` · Set ${set} of 4`}
            </div>
          </div>
          <button
            onClick={() => setAudio(!audio)}
            aria-label={audio ? "Disable voice coach" : "Enable voice coach"}
            aria-pressed={audio}
            className={`rounded-full border p-2.5 ${
              audio
                ? "border-dude/40 bg-dude/5 text-dude"
                : "border-border text-muted-foreground"
            }`}
          >
            {audio ? <Volume2 size={17} /> : <VolumeX size={17} />}
          </button>
        </header>
        <div className="mt-6 flex gap-1.5">
          {Array.from({ length: warmup ? 6 : routine.length }, (_, step) => (
            <div
              key={step}
              className={`h-1 flex-1 rounded-full ${
                step <= index ? "bg-dude" : "bg-white/10"
              }`}
            />
          ))}
        </div>
        <div className="mt-8 grid items-center gap-7 md:grid-cols-2">
          <section className="relative overflow-hidden rounded-3xl border border-dude/15 bg-[#141a13] p-5">
            <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full border border-dude/10 bg-dude/3 motion-reduce:animate-none" />
            <YellowDude
              pose={warmup ? warmupPoses[index] : current.pose}
              className="relative mx-auto h-[220px] w-full sm:h-[320px]"
            />
            <div className="text-center text-[8px] uppercase tracking-widest text-dude">
              Your form comes first.
            </div>
          </section>
          <section className="text-center">
            <h1 className="font-display text-[25px] font-extrabold">{name}</h1>
            <div className="mt-7 flex items-center justify-center gap-7">
              {!duration && (
                <button
                  aria-label="Decrease reps"
                  onClick={() => setReps(Math.max(1, reps - 1))}
                  className="rounded-full border border-border p-3"
                >
                  <Minus size={20} />
                </button>
              )}
              <div>
                <div className="font-display text-7xl font-extrabold tabular-nums sm:text-8xl">
                  {duration ? clock(remaining) : reps}
                </div>
                <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {duration ? "Seconds remaining" : "Strict reps"}
                </div>
              </div>
              {!duration && (
                <button
                  aria-label="Increase reps"
                  onClick={() => setReps(Math.min(200, reps + 1))}
                  className="rounded-full border border-dude/35 bg-dude/5 p-3 text-dude"
                >
                  <Plus size={20} />
                </button>
              )}
            </div>
            <div className="mt-6 rounded-xl border border-dude/15 bg-dude/4 p-4 text-[11px] leading-6 text-[#d2d5bf]">
              “{cue}”
            </div>
            {duration ? (
              <button
                onClick={() => setRunning(!running)}
                className={`${yellowButton} mt-6 w-full`}
              >
                {running ? <Pause size={16} /> : <Play size={16} />}{" "}
                {running ? "Pause timer" : "Start timer"}
              </button>
            ) : (
              <button
                onClick={() => {
                  setTotalReps(totalReps + reps)
                  setSetsDone(setsDone + 1)
                  setRest(60)
                  speak("Nice work. Take sixty seconds to recover.")
                }}
                className={`${yellowButton} mt-6 w-full`}
              >
                <Check size={16} />
                Complete set · {reps} reps
              </button>
            )}
            <p className="mt-4 text-[8px] text-muted-foreground">
              {audio
                ? "VOICE COACH ON · BROWSER SPEECH"
                : "VOICE COACH OFF · TAP THE SPEAKER TO ENABLE"}
            </p>
          </section>
        </div>
      </div>
      {rest !== null && (
        <div
          ref={restOverlay}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label="Rest between sets"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/98 px-6 backdrop-blur-xl"
        >
          <Eyebrow>GOOD WORK. TAKE A BREATH.</Eyebrow>
          <div className="relative mt-8 h-60 w-60">
            <svg viewBox="0 0 220 220" className="h-full w-full -rotate-90">
              <circle
                cx="110"
                cy="110"
                r="99"
                fill="none"
                stroke="#ffffff10"
                strokeWidth="5"
              />
              <circle
                cx="110"
                cy="110"
                r="99"
                fill="none"
                stroke="#ffe600"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={`${(Math.max(0, rest) / restTotal) * 622} 622`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-5xl font-extrabold tabular-nums">
                {clock(rest)}
              </span>
              <span className="mt-3 text-[9px] uppercase tracking-widest text-muted-foreground">
                Recovery time
              </span>
            </div>
          </div>
          <YellowDude pose="rest" className="h-36 w-52" />
          <label className="my-4 flex items-center gap-4 text-xs text-muted-foreground">
            How hard was that set?
            <select
              value={rpe}
              onChange={(event) => setRpe(Number(event.target.value))}
              aria-label="Log RPE"
              className="rounded-lg border border-border bg-card p-2 text-dude"
            >
              {Array.from({ length: 10 }, (_, value) => (
                <option key={value} value={value + 1}>
                  RPE {value + 1}/10
                </option>
              ))}
            </select>
          </label>
          <div className="flex w-full max-w-sm gap-3">
            <button
              onClick={() => {
                setRest(rest + 30)
                setRestTotal(restTotal + 30)
              }}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border py-3 text-xs"
            >
              <Plus size={13} />
              30s rest
            </button>
            <button
              onClick={advanceSet}
              className={`${yellowButton} flex-1 !px-3`}
            >
              Skip rest
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function Armor() {
  const [last] = useState<SessionVolume | null>(() => {
    const today = new Date().toDateString()
    const sessions = readSessionHistory().filter(
      (entry) => entry.date && new Date(entry.date).toDateString() === today,
    )
    return sessions.length
      ? sessions.reduce(
          (total, entry) => ({
            reps: total.reps + entry.reps,
            sets: total.sets + entry.sets,
          }),
          { reps: 0, sets: 0 },
        )
      : null
  })
  return (
    <>
      <PageTitle
        eyebrow="CALISTHENICS × FOOTBALL"
        title={
          <>
            Built in reps.{" "}
            <span className="text-primary">Proven on the pitch.</span>
          </>
        }
        subtitle="Your bodyweight work, translated into match-day resilience."
        action={
          <Link
            to="/football"
            className="hidden items-center gap-2 rounded-xl border border-primary/25 px-4 py-3 text-[11px] font-semibold text-primary sm:flex"
          >
            Football cockpit
            <ArrowUpRight size={14} />
          </Link>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className={`${box} p-6 sm:p-8`}>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">
              Pitch Armor Index
            </h2>
            <ShieldCheck size={20} className="text-primary" />
          </div>
          <div className="relative mx-auto my-7 h-60 w-60">
            <svg viewBox="0 0 240 240" className="h-full w-full -rotate-90">
              <defs>
                <linearGradient id="armor-gradient">
                  <stop stopColor="#56e9bc" />
                  <stop offset="1" stopColor="#ccff00" />
                </linearGradient>
              </defs>
              <circle
                cx="120"
                cy="120"
                r="103"
                fill="none"
                stroke="#ccff0015"
                strokeWidth="10"
              />
              <circle
                cx="120"
                cy="120"
                r="103"
                fill="none"
                stroke="url(#armor-gradient)"
                strokeWidth="10"
                strokeDasharray="595 647"
                strokeLinecap="round"
              />
              <circle
                cx="120"
                cy="120"
                r="85"
                fill="none"
                stroke="#ffffff10"
                strokeDasharray="1 8"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <ShieldCheck size={22} className="mb-3 text-primary" />
              <div className="font-display text-6xl font-extrabold">
                92<span className="text-xl text-muted-foreground">%</span>
              </div>
              <span className="mt-2 text-[9px] font-semibold uppercase tracking-widest text-primary">
                Built to withstand.
              </span>
            </div>
          </div>
          <div className="space-y-5">
            {[
              ["Core rigidity", "95", "Resisting shoulder duels", "w-[95%]"],
              [
                "Hamstring elasticity",
                "88",
                "Supporting sprint durability",
                "w-[88%]",
              ],
              [
                "Single-leg stability",
                "93",
                "Cutting & deceleration power",
                "w-[93%]",
              ],
            ].map(([name, value, description, width]) => (
              <div key={name}>
                <div className="flex justify-between text-xs">
                  <span>{name}</span>
                  <span className="font-mono text-primary">{value}%</span>
                </div>
                <div className="my-2 h-1.5 overflow-hidden rounded-full bg-white/5">
                  <div
                    className={`h-full rounded-full bg-primary/70 ${width}`}
                  />
                </div>
                <span className="text-[9px] text-muted-foreground">
                  {description}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-6 text-[8px] leading-4 text-muted-foreground">
            Illustrative training index, not a medical assessment or injury-risk
            prediction.
          </p>
        </section>
        <div className="space-y-6">
          <section className={`${box} p-6`}>
            <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-widest text-dude">
              <Dumbbell size={15} />
              Today’s armor load
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                [String(last?.reps ?? 180), "TOTAL REPS"],
                [String(last?.sets ?? 12), "WORKING SETS"],
                [
                  last
                    ? Math.round((last.reps * 80) / 3).toLocaleString()
                    : "4,800",
                  "KG EQUIVALENT",
                ],
              ].map(([value, label]) => (
                <div key={label}>
                  <div className="font-display text-xl font-extrabold sm:text-2xl">
                    {value}
                  </div>
                  <span className="mt-2 block text-[7px] text-muted-foreground">
                    {label}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center gap-3 rounded-xl bg-dude/4 p-4">
              <YellowDude faceOnly className="h-10 w-10 shrink-0" />
              <p className="text-[10px] leading-5 text-[#c8ccb6]">
                “You built the engine.
                <br />
                Now reinforce the chassis.”
              </p>
            </div>
            <p className="mt-3 text-[8px] text-muted-foreground">
              Equivalent volume is a sample bodyweight-load estimate.
            </p>
          </section>
          <section className={`${box} p-6`}>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold">
                The trophy wall
              </h2>
              <Trophy size={17} className="text-[#ffd700]" />
            </div>
            {[
              ["16", "Max strict pull-ups", "REPS", "#ffd700"],
              ["100", "Century pushup club", "UNDER 5 MIN", "#cbd5e1"],
              ["12", "Pistol squat balance", "PER LEG", "#c38c58"],
            ].map(([value, name, unit, color]) => (
              <div
                key={name}
                className="mt-5 flex items-center gap-4 border-t border-border pt-5"
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/3"
                  style={{ color }}
                >
                  <Trophy size={20} />
                </div>
                <div>
                  <h3 className="text-[11px] font-semibold">{name}</h3>
                  <p className="mt-1 text-[8px] text-muted-foreground">
                    ALL-TIME PERSONAL BEST
                  </p>
                </div>
                <div className="ml-auto text-right">
                  <div
                    className="font-display text-xl font-bold"
                    style={{ color }}
                  >
                    {value}
                  </div>
                  <div className="mt-1 font-mono text-[7px] text-muted-foreground">
                    {unit}
                  </div>
                </div>
              </div>
            ))}
          </section>
          <Link to="/workout" className={`${yellowButton} w-full`}>
            <Play size={15} />
            Add another layer of armor
          </Link>
        </div>
      </div>
    </>
  )
}

export interface CommunityProps {
  toast: (message: string) => void
  posts?: import("../types").StravaActivityPost[]
  currentProfile?: import("../types").UserProfile
  onLikePost?: (id: string) => void
  onAddComment?: (postId: string, text: string) => void
  onOpenFlyby?: (act: import("../types").GpsActivityLog) => void
  onOpenSocialShare?: (post: import("../types").StravaActivityPost) => void
  onSelectDetail?: (post: import("../types").StravaActivityPost) => void
  onOpenCreatePost?: () => void
}

export function Community({
  toast,
  posts: realPosts,
  currentProfile = "men",
  onLikePost,
  onAddComment,
  onOpenFlyby,
  onOpenSocialShare,
  onSelectDetail: _onSelectDetail,
  onOpenCreatePost,
}: CommunityProps) {
  const navigate = useNavigate()
  const [filter, setFilter] = useState("Community Feed")
  const [liked, setLiked] = useState<(number | string)[]>([])
  const [drawer, setDrawer] = useState<number | string | null>(null)
  const [comment, setComment] = useState("")
  const [comments, setComments] = useState<Record<string | number, string[]>>({
    1: [
      "Shreya: That’s a serious morning. 🔥",
      "Arjun: The push combo after a 5K? Built different.",
    ],
    2: ["Sughosh: Those last few kilometers looked effortless!"],
  })
    const [zoom, setZoom] = useState<string | null>(null)
  const [video, setVideo] = useState("")
          const input = useRef<HTMLInputElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  useOverlayFocus(drawer !== null || zoom !== null, overlayRef, () => {
    setDrawer(null)
    setZoom(null)
  })
  useEffect(
    () => () => {
      if (video) URL.revokeObjectURL(video)
    },
    [video],
  )

  const hasRealPosts = realPosts && realPosts.length > 0
  const activeRealPosts = hasRealPosts
    ? filter === "Your activity"
      ? realPosts.filter((p) => p.userId === currentProfile)
      : realPosts
    : []

  const demoPosts =
    filter === "Your activity" ? [1] : filter === "Following" ? [1, 2] : [2, 1]

  const activeDrawerPost = hasRealPosts
    ? realPosts.find((p) => p.id === drawer)
    : null

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-dude flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-dude animate-pulse" />
            GOOD ENERGY · GREAT COMPANY
          </div>
          <h1 className="font-display text-2xl font-extrabold sm:text-3xl text-white">
            Better, <span className="text-dude">together.</span>
          </h1>
          <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
            The miles, the matches, the small wins. 64 restored photo & video activities synced with Cloud Firestore.
          </p>
        </div>
        {onOpenCreatePost && (
          <button
            onClick={onOpenCreatePost}
            className="self-start sm:self-auto flex items-center gap-2 rounded-xl bg-dude px-4 py-2.5 text-xs font-bold text-[#181600] shadow-[0_0_24px_#ffe60025] transition hover:bg-[#fff066] active:scale-95"
          >
            <Plus size={15} />
            Share activity
          </button>
        )}
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_285px]">
        <div>
          <div className="mb-5 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              hasRealPosts ? "Community Feed" : "Following",
              "Discover",
              "Your activity",
            ].map((name) => (
              <button
                key={name}
                onClick={() => setFilter(name)}
                aria-pressed={filter === name}
                className={`rounded-full border px-4 py-2 text-[10px] font-semibold transition shrink-0 ${
                  filter === name
                    ? "border-dude bg-dude/10 text-dude shadow-sm"
                    : "border-white/10 bg-white/5 text-muted-foreground hover:text-white hover:border-white/20"
                }`}
              >
                {name}
              </button>
            ))}
          </div>

          <div className="space-y-5">
            {hasRealPosts && activeRealPosts.length > 0 ? (
              activeRealPosts.map((post) => {
                const isWomen = post.userId === "women"
                const isLiked = post.isLiked || liked.includes(post.id)
                const hasVideo = post.videoUrls && post.videoUrls.length > 0
                const hasPhotos = post.photos && post.photos.length > 0
                const displayPhoto = post.customMediaUrl || post.photos?.[0] || runnerPhoto

                return (
                  <article key={post.id} className="rounded-2xl border border-white/10 bg-[#0e131b] shadow-xl shadow-black/40 overflow-hidden hover:border-white/20 transition-all">
                    <header className="flex items-center gap-3 p-4 sm:p-5 pb-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-xs font-bold ${
                          isWomen
                            ? "border border-pink-400/40 bg-gradient-to-br from-purple-700 via-pink-600 to-rose-700 text-white"
                            : "border border-[#d5b389]/40 bg-linear-to-br from-[#b89d78] via-[#60543c] to-[#242d26] text-[#f1e5d0]"
                        }`}
                      >
                        {isWomen ? "SH" : "SD"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="text-xs sm:text-sm font-bold text-white truncate">
                          {isWomen ? "Shreya Dixit" : "Sughosh Dixit"}
                        </h2>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {post.date} · {post.gearName || "Bengaluru"}
                        </p>
                      </div>
                      <span className="shrink-0 flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[8px] font-semibold text-muted-foreground capitalize">
                        <Activity size={11} className="text-primary" />
                        {post.sportType || "Multi-sport"}
                      </span>
                    </header>

                    <div className="px-4 sm:px-5">
                      <h3 className="font-display text-base sm:text-lg font-bold text-white tracking-tight">
                        {post.title}
                      </h3>
                      {post.description && (
                        <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                          {post.description}
                        </p>
                      )}

                      {/* Professional Metric Grid */}
                      <div className="my-3.5 grid grid-cols-3 sm:grid-cols-4 gap-2 rounded-xl border border-white/5 bg-[#141923] p-3">
                        <div>
                          <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Distance</div>
                          <div className="mt-0.5 text-sm sm:text-base font-extrabold text-white font-mono">
                            {post.totalDistanceKm ? post.totalDistanceKm.toFixed(2) : "0.00"}
                            <span className="ml-1 text-[9px] font-normal text-muted-foreground">km</span>
                          </div>
                        </div>

                        <div>
                          <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Pace</div>
                          <div className="mt-0.5 text-sm sm:text-base font-extrabold text-primary font-mono">
                            {post.avgPaceMinKm || "5:04"}
                            <span className="ml-1 text-[9px] font-normal text-muted-foreground">/km</span>
                          </div>
                        </div>

                        <div>
                          <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Elevation</div>
                          <div className="mt-0.5 text-sm sm:text-base font-extrabold text-[#38bdf8] font-mono">
                            +{Math.round(post.elevationGainMeters || 0)}
                            <span className="ml-1 text-[9px] font-normal text-muted-foreground">m</span>
                          </div>
                        </div>

                        <div className="hidden sm:block">
                          <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Calories</div>
                          <div className="mt-0.5 text-sm sm:text-base font-extrabold text-[#fc4c02] font-mono">
                            {Math.round(post.totalCalories || 0)}
                            <span className="ml-1 text-[9px] font-normal text-muted-foreground">kcal</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Media Showcase: Photos, Video, or Inset Quote Card */}
                    {hasVideo ? (
                      <div className="relative bg-black border-y border-white/5">
                        <video
                          src={post.videoUrls![0]}
                          controls
                          playsInline
                          className="aspect-video w-full object-contain"
                        />
                      </div>
                    ) : hasPhotos || post.customMediaUrl ? (
                      <div className="grid h-[240px] sm:h-[300px] grid-cols-[1.35fr_1fr] gap-1 bg-background border-y border-white/5">
                        <button
                          onClick={() => setZoom(displayPhoto)}
                          className="group relative overflow-hidden bg-muted"
                        >
                          <img
                            src={displayPhoto}
                            alt="Activity training"
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                          <Maximize2
                            size={15}
                            className="absolute bottom-3 right-3 text-white drop-shadow-lg"
                          />
                        </button>
                        <div className="grid grid-rows-2 gap-1">
                          <button
                            onClick={() =>
                              setZoom(post.photos?.[1] || pitchPhoto)
                            }
                            className="relative overflow-hidden bg-muted"
                          >
                            <img
                              src={post.photos?.[1] || pitchPhoto}
                              alt="Activity second shot"
                              className="h-full w-full object-cover"
                            />
                            <Maximize2
                              size={12}
                              className="absolute bottom-2 right-2 text-white"
                            />
                          </button>
                          <Link
                            to="/playbook"
                            className="relative flex items-center justify-center bg-[#171e12]"
                          >
                            <YellowDude
                              pose="push"
                              className="h-full w-full"
                            />
                            <span className="absolute bottom-2 left-2 rounded bg-background/80 px-2 py-1 text-[7px] text-dude">
                              YELLOW DUDE COMBO ↗
                            </span>
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="px-4 sm:px-5 pb-3">
                        <div className="rounded-xl border border-white/5 bg-linear-to-r from-dude/8 via-[#141923] to-transparent p-4">
                          <div className="flex items-start gap-3">
                            <span className="font-serif text-2xl font-bold text-dude leading-none">“</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-display text-xs sm:text-sm font-semibold italic text-[#e2e8f0] leading-relaxed">
                                {post.motivationalQuote || "Consistency transforms average into excellence."}
                              </p>
                              <p className="mt-2 text-[9px] font-bold uppercase tracking-widest text-dude/80">
                                — {post.quoteAuthor || "Sughosh Dixit"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Personal Record Badge */}
                    {post.recordBadges && post.recordBadges.length > 0 && (
                      <div className="flex items-center gap-2 border-y border-[#ffd700]/15 bg-linear-to-r from-[#ffd700]/9 to-transparent px-4 sm:px-5 py-2.5 text-[8px] font-semibold leading-4 text-[#e9c959]">
                        <Trophy size={13} className="shrink-0" />
                        ALL-TIME RECORD:{" "}
                        {post.recordBadges.map((b) => b.title).join(" · ")}
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-3 border-t border-white/5 bg-[#0b0e14]/50 px-4 sm:px-5 py-3">
                      <button
                        aria-pressed={isLiked}
                        onClick={() => {
                          if (onLikePost) onLikePost(post.id);
                          if (toast) toast("Kudos sent! 💛");
                          setLiked((prev) =>
                            prev.includes(post.id)
                              ? prev.filter((id) => id !== post.id)
                              : [...prev, post.id],
                          )
                        }}
                        className={`relative flex items-center gap-2 text-[10px] font-semibold transition active:scale-110 ${
                          isLiked ? "text-dude" : "text-muted-foreground hover:text-white"
                        }`}
                      >
                        <Hand
                          size={16}
                          className={isLiked ? "fill-dude/20" : ""}
                        />
                        {(post.likesCount || 0) + (liked.includes(post.id) ? 1 : 0)}{" "}
                        Kudos
                        {isLiked && (
                          <Sparkles size={11} className="text-dude" />
                        )}
                      </button>

                      <button
                        onClick={() => setDrawer(post.id)}
                        className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground hover:text-white"
                      >
                        <MessageCircle size={15} />
                        {(post.comments?.length || 0) +
                          (comments[post.id]?.length || 0)}
                        <span className="hidden sm:inline">Comments</span>
                      </button>

                      <div className="flex items-center gap-2">
                        {post.gpsActivity && (
                          <button
                            onClick={() => {
                              if (onOpenFlyby) onOpenFlyby(post.gpsActivity!)
                              else navigate("/maps?view=flyby")
                            }}
                            className="flex items-center gap-1.5 rounded-lg border border-sky-400/25 bg-sky-400/5 px-2.5 py-1.5 text-[9px] font-bold text-[#7dd3fc] hover:bg-sky-400/15"
                          >
                            <Satellite size={12} />
                            3D Flyby
                          </button>
                        )}
                        {onOpenSocialShare && (
                          <button
                            onClick={() => onOpenSocialShare(post)}
                            className="flex items-center gap-1.5 rounded-lg border border-primary/25 bg-primary/5 px-2.5 py-1.5 text-[9px] font-bold text-primary hover:bg-primary/15"
                          >
                            <Sparkles size={12} />
                            Share
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })
            ) : (
              demoPosts.map((post) => (
                <article key={post} className={`${box} overflow-hidden`}>
                  <header className="flex items-center gap-3 p-5">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-xs font-bold ${
                        post === 1
                          ? "bg-dude/15 text-dude"
                          : "bg-[#c084fc]/15 text-[#c084fc]"
                      }`}
                    >
                      {post === 1 ? "SD" : "SH"}
                    </div>
                    <div>
                      <h2 className="text-xs font-semibold">
                        {post === 1 ? "Sughosh Dixit" : "Shreya Dixit"}
                      </h2>
                      <p className="mt-1 text-[9px] text-muted-foreground">
                        {post === 1 ? "Today, 07:15" : "Yesterday, 06:42"} · Bengaluru
                      </p>
                    </div>
                    <span className="ml-auto flex items-center gap-1.5 rounded-full border border-border px-2 py-1.5 text-[8px] text-muted-foreground">
                      <Activity size={10} />
                      {post === 1 ? "Multi-sport" : "Tempo run"}
                    </span>
                  </header>
                  <div className="px-5">
                    <h3 className="font-display text-[18px] font-bold">
                      {post === 1
                        ? "Miles. Reps. Match-ready."
                        : "Sunrise, steady strides, zero regrets."}
                    </h3>
                    <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
                      {post === 1
                        ? "One morning. Three ways to get a little better. Yellow Dude made sure I didn’t skip the hard part. 💛"
                        : "The city was still asleep. The legs had other plans. Best way to start the day."}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-border px-5 py-4">
                    <button
                      onClick={() =>
                        setLiked((prev) =>
                          prev.includes(post)
                            ? prev.filter((id) => id !== post)
                            : [...prev, post],
                        )
                      }
                      className="flex items-center gap-2 text-[10px] text-dude"
                    >
                      <Hand size={16} /> 24 Kudos
                    </button>
                    <button
                      onClick={() => setDrawer(post)}
                      className="flex items-center gap-1.5 text-[10px] text-muted-foreground"
                    >
                      <MessageCircle size={14} /> Comments
                    </button>
                    <button
                      onClick={() => navigate("/maps?view=flyby")}
                      className="flex items-center gap-1.5 text-[9px] text-sky-400"
                    >
                      <Satellite size={13} /> 3D flyby
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>

        <aside className="hidden space-y-5 xl:block">
          <section className={`${box} p-5`}>
            <Eyebrow>YOUR PEOPLE. YOUR PACE.</Eyebrow>
            <h3 className="mt-4 font-display text-lg font-bold">
              The work is yours.
              <br />
              The energy is shared.
            </h3>
            <p className="mt-3 text-[10px] leading-6 text-muted-foreground">
              Celebrate the early starts, the extra reps, and the days you
              showed up anyway.
            </p>
            <div className="mt-5 flex -space-x-2">
              {["SD", "SH", "AK", "RV"].map((name, index) => (
                <span
                  key={name}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-card text-[9px] font-semibold ${
                    index % 2
                      ? "bg-[#3c2847] text-[#dfb7ff]"
                      : "bg-[#3f3c18] text-dude"
                  }`}
                >
                  {name}
                </span>
              ))}
            </div>
            <p className="mt-3 text-[9px] text-muted-foreground">
              A small crew. A lot of intention.
            </p>
          </section>
        </aside>
      </div>

      <input
        ref={input}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) setVideo(URL.createObjectURL(file))
        }}
      />

      {drawer !== null && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 backdrop-blur-md sm:items-center"
          onClick={() => setDrawer(null)}
        >
          <div
            ref={overlayRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Athlete comments"
            className={`${box} w-full max-w-lg p-5 shadow-2xl`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">
                The sideline banter
              </h3>
              <button
                aria-label="Close comments"
                onClick={() => setDrawer(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="scrollbar-none my-5 max-h-60 space-y-3 overflow-y-auto">
              {activeDrawerPost?.comments?.map((c) => (
                <div
                  key={c.id}
                  className="rounded-xl bg-white/3 p-3 text-[11px] leading-5 text-[#b8c0cc]"
                >
                  <span className="font-semibold text-white mr-2">
                    {c.userName}:
                  </span>
                  {c.text}
                </div>
              ))}
              {comments[drawer]?.map((text, index) => (
                <div
                  key={index}
                  className="rounded-xl bg-white/3 p-3 text-[11px] leading-5 text-[#b8c0cc]"
                >
                  {text}
                </div>
              ))}
            </div>
            <form
              className="flex gap-2"
              onSubmit={(event) => {
                event.preventDefault()
                if (!comment.trim()) return
                if (typeof drawer === "string" && onAddComment) {
                  onAddComment(drawer, comment.trim())
                }
                setComments({
                  ...comments,
                  [drawer]: [
                    ...(comments[drawer] || []),
                    `${currentProfile === "women" ? "Shreya" : "Sughosh"}: ${comment.trim()}`,
                  ],
                })
                setComment("")
              }}
            >
              <input
                autoFocus
                aria-label="Your comment"
                placeholder="Send some good energy…"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-3 text-xs"
              />
              <button
                aria-label="Post comment"
                className="rounded-lg bg-dude px-4 text-black font-semibold"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}

      {zoom && (
        <div
          ref={overlayRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label="Full-size training photo"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-5"
          onClick={() => setZoom(null)}
        >
          <button
            aria-label="Close photo"
            onClick={() => setZoom(null)}
            className="absolute right-5 top-5 rounded-full bg-white/10 p-3"
          >
            <X size={20} />
          </button>
          <img
            src={zoom}
            alt="Expanded training photograph"
            className="max-h-[85dvh] max-w-full rounded-xl object-contain"
          />
        </div>
      )}
    </>
  )
}

const routePath =
  "M114 260 C122 249 140 240 147 215 C157 209 173 211 179 182 C190 168 223 164 246 180 C255 188 251 207 257 211 C267 220 285 217 295 249 C301 261 285 278 281 280 C269 294 244 296 228 302 C216 310 213 327 205 324 C190 325 179 318 174 315 C164 308 170 295 163 292 C149 289 130 287 114 260"
function lifetimeRoute(index: number) {
  let column = 3 + (index % 5)
  let row = 3 + (index % 7)
  const coordinate = (gridColumn: number, gridRow: number) =>
    `${80 + gridColumn * 29 + gridRow * 3 + Math.sin(gridRow * 0.8 + gridColumn) * 7} ${65 + gridRow * 25 - gridColumn * 5 + Math.cos(gridColumn * 0.7 + gridRow) * 6}`
  const points = [`M${coordinate(column, row)}`]
  for (let step = 0; step < 24; step++) {
    const direction = Math.floor(
      (Math.sin(index * 73.17 + step * 41.93) + 1) * 1.999,
    )
    if (direction === 0) column = Math.max(0, column - 1)
    else if (direction === 1) column = Math.min(11, column + 1)
    else if (direction === 2) row = Math.max(0, row - 1)
    else row = Math.min(12, row + 1)
    points.push(`L${coordinate(column, row)}`)
  }
  return points.join(" ")
}
function SpatialMap({
  mesh = false,
  flyby = false,
  progress = 100,
  livePoints,
  opacity = 1,
}: {
  mesh?: boolean
  flyby?: boolean
  progress?: number
  livePoints?: GeoPoint[]
  opacity?: number
}) {
  const id = useId().replace(/:/g, "")
  const curveRef = useRef<SVGPathElement>(null)
  const [cursor, setCursor] = useState({ x: 114, y: 260 })
  useEffect(() => {
    if (!flyby || !curveRef.current) return
    const point = curveRef.current.getPointAtLength(
      (curveRef.current.getTotalLength() * progress) / 100,
    )
    setCursor({ x: point.x, y: point.y })
  }, [progress, flyby])
  const bounds = livePoints?.length
    ? {
        minLat: Math.min(...livePoints.map((p) => p.lat)),
        maxLat: Math.max(...livePoints.map((p) => p.lat)),
        minLng: Math.min(...livePoints.map((p) => p.lng)),
        maxLng: Math.max(...livePoints.map((p) => p.lng)),
      }
    : null
  const liveRoute =
    bounds && livePoints
      ? livePoints
          .map(
            (point, index) =>
              `${
                index ? "L" : "M"
              }${100 + ((point.lng - bounds.minLng) / Math.max(0.002, bounds.maxLng - bounds.minLng)) * 300} ${370 - ((point.lat - bounds.minLat) / Math.max(0.002, bounds.maxLat - bounds.minLat)) * 250}`,
          )
          .join(" ")
      : null
  return (
    <svg
      viewBox="0 0 520 480"
      className={`h-full w-full ${flyby ? "scale-110" : ""}`}
      role="img"
      aria-label={
        mesh
          ? "Generative lifetime route mesh"
          : liveRoute
            ? "Your foreground GPS route"
            : "Illustrative training route map"
      }
      opacity={opacity}
    >
      <defs>
        <filter id={`mapglow-${id}`}>
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
        <pattern
          id={`mapgrid-${id}`}
          width="24"
          height="24"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M24 0H0V24"
            fill="none"
            stroke="#475565"
            strokeWidth=".4"
            opacity=".2"
          />
        </pattern>
      </defs>
      {!mesh && (
        <>
          <rect width="520" height="480" fill={`url(#mapgrid-${id})`} />
          <path
            d="M0 105L88 100L153 48L267 71L398 15L520 49V0H0Z M0 400L82 395L126 430L196 395L219 480H0Z M360 110L425 139L482 111L520 132V285L466 272L431 211L354 180Z"
            fill="#17302a"
            opacity=".3"
          />
          {Array.from({ length: 13 }, (_, index) => (
            <path
              key={index}
              d={`M${-100 + index * 55} 0 L${70 + index * 37} 480 M0 ${index * 44} L520 ${index * 44 - 115}`}
              fill="none"
              stroke="#607080"
              strokeOpacity=".13"
              strokeWidth={index % 3 === 0 ? "5" : "2"}
            />
          ))}
          <path
            d="M-20 278Q113 189 232 332T550 283"
            fill="none"
            stroke="#182e3c"
            strokeWidth="14"
          />
        </>
      )}
      {mesh ? (
        Array.from({ length: 142 }, (_, index) => (
          <path
            key={index}
            d={lifetimeRoute(index)}
            fill="none"
            stroke={index % 4 === 0 ? "#ffe600" : "#ccff00"}
            strokeWidth=".9"
            opacity={0.04 + (index % 5) * 0.02}
            className="mix-blend-screen"
          />
        ))
      ) : (
        <>
          <path
            d={liveRoute || routePath}
            fill="none"
            stroke="#fc4c02"
            strokeWidth="9"
            opacity=".25"
            filter={`url(#mapglow-${id})`}
          />
          <path
            d={liveRoute || routePath}
            ref={curveRef}
            fill="none"
            stroke="#fc4c02"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            pathLength="100"
            strokeDasharray={`${progress} 100`}
          />
          {flyby && (
            <>
              <circle cx={cursor.x} cy={cursor.y} r="12" fill="#fc4c0225" />
              <circle
                cx={cursor.x}
                cy={cursor.y}
                r="5"
                fill="#fff"
                stroke="#fc4c02"
                strokeWidth="3"
              />
            </>
          )}
          {!flyby && (
            <circle
              cx={liveRoute ? 100 : 114}
              cy={liveRoute ? 370 : 260}
              r="5"
              fill="#fc4c02"
              stroke="#fff"
              strokeWidth="2"
            />
          )}
        </>
      )}
    </svg>
  )
}
function haversine(a: GeoPoint, b: GeoPoint) {
  const rad = Math.PI / 180
  const deltaLat = (b.lat - a.lat) * rad
  const deltaLng = (b.lng - a.lng) * rad
  return (
    6371 *
    2 *
    Math.atan2(
      Math.sqrt(
        Math.sin(deltaLat / 2) ** 2 +
          Math.cos(a.lat * rad) *
            Math.cos(b.lat * rad) *
            Math.sin(deltaLng / 2) ** 2,
      ),
      Math.sqrt(
        1 -
          (Math.sin(deltaLat / 2) ** 2 +
            Math.cos(a.lat * rad) *
              Math.cos(b.lat * rad) *
              Math.sin(deltaLng / 2) ** 2),
      ),
    )
  )
}
export function MapsEngine({ toast }: { toast: (message: string) => void }) {
  const [params, setParams] = useSearchParams()
  const view = params.get("view") || "gps"
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(35)
  const [speed, setSpeed] = useState(1)
  const [locked, setLocked] = useState(false)
  const [slide, setSlide] = useState(0)
  const [points, setPoints] = useState<GeoPoint[]>([])
  const [tracking, setTracking] = useState(false)
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [distance, setDistance] = useState(0)
  const [time, setTime] = useState(0)
  const watch = useRef<number | null>(null)
  const last = useRef<GeoPoint | null>(null)
  const lockRef = useRef<HTMLDivElement>(null)
  useOverlayFocus(locked, lockRef, () => {
    setLocked(false)
    setSlide(0)
  })
  useEffect(() => {
    if (!playing) return
    const timer = setInterval(
      () => setProgress((value) => (value >= 100 ? 0 : value + speed)),
      100,
    )
    return () => clearInterval(timer)
  }, [playing, speed])
  useEffect(() => {
    if (!tracking) return
    const timer = setInterval(() => setTime((value) => value + 1), 1000)
    return () => clearInterval(timer)
  }, [tracking])
  useEffect(
    () => () => {
      if (watch.current !== null)
        navigator.geolocation.clearWatch(watch.current)
    },
    [],
  )
  function track() {
    if (tracking) {
      if (watch.current !== null)
        navigator.geolocation.clearWatch(watch.current)
      watch.current = null
      setTracking(false)
      toast("Foreground GPS session stopped.")
      return
    }
    if (!navigator.geolocation) {
      toast("This browser doesn’t support GPS.")
      return
    }
    setPoints([])
    setAccuracy(null)
    setDistance(0)
    setTime(0)
    last.current = null
    setTracking(true)
    watch.current = navigator.geolocation.watchPosition(
      (position) => {
        const point = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        const acc = position.coords.accuracy ?? 10
        setAccuracy(acc)
        if (acc <= 25) {
          const previous = last.current
          if (previous) {
            const stepKm = haversine(previous, point)
            if (stepKm >= 0.004) {
              setDistance((value) => value + stepKm)
              last.current = point
              setPoints((value) => [...value, point])
            }
          } else {
            last.current = point
            setPoints((value) => [...value, point])
          }
        }
      },
      (error) => {
        if (error.code === 1) {
          setTracking(false)
          if (watch.current !== null)
            navigator.geolocation.clearWatch(watch.current)
          watch.current = null
        } else setAccuracy(null)
        toast(
          error.code === 1
            ? "Location permission denied. You can still explore the demo route."
            : "GPS signal interrupted. Keeping the session active and reacquiring.",
        )
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 20000 },
    )
  }
  const pace =
    distance > 0.01 ? clock(Math.min(3599, Math.floor(time / distance))) : "—"
  return (
    <>
      <PageTitle
        eyebrow="THE WORLD IS YOUR TRAINING GROUND"
        title={
          <>
            Leave your mark. <span className="text-[#ff9667]">Everywhere.</span>
          </>
        }
        subtitle="Track the now. Replay the effort. See the territory you’ve conquered."
      />
      <div className="scrollbar-none mb-6 flex gap-2 overflow-x-auto">
        {[
          ["gps", "Live GPS", Navigation],
          ["flyby", "3D flyby", Satellite],
          ["territory", "Conquered territory", Layers],
          ["share", "Dual-layer studio", Sparkles],
        ].map(([key, label, Icon]) => {
          const TabIcon = Icon as typeof Navigation
          return (
            <button
              key={String(key)}
              onClick={() => {
                setParams({ view: String(key) })
                setLocked(false)
              }}
              className={`flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2.5 text-[10px] ${
                view === key
                  ? "border-[#fc4c02]/35 bg-[#fc4c02]/8 text-[#ff9667]"
                  : "border-border text-muted-foreground"
              }`}
            >
              <TabIcon size={13} />
              {String(label)}
            </button>
          )
        })}
      </div>
      {view === "share" ? (
        <MapLayerStudio />
      ) : (
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_285px]">
          <section
            className={`relative overflow-hidden rounded-2xl border border-border ${
              view === "territory" ? "bg-[#05070a]" : "bg-card"
            }`}
          >
            <div className="absolute inset-x-4 top-4 z-10 flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 rounded-full border border-border bg-background/85 px-3 py-2 text-[8px] backdrop-blur-xl">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    tracking ? "bg-primary animate-pulse" : "bg-[#fc4c02]"
                  }`}
                />
                {view === "territory"
                  ? "LIFETIME MOVEMENT · NO MAP LABELS"
                  : view === "flyby"
                    ? "DEMO ROUTE · AERIAL REPLAY"
                    : tracking
                      ? accuracy === null
                        ? "ACQUIRING FOREGROUND GPS…"
                        : `FOREGROUND GPS · ±${accuracy.toFixed(1)}m`
                      : "DEMO ROUTE · GPS NOT CONNECTED"}
              </span>
              {view !== "territory" && (
                <button
                  aria-label="Center map"
                  onClick={() => setProgress(100)}
                  className="rounded-full border border-border bg-background/85 p-2 text-[#ff9667]"
                >
                  <Navigation size={15} />
                </button>
              )}
            </div>
            <div className="relative h-[420px] overflow-hidden sm:h-[510px]">
              {view === "flyby" && (
                <>
                  <img
                    src={fieldPhoto}
                    alt="Aerial football field used as illustrative replay terrain, not live satellite tiles"
                    className="absolute inset-0 h-full w-full object-cover opacity-35"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-background via-background/20 to-transparent" />
                </>
              )}
              <div
                className={`absolute inset-0 ${
                  view === "flyby" ? "[perspective:700px]" : ""
                }`}
              >
                <div
                  className={`h-full w-full transition-transform duration-700 motion-reduce:transition-none ${
                    view === "flyby"
                      ? "[transform:rotateX(40deg)_rotateZ(-18deg)]"
                      : ""
                  }`}
                >
                  <SpatialMap
                    mesh={view === "territory"}
                    flyby={view === "flyby"}
                    progress={view === "flyby" ? progress : 100}
                    livePoints={points.length ? points : undefined}
                  />
                </div>
              </div>
              {view === "flyby" && (
                <div className="absolute bottom-5 left-5 rounded-xl border border-border bg-background/85 p-4 backdrop-blur-xl">
                  <span className="text-[8px] uppercase tracking-widest text-muted-foreground">
                    Replay speed
                  </span>
                  <div className="mt-2 font-display text-3xl font-extrabold">
                    {(12.2 + Math.sin(progress / 10) * 3).toFixed(1)}{" "}
                    <span className="text-xs text-muted-foreground">km/h</span>
                  </div>
                  <div className="mt-2 text-[8px] text-[#ff9667]">
                    ELEVATION +{Math.round(progress * 0.68)} M
                  </div>
                </div>
              )}
              {view === "territory" && (
                <div className="absolute inset-x-4 bottom-5 text-center">
                  <h2 className="font-display text-lg font-bold">
                    Sughosh Dixit
                  </h2>
                  <p className="mt-2 font-mono text-[8px] text-[#a5af95]">
                    LIFETIME ROUTES: 142 SESSIONS · 1,280 KILOMETERS
                  </p>
                  <p className="mt-2 text-[7px] text-muted-foreground">
                    Generative route-art study · Illustrative lifetime data
                  </p>
                </div>
              )}
            </div>
            {view === "gps" ? (
              <>
                <div className="grid grid-cols-2 gap-px border-y border-border bg-border sm:grid-cols-4">
                  {[
                    [tracking ? distance.toFixed(2) : "5.24", "DISTANCE · KM"],
                    [tracking ? pace : "4:35", "PACE · /KM"],
                    [tracking ? "—" : "+68", "ELEVATION · M"],
                    [tracking ? "—" : "+38", "HEART POINTS"],
                  ].map(([value, label]) => (
                    <div key={label} className="bg-card px-5 py-4">
                      <div className="font-display text-2xl font-extrabold">
                        {value}
                      </div>
                      <span className="mt-2 block text-[7px] uppercase tracking-widest text-muted-foreground">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-3 p-4">
                  <button
                    onClick={track}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#fc4c02] py-3 text-[10px] font-semibold text-white"
                  >
                    {tracking ? <Pause size={13} /> : <Navigation size={13} />}{" "}
                    {tracking
                      ? "Stop foreground GPS"
                      : "Connect foreground GPS"}
                  </button>
                  <button
                    onClick={() => setLocked(true)}
                    className="flex items-center gap-2 rounded-lg border border-border px-4 py-3 text-[10px] text-muted-foreground"
                  >
                    <LockKeyhole size={13} />
                    Pocket lock
                  </button>
                </div>
              </>
            ) : view === "flyby" ? (
              <div className="flex items-center gap-3 border-t border-border p-4">
                <button
                  aria-label={playing ? "Pause flyby" : "Play flyby"}
                  onClick={() => setPlaying(!playing)}
                  className="text-[#ff9667]"
                >
                  {playing ? <Pause size={17} /> : <Play size={17} />}
                </button>
                <input
                  aria-label="Flyby playback"
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(event) => setProgress(Number(event.target.value))}
                  className="min-w-0 flex-1 accent-[#fc4c02]"
                />
                {[1, 2, 4].map((value) => (
                  <button
                    key={value}
                    onClick={() => setSpeed(value)}
                    className={`rounded-md px-2 py-1 font-mono text-[9px] ${
                      speed === value
                        ? "bg-[#fc4c02]/15 text-[#ff9667]"
                        : "text-muted-foreground"
                    }`}
                  >
                    {value}×
                  </button>
                ))}
              </div>
            ) : (
              <div className="border-t border-border px-5 py-4 text-center text-[9px] text-[#a5af95]">
                No labels. No noise. Just a life in motion.
              </div>
            )}
            {locked && (
              <div
                ref={lockRef}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                aria-label="Pocket touch lock"
                className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 p-8 backdrop-blur-lg"
              >
                <LockKeyhole size={40} className="text-[#ff9667]" />
                <h3 className="mt-5 font-display text-xl font-bold">
                  Keep your focus.
                </h3>
                <p className="mt-3 text-center text-xs leading-6 text-muted-foreground">
                  Pocket touches are blocked.
                  <br />
                  Location tracking continues while this page stays active.
                </p>
                <label className="mt-8 w-full max-w-xs rounded-full border border-[#fc4c02]/25 bg-[#fc4c02]/5 px-5 py-4">
                  <span className="mb-4 block text-center font-mono text-[9px] text-[#ff9667]">
                    SLIDE TO UNLOCK →
                  </span>
                  <input
                    aria-label="Slide to unlock"
                    type="range"
                    min="0"
                    max="100"
                    value={slide}
                    onChange={(event) => {
                      const value = Number(event.target.value)
                      setSlide(value)
                      if (value > 94) {
                        setLocked(false)
                        setSlide(0)
                      }
                    }}
                    className="w-full accent-[#fc4c02]"
                  />
                </label>
              </div>
            )}
          </section>
          <aside className="space-y-5">
            <section className={`${box} p-5`}>
              <div className="flex items-center gap-2 text-[10px] font-semibold text-[#ff9667]">
                <MapPin size={15} />
                {tracking
                  ? "YOUR FOREGROUND SESSION"
                  : "CUBBON PARK, BENGALURU"}
              </div>
              <h2 className="mt-4 font-display text-xl font-bold">
                {tracking ? (
                  <>
                    Your movement.
                    <br />
                    Mapped live.
                  </>
                ) : (
                  <>
                    Morning miles,
                    <br />
                    clear mind.
                  </>
                )}
              </h2>
              <p className="mt-3 text-[10px] leading-5 text-muted-foreground">
                A familiar loop. A different version of you. Every route is a
                small piece of the bigger picture.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-4">
                <div>
                  <div className="font-mono text-sm">
                    {tracking ? clock(time) : "24:12"}
                  </div>
                  <div className="mt-1 text-[8px] text-muted-foreground">
                    Moving time
                  </div>
                </div>
                <div>
                  <div className="font-mono text-sm text-[#e9c959]">
                    3:52 /km
                  </div>
                  <div className="mt-1 text-[8px] text-muted-foreground">
                    Fastest 1K · Demo PB
                  </div>
                </div>
              </div>
            </section>
            <section className={`${box} p-5`}>
              <div className="flex items-center gap-2 text-xs font-semibold">
                <ShieldCheck size={16} className="text-primary" />
                Built for honest telemetry.
              </div>
              <p className="mt-4 text-[10px] leading-6 text-muted-foreground">
                GPS uses your browser’s location permission. Tracking is
                foreground-only; browser tabs can’t guarantee screen-lock or
                background protection.
              </p>
              <p className="mt-3 text-[10px] leading-6 text-muted-foreground">
                Aerial replay is a visual demo, not georeferenced satellite
                terrain. Elevation and heart points need connected sensors.
              </p>
            </section>
            <Link to="/studio" className={`${yellowButton} w-full`}>
              <Sparkles size={14} />
              Make your route a masterpiece
            </Link>
          </aside>
        </div>
      )}
    </>
  )
}

function MapLayerStudio() {
  const [opacity, setOpacity] = useState(65)
  const [photo, setPhoto] = useState("")
  const [video, setVideo] = useState("")
  const input = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  useEffect(
    () => () => {
      if (video) URL.revokeObjectURL(video)
    },
    [video],
  )
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className={`${box} flex justify-center p-5 sm:p-7`}>
        <div className="relative aspect-9/16 w-full max-w-[340px] overflow-hidden rounded-xl border border-white/10 bg-background">
          {video ? (
            <video
              src={video}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <img
              src={photo || pitchPhoto}
              alt="Workout background for route overlay"
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-background/45" />
          <div className="absolute inset-0" style={{ opacity: opacity / 100 }}>
            <SpatialMap />
          </div>
          <div className="absolute inset-x-4 top-4 rounded-xl border border-white/10 bg-glass p-4 backdrop-blur-xl">
            <div className="text-[8px] uppercase tracking-widest text-dude">
              KUCHH BHII · MORNING MILES
            </div>
            <div className="mt-3 font-display text-4xl font-extrabold">
              5.24 <span className="text-xs text-muted-foreground">km</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="font-mono text-[9px] text-[#b6c0cc]">
                4:37 /KM · 24:12
              </span>
              <span className="flex items-center gap-1 rounded-full border border-[#ffd700]/25 bg-[#ffd700]/8 px-2 py-1 text-[7px] text-[#ffd700]">
                <Trophy size={9} />
                PB · 3:52
              </span>
            </div>
          </div>
          <div className="absolute inset-x-4 bottom-5 rounded-xl border border-[#ffd700]/25 bg-glass p-4 text-center backdrop-blur-xl">
            <p className="font-display text-[13px] font-semibold text-[#e9dba7]">
              The only way out is through.
            </p>
            <p className="mt-3 text-[7px] leading-4 text-muted-foreground">
              Made with an intention of doing Kuchh Bhii by Sughosh 😉
            </p>
          </div>
        </div>
      </div>
      <section className={`${box} h-fit p-6 sm:p-8`}>
        <Eyebrow>TWO LAYERS. ONE STORY.</Eyebrow>
        <h2 className="mt-4 font-display text-2xl font-bold">
          Movement meets memory.
        </h2>
        <p className="mt-3 text-xs leading-6 text-muted-foreground">
          Layer your glowing trajectory over the photo or video that captures
          the effort.
        </p>
        <button
          onClick={() => input.current?.click()}
          className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl border border-dude/25 bg-dude/5 py-5 text-xs text-dude"
        >
          <Upload size={17} />
          {photo || video
            ? "Change workout media"
            : "Add workout photo or video"}
        </button>
        <input
          ref={input}
          type="file"
          accept="image/*,video/mp4,video/webm"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (!file) return
            if (file.type.startsWith("video")) {
              setVideo(URL.createObjectURL(file))
              setPhoto("")
            } else {
              setVideo("")
              const reader = new FileReader()
              reader.onload = () => setPhoto(String(reader.result))
              reader.readAsDataURL(file)
            }
          }}
        />
        <label className="mt-8 flex items-center justify-between text-xs">
          <span>Map transparency</span>
          <span className="font-mono text-dude">{opacity}%</span>
        </label>
        <input
          aria-label="Map transparency"
          type="range"
          min="0"
          max="100"
          value={opacity}
          onChange={(event) => setOpacity(Number(event.target.value))}
          className="mt-5 w-full accent-[#ffe600]"
        />
        <div className="mt-2 flex justify-between text-[8px] text-muted-foreground">
          <span>JUST THE MEMORY</span>
          <span>ALL THE MOVEMENT</span>
        </div>
        <div className="mt-8 rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-[10px] font-semibold">
            <Layers size={15} className="text-[#ff9667]" />
            Vector trajectory overlay
          </div>
          <p className="mt-3 text-[10px] leading-5 text-muted-foreground">
            Illustrative dark cartography. Georeferenced satellite tiles require
            a maps provider. Your uploaded video stays on your device.
          </p>
        </div>
        <button
          onClick={() => {
            studioTransfer.photo = photo
            studioTransfer.opacity = opacity
            navigate("/studio?layered=true")
          }}
          className={`${yellowButton} mt-7 w-full`}
        >
          <Sparkles size={15} />
          {video ? "Open poster export studio" : "Continue to 4K export studio"}
          <ArrowRight size={15} />
        </button>
        {video && (
          <p className="mt-3 text-center text-[8px] text-muted-foreground">
            Uploaded video is preview-only. Export studio uses photos and vector
            animation.
          </p>
        )}
      </section>
    </div>
  )
}
