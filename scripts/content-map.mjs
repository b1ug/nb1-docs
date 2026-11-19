export const coreSource = '48895be5babc11d6f3b2a7ab16e316bd564e726e';
export const topics = [
  ['getting-started', 'Get started', '入门'],
  ['browser', 'Browser tools', '浏览器工具'],
  ['api-v1', 'API', 'API 参考'],
  ['trigger-routing', 'Triggers and devices', 'Trigger 与设备'],
  ['remote-access', 'Remote access', '跨机接入'],
  ['agents', 'Agents', 'Agent 接入'],
  ['agent-notifications', 'Agents', 'Agent 通知'],
  ['install', 'Install', '安装'],
  ['support', 'Support', '支持'],
  ['changelog', 'Changelog', '变更记录'],
  ['api-v1-terminology', 'Terminology', '术语'],
  ['architecture', 'Architecture', '架构'],
];
export function pageRoute(topic, language = 'en') {
  return (language === 'zh-CN' ? '/zh/' : '/') + (topic === 'index' ? '' : topic);
}
export function sourceName(topic, language) {
  return topic === 'index' ? `pages/${language === 'zh-CN' ? 'zh/' : ''}index.md`
    : `docs/${topic}${language === 'zh-CN' ? '.zh-CN' : ''}.md`;
}
