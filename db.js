import {studentsSeed,seedRecord} from './core.js';
let db;
export async function openDB(){
 db=await new Promise((resolve,reject)=>{const r=indexedDB.open('musicmate-pilot',1);r.onupgradeneeded=()=>{for(const name of ['students','records','settings'])r.result.createObjectStore(name,{keyPath:'id'});r.result.createObjectStore('sessions',{keyPath:'id'});};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
 const initialized=await get('settings','initialized');
 if(!initialized)await new Promise((resolve,reject)=>{const t=db.transaction(['students','records','settings','sessions'],'readwrite');for(const s of studentsSeed)t.objectStore('students').put({...s,id:s.code});const record=seedRecord();t.objectStore('records').add(record);t.objectStore('sessions').add({id:'A01:1',record:record.id});t.objectStore('settings').put({id:'names',bindings:[]});t.objectStore('settings').put({id:'initialized',value:true});t.oncomplete=resolve;t.onerror=()=>reject(t.error);});
}
export function get(store,id){return new Promise((resolve,reject)=>{const r=db.transaction(store).objectStore(store).get(id);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
export function all(store){return new Promise((resolve,reject)=>{const r=db.transaction(store).objectStore(store).getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
export function put(store,value){return new Promise((resolve,reject)=>{const t=db.transaction(store,'readwrite');t.objectStore(store).put(value);t.oncomplete=resolve;t.onerror=()=>reject(t.error);});}
// Records are append-only. Session uniqueness and the immutable record commit atomically.
export function saveRecord(record){return new Promise((resolve,reject)=>{const t=db.transaction(['records','sessions'],'readwrite');t.objectStore('sessions').add({id:`${record.student}:${record.session}`,record:record.id});t.objectStore('records').add(record);t.oncomplete=resolve;t.onabort=()=>reject(t.error||new Error('저장 실패'));t.onerror=()=>{};});}
