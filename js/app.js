const C=window.CFG,sb=supabase.createClient(C.SUPABASE_URL,C.SUPABASE_KEY),$=s=>document.querySelector(s),main=$('#main');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
const yt=u=>/^https?:\/\/(www\.|m\.|music\.)?(youtube\.com|youtu\.be)\//.test(u);
const getTitle=async u=>{
  for(const f of ['https://noembed.com/embed?url=','https://www.youtube.com/oembed?format=json&url=']){
    const c=new AbortController(),t=setTimeout(()=>c.abort(),6000);
    try{const r=await(await fetch(f+encodeURIComponent(u),{signal:c.signal})).json();if(r&&r.title&&!r.error)return String(r.title).slice(0,150)}catch(e){}finally{clearTimeout(t)}
  }return''};
const dataFile=(u,n)=>{const b=atob(u.split(',')[1]),a=new Uint8Array(b.length);for(let i=0;i<b.length;i++)a[i]=b.charCodeAt(i);return new File([a],n,{type:'image/png'})};
const qrUrls={};

const ICO={
 home:'<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/><path d="M10 19.5v-5h4v5"/>',
 chat:'<path d="M20.5 12a8.5 8.5 0 0 1-12.3 7.6L3.5 20.5l1-4.5A8.5 8.5 0 1 1 20.5 12z"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 ticket:'<path d="M3 9a2 2 0 0 0 0 6v2.5A1.5 1.5 0 0 0 4.5 19h15a1.5 1.5 0 0 0 1.5-1.5V15a2 2 0 0 1 0-6V6.5A1.5 1.5 0 0 0 19.5 5h-15A1.5 1.5 0 0 0 3 6.5z"/><path d="M14 5v3M14 10.5v3M14 16v3"/>',
 shield:'<path d="M12 3 4.5 6v5.5c0 4.6 3.2 7.8 7.5 9.5 4.3-1.7 7.5-4.9 7.5-9.5V6z"/><path d="m9 12 2.2 2.2L15 10.5"/>',
 pin:'<path d="M12 21s7-6.1 7-11.2A7 7 0 0 0 5 9.8C5 14.9 12 21 12 21z"/><circle cx="12" cy="9.8" r="2.4"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/>',
 cal:'<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
 note:'<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>',
 play:'<path d="M7 4.5v15l12.5-7.5z" fill="currentColor" stroke="none"/>',
 pause:'<rect x="6" y="4.5" width="4.2" height="15" rx="1.2" fill="currentColor" stroke="none"/><rect x="13.8" y="4.5" width="4.2" height="15" rx="1.2" fill="currentColor" stroke="none"/>',
 next:'<path d="M5 5v14l10-7z" fill="currentColor" stroke="none"/><path d="M19 5v14"/>',
 vol:'<path d="M11 5 6.5 9H3v6h3.5L11 19z"/><path d="M15 9a4.2 4.2 0 0 1 0 6M17.8 6.2a8 8 0 0 1 0 11.6"/>',
 shuffle:'<path d="M3 7h3.5c5 0 5 10 10 10H21M3 17h3.5c1.4 0 2.5-.6 3.4-1.6M14 8.4c.8-.9 1.8-1.4 3-1.4H21"/><path d="m18.5 4.5 2.5 2.5-2.5 2.5M18.5 14.5l2.5 2.5-2.5 2.5"/>',
 phone:'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
 ig:'<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor"/>',
 share:'<path d="M12 15V4M8 8l4-4 4 4"/><path d="M5 12v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>'};
const svg=(n,c='')=>`<svg class="ic ${c}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICO[n]||''}</svg>`;
const GLOGO='<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>';
const avc=n=>{let h=0;for(const c of String(n))h=(h*31+c.charCodeAt(0))%360;return `background:linear-gradient(135deg,hsl(${h} 85% 62%),hsl(${(h+55)%360} 80% 50%))`};
const skel='<div class="sk h"></div><div class="sk"></div><div class="sk"></div>';
function confetti(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const c=document.createElement('canvas');c.style.cssText='position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:200';document.body.appendChild(c);
  const x=c.getContext('2d'),W=c.width=innerWidth,H=c.height=innerHeight,cols=['#ff4d8d','#8b5cf6','#22d3ee','#ffb020','#34d399','#ffffff'];
  const P=Array.from({length:150},()=>({x:W/2+(Math.random()-.5)*90,y:H*.6,vx:(Math.random()-.5)*15,vy:-Math.random()*17-6,s:6+Math.random()*7,r:Math.random()*6,vr:(Math.random()-.5)*.4,c:cols[Math.random()*cols.length|0]}));
  let t=0;(function f(){t++;x.clearRect(0,0,W,H);P.forEach(p=>{p.vy+=.45;p.x+=p.vx;p.y+=p.vy;p.vx*=.99;p.r+=p.vr;x.save();x.translate(p.x,p.y);x.rotate(p.r);x.fillStyle=p.c;x.fillRect(-p.s/2,-p.s/4,p.s,p.s/2);x.restore()});if(t<180)requestAnimationFrame(f);else c.remove()})()}
let user=null,view='home',ready=0,last=null,selEv=null,afterV=null,EV=[],AEV=[];
const isAdmin=()=>user&&user.email===C.ADMIN_EMAIL;
const mark=()=>{const v=view==='list'?'home':view;document.body.dataset.view=v;document.querySelectorAll('#mb a').forEach(a=>a.classList.toggle('on',a.dataset.v===v))};
const fdate=d=>d.toLocaleDateString('es-AR',{weekday:'long',day:'numeric',month:'long'});
const fshort=d=>d.toLocaleDateString('es-AR',{day:'2-digit',month:'2-digit',...(d.getFullYear()!=new Date().getFullYear()?{year:'numeric'}:{})});
const ftime=d=>d.toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit',hour12:false})+' hs';
const google=()=>{try{sessionStorage.setItem('lp_after',afterV||'');sessionStorage.setItem('lp_ev',selEv||'')}catch(e){}return sb.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin}})};
const authErr=e=>{const m=String(e&&e.message||e);
  if(/already registered|already been registered/i.test(m))return'Ese email ya tiene una cuenta. Tocá "Iniciar sesión".';
  if(/invalid login/i.test(m))return'Email o contraseña incorrectos.';
  if(/not confirmed/i.test(m))return'Tenés que confirmar tu email. Revisá tu casilla (y el spam).';
  if(/rate limit|too many|seconds/i.test(m))return'Hay muchos intentos seguidos. Esperá un ratito y probá de nuevo.';
  if(/password/i.test(m))return'La contraseña debe tener al menos 6 caracteres.';
  if(/signups? (not allowed|are disabled)|signup.*disabled|provider.*(disabled|not enabled)/i.test(m))return'El registro con email todavía no está habilitado. Probá con Google o avisale al organizador.';
  if(/(invalid|unable to validate).*email|email.*invalid/i.test(m))return'Ese email no es válido. Revisalo, por favor.';
  console.error('auth',e);
  return'No se pudo completar ('+m+'). Si sigue, avisale al organizador.'};
sb.auth.onAuthStateChange((ev,s)=>{
  const u=s?s.user:null;
  if(ev==='PASSWORD_RECOVERY'){user=u;ready=1;head();setTimeout(recoverView,0);return}
  if(ready&&(u&&u.id)===(user&&user.id))return;
  user=u;ready=1;
  if(u){try{const a=sessionStorage.getItem('lp_after');if(a){view=a;selEv=sessionStorage.getItem('lp_ev')||null}sessionStorage.removeItem('lp_after');sessionStorage.removeItem('lp_ev')}catch(e){}
    if(view==='auth'||view==='recover'){view=afterV||'home';afterV=null}}
  head();setTimeout(()=>go(view),0)});
function head(){
  const items=[['home','Inicio','home'],['contact','Contactos','chat'],['form','Quiero una entrada','plus'],['mine','Mis entradas','ticket']].concat(isAdmin()?[['admin','Admin<span id="bd"></span>','shield']]:[]);
  $('#mb').innerHTML=items.map(([v,t,i])=>`<a data-v="${v}" role="button" tabindex="0">${svg(i)}<span>${t}</span></a>`).join('');
  $('#mb').onclick=e=>{const v=e.target.closest('a')?.dataset.v;if(v)go(v)};
  $('#mb').onkeydown=e=>{if(e.key==='Enter'||e.key===' '){const v=e.target.closest('a')?.dataset.v;if(v){e.preventDefault();go(v)}}};
  const nm=user?(user.user_metadata?.full_name||user.email||''):'';
  $('#me').innerHTML=user?`<span class="who"><i class="av" style="${avc(nm)}">${esc(nm.trim().charAt(0).toUpperCase()||'?')}</i><span>${esc(nm)}</span></span><a id="out" class="lk" role="button" tabindex="0">Salir</a>`:'<button class="bt" id="in">Ingresar</button><button class="bt pri" id="up">Registrarse</button>';
  if($('#out'))$('#out').onclick=()=>sb.auth.signOut();
  if($('#in'))$('#in').onclick=()=>authView('login');if($('#up'))$('#up').onclick=()=>authView('signup');mark();badge()}
$('#brand').onclick=e=>{e.preventDefault();go('home')};
$('#evbox').onpointermove=e=>{const h=e.target.closest('.hero');if(!h)return;const r=h.getBoundingClientRect();h.style.setProperty('--mx',(e.clientX-r.left)+'px');h.style.setProperty('--my',(e.clientY-r.top)+'px')};
$('#evbox').onclick=e=>{const b=e.target.closest('#cta');if(b&&!b.disabled)want(b.dataset.ev)};
function go(v){view=v;mark();main.onclick=null;({home:home,list:home,form:()=>want(selEv),mine:mine,admin:admin,auth:()=>authView('login'),recover:recoverView,contact:contactView}[v]||home)()}

/* ---------- eventos ---------- */
async function loadEvents(){
  const{data,error}=await sb.rpc('get_events');if(error)console.error('eventos',error);
  EV=(data||[]).map(e=>({...e,d:new Date(e.event_at)}));updateCta();return EV}
const upcoming=()=>EV.filter(e=>e.d.getTime()>Date.now()-12*36e5);
const feat=()=>{const u=upcoming();return u.find(e=>!e.sold_out)||u[0]||null};
const mapLink=a=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(a);
const evInfo=e=>`<span>${svg('cal')}${esc(fdate(e.d))}</span><span>${svg('clock')}${ftime(e.d)}</span>${e.address?`<span>${svg('pin')}<a href="${mapLink(e.address)}" target="_blank" rel="noopener">${esc(e.address)}</a></span>`:''}`;
const lowTxt=n=>n==1?'¡Última entrada disponible!':`¡Últimas ${n} entradas disponibles!`;
const evPill=e=>e.sold_out?'<div class="pill red">Agotadas</div>':(e.remaining_low?`<div class="pill hot"><i class="live"></i>${lowTxt(e.remaining_low)}</div>`:'');
const monOf=d=>d.toLocaleDateString('es-AR',{month:'short'}).replace('.','').toUpperCase();
let cdT=0;
function tickCd(){
  const e=feat(),el=$('#cd');if(!e||!el)return;
  const s=Math.floor((e.d.getTime()-Date.now())/1000);
  if(s<=0){if(!el.querySelector('.now'))el.innerHTML='<div class="now"><i class="live"></i>¡La fiesta ya empezó!</div>';return}
  const v=[Math.floor(s/86400),Math.floor(s%86400/3600),Math.floor(s%3600/60),s%60];
  el.querySelectorAll('b').forEach((x,i)=>{const t=String(v[i]).padStart(2,'0');if(x.textContent!==t)x.textContent=t})}
function updateCta(){
  const e=feat(),b=$('#evbox');clearInterval(cdT);
  const eyebrow=C.STATUS_MSG?`<div class="eyebrow"><i class="live"></i>${esc(C.STATUS_MSG)}</div>`:'';
  if(!e){b.innerHTML=`<div class="hero evtop">${eyebrow}<h1 class="evn2">Estamos preparando la próxima fecha</h1><p class="sub">Volvé pronto: apenas se confirme, vas a poder pedir tu entrada desde acá.</p></div>`;return}
  const wd=e.d.toLocaleDateString('es-AR',{weekday:'long'});
  b.innerHTML=`<div class="hero evtop">${eyebrow}<h1 class="evn2">${esc(e.name)}</h1>
   <div class="when"><div class="cal"><span>${monOf(e.d)}</span><b>${e.d.getDate()}</b></div><div class="wh"><span class="wd">${esc(wd)}</span><span class="hr">${svg('clock')}${ftime(e.d)}</span></div></div>
   ${e.address?`<a class="where" href="${mapLink(e.address)}" target="_blank" rel="noopener">${svg('pin')}<span>${esc(e.address)}</span></a>`:''}
   <div class="cd" id="cd"><div><b>00</b><small>días</small></div><div><b>00</b><small>horas</small></div><div><b>00</b><small>min</small></div><div><b>00</b><small>seg</small></div></div>
   ${evPill(e)}${e.sold_out?'':`<button id="cta" class="pri big" data-ev="${e.id}"><span>Quiero una entrada</span>${svg('ticket')}</button>`}</div>`;
  cdT=setInterval(tickCd,1000);tickCd()}
const evCard=e=>`<div class="box ev"><div class="evrow"><div class="cal mini"><span>${monOf(e.d)}</span><b>${e.d.getDate()}</b></div><div><div class="evn">${esc(e.name)}</div><div class="evd">${evInfo(e)}</div></div></div>${evPill(e)}${e.sold_out?'':`<button class="pri" data-ev="${e.id}">Quiero una entrada</button>`}</div>`;

/* ---------- registro / ingreso ---------- */
function authView(mode='login',notice='',after=null){
  view='auth';mark();afterV=after;const su=mode=='signup';
  main.innerHTML=`<div class="box">${notice?`<div class="note">${esc(notice)}</div>`:''}
  <h3>${su?'Creá tu cuenta':'Bienvenido de nuevo'}</h3><p class="hello">${su?'Con tu cuenta te quedan guardadas tus entradas y sus QR.':'Ingresá para pedir y ver tus entradas.'}</p>
  <div class="tabs"><a data-m="login" class="${su?'':'on'}">Iniciar sesión</a><a data-m="signup" class="${su?'on':''}">Crear cuenta</a></div>
  <form id="af" novalidate>${su?'<label>Tu nombre</label><input id="an" autocomplete="name" maxlength="30" placeholder="Cómo te van a ver en la lista">':''}
  <label>Email</label><input id="ae" type="email" autocomplete="email" inputmode="email" placeholder="tu@email.com">
  <label>Contraseña</label><input id="ap" type="password" autocomplete="${su?'new-password':'current-password'}" placeholder="Mínimo 6 caracteres">
  <br><button id="ab" class="pri big" type="submit">${su?'Crear cuenta':'Ingresar'}</button><p id="aer"></p></form>
  ${su?'':'<p><a id="fg" class="lk" role="button" tabindex="0">Olvidé mi contraseña</a></p>'}
  <div class="or">o</div><button id="gg" class="gbtn" type="button">${GLOGO}Seguir con Google</button></div>`;
  const aer=(t,c='bad')=>{$('#aer').className=c;$('#aer').textContent=t};
  main.onclick=e=>{const a=e.target.closest('[data-m]');if(a)authView(a.dataset.m,notice,after)};
  $('#gg').onclick=google;
  if($('#fg'))$('#fg').onclick=async()=>{const em=$('#ae').value.trim();if(!em)return aer('Escribí tu email arriba y volvé a tocar "Olvidé mi contraseña".');
    const{error}=await sb.auth.resetPasswordForEmail(em,{redirectTo:location.origin});
    aer(error?authErr(error):'Listo: si ese email tiene cuenta, te mandamos un enlace para elegir una nueva contraseña.',error?'bad':'ok')};
  $('#af').onsubmit=async e=>{
    e.preventDefault();const em=$('#ae').value.trim(),pw=$('#ap').value,nm=su?$('#an').value.trim():'';
    if(su&&!nm)return aer('Escribí tu nombre.');
    if(!/^\S+@\S+\.\S+$/.test(em))return aer('Escribí un email válido.');
    if(pw.length<6)return aer('La contraseña debe tener al menos 6 caracteres.');
    $('#ab').disabled=true;aer('');
    if(su){
      const{data,error}=await sb.auth.signUp({email:em,password:pw,options:{data:{full_name:nm}}});
      if(error){$('#ab').disabled=false;return aer(authErr(error))}
      if(data.user&&data.user.identities&&data.user.identities.length===0){$('#ab').disabled=false;return aer('Ese email ya tiene una cuenta. Tocá "Iniciar sesión".')}
      if(!data.session){$('#ab').disabled=false;return aer('Te mandamos un mail para confirmar tu cuenta. Confirmalo y después ingresá.','ok')}
    }else{
      const{error}=await sb.auth.signInWithPassword({email:em,password:pw});
      if(error){$('#ab').disabled=false;return aer(authErr(error))}
    }}}
function recoverView(){
  view='recover';mark();main.onclick=null;
  main.innerHTML=`<div class="box"><h3>Elegí una nueva contraseña</h3><form id="rf2" novalidate><label>Nueva contraseña</label><input id="np" type="password" autocomplete="new-password" placeholder="Mínimo 6 caracteres"><br><button type="submit" class="pri big">Guardar</button><p id="rer"></p></form></div>`;
  $('#rf2').onsubmit=async e=>{e.preventDefault();const p=$('#np').value;
    if(p.length<6){$('#rer').className='bad';return $('#rer').textContent='La contraseña debe tener al menos 6 caracteres.'}
    const{error}=await sb.auth.updateUser({password:p});
    if(error){$('#rer').className='bad';return $('#rer').textContent=authErr(error)}
    main.innerHTML='<div class="box"><h3 class="ok">Contraseña actualizada ✔</h3></div>';setTimeout(()=>go('home'),1500)}}

/* ---------- inicio ---------- */
const guest=(r,i)=>`<div class="guest" style="--i:${i}"><i class="av" style="${avc(r.display_name)}">${esc((r.display_name||'?').trim().charAt(0).toUpperCase())}</i><div class="gm"><b>${esc(r.display_name)}</b>${yt(r.song_url)?`<a class="song" href="${esc(r.song_url)}" target="_blank" rel="noopener">${svg('note')}<span>${esc(r.song_title)}</span></a>`:`<span class="song">${svg('note')}<span>${esc(r.song_title)}</span></span>`}</div></div>`;
async function home(){
  main.innerHTML=skel;
  await loadEvents();const ups=upcoming(),f=feat();
  if(!ups.length){if(view==='home'||view==='list')main.innerHTML='<div class="empty">Todavía no hay una fecha confirmada.<b>¡Volvé pronto!</b></div>';return}
  const order=[f,...ups.filter(e=>e!==f)];
  const ls=await Promise.all(order.map(e=>sb.rpc('public_event_list',{p_event_id:e.id})));
  if(view!=='home'&&view!=='list')return;
  main.innerHTML=order.map((e,i)=>{const data=ls[i].data||[];return (i?evCard(e):'')+`<div class="sec"><h2>Conectados${order.length>1?` · ${esc(e.name)}`:''}</h2><span class="cnt">${data.length}</span></div>`+
    (data.map((r,k)=>guest(r,k)).join('')||'<div class="empty">Todavía no hay nadie anotado.<b>¡Sé el primero!</b></div>')}).join('');
  main.onclick=e=>{const b=e.target.closest('[data-ev]');if(b)want(b.dataset.ev)}}

/* ---------- contacto ---------- */
function contactView(){
  const ig=(C.INSTAGRAM||'').trim(),igUrl=ig?(/^https?:/i.test(ig)?ig:'https://instagram.com/'+ig.replace(/^@/,'')):'';
  main.innerHTML=`<div class="box"><h3>Contacto</h3><p class="hello">Escribinos por cualquier duda sobre la fiesta o tu entrada.</p><div class="bignum">${esc(C.PHONE||'')}</div>
  <div class="tiles"><a class="tile" href="https://wa.me/${esc(C.WHATSAPP)}" target="_blank" rel="noopener"><span class="ti">${svg('chat')}</span><span><b>WhatsApp</b><small>Mandanos un mensaje</small></span></a>
  <a class="tile" href="tel:${esc(C.PHONE||'')}"><span class="ti">${svg('phone')}</span><span><b>Llamar</b><small>${esc(C.PHONE||'')}</small></span></a>
  ${igUrl?`<a class="tile" href="${esc(igUrl)}" target="_blank" rel="noopener"><span class="ti">${svg('ig')}</span><span><b>Instagram</b><small>Seguinos para enterarte de todo</small></span></a>`:''}</div></div>`}

/* ---------- pedir entrada ---------- */
async function want(id){
  await loadEvents();const open=upcoming().filter(e=>!e.sold_out);
  const e=id?open.find(x=>x.id==id):(open.length==1?open[0]:null);
  if(!e)return go('home');
  selEv=e.id;
  if(!user)return authView('signup','Registrate para que te quede guardado el QR de tu entrada. Si no te registrás, no podemos guardártelo.','form');
  view='form';mark();main.onclick=null;renderForm(e)}
async function renderForm(ev){
  const{data:p}=await sb.from('profiles').select('display_name').eq('id',user.id).maybeSingle();
  const max=Math.min(10,ev.remaining_low||10),showEv=!feat()||feat().id!==ev.id;let qty=1;
  main.innerHTML=`<div class="box"><h3>Quiero una entrada</h3>
  <div class="evmini${showEv?'':' dup'}"><b>${esc(ev.name)}</b><div class="evd">${evInfo(ev)}</div>${evPill(ev)}</div>
  <label>Tu nombre en la lista</label><input id="dn" maxlength="30" value="${esc(p?.display_name||user.user_metadata?.full_name||'')}">
  <label>Cantidad de entradas</label><div class="step"><button type="button" id="qm" aria-label="Menos">−</button><b id="qv">1</b><button type="button" id="qp" aria-label="Más">+</button><small>máx. ${max}</small></div><div id="nm"></div>
  <label>Canción que no puede faltar</label><input id="su" placeholder="Pegá el enlace de YouTube"><div id="sp" class="sp"></div><input id="st" placeholder="Nombre de la canción" maxlength="150" hidden>
  <br><button id="go" class="pri big">Enviar solicitud</button><p id="er"></p></div>`;
  const names=()=>{const old=[...document.querySelectorAll('.nm')].map(i=>i.value);$('#nm').innerHTML=Array.from({length:qty},(_,i)=>`<input class="nm" placeholder="Nombre y apellido de la entrada ${i+1}" maxlength="40" value="${esc(old[i]||'')}">`).join('')};
  const setQ=n=>{qty=Math.min(max,Math.max(1,n));$('#qv').textContent=qty;names()};
  names();$('#qm').onclick=()=>setQ(qty-1);$('#qp').onclick=()=>setQ(qty+1);
  let seq=0,tm;
  const peek=async()=>{
    const u=$('#su').value.trim(),n=++seq;$('#st').hidden=true;$('#st').value='';
    if(!u){$('#sp').textContent='';return}
    if(!yt(u)){$('#sp').textContent='Ese enlace no parece ser de YouTube.';return}
    $('#sp').textContent='Buscando el título…';
    const t=await getTitle(u);if(n!==seq)return;
    if(t){$('#st').value=t;$('#sp').innerHTML=`<div class="ytp">${vidId(u)?`<img src="https://i.ytimg.com/vi/${vidId(u)}/mqdefault.jpg" alt="">`:''}<span>${esc(t)}</span></div>`}
    else{$('#st').hidden=false;$('#sp').textContent='No pudimos leer el título. Escribilo abajo.'}
  };
  $('#su').oninput=()=>{clearTimeout(tm);tm=setTimeout(peek,500)};
  $('#go').onclick=async()=>{
    const dn=$('#dn').value.trim(),q=qty,ns=[...document.querySelectorAll('.nm')].map(i=>i.value.trim()),su=$('#su').value.trim(),er=m=>$('#er').textContent=m;
    if(!dn||ns.some(n=>!n))return er('Completá tu nombre y el nombre de cada entrada.');
    if(!yt(su))return er('Pegá un enlace de YouTube válido.');
    $('#go').disabled=true;er('');
    let st=$('#st').value.trim();
    if(!st){er('Buscando el título de la canción…');st=await getTitle(su);er('')}
    if(!st){$('#st').hidden=false;$('#go').disabled=false;return er('No pudimos leer el título. Escribilo en el cuadro de abajo.')}
    let r=await sb.from('profiles').upsert({id:user.id,display_name:dn});if(r.error){$('#go').disabled=false;return er('No se pudo guardar tu nombre.')}
    r=await sb.from('requests').insert({user_id:user.id,event_id:ev.id,quantity:q,song_title:st,song_url:su}).select().single();if(r.error){console.error(r.error);$('#go').disabled=false;return er('No se pudo enviar la solicitud.')}
    const t=await sb.from('tickets').insert(ns.map(n=>({request_id:r.data.id,user_id:user.id,holder_name:n})));if(t.error){$('#go').disabled=false;return er('No se pudieron guardar los nombres.')}
    const w=`https://wa.me/${C.WHATSAPP}?text=`+encodeURIComponent(`Hola! Quiero ${q} entrada${q>1?'s':''} para ${ev.name} del ${fshort(ev.d)} a nombre de:\n`+ns.map(n=>'- '+n).join('\n'));
    main.innerHTML=`<div class="box"><h3>¡Solicitud enviada! 🎉</h3><p class="hello">Abrimos WhatsApp para avisar. Cuando la aprueben, vas a ver tus QR en "Mis entradas": quedan guardados en tu cuenta.</p><a class="bt pri big" href="${w}">Abrir WhatsApp</a></div>`;confetti();setTimeout(()=>location.href=w,2600)}}

/* ---------- mis entradas (historial por evento) ---------- */
async function mine(){
  if(!user)return authView('login','Ingresá para ver tus entradas guardadas.','mine');
  main.innerHTML=skel;
  const[rq]=await Promise.all([sb.from('requests').select('*,tickets(*)').eq('user_id',user.id).order('created_at',{ascending:false}),loadEvents()]);
  if(view!=='mine')return;
  const rows=rq.data||[];
  const groups=[];rows.forEach(r=>{const k=r.event_id||'none';let g=groups.find(x=>x.k==k);if(!g){g={k,e:EV.find(e=>e.id==r.event_id),rs:[]};groups.push(g)}g.rs.push(r)});
  groups.sort((a,b)=>(b.e?b.e.d:0)-(a.e?a.e.d:0));
  const chip=s=>({pending:'<span class="chip wait">Solicitada</span>',approved:'<span class="chip ok">Aprobada</span>',rejected:'<span class="chip no">Rechazada</span>'}[s]||esc(s));
  const stub=(r,t,e)=>r.status!='approved'?`<div class="row">${svg('ticket')}<span>${esc(t.holder_name)}</span></div>`
    :!t.qr_code?`<div class="row"><span>${esc(t.holder_name)}</span><small class="bad">QR no disponible, avisá al organizador</small></div>`
    :`<div class="stub${t.checked_in?' used':''}"><div class="sl"><small>${e?esc(e.name):'La Previa'}</small><b>${esc(t.holder_name)}</b><span class="sd">${e?`${esc(fshort(e.d))} · ${ftime(e.d)}`:''}</span><button class="sm" data-s="${esc(t.qr_code)}" data-n="${esc(t.holder_name)}">${svg('share')}Compartir</button></div><div class="perf"></div><div class="sr"><img data-q="${esc(t.qr_code)}" alt="Código QR de ${esc(t.holder_name)}"><span class="stat">${t.checked_in?'Ya ingresó':'Entrada válida'}</span></div></div>`;
  const box=(r,e)=>`<div class="req"><div class="reqh">${chip(r.status)}<small>${r.quantity} entrada${r.quantity>1?'s':''}</small></div>${(r.tickets||[]).map(t=>stub(r,t,e)).join('')}
    <div class="songrow">${svg('note')}${yt(r.song_url)?`<a class="song" href="${esc(r.song_url)}" target="_blank" rel="noopener"><span>${esc(r.song_title)}</span></a>`:`<span class="song"><span>${esc(r.song_title)}</span></span>`}<button class="sm" data-tg="${r.id}">Cambiar</button></div>
    <div class="songedit" data-ed2="${r.id}"><input data-su="${r.id}" value="${esc(r.song_url)}" placeholder="Pegá el enlace de YouTube de tu nueva canción"><div class="r"><button class="sm pri" data-sv="${r.id}">Guardar nueva canción</button></div><p class="sm" data-sm="${r.id}"></p></div></div>`;
  const title=g=>g.e?`<div class="sec"><h2>Entradas para ${esc(g.e.name)}</h2><span class="cnt plain">${esc(fshort(g.e.d))} · ${ftime(g.e.d)}</span>${g.e.d.getTime()<Date.now()-12*36e5?'<span class="chip wait">Finalizado</span>':''}</div>`:'<div class="sec"><h2>Entradas anteriores</h2></div>';
  main.innerHTML=`<div class="sec" style="margin-top:6px"><h2>Mis entradas</h2><button id="rf" class="sm" style="margin-left:auto">↻ Actualizar</button></div>`+(groups.map(g=>title(g)+g.rs.map(r=>box(r,g.e)).join('')).join('')||'<div class="empty">Todavía no pediste entradas.<b>Cuando las pidas, van a aparecer acá.</b></div>');
  document.querySelectorAll('[data-q]').forEach(async i=>{
    try{
      if(typeof QRCode==='undefined'||typeof QRCode.toDataURL!=='function')throw new Error('la librería de QR no cargó (typeof QRCode = '+typeof QRCode+')');
      const u=await QRCode.toDataURL(i.dataset.q,{width:600,margin:3});qrUrls[i.dataset.q]=u;i.src=u}
    catch(e){console.error('QR',e);const s=document.createElement('span');s.className='bad';s.textContent='No se pudo generar el QR: '+((e&&e.message)||e);i.replaceWith(s)}});
  main.onclick=e=>{const b=e.target.closest('button');if(!b)return;
    if(b.dataset.s)share(b.dataset.s,b.dataset.n);else if(b.dataset.sv)saveSong(b.dataset.sv);else if(b.dataset.tg){const w=document.querySelector(`[data-ed2="${b.dataset.tg}"]`);w.classList.toggle('open');if(w.classList.contains('open'))w.querySelector('input').focus()}else if(b.id=='rf')mine()}}
async function saveSong(id){
  const inp=document.querySelector(`[data-su="${id}"]`),m=document.querySelector(`[data-sm="${id}"]`),b=document.querySelector(`[data-sv="${id}"]`),
    say=(c,t)=>{m.className='sm '+c;m.textContent=t},url=inp.value.trim();
  if(!yt(url))return say('bad','Pegá un enlace de YouTube válido.');
  b.disabled=true;say('','Buscando el título…');
  const title=await getTitle(url);
  if(!title){b.disabled=false;return say('bad','No pudimos leer el título de ese enlace. Revisá que el video exista.')}
  const{error}=await sb.rpc('update_my_song',{p_request_id:String(id),p_url:url,p_title:title});
  if(error){console.error(error);b.disabled=false;return say('bad','No se pudo guardar. Probá de nuevo.')}
  await mine();const m2=document.querySelector(`[data-sm="${id}"]`);if(m2){m2.className='sm ok';m2.textContent='✔ Canción actualizada: '+title;m2.closest('.songedit').classList.add('open')}}
function share(code,name){
  const u=qrUrls[code];if(!u)return alert('El QR todavía se está generando. Probá de nuevo en un segundo.');
  const f=dataFile(u,'entrada-'+name.replace(/[^\w-]+/g,'_')+'.png'),txt='Mi entrada para La Previa - '+name;
  const alt=()=>{const a=document.createElement('a');a.href=u;a.download=f.name;a.click();window.open('https://wa.me/?text='+encodeURIComponent(txt+' (te adjunto el QR)'),'_blank')};
  if(navigator.canShare&&navigator.canShare({files:[f]}))navigator.share({files:[f],title:'Entrada La Previa',text:txt}).catch(e=>{if(e.name!='AbortError')alt()});
  else alt()}
let editId=null;
const loc=d=>{const p=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`};
async function admin(){
  if(!isAdmin())return home();
  const[rq,ev,jk]=await Promise.all([sb.from('requests').select('*,profiles(display_name),tickets(*)').order('created_at',{ascending:false}),sb.from('events').select('*').order('event_at'),sb.from('jukebox').select('*').order('created_at')]);
  const data=rq.data||[];AEV=(ev.data||[]).map(e=>({...e,d:new Date(e.event_at)}));
  const evName=id=>{const e=AEV.find(x=>x.id==id);return e?`${esc(e.name)} del ${fshort(e.d)}`:'Sin evento'};
  const sum=(id,st)=>data.filter(r=>(r.event_id||null)==id&&r.status==st).reduce((a,r)=>a+r.quantity,0);
  const stat=e=>{const s=sum(e.id,'approved'),p=sum(e.id,'pending');return `<div class="ct"><span><b>${esc(e.name)}</b> · ${fshort(e.d)} ${ftime(e.d)}${e.address?` · ${esc(e.address)}`:''}<br>Vendidas ${s} de ${e.capacity} · Quedan ${Math.max(e.capacity-s,0)} · Pendientes ${p}</span><button class="ed sm" data-ed="${e.id}">✏️ Editar</button></div>`};
  const pe=data.filter(r=>r.status=='pending');
  const sold=[...AEV,{id:null,name:'Sin evento'}].map(e=>{const ap=data.filter(r=>r.status=='approved'&&(r.event_id||null)==(e.id||null));if(!ap.length)return'';
    const tk=ap.flatMap(r=>r.tickets),ing=tk.filter(t=>t.checked_in).length;
    return `<div class="grp">${esc(e.name)}${e.d?' '+fshort(e.d):''} — vendidas ( ${ing} / ${tk.length} ingresaron )</div>`+ap.map(r=>r.tickets.map(t=>`<div class="ct"><input type="checkbox" disabled ${t.checked_in?'checked':''}> ${esc(t.holder_name)} <small>(${esc(r.profiles?.display_name)})</small></div>`).join('')).join('')}).join('');
  const cur=AEV.find(e=>e.id==editId);if(!cur)editId=null;
  main.innerHTML=`<div class="box"><button id="sc" class="pri">📷 Escanear entrada</button><div id="rd"></div><div id="res"></div></div>
  <div class="box" id="evf"><b>${cur?'✏️ Editar evento':'➕ Crear evento'}</b><label>Nombre</label><input id="en" value="${esc(cur?cur.name:'La Previa')}" maxlength="60"><label>Fecha y hora</label><input id="ed" type="datetime-local" value="${cur?loc(cur.d):''}"><label>Dirección</label><input id="ea" maxlength="120" placeholder="Calle y número, ciudad" value="${esc(cur?cur.address||'':'')}"><label>Cantidad de entradas a la venta</label><input id="ec" type="number" min="1" inputmode="numeric" placeholder="Ej: 150" value="${cur?cur.capacity:''}"><button id="ecb" class="pri">${cur?'Guardar cambios':'Crear evento'}</button>${cur?' <button id="ecc" class="sm">Cancelar</button>':''}<p id="eer" class="bad"></p></div>
  <div class="grp">Eventos</div>${ev.error?`<p class="bad ct">Falta ejecutar eventos.sql en Supabase (${esc(ev.error.message)})</p>`:AEV.map(stat).join('')||'<p class="ct">Todavía no creaste ningún evento.</p>'}
  <div class="box"><b>🎶 Rocola</b><p class="sm">Pegá uno o varios enlaces de YouTube (uno por línea). En la página suena una canción al azar y pasa a la siguiente cuando termina.</p><textarea id="jl" rows="3" placeholder="https://www.youtube.com/watch?v=..."></textarea><button id="jla" class="pri">Agregar a la rocola</button><p id="jer" class="bad"></p>${jk.error?`<p class="bad">Falta ejecutar rocola.sql en Supabase (${esc(jk.error.message)})</p>`:(jk.data||[]).map(x=>`<div class="ct"><span>♪ ${esc(x.title)}</span><button class="ed sm" data-jd="${x.id}">✕</button></div>`).join('')||'<p class="sm">Todavía no agregaste canciones.</p>'}</div>
  <div class="grp">Pendientes ( ${pe.length} )</div>`+
  pe.map(r=>`<div class="box"><b>${esc(r.profiles?.display_name)}</b> · ${r.quantity} entrada(s) · <small>${evName(r.event_id)}</small><br>${r.tickets.map(t=>esc(t.holder_name)).join(', ')}<br>♪ ${esc(r.song_title)}<br><br><button data-id="${r.id}" data-st="approved" class="pri sm">Aprobar</button> <button data-id="${r.id}" data-st="rejected" class="sm danger">Rechazar</button></div>`).join('')+sold;
  main.onclick=async e=>{
    const ed=e.target.closest('[data-ed]');if(ed){editId=ed.dataset.ed;await admin();$('#evf').scrollIntoView({behavior:'smooth',block:'center'});return}
    const jd=e.target.closest('[data-jd]');if(jd){jd.disabled=true;const r=await sb.from('jukebox').delete().eq('id',jd.dataset.jd);if(r.error)console.error(r.error);await loadJuke();return admin()}
    const b=e.target.closest('[data-id]');if(!b)return;b.disabled=true;
    const r=b.dataset.st=='approved'?await sb.rpc('approve_request',{p_request_id:String(b.dataset.id)}):await sb.from('requests').update({status:b.dataset.st}).eq('id',b.dataset.id);
    if(r.error){console.error(r.error);alert(/sold_out/.test(r.error.message)?'No quedan entradas suficientes en ese evento para aprobar esta solicitud.':'No se pudo actualizar. Probá de nuevo.')}
    admin();badge()};
  $('#ecb').onclick=async()=>{
    const n=$('#en').value.trim(),d=$('#ed').value,c=parseInt($('#ec').value,10),er=m=>$('#eer').textContent=m;
    if(!n||!d||!(c>0))return er('Completá nombre, fecha y hora, y una cantidad mayor a 0.');
    if(editId){const v=sum(editId,'approved');if(c<v)return er(`Ya aprobaste ${v} entradas: la cantidad no puede ser menor a eso.`)}
    $('#ecb').disabled=true;const row={name:n,event_at:new Date(d).toISOString(),capacity:c,address:$('#ea').value.trim()};
    const{error}=editId?await sb.from('events').update(row).eq('id',editId):await sb.from('events').insert(row);
    if(error){console.error(error);$('#ecb').disabled=false;return er('No se pudo guardar el evento ('+error.message+')')}
    editId=null;admin()};
  if($('#ecc'))$('#ecc').onclick=()=>{editId=null;admin()};
  $('#jla').onclick=async()=>{
    const er=(m,c='bad')=>{$('#jer').className=c;$('#jer').textContent=m},urls=$('#jl').value.split(/\s+/).filter(Boolean),seen=new Set((jk.data||[]).map(x=>vidId(x.url)));
    if(!urls.length)return er('Pegá al menos un enlace de YouTube.');
    const ok=urls.filter(u=>{const v=vidId(u);if(!yt(u)||!v||seen.has(v))return false;seen.add(v);return true});
    if(!ok.length)return er('Esos enlaces no son válidos o ya están en la rocola.');
    $('#jla').disabled=true;er('Buscando los títulos…','sm');
    const rows=await Promise.all(ok.map(async u=>({url:u,title:(await getTitle(u))||'Canción de YouTube'})));
    const{error}=await sb.from('jukebox').insert(rows);
    if(error){console.error(error);$('#jla').disabled=false;return er('No se pudo agregar ('+error.message+')')}
    await loadJuke();admin()};
  $('#sc').onclick=scan}
const otherEv=t=>{const e=AEV.find(x=>x.id==t.requests?.event_id);return e&&Math.abs(Date.now()-e.d.getTime())>24*36e5?e:null};
function scan(){
  const res=$('#res');res.textContent='';
  if(typeof Html5Qrcode==='undefined')return res.innerHTML='<p class="bad">La librería del escáner no cargó. Revisá tu conexión y recargá la página.</p>';
  const h=new Html5Qrcode('rd');
  h.start({facingMode:'environment'},{fps:10,qrbox:220},async txt=>{
    await h.stop();const{data:t,error}=await sb.from('tickets').select('*,requests(status,event_id)').eq('qr_code',txt).maybeSingle();
    if(error||!t||t.requests?.status!='approved')res.innerHTML='<p class="bad">❌ QR inválido</p>';
    else if(otherEv(t))res.innerHTML=`<p class="bad">⚠️ Entrada de otro evento: ${esc(otherEv(t).name)} (${fshort(otherEv(t).d)})</p>`;
    else if(t.checked_in)res.innerHTML=`<p class="bad">⚠️ ${esc(t.holder_name)} ya ingresó</p>`;
    else{await sb.from('tickets').update({checked_in:true,checked_in_at:new Date().toISOString()}).eq('id',t.id);res.innerHTML=`<p class="ok">✔ Entrada válida: ${esc(t.holder_name)}</p>`}
    res.innerHTML+='<button id="again">Escanear otra</button>';$('#again').onclick=()=>admin().then(scan)},()=>{}).catch(()=>res.innerHTML='<p class="bad">No se pudo abrir la cámara. Dale permiso al navegador.</p>')}
async function badge(){
  if(!isAdmin())return;const{count}=await sb.from('requests').select('id',{count:'exact',head:true}).eq('status','pending');
  if($('#bd'))$('#bd').textContent=count?String(count):'';document.title=(count?`(${count}) `:'')+'La Previa';
  if(last!==null&&count>last)alert('🔔 Nueva solicitud de entradas');last=count}
setInterval(badge,30000);
/* ---------- rocola: canciones al azar, solo suena cuando la persona toca ▶ ---------- */
const vidId=u=>(String(u).match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([\w-]{11})/)||[])[1];
const jb={list:[],bag:[],cur:null,pl:null,on:false,fails:0,q:[],api:0,timer:0,err:''};
function loadYT(){if(jb.api||(window.YT&&YT.Player))return;jb.api=1;
  window.onYouTubeIframeAPIReady=()=>{jb.q.splice(0).forEach(f=>f())};
  const t=document.createElement('script');t.src='https://www.youtube.com/iframe_api';t.onerror=()=>{jb.api=0;jb.err='No se pudo cargar el reproductor.';drawJuke()};document.head.appendChild(t)}
const ytReady=f=>{if(window.YT&&YT.Player)f();else{jb.q.push(f);loadYT()}};
const thumb=(id,q='mqdefault')=>`https://i.ytimg.com/vi/${id}/${q}.jpg`;
const fmtT=x=>{x=Math.max(0,Math.floor(x||0));return Math.floor(x/60)+':'+String(x%60).padStart(2,'0')};
jb.vol=80;
function fillBag(){
  const a=jb.list.map((_,i)=>i);for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}
  if(a.length>1&&jb.cur&&jb.list[a[a.length-1]].url===jb.cur.url)[a[0],a[a.length-1]]=[a[a.length-1],a[0]];
  jb.bag=a}
function pick(){if(!jb.list.length)return null;if(!jb.bag.length)fillBag();return jb.list[jb.bag.pop()]}
function playSong(s){
  if(!s)return;jb.cur=s;jb.err='';clearTimeout(jb.timer);const id=vidId(s.url);
  if(!jb.bag.length&&jb.list.length>1)fillBag();
  if($('#jf')){$('#jf').style.width='0';$('#jc').textContent='0:00';$('#jd').textContent='0:00'}
  drawJuke();
  try{if('mediaSession' in navigator){navigator.mediaSession.metadata=new MediaMetadata({title:s.title,artist:'La Previa · Rocola',artwork:[{src:thumb(id),sizes:'320x180',type:'image/jpeg'}]});
    navigator.mediaSession.setActionHandler('play',()=>jb.pl&&jb.pl.playVideo());navigator.mediaSession.setActionHandler('pause',()=>jb.pl&&jb.pl.pauseVideo());navigator.mediaSession.setActionHandler('nexttrack',()=>playSong(pick()))}}catch(e){}
  ytReady(()=>{
    if(jb.pl&&jb.pl.loadVideoById){jb.pl.loadVideoById(id);return}
    $('#mp').innerHTML='<div id="yp"></div>';
    jb.pl=new YT.Player('yp',{width:1,height:1,videoId:id,playerVars:{autoplay:1,playsinline:1,rel:0},events:{
      onReady:e=>{try{e.target.setVolume(jb.vol)}catch(x){}e.target.playVideo()},
      onStateChange:e=>{const st=e.data;
        if(st===1){jb.on=true;jb.fails=0;jb.err='';clearTimeout(jb.timer)}
        else if(st===2)jb.on=false;
        else if(st===0){jb.on=false;playSong(pick())}
        drawJuke()},
      onError:()=>{jb.fails++;if(jb.fails<jb.list.length)playSong(pick());else{jb.on=false;jb.err='No se pudieron reproducir las canciones.';drawJuke()}}}})});
  jb.timer=setTimeout(()=>{if(!jb.on){jb.err='Tocá play para empezar';drawJuke()}},5000)}
const ARM='<svg class="arm" viewBox="0 0 76 104" aria-hidden="true"><circle cx="62" cy="15" r="12" fill="#23232f" stroke="#4a4a5c" stroke-width="1.5"/><circle cx="62" cy="15" r="4.5" fill="#9a97b3"/><path d="M62 15V70L44 92" fill="none" stroke="#d6d3ea" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/><g transform="rotate(-36 42 94)"><rect x="33" y="88" width="19" height="11" rx="2.5" fill="#ff4d8d"/><rect x="38" y="98" width="3" height="5" fill="#fff"/></g></svg>';
const mkJuke=()=>`<div id="juke"><div class="jglow"></div>
  <div class="jsign"><b>ROCOLA</b><span class="jshuf">${svg('shuffle')}Aleatoria</span></div>
  <div class="jdeck"><div class="vwrap"><div class="vinyl"><div class="lb"></div></div>${ARM}</div>
   <div class="jinfo"><span class="jk" id="jk"></span><b id="jt"></b><div class="eq" aria-hidden="true">${Array.from({length:18},(_,i)=>`<i style="--i:${i}"></i>`).join('')}</div></div></div>
  <div class="jbar"><span id="jc">0:00</span><div class="jtr" id="jtr"><div class="jf" id="jf"></div></div><span id="jd">0:00</span></div>
  <div class="jctl"><button id="jp" class="pri" aria-label="Reproducir"></button><button id="jx" aria-label="Siguiente canción">${svg('next')}</button><label class="vol" title="Volumen">${svg('vol')}<input id="jv" type="range" min="0" max="100" value="${jb.vol}" aria-label="Volumen"></label></div>
  <div class="jnx"></div></div>`;
function bindJuke(){
  $('#jp').onclick=()=>{if(!jb.cur)return playSong(pick());if(!jb.pl)return;if(jb.on)jb.pl.pauseVideo();else jb.pl.playVideo()};
  $('#jx').onclick=()=>playSong(pick());
  $('#jv').oninput=e=>{jb.vol=+e.target.value;try{jb.pl&&jb.pl.setVolume&&jb.pl.setVolume(jb.vol)}catch(x){}};
  $('#jtr').onclick=e=>{try{if(!jb.pl||!jb.pl.getDuration)return;const d=jb.pl.getDuration(),r=e.currentTarget.getBoundingClientRect();if(d>0)jb.pl.seekTo(Math.min(1,Math.max(0,(e.clientX-r.left)/r.width))*d,true)}catch(x){}};
  $('#juke .jnx').onclick=e=>{const b=e.target.closest('[data-ji]');if(!b)return;const k=+b.dataset.ji;jb.bag=jb.bag.filter(x=>x!==k);playSong(jb.list[k])}}
function upJuke(){
  const j=$('#juke');if(!j)return;
  j.classList.toggle('play',jb.on);j.classList.toggle('has',!!jb.cur);
  const id=jb.cur&&vidId(jb.cur.url);
  $('#jk').textContent=jb.err?'Aviso':jb.cur?(jb.on?'Sonando ahora':'En pausa'):'Lista para sonar';
  $('#jt').textContent=jb.err||(jb.cur?jb.cur.title:'Tocá play y que suene algo');
  const lb=j.querySelector('.lb'),gl=j.querySelector('.jglow'),u=id?thumb(id):'';
  if(lb.dataset.u!==u){lb.dataset.u=u;lb.style.backgroundImage=u?`url(${u}),linear-gradient(135deg,#ff4d8d,#8b5cf6)`:'';gl.style.backgroundImage=u?`url(${u})`:''}
  $('#jp').innerHTML=svg(jb.on?'pause':'play');$('#jp').setAttribute('aria-label',jb.on?'Pausar':'Reproducir');
  const nx=jb.bag.slice(-3).reverse().map(i=>jb.list[i]).filter(Boolean);
  upMini();
  j.querySelector('.jnx').innerHTML=nx.length?`<small>A continuación</small><div class="jq">${nx.map(x=>`<button class="q" data-ji="${jb.list.indexOf(x)}" title="Escuchar ahora">${vidId(x.url)?`<img src="${thumb(vidId(x.url),'default')}" alt="" onerror="this.remove()">`:''}<span>${esc(x.title)}</span></button>`).join('')}</div>`:''}
function upMini(){
  const m=$('#mini');if(!m)return;
  if(!jb.cur){m.hidden=true;return}
  m.hidden=false;m.classList.toggle('play',jb.on);
  const id=vidId(jb.cur.url);
  if(!m.firstChild){m.innerHTML='<div class="mt"></div><div class="mi"><small>Rocola</small><b></b></div><button aria-label="Reproducir/Pausar"></button>';
    m.querySelector('.mi').onclick=()=>go('home');
    m.querySelector('button').onclick=()=>{if(!jb.pl)return;if(jb.on)jb.pl.pauseVideo();else jb.pl.playVideo()}}
  m.querySelector('.mt').style.backgroundImage=id?`url(${thumb(id)}),linear-gradient(135deg,#ff4d8d,#8b5cf6)`:'';
  m.querySelector('small').textContent=jb.on?'Sonando ahora':'En pausa';m.querySelector('b').textContent=jb.cur.title;
  const bt=m.querySelector('button');bt.innerHTML=svg(jb.on?'pause':'play');bt.setAttribute('aria-label',jb.on?'Pausar':'Reproducir')}
function drawJuke(){
  const m=$('#music');
  if(!jb.list.length){m.innerHTML='';if($('#mini'))$('#mini').hidden=true;return}
  if(!$('#juke')){m.innerHTML=mkJuke();bindJuke()}
  upJuke()}
setInterval(()=>{const f=$('#jf');if(!f||!jb.pl||!jb.pl.getDuration||!jb.cur)return;try{const d=jb.pl.getDuration(),c=jb.pl.getCurrentTime();if(d>0){f.style.width=(c/d*100)+'%';$('#jc').textContent=fmtT(c);$('#jd').textContent=fmtT(d)}}catch(e){}},400);
async function loadJuke(){
  const{data,error}=await sb.from('jukebox').select('*').order('created_at');
  if(error)console.error('rocola',error);
  let l=(data||[]).filter(x=>vidId(x.url));
  if(!l.length&&vidId(C.MUSIC_URL||''))l=[{id:'cfg',url:C.MUSIC_URL,title:'Música de La Previa'}];
  if(!l.length&&jb.pl){try{jb.pl.stopVideo()}catch(e){}jb.on=false;jb.cur=null}
  jb.list=l;jb.bag=[];if(jb.cur&&l.length>1)fillBag();drawJuke();if(l.length)loadYT()}
loadJuke();
