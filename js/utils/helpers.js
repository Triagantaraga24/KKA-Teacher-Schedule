const iconPaths = {
  dashboard:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>',
  'calendar-days':'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01"/>',
  'calendar-range':'<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 9h18M7 13h3M7 17h3M14 13h3M14 17h3"/>',
  calendar:'<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 9h18"/>',
  bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
  'file-up':'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M12 18v-7m-3 3 3-3 3 3"/>',
  history:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
  settings:'<circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.8 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.8-1l-1.7.7-1.4-2.4 1.4-1.1a8 8 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.8-1L12 7.4h2.8l.3 1.8a8 8 0 0 1 1.8 1l1.7-.7 1.4 2.4-1.4 1.1a8 8 0 0 1 0 2Z" transform="translate(-1 -2)"/>',
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  'shield-check':'<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/>',
  'clock':'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  'book-open':'<path d="M12 7v14M3 18V5a2 2 0 0 1 2-2h3a4 4 0 0 1 4 4 4 4 0 0 1 4-4h3a2 2 0 0 1 2 2v13h-5a4 4 0 0 0-4 3 4 4 0 0 0-4-3Z"/>',
  'users':'<path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM20 8v6m3-3h-6"/>',
  'trending-up':'<path d="m3 17 6-6 4 4 8-8M15 7h6v6"/>',
  'arrow-right':'<path d="M5 12h14m-7-7 7 7-7 7"/>',
  'chevron-left':'<path d="m15 18-6-6 6-6"/>', 'chevron-right':'<path d="m9 18 6-6-6-6"/>',
  'search':'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  'filter':'<path d="M4 6h16M7 12h10m-7 6h4"/>',
  'more-horizontal':'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  'edit':'<path d="m16 4 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4Z"/>',
  'trash':'<path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6"/>',
  'x':'<path d="m18 6-12 12M6 6l12 12"/>',
  'check':'<path d="m5 12 4 4L19 6"/>',
  'upload-cloud':'<path d="M16 16l-4-4-4 4m4-4v9M20 16.5A5 5 0 0 0 18 7h-1.3A7 7 0 1 0 4 15.3"/>',
  'download':'<path d="M12 3v12m-5-5 5 5 5-5M4 21h16"/>',
  'file-spreadsheet':'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8M12 13v4"/>',
  'calendar-plus':'<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 9h18m9 4v6m-3-3h6"/>',
  'info':'<circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-8h.01"/>',
  'alert-triangle':'<path d="m10.3 3.9-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3.1l-8-14a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4m0 4h.01"/>',
  'check-circle':'<circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/>',
  'wifi':'<path d="M5 12.5a11 11 0 0 1 14 0M2 9a16 16 0 0 1 20 0M8.5 16a5 5 0 0 1 7 0M12 20h.01"/>',
  'printer':'<path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v7H6z"/>',
  'refresh':'<path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.6 9A7 7 0 0 1 18 6l2 6M4 12l2 6a7 7 0 0 0 12.4-3"/>',
  'external-link':'<path d="M14 3h7v7m-1-6-9 9"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  'layers':'<path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5"/>',
  'sun':'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  'moon':'<path d="M20.5 14A8.5 8.5 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14Z"/>',
  'download-cloud':'<path d="M8 17l4 4 4-4m-4 4V9"/><path d="M20 16.5A5 5 0 0 0 18 7h-1.3A7 7 0 1 0 4 15.3"/>',
  'copy':'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
  'calendar-clock':'<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 9h18M12 13v3l2 1"/>',
  'mail':'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
};
export function icon(name, cls='') { return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name] || iconPaths.info}</svg>`; }
export function hydrateIcons(root=document) { root.querySelectorAll('[data-icon]').forEach(el => { const name=el.dataset.icon; if(name && !el.querySelector('svg')) el.innerHTML=icon(name); }); }
export function escapeHTML(value='') { return String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }
export function uid(prefix='evt') { return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`; }
export function toast(message, type='info', title='') { const region=document.getElementById('toastRegion'); if(!region)return; const el=document.createElement('div'); el.className=`toast ${type}`; const iconName=type==='success'?'check-circle':type==='error'?'alert-triangle':'info'; el.innerHTML=`${icon(iconName)}<div>${title?`<strong>${escapeHTML(title)}</strong>`:''}<p>${escapeHTML(message)}</p></div>`; region.append(el); setTimeout(()=>el.remove(),4300); }
export function formatBytes(bytes=0){if(bytes<1024)return `${bytes} B`;if(bytes<1048576)return `${(bytes/1024).toFixed(1)} KB`;return `${(bytes/1048576).toFixed(2)} MB`;}
export function downloadBlob(blob, filename){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export function openModal({title,subtitle='',body='',footer='',wide=false}){const root=document.getElementById('modalRoot');root.innerHTML=`<div class="modal-backdrop" data-backdrop><section class="modal ${wide?'modal-wide':''}" role="dialog" aria-modal="true" aria-label="${escapeHTML(title)}"><header class="modal-header"><div><h2>${escapeHTML(title)}</h2>${subtitle?`<p>${escapeHTML(subtitle)}</p>`:''}</div><button class="icon-button" data-close-modal aria-label="Tutup">${icon('x')}</button></header><div class="modal-body">${body}</div>${footer?`<footer class="modal-footer">${footer}</footer>`:''}</section></div>`;const close=()=>root.innerHTML='';root.querySelectorAll('[data-close-modal]').forEach(b=>b.addEventListener('click',close));root.querySelector('[data-backdrop]').addEventListener('click',e=>{if(e.target.dataset.backdrop!==undefined)close();});document.addEventListener('keydown',function esc(e){if(e.key==='Escape'){close();document.removeEventListener('keydown',esc);}});return {root,close};}
export function confirmDialog(message, title='Konfirmasi') { return new Promise(resolve=>{const {root,close}=openModal({title,body:`<p style="font-size:12px;line-height:1.7;color:#667389">${escapeHTML(message)}</p>`,footer:`<button class="btn btn-secondary" data-cancel>Batal</button><button class="btn btn-danger" data-confirm>Ya, lanjutkan</button>`});root.querySelector('[data-cancel]').onclick=()=>{close();resolve(false)};root.querySelector('[data-confirm]').onclick=()=>{close();resolve(true)};}); }
export function debounce(fn, wait=250){let timer;return(...args)=>{clearTimeout(timer);timer=setTimeout(()=>fn(...args),wait);};}
