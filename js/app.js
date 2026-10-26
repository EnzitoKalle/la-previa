const C=window.CFG,sb=supabase.createClient(C.SUPABASE_URL,C.SUPABASE_KEY),$=s=>document.querySelector(s),main=$('#main');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
const yt=u=>/^https?:\/\/(www\.|m\.|music\.)?(youtube\.com|youtu\.be)\//.test(u);
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
  <label>🎵 Canción que no puede faltar</label><input id="su" placeholder="Enlace de YouTube"><input id="st" placeholder="Nombre de la canción">
  <button id="go">Enviar solicitud</button><p id="er"></p></div>`;
  const names=()=>{const old=[...document.querySelectorAll('.nm')].map(i=>i.value);$('#nm').innerHTML=Array.from({length:+$('#qt').value},(_,i)=>`<input class="nm" placeholder="Nombre y apellido de la entrada ${i+1}" maxlength="40" value="${esc(old[i]||'')}">`).join('')};
  names();$('#qt').onchange=names;
  $('#su').onchange=async()=>{if(!yt($('#su').value)||$('#st').value)return;try{const r=await(await fetch('https://noembed.com/embed?url='+encodeURIComponent($('#su').value))).json();if(r.title)$('#st').value=r.title}catch(e){}};
  $('#go').onclick=async()=>{
    const dn=$('#dn').value.trim(),q=+$('#qt').value,ns=[...document.querySelectorAll('.nm')].map(i=>i.value.trim()),su=$('#su').value.trim(),st=$('#st').value.trim(),er=m=>$('#er').textContent=m;
    if(!dn||!st||ns.some(n=>!n)||!yt(su))return er('Completá todos los campos. El enlace tiene que ser de YouTube.');
    $('#go').disabled=true;
    let r=await sb.from('profiles').upsert({id:user.id,display_name:dn});if(r.error){$('#go').disabled=false;return er('No se pudo guardar tu nombre.')}
    r=await sb.from('requests').insert({user_id:user.id,quantity:q,song_title:st,song_url:su}).select().single();if(r.error){$('#go').disabled=false;return er('No se pudo enviar la solicitud.')}
    const t=await sb.from('tickets').insert(ns.map(n=>({request_id:r.data.id,user_id:user.id,holder_name:n})));if(t.error){$('#go').disabled=false;return er('No se pudieron guardar los nombres.')}
    const w=`https://wa.me/${C.WHATSAPP}?text=`+encodeURIComponent(`Hola! Quiero ${q} entrada${q>1?'s':''} para La Previa a nombre de:\n`+ns.map(n=>'- '+n).join('\n'));
    main.innerHTML=`<div class="box"><h3>¡Solicitud enviada!</h3><p>Abrimos WhatsApp para avisar. Cuando la aprueben, vas a ver tus QR en "Mis entradas".</p><a class="bt" href="${w}">Abrir WhatsApp</a></div>`;setTimeout(()=>location.href=w,1500)}}
async function mine(){
  if(!user)return login();
  const{data=[]}=await sb.from('requests').select('*,tickets(*)').eq('user_id',user.id).order('created_at',{ascending:false});
  const L={pending:'⏳ Solicitada',approved:'✅ Aprobada',rejected:'❌ Rechazada'};
  main.innerHTML=data.map(r=>`<div class="box"><b>${L[r.status]}</b> · ${r.quantity} entrada(s)${r.tickets.map(t=>r.status=='approved'?`<div class="qr"><img data-q="${t.qr_code}" alt="QR"><div><b>${esc(t.holder_name)}</b><br>${t.checked_in?'Ya ingresó':''}<br><button data-s="${t.qr_code}" data-n="${esc(t.holder_name)}">Compartir</button></div></div>`:`<div class="ct">• ${esc(t.holder_name)}</div>`).join('')}</div>`).join('')||'<p class="ct">Todavía no pediste entradas.</p>';
  document.querySelectorAll('[data-q]').forEach(async i=>i.src=await QRCode.toDataURL(i.dataset.q,{width:300,margin:2}));
  main.onclick=e=>{const b=e.target.closest('[data-s]');if(b)share(b.dataset.s,b.dataset.n)}}
async function share(q,n){
  const u=await QRCode.toDataURL(q,{width:600,margin:3}),f=new File([await(await fetch(u)).blob()],'entrada-'+n+'.png',{type:'image/png'});
  if(navigator.canShare&&navigator.canShare({files:[f]}))navigator.share({files:[f],title:'Entrada La Previa',text:'Mi entrada para La Previa - '+n}).catch(()=>{});
  else{const a=document.createElement('a');a.href=u;a.download=f.name;a.click()}}
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
  const h=new Html5Qrcode('rd'),res=$('#res');res.textContent='';
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
