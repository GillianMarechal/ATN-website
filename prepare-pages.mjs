import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

// Build a separate artifact so local and Sites output remain usable at the root.
const base=process.argv[2];
const origin=process.argv[3]?.replace(/\/$/,'');
if(!/^\/[A-Za-z0-9_-]+$/.test(base||''))throw new Error('Supply the Pages project path, e.g. /ATN-website');
const url=new URL(origin);
if(url.protocol!=='https:'||url.pathname!=='/'||url.search||url.hash)throw new Error('Supply a bare HTTPS origin');
const output=path.resolve('.local/pages');
fs.mkdirSync(output,{recursive:true});
fs.cpSync('dist',output,{recursive:true});
execFileSync(process.execPath,['build.mjs'],{stdio:'inherit',env:{...process.env,SITE_OUTPUT:output,SITE_ORIGIN:origin,SEO_INDEXABLE:'false'}});
for(const relative of fs.readdirSync(output,{recursive:true})){
  const file=path.join(output,relative);
  if(!fs.statSync(file).isFile()||!['.html','.js','.css','.xml','.txt'].includes(path.extname(file)))continue;
  let text=fs.readFileSync(file,'utf8');
  text=text.replaceAll(origin+'/',origin+base+'/');
  if(file.endsWith('.html'))text=text.replace(/((?:href|src|action)=["'])\/(?!\/)/g,'$1'+base+'/');
  if(file.endsWith('.js'))text=text.replace(/(["'`])\/(?!\/)/g,'$1'+base+'/');
  if(file.endsWith('.css'))text=text.replace(/(url\(["']?)\/(?!\/)/g,'$1'+base+'/');
  fs.writeFileSync(file,text);
}
fs.writeFileSync(path.join(output,'.nojekyll'),'');
console.log('Prepared Pages artifact: '+output);
