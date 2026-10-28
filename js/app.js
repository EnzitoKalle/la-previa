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
let user=null,view='home',ready=0,last=null,selEv=null,afterV=null,EV=[],AEV=[];
const isAdmin=()=>user&&user.email===C.ADMIN_EMAIL;
const mark=()=>document.querySelectorAll('#mb a').forEach(a=>a.classList.toggle('on',a.dataset.v===(view==='list'?'home':view)));
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
  return'No se pudo completar. Probá de nuevo.'};
$('#msg').textContent=C.STATUS_MSG;
sb.auth.onAuthStateChange((ev,s)=>{
  const u=s?s.user:null;
  if(ev==='PASSWORD_RECOVERY'){user=u;ready=1;head();setTimeout(recoverView,0);return}
  if(ready&&(u&&u.id)===(user&&user.id))return;
  user=u;ready=1;
  if(u){try{const a=sessionStorage.getItem('lp_after');if(a){view=a;selEv=sessionStorage.getItem('lp_ev')||null}sessionStorage.removeItem('lp_after');sessionStorage.removeItem('lp_ev')}catch(e){}
    if(view==='auth'||view==='recover'){view=afterV||'home';afterV=null}}
  head();setTimeout(()=>go(view),0)});
function head(){
  $('#mb').innerHTML=[['home','Archivo'],['list','Contactos'],['form','Quiero una entrada'],['mine','Mis entradas']].concat(isAdmin()?[['admin','Admin<span id="bd"></span>']]:[]).map(([v,t])=>`<a data-v="${v}">${t}</a>`).join('');
  $('#mb').onclick=e=>{const v=e.target.closest('a')?.dataset.v;if(v)go(v)};
  $('#me').innerHTML=user?`${esc(user.user_metadata?.full_name||user.email)} · <a id="out">Salir</a>`:'<button class="bt" id="in">Iniciar sesión</button> <button class="bt" id="up">Registrarse</button>';
  if($('#out'))$('#out').onclick=()=>sb.auth.signOut();
  if($('#in'))$('#in').onclick=()=>authView('login');if($('#up'))$('#up').onclick=()=>authView('signup');mark();badge()}
$('#cta').onclick=()=>want(null);
function go(v){view=v;mark();main.onclick=null;({home:home,list:home,form:()=>want(selEv),mine:mine,admin:admin,auth:()=>authView('login'),recover:recoverView}[v]||home)()}

/* ---------- eventos ---------- */
async function loadEvents(){
  const{data,error}=await sb.rpc('get_events');if(error)console.error('eventos',error);
  EV=(data||[]).map(e=>({...e,d:new Date(e.event_at)}));updateCta();return EV}
const upcoming=()=>EV.filter(e=>e.d.getTime()>Date.now()-12*36e5);
function updateCta(){const u=upcoming(),b=$('#cta'),all=u.length>0&&u.every(e=>e.sold_out);b.textContent=all?'ENTRADAS AGOTADAS':'QUIERO UNA ENTRADA';b.disabled=all}
const lowTxt=n=>n==1?'¡Última entrada disponible!':`¡Últimas ${n} entradas disponibles!`;
const evCard=e=>`<div class="box ev"><div class="evn">🎉 ${esc(e.name)}</div><div class="evd"><span>📅 ${esc(fdate(e.d))}</span><span>🕘 ${ftime(e.d)}</span></div>`+
  (e.sold_out?'<div class="pill red">AGOTADAS</div>':(e.remaining_low?`<div class="pill hot">🔥 ${lowTxt(e.remaining_low)}</div><br>`:'')+`<button data-ev="${e.id}">Quiero una entrada</button>`)+`</div>`;

/* ---------- registro / ingreso ---------- */
function authView(mode='login',notice='',after=null){
  view='auth';mark();afterV=after;const su=mode=='signup';
  main.innerHTML=`<div class="box">${notice?`<p class="note">${esc(notice)}</p>`:''}
  <div class="tabs"><a data-m="login" class="${su?'':'on'}">Iniciar sesión</a><a data-m="signup" class="${su?'on':''}">Crear cuenta</a></div>
  <form id="af" novalidate>${su?'<label>Tu nombre</label><input id="an" autocomplete="name" maxlength="30" placeholder="Cómo te van a ver en la lista">':''}
  <label>Email</label><input id="ae" type="email" autocomplete="email" inputmode="email">
  <label>Contraseña</label><input id="ap" type="password" autocomplete="${su?'new-password':'current-password'}" placeholder="Mínimo 6 caracteres">
  <button id="ab" type="submit">${su?'Crear cuenta':'Ingresar'}</button><p id="aer"></p></form>
  ${su?'':'<p><a id="fg" class="lk">Olvidé mi contraseña</a></p>'}
  <hr><button id="gg" type="button">Seguir con Google</button></div>`;
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
  main.innerHTML=`<div class="box"><b>Elegí una nueva contraseña</b><form id="rf2" novalidate><label>Nueva contraseña</label><input id="np" type="password" autocomplete="new-password" placeholder="Mínimo 6 caracteres"><button type="submit">Guardar</button><p id="rer"></p></form></div>`;
  $('#rf2').onsubmit=async e=>{e.preventDefault();const p=$('#np').value;
    if(p.length<6){$('#rer').className='bad';return $('#rer').textContent='La contraseña debe tener al menos 6 caracteres.'}
    const{error}=await sb.auth.updateUser({password:p});
    if(error){$('#rer').className='bad';return $('#rer').textContent=authErr(error)}
    main.innerHTML='<div class="box ok">Contraseña actualizada ✔</div>';setTimeout(()=>go('home'),1500)}}

/* ---------- inicio ---------- */
async function home(){
  await loadEvents();const ups=upcoming();
  if(!ups.length){main.innerHTML='<div class="box">🎉 Estamos preparando la próxima fecha. ¡Volvé pronto!</div>';return}
  const ls=await Promise.all(ups.map(e=>sb.rpc('public_event_list',{p_event_id:e.id})));
  main.innerHTML=ups.map((e,i)=>{const data=ls[i].data||[];return evCard(e)+`<div class="grp">▾ Conectados ( ${data.length} )</div>`+
    (data.map(r=>`<div class="ct"><i class="dot"></i><b>${esc(r.display_name)}</b> - ♪ ${yt(r.song_url)?`<a href="${esc(r.song_url)}" target="_blank" rel="noopener">${esc(r.song_title)}</a>`:esc(r.song_title)}</div>`).join('')||'<p class="ct">Todavía no hay nadie. ¡Sé el primero en anotarte!</p>')}).join('');
  main.onclick=e=>{const b=e.target.closest('[data-ev]');if(b)want(b.dataset.ev)}}

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
  const max=Math.min(10,ev.remaining_low||10);
  main.innerHTML=`<div class="box"><h3>Quiero una entrada</h3><p class="evl">🎉 <b>${esc(ev.name)}</b><br>📅 ${esc(fdate(ev.d))} · 🕘 ${ftime(ev.d)}</p>${ev.remaining_low?`<p class="low">🔥 ${lowTxt(ev.remaining_low)}</p>`:''}
  <label>Tu nombre en la lista</label><input id="dn" maxlength="30" value="${esc(p?.display_name||user.user_metadata?.full_name||'')}">
  <label>Cantidad de entradas</label><select id="qt">${Array.from({length:max},(_,i)=>`<option>${i+1}</option>`).join('')}</select><div id="nm"></div>
  <label>🎵 Canción que no puede faltar</label><input id="su" placeholder="Pegá el enlace de YouTube"><div id="sp" class="sp"></div><input id="st" placeholder="Nombre de la canción" maxlength="150" hidden>
  <button id="go">Enviar solicitud</button><p id="er"></p></div>`;
  const names=()=>{const old=[...document.querySelectorAll('.nm')].map(i=>i.value);$('#nm').innerHTML=Array.from({length:+$('#qt').value},(_,i)=>`<input class="nm" placeholder="Nombre y apellido de la entrada ${i+1}" maxlength="40" value="${esc(old[i]||'')}">`).join('')};
  names();$('#qt').onchange=names;
  let seq=0,tm;
  const peek=async()=>{
    const u=$('#su').value.trim(),n=++seq;$('#st').hidden=true;$('#st').value='';
    if(!u){$('#sp').textContent='';return}
    if(!yt(u)){$('#sp').textContent='Ese enlace no parece ser de YouTube.';return}
    $('#sp').textContent='Buscando el título…';
    const t=await getTitle(u);if(n!==seq)return;
    if(t){$('#st').value=t;$('#sp').textContent='🎵 '+t}
    else{$('#st').hidden=false;$('#sp').textContent='No pudimos leer el título. Escribilo abajo.'}
  };
  $('#su').oninput=()=>{clearTimeout(tm);tm=setTimeout(peek,500)};
  $('#go').onclick=async()=>{
    const dn=$('#dn').value.trim(),q=+$('#qt').value,ns=[...document.querySelectorAll('.nm')].map(i=>i.value.trim()),su=$('#su').value.trim(),er=m=>$('#er').textContent=m;
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
    main.innerHTML=`<div class="box"><h3>¡Solicitud enviada!</h3><p>Abrimos WhatsApp para avisar. Cuando la aprueben, vas a ver tus QR en "Mis entradas" (quedan guardados en tu cuenta).</p><a class="bt" href="${w}">Abrir WhatsApp</a></div>`;setTimeout(()=>location.href=w,1500)}}

/* ---------- mis entradas (historial por evento) ---------- */
async function mine(){
  if(!user)return authView('login','Ingresá para ver tus entradas guardadas.','mine');
  const[rq]=await Promise.all([sb.from('requests').select('*,tickets(*)').eq('user_id',user.id).order('created_at',{ascending:false}),loadEvents()]);
  const rows=rq.data||[],L={pending:'⏳ Solicitada',approved:'✅ Aprobada',rejected:'❌ Rechazada'};
  const groups=[];rows.forEach(r=>{const k=r.event_id||'none';let g=groups.find(x=>x.k==k);if(!g){g={k,e:EV.find(e=>e.id==r.event_id),rs:[]};groups.push(g)}g.rs.push(r)});
  groups.sort((a,b)=>(b.e?b.e.d:0)-(a.e?a.e.d:0));
  const tk=(r,t)=>r.status!='approved'?`<div class="ct">• ${esc(t.holder_name)}</div>`
    :!t.qr_code?`<div class="ct">• ${esc(t.holder_name)} <small class="bad">(QR no disponible, avisá al organizador)</small></div>`
    :`<div class="qr"><img data-q="${esc(t.qr_code)}" alt="QR"><div><b>${esc(t.holder_name)}</b><br>${t.checked_in?'Ya ingresó':''}<br><button data-s="${esc(t.qr_code)}" data-n="${esc(t.holder_name)}">Compartir</button></div></div>`;
  const box=r=>`<div class="box"><b>${L[r.status]||esc(r.status)}</b> · ${r.quantity} entrada(s)${(r.tickets||[]).map(t=>tk(r,t)).join('')}
    <div class="sg"><label>🎵 Tu canción</label><div>${yt(r.song_url)?`<a href="${esc(r.song_url)}" target="_blank" rel="noopener">${esc(r.song_title)}</a>`:esc(r.song_title)}</div>
    <input data-su="${r.id}" value="${esc(r.song_url)}" placeholder="Nuevo enlace de YouTube"><button data-sv="${r.id}">Cambiar canción</button><p class="sm" data-sm="${r.id}"></p></div></div>`;
  const title=g=>g.e?`🎟️ Entradas para ${esc(g.e.name)} del ${fshort(g.e.d)} · ${ftime(g.e.d)}${g.e.d.getTime()<Date.now()-12*36e5?' <small>(finalizado)</small>':''}`:'🎟️ Entradas anteriores';
  main.innerHTML=`<div class="grp">Mis entradas <button id="rf">↻ Actualizar</button></div>`+(groups.map(g=>`<div class="grp ev-t">${title(g)}</div>`+g.rs.map(box).join('')).join('')||'<p class="ct">Todavía no pediste entradas.</p>');
  document.querySelectorAll('[data-q]').forEach(async i=>{
    try{
      if(typeof QRCode==='undefined'||typeof QRCode.toDataURL!=='function')throw new Error('la librería de QR no cargó (typeof QRCode = '+typeof QRCode+')');
      const u=await QRCode.toDataURL(i.dataset.q,{width:600,margin:3});qrUrls[i.dataset.q]=u;i.src=u}
    catch(e){console.error('QR',e);const s=document.createElement('span');s.className='bad';s.textContent='No se pudo generar el QR: '+((e&&e.message)||e);i.replaceWith(s)}});
  main.onclick=e=>{const b=e.target.closest('button');if(!b)return;
    if(b.dataset.s)share(b.dataset.s,b.dataset.n);else if(b.dataset.sv)saveSong(b.dataset.sv);else if(b.id=='rf')mine()}}
async function saveSong(id){
  const inp=document.querySelector(`[data-su="${id}"]`),m=document.querySelector(`[data-sm="${id}"]`),b=document.querySelector(`[data-sv="${id}"]`),
    say=(c,t)=>{m.className='sm '+c;m.textContent=t},url=inp.value.trim();
  if(!yt(url))return say('bad','Pegá un enlace de YouTube válido.');
  b.disabled=true;say('','Buscando el título…');
  const title=await getTitle(url);
  if(!title){b.disabled=false;return say('bad','No pudimos leer el título de ese enlace. Revisá que el video exista.')}
  const{error}=await sb.rpc('update_my_song',{p_request_id:String(id),p_url:url,p_title:title});
  if(error){console.error(error);b.disabled=false;return say('bad','No se pudo guardar. Probá de nuevo.')}
  await mine();const m2=document.querySelector(`[data-sm="${id}"]`);if(m2){m2.className='sm ok';m2.textContent='✔ Canción actualizada: '+title}}
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
  const stat=e=>{const s=sum(e.id,'approved'),p=sum(e.id,'pending');return `<div class="ct"><span><b>${esc(e.name)}</b> · ${fshort(e.d)} ${ftime(e.d)}<br>Vendidas ${s} de ${e.capacity} · Quedan ${Math.max(e.capacity-s,0)} · Pendientes ${p}</span><button class="ed" data-ed="${e.id}">✏️ Editar</button></div>`};
  const pe=data.filter(r=>r.status=='pending');
  const sold=[...AEV,{id:null,name:'Sin evento'}].map(e=>{const ap=data.filter(r=>r.status=='approved'&&(r.event_id||null)==(e.id||null));if(!ap.length)return'';
    const tk=ap.flatMap(r=>r.tickets),ing=tk.filter(t=>t.checked_in).length;
    return `<div class="grp">${esc(e.name)}${e.d?' '+fshort(e.d):''} — vendidas ( ${ing} / ${tk.length} ingresaron )</div>`+ap.map(r=>r.tickets.map(t=>`<div class="ct"><input type="checkbox" disabled ${t.checked_in?'checked':''}> ${esc(t.holder_name)} <small>(${esc(r.profiles?.display_name)})</small></div>`).join('')).join('')}).join('');
  const cur=AEV.find(e=>e.id==editId);if(!cur)editId=null;
  main.innerHTML=`<div class="box"><button id="sc">📷 Escanear entrada</button><div id="rd"></div><div id="res"></div></div>
  <div class="box" id="evf"><b>${cur?'✏️ Editar evento':'➕ Crear evento'}</b><label>Nombre</label><input id="en" value="${esc(cur?cur.name:'La Previa')}" maxlength="60"><label>Fecha y hora</label><input id="ed" type="datetime-local" value="${cur?loc(cur.d):''}"><label>Cantidad de entradas a la venta</label><input id="ec" type="number" min="1" inputmode="numeric" placeholder="Ej: 150" value="${cur?cur.capacity:''}"><button id="ecb">${cur?'Guardar cambios':'Crear evento'}</button>${cur?' <button id="ecc">Cancelar</button>':''}<p id="eer" class="bad"></p></div>
  <div class="grp">Eventos</div>${ev.error?`<p class="bad ct">Falta ejecutar eventos.sql en Supabase (${esc(ev.error.message)})</p>`:AEV.map(stat).join('')||'<p class="ct">Todavía no creaste ningún evento.</p>'}
  <div class="box"><b>🎶 Rocola</b><p class="sm">Pegá uno o varios enlaces de YouTube (uno por línea). En la página suena una canción al azar y pasa a la siguiente cuando termina.</p><textarea id="jl" rows="3" placeholder="https://www.youtube.com/watch?v=..."></textarea><button id="jla">Agregar a la rocola</button><p id="jer" class="bad"></p>${jk.error?`<p class="bad">Falta ejecutar rocola.sql en Supabase (${esc(jk.error.message)})</p>`:(jk.data||[]).map(x=>`<div class="ct"><span>♪ ${esc(x.title)}</span><button class="ed" data-jd="${x.id}">✕</button></div>`).join('')||'<p class="sm">Todavía no agregaste canciones.</p>'}</div>
  <div class="grp">Pendientes ( ${pe.length} )</div>`+
  pe.map(r=>`<div class="box"><b>${esc(r.profiles?.display_name)}</b> · ${r.quantity} entrada(s) · <small>${evName(r.event_id)}</small><br>${r.tickets.map(t=>esc(t.holder_name)).join(', ')}<br>♪ ${esc(r.song_title)}<br><br><button data-id="${r.id}" data-st="approved">Aprobar</button> <button data-id="${r.id}" data-st="rejected">Rechazar</button></div>`).join('')+sold;
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
    $('#ecb').disabled=true;const row={name:n,event_at:new Date(d).toISOString(),capacity:c};
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
  if($('#bd'))$('#bd').textContent=count?` (${count})`:'';document.title=(count?`(${count}) `:'')+'La Previa';
  if(last!==null&&count>last)alert('🔔 Nueva solicitud de entradas');last=count}
setInterval(badge,30000);
/* ---------- rocola: canciones al azar, solo suena cuando la persona toca ▶ ---------- */
const vidId=u=>(String(u).match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([\w-]{11})/)||[])[1];
const jb={list:[],bag:[],cur:null,pl:null,on:false,fails:0,q:[],api:0,timer:0,err:''};
function loadYT(){if(jb.api||(window.YT&&YT.Player))return;jb.api=1;
  window.onYouTubeIframeAPIReady=()=>{jb.q.splice(0).forEach(f=>f())};
  const t=document.createElement('script');t.src='https://www.youtube.com/iframe_api';t.onerror=()=>{jb.api=0;jb.err='No se pudo cargar el reproductor.';drawJuke()};document.head.appendChild(t)}
const ytReady=f=>{if(window.YT&&YT.Player)f();else{jb.q.push(f);loadYT()}};
function pick(){
  if(!jb.list.length)return null;
  if(!jb.bag.length){
    const a=jb.list.map((_,i)=>i);for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}
    if(a.length>1&&jb.cur&&jb.list[a[a.length-1]].url===jb.cur.url)[a[0],a[a.length-1]]=[a[a.length-1],a[0]];
    jb.bag=a}
  return jb.list[jb.bag.pop()]}
function playSong(s){
  if(!s)return;jb.cur=s;jb.err='';drawJuke();clearTimeout(jb.timer);const id=vidId(s.url);
  ytReady(()=>{
    if(jb.pl&&jb.pl.loadVideoById){jb.pl.loadVideoById(id);return}
    $('#mp').innerHTML='<div id="yp"></div>';
    jb.pl=new YT.Player('yp',{width:1,height:1,videoId:id,playerVars:{autoplay:1,playsinline:1,rel:0},events:{
      onReady:e=>e.target.playVideo(),
      onStateChange:e=>{const st=e.data;
        if(st===1){jb.on=true;jb.fails=0;jb.err='';clearTimeout(jb.timer)}
        else if(st===2)jb.on=false;
        else if(st===0){jb.on=false;playSong(pick())}
        drawJuke()},
      onError:()=>{jb.fails++;if(jb.fails<jb.list.length)playSong(pick());else{jb.on=false;jb.err='No se pudieron reproducir las canciones.';drawJuke()}}}})});
  jb.timer=setTimeout(()=>{if(!jb.on){jb.err='Tocá ▶ para empezar';drawJuke()}},5000)}
function drawJuke(){
  const m=$('#music');
  if(!jb.list.length){m.innerHTML='';return}
  if(!$('#juke')){
    m.innerHTML='<div id="juke"><span class="jn">♫</span><div class="jtx"><small>Rocola</small><span id="jt"></span></div><button id="jp"></button><button id="jx" title="Otra canción">⏭</button></div>';
    $('#jp').onclick=()=>{if(!jb.cur)return playSong(pick());if(!jb.pl)return;if(jb.on)jb.pl.pauseVideo();else jb.pl.playVideo()};
    $('#jx').onclick=()=>playSong(pick())}
  $('#juke').classList.toggle('play',jb.on);
  $('#jt').textContent=jb.err||(jb.cur?(jb.on?'Escuchando: ':'En pausa: ')+jb.cur.title:'Tocá ▶ para escuchar música');
  $('#jp').textContent=jb.on?'⏸':'▶';$('#jp').title=jb.on?'Pausar':'Escuchar'}
async function loadJuke(){
  const{data,error}=await sb.from('jukebox').select('*').order('created_at');
  if(error)console.error('rocola',error);
  let l=(data||[]).filter(x=>vidId(x.url));
  if(!l.length&&vidId(C.MUSIC_URL||''))l=[{id:'cfg',url:C.MUSIC_URL,title:'Música de La Previa'}];
  if(!l.length&&jb.pl){try{jb.pl.stopVideo()}catch(e){}jb.on=false;jb.cur=null}
  jb.list=l;jb.bag=[];drawJuke();if(l.length)loadYT()}
loadJuke();
