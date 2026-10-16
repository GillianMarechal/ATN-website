import {readBrief,scene} from './comfort-model.js';
const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#nav');
const servicesMenu = document.querySelector('.nav-services');
const menuIcon = menu?.querySelector('.icon path');
const menuIconPath = menuIcon?.getAttribute('d');
function closeMenu(){nav?.classList.remove('open');menu?.setAttribute('aria-expanded','false');menu?.setAttribute('aria-label','Menu openen');if(menu){menu.querySelector('span').textContent='Menu';menuIcon.setAttribute('d',menuIconPath);}if(servicesMenu)servicesMenu.open=false;}
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';if(!open){closeMenu();return;}nav.style.setProperty('--nav-top',`${document.querySelector('.header').getBoundingClientRect().bottom}px`);nav.classList.add('open');menu.setAttribute('aria-expanded','true');menu.setAttribute('aria-label','Menu sluiten');menu.querySelector('span').textContent='Sluiten';menuIcon.setAttribute('d','m6 6 12 12M6 18 18 6');});
nav?.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;if(servicesMenu?.open){servicesMenu.open=false;servicesMenu.querySelector('summary').focus();}else if(nav?.classList.contains('open')){closeMenu();menu.focus();}});
document.addEventListener('click',e=>{if(servicesMenu?.open&&!e.target.closest('.nav-services'))servicesMenu.open=false;if(nav?.classList.contains('open')&&!e.target.closest('.header'))closeMenu();});
document.addEventListener('focusin',e=>{if(servicesMenu?.open&&!servicesMenu.contains(e.target))servicesMenu.open=false;});
matchMedia('(min-width:1101px)').addEventListener('change',e=>{if(e.matches)closeMenu();});
const form=document.querySelector('#request-form');
if(form){
  const params=new URLSearchParams(location.search);
  const selected=params.getAll('dienst');
  const allowed=[...form.querySelectorAll('[data-slug]')];
  const brief=readBrief(location.search);
  const wanted=brief?brief.services:selected;
  allowed.forEach(input=>{if(wanted.includes(input.dataset.slug))input.checked=true;});
  if(brief)form.elements.bericht.value=brief.text;
  else if(['warmte','koelte','lucht'].includes(params.get('sim'))){
    const state=scene(params.get('sim'),params.get('temperatuur'),1);
    form.elements.bericht.value='Ik heb de comfortstudio bekeken.\nInteresse: '+state.label+(state.mode==='lucht'?'':'\nMijn temperatuurvoorkeur: '+state.temperature+' °C')+'\n\nMeer over mijn ruimte:\n';
  }
  const result=document.querySelector('#email-result');
  let requestText='';
  form.addEventListener('submit',e=>{
    e.preventDefault();
    if(!form.reportValidity())return;
    const data=new FormData(form);
    const fields=Object.fromEntries(['naam','email','telefoon','locatie','bericht'].map(k=>[k,String(data.get(k)||'').trim()]));
    if(!fields.naam||fields.bericht.length<10){const input=!fields.naam?form.elements.naam:form.elements.bericht;input.setCustomValidity(!fields.naam?'Vul je naam in.':'Beschrijf je vraag in minstens 10 tekens.');input.reportValidity();input.addEventListener('input',()=>input.setCustomValidity(''),{once:true});return;}
    const services=data.getAll('diensten');
    const subject=`Aanvraag ${services.length?services.join(', '):'algemene vraag'} — ${fields.naam}`;
    requestText=`Dag ATN,\n\nIk neem graag contact op over ${services.length?services.join(', ').toLowerCase():'een algemene vraag'}.\n\n${fields.bericht}\n\nMijn gegevens:\nNaam: ${fields.naam}\nE-mail: ${fields.email}${fields.telefoon?'\nTelefoon: '+fields.telefoon:''}${fields.locatie?'\nProjectlocatie: '+fields.locatie:''}\n\nMet vriendelijke groeten,\n${fields.naam}`;
    document.querySelector('#open-email').href=`mailto:info@atn-technix.be?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(requestText)}`;
    document.querySelector('#email-preview').textContent=requestText;
    document.querySelector('#copy-status').textContent='';
    form.hidden=true;result.hidden=false;result.focus({preventScroll:true});result.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'center'});
  });
  document.querySelector('#edit-request').addEventListener('click',()=>{result.hidden=true;form.hidden=false;form.querySelector('input[type=checkbox]').focus({preventScroll:true});form.scrollIntoView({block:'start',behavior:'smooth'});});
  document.querySelector('#copy-request').addEventListener('click',async()=>{
    const status=document.querySelector('#copy-status');
    try{await navigator.clipboard.writeText(requestText);status.textContent='Aanvraag gekopieerd. Plak de tekst in een e-mail naar info@atn-technix.be.';}
    catch{const preview=document.querySelector('#email-preview');preview.parentElement.open=true;const range=document.createRange();range.selectNodeContents(preview);const selection=getSelection();selection.removeAllRanges();selection.addRange(range);status.textContent='Automatisch kopiëren is niet beschikbaar. De tekst is geselecteerd: kopieer deze en mail naar info@atn-technix.be.';}
  });
}
