import { APP_CONFIG } from './core/config.js';
import { state } from './core/state.js';
import { currentRoute, initNavigation } from './core/router.js';
import { hydrateIcons, toast } from './utils/helpers.js';
import { database } from './database/indexed-db.js';
import { storage } from './database/storage.js';
import { runMigrations } from './database/migrations.js';
import { setScheduleCache } from './modules/schedule-manager.js';
import { startReminderEngine } from './modules/notification-manager.js';
import { getReminderSettings } from './modules/reminder-manager.js';
import { renderDashboard, cleanupDashboard } from './modules/dashboard.js';
import { renderSchedule } from './modules/schedule.js';
import { renderWeekly } from './modules/weekly.js';
import { renderCalendar } from './modules/calendar.js';
import { renderReminders } from './modules/reminders.js';
import { renderImport } from './modules/excel-import.js';
import { renderHistory } from './modules/history.js';
import { renderSettings } from './modules/settings.js';
import { renderDailyVerification } from './modules/daily-verification.js';
import { getLanguage, setLanguage, applyTranslations, initTranslationObserver } from './core/i18n.js';

const pages={dashboard:renderDashboard,schedule:renderSchedule,weekly:renderWeekly,calendar:renderCalendar,reminders:renderReminders,import:renderImport,history:renderHistory,settings:renderSettings};
const labels={dashboard:'Dashboard',schedule:'My Schedule',weekly:'Weekly Timetable',calendar:'Calendar',reminders:'Reminders',import:'Import Excel',history:'Schedule History',settings:'Settings'};
const root=document.getElementById('viewRoot');let rendering=false;
async function refreshData(){state.schedules=await database.getAllSchedules();state.history=await database.getHistory();setScheduleCache(state.schedules);}
async function render(){if(rendering)return;rendering=true;try{cleanupDashboard();state.route=currentRoute();document.getElementById('pageTitle').textContent=labels[state.route]||'Dashboard';document.querySelectorAll('[data-route]').forEach(a=>a.classList.toggle('active',a.dataset.route===state.route));const handler=pages[state.route]||renderDashboard;await handler(root);renderDailyVerification(root);applyTranslations(document);hydrateIcons(document);}catch(error){console.error(error);root.innerHTML=`<section class="card card-pad"><h2>Terjadi kesalahan</h2><p class="page-subtitle">${String(error.message||error)}</p><button class="btn btn-primary" onclick="location.reload()">Muat ulang</button></section>`;}finally{rendering=false;}}
async function handleDataChanged(){await refreshData();startReminderEngine(()=>state.schedules,getReminderSettings);await render();}

function applyTheme(theme){
  const preference=['system','light','dark'].includes(theme)?theme:'system';
  const resolved=preference==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):preference;
  const html=document.documentElement;
  html.dataset.theme=resolved;
  html.dataset.themePreference=preference;
  html.style.colorScheme=resolved;
  const themeMeta=document.querySelector('meta[name="theme-color"]');
  if(themeMeta)themeMeta.content=resolved==='dark'?'#0b1220':'#f5f7fb';
  state.theme=preference;
  const btn=document.getElementById('themeToggle');
  if(btn){
    const iconName=resolved==='dark'?'sun':'moon';
    btn.innerHTML=iconName==='sun'
      ?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg>'
      :'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"/></svg>';
    const en=document.documentElement.lang==='en';
    const title=preference==='system'?(en?'Theme: system':'Tema: sistem'):preference==='dark'?(en?'Theme: dark':'Tema: gelap'):(en?'Theme: light':'Tema: terang');
    btn.title=title;btn.setAttribute('aria-label',title);btn.dataset.preference=preference;
  }
}

async function init(){initTranslationObserver();runMigrations();state.teacher=storage.get('teacher',APP_CONFIG.teacher);state.theme=storage.get('theme','system');applyTheme(state.theme);document.getElementById('sidebarTeacher').textContent=state.teacher.name.split(',')[0];document.getElementById('yearNow').textContent=new Date().getFullYear();await refreshData();
  initNavigation(render);
  const langSelect=document.getElementById('languageSelect');langSelect.value=getLanguage();document.documentElement.lang=getLanguage();applyTheme(state.theme);document.addEventListener('languagechange',()=>applyTheme(storage.get('theme','system')));langSelect.addEventListener('change',()=>{setLanguage(langSelect.value);render();});
  document.getElementById('themeToggle').onclick=()=>{const pref=storage.get('theme','system');const resolved=document.documentElement.dataset.theme;const next=pref==='system'?(resolved==='dark'?'light':'dark'):pref==='light'?'dark':'system';storage.set('theme',next);applyTheme(next);};
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change',()=>{if(storage.get('theme','system')==='system')applyTheme('system');});
  const collapsed=storage.get('sidebarCollapsed',false);document.body.classList.toggle('sidebar-collapsed',collapsed);document.getElementById('collapseSidebar').title=collapsed?(document.documentElement.lang==='en'?'Expand sidebar':'Perbesar sidebar'):(document.documentElement.lang==='en'?'Collapse sidebar':'Perkecil sidebar');document.getElementById('collapseSidebar').setAttribute('aria-label',document.getElementById('collapseSidebar').title);document.getElementById('collapseSidebar').onclick=()=>{const next=!document.body.classList.contains('sidebar-collapsed');document.body.classList.toggle('sidebar-collapsed',next);storage.set('sidebarCollapsed',next);const label=next?(document.documentElement.lang==='en'?'Expand sidebar':'Perbesar sidebar'):(document.documentElement.lang==='en'?'Collapse sidebar':'Perkecil sidebar');const control=document.getElementById('collapseSidebar');control.title=label;control.setAttribute('aria-label',label);control.innerHTML=next?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18m5-12 3 3-3 3"/></svg>':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18m5-12-3 3 3 3"/></svg>';};
  document.getElementById('menuToggle').onclick=()=>{document.getElementById('sidebar').classList.add('open');document.getElementById('sidebarOverlay').classList.add('show');};
  const closeMenu=()=>{document.getElementById('sidebar').classList.remove('open');document.getElementById('sidebarOverlay').classList.remove('show');};document.getElementById('sidebarClose').onclick=closeMenu;document.getElementById('sidebarOverlay').onclick=closeMenu;document.querySelectorAll('.primary-nav a').forEach(a=>a.addEventListener('click',closeMenu));
  document.getElementById('quickAddButton').onclick=()=>import('./components/event-form.js').then(m=>m.openEventForm(null,()=>window.dispatchEvent(new Event('datachanged'))));
  document.getElementById('notificationButton').onclick=()=>location.hash='reminders';
  const updateConnection=()=>{const pill=document.getElementById('connectionStatus');pill.classList.toggle('offline',!navigator.onLine);pill.querySelector('span:last-child').textContent=navigator.onLine?'Online':'Offline';};window.addEventListener('online',updateConnection);window.addEventListener('offline',updateConnection);updateConnection();
  const updateNotificationStatus=()=>{const dot=document.getElementById('notificationDot');document.getElementById('notificationButton').classList.toggle('has-alert','Notification'in window&&Notification.permission!=='granted');};updateNotificationStatus();
  window.addEventListener('datachanged',handleDataChanged);window.addEventListener('hashchange',()=>{closeMenu();});window.addEventListener('focus',updateNotificationStatus);
  startReminderEngine(()=>state.schedules,getReminderSettings);
  if('serviceWorker'in navigator&&location.protocol!=='file:'){try{const registration=await navigator.serviceWorker.register('./sw.js');registration.addEventListener('updatefound',()=>{const worker=registration.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)toast('Versi aplikasi baru tersedia. Muat ulang untuk memperbarui.','info');});});}catch(err){console.warn('Service Worker registration failed:',err);}}
  window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();window.__pwaPrompt=event;});window.addEventListener('appinstalled',()=>{window.__pwaPrompt=null;toast('KKA Schedule berhasil dipasang.','success');});
  await render();
}
init().catch(error=>{console.error(error);toast('Aplikasi gagal diinisialisasi. Periksa browser dan penyimpanan.','error');});
