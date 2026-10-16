export const serviceNames = {verwarming:'Verwarming',sanitair:'Sanitair',ventilatie:'Ventilatie',airconditioning:'Airconditioning',koeltechniek:'Koeltechniek'};
export const contexts = {woning:'Mijn woning',zaak:'Mijn zaak'};
export const projects = {bestaand:'Bestaande installatie aanpassen',renovatie:'Renovatie',nieuwbouw:'Nieuwbouw'};
export const needs = {
  warmte:{label:'Aangename warmte',service:'verwarming',reason:'Je wilt je verwarming of warmtecomfort bespreken.'},
  water:{label:'Badkamer & water',service:'sanitair',reason:'Je hebt plannen voor je badkamer of sanitaire aansluitingen.'},
  lucht:{label:'Frisse lucht',service:'ventilatie',reason:'Je wilt ventilatie in je gebouw bespreken.'},
  koelte:{label:'Koele kamers',service:'airconditioning',reason:'Je zoekt koeling voor een woon- of werkruimte.'},
  bewaring:{label:'Koeling voor mijn zaak',service:'koeltechniek',reason:'Je hebt een koeltechnische toepassing voor je zaak.'}
};
export function recommend(context, project, selected) {
  if(!Object.hasOwn(contexts,context)||!Object.hasOwn(projects,project)) return [];
  return [...new Set(selected)].filter(k=>Object.hasOwn(needs,k)&&(context==='zaak'||k!=='bewaring')).map(k=>({...needs[k],key:k}));
}
export function requestLink(context,project,selected){
  const params=new URLSearchParams({gebouw:context,project});
  for(const item of recommend(context,project,selected)) params.append('wens',item.key);
  return '/contact/?'+params.toString()+'#aanvraag';
}
export function readBrief(search){
  const p=new URLSearchParams(search);
  const context=p.get('gebouw'),project=p.get('project');
  const items=recommend(context,project,p.getAll('wens'));
  if(!items.length) return null;
  return {services:items.map(i=>i.service),text:`Mijn comfortkeuze\nGebouw: ${contexts[context]}\nProject: ${projects[project]}\nWensen: ${items.map(i=>i.label).join(', ')}\n\nMeer over mijn plannen:\n`};
}
export const rooms={
  living:{name:'Woonkamer',title:'Warmte en koelte in balans',copy:'Een ruimte om samen te leven. Bespreek de verwarming, gewenste koeling en ventilatie als één geheel.',services:['verwarming','airconditioning','ventilatie'],image:'verwarming.webp'},
  bath:{name:'Badkamer',title:'Watercomfort en frisse lucht',copy:'Je nieuwe badkamer begint bij de indeling en aansluitingen. Denk tegelijk aan verwarming en ventilatie.',services:['sanitair','ventilatie','verwarming'],image:'sanitair.webp'},
  sleep:{name:'Slaapkamer',title:'Jouw ruimte om tot rust te komen',copy:'Wil je een slaapkamer koelen of de ventilatie bespreken? Vertel hoe je de kamer gebruikt en waar de zon binnenvalt.',services:['airconditioning','ventilatie'],image:'airconditioning.webp'},
  utility:{name:'Technische ruimte',title:'De techniek achter je comfort',copy:'Een centrale plek voor installaties. De beschikbare ruimte en het bestaande leidingwerk helpen om je plannen te beoordelen.',services:['verwarming','ventilatie'],image:'ventilatie.webp'},
  business:{name:'Zaak',title:'Koeling voor jouw toepassing',copy:'Vertel wat je wilt koelen, welke temperatuur nodig is en welke installatie je al hebt. ATN bespreekt de mogelijkheden.',services:['koeltechniek','airconditioning'],image:'koeltechniek.webp'}
};
export function scene(mode,temperature,air){
  const t=Math.max(16,Math.min(28,Number(temperature)||21));
  const a=Math.max(1,Math.min(3,Number(air)||1));
  const m=['warmte','koelte','lucht'].includes(mode)?mode:'warmte';
  return {mode:m,temperature:t,air:a,hue:m==='warmte'?28:m==='koelte'?198:165,
    label:m==='warmte'?'Verwarming':m==='koelte'?'Airconditioning':'Ventilatie',
    description:m==='lucht'?'De bewegende lijnen verbeelden luchtcirculatie. De snelheid is alleen een visueel effect.':`Je kiest ${t} °C als persoonlijke voorkeur. De kleur verbeeldt ${m==='warmte'?'warmte':'koeling'}; dit is geen voorspelling van de kamertemperatuur.`,
    service:m==='warmte'?'verwarming':m==='koelte'?'airconditioning':'ventilatie'};
}
