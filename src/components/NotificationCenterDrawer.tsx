import React, { useState, useEffect } from 'react';
import {
  Bell,
  X,
  Flame,
  Trophy,
  Activity,
  Film,
  CheckCircle2,
  Clock,
  Volume2,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';
import {
  notificationService,
  type InAppNotification,
  type ReminderConfig,
} from '../services/notificationService';

interface NotificationCenterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tabKey: string) => void;
}

export const NotificationCenterDrawer: React.FC<NotificationCenterDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'alarms'>('feed');
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [reminders, setReminders] = useState<ReminderConfig[]>([]);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [testSent, setTestSent] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setNotifications(notificationService.getInAppNotifications());
      setReminders(notificationService.getReminders());
      setPermissionGranted(notificationService.checkPermission());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMarkAllRead = () => {
    notificationService.markAllAsRead();
    setNotifications(notificationService.getInAppNotifications());
  };

  const handleToggleReminder = (id: number, currentEnabled: boolean) => {
    const updated = notificationService.updateReminder(id, { enabled: !currentEnabled });
    if (updated) {
      setReminders(notificationService.getReminders());
    }
  };

  const handleTimeChange = (id: number, newTime: string) => {
    const updated = notificationService.updateReminder(id, { time: newTime });
    if (updated) {
      setReminders(notificationService.getReminders());
    }
  };

  const handleRequestPermission = async () => {
    const granted = await notificationService.requestPermission();
    setPermissionGranted(granted);
  };

  const handleSendTestNotification = () => {
    notificationService.postInstantAlert(
      'Kuchh Bhii Alert System Active',
      '⏰ Your native alarm & split notifications are calibrated for peak performance!'
    );
    setTestSent(true);
    setNotifications(notificationService.getInAppNotifications());
    setTimeout(() => setTestSent(false), 3000);
  };

  const filteredNotifs = notifications.filter((n) => {
    if (filterType === 'all') return true;
    return n.type === filterType;
  });

  const getNotifIcon = (type: InAppNotification['type']) => {
    switch (type) {
      case 'streak':
        return <Flame size={16} className="text-[#FC5200]" />;
      case 'milestone':
        return <Trophy size={16} className="text-amber-400" />;
      case 'media':
        return <Film size={16} className="text-purple-400" />;
      case 'workout':
      default:
        return <Activity size={16} className="text-[#CCFF00]" />;
    }
  };

  const formatTimeAgo = (ts: number) => {
    const diffSec = Math.floor((Date.now() - ts) / 1000);
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      {/* Drawer Container */}
      <div className="flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#0d1219] text-white shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FC5200]/15 text-[#FC5200]">
              <Bell size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Notification Center</h2>
              <p className="text-[11px] text-zinc-400">Live alerts & Android alarm scheduler</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-[#121822]/60 px-5 pt-3">
          <button
            onClick={() => setActiveTab('feed')}
            className={`relative pb-3 text-xs font-semibold transition ${
              activeTab === 'feed'
                ? 'text-[#FC5200]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Alerts & Activity
            {notifications.some((n) => !n.read) && (
              <span className="ml-1.5 rounded-full bg-[#FC5200] px-1.5 py-0.2 text-[10px] font-bold text-white">
                {notifications.filter((n) => !n.read).length}
              </span>
            )}
            {activeTab === 'feed' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FC5200]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('alarms')}
            className={`relative ml-6 pb-3 text-xs font-semibold transition ${
              activeTab === 'alarms'
                ? 'text-[#CCFF00]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Daily Reminders (Alarms)
            {activeTab === 'alarms' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#CCFF00]" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {activeTab === 'feed' ? (
            <div className="space-y-4">
              {/* Filter Pills & Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                  {['all', 'streak', 'milestone', 'workout'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilterType(f)}
                      className={`capitalize rounded-full px-2.5 py-1 font-medium transition ${
                        filterType === f
                          ? 'bg-white/20 text-white font-bold'
                          : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                {notifications.some((n) => !n.read) && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-medium text-[#FC5200] hover:underline shrink-0"
                  >
                    Mark read
                  </button>
                )}
              </div>

              {/* Notification Cards */}
              {filteredNotifs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-zinc-500">
                    <CheckCircle2 size={24} />
                  </div>
                  <p className="mt-3 text-xs font-medium text-zinc-400">All caught up!</p>
                  <p className="text-[11px] text-zinc-500">No pending alerts right now.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredNotifs.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        notificationService.markAsRead(item.id);
                        setNotifications(notificationService.getInAppNotifications());
                        if (item.actionPayload?.tab && onNavigateTab) {
                          onNavigateTab(item.actionPayload.tab);
                          onClose();
                        }
                      }}
                      className={`group relative flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition ${
                        item.read
                          ? 'border-white/5 bg-[#141b24]/50 opacity-80 hover:border-white/10 hover:opacity-100'
                          : 'border-white/10 bg-[#16202c] shadow-md hover:border-[#FC5200]/40'
                      }`}
                    >
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5">
                        {getNotifIcon(item.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs font-semibold text-white truncate">
                            {item.title}
                          </h4>
                          <span className="text-[10px] text-zinc-400 shrink-0">
                            {formatTimeAgo(item.timestamp)}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] leading-relaxed text-zinc-300">
                          {item.message}
                        </p>
                      </div>

                      {!item.read && (
                        <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#FC5200]" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Reminders / Alarms Tab */
            <div className="space-y-5">
              {/* Android Permission Banner */}
              {!permissionGranted && (
                <div className="flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-amber-200">
                  <div className="flex items-center gap-2.5">
                    <Smartphone size={18} className="text-amber-400 shrink-0" />
                    <div>
                      <p className="text-xs font-bold">Notifications Disabled</p>
                      <p className="text-[10px] text-amber-300/80">
                        Enable notifications for system alarm clock alerts.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleRequestPermission}
                    className="rounded-lg bg-amber-500 px-2.5 py-1 text-[11px] font-bold text-black hover:bg-amber-400"
                  >
                    Enable
                  </button>
                </div>
              )}

              {/* Overview Card */}
              <div className="rounded-xl border border-white/10 bg-gradient-to-br from-[#151c27] to-[#1a2332] p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-[#CCFF00]" />
                    <h3 className="text-xs font-bold tracking-wide uppercase text-zinc-300">
                      Android Native Alarm Scheduler
                    </h3>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-400">
                    <ShieldCheck size={12} /> RTC WakeLock Enabled
                  </span>
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-zinc-400">
                  Exact Android system alarms wake your device even in battery saver / doze mode
                  to guarantee workout and streak adherence.
                </p>
              </div>

              {/* Reminders List */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Configured Routine Reminders
                </h4>

                {reminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="flex flex-col rounded-xl border border-white/10 bg-[#141b24] p-3.5 transition hover:border-white/20"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                            reminder.enabled
                              ? 'bg-[#CCFF00]/15 text-[#CCFF00]'
                              : 'bg-white/5 text-zinc-500'
                          }`}
                        >
                          <Clock size={15} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{reminder.title}</p>
                          <p className="text-[10px] text-zinc-400">{reminder.message}</p>
                        </div>
                      </div>

                      {/* Toggle Switch */}
                      <button
                        onClick={() => handleToggleReminder(reminder.id, reminder.enabled)}
                        className={`relative h-6 w-11 rounded-full transition-colors ${
                          reminder.enabled ? 'bg-[#CCFF00]' : 'bg-white/15'
                        }`}
                      >
                        <span
                          className={`absolute top-1 h-4 w-4 rounded-full bg-black transition-transform ${
                            reminder.enabled ? 'left-6' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Time Input Selector */}
                    {reminder.enabled && (
                      <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2.5 text-xs">
                        <span className="text-[11px] text-zinc-400">Daily trigger time:</span>
                        <input
                          type="time"
                          value={reminder.time}
                          onChange={(e) => handleTimeChange(reminder.id, e.target.value)}
                          className="rounded-lg border border-white/15 bg-black/40 px-2 py-0.5 text-xs font-semibold text-[#CCFF00] focus:border-[#CCFF00] focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Test Alert Button */}
              <div className="pt-2">
                <button
                  onClick={handleSendTestNotification}
                  disabled={testSent}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#CCFF00]/40 bg-[#CCFF00]/10 py-3 text-xs font-bold text-[#CCFF00] transition hover:bg-[#CCFF00]/20 active:scale-[0.98]"
                >
                  <Volume2 size={16} />
                  {testSent ? '✓ Notification & Audio Sent!' : 'Test Native System Notification'}
                </button>
                <p className="mt-1.5 text-center text-[10px] text-zinc-500">
                  Tests Android NotificationManager & Audio Beep bridge instantly.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default NotificationCenterDrawer;
