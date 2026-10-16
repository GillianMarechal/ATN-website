import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {parseHTML} from './.local/node_modules/linkedom/esm/index.js';
import {recommend,requestLink,readBrief,scene} from './dist/assets/comfort-model.js';
let checks=0;
const check=(value,label)=>{assert.ok(value,label);checks++;};
for(const context of ['woning','zaak'])for(const project of ['renovatie','nieuwbouw','bestaand'])for(let mask=1;mask<32;mask++){
  const selected=['warmte','water','lucht','koelte','bewaring'].filter((v,i)=>mask&(1<<i));
  const items=recommend(context,project,selected);
  const brief=readBrief(new URL(requestLink(context,project,selected),'https://example.test').search);
  assert.deepEqual(brief?.services||[],items.map(i=>i.service));checks++;
}
check(readBrief('?gebouw=__proto__&project=renovatie&wens=warmte')===null,'Unknown context rejected');
check(readBrief('?gebouw=woning&project=renovatie&wens=<script>')===null,'Unknown desires rejected');
check(scene('invalid',999,-1).temperature===28,'Simulator upper clamp');
check(scene('lucht',-100,999).air===3,'Simulator range clamp');
const {document:comfortDocument,window}=parseHTML(fs.readFileSync('dist/comfort/index.html','utf8'));
globalThis.document=comfortDocument;globalThis.window=window;
window.HTMLElement.prototype.focus=function(){document.activeElementForTest=this;};
window.HTMLElement.prototype.scrollIntoView=function(){};
globalThis.matchMedia=()=>({matches:false,addEventListener(){}});
class DomFormData {
  constructor(form){this.items=[...form.querySelectorAll('input,textarea')].filter(e=>e.name&&(!['radio','checkbox'].includes(e.type)||e.checked)).map(e=>[e.name,e.value]);}
  get(name){return this.items.find(x=>x[0]===name)?.[1]||null;}
  getAll(name){return this.items.filter(x=>x[0]===name).map(x=>x[1]);}
}
globalThis.FormData=DomFormData;
await import('./dist/assets/comfort.js');
const $=s=>document.querySelector(s);
const event=(element,type)=>element.dispatchEvent(new window.Event(type,{bubbles:true,cancelable:true}));
const form=$('#comfort-form');
const choose=(name,value)=>{if(name!=='wens')form.querySelectorAll(`[name="${name}"]`).forEach(e=>e.checked=false);form.querySelector(`[name="${name}"][value="${value}"]`).checked=true;event(form,'change');};
event(form,'submit');check($('#choice-error').textContent.length>0,'Empty step prevented');
choose('gebouw','zaak');event(form,'submit');check(!form.querySelector('[data-step="1"]').hidden,'Step two shown');
choose('project','renovatie');event(form,'submit');choose('wens','bewaring');choose('wens','lucht');event(form,'submit');
check(form.hidden&&!$('#choice-result').hidden,'Result shown');
check($('#choice-matches').children.length===2,'Two relevant services rendered');
const resultUrl=$('#choice-contact').getAttribute('href');
check(readBrief(new URL(resultUrl,'https://example.test').search).services.includes('koeltechniek'),'Brief transfers business refrigeration');
event($('#choice-edit'),'click');check(!form.hidden,'Edit restores choices');
event($('#choice-back'),'click');event($('#choice-back'),'click');choose('gebouw','woning');
check(!form.querySelector('[value="bewaring"]').checked,'Residential switch clears business-only choice');
// linkedom does not provide HTMLFormElement.reset; simulate the native method.
form.reset=()=>form.querySelectorAll('input').forEach(e=>e.checked=false);
event($('#choice-reset'),'click');check(!form.querySelector('[data-step="0"]').hidden,'Reset returns to first step');
for(const button of document.querySelectorAll('[data-room]')){
  event(button,'click');check(button.getAttribute('aria-pressed')==='true','Room selected');
  for(const a of $('#room-links').children)check(fs.existsSync('dist'+a.getAttribute('href')+'index.html'),'Room service link exists');
}
for(const mode of ['koelte','lucht','warmte']){
  document.querySelectorAll('[name="mode"]').forEach(e=>{e.checked=e.value===mode;if(e.checked)e.setAttribute('checked','');else e.removeAttribute('checked');});
  event($('#sim-air'),'input');check($('#sim-contact').getAttribute('href').includes('sim='+mode),'Simulator mode forwarded');
}
// Exercise the actual contact handler with the generated choice link.
const contact=parseHTML(fs.readFileSync('dist/contact/index.html','utf8'));
globalThis.document=contact.document;globalThis.window=contact.window;
globalThis.location={search:new URL(resultUrl,'https://example.test').search};
const cf=document.querySelector('#request-form');
Object.defineProperty(cf,'elements',{value:Object.fromEntries([...cf.querySelectorAll('[name]')].map(e=>[e.name,e]))});
cf.reportValidity=()=>true;
await import('./dist/assets/app.js');
check(cf.elements.bericht.value.includes('Koeling voor mijn zaak'),'Contact prefilled from real result');
check(cf.querySelector('[data-slug="koeltechniek"]').checked,'Contact selects refrigeration');
cf.elements.naam.value='Test Klant';cf.elements.email.value='test@example.test';
cf.dispatchEvent(new contact.window.Event('submit',{bubbles:true,cancelable:true}));
check(document.querySelector('#email-preview').textContent.includes('Koeling voor mijn zaak'),'Email contains choices');
check(document.querySelector('#open-email').getAttribute('href').startsWith('mailto:info@atn-technix.be?'),'Email draft targets ATN');
// Check both preview and production SEO builds, always restore private preview.
try{
  for(const live of [false,true]){
    execFileSync(process.execPath,['build.mjs'],{env:{...process.env,SEO_INDEXABLE:String(live),SITE_ORIGIN:'https://atn-technix.gillian-mare-1074.chatgpt.site'}});
    const files=fs.readdirSync('dist',{recursive:true}).filter(x=>x.endsWith('.html'));
    const titles=new Set(),descriptions=new Set();
    for(const file of files){
      const d=parseHTML(fs.readFileSync('dist/'+file,'utf8')).document;
      check(d.querySelectorAll('h1').length===1,'One H1');
      const title=d.title,desc=d.querySelector('meta[name=description]').content;
      check(!titles.has(title),'Unique title');titles.add(title);check(!descriptions.has(desc),'Unique description');descriptions.add(desc);
      const missing=file==='404.html';
      check(d.querySelector('meta[name=robots]').content.startsWith(live&&!missing?'index,':'noindex,'),'Correct indexing mode');
      if(missing){check(!d.querySelector('link[rel=canonical]'),'404 has no homepage canonical');continue;}
      const graph=JSON.parse(d.querySelector('script[type="application/ld+json"]').textContent)['@graph'];
      check(graph.some(e=>e['@type']==='HVACBusiness'),'Local business graph');
      const canonical=d.querySelector('link[rel=canonical]').href;
      check(fs.readFileSync('dist/sitemap.xml','utf8').includes(canonical),'Canonical in sitemap');
      if(file.startsWith('diensten')&&file!=='diensten\\index.html'&&file!=='diensten/index.html')check(graph.some(e=>e['@type']==='Service'),'Service schema');
    }
  }
}finally{execFileSync(process.execPath,['build.mjs'],{env:{...process.env,SEO_INDEXABLE:'false'}});}
console.log(`PASS: ${checks} checks: combinations, UI handlers, form transfer, room links, simulator, preview/production SEO. DOM emulation only; browser rendering not verified.`);
