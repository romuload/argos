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

/* ===== Plataforma: scrollytelling ===== */
(()=>{
 document.querySelectorAll('[data-scrolly]').forEach(block=>{
  const steps=[...block.querySelectorAll('.scrolly-step')],imgs=[...block.querySelectorAll('.scrolly-img')],counter=block.querySelector('[data-scrolly-current]');
  if(!steps.length||!('IntersectionObserver' in window))return;
  // pré-carrega as imagens do painel fixo quando a seção se aproxima
  const warm=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)){imgs.forEach(i=>i.loading='eager');warm.disconnect()}},{rootMargin:'600px 0px'});warm.observe(block);
  let active=0;
  function set(i){if(i===active)return;active=i;steps.forEach((s,k)=>s.classList.toggle('is-active',k===i));imgs.forEach((m,k)=>m.classList.toggle('is-active',k===i));if(counter)counter.textContent=String(i+1).padStart(2,'0')}
  const io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting)set(steps.indexOf(e.target))})},{rootMargin:'-45% 0px -45% 0px'});
  steps.forEach(s=>io.observe(s));
 });
})();
