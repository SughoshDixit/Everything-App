/**
 * Notification & Alarm Service for Kuchh Bhii App
 * Bridges native Android AlarmManager / NotificationManager and web in-app alerts.
 */

export interface ReminderConfig {
  id: number;
  key: string;
  title: string;
  message: string;
  enabled: boolean;
  time: string; // "HH:MM" 24h format
  category: 'workout' | 'streak' | 'football' | 'vedas' | 'cycle';
}

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  type: 'milestone' | 'streak' | 'workout' | 'media' | 'social';
  actionPayload?: {
    tab?: string;
    modal?: string;
    activityId?: string;
  };
}

const STORAGE_KEY_ALARMS = 'kuchh_bhii_alarm_settings';
const STORAGE_KEY_NOTIFS = 'kuchh_bhii_inapp_notifications';

export const DEFAULT_REMINDERS: ReminderConfig[] = [
  {
    id: 101,
    key: 'morning_workout',
    title: 'Morning Calisthenics & Mobility',
    message: 'Time for push-up combos and athletic mobility ladder with Yellow Dude!',
    enabled: true,
    time: '07:00',
    category: 'workout',
  },
  {
    id: 102,
    key: 'football_prep',
    title: 'Football Training & Pitch Prep',
    message: 'Hydrate and foam roll. Check tactical chalkboard and pitch gear.',
    enabled: true,
    time: '17:30',
    category: 'football',
  },
  {
    id: 103,
    key: 'streak_safeguard',
    title: '🔥 Daily Streak Safeguard',
    message: "Don't break the flame! Log your workout or discipline block before midnight.",
    enabled: true,
    time: '20:30',
    category: 'streak',
  },
  {
    id: 104,
    key: 'vedas_winddown',
    title: 'Vedic Chants & Mindful Rest',
    message: '9:30 PM Vedas audio session. Relax your nervous system for recovery.',
    enabled: false,
    time: '21:30',
    category: 'vedas',
  },
];

export const INITIAL_NOTIFICATIONS: InAppNotification[] = [
  {
    id: 'notif-1',
    title: '🔥 14-Day Streak Unlocked',
    message: 'Incredible discipline! You are now in the top 5% consistency tier.',
    timestamp: Date.now() - 3600000 * 2,
    read: false,
    type: 'streak',
    actionPayload: { tab: 'discipline' },
  },
  {
    id: 'notif-2',
    title: '⚡ Personal Record: Fastest 1K',
    message: 'New record pace 3:52 /km registered from your recent athletic interval.',
    timestamp: Date.now() - 3600000 * 18,
    read: false,
    type: 'milestone',
    actionPayload: { tab: 'activities' },
  },
  {
    id: 'notif-3',
    title: '🎬 Route Video Engine Ready',
    message: 'Your Google Maps cinematic trail videos now render with 60 FPS motion blur.',
    timestamp: Date.now() - 3600000 * 36,
    read: true,
    type: 'media',
    actionPayload: { tab: 'activities' },
  },
];

class NotificationService {
  private reminders: ReminderConfig[] = [];
  private inAppNotifications: InAppNotification[] = [];

  constructor() {
    this.loadSettings();
  }

  private loadSettings() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ALARMS);
      if (stored) {
        this.reminders = JSON.parse(stored);
      } else {
        this.reminders = [...DEFAULT_REMINDERS];
        this.saveSettings();
      }

      const notifsStored = localStorage.getItem(STORAGE_KEY_NOTIFS);
      if (notifsStored) {
        this.inAppNotifications = JSON.parse(notifsStored);
      } else {
        this.inAppNotifications = [...INITIAL_NOTIFICATIONS];
        this.saveInAppNotifications();
      }
    } catch {
      this.reminders = [...DEFAULT_REMINDERS];
      this.inAppNotifications = [...INITIAL_NOTIFICATIONS];
    }
  }

  private saveSettings() {
    try {
      localStorage.setItem(STORAGE_KEY_ALARMS, JSON.stringify(this.reminders));
    } catch (e) {
      console.warn('Failed to save alarm settings', e);
    }
  }

  private saveInAppNotifications() {
    try {
      localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(this.inAppNotifications));
    } catch (e) {
      console.warn('Failed to save in-app notifications', e);
    }
  }

  public getReminders(): ReminderConfig[] {
    return [...this.reminders];
  }

  public getInAppNotifications(): InAppNotification[] {
    return [...this.inAppNotifications];
  }

  public getUnreadCount(): number {
    return this.inAppNotifications.filter((n) => !n.read).length;
  }

  public markAllAsRead() {
    this.inAppNotifications = this.inAppNotifications.map((n) => ({ ...n, read: true }));
    this.saveInAppNotifications();
  }

  public markAsRead(id: string) {
    this.inAppNotifications = this.inAppNotifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    this.saveInAppNotifications();
  }

  public addInAppNotification(notif: Omit<InAppNotification, 'id' | 'timestamp' | 'read'>) {
    const newNotif: InAppNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: Date.now(),
      read: false,
    };
    this.inAppNotifications = [newNotif, ...this.inAppNotifications];
    this.saveInAppNotifications();
    return newNotif;
  }

  public checkPermission(): boolean {
    if (typeof window !== 'undefined' && window.AndroidBridge?.checkNotificationPermission) {
      return window.AndroidBridge.checkNotificationPermission();
    }
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission === 'granted';
    }
    return false;
  }

  public async requestPermission(): Promise<boolean> {
    if (typeof window !== 'undefined' && window.AndroidBridge?.requestNotificationPermission) {
      return window.AndroidBridge.requestNotificationPermission();
    }
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const res = await Notification.requestPermission();
      return res === 'granted';
    }
    return false;
  }

  public updateReminder(id: number, updates: Partial<ReminderConfig>): ReminderConfig | null {
    const index = this.reminders.findIndex((r) => r.id === id);
    if (index === -1) return null;

    const updated = { ...this.reminders[index], ...updates };
    this.reminders[index] = updated;
    this.saveSettings();

    // Sync with native Android AlarmManager
    if (updated.enabled) {
      this.syncNativeAlarm(updated);
    } else {
      this.cancelNativeAlarm(updated.id);
    }

    return updated;
  }

  public syncNativeAlarm(reminder: ReminderConfig) {
    if (typeof window === 'undefined' || !window.AndroidBridge?.scheduleAlarm) return;

    const [hourStr, minStr] = reminder.time.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minStr, 10);

    if (isNaN(hour) || isNaN(minute)) return;

    window.AndroidBridge.scheduleAlarm(
      reminder.id,
      hour,
      minute,
      reminder.title,
      reminder.message
    );
  }

  public cancelNativeAlarm(id: number) {
    if (typeof window === 'undefined' || !window.AndroidBridge?.cancelAlarm) return;
    window.AndroidBridge.cancelAlarm(id);
  }

  public syncAllActiveAlarms() {
    this.reminders.forEach((r) => {
      if (r.enabled) {
        this.syncNativeAlarm(r);
      } else {
        this.cancelNativeAlarm(r.id);
      }
    });
  }

  public postInstantAlert(title: string, message: string) {
    // 1. Post to native system notification tray if on Android
    if (typeof window !== 'undefined' && window.AndroidBridge?.showNotification) {
      window.AndroidBridge.showNotification(title, message);
    }

    // 2. Play native audio confirmation tone if available
    if (typeof window !== 'undefined' && window.AndroidBridge?.playBeepTone) {
      window.AndroidBridge.playBeepTone(150);
    }

    // 3. Add to In-App notification feed
    this.addInAppNotification({
      title,
      message,
      type: 'workout',
    });
  }
}

export const notificationService = new NotificationService();
