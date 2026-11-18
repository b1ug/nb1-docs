export const coreSource = '88fc2be8326c076b6f09932054b0c8f11d89c0a0';
export const topics = [
  ['getting-started', 'Get started', '入门'],
  ['browser', 'Browser tools', '浏览器工具'],
  ['api-v1', 'API', 'API 参考'],
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
