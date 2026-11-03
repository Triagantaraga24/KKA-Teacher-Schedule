import { APP_CONFIG } from '../core/config.js';
const TZ = APP_CONFIG.timezone;
export function jakartaParts(date=new Date()) { const parts=new Intl.DateTimeFormat('en-CA',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(date); const out={};parts.forEach(p=>out[p.type]=p.value);return out; }
export function jakartaToday(){const p=jakartaParts();return `${p.year}-${p.month}-${p.day}`;}
export function jakartaTime(){const p=jakartaParts();return `${p.hour}:${p.minute}`;}
export function dateFromParts(y,m,d){return `${String(y).padStart(4,'0')}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;}
function safeDateParts(year,month,day){const date=dateFromParts(year,month,day);const parsed=new Date(Date.UTC(year,month-1,day));return parsed.getUTCFullYear()===year&&parsed.getUTCMonth()===month-1&&parsed.getUTCDate()===day?date:null;}
export function parseDate(value){if(!value)return null;if(value instanceof Date&&!Number.isNaN(value.getTime()))return safeDateParts(value.getFullYear(),value.getMonth()+1,value.getDate());const s=String(value).trim();let m=s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);if(m)return safeDateParts(+m[1],+m[2],+m[3]);m=s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})$/);if(m){let y=+m[3];if(y<100)y+=2000;return safeDateParts(y,+m[2],+m[1]);}const months={'januari':1,'jan':1,'februari':2,'feb':2,'maret':3,'mar':3,'april':4,'apr':4,'mei':5,'juni':6,'jun':6,'juli':7,'jul':7,'agustus':8,'agu':8,'ags':8,'september':9,'sep':9,'oktober':10,'okt':10,'november':11,'nov':11,'desember':12,'des':12};m=s.toLowerCase().match(/(\d{1,2})\s+([a-z]+)\s+(\d{4})/);if(m&&months[m[2]])return safeDateParts(+m[3],months[m[2]],+m[1]);return null;}
export function dateToUTCms(date,time='00:00'){if(!date)return NaN;const [y,m,d]=date.split('-').map(Number);const [hh,mm]=String(time).split(':').map(Number);return Date.UTC(y,m-1,d,(hh||0)-7,mm||0);}
export function weekdayIndex(date){const [y,m,d]=date.split('-').map(Number);return new Date(Date.UTC(y,m-1,d)).getUTCDay();}
export function weekdayName(date){return APP_CONFIG.weekDays[weekdayIndex(date)];}
export function formatDate(date, options={}){if(!date)return '—';const [y,m,d]=date.split('-').map(Number);const dt=new Date(Date.UTC(y,m-1,d,5));return new Intl.DateTimeFormat('id-ID',{timeZone:'UTC',day:'numeric',month:'long',year:options.year===false?undefined:'numeric',weekday:options.weekday? 'long':undefined}).format(dt);}
export function formatShortDate(date){if(!date)return '—';const [y,m,d]=date.split('-').map(Number);return new Intl.DateTimeFormat('id-ID',{day:'2-digit',month:'short',timeZone:'UTC'}).format(new Date(Date.UTC(y,m-1,d,5)));}
export function formatMonth(date){return new Intl.DateTimeFormat('id-ID',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(Date.UTC(date.getFullYear(),date.getMonth(),1,5)));}
export function startOfWeek(date){const d=new Date(date);const day=d.getDay();d.setDate(d.getDate()-(day===0?6:day-1));d.setHours(12,0,0,0);return d;}
export function addDays(date,days){const d=new Date(date);d.setDate(d.getDate()+days);return d;}
export function nextOccurrence(dayName,startTime,from=new Date()){const dayMap={'minggu':0,'senin':1,'selasa':2,'rabu':3,'kamis':4,'jumat':5,'jumat ':5,'sabtu':6};const target=dayMap[String(dayName).toLowerCase()];if(target===undefined)return null;const today=jakartaToday();let delta=(target-weekdayIndex(today)+7)%7;let date=addDays(new Date(`${today}T12:00:00`),delta);let iso=dateFromParts(date.getFullYear(),date.getMonth()+1,date.getDate());if(dateToUTCms(iso,startTime)<=Date.now()) {date=addDays(date,7);iso=dateFromParts(date.getFullYear(),date.getMonth()+1,date.getDate());}return iso;}
export function getEventInstances(events,fromDate=jakartaToday(),days=42){
  const result=[];
  const from=new Date(`${fromDate}T12:00:00`);
  const end=addDays(from,Math.max(0,days-1));
  const endIso=dateFromParts(end.getFullYear(),end.getMonth()+1,end.getDate());
  for(const event of events){
    if(event.status==='cancelled'&&event.kind==='recurring')continue;
    if(event.kind==='recurring'&&event.weekday){
      const generatedOccurrences=new Set();
      for(let i=0;i<days;i++){
        const d=addDays(from,i);
        const iso=dateFromParts(d.getFullYear(),d.getMonth()+1,d.getDate());
        if(weekdayName(iso).toLowerCase()!==event.weekday.toLowerCase())continue;
        generatedOccurrences.add(iso);
        const exception=event.exceptions?.[iso];
        if(exception?.status==='cancelled'){
          result.push({...event,...exception,instanceDate:iso,occurrenceDate:iso,instanceId:`${event.id}@${iso}`,status:'cancelled',kind:'recurring'});
        }else if(exception?.status==='rescheduled'){
          const movedDate=exception.date||iso;
          if(movedDate>=fromDate&&movedDate<=endIso)result.push({...event,...exception,instanceDate:movedDate,occurrenceDate:iso,instanceId:`${event.id}@${iso}`,status:'rescheduled',kind:'recurring'});
        }else{
          result.push({...event,instanceDate:iso,occurrenceDate:iso,instanceId:`${event.id}@${iso}`});
        }
      }
      for(const [originalDate,exception] of Object.entries(event.exceptions||{})){
        const movedDate=exception?.date;
        if(exception?.status==='rescheduled'&&movedDate>=fromDate&&movedDate<=endIso&&!generatedOccurrences.has(originalDate)){
          result.push({...event,...exception,instanceDate:movedDate,occurrenceDate:originalDate,instanceId:`${event.id}@${originalDate}`,status:'rescheduled',kind:'recurring'});
        }
      }
    }else if(event.date&&event.date>=fromDate&&event.date<=endIso){
      result.push({...event,instanceDate:event.date,occurrenceDate:event.date,instanceId:event.id});
    }
  }
  return result.sort((a,b)=>dateToUTCms(a.instanceDate,a.startTime)-dateToUTCms(b.instanceDate,b.startTime));
}
export function eventStatus(event,date=event.date||event.instanceDate){if(event.status==='cancelled')return 'cancelled';const now=Date.now(),start=dateToUTCms(date,event.startTime),end=dateToUTCms(date,event.endTime);if(now>end)return 'completed';if(now>=start&&now<=end)return 'in-progress';if(start-now<=15*60*1000)return 'starting-soon';return 'upcoming';}
export function formatTimeRange(start,end){return `${start||'--:--'} – ${end||'--:--'}`;}
export function countdown(ms){if(ms<=0)return '00:00:00';const sec=Math.floor(ms/1000),days=Math.floor(sec/86400),hours=Math.floor((sec%86400)/3600),mins=Math.floor((sec%3600)/60),seconds=sec%60;return days?`${days}h ${String(hours).padStart(2,'0')}j`:`${String(hours).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;}
