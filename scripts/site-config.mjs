export const siteBase = process.env.VITEPRESS_BASE || '/';
if (!/^\/(?:[A-Za-z0-9_-]+\/)*$/.test(siteBase)) {
  throw new Error('VITEPRESS_BASE must be a slash-delimited local path, such as /nb1-docs/.');
}
export const siteURL = 'https://b1ug.github.io/nb1-docs/';
