import { defineConfig } from 'vitepress';
import path from 'node:path';
import { topics } from '../scripts/content-map.mjs';
import { siteBase } from '../scripts/site-config.mjs';
import { tokenizeSearch, localSearchBuildTokenizer } from './search';
const githubIcon = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><path fill=\"currentColor\" d=\"M12 .297c-6.63 0-12 5.373-12 12c0 5.303 3.438 9.8 8.205 11.385c.6.113.82-.258.82-.577c0-.285-.01-1.04-.015-2.04c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729c1.205.084 1.838 1.236 1.838 1.236c1.07 1.835 2.809 1.305 3.495.998c.108-.776.417-1.305.76-1.605c-2.665-.3-5.466-1.332-5.466-5.93c0-1.31.465-2.38 1.235-3.22c-.135-.303-.54-1.523.105-3.176c0 0 1.005-.322 3.3 1.23c.96-.267 1.98-.399 3-.405c1.02.006 2.04.138 3 .405c2.28-1.552 3.285-1.23 3.285-1.23c.645 1.653.24 2.873.12 3.176c.765.84 1.23 1.91 1.23 3.22c0 4.61-2.805 5.625-5.475 5.92c.42.36.81 1.096.81 2.22c0 1.606-.015 2.896-.015 3.286c0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12\"/></svg>";
const miniSearchOptions = { tokenize: tokenizeSearch };
const nav = (zh:boolean) => [
  { text:zh?'入门':'Get started', link:zh?'/zh/getting-started':'/getting-started' },
  { text:'API', link:zh?'/zh/api-v1':'/api-v1' },
  { text:zh?'Agent':'Agents', link:zh?'/zh/agents':'/agents' },
  { text:zh?'安装与支持':'Install & support', items:[
    {text:zh?'安装':'Install',link:zh?'/zh/install':'/install'},
    {text:zh?'浏览器工具':'Browser tools',link:zh?'/zh/browser':'/browser'},
    {text:zh?'支持':'Support',link:zh?'/zh/support':'/support'},
    {text:zh?'变更记录':'Changelog',link:zh?'/zh/changelog':'/changelog'}
  ] }
];
const sidebar=(zh:boolean)=>[{text:zh?'使用 nb1':'Use nb1',items:topics.map(([slug,en,cn])=>({text:zh?cn:en,link:(zh?'/zh/':'/')+slug}))}];
export default defineConfig({
  base:siteBase, srcDir:'site', outDir:'dist', cleanUrls:true, appearance:'force-dark',
  title:'nb1', description:'Local blink(1) control for people, applications and agents.',
  lang:'en', lastUpdated:false, metaChunk:true,
  head:[['link',{rel:'icon',type:'image/png',href:siteBase+'assets/nb1-icon.png'}],['meta',{name:'color-scheme',content:'dark'}]],
  locales:{
    root:{label:'English',lang:'en',themeConfig:{nav:nav(false),sidebar:sidebar(false)}},
    zh:{label:'中文',lang:'zh-CN',description:'blink(1) 的本地控制、清晰 API 与 Agent 协作。',themeConfig:{nav:nav(true),sidebar:sidebar(true),outline:{label:'本页内容'},docFooter:{prev:'上一篇',next:'下一篇'},returnToTopLabel:'回到顶部',sidebarMenuLabel:'目录',darkModeSwitchLabel:'外观',langMenuLabel:'语言',skipToContentLabel:'跳转到正文',footer:{message:'本地控制 · 使用文档',copyright:'MIT 许可证 · nb1'}}}
  },
  themeConfig:{
    logo:{src:'/assets/nb1-mascot.webp',alt:'nb1'},siteTitle:'nb1',
    outline:{level:[2,3],label:'On this page'},
    search:{provider:'local',options:{
      miniSearch:{options:miniSearchOptions},
      locales:{zh:{translations:{button:{buttonText:'搜索',buttonAriaLabel:'搜索文档'},modal:{displayDetails:'显示详细列表',noResultsText:'没有找到相关内容',resetButtonTitle:'清除搜索',backButtonTitle:'关闭搜索',footer:{selectText:'选择',selectKeyAriaLabel:'回车键',navigateText:'切换',navigateUpKeyAriaLabel:'向上箭头键',navigateDownKeyAriaLabel:'向下箭头键',closeText:'关闭',closeKeyAriaLabel:'Escape 键'}}}}}
    }},
    footer:{message:'Local control · Documentation',copyright:'MIT License · nb1'},
    socialLinks:[{icon:{svg:githubIcon},link:'https://github.com/b1ug/nb1'}]
  },
  markdown:{
    config(md){
      const originalLink=md.renderer.rules.link_open;
      md.renderer.rules.link_open=(tokens,index,options,env,self)=>{
        const token=tokens[index],href=token.attrGet('href')||'';
        if(/^https:\/\/github\.com\/b1ug\/nb1\/blob\/[^/]+\/docs\/api-v1\.openapi\.json$/.test(href)) token.attrSet('href','/api-v1.openapi.json');
        else if(href && !/^(?:[a-z]+:|\/|#)/i.test(href)) {
          const [name,fragment]=href.split('#',2);
          if(name.endsWith('.md')) {
            const baseName=path.basename(name), slug=baseName.replace(/(?:\.zh-CN)?\.md$/,'');
            const current=String(env.relativePath||'');
            const label=tokens[index+1]?.content||'';
            const chinese=baseName.endsWith('.zh-CN.md')||(current.startsWith('zh/')&&!/English|英文/.test(label));
            if(slug==='overview') token.attrSet('href',(chinese?'/zh/':'/')+(fragment?'#'+fragment:''));
            else if(topics.some(t=>t[0]===slug)) token.attrSet('href',(chinese?'/zh/':'/')+slug+(fragment?'#'+fragment:''));
          } else if(name.endsWith('LICENSE')) token.attrSet('href','/LICENSE.txt');
          else if(name.includes('assets/')) token.attrSet('href','/assets/'+path.basename(name));
        }
        return originalLink?originalLink(tokens,index,options,env,self):self.renderToken(tokens,index,options);
      };
      const originalTable=md.renderer.rules.table_open;
      md.renderer.rules.table_open=(tokens,index,options,env,self)=>{
        tokens[index].attrSet('tabindex','0');tokens[index].attrSet('aria-label',String(env.relativePath||'').startsWith('zh/')?'参考表格，可横向滚动':'Reference table, horizontally scrollable');
        return originalTable?originalTable(tokens,index,options,env,self):self.renderToken(tokens,index,options);
      };
    }
  },
  vite:{plugins:[localSearchBuildTokenizer(miniSearchOptions)],server:{host:'127.0.0.1'},preview:{host:'127.0.0.1'},build:{chunkSizeWarningLimit:700}}
});
