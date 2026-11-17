import type { Plugin } from 'vite'

// Imported by both the index builder and theme: no serialized client function.
export function tokenizeSearch(text: string): string[] {
  if (typeof Intl.Segmenter === 'function') {
    return Array.from(new Intl.Segmenter('zh', { granularity: 'word' }).segment(text))
      .filter(part => part.isWordLike)
      .map(part => part.segment)
  }
  return text.match(/[\p{L}\p{N}_-]+/gu) || []
}

type TokenizerOptions = { tokenize?: typeof tokenizeSearch }

export function localSearchBuildTokenizer(options: TokenizerOptions): Plugin {
  return {
    name: 'nb1:compiled-search-tokenizer',
    apply: 'build',
    // VitePress 1.6.4 awaits the client bundle, then the SSR bundle, then creates
    // public metadata. Restore for each index build; omit from the metadata.
    // The browser installs the same compiled function in theme.enhanceApp.
    buildStart() {
      options.tokenize = tokenizeSearch
    },
    closeBundle() {
      delete options.tokenize
    },
  }
}
