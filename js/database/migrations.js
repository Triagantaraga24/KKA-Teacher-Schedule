import { storage } from './storage.js';
export function runMigrations(){const version=storage.get('schemaVersion',0);if(version<1){storage.set('schemaVersion',1);if(!storage.get('teacher'))storage.set('teacher',{name:'Raga Triagantara, S.Kom.',id:'211032'});if(!storage.get('reminders'))storage.set('reminders',{enabled:true,intervals:[60,15,5],customMinutes:10});}}
