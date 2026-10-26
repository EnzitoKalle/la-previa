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
let user=null,view='home',ready=0,last=null;
const isAdmin=()=>user&&user.email===C.ADMIN_EMAIL;
const login=()=>sb.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin}});
$('#msg').textContent=C.STATUS_MSG;
sb.auth.onAuthStateChange((_,s)=>{const u=s?s.user:null;if(ready&&(u&&u.id)===(user&&user.id))return;user=u;ready=1;head();go(view)});
function head(){
  $('#mb').innerHTML=[['home','Archivo'],['list','Contactos'],['form','Acciones'],['mine','Mis entradas']].concat(isAdmin()?[['admin','Admin<span id="bd"></span>']]:[]).map(([v,t])=>`<a data-v="${v}">${t}</a>`).join('');
  $('#mb').onclick=e=>{const v=e.target.closest('a')?.dataset.v;if(v)go(v)};
  $('#me').innerHTML=user?`${esc(user.user_metadata?.full_name||user.email)} · <a id="out">Salir</a>`:'<a id="in">Iniciar sesión con Google</a>';
  if($('#out'))$('#out').onclick=()=>sb.auth.signOut();if($('#in'))$('#in').onclick=login;badge()}
$('#cta').onclick=()=>go('form');
function go(v){view=v;main.onclick=null;({home:home,list:home,form:form,mine:mine,admin:admin}[v]||home)()}
async function home(){
  const{data=[]}=await sb.from('public_list').select('*').order('display_name');
  main.innerHTML=`<div class="grp">▾ Conectados ( ${data.length} )</div>`+(data.map(r=>`<div class="ct"><i class="dot"></i><b>${esc(r.display_name)}</b> - ♪ ${yt(r.song_url)?`<a href="${esc(r.song_url)}" target="_blank" rel="noopener">${esc(r.song_title)}</a>`:esc(r.song_title)}</div>`).join('')||'<p class="ct">Todavía no hay nadie. ¡Sé el primero en anotarte!</p>')}
async function form(){
  if(!user)return login();
  const{data:p}=await sb.from('profiles').select('display_name').eq('id',user.id).maybeSingle();
  main.innerHTML=`<div class="box"><h3>Solicitar entradas</h3><label>Tu nombre en la lista</label><input id="dn" maxlength="30" value="${esc(p?.display_name||user.user_metadata?.full_name||'')}">
  <label>Cantidad de entradas</label><select id="qt">${[1,2,3,4,5,6,7,8,9,10].map(n=>`<option>${n}</option>`).join('')}</select><div id="nm"></div>
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
    r=await sb.from('requests').insert({user_id:user.id,quantity:q,song_title:st,song_url:su}).select().single();if(r.error){$('#go').disabled=false;return er('No se pudo enviar la solicitud.')}
    const t=await sb.from('tickets').insert(ns.map(n=>({request_id:r.data.id,user_id:user.id,holder_name:n})));if(t.error){$('#go').disabled=false;return er('No se pudieron guardar los nombres.')}
    const w=`https://wa.me/${C.WHATSAPP}?text=`+encodeURIComponent(`Hola! Quiero ${q} entrada${q>1?'s':''} para La Previa a nombre de:\n`+ns.map(n=>'- '+n).join('\n'));
    main.innerHTML=`<div class="box"><h3>¡Solicitud enviada!</h3><p>Abrimos WhatsApp para avisar. Cuando la aprueben, vas a ver tus QR en "Mis entradas".</p><a class="bt" href="${w}">Abrir WhatsApp</a></div>`;setTimeout(()=>location.href=w,1500)}}
async function mine(){
  if(!user)return login();
  const{data}=await sb.from('requests').select('*,tickets(*)').eq('user_id',user.id).order('created_at',{ascending:false});
  const rows=data||[],L={pending:'⏳ Solicitada',approved:'✅ Aprobada',rejected:'❌ Rechazada'};
  const tk=(r,t)=>r.status!='approved'?`<div class="ct">• ${esc(t.holder_name)}</div>`
    :!t.qr_code?`<div class="ct">• ${esc(t.holder_name)} <small class="bad">(QR no disponible, avisá al organizador)</small></div>`
    :`<div class="qr"><img data-q="${esc(t.qr_code)}" alt="QR"><div><b>${esc(t.holder_name)}</b><br>${t.checked_in?'Ya ingresó':''}<br><button data-s="${esc(t.qr_code)}" data-n="${esc(t.holder_name)}">Compartir</button></div></div>`;
  main.innerHTML=`<div class="grp">Mis entradas <button id="rf">↻ Actualizar</button></div>`+(rows.map(r=>`<div class="box"><b>${L[r.status]||esc(r.status)}</b> · ${r.quantity} entrada(s)${(r.tickets||[]).map(t=>tk(r,t)).join('')}
    <div class="sg"><label>🎵 Tu canción</label><div>${yt(r.song_url)?`<a href="${esc(r.song_url)}" target="_blank" rel="noopener">${esc(r.song_title)}</a>`:esc(r.song_title)}</div>
    <input data-su="${r.id}" value="${esc(r.song_url)}" placeholder="Nuevo enlace de YouTube"><button data-sv="${r.id}">Cambiar canción</button><p class="sm" data-sm="${r.id}"></p></div></div>`).join('')||'<p class="ct">Todavía no pediste entradas.</p>');
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
async function admin(){
  if(!isAdmin())return home();
  const{data=[]}=await sb.from('requests').select('*,profiles(display_name),tickets(*)').order('created_at',{ascending:false});
  const pe=data.filter(r=>r.status=='pending'),ap=data.filter(r=>r.status=='approved'),tk=ap.flatMap(r=>r.tickets),ing=tk.filter(t=>t.checked_in).length;
  main.innerHTML=`<div class="box"><button id="sc">📷 Escanear entrada</button><div id="rd"></div><div id="res"></div></div><div class="grp">Pendientes ( ${pe.length} )</div>`+
  pe.map(r=>`<div class="box"><b>${esc(r.profiles?.display_name)}</b> · ${r.quantity} entrada(s)<br>${r.tickets.map(t=>esc(t.holder_name)).join(', ')}<br>♪ ${esc(r.song_title)}<br><button data-id="${r.id}" data-st="approved">Aprobar</button> <button data-id="${r.id}" data-st="rejected">Rechazar</button></div>`).join('')+
  `<div class="grp">Entradas vendidas ( ${ing} / ${tk.length} ingresaron )</div>`+ap.map(r=>r.tickets.map(t=>`<div class="ct"><input type="checkbox" disabled ${t.checked_in?'checked':''}> ${esc(t.holder_name)} <small>(${esc(r.profiles?.display_name)})</small></div>`).join('')).join('');
  main.onclick=async e=>{const b=e.target.closest('[data-id]');if(b){await sb.from('requests').update({status:b.dataset.st}).eq('id',b.dataset.id);admin();badge()}};
  $('#sc').onclick=scan}
function scan(){
  const res=$('#res');res.textContent='';
  if(typeof Html5Qrcode==='undefined')return res.innerHTML='<p class="bad">La librería del escáner no cargó. Revisá tu conexión y recargá la página.</p>';
  const h=new Html5Qrcode('rd');
  h.start({facingMode:'environment'},{fps:10,qrbox:220},async txt=>{
    await h.stop();const{data:t,error}=await sb.from('tickets').select('*,requests(status)').eq('qr_code',txt).maybeSingle();
    if(error||!t||t.requests?.status!='approved')res.innerHTML='<p class="bad">❌ QR inválido</p>';
    else if(t.checked_in)res.innerHTML=`<p class="bad">⚠️ ${esc(t.holder_name)} ya ingresó</p>`;
    else{await sb.from('tickets').update({checked_in:true,checked_in_at:new Date().toISOString()}).eq('id',t.id);res.innerHTML=`<p class="ok">✔ Entrada válida: ${esc(t.holder_name)}</p>`}
    res.innerHTML+='<button id="again">Escanear otra</button>';$('#again').onclick=()=>admin().then(scan)},()=>{}).catch(()=>res.innerHTML='<p class="bad">No se pudo abrir la cámara. Dale permiso al navegador.</p>')}
async function badge(){
  if(!isAdmin())return;const{count}=await sb.from('requests').select('id',{count:'exact',head:true}).eq('status','pending');
  if($('#bd'))$('#bd').textContent=count?` (${count})`:'';document.title=(count?`(${count}) `:'')+'La Previa';
  if(last!==null&&count>last)alert('🔔 Nueva solicitud de entradas');last=count}
setInterval(badge,30000);
const vid=(C.MUSIC_URL.match(/(?:v=|youtu\.be\/)([\w-]{11})/)||[])[1];
if(vid){let on=0;$('#music').innerHTML='<button id="mu">♫ Activar música</button>';$('#mu').onclick=e=>{on=!on;$('#mp').innerHTML=on?`<iframe width="1" height="1" allow="autoplay" src="https://www.youtube.com/embed/${vid}?autoplay=1&loop=1&playlist=${vid}"></iframe>`:'';e.target.textContent=on?'⏸ Pausar música':'♫ Activar música'}}
