import { storage } from '../database/storage.js';
import { icon, escapeHTML, toast } from '../utils/helpers.js';
import { jakartaToday } from '../utils/date-utils.js';
import { applyTranslations } from '../core/i18n.js';

const DAYS = {1:'Senin',3:'Rabu',5:'Jumat'};
const OPTIONS = [
  {id:'none',label:'Tidak ada kegiatan khusus',desc:'Jadwal reguler berlaku',symbol:'✓'},
  {id:'upacara',label:'Upacara',desc:'Kegiatan sekolah pada JP 1',symbol:'⚑'},
  {id:'gss',label:'GSS',desc:'Kegiatan GSS pada JP 1',symbol:'G'},
  {id:'pramuka',label:'Pramuka',desc:'Kegiatan Pramuka pada JP 1',symbol:'P'},
  {id:'literasi',label:'Literasi',desc:'Kegiatan literasi pada JP 1',symbol:'L'}
];
const keyFor = date => `dailyVerification:${date}`;
const getToday = () => jakartaToday();
function localDateLabel(iso){const locale=document.documentElement.lang==='en'?'en-US':'id-ID';return new Intl.DateTimeFormat(locale,{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Jakarta'}).format(new Date(`${iso}T12:00:00+07:00`));}
export function renderDailyVerification(root){
  const date=getToday(),day=new Date(`${date}T12:00:00+07:00`).getDay();
  if(!DAYS[day]) return;
  const saved=storage.get(keyFor(date),null);
  root.querySelector('#dailyVerification')?.remove();
  const wrap=document.createElement('section');wrap.className=`daily-verification ${saved?'is-verified':'is-pending'}`;wrap.id='dailyVerification';
  const label=saved?(OPTIONS.find(x=>x.id===saved.activity)?.label||saved.activity):'Belum diverifikasi';
  wrap.innerHTML=`<div class="daily-verification-icon">${icon(saved?'clipboard-check':'clipboard-list')}</div><div class="daily-verification-copy"><strong>Verifikasi kegiatan JP 1 · ${DAYS[day]}</strong><span>${saved?`Terkonfirmasi: ${escapeHTML(label)} · ${escapeHTML(localDateLabel(date))}`:`Konfirmasi apakah ada Upacara, GSS, Pramuka, atau Literasi sebelum jadwal hari ini ditetapkan.`}</span></div><span class="badge ${saved?'badge-green':'badge-amber'}">${saved?'Terverifikasi':'Perlu verifikasi'}</span><button class="btn ${saved?'btn-secondary':'btn-primary'} btn-sm" id="openDailyVerification">${saved?'Ubah':'Verifikasi sekarang'}</button>`;
  root.prepend(wrap);
  wrap.querySelector('#openDailyVerification').addEventListener('click',()=>openVerification(date,day,saved));
}
function openVerification(date,day,saved){
  const overlay=document.createElement('div');overlay.className='modal-backdrop';overlay.id='dailyVerificationModal';
  overlay.innerHTML=`<section class="modal" role="dialog" aria-modal="true" aria-labelledby="verificationTitle"><header class="modal-header"><div><h2 id="verificationTitle">Verifikasi kegiatan JP 1</h2><p>${DAYS[day]} · ${localDateLabel(date)}</p></div><button class="icon-button" type="button" data-close aria-label="Tutup">${icon('x')}</button></header><div class="modal-body"><p class="verification-question">Apakah terdapat kegiatan khusus pada Jam Pelajaran (JP) 1 hari ini?</p><div class="verification-options">${OPTIONS.map(o=>`<label class="verification-option"><input type="radio" name="dailyActivity" value="${o.id}" ${saved?.activity===o.id?'checked':''}><span class="verification-symbol">${o.symbol}</span><span class="verification-option-copy"><strong>${o.label}</strong><small>${o.desc}</small></span><span class="verification-radio"></span></label>`).join('')}</div><div class="alert alert-info verification-note">${icon('info')}<span>Verifikasi ini dicatat untuk tanggal ini saja. Sistem tidak menggeser atau menghapus jadwal otomatis; perubahan waktu harus mengikuti jadwal alternatif resmi atau diedit secara manual.</span></div></div><footer class="modal-footer"><button class="btn btn-secondary" data-close>Batal</button><button class="btn btn-primary" id="saveDailyVerification">Simpan verifikasi</button></footer></section>`;
  document.getElementById('modalRoot').append(overlay);applyTranslations(overlay);
  const close=()=>overlay.remove();overlay.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',close));overlay.addEventListener('click',e=>{if(e.target===overlay)close();});
  overlay.querySelector('#saveDailyVerification').addEventListener('click',()=>{const selected=overlay.querySelector('input[name="dailyActivity"]:checked');if(!selected){toast('Pilih kondisi kegiatan terlebih dahulu.','warning');return;}const record={date,weekday:DAYS[day],activity:selected.value,activityLabel:OPTIONS.find(x=>x.id===selected.value).label,verifiedAt:new Date().toISOString(),previousActivity:saved?.activity||null};storage.set(keyFor(date),record);const history=storage.get('dailyVerificationHistory',[]);history.unshift(record);storage.set('dailyVerificationHistory',history.slice(0,180));close();renderDailyVerification(document.getElementById('viewRoot'));toast(`Verifikasi JP 1 tersimpan: ${record.activityLabel}.`,'success');});
}
