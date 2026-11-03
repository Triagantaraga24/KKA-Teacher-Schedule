import { database } from '../database/indexed-db.js';
import { uid } from '../utils/helpers.js';
import { getEventInstances, jakartaToday } from '../utils/date-utils.js';
import { validateSchedule } from '../utils/validators.js';

export async function loadSchedules(){return database.getAllSchedules();}
export async function saveEvent(input, existingId=null){const errors=validateSchedule(input);if(errors.length)throw new Error(errors.join('. '));const old=existingId?stateScheduleCache.find(x=>x.id===existingId):null;const item={...old,...input,id:existingId||uid('schedule'),updatedAt:new Date().toISOString(),createdAt:old?.createdAt||new Date().toISOString(),status:input.status||'active'};await database.saveSchedule(item);await database.saveHistory({id:uid('hist'),eventId:item.id,action:existingId?'updated':'created',at:new Date().toISOString(),summary:`${item.className} · ${item.date||item.weekday||'—'} · ${item.startTime}`});return item;}
let stateScheduleCache=[];
export function setScheduleCache(items){stateScheduleCache=items||[];}
export async function deleteEvent(id){const item=stateScheduleCache.find(x=>x.id===id);await database.deleteSchedule(id);await database.saveHistory({id:uid('hist'),eventId:id,action:'deleted',at:new Date().toISOString(),summary:item?`${item.className} · ${item.date||item.weekday}`:'Jadwal dihapus'});}
export async function setEventStatus(id,status,note=''){const item=stateScheduleCache.find(x=>x.id===id);if(!item)throw new Error('Jadwal tidak ditemukan');const updated={...item,status,note:note||item.note,updatedAt:new Date().toISOString()};await database.saveSchedule(updated);await database.saveHistory({id:uid('hist'),eventId:id,action:status==='cancelled'?'cancelled':'updated',at:new Date().toISOString(),summary:`${updated.className} · ${status}`});return updated;}
export function getUpcomingInstances(items,days=45){return getEventInstances(items,jakartaToday(),days).filter(x=>x.status!=='cancelled');}
