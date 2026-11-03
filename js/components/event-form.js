import { openModal, toast, escapeHTML, confirmDialog, uid, icon } from '../utils/helpers.js';
import { saveEvent, deleteEvent } from '../modules/schedule-manager.js';
import { database } from '../database/indexed-db.js';
import { state } from '../core/state.js';
import { validTime, validDate } from '../utils/validators.js';

export async function openEventForm(event=null,onSaved=()=>{}){
  const isEdit=!!event?.id;const kind=event?.kind||'dated';
  const body=`<form id="eventForm"><div class="form-grid">
    <div class="form-field"><label for="eventClass">Kelas *</label><input id="eventClass" class="form-control" required placeholder="Contoh: X-1" value="${escapeHTML(event?.className||'')}"></div>
    <div class="form-field"><label for="eventType">Kategori</label><select id="eventType" class="form-control"><option ${event?.eventType!=='Ujian'?'selected':''} value="Pembelajaran">Pembelajaran</option><option ${event?.eventType==='Ujian'?'selected':''} value="Ujian">Ujian</option></select></div>
    <div class="form-field"><label for="eventStatus">Status aktivitas</label><select id="eventStatus" class="form-control"><option value="active" ${!event?.status||event?.status==='active'?'selected':''}>Aktif</option><option value="rescheduled" ${event?.status==='rescheduled'?'selected':''}>Dijadwalkan ulang</option><option value="cancelled" ${event?.status==='cancelled'?'selected':''}>Dibatalkan</option></select></div>
    <div class="form-field"><label for="eventKind">Pola jadwal</label><select id="eventKind" class="form-control"><option value="dated" ${kind==='dated'?'selected':''}>Tanggal khusus</option><option value="recurring" ${kind==='recurring'?'selected':''}>Berulang mingguan</option></select></div>
    <div class="form-field" id="dateField" ${kind==='recurring'?'hidden':''}><label for="eventDate">Tanggal *</label><input id="eventDate" type="date" class="form-control" value="${escapeHTML(event?.date||'')}"></div>
    <div class="form-field" id="weekdayField" ${kind!=='recurring'?'hidden':''}><label for="eventWeekday">Hari *</label><select id="eventWeekday" class="form-control">${['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'].map(d=>`<option ${event?.weekday===d?'selected':''}>${d}</option>`).join('')}</select></div>
    <div class="form-field"><label for="eventStart">Jam mulai *</label><input id="eventStart" type="time" class="form-control" required value="${escapeHTML(event?.startTime||'07:00')}"></div>
    <div class="form-field"><label for="eventEnd">Jam selesai *</label><input id="eventEnd" type="time" class="form-control" required value="${escapeHTML(event?.endTime||'08:30')}"></div>
    <div class="form-field"><label for="eventPeriod">Jam ke</label><input id="eventPeriod" class="form-control" placeholder="Contoh: 1–2" value="${escapeHTML(event?.period||'')}"></div>
    <div class="form-field"><label for="eventRoom">Ruang / lokasi</label><input id="eventRoom" class="form-control" placeholder="Opsional" value="${escapeHTML(event?.room||'')}"></div>
  </div><div class="form-field" style="margin-top:14px"><label for="eventNote">Catatan</label><textarea id="eventNote" class="form-control" rows="2" placeholder="Catatan tambahan...">${escapeHTML(event?.note||'')}</textarea></div><p class="form-hint" style="margin-top:10px">Subjek dan guru mengikuti identitas KKA yang tersimpan di pengaturan. Zona waktu jadwal: Asia/Jakarta.</p></form>`;
  const modal=openModal({title:isEdit?'Edit Jadwal':'Tambah Jadwal',subtitle:'Simpan jadwal KKA di perangkat ini.',body,footer:`<button class="btn btn-secondary" data-close-modal>Batal</button><button class="btn btn-primary" id="saveEventButton">${isEdit?'Simpan perubahan':'Simpan jadwal'}</button>`});
  const kindSelect=modal.root.querySelector('#eventKind');const sync=()=>{const recurring=kindSelect.value==='recurring';modal.root.querySelector('#dateField').hidden=recurring;modal.root.querySelector('#weekdayField').hidden=!recurring;};kindSelect.addEventListener('change',sync);
  modal.root.querySelector('[data-close-modal]').onclick=modal.close;
  modal.root.querySelector('#saveEventButton').onclick=async()=>{const form=modal.root.querySelector('#eventForm');if(!form.reportValidity())return;const recurring=kindSelect.value==='recurring';const input={teacherName:state.teacher.name,teacherId:state.teacher.id,subject:'Koding dan Kecerdasan Artifisial (KKA)',className:modal.root.querySelector('#eventClass').value.trim(),eventType:modal.root.querySelector('#eventType').value,kind:kindSelect.value,date:recurring?null:modal.root.querySelector('#eventDate').value,weekday:recurring?modal.root.querySelector('#eventWeekday').value:null,startTime:modal.root.querySelector('#eventStart').value,endTime:modal.root.querySelector('#eventEnd').value,period:modal.root.querySelector('#eventPeriod').value.trim(),room:modal.root.querySelector('#eventRoom').value.trim(),note:modal.root.querySelector('#eventNote').value.trim(),source:event?.source||'Manual',status:modal.root.querySelector('#eventStatus').value,reminders:event?.reminders||null};try{await saveEvent(input,event?.id||null);modal.close();toast('Jadwal berhasil disimpan.','success');onSaved();}catch(err){toast(err.message,'error','Periksa data jadwal');}};
}
export async function deleteEventWithConfirm(id,onDeleted=()=>{}){const ok=await confirmDialog('Jadwal ini akan dihapus dari perangkat. Tindakan ini tidak dapat dibatalkan.','Hapus jadwal?');if(!ok)return;await deleteEvent(id);toast('Jadwal berhasil dihapus.','success');onDeleted();}


export async function openOccurrenceException(master, occurrenceDate, onSaved=()=>{}){
  if(!master||master.kind!=='recurring')return;
  const current=master.exceptions?.[occurrenceDate]||null;
  const status=current?.status||'none';
  const body=`<div class="alert alert-info" style="margin-bottom:14px">${icon('calendar-clock')}<div>Perubahan ini hanya berlaku untuk pertemuan tanggal <strong>${escapeHTML(occurrenceDate)}</strong>. Pola mingguan lainnya tidak akan diubah.</div></div>
    <div class="form-grid">
      <div class="form-field"><label for="exceptionStatus">Pengecualian</label><select id="exceptionStatus" class="form-control"><option value="none" ${status==='none'?'selected':''}>Tidak ada pengecualian</option><option value="cancelled" ${status==='cancelled'?'selected':''}>Batalkan pertemuan ini</option><option value="rescheduled" ${status==='rescheduled'?'selected':''}>Jadwalkan ulang pertemuan ini</option></select></div>
      <div class="form-field" id="exceptionDateField"><label for="exceptionDate">Tanggal pengganti</label><input type="date" id="exceptionDate" class="form-control" value="${escapeHTML(current?.date||occurrenceDate)}"></div>
      <div class="form-field" id="exceptionStartField"><label for="exceptionStart">Jam mulai baru</label><input type="time" id="exceptionStart" class="form-control" value="${escapeHTML(current?.startTime||master.startTime)}"></div>
      <div class="form-field" id="exceptionEndField"><label for="exceptionEnd">Jam selesai baru</label><input type="time" id="exceptionEnd" class="form-control" value="${escapeHTML(current?.endTime||master.endTime)}"></div>
    </div>
    <div class="form-field" style="margin-top:14px"><label for="exceptionNote">Alasan / catatan</label><textarea class="form-control" rows="2" id="exceptionNote" placeholder="Contoh: libur sekolah, guru berhalangan, kelas pengganti...">${escapeHTML(current?.note||'')}</textarea></div>`;
  const modal=openModal({title:'Pengecualian pertemuan',subtitle:`${master.className} · jadwal rutin ${master.weekday}`,body,footer:`<button class="btn btn-secondary" data-close-modal>Batal</button><button class="btn btn-primary" id="saveException">Simpan pengecualian</button>`});
  const statusSelect=modal.root.querySelector('#exceptionStatus');
  const sync=()=>{const visible=statusSelect.value==='rescheduled';['exceptionDateField','exceptionStartField','exceptionEndField'].forEach(id=>modal.root.querySelector(`#${id}`).hidden=!visible);};
  statusSelect.addEventListener('change',sync);sync();modal.root.querySelector('[data-close-modal]').onclick=modal.close;
  modal.root.querySelector('#saveException').onclick=async()=>{
    const value=statusSelect.value;const exceptions={...(master.exceptions||{})};
    if(value==='none'){delete exceptions[occurrenceDate];}
    else if(value==='cancelled'){exceptions[occurrenceDate]={status:'cancelled',note:modal.root.querySelector('#exceptionNote').value.trim()};}
    else{
      const date=modal.root.querySelector('#exceptionDate').value;const startTime=modal.root.querySelector('#exceptionStart').value;const endTime=modal.root.querySelector('#exceptionEnd').value;
      if(!validDate(date)||!validTime(startTime)||!validTime(endTime)||endTime<=startTime){toast('Periksa tanggal dan rentang jam pengganti.','error');return;}
      exceptions[occurrenceDate]={status:'rescheduled',date,startTime,endTime,note:modal.root.querySelector('#exceptionNote').value.trim()};
    }
    const updated={...master,exceptions,updatedAt:new Date().toISOString()};
    try{await database.saveSchedule(updated);await database.saveHistory({id:uid('hist'),eventId:master.id,action:'exception',at:new Date().toISOString(),summary:`Pengecualian ${master.className} · ${occurrenceDate} · ${value}`});modal.close();toast('Pengecualian pertemuan disimpan.','success');onSaved();}catch(error){toast(error.message||'Gagal menyimpan pengecualian.','error');}
  };
}
