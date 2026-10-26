/**
 * Notification & Alarm Service for Kuchh Bhii App
 * Bridges native Android AlarmManager / NotificationManager and web in-app alerts.
 */

import { TacticalAiEngine } from './tacticalAiEngine';

export interface ReminderConfig {
  id: number;
  key: string;
  title: string;
  message: string;
  enabled: boolean;
  time: string; // "HH:MM" 24h format
  category: 'workout' | 'streak' | 'football' | 'vedas' | 'cycle';
  targetAction?: string;
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
    modal?: 'manual_log' | 'daily_recap' | 'calisthenics' | 'share';
    initialCategory?: 'calisthenics' | 'football' | 'badminton' | 'run' | 'walk';
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
    targetAction: 'manual_calisthenics',
  },
  {
    id: 102,
    key: 'football_prep',
    title: 'Football / Badminton Match Session',
    message: 'Time for pitch prep, match play, and recording your athletic stats!',
    enabled: true,
    time: '17:30',
    category: 'football',
    targetAction: 'manual_football',
  },
  {
    id: 103,
    key: 'streak_safeguard',
    title: '🔥 Daily Activity Recap & Social Card',
    message: "Consolidate today's badminton, calisthenics, and football into an athlete social post!",
    enabled: true,
    time: '20:30',
    category: 'streak',
    targetAction: 'daily_recap',
  },
  {
    id: 105,
    key: 'random_motivation',
    title: '🔴 Liverpool FC & Surprise Motivation',
    message: 'Random midday kicks from Anfield and commanders to keep you locked on track!',
    enabled: true,
    time: '14:15',
    category: 'football',
    targetAction: 'manual_calisthenics',
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
    id: 'notif-recap',
    title: '🎨 End-of-Day Activity Recap Ready',
    message: 'Consolidate today’s badminton matches, push-ups and running into a 4K shareable social post!',
    timestamp: Date.now() - 1000 * 60 * 30,
    read: false,
    type: 'social',
    actionPayload: { tab: 'feed', modal: 'daily_recap' },
  },
  {
    id: 'notif-quick-pushups',
    title: '💪 Quick Calisthenics Log',
    message: 'Crushed 15 push-ups or strict pull-ups? Tap to document your reps immediately.',
    timestamp: Date.now() - 1000 * 60 * 120,
    read: false,
    type: 'workout',
    actionPayload: { tab: 'calisthenics', modal: 'manual_log', initialCategory: 'calisthenics' },
  },
  {
    id: 'notif-match-log',
    title: '🏸 Match Day Logger',
    message: 'Played badminton or football? Document your score, game duration, and intensity.',
    timestamp: Date.now() - 1000 * 60 * 240,
    read: false,
    type: 'workout',
    actionPayload: { tab: 'activities', modal: 'manual_log', initialCategory: 'badminton' },
  },
  {
    id: 'notif-1',
    title: '🔥 14-Day Streak Unlocked',
    message: 'Incredible discipline! You are now in the top 5% consistency tier.',
    timestamp: Date.now() - 3600000 * 12,
    read: true,
    type: 'streak',
    actionPayload: { tab: 'discipline' },
  },
  {
    id: 'notif-2',
    title: '⚡ Personal Record: Fastest 1K',
    message: 'New record pace 3:52 /km registered from your recent athletic interval.',
    timestamp: Date.now() - 3600000 * 24,
    read: true,
    type: 'milestone',
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
    if (typeof window === 'undefined') return;

    const [hourStr, minStr] = reminder.time.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minStr, 10);

    if (isNaN(hour) || isNaN(minute)) return;

    const action = reminder.targetAction || '';

    // If native bridge supports action deep-linking
    if (window.AndroidBridge && typeof window.AndroidBridge.scheduleAlarmWithAction === 'function') {
      window.AndroidBridge.scheduleAlarmWithAction(
        reminder.id,
        hour,
        minute,
        reminder.title,
        reminder.message,
        action
      );
    } else if (window.AndroidBridge?.scheduleAlarm) {
      window.AndroidBridge.scheduleAlarm(
        reminder.id,
        hour,
        minute,
        reminder.title,
        reminder.message
      );
    }

    // If this is the random motivation reminder, schedule additional daytime surprise intervals
    if (reminder.key === 'random_motivation') {
      this.scheduleRandomSurpriseAlerts();
    }
  }

  /**
   * Schedules randomized surprise motivation alerts during active daytime hours
   * to keep the user motivated with Liverpool FC & military discipline punches.
   */
  public scheduleRandomSurpriseAlerts(count: number = 3) {
    const bridge = typeof window !== 'undefined' ? window.AndroidBridge : undefined;
    if (!bridge || !bridge.scheduleAlarmWithAction) return;

    // Window: 10:00 to 19:30 (spread throughout active day)
    const baseWindows = [
      { startH: 10, endH: 12, reqCode: 701 },
      { startH: 14, endH: 16, reqCode: 702 },
      { startH: 17, endH: 19, reqCode: 703 },
    ];

    const scheduleFn = bridge.scheduleAlarmWithAction;

    baseWindows.slice(0, count).forEach((win) => {
      const hour = Math.floor(Math.random() * (win.endH - win.startH + 1)) + win.startH;
      const minute = Math.floor(Math.random() * 60);

      const alert = TacticalAiEngine.getRandomMotivationAlert();

      try {
        scheduleFn(
          win.reqCode,
          hour,
          minute,
          alert.title,
          alert.message,
          alert.targetAction
        );
      } catch (e) {
        console.warn('Failed scheduling surprise motivation alarm:', e);
      }
    });
  }

  /**
   * Triggers an immediate random Liverpool FC / Tactical motivation pulse
   */
  public triggerInstantMotivationPulse(): { title: string; message: string; quote: string; speaker: string } {
    const alert = TacticalAiEngine.getRandomMotivationAlert();

    this.postInstantAlert(
      alert.title,
      alert.message,
      alert.targetAction
    );

    return alert;
  }

  public cancelNativeAlarm(id: number) {
    const bridge = typeof window !== 'undefined' ? window.AndroidBridge : undefined;
    if (!bridge || !bridge.cancelAlarm) return;
    const cancelFn = bridge.cancelAlarm;
    cancelFn(id);
    if (id === 105) {
      // Cancel surprise alarms as well
      [701, 702, 703].forEach((c) => cancelFn(c));
    }
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

  public postInstantAlert(title: string, message: string, targetAction: string = '') {
    // 1. Post to native system notification tray if on Android
    if (typeof window !== 'undefined' && window.AndroidBridge?.showNotification) {
      window.AndroidBridge.showNotification(title, message);
    }

    // 2. Play native audio confirmation tone if available
    if (typeof window !== 'undefined' && window.AndroidBridge?.playBeepTone) {
      window.AndroidBridge.playBeepTone(150);
    }

    // 3. Add to In-App notification feed
    const actionPayload: InAppNotification['actionPayload'] =
      targetAction === 'manual_calisthenics'
        ? { tab: 'calisthenics', modal: 'manual_log', initialCategory: 'calisthenics' }
        : targetAction === 'manual_football'
        ? { tab: 'activities', modal: 'manual_log', initialCategory: 'football' }
        : targetAction === 'daily_recap'
        ? { tab: 'feed', modal: 'daily_recap' }
        : undefined;

    this.addInAppNotification({
      title,
      message,
      type: 'workout',
      actionPayload,
    });
  }
}

export const notificationService = new NotificationService();
