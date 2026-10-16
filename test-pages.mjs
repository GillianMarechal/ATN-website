import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const root=path.resolve('.local/pages');
const base='/ATN-website';
const origin='https://gillianmarechal.github.io';
let checked=0;
for(const relative of fs.readdirSync(root,{recursive:true}).filter(f=>f.endsWith('.html'))){
  const text=fs.readFileSync(path.join(root,relative),'utf8');
  for(const match of text.matchAll(/(?:href|src)="(\/[^"#]*)/g)){
    const href=match[1].split(/[?#]/)[0];
    assert.ok(href.startsWith(base+'/'),'Unprefixed link: '+href);
    const target=path.join(root,href.slice(base.length));
    assert.ok(fs.existsSync(target),'Missing link: '+href);
    if(fs.statSync(target).isDirectory())assert.ok(fs.existsSync(path.join(target,'index.html')));
    checked++;
  }
  if(relative!=='404.html'){
    assert.ok(text.includes('href="'+origin+base+'/'),'Expected Pages canonical');
    const graph=JSON.parse(text.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
    assert.ok(graph['@graph'].every(item=>!item['@id']||item['@id'].startsWith(origin+base+'/')));
  }
  assert.ok(text.includes('noindex, follow'),'Keep temporary preview out of search');
}
const model=await import(pathToFileURL(path.join(root,'assets/comfort-model.js')));
const brief=model.requestLink('zaak','renovatie',['bewaring','lucht']);
assert.ok(brief.startsWith(base+'/contact/'));
assert.deepEqual(model.readBrief(new URL(brief,origin).search).services,['koeltechniek','ventilatie']);
for(const name of ['app.js','comfort.js','comfort-model.js']){
  const script=fs.readFileSync(path.join(root,'assets',name),'utf8');
  assert.ok(!/["'`]\/(?:contact|diensten|assets)\//.test(script),'Unprefixed JavaScript URL');
}
assert.ok(fs.readFileSync(path.join(root,'sitemap.xml'),'utf8').includes(origin+base+'/comfort/'));
console.log(`PASS: ${checked} Pages links, schema URLs, choice-to-contact transfer and JavaScript paths.`);
