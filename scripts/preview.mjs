import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { preview } from 'vite';
import { siteBase } from './site-config.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
await fs.access(new URL('../dist/index.html',import.meta.url));
// VitePress 1.6's own preview does not honor --host. Use Vite's supported
// preview API so local review stays on loopback and cannot change ports.
const server=await preview({
 configFile:false,root,base:siteBase,appType:'mpa',build:{outDir:'dist'},
 preview:{host:'127.0.0.1',port:4175,strictPort:true,open:false,cors:false},
});
server.printUrls();
