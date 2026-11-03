import { storage } from '../database/storage.js';
import { dateToUTCms, getEventInstances, jakartaToday } from '../utils/date-utils.js';
import { getLanguage } from '../core/i18n.js';

let intervalId = null;

const messages = {
  id: {
    unsupported: 'Browser ini tidak mendukung Web Notifications.',
    testTitle: 'KKA Teacher Schedule',
    testBody: 'Notifikasi percobaan berhasil ditampilkan.',
    failed: 'Notifikasi belum dapat ditampilkan. Periksa izin browser dan koneksi HTTPS.',
    now: 'sekarang',
    later: minutes => `${minutes} menit lagi`,
    titleNow: 'Waktunya Kelas KKA!',
    titleSoon: 'Kelas KKA Segera Dimulai',
    titleReminder: 'Pengingat Jadwal KKA',
    body: (name, when, time) => `Kelas ${name} dimulai ${when} (${time}).`
  },
  en: {
    unsupported: 'This browser does not support Web Notifications.',
    testTitle: 'KKA Teacher Schedule',
    testBody: 'The test notification was displayed successfully.',
    failed: 'The notification could not be displayed. Check browser permission and the HTTPS connection.',
    now: 'now',
    later: minutes => `in ${minutes} minutes`,
    titleNow: 'Time for Your KKA Class!',
    titleSoon: 'KKA Class Starting Soon',
    titleReminder: 'KKA Schedule Reminder',
    body: (name, when, time) => `Your KKA class for ${name} starts ${when} (${time}).`
  }
};
function copy(){ return messages[getLanguage() === 'en' ? 'en' : 'id']; }

export function notificationSupport(){
  return {
    api: 'Notification' in window,
    serviceWorker: 'serviceWorker' in navigator,
    permission: 'Notification' in window ? Notification.permission : 'unsupported'
  };
}

export async function requestNotificationPermission(){
  if(!('Notification' in window)) throw new Error(copy().unsupported);
  return Notification.requestPermission();
}

export async function showLocalNotification(title,body,tag='kka-reminder'){
  if(!('Notification' in window) || Notification.permission !== 'granted') return false;
  if('serviceWorker' in navigator){
    try{
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title,{body,tag,icon:'./assets/icons/icon-192.png',badge:'./assets/icons/icon-192.png',renotify:false});
      return true;
    }catch{/* Fall back to the page Notification API when possible. */}
  }
  try{
    new Notification(title,{body,tag,icon:'./assets/icons/icon-192.png'});
    return true;
  }catch{return false;}
}

export async function sendTestNotification(){
  const text = copy();
  const result = await showLocalNotification(text.testTitle,text.testBody);
  if(!result) throw new Error(text.failed);
  return true;
}

function sentIds(){ return storage.get('sentNotifications',[]); }
function addSent(id){
  const ids = sentIds();
  ids.push(id);
  storage.set('sentNotifications',ids.slice(-1000));
}
export function stopReminderEngine(){
  if(intervalId) clearInterval(intervalId);
  intervalId = null;
}

export function startReminderEngine(getSchedules,getSettings){
  stopReminderEngine();
  const check = async () => {
    const settings = getSettings();
    if(!settings?.enabled) return;
    if(!('Notification' in window) || Notification.permission !== 'granted') return;
    const instances = getEventInstances(getSchedules(),jakartaToday(),3);
    const now = Date.now();
    for(const event of instances){
      if(event.status === 'cancelled') continue;
      const start = dateToUTCms(event.instanceDate,event.startTime);
      const intervals = Array.isArray(event.reminders) ? event.reminders : settings.intervals || [];
      for(const min of intervals){
        const key = `${event.instanceId || event.id}:${event.instanceDate}:${min}`;
        if(sentIds().includes(key)) continue;
        const trigger = min === 0 ? start : start - min * 60000;
        if(now >= trigger && now < trigger + 45000){
          const text = copy();
          const when = min === 0 ? text.now : text.later(min);
          const title = min === 0 ? text.titleNow : min <= 15 ? text.titleSoon : text.titleReminder;
          const body = text.body(event.className,when,event.startTime);
          await showLocalNotification(title,body,`kka-${key}`);
          addSent(key);
        }
      }
    }
  };
  check();
  intervalId = setInterval(check,20000);
}
