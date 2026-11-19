import { stageModel } from '@b1ug/blink1-models/stage';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createMarkdownRenderer } from 'vitepress';
import { coreSource, topics, sourceName, pageRoute } from './content-map.mjs';
import { siteBase, siteURL } from './site-config.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'site');
const md = await createMarkdownRenderer(root);
const sha = data => crypto.createHash('sha256').update(data).digest('hex');
const files = new Map(), inputs = [];
function headings(text) {
  return md.parse(text, {}).filter(t => t.type === 'heading_open').map(t => ({line:t.map[0], level:t.tag, id:t.attrGet('id')}));
}
function anchored(text, own, canonical, name) {
  if (own.length !== canonical.length || own.some((h,i) => h.level !== canonical[i].level))
    throw new Error(`Heading structure differs from English: ${name}: ${own.length}/${canonical.length}`);
  const lines = text.split('\n');
  for (let i=0;i<own.length;i++) {
    const h=own[i], id=canonical[i].id;
    if (!id) throw new Error(`Missing canonical heading ID: ${name}`);
    lines[h.line]=lines[h.line].replace(/\s*\{#[^}]+\}\s*$/, '')+` {#${id}}`;
  }
  return lines.join('\n');
}
for (const topic of ['index', ...topics.map(t=>t[0])]) {
  const englishName=sourceName(topic,'en'), english=await fs.readFile(path.join(root,englishName),'utf8');
  const canonical=headings(english);
  for (const language of ['en','zh-CN']) {
    const source=sourceName(topic,language), text=await fs.readFile(path.join(root,source),'utf8');
    if (text.includes('\r')) throw new Error(`Expected canonical LF text: ${source}`);
    const document=anchored(text,headings(text),canonical,source);
    const filename=(language==='zh-CN'?'zh/':'')+topic+'.md';
    files.set(filename,document);inputs.push({source,route:pageRoute(topic,language),language,sha256:sha(text)});
  }
}
if (process.argv.includes('--check')) {
  console.log(JSON.stringify({status:'PASS',pages:files.size,stable_heading_pairs:true}));process.exit(0);
}
await fs.rm(output,{recursive:true,force:true});await fs.mkdir(output,{recursive:true});
for (const [name,data] of files) {const dest=path.join(output,name);await fs.mkdir(path.dirname(dest),{recursive:true});await fs.writeFile(dest,data);}
await fs.cp(path.join(root,'public'),path.join(output,'public'),{recursive:true});
const modelReceipt = JSON.parse(await fs.readFile(path.join(root, 'public/nightlab/source-receipt.json'), 'utf8'));
await stageModel(path.join(output, 'public/nightlab'), modelReceipt.model_manifest_sha256);
for (const item of inputs) {
  const destination=path.join(output,'public/source',item.source+'.txt');
  await fs.mkdir(path.dirname(destination),{recursive:true});await fs.copyFile(path.join(root,item.source),destination);
}
await fs.copyFile(path.join(root,'content-provenance.json'),path.join(output,'public/content-provenance.json'));
const sourceCommit=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
const dirty=execFileSync('git',['status','--porcelain'],{cwd:root,encoding:'utf8'}).trim()!=='';
const manifest={schema_version:1,framework:'vitepress',framework_version:'1.6.4',guide_core_source:coreSource,site_source:sourceCommit,source_dirty:dirty,english_default:true,pages:inputs,hardware_access:false,base:siteBase,deployment_target:siteURL,deployment_status:'build_only'};
await fs.writeFile(path.join(output,'public/site-info.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({status:'prepared',pages:inputs.length,source:sourceCommit,dirty}));
