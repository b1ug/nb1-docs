import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url)),dist=path.join(root,'dist');
const check=process.argv.includes('--check');
const hash=data=>crypto.createHash('sha256').update(data).digest('hex');
async function walk(dir){const files=[];for(const e of await fs.readdir(dir,{withFileTypes:true})){if(e.isSymbolicLink())throw new Error('Symlinks are not site assets');if(e.isDirectory())files.push(...await walk(path.join(dir,e.name)));else if(e.isFile())files.push(path.join(dir,e.name));else throw new Error('Non-regular site asset');}return files.sort();}
function policy(html){
 const hashes=[];
 for(const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi))if(!/\bsrc\s*=/.test(match[1])&&match[2].trim())hashes.push(`'sha256-${crypto.createHash('sha256').update(match[2]).digest('base64')}'`);
 return `default-src 'self'; script-src 'self' ${[...new Set(hashes)].join(' ')}; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-src 'none'`;
}
let files=await walk(dist);
for(const filename of files.filter(p=>/\.(?:html|css|js|json|txt|map)$/.test(p))){const data=await fs.readFile(filename,'utf8');if(/\/Users\/|Notion-Doc|reference\/extracted/.test(data))throw new Error(`Private source metadata in site output: ${filename}`);}
for(const filename of files.filter(p=>p.endsWith('.js'))){
 const code=await fs.readFile(filename,'utf8');
 if(/_vp-fn_|deserializeFunctions|\bnew\s+Function\s*\(/.test(code))throw new Error(`Runtime function compilation: ${filename}`);
}
for(const filename of files.filter(p=>p.endsWith('.html'))){
 let html=await fs.readFile(filename,'utf8');
 if(html.includes('_vp-fn_'))throw new Error(`Runtime function serialization requires eval: ${filename}`);
 const current=html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]*)">/);
 const expected=policy(html);
 if(check){if(!current||current[1]!==expected)throw new Error(`CSP mismatch: ${filename}`);}
 else{html=html.replace(/<meta http-equiv="Content-Security-Policy" content="[^"]*">/g,'');html=html.replace('<head>',`<head><meta http-equiv="Content-Security-Policy" content="${expected}">`);await fs.writeFile(filename,html);}
}
const info=JSON.parse(await fs.readFile(path.join(dist,'site-info.json'),'utf8'));
const modelSource=JSON.parse(await fs.readFile(path.join(dist,'nightlab/model-assets/source.json'),'utf8'));
const mapping=modelSource.led_numbering.wordmark_correspondence;
if('project_source' in mapping||'physical_verification' in mapping)throw new Error('Private model receipt metadata in output');
const htmlFiles=new Set(files.filter(p=>p.endsWith('.html')).map(p=>path.relative(dist,p).replaceAll(path.sep,'/')));
const ids=new Map();
for(const name of htmlFiles){const s=await fs.readFile(path.join(dist,name),'utf8');ids.set(name,new Set([...s.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1])));}
function resolveTarget(url,current){
 const parsed=new URL(url,'http://site.local'+info.base+current);
 if(parsed.origin!=='http://site.local')return null;
 const pathname=decodeURIComponent(parsed.pathname);
 if(!pathname.startsWith(info.base))throw new Error(`Local link escapes site base ${info.base}: ${url}`);
 const decoded=pathname.slice(info.base.length);
 let dest=decoded;
 if(!dest||dest.endsWith('/'))dest+='index.html';
 else if(!path.posix.extname(dest))dest+='.html';
 if(dest.split('/').includes('..')||path.isAbsolute(dest))throw new Error('Unsafe output link');
 return {dest,fragment:decodeURIComponent(parsed.hash.slice(1))};
}
let links=0,anchors=0;
for(const name of htmlFiles){
 const html=await fs.readFile(path.join(dist,name),'utf8');
 for(const m of html.matchAll(/<(a|link|script|img)\b[^>]*?\b(?:href|src)="([^"]*)"[^>]*>/gi)){
  const raw=m[2].replaceAll('&amp;','&');
  if(/^(?:data:|mailto:|tel:)/.test(raw))continue;
  const target=resolveTarget(raw,name);
  if(!target){if(m[1]!=='a')throw new Error(`External runtime asset: ${raw}`);continue;}
  if(!files.includes(path.join(dist,target.dest)))throw new Error(`Dead local link: ${name} -> ${raw} (${target.dest})`);
  links++;
  if(target.fragment&&htmlFiles.has(target.dest)){if(!ids.get(target.dest).has(target.fragment))throw new Error(`Dead anchor: ${name} -> ${raw}`);anchors++;}
 }
}
const openapi=await fs.readFile(path.join(dist,'api-v1.openapi.json'));
if(!openapi.equals(await fs.readFile(path.join(root,'public/api-v1.openapi.json'))))throw new Error('OpenAPI copy differs');
for(const name of ['nb1-mascot.webp','nb1-icon.png'])if(!(await fs.readFile(path.join(dist,'assets',name))).equals(await fs.readFile(path.join(root,'assets',name))))throw new Error(`Brand mismatch ${name}`);
files=await walk(dist);
const records=[];for(const filename of files){const relative=path.relative(dist,filename).replaceAll(path.sep,'/');if(relative==='site-build.json')continue;const data=await fs.readFile(filename);records.push({path:relative,bytes:data.length,sha256:hash(data)});}
const report={schema_version:1,artifact_kind:'vitepress-static-site',framework:'vitepress',framework_version:'1.6.4',site_source:info.site_source,source_dirty:info.source_dirty,guide_core_source:info.guide_core_source,deployment_status:'build_only',base:info.base,hardware_access:false,pages:info.pages.map(p=>({path:p.route,locale:p.language,source:p.source})),files:records,validation:{html_pages:htmlFiles.size,local_links:links,anchors,bundled_openapi:true,original_b3:true,script_policy:'self plus per-page inline bootstrap hashes; no unsafe-eval',style_policy:'local CSS and framework/Shiki inline styles',connect_policy:'self only'},dependencies_sha256:hash(await fs.readFile(path.join(root,'package-lock.json')))};
const target=path.join(dist,'site-build.json');
if(check){const old=JSON.parse(await fs.readFile(target,'utf8'));if(JSON.stringify(old)!==JSON.stringify(report))throw new Error('Site build receipt mismatch');}
else await fs.writeFile(target,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:'PASS',check,html_pages:htmlFiles.size,files:records.length,bytes:records.reduce((n,r)=>n+r.bytes,0),local_links:links,anchors,source:info.site_source,dirty:info.source_dirty}));
