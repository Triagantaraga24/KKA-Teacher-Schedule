import { APP_CONFIG } from '../core/config.js';
import { uid, escapeHTML } from '../utils/helpers.js';
import { parseDate } from '../utils/date-utils.js';
import { validTime } from '../utils/validators.js';

const aliases={
  teacherId:['guru mapel id','id guru','nip','nuptk','id guru mapel','teacher id','kode guru'],
  teacher:['nama guru','guru mapel','nama pengajar','guru','teacher','pengajar'],
  subject:['mata pelajaran','mapel','nama mapel','subject','mata pelajaran yang diampu'],
  className:['kelas','rombel','class','nama kelas','kelompok kelas'],
  date:['tanggal','tgl','date','tanggal ujian','tanggal pelaksanaan'],
  weekday:['hari','day','hari pelaksanaan'],
  startTime:['mulai','jam mulai','waktu mulai','start','start time','jam awal'],
  endTime:['selesai','jam selesai','waktu selesai','end','end time','jam akhir'],
  period:['jam ke','jam pelajaran','jp ke','periode','period','jam'],
  scheduleText:['jadwal','waktu','keterangan jadwal','time table'],
  eventType:['jenis jadwal','jenis kegiatan','jenis soal','tipe jadwal','kategori','kegiatan'],
  room:['kode ruang','ruang','room']
};
const weekdays=['minggu','senin','selasa','rabu','kamis','jumat','sabtu'];
const strip=(v='')=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s*&\s*/g,' dan ').replace(/[._-]/g,' ').replace(/\s+/g,' ').trim();
function normalizeHeader(v){return strip(v).replace(/[^a-z0-9 ]/g,'').trim();}
function cleanName(v){return strip(v).replace(/\b(s\s*kom|s\s*komp|s\s*pd|s\s*si|s\s*e|m\s*kom|m\s*pd|dr|ir|h|hj)\b/g,' ').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();}
function subjectMatch(value){const v=normalizeHeader(value);return APP_CONFIG.subjectAliases.some(a=>{const x=normalizeHeader(a);return v===x||v.includes(x)||(x==='kka'&&/(^|\s)kka($|\s)/.test(v));});}
function parseTime(value){if(value===null||value===undefined||value==='')return null;if(typeof value==='number'){if(value>=0&&value<1){const minutes=Math.round(value*1440);return `${String(Math.floor(minutes/60)%24).padStart(2,'0')}:${String(minutes%60).padStart(2,'0')}`;}return null;}const s=String(value).trim();let m=s.match(/(?:^|\D)(\d{1,2})[.:](\d{2})(?:\D|$)/);if(!m)m=s.match(/^(\d{1,2})\s*[:.]?\s*(\d{2})$/);if(!m)return null;const h=+m[1],min=+m[2];if(h>23||min>59)return null;return `${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}`;}
function parseExcelDate(value){if(value instanceof Date)return `${value.getFullYear()}-${String(value.getMonth()+1).padStart(2,'0')}-${String(value.getDate()).padStart(2,'0')}`;if(typeof value==='number'&&value>20000&&window.XLSX?.SSF){const p=window.XLSX.SSF.parse_date_code(value);if(p)return `${p.y}-${String(p.m).padStart(2,'0')}-${String(p.d).padStart(2,'0')}`;}return parseDate(value);}
function parseWeekday(value){const v=strip(value);return weekdays.find(d=>v===d||v.startsWith(d))||null;}
function detectColumns(header){const normalized=header.map(normalizeHeader);const result={};for(const [field,names] of Object.entries(aliases)){const target=names.map(normalizeHeader);let index=normalized.findIndex(h=>target.includes(h));if(index<0){index=normalized.findIndex(h=>h&&target.some(t=>t.length>=8&&h.includes(t)));}if(index>=0)result[field]=index;}return result;}
function findHeader(matrix){let best={row:-1,score:0};for(let i=0;i<Math.min(matrix.length,35);i++){const cells=(matrix[i]||[]).map(normalizeHeader);let score=0;for(const field of ['teacher','teacherId','subject','className','date','weekday','startTime','scheduleText']){if(aliases[field].some(a=>cells.includes(normalizeHeader(a))))score++;}if(score>best.score)best={row:i,score};}return best.score>=2?best.row:-1;}
function combinedSchedule(raw){const s=String(raw??'');const date=parseDate(s);const wd=parseWeekday(s);let times=[...s.matchAll(/(\d{1,2}[.:]\d{2})/g)].map(m=>parseTime(m[1])).filter(Boolean);const period=s.match(/jam\s*(?:ke\s*)?[-:]?\s*(\d+)/i);return {date,weekday:wd,times,period:period?period[1]:null};}
function detectRecurrence(sheetName,header,rows,map){const sheetCue=/(jadwal.*(mingguan|pelajaran|mengajar)|timetable|weekly)/i.test(sheetName);const colCue=header.some(h=>/(tipe jadwal|jenis jadwal|pola jadwal|schedule type)/i.test(String(h)));const valueCue=rows.some(r=>{const v=strip(r[map.eventType]??'');return /(mingguan|rutin|berulang|recurring|weekly)/.test(v);});return sheetCue||colCue&&valueCue;}
function matchingTeacher(row,teacherConfig,map){const idValue=map.teacherId!==undefined?String(row[map.teacherId]??'').trim():'';const teacherValue=map.teacher!==undefined?String(row[map.teacher]??'').trim():'';const expectedId=String(teacherConfig.id||'').trim();if(idValue&&expectedId){return {matched:idValue===expectedId,ambiguous:false,reason:idValue===expectedId?'ID cocok':'ID guru berbeda',method:'id'};}
  if(teacherValue){const actual=cleanName(teacherValue),expected=cleanName(teacherConfig.name||'');if(actual&&expected&&actual===expected)return {matched:true,ambiguous:false,reason:'Nama guru cocok',method:'name'};if(actual&&expected&&(actual.includes(expected)||expected.includes(actual)))return {matched:false,ambiguous:true,reason:'Nama guru mirip; perlu verifikasi',method:'ambiguous'};return {matched:false,ambiguous:false,reason:'Guru berbeda',method:'name'};}
  return {matched:false,ambiguous:true,reason:'Kolom identitas guru tidak tersedia',method:'missing'};}
function classifyEvent(row,map,hasDate,recurring){const hints=[map.eventType,map.room,map.period,map.scheduleText].filter(i=>i!==undefined).map(i=>String(row[i]??'')).join(' ').toLowerCase();const exam=/(sts|sas|asas|ujian|exam|pg|essay|esai|kode ruang)/i.test(hints);return {eventType:exam?'Ujian':'Pembelajaran',kind:hasDate?'dated':(!hasDate&&recurring?'recurring':'unknown')};}

export function parseWorksheet(matrix,sheetName,fileName,teacherConfig,mappingOverride={}){
  const headerRow=findHeader(matrix);const headers=headerRow>=0?(matrix[headerRow]||[]).map((v,i)=>String(v||`Kolom ${i+1}`)):[];const detected=headerRow>=0?detectColumns(headers):{};const map={...detected,...mappingOverride};const dataRows=headerRow>=0?matrix.slice(headerRow+1):[];const recurringExplicit=detectRecurrence(sheetName,headers,dataRows,map);
  const stats={total:dataRows.filter(r=>r?.some(v=>v!==''&&v!==null&&v!==undefined)).length,valid:0,matched:0,unmatchedTeacher:0,unmatchedSubject:0,duplicates:0,invalidDate:0,invalidTime:0,ambiguous:0,missing:0};const records=[];const candidates=[];const source=`${fileName} · ${sheetName}`;
  dataRows.forEach((row,index)=>{if(!row?.some(v=>v!==''&&v!==null&&v!==undefined))return;const rowNumber=headerRow+index+2;const teacher=matchingTeacher(row,teacherConfig,map);const subject=map.subject!==undefined?String(row[map.subject]??'').trim():'';const isKka=subjectMatch(subject);const className=map.className!==undefined?String(row[map.className]??'').trim():'';const sched=map.scheduleText!==undefined?combinedSchedule(row[map.scheduleText]):{};const dateCell=map.date!==undefined?parseExcelDate(row[map.date]):null;const weekdayCell=map.weekday!==undefined?parseWeekday(row[map.weekday]):null;const date=dateCell||sched.date||null;const weekday=weekdayCell||sched.weekday||(date?parseWeekday(new Intl.DateTimeFormat('id-ID',{weekday:'long',timeZone:'UTC'}).format(new Date(`${date}T12:00:00Z`))):null);
    const start=(map.startTime!==undefined?parseTime(row[map.startTime]):null)||sched.times?.[0]||null;const end=(map.endTime!==undefined?parseTime(row[map.endTime]):null)||sched.times?.[1]||null;const period=(map.period!==undefined?String(row[map.period]??'').trim(): '')||sched.period||'';const classification=classifyEvent(row,map,!!date,recurringExplicit);const errors=[];const warnings=[];
    if(!teacher.matched&&!teacher.ambiguous)stats.unmatchedTeacher++;if(!isKka)stats.unmatchedSubject++;if(teacher.ambiguous)stats.ambiguous++;
    if(!teacher.matched)warnings.push(teacher.reason);if(!isKka)warnings.push(subject?'Bukan mata pelajaran KKA':'Mata pelajaran tidak terdeteksi');if(!className){errors.push('Kelas tidak ditemukan');stats.missing++;}if(!start||!end||!validTime(start)||!validTime(end)||end<=start){errors.push('Rentang waktu tidak valid');stats.invalidTime++;}
    let kind=classification.kind;if(classification.eventType==='Ujian'&&!date){kind='unknown';errors.push('Jadwal ujian membutuhkan tanggal pasti');stats.invalidDate++;}else if(!date&&weekday&&kind!=='recurring'){errors.push('Hari ditemukan tetapi pola berulang belum dinyatakan eksplisit');stats.invalidDate++;}else if(!date&&!weekday){errors.push('Tanggal atau hari tidak ditemukan');stats.invalidDate++;}
    const keep=teacher.matched&&isKka;const item={id:uid('import'),teacherName:teacherConfig.name,teacherId:teacherConfig.id,subject:'Koding dan Kecerdasan Artifisial (KKA)',className,date,weekday:weekday?weekday.charAt(0).toUpperCase()+weekday.slice(1):null,startTime:start,endTime:end,period,eventType:classification.eventType,kind,source,sourceRow:rowNumber,sourceSheet:sheetName,importedAt:new Date().toISOString(),status:'active',note:map.room!==undefined&&row[map.room]?`Ruang: ${row[map.room]}`:'',reminders:null,_match:{teacher:teacher.matched,teacherReason:teacher.reason,subject:isKka},_errors:errors,_warnings:warnings,_keep:keep};records.push(item);if(keep)candidates.push(item);
  });
  const validCandidates=candidates.filter(r=>r._errors.length===0);stats.matched=candidates.length;stats.valid=validCandidates.length;stats.total=records.length;return {sheetName,fileName,headerRow,headers,map,detected,recurringExplicit,records,candidates,validCandidates,stats,source};
}
let sheetJsPromise=null;
async function ensureSheetJS(){
  if(window.XLSX) return window.XLSX;
  if(!sheetJsPromise){
    sheetJsPromise = new Promise((resolve,reject)=>{
      const script = document.createElement('script');
      script.src = 'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js';
      script.async = true;
      script.onload = () => window.XLSX ? resolve(window.XLSX) : reject(new Error('SheetJS gagal diinisialisasi.'));
      script.onerror = () => {
        sheetJsPromise = null;
        reject(new Error('SheetJS tidak dapat dimuat. Periksa koneksi internet lalu coba lagi.'));
      };
      document.head.append(script);
    });
  }
  return sheetJsPromise;
}
export async function analyzeWorkbook(file,teacherConfig,mappingBySheet={}){const XLSX=await ensureSheetJS();const buffer=await file.arrayBuffer();const workbook=XLSX.read(buffer,{type:'array',cellDates:false});const results=[];for(const name of workbook.SheetNames){const matrix=XLSX.utils.sheet_to_json(workbook.Sheets[name],{header:1,raw:true,defval:''});results.push(parseWorksheet(matrix,name,file.name,teacherConfig,mappingBySheet[name]||{}));}return {fileName:file.name,fileSize:file.size,results,workbookSheets:workbook.SheetNames};}
export function stripImportMeta(record){const {_match,_errors,_warnings,_keep,...clean}=record;return clean;}
export function mappingOptions(headers,current={}){return Object.entries(aliases).map(([field,names])=>({field,label:field==='className'?'Kelas':field==='teacher'?'Nama Guru':field==='teacherId'?'ID Guru':field==='subject'?'Mata Pelajaran':field==='date'?'Tanggal':field==='weekday'?'Hari':field==='startTime'?'Mulai':field==='endTime'?'Selesai':field==='period'?'Jam ke':field==='scheduleText'?'Jadwal/Waktu':field==='eventType'?'Jenis Jadwal':'Ruang',value:current[field]??'',options:headers.map((h,i)=>({value:String(i),label:String(h||`Kolom ${i+1}`)}))}));}
