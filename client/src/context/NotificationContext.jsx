import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { getQuoteOfDay } from '../data/dailyQuotes';

const PREFERENCES_KEY = 'personal_os_notification_preferences';
const SENT_KEY = 'personal_os_notification_last_sent';
const defaults = {
  enabled: false,
  dailyPromptEnabled: true,
  dailyPromptTime: '06:00',
  goalReminderEnabled: true,
  goalReminderTime: '18:00',
  notificationVersion: 2,
};

const NotificationContext = createContext(null);

function readStoredPreferences() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(PREFERENCES_KEY) || '{}');
    return stored.notificationVersion ? { ...defaults, ...stored } : { ...defaults, ...stored, dailyPromptTime: '06:00', notificationVersion: 2 };
  } catch {
    return defaults;
  }
}

function dateKey(date = new Date()) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}

function timeHasArrived(time, date = new Date()) {
  const [hours, minutes] = String(time || '00:00').split(':').map(Number);
  return date.getHours() > hours || (date.getHours() === hours && date.getMinutes() >= minutes);
}

function readLastSent() {
  try { return JSON.parse(window.localStorage.getItem(SENT_KEY) || '{}'); } catch { return {}; }
}

function writeLastSent(next) {
  window.localStorage.setItem(SENT_KEY, JSON.stringify(next));
}

function reminderDateParts(item) {
  const value = item?.data?.date || item?.endDate;
  if (!value) return null;
  const text = String(value).slice(0, 10);
  const [year, month, day] = text.split('-').map(Number);
  return Number.isInteger(year) && Number.isInteger(month) && Number.isInteger(day) ? { year, month, day } : null;
}

function reminderIsDueToday(item, date) {
  const parts = reminderDateParts(item);
  if (!parts) return false;
  if (item.data?.repeat === 'yearly') return parts.month === date.getMonth() + 1 && parts.day === date.getDate();
  return parts.year === date.getFullYear() && parts.month === date.getMonth() + 1 && parts.day === date.getDate();
}

function reminderTitle(item) {
  return item?.title || 'Untitled reminder';
}

function dateIsBeforeToday(value, date) {
  const text = String(value || '').slice(0, 10);
  if (!text) return false;
  return text < dateKey(date);
}

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const supported = typeof window !== 'undefined' && 'Notification' in window;
  const [permission, setPermission] = useState(supported ? Notification.permission : 'unsupported');
  const [preferences, setPreferences] = useState(() => (typeof window === 'undefined' ? defaults : readStoredPreferences()));
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return undefined;
    }
    let active = true;

    async function loadNotifications() {
      const today = new Date();
      const dailyQuote = getQuoteOfDay(today);
      const next = [{ id: 'daily-quote', title: 'Quote of the day', body: `“${dailyQuote.text}”`, meta: 'Today', kind: 'today', target: '/dashboard' }];
      const [remindersResult, tasksResult, allTasksResult, goalsResult] = await Promise.allSettled([
        api.get('/workspace/reminder'),
        api.get('/workspace/task', { params: { date: dateKey(today) } }),
        api.get('/workspace/task'),
        api.get('/workspace/goal'),
      ]);
      const reminders = remindersResult.status === 'fulfilled' ? remindersResult.value.data.data.items || [] : [];
      const tasks = tasksResult.status === 'fulfilled' ? tasksResult.value.data.data.items || [] : [];
      const allTasks = allTasksResult.status === 'fulfilled' ? allTasksResult.value.data.data.items || [] : [];
      const goals = goalsResult.status === 'fulfilled' ? goalsResult.value.data.data.items || [] : [];
      const dueReminders = reminders.filter((item) => reminderIsDueToday(item, today));
      const openTasks = tasks.filter((task) => !task.completed);
      const missedReminders = reminders.filter((item) => item.data?.repeat === 'once' && dateIsBeforeToday(reminderDateParts(item) && `${String(reminderDateParts(item).year).padStart(4, '0')}-${String(reminderDateParts(item).month).padStart(2, '0')}-${String(reminderDateParts(item).day).padStart(2, '0')}`, today));
      const missedTasks = allTasks.filter((task) => !task.completed && dateIsBeforeToday(task.taskDate, today));
      const missedGoals = goals.filter((goal) => !goal.completed && dateIsBeforeToday(goal.endDate, today));
      if (dueReminders.length) next.push({ id: 'today-reminders', title: 'Today’s reminders', body: dueReminders.map(reminderTitle).join(' · '), meta: `${dueReminders.length} due today`, kind: 'today', target: '/reminders' });
      if (openTasks.length) next.push({ id: 'open-goals', title: 'Goals still in motion', body: `${openTasks.length} open goal${openTasks.length === 1 ? '' : 's'} waiting for today.`, meta: 'Today', kind: 'today', target: '/today?add=1' });
      if (missedReminders.length) next.push({ id: 'missed-reminders', title: 'Missed reminders', body: missedReminders.map(reminderTitle).join(' · '), meta: `${missedReminders.length} missed`, kind: 'missed', target: '/reminders' });
      if (missedTasks.length) next.push({ id: 'missed-tasks', title: 'Missed tasks', body: `${missedTasks.length} unfinished task${missedTasks.length === 1 ? '' : 's'} from earlier days.`, meta: `${missedTasks.length} missed`, kind: 'missed', target: '/today' });
      if (missedGoals.length) next.push({ id: 'overdue-goals', title: 'Overdue goals', body: missedGoals.map((goal) => goal.title).join(' · '), meta: `${missedGoals.length} overdue`, kind: 'missed', target: '/goals/pending' });
      if (active) setNotifications(next);
    }

    loadNotifications();
    const interval = window.setInterval(loadNotifications, 60 * 1000);
    return () => { active = false; window.clearInterval(interval); };
  }, [user]);

  function updatePreferences(next) {
    setPreferences((current) => ({ ...current, ...next }));
  }

  async function enableNotifications() {
    if (!supported) return 'unsupported';
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === 'granted') updatePreferences({ enabled: true });
    return result;
  }

  async function sendNotification(title, body, tag, target = '/today?add=1') {
    if (!supported) return { ok: false, reason: 'Notifications are not supported in this browser.' };
    if (permission !== 'granted') return { ok: false, reason: `Permission is "${permission}", not granted. Enable notifications first.` };
    if (!('serviceWorker' in navigator)) return { ok: false, reason: 'This browser has no service worker support.' };
    try {
      const registration = await navigator.serviceWorker.ready;
      if (!registration) return { ok: false, reason: 'No active service worker registration found.' };
      await registration.showNotification(title, {
        body,
        tag,
        renotify: true,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        data: { target },
      });
      return { ok: true };
    } catch (err) {
      return { ok: false, reason: `${err.name || 'Error'}: ${err.message || String(err)}` };
    }
  }

  async function sendTestNotification() {
    if (permission !== 'granted') return { ok: false, reason: `Permission is "${permission}". Tap "Enable notifications" first.` };
    return sendNotification('Personal OS reminder', 'Your next meaningful step is waiting. Click to add today’s goal.', 'personal-os-test');
  }

  useEffect(() => {
    if (!user || !preferences.enabled || permission !== 'granted') return undefined;
    let checking = false;

    async function checkSchedule() {
      if (checking) return;
      checking = true;
      const now = new Date();
      const today = dateKey(now);
      const lastSent = readLastSent();
      let dueReminders = [];
      try {
        const { data } = await api.get('/workspace/reminder');
        dueReminders = (data.data.items || []).filter((item) => reminderIsDueToday(item, now));
      } catch {
        // A reminder request should never interrupt the notification scheduler.
      }

      if (preferences.dailyPromptEnabled && timeHasArrived(preferences.dailyPromptTime, now) && lastSent.dailyPrompt !== today) {
        const dailyQuote = getQuoteOfDay(now);
        const reminderLine = dueReminders.length ? ` Today’s reminders: ${dueReminders.map(reminderTitle).join(' · ')}.` : '';
        sendNotification('Good morning, Yash · Quote of the day', `“${dailyQuote.text}” — Fill in today’s goals and take the next step.${reminderLine}`, 'personal-os-daily-quote');
        writeLastSent({ ...lastSent, dailyPrompt: today });
      }

      if (preferences.goalReminderEnabled && timeHasArrived(preferences.goalReminderTime, now) && lastSent.goalReminder !== today) {
        try {
          const { data } = await api.get('/workspace/task', { params: { date: today } });
          const openTasks = (data.data.items || []).filter((task) => !task.completed);
          if (openTasks.length > 0) {
            sendNotification('Your goals are still in motion', `You have ${openTasks.length} open goal${openTasks.length === 1 ? '' : 's'} for today. Click to continue.`, 'personal-os-goal-reminder');
            writeLastSent({ ...readLastSent(), goalReminder: today });
          }
        } catch {
          // Reminders should never interrupt the app if the task request fails.
        }
      }
      checking = false;
    }

    checkSchedule();
    const interval = window.setInterval(checkSchedule, 60 * 1000);
    return () => window.clearInterval(interval);
  }, [permission, preferences, user]);

  const value = useMemo(() => ({
    supported,
    permission,
    preferences,
    notifications,
    updatePreferences,
    enableNotifications,
    sendTestNotification,
  }), [notifications, permission, preferences, supported]);

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider.');
  return context;
}
