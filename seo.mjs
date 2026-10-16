export const origin=(process.env.SITE_ORIGIN||'https://atn-technix.gillian-mare-1074.chatgpt.site').replace(/\/$/,'');
const parsed=new URL(origin);
if(parsed.protocol!=='https:'||parsed.pathname!=='/'||parsed.search||parsed.hash)throw new Error('SITE_ORIGIN must be a bare HTTPS origin');
export const indexable=process.env.SEO_INDEXABLE==='true';
export const localContent={
  verwarming:{heading:'Verwarming in alle comfort',paragraphs:['Een renovatie, een nieuwbouw of een aanpassing aan je huidige verwarming? ATN bv in De Haan is je aanspreekpunt om de technische mogelijkheden te bespreken. Vertel welke ruimtes je wilt verwarmen en welk systeem er vandaag aanwezig is.','Verzamel waar mogelijk de gegevens van je installatie, foto’s van de opstelling en plannen van de woning. Ook isolatie, gebruik van de kamers en je gewenste comfort horen bij het gesprek. Zo kan ATN je vraag beoordelen op basis van jouw gebouw.']},
  sanitair:{heading:'Sanitair en badkamerplannen, afgewerkt tot in de details',paragraphs:['Wil je je badkamer vernieuwen of sanitaire aansluitingen aanpassen? Bespreek je plannen met ATN bv in De Haan. Een goede voorbereiding brengt de gewenste indeling, het dagelijks gebruik en de aanwezige aansluitingen samen.','Denk aan de plaats van douche, bad, wastafel en toilet. Foto’s, afmetingen en een eenvoudige schets helpen om je wensen duidelijk te maken. Combineer je de werken met verwarming of ventilatie, vermeld dit dan in dezelfde aanvraag.']},
  ventilatie:{heading:'Ventilatie, want gezondheid gaat voor alles',paragraphs:['Ventilatie verdient aandacht bij zowel een bestaande woning als een verbouwing of nieuwbouw. ATN bv in De Haan bespreekt je ventilatievraag vanuit de ruimtes, het gebruik van het gebouw en de voorzieningen die al aanwezig zijn.','Vermeld of je bestaande ventilatie wilt aanpassen of een nieuwe oplossing zoekt. Foto’s van roosters, kanalen of de technische ruimte en eventuele bouwplannen geven nuttige context. De keuze en uitwerking van een systeem volgen uit de beoordeling van de concrete situatie.']},
  airconditioning:{heading:'Airconditioning om het hoofd koel te houden',paragraphs:['Een koele slaapkamer, een aangename woonkamer of een comfortabele werkplek: vertel ATN bv in De Haan welke ruimtes je wilt koelen. De oppervlakte, zoninval, isolatie en het gebruik zijn belangrijke gegevens voor het gesprek.','Denk ook aan mogelijke plaatsen voor de binnen- en buitenunit. Heb je al airconditioning, voeg dan het merk en type toe als je die kent. Via de keuzehulp kun je je wensen combineren met een vraag over verwarming of ventilatie.']},
  koeltechniek:{heading:'Koeltechniek in alle efficiëntie',paragraphs:['Een koeltechnische vraag begint bij de toepassing. ATN bv in De Haan bespreekt wat je wilt koelen, onder welke omstandigheden en welke temperatuur daarbij gewenst is. Vermeld of het om een bestaande installatie of een nieuw project gaat.','Geef bij een bestaande installatie het merk, type en een concrete beschrijving van je vraag mee. Bij een nieuw plan helpen de beschikbare ruimte, het beoogde gebruik en je timing. Op basis daarvan bespreekt ATN of en hoe je aanvraag kan worden opgepakt.']}
};
export function seoGraph({title,description,url,services,image}){
  const business={'@type':'HVACBusiness','@id':origin+'/#bedrijf',name:'ATN bv',url:origin+'/',telephone:'+32486646876',email:'info@atn-technix.be',taxID:'BE1001.974.960',address:{'@type':'PostalAddress',streetAddress:'Ten Anker 4',postalCode:'8420',addressLocality:'De Haan',addressCountry:'BE'},logo:origin+'/assets/logo.png',image:origin+'/assets/home.webp',description:'Verwarming, sanitair, ventilatie, airconditioning en koeltechniek vanuit De Haan.'};
  const web={'@type':'WebSite','@id':origin+'/#website',url:origin+'/',name:'ATN bv',inLanguage:'nl-BE',publisher:{'@id':business['@id']}};
  const page={'@type':url==='/contact/'?'ContactPage':url==='/over-atn/'?'AboutPage':'WebPage','@id':origin+url+'#pagina',url:origin+url,name:title,description,inLanguage:'nl-BE',isPartOf:{'@id':web['@id']},about:{'@id':business['@id']},primaryImageOfPage:{'@type':'ImageObject',url:origin+'/assets/'+image}};
  const graph=[business,web,page];
  const service=services.find(s=>url===`/diensten/${s.slug}/`);
  if(service){const id=origin+url+'#dienst';graph.push({'@type':'Service','@id':id,name:service.title,serviceType:service.title,description:service.description,url:origin+url,provider:{'@id':business['@id']}});page.mainEntity={'@id':id};}
  if(url!=='/'){
    const trail=[{name:'Home',url:'/'}];
    if(service)trail.push({name:'Onze diensten',url:'/diensten/'});
    trail.push({name:service?.title||({'/diensten/':'Onze diensten','/comfort/':'Ontdek jouw comfort','/contact/':'Contact','/over-atn/':'Over ATN','/privacy/':'Privacy'}[url]||title),url});
    const id=origin+url+'#broodkruimels';page.breadcrumb={'@id':id};
    graph.push({'@type':'BreadcrumbList','@id':id,itemListElement:trail.map((item,i)=>({'@type':'ListItem',position:i+1,name:item.name,item:origin+item.url}))});
  }
  return {'@context':'https://schema.org','@graph':graph};
}
