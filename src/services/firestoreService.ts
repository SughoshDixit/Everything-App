import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  deleteDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  type QueryDocumentSnapshot,
  type DocumentData
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type {
  GpsActivityLog,
  PersonalMilestones,
  StravaActivityPost,
  StravaGearItem,
  WorkoutSessionLog,
  RoutineItem,
  StravaComment,
  CycleLogsMap,
  CycleSettings
} from '../types';

export const DEFAULT_USER_ID = 'sughosh';

export interface DailyMetricDoc {
  date: string; // YYYY-MM-DD
  moveMinutes: number;
  caloriesKcal: number;
  distanceMeters: number;
  heartPoints: number;
  heartMinutes: number;
  stepCount: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
  walkingDurationMs?: number;
  runningDurationMs?: number;
  cyclingDurationMs?: number;
  footballDurationMs?: number;
}

// Recursively sanitizes objects to remove `undefined` values that Firestore rejects
export function cleanForFirestore<T>(data: T): any {
  if (data === null || data === undefined) return null;
  if (typeof data !== 'object') return data;
  if (Array.isArray(data)) {
    return data.map(cleanForFirestore);
  }
  const cleanObj: Record<string, any> = {};
  for (const [k, v] of Object.entries(data as Record<string, any>)) {
    if (v !== undefined) {
      cleanObj[k] = cleanForFirestore(v);
    }
  }
  return cleanObj;
}

// =============================================================================
// GPS ACTIVITIES
// =============================================================================
export async function saveGpsActivityToFirestore(
  activity: GpsActivityLog,
  userId: string = DEFAULT_USER_ID
): Promise<void> {
  const docRef = doc(db, 'users', userId, 'gps_activities', activity.id);
  const clean = cleanForFirestore(activity);
  await setDoc(docRef, clean, { merge: true });
}

export async function fetchGpsActivitiesFromFirestore(
  userId: string = DEFAULT_USER_ID,
  maxResults: number = 25
): Promise<GpsActivityLog[]> {
  const colRef = collection(db, 'users', userId, 'gps_activities');
  const q = query(colRef, orderBy('startTime', 'desc'), limit(maxResults));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as GpsActivityLog);
}

export async function fetchGpsActivitiesPaginated(
  userId: string = DEFAULT_USER_ID,
  pageSize: number = 15,
  lastDoc?: QueryDocumentSnapshot<DocumentData>
): Promise<{
  activities: GpsActivityLog[];
  lastVisibleDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}> {
  const colRef = collection(db, 'users', userId, 'gps_activities');
  const q = lastDoc
    ? query(colRef, orderBy('startTime', 'desc'), startAfter(lastDoc), limit(pageSize))
    : query(colRef, orderBy('startTime', 'desc'), limit(pageSize));

  const snap = await getDocs(q);
  const activities = snap.docs.map((d) => d.data() as GpsActivityLog);
  const lastVisibleDoc = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;
  const hasMore = snap.docs.length === pageSize;

  return { activities, lastVisibleDoc, hasMore };
}

export function subscribeGpsActivities(
  userId: string = DEFAULT_USER_ID,
  onData: (activities: GpsActivityLog[]) => void,
  maxResults: number = 25
) {
  const colRef = collection(db, 'users', userId, 'gps_activities');
  const q = query(colRef, orderBy('startTime', 'desc'), limit(maxResults));
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map((d) => d.data() as GpsActivityLog);
    onData(data);
  });
}

// =============================================================================
// DAILY HEALTH & FITNESS METRICS (Google Fit History)
// =============================================================================
export async function saveDailyMetricToFirestore(
  metric: DailyMetricDoc,
  userId: string = DEFAULT_USER_ID
): Promise<void> {
  const docRef = doc(db, 'users', userId, 'daily_metrics', metric.date);
  await setDoc(docRef, metric, { merge: true });
}

export async function fetchDailyMetricsFromFirestore(
  userId: string = DEFAULT_USER_ID,
  maxDays: number = 365
): Promise<DailyMetricDoc[]> {
  const colRef = collection(db, 'users', userId, 'daily_metrics');
  const q = query(colRef, orderBy('date', 'desc'), limit(maxDays));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as DailyMetricDoc);
}

// =============================================================================
// PERSONAL MILESTONES & PRs
// =============================================================================
export async function saveMilestonesToFirestore(
  milestones: PersonalMilestones,
  userId: string = DEFAULT_USER_ID
): Promise<void> {
  const docRef = doc(db, 'users', userId, 'milestones', 'personal_records');
  await setDoc(docRef, { ...milestones, lastUpdated: new Date().toISOString() }, { merge: true });
}

export async function fetchMilestonesFromFirestore(
  userId: string = DEFAULT_USER_ID
): Promise<PersonalMilestones | null> {
  const docRef = doc(db, 'users', userId, 'milestones', 'personal_records');
  const snap = await getDoc(docRef);
  return snap.exists() ? (snap.data() as PersonalMilestones) : null;
}

// =============================================================================
// GEAR (Running Shoes & Bikes)
// =============================================================================
export async function saveGearItemToFirestore(
  gear: StravaGearItem,
  userId: string = DEFAULT_USER_ID
): Promise<void> {
  const docRef = doc(db, 'users', userId, 'gear', gear.id);
  await setDoc(docRef, gear, { merge: true });
}

export async function fetchGearFromFirestore(
  userId: string = DEFAULT_USER_ID
): Promise<StravaGearItem[]> {
  const colRef = collection(db, 'users', userId, 'gear');
  const snap = await getDocs(colRef);
  return snap.docs.map((d) => d.data() as StravaGearItem);
}

// =============================================================================
// STRAVA ACTIVITY FEED POSTS
// =============================================================================
export async function saveActivityPostToFirestore(post: StravaActivityPost): Promise<void> {
  const docRef = doc(db, 'activity_feed_posts', post.id);
  const clean = cleanForFirestore(post);
  await setDoc(docRef, clean, { merge: true });
}

export async function deleteActivityPostFromFirestore(postId: string): Promise<void> {
  const docRef = doc(db, 'activity_feed_posts', postId);
  await deleteDoc(docRef);
}

export async function fetchFeedPostsFromFirestore(maxPosts: number = 20): Promise<StravaActivityPost[]> {
  const colRef = collection(db, 'activity_feed_posts');
  const q = query(colRef, orderBy('timestamp', 'desc'), limit(maxPosts));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as StravaActivityPost);
}

export async function fetchFeedPostsPaginated(
  pageSize: number = 15,
  lastDoc?: QueryDocumentSnapshot<DocumentData>
): Promise<{
  posts: StravaActivityPost[];
  lastVisibleDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}> {
  const colRef = collection(db, 'activity_feed_posts');
  const q = lastDoc
    ? query(colRef, orderBy('timestamp', 'desc'), startAfter(lastDoc), limit(pageSize))
    : query(colRef, orderBy('timestamp', 'desc'), limit(pageSize));

  const snap = await getDocs(q);
  const posts = snap.docs.map((d) => d.data() as StravaActivityPost);
  const lastVisibleDoc = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;
  const hasMore = snap.docs.length === pageSize;

  return { posts, lastVisibleDoc, hasMore };
}

export function subscribeFeedPosts(
  onData: (posts: StravaActivityPost[]) => void,
  maxPosts: number = 20
) {
  const colRef = collection(db, 'activity_feed_posts');
  const q = query(colRef, orderBy('timestamp', 'desc'), limit(maxPosts));
  return onSnapshot(q, (snap) => {
    const posts = snap.docs.map((d) => d.data() as StravaActivityPost);
    onData(posts);
  });
}

export async function togglePostLikeInFirestore(
  postId: string,
  user: { userId: 'men' | 'women'; userName: string },
  isLiked: boolean
): Promise<void> {
  const docRef = doc(db, 'activity_feed_posts', postId);
  if (isLiked) {
    await updateDoc(docRef, {
      kudosUsers: arrayUnion(user)
    });
  } else {
    await updateDoc(docRef, {
      kudosUsers: arrayRemove(user)
    });
  }
}

export async function addCommentToPostInFirestore(
  postId: string,
  comment: StravaComment
): Promise<void> {
  const docRef = doc(db, 'activity_feed_posts', postId);
  await updateDoc(docRef, {
    comments: arrayUnion(comment)
  });
}

// =============================================================================
// WORKOUT LOGS & ROUTINES
// =============================================================================
export async function saveWorkoutLogToFirestore(
  log: WorkoutSessionLog,
  userId: string = DEFAULT_USER_ID
): Promise<void> {
  const docRef = doc(db, 'users', userId, 'workout_logs', log.id);
  const clean = cleanForFirestore(log);
  await setDoc(docRef, clean, { merge: true });
}

export async function fetchWorkoutLogsFromFirestore(
  userId: string = DEFAULT_USER_ID,
  maxLogs: number = 100
): Promise<WorkoutSessionLog[]> {
  const colRef = collection(db, 'users', userId, 'workout_logs');
  const q = query(colRef, orderBy('date', 'desc'), limit(maxLogs));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as WorkoutSessionLog);
}

export async function saveRoutinesToFirestore(
  routines: RoutineItem[],
  userId: string = DEFAULT_USER_ID
): Promise<void> {
  const docRef = doc(db, 'users', userId, 'routines', 'current_list');
  await setDoc(docRef, { items: routines, updatedAt: new Date().toISOString() }, { merge: true });
}

export async function fetchRoutinesFromFirestore(
  userId: string = DEFAULT_USER_ID
): Promise<RoutineItem[] | null> {
  const docRef = doc(db, 'users', userId, 'routines', 'current_list');
  const snap = await getDoc(docRef);
  return snap.exists() ? (snap.data().items as RoutineItem[]) : null;
}

// =============================================================================
// CYCLE TRACKER
// =============================================================================
export async function saveCycleDataToFirestore(
  logs: CycleLogsMap,
  settings: CycleSettings,
  userId: string = DEFAULT_USER_ID
): Promise<void> {
  const docRef = doc(db, 'users', userId, 'cycle_data', 'current');
  await setDoc(docRef, { logs, settings, updatedAt: new Date().toISOString() }, { merge: true });
}

export async function fetchCycleDataFromFirestore(
  userId: string = DEFAULT_USER_ID
): Promise<{ logs: CycleLogsMap; settings: CycleSettings } | null> {
  const docRef = doc(db, 'users', userId, 'cycle_data', 'current');
  const snap = await getDoc(docRef);
  return snap.exists()
    ? (snap.data() as { logs: CycleLogsMap; settings: CycleSettings })
    : null;
}
