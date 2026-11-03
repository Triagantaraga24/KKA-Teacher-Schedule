import { APP_CONFIG } from './core/config.js';
import { state } from './core/state.js';
import { currentRoute, initNavigation } from './core/router.js';
import { hydrateIcons, toast } from './utils/helpers.js';
import { database } from './database/indexed-db.js';
import { storage } from './database/storage.js';
import { runMigrations } from './database/migrations.js';
import { setScheduleCache } from './modules/schedule-manager.js';
import { getLanguage, setLanguage, applyTranslations, initTranslationObserver } from './core/i18n.js';

// Page bundles are loaded only when the user opens that page.
const pageLoaders = {
  dashboard: () => import('./modules/dashboard.js').then(m => ({ render: m.renderDashboard, cleanup: m.cleanupDashboard })),
  schedule: () => import('./modules/schedule.js').then(m => ({ render: m.renderSchedule })),
  weekly: () => import('./modules/weekly.js').then(m => ({ render: m.renderWeekly })),
  calendar: () => import('./modules/calendar.js').then(m => ({ render: m.renderCalendar })),
  reminders: () => import('./modules/reminders.js').then(m => ({ render: m.renderReminders })),
  import: () => import('./modules/excel-import.js').then(m => ({ render: m.renderImport })),
  history: () => import('./modules/history.js').then(m => ({ render: m.renderHistory })),
  settings: () => import('./modules/settings.js').then(m => ({ render: m.renderSettings }))
};

const labels = {
  dashboard: 'Dashboard', schedule: 'My Schedule', weekly: 'Weekly Timetable',
  calendar: 'Calendar', reminders: 'Reminders', import: 'Import Excel',
  history: 'Schedule History', settings: 'Settings'
};
const root = document.getElementById('viewRoot');
let rendering = false;
let renderRequested = false;
let pageCleanup = null;
let reminderEngine = null;
let reminderSettingsGetter = null;

async function refreshData() {
  // The dashboard needs schedules, not the complete audit log. History is
  // queried only when its page is opened.
  const schedules = await database.getAllSchedules();
  state.schedules = schedules;
  setScheduleCache(schedules);
}

function jakartaWeekday() {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short', timeZone: 'Asia/Jakarta'
  }).format(new Date());
}

async function render() {
  if (rendering) {
    renderRequested = true;
    return;
  }
  rendering = true;
  try {
    if (pageCleanup) {
      pageCleanup();
      pageCleanup = null;
    }
    state.route = currentRoute();
    const title = document.getElementById('pageTitle');
    if (title) {
      title.textContent = labels[state.route] || 'Dashboard';
      applyTranslations(title);
    }
    document.querySelectorAll('[data-route]').forEach(link => {
      link.classList.toggle('active', link.dataset.route === state.route);
    });
    const moreToggle = document.getElementById('mobileMoreToggle');
    if (moreToggle) moreToggle.classList.toggle('active', ['weekly', 'import', 'history', 'settings'].includes(state.route));

    const loader = pageLoaders[state.route] || pageLoaders.dashboard;
    const page = await loader();
    await page.render(root);
    if (typeof page.cleanup === 'function') pageCleanup = page.cleanup;

    // The JP 1 confirmation is relevant only on Monday, Wednesday and Friday.
    if (['Mon', 'Wed', 'Fri'].includes(jakartaWeekday())) {
      const { renderDailyVerification } = await import('./modules/daily-verification.js');
      renderDailyVerification(root);
    }

    hydrateIcons(root);
    applyTranslations(root);
    // Keep every persistent navigation surface hydrated, including sidebar and mobile menus.
    hydrateIcons(document.querySelector('.topbar'));
    hydrateIcons(document.getElementById('mobileNav'));
    hydrateIcons(document.getElementById('mobileMoreMenu'));
  } catch (error) {
    console.error(error);
    root.innerHTML = `<section class="card card-pad"><h2>Terjadi kesalahan</h2><p class="page-subtitle">${String(error.message || error)}</p><button class="btn btn-primary" onclick="location.reload()">Muat ulang</button></section>`;
    applyTranslations(root);
  } finally {
    rendering = false;
    if (renderRequested) {
      renderRequested = false;
      queueMicrotask(render);
    }
  }
}

async function ensureReminderEngine() {
  if (!reminderEngine || !reminderSettingsGetter) {
    const [engine, settings] = await Promise.all([
      import('./modules/notification-manager.js'),
      import('./modules/reminder-manager.js')
    ]);
    reminderEngine = engine;
    reminderSettingsGetter = settings.getReminderSettings;
  }
  reminderEngine.startReminderEngine(() => state.schedules, reminderSettingsGetter);
}

async function handleDataChanged() {
  await refreshData();
  if (reminderEngine) {
    reminderEngine.startReminderEngine(() => state.schedules, reminderSettingsGetter);
  }
  await render();
}

function applyTheme(theme) {
  const preference = ['system', 'light', 'dark'].includes(theme) ? theme : 'system';
  const resolved = preference === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : preference;
  const html = document.documentElement;
  html.dataset.theme = resolved;
  html.dataset.themePreference = preference;
  html.style.colorScheme = resolved;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = resolved === 'dark' ? '#0b1220' : '#f5f7fb';
  state.theme = preference;

  const button = document.getElementById('themeToggle');
  if (!button) return;
  const isDark = resolved === 'dark';
  button.innerHTML = isDark
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"/></svg>';
  const en = document.documentElement.lang === 'en';
  const text = preference === 'system'
    ? (en ? 'Theme: system' : 'Tema: sistem')
    : preference === 'dark'
      ? (en ? 'Theme: dark' : 'Tema: gelap')
      : (en ? 'Theme: light' : 'Tema: terang');
  button.title = text;
  button.setAttribute('aria-label', text);
  button.dataset.preference = preference;
}

function registerServiceWorkerWhenIdle() {
  if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
  const run = async () => {
    try {
      const registration = await navigator.serviceWorker.register('./sw.js');
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        worker?.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            toast('Versi aplikasi baru tersedia. Muat ulang untuk memperbarui.', 'info');
          }
        });
      });
    } catch (error) {
      console.warn('Service Worker registration failed:', error);
    }
  };
  if ('requestIdleCallback' in window) requestIdleCallback(run, { timeout: 2500 });
  else setTimeout(run, 900);
}

function setupShellControls() {
  const languageSelect = document.getElementById('languageSelect');
  languageSelect.value = getLanguage();
  document.documentElement.lang = getLanguage();
  applyTheme(state.theme);
  languageSelect.addEventListener('change', () => setLanguage(languageSelect.value));
  document.addEventListener('languagechange', () => applyTheme(storage.get('theme', 'system')));

  document.getElementById('themeToggle').addEventListener('click', () => {
    const preference = storage.get('theme', 'system');
    const resolved = document.documentElement.dataset.theme;
    const next = preference === 'system'
      ? (resolved === 'dark' ? 'light' : 'dark')
      : preference === 'light' ? 'dark' : 'system';
    storage.set('theme', next);
    applyTheme(next);
  });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => {
    if (storage.get('theme', 'system') === 'system') applyTheme('system');
  });

  const collapseButton = document.getElementById('collapseSidebar');
  const updateCollapseLabel = collapsed => {
    const label = collapsed
      ? (document.documentElement.lang === 'en' ? 'Expand sidebar' : 'Perbesar sidebar')
      : (document.documentElement.lang === 'en' ? 'Collapse sidebar' : 'Perkecil sidebar');
    collapseButton.title = label;
    collapseButton.setAttribute('aria-label', label);
    collapseButton.innerHTML = collapsed
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18m5-12 3 3-3 3"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18m5-12-3 3 3 3"/></svg>';
  };
  const collapsed = storage.get('sidebarCollapsed', false);
  document.body.classList.toggle('sidebar-collapsed', collapsed);
  updateCollapseLabel(collapsed);
  collapseButton.addEventListener('click', () => {
    const next = !document.body.classList.contains('sidebar-collapsed');
    document.body.classList.toggle('sidebar-collapsed', next);
    storage.set('sidebarCollapsed', next);
    updateCollapseLabel(next);
  });

  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const closeMenu = () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
  };
  document.getElementById('menuToggle').addEventListener('click', () => {
    sidebar.classList.add('open');
    overlay.classList.add('show');
  });
  document.getElementById('sidebarClose').addEventListener('click', closeMenu);
  overlay.addEventListener('click', closeMenu);
  document.querySelectorAll('.primary-nav a').forEach(link => link.addEventListener('click', closeMenu));
  window.addEventListener('hashchange', closeMenu);

  // Android/mobile uses the bottom bar exclusively; secondary destinations live in More.
  const moreToggle = document.getElementById('mobileMoreToggle');
  const moreMenu = document.getElementById('mobileMoreMenu');
  const moreBackdrop = document.getElementById('mobileMoreBackdrop');
  const closeMoreMenu = () => {
    moreMenu.hidden = true;
    moreBackdrop.classList.remove('show');
    moreToggle.setAttribute('aria-expanded', 'false');
  };
  moreToggle.addEventListener('click', () => {
    const opening = moreMenu.hidden;
    moreMenu.hidden = !opening;
    moreBackdrop.classList.toggle('show', opening);
    moreToggle.setAttribute('aria-expanded', String(opening));
  });
  moreBackdrop.addEventListener('click', closeMoreMenu);
  moreMenu.querySelectorAll('a[data-route]').forEach(link => link.addEventListener('click', closeMoreMenu));
  window.addEventListener('hashchange', closeMoreMenu);

  document.getElementById('quickAddButton').addEventListener('click', () => {
    import('./components/event-form.js').then(module => {
      module.openEventForm(null, () => window.dispatchEvent(new Event('datachanged')));
    });
  });
  document.getElementById('notificationButton').addEventListener('click', () => { location.hash = 'reminders'; });
  document.getElementById('yearNow').textContent = new Date().getFullYear();

  const updateConnection = () => {
    const pill = document.getElementById('connectionStatus');
    pill.classList.toggle('offline', !navigator.onLine);
    pill.querySelector('span:last-child').textContent = navigator.onLine ? 'Online' : 'Offline';
    applyTranslations(pill);
  };
  window.addEventListener('online', updateConnection);
  window.addEventListener('offline', updateConnection);
  updateConnection();

  const updateNotificationStatus = () => {
    const dot = document.getElementById('notificationDot');
    document.getElementById('notificationButton').classList.toggle(
      'has-alert', 'Notification' in window && Notification.permission !== 'granted'
    );
    if (dot) dot.hidden = !('Notification' in window) || Notification.permission === 'granted';
  };
  updateNotificationStatus();
  window.addEventListener('focus', updateNotificationStatus);
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    window.__pwaPrompt = event;
  });
  window.addEventListener('appinstalled', () => {
    window.__pwaPrompt = null;
    toast('KKA Schedule berhasil dipasang.', 'success');
  });
  window.addEventListener('datachanged', handleDataChanged);
}

async function init() {
  runMigrations();
  state.teacher = storage.get('teacher', APP_CONFIG.teacher);
  state.theme = storage.get('theme', 'system');
  applyTheme(state.theme);
  const teacher = document.getElementById('sidebarTeacher');
  if (teacher) teacher.textContent = state.teacher.name.split(',')[0];

  initTranslationObserver();
  // Static shell icons must be hydrated once; page rendering only handles dynamic content.
  hydrateIcons(document);
  applyTranslations(document);
  setupShellControls();
  initNavigation(render);

  // Show a lightweight shell placeholder, hydrate once, then render the route
  // exactly once. Avoid building and translating the full dashboard twice.
  root.innerHTML = '<section class="card card-pad app-loading" aria-live="polite"><div class="loading-indicator"></div><p>Menyiapkan jadwal Anda…</p></section>';
  await refreshData();
  await render();

  // Reminder code is not part of the critical first-render path.
  ensureReminderEngine().catch(error => console.warn('Reminder engine unavailable:', error));
  registerServiceWorkerWhenIdle();
}

init().catch(error => {
  console.error(error);
  toast('Aplikasi gagal diinisialisasi. Periksa browser dan penyimpanan.', 'error');
});
