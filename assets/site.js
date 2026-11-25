'use strict';
(()=>{
 const toggle=document.querySelector('.menu-toggle'),nav=document.querySelector('#main-nav');
 toggle?.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));toggle.textContent=open?'Fechar':'Menu';nav.classList.toggle('open',open)});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav?.classList.contains('open')){nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.textContent='Menu';toggle.focus()}});
 if('IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
  const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.remove('waiting');observer.unobserve(e.target)}}),{threshold:.03});
  document.documentElement.classList.add('js-motion');document.querySelectorAll('section.reveal').forEach(el=>{if(el.getBoundingClientRect().top>innerHeight){el.classList.add('waiting');observer.observe(el)}});
 }
 const form=document.querySelector('.brief-form');if(!form)return;
 form.querySelector('[type=submit]').disabled=false;
 const interest=form.elements.interest,challenge=form.elements.challenge,status=form.querySelector('.form-status');
 const requested=new URLSearchParams(location.search).get('interesse');interest.value=['projeto','codesenvolvimento','equipe'].includes(requested)?requested:'projeto';
 function updateInterest(){const team=interest.value==='equipe';form.querySelector('label[for="challenge"]').textContent=team?'Conte sua trajetória e suas competências':'Qual é a pergunta ou o desafio da pesquisa?';document.querySelector('#challenge-hint').textContent=team?'Inclua sua área de interesse e, se desejar, um link público para seu portfólio.':'Inclua o objetivo, o contexto e os dados disponíveis, sem informações confidenciais.'}
 interest.addEventListener('change',updateInterest);updateInterest();
 function feedback(heading,description){status.replaceChildren();const h=document.createElement('h3'),p=document.createElement('p');h.textContent=heading;p.textContent=description;status.append(h,p);status.focus()}
 form.addEventListener('input',e=>{if(e.target.name){e.target.removeAttribute('aria-invalid');const error=document.getElementById(e.target.name+'-error');if(error)error.textContent='';status.replaceChildren()}});
 form.addEventListener('submit',e=>{
  e.preventDefault();const values=Object.fromEntries(new FormData(form));for(const key of ['name','email','organization','challenge']){values[key]=String(values[key]||'').trim();form.elements[key].value=values[key]}
  const errors={};if(!values.name)errors.name='Informe seu nome.';else if(values.name.length>120)errors.name='Use até 120 caracteres para o nome.';
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))errors.email='Informe um e-mail válido, como nome@organizacao.com.';else if(values.email.length>254)errors.email='Use até 254 caracteres para o e-mail.';
  if(values.organization.length>180)errors.organization='Use até 180 caracteres para a organização.';
  if(!['projeto','codesenvolvimento','equipe'].includes(values.interest))errors.interest='Escolha uma modalidade de colaboração.';
  if(!values.challenge)errors.challenge='Conte qual pergunta ou desafio você gostaria de investigar.';else if(values.challenge.length>4000)errors.challenge='Use até 4.000 caracteres para descrever o projeto.';
  for(const key of ['name','email','organization','interest','challenge']){document.getElementById(key+'-error').textContent=errors[key]||'';if(errors[key])form.elements[key].setAttribute('aria-invalid','true');else form.elements[key].removeAttribute('aria-invalid')}
  if(Object.keys(errors).length){feedback('Revise os campos indicados.','Complete as informações obrigatórias para preparar seu resumo. Nenhum dado foi enviado.');return}
  const modality={equipe:'Trabalhe conosco',codesenvolvimento:'Codesenvolvimento',projeto:'Projeto sob demanda'}[values.interest];
  const text=['ArgosAI — resumo para uma conversa de pesquisa','',`Nome: ${values.name}`,`E-mail: ${values.email}`,`Organização: ${values.organization||'Não informada'}`,`Interesse: ${modality}`,'','Apresentação / pergunta de pesquisa / contexto:',values.challenge,'','Este resumo foi preparado localmente. Nenhum dado foi enviado à ArgosAI.','O documento não constitui proposta comercial, contratação ou compromisso de execução.',''].join('\n');
  let url,link;try{url=URL.createObjectURL(new Blob(['\uFEFF',text],{type:'text/plain;charset=utf-8'}));link=document.createElement('a');link.href=url;link.download=`argosai-resumo-${values.interest}.txt`;link.hidden=true;document.body.append(link);link.click();feedback('Seu resumo está pronto.','O download do arquivo de texto foi iniciado. Confira a pasta de downloads do navegador. Nenhum dado foi enviado à ArgosAI.')}catch{feedback('Não foi possível iniciar o download.','Suas informações continuam nesta página. Tente novamente ou copie o texto antes de sair.')}finally{link?.remove();if(url)setTimeout(()=>URL.revokeObjectURL(url),1000)}
 });
})();

/* ===== Home: header sobre a hero + vídeo controlado pelo scroll ===== */
(()=>{
 const hero=document.querySelector('[data-hero-scroll]');if(!hero)return;
 const header=document.querySelector('header'),root=document.documentElement;
 const toggle=document.querySelector('.menu-toggle');
 let frame=0;
 function headerState(){const over=hero.getBoundingClientRect().bottom>header.offsetHeight;header.classList.toggle('is-over-hero',over)}
 toggle?.addEventListener('click',()=>header.classList.toggle('menu-open',toggle.getAttribute('aria-expanded')==='true'));

 const video=hero.querySelector('.hero-video');
 let duration=0,ready=false,pending=false;
 function progress(){const r=hero.getBoundingClientRect(),total=hero.offsetHeight-innerHeight;return total>0?Math.min(1,Math.max(0,-r.top/total)):0}
 function seek(){
  if(!ready)return;
  if(video.seeking){pending=true;return}
  const t=progress()*Math.max(0,duration-.04);
  if(Math.abs(video.currentTime-t)>=1/48)video.currentTime=t;
 }
 function fallback(){root.classList.remove('hero-video-mode');ready=false;video.removeAttribute('src');video.load();schedule()}
 function tick(){frame=0;headerState();seek()}
 function schedule(){if(!frame)frame=requestAnimationFrame(tick)}

 if(root.classList.contains('hero-video-mode')&&video){
  video.muted=true;video.preload='auto';
  video.addEventListener('loadedmetadata',()=>{if(isFinite(video.duration)&&video.duration>0){duration=video.duration;ready=true;schedule()}},{once:true});
  video.addEventListener('seeked',()=>{if(pending){pending=false;schedule()}});
  video.addEventListener('error',fallback,{once:true});
  video.src=video.dataset.src;video.load();
  setTimeout(()=>{if(!ready)fallback()},12000);
 }
 addEventListener('scroll',schedule,{passive:true});
 addEventListener('resize',schedule);
 matchMedia('(prefers-reduced-motion: reduce)').addEventListener?.('change',e=>{if(e.matches&&root.classList.contains('hero-video-mode'))fallback()});
 headerState();
})();

/* ===== Plataforma: scrollytelling com trilha de progresso ===== */
(()=>{
 document.querySelectorAll('[data-scrolly]').forEach(block=>{
  const list=block.querySelector('.scrolly-steps'),steps=[...block.querySelectorAll('.scrolly-step')],imgs=[...block.querySelectorAll('.scrolly-img')],counter=block.querySelector('[data-scrolly-current]');
  if(!steps.length)return;
  let active=0,frame=0;
  function set(i){active=i;steps.forEach((s,k)=>{s.classList.toggle('is-active',k===i);s.classList.toggle('is-past',k<i)});imgs.forEach((m,k)=>m.classList.toggle('is-active',k===i));if(counter)counter.textContent=String(i+1).padStart(2,'0')}
  // trilha: do marcador da 1ª etapa ao da última; trecho da validação tracejado
  function rail(){
   frame=0;
   const lr=list.getBoundingClientRect(),nums=steps.map(s=>s.querySelector('.scrolly-num').getBoundingClientRect());
   const mid=n=>n.top+n.height/2-lr.top,top=mid(nums[0]),bottom=mid(nums[nums.length-1]),len=Math.max(1,bottom-top);
   const pendStart=mid(nums[nums.length-2])+(bottom-mid(nums[nums.length-2]))*.5;
   list.style.setProperty('--rail-top',top+'px');list.style.setProperty('--rail-bottom',(lr.height-bottom)+'px');
   list.style.setProperty('--ps',((pendStart-top)/len*100).toFixed(2)+'%');
   const p=Math.min(1,Math.max(0,(innerHeight*.5-(lr.top+top))/len));list.style.setProperty('--p',p.toFixed(4));
  }
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(rail)};
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);schedule();
  if(!('IntersectionObserver' in window))return;
  const warm=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)){if(!block.classList.contains('has-mol'))imgs.forEach(i=>i.loading='eager');warm.disconnect()}},{rootMargin:'600px 0px'});warm.observe(block);
  const io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting)set(steps.indexOf(e.target))})},{rootMargin:'-45% 0px -45% 0px'});
  steps.forEach(s=>io.observe(s));
 });
})();

/* ===== Header compacto ao rolar ===== */
(()=>{
 const header=document.querySelector('header');if(!header)return;let frame=0;
 const update=()=>{frame=0;header.classList.toggle('is-compact',scrollY>48)};
 addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(update)},{passive:true});update();
})();

/* ===== Entradas: tabelas em sequência e títulos linha a linha ===== */
(()=>{
 const root=document.documentElement;
 if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 root.classList.add('js-motion');
 const below=el=>el.getBoundingClientRect().top>innerHeight*.9;
 // tabelas: linhas primeiro, pareceres depois
 const tables=[...document.querySelectorAll('main table')].filter(t=>t.querySelector('tbody tr')&&below(t));
 tables.forEach(t=>t.classList.add('seq'));
 const tio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-in');tio.unobserve(e.target)}}),{threshold:.2});
 tables.forEach(t=>tio.observe(t));
 // títulos de seção: divide em linhas só na hora de animar e restaura depois
 function split(h){
  const original=h.innerHTML;
  const nodes=[...h.childNodes];if(nodes.some(n=>n.nodeType===1&&n.tagName!=='BR'))return null;
  const frag=document.createDocumentFragment(),words=[];
  nodes.forEach(n=>{if(n.nodeType===3){n.textContent.split(/(\s+)/).forEach(part=>{if(!part)return;if(/^\s+$/.test(part)){frag.append(' ');return}const w=document.createElement('span');w.textContent=part;w.style.display='inline-block';words.push(w);frag.append(w)})}else{const br=document.createElement('br');frag.append(br)}});
  h.replaceChildren(frag);
  const lines=[];let top=null;
  words.forEach(w=>{const t=w.offsetTop;if(top===null||Math.abs(t-top)>4){lines.push([]);top=t}lines[lines.length-1].push(w.textContent)});
  h.replaceChildren(...lines.map((ws,i)=>{const l=document.createElement('span');l.className='line';const inner=document.createElement('span');inner.className='line-inner';inner.style.animationDelay=(i*70)+'ms';inner.textContent=ws.join(' ');l.append(inner);return l}));
  h.setAttribute('aria-label',h.textContent.trim());
  return ()=>{h.innerHTML=original;h.removeAttribute('aria-label')};
 }
 const heads=[...document.querySelectorAll('main section h2')].filter(h=>below(h)&&!h.closest('.hero-scroll,.pathway,.product,.fact,.duo-item,.reason'));
 heads.forEach(h=>h.classList.add('lines-wait'));
 const hio=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;const h=e.target;hio.unobserve(h);const restore=split(h);h.classList.remove('lines-wait');if(restore)setTimeout(restore,900+70*6)}),{threshold:0,rootMargin:'0px 0px -12% 0px'});
 heads.forEach(h=>hio.observe(h));
})();

/* ===== Cards lado a lado: títulos da mesma fileira com a mesma altura ===== */
(()=>{
 const GRIDS='.product-grid,.pathways,.facts,.duo,.reasons,.process-list,.team-grid';
 const titleOf=item=>item.querySelector('h2,h3');
 let frame=0;
 function equalize(){
  frame=0;
  document.querySelectorAll(GRIDS).forEach(grid=>{
   const items=[...grid.children].filter(i=>i.offsetParent!==null);
   items.forEach(i=>{const t=titleOf(i);if(t)t.style.minHeight=''});
   const rows=new Map();
   items.forEach(i=>{const top=Math.round(i.getBoundingClientRect().top+scrollY);if(!rows.has(top))rows.set(top,[]);rows.get(top).push(i)});
   rows.forEach(row=>{
    if(row.length<2)return;
    const titles=row.map(titleOf).filter(Boolean);
    const max=Math.max(...titles.map(t=>t.getBoundingClientRect().height));
    titles.forEach(t=>{if(t.getBoundingClientRect().height<max-1)t.style.minHeight=max+'px'});
   });
  });
 }
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(equalize)};
 addEventListener('resize',schedule);addEventListener('load',schedule);
 document.fonts?.ready.then(schedule);schedule();
})();
