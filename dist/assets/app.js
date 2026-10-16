const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#nav');
function closeMenu(){nav?.classList.remove('open');menu?.setAttribute('aria-expanded','false');menu?.setAttribute('aria-label','Menu openen');}
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';nav.classList.toggle('open',open);menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Menu sluiten':'Menu openen');});
nav?.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav?.classList.contains('open')){closeMenu();menu.focus();}});
document.addEventListener('click',e=>{if(nav?.classList.contains('open')&&!e.target.closest('.header'))closeMenu();});
matchMedia('(min-width:851px)').addEventListener('change',e=>{if(e.matches)closeMenu();});
const form=document.querySelector('#request-form');
if(form){
  const selected=new URLSearchParams(location.search).get('dienst');
  const allowed=[...form.querySelectorAll('[data-slug]')];
  const preselect=allowed.find(input=>input.dataset.slug===selected);
  if(preselect)preselect.checked=true;
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
