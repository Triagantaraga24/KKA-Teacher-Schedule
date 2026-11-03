import { storage } from '../database/storage.js';
export function getReminderSettings(){return storage.get('reminders',{enabled:true,intervals:[60,15,5],customMinutes:10});}
export function saveReminderSettings(settings){storage.set('reminders',settings);return settings;}
