import {recommend,requestLink,rooms,serviceNames,scene} from './comfort-model.js';
const $=s=>document.querySelector(s);
const form=$('#comfort-form');
let step=0;
const stepNames=['Je gebouw','Je plannen','Je wensen'];
function showStep(focus=true){
  form.hidden=false;$('#choice-result').hidden=true;
  form.querySelectorAll('[data-step]').forEach((el,i)=>el.hidden=i!==step);
  $('#choice-back').hidden=step===0;
  $('#choice-next').textContent=step===2?'Bekijk mijn voorstel ↗':'Volgende →';
  $('#choice-progress').textContent=`Stap ${step+1} van 3 · ${stepNames[step]}`;
  $('.choice-number').textContent='0'+(step+1);
  $('#choice-meter').value=step+1;
  $('#choice-error').textContent='';
  if(focus)form.querySelector(`[data-step="${step}"] legend`).focus();
}
form.addEventListener('change',()=>{
  $('#choice-error').textContent='';
  const business=form.querySelector('[value="bewaring"]');
  const allowed=new FormData(form).get('gebouw')==='zaak';
  business.closest('label').hidden=!allowed;
  if(!allowed)business.checked=false;
});
form.addEventListener('submit',e=>{
  e.preventDefault();
  const data=new FormData(form);
  const key=['gebouw','project','wens'][step];
  if(!data.getAll(key).length){$('#choice-error').textContent=step===2?'Kies minstens één wens.':'Maak eerst een keuze.';return;}
  if(step<2){step++;showStep();return;}
  const items=recommend(data.get('gebouw'),data.get('project'),data.getAll('wens'));
  const target=$('#choice-matches');target.replaceChildren();
  for(const item of items){
    const article=document.createElement('article');
    const link=document.createElement('a');link.href='/diensten/'+item.service+'/';link.textContent=serviceNames[item.service]+' ↗';
    const text=document.createElement('p');text.textContent=item.reason;
    article.append(link,text);target.append(article);
  }
  $('#choice-contact').href=requestLink(data.get('gebouw'),data.get('project'),data.getAll('wens'));
  form.hidden=true;$('#choice-result').hidden=false;$('#choice-result').focus();
  $('#choice-progress').textContent='Je voorstel is klaar';
});
$('#choice-back').addEventListener('click',()=>{step=Math.max(0,step-1);showStep();});
$('#choice-edit').addEventListener('click',()=>{step=2;showStep();});
$('#choice-reset').addEventListener('click',()=>{form.reset();step=0;showStep();});
showStep(false);
document.querySelectorAll('[data-room]').forEach(button=>button.addEventListener('click',()=>{
  const room=rooms[button.dataset.room];
  document.querySelectorAll('[data-room]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  $('#room-image').src='/assets/'+room.image;$('#room-image').alt='Sfeerbeeld: '+room.name.toLowerCase();
  $('#room-name').textContent=room.name.toUpperCase();$('#room-title').textContent=room.title;$('#room-copy').textContent=room.copy;
  $('#room-links').replaceChildren(...room.services.map(s=>{const a=document.createElement('a');a.href='/diensten/'+s+'/';a.textContent=serviceNames[s]+' ↗';return a;}));
}));
$('[name="mode"][value="warmte"]').checked=true;
function updateScene(){
  const state=scene($('[name="mode"]:checked')?.value,$('#sim-temperature').value,$('#sim-air').value);
  $('#sim-room').style.setProperty('--scene-hue',state.hue);
  $('#sim-room').style.setProperty('--air-speed',(5-state.air)+'s');
  $('#sim-room').style.setProperty('--temperature-glow',(state.temperature-16)/12*.25+.1);
  $('#sim-value').textContent=state.mode==='lucht'?['Rustig','Vlot','Levendig'][state.air-1]:state.temperature+' °C';
  $('#temperature-output').textContent=state.temperature+' °C';
  $('#air-output').textContent=['Rustig','Vlot','Levendig'][state.air-1];
  $('#temperature-control').hidden=state.mode==='lucht';
  $('#sim-mode-label').textContent=state.label;$('#sim-description').textContent=state.description;
  const p=new URLSearchParams({dienst:state.service,sim:state.mode});
  if(state.mode!=='lucht')p.set('temperatuur',state.temperature);
  $('#sim-contact').href='/contact/?'+p+'#aanvraag';
}
document.querySelectorAll('[name="mode"],#sim-temperature,#sim-air').forEach(el=>el.addEventListener('input',updateScene));
updateScene();
