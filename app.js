import {SKILLS as DEF,TN,JD,mins,hm,p2,ds,weekStart,limits,quota,done,rem,since,overdue,score,build} from "./domain.js";
import * as db from "./db.js";
const S=[],A=()=>S.filter(s=>s.on!==false),BM={wo:15,ca:10,pr:10,ma:10,en:5,gb:5,zh:5,os:5,gd:5};
const $=i=>document.getElementById(i),G=id=>S.find(s=>s.id===id);
const st={E:[],modes:{},set:{sleep:"19:30",wake:"04:30"},plan:null,timer:null,tab:0,skip:[]};
const uid=()=>crypto.randomUUID?crypto.randomUUID():Date.now()+"-"+Math.random().toString(36).slice(2);
const ctx=()=>({E:st.E,mode:st.modes[weekStart()]||"normal",wk:weekStart(),today:ds(new Date()),sleep:mins(st.set.sleep),skip:st.skip,skills:A()});
const save=(k,v)=>db.set(k,v).catch(()=>{});
const now5=()=>{const d=new Date();return Math.ceil((d.getHours()*60+d.getMinutes())/5)*5};
let aud,wl,upd=false,tmKey="";
function nav(){const n=[["Hari Ini"],["Papan"],["Giliran"],["Skill"],["Aturan"]];
 $("nav").innerHTML=n.map((x,i)=>`<button data-a="tab" data-i="${i}" class="${i===st.tab?"on":""}">${x[0]}</button>`).join("")}
function modes(){const m=ctx().mode;$("modes").innerHTML=[["normal","Normal"],["sibuk","Sibuk −40%"],["libur","Libur −70%"]].map(x=>`<button class="ch ${m===x[0]?"on":""}" data-a="md" data-m="${x[0]}">${x[1]}</button>`).join("")}
function rail(pl,c,L,wake){const T=c.sleep-wake,pc=m=>Math.max(0,Math.min(100,(m-wake)/T*100)).toFixed(2);
 const seg=pl.b.map(b=>`<i class="sg ${(G(b.id)||{t:"p"}).t}" style="left:${pc(b.a)}%;width:${(b.len/T*100).toFixed(2)}%"></i>`).join("");
 const tk=[L.wo,L.hot,L.end].map(m=>`<i class="tk" style="left:${pc(m)}%"></i>`).join("");
 const n=now5(),nw=n>=wake&&n<=c.sleep?`<i class="nw" style="left:${pc(n)}%"></i>`:"";
 return `<div class="cd"><div class="rail" style="background:linear-gradient(90deg,#3a3f7a 0%,#2c3160 ${pc(L.hot)}%,#4a2650 ${pc(L.end)}%,#150f2a 100%)">${seg}${tk}${nw}</div><div class="sb" style="margin-top:6px">Jalur hari ${hm(wake)}–${hm(c.sleep)}. Garis putih: batas workout, menegangkan, dan aktif. Zona gelap di kanan: rutinitas malam dan tidur.</div></div>`}
function today(){const c=ctx(),L=limits(c.sleep),wake=mins(st.set.wake),pl=st.plan&&st.plan.d===c.today?st.plan:null;
 const av=pl?pl.av:60,a=pl?pl.a:Math.max(now5(),wake);
 let h=`<div class="cd"><h2>Berapa menit waktu kosongmu?</h2><div class="row">${[15,30,45,60,90,120,180].map(m=>`<button class="ch ${pl&&m===av?"on":""}" data-a="av" data-v="${m}">${m} mnt</button>`).join("")}</div>
<div class="row" style="margin-top:10px"><label class="sb">Atau<input id="cv" type="number" min="10" max="480" placeholder="menit"></label><label class="sb">Mulai<input id="sj" type="time" value="${hm(a)}"></label></div>
<button class="bt w" data-a="go">Susun rencana</button>
<div class="sb" style="margin-top:8px">Rencana mengisi sekitar 80% waktumu dan berhenti pukul ${hm(L.end)}. Workout selesai ${hm(L.wo)}, aktivitas menegangkan ${hm(L.hot)}.</div></div>`;
 if(pl){h+=rail(pl,c,L,wake);
  if(!pl.b.length)h+=`<div class="cd"><b>Tidak ada blok yang muat.</b><div class="sb">Waktu sudah dekat batas aktif ${hm(L.end)}, atau kuota minggu ini sudah penuh. Saatnya jeda dan rutinitas malam.</div></div>`;
  pl.b.forEach((b,i)=>{const s=G(b.id);if(!s)return;
   h+=`<div class="cd bl ${s.t} ${b.eid?"done":""}"><div><b>${s.n}</b>${b.ov?'<span class="bd">Giliran wajib</span>':""}</div>
<div class="sb">${hm(b.a)}–${hm(b.a+b.len)}, ${b.len} mnt, sisa kuota ${rem(s,c)} mnt</div>
<details><summary>Isi blok</summary><div class="sb">${s.isi}</div></details>
<div class="row" style="margin-top:8px"><button class="bt" data-a="tb" data-i="${i}">Mulai timer</button><button class="bt ${b.eid?"g":"ok"}" data-a="dn" data-i="${i}">${b.eid?"Batal selesai":"Selesai"}</button><button class="bt g" data-a="sw" data-i="${i}">Tukar</button></div></div>`;
   if(b.br>0)h+=`<div class="br"><b>Jeda ${b.br} mnt (${hm(b.a+b.len)}–${hm(b.a+b.len+b.br)})</b><br>Sesudah ${s.n}: ${s.br}<br>Isi waktu jeda: ${JD[b.br<=5?5:b.br<=10?10:15]}.<div class="row" style="margin-top:6px"><button class="ch" data-a="tj" data-i="${i}">Mulai timer jeda</button></div></div>`})}
 $("t0").innerHTML=h}
function board(){const c=ctx();let T=0,D=0;A().forEach(s=>{T+=quota(s,c);D+=Math.min(quota(s,c),done(s,c))});
 let h=`<div class="cd"><h2>Papan minggu ini</h2><div class="sb">Total ${D} dari ${T} mnt (${Math.round(100*D/T)}%), mode ${c.mode}</div><div class="bar"><i style="width:${100*D/T}%;background:var(--ac)"></i></div></div>`;
 [["p","Primer"],["s","Secondary"],["t","Tersier"]].forEach(([k,n])=>{h+=`<div class="cd"><h2>${n}</h2>`+A().filter(s=>s.t===k).map(s=>`<div class="sk"><b>${s.n}</b> <span class="sb">${done(s,c)} dari ${quota(s,c)} mnt</span><div class="bar ${k}"><i style="width:${Math.min(100,100*done(s,c)/quota(s,c))}%"></i></div><div class="row">${[10,25,45].map(m=>`<button class="ch" data-a="add" data-s="${s.id}" data-m="${m}">+${m}</button>`).join("")}<button class="ch" data-a="undo" data-s="${s.id}">Urungkan</button></div></div>`).join("")+"</div>"});
 $("t1").innerHTML=h+`<div class="sb">Catat sesi di luar rencana dengan tombol +.</div>`}
function turn(){const c=ctx(),L=A().slice().sort((a,b)=>score(b,c)-score(a,c));
 let h=`<div class="cd"><h2>Antrian giliran</h2><div class="sb">Setiap skill dijamin dapat giliran. Skill yang lama tidak disentuh dan kuotanya paling tertinggal naik ke atas. Lewat batas hari (primer 2, secondary 3, tersier 4), statusnya “Giliran wajib”.</div></div>`;
 L.forEach((s,i)=>{const d=since(s,c),full=!rem(s,c);h+=`<div class="cd bl ${s.t}"><b>${i+1}. ${s.n}</b>${overdue(s,c)?'<span class="bd">Giliran wajib</span>':""}${i<3&&!full?'<span class="bd nx">Berikutnya</span>':""}<div class="sb">${d>=9?"Belum pernah dikerjakan":d===0?"Terakhir: hari ini":"Terakhir: "+d+" hari lalu"}; ${full?"kuota minggu ini penuh":"sisa "+rem(s,c)+" mnt"}</div></div>`});
 $("t2").innerHTML=h}
function rules(){const L=limits(mins(st.set.sleep));
 $("t4").innerHTML=`<div class="cd"><h2>Sistem 4 aturan</h2><ul><li><b>Kuota mingguan:</b> kerjakan kapan saja, asal kuota terkejar.</li><li><b>Dosis minimum:</b> hari kacau tetap 10–15 mnt. Boleh lewat sekali, jangan dua hari berturut-turut.</li><li><b>Menu sesuai waktu:</b> pagi 2 menit, isi waktu kosong lewat tab Hari Ini. Urutan: Workout, primer tertinggal, secondary, tersier.</li><li><b>Penyangga dan reset:</b> isi sekitar 80% waktu kosong. Tiap Minggu 15 mnt: cek Papan dan pilih mode minggu depan.</li></ul></div>
<div class="cd"><h2>Pelindung tidur (${st.set.sleep}–${st.set.wake})</h2><ul><li>Workout selesai ${hm(L.wo)}</li><li>Osu!, Geometry Dash, partai catur selesai ${hm(L.hot)}</li><li>Semua aktivitas selesai ${hm(L.end)}</li><li>Kafein terakhir ${hm(mins(st.set.sleep)-480)}</li><li>${hm(L.end)}–${st.set.sleep}: rutinitas malam (makan ringan, cuci muka dan kaki air hangat, tulis to-do besok 5 mnt, lampu redup, layar mati)</li></ul><div class="sb">Kalau acara molor, korbankan sesi, bukan tidur.</div></div>
<div class="cd"><h2>Cara istirahat</h2><ul><li><b>Jeda 5 mnt</b> (blok 30 mnt atau kurang): ${JD[5]}.</li><li><b>Jeda 10 mnt</b> (blok lebih panjang): ${JD[10]}.</li><li><b>Jeda 15 mnt</b> (setelah tiap 2 blok): ${JD[15]}.</li><li><b>Antar ronde workout:</b> 60–90 detik, napas hidung, jalan di tempat.</li><li><b>Tidur siang:</b> maksimal 20 mnt, selesai sebelum 14:00.</li></ul></div>
<div class="cd"><h2>Menu per skill</h2>${A().map(s=>`<details><summary>${s.n} (minimum ${s.min} mnt)</summary><div class="sb">${s.isi}<br><b>Jeda:</b> ${s.bm>0?s.bm+" mnt":"otomatis"}. ${s.br}</div></details>`).join("")}</div>`}
function sett(){$("t5").innerHTML=`<div class="cd"><h2>Jam tidur</h2><div class="row"><label class="sb">Tidur<input id="sl" type="time" value="${st.set.sleep}"></label><label class="sb">Bangun<input id="wk" type="time" value="${st.set.wake}"></label></div><div class="sb" style="margin-top:6px">Batas aktivitas dihitung otomatis dari jam tidur dan berlaku untuk rencana berikutnya.</div></div>
<div class="cd"><h2>Data</h2><div class="row"><button class="bt g" data-a="ej">Ekspor JSON</button><button class="bt g" data-a="ec">Ekspor CSV</button><label class="bt g">Impor JSON<input id="im" type="file" accept=".json,application/json" hidden></label></div><div class="sb" id="ps" style="margin-top:8px"></div><button class="bt g w" data-a="pr">Minta penyimpanan persisten</button><button class="bt dg w" data-a="wp">Hapus semua data</button></div>
<div class="cd sb">Sch v1.3. Data hanya tersimpan di perangkat ini. Ekspor cadangan secara berkala.</div>`;
 if(navigator.storage&&navigator.storage.persisted)navigator.storage.persisted().then(p=>{const e=$("ps");if(e)e.textContent=p?"Penyimpanan persisten: aman dari pembersihan otomatis.":"Penyimpanan belum persisten. Ekspor cadangan berkala."})}
const esc=t=>String(t==null?"":t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const cl=t=>String(t==null?"":t).replace(/[<>]/g,"").trim(),jm=m=>Math.floor(m/60)+"j "+p2(m%60)+"m";
function skillsV(){const e=st.edit;
 if(e){const s=e==="new"?{n:"",t:"s",q:120,len:35,min:10,bm:0,w:0,hot:0,isi:"",br:""}:G(e);if(!s){st.edit=null;return skillsV()}
  const ty=s.w?"w":s.hot?"h":"n",op=(arr,v)=>arr.map(x=>`<option value="${x[0]}" ${v===x[0]?"selected":""}>${x[1]}</option>`).join("");
  $("t3").innerHTML=`<div class="cd fm"><h2>${e==="new"?"Skill baru":"Edit skill"}</h2>
<label class="f">Nama<input id="f_n" value="${esc(s.n)}" maxlength="30"></label>
<label class="f">Prioritas<select id="f_t">${op([["p","Primer"],["s","Secondary"],["t","Tersier"]],s.t)}</select></label>
<div class="f">Kuota per minggu</div><div class="two"><label class="f">Jam<input id="f_qh" type="number" min="0" max="40" value="${Math.floor(s.q/60)}"></label><label class="f">Menit<input id="f_qm" type="number" min="0" max="59" step="5" value="${s.q%60}"></label></div>
<div class="two"><label class="f">Panjang blok (mnt)<input id="f_len" type="number" min="5" max="180" step="5" value="${s.len}"></label><label class="f">Dosis minimum (mnt)<input id="f_min" type="number" min="5" max="120" step="5" value="${s.min}"></label></div>
<label class="f">Istirahat setelah satu blok (mnt)<input id="f_bm" type="number" min="0" max="60" value="${s.bm||0}"></label><div class="sb" style="margin-bottom:8px">0 berarti otomatis: 5 mnt untuk blok 30 mnt atau kurang, 10 mnt untuk blok lebih panjang, 15 mnt setelah tiap 2 blok.</div>
<label class="f">Cara istirahat dan mengisi jeda<textarea id="f_br">${esc(s.br)}</textarea></label>
<label class="f">Jenis aktivitas<select id="f_ty">${op([["n","Biasa"],["h","Menegangkan (selesai lebih awal sebelum tidur)"],["w","Workout (selesai paling awal sebelum tidur)"]],ty)}</select></label>
<label class="f">Isi blok atau panduan latihan<textarea id="f_isi">${esc(s.isi)}</textarea></label>
<div class="row"><button class="bt" data-a="sk_save">Simpan</button><button class="bt g" data-a="sk_cancel">Batal</button></div></div>`;return}
 const T=A().reduce((a,s)=>a+s.q,0);
 $("t3").innerHTML=`<div class="cd"><h2>Skill dan kuota</h2><div class="sb">Total kuota normal ${jm(T)} per minggu dari ${A().length} skill aktif. Mode Sibuk dan Libur mengalikan kuota ini.</div><button class="bt w" data-a="sk_new">Tambah skill</button></div>`+
 S.map(s=>`<div class="cd bl ${s.t} ${s.on===false?"done":""}"><b>${s.n}</b> <span class="sb">${TN[s.t]}${s.on===false?", nonaktif":""}</span>
<div class="sb">Kuota ${jm(s.q)} per minggu, blok ${s.len} mnt, minimum ${s.min} mnt. Istirahat setelah blok: ${s.bm>0?s.bm+" mnt":"otomatis"}.${s.w?" Workout.":s.hot?" Menegangkan.":""}</div>
<div class="row" style="margin-top:8px"><button class="bt g" data-a="sk_edit" data-id="${s.id}">Edit</button><button class="bt g" data-a="sk_tog" data-id="${s.id}">${s.on===false?"Aktifkan":"Nonaktifkan"}</button><button class="bt g" data-a="sk_del" data-id="${s.id}">Hapus</button></div></div>`).join("")}
const V=[today,board,turn,skillsV,rules,sett];
function render(){$("sub").textContent=`Tidur tetap ${st.set.sleep}–${st.set.wake}. Sisanya fleksibel.`;modes();nav();
 document.querySelectorAll(".tab").forEach((e,i)=>e.classList.toggle("on",i===st.tab));V[st.tab]();renderTm()}
/* timer */
const fmt=ms=>{const s=Math.max(0,Math.ceil(ms/1000));return p2(Math.floor(s/60))+":"+p2(s%60)};
async function lock(){try{if(navigator.wakeLock&&!wl){wl=await navigator.wakeLock.request("screen");wl.addEventListener("release",()=>{wl=null})}}catch(e){}}
function unlock(){try{wl&&wl.release()}catch(e){}wl=null}
function startTimer(label,min,bi,kind){try{aud=aud||new(window.AudioContext||window.webkitAudioContext)();aud.resume&&aud.resume()}catch(e){}
 if(window.Notification&&Notification.permission==="default")Notification.requestPermission();
 st.timer={label,kind,bi,end:Date.now()+min*6e4,st:"run"};save("timer",st.timer);lock();tmKey="";tick()}
function alarm(t){try{[0,.35,.7].forEach(d=>{const o=aud.createOscillator(),g=aud.createGain();o.connect(g);g.connect(aud.destination);o.frequency.value=880;g.gain.value=.2;o.start(aud.currentTime+d);o.stop(aud.currentTime+d+.25)})}catch(e){}
 if(navigator.vibrate)navigator.vibrate([300,150,300,150,600]);
 if(document.hidden&&window.Notification&&Notification.permission==="granted"&&navigator.serviceWorker)navigator.serviceWorker.ready.then(r=>r.showNotification("Sch",{body:t.label+" selesai",tag:"sch-timer"}))}
function renderTm(){const t=st.timer,e=$("tm");if(!t){tmKey="";e.className="tm";e.innerHTML="";return}
 const left=t.st==="run"?t.end-Date.now():t.st==="pause"?t.left:0,key=t.st+"|"+t.label;
 if(key!==tmKey){tmKey=key;e.className="tm on";
  const b=st.plan&&st.plan.b[t.bi];
  e.innerHTML=t.st==="done"?`<b>${t.label} selesai</b><div class="row" style="margin-top:8px">${t.kind==="b"&&b&&!b.eid?'<button data-a="tdone">Tandai selesai</button>':""}<button data-a="tx">Tutup</button></div>`
  :`<b>${t.label}</b><span class="cl">${fmt(left)}</span><div class="row" style="margin-top:8px"><button data-a="tp">${t.st==="run"?"Jeda":"Lanjut"}</button><button data-a="t5">+5 mnt</button><button data-a="tx">Batal</button></div>`}
 const c=e.querySelector(".cl");if(c)c.textContent=fmt(left)}
function tick(){const t=st.timer;if(t&&t.st==="run"&&Date.now()>=t.end){t.st="done";save("timer",t);unlock();alarm(t)}renderTm()}
setInterval(tick,500);
document.addEventListener("visibilitychange",()=>{if(!document.hidden){if(st.timer&&st.timer.st==="run")lock();tick()}});
/* data */
function dl(name,text,type){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1e4)}
const stamp=()=>ds(new Date());
async function act(a,d){const c=ctx();
 if(a==="tab"){st.tab=+d.i;try{localStorage.setItem("schTab",st.tab)}catch(e){}return render()}
  if(a==="sk_new"){st.edit="new";return render()}
 if(a==="sk_edit"){st.edit=d.id;return render()}
 if(a==="sk_cancel"){st.edit=null;return render()}
 if(a==="sk_tog"){const s=G(d.id);if(s){s.on=s.on===false;save("skills",S)}return render()}
 if(a==="sk_del"){const s=G(d.id);if(!s)return;if(st.E.some(e=>e.s===s.id)){alert("Skill ini punya riwayat catatan, jadi tidak bisa dihapus. Pakai Nonaktifkan.");return}
  if(confirm("Hapus skill "+s.n+"?")){S.splice(S.indexOf(s),1);save("skills",S);render()}return}
 if(a==="sk_save"){const v=i=>$(i).value,n=cl(v("f_n")),q=(+v("f_qh")||0)*60+(+v("f_qm")||0),len=+v("f_len"),mn=+v("f_min"),bm=+v("f_bm")||0;
  if(!n)return alert("Nama skill wajib diisi.");
  if(q<10)return alert("Kuota minimal 10 menit per minggu.");
  if(!(len>=5)||!(mn>=5)||mn>len)return alert("Panjang blok dan dosis minimum minimal 5 menit, dan dosis minimum tidak boleh lebih besar dari panjang blok.");
  if(bm<0||bm>60)return alert("Istirahat harus 0 sampai 60 menit.");
  if(S.some(x=>x.n.toLowerCase()===n.toLowerCase()&&x.id!==st.edit))return alert("Nama skill sudah dipakai.");
  const ty=v("f_ty"),o={n,t:v("f_t"),q,len,min:mn,bm,br:cl(v("f_br")),isi:cl(v("f_isi")),w:ty==="w"?1:0,hot:ty==="n"?0:1};
  if(st.edit==="new")S.push({id:"k"+Date.now().toString(36),on:true,...o});else Object.assign(G(st.edit),o);
  save("skills",S);st.edit=null;return render()}
 if(a==="md"){st.modes[weekStart()]=d.m;save("modes",st.modes);return render()}
 if(a==="av"||a==="go"){const v=+d.v||+$("cv").value||(st.plan?st.plan.av:60),[hh,mm]=($("sj").value||"05:00").split(":"),s0=+hh*60+ +mm;
  st.skip=[];st.plan={d:c.today,av:v,a:s0,b:build(ctx(),v,s0)};save("plan",st.plan);return render()}
 if(a==="dn"){const b=st.plan.b[+d.i];
  if(b.eid){const k=st.E.findIndex(e=>e.i===b.eid);if(k>=0)st.E.splice(k,1);db.delLog(b.eid).catch(()=>{});b.eid=0}
  else{const e={i:uid(),d:c.today,s:b.id,m:b.len,src:"plan",c:new Date().toISOString()};st.E.push(e);db.addLog(e).catch(()=>{});b.eid=e.i}
  save("plan",st.plan);return render()}
 if(a==="sw"){const p=st.plan;st.skip.push(p.b[+d.i].id);const kept=p.b.filter(b=>b.eid),t0=kept.length?Math.max(...kept.map(b=>b.a+b.len+b.br)):p.a,cc=ctx();
  cc.skip=[...st.skip,...kept.map(b=>b.id)];p.b=[...kept,...build(cc,p.a+p.av-t0,t0)];save("plan",p);return render()}
 if(a==="tb"){const b=st.plan.b[+d.i];return startTimer(G(b.id).n,b.len,+d.i,"b")}
 if(a==="tj"){const b=st.plan.b[+d.i];return startTimer("Jeda setelah "+G(b.id).n,b.br,+d.i,"j")}
 if(a==="tp"){const t=st.timer;if(t.st==="run"){t.left=t.end-Date.now();t.st="pause";unlock()}else{t.end=Date.now()+t.left;t.st="run";lock()}save("timer",t);tmKey="";return tick()}
 if(a==="t5"){const t=st.timer;if(t.st==="run")t.end+=3e5;else t.left+=3e5;save("timer",t);return tick()}
 if(a==="tx"){st.timer=null;unlock();save("timer",null);return renderTm()}
 if(a==="tdone"){const t=st.timer;st.timer=null;save("timer",null);unlock();renderTm();const b=st.plan&&st.plan.b[t.bi];if(b&&!b.eid)return act("dn",{i:t.bi})}
 if(a==="add"){const e={i:uid(),d:c.today,s:d.s,m:+d.m,src:"manual",c:new Date().toISOString()};st.E.push(e);db.addLog(e).catch(()=>{});return render()}
 if(a==="undo"){const l=st.E.filter(e=>e.s===d.s&&e.d>=c.wk).sort((x,y)=>x.c<y.c?-1:1).pop();
  if(l){st.E=st.E.filter(e=>e!==l);db.delLog(l.i).catch(()=>{});if(st.plan)st.plan.b.forEach(b=>{if(b.eid===l.i)b.eid=0})}return render()}
 if(a==="ej")return dl("sch-"+stamp()+".json",JSON.stringify({format:"sch-export",version:1,exportedAtUtc:new Date().toISOString(),settings:st.set,modes:st.modes,skills:S,logEntries:st.E},null,1),"application/json");
 if(a==="ec"){const r=st.E.slice().sort((x,y)=>x.d<y.d?-1:1).map(e=>{const s=G(e.s);return [e.i,e.d,e.s,s?s.n:"",s?s.t:"",e.m,e.src||"",e.c||""].join(",")});
  return dl("sch-log-"+stamp()+".csv","id,date,skill_id,skill_name,tier,minutes,source,created_at_utc\n"+r.join("\n"),"text/csv")}
 if(a==="pr"){try{await navigator.storage.persist()}catch(e){}return sett()}
 if(a==="wp"){if(confirm("Hapus SEMUA data di perangkat ini? Tindakan ini tidak bisa dibatalkan.")&&confirm("Yakin? Ekspor JSON dulu bila ingin menyimpan cadangan.")){try{await db.wipe()}catch(e){}location.reload()}}}
document.addEventListener("click",e=>{const b=e.target.closest("[data-a]");if(b)act(b.dataset.a,b.dataset)});
document.addEventListener("change",async e=>{const t=e.target;
 if(t.id==="sl"||t.id==="wk"){if(t.value){st.set[t.id==="sl"?"sleep":"wake"]=t.value;save("set",st.set);render()}}
 if(t.id==="im"&&t.files[0]){try{const j=JSON.parse(await t.files[0].text());
  if(j.format!=="sch-export"||!(j.version<=1)||!Array.isArray(j.logEntries))throw 0;
  const have=new Set(st.E.map(x=>x.i)),add=j.logEntries.filter(x=>x&&x.i&&x.s&&x.d&&x.m>0&&!have.has(x.i));
  if(!confirm("Impor "+add.length+" entri baru (digabung dengan data sekarang)?"))return;
  for(const x of add){st.E.push(x);await db.addLog(x)}
  if(Array.isArray(j.skills)){const ids=new Set(S.map(x=>x.id));j.skills.filter(x=>x&&x.id&&x.n&&x.q>=10&&!ids.has(x.id)).forEach(x=>S.push({...x,n:cl(x.n),br:cl(x.br),isi:cl(x.isi)}));save("skills",S)}
  st.modes=Object.assign({},j.modes||{},st.modes);save("modes",st.modes);render()}catch(err){alert("Berkas tidak valid. Pilih berkas ekspor JSON dari Sch.")}t.value=""}});
(async()=>{try{const[E,m,s,p,t,k]=await Promise.all([db.logs(),db.get("modes"),db.get("set"),db.get("plan"),db.get("timer"),db.get("skills")]);
  st.E=E||[];st.modes=m||{};st.set=Object.assign(st.set,s||{});st.plan=p||null;st.timer=t||null;if(k&&k.length)S.push(...k)}catch(e){$("off").textContent="Penyimpanan tidak tersedia"}
 if(!S.length){S.push(...DEF.map(x=>({...x,bm:BM[x.id]||0,on:true})));save("skills",S)}
 try{st.tab=+(localStorage.getItem("schTab")||0)||0}catch(e){}
 if(st.timer&&st.timer.st==="run"&&Date.now()>=st.timer.end)st.timer.st="done";
 render();try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}
 if("serviceWorker" in navigator){
  navigator.serviceWorker.register("./sw.js").then(r=>r.addEventListener("updatefound",()=>{const n=r.installing;n.addEventListener("statechange",()=>{
   if(n.state==="installed"&&navigator.serviceWorker.controller){const u=$("upd");u.hidden=false;u.innerHTML='<b>Versi baru tersedia.</b><div class="row" style="margin-top:8px"><button class="bt" id="ub">Perbarui</button></div>';
    $("ub").onclick=()=>{if(st.timer&&st.timer.st==="run"&&!confirm("Timer sedang berjalan. Perbarui sekarang?"))return;upd=true;n.postMessage("skip")}}})})).catch(()=>{$("off").textContent="Offline belum aktif"});
  navigator.serviceWorker.addEventListener("controllerchange",()=>{if(upd)location.reload()});
  navigator.serviceWorker.ready.then(()=>{$("off").textContent="✓ Siap offline"})}
 else $("off").textContent="Buka lewat https agar bisa offline"})();
if(globalThis.__SCHTEST)globalThis.__t={st,act,render,V,S};
