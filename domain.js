export const TN={p:"Primer",s:"Secondary",t:"Tersier"};
export const TW={p:3,s:2,t:1.4},TH={p:2,s:3,t:4},MD={normal:1,sibuk:.6,libur:.3};
export const JD={5:"berdiri, lihat jauh 20 detik, minum, napas lambat (tarik 4, buang 6) × 6",10:"jalan 2–3 mnt, regangkan leher dan pinggul, minum air",15:"keluar ruangan (cahaya), camilan atau buah, tanpa layar"};
export const SKILLS=[
{id:"wo",n:"Workout",t:"p",q:205,min:12,len:35,w:1,hot:1,isi:"Ikuti sesi hari itu: atas, stamina HIIT, bawah, pemulihan, full body. Pemanasan 5 mnt dan pendinginan 5 mnt. Dosis minimum 12 mnt: squat, push-up, plank, mountain climber, 3 ronde.",br:"Mandi hangat + camilan protein-karbo (pisang + telur/susu), minum air."},
{id:"ca",n:"Catur",t:"p",q:195,min:10,len:45,hot:1,isi:"Puzzle taktik, lalu pembukaan/endgame, lalu partai + analisis. Dosis minimum: 10 puzzle.",br:"Jalan 3 mnt, lihat jauh, tanpa layar. Jangan langsung lanjut blitz."},
{id:"pr",n:"Pemrograman",t:"p",q:190,min:15,len:45,isi:"Konsep baru, soal algoritma, atau fitur proyek. Dosis minimum: 1 soal atau 1 fungsi kecil.",br:"Berdiri, regangkan leher dan pergelangan, aturan 20-20-20 untuk mata."},
{id:"ma",n:"Matematika",t:"p",q:190,min:15,len:45,isi:"Teori 10 mnt, soal campuran, review buku kesalahan. Dosis minimum: 3 soal.",br:"Tutup buku, jalan sebentar, minum air. Biarkan otak istirahat tanpa layar."},
{id:"en",n:"Bahasa Inggris",t:"s",q:145,min:10,len:35,isi:"Gilir: listening, membaca, menulis, speaking. Dosis minimum: 10 kosakata + 1 klip.",br:"Pejamkan mata 1 mnt, napas lambat, minum air."},
{id:"gb",n:"Menggambar",t:"s",q:135,min:10,len:35,isi:"Gestur 5–10 pose, bentuk dasar, studi. Dosis minimum: 5 gestur × 1 mnt.",br:"Kibaskan tangan, regangkan pergelangan dan jari, lihat jauh."},
{id:"zh",n:"Bahasa Mandarin",t:"t",q:85,min:10,len:25,isi:"Kosakata (kartu hafalan), nada, hanzi. Dosis minimum: 10 kartu.",br:"Berdiri, minum air, lihat keluar jendela."},
{id:"os",n:"Osu!",t:"t",q:60,min:10,len:25,hot:1,isi:"Pemanasan 5 mnt, 1–2 map satu tingkat di atas level nyaman, tonton replay. Dosis minimum: 2 map.",br:"Kibaskan dan regangkan tangan 1–2 mnt, rileks bahu, lihat jauh."},
{id:"gd",n:"Geometry Dash",t:"t",q:60,min:10,len:25,hot:1,isi:"Practice mode per bagian, fokus konsistensi. Dosis minimum: 1 bagian. Berhenti bila frustrasi.",br:"Regangkan tangan, napas 6 kali, jalan 2 mnt."}];
export const p2=n=>String(n).padStart(2,"0");
export const mins=t=>{const[h,m]=t.split(":");return +h*60+ +m};
export const hm=m=>p2(Math.floor(m/60))+":"+p2(m%60);
export const ds=d=>d.getFullYear()+"-"+p2(d.getMonth()+1)+"-"+p2(d.getDate());
export const weekStart=(d=new Date())=>{const x=new Date(d);x.setDate(x.getDate()-(x.getDay()+6)%7);return ds(x)};
export const limits=sl=>({end:sl-60,hot:sl-90,wo:sl-120});
export const quota=(s,c)=>Math.max(10,Math.round(s.q*MD[c.mode]/5)*5);
export const done=(s,c)=>c.E.filter(e=>e.s===s.id&&e.d>=c.wk).reduce((a,e)=>a+e.m,0);
export const rem=(s,c)=>Math.max(0,quota(s,c)-done(s,c));
export const since=(s,c)=>{const l=c.E.filter(e=>e.s===s.id).map(e=>e.d).sort().pop();return l?Math.round((new Date(c.today)-new Date(l))/864e5):9};
export const overdue=(s,c)=>rem(s,c)>0&&since(s,c)>=TH[s.t];
export const score=(s,c)=>{const r=rem(s,c);if(!r)return 0;const d=since(s,c);return TW[s.t]*r/quota(s,c)+.35*Math.min(d,5)+(d>=TH[s.t]?5:0)};
export function build(c,av,a){
 const L=limits(c.sleep),cap=Math.min(a+av,L.end),eff=cap-a;if(eff<10)return[];
 const use=eff<25?eff:Math.floor(eff*.8/5)*5;let t=a,u=0;const o=[];
 const cand=(c.skills||SKILLS).filter(s=>rem(s,c)>0&&!c.skip.includes(s.id)).sort((x,y)=>(y.w?1:0)-(x.w?1:0)||score(y,c)-score(x,c));
 for(const s of cand){const left=use-u;let len=Math.floor(Math.min(s.len,rem(s,c),left)/5)*5;
  if(len<s.min){if(rem(s,c)>=s.min&&left>=s.min)len=s.min;else continue}
  const lim=s.w?L.wo:s.hot?L.hot:L.end;
  if(t+len>lim){len=Math.floor((lim-t)/5)*5;if(len<s.min)continue}
  const br=s.bm>0?s.bm:o.length%2?15:len<=30?5:10,b=Math.min(br,Math.max(0,L.end-(t+len)));
  o.push({id:s.id,a:t,len,br:b,ov:overdue(s,c)});t+=len+br;u+=len+br}
 return o}
