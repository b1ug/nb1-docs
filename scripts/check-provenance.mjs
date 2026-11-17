import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const filename=path.join(root,'content-provenance.json');
const manifest=JSON.parse(await fs.readFile(filename,'utf8'));
const names=['.gitattributes','.gitignore','.npmrc','LICENSE','README.md','README.zh-CN.md','package.json','package-lock.json'];
async function walk(directory){
 for(const entry of await fs.readdir(path.join(root,directory),{withFileTypes:true})){
  const name=directory+'/'+entry.name;
  if(directory==='.vitepress'&&['cache','.cache','.temp'].includes(entry.name))continue;
  if(entry.isSymbolicLink()) throw new Error(`Unexpected source symlink: ${name}`);
  if(entry.isDirectory()) await walk(name);
  else if(entry.isFile()) names.push(name);
 }
}
for(const directory of ['.github','.vitepress','scripts','docs','pages','public','assets']) await walk(directory);
const files=[];
for(const name of [...new Set(names)].sort()){
 const data=await fs.readFile(path.join(root,name));
 files.push({path:name,bytes:data.length,sha256:crypto.createHash('sha256').update(data).digest('hex')});
}
if(process.argv.includes('--write')){
 manifest.schema_version=2;
 manifest.artifact_kind='documentation-vitepress-source';
 delete manifest.site_source.content_seed_commit;
 delete manifest.site_source.base_commit;
 manifest.site_source.seed_identity='Source files are identified by their hashes below. The final clean repository commit is recorded separately in dist/site-build.json; no self-referential source commit is claimed.';
 manifest.site_source.files=files;
 Object.assign(manifest.public_scope,{
  publication_status:'public_documentation_source',framework:'vitepress',framework_version:'1.6.4',search:'local, separate English and Chinese indexes',
  runtime_policy:'Static local assets, same-origin local search, no analytics, remote fonts, Service Worker, hardware access or startup downloads.',
  links:'Clean documentation routes, original source downloads and immutable upstream references; no invented release downloads.'
 });
 manifest.translation_policy={reference_pages:['api-v1','api-v1-terminology','architecture'],api_tokens:'Protocol names, inline code, code blocks and numeric limits are preserved; Chinese descriptions are translations, not new API aliases.',anchors:'Both languages use stable English heading IDs generated from the English source.'};
 await fs.writeFile(filename,JSON.stringify(manifest,null,2)+'\n');
}else if(JSON.stringify(files)!==JSON.stringify(manifest.site_source.files)){
 throw new Error('Source provenance is stale. Review changes, then run npm run provenance:update.');
}
console.log(JSON.stringify({status:'PASS',mode:process.argv.includes('--write')?'write':'check',source_files:files.length,self_hash_included:false}));
