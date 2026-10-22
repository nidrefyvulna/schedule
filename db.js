let P;
const open=()=>new Promise((res,rej)=>{const r=indexedDB.open("sch",1);r.onupgradeneeded=()=>{const d=r.result;d.createObjectStore("kv",{keyPath:"k"});d.createObjectStore("log",{keyPath:"i"})};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
const tx=(st,m,fn)=>(P||(P=open())).then(d=>new Promise((res,rej)=>{const t=d.transaction(st,m),r=fn(t);t.oncomplete=()=>res(r&&r.result);t.onerror=()=>rej(t.error);t.onabort=()=>rej(t.error)}));
export const get=k=>tx("kv","readonly",t=>t.objectStore("kv").get(k)).then(x=>x&&x.v);
export const set=(k,v)=>tx("kv","readwrite",t=>{t.objectStore("kv").put({k,v})});
export const logs=()=>tx("log","readonly",t=>t.objectStore("log").getAll());
export const addLog=e=>tx("log","readwrite",t=>{t.objectStore("log").put(e)});
export const delLog=i=>tx("log","readwrite",t=>{t.objectStore("log").delete(i)});
export const wipe=()=>tx(["kv","log"],"readwrite",t=>{t.objectStore("kv").clear();t.objectStore("log").clear()});
