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
